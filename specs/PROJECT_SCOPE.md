# Project Scope Specification — Instagram Web Clone

> **Document Version:** 1.0  
> **Repository:** `instagram-monorepo`  
> **Authors:** Mansur (Backend) & Frontend Lead

---

## 1. Project Mission & Objectives

The goal is to deliver an authentic, error-free, and production-grade Instagram web experience built with **Next.js (App Router)** and connected to the existing **NestJS 12 REST API**.

The application prioritizes rock-solid user workflows, zero unhandled errors, responsive layouts (down to 360px), and truthful progress tracking.

---

## 2. In-Scope Feature Matrix

| Feature Module | Priority | Status | Backend Support | Acceptance Criteria Summary |
| :--- | :---: | :---: | :---: | :--- |
| **Authentication & Session** | P0 | **COMPLETE** | `/account/*` | Email/Username login, registration, password recovery, JWT storage, auth guard redirects. |
| **Application Shell (Navigation)** | P0 | **PARTIAL** | Core | Desktop left sidebar (expand/collapse), mobile bottom bar, user profile shortcut. |
| **Home Feed (Following)** | P0 | **PARTIAL** | `/posts/feed` | Infinite scroll of followed users' posts, media carousel, like/unlike, save/unsave, timestamps. |
| **Stories Bar & Viewer** | P0 | **NOT COMPLETE** | `/stories/*` | 24h stories tray, unviewed gradient ring, modal story viewer with 5s progress bar, story like/view. |
| **Post Details & Comments** | P0 | **NOT COMPLETE** | `/posts/:id/comments` | Modal post preview, scrollable comments list, inline comment submission, comment deletion. |
| **Create Post Wizard** | P0 | **NOT COMPLETE** | `POST /posts` (Multipart) | Drag & drop 1–10 images, preview carousel, caption text, location selection, upload progress. |
| **User Profile Page** | P0 | **PARTIAL** | `/profiles/*` | Header stats (posts/followers/following), avatar update, bio, 3-column posts grid, saved tab. |
| **Follow & Unfollow Graph** | P0 | **NOT COMPLETE** | `/users/:id/follow` | Follow/unfollow toggle with optimistic UI, followers and following lists modal. |
| **Direct Messaging (Chats)** | P1 | **NOT COMPLETE** | `/chats/*` | Conversation list with last message & unread badge, active chat thread, send text & file. |
| **Explore Feed** | P1 | **NOT COMPLETE** | `/posts` | 3-column explore grid of all public posts, click to view post modal. |
| **Reels Feed** | P1 | **NOT COMPLETE** | `/posts/reels` | Vertical full-height reels feed, play/pause, like/comment overlays. |
| **Search & Search History** | P1 | **NOT COMPLETE** | `/users?search=` & `/search-history` | Debounced user search, recent search history drawer, delete recent search item. |
| **Account Settings** | P1 | **NOT COMPLETE** | `/profiles/me`, `/account/change-password` | Edit profile form (bio, website, gender), change password form. |

---

## 3. Out-of-Scope / Deferred Features (Explicitly Documented)

The following features belong to the broader Instagram ecosystem but are intentionally **excluded** or **deferred** from this release:

1. **OAuth / Social Login (Facebook / Google / Apple):**
   * *Reason:* Per user instruction, replaced with standard Email & Username authentication.
2. **Two-Factor Authentication (2FA / SMS OTP):**
   * *Reason:* Requires external SMS gateway / Twilio; deferred to v2.
3. **Real-time WebSockets / WebRTC:**
   * *Reason:* Backend currently operates via HTTP polling for messages. WebSocket gateway is deferred.
4. **Live Streaming & Video Broadcasting:**
   * *Reason:* Beyond current media storage infrastructure.
5. **Algorithmic Feed Ranking & Machine Learning Recommendations:**
   * *Reason:* Feeds are ordered chronologically by `createdAt DESC`.
6. **Commercial / Professional Shopping & Ad Tools:**
   * *Reason:* Non-essential for core social experience.
7. **Native iOS / Android Mobile Builds:**
   * *Reason:* Project scope is strictly modern responsive Web Client (Desktop + Mobile browser).

---

## 4. Definition of Done (DoD) per Feature

A feature is considered **COMPLETE** only when:
1. Native TSX + Tailwind CSS implementation is in place.
2. Form validation and input sanitization are verified.
3. Connected directly to the real NestJS backend (no fake mock data pretending to be live).
4. Error states, loading spinners, and empty states are gracefully handled.
5. Mobile layout down to 360px viewport has zero horizontal overflow.
6. TypeScript check (`npx tsc --noEmit`) passes with zero errors.
7. Truthful evidence is recorded in `tz.md`.
