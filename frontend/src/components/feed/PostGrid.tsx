'use client';

import { ImageOff } from 'lucide-react';

import { MediaImage } from '@/components/shared/MediaImage';
import { cn } from '@/lib/utils';
import type { Post } from '@/types';

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
        <MediaImage
          key={post.id}
          src={post.images?.[0]}
          alt={post.title ?? post.content ?? 'Публикация'}
          aspectClassName="aspect-square"
          imgClassName="transition-transform duration-300 hover:scale-[1.02]"
          fallback={<ImageOff className="h-5 w-5" aria-hidden="true" />}
        />
      ))}
    </div>
  );
}
