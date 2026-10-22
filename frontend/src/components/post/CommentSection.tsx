'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';

import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { TimeAgo } from '@/components/shared/TimeAgo';
import { useAddCommentMutation, useDeleteCommentMutation, useGetCommentsQuery } from '@/features/comments/commentsApi';
import { useGetMyProfileQuery } from '@/features/profiles/profilesApi';
import { useToast } from '@/components/ui/Toast';
import { formatCount } from '@/lib/utils';
import type { Comment } from '@/types';

export interface CommentSectionProps {
  postId: number;
  /** Users allowed to delete a comment. */
  canDelete?: boolean;
}

/**
 * Comments of a post with an inline composer.
 */
export function CommentSection({ postId, canDelete = false }: CommentSectionProps) {
  const { toast } = useToast();
  const { data: profile } = useGetMyProfileQuery();

  const [text, setText] = useState('');

  const { data, isLoading, isError, error, refetch } = useGetCommentsQuery({
    postId,
    pageNumber: 1,
    pageSize: 50,
  });

  const [addComment, { isLoading: isAdding }] = useAddCommentMutation();
  const [deleteComment] = useDeleteCommentMutation();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const value = text.trim();
    if (!value) return;

    try {
      await addComment({ postId, comment: value }).unwrap();
      setText('');
    } catch {
      toast('Не удалось отправить комментарий', 'error');
    }
  };

  const handleDelete = async (comment: Comment) => {
    try {
      await deleteComment({ commentId: comment.id, postId }).unwrap();
      toast('Комментарий удалён', 'success');
    } catch {
      toast('Не удалось удалить комментарий', 'error');
    }
  };

  return (
    <section id="comments" className="space-y-4">
      <h2 className="text-sm font-semibold text-foreground">
        {data ? `${formatCount(data.totalCount)} комментариев` : 'Комментарии'}
      </h2>

      {isLoading ? (
        <LoadingState label="Загружаем комментарии…" />
      ) : isError ? (
        <ErrorState message={error?.message} onRetry={refetch} />
      ) : (data?.items.length ?? 0) === 0 ? (
        <EmptyState
          title="Пока нет комментариев"
          description="Будьте первым, кто оставит запись."
          className="py-10"
        />
      ) : (
        <ul className="space-y-4">
          {data?.items.map((comment) => (
            <li key={comment.id} className="flex gap-3">
              <Avatar src={comment.userAvatar} name={comment.userName} size="sm" />

              <div className="min-w-0 flex-1">
                <p className="text-sm leading-relaxed text-foreground">
                  <span className="mr-1 font-semibold">{comment.userName}</span>
                  {comment.content}
                </p>

                <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                  <TimeAgo value={comment.createdAt} />
                  {canDelete ? (
                    <button
                      type="button"
                      onClick={() => handleDelete(comment)}
                      className="font-medium transition-colors hover:text-destructive"
                    >
                      Удалить
                    </button>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="flex items-center gap-3 border-t border-border pt-4">
        <Avatar src={profile?.avatar} name={profile?.fullName ?? profile?.userName} size="sm" />

        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Добавьте комментарий…"
          aria-label="Текст комментария"
          maxLength={1000}
          className="min-w-0 flex-1 bg-transparent text-sm text-foreground placeholder:text-subtle-foreground focus:outline-none"
        />

        <Button
          type="submit"
          size="icon"
          variant="ghost"
          aria-label="Отправить комментарий"
          loading={isAdding}
          disabled={!text.trim()}
          icon={<Send className="h-4 w-4" />}
        />
      </form>
    </section>
  );
}
