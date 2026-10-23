'use client';

import { useTransition } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from './Button';
import { cn } from '@/lib/utils';
import { useT } from '@/lib/i18n/LocaleProvider';
import { tr } from '@/lib/i18n/core';

export interface PaginationProps {
  page: number;
  totalPages: number;
  totalCount?: number;
  onPageChange: (page: number) => void;
  className?: string;
  label?: string;
}

/**
 * Server-side pagination control.
 *
 * The page state lives in the URL (query string) of the owning feature, the
 * component only reports the requested page.
 */
export function Pagination({
  page,
  totalPages,
  totalCount,
  onPageChange,
  className,
  label = tr('Постраничная навигация'),
}: PaginationProps) {
  const t = useT();
  const [isPending, startTransition] = useTransition();

  if (totalPages <= 1) return null;

  const goTo = (next: number) => {
    if (next < 1 || next > totalPages || next === page) return;
    startTransition(() => onPageChange(next));
  };

  return (
    <nav
      aria-label={t(label)}
      className={cn('flex items-center justify-between gap-3 pt-4', className)}
    >
      <p className="text-xs text-muted-foreground">
        {typeof totalCount === 'number'
          ? t('Всего: {count}', { count: new Intl.NumberFormat('ru-RU').format(totalCount) })
          : t('Страница {page} из {total}', { page, total: totalPages })}
      </p>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          aria-label={t('Предыдущая страница')}
          disabled={page <= 1 || isPending}
          onClick={() => goTo(page - 1)}
          icon={<ChevronLeft className="h-4 w-4" />}
        />
        <span className="min-w-20 text-center text-xs font-medium text-foreground">
          {page} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="icon"
          aria-label={t('Следующая страница')}
          disabled={page >= totalPages || isPending}
          onClick={() => goTo(page + 1)}
          icon={<ChevronRight className="h-4 w-4" />}
        />
      </div>
    </nav>
  );
}
