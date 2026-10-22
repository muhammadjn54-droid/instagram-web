import { cn, getInitials } from '@/lib/utils';
import { getMediaUrl } from '@/lib/media';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const SIZES: Record<AvatarSize, string> = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-16 w-16 text-lg',
  xl: 'h-24 w-24 text-2xl',
};

export interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: AvatarSize;
  /** Draws the brand-coloured ring used by the stories tray. */
  ring?: boolean;
  className?: string;
}

/**
 * Circular avatar with a deterministic initials fallback.
 *
 * The fallback keeps the layout stable when the user has no avatar — it is
 * never a broken image.
 */
export function Avatar({ src, name, size = 'md', ring = false, className }: AvatarProps) {
  const mediaUrl = getMediaUrl(src);
  const initials = getInitials(name);

  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-pill',
        'bg-surface-muted font-semibold text-muted-foreground',
        SIZES[size],
        className,
      )}
    >
      {ring ? (
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-pill bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] p-[2px]"
        >
          <span className="block h-full w-full rounded-pill bg-surface" />
        </span>
      ) : null}

      {mediaUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- backend media is served from another origin and is not optimised by Next.js
        <img
          src={mediaUrl}
          alt={name ?? ''}
          loading="lazy"
          decoding="async"
          className={cn('h-full w-full object-cover', ring && 'relative')}
        />
      ) : (
        <span aria-hidden="true">{initials}</span>
      )}

      {mediaUrl && name ? <span className="sr-only">{name}</span> : null}
    </span>
  );
}
