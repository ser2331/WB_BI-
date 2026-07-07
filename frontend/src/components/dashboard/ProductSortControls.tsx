import { useMemo } from 'react';
import { SortAscendingOutlined, SortDescendingOutlined } from '@ant-design/icons';
import { Button, Select, Typography } from 'antd';
import './block-sort-controls.scss';

export type ProductSortField = 'orders' | 'sales' | 'stock' | 'nm' | 'subject' | 'brand';

export type SortDirection = 'asc' | 'desc';

const SORT_OPTIONS: { value: ProductSortField; label: string }[] = [
  { value: 'orders', label: 'Заказы' },
  { value: 'sales', label: 'Продажи' },
  { value: 'stock', label: 'Остаток' },
  { value: 'nm', label: 'SKU' },
  { value: 'subject', label: 'Предмет' },
  { value: 'brand', label: 'Бренд' },
];

interface Props {
  sortBy: string;
  sortDir: SortDirection;
  onSortByChange: (field: ProductSortField) => void;
  onSortDirToggle: () => void;
  className?: string;
}

export function ProductSortControls({
  sortBy,
  sortDir,
  onSortByChange,
  onSortDirToggle,
  className,
}: Props) {
  const field = (
    SORT_OPTIONS.some((o) => o.value === sortBy) ? sortBy : 'orders'
  ) as ProductSortField;
  const dirLabel = useMemo(
    () => (sortDir === 'desc' ? 'По убыванию' : 'По возрастанию'),
    [sortDir]
  );

  const rootClass = ['block-sort-controls', className].filter(Boolean).join(' ');

  return (
    <div className={rootClass}>
      <Typography.Text type="secondary" className="block-sort-controls__label">
        Сортировка
      </Typography.Text>
      <Select
        size="small"
        className="block-sort-controls__field"
        value={field}
        onChange={onSortByChange}
        options={SORT_OPTIONS}
      />
      <Button
        size="small"
        className="block-sort-controls__dir"
        icon={sortDir === 'desc' ? <SortDescendingOutlined /> : <SortAscendingOutlined />}
        onClick={onSortDirToggle}
      >
        <span className="block-sort-controls__dir-text">{dirLabel}</span>
      </Button>
    </div>
  );
}
