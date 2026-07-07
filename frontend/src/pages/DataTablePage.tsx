import { useMemo } from 'react';
import {
  useGetDashboardFiltersQuery,
  useGetDashboardMetaQuery,
  useGetProductsTableQuery,
} from '@/api/wbApi';
import { getErrorMessage } from '@/api/error';
import { DashboardFilters } from '@/components/dashboard/DashboardFilters';
import { layoutClass } from '@/components/dashboard/dashboard.layout';
import { DashboardPageSkeleton } from '@/components/ui/skeletons/DashboardPageSkeleton';
import { PageOverlay } from '@/components/ui/PageOverlay';
import { useDashboardParams } from '@/hooks/useDashboardParams';
import { fmtNum, fmtPct } from '@/utils/format';
import type { ProductTableRow } from '@/types/dashboardApi';
import { Card, Empty, Table, Typography } from 'antd';
import type { TableProps } from 'antd';

function rowKey(row: ProductTableRow) {
  return `${row.nm}|${row.period_key ?? ''}|${row.glue_title ?? ''}`;
}

export function DataTablePage() {
  const { params, apiQuery, setParams } = useDashboardParams(25);

  const { data: meta, isLoading: metaLoading, error: metaError } = useGetDashboardMetaQuery();
  const hasData = meta?.has_data ?? false;

  const { data: filterOptions, error: filtersError } = useGetDashboardFiltersQuery(undefined, {
    skip: !hasData,
  });

  const {
    data,
    isLoading: tableLoading,
    isFetching: tableFetching,
    error: tableError,
  } = useGetProductsTableQuery(apiQuery, { skip: !hasData });

  const loading = metaLoading || (hasData && tableLoading && !data);
  const error = getErrorMessage(metaError ?? filtersError ?? tableError, '');
  const busy = hasData && tableFetching && !tableLoading;

  const columns = useMemo<TableProps<ProductTableRow>['columns']>(
    () => [
      {
        title: 'SKU',
        dataIndex: 'nm',
        key: 'nm',
        sorter: true,
        sortOrder:
          params.sortBy === 'nm' ? (params.sortDir === 'asc' ? 'ascend' : 'descend') : undefined,
        render: (value: string) => (
          <Typography.Link
            href={`https://www.wildberries.ru/catalog/${value}/detail.aspx`}
            target="_blank"
            rel="noreferrer"
          >
            {value}
          </Typography.Link>
        ),
      },
      { title: 'Артикул', dataIndex: 'vendor_code', key: 'vendor_code', ellipsis: true },
      {
        title: 'Предмет',
        dataIndex: 'subject',
        key: 'subject',
        sorter: true,
        sortOrder:
          params.sortBy === 'subject'
            ? params.sortDir === 'asc'
              ? 'ascend'
              : 'descend'
            : undefined,
      },
      {
        title: 'Бренд',
        dataIndex: 'brand',
        key: 'brand',
        sorter: true,
        sortOrder:
          params.sortBy === 'brand' ? (params.sortDir === 'asc' ? 'ascend' : 'descend') : undefined,
      },
      { title: 'Период', dataIndex: 'period_label', key: 'period_label', ellipsis: true },
      { title: 'Склейка', dataIndex: 'glue_title', key: 'glue_title', ellipsis: true },
      {
        title: 'Заказы',
        dataIndex: 'orders',
        key: 'orders',
        sorter: true,
        sortOrder:
          params.sortBy === 'orders'
            ? params.sortDir === 'asc'
              ? 'ascend'
              : 'descend'
            : undefined,
        render: (value: number | null) => fmtNum(value),
      },
      {
        title: 'Продажи',
        dataIndex: 'sales',
        key: 'sales',
        sorter: true,
        sortOrder:
          params.sortBy === 'sales' ? (params.sortDir === 'asc' ? 'ascend' : 'descend') : undefined,
        render: (value: number | null) => fmtNum(value),
      },
      {
        title: 'Остаток',
        dataIndex: 'stock',
        key: 'stock',
        sorter: true,
        sortOrder:
          params.sortBy === 'stock' ? (params.sortDir === 'asc' ? 'ascend' : 'descend') : undefined,
        render: (value: number | null) => fmtNum(value),
      },
      {
        title: 'СПП',
        dataIndex: 'spp',
        key: 'spp',
        render: (value: number | null) => fmtPct(value),
      },
      {
        title: 'CTR',
        dataIndex: 'ad_ctr',
        key: 'ad_ctr',
        render: (value: number | null) => fmtPct(value),
      },
    ],
    [params.sortBy, params.sortDir]
  );

  if (loading) {
    return (
      <div className={layoutClass.dashboardRoot}>
        <DashboardPageSkeleton variant="categories" />
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className={layoutClass.dashboardRoot}>
        <Card>
          <Empty description="Данные ещё не загружены" />
        </Card>
      </div>
    );
  }

  return (
    <PageOverlay className={layoutClass.dashboardRoot} busy={busy} error={error || null}>
      <section className={layoutClass.dashboardSection}>
        <DashboardFilters
          title="Фильтры"
          options={filterOptions ?? null}
          filters={{
            periodKey: params.periodKey,
            subject: params.subject,
            brand: params.brand,
            search: params.search,
          }}
          onChange={(f) =>
            setParams(
              {
                periodKey: f.periodKey,
                subject: f.subject,
                brand: f.brand,
                search: f.search,
              },
              true
            )
          }
          paging={
            data
              ? {
                  page: data.page,
                  from: data.from_index,
                  to: data.to_index,
                  total: data.total,
                  pageSize: params.pageSize,
                  pageSizeOptions: [25, 50, 100, 200],
                  onPageChange: (page) => setParams({ page }),
                  onPageSizeChange: (pageSize) => setParams({ pageSize }, true),
                }
              : null
          }
        />
      </section>

      <section className={layoutClass.dashboardSection}>
        <Card title={`Все товары (${data?.total ?? 0})`}>
          <Table<ProductTableRow>
            rowKey={rowKey}
            size="middle"
            scroll={{ x: 1200 }}
            columns={columns}
            dataSource={data?.items ?? []}
            pagination={false}
            onChange={(_pagination, _filters, sorter) => {
              const entry = Array.isArray(sorter) ? sorter[0] : sorter;
              if (!entry?.field || !entry.order) return;
              setParams(
                {
                  sortBy: String(entry.field),
                  sortDir: entry.order === 'ascend' ? 'asc' : 'desc',
                  page: 1,
                },
                true
              );
            }}
          />
        </Card>
      </section>
    </PageOverlay>
  );
}
