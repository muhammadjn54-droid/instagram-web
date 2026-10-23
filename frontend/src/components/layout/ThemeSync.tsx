'use client';

import { useEffect } from 'react';

import { applyTheme, readThemeCookie, writeThemeCookie } from '@/lib/theme';

/**
 * Runs once after the first render.
 *
 * - A visitor without a saved choice gets the operating system preference
 *   (the server cannot know it on the very first request).
 * - A choice saved by an older version in `localStorage` is migrated to the cookie.
 */
export function ThemeSync() {
  useEffect(() => {
    if (readThemeCookie()) return;

    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem('ig-theme');
    } catch {
      // storage can be blocked — ignore
    }

    if (stored === 'dark' || stored === 'light') {
      writeThemeCookie(stored);
      applyTheme(stored);
      return;
    }

    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      applyTheme('dark');
    }
  }, []);

  return null;
}
