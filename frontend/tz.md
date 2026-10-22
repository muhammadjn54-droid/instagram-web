# TZ — Frontend Technical Specification & Progress Tracker

> **Notice:** This document mirrors the root master tracker at [`../tz.md`](../tz.md) and links to the comprehensive 20-file specification suite in [`../specs/`](../specs/).

---

## 1. System Overview

| Field | Value |
|---|---|
| System | Instagram-like Social Network — Web Frontend |
| Package | `frontend/` (Next.js App Router monorepo app) |
| Baseline | Next.js `16.4.2`, React `19.3.0`, Tailwind CSS `v4`, Turbopack |
| Backend | `backend/` (NestJS 12 + TypeORM + SQLite), Swagger at `/swagger` |
| Master Tracker | [`../tz.md`](../tz.md) |
| Specifications | [`../specs/`](../specs/) |

---

## 2. Implementation Progress Summary

* **Phase 1 (Documentation & Specifications):** **COMPLETE** — 20 detailed specifications created in `specs/`.
* **Authentication Module (`/login`, `/register`):** **COMPLETE** — Verified with backend API, email login support, and Russian localized UI.
* **Phase 2 (Application Shell & Navigation):** **READY TO START** — Desktop Sidebar, Mobile Bottom Bar, and Route Guard.

For full feature checklists and task IDs, please refer to the root master tracker: [`../tz.md`](../tz.md).
