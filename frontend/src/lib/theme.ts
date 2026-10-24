/**
 * Theme persistence.
 *
 * The choice lives in a plain cookie (readable by the server, so the first
 * paint already has the right theme) and is applied as the `dark` class on
 * `<html>`.
 */
export const THEME_COOKIE = 'ig-theme';

export type Theme = 'light' | 'dark';

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export function readThemeCookie(): Theme | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${THEME_COOKIE}=(light|dark)`));
  return (match?.[1] as Theme | undefined) ?? null;
}

export function writeThemeCookie(theme: Theme): void {
  document.cookie = `${THEME_COOKIE}=${theme}; path=/; max-age=${ONE_YEAR_SECONDS}; samesite=lax`;
}

export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.style.colorScheme = theme;
}
