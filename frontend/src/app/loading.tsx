'use client';

import { Spinner } from '@/components/ui/States';
import { useT } from '@/lib/i18n/LocaleProvider';

/**
 * Route level loading state.
 */
export default function Loading() {
  const t = useT();
  return (
    <div className="flex min-h-[60dvh] items-center justify-center">
      <Spinner className="h-6 w-6" />
      <span className="sr-only">{t('Загрузка страницы')}</span>
    </div>
  );
}
