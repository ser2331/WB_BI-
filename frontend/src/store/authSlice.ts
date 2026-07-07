import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthUser } from '@/types/auth';

export const AUTH_STORAGE_KEY = 'wb_bi_auth';

interface StoredAuth {
  token: string;
  user: AuthUser;
}

export interface AuthState {
  token: string | null;
  user: AuthUser | null;
}

function loadAuthFromStorage(): AuthState {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return { token: null, user: null };
    const parsed = JSON.parse(raw) as StoredAuth;
    if (!parsed.token || !parsed.user?.username || !parsed.user?.role) {
      return { token: null, user: null };
    }
    return { token: parsed.token, user: parsed.user };
  } catch {
    return { token: null, user: null };
  }
}

function saveAuthToStorage(state: AuthState) {
  if (state.token && state.user) {
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({ token: state.token, user: state.user } satisfies StoredAuth)
    );
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

const initialState: AuthState = loadAuthFromStorage();

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<StoredAuth>) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      saveAuthToStorage(state);
    },
    logout(state) {
      state.token = null;
      state.user = null;
      saveAuthToStorage(state);
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
