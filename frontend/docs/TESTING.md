# TESTING

| Field | Value |
|---|---|
| Applies to | `frontend/` |
| Date | 2026-10-21 |
| Related | `DEFINITION_OF_DONE.md`, `TROUBLESHOOTING.md` |

## 1. The strategy

| Level | Tool | What it covers |
|---|---|---|
| Unit | **Vitest** | Pure functions: `cn`, `safeNext`, the zod schemas, the envelope parser, the time formatters |
| Component | **Vitest + Testing Library** | The `ui/` primitives and a few interactive components |
| Integration | **Vitest** | The API client against a mocked `fetch` (envelope vs bare payload) |
| E2E | **Playwright** | The critical journeys, against a real backend |

> The bundled Next.js docs recommend **E2E over unit tests for async Server
> Components** — a Server Component cannot be rendered in a unit test
> environment, so testing the page behaviour belongs in Playwright.

## 2. The manual checklist (the source of truth)

The E2E suite is written from this checklist. Run it manually before every
milestone.

### 3.1 Authentication

- [ ] `/register` rejects a short password with a field error
- [ ] `/register` rejects mismatched passwords with a field error
- [ ] `/register` rejects a duplicate userName with a message
- [ ] `/register` succeeds and lands on `/feed`
- [ ] `/login` with a wrong password shows "Invalid credentials"
- [ ] `/login` succeeds and lands on `/feed`
- [ ] Reloading `/feed` keeps the user signed in
- [ ] `localStorage` and `sessionStorage` contain no token
- [ ] The HTML source contains no token
- [ ] Visiting `/feed` signed out redirects to `/login?next=%2Ffeed`
- [ ] Signing in from that redirect lands back on `/feed`
- [ ] The logout button returns to `/login` and the session is gone

### 3.2 Feed and explore

- [ ] `/feed` shows the posts of the followed accounts, newest first
- [ ] The empty feed shows a "follow some people" state
- [ ] `/explore` shows all public posts
- [ ] Loading more appends the next page and stops at the last page
- [ ] A reel is marked as a reel
- [ ] The skeleton appears while the list loads

### 3.3 Post

- [ ] Creating a post with 2 images shows both images
- [ ] Picking 11 images is blocked with a message
- [ ] Picking a 6 MB file is blocked with a message
- [ ] Picking a PDF is blocked with a message
- [ ] The new post is at the top of the feed and of the explore list
- [ ] The like button increments the count and survives a reload
- [ ] Unliking decrements it
- [ ] The favourite button toggles and the post appears in `/saved`
- [ ] A comment appears in the comment panel
- [ ] A comment longer than 500 characters is blocked
- [ ] Deleting own post asks for confirmation and removes it
- [ ] The delete button is not shown on another user's post
- [ ] `/post/[id]` shows the post and its comments
- [ ] An unknown post id shows the 404 page

### 3.4 Stories

- [ ] The stories tray shows the followed users' stories
- [ ] Clicking a story opens the full-screen viewer
- [ ] The story advances automatically and can be paused
- [ ] A story can be liked
- [ ] Uploading a story makes it appear in "your story"
- [ ] A story disappears after 24 hours (simulate by editing `expiresAt`)

### 3.5 Profile

- [ ] The profile shows the avatar, bio, website and the three counts
- [ ] The follow button toggles and the follower count changes
- [ ] The follower list opens and paginates
- [ ] Editing the profile saves and updates the header
- [ ] Uploading an avatar replaces it
- [ ] Removing the avatar restores the initials
- [ ] A private account's posts are hidden from a non-follower (backend rule)

### 3.6 Messages

- [ ] The chat list shows the conversations, newest activity first
- [ ] Opening a chat shows the messages oldest → newest
- [ ] Own messages are aligned right, others left
- [ ] Sending a text appends the message
- [ ] Sending an image appends the message with the picture
- [ ] Deleting a message removes it
- [ ] Deleting a conversation removes it from the list

### 3.7 Search

- [ ] Searching shows matching users
- [ ] The query is saved in the history
- [ ] Clicking a history entry re-runs the search
- [ ] One entry can be deleted, and all of them can be cleared

