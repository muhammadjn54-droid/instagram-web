'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { MediaImage } from '@/components/shared/MediaImage';
import { cn } from '@/lib/utils';

export interface PostCarouselProps {
  images: string[];
  alt: string;
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
export function PostCarousel({ images, alt, interactive = true, className }: PostCarouselProps) {
  const [index, setIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <MediaImage
        src={null}
        alt={alt}
        aspectClassName="aspect-square"
        className={className}
      />
    );
  }

  const goTo = (next: number) => {
    const clamped = Math.min(Math.max(next, 0), images.length - 1);
    setIndex(clamped);
  };

  return (
    <div className={cn('relative', className)}>
      <div
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
            alt={`${alt} — изображение ${position + 1}`}
            aspectClassName="aspect-square w-full shrink-0 snap-center"
            imgClassName="object-cover"
            loading={position === 0 ? 'eager' : 'lazy'}
          />
        ))}
      </div>

      {interactive && images.length > 1 ? (
        <>
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            disabled={index === 0}
            aria-label="Предыдущее изображение"
            className="absolute left-2 top-1/2 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-pill bg-black/50 text-white opacity-0 transition-opacity hover:bg-black/70 focus-visible:opacity-100 group-hover:opacity-100 sm:flex disabled:pointer-events-none disabled:opacity-0"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => goTo(index + 1)}
            disabled={index === images.length - 1}
            aria-label="Следующее изображение"
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
