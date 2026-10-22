import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig } from 'axios';

import { API_PROXY_PREFIX } from './endpoints';
import type { ApiErrorShape, ApiResponse } from '@/types';

/**
 * Browser-side Axios instance.
 *
 * The base URL is the Next.js BFF proxy, never the NestJS origin: the access
 * token lives in an httpOnly cookie and is attached by the proxy, so no
 * credential is ever readable by JavaScript.
 *
 * The instance is responsible for three things and nothing else:
 *  1. a request timeout,
 *  2. unwrapping the `{ statusCode, data, errors }` envelope,
 *  3. normalising every failure into a predictable `ApiErrorShape`.
 */
export const browserApi: AxiosInstance = axios.create({
  baseURL: API_PROXY_PREFIX,
  timeout: 20_000,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
  },
});

/**
 * Axios instance for the Next.js session endpoints (`/api/session*`).
 *
 * These are the only endpoints that may write the httpOnly session cookie,
 * therefore they live on the Next.js origin and not behind the proxy.
 */
export const sessionApi: AxiosInstance = axios.create({
  baseURL: '',
  timeout: 20_000,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
  },
});

/** Turns an unknown rejection into a predictable, human readable error. */
export function toApiError(error: unknown): ApiErrorShape {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiResponse<unknown>>;
    const status = axiosError.response?.status ?? 0;
    const payload = axiosError.response?.data;

    const errors = Array.isArray(payload?.errors)
      ? payload.errors.filter((item): item is string => typeof item === 'string')
      : [];

    const message =
      errors[0] ??
      (status === 0
        ? 'Сервер недоступен. Проверьте, что бэкенд запущен.'
        : `Ошибка запроса (${status})`);

    return { status, message, errors: errors.length ? errors : [message] };
  }

  if (error instanceof Error) {
    return { status: 0, message: error.message, errors: [error.message] };
  }

  return {
    status: 0,
    message: 'Непредвиденная ошибка',
    errors: ['Непредвиденная ошибка'],
  };
}

/**
 * Response interceptor that unwraps the backend envelope.
 *
 * `response.data` is `{ statusCode, data, errors }`; consumers of this module
 * always receive the payload (`data`) directly. When the backend answers with
 * a non-envelope body (e.g. a raw file or an unexpected shape) the original
 * payload is passed through untouched rather than silently dropped.
 */
browserApi.interceptors.response.use(
  (response) => {
    const payload = response.data as ApiResponse<unknown> | undefined;

    if (
      payload &&
      typeof payload === 'object' &&
      'statusCode' in payload &&
      'data' in payload &&
      'errors' in payload
    ) {
      response.data = payload.data;
    }

    return response;
  },
  (error: unknown) => {
    const normalized = toApiError(error);
    notifyUnauthorized(normalized);
    return Promise.reject(normalized);
  },
);

sessionApi.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(toApiError(error)),
);

/**
 * Emitted when the backend answers `401`.
 *
 * `SessionGuard` (a client component mounted by the app shell) listens to
 * this event and sends the visitor to the login screen. Only genuine
 * authentication failures trigger it — a `403` or a `404` never does.
 */
export const UNAUTHORIZED_EVENT = 'ig:unauthorized';

function notifyUnauthorized(error: ApiErrorShape): void {
  if (error.status !== 401) return;
  if (typeof window === 'undefined') return;

  window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT));
}

/**
 * Builds a `multipart/form-data` body.
 *
 * The browser must set the multipart boundary itself, therefore
 * `Content-Type` is intentionally **not** set here — Axios detects the
 * `FormData` instance and lets the runtime add the correct header.
 */
export function createFormData(
  fields: Record<string, string | number | boolean | undefined>,
  files: Array<{ field: string; file: File }> = [],
): FormData {
  const formData = new FormData();

  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined) continue;
    formData.append(key, String(value));
  }

  for (const { field, file } of files) {
    formData.append(field, file, file.name);
  }

  return formData;
}

export type { AxiosRequestConfig };
