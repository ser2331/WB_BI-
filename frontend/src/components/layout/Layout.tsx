import {
  BarChartOutlined,
  DatabaseOutlined,
  FolderOpenOutlined,
  LogoutOutlined,
  MoonOutlined,
  SunOutlined,
  TableOutlined,
} from '@ant-design/icons';
import { Button, Layout as AntLayout, Menu, Space, Switch, Tag, Typography, theme } from 'antd';
import { NavLink as RouterNavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { wbApi } from '@/api/wbApi';
import { layoutClass } from '@/components/dashboard/dashboard.layout';
import { useAuth } from '@/hooks/useAuth';
import { useThemeMode } from '@/hooks/useThemeMode';
import { useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/authSlice';
import './layout.scss';

const { Header, Sider, Content } = AntLayout;

const allNavItems = [
  { key: '/', label: 'Категории', icon: <TableOutlined />, shortTitle: 'Категории', adminOnly: false },
  {
    key: '/analytics',
    label: 'Дашборд',
    icon: <BarChartOutlined />,
    shortTitle: 'Дашборд',
    adminOnly: false,
  },
  {
    key: '/data',
    label: 'Таблица',
    icon: <DatabaseOutlined />,
    shortTitle: 'Таблица',
    adminOnly: false,
  },
  {
    key: '/import',
    label: 'Импорт',
    icon: <FolderOpenOutlined />,
    shortTitle: 'Импорт',
    adminOnly: true,
  },
];

const pageTitles: Record<string, string> = {
  '/': 'Категории',
  '/analytics': 'Аналитика',
  '/data': 'Таблица данных',
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
  const { token } = theme.useToken();
  const { user, isAdmin } = useAuth();
  const { isDark, setMode } = useThemeMode();

  const navItems = allNavItems.filter((item) => !item.adminOnly || isAdmin);
  const selectedKey = navItems.find((item) =>
    item.key === '/' ? location.pathname === '/' : location.pathname.startsWith(item.key)
  )?.key;

  const pageTitle = location.pathname.startsWith('/category/')
    ? decodeURIComponent(location.pathname.replace('/category/', ''))
    : (pageTitles[location.pathname] ?? 'WB BI');

  const handleLogout = () => {
    dispatch(logout());
    dispatch(wbApi.util.resetApiState());
    void navigate('/login', { replace: true });
  };

  return (
    <AntLayout className="app-shell">
      <Sider width={240} theme={isDark ? 'dark' : 'light'} className="desktop-sider">
        <div className="logo">
          <span>WB BI</span>
        </div>
        <Menu
          mode="inline"
          selectedKeys={selectedKey ? [selectedKey] : []}
          onClick={({ key }) => void navigate(key)}
          items={navItems.map((item) => ({
            key: item.key,
            icon: item.icon,
            label: item.label,
          }))}
          style={{ borderInlineEnd: 0, background: 'transparent' }}
        />
      </Sider>

      <AntLayout>
        <Header className="app-header" style={{ background: token.colorBgContainer }}>
          <Typography.Title level={4} style={{ margin: 0, fontSize: 'clamp(17px, 2vw, 22px)' }}>
            {pageTitle}
          </Typography.Title>

          <Space wrap align="center">
            <Space size={8}>
              <SunOutlined style={{ color: isDark ? token.colorTextSecondary : token.colorPrimary }} />
              <Switch
                checked={isDark}
                onChange={(checked) => setMode(checked ? 'dark' : 'light')}
                checkedChildren={<MoonOutlined />}
                unCheckedChildren={<SunOutlined />}
                aria-label="Переключить тему"
              />
              <MoonOutlined style={{ color: isDark ? token.colorPrimary : token.colorTextSecondary }} />
            </Space>

            {user ? (
              <Tag color="processing">
                {user.username} · {roleLabels[user.role]}
              </Tag>
            ) : null}

            <Button icon={<LogoutOutlined />} onClick={handleLogout}>
              Выйти
            </Button>
          </Space>
        </Header>

        <Content className="main-content">
          <Outlet />
        </Content>
      </AntLayout>

      <nav className={layoutClass.mobileBottomNav}>
        {navItems.map((item) => (
          <RouterNavLink key={item.key} to={item.key} end={item.key === '/'} style={{ flex: 1 }}>
            {({ isActive }) => (
              <span
                className={
                  isActive ? layoutClass.mobileBottomNavItemActive : layoutClass.mobileBottomNavItem
                }
              >
                <span style={{ fontSize: 20 }}>{item.icon}</span>
                <span>{item.shortTitle}</span>
              </span>
            )}
          </RouterNavLink>
        ))}
      </nav>
    </AntLayout>
  );
}
