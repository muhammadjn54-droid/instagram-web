# Architectural Decision Records (ADR) — Instagram Web Clone

> **Document Version:** 1.0  
> **Status:** Approved Architectural Baseline

---

## ADR-001: Technology Stack for Frontend
* **Status:** Accepted
* **Context:** A scalable, modern frontend is required for an authentic Instagram web experience.
* **Decision:** Next.js `16.4.2` App Router with React `19.3.0`, TypeScript, and Tailwind CSS `v4`.
* **Consequences:** Provides fast Turbopack compilation, React Server Components by default, and high developer velocity.

---

## ADR-002: Unified Monorepo with Single Root Git
* **Status:** Accepted
* **Context:** The project has `backend/` (NestJS) and `frontend/` (Next.js) developed collaboratively by two engineers.
* **Decision:** Removed nested `frontend/.git` and initialized a unified git repository in the monorepo root.
* **Consequences:** Both backend and frontend code, types, and specs are versioned together in a single repository without submodule complexity.

---

## ADR-003: Replacement of Facebook Login with Email Login
* **Status:** Accepted
* **Context:** Official Instagram shows "Войти через Facebook". Mansur explicitly required: *"дар он чо вийти с фуйсбук аст гир онро бо имайл кун фахмо вийти с имайл ок"*.
* **Decision:** Replaced the Facebook OAuth button with a native "Войти с Email" button, backed by the NestJS authentication endpoint supporting username or email lookup.
* **Consequences:** Eliminates external Meta Developer App configuration blockers; users can log in directly using their registered email.

---

## ADR-004: SQLite with better-sqlite3 for Local Backend Persistence
* **Status:** Accepted
* **Context:** Avoid heavy external database dependencies during local development while allowing seamless migration to PostgreSQL in production.
* **Decision:** Configured TypeORM with SQLite (`./data/app.sqlite`) isolated in `database.config.ts`.
* **Consequences:** Instant setup with `npm run seed`; zero Docker or local PostgreSQL daemon requirements for developers.

---

## ADR-005: Server and Client Component Separation
* **Status:** Accepted
* **Context:** Overusing `'use client'` bloats browser bundles and forfeits SSR benefits.
* **Decision:** Keep `page.tsx` and `layout.tsx` as Server Components. Extract interactive forms, modals, carousels, and buttons into leaf Client Components.
* **Consequences:** Minimal client bundle sizes, fast Initial Server Render, and clear separation of concerns.
