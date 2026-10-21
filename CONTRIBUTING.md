# 🤝 Правила совместной работы (Командный гайд для Mansur & Frontend-партнёра)

Этот документ описывает, как мы вдвоём работаем в одном репозитории на GitHub, чтобы код никогда не ломался и не возникало конфликтов (merge conflicts).

---

## 👥 Роли в проекте

- **Мансур:** Backend (NestJS 12, TypeORM, SQLite, API, Swagger). Вся работа ведётся в папке `backend/`.
- **Фронтенд-разработчик:** Frontend (Next.js, React, Tailwind CSS, подключение к API). Вся работа ведётся в папке `frontend/`.

---

## 🚀 Начало работы (Первый день)

### 1. Клонирование репозитория
```bash
git clone <URL_РЕПОЗИТОРИЯ_С_GITHUB>
cd instagram-monorepo
```

### 2. Запуск проекта локально
Открой **два терминала** (или две вкладки в VS Code / Cursor):

**Терминал 1 (Бэкенд):**
```bash
cd backend
npm install
npm run seed       # Создаст тестовую базу SQLite с готовыми юзерами и постами
npm run dev        # Сервер запустится на http://localhost:3000
```
* Swagger документация откроется тут: [http://localhost:3000/swagger](http://localhost:3000/swagger)

**Терминал 2 (Фронтенд):**
```bash
cd frontend
npm install
npm run dev        # Фронтенд запустится на http://localhost:3001
```

---

## 🌿 Git-процесс (Как делать изменения)

### Правило 1: Не коммитить прямо в `main`
Всегда создавай отдельную ветку под свою задачу:
- Для фронтенда: `feature/frontend-login`, `feature/frontend-feed`, `feature/frontend-profile`
- Для бэкенда: `feature/backend-new-endpoint`

### Правило 2: Шаги при создании фичи
```bash
# 1. Перед началом работы получи последние изменения с GitHub
git checkout main
git pull origin main

# 2. Создай свою ветку
git checkout -b feature/frontend-login

# 3. Пиши код, тестируй в браузере

# 4. Сохрани изменения
git add .
git commit -m "feat(frontend): create login and register pages"

# 5. Отправь ветку на GitHub
git push -u origin feature/frontend-login

# 6. На GitHub создай Pull Request (PR) в ветку main
```

---

## ⛔ Что строго запрещено пушить в Git:

1. **Папки `node_modules/`** — они уже в `.gitignore`.
2. **Файлы сборки `.next/` и `dist/`** — они генерируются автоматически.
3. **Файл базы данных `backend/data/app.sqlite`** — у каждого разработчика своя локальная база, которая наполняется командой `npm run seed`.
4. **Секретные файлы `.env`** — пароли и ключи нельзя публиковать в открытый доступ.

---

## 🆘 Что делать, если что-то пошло не так?

1. **"База сломалась или данные запутались":**
   Просто выполни в папке `backend`:
   ```bash
   npm run seed
   ```
   Скрипт пересоздаст базу с чистого листа и добавит тестовых пользователей.

2. **"Бэкенд ругается на занятый порт 3000":**
   Проверь, не запущен ли уже процесс NestJS в фоне, или перезапусти терминал.

3. **"Ошибка CORS":**
   В NestJS уже включен `app.enableCors({ origin: true, credentials: true })`. Если запросы падают, убедись, что делаешь запросы на `http://localhost:3000`.
