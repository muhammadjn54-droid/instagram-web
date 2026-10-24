'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ImagePlus, Info, Send, Smile, X } from 'lucide-react';

import { Avatar } from '@/components/ui/Avatar';
import { ErrorState, LoadingState } from '@/components/ui/States';
import { useToast } from '@/components/ui/Toast';
import { PostMessageCard } from './PostMessageCard';
import { useGetMyProfileQuery } from '@/features/profiles/profilesApi';
import {
  useGetChatQuery,
  useGetMessagesQuery,
  useMarkChatReadMutation,
  useSendMessageMutation,
} from '@/features/chats/chatsApi';
import { getMediaSrc } from '@/lib/media';
import { parseSharedPost } from '@/lib/shareLink';
import { cn, getErrorMessage, validateImageFile } from '@/lib/utils';
import type { Message } from '@/types';
import { useT } from '@/lib/i18n/LocaleProvider';

/** The backend has no WebSocket: the open thread is refreshed by short polling. */
const POLL_INTERVAL_MS = 4000;
/** A time label is shown when this much time passed since the previous message. */
const TIME_GAP_MS = 20 * 60 * 1000;

const EMOJIS = [
  '😀', '😂', '🤣', '😊', '😍', '😘', '😎', '🤔',
  '😢', '😭', '😡', '👍', '👎', '🙏', '👏', '🔥',
  '❤️', '💔', '🎉', '✨', '🙌', '💯', '😴', '🤝',
];

/** Messages made only of emoji are shown big, without a bubble. */
function isEmojiOnly(text?: string | null): boolean {
  if (!text) return false;
  const trimmed = text.trim();
  if (!/\p{Extended_Pictographic}/u.test(trimmed)) return false;
  return /^(?:\p{Extended_Pictographic}|\p{Emoji_Modifier}|‍|️|\s)+$/u.test(trimmed) && [...trimmed].length <= 12;
}

function formatMessageTime(value: string): string {
  const date = new Date(value);
  const now = new Date();
  const time = new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' }).format(date);

  if (date.toDateString() === now.toDateString()) return time;

  const day = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' }).format(date);
  return `${day}, ${time}`;
}

/**
 * Thread of a single conversation.
 */
