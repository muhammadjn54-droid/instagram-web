# Security & Data Protection Specification — Instagram Web Clone

> **Document Version:** 1.0  
> **Security Posture:** OWASP Top 10 Web Application Standards

---

## 1. Authentication & Token Safeguards

* **JWT Handling:**
  * Tokens are signed server-side using HMAC SHA-256 with `JWT_SECRET`.
  * Passwords are never returned in any API response (DTOs explicitly omit or strip `password`).
  * Expired tokens trigger immediate client-side session destruction and redirect to `/login`.
* **Cookie Flags:**
  * `SameSite=Lax` prevents CSRF attacks on standard navigation.
  * `Path=/` ensures cookie availability across all subroutes.

---

## 2. Input Sanitization & XSS Defense

* **React Rendering Engine:**
  * All user-supplied text (captions, comments, bios, usernames) is rendered using standard React JSX curly braces `{text}`, preventing script injection.
* **Link Target Security:**
  * External website links in user bios must include `rel="noopener noreferrer nofollow" target="_blank"`.

---

## 3. Upload & File Protection

* **Strict MIME Whitelisting:**
  * Only `image/jpeg`, `image/png`, and `image/webp` are accepted by Multer.
  * Any executable or unrecognized payload is rejected with `400 Bad Request`.
* **File Size Limit:**
  * Max 5 MB per file.
* **Server-side Renaming:**
  * Files are stored as unique timestamps + random suffixes (`Date.now() + '-' + Math.round(Math.random() * 1e9) + ext`) to completely prevent directory traversal and name collisions.


---

## 4. Security review of 2026-10-23 (findings and status)

| ID | Finding | Status |
| :--- | :--- | :---: |
| SEC-01 | `POST /account/reset-password` accepted any token; the "token" was `reset-token-<userId>` (predictable). Any visitor could take over any account knowing only its e-mail. Now: random 24-byte token, stored as SHA-256, 15 min expiry, single use, revokes the refresh token. | **FIXED** |
| SEC-02 | `GET /profiles/me/favorites` returned raw TypeORM rows including `user.password` (bcrypt hash), `email` and `refreshToken`. Now returns `PostDto`. | **FIXED** |
| SEC-03 | Refresh token was `ref-<id>-<timestamp>` (guessable); logout/reset did not clear it (`undefined` is ignored by `update`). Now `randomBytes(32)` and `null` on logout/reset. | **FIXED** |
| SEC-04 | `GET /users/:id` is public and returned every user's e-mail. Now only the owner receives it. | **FIXED** |
| SEC-05 | `?redirect=` after login could point to another site (`//evil.example`). Now restricted to same-site relative paths (`safeRedirectPath`). | **FIXED** |
| SEC-06 | Private accounts are enforced only in the UI; the API returns their posts (GAP-6). | OPEN |
| SEC-07 | `GET /users?search=` matches e-mail substrings (e-mail probing) (GAP-7). | OPEN |
| SEC-08 | `JwtModule` falls back to a hard-coded secret when `JWT_SECRET` is missing (`account.module.ts`). **Always set `JWT_SECRET` outside local development.** | OPEN |
| SEC-09 | No rate limiting on login / forgot-password (planned: `@nestjs/throttler`). | OPEN |
| SEC-10 | In development the API returns the reset token in the response (no mail service). In production (`NODE_ENV=production`) it is only logged. A mail provider is required before going live. | OPEN |

Upload rules actually enforced by the backend (`common/utils/multer.util.ts`): MIME `jpeg|jpg|png|webp`, **5 MB** per file (not 10 MB as the old API contract said), random file names. The frontend mirrors these limits in `validateImageFile` so the user gets an immediate message.
