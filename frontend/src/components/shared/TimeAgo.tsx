'use client';

import { useEffect, useState } from 'react';

import { formatRelativeTime } from '@/lib/utils';
import { cn } from '@/lib/utils';

/**
 * Relative timestamp ("2 ч. назад") that refreshes itself.
 *
 * The interval is aligned to a minute so the label never drifts by more
 * than a minute between updates.
 */
export function TimeAgo({
  value,
  className,
  intervalMs = 60_000,
}: {
  value: string | number | Date | null | undefined;
  className?: string;
  intervalMs?: number;
}) {
  const [, forceRender] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => forceRender((n) => n + 1), intervalMs);
    return () => window.clearInterval(timer);
  }, [intervalMs]);

  if (!value) return null;

  return (
    <time dateTime={new Date(value).toISOString()} className={cn(className)}>
      {formatRelativeTime(value)}
    </time>
  );
}
