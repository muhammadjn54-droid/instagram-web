/**
 * Small, dependency-free helpers shared across the app.
 */

/** Joins conditional class names. Falsy values are dropped. */
export function cn(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(' ');
}

/** `1234` → `1 234` (ru-RU grouping). */
export function formatCount(value: number | undefined | null): string {
  if (!value) return '0';
  return new Intl.NumberFormat('ru-RU').format(value);
}

/** Absolute date, e.g. `21 октября 2026`. */
export function formatDate(value: string | number | Date | undefined | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

/** Short date, e.g. `21 окт. 2026`. */
export function formatShortDate(value: string | number | Date | undefined | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/** Clock time, e.g. `14:05`. */
export function formatTime(value: string | number | Date | undefined | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/** Human friendly relative time, e.g. `2 ч. назад`. */
export function formatRelativeTime(
  value: string | number | Date | undefined | null,
): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const diffSeconds = Math.round((Date.now() - date.getTime()) / 1000);

  if (diffSeconds < 60) return 'только что';

  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ['minute', 60],
    ['hour', 60 * 60],
    ['day', 60 * 60 * 24],
    ['week', 60 * 60 * 24 * 7],
    ['month', 60 * 60 * 24 * 30],
    ['year', 60 * 60 * 24 * 365],
  ];

  let unit: Intl.RelativeTimeFormatUnit = 'minute';
  let seconds = diffSeconds;

  for (const [candidate, secondsInUnit] of units) {
    if (Math.abs(seconds) >= secondsInUnit) {
      unit = candidate;
      seconds = Math.round(seconds / secondsInUnit);
    } else {
      break;
    }
  }

  return new Intl.RelativeTimeFormat('ru-RU', { numeric: 'auto' }).format(
    -seconds,
    unit,
  );
}

/** Initials for the avatar fallback, e.g. `Muhammad Rajabzoda` → `MR`. */
export function getInitials(value: string | undefined | null): string {
  if (!value) return '?';

  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

/** First letter of a name, used for the compact avatar fallback. */
export function getFirstLetter(value: string | undefined | null): string {
  return value?.trim().charAt(0).toUpperCase() || '?';
}

/** `true` when the value is a valid, non-empty http(s) URL. */
export function isExternalUrl(value: string | undefined | null): boolean {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}
