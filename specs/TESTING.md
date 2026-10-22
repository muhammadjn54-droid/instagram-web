# Testing & Quality Assurance Plan — Instagram Web Clone

> **Document Version:** 1.0  
> **Testing Strategy:** Multi-Tiered Verification (Static -> Build -> API -> Browser)

---

## 1. Testing Tiers & Commands

| Tier | Tool / Command | What is Checked | Passing Criteria |
| :--- | :--- | :--- | :--- |
| **1. Static Types** | `npx tsc --noEmit` (in both `frontend` and `backend`) | TypeScript compilation | 0 type errors |
| **2. Code Quality** | `npm run lint` | ESLint flat config | 0 fatal errors |
| **3. Build** | `npm run build` | Next.js and NestJS production build | Exit code 0, clean bundles |
| **4. Backend API** | `npm run test:e2e` (in `backend`) | Real endpoint HTTP statuses | All 11 modules respond correctly |
| **5. Browser QA** | Automated / Manual browser audit | UI render, clicks, submissions, mobile views | No visual bugs or uncaught exceptions |

---

## 2. Core User Journey Workflows to Verify

1. **Journey 1: Registration to Active Feed:**
   * Visitor navigates to `/register`.
   * Enters unique username, email, full name, matching passwords.
   * Clicks "Зарегистрироваться".
   * Expected: Account created in SQLite, JWT issued, user auto-logged-in and redirected to `/`.

2. **Journey 2: Login & Logout:**
   * Visitor opens `/login`.
   * Enters `alex_photographer` and `Password123!`.
   * Clicks "Войти".
   * Expected: Success toast, JWT saved, feed loaded.
   * Clicks "Выйти".
   * Expected: Storage cleared, returns to clean `/login` screen.

3. **Journey 3: Post Creation & Feed Rendering:**
   * User clicks "Create" modal.
   * Selects an image, enters caption, clicks "Поделиться".
   * Expected: `POST /posts` returns 201, post appears at top of feed.

4. **Journey 4: Social Interactions:**
   * Click heart icon -> likesCount increments immediately.
   * Click comment icon -> opens comment box -> submits text -> appears in comments list.
   * Click bookmark icon -> saved to user favorites.
