import { memo } from 'react';
import type { ProductTableRow } from '@/types/dashboardApi';
import { fmtNum, fmtPct } from '@/utils/format';
import { ProductImage } from './ProductImage';
import { Tag, Typography } from 'antd';
import './product-table-card.scss';

interface Props {
  row: ProductTableRow;
}

const METRICS = [
  { key: 'orders' as const, label: 'Заказы' },
  { key: 'sales' as const, label: 'Продажи' },
  { key: 'stock' as const, label: 'Остаток' },
  { key: 'spp' as const, label: 'СПП', percent: true },
];

export const ProductTableCard = memo(function ProductTableCard({ row }: Props) {
  const url = `https://www.wildberries.ru/catalog/${row.nm}/detail.aspx`;

  return (
    <article className="product-table-card">
      <div className="product-table-card__main">
        <div className="product-table-card__image">
          <ProductImage nm={row.nm} photo={null} />
        </div>

        <div className="product-table-card__info">
          <Typography.Link
            href={url}
            target="_blank"
            rel="noreferrer"
            className="product-table-card__sku"
          >
            SKU {row.nm}
          </Typography.Link>

          <Typography.Paragraph className="product-table-card__vendor">
            {row.vendor_code || '—'}
          </Typography.Paragraph>

          {row.glue_title ? (
            <Typography.Paragraph className="product-table-card__glue">
              {row.glue_title}
            </Typography.Paragraph>
          ) : null}

          <div className="product-table-card__tags">
            {row.subject ? <Tag>{row.subject}</Tag> : null}
            {row.brand ? <Tag color="processing">{row.brand}</Tag> : null}
            {row.period_label ? <Tag color="default">{row.period_label}</Tag> : null}
          </div>
        </div>
      </div>

      <div className="product-table-card__metrics">
        {METRICS.map((metric) => {
          const raw = row[metric.key];
          const value = metric.percent ? fmtPct(raw) : fmtNum(raw);
          return (
            <div key={metric.key} className="product-table-card__metric">
              <span className="product-table-card__metric-label">{metric.label}</span>
              <span className="product-table-card__metric-value">{value}</span>
            </div>
          );
        })}
        <div className="product-table-card__metric">
          <span className="product-table-card__metric-label">CTR</span>
          <span className="product-table-card__metric-value">{fmtPct(row.ad_ctr)}</span>
        </div>
      </div>
    </article>
  );
});
