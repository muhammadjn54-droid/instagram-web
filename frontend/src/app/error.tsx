'use client';

import { useEffect } from 'react';
import { RotateCcw } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { useT } from '@/lib/i18n/LocaleProvider';

/**
 * Global error boundary of the application.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useT();
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <p className="text-5xl font-bold tracking-tight text-foreground">{t('Ошибка')}</p>

      <h1 className="text-lg font-semibold text-foreground">{t('Что-то пошло не так')}</h1>

      <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
        {error.message || t('Не удалось отобразить страницу. Попробуйте ещё раз.')}
      </p>

      <Button onClick={reset} icon={<RotateCcw className="h-4 w-4" />}>
        {t('Повторить')}
      </Button>
    </div>
  );
}
