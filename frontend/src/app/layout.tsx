import type { Metadata, Viewport } from 'next';
import { cookies } from 'next/headers';
import { connection } from 'next/server';
import './globals.css';

import { StoreProvider } from '@/store/provider';
import { ToastProvider } from '@/components/ui/Toast';
import { ThemeSync } from '@/components/layout/ThemeSync';
import { THEME_COOKIE } from '@/lib/theme';
import { LocaleProvider } from '@/lib/i18n/LocaleProvider';
import { getLocale, getT } from '@/lib/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();

  return {
    title: {
      default: 'Instagram',
      template: '%s — Instagram',
    },
    description: t('Посмотрите, какими моментами из жизни поделились ваши близкие друзья.'),
    icons: {
      icon: '/favicon.ico',
    },
    // The interface has its own language switch (Русский / English). Browser
    // auto-translation rewrites the text nodes behind React's back and crashes
    // it ("insertBefore" errors).
    other: { google: 'notranslate' },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0b0b0d' },
  ],
};

/**
 * The whole application is rendered at request time.
 *
 * The Redux store is created on the server as well (one store per request)
 * and RTK Query generates random request ids while the initial state is
 * built, so the static prerender has to be opted out of.
 */
export const instant = false;

/**
 * Root layout.
 *
 * `connection()` stops the static prerender: rendering therefore happens at
 * request time.
 */
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();

  // The theme is stored in a cookie so the server can render the right class
  // immediately: no inline <script> (React warns about scripts in components)
  // and no flash of the wrong theme.
  const dark = (await cookies()).get(THEME_COOKIE)?.value === 'dark';
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      translate="no"
      className={dark ? 'dark h-full' : 'h-full'}
      style={dark ? { colorScheme: 'dark' } : undefined}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-background font-sans text-foreground">
        <ThemeSync />
        <LocaleProvider initialLocale={locale}>
          <StoreProvider>
            <ToastProvider>{children}</ToastProvider>
          </StoreProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
