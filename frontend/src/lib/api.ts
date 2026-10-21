import { ApiResponse } from '../types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Universal API helper for communicating with the NestJS backend
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const headers = new Headers(options.headers || {});

  // Do not set Content-Type if sending FormData (browser sets boundary automatically)
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Attach JWT Bearer token if provided
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const resJson: ApiResponse<T> = await response.json();

  if (!response.ok || (resJson.errors && resJson.errors.length > 0)) {
    const errorMsg =
      Array.isArray(resJson.errors) && resJson.errors.length > 0
        ? resJson.errors.join(', ')
        : (resJson as any).message || 'Server error';
    throw new Error(errorMsg);
  }

  return resJson.data as T;
}

/**
 * Helper to get full URL for images uploaded to backend
 */
export function getMediaUrl(path?: string | null): string {
  if (!path) return '/avatar-placeholder.png';
  if (path.startsWith('http')) return path;
  return `${BASE_URL}${path}`;
}
