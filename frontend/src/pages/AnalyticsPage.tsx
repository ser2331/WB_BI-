import {
  useGetDashboardChartsQuery,
  useGetDashboardFiltersQuery,
  useGetDashboardMetaQuery,
} from '@/api/wbApi';
import { getErrorMessage } from '@/api/error';
import { ChartWidget, GroupedChartWidget } from '@/components/analytics/ChartWidget';
import { DashboardFilters } from '@/components/dashboard/DashboardFilters';
import { HeroSection } from '@/components/dashboard/HeroSection';
import { layoutClass } from '@/components/layout/app-layout';
import { EmptyDataState } from '@/components/ui/EmptyDataState';
import { DashboardPageSkeleton } from '@/components/ui/skeletons/DashboardPageSkeleton';
import { PageOverlay } from '@/components/ui/PageOverlay';
import { useDashboardParams } from '@/hooks/useDashboardParams';
import { fmtNum } from '@/utils/format';
import { Card, Col, Row, Statistic } from 'antd';

export function AnalyticsPage() {
  const { params, apiQuery, setParams } = useDashboardParams(15);

  const { data: meta, isLoading: metaLoading, error: metaError } = useGetDashboardMetaQuery();
  const hasData = meta?.has_data ?? false;

  const { data: filterOptions, error: filtersError } = useGetDashboardFiltersQuery(undefined, {
    skip: !hasData,
  });

  const {
    data: charts,
    isLoading: chartsLoading,
    isFetching: chartsFetching,
    error: chartsError,
  } = useGetDashboardChartsQuery(
    {
      periodKey: apiQuery.periodKey,
      subject: apiQuery.subject,
      brand: apiQuery.brand,
      search: apiQuery.search,
    },
    { skip: !hasData }
  );

  const loading = metaLoading || (hasData && chartsLoading && !charts);
  const error = getErrorMessage(metaError ?? filtersError ?? chartsError, '');
  const busy = hasData && chartsFetching && !chartsLoading;

  const groupedData =
    charts?.orders_vs_sales.flatMap((row) => [
      { label: row.label, type: 'Заказы', value: row.orders },
      { label: row.label, type: 'Продажи', value: row.sales },
    ]) ?? [];

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
        <EmptyDataState description="Данные ещё не загружены. Импортируйте файл для просмотра аналитики." />
      </div>
    );
  }

  return (
    <PageOverlay
      className={layoutClass.dashboardRoot}
      busy={busy}
      busyText="Обновление графиков…"
      error={error || null}
    >
      <section className={layoutClass.dashboardSection}>
        <HeroSection meta={meta ?? null} kpis={charts?.kpis ?? null} />
      </section>

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
        />
      </section>

      <section className={layoutClass.dashboardSection}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic title="Склеек" value={fmtNum(charts?.kpis.glues)} />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic title="SKU" value={fmtNum(charts?.kpis.sku)} />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic title="Заказы" value={fmtNum(charts?.kpis.orders)} />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic title="Продажи" value={fmtNum(charts?.kpis.sales)} />
            </Card>
          </Col>
        </Row>
      </section>

      <section className={layoutClass.dashboardSection}>
        <Row gutter={[16, 16]}>
          <Col xs={24} xl={12}>
            <ChartWidget
              title="Заказы по предметам (топ-12)"
              data={charts?.orders_by_subject ?? []}
            />
          </Col>
          <Col xs={24} xl={12}>
            <ChartWidget
              title="Продажи по предметам (топ-12)"
              data={charts?.sales_by_subject ?? []}
            />
          </Col>
          <Col xs={24} xl={12}>
            <GroupedChartWidget title="Заказы и продажи по предметам" data={groupedData} />
          </Col>
          <Col xs={24} xl={12}>
            <ChartWidget
              title="Топ брендов по заказам"
              data={charts?.top_brands ?? []}
              variant="pie"
            />
          </Col>
          <Col xs={24}>
            <ChartWidget title="Заказы по периодам" data={charts?.orders_by_period ?? []} />
          </Col>
        </Row>
      </section>
    </PageOverlay>
  );
}
