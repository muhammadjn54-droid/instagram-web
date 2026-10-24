'use client';

import { useRef, useState } from 'react';

import { useLazyGetPostQuery, useLikePostMutation, useUnlikePostMutation } from './postsApi';
import type { Post } from '@/types';

/**
 * Like button state shared by every post surface (feed card, reel).
 *
 * - The heart and the counter change immediately (optimistic update).
 * - Clicks are serialised: a second click while a request is in flight is
 *   ignored, so "like" and "unlike" can never overtake each other.
 * - If the server rejects the request (for example `409 already liked` when
 *   the screen showed stale data) the state is re-read from the server
 *   instead of blindly rolling back, so the heart always ends up in the
 *   state the server really has.
 */
export function usePostLike(post: Pick<Post, 'id' | 'isLikedByMe' | 'likesCount'>) {
  const [liked, setLiked] = useState(post.isLikedByMe);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [failed, setFailed] = useState(false);
  const busy = useRef(false);

  const [likePost] = useLikePostMutation();
  const [unlikePost] = useUnlikePostMutation();
  const [loadPost] = useLazyGetPostQuery();

  const toggle = async () => {
    if (busy.current) return;
    busy.current = true;
    setFailed(false);

    const next = !liked;
    setLiked(next);
    setLikesCount((count) => Math.max(0, count + (next ? 1 : -1)));

    try {
      if (next) await likePost(post.id).unwrap();
      else await unlikePost(post.id).unwrap();
    } catch {
      try {
        const fresh = await loadPost(post.id).unwrap();
        setLiked(fresh.isLikedByMe);
        setLikesCount(fresh.likesCount);
      } catch {
        setLiked(!next);
        setLikesCount((count) => Math.max(0, count + (next ? -1 : 1)));
        setFailed(true);
      }
    } finally {
      busy.current = false;
    }
  };

  return { liked, likesCount, toggle, failed };
}
