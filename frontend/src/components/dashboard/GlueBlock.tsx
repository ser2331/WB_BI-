import { memo } from 'react';
import type { GlueBlock as GlueBlockType } from '@/types/dashboard';
import { fmtNum, fmtPct } from '@/utils/format';
import { ProductCard } from './ProductCard';
import { layoutClass } from './dashboard.layout';
import { Card, Col, Row, Statistic, Typography } from 'antd';

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
    <Statistic
      title={label}
      value={percent ? fmtPct(value, digits) : fmtNum(value, digits)}
      valueStyle={{ fontSize: 16 }}
    />
  );
});

export const GlueBlock = memo(function GlueBlock({ block }: { block: GlueBlockType }) {
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
        <Col xs={8} sm={4} md={4}>
          <MetricCell label="Заказано" value={block.orders} />
        </Col>
        <Col xs={8} sm={4} md={4}>
          <MetricCell label="Продано" value={block.sales} />
        </Col>
        <Col xs={8} sm={4} md={4}>
          <MetricCell label="Остаток" value={block.stock} />
        </Col>
        <Col xs={8} sm={4} md={4}>
          <MetricCell label="СПП" value={block.spp} digits={2} percent />
        </Col>
        <Col xs={8} sm={4} md={4}>
          <MetricCell label="CTR рекл." value={block.ad_ctr} digits={2} percent />
        </Col>
      </Row>

      {block.products.length > 2 ? (
        <div className={layoutClass.scrollHint}>← листайте карточки →</div>
      ) : null}

      <div className={layoutClass.productsRow}>
        {block.products.map((p) => (
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
        <GlueBlock key={b.blockId || `${b.periodKey}-${b.groupKey}`} block={b} />
      ))}
    </>
  );
});
