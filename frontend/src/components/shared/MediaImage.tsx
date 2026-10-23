'use client';

import { useState } from 'react';
import { ImageOff } from 'lucide-react';

import { getMediaUrl } from '@/lib/media';
import { cn } from '@/lib/utils';
import { VideoPlayer } from './VideoPlayer';

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
  isReel?: boolean;
}

/**
 * Backend media renderer with Instagram-style lazy loading placeholder.
 */
export function MediaImage({
  src,
  alt,
  aspectClassName,
  className,
  imgClassName,
  fallback,
  loading = 'lazy',
  isReel = false,
}: MediaImageProps) {
  const [failed, setFailed] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const url = getMediaUrl(src);

  const isVideo = isReel || (url ? /\.(mp4|webm|ogv)(\?.*)?$/i.test(url) : false);

  if (isVideo && url && !failed) {
    return (
      <VideoPlayer
        src={url}
        aspectClassName={aspectClassName}
        className={className}
      />
    );
  }

  const showFallback = !url || failed;

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-neutral-100 dark:bg-neutral-900',
        aspectClassName,
        className,
      )}
    >
      {/* Instagram Logo Lazy Loading Placeholder */}
      {!isLoaded && !showFallback ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-[12px] bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] shadow-md animate-pulse">
            <span className="absolute inset-[3px] rounded-[9px] border-2 border-white/90" />
            <span className="h-3 w-3 rounded-full border-2 border-white/90" />
            <span className="absolute right-[5px] top-[5px] h-1.5 w-1.5 rounded-full bg-white/90" />
          </div>
        </div>
      ) : null}

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
          onLoad={() => setIsLoaded(true)}
          onError={() => setFailed(true)}
          className={cn(
            'h-full w-full object-cover transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
            imgClassName,
          )}
        />
      )}
    </div>
  );
}
