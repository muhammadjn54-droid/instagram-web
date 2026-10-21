# TROUBLESHOOTING

| Field | Value |
|---|---|
| Applies to | `frontend/` |
| Date | 2026-10-21 |
| Related | `../tz.md`, `API_CONTRACT.md`, `DATA_FETCHING.md` |

## 1. Build errors

### `params` / `searchParams` are Promises

```
Type 'params' is not assignable to type 'Promise<...>'
```

Synchronous access was **removed** in Next 16.

```tsx
// Wrong
export default function Page({ params }: { params: { id: string } }) {
  return <div>{params.id}</div>;
}

// Right
export default async function Page(props: PageProps<"/post/[id]">) {
  const { id } = await props.params;
  return <div>{id}</div>;
}
```

### `cookies()` / `headers()` are Promises

```ts
const store = await cookies();
const h = await headers();
```

### "Missing Suspense boundary with useSearchParams"

A Client Component calls `useSearchParams()` and is not inside a
`<Suspense>`. Wrap the component that calls it.

### "Route … used `params` … without a Suspense boundary" / blocking-route

A Server Component reads `cookies()`, `headers()`, `params` or
`searchParams` outside a `<Suspense>` boundary. Move the read into the leaf
component and wrap it.

### "Page … does not have a `default.tsx`"

Every parallel route slot (`@slot`) needs a `default.tsx`:

```tsx
import { notFound } from "next/navigation";
export default function Default() {
  notFound();
}
```

### "use cache: … cannot access … " / `next-request-in-use-cache`

A `"use cache"` scope reads `cookies()`, `headers()` or `searchParams`. The
restriction follows the call stack — a helper the cached function calls
fails the same way. Read the value **outside** the scope and pass it in as an
argument.

Note: on a dynamically rendered route this can **pass `next build` and fail
under `next start`**. Always run `npm run build && npm run start` before
shipping, not just the dev server.

### "Filling a cache during prerender timed out"

The cached function awaits a Promise created outside a `"use cache"` boundary
that resolves to uncached or request-specific data. Move the read inside the
scope, or pass the value in as an argument.

### `PageProps` / `LayoutProps` are not found

The generated types do not exist yet. Run `next dev` or `next build` once, or
run `npx next typegen`.

### `revalidateTag` expects 2 arguments

The single-argument form is deprecated and is a TypeScript error in v16:

```ts
revalidateTag("posts", "max");
```

### `next lint` is not a command

`next lint` was removed in v16. Use the ESLint CLI — the script already
exists:

```bash
npm run lint
```

### The build fails with a `webpack` config

Turbopack is the default bundler in v16 and **cannot** use a custom webpack
config. Remove it, or opt out explicitly with `next build --webpack`.

### `TypeError: Cannot read properties of undefined (reading 'data')`

The response was not an envelope and not a payload the client understands.
Log the raw body once and check the shape — see §2.

## 2. Runtime problems

### The response has no `data`

The backend's `ResponseInterceptor` is **not registered** globally, so the
live server returns a bare payload. The client accepts both shapes, but if a
caller assumes the envelope, fix the caller — not the client.

### Every request returns 404

Only `AccountModule` is mounted in `backend/src/app.module.ts`. The other
modules exist but are not imported, so `/posts`, `/profiles`, `/users`,
`/chats`, `/stories`… all answer 404. See `BACKEND_READINESS.md`.

### The backend does not enforce auth

`JwtAuthGuard` is defined but never registered as an `APP_GUARD`, so
unauthenticated requests currently succeed. **Do not rely on that**: the
frontend must always send the token, and the DAL must always call
`requireSession()`.

### The token is missing on a request

The DAL must pass `token: session.accessToken`. A `fetch` outside the DAL
cannot set the header.

### A request is not cached

Under `cacheComponents`, a `fetch` is **dynamic by default**. Only a
`"use cache"` scope is cached. Also check that the function does not read a
request API and that the argument is serialisable.

