'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { UNAUTHORIZED_EVENT, sessionApi } from '@/lib/api/axios';

/**
 * Global handler for `401` responses.
 *
 * The Axios layer dispatches `ig:unauthorized` whenever the backend rejects
 * the session. The guard then clears the client cache and sends the user to
 * the login page, keeping the original path as the `redirect` query so the
 * user can continue where they left off.
 *
 * The stale session cookie is removed first: `proxy.ts` redirects every visit
 * of `/login` back to the feed while a cookie exists, which would otherwise
 * trap an expired session in a redirect loop.
 */
export function SessionGuard() {
  const router = useRouter();

  useEffect(() => {
    let handling = false;

    const handleUnauthorized = async () => {
      if (handling) return;
      handling = true;

      const redirect = window.location.pathname + window.location.search;

      try {
        await sessionApi.delete('/api/session');
      } catch {
        // Even if the cookie could not be cleared, still send the user to the login screen.
      }

      router.replace(`/login?redirect=${encodeURIComponent(redirect)}`);
    };

    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
  }, [router]);

  return null;
}
