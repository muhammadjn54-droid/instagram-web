# Phased Implementation Plan & Roadmap — Instagram Web Clone

> **Document Version:** 1.0  
> **Strategy:** Phased, dependency-ordered implementation to guarantee working software at every stage.

---

## 1. Implementation Phases Overview

```
[ Phase 1: Documentation & Research ]  <-- CURRENT PHASE (COMPLETE)
                │
                ▼
[ Phase 2: Application Shell & Nav ]   <-- NEXT PHASE
                │
                ▼
[ Phase 3: Home Feed & Stories Bar ]
                │
                ▼
[ Phase 4: Post Creation Wizard ]
                │
                ▼
[ Phase 5: Profiles & Follow Graph ]
                │
                ▼
[ Phase 6: Direct Messages & Explore ]
                │
                ▼
[ Phase 7: Settings, QA & Polish ]
```

---

## 2. Phase Breakdown & Tasks

### Phase 1: Research, Audit & Master Documentation (STRICT - COMPLETE)
* Audit real Instagram web experience.
* Audit existing repository (NestJS backend + Next.js frontend).
* Create 20 detailed specifications in `specs/`.
* Establish master checklist in `tz.md`.
* *Zero application source code edits during Phase 1.*

### Phase 2: Application Shell & Global Navigation
* Create `src/components/shell/DesktopSidebar.tsx` (supports 245px and 72px modes).
* Create `src/components/shell/MobileBottomBar.tsx` (48px height with 5 core icons).
* Create `src/app/(authenticated)/layout.tsx` wrapper for persistent navigation.
* Implement client-side route guard (`AuthGuard`).

### Phase 3: Stories Tray & Feed Interactions
* Create `src/components/stories/StoriesTray.tsx` fetching `GET /stories`.
* Create `src/components/stories/StoryViewerModal.tsx` with 5-second auto-advance.
* Enhance `FeedCard.tsx` with multi-image carousel, double-tap heart animation, and optimistic like/save mutations.
* Implement inline comment input with instant list update.

### Phase 4: Post Creation Wizard
* Create `CreatePostModal.tsx` with drag-and-drop dropzone (1–10 images).
* Implement image preview carousel, aspect ratio selector, caption input, and location search autocomplete.
* Wire to `POST /posts` via `multipart/form-data`.

### Phase 5: User Profiles & Social Graph
* Build dynamic profile route `src/app/[username]/page.tsx`.
* Implement profile header stats, avatar upload dialog (`PUT /profiles/me/avatar`), and 3-column publications grid.
* Implement Follow/Unfollow toggle and Followers/Following modal dialogs.

### Phase 6: Direct Messaging, Explore & Reels
* Build `/direct` inbox layout with conversations list and active chat thread.
* Build `/explore` responsive media grid.
* Build `/reels` vertical player with snap scroll.

### Phase 7: Settings & Final Polish
* Build `/accounts/edit` (edit profile, change password).
* Implement custom `/not-found.tsx` (404 page).
* Run full verification suite (`tsc`, `lint`, `build`).
