'use client';

import Link from 'next/link';
import { Play } from 'lucide-react';

import { Avatar } from '@/components/ui/Avatar';
import { MediaImage } from '@/components/shared/MediaImage';
import { useGetPostQuery } from '@/features/posts/postsApi';
import { getMediaUrl } from '@/lib/media';
import { cn } from '@/lib/utils';
import { useT } from '@/lib/i18n/LocaleProvider';

const VIDEO_EXTENSION = /\.(mp4|webm|ogv)(\?.*)?$/i;

/**
 * Preview of a post that was shared in a chat: first frame / picture, author
 * and caption. A click opens the post.
 */
export function PostMessageCard({ postId, mine }: { postId: number; mine: boolean }) {
  const t = useT();
  const { data: post, isLoading, isError } = useGetPostQuery(postId);

  if (isError) {
    return (
      <Link
        href={`/post/${postId}`}
        className={cn(
          'block max-w-[260px] rounded-2xl px-4 py-3 text-sm underline',
          mine ? 'bg-accent text-accent-foreground' : 'bg-surface-muted text-foreground',
        )}
      >
        {t('Публикация недоступна')}
      </Link>
    );
  }

  const cover = post?.images?.[0];
  const coverUrl = getMediaUrl(cover);
  const isVideo = Boolean(coverUrl && VIDEO_EXTENSION.test(coverUrl));

  return (
    <Link
      href={`/post/${postId}`}
      aria-label={post ? t('Публикация {name}', { name: post.userName }) : t('Публикация')}
      className="block w-[250px] overflow-hidden rounded-2xl bg-surface-muted transition-opacity hover:opacity-95"
    >
      <div className="flex items-center gap-2 px-3 py-2.5">
        <Avatar src={post?.userAvatar} name={post?.userName} size="xs" />
        <span className="truncate text-sm font-semibold text-foreground">
          {post?.userName ?? '…'}
        </span>
      </div>

      <div className="relative aspect-[4/5] bg-black">
        {isLoading ? (
          <div className="h-full w-full animate-pulse bg-surface-muted" />
        ) : isVideo && coverUrl ? (
          <>
            <video
              src={`${coverUrl}#t=0.1`}
              muted
              playsInline
              preload="metadata"
              className="h-full w-full object-cover"
            />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/55 text-white">
                <Play className="h-6 w-6 translate-x-0.5 fill-white" aria-hidden="true" />
              </span>
            </span>
          </>
        ) : (
          <MediaImage src={cover} alt={post?.title ?? post?.content ?? t('Публикация')} className="h-full" />
        )}
      </div>

      {post?.content ? (
        <p className="line-clamp-2 px-3 py-2.5 text-xs text-foreground">{post.content}</p>
      ) : null}
    </Link>
  );
}
