from datetime import date, datetime
from enum import Enum

from pydantic import BaseModel, Field


class DataSourceKey(str, Enum):
    SALES = "sales"
    ORDERS = "orders"
    STOCKS = "stocks"
    SALES_FUNNEL = "sales_funnel"
    REGION_SALES = "region_sales"


DATA_SOURCE_META: dict[str, dict] = {
    DataSourceKey.SALES: {
        "title": "Продажи",
        "description": "Продажи и возвраты за период",
        "category": "statistics",
        "default_interval": 60,
    },
    DataSourceKey.ORDERS: {
        "title": "Заказы",
        "description": "Все заказы продавца",
        "category": "statistics",
        "default_interval": 30,
    },
    DataSourceKey.STOCKS: {
        "title": "Остатки",
        "description": "Остатки на складах WB",
        "category": "statistics",
        "default_interval": 120,
    },
    DataSourceKey.SALES_FUNNEL: {
        "title": "Воронка продаж",
        "description": "Аналитика карточек товаров (Sales Funnel v3)",
        "category": "analytics",
        "default_interval": 360,
    },
    DataSourceKey.REGION_SALES: {
        "title": "Региональные продажи",
        "description": "Продажи по регионам",
        "category": "analytics",
        "default_interval": 360,
    },
}


class WBTokenRequest(BaseModel):
    api_token: str = Field(..., min_length=10)


class WBConnectionStatus(BaseModel):
    connected: bool
    message: str
    seller_name: str | None = None
    is_mock: bool = False


class DataSourceConfigUpdate(BaseModel):
    enabled: bool
    sync_interval_minutes: int = Field(ge=5, le=1440)


class DataSourceConfigResponse(BaseModel):
    source_key: str
    title: str
    description: str
    category: str
    enabled: bool
    sync_interval_minutes: int
    last_synced_at: datetime | None = None


class SyncRequest(BaseModel):
    source_keys: list[str] | None = None


class SyncResult(BaseModel):
    source_key: str
    success: bool
    message: str
    records_count: int = 0


class KpiMetric(BaseModel):
    label: str
    value: float | int | str
    change: float | None = None
    unit: str | None = None


class ChartPoint(BaseModel):
    date: str
    value: float
    label: str | None = None


class TopProduct(BaseModel):
    nm_id: int
    name: str
    sales: float
    orders: int
    revenue: float


class DashboardData(BaseModel):
    kpis: list[KpiMetric]
    sales_chart: list[ChartPoint]
    orders_chart: list[ChartPoint]
    top_products: list[TopProduct]
    funnel_metrics: list[KpiMetric]
    stocks_summary: list[dict]
    last_updated: datetime | None = None


class SalesFunnelRequest(BaseModel):
    date_from: date
    date_to: date
