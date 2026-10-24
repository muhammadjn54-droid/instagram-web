'use client';

import Link from 'next/link';
import { Copy, Heart, MessageCircle, Play } from 'lucide-react';

import { MediaImage } from '@/components/shared/MediaImage';
import { getMediaUrl } from '@/lib/media';
import { formatCount } from '@/lib/utils';
import type { Post } from '@/types';
import { useT } from '@/lib/i18n/LocaleProvider';

const VIDEO_EXTENSION = /\.(mp4|webm|ogv)(\?.*)?$/i;

/**
 * 3:4 tile of a post (Explore and profile grids).
 *
 * Videos show their first frame with a play badge, posts with several pictures
 * a "copy" badge; hovering shows the likes and comments. A click opens the post.
 */
export function PostTile({ post }: { post: Post }) {
  const t = useT();
  const cover = post.images?.[0];
  const coverUrl = getMediaUrl(cover);
  const isVideo = Boolean(coverUrl && VIDEO_EXTENSION.test(coverUrl));
  const isCarousel = !isVideo && (post.images?.length ?? 0) > 1;

  return (
    <Link
      href={`/post/${post.id}`}
      aria-label={t('Открыть публикацию {name}', { name: post.userName })}
      className="group relative block aspect-[3/4] overflow-hidden bg-surface-muted"
    >
      {isVideo && coverUrl ? (
        <video
          src={`${coverUrl}#t=0.1`}
          muted
          playsInline
          preload="metadata"
          className="h-full w-full object-cover"
        />
      ) : (
        <MediaImage
          src={cover}
          alt={post.title ?? post.content ?? t('Публикация')}
          className="h-full w-full"
        />
      )}

      {isVideo || isCarousel ? (
        <span
          aria-hidden="true"
          className="absolute right-2.5 top-2.5 flex h-6 w-6 items-center justify-center rounded-md bg-black/55 text-white"
        >
          {isVideo ? <Play className="h-4 w-4 fill-white" /> : <Copy className="h-4 w-4" />}
        </span>
      ) : null}

      <span className="absolute inset-0 flex items-center justify-center gap-6 bg-black/35 text-sm font-bold text-white opacity-0 transition-opacity group-hover:opacity-100">
        <span className="flex items-center gap-1.5">
          <Heart className="h-5 w-5 fill-white" aria-hidden="true" />
          {formatCount(post.likesCount)}
        </span>
        <span className="flex items-center gap-1.5">
          <MessageCircle className="h-5 w-5 fill-white" aria-hidden="true" />
          {formatCount(post.commentsCount)}
        </span>
      </span>
    </Link>
  );
}
