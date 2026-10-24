import { EN } from './en';

/**
 * Translation core, shared by the server and the browser.
 *
 * The source language of the interface is Russian, so a translation key is the
 * Russian text itself: `t('Войти')`. English comes from the dictionary in
 * `en.ts`; a missing entry falls back to the Russian text, so a forgotten
 * translation can never break a page.
 *
 * Placeholders look like `{name}` and are filled from the second argument:
 * `t('Отправлено: {count}', { count: 3 })`.
 *
 * Text that comes from the backend (captions, comments, names, API error
 * messages) is data, not interface, and is never translated.
 */
export type Locale = 'ru' | 'en';

export const LOCALES: readonly Locale[] = ['ru', 'en'];
export const DEFAULT_LOCALE: Locale = 'ru';
export const LOCALE_COOKIE = 'ig-locale';

export type TranslateVars = Record<string, string | number>;

export interface Translate {
  (key: string, vars?: TranslateVars): string;
  (key: string | undefined, vars?: TranslateVars): string | undefined;
}

export function normalizeLocale(value: string | undefined | null): Locale {
  return value === 'en' ? 'en' : 'ru';
}

export function translate(locale: Locale, key: string, vars?: TranslateVars): string {
  const text = locale === 'en' ? (EN[key] ?? key) : key;

  if (!vars) return text;

  return text.replace(/\{(\w+)\}/g, (placeholder, name: string) =>
    name in vars ? String(vars[name]) : placeholder,
  );
}

export function createTranslate(locale: Locale): Translate {
  return ((key: string | undefined, vars?: TranslateVars) =>
    key === undefined ? undefined : translate(locale, key, vars)) as Translate;
}

/** BCP 47 tag used for `Intl` formatting. */
export function intlLocale(locale: Locale): string {
  return locale === 'en' ? 'en-US' : 'ru-RU';
}

/**
 * Marks Russian text that lives outside a component (validation schemas,
 * constant lists, default props). It returns the text unchanged; the component
 * that displays it must pass it through `t()`.
 */
export const tr = (text: string): string => text;
