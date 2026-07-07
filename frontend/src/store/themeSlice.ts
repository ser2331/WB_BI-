import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { applyThemeMode, loadThemeMode, THEME_STORAGE_KEY, type ThemeMode } from '@/theme/tokens';

const initialMode = loadThemeMode();
applyThemeMode(initialMode);

export const themeSlice = createSlice({
  name: 'theme',
  initialState: { mode: initialMode },
  reducers: {
    setThemeMode(state, action: PayloadAction<ThemeMode>) {
      state.mode = action.payload;
      applyThemeMode(action.payload);
      localStorage.setItem(THEME_STORAGE_KEY, action.payload);
    },
  },
});

export const { setThemeMode } = themeSlice.actions;
