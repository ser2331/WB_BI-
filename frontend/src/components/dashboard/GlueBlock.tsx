import { memo } from 'react';
import type { GlueBlock as GlueBlockType } from '@/types/dashboard';
import { fmtNum, fmtPct } from '@/utils/format';
import { ProductCard } from './ProductCard';
import {
  GlueBlockCard,
  GlueHead,
  GlueMetrics,
  GlueTitle,
  Metric,
  ProductsRow,
  ScrollHint,
} from './dashboard.styles';

const MetricCell = memo(function MetricCell({
  label,
  value,
  digits = 0,
  percent = false,
}: {
  label: string;
  value: number | null | undefined;
  digits?: number;
  percent?: boolean;
}) {
  return (
    <Metric>
      <span>{label}</span>
      <strong>{percent ? fmtPct(value, digits) : fmtNum(value, digits)}</strong>
    </Metric>
  );
});

export const GlueBlock = memo(function GlueBlock({ block }: { block: GlueBlockType }) {
  return (
    <GlueBlockCard>
      <GlueHead>
        <GlueTitle>
          <strong>{block.title}</strong>
          <span>
            {block.brands.join(', ') || '—'} · {fmtNum(block.skuCount)} SKU WB
            {block.periodLabel ? ` · ${block.periodLabel}` : ''}
          </span>
        </GlueTitle>
        <GlueMetrics>
          <MetricCell label="Заказано" value={block.orders} />
          <MetricCell label="Продано" value={block.sales} />
          <MetricCell label="Остаток" value={block.stock} />
          <MetricCell label="СПП" value={block.spp} digits={2} percent />
          <MetricCell label="CTR рекл." value={block.ad_ctr} digits={2} percent />
        </GlueMetrics>
      </GlueHead>
      {block.products.length > 2 && <ScrollHint>← листайте карточки →</ScrollHint>}
      <ProductsRow>
        {block.products.map((p) => (
          <ProductCard key={p.nm} product={p} />
        ))}
      </ProductsRow>
    </GlueBlockCard>
  );
});

export const GlueBlocksList = memo(function GlueBlocksList({
  blocks,
}: {
  blocks: GlueBlockType[];
}) {
  if (blocks.length === 0) return null;

  return (
    <>
      {blocks.map((b) => (
        <GlueBlock key={b.blockId || `${b.periodKey}-${b.groupKey}`} block={b} />
      ))}
    </>
  );
});
