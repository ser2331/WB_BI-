import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { DownloadOutlined } from '@ant-design/icons';
import { App } from 'antd';
import { buildQueryString } from '@/types/dashboardApi';
import { useDashboardParams } from '@/hooks/useDashboardParams';
import {
  useGetCategoriesQuery,
  useGetDashboardFiltersQuery,
  useGetDashboardMetaQuery,
} from '@/api/wbApi';
import { getErrorMessage } from '@/api/error';
import { DashboardFilters } from '@/components/dashboard/DashboardFilters';
import { HeroSection } from '@/components/dashboard/HeroSection';
import { layoutClass } from '@/components/dashboard/dashboard.layout';
import { EmptyDataState } from '@/components/ui/EmptyDataState';
import { DashboardPageSkeleton } from '@/components/ui/skeletons/DashboardPageSkeleton';
import { PageOverlay } from '@/components/ui/PageOverlay';
import {
  CATEGORY_EXPORT_COLUMNS,
  formatExportFilename,
  formatCountLabel,
} from '@/constants/exportColumns';
import { fetchAllCategories } from '@/utils/fetchAllPages';
import { downloadCsv, rowsToCsv } from '@/utils/exportCsv';
import { fmtNum } from '@/utils/format';
import { Button, Card, Empty, Space, Typography } from 'antd';

export function CategoriesPage() {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [exporting, setExporting] = useState(false);
  const { params, apiQuery, setParams } = useDashboardParams(15);

  const { data: meta, isLoading: metaLoading, error: metaError } = useGetDashboardMetaQuery();

  const hasData = meta?.has_data ?? false;

  const { data: filterOptions, error: filtersError } = useGetDashboardFiltersQuery(undefined, {
    skip: !hasData,
  });

  const {
    data,
    isLoading: categoriesLoading,
    isFetching: categoriesFetching,
    error: categoriesError,
  } = useGetCategoriesQuery(apiQuery, { skip: !hasData });

  const loading = metaLoading || (hasData && categoriesLoading && !data);
  const error = getErrorMessage(metaError ?? filtersError ?? categoriesError, '');
  const busy = hasData && categoriesFetching && !categoriesLoading;

  const openCategory = (subject: string) => {
    const q = buildQueryString({
      periodKey: params.periodKey,
      brand: params.brand,
      search: params.search,
      pageSize: 10,
    });
    void navigate(`/category/${encodeURIComponent(subject)}${q}`);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const rows = await fetchAllCategories(apiQuery);
      if (!rows.length) {
        message.warning('Нет данных для экспорта');
        return;
      }
      downloadCsv(formatExportFilename('categories'), rowsToCsv(rows, CATEGORY_EXPORT_COLUMNS));
      message.success(`Экспортировано ${formatCountLabel(rows.length)} категорий`);
    } catch {
      message.error('Не удалось экспортировать данные');
    } finally {
      setExporting(false);
    }
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
      <PageOverlay className={layoutClass.dashboardRoot} error={error || null}>
        <EmptyDataState description="Данные ещё не загружены" />
      </PageOverlay>
    );
  }

  return (
    <PageOverlay className={layoutClass.dashboardRoot} busy={busy} error={error || null}>
      <section className={layoutClass.dashboardSection} id="overview">
        <HeroSection meta={meta ?? null} kpis={data?.kpis ?? null} />
      </section>

      <section className={layoutClass.dashboardSection} id="filters">
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
                  pageSizeOptions: [10, 15, 25, 50],
                  onPageChange: (page) => setParams({ page }),
                  onPageSizeChange: (pageSize) => setParams({ pageSize }, true),
                }
              : null
          }
        />
      </section>

      <section className={layoutClass.dashboardSection} id="categories">
        <Card
          title={`Категории (${data?.total ?? 0})`}
          extra={
            <Button
              icon={<DownloadOutlined />}
              loading={exporting}
              onClick={() => void handleExport()}
            >
              Экспорт CSV
            </Button>
          }
        >
          {!data?.items.length ? (
            <Empty description="По фильтрам категории не найдены" />
          ) : (
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              {data.items.map((cat) => (
                <Card
                  key={cat.subject}
                  hoverable
                  size="small"
                  onClick={() => openCategory(cat.subject)}
                  style={{ cursor: 'pointer' }}
                >
                  <Typography.Text strong style={{ fontSize: 16 }}>
                    {cat.subject}
                  </Typography.Text>
                  <Typography.Paragraph type="secondary" style={{ margin: '6px 0 0' }}>
                    {fmtNum(cat.glues)} склеек · {fmtNum(cat.sku)} SKU · заказы {fmtNum(cat.orders)}{' '}
                    · продажи {fmtNum(cat.sales)} · остаток{' '}
                    {cat.stock != null ? fmtNum(cat.stock) : '—'}
                  </Typography.Paragraph>
                </Card>
              ))}
            </Space>
          )}
        </Card>
      </section>

      {meta?.limits ? (
        <Typography.Text type="secondary" style={{ fontSize: 13 }}>
          {meta.limits}
        </Typography.Text>
      ) : null}
    </PageOverlay>
  );
}
