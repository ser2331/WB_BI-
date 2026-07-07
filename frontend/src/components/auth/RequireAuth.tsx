import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useGetMeQuery } from '@/api/wbApi';
import { PageSkeleton } from '@/components/ui/skeletons/PageSkeleton';
import { useAuth } from '@/hooks/useAuth';

export function RequireAuth() {
  const location = useLocation();
  const { token } = useAuth();
  const { isLoading, isError } = useGetMeQuery(undefined, { skip: !token });

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (isLoading) {
    return <PageSkeleton title="Проверка сессии…" rows={2} />;
  }

  if (isError) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export function RequireAdmin() {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
