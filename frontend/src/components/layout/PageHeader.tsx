'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useT } from '@/lib/i18n/LocaleProvider';
import { tr } from '@/lib/i18n/core';

export interface PageHeaderProps {
  title: string;
  description?: string;
  /** Renders a back link on the left of the title. */
  backHref?: string;
  backLabel?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  backHref,
  backLabel = tr('Назад'),
  actions,
  className,
}: PageHeaderProps) {
  const t = useT();
  return (
    <div className={cn('flex flex-wrap items-start justify-between gap-4', className)}>
      <div className="min-w-0 space-y-1">
        {backHref ? (
          <Link
            href={backHref}
            className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
            {t(backLabel)}
          </Link>
        ) : null}

        <h1 className="truncate text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          {t(title)}
        </h1>

        {description ? (
          <p className="text-sm leading-relaxed text-muted-foreground">{t(description)}</p>
        ) : null}
      </div>

      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  );
}
