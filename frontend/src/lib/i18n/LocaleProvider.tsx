'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';

import { LOCALE_COOKIE, createTranslate, type Locale, type Translate } from './core';

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translate;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/**
 * Holds the interface language.
 *
 * The server reads the cookie and passes the language in, so the first paint
 * is already in the right language. Switching writes the cookie, re-renders
 * the client tree immediately and refreshes the Server Components (page
 * titles).
 */
export function LocaleProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: ReactNode;
}) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const setLocale = useCallback(
    (next: Locale) => {
      document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${ONE_YEAR_SECONDS}; samesite=lax`;
      document.documentElement.lang = next;
      setLocaleState(next);
      router.refresh();
    },
    [router],
  );

  const value = useMemo<LocaleContextValue>(
    () => ({ locale, setLocale, t: createTranslate(locale) }),
    [locale, setLocale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

function useLocaleContext(): LocaleContextValue {
  const context = useContext(LocaleContext);
  if (!context) throw new Error('useT / useLocale must be used inside <LocaleProvider>');
  return context;
}

/** Translate function of the current language: `const t = useT();`. */
export function useT(): Translate {
  return useLocaleContext().t;
}

/** Current language and the switch. */
export function useLocale(): Pick<LocaleContextValue, 'locale' | 'setLocale'> {
  const { locale, setLocale } = useLocaleContext();
  return { locale, setLocale };
}
