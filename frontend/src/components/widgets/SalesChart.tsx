import {
  LineChart,
  Line,
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
  unit?: string;
}

export function SalesChart({ title, data, color = '#7c5cfc', unit = '₽' }: Props) {
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
          Нет данных. Включите источники и выполните синхронизацию.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={formatted} margin={isMobile ? { left: -10, right: 4 } : undefined}>
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
              width={isMobile ? 36 : 60}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                background: '#222633',
                border: '1px solid #2e3345',
                borderRadius: 8,
                fontSize: isMobile ? 12 : 13,
              }}
              formatter={(value: number) => [
                `${value.toLocaleString('ru-RU')} ${unit}`,
                title,
              ]}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={isMobile ? 1.5 : 2}
              dot={false}
              activeDot={{ r: isMobile ? 3 : 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
