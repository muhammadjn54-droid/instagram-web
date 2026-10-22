'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { MessageCircle } from 'lucide-react';

import { Avatar } from '@/components/ui/Avatar';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { TimeAgo } from '@/components/shared/TimeAgo';
import { MessageThread } from './MessageThread';
import { useGetChatsQuery } from '@/features/chats/chatsApi';
import { cn } from '@/lib/utils';

/**
 * Messages screen: the conversation list and the active thread.
 */
export function MessagesView() {
  const params = useParams<{ chatId: string }>();
  const activeChatId = params?.chatId ? Number(params.chatId) : null;

  const { data, isLoading, isError, error, refetch } = useGetChatsQuery();
  const chats = data ?? [];

  return (
    <div className="mx-auto flex h-full w-full max-w-[64rem] flex-col lg:flex-row">
      <aside
        aria-label="Список диалогов"
        className={cn(
          'w-full shrink-0 border-border lg:w-80 lg:border-r',
          activeChatId ? 'hidden lg:block' : 'block',
        )}
      >
        <div className="border-b border-border px-4 py-3">
          <h1 className="text-sm font-bold text-foreground">Сообщения</h1>
        </div>

        {isLoading ? (
          <LoadingState label="Загружаем диалоги…" />
        ) : isError ? (
          <ErrorState message={error?.message} onRetry={refetch} />
        ) : chats.length === 0 ? (
          <EmptyState
            icon={<MessageCircle className="h-6 w-6" aria-hidden="true" />}
            title="Диалогов пока нет"
            description="Откройте профиль пользователя и нажмите «Написать»."
            className="m-4 border-0"
          />
        ) : (
          <ul className="max-h-[calc(100dvh-13rem)] overflow-y-auto">
            {chats.map((chat) => (
              <li key={chat.id}>
                <Link
                  href={`/messages/${chat.id}`}
                  className={cn(
                    'flex items-center gap-3 border-b border-border px-4 py-3 transition-colors hover:bg-surface-muted',
                    activeChatId === chat.id && 'bg-surface-muted',
                  )}
                >
                  <Avatar
                    src={chat.otherUser?.avatar}
                    name={chat.otherUser?.fullName ?? chat.otherUser?.userName}
                    size="md"
                  />

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-foreground">
                      {chat.otherUser?.fullName || chat.otherUser?.userName}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {chat.lastMessage?.text ?? 'Нет сообщений'}
                    </span>
                  </span>

                  {chat.lastMessage ? (
                    <TimeAgo
                      value={chat.lastMessage.createdAt}
                      className="shrink-0 text-[10px] text-muted-foreground"
                    />
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </aside>

      <section
        aria-label="Переписка"
        className={cn(
          'min-h-[calc(100dvh-8rem)] flex-1',
          activeChatId ? 'block' : 'hidden lg:block',
        )}
      >
        {activeChatId ? (
          <MessageThread chatId={activeChatId} />
        ) : (
          <div className="flex h-full items-center justify-center">
            <EmptyState
              icon={<MessageCircle className="h-6 w-6" aria-hidden="true" />}
              title="Выберите диалог"
              description="Откройте чат слева, чтобы прочитать переписку."
              className="border-0"
            />
          </div>
        )}
      </section>
    </div>
  );
}
