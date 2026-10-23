'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { X } from 'lucide-react';

import { Avatar } from '@/components/ui/Avatar';
import { PostCarousel } from '@/components/feed/PostCarousel';
import { TimeAgo } from '@/components/shared/TimeAgo';
import { CommentSection } from './CommentSection';
import type { Post } from '@/types';
import { useT } from '@/lib/i18n/LocaleProvider';

export interface PostCommentsModalProps {
  post: Post;
  /** The signed-in user owns the post and may delete any comment. */
  canDelete: boolean;
  onClose: () => void;
}

/**
 * Comments of a post in a modal, opened from the feed card.
 *
 * Desktop: the picture on the left, author, caption and comments on the
 * right. Phones: only the comments, as a sheet. The feed stays behind it, so
 * no navigation happens.
 */
export function PostCommentsModal({ post, canDelete, onClose }: PostCommentsModalProps) {
  const t = useT();
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <div className="absolute inset-0 bg-black/65" onClick={onClose} aria-hidden="true" />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('Комментарии к публикации {name}', { name: post.userName })}
        className="relative z-10 flex h-[85dvh] w-full max-w-5xl animate-scale-in flex-col overflow-hidden rounded-t-2xl bg-surface shadow-popover sm:h-[min(90dvh,760px)] sm:rounded-card md:flex-row"
      >
        <div className="hidden items-center bg-black md:flex md:w-[55%]">
          <PostCarousel
            images={post.images}
            alt={post.title ?? post.content}
            isReel={post.isReel}
            className="w-full"
          />
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
          <header className="flex items-center gap-3 border-b border-border px-4 py-3">
            <Link
              href={`/profile/${post.userId}`}
              onClick={onClose}
              aria-label={t('Профиль {name}', { name: post.userName })}
            >
              <Avatar src={post.userAvatar} name={post.userName} size="sm" />
            </Link>

            <div className="min-w-0 flex-1">
              <Link
                href={`/profile/${post.userId}`}
                onClick={onClose}
                className="block truncate text-sm font-semibold text-foreground hover:underline"
              >
                {post.userName}
              </Link>
              {post.location ? (
                <span className="block truncate text-xs text-muted-foreground">
                  {post.location.name}
                </span>
              ) : null}
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label={t('Закрыть комментарии')}
              className="flex h-9 w-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-surface-muted"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            {post.content ? (
              <div className="mb-5 flex gap-3">
                <Avatar src={post.userAvatar} name={post.userName} size="sm" />
                <div className="min-w-0">
                  <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
                    <span className="mr-1 font-semibold">{post.userName}</span>
                    {post.content}
                  </p>
                  <TimeAgo
                    value={post.createdAt}
                    className="mt-1 block text-xs text-muted-foreground"
                  />
                </div>
              </div>
            ) : null}

            <CommentSection postId={post.id} canDelete={canDelete} stickyComposer />
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
