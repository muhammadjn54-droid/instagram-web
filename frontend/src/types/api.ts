/**
 * Transport-level types.
 *
 * Every NestJS endpoint answers with the same envelope, produced by
 * `ResponseInterceptor` (`backend/src/common/interceptors/response.interceptor.ts`)
 * and shaped by `ApiResponse<T>` (`backend/src/common/responses/api-response.ts`).
 *
 * Errors are produced by `HttpExceptionFilter`
 * (`backend/src/common/filters/http-exception.filter.ts`), which always returns
 * `{ statusCode, data: null, errors: string[] }`.
 */
export interface ApiResponse<T> {
  statusCode: number;
  data: T | null;
  errors: string[] | null;
}

/** Pagination envelope used by every list endpoint. */
export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginationQuery {
  pageNumber?: number;
  pageSize?: number;
}

/** Normalised error shape produced by the Axios/RTK Query layer. */
export interface ApiErrorShape {
  status: number;
  message: string;
  errors: string[];
}

/**
 * Error object exposed by every RTK Query hook (`error` / `isError`).
 *
 * `status` is the HTTP code (`404`, `500`, …) or `'FETCH_ERROR'` when the
 * request never reached the server. `message` is always a human readable
 * sentence that can be rendered as-is.
 */
export interface ApiError {
  status: number | string;
  message: string;
  errors: string[];
}
