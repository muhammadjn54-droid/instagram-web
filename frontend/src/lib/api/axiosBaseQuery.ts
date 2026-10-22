import type { BaseQueryFn } from '@reduxjs/toolkit/query';
import type { Method } from 'axios';

import { browserApi, sessionApi, toApiError } from './axios';
import type { ApiError } from '@/types';

/**
 * Request descriptor accepted by the RTK Query base query.
 *
 * A plain string is treated as `GET <url>`; the object form allows any
 * verb, a body and query parameters without creating a second HTTP client.
 */
export interface ApiRequestDescriptor {
  url: string;
  method?: Method;
  body?: unknown;
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
  /**
   * `backend` (default) routes through the Next.js proxy to NestJS.
   * `session` routes to the Next.js session endpoints (`/api/session*`),
   * which are the only place where the httpOnly cookie is written.
   */
  target?: 'backend' | 'session';
}

export type ApiRequest = string | ApiRequestDescriptor;

/**
 * RTK Query base query built on the shared Axios instances.
 *
 * The generic parameters of `BaseQueryFn` are
 * `<Args, Result, Error, DefinitionExtraOptions, Meta>`:
 *  - `Args`       — every request is described by {@link ApiRequestDescriptor},
 *  - `Result`     — `unknown`, each endpoint declares its own payload type,
 *  - `Error`      — {@link ApiError}, always human readable,
 *  - `ExtraOpts`  — empty, the endpoints do not use per-request options,
 *  - `Meta`       — empty object, no endpoint specific metadata.
 */
export type ApiBaseQuery = BaseQueryFn<
  ApiRequest,
  unknown,
  ApiError,
  Record<never, never>,
  Record<string, never>
>;

function isDescriptor(request: ApiRequest): request is ApiRequestDescriptor {
  return typeof request !== 'string';
}

/**
 * RTK Query base query built on the shared Axios instances.
 *
 * Responsibilities:
 *  - perform the HTTP call through the one configured Axios instance,
 *  - unwrap the backend envelope (done by the Axios response interceptor),
 *  - convert every failure into `{ status, data, message }` so that
 *    `isError` / `error` in the generated hooks are always meaningful.
 */
export const axiosBaseQuery: ApiBaseQuery = async (args, api) => {
  const { signal } = api;

  const descriptor: ApiRequestDescriptor = isDescriptor(args)
    ? args
    : { url: args };

  const instance = descriptor.target === 'session' ? sessionApi : browserApi;

  const config = {
    url: descriptor.url,
    method: descriptor.method ?? ('GET' as Method),
    data: descriptor.body,
    params: descriptor.params,
    headers: descriptor.headers,
    signal,
  };

  try {
    const response = await instance.request(config);
    return { data: response.data };
  } catch (error) {
    const normalized = toApiError(error);
    return {
      error: {
        status: normalized.status || 'FETCH_ERROR',
        message: normalized.message,
        errors: normalized.errors,
      },
    };
  }
};
