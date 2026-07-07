import { type FormEvent, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useLoginMutation } from '@/api/wbApi';
import { getErrorMessage } from '@/api/error';
import { Card, ErrorMsg, Field } from '@/components/dashboard/dashboard.styles';
import { Button } from '@/components/layout/Layout.styles';
import { useAuth } from '@/hooks/useAuth';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials } from '@/store/authSlice';

const LoginShell = styled.div`
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: var(--color-bg);
`;

const LoginCard = styled(Card)`
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 700;
  margin: 0;
`;

const Subtitle = styled.p`
  margin: 0;
  color: var(--color-text-muted);
  font-size: 14px;
  line-height: 1.5;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [login, { isLoading }] = useLoginMutation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const state = location.state as { from?: string } | null;
  const from = state?.from && state.from !== '/login' ? state.from : '/';

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');

    try {
      const result = await login({ username: username.trim(), password }).unwrap();
      dispatch(
        setCredentials({
          token: result.access_token,
          user: result.user,
        })
      );
      void navigate(from, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, 'Не удалось войти'));
    }
  };

  return (
    <LoginShell>
      <LoginCard>
        <div>
          <Title>WB BI</Title>
          <Subtitle>Войдите как администратор или пользователь</Subtitle>
        </div>

        {error && <ErrorMsg>{error}</ErrorMsg>}

        <Form onSubmit={onSubmit}>
          <Field>
            Логин
            <input
              type="text"
              name="username"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </Field>
          <Field>
            Пароль
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Field>
          <Button type="submit" $variant="primary" $fullWidth disabled={isLoading}>
            {isLoading ? 'Вход…' : 'Войти'}
          </Button>
        </Form>
      </LoginCard>
    </LoginShell>
  );
}
