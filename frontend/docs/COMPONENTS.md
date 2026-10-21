# COMPONENTS — Inventory and contracts

| Field | Value |
|---|---|
| Applies to | `src/components/**` |
| Date | 2026-10-21 |
| Related | `ARCHITECTURE.md`, `DESIGN_SYSTEM.md`, `PAGE_ROUTES.md` |

## 1. Rules

1. A component lives in `components/<area>/<kebab-case-name>.tsx`.
2. A component that uses state, effects or browser APIs is a **Client
   Component** (`"use client"`). Everything else is a Server Component.
3. A component that needs the session or data is a **Server Component** and
   receives the data as props from its parent.
4. A component that receives an `item` receives the **DTO type** from
   `lib/types`, never `any`.
5. A component does not call the DAL. It receives data or an action.
6. One component per file. A file that grows past ~200 lines is split.
7. `src/components/ui/**` primitives know nothing about Instagram — they are
   generic and reusable.

## 2. `components/ui/` — primitives

| Component | Type | Props (beyond the native ones) | Notes |
|---|---|---|---|
| `Button` | client | `variant: "primary" \| "secondary" \| "ghost" \| "destructive" \| "link"`, `size: "sm" \| "md" \| "lg"`, `loading?: boolean`, `asChild?: boolean` | `loading` disables the button and shows a spinner |
| `IconButton` | client | `label: string` (required — it becomes `aria-label`) | Icon-only buttons must name themselves |
| `Input` | client | `label: string`, `error?: string`, `hint?: string` | See `FORMS.md` §5 |
| `Textarea` | client | `label`, `error?`, `hint?`, `maxLength?` | Shows a counter when `maxLength` is set |
| `Select` | client | `label`, `options: { value, label }[]`, `value?`, `onValueChange` | Native `<select>` under the hood |
| `Avatar` | server | `src?: string`, `name: string`, `size: "xs" \| "sm" \| "md" \| "lg" \| "xl"` | Falls back to the initials; `alt` = the name |
| `Badge` | server | `tone: "neutral" \| "success" \| "warning" \| "danger"` | |
| `Dialog` | client | `open: boolean`, `onOpenChange`, `title`, `description?`, `children`, `footer?` | Focus trap + `Escape` to close + `role="dialog"` |
| `Drawer` | client | Same as `Dialog`, slides from the bottom on mobile | |
| `Skeleton` | server | `className?: string` | A pulsing box; must match the real content's box |
| `Spinner` | server | `size?: "sm" \| "md" \| "lg"`, `label?: string` | `role="status"` + `aria-label` |
| `Tabs` | client | `value`, `onValueChange`, `items: { value, label }[]` | Implements the ARIA tabs pattern |
| `Toast` | client | provider + `useToast()` | `role="status"`, auto-dismiss after 5 s |
| `Tooltip` | client | `content`, `children` | Keyboard accessible |
| `EmptyState` | server | `icon?`, `title`, `description?`, `action?` | Every empty list uses it |
| `ErrorState` | server | `title`, `description?`, `onRetry?` | Shown inside a Suspense fallback |
| `ImageUploader` | client | `name?`, `maxFiles?`, `maxSize?`, `value`, `onChange` | See `FORMS.md` §7 |
| `InfiniteScroll` | client | `onLoadMore`, `hasMore`, `children` | Uses `IntersectionObserver` |

## 3. `components/layout/`

| Component | Type | Props | Notes |
|---|---|---|---|
| `TopBar` | server | `user: { userName, avatar } \| null` | Logo, search field, notifications, avatar menu |
| `Sidebar` | server | `user` | Vertical nav, ≥ 1024 px only |
| `MobileNav` | client | `user` | Bottom bar, < 768 px only |
| `PageShell` | server | `title?`, `actions?`, `children` | Max width + consistent padding |
| `AuthShell` | server | `title`, `subtitle?`, `children` | Centred card for `(auth)` |

## 4. `components/feed/`

| Component | Type | Props | Notes |
|---|---|---|---|
| `FeedList` | server | — | Fetches the first page through the DAL |
| `FeedItem` | server | `post: PostDto` | Header + media + actions + caption |
| `FeedEmpty` | server | — | "Follow some people to see their posts" |
| `StoriesTray` | server | `groups: UserStoriesGroupDto[]` | Horizontal scroller of avatars |
| `StoryBubble` | server | `group: UserStoriesGroupDto`, `seen: boolean` | Ring gradient; grey when all stories are seen |

## 5. `components/post/`

