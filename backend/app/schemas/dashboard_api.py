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