export function MessageThread({ chatId }: { chatId: number }) {
  const t = useT();
  const { toast } = useToast();
  const { data: profile } = useGetMyProfileQuery();
  const { data: chat } = useGetChatQuery(chatId);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [emojiOpen, setEmojiOpen] = useState(false);

  const { data, isLoading, isError, error, refetch } = useGetMessagesQuery(
    {
      chatId,
      pageNumber: 1,
      pageSize: 100,
    },
    { pollingInterval: POLL_INTERVAL_MS },
  );

  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();
  const [markChatRead] = useMarkChatReadMutation();

  useEffect(() => {
    markChatRead(chatId);
  }, [chatId, markChatRead]);

  useEffect(() => {
    const element = scrollRef.current;
    if (element) element.scrollTop = element.scrollHeight;
  }, [data]);

  const handleSend = async (event: React.FormEvent) => {
    event.preventDefault();

    const value = text.trim();
    if (!value && !file) return;

    try {
      await sendMessage({ chatId, text: value || undefined, file: file ?? undefined }).unwrap();
      setText('');
      setFile(null);
      setEmojiOpen(false);
    } catch (error) {
      toast(getErrorMessage(error, t('Не удалось отправить сообщение')), 'error');
    }
  };

  const other = chat?.otherUser;
  const title = other?.fullName || other?.userName || t('Диалог');

  // The API returns the newest messages first; the thread reads top to bottom.
  const messages = [...(data?.items ?? [])].reverse();

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex items-center gap-3 border-b border-border px-4 py-3.5 sm:px-5">
        <Link
          href="/messages"
          aria-label={t('Назад к диалогам')}
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-surface-muted lg:hidden"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        </Link>

        {other ? (
          <Link href={`/profile/${other.id}`} className="flex min-w-0 items-center gap-3 hover:opacity-90">
            <Avatar src={other.avatar} name={title} size="md" />
            <span className="min-w-0">
              <span className="block truncate text-[15px] font-semibold text-foreground">{title}</span>
              <span className="block truncate text-xs text-muted-foreground">@{other.userName}</span>
            </span>
          </Link>
        ) : (
          <span className="h-10" />
        )}

        {other ? (
          <Link
            href={`/profile/${other.id}`}
            aria-label={t('Открыть профиль')}
            className="ml-auto flex h-10 w-10 items-center justify-center rounded-full text-foreground hover:bg-surface-muted"
          >
            <Info className="h-6 w-6" aria-hidden="true" />
          </Link>
        ) : null}
      </header>

      {isLoading ? (
        <LoadingState label={t('Загружаем переписку…')} />
      ) : isError ? (
        <ErrorState message={error?.message} onRetry={refetch} />
      ) : (
        <div ref={scrollRef} className="min-h-0 flex-1 space-y-1 overflow-y-auto px-4 py-4 sm:px-5">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              {other ? <Avatar src={other.avatar} name={title} size="xl" /> : null}
              <p className="text-base font-semibold text-foreground">{title}</p>
              <p className="text-sm text-muted-foreground">{t('Сообщений пока нет — напишите первым.')}</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <MessageRow
                key={message.id}
                message={message}
                previous={messages[index - 1]}
                mine={message.senderId === profile?.userId}
              />
            ))
          )}
        </div>
      )}

      {emojiOpen ? (
        <div className="mx-4 mb-2 grid grid-cols-8 gap-1 rounded-2xl border border-border bg-surface-raised p-2 shadow-popover sm:mx-5 sm:max-w-sm">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => setText((current) => current + emoji)}
              aria-label={t('Вставить {emoji}', { emoji })}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-xl hover:bg-surface-muted"
            >
              {emoji}
            </button>
          ))}
        </div>
      ) : null}

      <form
        onSubmit={handleSend}
        className="mx-4 mb-4 flex items-center gap-1 rounded-pill border border-border-strong px-3 py-1.5 sm:mx-5"
      >
        <button
          type="button"
          onClick={() => setEmojiOpen((value) => !value)}
          aria-label={t('Эмодзи')}
          aria-expanded={emojiOpen}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-foreground hover:bg-surface-muted"
        >
          <Smile className="h-6 w-6" aria-hidden="true" />
        </button>

        {file ? (
          <button
            type="button"
            onClick={() => setFile(null)}
            aria-label={t('Убрать вложение')}
            className="flex max-w-[9rem] shrink-0 items-center gap-1 rounded-pill bg-surface-muted px-3 py-1 text-xs text-foreground"
          >
            <span className="truncate">{file.name}</span>
            <X className="h-3 w-3 shrink-0" aria-hidden="true" />
          </button>
        ) : null}

        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={t('Сообщение…')}
          aria-label={t('Текст сообщения')}
          maxLength={2000}
          className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm text-foreground placeholder:text-subtle-foreground focus:outline-none"
        />

        <input
          ref={fileInputRef}
          type="file"
          className="sr-only"
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) => {
            const picked = event.target.files?.[0] ?? null;
            event.target.value = '';
            if (!picked) return;

            const problem = validateImageFile(picked);
            if (problem) {
              toast(problem, 'error');
              return;
            }
            setFile(picked);
          }}
        />

        {text.trim() || file ? (
          <button
            type="submit"
            disabled={isSending}
            aria-label={t('Отправить')}
            className="flex h-10 shrink-0 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-accent hover:bg-surface-muted disabled:opacity-60"
          >
            <Send className="h-5 w-5" aria-hidden="true" />
            {t('Отправить')}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            aria-label={t('Прикрепить изображение')}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-foreground hover:bg-surface-muted"
          >
            <ImagePlus className="h-6 w-6" aria-hidden="true" />
          </button>
        )}
      </form>
    </div>
  );
}

function MessageRow({
  message,
  previous,
  mine,
}: {
  message: Message;
  previous?: Message;
  mine: boolean;
}) {
  const t = useT();
  const showTime =
    !previous ||
    new Date(message.createdAt).getTime() - new Date(previous.createdAt).getTime() > TIME_GAP_MS;
  const showAvatar = !mine && (!previous || previous.senderId !== message.senderId || showTime);

  const { postId, note } = parseSharedPost(message.text);
  const bigEmoji = !postId && !message.fileUrl && isEmojiOnly(message.text);
  const bubbleText = postId ? note : message.text;

  const bubble = cn(
    'max-w-full rounded-3xl px-4 py-2.5 text-[15px] leading-snug',
    mine ? 'bg-accent text-accent-foreground' : 'bg-surface-muted text-foreground',
  );

  return (
    <>
      {showTime ? (
        <p className="py-4 text-center text-xs text-muted-foreground">
          {formatMessageTime(message.createdAt)}
        </p>
      ) : null}

      <div className={cn('flex items-end gap-2', mine && 'flex-row-reverse')}>
        {!mine ? (
          <span className="w-7 shrink-0">
            {showAvatar ? (
              <Avatar src={message.senderAvatar} name={message.senderName} size="xs" className="h-7 w-7" />
            ) : null}
          </span>
        ) : null}

        <div className={cn('flex max-w-[75%] flex-col gap-1', mine ? 'items-end' : 'items-start')}>
          {postId ? <PostMessageCard postId={postId} mine={mine} /> : null}

          {message.fileUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element -- backend media lives on another origin */
            <img
              src={getMediaSrc(message.fileUrl)}
              alt={t('Вложение')}
              className="max-h-72 max-w-[260px] rounded-2xl object-cover"
            />
          ) : null}

          {bubbleText ? (
            bigEmoji ? (
              <p className="text-5xl leading-tight">{bubbleText}</p>
            ) : (
              <p className={cn(bubble, 'whitespace-pre-line break-words')}>{bubbleText}</p>
            )
          ) : null}
        </div>
      </div>
    </>
  );
}
