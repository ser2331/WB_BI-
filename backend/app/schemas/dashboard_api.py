from pydantic import BaseModel, Field

from app.schemas.dashboard_data import GlueBlock, Period


class DashboardKpis(BaseModel):
    period_label: str | None = None
    current_period_key: str | None = None
    glues: int = 0
    sku: int = 0
    stock: float | None = None
    orders: float = 0
    sales: float = 0


class DashboardMeta(BaseModel):
    has_data: bool
    org_name: str | None = None
    file_name: str | None = None
    source_format: str | None = None
    imported_at: str | None = None
    limits: str | None = None
    total_blocks: int = 0
    total_categories: int = 0


class FilterOptions(BaseModel):
    periods: list[Period] = Field(default_factory=list)
    subjects: list[str] = Field(default_factory=list)
    brands: list[str] = Field(default_factory=list)


class CategorySummary(BaseModel):
    subject: str
    glues: int
    sku: int
    orders: float
    sales: float
    stock: float | None = None


class PaginatedCategories(BaseModel):
    items: list[CategorySummary]
    page: int
    page_size: int
    total: int
    total_pages: int
    from_index: int = 0
    to_index: int = 0
    kpis: DashboardKpis


class PaginatedBlocks(BaseModel):
    subject: str
    items: list[GlueBlock]
    page: int
    page_size: int
    total: int
    total_pages: int
    from_index: int = 0
    to_index: int = 0
    kpis: DashboardKpis


class PhotoResolveResponse(BaseModel):
    nm: str
    url: str | None = None


class ChartPoint(BaseModel):
    label: str
    value: float


class OrdersSalesPoint(BaseModel):
    label: str
    orders: float
    sales: float


class DashboardCharts(BaseModel):
    kpis: DashboardKpis
    orders_by_subject: list[ChartPoint] = Field(default_factory=list)
    sales_by_subject: list[ChartPoint] = Field(default_factory=list)
    orders_by_period: list[ChartPoint] = Field(default_factory=list)
    top_brands: list[ChartPoint] = Field(default_factory=list)
    orders_vs_sales: list[OrdersSalesPoint] = Field(default_factory=list)


class ProductTableRow(BaseModel):
    nm: str
    vendor_code: str | None = None
    brand: str | None = None
    subject: str | None = None
    period_key: str | None = None
    period_label: str | None = None
    glue_title: str | None = None
    orders: float | None = None
    sales: float | None = None
    stock: float | None = None
    spp: float | None = None
    ad_ctr: float | None = None


class PaginatedProducts(BaseModel):
    items: list[ProductTableRow]
    page: int
    page_size: int
    total: int
    total_pages: int
    from_index: int = 0
    to_index: int = 0
    kpis: DashboardKpis
