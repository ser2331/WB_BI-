import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { parseQueryParams } from '@/types/dashboardApi';

export function useDashboardParams(defaultPageSize = 15) {
  const [searchParams, setSearchParams] = useSearchParams();

  const params = useMemo(() => {
    const parsed = parseQueryParams(searchParams);
    if (!searchParams.get('pageSize')) {
      parsed.pageSize = defaultPageSize;
    }
    return parsed;
  }, [searchParams, defaultPageSize]);

  const apiQuery = useMemo(
    () => ({
      periodKey: params.periodKey || undefined,
      subject: params.subject || undefined,
      brand: params.brand || undefined,
      search: params.search || undefined,
      page: params.page,
      pageSize: params.pageSize,
      sortBy: params.sortBy,
      sortDir: params.sortDir,
    }),
    [params]
  );

  const setParams = useCallback(
    (patch: Partial<typeof params>, resetPage = false) => {
      const next = new URLSearchParams(searchParams);
      const apply = (key: string, value: string) => {
        if (value) next.set(key, value);
        else next.delete(key);
      };
      if (patch.periodKey !== undefined) apply('periodKey', patch.periodKey);
      if (patch.subject !== undefined) apply('subject', patch.subject);
      if (patch.brand !== undefined) apply('brand', patch.brand);
      if (patch.search !== undefined) apply('search', patch.search);
      if (patch.pageSize !== undefined) apply('pageSize', String(patch.pageSize));
      if (patch.sortBy !== undefined) apply('sortBy', patch.sortBy);
      if (patch.sortDir !== undefined) apply('sortDir', patch.sortDir);
      if (resetPage) next.set('page', '1');
      else if (patch.page !== undefined) {
        if (patch.page <= 1) next.delete('page');
        else next.set('page', String(patch.page));
      }
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  return { params, apiQuery, setParams };
}
