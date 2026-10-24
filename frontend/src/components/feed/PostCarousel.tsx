'use client';

import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { MediaImage } from '@/components/shared/MediaImage';
import { cn } from '@/lib/utils';
import { useT } from '@/lib/i18n/LocaleProvider';

export interface PostCarouselProps {
  images: string[];
  alt: string;
  isReel?: boolean;
  /** Shows the "1/3" counter and the navigation arrows. */
  interactive?: boolean;
  className?: string;
}

/**
 * Horizontal media carousel.
 *
 * Implemented with scroll-snap so it also works with a swipe gesture on
 * touch devices; the arrows are a progressive enhancement for pointer
 * devices.
 */
export function PostCarousel({
  images,
  alt,
  isReel = false,
  interactive = true,
  className,
}: PostCarouselProps) {
  const t = useT();
  const [index, setIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  if (!images || images.length === 0) {
    return (
      <MediaImage
        src={null}
        alt={alt}
        aspectClassName="aspect-square"
        className={className}
        isReel={isReel}
      />
    );
  }

  const goTo = (event: React.MouseEvent, next: number) => {
    // The carousel sits inside a link to the post page: arrows must not navigate.
    event.preventDefault();
    event.stopPropagation();

    const clamped = Math.min(Math.max(next, 0), images.length - 1);
    const track = trackRef.current;
    if (track) {
      track.scrollTo({ left: clamped * track.clientWidth, behavior: 'smooth' });
    }
    setIndex(clamped);
  };

  return (
    <div className={cn('group relative', className)}>
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory overflow-x-auto scrollbar-none"
        onScroll={(event) => {
          const element = event.currentTarget;
          const next = Math.round(element.scrollLeft / element.clientWidth);
          if (next !== index) setIndex(next);
        }}
      >
        {images.map((image, position) => (
          <MediaImage
            key={`${image}-${position}`}
            src={image}
            alt={t('{alt} — изображение {n}', { alt, n: position + 1 })}
            aspectClassName="aspect-square w-full shrink-0 snap-center"
            imgClassName="object-cover"
            loading={position === 0 ? 'eager' : 'lazy'}
            isReel={isReel}
          />
        ))}
      </div>

      {interactive && images.length > 1 ? (
        <>
          <button
            type="button"
            onClick={(event) => goTo(event, index - 1)}
            disabled={index === 0}
            aria-label={t('Предыдущее изображение')}
            className="absolute left-2 top-1/2 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-pill bg-black/50 text-white opacity-0 transition-opacity hover:bg-black/70 focus-visible:opacity-100 group-hover:opacity-100 sm:flex disabled:pointer-events-none disabled:opacity-0"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={(event) => goTo(event, index + 1)}
            disabled={index === images.length - 1}
            aria-label={t('Следующее изображение')}
            className="absolute right-2 top-1/2 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-pill bg-black/50 text-white opacity-0 transition-opacity hover:bg-black/70 focus-visible:opacity-100 group-hover:opacity-100 sm:flex disabled:pointer-events-none disabled:opacity-0"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>

          <div
            className="pointer-events-none absolute right-3 top-3 rounded-pill bg-black/55 px-2 py-0.5 text-[11px] font-semibold text-white"
            aria-hidden="true"
          >
            {index + 1}/{images.length}
          </div>
        </>
      ) : null}
    </div>
  );
}
