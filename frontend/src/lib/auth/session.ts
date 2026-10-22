import 'server-only';

import { cookies } from 'next/headers';

import { decodeJwt } from './jwt';
import { ACCESS_COOKIE, REFRESH_COOKIE, USER_COOKIE } from './cookies';
import type { SessionUser } from '@/types';

/**
 * Server-side session storage.
 *
 * The NestJS backend only speaks `Authorization: Bearer <token>`; it has no
 * cookie support of its own. To keep the JWT out of reach of JavaScript the
 * Next.js server stores it in an **httpOnly** cookie and attaches it to the
 * upstream request in `src/app/api/backend/[...path]/route.ts`.
 */

export { ACCESS_COOKIE, REFRESH_COOKIE, USER_COOKIE };

const ONE_DAY_SECONDS = 60 * 60 * 24;

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge,
  };
}

/** Reads the current session, or `null` when the visitor is anonymous. */
export async function readSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(ACCESS_COOKIE)?.value;
  const payload = decodeJwt(token);

  if (!payload) return null;

  const storedUser = readStoredUser(store.get(USER_COOKIE)?.value);

  return {
    id: payload.sub,
    userName: payload.userName,
    fullName: storedUser?.fullName ?? payload.userName,
    email: payload.email,
    avatar: storedUser?.avatar ?? '',
    expiresAt: payload.exp,
  };
}

/** Reads the cached user profile that was stored next to the token. */
function readStoredUser(
  raw: string | undefined,
): { fullName?: string; avatar?: string } | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as { fullName?: string; avatar?: string };
    return typeof parsed === 'object' && parsed !== null ? parsed : null;
  } catch {
    return null;
  }
}

/** Stores a fresh access/refresh pair after a successful login. */
export async function writeSession(auth: {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: { id: number; userName: string; fullName: string; email: string; avatar: string };
}): Promise<void> {
  const store = await cookies();

  store.set(ACCESS_COOKIE, auth.accessToken, cookieOptions(auth.expiresAt));
  store.set(REFRESH_COOKIE, auth.refreshToken, cookieOptions(ONE_DAY_SECONDS * 7));
  store.set(
    USER_COOKIE,
    JSON.stringify({
      fullName: auth.user.fullName,
      avatar: auth.user.avatar ?? '',
    }),
    cookieOptions(auth.expiresAt),
  );
}

/** Removes every credential from the browser. */
export async function clearSession(): Promise<void> {
  const store = await cookies();

  store.delete(ACCESS_COOKIE);
  store.delete(REFRESH_COOKIE);
  store.delete(USER_COOKIE);
}

/** Raw access token, used by the server-side API client and the BFF proxy. */
export async function readAccessToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(ACCESS_COOKIE)?.value;
}

/** Raw refresh token, used by the refresh flow. */
export async function readRefreshToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(REFRESH_COOKIE)?.value;
}
