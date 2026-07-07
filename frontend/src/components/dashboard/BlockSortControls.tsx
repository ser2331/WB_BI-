import { useMemo } from 'react';
import type { BlockSortField, SortDirection } from '@/utils/sortGlueBlocks';
import { Button, Select, Space, Typography } from 'antd';
import { SortAscendingOutlined, SortDescendingOutlined } from '@ant-design/icons';

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

  return (
    <Space wrap size="small" align="center" className={className}>
      <Typography.Text type="secondary">Сортировка</Typography.Text>
      <Select
        size="small"
        style={{ minWidth: 120 }}
        value={sortBy}
        onChange={onSortByChange}
        options={SORT_OPTIONS}
      />
      <Button
        size="small"
        className="card-toolbar__sort-dir"
        icon={sortDir === 'desc' ? <SortDescendingOutlined /> : <SortAscendingOutlined />}
        onClick={onSortDirToggle}
      >
        <span className="card-toolbar__sort-dir-text">{dirLabel}</span>
      </Button>
    </Space>
  );
}
