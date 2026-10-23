'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bookmark, Heart, MessageCircle, MoreHorizontal, Send, Trash2 } from 'lucide-react';

import { Avatar } from '@/components/ui/Avatar';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import { TimeAgo } from '@/components/shared/TimeAgo';
import { PostCarousel } from './PostCarousel';
import { PostCommentsModal } from '@/components/post/PostCommentsModal';
import { SharePostModal } from '@/components/messages/SharePostModal';
import { useDeletePostMutation, useFavoritePostMutation, useUnfavoritePostMutation } from '@/features/posts/postsApi';
import { usePostLike } from '@/features/posts/usePostLike';
import { useGetMyProfileQuery } from '@/features/profiles/profilesApi';
import { cn, formatCount, getErrorMessage } from '@/lib/utils';
import type { Post } from '@/types';
import { useT } from '@/lib/i18n/LocaleProvider';

export interface PostCardProps {
  post: Post;
  /** Shows the "Подробнее" link that opens the post page. */
  detailed?: boolean;
  /** Overrides the ownership check (by default: the post belongs to the signed-in user). */
  owned?: boolean;
  /** Called after the post was deleted, e.g. to leave the post page. */
  onDeleted?: () => void;
  className?: string;
}

/**
 * Feed card of a single post.
 *
 * The card owns its optimistic "like"/"save" state so the interaction never
 * waits for the network round-trip; the mutation invalidates the RTK Query
 * cache afterwards.
 */
export function PostCard({ post, detailed = false, owned, onDeleted, className }: PostCardProps) {
  const t = useT();
  const { toast } = useToast();
  const { data: myProfile } = useGetMyProfileQuery();
  const isOwner = owned ?? (myProfile !== undefined && post.userId === myProfile.userId);

  const { liked, likesCount, toggle: toggleLike, failed: likeFailed } = usePostLike(post);
  const [saved, setSaved] = useState(post.isFavoriteByMe);
  const [menuOpen, setMenuOpen] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [favoritePost] = useFavoritePostMutation();
  const [unfavoritePost] = useUnfavoritePostMutation();
  const [deletePost, { isLoading: isDeleting }] = useDeletePostMutation();

  useEffect(() => {
    if (likeFailed) toast(t('Не удалось изменить лайк'), 'error');
  }, [likeFailed, toast, t]);

  const toggleSave = async () => {
    const next = !saved;
    setSaved(next);

    try {
      if (next) await favoritePost(post.id).unwrap();
      else await unfavoritePost(post.id).unwrap();
    } catch {
      setSaved(!next);
      toast(t('Не удалось изменить сохранение'), 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await deletePost(post.id).unwrap();
      toast(t('Публикация удалена'), 'success');
      setConfirmOpen(false);
      onDeleted?.();
    } catch (error) {
      toast(getErrorMessage(error, t('Не удалось удалить публикацию')), 'error');
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
        <Link href={`/profile/${post.userId}`} aria-label={t('Профиль {name}', { name: post.userName })}>
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

        {isOwner ? (
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              aria-label={t('Действия с публикацией')}
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
                  {t('Удалить публикацию')}
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </header>

      <Link href={`/post/${post.id}`} aria-label={`${t('Открыть публикацию')} ${post.title ?? ''}`.trim()}>
        <PostCarousel images={post.images} alt={post.title ?? post.content} isReel={post.isReel} />
      </Link>

      <div className="space-y-2 px-4 py-3">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={toggleLike}
            aria-pressed={liked}
            aria-label={liked ? t('Убрать лайк') : t('Поставить лайк')}
            className={cn(
              'transition-colors hover:text-destructive',
              liked ? 'text-destructive' : 'text-foreground',
            )}
          >
            <Heart className={cn('h-6 w-6', liked && 'fill-current')} aria-hidden="true" />
          </button>

          {detailed ? (
            <Link
              href="#comments"
              aria-label={t('Перейти к комментариям')}
              className="text-foreground transition-colors hover:text-muted-foreground"
            >
              <MessageCircle className="h-6 w-6" aria-hidden="true" />
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setCommentsOpen(true)}
              aria-label={t('Открыть комментарии')}
              className="text-foreground transition-colors hover:text-muted-foreground"
            >
              <MessageCircle className="h-6 w-6" aria-hidden="true" />
            </button>
          )}

          <button
            type="button"
            aria-label={t('Поделиться')}
            onClick={() => setShareOpen(true)}
            className="text-foreground transition-colors hover:text-muted-foreground"
          >
            <Send className="h-6 w-6" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={toggleSave}
            aria-pressed={saved}
            aria-label={saved ? t('Убрать из сохранённых') : t('Сохранить')}
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
          {likesCount === 1 ? t('отметка «Нравится»') : t('отметок «Нравится»')}
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
            detailed ? (
              <Link href="#comments" className="hover:underline">
                {formatCount(post.commentsCount)}{' '}
                {post.commentsCount === 1 ? t('комментарий') : t('комментариев')}
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setCommentsOpen(true)}
                className="hover:underline"
              >
                {t('Посмотреть все комментарии ({count})', { count: formatCount(post.commentsCount) })}
              </button>
            )
          ) : null}

          <span>{t('{count} просмотров', { count: formatCount(post.viewsCount) })}</span>

          {detailed ? (
            <Link href={`/post/${post.id}`} className="ml-auto font-medium hover:underline">
              {t('Подробнее')}
            </Link>
          ) : null}
        </div>
      </div>

      {commentsOpen ? (
        <PostCommentsModal
          post={post}
          canDelete={isOwner}
          onClose={() => setCommentsOpen(false)}
        />
      ) : null}

      <SharePostModal postId={post.id} open={shareOpen} onClose={() => setShareOpen(false)} />

      <ConfirmDialog
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        loading={isDeleting}
        destructive
        title={t('Удалить публикацию?')}
        description={t('Публикация и все её комментарии будут удалены безвозвратно.')}
        confirmLabel={t('Удалить')}
      />
    </article>
  );
}
