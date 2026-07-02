import type {
  DashboardData,
  DataSourceConfig,
  SyncResult,
  WBConnectionStatus,
} from '@/types/api';

const API_HOST = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const BASE = API_HOST ? `${API_HOST}/api` : '/api';
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  return response.json();
}

export const api = {
  getHealth: () => request<{ status: string }>('/health'),

  getWBStatus: () => request<WBConnectionStatus>('/wb/status'),

  connectMock: () =>
    request<WBConnectionStatus>('/wb/connect-mock', { method: 'POST' }),

  getMockToken: () =>
    request<{ token: string; hint: string }>('/mock/token'),

  connectWB: (api_token: string) =>
    request<WBConnectionStatus>('/wb/connect', {
      method: 'POST',
      body: JSON.stringify({ api_token }),
    }),

  disconnectWB: () =>
    request<{ ok: boolean }>('/wb/disconnect', { method: 'DELETE' }),

  getDataSources: () => request<DataSourceConfig[]>('/data-sources'),

  updateDataSource: (
    sourceKey: string,
    data: { enabled: boolean; sync_interval_minutes: number }
  ) =>
    request<DataSourceConfig>(`/data-sources/${sourceKey}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  syncData: (source_keys?: string[]) =>
    request<SyncResult[]>('/sync', {
      method: 'POST',
      body: JSON.stringify({ source_keys: source_keys ?? null }),
    }),

  getDashboard: () => request<DashboardData>('/dashboard'),
};
