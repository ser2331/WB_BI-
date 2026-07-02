import styled from 'styled-components';
import { CardTitle } from '@/components/layout/Layout.styles';
import { media } from '@/styles/breakpoints';
import type { KpiMetric } from '@/types/api';

const FunnelContainer = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 12px;
  height: 200px;
  padding-top: 20px;

  ${media.mobile} {
    gap: 6px;
    height: 160px;
    padding-top: 12px;
  }
`;

const FunnelStep = styled.div<{ $color: string }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-width: 0;

  ${media.mobile} {
    gap: 4px;
  }
`;

const Bar = styled.div<{ $height: number; $color: string }>`
  width: 100%;
  height: ${({ $height }) => $height}%;
  min-height: 8px;
  background: ${({ $color }) => $color};
  border-radius: 6px 6px 0 0;
  transition: height 0.3s ease;
`;

const StepLabel = styled.span`
  font-size: 12px;
  color: var(--color-text-muted);
  text-align: center;
  line-height: 1.2;
  word-break: break-word;

  ${media.mobile} {
    font-size: 10px;
  }
`;

const StepValue = styled.span`
  font-size: 18px;
  font-weight: 700;

  ${media.mobile} {
    font-size: 13px;
  }

  ${media.smallMobile} {
    font-size: 11px;
  }
`;

const COLORS = ['#7c5cfc', '#38bdf8', '#fbbf24', '#34d399'];

interface Props {
  metrics: KpiMetric[];
}

export function FunnelWidget({ metrics }: Props) {
  const max = Math.max(...metrics.map((m) => Number(m.value) || 0), 1);

  return (
    <div>
      <CardTitle>Воронка продаж</CardTitle>
      {metrics.every((m) => Number(m.value) === 0) ? (
        <div style={{ color: 'var(--color-text-muted)', padding: '40px 0', textAlign: 'center' }}>
          Включите источник «Воронка продаж» и синхронизируйте
        </div>
      ) : (
        <FunnelContainer>
          {metrics.map((m, i) => (
            <FunnelStep key={m.label} $color={COLORS[i]}>
              <StepValue>{Number(m.value).toLocaleString('ru-RU')}</StepValue>
              <Bar
                $height={(Number(m.value) / max) * 100}
                $color={COLORS[i]}
              />
              <StepLabel>{m.label}</StepLabel>
            </FunnelStep>
          ))}
        </FunnelContainer>
      )}
    </div>
  );
}
