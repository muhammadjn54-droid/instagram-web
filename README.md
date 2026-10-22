# 📸 Instagram Clone — Full-Stack Monorepo

> Полнофункциональный клон Instagram, разработанный для совместной командной работы (Backend + Frontend).  
> Все API эндпоинты бэкенда готовы и задокументированы в Swagger. Фронтенд построен на Next.js App Router.

---

## 👥 Распределение ролей в команде

| Роль | Технологии | Рабочая папка | Ответственный |
| :--- | :--- | :--- | :--- |
| **Backend** | NestJS 12, TypeORM, SQLite, Swagger, JWT, Multer | [`backend/`](./backend) | **Мансур** |
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS v4 | [`frontend/`](./frontend) | **Фронтенд-разработчик** |

---

## 📚 Архитектура и Документация Проекта

Все спецификации зафиксированы в репозитории:

1. **[`tz.md`](./tz.md)** 👈 **Главный чек-лист прогресса (Master Checklist):**
   * Единый источник правды: статус каждого модуля, выполненные задачи, блокеры и следующий шаг.
2. **[`FRONTEND_MASTER.md`](./FRONTEND_MASTER.md)** 👈 **Руководство для разработчиков и ИИ:**
   * Архитектурные правила, стандарты разделения Server/Client Components, ссылки на спецификации.
3. **[`about.md`](./about.md)** 👈 Описание целей, текущего состояния и возможностей проекта.
4. **[`specs/`](./specs/)** 👈 **Полный пакет из 20 спецификаций:**
   * [`INSTAGRAM_RESEARCH.md`](./specs/INSTAGRAM_RESEARCH.md) — Исследование возможностей веб-версии Instagram.
   * [`PROJECT_SCOPE.md`](./specs/PROJECT_SCOPE.md) — Точные границы проекта (что входит, что отложено).
   * [`ROUTE_INVENTORY.md`](./specs/ROUTE_INVENTORY.md) — Каталог из 13 маршрутов приложения.
   * [`PAGE_SPECIFICATIONS.md`](./specs/PAGE_SPECIFICATIONS.md) — Макеты и контракты экранов.
   * [`FEATURE_INVENTORY.md`](./specs/FEATURE_INVENTORY.md) — Задачи по модулям с критериями приемки.
   * [`FRONTEND_ARCHITECTURE.md`](./specs/FRONTEND_ARCHITECTURE.md) — Архитектурные правила фронтенда.
   * [`DESIGN_SYSTEM.md`](./specs/DESIGN_SYSTEM.md) — Дизайн-система, цвета, шрифты и отступы.
   * [`COMPONENTS.md`](./specs/COMPONENTS.md) — Каталог переиспользуемых компонентов.
   * [`API_INTEGRATION.md`](./specs/API_INTEGRATION.md) — Все эндпоинты и схемы 11 модулей бэкенда.
   * [`AUTHENTICATION.md`](./specs/AUTHENTICATION.md) — Жизненный цикл JWT и защита маршрутов.
   * [`STATE_MANAGEMENT.md`](./specs/STATE_MANAGEMENT.md) — Кэширование и оптимистичные обновления UI.
   * [`FORM_VALIDATION.md`](./specs/FORM_VALIDATION.md) — Правила валидации форм.
   * [`RESPONSIVE_DESIGN.md`](./specs/RESPONSIVE_DESIGN.md) — Адаптивность от 360px на мобильных.
   * [`ACCESSIBILITY.md`](./specs/ACCESSIBILITY.md) — Стандарты доступности WCAG 2.1 AA.
   * [`SECURITY.md`](./specs/SECURITY.md) — Защита от XSS, безопасность загрузки файлов.
   * [`TESTING.md`](./specs/TESTING.md) — Стратегия тестирования и сквозные сценарии.
   * [`BUGS_AND_BLOCKERS.md`](./specs/BUGS_AND_BLOCKERS.md) — Известные ограничения и окружение.
   * [`IMPLEMENTATION_PLAN.md`](./specs/IMPLEMENTATION_PLAN.md) — Пошаговый план реализации (Фазы 1–7).
   * [`DECISIONS.md`](./specs/DECISIONS.md) — Архитектурные решения (ADR).
   * [`CHANGELOG.md`](./specs/CHANGELOG.md) — История изменений проекта.
5. **[`FRONTEND_GUIDE.md`](./FRONTEND_GUIDE.md)** — Практический справочник для быстрого старта с примерами на TypeScript.
6. **[`AI_INSTRUCTIONS.md`](./AI_INSTRUCTIONS.md)** & **[`.cursorrules`](./.cursorrules)** — Конфигурация для ИИ-ассистентов (Cursor, Claude, ChatGPT).

---

## 🚀 Быстрый запуск проекта локально

### 1. Запуск Бэкенда (Терминал 1)
```bash
cd backend
npm install
npm run seed     # Создаст тестовую базу SQLite с готовыми юзерами и постами
npm run dev      # Сервер запустится на http://localhost:3000
```
* **API Сервер:** [http://localhost:3000](http://localhost:3000)
* **Swagger UI:** [http://localhost:3000/swagger](http://localhost:3000/swagger)

### 2. Запуск Фронтенда (Терминал 2)
```bash
cd frontend
npm install
npm run dev      # Запустится на http://localhost:3001
```
* **Приложение:** [http://localhost:3001](http://localhost:3001)

---

## 🔑 Тестовые аккаунты для входа

Пароль у всех: **`Password123!`**

| Логин / Email | Пароль | Роль / Описание |
| :--- | :--- | :--- |
| `alex_photographer` / `alex@example.com` | `Password123!` | Фотограф, автор постов про горы и водопады |
| `maria_art` / `maria@example.com` | `Password123!` | Художница, автор постов про арт и кофе |
| `john_traveler` / `john@example.com` | `Password123!` | Путешественник, подписчик |
