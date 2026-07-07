import { store } from '@/store';
import { wbApi } from '@/api/wbApi';
import type { CategoryBlocksQueryArgs } from '@/api/wbApi';
import type { DashboardQueryParams } from '@/types/dashboardApi';
import type { GlueBlock } from '@/types/dashboard';
import type { CategorySummary, ProductTableRow } from '@/types/dashboardApi';

interface Paginated<T> {
  items: T[];
  total_pages: number;
}

async function fetchPages<T>(
  fetchPage: (page: number, pageSize: number) => Promise<Paginated<T> | undefined>,
  pageSize: number
): Promise<T[]> {
  const all: T[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const data = await fetchPage(page, pageSize);
    if (!data) break;
    all.push(...data.items);
    totalPages = data.total_pages;
    page += 1;
  }

  return all;
}

export async function fetchAllProducts(params: DashboardQueryParams): Promise<ProductTableRow[]> {
  return fetchPages(async (page, pageSize) => {
    const result = await store.dispatch(
      wbApi.endpoints.getProductsTable.initiate({
        ...params,
        page,
        pageSize,
        sortBy: params.sortBy ?? 'orders',
        sortDir: params.sortDir ?? 'desc',
      })
    );
    return 'data' in result ? result.data : undefined;
  }, 200);
}

export async function fetchAllCategories(params: DashboardQueryParams): Promise<CategorySummary[]> {
  return fetchPages(async (page, pageSize) => {
    const result = await store.dispatch(
      wbApi.endpoints.getCategories.initiate({ ...params, page, pageSize })
    );
    return 'data' in result ? result.data : undefined;
  }, 100);
}

export async function fetchAllBlocks(args: CategoryBlocksQueryArgs): Promise<GlueBlock[]> {
  return fetchPages(async (page, pageSize) => {
    const result = await store.dispatch(
      wbApi.endpoints.getCategoryBlocks.initiate({ ...args, page, pageSize })
    );
    return 'data' in result ? result.data : undefined;
  }, 100);
}
