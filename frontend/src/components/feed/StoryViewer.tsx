'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Heart,
  MoreHorizontal,
  Pause,
  Play,
  Send,
  Trash2,
  User,
  X,
} from 'lucide-react';

import { Avatar } from '@/components/ui/Avatar';
import { MediaImage } from '@/components/shared/MediaImage';
import { TimeAgo } from '@/components/shared/TimeAgo';
import { useToast } from '@/components/ui/Toast';
import { useGetOrCreateChatMutation, useSendMessageMutation } from '@/features/chats/chatsApi';
import { useGetMyProfileQuery } from '@/features/profiles/profilesApi';
import {
  useDeleteStoryMutation,
  useGetStoryViewersQuery,
  useLikeStoryMutation,
  useRecordStoryViewMutation,
  useUnlikeStoryMutation,
} from '@/features/stories/storiesApi';
import { getMediaUrl } from '@/lib/media';
import { cn, formatCount, getErrorMessage } from '@/lib/utils';
import type { UserStoriesGroup } from '@/types';
import { useT } from '@/lib/i18n/LocaleProvider';

/** How long one story stays on screen. */
const STORY_DURATION_MS = 5000;
/** Pressing longer than this on the picture pauses the story instead of navigating. */
const HOLD_MS = 220;

export interface StoryViewerProps {
  /** Every author that has stories, in tray order. */
  groups: UserStoriesGroup[];
  /** The author whose stories are open, or `null` when the viewer is closed. */
  activeUserId: number | null;
  /** Story to start with (default: the first one of the author). */
  initialStoryId?: number;
  onSelectUser: (userId: number) => void;
  onClose: () => void;
}

/**
 * Full screen story player.
 *
 * Opening a story shows the author's stories one after another; when they
 * run out the viewer continues with the next author in the tray, and closes
 * after the last one. The neighbouring authors are shown beside the card and
 * can be opened with a click.
 */
export function StoryViewer({
  groups,
  activeUserId,
  initialStoryId,
  onSelectUser,
  onClose,
}: StoryViewerProps) {
  const groupIndex = groups.findIndex((group) => group.userId === activeUserId);
  const group = groups[groupIndex];

  if (!group) return null;

  return (
    <StoryPlayer
      // A fresh player (story index 0, clean state) for every author.
      key={group.userId}
      groups={groups}
      groupIndex={groupIndex}
      initialStoryId={initialStoryId}
      onSelectUser={onSelectUser}
      onClose={onClose}
    />
  );
}

