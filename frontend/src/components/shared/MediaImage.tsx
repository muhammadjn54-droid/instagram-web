'use client';

import { useState } from 'react';
import { ImageOff } from 'lucide-react';

import { getMediaUrl } from '@/lib/media';
import { cn } from '@/lib/utils';

export interface MediaImageProps {
  /** Backend media path (`/uploads/…`) or an absolute URL. */
  src?: string | null;
  alt: string;
  /** Tailwind aspect class, e.g. `aspect-square`. */
  aspectClassName?: string;
  className?: string;
  imgClassName?: string;
  /** Rendered instead of the image when it cannot be loaded. */
  fallback?: React.ReactNode;
  loading?: 'lazy' | 'eager';
  sizes?: string;
}

/**
 * Backend media renderer.
 *
 * `next/image` is intentionally not used: the backend serves uploads from
 * another origin without an image-optimisation pipeline, and the media is
 * already compressed. The component degrades gracefully — a broken upload
 * never leaves an empty hole in the layout.
 */
export function MediaImage({
  src,
  alt,
  aspectClassName,
  className,
  imgClassName,
  fallback,
  loading = 'lazy',
}: MediaImageProps) {
  const [failed, setFailed] = useState(false);
  const url = getMediaUrl(src);

  const showFallback = !url || failed;

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-surface-muted',
        aspectClassName,
        className,
      )}
    >
      {showFallback ? (
        <div className="flex h-full w-full items-center justify-center text-subtle-foreground">
          {fallback ?? <ImageOff className="h-6 w-6" aria-hidden="true" />}
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- backend media lives on another origin and is not optimised by Next.js
        <img
          src={url}
          alt={alt}
          loading={loading}
          decoding="async"
          onError={() => setFailed(true)}
          className={cn('h-full w-full object-cover', imgClassName)}
        />
      )}
    </div>
  );
}