| Component | Type | Props | Notes |
|---|---|---|---|
| `PostCard` | server | `post: PostDto` | The whole card; the interactive children are client components |
| `PostHeader` | server | `post` | Avatar, userName, time, overflow menu |
| `PostMedia` | client | `images: string[]`, `aspect: "square" \| "portrait"` | 1 image = full, 2 = 2-up grid, 3+ = carousel with dots |
| `PostCarousel` | client | `images` | Scroll-snap, dot indicators, keyboard arrows |
| `PostActions` | client | `post` | Like, comment, favourite, share |
| `LikeButton` | client | `postId`, `likesCount`, `isLikedByMe` | `useOptimistic` + `useTransition` |
| `FavoriteButton` | client | `postId`, `isFavoriteByMe` | |
| `PostCaption` | server | `post` | Truncates with a "more" toggle |
| `CommentList` | server | `comments: CommentDto[]` | |
| `CommentForm` | client | `postId` | Uncontrolled textarea + Server Action |
| `CreatePostForm` | client | — | `ImageUploader` + caption + location id + reel toggle |

## 6. `components/story/`

| Component | Type | Props | Notes |
|---|---|---|---|
| `StoryViewer` | client | `groups`, `initialUserId?`, `onClose` | Full-screen, auto-advance every 5 s, pause on hold |
| `StoryProgress` | client | `count`, `index`, `paused` | The segmented progress bar |
| `StoryComposer` | client | — | One image, optional post link |

## 7. `components/chat/`

| Component | Type | Props | Notes |
|---|---|---|---|
| `ChatList` | server | — | Newest activity first |
| `ChatListItem` | server | `chat: ChatListItemDto` | Avatar, last message preview, time |
| `ChatThread` | server | `chatId: number` | Messages oldest → newest |
| `MessageBubble` | server | `message: MessageDto`, `own: boolean` | Aligned right when own |
| `MessageComposer` | client | `chatId` | Text + optional file |

## 8. `components/profile/`

| Component | Type | Props | Notes |
|---|---|---|---|
| `ProfileHeader` | server | `profile: ProfileDetailDto`, `own: boolean` | Avatar, stats, bio, website, follow button |
| `FollowButton` | client | `userId`, `isFollowing` | Optimistic toggle |
| `FollowersDialog` | client | `userId`, `open`, `onOpenChange` | Paginated list |
| `PostGrid` | server | `posts: PostDto[]` | 3 columns, 1:1 cells |
| `EditProfileForm` | client | `profile: ProfileDetailDto` | Fields + avatar upload |

## 9. `components/search/`

| Component | Type | Props | Notes |
|---|---|---|---|
| `SearchBar` | client | `value`, `onChange`, `onSubmit` | Debounced 300 ms, `role="combobox"` |
| `SearchResults` | server | `results: UserListItemDto[]` | |
| `SearchHistory` | server | `items: SearchHistoryItemDto[]` | Click to re-run, delete one, clear all |

## 10. `components/providers/`

| Provider | Type | Purpose |
|---|---|---|
| `ThemeProvider` | client | Light / dark / system, persisted in `localStorage` |
| `ToastProvider` | client | A global queue of notifications |
| `SessionProvider` | client | Optional — only if a client component needs the user name; prefer passing props |

> The session's `accessToken` is **never** provided by a provider.

## 11. Component contract

```tsx
// Good: typed, explicit, no hidden fetches
export function PostCard({ post }: { post: PostDto }) {
  return (
    <article className="rounded-xl border border-border bg-card">
      <PostHeader post={post} />
      <PostMedia images={post.images} aspect="square" />
      <PostActions post={post} />
      <PostCaption post={post} />
    </article>
  );
}
```

| Rule | Why |
|---|---|
| Props are typed with the DTO | A typo becomes a compile error |
| No data fetching inside a card | The parent decides what is loaded |
| No `any` | The type system is the documentation |
| No styling hard-coded as `style={{}}` | Use Tailwind classes / CSS modules |
| No inline `onClick` on a `<div>` | Use a `<button>` — it is focusable and keyboard-activatable |
| Events are named `onX` | `onLike`, `onFollow`, `onSelect` |

## 12. Icons

Icons are inline SVG components in `components/ui/icons.tsx` (or a small icon
package). Rules:

* Every icon-only control gets an `aria-label`.
* Icons that are decorative next to text get `aria-hidden="true"`.
* Icons use `currentColor` and `size-5` so they inherit the text colour and
  size.

## 13. Internationalisation

All user-facing strings are inline English literals in this release. If
i18n is added later, every string moves to `messages/en.json` and every
component reads it through `useTranslations()` — no string is concatenated
into JSX by hand at that point.

## 14. Component checklist

- [ ] The component is a Server Component unless it needs interactivity
- [ ] Props are typed with a DTO or a local interface
- [ ] The empty, loading and error states exist
- [ ] Interactive elements are keyboard reachable
- [ ] Images have `alt`
- [ ] Nothing imports `lib/dal/**` in a Client Component
- [ ] The file is under ~200 lines
