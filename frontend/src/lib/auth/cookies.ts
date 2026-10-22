/**
 * Names of the httpOnly cookies that carry the session.
 *
 * The module is intentionally free of any server-only import so that it can
 * be used from `src/proxy.ts` as well as from the server runtime.
 */
export const ACCESS_COOKIE = 'ig_access';
export const REFRESH_COOKIE = 'ig_refresh';
export const USER_COOKIE = 'ig_user';
