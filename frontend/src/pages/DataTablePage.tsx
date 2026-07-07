import { useMemo, useState } from 'react';
import { DownloadOutlined } from '@ant-design/icons';
import { App } from 'antd';
import {
  useGetDashboardFiltersQuery,
  useGetDashboardMetaQuery,
  useGetProductsTableQuery,
} from '@/api/wbApi';
import { getErrorMessage } from '@/api/error';
import { DashboardFilters } from '@/components/dashboard/DashboardFilters';
import {
  ProductSortControls,
  type ProductSortField,
} from '@/components/dashboard/ProductSortControls';
import { ProductTableCard } from '@/components/dashboard/ProductTableCard';
import { layoutClass } from '@/components/dashboard/dashboard.layout';
import { EmptyDataState } from '@/components/ui/EmptyDataState';
import { DashboardPageSkeleton } from '@/components/ui/skeletons/DashboardPageSkeleton';
import { PageOverlay } from '@/components/ui/PageOverlay';
import {
  formatCountLabel,
  formatExportFilename,
  PRODUCT_EXPORT_COLUMNS,
} from '@/constants/exportColumns';
import { fetchAllProducts } from '@/utils/fetchAllPages';
import { downloadCsv, rowsToCsv } from '@/utils/exportCsv';
import { useDashboardParams } from '@/hooks/useDashboardParams';
import { useIsMobile } from '@/hooks/useIsMobile';
import { fmtNum, fmtPct } from '@/utils/format';
import type { ProductTableRow } from '@/types/dashboardApi';
import { Button, Card, Empty, Table, Typography } from 'antd';
import type { TableProps } from 'antd';

function rowKey(row: ProductTableRow) {
  return `${row.nm}|${row.period_key ?? ''}|${row.glue_title ?? ''}`;
}

export function DataTablePage() {
  const { message } = App.useApp();
  const isMobile = useIsMobile();
  const [exporting, setExporting] = useState(false);
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

  const handleExport = async () => {
    setExporting(true);
    try {
      const rows = await fetchAllProducts(apiQuery);
      if (!rows.length) {
        message.warning('Нет данных для экспорта');
        return;
      }
      downloadCsv(formatExportFilename('products'), rowsToCsv(rows, PRODUCT_EXPORT_COLUMNS));
      message.success(`Экспортировано ${formatCountLabel(rows.length)} товаров`);
    } catch {
      message.error('Не удалось экспортировать данные');
    } finally {
      setExporting(false);
    }
  };

  const handleMobileSortBy = (field: ProductSortField) => {
    setParams({ sortBy: field, page: 1 }, true);
  };

  const handleMobileSortDirToggle = () => {
    setParams({ sortDir: params.sortDir === 'desc' ? 'asc' : 'desc', page: 1 }, true);
  };

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
        <EmptyDataState description="Данные ещё не загружены" />
      </div>
    );
  }

  const items = data?.items ?? [];

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
        <Card
          title={`Все товары (${data?.total ?? 0})`}
          extra={
            <Button
              icon={<DownloadOutlined />}
              loading={exporting}
              onClick={() => void handleExport()}
              size={isMobile ? 'small' : 'middle'}
            >
              {isMobile ? 'CSV' : 'Экспорт CSV'}
            </Button>
          }
        >
          {isMobile ? (
            <>
              <ProductSortControls
                sortBy={params.sortBy}
                sortDir={params.sortDir}
                onSortByChange={handleMobileSortBy}
                onSortDirToggle={handleMobileSortDirToggle}
              />
              {!items.length ? (
                <Empty description="По фильтрам товары не найдены" />
              ) : (
                <div className="product-table-list">
                  {items.map((row) => (
                    <ProductTableCard key={rowKey(row)} row={row} />
                  ))}
                </div>
              )}
            </>
          ) : (
            <Table<ProductTableRow>
              rowKey={rowKey}
              size="middle"
              scroll={{ x: 1200 }}
              columns={columns}
              dataSource={items}
              pagination={false}
              locale={{ emptyText: <Empty description="По фильтрам товары не найдены" /> }}
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
          )}
        </Card>
      </section>
    </PageOverlay>
  );
}
