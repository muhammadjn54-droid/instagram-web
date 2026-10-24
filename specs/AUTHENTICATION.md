# Authentication & Session Architecture — Instagram Web Clone

> **Document Version:** 2.0 (2026-10-23) — rewritten to match the implementation (BFF + httpOnly cookies).
> **Mechanism:** the backend issues a JWT; the Next.js server keeps it in an httpOnly cookie and attaches it to every backend call.

---

## 1. Lifecycle

```
Browser ──POST /api/session {userName, password}──► Next.js route handler
                                                   │  POST /account/login (NestJS, bcrypt check)
                                                   ◄─ { accessToken, refreshToken, expiresAt, user }
        ◄─ Set-Cookie: ig_access (httpOnly), ig_refresh (httpOnly), ig_user ─┘
Browser ──/api/backend/<path>──► Next.js proxy ──Authorization: Bearer <cookie token>──► NestJS
```

* `userName` accepts a **username or an e-mail**.
* `POST /api/session/register` registers and logs in in one step.
* `DELETE /api/session` calls `POST /account/logout` and removes the cookies.
* The browser JavaScript never sees the JWT (no `localStorage`, no readable cookie).
* Cookie names live in `frontend/src/lib/auth/cookies.ts`; `secure` is enabled in production.
* Access token lifetime: 24 h (JWT `exp`); the cookie has the same lifetime. The refresh endpoint exists on the backend but the UI does not call it — an expired session returns the user to the login page.

## 2. Guards

| Layer | What it does |
| :--- | :--- |
| `src/proxy.ts` (Next.js 16 "middleware") | No cookie → redirect to `/login?redirect=<path>`; cookie present on an auth page → redirect to `/feed`. Checks presence only. |
| NestJS `JwtAuthGuard` (global) | Validates the token on every route. Routes marked `@Public()` are open **but still read the token when one is sent** (needed for `isLikedByMe`, `isFollowing`, …). An invalid token on a public route is ignored, not rejected. |
| `SessionGuard` (client) | On any `401` from the API: deletes the stale cookie (`DELETE /api/session`) and navigates to `/login?redirect=…`. Without the cookie deletion the proxy would bounce `/login` back to `/feed` forever. |
| `safeRedirectPath` | Only same-site relative paths are accepted from `?redirect=` (no `//host`, no backslashes). |

## 3. Password recovery

1. `POST /account/forgot-password {email}` → the backend creates a random 24-byte token, stores only its SHA-256 hash and a 15 minute expiry on the user, writes the token to the server log.
2. Outside production the response also contains the token (`"…generated: <token>"`) so the UI can show it — there is no mail service. With `NODE_ENV=production` the response carries no token.
3. `POST /account/reset-password {token,email,password,confirmPassword}` → rejects with `400 Invalid or expired reset token` unless the hash matches and has not expired; the token is single use; the stored refresh token is revoked.

## 4. Route access

| Route pattern | Access | Unauthenticated | Authenticated |
| :--- | :---: | :--- | :--- |
| `/login`, `/register`, `/forgot-password`, `/reset-password` | public only | page | redirect to `/feed` |
| everything else except `/api/*`, static files, `/uploads/*` | protected | redirect to `/login?redirect=…` | page |

## 5. Test accounts

After `npm run seed` in `backend/` (the seed deletes existing rows first): 42 users, for example `muhammad_dev` — password `Password123!` for all.
