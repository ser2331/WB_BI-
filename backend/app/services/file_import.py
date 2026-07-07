import csv
import io
import json
import re
from collections import defaultdict
from datetime import UTC, datetime
from typing import Any

from app.schemas.dashboard_data import (
    DashboardDataset,
    GlueBlock,
    Period,
    ProductCard,
    SummaryRow,
    _coerce_optional_float,
)

HEADER_ALIASES: dict[str, list[str]] = {
    "nm": ["nm", "nm_id", "nmid", "sku", "sku_wb", "артикул_wb"],
    "vendorCode": ["vendorcode", "vendor_code", "article", "артикул", "sa"],
    "brand": ["brand", "brandname", "brand_name", "бренд"],
    "subject": ["subject", "subjectname", "subject_name", "предмет", "category"],
    "orders": ["orders", "order", "order_count", "заказы"],
    "sales": ["sales", "sale", "sale_count", "продажи"],
    "stock": ["stock", "quantity", "остаток", "остатки"],
    "spp": ["spp", "спп"],
    "kvv": ["kvv", "квв"],
    "ad_ctr": ["ad_ctr", "ctr", "adctr", "ctr_рекл"],
    "photo": ["photo", "image", "img", "фото"],
    "wbUrl": ["wburl", "wb_url", "url", "ссылка"],
    "imt": ["imt", "imt_id", "group_id"],
    "title": ["title", "glue_title", "block_title", "склейка", "название"],
    "groupKey": ["groupkey", "group_key", "block_id"],
    "periodKey": ["periodkey", "period_key", "период_key"],
    "periodLabel": ["periodlabel", "period_label", "период", "period"],
    "periodStart": ["periodstart", "period_start", "date_from", "start"],
    "periodEnd": ["periodend", "period_end", "date_to", "end"],
    "orgName": ["orgname", "org_name", "organization", "организация"],
    "commission": ["commission", "комиссия"],
}


def _normalize_header(name: str) -> str:
    return re.sub(r"[\s\-]+", "_", name.strip().lower())


def _map_row(raw: dict[str, Any]) -> dict[str, Any]:
    normalized: dict[str, str] = {}
    for key, value in raw.items():
        if key is None:
            continue
        normalized[_normalize_header(str(key))] = value

    mapped: dict[str, Any] = {}
    for field, aliases in HEADER_ALIASES.items():
        for alias in aliases:
            if alias in normalized and normalized[alias] not in (None, ""):
                mapped[field] = normalized[alias]
                break
    return mapped


def _to_float(value: Any) -> float | None:
    return _coerce_optional_float(value)


def _product_from_mapped(m: dict[str, Any]) -> ProductCard | None:
    nm = m.get("nm")
    if not nm:
        return None
    nm_str = str(nm).strip()
    if not nm_str:
        return None
    wb_url = m.get("wbUrl")
    if not wb_url:
        wb_url = f"https://www.wildberries.ru/catalog/{nm_str}/detail.aspx"
    return ProductCard(
        nm=nm_str,
        vendorCode=str(m["vendorCode"]).strip() if m.get("vendorCode") else None,
        brand=str(m["brand"]).strip() if m.get("brand") else None,
        subject=str(m["subject"]).strip() if m.get("subject") else None,
        orders=_to_float(m.get("orders")),
        sales=_to_float(m.get("sales")),
        stock=_to_float(m.get("stock")),
        spp=_to_float(m.get("spp")),
        kvv=_to_float(m.get("kvv")),
        ad_ctr=_to_float(m.get("ad_ctr")),
        photo=str(m["photo"]).strip() if m.get("photo") else None,
        wbUrl=str(wb_url).strip(),
        imt=str(m["imt"]).strip() if m.get("imt") else None,
    )


def _period_key_from_parts(
    period_key: str | None, period_label: str | None, start: str | None, end: str | None
) -> tuple[str, str]:
    if period_key:
        label = period_label or period_key
        return period_key, label
    if start and end:
        key = f"{start}_{end}"
        label = period_label or f"{start}–{end}"
        return key, label
    if period_label:
        safe = re.sub(r"[^\w\-]+", "_", period_label)
        return safe, period_label
    return "default", "Текущий период"


