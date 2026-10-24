# Phased Implementation Plan & Roadmap — Instagram Web Clone

> **Document Version:** 2.0 (2026-10-23)
> **Strategy:** phased, dependency-ordered implementation. Status of each phase is kept in sync with [`../tz.md`](../tz.md).

---

## 1. Phase overview

```
[ Phase 1: Documentation & Research ]        COMPLETE
                │
[ Phase 2: Application Shell & Nav ]         COMPLETE
                │
[ Phase 3: Home Feed & Stories ]             COMPLETE (functions)
                │
[ Phase 4: Post Creation ]                   COMPLETE (functions)
                │
[ Phase 5: Profiles & Follow Graph ]         COMPLETE (functions)
                │
[ Phase 6: Direct, Explore, Reels, Search ]  COMPLETE (functions)
                │
[ Phase 6.5: Functions & Bugs pass ]         DONE 2026-10-23  ◄── last finished step
                │
[ Phase 6.6: Browser pass + small gaps ]     NEXT   (tz.md §6 steps 1–4)
                │
[ Phase 7: UI polish from design images ]    WAITING for the images
                │
[ Phase 8: Tests, a11y, performance ]        PENDING
```

"COMPLETE (functions)" means every endpoint and interaction works; the visual design is intentionally still the placeholder skin.

## 2. Phase breakdown

### Phase 1 — Research, audit, documentation (complete)
20 specifications in `specs/`, master checklist in `tz.md`.

### Phase 2 — Application shell (complete)
Implemented as `src/components/layout/{AppShell,Sidebar,MobileNav,TopBar,SessionGuard}.tsx`, route group `src/app/(app)/layout.tsx`, route guard `src/proxy.ts` (Next.js 16 name for middleware). Routes are in [`ROUTE_INVENTORY.md`](ROUTE_INVENTORY.md).

### Phase 3 — Feed and stories (complete)
`FeedView`, `PostCard`, `PostCarousel`, `StoriesTray`, `StoryViewer`, optimistic like / save, comments. Pagination instead of infinite scroll.

### Phase 4 — Post creation (complete)
`PostCreateForm` at `/post/new` (1–10 images, location select, Reel flag, client-side file validation).

### Phase 5 — Profiles (complete)
`ProfileView`, `ProfileHeader`, `FollowersDialog`, `ProfileEditForm`, avatar upload/remove, saved tab.

### Phase 6 — Direct, explore, reels, search (complete)
`MessagesView`, `MessageThread` (polling), `ExploreView`, `ReelsView` (grid), `SavedView`, `SearchView`.

### Phase 6.5 — Functions & bugs pass (done)
6 backend + 16 frontend defects fixed, 4 security fixes. See `tz.md` §3.

### Phase 6.6 — Browser pass and small gaps (next)
1. Manual or Playwright click-through of every screen.
2. Backend privacy rule for private accounts (GAP-6), e-mail probing (GAP-7).
3. Wire the endpoints that have no UI yet: story delete/viewers, edit post, delete message/conversation, delete account.

### Phase 7 — UI polish (waiting for design images)
Design tokens, shell, feed, profile, chat, remaining screens; infinite scroll, double-tap-like, reels player, search drawer, mobile navigation completeness.

### Phase 8 — Quality
Vitest for helpers, Playwright journeys, Lighthouse and accessibility audit, production build (`next build`) check.
