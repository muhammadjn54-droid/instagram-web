# SECURITY

| Field | Value |
|---|---|
| Applies to | the whole app |
| Date | 2026-10-21 |
| Related | `AUTH.md`, `ENVIRONMENT.md`, `API_CONTRACT.md` |

## 1. The threat model

| Threat | Mitigation |
|---|---|
| The JWT is stolen by an XSS bug | The token is only in an **httpOnly** cookie; the client bundle never sees it |
| A third party forges a session | The cookie is signed with `SESSION_SECRET` and verified with a constant-time comparison |
| CSRF (a third-party site submits a form as the user) | `SameSite=Lax` cookies + the action checks the session + a same-origin check |
| A user edits someone else's post | The backend enforces ownership; the UI hides the action; the server still checks |
| A user reads another user's private data | `requireSession()` in the DAL; the proxy is only an optimistic redirect |
| A malicious image URL (SSRF) | `images.remotePatterns` is an allowlist |
| An open redirect via `?next=` | The `next` parameter is validated against a path-only pattern |
| A secret leaks into the repository | `.env*` is gitignored; only `NEXT_PUBLIC_` values are public |
| A user uploads a 100 MB file | The size and type are checked on the client **and** on the server |
| A Server Action is called directly by an attacker | Every action re-checks the session and re-validates its input |
| Private data leaks into a cached scope | Personalised data is never put in a `"use cache"` scope |

## 2. The session cookie

| Property | Value | Reason |
|---|---|---|
| `httpOnly` | `true` | JavaScript cannot read it |
| `secure` | `true` in production | HTTPS only |
| `sameSite` | `"lax"` | Blocks cross-site POSTs |
| `path` | `"/"` | |
| `maxAge` | 86400 | Matches the JWT lifetime |
| Value | signed payload | Tampering is detected |

See `AUTH.md` §2 for the implementation.

## 3. Rules

1. **The access token never reaches the browser.** Not in a cookie, not in
   `localStorage`, not in a query string, not in the HTML.
2. **Only the DAL reads `process.env` for secrets.** A component must never
   read `SESSION_SECRET` or `JWT_SECRET`.
3. **Every Server Action verifies the session itself.**
4. **Every input is re-validated on the server**, even if the client already
   validated it.
5. **The current user id comes from the session**, never from the request
   body, the query string or a hidden field.
6. **Never render user content as HTML.** Use React's escaping (the default).
   Never use `dangerouslySetInnerHTML` with user data — the only exception is
   the JSON-LD block, and the data must be serialised safely.
7. **Redirect targets are validated.** Only paths that start with a single
   `/` and do not start with `//` and do not contain a scheme.
8. **`process.env.SESSION_SECRET` must exist.** Fail loudly at boot rather
   than falling back to a default.

## 4. `server-only`

```ts
// src/lib/dal/posts.ts
import "server-only";
```

The `server-only` package makes the **build fail** if a server module is
imported into a client bundle. Use it in:

* `src/lib/dal/**`
* `src/lib/auth/**`
* `src/lib/api/**`
* any module that reads `process.env.SESSION_SECRET`

The package is bundled with Next.js — if the linter complains, install
`server-only` explicitly: `npm install server-only`.

## 5. Input validation on the client

Client validation is a UX feature, not a security control. It exists to give
fast feedback and to avoid pointless requests. **The server is the
authority.**

| Field | Client rule | Server rule (backend) |
|---|---|---|
| `userName` | `^[a-zA-Z0-9._]+$`, 3–30 chars | `^[a-zA-Z0-9._]+$` |
| `email` | valid email | `@IsEmail` |
| `password` | ≥ 6 chars | `minLength(6)` |
| `confirmPassword` | equals `password` | service check |
| comment | 1–500 chars | `MinLength(1)`, `MaxLength(500)` |
| images | 1–10 files, ≤ 5 MB, jpg/png/webp | multer limits |
| `locationId` | integer | `@IsInt` |

## 6. Uploads

| Check | Where |
|---|---|
| File count | Client + Route Handler |
| MIME type | Client + Route Handler (the backend also checks) |
| File size | Client + Route Handler (the backend also checks) |
| The file name | **Never used** — the backend generates its own name |
| The content type is trusted? | **No** — the browser can lie. The backend's multer only checks the declared type |

Do not implement a "preview the actual file content" feature on the client
without a real content check.

## 7. Open redirects

```ts
export function safeNext(target: string | null | undefined, fallback = "/feed"): string {
  if (!target) return fallback;
  if (!target.startsWith("/")) return fallback;
  if (target.startsWith("//")) return fallback;
  if (target.includes("\\")) return fallback;
  return target;
}
```

Use it for the `?next=` parameter of the login redirect.

## 8. Rate limiting and abuse

The backend does not implement rate limiting yet. The frontend mitigates the
obvious cases:

* Disable the submit button while a request is pending (prevents a
  double-submit, not a deliberate flood).
* Debounce the search field (300 ms) so typing does not produce a request
  per keystroke.
* Do not poll; the app has no polling in this release.

## 9. Content security

* No inline `<script>` except the theme bootstrap script (a static string
  with no interpolation).
* No third-party scripts.
* If a CSP is added, it goes in `next.config.ts` under `headers()`:

```ts
async headers() {
  return [
    {
      source: "/:path*",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "X-Frame-Options", value: "DENY" },
      ],
    },
  ];
}
```

## 10. Dependency hygiene

* `npm audit` must not report a high severity issue.
* Prefer a small dependency; a date formatter is not a dependency.
* Pin the major version; review the changelog before upgrading Next.js —
  v16 removed `middleware.ts`, `unstable_cache`, `next lint` and the
  synchronous request APIs.

## 11. Security checklist

- [ ] The JWT is not in the HTML, the bundle, `localStorage` or a URL
- [ ] The session cookie is `httpOnly`, `Secure` in production, `SameSite=Lax`
- [ ] The cookie value is signed and verified with `timingSafeEqual`
- [ ] Every Server Action calls `requireSession()` (or an equivalent check)
- [ ] Every input is validated on the server
- [ ] The user id always comes from the session
- [ ] `?next=` is validated
- [ ] `server-only` protects the DAL and the auth module
- [ ] Uploads are validated for count, type and size on both sides
- [ ] `images.remotePatterns` is an allowlist
- [ ] No `dangerouslySetInnerHTML` with user content
- [ ] `.env*` is in `.gitignore`; only `NEXT_PUBLIC_` values are public
- [ ] `SESSION_SECRET` has no default fallback
- [ ] `npm audit` reports no high-severity issues
