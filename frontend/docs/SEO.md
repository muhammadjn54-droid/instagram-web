# SEO & METADATA

| Field | Value |
|---|---|
| Applies to | `src/app/**` metadata exports, `robots.ts`, `sitemap.ts`, OG images |
| Date | 2026-10-21 |
| Related | `PAGE_ROUTES.md` §8, `PERFORMANCE.md` |

## 1. What matters for this product

Instagram is a **logged-in** product. Only a few pages should be indexed:

| Page | Indexable | Reason |
|---|---|---|
| `/` | ✅ | The landing page |
| `/explore` | ✅ | Public content discovery |
| `/post/[id]` | ✅ | Public posts |
| `/profile/[userName]` | ✅ | Public profiles |
| `/login`, `/register` | ❌ | Utility pages |
| `/feed`, `/messages`, `/saved`, `/search`, `/stories` | ❌ | Private, per-user |

Everything private gets `robots: { index: false, follow: false }`.

## 2. The Metadata API

```tsx
// src/app/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001"),
  title: {
    default: "Instagram",
    template: "%s | Instagram",
  },
  description: "Share photos, reels and stories with the people you follow.",
  applicationName: "Instagram",
  keywords: ["instagram", "photos", "reels", "stories", "social"],
  openGraph: {
    type: "website",
    siteName: "Instagram",
    title: "Instagram",
    description: "Share photos, reels and stories with the people you follow.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Instagram",
    description: "Share photos, reels and stories with the people you follow.",
  },
};
```

Rules:

* `title.default` is **required** when a template exists.
* `metadata` and `generateMetadata` are **Server Component only**.
* A segment must not export both `metadata` and `generateMetadata`.
* File-based metadata (`app/icon.tsx`, `app/opengraph-image.tsx`) has a
  **higher priority** than the `metadata` export.
* Never hand-write `<title>` or `<meta>` in the JSX.

## 3. Per-page metadata

```tsx
// src/app/(main)/explore/page.tsx
export const metadata: Metadata = {
  title: "Explore",
  description: "Discover new posts from the Instagram community.",
};
```

```tsx
// src/app/(main)/post/[id]/page.tsx
export async function generateMetadata(props: PageProps<"/post/[id]">) {
  const { id } = await props.params;
  const post = await getPost(Number(id)).catch(() => null);
  if (!post) return { title: "Post not found" };

  return {
    title: post.title ?? `${post.userName} on Instagram`,
    description: post.content.slice(0, 160),
    openGraph: {
      title: post.title ?? `${post.userName} on Instagram`,
      description: post.content.slice(0, 160),
      images: post.images[0] ? [{ url: mediaUrl(post.images[0])! }] : undefined,
    },
  };
}
```

## 4. Private pages

```tsx
export const metadata: Metadata = {
  title: "Feed",
  robots: { index: false, follow: false },
};
```

## 5. `robots.ts` and `sitemap.ts`

```ts
// src/app/robots.ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/feed", "/messages", "/saved", "/search", "/stories", "/api/"] },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
```

```ts
// src/app/sitemap.ts
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";
  const posts = await getPublicPosts(1, 100).catch(() => null);

  return [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/explore`, changeFrequency: "hourly", priority: 0.8 },
    ...(posts?.items ?? []).map((post) => ({
      url: `${base}/post/${post.id}`,
      lastModified: new Date(post.createdAt),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
```

In Next 16 the image-generating functions receive `params` and `id` as
**Promises**; `sitemap` receives `id` as a Promise.

## 6. Open Graph images

```tsx
// src/app/(main)/post/[id]/opengraph-image.tsx
import { ImageResponse } from "next/og";

export default async function Image(props: PageProps<"/post/[id]/opengraph-image">) {
  const { id } = await props.params;
  const post = await getPost(Number(id)).catch(() => null);
  const title = post?.title ?? post?.content?.slice(0, 80) ?? "Instagram";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: "#111",
          color: "#fff",
          fontSize: 48,
          padding: 64,
        }}
      >
        {title}
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
```

`ImageResponse` renders with Satori — it supports a **subset** of CSS (flex
layout, absolute positioning, fonts). Inline styles only; no external CSS.

## 7. Structured data

```tsx
// src/app/(main)/profile/[userName]/page.tsx
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.fullName,
  alternateName: profile.userName,
  image: mediaUrl(profile.avatar),
  description: profile.bio,
  url: `${base}/profile/${profile.userName}`,
};

<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
/>
```

Never interpolate untrusted data into the JSON-LD script without escaping
`</script>`.

## 8. Canonical URLs

Set `metadataBase` once in the root layout; relative URLs in the metadata are
resolved against it. For a dynamic page, add:

```tsx
alternates: { canonical: `/post/${id}` },
```

## 9. Checklist

- [ ] `metadataBase` is set from `NEXT_PUBLIC_APP_URL`
- [ ] Every page has a unique `title` and `description`
- [ ] Private pages are `noindex, nofollow`
- [ ] `robots.ts` and `sitemap.ts` exist and are valid
- [ ] OG images render (check with the Facebook debugger)
- [ ] No raw `<title>`/`<meta>` in the JSX
- [ ] `title.default` exists next to the template
