import { theme as antdThemeApi, type ThemeConfig } from 'antd';
import { brandPrimary, type ThemeMode } from './tokens';

export function buildAntdTheme(mode: ThemeMode): ThemeConfig {
  const isDark = mode === 'dark';

  return {
    algorithm: isDark ? antdThemeApi.darkAlgorithm : antdThemeApi.defaultAlgorithm,
    token: {
      colorPrimary: brandPrimary,
      borderRadius: 12,
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      colorBgLayout: isDark ? '#0f1117' : '#f0f2f5',
      colorBgContainer: isDark ? '#222633' : '#ffffff',
      colorBgElevated: isDark ? '#1a1d27' : '#ffffff',
      colorBorder: isDark ? '#2e3345' : '#e2e5ec',
    },
    components: {
      Layout: {
        siderBg: isDark ? '#1a1d27' : '#ffffff',
        headerBg: isDark ? '#1a1d27' : '#ffffff',
        bodyBg: isDark ? '#0f1117' : '#f0f2f5',
        triggerBg: isDark ? '#222633' : '#f5f6f8',
      },
      Card: {
        borderRadiusLG: 16,
      },
      Menu: {
        darkItemBg: 'transparent',
        darkSubMenuItemBg: 'transparent',
      },
    },
  };
}
