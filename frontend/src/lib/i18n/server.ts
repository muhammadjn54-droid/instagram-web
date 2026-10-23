import 'server-only';

import { cookies } from 'next/headers';

import { LOCALE_COOKIE, createTranslate, normalizeLocale, type Locale } from './core';

/** Locale chosen by the visitor (cookie), for Server Components and metadata. */
export async function getLocale(): Promise<Locale> {
  return normalizeLocale((await cookies()).get(LOCALE_COOKIE)?.value);
}

/** Translate function bound to the visitor's locale, for Server Components. */
export async function getT() {
  const locale = await getLocale();
  return { locale, t: createTranslate(locale) };
}
