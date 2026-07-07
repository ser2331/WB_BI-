import { Card, Col, Flex, Row, Skeleton, Space } from 'antd';

interface Props {
  variant?: 'categories' | 'category-detail';
}

export function DashboardPageSkeleton({ variant = 'categories' }: Props) {
  const listItems = variant === 'categories' ? 6 : 3;

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Card>
        <Row gutter={[16, 16]} align="middle" justify="space-between">
          <Col xs={24} lg={12}>
            <Skeleton.Input active size="small" style={{ width: 160, marginBottom: 12 }} />
            <Skeleton.Input active size="large" style={{ width: '80%', marginBottom: 8 }} />
            <Skeleton.Input active size="small" style={{ width: '60%' }} />
          </Col>
          <Col xs={24} lg={12}>
            <Row gutter={[12, 12]}>
              {Array.from({ length: 4 }).map((_, index) => (
                <Col span={12} key={index}>
                  <Card size="small">
                    <Skeleton active paragraph={{ rows: 1 }} title={{ width: '50%' }} />
                  </Card>
                </Col>
              ))}
            </Row>
          </Col>
        </Row>
      </Card>

      <Card>
        <Skeleton.Input active size="small" style={{ width: 120, marginBottom: 16 }} />
        <Row gutter={[12, 12]}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <Skeleton.Input active block style={{ height: 40 }} />
            </Col>
          ))}
        </Row>
      </Card>

      <Card
        title={<Skeleton.Input active size="small" style={{ width: 160 }} />}
        styles={{ body: { paddingTop: 8 } }}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {Array.from({ length: listItems }).map((_, index) => (
            <Card key={index} size="small" type="inner">
              <Flex gap={16} vertical={variant === 'category-detail'}>
                <Skeleton active paragraph={{ rows: variant === 'category-detail' ? 2 : 1 }} />
                {variant === 'category-detail' ? (
                  <Flex gap={12} style={{ overflow: 'hidden' }}>
                    {Array.from({ length: 3 }).map((__, cardIndex) => (
                      <Skeleton.Image
                        key={cardIndex}
                        active
                        style={{ width: 168, height: 224, flexShrink: 0 }}
                      />
                    ))}
                  </Flex>
                ) : null}
              </Flex>
            </Card>
          ))}
        </Space>
      </Card>
    </Space>
  );
}
