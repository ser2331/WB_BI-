import { memo } from 'react';
import type { DashboardKpis, DashboardMeta } from '@/types/dashboardApi';
import { fmtNum } from '@/utils/format';
import { Card, Col, Row, Statistic, Typography } from 'antd';

interface Props {
  meta: DashboardMeta | null;
  kpis: DashboardKpis | null;
}

export const HeroSection = memo(function HeroSection({ meta, kpis }: Props) {
  const periodLabel = kpis?.period_label || 'Все периоды';

  return (
    <Card
      styles={{
        body: {
          background: 'linear-gradient(135deg, rgba(124, 92, 252, 0.12), rgba(56, 189, 248, 0.08))',
        },
      }}
    >
      <Row gutter={[24, 24]} align="middle" justify="space-between">
        <Col xs={24} lg={13}>
          <Typography.Text
            type="secondary"
            strong
            style={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 12 }}
          >
            Склейки по предметам
          </Typography.Text>
          <Typography.Title level={2} style={{ margin: '8px 0 0' }}>
            {meta?.org_name || 'Дашборд WB'}
          </Typography.Title>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 0, marginTop: 8 }}>
            {meta?.file_name
              ? `Импорт: ${meta.file_name} (${meta.source_format?.toUpperCase()})`
              : 'Загрузите CSV или JSON с данными по склейкам'}
            {meta?.imported_at && ` · ${new Date(meta.imported_at).toLocaleString('ru-RU')}`}
          </Typography.Paragraph>
        </Col>

        <Col xs={24} lg={11}>
          <Row gutter={[12, 12]}>
            <Col span={12}>
              <Card size="small">
                <Statistic title="Период" value={periodLabel} valueStyle={{ fontSize: 16 }} />
              </Card>
            </Col>
            <Col span={12}>
              <Card size="small">
                <Statistic title="Склеек" value={fmtNum(kpis?.glues)} />
              </Card>
            </Col>
            <Col span={12}>
              <Card size="small">
                <Statistic title="SKU WB" value={fmtNum(kpis?.sku)} />
              </Card>
            </Col>
            <Col span={12}>
              <Card size="small">
                <Statistic title="Остаток" value={kpis?.stock != null ? fmtNum(kpis.stock) : '—'} />
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </Card>
  );
});
