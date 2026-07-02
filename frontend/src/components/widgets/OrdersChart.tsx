import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { CardTitle } from '@/components/layout/Layout.styles';
import { useIsMobile } from '@/hooks/useMediaQuery';
import type { ChartPoint } from '@/types/api';

interface Props {
  title: string;
  data: ChartPoint[];
  color?: string;
}

export function OrdersChart({ title, data, color = '#38bdf8' }: Props) {
  const isMobile = useIsMobile();
  const formatted = data.map((d) => ({
    ...d,
    displayDate: d.date.slice(5),
  }));
  const height = isMobile ? 220 : 280;
  const fontSize = isMobile ? 10 : 12;

  return (
    <div>
      <CardTitle>{title}</CardTitle>
      {formatted.length === 0 ? (
        <div style={{ color: 'var(--color-text-muted)', padding: '40px 0', textAlign: 'center' }}>
          Нет данных
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={formatted} margin={isMobile ? { left: -10, right: 4 } : undefined}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2e3345" />
            <XAxis
              dataKey="displayDate"
              stroke="#8b92a8"
              fontSize={fontSize}
              tickLine={false}
              interval={isMobile ? 'preserveStartEnd' : undefined}
              minTickGap={isMobile ? 20 : undefined}
            />
            <YAxis
              stroke="#8b92a8"
              fontSize={fontSize}
              tickLine={false}
              width={isMobile ? 28 : 60}
            />
            <Tooltip
              contentStyle={{
                background: '#222633',
                border: '1px solid #2e3345',
                borderRadius: 8,
                fontSize: isMobile ? 12 : 13,
              }}
            />
            <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