### 3.8 General

- [ ] Every route has a skeleton while loading
- [ ] A failing request shows an error state with a retry button
- [ ] The whole app is usable with the keyboard alone
- [ ] The layout survives a 320 px viewport
- [ ] The dark mode toggle works and survives a reload

## 3. Unit tests with Vitest

```bash
npm install -D vitest @vitejs/plugin-react vite-tsconfig-paths jsdom @testing-library/react @testing-library/jest-dom
```

```ts
// vitest.config.mts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
  },
});
```

```ts
// vitest.setup.ts
import "@testing-library/jest-dom/vitest";
```

```ts
// src/lib/validation/auth.test.ts
import { describe, expect, it } from "vitest";
import { registerSchema } from "./auth";

describe("registerSchema", () => {
  it("accepts a valid payload", () => {
    const result = registerSchema.safeParse({
      userName: "muhammad.2026",
      fullName: "Muhammad",
      email: "m@example.com",
      password: "secret123",
      confirmPassword: "secret123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects mismatched passwords", () => {
    const result = registerSchema.safeParse({
      userName: "muhammad.2026",
      fullName: "Muhammad",
      email: "m@example.com",
      password: "secret123",
      confirmPassword: "other",
    });
    expect(result.success).toBe(false);
  });
});
```

Add the scripts to `package.json`:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

## 4. Testing the API client

The client must handle **both** response shapes (ADR-007):

```ts
import { describe, expect, it, vi } from "vitest";
import { apiFetch } from "./client";

describe("apiFetch", () => {
  it("unwraps the envelope", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ statusCode: 200, data: { id: 1 }, errors: null }),
      }),
    );

    await expect(apiFetch<{ id: number }>("/x")).resolves.toEqual({ id: 1 });
  });

  it("accepts a bare payload", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ id: 1 }),
      }),
    );

    await expect(apiFetch<{ id: number }>("/x")).resolves.toEqual({ id: 1 });
  });

  it("throws an ApiError with the backend messages", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        statusText: "Bad Request",
        json: async () => ({ statusCode: 400, data: null, errors: ["Passwords do not match"] }),
      }),
    );

    await expect(apiFetch("/x")).rejects.toThrow("Passwords do not match");
  });
});
```

## 5. E2E with Playwright

```bash
npm install -D @playwright/test
npx playwright install
```

```ts
// playwright.config.ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  use: {
    baseURL: "http://localhost:3001",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run build && npm run start -- -p 3001",
    url: "http://localhost:3001",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

```ts
// e2e/auth.spec.ts
import { expect, test } from "@playwright/test";

test("a user can register and lands on the feed", async ({ page }) => {
  await page.goto("/register");
  await page.getByLabel("Username").fill(`user_${Date.now()}`);
  await page.getByLabel("Full name").fill("Test User");
  await page.getByLabel("Email").fill(`user_${Date.now()}@example.com`);
  await page.getByLabel("Password", { exact: true }).fill("secret123");
  await page.getByLabel("Confirm password").fill("secret123");
  await page.getByRole("button", { name: "Sign up" }).click();

  await expect(page).toHaveURL(/\/feed/);
});
```

Rules for E2E:

* Use **role and label** selectors (`getByRole`, `getByLabel`), never CSS
  classes — they also verify the accessibility contract.
* Never hard-code a port or a URL; use `baseURL`.
* Seed the backend with a known user before the suite (`backend` has a
  `npm run seed` script).

## 6. What not to test

* The framework's own behaviour (that `next/link` navigates).
* The exact Tailwind classes.
* Third-party code.
* Implementation details — test the behaviour, not the structure.

## 7. In CI

```yaml
# .github/workflows/frontend.yml (outline)
- run: npm ci
- run: npm run lint
- run: npm run build
- run: npm test
- run: npx playwright install --with-deps
- run: npm run test:e2e
```

The build is the most important gate: it catches type errors, the
`server-only` violations and the missing-Suspense errors.

## 8. Coverage

A coverage target is not a quality target. The rule is simple: **every
utility and every schema is covered; every page is covered by the manual
checklist and by at least one E2E test.**
