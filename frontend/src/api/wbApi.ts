import {
  createApi,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import { baseQueryWithAuth } from '@/api/baseQuery';
import { logout } from '@/store/authSlice';
import type {
  DashboardMeta,
  DashboardQueryParams,
  DashboardCharts,
  FilterOptions,
  PaginatedBlocks,
  PaginatedCategories,
  PaginatedProducts,
  PhotoResolveResponse,
} from '@/types/dashboardApi';
import type { ImportResponse } from '@/types/dashboard';
import type { AuthUser, LoginRequest, LoginResponse } from '@/types/auth';

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  const result = await baseQueryWithAuth(args, api, extraOptions);
  if (result.error?.status === 401 && api.endpoint !== 'login') {
    api.dispatch(logout());
  }
  return result;
};

export type CategoryBlocksQueryArgs = Omit<DashboardQueryParams, 'subject'> & {
  subject: string;
};

function buildParams(
  params: Record<string, string | number | undefined>
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') out[key] = String(value);
  }
  return out;
}

export const wbApi = createApi({
  reducerPath: 'wbApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Dashboard'],
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body,
      }),
    }),

    getMe: builder.query<AuthUser, void>({
      query: () => '/auth/me',
    }),

    getDashboardMeta: builder.query<DashboardMeta, void>({
      query: () => '/dashboard/meta',
      providesTags: ['Dashboard'],
    }),

    getDashboardFilters: builder.query<FilterOptions, void>({
      query: () => '/dashboard/filters',
      providesTags: ['Dashboard'],
    }),

    getDashboardCharts: builder.query<
      DashboardCharts,
      Pick<DashboardQueryParams, 'periodKey' | 'subject' | 'brand' | 'search'>
    >({
      query: (params) => ({
        url: '/dashboard/charts',
        params: buildParams({
          periodKey: params.periodKey,
          subject: params.subject,
          brand: params.brand,
          search: params.search,
        }),
      }),
      providesTags: ['Dashboard'],
    }),

    getProductsTable: builder.query<PaginatedProducts, DashboardQueryParams>({
      query: (params) => ({
        url: '/dashboard/products',
        params: buildParams({
          periodKey: params.periodKey,
          subject: params.subject,
          brand: params.brand,
          search: params.search,
          page: params.page,
          page_size: params.pageSize,
          sortBy: params.sortBy,
          sortDir: params.sortDir,
        }),
      }),
      providesTags: ['Dashboard'],
    }),

    getCategories: builder.query<PaginatedCategories, DashboardQueryParams>({
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
  useLoginMutation,
  useGetMeQuery,
  useGetDashboardMetaQuery,
  useGetDashboardFiltersQuery,
  useGetDashboardChartsQuery,
  useGetProductsTableQuery,
  useGetCategoriesQuery,
  useGetCategoryBlocksQuery,
  useLazyResolveProductPhotoQuery,
  useImportFileMutation,
  useClearImportMutation,
} = wbApi;
