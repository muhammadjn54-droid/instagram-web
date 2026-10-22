'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { UNAUTHORIZED_EVENT } from '@/lib/api/axios';

/**
 * Global handler for `401` responses.
 *
 * The Axios layer dispatches `ig:unauthorized` whenever the backend rejects
 * the session. The guard then clears the client cache and sends the user to
 * the login page, keeping the original path as the `redirect` query so the
 * user can continue where they left off.
 */
export function SessionGuard() {
  const router = useRouter();

  useEffect(() => {
    const handleUnauthorized = () => {
      const redirect = window.location.pathname + window.location.search;
      router.replace(`/login?redirect=${encodeURIComponent(redirect)}`);
    };

    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
  }, [router]);

  return null;
}
