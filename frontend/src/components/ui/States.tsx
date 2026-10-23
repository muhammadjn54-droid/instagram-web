'use client';

import { AlertCircle, Inbox, Loader2, RefreshCw } from 'lucide-react';

import { Button } from './Button';
import { cn } from '@/lib/utils';
import { useT } from '@/lib/i18n/LocaleProvider';
import { tr } from '@/lib/i18n/core';

/** Small inline spinner. */
export function Spinner({ className }: { className?: string }) {
  return (
    <Loader2
      className={cn('h-4 w-4 animate-spin-slow text-muted-foreground', className)}
      aria-hidden="true"
    />
  );
}

/** Card surface used across the whole application. */
export function Card({
  className,
  children,
  as: Tag = 'div',
}: {
  className?: string;
  children: React.ReactNode;
  as?: 'div' | 'section' | 'article' | 'aside';
}) {
  return (
    <Tag
      className={cn(
        'rounded-card border border-border bg-surface shadow-card',
        className,
      )}
    >
      {children}
    </Tag>
  );
}

/** Small status pill. */
export function Badge({
  children,
  tone = 'neutral',
  className,
}: {
  children: React.ReactNode;
  tone?: 'neutral' | 'brand' | 'success' | 'warning' | 'destructive' | 'accent';
  className?: string;
}) {
  const tones = {
    neutral: 'bg-surface-muted text-muted-foreground',
    brand: 'bg-brand-muted text-brand',
    success: 'bg-success-muted text-success',
    warning: 'bg-warning-muted text-warning',
    destructive: 'bg-destructive-muted text-destructive',
    accent: 'bg-accent-muted text-accent',
  } as const;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-pill px-2 py-0.5 text-[11px] font-semibold',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Full-width "nothing here yet" state. */
export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  const t = useT();
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-card border border-dashed border-border',
        'px-6 py-14 text-center',
        className,
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-pill bg-surface-muted text-muted-foreground">
        {icon ?? <Inbox className="h-6 w-6" aria-hidden="true" />}
      </div>

      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">{t(title)}</p>
        {description ? (
          <p className="mx-auto max-w-sm text-xs leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>

      {action}
    </div>
  );
}

/** Error state with an optional retry action. */
export function ErrorState({
  title = tr('Не удалось загрузить данные'),
  message,
  onRetry,
  className,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}) {
  const t = useT();
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-card border border-destructive/30',
        'bg-destructive-muted px-6 py-12 text-center',
        className,
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-pill bg-destructive/10 text-destructive">
        <AlertCircle className="h-6 w-6" aria-hidden="true" />
      </div>

      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">{t(title)}</p>
        {message ? (
          <p className="mx-auto max-w-sm text-xs leading-relaxed text-muted-foreground">
            {t(message)}
          </p>
        ) : null}
      </div>

      {onRetry ? (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          icon={<RefreshCw className="h-3.5 w-3.5" />}
        >
          {t('Повторить')}
        </Button>
      ) : null}
    </div>
  );
}

/** Shimmer placeholder used while a list is loading. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn('animate-pulse rounded-control bg-surface-muted', className)}
    />
  );
}

/** Generic centred loading indicator. */
export function LoadingState({ label = tr('Загрузка…') }: { label?: string }) {
  const t = useT();
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center justify-center gap-2 px-6 py-16 text-sm text-muted-foreground"
    >
      <Spinner />
      <span>{t(label)}</span>
    </div>
  );
}
