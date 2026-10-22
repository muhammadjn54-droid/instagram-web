import React from 'react';

export default function AuthFooter() {
  const links = [
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

  return (
    <footer className="w-full py-8 text-neutral-500 text-[12px] flex flex-col items-center gap-3">
      {/* Links row */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 max-w-4xl px-4 text-center">
        {links.map((link) => (
          <a
            key={link}
            href="#"
            onClick={(e) => e.preventDefault()}
            className="hover:underline text-neutral-500 hover:text-neutral-700 transition"
          >
            {link}
          </a>
        ))}
      </div>

      {/* Language & Copyright */}
      <div className="flex items-center gap-4 text-neutral-400 mt-2">
        <div className="flex items-center gap-1 cursor-pointer hover:text-neutral-600">
          <span>Русский</span>
          <span className="text-[10px]">⌵</span>
        </div>
        <span>© 2026 Instagram from Meta</span>
      </div>
    </footer>
  );
}
