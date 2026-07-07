from dataclasses import dataclass
from math import ceil
from typing import TypeVar

from app.schemas.dashboard_api import CategorySummary, DashboardKpis
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
