import type { Metadata, Viewport } from 'next';
import { connection } from 'next/server';
import './globals.css';

import { StoreProvider } from '@/store/provider';
import { ToastProvider } from '@/components/ui/Toast';

export const metadata: Metadata = {
  title: {
    default: 'Instagram',
    template: '%s — Instagram',
  },
  description:
    'Посмотрите, какими моментами из жизни поделились ваши близкие друзья.',
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0b0b0d' },
  ],
};

/**
 * Inline script that applies the saved theme before the first paint.
 *
 * It must stay synchronous and dependency free — otherwise the page flashes
 * in the wrong theme.
 */
const themeScript = `
(function () {
  try {
    var stored = localStorage.getItem('ig-theme');
    var dark = stored ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
  } catch (error) {}
})();
`;

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

  return (
    <html lang="ru" className="h-full" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full bg-background font-sans text-foreground">
        <StoreProvider>
          <ToastProvider>{children}</ToastProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
