import styled from 'styled-components';
import { media } from '@/styles/breakpoints';
import type { KpiMetric } from '@/types/api';

const KpiCard = styled.div`
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;

  ${media.mobile} {
    padding: 14px;
  }
`;

const Label = styled.span`
  font-size: 13px;
  color: var(--color-text-muted);
  font-weight: 500;

  ${media.mobile} {
    font-size: 12px;
  }
`;

const Value = styled.span`
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;

  ${media.mobile} {
    font-size: 22px;
  }

  ${media.smallMobile} {
    font-size: 20px;
  }
`;
const Unit = styled.span`
  font-size: 16px;
  font-weight: 400;
  color: var(--color-text-muted);
  margin-left: 4px;
`;

interface Props {
  metrics: KpiMetric[];
}

export function KpiRow({ metrics }: Props) {
  return (
    <>
      {metrics.map((m) => (
        <KpiCard key={m.label}>
          <Label>{m.label}</Label>
          <Value>
            {typeof m.value === 'number'
              ? m.value.toLocaleString('ru-RU')
              : m.value}
            {m.unit && <Unit>{m.unit}</Unit>}
          </Value>
        </KpiCard>
      ))}
    </>
  );
}