### The page is fully client-rendered

Something read a request API at the top of the tree (for example the layout
reading the cookie), which makes the whole subtree dynamic. Move the read
into a leaf under a `<Suspense>` boundary.

### The images do not load

| Symptom | Cause | Fix |
|---|---|---|
| 400 from `/_next/image` | The `quality` is not in `images.qualities` | Use `quality={75}` or omit it |
| 400 with a query string | A local image with a query string | Add `images.localPatterns[].search` |
| The image is unoptimised | The remote host is not in `remotePatterns` | Add the pattern |
| 404 on the image | The backend does not serve `/uploads` | Check the backend's static serving |

### The upload fails with "Only JPG, PNG and WEBP image files are allowed!"

The backend checks the **declared** MIME type with the regex
`/\/(jpg|jpeg|png|webp)$/`. A `.jpg` file with the type `image/jpg` passes;
a file with the type `image/heic` does not. Re-encode the image.

### The upload fails with "File too large"

The limit is **5 MB** (`5 * 1024 * 1024`), not 10 MB. The frontend must
check the size before the request.

### `ENOSPC` / the disk is full

The backend writes the uploads to `./uploads` on its own disk.

### The dev server says "another instance is running"

A lockfile prevents two `next dev` / `next build` runs on the same project.
Stop the other process.

### The dev server is slow on Windows

Windows Defender slows the file watcher. Exclude the project folder, or
accept the slower refresh.

## 3. Style problems

### A Tailwind class does not exist

Tailwind v4 scans the source files. A class built by interpolation is not
generated:

```tsx
// Wrong
<div className={`bg-${tone}-500`} />

// Right
<div className={tone === "red" ? "bg-red-500" : "bg-blue-500"} />
```

### `dark:` does not work

Tailwind v4 does not enable the dark variant by default. Add:

```css
@custom-variant dark (&:where(.dark, .dark *));
```

### A colour utility does not exist

A CSS variable in `:root` is not enough. It must also be declared in
`@theme inline`:

```css
@theme inline {
  --color-brand: var(--brand);
}
```

### The theme flashes on reload

The theme is in `localStorage`, which the server does not know. Add the
blocking script in the root layout (`DESIGN_SYSTEM.md` §9).

### The CSS order is wrong in production

Verify the final order with `next build` — the dev order is not always the
production order.

## 4. Auth problems

| Symptom | Cause | Fix |
|---|---|---|
| The user is logged out after a reload | The cookie was not set, or `SameSite`/`secure` blocked it | Check the response's `Set-Cookie`; `secure` must be `false` in dev over HTTP |
| The cookie is set but ignored | `SESSION_SECRET` differs between the processes | One secret for the whole environment |
| A redirect loop | The proxy redirects, but the cookie is not readable | Check `httpOnly`, the path and the expiry |
| The `next` parameter is ignored | The value was not validated | Use `safeNext()` |
| "Invalid credentials" for a correct password | The field is `userName`, not `username` | Use `userName` |

## 5. Performance problems

| Symptom | Likely cause |
|---|---|
| A slow first paint | A request API at the top of the tree, or a missing cache scope |
| A big layout shift | An image without dimensions, or a skeleton that does not match |
| A slow interaction | Too much Client Components; move them to the server |
| A huge bundle | A library that should be 20 lines of code |

Measure with `next build` (the per-route sizes), Lighthouse and the React
DevTools profiler.

## 6. Where to look first

1. `npm run build` — the error message is usually precise.
2. The browser console — hydration errors, missing keys, invalid props.
3. The Network tab — the request URL, the headers, the status, the body.
4. `backend/src/main.ts` — the global prefix, CORS and the validation pipe.
5. `backend/src/app.module.ts` — which modules are actually mounted.
6. The Swagger UI at `http://localhost:3000/swagger` — the intended
   contract.
7. `frontend/node_modules/next/dist/docs/` — the authoritative Next.js
   documentation for this exact version.
