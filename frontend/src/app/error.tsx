'use client';

import { useEffect } from 'react';
import { RotateCcw } from 'lucide-react';

import { Button } from '@/components/ui/Button';

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
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <p className="text-5xl font-bold tracking-tight text-foreground">Ошибка</p>

      <h1 className="text-lg font-semibold text-foreground">Что-то пошло не так</h1>

      <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
        {error.message || 'Не удалось отобразить страницу. Попробуйте ещё раз.'}
      </p>

      <Button onClick={reset} icon={<RotateCcw className="h-4 w-4" />}>
        Повторить
      </Button>
    </div>
  );
}
