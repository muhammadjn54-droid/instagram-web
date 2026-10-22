'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Clapperboard, Heart, MessageCircle, Bookmark, Music2 } from 'lucide-react';

import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { Pagination } from '@/components/ui/Pagination';
import { VideoPlayer } from '@/components/shared/VideoPlayer';
import { Avatar } from '@/components/ui/Avatar';
import { usePageParam } from '@/components/shared/usePageParam';
import {
  useGetReelsQuery,
  useLikePostMutation,
  useUnlikePostMutation,
  useFavoritePostMutation,
  useUnfavoritePostMutation,
} from '@/features/posts/postsApi';
import { formatCount, cn } from '@/lib/utils';
import type { Post } from '@/types';

function ReelCard({ post }: { post: Post }) {
  const [liked, setLiked] = useState(post.isLikedByMe);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [saved, setSaved] = useState(post.isFavoriteByMe);

  const [likePost] = useLikePostMutation();
  const [unlikePost] = useUnlikePostMutation();
  const [favoritePost] = useFavoritePostMutation();
  const [unfavoritePost] = useUnfavoritePostMutation();

  const toggleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !liked;
    setLiked(next);
    setLikesCount((count) => count + (next ? 1 : -1));
    try {
      if (next) await likePost(post.id).unwrap();
      else await unlikePost(post.id).unwrap();
    } catch {
      setLiked(!next);
      setLikesCount((count) => count + (next ? -1 : 1));
    }
  };

  const toggleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !saved;
    setSaved(next);
    try {
      if (next) await favoritePost(post.id).unwrap();
      else await unfavoritePost(post.id).unwrap();
    } catch {
      setSaved(!next);
    }
  };

  return (
    <div className="relative mx-auto flex w-full max-w-[380px] flex-col items-center justify-center py-2">
      <div className="relative aspect-[9/16] w-full overflow-hidden rounded-[20px] bg-black shadow-xl">
        <VideoPlayer
          src={post.images?.[0]}
          aspectClassName="aspect-[9/16] h-full w-full"
          loop
        />

        {/* Bottom author and caption overlay */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent p-4 text-white">
          <div className="pointer-events-auto mb-2 flex items-center gap-2.5">
            <Link
              href={`/profile/${post.userId}`}
              className="flex items-center gap-2 hover:opacity-90"
            >
              <Avatar src={post.userAvatar} name={post.userName} size="sm" />
              <span className="text-sm font-semibold">{post.userName}</span>
            </Link>
          </div>

          <p className="line-clamp-2 text-xs leading-relaxed text-white/95 mb-2">
            {post.content || post.title}
          </p>

          <div className="flex items-center gap-1.5 text-[11px] text-white/80">
            <Music2 className="h-3.5 w-3.5 animate-spin-slow" aria-hidden="true" />
            <span className="truncate">Овози аслӣ • {post.userName}</span>
          </div>
        </div>

        {/* Right action column */}
        <div className="absolute bottom-6 right-3 z-20 flex flex-col items-center gap-3 text-white">
          <button
            type="button"
            onClick={toggleLike}
            aria-label={liked ? 'Убрать лайк' : 'Поставить лайк'}
            className="flex flex-col items-center gap-1 transition-transform active:scale-90"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm">
              <Heart
                className={cn(
                  'h-6 w-6',
                  liked ? 'fill-red-500 text-red-500' : 'text-white',
                )}
              />
            </div>
            <span className="text-[11px] font-semibold">{formatCount(likesCount)}</span>
          </button>

          <Link
            href={`/post/${post.id}#comments`}
            aria-label="Комментарии"
            className="flex flex-col items-center gap-1 transition-transform active:scale-90"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm">
              <MessageCircle className="h-6 w-6 text-white" />
            </div>
            <span className="text-[11px] font-semibold">
              {formatCount(post.commentsCount)}
            </span>
          </Link>

          <button
            type="button"
            onClick={toggleSave}
            aria-label={saved ? 'Убрать из сохранённых' : 'Сохранить'}
            className="flex flex-col items-center gap-1 transition-transform active:scale-90"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm">
              <Bookmark
                className={cn('h-5 w-5', saved ? 'fill-white text-white' : 'text-white')}
              />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Reels — vertical publications.
 */
export function ReelsView() {
  const [page, setPage] = usePageParam();
  const { data, isLoading, isError, error, refetch } = useGetReelsQuery({
    pageNumber: page,
    pageSize: 10,
  });

  if (isLoading) {
    return <LoadingState label="Загружаем Reels…" />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Не удалось загрузить Reels"
        message={error?.message}
        onRetry={refetch}
      />
    );
  }

  const items = data?.items ?? [];

  return (
    <div className="mx-auto w-full max-w-[48rem] space-y-6 px-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight text-foreground">Reels</h1>
        <span className="text-xs text-muted-foreground">
          {data?.totalCount ?? items.length} видео
        </span>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={<Clapperboard className="h-6 w-6" aria-hidden="true" />}
          title="Здесь пока нет Reels"
          description="Опубликуйте запись с галочкой «Опубликовать как Reels»."
        />
      ) : (
        <div className="space-y-6">
          {items.map((post) => (
            <ReelCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {data && data.totalPages > 1 ? (
        <Pagination
          page={data.pageNumber || page}
          totalPages={data.totalPages}
          totalCount={data.totalCount}
          onPageChange={setPage}
        />
      ) : null}
    </div>
  );
}
