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
import {
  BlocksGrid,
  Card,
  DashboardRoot,
  DashboardSection,
  EmptyState,
  ErrorMsg,
  FetchingHint,
  LoadingState,
  SectionHeader,
  Skeleton,
} from '@/components/dashboard/dashboard.styles';
import { Button, PageScroll } from '@/components/layout/Layout.styles';

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

  if (!subject) {
    return (
      <PageScroll>
        <ErrorMsg>Категория не указана</ErrorMsg>
      </PageScroll>
    );
  }

  if (loading) {
    return (
      <PageScroll>
        <LoadingState>
          <span>Загрузка категории…</span>
          <Skeleton $h={120} />
          <Skeleton $h={200} />
        </LoadingState>
      </PageScroll>
    );
  }

  return (
    <DashboardRoot>
      <div style={{ marginBottom: 12 }}>
        <Link to={`/${backQuery}`}>
          <Button as="span">← Все категории</Button>
        </Link>
      </div>

      {error && <ErrorMsg>{error}</ErrorMsg>}
      {blocksFetching && !blocksLoading && <FetchingHint>Обновление…</FetchingHint>}

      <DashboardSection id="overview">
        <HeroSection meta={meta ?? null} kpis={data?.kpis ?? null} />
      </DashboardSection>

      <DashboardSection id="filters">
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
                  totalPages: data.total_pages,
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
      </DashboardSection>

      <DashboardSection id="blocks">
        <Card>
          <SectionHeader>
            <h2>Склейки ({data?.total ?? 0})</h2>
          </SectionHeader>

          {!data?.items.length ? (
            <EmptyState>По фильтрам склеек не найдено</EmptyState>
          ) : (
            <BlocksGrid>
              <GlueBlocksList blocks={data.items} />
            </BlocksGrid>
          )}
        </Card>
      </DashboardSection>
    </DashboardRoot>
  );
}
