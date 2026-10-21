# FORMS — Validation, submission, error display

| Field | Value |
|---|---|
| Applies to | `src/components/**`, `src/actions/**`, `src/lib/validation/**` |
| Date | 2026-10-21 |
| Related | `SERVER_ACTIONS.md`, `API_CONTRACT.md` §4 |

## 1. The shape of a form in this app

```tsx
"use client";

import { useActionState } from "react";
import { loginAction, type AuthActionState } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const [state, formAction, pending] = useActionState<AuthActionState, FormData>(
    loginAction,
    { status: "idle" },
  );

  return (
    <form action={formAction} noValidate className="space-y-4">
      <Input
        name="userName"
        label="Username"
        autoComplete="username"
        required
        error={state.fieldErrors?.userName}
      />
      <Input
        name="password"
        type="password"
        label="Password"
        autoComplete="current-password"
        required
        error={state.fieldErrors?.password}
      />
      {state.message && (
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      )}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
```

Rules:

* `<form action={serverAction}>` — never `onSubmit` with a manual `fetch`.
* `noValidate` — the browser's native bubbles are replaced by our own
  messages so the wording is consistent.
* Every input has a `name` — that is how `FormData` finds it.
* Every input has a **visible label** (or an `aria-label` when the label
  would be visual noise, e.g. an icon-only search field).
* The submit button is disabled while `pending`.

## 2. Validation in three layers

| Layer | Where | Purpose |
|---|---|---|
| Browser hints | `type`, `required`, `minLength`, `maxLength`, `pattern`, `inputMode` | Immediate feedback, no round trip |
| Client schema | `src/lib/validation/**`, run on submit | Same rules as the server, instant feedback |
| Server schema | the same module, run inside the Server Action | The real boundary |

**The server-side check is the only one that counts.** The client check is a
UX convenience.

> The schema library is **zod** (`zod@^3`). It is not installed yet — add it
> as a dependency before writing the first form:
> `npm install zod`. Everything in this document assumes the zod API.

## 3. The validation module

```ts
// src/lib/validation/auth.ts
import { z } from "zod";

export const loginSchema = z.object({
  userName: z.string().min(1, "Enter your username"),
  password: z.string().min(1, "Enter your password"),
});

export const registerSchema = z
  .object({
    userName: z
      .string()
      .min(3, "At least 3 characters")
      .max(30, "At most 30 characters")
      .regex(/^[a-zA-Z0-9._]+$/, "Letters, digits, dots and underscores only"),
    fullName: z.string().min(1, "Enter your name").max(60, "Too long"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(6, "At least 6 characters"),
    confirmPassword: z.string().min(6, "At least 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
```

The rules must match the backend DTO exactly:

| Backend rule | Source |
|---|---|
| `userName` matches `^[a-zA-Z0-9._]+$` | `account.dto.ts` |
| `password` `minLength(6)` | `account.dto.ts` |
| `email` is a valid email | `account.dto.ts` |
| `password === confirmPassword` | `account.service.ts` |

## 4. Using the schema in an action

```ts
"use server";

import { registerSchema } from "@/lib/validation/auth";

export async function registerAction(_prev: AuthActionState, formData: FormData) {
  const raw = Object.fromEntries(formData);
  const parsed = registerSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { status: "error", message: "Please check the highlighted fields.", fieldErrors };
  }

  try {
    await apiFetch(ENDPOINTS.auth.register, {
      method: "POST",
      body: JSON.stringify(parsed.data),
    });
  } catch (error) {
    return { status: "error", message: (error as Error).message };
  }

  redirect("/feed");
}
```

Note: `Object.fromEntries(formData)` collapses repeated fields — use
`formData.getAll("images")` for the multi-file case.

## 5. The `Input` primitive

```tsx
// src/components/ui/input.tsx
"use client";

import { forwardRef, useId } from "react";
import { cn } from "@/lib/utils/cn";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, className, id, ...props },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;

  return (
    <div className="space-y-1.5">
      <label htmlFor={inputId} className="block text-sm font-medium">
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={cn(error ? errorId : hint ? hintId : undefined) || undefined}
        className={cn(
          "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "aria-[invalid=true]:border-destructive",
          className,
        )}
        {...props}
      />
      {error ? (
        <p id={errorId} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
});
```

