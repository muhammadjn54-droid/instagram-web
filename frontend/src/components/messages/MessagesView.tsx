'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { MessageCircle, Search, SquarePen } from 'lucide-react';

import { Avatar } from '@/components/ui/Avatar';
import { ErrorState, LoadingState } from '@/components/ui/States';
import { TimeAgo } from '@/components/shared/TimeAgo';
import { MessageThread } from './MessageThread';
import { NewChatModal } from './NewChatModal';
import { useGetChatsQuery } from '@/features/chats/chatsApi';
import { useGetMyProfileQuery } from '@/features/profiles/profilesApi';
import { parseSharedPost } from '@/lib/shareLink';
import { cn } from '@/lib/utils';
import type { Chat } from '@/types';
import { useT } from '@/lib/i18n/LocaleProvider';
import { tr, type Translate } from '@/lib/i18n/core';

type Tab = 'primary' | 'general' | 'requests';

const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'primary', label: tr('Основные') },
  { id: 'general', label: tr('Общие') },
  { id: 'requests', label: tr('Запросы') },
];

/** Short text under the name in the conversation list. */
function previewOf(chat: Chat, myId: number | undefined, t: Translate): string {
  const message = chat.lastMessage;
  if (!message) return t('Нет сообщений');

  const { postId, note } = parseSharedPost(message.text);
  const own = message.senderId === myId ? t('Вы: ') : '';

  if (postId) return `${own}${note || t('Отправлена публикация')}`;
  if (message.text) return `${own}${message.text}`;
  if (message.fileUrl) return `${own}${t('Вложение')}`;
  return t('Нет сообщений');
}

/**
 * Messages screen: conversation list on the left, the open thread on the right.
 *
 * It fills the whole height next to the sidebar. On phones only one of the two
 * columns is visible at a time.
 */
export function MessagesView() {
  const t = useT();
  const params = useParams<{ chatId: string }>();
  const activeChatId = params?.chatId ? Number(params.chatId) : null;

  const { data: me } = useGetMyProfileQuery();
  const { data, isLoading, isError, error, refetch } = useGetChatsQuery(undefined, {
    pollingInterval: 8000,
  });

  const [tab, setTab] = useState<Tab>('primary');
  const [search, setSearch] = useState('');
  const [newChatOpen, setNewChatOpen] = useState(false);

  const needle = search.trim().toLowerCase();
  const chats = (data ?? []).filter((chat) => {
    if (!needle) return true;
    const other = chat.otherUser;
    return (
      other?.fullName?.toLowerCase().includes(needle) ||
      other?.userName?.toLowerCase().includes(needle)
    );
  });

  return (
    <div className="-mb-20 flex h-[calc(100dvh-7rem)] lg:-mb-10 lg:h-dvh">
      <aside
        aria-label={t('Список диалогов')}
        className={cn(
          'min-h-0 w-full shrink-0 flex-col border-border lg:flex lg:w-[400px] lg:border-r xl:w-[430px]',
          activeChatId ? 'hidden' : 'flex',
        )}
      >
        <div className="flex items-center justify-between px-5 pb-3 pt-7">
          <h1 className="truncate text-xl font-bold text-foreground">
            {me?.userName ?? t('Сообщения')}
          </h1>
          <button
            type="button"
            onClick={() => setNewChatOpen(true)}
            aria-label={t('Новое сообщение')}
            className="flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-surface-muted"
          >
            <SquarePen className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        <div role="tablist" aria-label={t('Тип диалогов')} className="flex border-b border-border">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              onClick={() => setTab(item.id)}
              className={cn(
                'flex-1 border-b-2 py-3 text-sm font-semibold transition-colors',
                tab === item.id
                  ? 'border-foreground text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              {t(item.label)}
            </button>
          ))}
        </div>

        <div className="px-4 py-3">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t('Поиск')}
              aria-label={t('Поиск по диалогам')}
              className="w-full rounded-pill bg-surface-muted py-2.5 pl-12 pr-4 text-sm text-foreground placeholder:text-subtle-foreground focus:outline-none"
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto pb-4">
          {tab !== 'primary' ? (
            <div className="flex flex-col items-center gap-2 px-8 py-16 text-center">
              <p className="text-sm font-semibold text-foreground">
                {tab === 'general' ? t('Общих диалогов нет') : t('Запросов нет')}
              </p>
              <p className="text-sm text-muted-foreground">
                {t('Все ваши переписки находятся во вкладке «Основные».')}
              </p>
            </div>
          ) : isLoading ? (
            <LoadingState label={t('Загружаем диалоги…')} />
          ) : isError ? (
            <ErrorState message={error?.message} onRetry={refetch} />
          ) : chats.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-8 py-16 text-center">
              <MessageCircle className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
              <p className="text-sm font-semibold text-foreground">
                {needle ? t('Ничего не найдено') : t('Диалогов пока нет')}
              </p>
              {!needle ? (
                <button
                  type="button"
                  onClick={() => setNewChatOpen(true)}
                  className="text-sm font-semibold text-accent hover:underline"
                >
                  {t('Написать сообщение')}
                </button>
              ) : null}
            </div>
          ) : (
            <ul>
              {chats.map((chat) => {
                const active = activeChatId === chat.id;

                return (
                  <li key={chat.id} className="px-2">
                    <Link
                      href={`/messages/${chat.id}`}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-surface-muted',
                        active && 'bg-surface-muted',
                      )}
                    >
                      <Avatar
                        src={chat.otherUser?.avatar}
                        name={chat.otherUser?.fullName || chat.otherUser?.userName}
                        size="lg"
                      />

                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[15px] font-medium text-foreground">
                          {chat.otherUser?.fullName || chat.otherUser?.userName}
                        </span>
                        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <span className="truncate">{previewOf(chat, me?.userId, t)}</span>
                          {chat.lastMessage ? (
                            <>
                              <span aria-hidden="true">·</span>
                              <TimeAgo value={chat.lastMessage.createdAt} className="shrink-0" />
                            </>
                          ) : null}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>

      <section
        aria-label={t('Переписка')}
        className={cn('min-h-0 min-w-0 flex-1 lg:block', activeChatId ? 'block' : 'hidden')}
      >
        {activeChatId ? (
          <MessageThread key={activeChatId} chatId={activeChatId} />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
            <span className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-foreground">
              <MessageCircle className="h-12 w-12 text-foreground" aria-hidden="true" />
            </span>
            <h2 className="text-xl font-semibold text-foreground">{t('Ваши сообщения')}</h2>
            <p className="text-sm text-muted-foreground">
              {t('Отправьте личное сообщение или публикацию другу.')}
            </p>
            <button
              type="button"
              onClick={() => setNewChatOpen(true)}
              className="mt-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground hover:bg-brand/90"
            >
              {t('Отправить сообщение')}
            </button>
          </div>
        )}
      </section>

      <NewChatModal open={newChatOpen} onClose={() => setNewChatOpen(false)} />
    </div>
  );
}
