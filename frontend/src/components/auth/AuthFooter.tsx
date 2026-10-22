const LINKS = [
  'Meta',
  'Информация',
  'Блог',
  'Вакансии',
  'Помощь',
  'API',
  'Конфиденциальность',
  'Условия',
  'Места',
  'Популярное',
  'Instagram Lite',
  'Meta AI',
  'Threads',
  'Загрузка контактов и лица, не являющиеся пользователями',
  'Meta Verified',
];

/**
 * Footer of the authentication screens.
 *
 * Server Component: it contains no state and no interactivity.
 */
export function AuthFooter() {
  return (
    <footer className="w-full py-8 text-[12px] text-muted-foreground">
      <div className="mx-auto flex max-w-4xl flex-wrap justify-center gap-x-4 gap-y-1.5 px-4 text-center">
        {LINKS.map((link) => (
          <span key={link} className="cursor-default">
            {link}
          </span>
        ))}
      </div>

      <div className="mt-2 flex items-center justify-center gap-4 text-subtle-foreground">
        <span>Русский</span>
        <span>© 2026 Instagram from Meta</span>
      </div>
    </footer>
  );
}
