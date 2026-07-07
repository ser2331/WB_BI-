import { memo } from 'react';
import type { DashboardKpis, DashboardMeta } from '@/types/dashboardApi';
import { fmtNum } from '@/utils/format';
import { Eyebrow, HeroCard, HeroKpis, HeroSubtitle, HeroTitle, KpiBox } from './dashboard.styles';

interface Props {
  meta: DashboardMeta | null;
  kpis: DashboardKpis | null;
}

export const HeroSection = memo(function HeroSection({ meta, kpis }: Props) {
  const periodLabel = kpis?.period_label || 'Все периоды';

  return (
    <HeroCard>
      <div>
        <Eyebrow>Склейки по предметам</Eyebrow>
        <HeroTitle>{meta?.org_name || 'Дашборд WB'}</HeroTitle>
        <HeroSubtitle>
          {meta?.file_name
            ? `Импорт: ${meta.file_name} (${meta.source_format?.toUpperCase()})`
            : 'Загрузите CSV или JSON с данными по склейкам'}
          {meta?.imported_at && ` · ${new Date(meta.imported_at).toLocaleString('ru-RU')}`}
        </HeroSubtitle>
      </div>
      <HeroKpis>
        <KpiBox>
          <span>Период</span>
          <strong style={{ fontSize: 18 }}>{periodLabel}</strong>
        </KpiBox>
        <KpiBox>
          <span>Склеек</span>
          <strong>{fmtNum(kpis?.glues)}</strong>
        </KpiBox>
        <KpiBox>
          <span>SKU WB</span>
          <strong>{fmtNum(kpis?.sku)}</strong>
        </KpiBox>
        <KpiBox>
          <span>Остаток</span>
          <strong>{kpis?.stock != null ? fmtNum(kpis.stock) : '—'}</strong>
        </KpiBox>
      </HeroKpis>
    </HeroCard>
  );
});
