# MEDIA — Images, uploads and the `next/image` setup

| Field | Value |
|---|---|
| Applies to | every image in the app, `next.config.ts`, the upload Route Handlers |
| Date | 2026-10-21 |
| Related | `API_CONTRACT.md` §3, `FORMS.md` §7, `PERFORMANCE.md` |

## 1. Where the media comes from

The backend stores uploads on disk in `./uploads` and serves them at
`/uploads/<filename>`. The URL stored in the database is **relative**
(`/uploads/abc-123.jpg`), so the browser needs an absolute origin.

| Environment | Backend origin | Image URL |
|---|---|---|
| Local | `http://localhost:3000` | `http://localhost:3000/uploads/abc.jpg` |
| Production | `https://api.example.com` | `https://api.example.com/uploads/abc.jpg` |

Build the absolute URL in one helper — never inline the origin in a
component:

```ts
// src/lib/utils/media.ts
export function mediaUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const base = process.env.API_BASE_URL ?? "";
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
```

`mediaUrl` runs on the server for Server Components. For a Client Component
that receives an already-built URL, pass the absolute URL down as a prop.

## 2. `next/image` configuration

```ts
// next.config.ts
const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "api.example.com",
        pathname: "/uploads/**",
      },
    ],
    qualities: [75],
    formats: ["image/avif", "image/webp"],
  },
  turbopack: {
    rules: { "*.css": { loaders: ["@tailwindcss/turbopack"], as: "*.css" } },
  },
};
```

Rules from the Next.js 16 documentation:

* `images.domains` is **deprecated** → use `remotePatterns`.
* `images.qualities` defaults to `[75]`. A `quality` prop outside the array
  is coerced to the closest allowed value; an unsupported `?q=` in the URL
  returns a **400**. Only use `quality={75}` or omit it.
* `images.minimumCacheTTL` defaults to **4 hours** in v16.
* `images.maximumRedirects` defaults to **3**.
* Local image **query strings** require `images.localPatterns[].search`.
* The default loader does **not** forward the `Authorization` header — for
  authenticated media use `unoptimized` or a signed URL.

## 3. `next/image` in practice

```tsx
import Image from "next/image";

<Image
  src={mediaUrl(post.images[0]) ?? "/placeholder.svg"}
  alt={`Post by ${post.userName}`}
  width={470}
  height={470}
  sizes="(max-width: 640px) 100vw, 470px"
  className="aspect-square w-full object-cover"
/>
```

| Prop | Rule |
|---|---|
| `alt` | **Required.** Describe the content; use `alt=""` only for decorative images |
| `width` / `height` | Required unless `fill` is used — they reserve the space and prevent CLS |
| `fill` | The parent must be `relative` and have an explicit size (`aspect-square`) |
| `sizes` | Required for responsive images; describe the real widths |
| `quality` | Only `75` |
| `preload` | The v16 replacement for `priority` — use it for the LCP image only |
| `unoptimized` | Use for already-optimised or authenticated images |

> `priority` is **deprecated** in Next 16 — use `preload`. In most cases
> `loading="eager"` or `fetchPriority="high"` is the better choice; use
> `preload` only for the single LCP element of a page.

### The LCP image

Only **one** image per page should be preloaded. On a feed it is the first
post's first image.

```tsx
<Image
  src={url}
  alt="…"
  width={470}
  height={470}
  sizes="(max-width: 640px) 100vw, 470px"
  preload
  fetchPriority="high"
/>
```

## 4. Image by context

| Context | Implementation |
|---|---|
| Post carousel | `fill` inside an `aspect-square relative` container, `sizes="(max-width: 640px) 100vw, 470px"` |
| Profile grid cell | `fill` inside an `aspect-square relative` container, `sizes="33vw"` |
| Avatar | `width`/`height` from the size table, `rounded-full` |
| Story bubble | `width`/`height`, 80 px, `rounded-full ring-2` |
| Story viewer | `fill`, `object-cover`, `sizes="100vw"` |
| Chat file attachment | `fill` inside a `max-h-64 relative rounded-xl` container |

## 5. Local placeholder

Put a neutral placeholder in `public/`:

```
public/
├── placeholder.svg      # 1:1 grey box for a post image
├── avatar-placeholder.svg
└── logo.svg
```

```tsx
<Image src={mediaUrl(post.images[0]) ?? "/placeholder.svg"} … />
```

## 6. Uploading

### Rules (from the backend)

| Property | Value |
|---|---|
| Transport | `multipart/form-data` |
| Max size | **5 MB** per file |
| Types | `image/jpeg`, `image/png`, `image/webp` |
| Post images | field `images`, 1–10 files |
| Avatar | field `image`, 1 file |
| Story | field `image`, 1 file |
| Chat file | field `file`, 0–1 file |

### The flow

```
Browser                    Next.js Route Handler              NestJS
  │  pick files                                                        │
  │  validate (count, type, size) — client side                        │
  │──POST /api/upload/post (multipart)──►│                              │
  │                                     │  read the session cookie     │
  │                                     │  add Authorization: Bearer   │
  │                                     │──POST /posts (multipart)────►│
  │                                     │                              │ writes to ./uploads
  │◄────── { post } ────────────────────│◄────── { PostDto } ──────────│
```

The browser **never** talks to the NestJS upload endpoint directly — it
cannot add the `Authorization` header.

### Validation on both sides

| Check | Client | Server |
|---|---|---|
| File count | ✅ (immediate feedback) | ✅ (authoritative) |
| File type | ✅ (`accept` + a `type` check) | ✅ |
| File size | ✅ | ✅ |
| Session | — | ✅ |

### A chat file is not necessarily an image

`POST /chats/:chatId/messages` accepts a `file`. The backend's multer
configuration restricts uploads to image MIME types, so **a chat file is an
image in this release**. The UI must not offer arbitrary documents.

## 7. Previews before upload

```tsx
const [previews, setPreviews] = useState<string[]>([]);

useEffect(() => {
  const urls = files.map((file) => URL.createObjectURL(file));
  setPreviews(urls);
  return () => urls.forEach((url) => URL.revokeObjectURL(url));
}, [files]);
```

Always revoke the object URLs — otherwise the memory leaks on every pick.

## 8. Story images

* A story image is displayed with `object-cover` in a 9:16 frame.
* The upload is one image, ≤ 5 MB, `jpg|png|webp`.
* A story may link to a post (`postId`); the viewer shows a small "linked
  post" card.

## 9. Avatar

* The avatar is uploaded through `PUT /profiles/me/avatar` with the field
  name `image`.
* The response is the avatar URL (a string).
* Removing it: `DELETE /profiles/me/avatar` → `"Avatar removed"`.
* The avatar is rendered as a circle with the initials fallback.

## 10. Checklist

- [ ] Every content image uses `next/image`
- [ ] Every image has a meaningful `alt`
- [ ] `width`/`height` or `fill` + an aspect-ratio parent
- [ ] `sizes` is set on every responsive image
- [ ] Only one image per page is preloaded
- [ ] `quality` is `75` or omitted
- [ ] `remotePatterns` covers the backend origin
- [ ] Uploads are validated on the client **and** the server
- [ ] Object URLs are revoked
