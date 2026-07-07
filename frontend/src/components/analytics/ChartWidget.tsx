import { Column, Pie } from '@ant-design/plots';
import { Card, Empty } from 'antd';
import type { ChartPoint } from '@/types/dashboardApi';
import { useThemeMode } from '@/hooks/useThemeMode';

interface Props {
  title: string;
  data: ChartPoint[];
  variant?: 'column' | 'pie';
  height?: number;
}

export function ChartWidget({ title, data, variant = 'column', height = 280 }: Props) {
  const { isDark } = useThemeMode();

  return (
    <Card title={title} styles={{ body: { minHeight: height } }}>
      {data.length === 0 ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Нет данных" />
      ) : variant === 'pie' ? (
        <Pie
          data={data}
          angleField="value"
          colorField="label"
          radius={0.9}
          innerRadius={0.55}
          height={height}
          legend={{ position: 'bottom' }}
          theme={isDark ? 'dark' : 'light'}
          label={{
            text: (item: ChartPoint) => `${item.label}: ${Math.round(item.value)}`,
            style: { fontSize: 11 },
          }}
        />
      ) : (
        <Column
          data={data}
          xField="label"
          yField="value"
          height={height}
          theme={isDark ? 'dark' : 'light'}
          axis={{
            x: {
              labelAutoRotate: true,
            },
          }}
          label={{
            position: 'top',
            style: { fontSize: 11 },
          }}
        />
      )}
    </Card>
  );
}

interface GroupedProps {
  title: string;
  data: Array<{ label: string; type: string; value: number }>;
  height?: number;
}

export function GroupedChartWidget({ title, data, height = 300 }: GroupedProps) {
  const { isDark } = useThemeMode();

  return (
    <Card title={title} styles={{ body: { minHeight: height } }}>
      {data.length === 0 ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Нет данных" />
      ) : (
        <Column
          data={data}
          xField="label"
          yField="value"
          seriesField="type"
          isGroup
          height={height}
          theme={isDark ? 'dark' : 'light'}
          axis={{
            x: {
              labelAutoRotate: true,
            },
          }}
        />
      )}
    </Card>
  );
}