function StoryPlayer({
  groups,
  groupIndex,
  initialStoryId,
  onSelectUser,
  onClose,
}: {
  groups: UserStoriesGroup[];
  groupIndex: number;
  initialStoryId?: number;
  onSelectUser: (userId: number) => void;
  onClose: () => void;
}) {
  const t = useT();
  const { toast } = useToast();
  const group = groups[groupIndex];
  const previousGroup = groups[groupIndex - 1];
  const upcomingGroups = groups.slice(groupIndex + 1, groupIndex + 3);
  const nextGroup = groups[groupIndex + 1];

  const [index, setIndex] = useState(() =>
    Math.max(0, group.stories.findIndex((item) => item.id === initialStoryId)),
  );
  const [manualPause, setManualPause] = useState(false);
  const [holding, setHolding] = useState(false);
  const [replyFocused, setReplyFocused] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [viewersOpen, setViewersOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [likeOverride, setLikeOverride] = useState<{ id: number; liked: boolean } | null>(null);

  const holdTimer = useRef<number | null>(null);
  const held = useRef(false);

  const { data: me } = useGetMyProfileQuery();
  const [likeStory] = useLikeStoryMutation();
  const [unlikeStory] = useUnlikeStoryMutation();
  const [recordView] = useRecordStoryViewMutation();
  const [deleteStory, { isLoading: isDeleting }] = useDeleteStoryMutation();
  const [openChat] = useGetOrCreateChatMutation();
  const [sendMessage, { isLoading: isReplying }] = useSendMessageMutation();

  const stories = group.stories;
  const story = stories[Math.min(index, stories.length - 1)];
  const isOwner = me?.userId === group.userId;

  const { data: viewers, isLoading: viewersLoading } = useGetStoryViewersQuery(story?.id ?? 0, {
    skip: !isOwner || !viewersOpen || !story,
  });

  const running = !(manualPause || holding || replyFocused || menuOpen || viewersOpen);

  const goNext = useCallback(() => {
    if (index + 1 < stories.length) setIndex(index + 1);
    else if (nextGroup) onSelectUser(nextGroup.userId);
    else onClose();
  }, [index, stories.length, nextGroup, onSelectUser, onClose]);

  const goPrevious = useCallback(() => {
    if (index > 0) setIndex(index - 1);
    else if (previousGroup) onSelectUser(previousGroup.userId);
  }, [index, previousGroup, onSelectUser]);

  // Count the view once per story.
  const storyId = story?.id;
  useEffect(() => {
    if (storyId === undefined) return;
    recordView(storyId);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the view is recorded once per story
  }, [storyId]);

  // Keyboard navigation, and no page scrolling behind the viewer.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const typing = (event.target as HTMLElement | null)?.tagName === 'INPUT';
      if (event.key === 'Escape') onClose();
      if (typing) return;
      if (event.key === 'ArrowRight') goNext();
      if (event.key === 'ArrowLeft') goPrevious();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [goNext, goPrevious, onClose]);

  useEffect(() => {
    return () => {
      if (holdTimer.current !== null) window.clearTimeout(holdTimer.current);
    };
  }, []);

  if (!story) return null;

  const liked = likeOverride?.id === story.id ? likeOverride.liked : story.isLikedByMe;

  const toggleLike = async () => {
    const next = !liked;
    setLikeOverride({ id: story.id, liked: next });

    try {
      if (next) await likeStory(story.id).unwrap();
      else await unlikeStory(story.id).unwrap();
    } catch {
      setLikeOverride({ id: story.id, liked: !next });
    }
  };

  const sendReply = async (event: React.FormEvent) => {
    event.preventDefault();

    const text = replyText.trim();
    if (!text || isOwner) return;

    try {
      const chat = await openChat(group.userId).unwrap();
      await sendMessage({ chatId: chat.id, text: t('Ответ на историю: {text}', { text }) }).unwrap();
      setReplyText('');
      toast(t('Ответ отправлен'), 'success');
    } catch (error) {
      toast(getErrorMessage(error, t('Не удалось отправить ответ')), 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteStory(story.id).unwrap();
      toast(t('История удалена'), 'success');
      setMenuOpen(false);
      setConfirmDelete(false);
      // The list shrinks after the refresh: the next story slides into this
      // index, so only leave when this was the last one.
      if (index + 1 >= stories.length) goNext();
    } catch (error) {
      toast(getErrorMessage(error, t('Не удалось удалить историю')), 'error');
    }
  };

  // Tap = navigate, press and hold = pause.
  const pressStart = () => {
    held.current = false;
    holdTimer.current = window.setTimeout(() => {
      held.current = true;
      setHolding(true);
    }, HOLD_MS);
  };
  const pressEnd = (action: () => void) => {
    if (holdTimer.current !== null) window.clearTimeout(holdTimer.current);
    if (held.current) {
      held.current = false;
      setHolding(false);
      return;
    }
    action();
  };
  const pressCancel = () => {
    if (holdTimer.current !== null) window.clearTimeout(holdTimer.current);
    held.current = false;
    setHolding(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('История {name}', { name: group.userName })}
      className="fixed inset-0 z-50 bg-[#121212] text-white"
    >
      <style>{'@keyframes story-progress{from{width:0%}to{width:100%}}'}</style>

      <span className="absolute left-5 top-4 text-2xl font-bold italic tracking-tight">
        Instagram
      </span>

      <button
        type="button"
        onClick={onClose}
        aria-label={t('Закрыть историю')}
        className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-white/10"
      >
        <X className="h-7 w-7" aria-hidden="true" />
      </button>

      <div className="flex h-full items-center justify-center gap-3 px-3 py-3 sm:gap-5">
        {previousGroup ? (
          <NeighbourCard group={previousGroup} onSelect={onSelectUser} className="hidden xl:flex" />
        ) : null}

        {index > 0 || previousGroup ? (
          <NavArrow direction="previous" onClick={goPrevious} />
        ) : (
          <span className="hidden w-9 sm:block" aria-hidden="true" />
        )}

        <div className="flex h-full max-h-[900px] w-full max-w-[430px] flex-col rounded-2xl bg-[#1c1c1c] shadow-2xl">
          <div className="px-3 pb-2 pt-3">
            <div className="mb-3 flex gap-1" aria-hidden="true">
              {stories.map((item, position) => (
                <span key={item.id} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/30">
                  {position < index ? (
                    <span className="block h-full w-full bg-white" />
                  ) : position === index ? (
                    <span
                      key={`${story.id}-${index}`}
                      className="block h-full bg-white"
                      style={{
                        animation: `story-progress ${STORY_DURATION_MS}ms linear forwards`,
                        animationPlayState: running ? 'running' : 'paused',
                      }}
                      onAnimationEnd={goNext}
                    />
                  ) : null}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2.5">
              <Link href={`/profile/${group.userId}`} onClick={onClose} aria-label={t('Профиль {name}', { name: group.userName })}>
                <Avatar src={group.userAvatar} name={group.userName} size="sm" />
              </Link>

              <Link
                href={`/profile/${group.userId}`}
                onClick={onClose}
                className="min-w-0 truncate text-sm font-semibold hover:underline"
              >
                {group.userName}
              </Link>
              <TimeAgo value={story.createdAt} className="shrink-0 text-sm text-white/60" />

              <div className="ml-auto flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setManualPause((value) => !value)}
                  aria-label={manualPause ? t('Продолжить') : t('Пауза')}
                  className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-white/10"
                >
                  {manualPause ? (
                    <Play className="h-5 w-5 fill-current" aria-hidden="true" />
                  ) : (
                    <Pause className="h-5 w-5 fill-current" aria-hidden="true" />
                  )}
                </button>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen((value) => !value);
                      setConfirmDelete(false);
                    }}
                    aria-haspopup="menu"
                    aria-expanded={menuOpen}
                    aria-label={t('Ещё')}
                    className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-white/10"
                  >
                    <MoreHorizontal className="h-6 w-6" aria-hidden="true" />
                  </button>

                  {menuOpen ? (
                    <div
                      role="menu"
                      className="absolute right-0 top-10 z-30 w-52 overflow-hidden rounded-xl bg-[#2a2a2a] py-1 text-sm shadow-xl"
                    >
                      {isOwner ? (
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => (confirmDelete ? handleDelete() : setConfirmDelete(true))}
                          disabled={isDeleting}
                          className="flex w-full items-center gap-2 px-4 py-2.5 text-left font-medium text-red-400 hover:bg-white/10 disabled:opacity-60"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                          {confirmDelete ? t('Нажмите ещё раз — удалить') : t('Удалить историю')}
                        </button>
                      ) : (
                        <Link
                          href={`/profile/${group.userId}`}
                          role="menuitem"
                          onClick={onClose}
                          className="flex items-center gap-2 px-4 py-2.5 hover:bg-white/10"
                        >
                          <User className="h-4 w-4" aria-hidden="true" />
                          {t('Перейти в профиль')}
                        </Link>
                      )}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className="relative mx-3 min-h-0 flex-1 overflow-hidden rounded-xl bg-black">
            <MediaImage
              src={story.imageUrl}
              alt={t('История {name}', { name: group.userName })}
              className="absolute inset-0 h-full"
              imgClassName="object-contain"
              loading="eager"
            />

            <button
              type="button"
              aria-label={t('Предыдущая история')}
              onPointerDown={pressStart}
              onPointerUp={() => pressEnd(goPrevious)}
              onPointerLeave={pressCancel}
              onPointerCancel={pressCancel}
              className="absolute inset-y-0 left-0 w-1/3 cursor-pointer"
            />
            <button
              type="button"
              aria-label={t('Следующая история')}
              onPointerDown={pressStart}
              onPointerUp={() => pressEnd(goNext)}
              onPointerLeave={pressCancel}
              onPointerCancel={pressCancel}
              className="absolute inset-y-0 right-0 w-2/3 cursor-pointer"
            />

            {viewersOpen ? (
              <div className="absolute inset-x-0 bottom-0 z-10 max-h-[60%] overflow-y-auto rounded-t-2xl bg-[#1c1c1c] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold">{t('Просмотры: {count}', { count: formatCount(story.viewsCount) })}</h3>
                  <button
                    type="button"
                    onClick={() => setViewersOpen(false)}
                    aria-label={t('Закрыть список')}
                    className="rounded-full p-1 hover:bg-white/10"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>

                {viewersLoading ? (
                  <p className="py-4 text-center text-sm text-white/60">{t('Загрузка…')}</p>
                ) : (viewers?.length ?? 0) === 0 ? (
                  <p className="py-4 text-center text-sm text-white/60">{t('Пока никто не смотрел')}</p>
                ) : (
                  <ul className="space-y-3">
                    {viewers?.map((viewer) => (
                      <li key={viewer.userId} className="flex items-center gap-3">
                        <Avatar src={viewer.userAvatar} name={viewer.userName} size="sm" />
                        <span className="text-sm font-medium">{viewer.userName}</span>
                        <TimeAgo value={viewer.viewedAt} className="ml-auto text-xs text-white/50" />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : null}
          </div>

          {isOwner ? (
            <div className="flex items-center gap-4 px-4 py-3 text-sm">
              <button
                type="button"
                onClick={() => setViewersOpen((value) => !value)}
                className="flex items-center gap-2 rounded-full px-3 py-2 font-medium hover:bg-white/10"
              >
                <Eye className="h-5 w-5" aria-hidden="true" />
                {formatCount(story.viewsCount)}
              </button>
              <span className="flex items-center gap-2 text-white/80">
                <Heart className="h-5 w-5" aria-hidden="true" />
                {formatCount(story.likesCount)}
              </span>
            </div>
          ) : (
            <form onSubmit={sendReply} className="flex items-center gap-3 px-3 py-3">
              <input
                value={replyText}
                onChange={(event) => setReplyText(event.target.value)}
                onFocus={() => setReplyFocused(true)}
                onBlur={() => setReplyFocused(false)}
                maxLength={500}
                placeholder={t('Ответить {name}…', { name: group.userName })}
                aria-label={t('Ответ на историю')}
                className="min-w-0 flex-1 rounded-full border border-white/40 bg-transparent px-4 py-2.5 text-sm placeholder:text-white/60 focus:border-white focus:outline-none"
              />

              <button
                type="button"
                onClick={toggleLike}
                aria-pressed={liked}
                aria-label={liked ? t('Убрать лайк') : t('Поставить лайк')}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-transform hover:bg-white/10 active:scale-90"
              >
                <Heart
                  className={cn('h-7 w-7', liked && 'fill-red-500 text-red-500')}
                  aria-hidden="true"
                />
              </button>

              <button
                type="submit"
                disabled={!replyText.trim() || isReplying}
                aria-label={t('Отправить ответ')}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-white/10 disabled:opacity-40"
              >
                <Send className="h-6 w-6" aria-hidden="true" />
              </button>
            </form>
          )}
        </div>

        <NavArrow direction="next" onClick={goNext} />

        {upcomingGroups.length > 0 ? (
          <div className="hidden gap-4 xl:flex">
            {upcomingGroups.map((item) => (
              <NeighbourCard key={item.userId} group={item} onSelect={onSelectUser} className="flex" />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function NavArrow({
  direction,
  onClick,
}: {
  direction: 'previous' | 'next';
  onClick: () => void;
}) {
  const t = useT();
  const Icon = direction === 'next' ? ChevronRight : ChevronLeft;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === 'next' ? t('Следующая история') : t('Предыдущая история')}
      className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/30 sm:flex"
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
    </button>
  );
}

/** Dimmed preview of a neighbouring author; a click opens their stories. */
function NeighbourCard({
  group,
  onSelect,
  className,
}: {
  group: UserStoriesGroup;
  onSelect: (userId: number) => void;
  className?: string;
}) {
  const t = useT();
  const cover = getMediaUrl(group.stories[0]?.imageUrl);

  return (
    <button
      type="button"
      onClick={() => onSelect(group.userId)}
      aria-label={t('Открыть историю {name}', { name: group.userName })}
      className={cn(
        'relative h-[min(52dvh,430px)] w-[190px] shrink-0 flex-col items-center justify-center gap-1 overflow-hidden rounded-xl bg-[#1c1c1c]',
        'transition-opacity hover:opacity-90',
        className,
      )}
    >
      {cover ? (
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center opacity-30 blur-[2px]"
          style={{ backgroundImage: `url("${cover}")` }}
        />
      ) : null}
      <span className="absolute inset-0 bg-black/40" aria-hidden="true" />

      <span className="relative flex flex-col items-center gap-1">
        <Avatar src={group.userAvatar} name={group.userName} size="lg" ring />
        <span className="max-w-[160px] truncate text-sm font-semibold">{group.userName}</span>
        <TimeAgo value={group.stories[0]?.createdAt} className="text-sm text-white/70" />
      </span>
    </button>
  );
}
