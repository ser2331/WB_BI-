import { useMemo } from 'react';
import type { BlockSortField, SortDirection } from '@/utils/sortGlueBlocks';
import { Button, Select, Typography } from 'antd';
import { SortAscendingOutlined, SortDescendingOutlined } from '@ant-design/icons';
import './block-sort-controls.scss';

const SORT_OPTIONS: { value: BlockSortField; label: string }[] = [
  { value: 'orders', label: 'Заказы' },
  { value: 'sales', label: 'Продажи' },
  { value: 'stock', label: 'Остаток' },
  { value: 'ad_ctr', label: 'CTR' },
  { value: 'spp', label: 'СПП' },
  { value: 'kvv', label: 'КВВ' },
  { value: 'skuCount', label: 'SKU' },
  { value: 'title', label: 'Название' },
];

interface Props {
  sortBy: BlockSortField;
  sortDir: SortDirection;
  onSortByChange: (field: BlockSortField) => void;
  onSortDirToggle: () => void;
  className?: string;
}

export function BlockSortControls({
  sortBy,
  sortDir,
  onSortByChange,
  onSortDirToggle,
  className,
}: Props) {
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
        value={sortBy}
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
