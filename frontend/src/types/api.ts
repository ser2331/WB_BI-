export interface WBConnectionStatus {
  connected: boolean;
  message: string;
  seller_name?: string | null;
  is_mock?: boolean;
}

export interface DataSourceConfig {
  source_key: string;
  title: string;
  description: string;
  category: string;
  enabled: boolean;
  sync_interval_minutes: number;
  last_synced_at?: string | null;
}

export interface SyncResult {
  source_key: string;
  success: boolean;
  message: string;
  records_count: number;
}

export interface KpiMetric {
  label: string;
  value: number | string;
  change?: number | null;
  unit?: string | null;
}

export interface ChartPoint {
  date: string;
  value: number;
  label?: string | null;
}

export interface TopProduct {
  nm_id: number;
  name: string;
  sales: number;
  orders: number;
  revenue: number;
}

export interface DashboardData {
  kpis: KpiMetric[];
  sales_chart: ChartPoint[];
  orders_chart: ChartPoint[];
  top_products: TopProduct[];
  funnel_metrics: KpiMetric[];
  stocks_summary: Array<{
    nm_id: number;
    article: string;
    warehouse: string;
    quantity: number;
  }>;
  last_updated?: string | null;
}
