export type ThemeMode = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'wb_bi_theme';

export const brandPrimary = '#7c5cfc';

export const cssVarsByTheme: Record<ThemeMode, Record<string, string>> = {
  dark: {
    '--color-bg': '#0f1117',
    '--color-bg-secondary': '#1a1d27',
    '--color-bg-card': '#222633',
    '--color-border': '#2e3345',
    '--color-text': '#e8eaed',
    '--color-text-muted': '#8b92a8',
    '--color-primary': brandPrimary,
    '--color-primary-hover': '#6a4ae8',
    '--color-success': '#34d399',
    '--color-warning': '#fbbf24',
    '--color-danger': '#f87171',
    '--color-accent': '#38bdf8',
    '--scrollbar-track': '#1a1d27',
    '--scrollbar-thumb': '#3d4358',
    '--scrollbar-thumb-hover': '#5c4fd4',
    '--shadow': '0 4px 24px rgba(0, 0, 0, 0.3)',
  },
  light: {
    '--color-bg': '#f0f2f5',
    '--color-bg-secondary': '#ffffff',
    '--color-bg-card': '#ffffff',
    '--color-border': '#e2e5ec',
    '--color-text': '#1a1d27',
    '--color-text-muted': '#5c6478',
    '--color-primary': brandPrimary,
    '--color-primary-hover': '#6a4ae8',
    '--color-success': '#059669',
    '--color-warning': '#d97706',
    '--color-danger': '#dc2626',
    '--color-accent': '#0284c7',
    '--scrollbar-track': '#e8eaef',
    '--scrollbar-thumb': '#c5cad6',
    '--scrollbar-thumb-hover': '#7c5cfc',
    '--shadow': '0 4px 24px rgba(15, 17, 23, 0.08)',
  },
};

export function loadThemeMode(): ThemeMode {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    /* ignore */
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function applyThemeMode(mode: ThemeMode) {
  const root = document.documentElement;
  root.setAttribute('data-theme', mode);
  const vars = cssVarsByTheme[mode];
  for (const [key, value] of Object.entries(vars)) {
    root.style.setProperty(key, value);
  }
}
