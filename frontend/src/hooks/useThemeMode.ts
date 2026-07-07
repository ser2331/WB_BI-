import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setThemeMode } from '@/store/themeSlice';
import type { ThemeMode } from '@/theme/tokens';

export function useThemeMode() {
  const mode = useAppSelector((state) => state.theme.mode);
  const dispatch = useAppDispatch();

  return {
    mode,
    isDark: mode === 'dark',
    setMode: (next: ThemeMode) => dispatch(setThemeMode(next)),
  };
}
