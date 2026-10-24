'use client';

import Link from 'next/link';

import { Logo } from '@/components/layout/Logo';
import { useT } from '@/lib/i18n/LocaleProvider';

/**
 * 404 page.
 */
export default function NotFound() {
  const t = useT();
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <Logo showWordmark={false} />

      <p className="text-5xl font-bold tracking-tight text-foreground">404</p>

      <h1 className="text-lg font-semibold text-foreground">{t('Страница не найдена')}</h1>

      <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
        {t('Возможно, страница была удалена или ссылка устарела.')}
      </p>

      <Link
        href="/feed"
        className="rounded-control bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand/90"
      >
        {t('Перейти в ленту')}
      </Link>
    </div>
  );
}
