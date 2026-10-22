# About — Instagram Full-Stack Web Monorepo

> **System:** Instagram-inspired Social Network Web Application  
> **Status:** Production-grade Backend + Active Frontend Implementation  
> **Repository:** `instagram-monorepo`

---

## 1. Project Goal

The goal of this project is to build an authentic, performant, and resilient Instagram web application that replicates the modern desktop and mobile browser experience of Instagram.

The project is structured as a full-stack monorepo:
1. **Backend (`backend/`):** A high-performance NestJS 12 REST API backed by TypeORM and SQLite (`better-sqlite3`), featuring JWT authentication, Multer image handling, Swagger OpenAPI documentation, and 11 distinct functional modules.
2. **Frontend (`frontend/`):** A Next.js 16 (App Router) web client built with React 19, TypeScript, and Tailwind CSS v4, connecting directly to the real NestJS API.

---

## 2. Current Implementation State

* **Backend:** 100% complete and fully verified. All 11 modules (account, users, profiles, follows, posts, comments, favorites, stories, chats, locations, search-history) are implemented, seeded with demo accounts and content, and verified via end-to-end tests.
* **Frontend Authentication:** Fully implemented and verified. Features a dual-column desktop layout matching modern Instagram branding (left brand showcase with 3D story collage, right authentication card supporting login with username or email, registration with auto-login, password recovery, and test account quick-fill).
* **Next Implementation Focus:** Application Shell (persistent navigation sidebar on desktop, bottom bar on mobile) and Home Feed with 24-hour stories.

---

## 3. Team & Workflow

* **Backend Lead:** Мансур
* **Frontend Lead:** Frontend Engineer & Antigravity
* **Persistent Progress Tracking:** Maintained through `tz.md` and the 20 specification documents in `specs/`.
