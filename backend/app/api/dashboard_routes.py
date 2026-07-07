from fastapi import APIRouter, Depends, HTTPException, Query

from app.api.deps import get_current_user
from app.schemas.dashboard_api import (
    DashboardCharts,
    DashboardMeta,
    FilterOptions,
    PaginatedBlocks,
    PaginatedCategories,
    PaginatedProducts,
    PhotoResolveResponse,
)
from app.services.dataset_memory import get_dataset
from app.services.dataset_query import (
    QueryFilters,
    aggregate_categories,
    build_dashboard_charts,
    compute_kpis,
    filter_blocks,
    flatten_product_rows,
    paginate_list,
    sort_product_rows,
)
from app.services.photo_resolver import resolve_product_photo

router = APIRouter(
    prefix="/api/dashboard",
    tags=["dashboard"],
    dependencies=[Depends(get_current_user)],
)


def _require_dataset():
    dataset = get_dataset()
    if not dataset:
        raise HTTPException(
            status_code=404,
            detail="Данные не загружены. Импортируйте CSV или JSON файл.",
        )
    return dataset


def _parse_filters(
    period_key: str | None = Query(None, alias="periodKey"),
    subject: str | None = None,
    brand: str | None = None,
    search: str | None = None,
) -> QueryFilters:
    return QueryFilters(
        period_key=period_key or None,
        subject=subject or None,
        brand=brand or None,
        search=search or None,
    )


@router.get("/meta", response_model=DashboardMeta)
async def dashboard_meta():
    dataset = get_dataset()
    if not dataset:
        return DashboardMeta(has_data=False)

    categories = {b.subject for b in dataset.blocks}
    return DashboardMeta(
        has_data=True,
        org_name=dataset.orgName,
        file_name=dataset.fileName,
        source_format=dataset.sourceFormat,
        imported_at=dataset.importedAt.isoformat() if dataset.importedAt else None,
        limits=dataset.limits,
        total_blocks=len(dataset.blocks),
        total_categories=len(categories),
    )


@router.get("/filters", response_model=FilterOptions)
async def dashboard_filters():
    dataset = _require_dataset()
    return FilterOptions(
        periods=dataset.periods,
        subjects=dataset.subjects,
        brands=dataset.brands,
    )


@router.get("/charts", response_model=DashboardCharts)
async def dashboard_charts(filters: QueryFilters = Depends(_parse_filters)):
    dataset = _require_dataset()
    blocks = filter_blocks(dataset.blocks, filters)
    return DashboardCharts(**build_dashboard_charts(blocks, dataset))


@router.get("/products", response_model=PaginatedProducts)
async def list_products(
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=200),
    sort_by: str = Query("orders", alias="sortBy"),
    sort_dir: str = Query("desc", alias="sortDir"),
    filters: QueryFilters = Depends(_parse_filters),
):
    dataset = _require_dataset()
    blocks = filter_blocks(dataset.blocks, filters)
    rows = sort_product_rows(flatten_product_rows(blocks), sort_by=sort_by, sort_dir=sort_dir)
    page_items, total_pages, total, from_idx, to_idx = paginate_list(rows, page, page_size)
    return PaginatedProducts(
        items=page_items,
        page=page if total else 1,
        page_size=page_size,
        total=total,
        total_pages=total_pages,
        from_index=from_idx,
        to_index=to_idx,
        kpis=compute_kpis(blocks, dataset),
    )


@router.get("/categories", response_model=PaginatedCategories)
async def list_categories(
    page: int = Query(1, ge=1),
    page_size: int = Query(15, ge=1, le=100),
    filters: QueryFilters = Depends(_parse_filters),
):
    dataset = _require_dataset()
    blocks = filter_blocks(dataset.blocks, filters)
    categories = aggregate_categories(blocks)
    page_items, total_pages, total, from_idx, to_idx = paginate_list(categories, page, page_size)
    return PaginatedCategories(
        items=page_items,
        page=page if total else 1,
        page_size=page_size,
        total=total,
        total_pages=total_pages,
        from_index=from_idx,
        to_index=to_idx,
        kpis=compute_kpis(blocks, dataset),
    )


@router.get("/categories/{subject}/blocks", response_model=PaginatedBlocks)
async def list_category_blocks(
    subject: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    base_filters: QueryFilters = Depends(_parse_filters),
):
    dataset = _require_dataset()
    filters = QueryFilters(
        period_key=base_filters.period_key,
        subject=subject,
        brand=base_filters.brand,
        search=base_filters.search,
    )
    blocks = filter_blocks(dataset.blocks, filters)
    if not blocks:
        raise HTTPException(status_code=404, detail="Категория не найдена или пуста по фильтрам")

    page_items, total_pages, total, from_idx, to_idx = paginate_list(blocks, page, page_size)
    return PaginatedBlocks(
        subject=subject,
        items=page_items,
        page=page if total else 1,
        page_size=page_size,
        total=total,
        total_pages=total_pages,
        from_index=from_idx,
        to_index=to_idx,
        kpis=compute_kpis(blocks, dataset),
    )


@router.get("/products/{nm}/photo", response_model=PhotoResolveResponse)
async def resolve_photo(nm: str):
    _require_dataset()
    url = await resolve_product_photo(nm)
    return PhotoResolveResponse(nm=nm, url=url)
