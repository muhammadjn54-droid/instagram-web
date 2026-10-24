'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Bookmark,
  ChevronDown,
  ChevronUp,
  Clapperboard,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Play,
  Send,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';

import { Avatar } from '@/components/ui/Avatar';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { useToast } from '@/components/ui/Toast';
import { CommentSection } from '@/components/post/CommentSection';
import { SharePostModal } from '@/components/messages/SharePostModal';
import { useFavoritePostMutation, useGetReelsQuery, useUnfavoritePostMutation } from '@/features/posts/postsApi';
import { usePostLike } from '@/features/posts/usePostLike';
import { useGetMyProfileQuery } from '@/features/profiles/profilesApi';
import { getMediaUrl } from '@/lib/media';
import { cn, formatCount } from '@/lib/utils';
import type { Post } from '@/types';
import { useT } from '@/lib/i18n/LocaleProvider';

/** Reels are loaded in one request; the API allows at most 100 per page. */
const REELS_LIMIT = 100;
/** Only the active reel and its direct neighbours get a `<video>` element. */
const PRELOAD_DISTANCE = 1;

/**
 * Reels — a vertical, one-at-a-time player.
 *
 * Every reel fills the scroll area and the container snaps to it, so a scroll
 * (wheel, swipe, arrow keys or the up/down buttons) moves exactly one video
 * and stays there. Only the reel on screen plays.
 */
