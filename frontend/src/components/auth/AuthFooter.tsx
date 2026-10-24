'use client';

import { useT } from '@/lib/i18n/LocaleProvider';
import { tr } from '@/lib/i18n/core';

const LINKS = [
  'Meta',
  tr('Информация'),
  tr('Блог'),
  tr('Вакансии'),
  tr('Помощь'),
  'API',
  tr('Конфиденциальность'),
  tr('Условия'),
  tr('Места'),
  tr('Популярное'),
  'Instagram Lite',
  'Meta AI',
  'Threads',
  tr('Загрузка контактов и лица, не являющиеся пользователями'),
  'Meta Verified',
];

/**
 * Footer of the authentication screens.
 *
 * Server Component: it contains no state and no interactivity.
 */
export function AuthFooter() {
  const t = useT();
  return (
    <footer className="w-full py-8 text-[12px] text-muted-foreground">
      <div className="mx-auto flex max-w-4xl flex-wrap justify-center gap-x-4 gap-y-1.5 px-4 text-center">
        {LINKS.map((link) => (
          <span key={link} className="cursor-default">
            {t(link)}
          </span>
        ))}
      </div>

      <div className="mt-2 flex items-center justify-center gap-4 text-subtle-foreground">
        <span>{t('Русский')}</span>
        <span>© 2026 Instagram from Meta</span>
      </div>
    </footer>
  );
}
