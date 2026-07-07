import { memo, useCallback } from 'react';
import type { FilterOptions } from '@/types/dashboardApi';
import { Button } from '@/components/layout/Layout.styles';
import {
  Field,
  FilterResetButton,
  FilterResetRow,
  FiltersPanel,
  FiltersToolbarFooter,
  PageInfo,
  PageSizeField,
  PaginationControls,
  StickyFiltersShell,
  ToolbarTitle,
} from './dashboard.styles';

export interface FiltersState {
  periodKey: string;
  subject: string;
  brand: string;
  search: string;
}

export interface PagingConfig {
  page: number;
  totalPages: number;
  from: number;
  to: number;
  total: number;
  pageSize: number;
  pageSizeOptions: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

interface Props {
  title?: string;
  options: FilterOptions | null;
  filters: FiltersState;
  onChange: (next: FiltersState) => void;
  showSubject?: boolean;
  paging?: PagingConfig | null;
}

export const DashboardFilters = memo(function DashboardFilters({
  title,
  options,
  filters,
  onChange,
  showSubject = true,
  paging,
}: Props) {
  const set = useCallback(
    (patch: Partial<FiltersState>) => onChange({ ...filters, ...patch }),
    [filters, onChange]
  );

  const hasActive = filters.periodKey || filters.subject || filters.brand || filters.search;

  const showPaging = paging && paging.total > 0;

  return (
    <StickyFiltersShell>
      <FiltersPanel>
        {title ? <ToolbarTitle>{title}</ToolbarTitle> : null}

        <Field>
          Период
          <select value={filters.periodKey} onChange={(e) => set({ periodKey: e.target.value })}>
            <option value="">Все периоды</option>
            {(options?.periods ?? []).map((p) => (
              <option key={p.key} value={p.key}>
                {p.label}
              </option>
            ))}
          </select>
        </Field>
        {showSubject && (
          <Field>
            Предмет
            <select value={filters.subject} onChange={(e) => set({ subject: e.target.value })}>
              <option value="">Все предметы</option>
              {(options?.subjects ?? []).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
        )}
        <Field>
          Бренд
          <select value={filters.brand} onChange={(e) => set({ brand: e.target.value })}>
            <option value="">Все бренды</option>
            {(options?.brands ?? []).map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </Field>
        <Field>
          Поиск
          <input
            type="search"
            placeholder="SKU, артикул, название…"
            value={filters.search}
            onChange={(e) => set({ search: e.target.value })}
          />
        </Field>
        {hasActive ? (
          <FilterResetRow>
            <FilterResetButton
              type="button"
              onClick={() => onChange({ periodKey: '', subject: '', brand: '', search: '' })}
            >
              Сбросить фильтры
            </FilterResetButton>
          </FilterResetRow>
        ) : null}

        {showPaging && paging ? (
          <FiltersToolbarFooter>
            <PageSizeField>
              На странице
              <select
                value={paging.pageSize}
                onChange={(e) => paging.onPageSizeChange(Number(e.target.value))}
              >
                {paging.pageSizeOptions.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </PageSizeField>
            <PaginationControls>
              <PageInfo>
                {paging.from}–{paging.to} / {paging.total}
              </PageInfo>
              <div className="pagination-actions">
                <Button
                  disabled={paging.page <= 1}
                  onClick={() => paging.onPageChange(paging.page - 1)}
                >
                  ←
                </Button>
                <span className="page-num">
                  {paging.page}/{paging.totalPages}
                </span>
                <Button
                  disabled={paging.page >= paging.totalPages}
                  onClick={() => paging.onPageChange(paging.page + 1)}
                >
                  →
                </Button>
              </div>
            </PaginationControls>
          </FiltersToolbarFooter>
        ) : null}
      </FiltersPanel>
    </StickyFiltersShell>
  );
});
