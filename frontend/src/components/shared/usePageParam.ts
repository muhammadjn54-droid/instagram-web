'use client';

import { useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

/**
 * Reads the current page number from the query string.
 *
 * The page is part of the URL, so every list view is shareable and the
 * browser back button works as expected.
 */
export function usePageParam(): [number, (page: number) => void] {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const raw = Number.parseInt(searchParams.get('page') ?? '1', 10);
  const page = Number.isFinite(raw) && raw > 0 ? raw : 1;

  const setPage = useCallback(
    (next: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', String(next));
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams],
  );

  return [page, setPage];
}
