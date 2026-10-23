'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bookmark, Heart, MessageCircle, MoreHorizontal, Send, Trash2 } from 'lucide-react';

import { Avatar } from '@/components/ui/Avatar';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import { TimeAgo } from '@/components/shared/TimeAgo';
import { PostCarousel } from './PostCarousel';
import { useDeletePostMutation, useFavoritePostMutation, useLikePostMutation, useUnfavoritePostMutation, useUnlikePostMutation } from '@/features/posts/postsApi';
import { formatCount } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { Post } from '@/types';

export interface PostCardProps {
  post: Post;
  /** Shows the "Подробнее" link that opens the post page. */
  detailed?: boolean;
  /** Shows the delete action (only for the owner). */
  owned?: boolean;
  className?: string;
}

/**
 * Feed card of a single post.
 *
 * The card owns its optimistic "like"/"save" state so the interaction never
 * waits for the network round-trip; the mutation invalidates the RTK Query
 * cache afterwards.
 */
export function PostCard({ post, detailed = false, owned = false, className }: PostCardProps) {
  const { toast } = useToast();

  const [liked, setLiked] = useState(post.isLikedByMe);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [saved, setSaved] = useState(post.isFavoriteByMe);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [likePost, { isLoading: isLiking }] = useLikePostMutation();
  const [unlikePost] = useUnlikePostMutation();
  const [favoritePost] = useFavoritePostMutation();
  const [unfavoritePost] = useUnfavoritePostMutation();
  const [deletePost, { isLoading: isDeleting }] = useDeletePostMutation();

  const toggleLike = async () => {
    const next = !liked;
    setLiked(next);
    setLikesCount((count) => count + (next ? 1 : -1));

    try {
      if (next) await likePost(post.id).unwrap();
      else await unlikePost(post.id).unwrap();
    } catch {
      setLiked(!next);
      setLikesCount((count) => count + (next ? -1 : 1));
      toast('Не удалось изменить лайк', 'error');
    }
  };

  const toggleSave = async () => {
    const next = !saved;
    setSaved(next);

    try {
      if (next) await favoritePost(post.id).unwrap();
      else await unfavoritePost(post.id).unwrap();
    } catch {
      setSaved(!next);
      toast('Не удалось изменить сохранение', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await deletePost(post.id).unwrap();
      toast('Публикация удалена', 'success');
      setConfirmOpen(false);
    } catch {
      toast('Не удалось удалить публикацию', 'error');
    }
  };

  return (
    <article
      className={cn(
        'overflow-hidden rounded-card border border-border bg-surface shadow-card',
        className,
      )}
    >
      <header className="flex items-center gap-3 px-4 py-3">
        <Link href={`/profile/${post.userId}`} aria-label={`Профиль ${post.userName}`}>
          <Avatar src={post.userAvatar} name={post.userName} size="sm" />
        </Link>

        <div className="min-w-0 flex-1">
          <Link
            href={`/profile/${post.userId}`}
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

        <TimeAgo
          value={post.createdAt}
          className="shrink-0 text-xs text-muted-foreground"
        />

        {owned ? (
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              aria-label="Действия с публикацией"
              aria-expanded={menuOpen}
              className="flex h-8 w-8 items-center justify-center rounded-control text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
            >
              <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
            </button>

            {menuOpen ? (
              <div className="absolute right-0 top-9 z-20 w-44 overflow-hidden rounded-card border border-border bg-surface shadow-popover">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setConfirmOpen(true);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive-muted"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Удалить публикацию
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </header>

      <Link href={`/post/${post.id}`} aria-label={`Открыть публикацию ${post.title ?? ''}`}>
        <PostCarousel images={post.images} alt={post.title ?? post.content} isReel={post.isReel} />
      </Link>

      <div className="space-y-2 px-4 py-3">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={toggleLike}
            disabled={isLiking}
            aria-pressed={liked}
            aria-label={liked ? 'Убрать лайк' : 'Поставить лайк'}
            className={cn(
              'transition-colors hover:text-destructive disabled:opacity-60',
              liked ? 'text-destructive' : 'text-foreground',
            )}
          >
            <Heart className={cn('h-6 w-6', liked && 'fill-current')} aria-hidden="true" />
          </button>

          <Link
            href={`/post/${post.id}#comments`}
            aria-label="Открыть комментарии"
            className="text-foreground transition-colors hover:text-muted-foreground"
          >
            <MessageCircle className="h-6 w-6" aria-hidden="true" />
          </Link>

          <button
            type="button"
            aria-label="Поделиться"
            onClick={() => {
              if (typeof navigator !== 'undefined' && navigator.clipboard) {
                navigator.clipboard
                  .writeText(`${window.location.origin}/post/${post.id}`)
                  .then(() => toast('Ссылка скопирована', 'success'))
                  .catch(() => toast('Не удалось скопировать ссылку', 'error'));
              }
            }}
            className="text-foreground transition-colors hover:text-muted-foreground"
          >
            <Send className="h-6 w-6" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={toggleSave}
            aria-pressed={saved}
            aria-label={saved ? 'Убрать из сохранённых' : 'Сохранить'}
            className={cn(
              'ml-auto transition-colors hover:text-foreground disabled:opacity-60',
              saved ? 'text-foreground' : 'text-muted-foreground',
            )}
          >
            <Bookmark className={cn('h-6 w-6', saved && 'fill-current')} aria-hidden="true" />
          </button>
        </div>

        <p className="text-sm font-semibold text-foreground">
          {formatCount(likesCount)}{' '}
          {likesCount === 1 ? 'отметка «Нравится»' : 'отметок «Нравится»'}
        </p>

        {post.content ? (
          <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
            <Link
              href={`/profile/${post.userId}`}
              className="mr-1 font-semibold hover:underline"
            >
              {post.userName}
            </Link>
            {post.content}
          </p>
        ) : null}

        {post.title ? (
          <p className="text-sm font-medium text-muted-foreground">{post.title}</p>
        ) : null}

        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          {post.commentsCount > 0 ? (
            <Link href={`/post/${post.id}#comments`} className="hover:underline">
              {formatCount(post.commentsCount)}{' '}
              {post.commentsCount === 1 ? 'комментарий' : 'комментариев'}
            </Link>
          ) : null}

          <span>{formatCount(post.viewsCount)} просмотров</span>

          {detailed ? (
            <Link href={`/post/${post.id}`} className="ml-auto font-medium hover:underline">
              Подробнее
            </Link>
          ) : null}
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        loading={isDeleting}
        destructive
        title="Удалить публикацию?"
        description="Публикация и все её комментарии будут удалены безвозвратно."
        confirmLabel="Удалить"
      />
    </article>
  );
}
