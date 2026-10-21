# 📸 Instagram Clone — Full-Stack Monorepo

> Полнофункциональный клон Instagram, созданный для командной разработки двух человек (Backend + Frontend).  
> Все API эндпоинты бэкенда готовы, протестированы и задокументированы в Swagger. База данных содержит тестовые данные.

---

## 👥 Распределение ролей в команде

| Роль | Технологии | Рабочая папка | Ответственный |
| :--- | :--- | :--- | :--- |
| **Backend** | NestJS 12, TypeORM, SQLite, Swagger, JWT, Multer | [`backend/`](./backend) | **Мансур** |
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS | [`frontend/`](./frontend) | **Фронтенд-разработчик** |

---

## 📚 Навигация по документации (Читай в таком порядке!)

1. **[`FRONTEND_GUIDE.md`](./FRONTEND_GUIDE.md)** 👈 **Главное руководство по API:**
   * Все доступные маршруты (URL, параметры, заголовки, тело запроса).
   * Формат ответов сервера (`ApiResponse<T>` и `PagedResult<T>`).
   * Готовый TypeScript клиент `api.ts` для выполнения запросов.
2. **[`FRONTEND_TASKS.md`](./FRONTEND_TASKS.md)** 👈 **Пошаговый план работ для фронтендера:**
   * Чек-лист из 10 шагов: от экрана входа до ленты, историй, чатов и профиля.
   * Список необходимых компонентов и экранов.
3. **[`AI_INSTRUCTIONS.md`](./AI_INSTRUCTIONS.md)** 👈 **Инструкция для нейросетей (Cursor, Claude Code, ChatGPT, Copilot):**
   * Если фронтендер пишет код с помощью AI, дай AI этот файл.
   * Нейросеть поймет архитектуру, не придумает лишнего и будет писать точный код.
4. **[`CONTRIBUTING.md`](./CONTRIBUTING.md)** 👈 **Git и правила совместной работы:**
   * Как клонировать проект, работать в ветках, пушить и делать Pull Request.
5. **[`.cursorrules`](./.cursorrules)** 👈 Конфигурация для редактора Cursor AI.

---

## 🚀 Быстрый запуск проекта локально

### 1. Клонирование репозитория
```bash
git clone <URL_РЕПОЗИТОРИЯ_С_GITHUB>
cd instagram-monorepo
```

### 2. Запуск Бэкенда (Терминал 1)
```bash
cd backend
npm install
npm run seed     # Наполняет базу тестовыми пользователями, постами, историями и чатом
npm run dev      # Запускает сервер NestJS на порту 3000
```
* **API Сервер:** [http://localhost:3000](http://localhost:3000)
* **Интерактивная документация Swagger:** [http://localhost:3000/swagger](http://localhost:3000/swagger)
* **OpenAPI спецификация JSON:** [http://localhost:3000/swagger-json](http://localhost:3000/swagger-json)

### 3. Запуск Фронтенда (Терминал 2)
```bash
cd frontend
npm install
npm run dev      # Запускает Next.js приложение
```
* **Приложение в браузере:** [http://localhost:3001](http://localhost:3001) (или `http://localhost:3000`)

---

## 🔑 Готовые тестовые аккаунты

Пароль у всех пользователей одинаковый: **`Password123!`**

| Логин (userName) | Email | Пароль | Роль / Описание |
| :--- | :--- | :--- | :--- |
| `alex_photographer` | `alex@example.com` | `Password123!` | Автор 3 постов (горы, водопад, город), есть истории |
| `maria_art` | `maria@example.com` | `Password123!` | Художница, автор постов про арт и кофе |
| `john_traveler` | `john@example.com` | `Password123!` | Путешественник, подписчик |

---

## 📁 Структура монорепозитория

```text
instagram-monorepo/
├── backend/                  # NestJS 12 REST API
│   ├── src/
│   │   ├── common/           # DTO, Guards, Filters, Interceptors
│   │   ├── config/           # Настройки TypeORM и SQLite (database.config.ts)
│   │   ├── entities/         # 16 сущностей БД (User, Post, Story, Chat, Comment...)
│   │   ├── modules/          # 11 модулей (account, posts, stories, chats...)
│   │   ├── main.ts           # Запуск сервера и настройка Swagger
│   │   └── seed.ts           # Скрипт создания демо-данных (npm run seed)
│   ├── data/                 # Локальный файл БД app.sqlite (не коммитится)
│   └── uploads/              # Фотографии постов, историй и аватарок (/uploads/*)
│
├── frontend/                 # Next.js 16 Web Client
│   ├── src/                  # Компоненты, страницы, хуки
│   └── public/               # Статические ресурсы фронтенда
│
├── .cursorrules              # Настройки для Cursor AI
├── .gitignore                # Игнорируемые файлы (node_modules, .next, dist, .sqlite)
├── AI_INSTRUCTIONS.md        # Правила для ИИ-ассистентов
├── CONTRIBUTING.md           # Совместная работа в Git
├── FRONTEND_GUIDE.md         # Полная документация API со схемами
├── FRONTEND_TASKS.md         # Пошаговый план разработки фронтенда
├── package.json              # Скрипты монорепозитория
└── README.md                 # Этот файл
```
