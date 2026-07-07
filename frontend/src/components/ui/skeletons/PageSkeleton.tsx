import { Card, Flex, Skeleton, Space } from 'antd';

interface Props {
  title?: string;
  rows?: number;
}

export function PageSkeleton({ title, rows = 3 }: Props) {
  return (
    <Space direction="vertical" size="large" style={{ width: '100%', padding: '24px 32px' }}>
      {title ? <Skeleton.Input active size="small" style={{ width: 180 }} /> : null}
      <Card>
        <Skeleton active paragraph={{ rows }} />
      </Card>
    </Space>
  );
}

export function RouteFallback() {
  return (
    <Flex align="center" justify="center" style={{ minHeight: '40vh', padding: 24 }}>
      <Space direction="vertical" align="center" size="large" style={{ width: '100%', maxWidth: 640 }}>
        <Skeleton.Input active size="large" style={{ width: 200 }} />
        <Card style={{ width: '100%' }}>
          <Skeleton active paragraph={{ rows: 4 }} />
        </Card>
      </Space>
    </Flex>
  );
}
