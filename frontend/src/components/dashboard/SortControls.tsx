import { useMemo } from 'react';
import { SortAscendingOutlined, SortDescendingOutlined } from '@ant-design/icons';
import { Button, Select, Typography } from 'antd';
import type { SortDirection } from '@/utils/sortGlueBlocks';
import './sort-controls.scss';

export interface SortOption<T extends string> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  sortBy: string;
  sortDir: SortDirection;
  options: SortOption<T>[];
  defaultField: T;
  onSortByChange: (field: T) => void;
  onSortDirToggle: () => void;
  className?: string;
}

export function SortControls<T extends string>({
  sortBy,
  sortDir,
  options,
  defaultField,
  onSortByChange,
  onSortDirToggle,
  className,
}: Props<T>) {
  const field = (options.some((o) => o.value === sortBy) ? sortBy : defaultField) as T;
  const dirLabel = useMemo(
    () => (sortDir === 'desc' ? 'По убыванию' : 'По возрастанию'),
    [sortDir]
  );

  const rootClass = ['sort-controls', className].filter(Boolean).join(' ');

  return (
    <div className={rootClass}>
      <Typography.Text type="secondary" className="sort-controls__label">
        Сортировка
      </Typography.Text>
      <Select
        size="small"
        className="sort-controls__field"
        value={field}
        onChange={onSortByChange}
        options={options}
      />
      <Button
        size="small"
        className="sort-controls__dir"
        icon={sortDir === 'desc' ? <SortDescendingOutlined /> : <SortAscendingOutlined />}
        onClick={onSortDirToggle}
      >
        <span className="sort-controls__dir-text">{dirLabel}</span>
      </Button>
    </div>
  );
}

export const BLOCK_SORT_OPTIONS = [
  { value: 'orders', label: 'Заказы' },
  { value: 'sales', label: 'Продажи' },
  { value: 'stock', label: 'Остаток' },
  { value: 'ad_ctr', label: 'CTR' },
  { value: 'spp', label: 'СПП' },
  { value: 'kvv', label: 'КВВ' },
  { value: 'skuCount', label: 'SKU' },
  { value: 'title', label: 'Название' },
] as const;

export const PRODUCT_SORT_OPTIONS = [
  { value: 'orders', label: 'Заказы' },
  { value: 'sales', label: 'Продажи' },
  { value: 'stock', label: 'Остаток' },
  { value: 'nm', label: 'SKU' },
  { value: 'subject', label: 'Предмет' },
  { value: 'brand', label: 'Бренд' },
] as const;

export type ProductSortField = (typeof PRODUCT_SORT_OPTIONS)[number]['value'];
