'use client';

import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Heart, X } from 'lucide-react';

import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { MediaImage } from '@/components/shared/MediaImage';
import { useLikeStoryMutation, useRecordStoryViewMutation, useUnlikeStoryMutation } from '@/features/stories/storiesApi';
import { formatCount, formatTime } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { UserStoriesGroup } from '@/types';

const AUTO_ADVANCE_MS = 5000;

/**
 * Full screen story player.
 *
 * Progress bars reflect the position inside the story list, the viewer
 * advances automatically and can be navigated with the keyboard.
 */
export function StoryViewer({
  group,
  onClose,
}: {
  group: UserStoriesGroup | null;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [likeOverride, setLikeOverride] = useState<{ id: number; liked: boolean } | null>(null);

  const [likeStory] = useLikeStoryMutation();
  const [unlikeStory] = useUnlikeStoryMutation();
  const [recordView] = useRecordStoryViewMutation();

  const stories = group?.stories ?? [];
  const story = stories[index];

  const goNext = useCallback(() => {
    setIndex((current) => {
      if (current + 1 < stories.length) return current + 1;
      onClose();
      return current;
    });
  }, [onClose, stories.length]);

  const goPrevious = useCallback(() => {
    setIndex((current) => (current > 0 ? current - 1 : current));
  }, []);

  useEffect(() => {
    if (!story) return;

    recordView(story.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the view is recorded once per story
  }, [story?.id]);

  useEffect(() => {
    if (!group) return;

    const timer = window.setTimeout(goNext, AUTO_ADVANCE_MS);
    return () => window.clearTimeout(timer);
  }, [group, goNext, index]);

  useEffect(() => {
    if (!group) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowRight') goNext();
      if (event.key === 'ArrowLeft') goPrevious();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [group, goNext, goPrevious, onClose]);

  if (!group || !story) return null;

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

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`История ${group.userName}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Закрыть историю"
        className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-pill text-white transition-colors hover:bg-white/10"
      >
        <X className="h-6 w-6" aria-hidden="true" />
      </button>

      <button
        type="button"
        onClick={goPrevious}
        disabled={index === 0}
        aria-label="Предыдущая история"
        className="absolute left-4 z-20 flex h-10 w-10 items-center justify-center rounded-pill text-white transition-colors hover:bg-white/10 disabled:opacity-30"
      >
        <ChevronLeft className="h-7 w-7" aria-hidden="true" />
      </button>

      <button
        type="button"
        onClick={goNext}
        aria-label="Следующая история"
        className="absolute right-4 z-20 flex h-10 w-10 items-center justify-center rounded-pill text-white transition-colors hover:bg-white/10"
      >
        <ChevronRight className="h-7 w-7" aria-hidden="true" />
      </button>

      <div className="relative flex h-[85vh] w-full max-w-[420px] flex-col overflow-hidden bg-neutral-900">
        <MediaImage
          src={story.imageUrl}
          alt={`История ${group.userName}`}
          className="absolute inset-0"
          imgClassName="object-contain"
          loading="eager"
        />

        <div className="absolute inset-x-0 top-0 z-10 bg-gradient-to-b from-black/70 to-transparent p-3">
          <div className="mb-3 flex gap-1">
            {stories.map((item, position) => (
              <span key={item.id} className="h-0.5 flex-1 overflow-hidden rounded-pill bg-white/30">
                <span
                  className={cn(
                    'block h-full bg-white transition-all',
                    position < index && 'w-full',
                    position === index && 'w-1/2',
                  )}
                />
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2 text-white">
            <Avatar src={group.userAvatar} name={group.userName} size="sm" ring />
            <span className="text-sm font-semibold">{group.userName}</span>
            <span className="text-xs text-white/70">{formatTime(story.createdAt)}</span>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-10 flex items-center gap-4 bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleLike}
            aria-pressed={liked}
            aria-label={liked ? 'Убрать лайк' : 'Поставить лайк'}
            className="text-white hover:bg-white/10 hover:text-white"
            icon={
              <Heart className={cn('h-6 w-6', liked && 'fill-current text-destructive')} />
            }
          />

          <span className="text-xs text-white/80">
            {formatCount(story.likesCount)} отметок «Нравится»
          </span>

          <span className="ml-auto text-xs text-white/80">
            {formatCount(story.viewsCount)} просмотров
          </span>
        </div>
      </div>
    </div>
  );
}