def _build_blocks_from_products(
    products: list[ProductCard],
    meta: dict[str, Any],
) -> list[GlueBlock]:
    groups: dict[tuple[str, str, str], list[ProductCard]] = defaultdict(list)

    for p in products:
        subject = p.subject or "Без предмета"
        group_key = meta.get("groupKey") or p.imt or f"{subject}|{p.nm}"
        period_key, _ = _period_key_from_parts(
            meta.get("periodKey"),
            meta.get("periodLabel"),
            meta.get("periodStart"),
            meta.get("periodEnd"),
        )
        groups[(period_key, subject, str(group_key))].append(p)

    blocks: list[GlueBlock] = []
    for (period_key, subject, group_key), items in groups.items():
        brands = sorted({p.brand for p in items if p.brand})
        orders = sum(p.orders or 0 for p in items)
        sales = sum(p.sales or 0 for p in items)
        stocks = [p.stock for p in items if p.stock is not None]
        stock = sum(stocks) if stocks else None
        spps = [p.spp for p in items if p.spp is not None]
        kvv_vals = [p.kvv for p in items if p.kvv is not None]
        ctrs = [p.ad_ctr for p in items if p.ad_ctr is not None]

        title = meta.get("title") or f"{subject} · {group_key.split('|')[-1]}"

        period_label = meta.get("periodLabel")
        if not period_label:
            _, period_label = _period_key_from_parts(
                period_key, None, meta.get("periodStart"), meta.get("periodEnd")
            )

        blocks.append(
            GlueBlock(
                periodKey=period_key,
                periodLabel=period_label,
                subject=subject,
                groupKey=group_key,
                blockId=f"{period_key}|{group_key}",
                title=str(title),
                brands=brands,
                skuCount=len(items),
                orders=orders,
                sales=sales,
                stock=stock,
                spp=sum(spps) / len(spps) if spps else None,
                kvv=sum(kvv_vals) / len(kvv_vals) if kvv_vals else None,
                ad_ctr=sum(ctrs) / len(ctrs) if ctrs else None,
                products=items,
            )
        )
    return blocks


def _build_summary(blocks: list[GlueBlock]) -> list[SummaryRow]:
    agg: dict[tuple[str, str], dict[str, Any]] = defaultdict(
        lambda: {
            "glues": 0,
            "sku": 0,
            "orders": 0.0,
            "sales": 0.0,
            "stock": 0.0,
            "has_stock": False,
            "kvv": [],
            "spp": [],
        }
    )
    for b in blocks:
        key = (b.periodKey, b.subject)
        row = agg[key]
        row["glues"] += 1
        row["sku"] += b.skuCount
        row["orders"] += b.orders
        row["sales"] += b.sales
        if b.stock is not None:
            row["stock"] += b.stock
            row["has_stock"] = True
        if b.kvv is not None:
            row["kvv"].append(b.kvv)
        if b.spp is not None:
            row["spp"].append(b.spp)
        row["periodLabel"] = b.periodLabel

    summary: list[SummaryRow] = []
    for (period_key, subject), row in sorted(agg.items()):
        summary.append(
            SummaryRow(
                periodKey=period_key,
                periodLabel=row.get("periodLabel"),
                subject=subject,
                glues=row["glues"],
                sku=row["sku"],
                orders=row["orders"],
                sales=row["sales"],
                stock=row["stock"] if row["has_stock"] else None,
                kvv=sum(row["kvv"]) / len(row["kvv"]) if row["kvv"] else None,
                spp=sum(row["spp"]) / len(row["spp"]) if row["spp"] else None,
            )
        )
    return summary


def _enrich_dataset(dataset: DashboardDataset) -> DashboardDataset:
    if not dataset.periods and dataset.blocks:
        period_map: dict[str, Period] = {}
        for b in dataset.blocks:
            if b.periodKey not in period_map:
                period_map[b.periodKey] = Period(
                    key=b.periodKey,
                    label=b.periodLabel or b.periodKey,
                )
        dataset.periods = list(period_map.values())

    if not dataset.currentPeriodKey and dataset.periods:
        dataset.currentPeriodKey = dataset.periods[0].key
        dataset.currentPeriodLabel = dataset.periods[0].label

    if not dataset.subjects:
        dataset.subjects = sorted({b.subject for b in dataset.blocks if b.subject})

    if not dataset.brands:
        brands: set[str] = set()
        for b in dataset.blocks:
            brands.update(b.brands)
            for p in b.products:
                if p.brand:
                    brands.add(p.brand)
        dataset.brands = sorted(brands)

    if not dataset.summaryRows and dataset.blocks:
        dataset.summaryRows = _build_summary(dataset.blocks)

    return dataset


