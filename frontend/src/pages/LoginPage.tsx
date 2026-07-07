import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useLoginMutation } from '@/api/wbApi';
import { getErrorMessage } from '@/api/error';
import { useAuth } from '@/hooks/useAuth';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials } from '@/store/authSlice';
import { Alert, Button, Card, Flex, Form, Input, Typography } from 'antd';

export function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [login, { isLoading }] = useLoginMutation();
  const [form] = Form.useForm();

  const state = location.state as { from?: string } | null;
  const from = state?.from && state.from !== '/login' ? state.from : '/';

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const onFinish = async (values: { username: string; password: string }) => {
    try {
      const result = await login({
        username: values.username.trim(),
        password: values.password,
      }).unwrap();
      dispatch(
        setCredentials({
          token: result.access_token,
          user: result.user,
        })
      );
      void navigate(from, { replace: true });
    } catch (err) {
      form.setFields([
        {
          name: 'password',
          errors: [getErrorMessage(err, 'Не удалось войти')],
        },
      ]);
    }
  };

  return (
    <Flex align="center" justify="center" style={{ minHeight: '100dvh', padding: 24 }}>
      <Card style={{ width: '100%', maxWidth: 400 }}>
        <Typography.Title level={3} style={{ marginTop: 0 }}>
          WB BI
        </Typography.Title>
        <Typography.Paragraph type="secondary">
          Войдите как администратор или пользователь
        </Typography.Paragraph>

        <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false}>
          <Form.Item
            label="Логин"
            name="username"
            rules={[{ required: true, message: 'Введите логин' }]}
          >
            <Input autoComplete="username" size="large" />
          </Form.Item>

          <Form.Item
            label="Пароль"
            name="password"
            rules={[{ required: true, message: 'Введите пароль' }]}
          >
            <Input.Password autoComplete="current-password" size="large" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" block size="large" loading={isLoading}>
              Войти
            </Button>
          </Form.Item>
        </Form>

        <Alert
          type="info"
          showIcon
          style={{ marginTop: 16 }}
          message="Учётные записи задаются в переменных окружения бэкенда"
        />
      </Card>
    </Flex>
  );
}
