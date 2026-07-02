import { NavLink as RouterNavLink, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api } from '@/api/client';
import type { WBConnectionStatus } from '@/types/api';
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
  HeaderActions,
  Content,
  StatusBadge,
  Button,
} from './Layout.styles';

const navItems = [
  { to: '/', label: 'Дашборд', icon: '📊', shortTitle: 'Дашборд' },
  { to: '/settings', label: 'Настройки', icon: '⚙️', shortTitle: 'Настройки' },
];

const pageTitles: Record<string, string> = {
  '/': 'Дашборд',
  '/settings': 'Настройки',
};

export function Layout() {
  const [wbStatus, setWbStatus] = useState<WBConnectionStatus | null>(null);
  const location = useLocation();
  const pageTitle = pageTitles[location.pathname] ?? 'Аналитика Wildberries';

  useEffect(() => {
    api.getWBStatus().then(setWbStatus).catch(() => null);
  }, [location.pathname]);

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
            {wbStatus && (
              <StatusBadge $connected={wbStatus.connected} title={wbStatus.seller_name ?? undefined}>
                {wbStatus.connected
                  ? `${wbStatus.is_mock ? '🧪 ' : ''}${wbStatus.seller_name || 'Подключено'}`
                  : 'Не подключено'}
              </StatusBadge>
            )}
            {!wbStatus?.connected && (
              <RouterNavLink to="/settings">
                <Button $variant="primary" as="span">
                  Подключить
                </Button>
              </RouterNavLink>
            )}
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
