import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button, Card, Empty, Typography } from 'antd';

interface Props {
  description: string;
}

export function EmptyDataState({ description }: Props) {
  const { isAdmin } = useAuth();

  return (
    <Card>
      <Empty description={description}>
        {isAdmin ? (
          <Link to="/import">
            <Button type="primary">Перейти к импорту</Button>
          </Link>
        ) : (
          <Typography.Text type="secondary">
            Обратитесь к администратору для загрузки данных
          </Typography.Text>
        )}
      </Empty>
    </Card>
  );
}
