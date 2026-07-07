import { Link, useNavigate } from 'react-router-dom';
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
import {
  Card,
  CategoryCard,
  CategoryCardButton,
  CategoryCardMeta,
  CategoryCardTitle,
  CategoriesStack,
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
import { fmtNum } from '@/utils/format';

export function CategoriesPage() {
  const navigate = useNavigate();
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
      <PageScroll>
        <LoadingState>
          <span>Загрузка…</span>
          <Skeleton $h={120} />
          <Skeleton $h={80} />
        </LoadingState>
      </PageScroll>
    );
  }

  if (!hasData) {
    return (
      <PageScroll>
        {error && <ErrorMsg>{error}</ErrorMsg>}
        <Card>
          <EmptyState>
            <p style={{ marginBottom: 16, fontSize: 16 }}>Данные ещё не загружены</p>
            <Link to="/import">
              <Button $variant="primary" as="span">
                Перейти к импорту
              </Button>
            </Link>
          </EmptyState>
        </Card>
      </PageScroll>
    );
  }

  return (
    <DashboardRoot>
      {error && <ErrorMsg>{error}</ErrorMsg>}
      {categoriesFetching && !categoriesLoading && <FetchingHint>Обновление…</FetchingHint>}

      <DashboardSection id="overview">
        <HeroSection meta={meta ?? null} kpis={data?.kpis ?? null} />
      </DashboardSection>

      <DashboardSection id="filters">
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
                  totalPages: data.total_pages,
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
      </DashboardSection>

      <DashboardSection id="categories">
        <Card>
          <SectionHeader>
            <h2>Категории ({data?.total ?? 0})</h2>
          </SectionHeader>

          {!data?.items.length ? (
            <EmptyState>По фильтрам категории не найдены</EmptyState>
          ) : (
            <CategoriesStack>
              {data.items.map((cat) => (
                <CategoryCardButton
                  key={cat.subject}
                  type="button"
                  onClick={() => openCategory(cat.subject)}
                >
                  <CategoryCard>
                    <CategoryCardTitle>{cat.subject}</CategoryCardTitle>
                    <CategoryCardMeta>
                      {fmtNum(cat.glues)} склеек · {fmtNum(cat.sku)} SKU · заказы{' '}
                      {fmtNum(cat.orders)} · остаток {cat.stock != null ? fmtNum(cat.stock) : '—'}
                    </CategoryCardMeta>
                  </CategoryCard>
                </CategoryCardButton>
              ))}
            </CategoriesStack>
          )}
        </Card>
      </DashboardSection>

      {meta?.limits && (
        <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>{meta.limits}</p>
      )}
    </DashboardRoot>
  );
}
