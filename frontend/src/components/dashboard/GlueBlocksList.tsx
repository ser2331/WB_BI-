import { memo, useMemo } from 'react';
import type { GlueBlock as GlueBlockType } from '@/types/dashboard';
import { METRIC_HINTS } from '@/constants/metricHints';
import { MetricLabel } from '@/components/ui/MetricLabel';
import { layoutClass } from '@/components/layout/app-layout';
import { fmtNum, fmtPct } from '@/utils/format';
import { sortProductsByOrders } from '@/utils/sortGlueBlocks';
import { ProductCard } from './ProductCard';
import { Card, Col, Row, Statistic, Typography } from 'antd';

const MetricCell = memo(function MetricCell({
  label,
  hint,
  value,
  digits = 0,
  percent = false,
}: {
  label: string;
  hint?: string;
  value: number | null | undefined;
  digits?: number;
  percent?: boolean;
}) {
  return (
    <Statistic
      title={<MetricLabel label={label} hint={hint} />}
      value={percent ? fmtPct(value, digits) : fmtNum(value, digits)}
      valueStyle={{ fontSize: 16 }}
    />
  );
});

const GlueBlockCard = memo(function GlueBlockCard({ block }: { block: GlueBlockType }) {
  const products = useMemo(() => sortProductsByOrders(block.products), [block.products]);

  return (
    <Card
      styles={{
        header: {
          background: 'linear-gradient(90deg, rgba(124, 92, 252, 0.1), rgba(56, 189, 248, 0.06))',
        },
      }}
      title={
        <div>
          <Typography.Text strong style={{ fontSize: 16 }}>
            {block.title}
          </Typography.Text>
          <Typography.Paragraph type="secondary" style={{ margin: '4px 0 0', fontSize: 13 }}>
            {block.brands.join(', ') || '—'} · {fmtNum(block.skuCount)} SKU WB
            {block.periodLabel ? ` · ${block.periodLabel}` : ''}
          </Typography.Paragraph>
        </div>
      }
    >
      <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
        <Col xs={8} sm={4} md={3}>
          <MetricCell label="Заказано" hint={METRIC_HINTS.orders} value={block.orders} />
        </Col>
        <Col xs={8} sm={4} md={3}>
          <MetricCell label="Продано" hint={METRIC_HINTS.sales} value={block.sales} />
        </Col>
        <Col xs={8} sm={4} md={3}>
          <MetricCell label="Остаток" hint={METRIC_HINTS.stock} value={block.stock} />
        </Col>
        <Col xs={8} sm={4} md={3}>
          <MetricCell label="СПП" hint={METRIC_HINTS.spp} value={block.spp} digits={2} percent />
        </Col>
        <Col xs={8} sm={4} md={3}>
          <MetricCell label="КВВ" hint={METRIC_HINTS.kvv} value={block.kvv} digits={2} percent />
        </Col>
        <Col xs={8} sm={4} md={3}>
          <MetricCell
            label="CTR рекл."
            hint={METRIC_HINTS.ad_ctr}
            value={block.ad_ctr}
            digits={2}
            percent
          />
        </Col>
      </Row>

      {products.length > 2 ? (
        <div className={layoutClass.scrollHint}>← листайте карточки →</div>
      ) : null}

      <div className={layoutClass.productsRow}>
        {products.map((p) => (
          <ProductCard key={p.nm} product={p} />
        ))}
      </div>
    </Card>
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
        <GlueBlockCard key={b.blockId || `${b.periodKey}-${b.groupKey}`} block={b} />
      ))}
    </>
  );
});
