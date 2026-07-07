from dataclasses import dataclass
from math import ceil
from typing import TypeVar

from app.schemas.dashboard_api import (
    CategorySummary,
    ChartPoint,
    DashboardKpis,
    OrdersSalesPoint,
    ProductTableRow,
)
from app.schemas.dashboard_data import DashboardDataset, GlueBlock

T = TypeVar("T")


@dataclass
class QueryFilters:
    period_key: str | None = None
    subject: str | None = None
    brand: str | None = None
    search: str | None = None


def filter_blocks(blocks: list[GlueBlock], filters: QueryFilters) -> list[GlueBlock]:
    q = (filters.search or "").strip().lower()
    result: list[GlueBlock] = []

    for block in blocks:
        if filters.period_key and block.periodKey != filters.period_key:
            continue
        if filters.subject and block.subject != filters.subject:
            continue
        if filters.brand:
            brand_match = filters.brand in block.brands
            if not brand_match:
                brand_match = any(p.brand == filters.brand for p in block.products)
            if not brand_match:
                continue
        if q:
            haystack = " ".join(
                str(v)
                for v in [
                    block.title,
                    block.subject,
                    *block.brands,
                    *[p.nm for p in block.products],
                    *[p.vendorCode for p in block.products if p.vendorCode],
                    *[p.brand for p in block.products if p.brand],
                ]
                if v
            ).lower()
            if q not in haystack:
                continue
        result.append(block)

    return result


def aggregate_categories(blocks: list[GlueBlock]) -> list[CategorySummary]:
    agg: dict[str, dict] = {}
    for block in blocks:
        row = agg.get(block.subject)
        if not row:
            row = {
                "subject": block.subject,
                "glues": 0,
                "sku": 0,
                "orders": 0.0,
                "sales": 0.0,
                "stock": 0.0,
                "has_stock": False,
            }
            agg[block.subject] = row
        row["glues"] += 1
        row["sku"] += block.skuCount
        row["orders"] += block.orders
        row["sales"] += block.sales
        if block.stock is not None:
            row["stock"] += block.stock
            row["has_stock"] = True

    items = [
        CategorySummary(
            subject=row["subject"],
            glues=row["glues"],
            sku=row["sku"],
            orders=row["orders"],
            sales=row["sales"],
            stock=row["stock"] if row["has_stock"] else None,
        )
        for row in agg.values()
    ]
    return sorted(items, key=lambda c: c.orders, reverse=True)


def compute_kpis(blocks: list[GlueBlock], dataset: DashboardDataset) -> DashboardKpis:
    stocks = [b.stock for b in blocks if b.stock is not None]
    period_label = dataset.currentPeriodLabel
    if dataset.currentPeriodKey:
        for period in dataset.periods:
            if period.key == dataset.currentPeriodKey:
                period_label = period.label
                break

    return DashboardKpis(
        period_label=period_label,
        current_period_key=dataset.currentPeriodKey,
        glues=len(blocks),
        sku=sum(b.skuCount for b in blocks),
        stock=sum(stocks) if stocks else None,
        orders=sum(b.orders for b in blocks),
        sales=sum(b.sales for b in blocks),
    )


def paginate_list(items: list[T], page: int, page_size: int) -> tuple[list[T], int, int, int, int]:
    total = len(items)
    if total == 0:
        return [], 1, 0, 0, 0
    total_pages = max(1, ceil(total / page_size))
    page = min(max(1, page), total_pages)
    start = (page - 1) * page_size
    end = min(start + page_size, total)
    return items[start:end], total_pages, total, start + 1, end


TOP_CHART_ITEMS = 12


def _top_chart_points(
    items: list[CategorySummary],
    field: str,
    limit: int = TOP_CHART_ITEMS,
) -> list[ChartPoint]:
    sorted_items = sorted(items, key=lambda row: getattr(row, field), reverse=True)[:limit]
    return [ChartPoint(label=row.subject, value=float(getattr(row, field))) for row in sorted_items]


def aggregate_orders_by_period(blocks: list[GlueBlock]) -> list[ChartPoint]:
    agg: dict[str, float] = {}
    for block in blocks:
        label = block.periodLabel or block.periodKey or "—"
        agg[label] = agg.get(label, 0.0) + block.orders
    points = [ChartPoint(label=label, value=value) for label, value in agg.items()]
    return sorted(points, key=lambda point: point.value, reverse=True)


def aggregate_top_brands(blocks: list[GlueBlock], limit: int = TOP_CHART_ITEMS) -> list[ChartPoint]:
    agg: dict[str, float] = {}
    for block in blocks:
        for product in block.products:
            brand = (product.brand or "").strip() or "Без бренда"
            agg[brand] = agg.get(brand, 0.0) + float(product.orders or 0)
    points = [ChartPoint(label=label, value=value) for label, value in agg.items()]
    return sorted(points, key=lambda point: point.value, reverse=True)[:limit]


def build_orders_vs_sales(
    categories: list[CategorySummary],
    limit: int = TOP_CHART_ITEMS,
) -> list[OrdersSalesPoint]:
    top = sorted(categories, key=lambda row: row.orders, reverse=True)[:limit]
    return [OrdersSalesPoint(label=row.subject, orders=row.orders, sales=row.sales) for row in top]


def build_dashboard_charts(blocks: list[GlueBlock], dataset: DashboardDataset) -> dict:
    categories = aggregate_categories(blocks)
    return {
        "kpis": compute_kpis(blocks, dataset),
        "orders_by_subject": _top_chart_points(categories, "orders"),
        "sales_by_subject": _top_chart_points(categories, "sales"),
        "orders_by_period": aggregate_orders_by_period(blocks),
        "top_brands": aggregate_top_brands(blocks),
        "orders_vs_sales": build_orders_vs_sales(categories),
    }


def flatten_product_rows(blocks: list[GlueBlock]) -> list[ProductTableRow]:
    rows: list[ProductTableRow] = []
    for block in blocks:
        for product in block.products:
            rows.append(
                ProductTableRow(
                    nm=product.nm,
                    vendor_code=product.vendorCode,
                    brand=product.brand or (block.brands[0] if block.brands else None),
                    subject=product.subject or block.subject,
                    period_key=block.periodKey,
                    period_label=block.periodLabel,
                    glue_title=block.title,
                    orders=product.orders,
                    sales=product.sales,
                    stock=product.stock,
                    spp=product.spp,
                    ad_ctr=product.ad_ctr,
                )
            )
    return rows


def sort_product_rows(
    rows: list[ProductTableRow],
    sort_by: str = "orders",
    sort_dir: str = "desc",
) -> list[ProductTableRow]:
    allowed = {"orders", "sales", "stock", "nm", "subject", "brand"}
    field = sort_by if sort_by in allowed else "orders"
    reverse = sort_dir.lower() != "asc"

    def sort_key(row: ProductTableRow) -> tuple:
        value = getattr(row, field, None)
        if isinstance(value, (int, float)):
            return (0, value)
        if value is None:
            return (1, "")
        return (0, str(value).lower())

    return sorted(rows, key=sort_key, reverse=reverse)
