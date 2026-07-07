import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
  DashboardMeta,
  DashboardQueryParams,
  FilterOptions,
  PaginatedBlocks,
  PaginatedCategories,
  PhotoResolveResponse,
} from '@/types/dashboardApi';
import type { ImportResponse } from '@/types/dashboard';

const API_HOST = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const BASE_URL = API_HOST ? `${API_HOST}/api` : '/api';

export type CategoriesQueryArgs = DashboardQueryParams;

export type CategoryBlocksQueryArgs = Omit<DashboardQueryParams, 'subject'> & {
  subject: string;
};

function buildParams(params: Record<string, string | number | undefined>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') out[key] = String(value);
  }
  return out;
}

export const wbApi = createApi({
  reducerPath: 'wbApi',
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
  tagTypes: ['Dashboard'],
  endpoints: (builder) => ({
    getDashboardMeta: builder.query<DashboardMeta, void>({
      query: () => '/dashboard/meta',
      providesTags: ['Dashboard'],
    }),

    getDashboardFilters: builder.query<FilterOptions, void>({
      query: () => '/dashboard/filters',
      providesTags: ['Dashboard'],
    }),

    getCategories: builder.query<PaginatedCategories, CategoriesQueryArgs>({
      query: (params) => ({
        url: '/dashboard/categories',
        params: buildParams({
          periodKey: params.periodKey,
          subject: params.subject,
          brand: params.brand,
          search: params.search,
          page: params.page,
          page_size: params.pageSize,
        }),
      }),
      providesTags: ['Dashboard'],
    }),

    getCategoryBlocks: builder.query<PaginatedBlocks, CategoryBlocksQueryArgs>({
      query: ({ subject, ...params }) => ({
        url: `/dashboard/categories/${encodeURIComponent(subject)}/blocks`,
        params: buildParams({
          periodKey: params.periodKey,
          brand: params.brand,
          search: params.search,
          page: params.page,
          page_size: params.pageSize,
        }),
      }),
      providesTags: ['Dashboard'],
    }),

    resolveProductPhoto: builder.query<PhotoResolveResponse, string>({
      query: (nm) => `/dashboard/products/${encodeURIComponent(nm)}/photo`,
      keepUnusedDataFor: 60 * 60,
    }),

    importFile: builder.mutation<ImportResponse, File>({
      query: (file) => {
        const form = new FormData();
        form.append('file', file);
        return {
          url: '/import',
          method: 'POST',
          body: form,
        };
      },
      invalidatesTags: ['Dashboard'],
    }),

    clearImport: builder.mutation<{ ok: boolean }, void>({
      query: () => ({
        url: '/import',
        method: 'DELETE',
      }),
      invalidatesTags: ['Dashboard'],
    }),
  }),
});

export const {
  useGetDashboardMetaQuery,
  useGetDashboardFiltersQuery,
  useGetCategoriesQuery,
  useGetCategoryBlocksQuery,
  useLazyResolveProductPhotoQuery,
  useImportFileMutation,
  useClearImportMutation,
} = wbApi;
