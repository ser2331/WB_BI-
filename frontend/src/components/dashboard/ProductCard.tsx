import { memo } from 'react';
import type { ProductCard as ProductCardType } from '@/types/dashboard';
import { fmtNum, fmtPct } from '@/utils/format';
import { ProductImage } from './ProductImage';
import {
  Chip,
  Chips,
  ProductBody,
  ProductCardEl,
  ProductMeta,
  ProductMetrics,
  ProductTitle,
} from './dashboard.styles';

interface Props {
  product: ProductCardType;
}

export const ProductCard = memo(function ProductCard({ product }: Props) {
  const url = product.wbUrl || `https://www.wildberries.ru/catalog/${product.nm}/detail.aspx`;

  return (
    <ProductCardEl>
      <ProductImage nm={product.nm} photo={product.photo} />
      <ProductBody>
        <ProductTitle href={url} target="_blank" rel="noreferrer">
          SKU {product.nm}
        </ProductTitle>
        <ProductMeta>
          {product.vendorCode || '—'}
          {product.brand ? ` · ${product.brand}` : ''}
        </ProductMeta>
        <Chips>
          {product.subject && <Chip>{product.subject}</Chip>}
          {product.brand && <Chip>{product.brand}</Chip>}
        </Chips>
        <ProductMetrics>
          <div>
            <span>Заказано</span>
            <strong>{fmtNum(product.orders)}</strong>
          </div>
          <div>
            <span>Продано</span>
            <strong>{fmtNum(product.sales)}</strong>
          </div>
          <div>
            <span>Остаток</span>
            <strong>{fmtNum(product.stock)}</strong>
          </div>
          <div>
            <span>CTR</span>
            <strong>{fmtPct(product.ad_ctr)}</strong>
          </div>
        </ProductMetrics>
      </ProductBody>
    </ProductCardEl>
  );
});
