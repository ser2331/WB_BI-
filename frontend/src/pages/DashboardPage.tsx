import { useCallback, useEffect, useState } from 'react';
import { api } from '@/api/client';
import type { DashboardData } from '@/types/api';
import { Button, Grid, Widget, WidgetGrid } from '@/components/layout/Layout.styles';
import { KpiRow } from '@/components/widgets/KpiRow';
import { SalesChart } from '@/components/widgets/SalesChart';
import { OrdersChart } from '@/components/widgets/OrdersChart';
import { TopProductsChart } from '@/components/widgets/TopProductsChart';
import { FunnelWidget } from '@/components/widgets/FunnelWidget';
import { StocksTable } from '@/components/widgets/StocksTable';
import styled from 'styled-components';
import { media } from '@/styles/breakpoints';

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
    margin-bottom: 16px;
  }
`;

const LastUpdated = styled.span`
  font-size: 13px;
  color: var(--color-text-muted);
  line-height: 1.4;

  @media (max-width: 640px) {
    font-size: 12px;
  }
`;

const SyncButton = styled(Button)`
  ${media.mobile} {
    width: 100%;
  }
`;

const ErrorMsg = styled.div`
  background: rgba(248, 113, 113, 0.1);
  border: 1px solid var(--color-danger);
  color: var(--color-danger);
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 14px;
`;

export function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    try {
      const dashboard = await api.getDashboard();
      setData(dashboard);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleSync = async () => {
    setSyncing(true);
    setError(null);
    try {
      const results = await api.syncData();
      const failed = results.filter((r) => !r.success);
      if (failed.length > 0) {
        setError(failed.map((f) => `${f.source_key}: ${f.message}`).join('; '));
      }
      await loadDashboard();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка синхронизации');
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return <div style={{ color: 'var(--color-text-muted)' }}>Загрузка дашборда…</div>;
  }

  return (
    <div>
      <Toolbar>
        <LastUpdated>
          {data?.last_updated
            ? `Обновлено: ${new Date(data.last_updated).toLocaleString('ru-RU')}`
            : 'Данные ещё не синхронизированы'}
        </LastUpdated>
        <SyncButton $variant="primary" onClick={handleSync} disabled={syncing}>
          {syncing ? 'Синхронизация…' : '↻ Синхронизировать'}
        </SyncButton>
      </Toolbar>

      {error && <ErrorMsg>{error}</ErrorMsg>}

      <Grid $cols={4} style={{ marginBottom: 16 }}>
        <KpiRow metrics={data?.kpis ?? []} />
      </Grid>

      <WidgetGrid>
        <Widget $colSpan={8}>
          <SalesChart title="Выручка по дням" data={data?.sales_chart ?? []} />
        </Widget>
        <Widget $colSpan={4}>
          <OrdersChart title="Заказы по дням" data={data?.orders_chart ?? []} />
        </Widget>
        <Widget $colSpan={6}>
          <TopProductsChart products={data?.top_products ?? []} />
        </Widget>
        <Widget $colSpan={6}>
          <FunnelWidget metrics={data?.funnel_metrics ?? []} />
        </Widget>
        <Widget $colSpan={12}>
          <StocksTable items={data?.stocks_summary ?? []} />
        </Widget>
      </WidgetGrid>
    </div>
  );
}
