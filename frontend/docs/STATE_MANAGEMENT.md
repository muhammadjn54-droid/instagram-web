# STATE MANAGEMENT

| Field | Value |
|---|---|
| Applies to | all of `src/` |
| Date | 2026-10-21 |
| Related | `ARCHITECTURE.md` §11, `DATA_FETCHING.md`, `SERVER_ACTIONS.md` |

## 1. Principle

**The server owns the data; the client owns the interaction.**

There is no Redux, Zustand, Jotai, Recoil or MobX in this project. Adding one
requires an ADR.

## 2. Where each kind of state lives

| Kind of state | Owner | Mechanism | Example |
|---|---|---|---|
| Server data | Server | RSC + `"use cache"` + `cacheTag()` | The feed items, a profile, a comment list |
| Session | Server | httpOnly cookie | The signed-in user |
| URL state | URL | `searchParams`, `router.replace` | The active tab, the search term, the page cursor |
| Form state | The form | React 19 `useActionState` + `useFormStatus` | The values of the register form |
| Optimistic state | The component | `useOptimistic` | The heart icon before the server confirms |
| Ephemeral UI state | The component | `useState` / `useReducer` | "Is the dialog open?", "Which tab?" |
| URL-driven UI state | The URL | `useSearchParams` | `?tab=posts` on a profile page |
| Cross-component UI state | React context | A small, focused provider | The theme, the toast queue |

## 3. Decision flow

```
Is the data needed on the server (SEO, first paint, private)?
  └─ yes → Server Component + DAL
  └─ no
      Is it a URL-shaped value (a tab, a filter, a query)?
        └─ yes → searchParams / router.replace
        └─ no
            Is it shared by many components?
              └─ yes → a focused Provider (theme, toast)
              └─ no → useState in the owning component
```

## 4. Server state

Server data is **not** copied into client state. The pattern is:

```tsx
// Server Component
export async function FeedList() {
  const page = await getFeed(1, 10);
  return <FeedListView items={page.items} />;
}
```

```tsx
// Client Component — receives the data as props, owns only the interaction
"use client";

export function FeedListView({ items }: { items: PostDto[] }) {
  const [visible, setVisible] = useState(items);
  …
}
```

To load more, call a Server Action and append the result — do not re-fetch
the whole list.

```tsx
"use client";

import { useState, useTransition } from "react";
import { loadMorePostsAction } from "@/actions/post";

export function LoadMore({ initial }: { initial: PostDto[] }) {
  const [items, setItems] = useState(initial);
  const [page, setPage] = useState(1);
  const [pending, startTransition] = useTransition();

  function loadMore() {
    startTransition(async () => {
      const next = await loadMorePostsAction(page + 1);
      setItems((prev) => [...prev, ...next.items]);
      setPage((p) => p + 1);
    });
  }

  return (
    <>
      {items.map((post) => <PostCard key={post.id} post={post} />)}
      <button onClick={loadMore} disabled={pending}>Load more</button>
    </>
  );
}
```

## 5. URL state

Anything a user might want to share, bookmark or go back to belongs in the URL.

| Screen | URL parameter |
|---|---|
| Profile tabs | `/profile/ada?tab=posts` |
| Search | `/search?q=ada` |
| Feed pagination | `/feed?page=2` |
| Explore grid density | `/explore?view=grid` |
| Chat | `/messages/12` |

```tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function ProfileTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") ?? "posts";

  return (
    <Tabs value={tab} onValueChange={(value) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", value);
      router.replace(`?${params.toString()}`);
    }}>
      …
    </Tabs>
  );
}
```

`useSearchParams()` requires a `<Suspense>` boundary — the production build
fails otherwise. The component that calls it must be inside one.

## 6. Context providers

Only two providers exist at the root, and both are UI-only:

```tsx
// src/components/providers/theme-provider.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";
const ThemeContext = createContext<{ theme: Theme; setTheme: (t: Theme) => void } | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    const stored = window.localStorage.getItem("theme") as Theme | null;
    if (stored) setTheme(stored);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem("theme", theme);
  }, [theme]);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
```

Rules for a provider:

* It must not hold server data.
* It must not hold the access token.
* The value must be serialisable if it crosses the server boundary.
* `useX()` must throw a helpful error when used outside the provider.

The theme is stored in `localStorage` — that is fine, it is not a secret.
To avoid a flash of the wrong theme, set the class in a small inline
`<script>` in the root layout (see `STYLING.md` §"Dark mode without a flash").

## 7. Local UI state

Keep it in the component that owns it. Lift it only when a second component
needs it.

```tsx
// src/components/post/post-card.tsx
"use client";

export function PostCard({ post }: { post: PostDto }) {
  const [expanded, setExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  …
}
```

Do **not** create a `PostContext` for a single card. Do **not** put the open
dialog in a global store.

## 8. Reducer vs state

Use `useReducer` when the state has several fields that change together:

```tsx
type UploadState =
  | { status: "idle" }
  | { status: "uploading"; progress: number }
  | { status: "done"; urls: string[] }
  | { status: "error"; message: string };
```

Use `useState` for a single value.

## 9. Form state

The form owns its values; the action owns the validation result.

```tsx
const [state, formAction, pending] = useActionState(createPostAction, { status: "idle" });
```

For a controlled input that needs to react to something (a character
counter), keep a local copy:

```tsx
const [caption, setCaption] = useState("");
<textarea name="caption" value={caption} onChange={(e) => setCaption(e.target.value)} maxLength={2200} />
```

For everything else, use an **uncontrolled** input with a `name` attribute —
the `FormData` carries the value to the action and the input is never
re-rendered.

## 10. Effect discipline

| Situation | Do this |
|---|---|
| Derive a value from props/state | Compute it during render — no effect |
| Synchronise with an external system (a subscription, a timer, the DOM) | `useEffect` |
| Respond to a user action | Handle it in the event handler |
| Fetch data | Server Component / Server Action — not an effect |
| Reset a form after a success | `useEffect` on the success state, or a `key` reset |

```tsx
// Wrong — derived state in an effect
useEffect(() => setFullName(`${first} ${last}`), [first, last]);

// Right — derived during render
const fullName = `${first} ${last}`;
```

## 11. Server state vs client state — a table for this app

| Feature | Server state | Client state |
|---|---|---|
| Feed | The list of posts | "Loading more", the scroll position |
| Like | `likesCount`, `isLikedByMe` | The optimistic heart state |
| Comments | The comment list | The textarea value |
| Story viewer | The story list and the current index | Whether the viewer is open, the paused state |
| Chat | The messages | The draft message, the "is sending" state |
| Profile | The profile and the post grid | The active tab |
| Search | The results and the history | The input value |
| Theme | — | The theme preference |

## 12. Anti-patterns

| Anti-pattern | Why it is wrong |
|---|---|
| Copying server props into `useState` and never syncing | Two sources of truth |
| Fetching in `useEffect` | Waterfall, no caching, no dedupe |
| A global store for server data | Duplicates the framework cache |
| The access token in a context | It would be serialised into the client payload |
| `useEffect` for derived values | Extra render, possible infinite loops |
| Storing the search term only in state | The user cannot share or reload the URL |
