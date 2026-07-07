import { Link, useParams } from 'react-router-dom';
import { useMemo } from 'react';
import { buildQueryString } from '@/types/dashboardApi';
import { useDashboardParams } from '@/hooks/useDashboardParams';
import {
  useGetCategoryBlocksQuery,
  useGetDashboardFiltersQuery,
  useGetDashboardMetaQuery,
} from '@/api/wbApi';
import { getErrorMessage } from '@/api/error';
import { DashboardFilters } from '@/components/dashboard/DashboardFilters';
import { GlueBlocksList } from '@/components/dashboard/GlueBlock';
import { HeroSection } from '@/components/dashboard/HeroSection';
import { layoutClass } from '@/components/dashboard/dashboard.layout';
import { DashboardPageSkeleton } from '@/components/ui/skeletons/DashboardPageSkeleton';
import { PageOverlay } from '@/components/ui/PageOverlay';
import { Button, Card, Empty, Space } from 'antd';

export function CategoryDetailPage() {
  const { subject: subjectParam } = useParams<{ subject: string }>();
  const subject = useMemo(
    () => (subjectParam ? decodeURIComponent(subjectParam) : ''),
    [subjectParam]
  );
  const { params, apiQuery, setParams } = useDashboardParams(10);

  const blocksQuery = useMemo(
    () => ({
      subject,
      periodKey: apiQuery.periodKey,
      brand: apiQuery.brand,
      search: apiQuery.search,
      page: apiQuery.page,
      pageSize: apiQuery.pageSize,
    }),
    [subject, apiQuery]
  );

  const { data: meta, isLoading: metaLoading, error: metaError } = useGetDashboardMetaQuery();

  const { data: filterOptions, error: filtersError } = useGetDashboardFiltersQuery(undefined, {
    skip: !subject,
  });

  const {
    data,
    isLoading: blocksLoading,
    isFetching: blocksFetching,
    error: blocksError,
  } = useGetCategoryBlocksQuery(blocksQuery, { skip: !subject });

  const backQuery = buildQueryString({
    periodKey: params.periodKey,
    subject: params.subject,
    brand: params.brand,
    search: params.search,
    pageSize: params.pageSize,
  });

  const loading = metaLoading || (blocksLoading && !data);
  const error = getErrorMessage(metaError ?? filtersError ?? blocksError, '');
  const busy = Boolean(subject) && blocksFetching && !blocksLoading;

  if (!subject) {
    return (
      <PageOverlay className={layoutClass.dashboardRoot} error="Категория не указана">
        <Card>
          <Empty description="Выберите категорию из списка" />
        </Card>
      </PageOverlay>
    );
  }

  if (loading) {
    return (
      <div className={layoutClass.dashboardRoot}>
        <DashboardPageSkeleton variant="category-detail" />
      </div>
    );
  }

  return (
    <PageOverlay className={layoutClass.dashboardRoot} busy={busy} error={error || null}>
      <div style={{ marginBottom: 8 }}>
        <Link to={`/${backQuery}`}>
          <Button>← Все категории</Button>
        </Link>
      </div>

      <section className={layoutClass.dashboardSection} id="overview">
        <HeroSection meta={meta ?? null} kpis={data?.kpis ?? null} />
      </section>

      <section className={layoutClass.dashboardSection} id="filters">
        <DashboardFilters
          title={subject}
          options={filterOptions ?? null}
          showSubject={false}
          filters={{
            periodKey: params.periodKey,
            subject: '',
            brand: params.brand,
            search: params.search,
          }}
          onChange={(f) =>
            setParams(
              {
                periodKey: f.periodKey,
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
                  pageSizeOptions: [5, 10, 15, 25],
                  onPageChange: (page) => setParams({ page }),
                  onPageSizeChange: (pageSize) => setParams({ pageSize }, true),
                }
              : null
          }
        />
      </section>

      <section className={layoutClass.dashboardSection} id="blocks">
        <Card title={`Склейки (${data?.total ?? 0})`}>
          {!data?.items.length ? (
            <Empty description="По фильтрам склеек не найдено" />
          ) : (
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <GlueBlocksList blocks={data.items} />
            </Space>
          )}
        </Card>
      </section>
    </PageOverlay>
  );
}
