# ENVIRONMENT

| Field | Value |
|---|---|
| Applies to | `frontend/.env*` |
| Date | 2026-10-21 |
| Related | `SECURITY.md`, `AUTH.md` |

## 1. Variables

| Variable | Public | Required | Dev value | Purpose |
|---|---|---|---|---|
| `API_BASE_URL` | no | ✅ | `http://localhost:3000` | The NestJS API origin, used by the DAL and the upload relays |
| `NEXT_PUBLIC_APP_URL` | yes | ✅ | `http://localhost:3001` | The canonical URL for metadata, OG images, the sitemap and the robots file |
| `SESSION_SECRET` | no | ✅ | `openssl rand -base64 32` | Signs the session cookie. **No default.** |
| `NODE_ENV` | no | auto | `development` | Set by Next.js |

> `NEXT_PUBLIC_` variables are **inlined into the client bundle at build
> time**. Only put public values there. `API_BASE_URL` and `SESSION_SECRET`
> are server-only and must never carry the prefix.

## 2. Files

```
frontend/
├── .env                  # committed: public defaults, no secrets
├── .env.local            # gitignored: your local secrets
├── .env.development      # optional
├── .env.production       # optional, set by the host
└── .env.test             # committed: the test environment
```

Load order (the first hit wins):

1. `process.env` (set by the shell)
2. `.env.$(NODE_ENV).local`
3. `.env.local` — **not** loaded when `NODE_ENV=test`
4. `.env.$(NODE_ENV)`
5. `.env`

Rules:

* `.env*` files live in the **project root**, even though the code is in
  `src/`.
* `.env*.local` must be in `.gitignore` (the current `.gitignore` already
  covers `.env*` patterns — verify it).
* `.env.test` is committed so the test suite is reproducible.
* `$VAR` expansion inside `.env*` is supported; escape a literal `$` as `\$`.

## 3. `.env.example` (commit this)

```bash
# The NestJS API origin — server only, never exposed to the browser
API_BASE_URL=http://localhost:3000

# The canonical URL of this app — public
NEXT_PUBLIC_APP_URL=http://localhost:3001

# Sign the session cookie — server only, generate with:
#   openssl rand -base64 32
SESSION_SECRET=
```

## 4. Generating a secret

```bash
openssl rand -base64 32
# Windows PowerShell:
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

Never reuse the value across environments. Rotating `SESSION_SECRET`
invalidates every session — that is the intended behaviour.

## 5. Local development

```bash
# terminal 1 — the backend
cd ../backend
npm run dev            # http://localhost:3000, Swagger at /swagger

# terminal 2 — the frontend
npm run dev -- -p 3001  # http://localhost:3001
```

The backend defaults to port **3000** and the frontend to **3000** as well,
so **the frontend must run on 3001** (or the backend must be moved with
`PORT=3002 npm run dev`).

## 6. Reading a variable

```ts
// Server code — read it directly
const base = process.env.API_BASE_URL;

// Client code — only NEXT_PUBLIC_ variables are inlined
const appUrl = process.env.NEXT_PUBLIC_APP_URL;
```

* A **dynamic** lookup (`process.env[varName]`) is **not** inlined — only
  the literal `process.env.NEXT_PUBLIC_X` form works.
* Never read a secret in a Client Component. The build would inline it or
  the `server-only` guard would fail the build.
* Never read `process.env` outside the DAL / auth modules. A server
  component that reads the environment at request time becomes dynamic —
  use the "read after `await connection()`" pattern only when a value is
  truly runtime-only (for example a secret rotated without a rebuild).

## 7. `next.config.ts` and the environment

`next.config.ts` is loaded once in dev, so `process.argv` does **not**
contain `"dev"` any more — use `NODE_ENV` or the `phase` argument instead.

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "3000", pathname: "/uploads/**" },
    ],
    qualities: [75],
  },
  turbopack: {
    rules: { "*.css": { loaders: ["@tailwindcss/turbopack"], as: "*.css" } },
  },
};

export default nextConfig;
```

## 8. Production

| Variable | Where it is set |
|---|---|
| `API_BASE_URL` | The hosting platform's environment settings |
| `NEXT_PUBLIC_APP_URL` | The hosting platform's environment settings — **must** be the public origin |
| `SESSION_SECRET` | The hosting platform's secret store |

`NEXT_PUBLIC_*` values are baked in at **build** time — changing them
requires a rebuild, not just a restart.

## 9. Adding a variable

1. Add it to `.env.example` with a comment.
2. Add it to `.env.local` (and to the CI/production secret store).
3. Add it to `docs/ENVIRONMENT.md` §1 and to `docs/SECURITY.md` if it is
   sensitive.
4. Read it only on the server unless it is explicitly public.
