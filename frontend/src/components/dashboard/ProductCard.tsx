import { memo } from 'react';
import type { ProductCard as ProductCardType } from '@/types/dashboard';
import { METRIC_HINTS } from '@/constants/metricHints';
import { MetricLabel } from '@/components/ui/MetricLabel';
import { fmtNum, fmtPct } from '@/utils/format';
import { ProductImage } from './ProductImage';
import { Card, Col, Row, Space, Statistic, Tag, Typography } from 'antd';

interface Props {
  product: ProductCardType;
}

export const ProductCard = memo(function ProductCard({ product }: Props) {
  const url = product.wbUrl || `https://www.wildberries.ru/catalog/${product.nm}/detail.aspx`;

  return (
    <Card
      hoverable
      style={{ width: 220, minWidth: 220, flex: '0 0 auto', scrollSnapAlign: 'start' }}
      styles={{ body: { padding: 12 } }}
      cover={<ProductImage nm={product.nm} photo={product.photo} />}
    >
      <Typography.Link href={url} target="_blank" rel="noreferrer" strong>
        SKU {product.nm}
      </Typography.Link>

      <Typography.Paragraph type="secondary" style={{ margin: '4px 0 10px', fontSize: 12 }}>
        {product.vendorCode || '—'}
        {product.brand ? ` · ${product.brand}` : ''}
      </Typography.Paragraph>

      <Space size={[4, 4]} wrap style={{ marginBottom: 10 }}>
        {product.subject ? <Tag>{product.subject}</Tag> : null}
        {product.brand ? <Tag color="processing">{product.brand}</Tag> : null}
      </Space>

      <Row gutter={[8, 8]}>
        <Col span={12}>
          <Statistic
            title={<MetricLabel label="Заказано" hint={METRIC_HINTS.orders} />}
            value={fmtNum(product.orders)}
            valueStyle={{ fontSize: 14 }}
          />
        </Col>
        <Col span={12}>
          <Statistic
            title={<MetricLabel label="Продано" hint={METRIC_HINTS.sales} />}
            value={fmtNum(product.sales)}
            valueStyle={{ fontSize: 14 }}
          />
        </Col>
        <Col span={12}>
          <Statistic
            title={<MetricLabel label="Остаток" hint={METRIC_HINTS.stock} />}
            value={fmtNum(product.stock)}
            valueStyle={{ fontSize: 14 }}
          />
        </Col>
        <Col span={12}>
          <Statistic
            title={<MetricLabel label="СПП" hint={METRIC_HINTS.spp} />}
            value={fmtPct(product.spp)}
            valueStyle={{ fontSize: 14 }}
          />
        </Col>
        <Col span={12}>
          <Statistic
            title={<MetricLabel label="КВВ" hint={METRIC_HINTS.kvv} />}
            value={fmtPct(product.kvv)}
            valueStyle={{ fontSize: 14 }}
          />
        </Col>
        <Col span={12}>
          <Statistic
            title={<MetricLabel label="CTR" hint={METRIC_HINTS.ad_ctr} />}
            value={fmtPct(product.ad_ctr)}
            valueStyle={{ fontSize: 14 }}
          />
        </Col>
      </Row>
    </Card>
  );
});
