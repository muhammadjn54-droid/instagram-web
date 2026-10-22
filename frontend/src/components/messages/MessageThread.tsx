'use client';

import { useEffect, useRef, useState } from 'react';
import { Paperclip, Send } from 'lucide-react';

import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { TimeAgo } from '@/components/shared/TimeAgo';
import { useToast } from '@/components/ui/Toast';
import { useGetMyProfileQuery } from '@/features/profiles/profilesApi';
import {
  useGetMessagesQuery,
  useMarkChatReadMutation,
  useSendMessageMutation,
} from '@/features/chats/chatsApi';
import { getMediaSrc } from '@/lib/media';
import { cn } from '@/lib/utils';

/**
 * Thread of a single conversation.
 */
export function MessageThread({ chatId }: { chatId: number }) {
  const { toast } = useToast();
  const { data: profile } = useGetMyProfileQuery();
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const { data, isLoading, isError, error, refetch } = useGetMessagesQuery({
    chatId,
    pageNumber: 1,
    pageSize: 100,
  });

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
    } catch {
      toast('Не удалось отправить сообщение', 'error');
    }
  };

  if (isLoading) {
    return <LoadingState label="Загружаем переписку…" />;
  }

  if (isError) {
    return <ErrorState message={error?.message} onRetry={refetch} />;
  }

  const messages = data?.items ?? [];

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div ref={scrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <EmptyState
            title="Сообщений пока нет"
            description="Напишите первое сообщение — оно появится здесь."
            className="py-10"
          />
        ) : (
          messages.map((message) => {
            const mine = message.senderId === profile?.userId;

            return (
              <div
                key={message.id}
                className={cn('flex items-end gap-2', mine && 'flex-row-reverse')}
              >
                {!mine ? (
                  <Avatar src={message.senderAvatar} name={message.senderName} size="xs" />
                ) : null}

                <div
                  className={cn(
                    'max-w-[75%] rounded-card px-3 py-2 text-sm leading-relaxed',
                    mine
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-surface-muted text-foreground',
                  )}
                >
                  {message.text ? <p className="whitespace-pre-line">{message.text}</p> : null}

                  {message.fileUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element -- backend media lives on another origin */
                    <img
                      src={getMediaSrc(message.fileUrl)}
                      alt="Вложение"
                      className="mt-1 max-h-56 w-full rounded-control object-cover"
                    />
                  ) : null}

                  <span
                    className={cn(
                      'mt-1 block text-[10px]',
                      mine ? 'text-accent-foreground/70' : 'text-muted-foreground',
                    )}
                  >
                    <TimeAgo value={message.createdAt} />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form
        onSubmit={handleSend}
        className="flex items-center gap-2 border-t border-border bg-surface p-3"
      >
        <input
          ref={fileInputRef}
          type="file"
          className="sr-only"
          accept="image/*,application/pdf"
          onChange={(event) => {
            setFile(event.target.files?.[0] ?? null);
            event.target.value = '';
          }}
        />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Прикрепить файл"
          onClick={() => fileInputRef.current?.click()}
          icon={<Paperclip className="h-4 w-4" />}
        />

        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Сообщение…"
          aria-label="Текст сообщения"
          maxLength={2000}
          className="min-w-0 flex-1 rounded-pill bg-surface-muted px-4 py-2 text-sm text-foreground placeholder:text-subtle-foreground focus:outline-none"
        />

        <Button
          type="submit"
          size="icon"
          aria-label="Отправить"
          loading={isSending}
          disabled={!text.trim() && !file}
          icon={<Send className="h-4 w-4" />}
        />
      </form>
    </div>
  );
}
