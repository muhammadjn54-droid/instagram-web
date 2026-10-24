'use client';

import Link from 'next/link';
import { Send } from 'lucide-react';
import { useT } from '@/lib/i18n/LocaleProvider';

export function FloatingMessagesButton() {
  const t = useT();

  return (
    <div className="fixed bottom-4 right-5 z-30 hidden lg:block">
      <Link
        href="/messages"
        aria-label={t('Сообщения')}
        className="flex items-center gap-2.5 rounded-full bg-[#262626] hover:bg-[#333333] px-4 py-2.5 text-white shadow-lg transition-transform hover:scale-105 active:scale-95 border border-neutral-700/60"
      >
        <Send className="h-5 w-5 rotate-[-10deg]" />
        <span className="text-sm font-semibold">{t('Сообщения')}</span>
        <div className="flex -space-x-1.5 ml-1">
          <div className="h-5 w-5 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 border border-black" />
          <div className="h-5 w-5 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 border border-black" />
        </div>
      </Link>
    </div>
  );
}