export function ReelsView() {
  const t = useT();
  const { data, isLoading, isError, error, refetch } = useGetReelsQuery({
    pageNumber: 1,
    pageSize: REELS_LIMIT,
  });
  const { data: me } = useGetMyProfileQuery();

  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [muted, setMuted] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);

  const items = data?.items ?? [];

  // Which reel is on screen: the one that is at least 60% visible.
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveIndex(Number((entry.target as HTMLElement).dataset.reelIndex));
          }
        }
      },
      { root: scroller, threshold: 0.6 },
    );

    scroller.querySelectorAll('[data-reel-index]').forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [items.length]);

  const goTo = useCallback(
    (index: number) => {
      const scroller = scrollerRef.current;
      const target = Math.min(Math.max(index, 0), items.length - 1);
      const element = scroller?.querySelector<HTMLElement>(`[data-reel-index="${target}"]`);
      if (scroller && element) scroller.scrollTo({ top: element.offsetTop, behavior: 'smooth' });
    },
    [items.length],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA'].includes(target.tagName)) return;

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        goTo(activeIndex + 1);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        goTo(activeIndex - 1);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeIndex, goTo]);

  if (isLoading) {
    return <LoadingState label={t('Загружаем Reels…')} />;
  }

  if (isError) {
    return (
      <ErrorState
        title={t('Не удалось загрузить Reels')}
        message={error?.message}
        onRetry={refetch}
      />
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<Clapperboard className="h-6 w-6" aria-hidden="true" />}
        title={t('Здесь пока нет Reels')}
        description={t('Опубликуйте запись с галочкой «Опубликовать как Reels».')}
      />
    );
  }

  const activePost = items[Math.min(activeIndex, items.length - 1)];

  return (
    <div className="relative -mb-20 h-[calc(100dvh-7rem)] lg:-mb-10 lg:h-dvh">
      <div
        ref={scrollerRef}
        className="relative h-full snap-y snap-mandatory overflow-y-scroll scroll-smooth scrollbar-none"
      >
        {items.map((post, index) => (
          <ReelItem
            key={post.id}
            post={post}
            index={index}
            active={index === activeIndex}
            mounted={Math.abs(index - activeIndex) <= PRELOAD_DISTANCE}
            muted={muted}
            onMutedChange={setMuted}
            onOpenComments={() => setCommentsOpen(true)}
          />
        ))}
      </div>

      <div className="absolute right-4 top-1/2 z-10 hidden -translate-y-1/2 flex-col gap-4 lg:flex">
        <button
          type="button"
          onClick={() => goTo(activeIndex - 1)}
          disabled={activeIndex === 0}
          aria-label={t('Предыдущее видео')}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted text-foreground transition-colors hover:bg-border disabled:opacity-30"
        >
          <ChevronUp className="h-6 w-6" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => goTo(activeIndex + 1)}
          disabled={activeIndex >= items.length - 1}
          aria-label={t('Следующее видео')}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted text-foreground transition-colors hover:bg-border disabled:opacity-30"
        >
          <ChevronDown className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>

      {commentsOpen ? (
        <div
          role="dialog"
          aria-label={t('Комментарии')}
          className={cn(
            'fixed inset-x-0 bottom-0 z-50 flex max-h-[75dvh] flex-col rounded-t-2xl border border-border bg-surface shadow-popover',
            'lg:absolute lg:inset-x-auto lg:bottom-auto lg:right-24 lg:top-1/2 lg:max-h-[85%] lg:w-[420px] lg:-translate-y-1/2 lg:rounded-2xl',
          )}
        >
          <div className="relative flex items-center justify-center border-b border-border px-4 py-4">
            <button
              type="button"
              onClick={() => setCommentsOpen(false)}
              aria-label={t('Закрыть комментарии')}
              className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full hover:bg-surface-muted"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
            <h2 className="text-base font-bold text-foreground">{t('Комментарии')}</h2>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <CommentSection
              key={activePost.id}
              postId={activePost.id}
              canDelete={me?.userId === activePost.userId}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ReelItem({
  post,
  index,
  active,
  mounted,
  muted,
  onMutedChange,
  onOpenComments,
}: {
  post: Post;
  index: number;
  active: boolean;
  mounted: boolean;
  muted: boolean;
  onMutedChange: (muted: boolean) => void;
  onOpenComments: () => void;
}) {
  const t = useT();
  const { toast } = useToast();
  const { liked, likesCount, toggle: toggleLike, failed: likeFailed } = usePostLike(post);

  const [saved, setSaved] = useState(post.isFavoriteByMe);
  const [menuOpen, setMenuOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [favoritePost] = useFavoritePostMutation();
  const [unfavoritePost] = useUnfavoritePostMutation();

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

  const copyLink = () => {
    setMenuOpen(false);
    navigator.clipboard
      ?.writeText(`${window.location.origin}/post/${post.id}`)
      .then(() => toast(t('Ссылка скопирована'), 'success'))
      .catch(() => toast(t('Не удалось скопировать ссылку'), 'error'));
  };

  const actionClass =
    'flex flex-col items-center gap-1 text-xs font-semibold transition-transform active:scale-90';
  const circleClass =
    'flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-white/15 lg:hover:bg-surface-muted';

  return (
    <section
      data-reel-index={index}
      aria-label={`Reel ${post.userName}`}
      className="flex h-full snap-start snap-always items-center justify-center px-3 py-3"
    >
      <div className="relative aspect-[9/16] h-full max-h-[52rem] max-w-full">
        <div className="relative h-full w-full overflow-hidden rounded-xl bg-black">
          {mounted ? (
            <ReelVideo
              src={post.images?.[0]}
              active={active}
              muted={muted}
              onMutedChange={onMutedChange}
            />
          ) : null}

          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4 pr-16 text-white">
            <Link
              href={`/profile/${post.userId}`}
              className="pointer-events-auto mb-2 inline-flex items-center gap-2.5 hover:opacity-90"
            >
              <Avatar src={post.userAvatar} name={post.userName} size="sm" />
              <span className="text-sm font-semibold">{post.userName}</span>
            </Link>
            {post.content || post.title ? (
              <p className="line-clamp-2 text-sm leading-snug text-white/95">
                {post.content || post.title}
              </p>
            ) : null}
          </div>
        </div>

        <div className="absolute bottom-20 right-3 z-10 flex flex-col items-center gap-3 text-white lg:bottom-2 lg:left-full lg:right-auto lg:ml-4 lg:text-foreground">
          <button
            type="button"
            onClick={() => void toggleLike()}
            aria-pressed={liked}
            aria-label={liked ? t('Убрать лайк') : t('Поставить лайк')}
            className={actionClass}
          >
            <span className={circleClass}>
              <Heart
                className={cn('h-7 w-7', liked && 'fill-red-500 text-red-500')}
                aria-hidden="true"
              />
            </span>
            {formatCount(likesCount)}
          </button>

          <button
            type="button"
            onClick={onOpenComments}
            aria-label={t('Комментарии')}
            className={actionClass}
          >
            <span className={circleClass}>
              <MessageCircle className="h-7 w-7" aria-hidden="true" />
            </span>
            {formatCount(post.commentsCount)}
          </button>

          <button
            type="button"
            onClick={() => setShareOpen(true)}
            aria-label={t('Поделиться')}
            className={actionClass}
          >
            <span className={circleClass}>
              <Send className="h-7 w-7" aria-hidden="true" />
            </span>
          </button>

          <button
            type="button"
            onClick={toggleSave}
            aria-pressed={saved}
            aria-label={saved ? t('Убрать из сохранённых') : t('Сохранить')}
            className={actionClass}
          >
            <span className={circleClass}>
              <Bookmark className={cn('h-7 w-7', saved && 'fill-current')} aria-hidden="true" />
            </span>
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label={t('Ещё')}
              className={actionClass}
            >
              <span className={circleClass}>
                <MoreHorizontal className="h-7 w-7" aria-hidden="true" />
              </span>
            </button>

            {menuOpen ? (
              <div
                role="menu"
                className="absolute bottom-full right-0 z-20 mb-2 w-52 overflow-hidden rounded-xl border border-border bg-surface-raised py-1 text-sm text-foreground shadow-popover"
              >
                <Link
                  href={`/post/${post.id}`}
                  role="menuitem"
                  className="block px-4 py-2.5 hover:bg-surface-muted"
                >
                  {t('Открыть публикацию')}
                </Link>
                <button
                  type="button"
                  role="menuitem"
                  onClick={copyLink}
                  className="block w-full px-4 py-2.5 text-left hover:bg-surface-muted"
                >
                  {t('Копировать ссылку')}
                </button>
              </div>
            ) : null}
          </div>

          <Link
            href={`/profile/${post.userId}`}
            aria-label={t('Профиль {name}', { name: post.userName })}
            className="mt-1 block h-8 w-8 overflow-hidden rounded-md border-2 border-white/80 lg:border-border"
          >
            <Avatar src={post.userAvatar} name={post.userName} size="sm" className="h-full w-full rounded-none" />
          </Link>
        </div>
      </div>

      <SharePostModal postId={post.id} open={shareOpen} onClose={() => setShareOpen(false)} />
    </section>
  );
}

/**
 * The `<video>` of one reel. It plays while it is the active reel, restarts
 * when it becomes active again and shares the mute switch with the others.
 */
function ReelVideo({
  src,
  active,
  muted,
  onMutedChange,
}: {
  src?: string | null;
  active: boolean;
  muted: boolean;
  onMutedChange: (muted: boolean) => void;
}) {
  const t = useT();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const url = getMediaUrl(src);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = muted;
  }, [muted]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!active) {
      video.pause();
      video.currentTime = 0;
      return;
    }

    video.play().catch(() => {
      // Browsers block autoplay with sound until the page was used: retry muted.
      video.muted = true;
      onMutedChange(true);
      video.play().catch(() => {});
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to the reel becoming (in)active
  }, [active]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) video.play().catch(() => {});
    else video.pause();
  };

  return (
    <>
      {url ? (
        <video
          ref={videoRef}
          src={url}
          loop
          playsInline
          preload="auto"
          onClick={togglePlay}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onLoadedData={() => setLoading(false)}
          onWaiting={() => setLoading(true)}
          onPlaying={() => setLoading(false)}
          className="h-full w-full cursor-pointer object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-sm text-neutral-400">
          {t('Видео недоступно')}
        </div>
      )}

      {loading && url ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="h-9 w-9 animate-spin-slow rounded-full border-2 border-white/30 border-t-white" />
        </div>
      ) : null}

      {!playing && !loading && active ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-black/55 text-white">
            <Play className="h-8 w-8 translate-x-0.5 fill-white" aria-hidden="true" />
          </span>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => onMutedChange(!muted)}
        aria-label={muted ? t('Включить звук') : t('Выключить звук')}
        className="absolute bottom-4 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-transform hover:scale-110"
      >
        {muted ? (
          <VolumeX className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Volume2 className="h-4 w-4" aria-hidden="true" />
        )}
      </button>
    </>
  );
}
