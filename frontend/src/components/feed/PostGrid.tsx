'use client';

import Link from 'next/link';
import { Clapperboard, ImageOff } from 'lucide-react';

import { MediaImage } from '@/components/shared/MediaImage';
import { cn } from '@/lib/utils';
import type { Post } from '@/types';
import { useT } from '@/lib/i18n/LocaleProvider';

export interface PostGridProps {
  posts: Post[];
  /** Number of columns on large screens. */
  columns?: 2 | 3;
  emptyState?: React.ReactNode;
  className?: string;
}

/**
 * Responsive grid of posts (profile, explore, saved).
 */
export function PostGrid({ posts, columns = 3, emptyState, className }: PostGridProps) {
  const t = useT();
  if (posts.length === 0) {
    return <>{emptyState}</>;
  }

  return (
    <div
      className={cn(
        'grid gap-1 sm:gap-2',
        columns === 3
          ? 'grid-cols-2 sm:grid-cols-3'
          : 'grid-cols-1 sm:grid-cols-2',
        className,
      )}
    >
      {posts.map((post) => (
        <Link
          key={post.id}
          href={`/post/${post.id}`}
          aria-label={`${t('Открыть публикацию')} ${post.title ?? post.content ?? ''}`.trim()}
          className="group relative block aspect-square overflow-hidden bg-neutral-100 dark:bg-neutral-900"
        >
          <MediaImage
            src={post.images?.[0]}
            alt={post.title ?? post.content ?? t('Публикация')}
            aspectClassName="aspect-square"
            imgClassName="transition-transform duration-300 group-hover:scale-[1.03]"
            fallback={<ImageOff className="h-5 w-5" aria-hidden="true" />}
            isReel={false}
          />
          {post.isReel ? (
            <div className="absolute top-2 right-2 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm">
              <Clapperboard className="h-3.5 w-3.5" aria-hidden="true" />
            </div>
          ) : null}
        </Link>
      ))}
    </div>
  );
}
