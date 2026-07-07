import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useGetMeQuery } from '@/api/wbApi';
import { PageScroll } from '@/components/layout/Layout.styles';
import { LoadingState, Skeleton } from '@/components/dashboard/dashboard.styles';
import { useAuth } from '@/hooks/useAuth';

function AuthLoader() {
  return (
    <PageScroll>
      <LoadingState>
        <span>Проверка сессии…</span>
        <Skeleton $h={80} />
      </LoadingState>
    </PageScroll>
  );
}

export function RequireAuth() {
  const location = useLocation();
  const { token } = useAuth();
  const { isLoading, isError } = useGetMeQuery(undefined, { skip: !token });

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (isLoading) return <AuthLoader />;
  if (isError) return <Navigate to="/login" replace />;

  return <Outlet />;
}

export function RequireAdmin() {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