def parse_json_content(content: bytes) -> DashboardDataset:
    data = json.loads(content.decode("utf-8-sig"))

    if isinstance(data, list):
        products: list[ProductCard] = []
        for item in data:
            if isinstance(item, dict):
                m = _map_row(item)
                p = _product_from_mapped(m)
                if p:
                    products.append(p)
        blocks = _build_blocks_from_products(products, {})
        dataset = DashboardDataset(blocks=blocks, sourceFormat="json")
        return _enrich_dataset(dataset)

    if not isinstance(data, dict):
        raise ValueError("JSON должен быть объектом или массивом строк")

    if "blocks" in data:
        dataset = DashboardDataset.model_validate(data)
        dataset.sourceFormat = "json"
        return _enrich_dataset(dataset)

    if "products" in data and isinstance(data["products"], list):
        products = [
            ProductCard.model_validate(p) if isinstance(p, dict) else p for p in data["products"]
        ]
        blocks = _build_blocks_from_products(products, data)
        dataset = DashboardDataset(
            orgName=data.get("orgName"),
            limits=data.get("limits"),
            blocks=blocks,
            sourceFormat="json",
        )
        return _enrich_dataset(dataset)

    if "summaryRows" in data and not data.get("blocks"):
        raise ValueError("JSON со summaryRows требует также blocks или products")

    raise ValueError(
        "Неподдерживаемая структура JSON. Ожидается формат dash_2 (blocks) или массив товаров."
    )


def parse_csv_content(content: bytes) -> DashboardDataset:
    text = content.decode("utf-8-sig")
    reader = csv.DictReader(io.StringIO(text))
    if not reader.fieldnames:
        raise ValueError("CSV пустой или без заголовка")

    meta: dict[str, Any] = {}
    rows_by_block: dict[tuple[str, str, str], list[ProductCard]] = defaultdict(list)
    block_meta: dict[tuple[str, str, str], dict[str, Any]] = {}

    for raw in reader:
        m = _map_row(raw)
        if m.get("orgName") and not meta.get("orgName"):
            meta["orgName"] = m["orgName"]
        for k in ("periodKey", "periodLabel", "periodStart", "periodEnd", "title", "groupKey"):
            if m.get(k) and k not in meta:
                meta[k] = m[k]

        product = _product_from_mapped(m)
        if not product:
            continue

        subject = product.subject or "Без предмета"
        period_key, period_label = _period_key_from_parts(
            str(m["periodKey"]) if m.get("periodKey") else meta.get("periodKey"),
            str(m["periodLabel"]) if m.get("periodLabel") else meta.get("periodLabel"),
            str(m["periodStart"]) if m.get("periodStart") else meta.get("periodStart"),
            str(m["periodEnd"]) if m.get("periodEnd") else meta.get("periodEnd"),
        )
        group_key = (
            str(m["groupKey"])
            if m.get("groupKey")
            else product.imt or str(m["title"])
            if m.get("title")
            else f"{subject}|{product.nm}"
        )
        title = str(m["title"]) if m.get("title") else f"{subject} · {group_key.split('|')[-1]}"

        gkey = (period_key, subject, group_key)
        rows_by_block[gkey].append(product)
        block_meta[gkey] = {
            "periodKey": period_key,
            "periodLabel": period_label,
            "title": title,
            "groupKey": group_key,
        }

    if not rows_by_block:
        raise ValueError("В CSV не найдено строк с артикулом WB (колонка nm/sku)")

    blocks: list[GlueBlock] = []
    for gkey, items in rows_by_block.items():
        bm = block_meta[gkey]
        brands = sorted({p.brand for p in items if p.brand})
        orders = sum(p.orders or 0 for p in items)
        sales = sum(p.sales or 0 for p in items)
        stocks = [p.stock for p in items if p.stock is not None]
        spps = [p.spp for p in items if p.spp is not None]
        kvv_vals = [p.kvv for p in items if p.kvv is not None]
        ctrs = [p.ad_ctr for p in items if p.ad_ctr is not None]
        period_key, subject, group_key = gkey

        blocks.append(
            GlueBlock(
                periodKey=period_key,
                periodLabel=bm["periodLabel"],
                subject=subject,
                groupKey=group_key,
                blockId=f"{period_key}|{group_key}",
                title=bm["title"],
                brands=brands,
                skuCount=len(items),
                orders=orders,
                sales=sales,
                stock=sum(stocks) if stocks else None,
                spp=sum(spps) / len(spps) if spps else None,
                kvv=sum(kvv_vals) / len(kvv_vals) if kvv_vals else None,
                ad_ctr=sum(ctrs) / len(ctrs) if ctrs else None,
                products=items,
            )
        )

    dataset = DashboardDataset(
        orgName=meta.get("orgName"),
        blocks=blocks,
        sourceFormat="csv",
    )
    return _enrich_dataset(dataset)


def parse_upload(file_name: str, content: bytes) -> DashboardDataset:
    lower = file_name.lower()
    if lower.endswith(".json"):
        dataset = parse_json_content(content)
    elif lower.endswith(".csv"):
        dataset = parse_csv_content(content)
    else:
        raise ValueError("Поддерживаются только файлы .csv и .json")

    dataset.importedAt = datetime.now(UTC)
    dataset.fileName = file_name
    return dataset
