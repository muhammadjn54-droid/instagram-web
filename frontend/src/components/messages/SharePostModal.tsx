'use client';

import { useState } from 'react';
import { Check, Link2, Search } from 'lucide-react';

import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { useToast } from '@/components/ui/Toast';
import { useGetOrCreateChatMutation, useSendMessageMutation } from '@/features/chats/chatsApi';
import { buildPostLink, buildShareText } from '@/lib/shareLink';
import { cn, getErrorMessage } from '@/lib/utils';
import { useRecipients, type Recipient } from './useRecipients';
import { useT } from '@/lib/i18n/LocaleProvider';

export interface SharePostModalProps {
  postId: number;
  open: boolean;
  onClose: () => void;
}

/**
 * "Send to…" dialog of a post or reel: pick one or more people, add an
 * optional note and send. Every recipient receives a direct message with the
 * post, which the chat shows as a preview card.
 */
export function SharePostModal({ postId, open, onClose }: SharePostModalProps) {
  const t = useT();
  return (
    <Dialog open={open} onClose={onClose} title={t('Поделиться')} size="md">
      {/* Mounted only while open, so every opening starts with a clean form. */}
      <ShareForm postId={postId} onClose={onClose} />
    </Dialog>
  );
}

function ShareForm({ postId, onClose }: { postId: number; onClose: () => void }) {
  const t = useT();
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [note, setNote] = useState('');
  const [selected, setSelected] = useState<Recipient[]>([]);
  const [sending, setSending] = useState(false);

  const { recipients, isLoading, searching } = useRecipients(query);
  const [openChat] = useGetOrCreateChatMutation();
  const [sendMessage] = useSendMessageMutation();

  const toggle = (recipient: Recipient) => {
    setSelected((current) =>
      current.some((item) => item.id === recipient.id)
        ? current.filter((item) => item.id !== recipient.id)
        : [...current, recipient],
    );
  };

  const copyLink = () => {
    navigator.clipboard
      ?.writeText(buildPostLink(postId))
      .then(() => toast(t('Ссылка скопирована'), 'success'))
      .catch(() => toast(t('Не удалось скопировать ссылку'), 'error'));
  };

  const send = async () => {
    if (selected.length === 0) return;

    setSending(true);
    let delivered = 0;

    try {
      for (const recipient of selected) {
        const chat = await openChat(recipient.id).unwrap();
        await sendMessage({ chatId: chat.id, text: buildShareText(postId, note) }).unwrap();
        delivered += 1;
      }
      toast(delivered === 1 ? t('Отправлено') : t('Отправлено: {count}', { count: delivered }), 'success');
      onClose();
    } catch (error) {
      toast(
        delivered > 0
          ? `${t('Отправлено {done} из {total}.', { done: delivered, total: selected.length })} ${getErrorMessage(error, t('Не удалось отправить'))}`
          : getErrorMessage(error, t('Не удалось отправить')),
        'error',
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('Поиск')}
          aria-label={t('Поиск людей')}
          className="w-full rounded-pill bg-surface-muted py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-subtle-foreground focus:outline-none"
        />
      </div>

      <div className="max-h-72 min-h-40 overflow-y-auto">
        {isLoading ? (
          <p className="py-10 text-center text-sm text-muted-foreground">{t('Загрузка…')}</p>
        ) : recipients.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            {searching
              ? t('Никого не найдено')
              : t('Диалогов пока нет — найдите человека через поиск.')}
          </p>
        ) : (
          <ul>
            {recipients.map((recipient) => {
              const checked = selected.some((item) => item.id === recipient.id);

              return (
                <li key={recipient.id}>
                  <button
                    type="button"
                    onClick={() => toggle(recipient)}
                    aria-pressed={checked}
                    className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-surface-muted"
                  >
                    <Avatar src={recipient.avatar} name={recipient.fullName || recipient.userName} size="md" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-foreground">
                        {recipient.fullName || recipient.userName}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        @{recipient.userName}
                      </span>
                    </span>
                    <span
                      aria-hidden="true"
                      className={cn(
                        'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2',
                        checked
                          ? 'border-accent bg-accent text-accent-foreground'
                          : 'border-border-strong',
                      )}
                    >
                      {checked ? <Check className="h-3.5 w-3.5" /> : null}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <input
        value={note}
        onChange={(event) => setNote(event.target.value)}
        maxLength={500}
        placeholder={t('Напишите сообщение…')}
        aria-label={t('Сообщение к публикации')}
        className="w-full rounded-pill border border-border bg-transparent px-4 py-2.5 text-sm text-foreground placeholder:text-subtle-foreground focus:border-accent focus:outline-none"
      />

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={copyLink}
          icon={<Link2 className="h-4 w-4" />}
        >
          {t('Копировать ссылку')}
        </Button>
        <Button
          type="button"
          className="ml-auto"
          onClick={send}
          loading={sending}
          disabled={selected.length === 0}
        >
          {selected.length > 1 ? t('Отправить ({count})', { count: selected.length }) : t('Отправить')}
        </Button>
      </div>
    </div>
  );
}
