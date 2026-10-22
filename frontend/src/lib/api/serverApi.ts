import 'server-only';

import axios, { AxiosError } from 'axios';

import { readAccessToken } from '@/lib/auth/session';
import type { ApiResponse } from '@/types';

/**
 * Server-side HTTP client for the NestJS backend.
 *
 * This is the **only** module that talks to the backend from the server
 * runtime. It is imported exclusively by route handlers and server
 * components, never by client components.
 */
export const API_BASE_URL = (
  process.env.API_BASE_URL ?? 'http://localhost:3000'
).replace(/\/$/, '');

export class BackendError extends Error {
  readonly status: number;
  readonly errors: string[];

  constructor(status: number, errors: string[]) {
    super(errors[0] ?? 'Backend error');
    this.name = 'BackendError';
    this.status = status;
    this.errors = errors;
  }
}

interface ServerRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
  withAuth?: boolean;
  formData?: FormData;
}

/**
 * Performs a request against NestJS and unwraps the `{ statusCode, data,
 * errors }` envelope. Errors are thrown as `BackendError` so callers can
 * branch on the HTTP status.
 */
export async function backendRequest<T>(
  path: string,
  options: ServerRequestOptions = {},
): Promise<T> {
  const { method = 'GET', body, params, withAuth = true, formData } = options;

  const headers: Record<string, string> = { Accept: 'application/json' };

  if (withAuth) {
    const token = await readAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let payload: unknown = body;
  if (formData) {
    payload = formData;
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  try {
    const response = await axios.request<ApiResponse<T>>({
      url: `${API_BASE_URL}${path}`,
      method,
      headers,
      data: payload,
      params,
      timeout: 20_000,
    });

    const envelope = response.data;
    return (envelope?.data ?? null) as T;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiResponse<unknown>>;
      const status = axiosError.response?.status ?? 0;
      const errors = Array.isArray(axiosError.response?.data?.errors)
        ? axiosError.response.data.errors
        : [axiosError.message];

      throw new BackendError(status, errors);
    }

    throw new BackendError(0, ['Backend request failed']);
  }
}
