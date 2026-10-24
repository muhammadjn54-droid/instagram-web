# TZ — Frontend Technical Specification & Progress Tracker

> **Notice:** this file mirrors the root master tracker [`../tz.md`](../tz.md) and links to the specification suite in [`../specs/`](../specs/). The root file is the source of truth.

## 1. System overview

| Field | Value |
|---|---|
| System | Instagram-like social network — web frontend |
| Package | `frontend/` (Next.js App Router) |
| Baseline | Next.js `16.4.2`, React `19.3.0`, Tailwind CSS `v4`, Turbopack, RTK Query |
| Backend | `backend/` (NestJS + TypeORM + SQLite), Swagger at `/swagger` |
| Data flow | Browser → `/api/backend/*` (Next.js BFF proxy, adds the httpOnly JWT) → NestJS |

## 2. Progress (2026-10-23)

* **Phase 1 — documentation:** complete.
* **Phase 2 — application shell:** complete (`Sidebar`, `TopBar`, `MobileNav`, `SessionGuard`, `proxy.ts`).
* **Phases 3–6 — feed, stories, create, profile, chat, search, explore, reels:** functionally complete, see the module table in the root `tz.md` §4.
* **Current phase — functions & bugs:** 6 backend + 16 frontend defects fixed (root `tz.md` §3). Remaining function gaps are listed in §5 of the root file.
* **Next phase — UI polish:** waits for the design images.
