import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { AUTH_STORAGE_KEY } from '@/store/authSlice';

const API_HOST = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
export const API_BASE_URL = API_HOST ? `${API_HOST}/api` : '/api';

function readStoredToken(): string | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { token?: string };
    return parsed.token ?? null;
  } catch {
    return null;
  }
}

export const baseQueryWithAuth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> =
  fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = readStoredToken();
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  });
