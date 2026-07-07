import { NavLink as RouterNavLink, Outlet, useLocation } from 'react-router-dom';
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
} from './Layout.styles';

const navItems = [
  { to: '/', label: 'Категории', icon: '📂', shortTitle: 'Категории' },
  { to: '/import', label: 'Импорт', icon: '📁', shortTitle: 'Импорт' },
];

const pageTitles: Record<string, string> = {
  '/': 'Категории',
  '/import': 'Импорт данных',
};

export function Layout() {
  const location = useLocation();
  const pageTitle = location.pathname.startsWith('/category/')
    ? decodeURIComponent(location.pathname.replace('/category/', ''))
    : (pageTitles[location.pathname] ?? 'WB BI');

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
