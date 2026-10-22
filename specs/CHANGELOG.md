# Project Changelog — Instagram Web Clone

All notable changes to the `instagram-monorepo` project will be documented in this file.

---

## [Phase 1: Master Documentation & Specification] — 2026-10-22

### Added
- **`specs/` Documentation Suite (20 Files):**
  - `INSTAGRAM_RESEARCH.md`: Discovery of Instagram web feature areas (A–L).
  - `PROJECT_SCOPE.md`: Explicit in-scope, out-of-scope, and deferred feature breakdown.
  - `ROUTE_INVENTORY.md`: Matrix of 13 identified route patterns with component mappings.
  - `PAGE_SPECIFICATIONS.md`: Layout contracts, responsive grids, and data fetching specs.
  - `FEATURE_INVENTORY.md`: Master feature task list with acceptance criteria.
  - `FRONTEND_ARCHITECTURE.md`: Server/Client boundaries, DAL, and project structure rules.
  - `DESIGN_SYSTEM.md`: Color tokens, gradients, typography, and elevation specs.
  - `COMPONENTS.md`: Reusable component catalog with prop contracts.
  - `API_INTEGRATION.md`: Full endpoint contracts for all 11 backend modules.
  - `AUTHENTICATION.md`: JWT lifecycles, route guards, and test accounts.
  - `STATE_MANAGEMENT.md`: Caching, optimistic UI updates, and invalidation rules.
  - `FORM_VALIDATION.md`: Synchronous client rules and input sanitization.
  - `RESPONSIVE_DESIGN.md`: Viewport breakdown down to 360px mobile width.
  - `ACCESSIBILITY.md`: WCAG 2.1 AA focus rings, contrast, and aria labels.
  - `SECURITY.md`: OWASP defenses, XSS protection, and Multer upload security.
  - `TESTING.md`: QA strategy across static types, build, API, and browser flows.
  - `BUGS_AND_BLOCKERS.md`: Environmental issue workarounds and active dependencies.
  - `IMPLEMENTATION_PLAN.md`: Phased roadmap from Phase 1 through Phase 7.
  - `DECISIONS.md`: Architectural Decision Records (ADR-001 through ADR-005).
  - `CHANGELOG.md`: Chronological record of project milestones.
- **Root Documentation:**
  - `FRONTEND_MASTER.md`: Master architectural guide for future engineering sessions.
  - `about.md`: High-level system overview.
  - `tz.md`: Central persistent progress checklist.

---

## [Milestone: Auth UI & Backend Email Login] — 2026-10-22

### Added
- Created `frontend/src/components/auth/AuthHero.tsx` with Instagram gradient logo, colored headline, and 3D story collage.
- Created `frontend/src/components/auth/AuthCard.tsx` with login, register, email login, and forgot password modes.
- Created `frontend/src/components/auth/AuthFooter.tsx` with localized links.
- Created `frontend/src/app/login/page.tsx` and `frontend/src/app/register/page.tsx`.
- Created `frontend/src/components/feed/LoggedInView.tsx` with user welcome, profile stats, and post feed.
- Created `frontend/src/lib/auth.ts` for token and session storage.

### Changed
- Updated `backend/src/modules/account/account.service.ts` to support login via either username or email.
- Verified end-to-end registration (201) and login (200) with JWT issuance.

---

## [Milestone: Initial Full-Stack Monorepo] — 2026-10-21

### Added
- Completed 11 NestJS backend modules with TypeORM and SQLite.
- Added Swagger documentation at `/swagger` and OpenAPI JSON at `/swagger-json`.
- Added database seed script (`npm run seed`) with 3 test accounts and demo posts.
- Created root `README.md`, `FRONTEND_GUIDE.md`, and `AI_INSTRUCTIONS.md`.
