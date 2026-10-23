'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { Moon, Sun } from 'lucide-react';

import { applyTheme, writeThemeCookie, type Theme } from '@/lib/theme';
import { useT } from '@/lib/i18n/LocaleProvider';

const listeners = new Set<() => void>();

function getSnapshot(): Theme {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

function getServerSnapshot(): Theme {
  return 'light';
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function updateTheme(theme: Theme) {
  applyTheme(theme);
  writeThemeCookie(theme);
  listeners.forEach((listener) => listener());
}

/**
 * Light/dark switch.
 *
 * The choice is persisted in a cookie (`src/lib/theme.ts`); the root layout
 * reads it on the server, so there is no flash of the wrong theme.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const t = useT();
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = useCallback(() => {
    updateTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme]);

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === 'dark' ? t('Включить светлую тему') : t('Включить тёмную тему')}
      aria-pressed={theme === 'dark'}
      className={
        className ??
        'flex h-9 w-9 items-center justify-center rounded-control text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground'
      }
    >
      {theme === 'dark' ? (
        <Sun className="h-4.5 w-4.5" aria-hidden="true" />
      ) : (
        <Moon className="h-4.5 w-4.5" aria-hidden="true" />
      )}
    </button>
  );
}
