import { memo, useCallback } from 'react';
import type { FilterOptions } from '@/types/dashboardApi';
import { layoutClass } from '@/components/dashboard/dashboard.layout';
import { Button, Card, Col, Input, Pagination, Row, Select, Space, Typography } from 'antd';

export interface FiltersState {
  periodKey: string;
  subject: string;
  brand: string;
  search: string;
}

export interface PagingConfig {
  page: number;
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
    <div className={layoutClass.stickyFilters}>
      <Card>
        {title ? (
          <Typography.Title level={5} style={{ marginTop: 0 }}>
            {title}
          </Typography.Title>
        ) : null}

        <Row gutter={[12, 12]}>
          <Col xs={24} sm={12} lg={6}>
            <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 6 }}>
              Период
            </Typography.Text>
            <Select
              style={{ width: '100%' }}
              value={filters.periodKey || undefined}
              placeholder="Все периоды"
              allowClear
              onChange={(value) => set({ periodKey: value ?? '' })}
              options={(options?.periods ?? []).map((p) => ({ value: p.key, label: p.label }))}
            />
          </Col>

          {showSubject ? (
            <Col xs={24} sm={12} lg={6}>
              <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 6 }}>
                Предмет
              </Typography.Text>
              <Select
                style={{ width: '100%' }}
                value={filters.subject || undefined}
                placeholder="Все предметы"
                allowClear
                showSearch
                optionFilterProp="label"
                onChange={(value) => set({ subject: value ?? '' })}
                options={(options?.subjects ?? []).map((s) => ({ value: s, label: s }))}
              />
            </Col>
          ) : null}

          <Col xs={24} sm={12} lg={6}>
            <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 6 }}>
              Бренд
            </Typography.Text>
            <Select
              style={{ width: '100%' }}
              value={filters.brand || undefined}
              placeholder="Все бренды"
              allowClear
              showSearch
              optionFilterProp="label"
              onChange={(value) => set({ brand: value ?? '' })}
              options={(options?.brands ?? []).map((b) => ({ value: b, label: b }))}
            />
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 6 }}>
              Поиск
            </Typography.Text>
            <Input.Search
              allowClear
              placeholder="SKU, артикул, название…"
              value={filters.search}
              onChange={(e) => set({ search: e.target.value })}
            />
          </Col>

          {hasActive ? (
            <Col span={24}>
              <Button
                type="link"
                onClick={() => onChange({ periodKey: '', subject: '', brand: '', search: '' })}
              >
                Сбросить фильтры
              </Button>
            </Col>
          ) : null}
        </Row>

        {showPaging && paging ? (
          <Space
            wrap
            style={{
              width: '100%',
              marginTop: 16,
              paddingTop: 16,
              borderTop: '1px solid var(--color-border)',
              justifyContent: 'space-between',
            }}
          >
            <Space wrap>
              <Typography.Text type="secondary">На странице</Typography.Text>
              <Select
                value={paging.pageSize}
                style={{ width: 88 }}
                onChange={paging.onPageSizeChange}
                options={paging.pageSizeOptions.map((n) => ({ value: n, label: String(n) }))}
              />
              <Typography.Text type="secondary">
                {paging.from}–{paging.to} / {paging.total}
              </Typography.Text>
            </Space>

            <Pagination
              current={paging.page}
              total={paging.total}
              pageSize={paging.pageSize}
              showSizeChanger={false}
              onChange={paging.onPageChange}
            />
          </Space>
        ) : null}
      </Card>
    </div>
  );
});
