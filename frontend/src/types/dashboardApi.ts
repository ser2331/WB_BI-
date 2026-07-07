import type { GlueBlock, Period } from './dashboard';

export interface DashboardKpis {
  period_label?: string | null;
  current_period_key?: string | null;
  glues: number;
  sku: number;
  stock?: number | null;
  orders: number;
  sales: number;
}

export interface DashboardMeta {
  has_data: boolean;
  org_name?: string | null;
  file_name?: string | null;
  source_format?: string | null;
  imported_at?: string | null;
  limits?: string | null;
  total_blocks: number;
  total_categories: number;
}

export interface FilterOptions {
  periods: Period[];
  subjects: string[];
  brands: string[];
}

export interface CategorySummary {
  subject: string;
  glues: number;
  sku: number;
  orders: number;
  sales: number;
  stock?: number | null;
}

export interface PaginatedCategories {
  items: CategorySummary[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
  from_index: number;
  to_index: number;
  kpis: DashboardKpis;
}

export interface PaginatedBlocks {
  subject: string;
  items: GlueBlock[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
  from_index: number;
  to_index: number;
  kpis: DashboardKpis;
}

export interface PhotoResolveResponse {
  nm: string;
  url: string | null;
}

export interface DashboardQueryParams {
  periodKey?: string;
  subject?: string;
  brand?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export function buildQueryString(params: DashboardQueryParams): string {
  const q = new URLSearchParams();
  if (params.periodKey) q.set('periodKey', params.periodKey);
  if (params.subject) q.set('subject', params.subject);
  if (params.brand) q.set('brand', params.brand);
  if (params.search) q.set('search', params.search);
  if (params.page && params.page > 1) q.set('page', String(params.page));
  if (params.pageSize) q.set('pageSize', String(params.pageSize));
  const s = q.toString();
  return s ? `?${s}` : '';
}

export function parseQueryParams(searchParams: URLSearchParams): Required<
  Pick<DashboardQueryParams, 'periodKey' | 'subject' | 'brand' | 'search'>
> & {
  page: number;
  pageSize: number;
} {
  return {
    periodKey: searchParams.get('periodKey') || '',
    subject: searchParams.get('subject') || '',
    brand: searchParams.get('brand') || '',
    search: searchParams.get('search') || '',
    page: Math.max(1, Number(searchParams.get('page') || '1')),
    pageSize: Math.max(1, Number(searchParams.get('pageSize') || '15')),
  };
}
