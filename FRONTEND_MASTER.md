# Frontend Master Engineering Guide — Instagram Web Clone

> **Document Version:** 1.0  
> **Audience:** Lead Engineers, AI Coding Assistants, and Contributors  
> **Mandatory Rule:** Every development session MUST read this document, check `tz.md`, inspect current code, and update specifications upon completing changes.

---

## 1. Project Purpose & High-Level Architecture

The **Instagram Web Clone** is a full-stack monorepo delivering an authentic, performant, and resilient Instagram desktop and mobile web client.

* **Monorepo Structure:**
  * `backend/`: NestJS 12 + TypeORM + SQLite + Swagger (`http://localhost:3000`)
  * `frontend/`: Next.js 16.4.2 (App Router) + React 19.3.0 + Tailwind CSS v4 (`http://localhost:3001`)
  * `specs/`: 20 authoritative specifications covering research, scope, design, and API contracts.
  * `tz.md`: Central persistent progress checklist.

---

## 2. Non-Negotiable Technology & Coding Rules

1. **Server vs. Client Components:**
   * Keep `page.tsx` and `layout.tsx` files as **Server Components** by default.
   * Do NOT put `'use client'` on a page simply because it imports an interactive child.
   * Isolate user interactivity inside leaf Client Components located in `src/components/**`.
2. **TypeScript Standards:**
   * Strict mode enabled (`tsconfig.json`).
   * No `any`, `@ts-ignore`, or unjustified assertions to bypass compiler errors.
   * Use shared DTO interfaces from `src/types/index.ts`.
3. **API Integration Standards:**
   * Use the centralized `apiRequest<T>` helper in `src/lib/api.ts`.
   * Never invent endpoints or guess URL shapes — verify with [`specs/API_INTEGRATION.md`](./specs/API_INTEGRATION.md) or Swagger.
   * Always unwrap the backend response envelope `{ statusCode, data, errors }`.
   * Pass JWT via `Authorization: Bearer <token>`.
4. **Visual & Design Consistency:**
   * Use native HTML elements inside TSX with utility classes from Tailwind CSS v4.
   * Do NOT use MUI or external UI component suites.
   * Adhere strictly to the color tokens and typography in [`specs/DESIGN_SYSTEM.md`](./specs/DESIGN_SYSTEM.md).
   * Do NOT introduce arbitrary emojis or stickers unless specified in the reference design.
5. **Session Workflow for Contributors:**
   * **STEP 1:** Read this document (`FRONTEND_MASTER.md`).
   * **STEP 2:** Read `tz.md` for current progress and next task.
   * **STEP 3:** Inspect actual code before making changes.
   * **STEP 4:** Implement smallest coherent changeset.
   * **STEP 5:** Run `npx tsc --noEmit` and build checks.
   * **STEP 6:** Update `tz.md` with truthful evidence and update `specs/CHANGELOG.md`.

---

## 3. Authoritative Specification Index

All detailed specifications reside in the [`specs/`](./specs/) directory:

| Specification | Purpose |
| :--- | :--- |
| [`specs/INSTAGRAM_RESEARCH.md`](./specs/INSTAGRAM_RESEARCH.md) | Reverse-engineering of official Instagram web features (Modules A–L). |
| [`specs/PROJECT_SCOPE.md`](./specs/PROJECT_SCOPE.md) | In-scope, deferred, and out-of-scope boundaries. |
| [`specs/ROUTE_INVENTORY.md`](./specs/ROUTE_INVENTORY.md) | Matrix of all 13 discovered route patterns and URL schemes. |
| [`specs/PAGE_SPECIFICATIONS.md`](./specs/PAGE_SPECIFICATIONS.md) | Layout contracts, grids, and data fetching boundaries. |
| [`specs/FEATURE_INVENTORY.md`](./specs/FEATURE_INVENTORY.md) | Feature checklist with acceptance criteria. |
| [`specs/FRONTEND_ARCHITECTURE.md`](./specs/FRONTEND_ARCHITECTURE.md) | Directory structure, Server/Client guidelines, and DAL. |
| [`specs/DESIGN_SYSTEM.md`](./specs/DESIGN_SYSTEM.md) | Color palette, typography, radiuses, and elevation tokens. |
| [`specs/COMPONENTS.md`](./specs/COMPONENTS.md) | Reusable component catalog with props and variants. |
| [`specs/API_INTEGRATION.md`](./specs/API_INTEGRATION.md) | Comprehensive endpoint contracts for all 11 backend modules. |
| [`specs/AUTHENTICATION.md`](./specs/AUTHENTICATION.md) | JWT lifecycles, route guards, and test accounts. |
| [`specs/STATE_MANAGEMENT.md`](./specs/STATE_MANAGEMENT.md) | Caching, optimistic UI updates, and invalidation rules. |
| [`specs/FORM_VALIDATION.md`](./specs/FORM_VALIDATION.md) | Input validation rules and sanitization. |
| [`specs/RESPONSIVE_DESIGN.md`](./specs/RESPONSIVE_DESIGN.md) | Breakpoint specs down to 360px mobile width. |
| [`specs/ACCESSIBILITY.md`](./specs/ACCESSIBILITY.md) | WCAG 2.1 AA focus rings, contrast, and aria labels. |
| [`specs/SECURITY.md`](./specs/SECURITY.md) | OWASP defenses, XSS mitigation, and upload rules. |
| [`specs/TESTING.md`](./specs/TESTING.md) | QA tiers: types, lint, build, API, and browser QA. |
| [`specs/BUGS_AND_BLOCKERS.md`](./specs/BUGS_AND_BLOCKERS.md) | Verified environmental limits, workarounds, and blockers. |
| [`specs/IMPLEMENTATION_PLAN.md`](./specs/IMPLEMENTATION_PLAN.md) | Phased roadmap (Phases 1 through 7). |
| [`specs/DECISIONS.md`](./specs/DECISIONS.md) | Architectural Decision Records (ADR-001 – ADR-005). |
| [`specs/CHANGELOG.md`](./specs/CHANGELOG.md) | Chronological milestone log. |
