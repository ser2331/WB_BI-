import { NavLink as RouterNavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { wbApi } from '@/api/wbApi';
import { useAuth } from '@/hooks/useAuth';
import { useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/authSlice';
import {
  AppShell,
  Sidebar,
  Logo,
  Nav,
  NavLink,
  BottomNav,
  BottomNavItem,
  Main,
  Header,
  PageTitle,
  Content,
  HeaderActions,
  UserBadge,
  Button,
} from './Layout.styles';

const allNavItems = [
  { to: '/', label: 'Категории', icon: '📂', shortTitle: 'Категории', adminOnly: false },
  { to: '/import', label: 'Импорт', icon: '📁', shortTitle: 'Импорт', adminOnly: true },
];

const pageTitles: Record<string, string> = {
  '/': 'Категории',
  '/import': 'Импорт данных',
};

const roleLabels = {
  admin: 'Администратор',
  user: 'Пользователь',
} as const;

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, isAdmin } = useAuth();

  const navItems = allNavItems.filter((item) => !item.adminOnly || isAdmin);

  const pageTitle = location.pathname.startsWith('/category/')
    ? decodeURIComponent(location.pathname.replace('/category/', ''))
    : (pageTitles[location.pathname] ?? 'WB BI');

  const handleLogout = () => {
    dispatch(logout());
    dispatch(wbApi.util.resetApiState());
    void navigate('/login', { replace: true });
  };

  return (
    <AppShell>
      <Sidebar>
        <Logo>
          <span>WB BI</span>
        </Logo>
        <Nav>
          {navItems.map((item) => (
            <RouterNavLink key={item.to} to={item.to} end={item.to === '/'}>
              {({ isActive }) => (
                <NavLink as="span" $active={isActive}>
                  {item.icon} {item.label}
                </NavLink>
              )}
            </RouterNavLink>
          ))}
        </Nav>
      </Sidebar>

      <Main>
        <Header>
          <PageTitle>{pageTitle}</PageTitle>
          <HeaderActions>
            {user && (
              <UserBadge>
                <strong>{user.username}</strong> · {roleLabels[user.role]}
              </UserBadge>
            )}
            <Button type="button" onClick={handleLogout}>
              Выйти
            </Button>
          </HeaderActions>
        </Header>
        <Content>
          <Outlet />
        </Content>
      </Main>

      <BottomNav>
        {navItems.map((item) => (
          <RouterNavLink key={item.to} to={item.to} end={item.to === '/'}>
            {({ isActive }) => (
              <BottomNavItem as="span" $active={isActive}>
                <span>{item.icon}</span>
                <span>{item.shortTitle}</span>
              </BottomNavItem>
            )}
          </RouterNavLink>
        ))}
      </BottomNav>
    </AppShell>
  );
}
