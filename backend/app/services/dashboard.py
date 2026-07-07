from collections import defaultdict
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.database import CachedData
from app.schemas.api import ChartPoint, DashboardData, KpiMetric, TopProduct


def _parse_date(value: str) -> str:
    if not value:
        return ""
    return value[:10]


def _safe_float(value) -> float:
    try:
        return float(value or 0)
    except (TypeError, ValueError):
        return 0.0


async def get_cached_by_key(session: AsyncSession, source_key: str) -> dict | None:
    result = await session.execute(
        select(CachedData)
        .where(CachedData.source_key == source_key)
        .order_by(CachedData.fetched_at.desc())
        .limit(1)
    )
    cached = result.scalar_one_or_none()
    return cached.data if cached else None


async def get_last_updated(session: AsyncSession) -> datetime | None:
    result = await session.execute(
        select(CachedData.fetched_at).order_by(CachedData.fetched_at.desc()).limit(1)
    )
    return result.scalar_one_or_none()


def build_dashboard(
    sales_data: dict | None,
    orders_data: dict | None,
    stocks_data: dict | None,
    funnel_data: dict | None,
    last_updated: datetime | None,
) -> DashboardData:
    sales_records = (sales_data or {}).get("records", [])
    orders_records = (orders_data or {}).get("records", [])
    stocks_records = (stocks_data or {}).get("records", [])
    funnel_records = (funnel_data or {}).get("records", [])

    sales_by_day: dict[str, float] = defaultdict(float)
    orders_by_day: dict[str, int] = defaultdict(int)
    product_stats: dict[int, dict] = defaultdict(
        lambda: {"name": "", "sales": 0, "orders": 0, "revenue": 0.0}
    )

    total_revenue = 0.0
    total_sales_count = 0
    total_orders = len(orders_records)

    for sale in sales_records:
        day = _parse_date(sale.get("date", sale.get("lastChangeDate", "")))
        price = _safe_float(sale.get("finishedPrice", sale.get("priceWithDisc")))
        sales_by_day[day] += price
        total_revenue += price
        total_sales_count += 1

        nm_id = sale.get("nmId", 0)
        if nm_id:
            product_stats[nm_id]["name"] = sale.get(
                "supplierArticle", sale.get("brand", f"Товар {nm_id}")
            )
            product_stats[nm_id]["sales"] += 1
            product_stats[nm_id]["revenue"] += price

    for order in orders_records:
        day = _parse_date(order.get("date", order.get("lastChangeDate", "")))
        orders_by_day[day] += 1
        nm_id = order.get("nmId", 0)
        if nm_id:
            product_stats[nm_id]["name"] = order.get(
                "supplierArticle", order.get("brand", f"Товар {nm_id}")
            )
            product_stats[nm_id]["orders"] += 1

    total_stock = sum(_safe_float(s.get("quantity", s.get("quantityFull"))) for s in stocks_records)
    len({s.get("nmId") for s in stocks_records if s.get("nmId")})

    funnel_opens = 0
    funnel_cart = 0
    funnel_orders = 0
    funnel_buyouts = 0

    for item in funnel_records:
        if isinstance(item, dict):
            stat = item.get("statistic", item.get("statistics", item))
            if isinstance(stat, dict):
                selected = stat.get("selected", stat)
                funnel_opens += int(selected.get("openCount", selected.get("openCardCount", 0)))
                funnel_cart += int(selected.get("cartCount", selected.get("addToCartCount", 0)))
                funnel_orders += int(selected.get("orderCount", selected.get("ordersCount", 0)))
                funnel_buyouts += int(selected.get("buyoutCount", selected.get("buyoutsCount", 0)))

    kpis = [
        KpiMetric(label="Выручка", value=round(total_revenue, 2), unit="₽"),
        KpiMetric(label="Продажи", value=total_sales_count, unit="шт"),
        KpiMetric(label="Заказы", value=total_orders, unit="шт"),
        KpiMetric(label="Остатки", value=int(total_stock), unit="шт"),
    ]

    funnel_metrics = [
        KpiMetric(label="Переходы", value=funnel_opens),
        KpiMetric(label="В корзину", value=funnel_cart),
        KpiMetric(label="Заказы", value=funnel_orders),
        KpiMetric(label="Выкупы", value=funnel_buyouts),
    ]

    sales_chart = [
        ChartPoint(date=day, value=round(val, 2))
        for day, val in sorted(sales_by_day.items())
        if day
    ]

    orders_chart = [
        ChartPoint(date=day, value=float(val)) for day, val in sorted(orders_by_day.items()) if day
    ]

    top_products = sorted(
        [
            TopProduct(
                nm_id=nm_id,
                name=stats["name"] or f"Товар {nm_id}",
                sales=stats["sales"],
                orders=stats["orders"],
                revenue=round(stats["revenue"], 2),
            )
            for nm_id, stats in product_stats.items()
            if stats["sales"] > 0 or stats["orders"] > 0
        ],
        key=lambda p: p.revenue,
        reverse=True,
    )[:10]

    stocks_summary = [
        {
            "nm_id": s.get("nmId"),
            "article": s.get("supplierArticle", ""),
            "warehouse": s.get("warehouseName", ""),
            "quantity": int(_safe_float(s.get("quantity"))),
        }
        for s in sorted(
            stocks_records,
            key=lambda x: _safe_float(x.get("quantity")),
            reverse=True,
        )[:10]
    ]

    return DashboardData(
        kpis=kpis,
        sales_chart=sales_chart,
        orders_chart=orders_chart,
        top_products=top_products,
        funnel_metrics=funnel_metrics,
        stocks_summary=stocks_summary,
        last_updated=last_updated,
    )


async def build_dashboard_from_cache(session: AsyncSession) -> DashboardData:
    sales = await get_cached_by_key(session, "sales")
    orders = await get_cached_by_key(session, "orders")
    stocks = await get_cached_by_key(session, "stocks")
    funnel = await get_cached_by_key(session, "sales_funnel")
    last_updated = await get_last_updated(session)

    return build_dashboard(sales, orders, stocks, funnel, last_updated)
