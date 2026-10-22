import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { ACCESS_COOKIE } from '@/lib/auth/cookies';

/**
 * Route guard.
 *
 * Next.js 16 renamed the `middleware.ts` convention to `proxy.ts`. The
 * guard only checks the **presence** of the session cookie — the token is
 * validated by the backend on every request through the BFF proxy, so the
 * proxy never has to trust a decoded payload.
 *
 * Public routes: `/login`, `/register`, `/forgot-password`,
 * `/reset-password`.
 */

const PUBLIC_PATHS = ['/login', '/register', '/forgot-password', '/reset-password'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(ACCESS_COOKIE)?.value);

  const isPublic = PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  if (isPublic) {
    if (hasSession) {
      return NextResponse.redirect(new URL('/feed', request.url));
    }
    return NextResponse.next();
  }

  if (!hasSession) {
    const redirect = `${pathname}${request.nextUrl.search}`;
    const url = new URL('/login', request.url);
    if (redirect && redirect !== '/') url.searchParams.set('redirect', redirect);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Everything except:
     *  - the API routes (the BFF proxy and the session endpoints),
     *  - Next.js internals and build output,
     *  - static files and the media uploaded by the backend.
     */
    '/((?!api|_next/static|_next/image|favicon.ico|uploads|images|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
