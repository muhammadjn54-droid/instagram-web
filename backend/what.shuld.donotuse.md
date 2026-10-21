# Что НЕ использовать и как устроена простая архитектура бэкенда

> Этот документ создан для того, чтобы проект было легко понимать и развивать без лишней головной боли.
>
> Canonical file: `backend/what.shuld.donotuse.md`. The copy in the monorepo root points here.
> Updated: 2026-10-21. Rules are merged from the original document — **nothing was deleted**.

---

## 0. Quick rules (EN)

| # | Rule | Where |
|---|---|---|
| 1 | No microservices, gRPC, CQRS, message brokers | §1.1 |
| 2 | No 10-layer abstraction (UseCase/DomainEntity/Mapper) | §1.2 |
| 3 | No `any`, no `@ts-ignore` | §1.3 |
| 4 | No random extra npm packages | §1.4 |
| 5 | No plain-text passwords, no secrets in code | §1.5 |
| 6 | One module = one folder under `src/modules/` | §1.6 |
| 7 | New routes: REST style (plural, kebab-case, IDs in path) | §2 |
| 8 | `swagger.old.json` is a feature reference, not a URL contract | §2 |
| 9 | Never change business logic when only docs/Swagger are requested | §3 |
| 10 | No `any`, no plain-text passwords, no over-abstraction | §1 |
| 11 | Update `TASKS.md` after every task | §4 |

---

## 1. Что НЕ использовать и чего избегать (What NOT to use)

### ❌ 1.1. Не переусложнять архитектуру (No Overengineering)
* **Не использовать микросервисы, gRPC, CQRS и шины сообщений (Kafka/RabbitMQ)** на данном этапе.
  * *Пример из жизни:* Не нужно строить космодром, если нам просто нужно научиться водить легковой автомобиль. Для учебного проекта и уровня Junior монолитная структура NestJS — идеальный выбор.
* **Не делать 10 слоёв абстракций (Clean Architecture / DDD "по книжкам")**.
  * Не нужно на каждый чих создавать `UseCase`, `DomainEntity`, `ValueObject`, `Mapper`, `RepositoryInterface`.
  * В NestJS для Junior достаточно простой и проверенной связки:
    **`Controller` -> `Service` -> `База данных / Данные`**.

### ❌ 1.2. Не ломать архитектуру модулей
* Каждый модуль = одна папка в `src/modules/` + `*.controller.ts` + `*.service.ts` + `*.module.ts` + `dto/`.
* Общий код (декораторы, guard, filter, interceptor, response-обёртки) живёт в `src/common/`.
* Entity-классы живут в `src/entities/` и реэкспортируются через `src/entities/index.ts`.

### ❌ 1.3. Не использовать `any` и `@ts-ignore`
* TypeScript создан для того, чтобы находить ошибки до того, как код упал в браузере или на сервере.
* Использование `any` выключает защиту TypeScript — это как ехать ночью на машине с выключенными фарами.
* Всегда объявляй простые `interface` или `class` для входных данных (DTO) и моделей.

### ❌ 1.4. Не устанавливать лишние библиотеки
* Не устанавливай случайные npm-пакеты "на всякий случай".
* Каждый лишний пакет замедляет проект, может содержать баги и усложнять запуск.
* В проекте уже есть всё необходимое: `@nestjs/core`, `@nestjs/common`, `@nestjs/swagger`, `swagger-ui-express`.

### ❌ 1.5. Не хранить пароли в открытом виде и секреты в коде
* Пароли пользователей никогда не должны лежать в базе в виде обычного текста. Их обязательно хэшировать (например, с помощью `bcrypt`).
* Секретные ключи (JWT secret, пароль базы данных) не пиши прямо в файлах TypeScript. Используй переменные окружения (`.env`).
* **Факт на 2026-10-21:** `src/modules/account/account.service.ts` хранит пароль как есть — это баг, задача `TASKS.md` → «Account».

### ❌ 1.6. Не писать весь код в одном файле
* Не складывай всё в `app.controller.ts` и `app.service.ts`.
* Каждый раздел (аккаунты, посты, истории, профили) должен жить в своей отдельной папке внутри `src/modules/`.

