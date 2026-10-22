# Frontend Architecture & Technical Guidelines — Instagram Web Clone

> **Document Version:** 1.0  
> **Framework:** Next.js App Router (`16.4.2`), React (`19.3.0`), Tailwind CSS (`v4`), TypeScript (`strict`)

---

## 1. Architectural Philosophy & Rules

1. **Server vs. Client Component Boundaries:**
   * `page.tsx` and `layout.tsx` files are Server Components by default.
   * Interactivity (state, effects, event handlers, client-side mutations) is pushed down to leaf Client Components (marked with `'use client'`).
   * Never mark a whole page `'use client'` simply to embed a small interactive button or form.
2. **Data Access Layer (DAL):**
   * Server-side data reads communicate directly with the NestJS API at `http://localhost:3000`.
   * Client-side requests use the centralized `apiRequest<T>` wrapper in `src/lib/api.ts`.
3. **Session & Token Management:**
   * JWT tokens are passed via standard HTTP headers: `Authorization: Bearer <accessToken>`.
   * Tokens are stored in browser `localStorage` and `cookie` for seamless cross-request hydration.
4. **Media & Static Asset Strategy:**
   * Images uploaded to the backend are stored at `backend/uploads/` and served statically at `http://localhost:3000/uploads/<filename>`.
   * Prepend helper `getMediaUrl(path)` to ensure consistent URL resolution across environments.

---

## 2. Directory Structure Conventions

```text
frontend/src/
├── app/                      # Next.js App Router routes
│   ├── (authenticated)/      # Route group sharing the authenticated Instagram sidebar layout
│   │   ├── explore/          # Explore media grid (/explore)
│   │   ├── reels/            # Reels vertical player (/reels)
│   │   ├── direct/           # Direct messaging (/direct)
│   │   ├── [username]/       # User profile (/alex_photographer)
│   │   └── accounts/edit/    # Settings (/accounts/edit)
│   ├── login/                # Dedicated login route (/login)
│   ├── register/             # Dedicated registration route (/register)
│   ├── layout.tsx            # Global HTML & Body shell
│   ├── page.tsx              # Root router (Auth landing vs. Home Feed)
│   └── globals.css           # Tailwind CSS tokens & theme
├── components/               # Modular UI Components
│   ├── auth/                 # AuthHero, AuthCard, AuthFooter
│   ├── feed/                 # FeedCard, MediaCarousel, PostActions, InlineComment
│   ├── stories/              # StoriesTray, StoryViewerModal, StoryProgress
│   ├── shell/                # DesktopSidebar, MobileBottomBar, SearchDrawer
│   ├── profile/              # ProfileHeader, ProfileTabs, MediaGrid, EditProfileModal
│   ├── chat/                 # ChatList, ChatThread, MessageBubble, ChatInput
│   ├── create/               # CreatePostModal, ImageDropzone, CaptionInput
│   └── ui/                   # Button, Input, Modal, Avatar, Skeleton
├── lib/                      # Core helpers
│   ├── api.ts                # apiRequest<T>() and getMediaUrl()
│   ├── auth.ts               # Token and user state management
│   └── utils.ts              # Class name mergers and formatters
└── types/                    # Shared TypeScript interfaces
    └── index.ts              # User, Profile, Post, Comment, Story, Chat, ApiResponse
```

---

## 3. Error Handling & Loading Conventions

* **API Error Envelopes:**
  The backend always returns `{ statusCode, data: T | null, errors: string[] | null }`.
  `apiRequest` checks for `!response.ok` or `errors.length > 0` and extracts user-friendly error messages.
* **Component-Level States:**
  Every asynchronous view must provide:
  1. *Loading:* Skeleton loader matching exact layout dimensions.
  2. *Error:* Error banner with a clear retry action.
  3. *Empty:* Contextual empty state with guidance on next actions.