Accessibility requirements for every field:

* A `<label htmlFor>` bound to the input id.
* `aria-invalid` when there is an error.
* `aria-describedby` pointing at the message.
* The message uses `role="alert"` so a screen reader announces it.
* The error is **not** communicated by colour alone — it has text.

## 6. Server-side errors (409, 403, 404)

| Backend response | Where it surfaces |
|---|---|
| 400 "Passwords do not match" | The `confirmPassword` field |
| 400 "User already exists" | The `userName` **and** `email` fields |
| 409 "Already following" | Treated as success for toggles |
| 403 "Forbidden" | A toast + the action returns `status: "error"` |
| 404 | `notFound()` for a page, an empty state for a list |

```ts
try {
  await apiFetch(ENDPOINTS.posts.byId(id), { method: "DELETE", token });
} catch (error) {
  if (error instanceof ApiError && error.status === 403) {
    return { status: "error", message: "You can only delete your own posts." };
  }
  throw error;
}
```

## 7. Multi-file input

```tsx
"use client";

import { useRef, useState } from "react";

const MAX_FILES = 10;
const MAX_SIZE = 5 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

export function ImageUploader({ name = "images" }: { name?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  function onPick(list: FileList | null) {
    if (!list) return;
    const picked = Array.from(list);

    if (picked.length + files.length > MAX_FILES) {
      setError(`You can upload at most ${MAX_FILES} images.`);
      return;
    }
    const tooBig = picked.find((f) => f.size > MAX_SIZE);
    if (tooBig) {
      setError(`"${tooBig.name}" is larger than 5 MB.`);
      return;
    }
    const wrongType = picked.find((f) => !ACCEPTED.includes(f.type));
    if (wrongType) {
      setError("Only JPG, PNG and WEBP images are allowed.");
      return;
    }
    setError(null);
    setFiles((prev) => [...prev, ...picked]);
  }

  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium">
        Photos
      </label>
      <input
        ref={inputRef}
        id={name}
        name={name}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={(e) => onPick(e.target.files)}
        className="sr-only"
      />
      <button type="button" onClick={() => inputRef.current?.click()} className="…">
        Add photos
      </button>
      {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
      <ul className="mt-2 grid grid-cols-3 gap-2">
        {files.map((file) => (
          <li key={file.name}>
            {/* preview via URL.createObjectURL — revoke it on unmount */}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

Notes:

* The `accept` attribute is a hint, not a validation — always check `type`
  and `size` in code.
* The file input itself is `sr-only`; a visible button opens it. The label
  must still be associated with the input.
* When the files are inside a `<form>` that posts to a Server Action, the
  browser sends them as `FormData` automatically — the input must have a
  `name`.
* Never read a file with `FileReader` to preview it; use
  `URL.createObjectURL` and revoke it in a cleanup effect.

## 8. Character counters

```tsx
const MAX_CAPTION = 2200;

<label htmlFor="caption">Caption</label>
<textarea id="caption" name="content" maxLength={MAX_CAPTION} rows={4} />
<p className="text-right text-xs text-muted-foreground">
  {caption.length}/{MAX_CAPTION}
</p>
```

The backend caps a comment at **500** characters and does not document a
caption limit — the 2200 shown here is a UI-only guard and may be relaxed.

## 9. Form checklist

- [ ] `action={serverAction}` (never a manual `fetch` in `onSubmit`)
- [ ] Every input has a `name` and an associated `<label>`
- [ ] Client-side validation with the same rules as the server
- [ ] Server-side validation in the action, returning field errors
- [ ] `pending` state disables the submit button and shows a spinner
- [ ] Errors are announced (`role="alert"`) and not colour-only
- [ ] The form still submits without JavaScript
- [ ] The success path redirects or returns a success state
- [ ] Password fields use the right `autoComplete`
      (`current-password`, `new-password`)
