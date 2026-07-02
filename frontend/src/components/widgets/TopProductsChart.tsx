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
import type { TopProduct } from '@/types/api';

interface Props {
  products: TopProduct[];
}

export function TopProductsChart({ products }: Props) {
  const isMobile = useIsMobile();
  const maxNameLen = isMobile ? 12 : 20;
  const data = products.slice(0, isMobile ? 6 : 8).map((p) => ({
    name: p.name.length > maxNameLen ? p.name.slice(0, maxNameLen) + '…' : p.name,
    revenue: p.revenue,
  }));
  const height = isMobile ? 260 : 300;

  return (
    <div>
      <CardTitle>Топ товаров по выручке</CardTitle>
      {data.length === 0 ? (
        <div style={{ color: 'var(--color-text-muted)', padding: '40px 0', textAlign: 'center' }}>
          Нет данных
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data} layout="vertical" margin={{ left: isMobile ? 0 : 8, right: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2e3345" horizontal={false} />
            <XAxis
              type="number"
              stroke="#8b92a8"
              fontSize={isMobile ? 10 : 12}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            />
            <YAxis
              type="category"
              dataKey="name"
              stroke="#8b92a8"
              fontSize={isMobile ? 9 : 11}
              width={isMobile ? 72 : 120}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: '#222633',
                border: '1px solid #2e3345',
                borderRadius: 8,
                fontSize: isMobile ? 12 : 13,
              }}
              formatter={(value: number) => [
                `${value.toLocaleString('ru-RU')} ₽`,
                'Выручка',
              ]}
            />
            <Bar dataKey="revenue" fill="#34d399" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
