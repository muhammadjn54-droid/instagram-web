'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

import { Avatar } from '@/components/ui/Avatar';
import { Dialog } from '@/components/ui/Dialog';
import { useToast } from '@/components/ui/Toast';
import { useGetOrCreateChatMutation } from '@/features/chats/chatsApi';
import { getErrorMessage } from '@/lib/utils';
import { useRecipients, type Recipient } from './useRecipients';
import { useT } from '@/lib/i18n/LocaleProvider';

/** "New message" dialog: find a person and open (or create) the conversation. */
export function NewChatModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useT();
  return (
    <Dialog open={open} onClose={onClose} title={t('Новое сообщение')} size="md">
      <NewChatForm onClose={onClose} />
    </Dialog>
  );
}

function NewChatForm({ onClose }: { onClose: () => void }) {
  const t = useT();
  const router = useRouter();
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [openingId, setOpeningId] = useState<number | null>(null);

  const { recipients, isLoading, searching } = useRecipients(query);
  const [openChat] = useGetOrCreateChatMutation();

  const start = async (recipient: Recipient) => {
    setOpeningId(recipient.id);
    try {
      const chat = await openChat(recipient.id).unwrap();
      onClose();
      router.push(`/messages/${chat.id}`);
    } catch (error) {
      toast(getErrorMessage(error, t('Не удалось открыть диалог')), 'error');
      setOpeningId(null);
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
          placeholder={t('Найти человека по имени')}
          aria-label={t('Поиск людей')}
          autoFocus
          className="w-full rounded-pill bg-surface-muted py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-subtle-foreground focus:outline-none"
        />
      </div>

      <div className="max-h-80 min-h-40 overflow-y-auto">
        {isLoading ? (
          <p className="py-10 text-center text-sm text-muted-foreground">{t('Загрузка…')}</p>
        ) : recipients.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            {searching ? t('Никого не найдено') : t('Введите имя, чтобы найти человека.')}
          </p>
        ) : (
          <ul>
            {recipients.map((recipient) => (
              <li key={recipient.id}>
                <button
                  type="button"
                  onClick={() => start(recipient)}
                  disabled={openingId !== null}
                  className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-surface-muted disabled:opacity-60"
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
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
