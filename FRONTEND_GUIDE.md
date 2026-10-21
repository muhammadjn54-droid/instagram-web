# 📱 Frontend Integration Guide (Руководство для фронтенд-разработчика)

> Это руководство написано специально для разработчика фронтенда (и для AI, если ты используешь Cursor, Claude Code или ChatGPT), чтобы ты мог быстро и без ошибок подключить Next.js к NestJS бэкенду.

---

## 🌐 Основные параметры сервера

* **Базовый URL API (Base URL):** `http://localhost:3000`
* **Swagger UI (Интерактивная документация):** [http://localhost:3000/swagger](http://localhost:3000/swagger)
* **OpenAPI спецификация в JSON:** [http://localhost:3000/swagger-json](http://localhost:3000/swagger-json)
* **Статика (фотографии и аватарки):** `http://localhost:3000/uploads/<имя_файла>`

---

## 📦 Формат ответов сервера (Response Wrapper)

Все эндпоинты бэкенда возвращают ответы в едином стандартном формате:

```typescript
export interface ApiResponse<T> {
  statusCode: number;      // 200, 201, 400, 401, 403, 404, 409
  data: T | null;          // Данные ответа (если успешно) или null (при ошибке)
  errors: string[] | null; // Массив сообщений об ошибках или null (если всё ок)
}
```

### Пагинация (PagedResult)
Для списков (посты, комментарии, подписчики) в `data` возвращается объект:

```typescript
export interface PagedResult<T> {
  items: T[];           // Массив элементов
  totalCount: number;   // Всего записей в базе
  pageNumber: number;   // Номер текущей страницы (начиная с 1)
  pageSize: number;     // Размер страницы (по умолчанию 10, максимум 100)
  totalPages: number;   // Всего страниц
}
```

---

## 🔐 Аутентификация (Как передавать токен)

После успешного логина или регистрации сервер возвращает `accessToken`. 

Его нужно сохранять (в `Cookie` или `localStorage`) и передавать в заголовке каждого запроса:
```http
Authorization: Bearer <твой_accessToken>
```

> **Эндпоинты без авторизации (публичные):**
> * Регистрация (`POST /account/register`)
> * Вход (`POST /account/login`)
> * Сброс пароля (`POST /account/forgot-password`, `POST /account/reset-password`)
> * Публичный просмотр постов (`GET /posts`, `GET /posts/:id`, `GET /posts/reels`)
> * Просмотр профиля (`GET /profiles/:userId`)
> * Просмотр комментариев (`GET /posts/:postId/comments`)
> 
> **Все остальные запросы требуют заголовок `Authorization: Bearer <токен>`!**

---

## 🧭 Карта эндпоинтов по экранам приложения

### 1. Экран авторизации и регистрации
| Метод | URL | Описание | Тело запроса (Body) |
| :--- | :--- | :--- | :--- |
| `POST` | `/account/register` | Регистрация | `{ userName, fullName, email, password, confirmPassword }` |
| `POST` | `/account/login` | Вход | `{ userName, password }` |
| `POST` | `/account/refresh-token` | Обновить токен | `{ refreshToken }` |
| `POST` | `/account/logout` | Выход | — (нужен токен в заголовке) |
| `POST` | `/account/forgot-password` | Запрос на сброс пароля | `{ email }` |
| `POST` | `/account/reset-password` | Новый пароль | `{ token, email, password, confirmPassword }` |
| `PUT` | `/account/change-password` | Смена пароля (в профиле) | `{ oldPassword, password, confirmPassword }` |

---

### 2. Главный экран (Лента постов)
| Метод | URL | Описание | Параметры / Тело |
| :--- | :--- | :--- | :--- |
| `GET` | `/posts/feed` | Лента постов от подписок | Query: `?pageNumber=1&pageSize=10` |
| `GET` | `/posts` | Все посты (для Explore) | Query: `?title=...&userId=...&pageNumber=1` |
| `GET` | `/posts/reels` | Лента Рилсов (видео/рилсы) | Query: `?pageNumber=1&pageSize=10` |
| `GET` | `/posts/:id` | Детали одного поста | В URL: `id` |
| `POST` | `/posts/:id/like` | Поставить лайк | — |
| `DELETE` | `/posts/:id/like` | Убрать лайк | — |
| `POST` | `/posts/:id/view` | Засчитать просмотр | — |
| `POST` | `/posts/:id/favorite` | Добавить в закладки | — |
| `DELETE` | `/posts/:id/favorite` | Убрать из закладок | — |

#### Создание поста:
* **Метод:** `POST /posts`
* **Формат:** `multipart/form-data`
* **Поля формы:**
  * `images`: массив файлов картинок (до 10 штук, форматы JPG/PNG/WEBP, до 5 МБ каждый).
  * `title`: заголовок (строка, опционально).
  * `content`: текст описания (строка, опционально).
  * `locationId`: ID локации (число, опционально).
  * `isReel`: `true` или `false` (булево, опционально).

---

### 3. Комментарии под постом
| Метод | URL | Описание | Тело запроса |
| :--- | :--- | :--- | :--- |
| `GET` | `/posts/:postId/comments` | Список комментариев | Query: `?pageNumber=1&pageSize=20` |
| `POST` | `/posts/:postId/comments` | Написать комментарий | `{ "comment": "Текст комментария" }` |
| `DELETE` | `/comments/:id` | Удалить комментарий | — (удалить может автор коммента или автор поста) |

---

### 4. Истории (Stories — 24 часа)
| Метод | URL | Описание | Тело / Детали |
| :--- | :--- | :--- | :--- |
| `GET` | `/stories` | Активные истории подписок | Возвращает истории, сгруппированные по пользователям |
| `GET` | `/stories/me` | Мои активные истории | Список историй текущего пользователя |
| `GET` | `/stories/user/:userId` | Истории пользователя | Список активных историй пользователя |
| `POST` | `/stories` | Загрузить историю | `multipart/form-data`: поле `image` (файл), `postId` (опционально) |
| `POST` | `/stories/:id/like` | Лайкнуть историю | — |
| `DELETE` | `/stories/:id/like` | Убрать лайк | — |
| `POST` | `/stories/:id/views` | Засчитать просмотр | — |
| `GET` | `/stories/:id/viewers` | Список зрителей | Доступно только владельцу истории |
| `DELETE` | `/stories/:id` | Удалить историю | Доступно только владельцу истории |

---

### 5. Экран профиля и пользователи
| Метод | URL | Описание | Параметры / Тело |
| :--- | :--- | :--- | :--- |
| `GET` | `/profiles/me` | Мой профиль | Возвращает подписчиков, подписки, посты, био, аватар |
| `GET` | `/profiles/:userId` | Чужой профиль | Содержит поле `isFollowing: true/false` |
| `PATCH` | `/profiles/me` | Редактировать профиль | `{ "fullName": "...", "bio": "...", "website": "..." }` |
| `PUT` | `/profiles/me/avatar` | Сменить аватарку | `multipart/form-data`: поле `image` (файл) |
| `DELETE` | `/profiles/me/avatar` | Удалить аватарку | — |
| `GET` | `/profiles/me/favorites` | Мои сохранённые посты | Query: `?pageNumber=1&pageSize=12` |
| `POST` | `/users/:userId/follow` | Подписаться на юзера | В URL: `userId` |
| `DELETE` | `/users/:userId/follow` | Отписаться | В URL: `userId` |
| `GET` | `/users/:userId/followers` | Список подписчиков | Query: `?pageNumber=1&pageSize=20` |
| `GET` | `/users/:userId/following` | Список подписок | Query: `?pageNumber=1&pageSize=20` |
| `GET` | `/users` | Поиск пользователей | Query: `?search=alex&pageNumber=1` |

---

### 6. Личные сообщения (Директ / Чаты)
| Метод | URL | Описание | Тело запроса |
| :--- | :--- | :--- | :--- |
| `GET` | `/chats` | Все диалоги с последним сообщением | — |
| `POST` | `/chats` | Открыть или создать диалог | `{ "receiverUserId": 2 }` |
| `GET` | `/chats/:chatId` | Информация о диалоге | В URL: `chatId` |
| `GET` | `/chats/:chatId/messages` | История сообщений | Query: `?pageNumber=1&pageSize=20` |
| `POST` | `/chats/:chatId/messages` | Отправить сообщение | **Простой JSON:** `{ "text": "Салом!" }` (или multipart с файлом) |
| `PATCH` | `/chats/:chatId/read` | Отметить прочитанным | — |
| `DELETE` | `/chats/:chatId/messages/:messageId` | Удалить сообщение | В URL: `chatId`, `messageId` |
| `DELETE` | `/chats/:chatId` | Удалить весь диалог | В URL: `chatId` |

---

### 7. Локации (Locations)
| Метод | URL | Описание | Тело / Параметры |
| :--- | :--- | :--- | :--- |
| `GET` | `/locations` | Поиск локаций | Query: `?search=Dushanbe&pageNumber=1&pageSize=20` |
| `GET` | `/locations/:id` | Детали локации | В URL: `id` |
| `POST` | `/locations` | Создать локацию | `{ "name": "...", "address": "...", "latitude": 38.5, "longitude": 68.7 }` |

---

### 8. История поиска (Search History)
| Метод | URL | Описание | Тело / Параметры |
| :--- | :--- | :--- | :--- |
| `GET` | `/search-history` | История моих поисков | — |
| `POST` | `/search-history` | Записать поиск | `{ "query": "alex", "targetUserId": 1 }` |
| `DELETE` | `/search-history/:id` | Удалить запись | В URL: `id` |
| `DELETE` | `/search-history` | Очистить всю историю | — |

---

## 📐 Готовые типы моделей данных (TypeScript Interfaces)

Скопируй это в `frontend/src/types/index.ts`:

```typescript
export interface User {
  id: number;
  userName: string;
  fullName?: string;
  email: string;
  avatarUrl?: string | null;
  profile?: Profile;
}

export interface Profile {
  id: number;
  fullName?: string;
  bio?: string;
  website?: string;
  gender?: string;
  phone?: string;
  avatarUrl?: string | null;
  postsCount: number;
  followersCount: number;
  followingCount: number;
  isFollowing?: boolean;
}

export interface PostImage {
  id: number;
  imageUrl: string;
  order: number;
}

export interface Location {
  id: number;
  name: string;
  address?: string;
}

export interface Post {
  id: number;
  title?: string;
  content?: string;
  isReel: boolean;
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  isLiked?: boolean;
  isFavorited?: boolean;
  createdAt: string;
  user: User;
  images: PostImage[];
  location?: Location | null;
}

export interface Comment {
  id: number;
  comment: string;
  createdAt: string;
  user: User;
}

export interface Story {
  id: number;
  imageUrl: string;
  createdAt: string;
  expiresAt: string;
  viewsCount: number;
  likesCount: number;
  isLiked?: boolean;
  user?: User;
}

export interface UserStoriesGroup {
  user: User;
  stories: Story[];
}

export interface Message {
  id: number;
  text?: string;
  fileUrl?: string | null;
  isRead: boolean;
  createdAt: string;
  senderId: number;
  sender: User;
}

export interface Chat {
  id: number;
  updatedAt: string;
  unreadCount?: number;
  lastMessage?: Message | null;
  partner?: User;
}
```

---

## 🛠 Готовый пример API-клиента на TypeScript

Создай в `frontend/src/lib/api.ts`:

```typescript
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const resJson = await response.json();

  if (!response.ok || resJson.errors) {
    const errorMsg = Array.isArray(resJson.errors)
      ? resJson.errors.join(', ')
      : resJson.message || 'Server error';
    throw new Error(errorMsg);
  }

  return resJson.data as T;
}
```

### Пример использования на фронтенде:

```typescript
// 1. Вход
const authData = await apiRequest<{ accessToken: string }>('/account/login', {
  method: 'POST',
  body: JSON.stringify({ userName: 'alex_photographer', password: 'Password123!' }),
});

// 2. Получить ленту постов
const feed = await apiRequest<{ items: any[] }>('/posts/feed', {}, authData.accessToken);

// 3. Отправить сообщение в чат
const message = await apiRequest('/chats/1/messages', {
  method: 'POST',
  body: JSON.stringify({ text: 'Салом! Ахвол чихел?' }),
}, authData.accessToken);
```

---

## 💡 Полезные советы для фронтенда:

1. **Фотографии:** Сервер возвращает пути вида `/uploads/12345.jpg`. Чтобы отобразить картинку в браузере, используй:
   `<img src={`http://localhost:3000${post.images[0]}`} />`.
2. **Если нужно сбросить базу и заново наполнить данными:**
   В терминале бэкенда просто напиши:
   ```bash
   npm run seed
   ```
   И в базе снова появятся тестовые пользователи, посты, лайки, комментарии и чаты!