---

## 2. Route policy (маршруты)

* **Новые** маршруты — REST style: plural nouns, kebab-case, lowercase, ID в пути
  (`GET /posts/{postId}`, `POST /posts/{postId}/comments`).
* ID всегда в path, а не в query string.
* **Не менять** уже существующие legacy-маршруты без прямой просьбы:
  `/Account/register`, `/Account/login`, `/Account/ForgotPassword`,
  `/Account/ResetPassword`, `/Account/ChangePassword`.
* `src/swagger.old.json`, `src/swagger.json`, `src/swagger.document.ts`, `src/abaut.md` —
  это **справочник фич (57 старых .NET-эндпоинтов), а не контракт URL**.
  Актуальные пути — в `API_CONTRACT.md`.

---

## 3. Не менять бизнес-логику, когда просят только документацию

* Задача вида «обнови Swagger», «добавь описание», «поправь DTO-документацию» →
  **не менять** бизнес-логику, не менять имена полей, не менять формат ответа.
* Правило из `about.md` §4.11: «Do not change business logic when updating Swagger».
* Если при проверке найдено несоответствие — описать его в `TASKS.md` → «Known bugs»,
  а не чинить молча.

---

## 4. После каждой задачи

* Обновить `TASKS.md` (чек-лист модуля + «Next 5 tasks» + «Known bugs»).
* Проверить `npm run build` (0 ошибок TypeScript).
* Проверить чек-лист `docs/DEFINITION_OF_DONE.md`.

---

## 5. Как устроена простая архитектура бэкенда (Easy Architecture)

Архитектура проекта построена по модульному принципу NestJS:

```text
Клиент (Frontend / Swagger UI)
       │
       ▼ HTTP Запрос (GET, POST, DELETE...)
┌───────────────────────────────┐
│     Controller (Контроллер)   │  <-- Принимает запрос, проверяет параметры
└──────────────┬────────────────┘
               │
               ▼
┌───────────────────────────────┐
│       Service (Сервис)        │  <-- Бизнес-логика (хэш пароля, поиск постов)
└──────────────┬────────────────┘
               │
               ▼
┌───────────────────────────────┐
│        База данных / Данные   │  <-- Хранение пользователей, постов и историй
└───────────────────────────────┘
```

### Структура папок в `src/`:

* `main.ts` — главная точка входа. Здесь запускается приложение NestJS и подключается Swagger.
* `app.module.ts` — корневой модуль: подключает `AccountModule` и `ObserveModule`.
* `swagger.document.ts` — статический OpenAPI-документ (копия спецификации Instagram).
* `src/swagger.json` / `src/swagger.old.json` / `src/abaut.md` — исходная спецификация (57 эндпоинтов).
* `common/` — декораторы (`current-user`, `public`, `swagger-wrapped`), `guards/jwt-auth.guard.ts`,
  `filters/http-exception.filter.ts`, `interceptors/response.interceptor.ts`, `responses/api-response.ts`.
* `config/database.config.ts` — конфиг TypeORM (SQLite).
* `entities/` — 16 TypeORM-сущностей + barrel-файл `index.ts`.
* `modules/` — модули по функционалу:
  * `account/` — авторизация, регистрация, сброс пароля (**код есть**)
  * `users/`, `profiles/`, `follows/`, `posts/`, `comments/`, `favorites/`,
    `stories/`, `search-history/` — папки созданы, кода нет
  * `chats/`, `locations/` — папок нет

---

## 6. Как запустить и пользоваться Swagger

1. **Запуск сервера в режиме разработки:**
   ```bash
   cd backend
   npm run start:dev
   ```
2. **Открыть Swagger UI в браузере:**
   * [http://localhost:3000/swagger](http://localhost:3000/swagger)
   * или [http://localhost:3000/api](http://localhost:3000/api)
3. **Получить Swagger в формате JSON:**
   * [http://localhost:3000/swagger-json](http://localhost:3000/swagger-json)

В интерфейсе Swagger можно нажимать кнопку **"Try it out"** и тестировать любые запросы Instagram API прямо из браузера.
