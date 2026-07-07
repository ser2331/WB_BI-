import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

export function getErrorMessage(error: unknown, fallback = 'Ошибка запроса'): string {
  if (!error) return fallback;

  if (typeof error === 'object' && error !== null && 'data' in error) {
    const data = (error as FetchBaseQueryError).data as
      { detail?: string | Array<{ msg?: string }> } | undefined;
    const detail = data?.detail;
    if (Array.isArray(detail)) {
      return (
        detail
          .map((d) => d.msg)
          .filter(Boolean)
          .join(', ') || fallback
      );
    }
    if (typeof detail === 'string' && detail) return detail;
  }

  if (error instanceof Error && error.message) return error.message;

  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string' && message) return message;
  }

  return fallback;
}
