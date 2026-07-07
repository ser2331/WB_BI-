import { memo } from 'react';
import type { ProductCard as ProductCardType } from '@/types/dashboard';
import { METRIC_HINTS } from '@/constants/metricHints';
import { MetricLabel } from '@/components/ui/MetricLabel';
import { fmtNum, fmtPct } from '@/utils/format';
import { ProductImage } from './ProductImage';
import { Card, Space, Tag, Typography } from 'antd';
import './product-card.scss';

interface Props {
  product: ProductCardType;
}

const METRICS: {
  key: keyof Pick<ProductCardType, 'orders' | 'sales' | 'stock' | 'spp' | 'kvv' | 'ad_ctr'>;
  label: string;
  hint: string;
  percent?: boolean;
}[] = [
  { key: 'orders', label: 'Заказано', hint: METRIC_HINTS.orders },
  { key: 'sales', label: 'Продано', hint: METRIC_HINTS.sales },
  { key: 'stock', label: 'Остаток', hint: METRIC_HINTS.stock },
  { key: 'spp', label: 'СПП', hint: METRIC_HINTS.spp, percent: true },
  { key: 'kvv', label: 'КВВ', hint: METRIC_HINTS.kvv, percent: true },
  { key: 'ad_ctr', label: 'CTR', hint: METRIC_HINTS.ad_ctr, percent: true },
];

export const ProductCard = memo(function ProductCard({ product }: Props) {
  const url = product.wbUrl || `https://www.wildberries.ru/catalog/${product.nm}/detail.aspx`;

  return (
    <Card
      hoverable
      className="product-card"
      cover={
        <div className="product-card__image">
          <ProductImage nm={product.nm} photo={product.photo} />
        </div>
      }
    >
      <Typography.Link
        href={url}
        target="_blank"
        rel="noreferrer"
        strong
        className="product-card__sku"
      >
        SKU {product.nm}
      </Typography.Link>

      <Typography.Paragraph type="secondary" className="product-card__meta">
        {product.vendorCode || '—'}
        {product.brand ? ` · ${product.brand}` : ''}
      </Typography.Paragraph>

      <Space size={[4, 4]} wrap className="product-card__tags">
        {product.subject ? <Tag>{product.subject}</Tag> : null}
        {product.brand ? <Tag color="processing">{product.brand}</Tag> : null}
      </Space>

      <div className="product-card__metrics">
        {METRICS.map((metric) => {
          const value = product[metric.key];
          const formatted = metric.percent ? fmtPct(value) : fmtNum(value);
          return (
            <div key={metric.key} className="product-card__metric">
              <span className="product-card__metric-label">
                <MetricLabel label={metric.label} hint={metric.hint} />
              </span>
              <span className="product-card__metric-value">{formatted}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
});
