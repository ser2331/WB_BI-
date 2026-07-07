import { Link, useNavigate } from 'react-router-dom';
import { buildQueryString } from '@/types/dashboardApi';
import { useDashboardParams } from '@/hooks/useDashboardParams';
import { useAuth } from '@/hooks/useAuth';
import {
  useGetCategoriesQuery,
  useGetDashboardFiltersQuery,
  useGetDashboardMetaQuery,
} from '@/api/wbApi';
import { getErrorMessage } from '@/api/error';
import { DashboardFilters } from '@/components/dashboard/DashboardFilters';
import { HeroSection } from '@/components/dashboard/HeroSection';
import { layoutClass } from '@/components/dashboard/dashboard.layout';
import { DashboardPageSkeleton } from '@/components/ui/skeletons/DashboardPageSkeleton';
import { fmtNum } from '@/utils/format';
import { Alert, Button, Card, Empty, Space, Typography } from 'antd';

export function CategoriesPage() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { params, apiQuery, setParams } = useDashboardParams(15);

  const { data: meta, isLoading: metaLoading, error: metaError } = useGetDashboardMetaQuery();

  const hasData = meta?.has_data ?? false;

  const { data: filterOptions, error: filtersError } = useGetDashboardFiltersQuery(undefined, {
    skip: !hasData,
  });

  const {
    data,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useGetCategoriesQuery(apiQuery, { skip: !hasData });

  const loading = metaLoading || (hasData && categoriesLoading && !data);
  const error = getErrorMessage(metaError ?? filtersError ?? categoriesError, '');

  const openCategory = (subject: string) => {
    const q = buildQueryString({
      periodKey: params.periodKey,
      brand: params.brand,
      search: params.search,
      pageSize: 10,
    });
    void navigate(`/category/${encodeURIComponent(subject)}${q}`);
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
        {error ? (
          <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />
        ) : null}
        <Card>
          <Empty description="Данные ещё не загружены">
            {isAdmin ? (
              <Link to="/import">
                <Button type="primary">Перейти к импорту</Button>
              </Link>
            ) : (
              <Typography.Text type="secondary">
                Обратитесь к администратору для загрузки данных
              </Typography.Text>
            )}
          </Empty>
        </Card>
      </div>
    );
  }

  return (
    <div className={layoutClass.dashboardRoot}>
      {error ? <Alert type="error" message={error} showIcon style={{ marginBottom: 8 }} /> : null}

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
        <Card title={`Категории (${data?.total ?? 0})`}>
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
                    · остаток {cat.stock != null ? fmtNum(cat.stock) : '—'}
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
    </div>
  );
}
