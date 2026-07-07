from datetime import datetime
from typing import Annotated, Any

from pydantic import BaseModel, BeforeValidator, Field


def _coerce_optional_float(value: Any) -> float | None:
    if value is None or value == "":
        return None
    if isinstance(value, list):
        nums = [_coerce_optional_float(v) for v in value]
        nums = [n for n in nums if n is not None]
        if not nums:
            return None
        return nums[0] if len(nums) == 1 else sum(nums) / len(nums)
    if isinstance(value, bool):
        return float(value)
    if isinstance(value, (int, float)):
        return float(value)
    try:
        return float(str(value).replace(",", ".").replace(" ", ""))
    except (TypeError, ValueError):
        return None


def _coerce_float(value: Any) -> float:
    parsed = _coerce_optional_float(value)
    return parsed if parsed is not None else 0.0


FlexFloat = Annotated[float | None, BeforeValidator(_coerce_optional_float)]
StrictFloat = Annotated[float, BeforeValidator(_coerce_float)]


class Period(BaseModel):
    key: str
    start: str | None = None
    end: str | None = None
    label: str
    capturedAt: str | None = None
    runId: str | None = None


class ProductCard(BaseModel):
    model_config = {"extra": "ignore"}

    nm: str
    vendorCode: str | None = None
    brand: str | None = None
    subject: str | None = None
    orders: FlexFloat = None
    sales: FlexFloat = None
    stock: FlexFloat = None
    spp: FlexFloat = None
    kvv: FlexFloat = None
    ad_ctr: FlexFloat = None
    photo: str | None = None
    wbUrl: str | None = None
    imt: str | None = None


class GlueBlock(BaseModel):
    periodKey: str
    periodLabel: str | None = None
    subject: str
    groupKey: str | None = None
    blockId: str | None = None
    title: str
    brands: list[str] = Field(default_factory=list)
    skuCount: int = 0
    orders: StrictFloat = 0
    sales: StrictFloat = 0
    stock: FlexFloat = None
    kvv: FlexFloat = None
    spp: FlexFloat = None
    ad_ctr: FlexFloat = None
    products: list[ProductCard] = Field(default_factory=list)


class SummaryRow(BaseModel):
    periodKey: str
    periodLabel: str | None = None
    subject: str
    glues: int = 0
    sku: int = 0
    orders: StrictFloat = 0
    sales: StrictFloat = 0
    stock: FlexFloat = None
    commission: FlexFloat = None
    kvv: FlexFloat = None
    spp: FlexFloat = None


class DashboardDataset(BaseModel):
    orgName: str | None = None
    currentPeriodKey: str | None = None
    currentPeriodLabel: str | None = None
    periods: list[Period] = Field(default_factory=list)
    subjects: list[str] = Field(default_factory=list)
    brands: list[str] = Field(default_factory=list)
    summaryRows: list[SummaryRow] = Field(default_factory=list)
    blocks: list[GlueBlock] = Field(default_factory=list)
    limits: str | None = None
    importedAt: datetime | None = None
    sourceFormat: str | None = None
    fileName: str | None = None


class ImportResponse(BaseModel):
    success: bool
    message: str
    file_name: str
    format: str
    blocks_count: int = 0
    products_count: int = 0
