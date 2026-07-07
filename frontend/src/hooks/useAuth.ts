import { useAppSelector } from '@/store/hooks';

export function useAuth() {
  const { token, user } = useAppSelector((state) => state.auth);
  return {
    token,
    user,
    isAuthenticated: Boolean(token && user),
    isAdmin: user?.role === 'admin',
  };
}
