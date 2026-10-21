# SERVER ACTIONS — Mutations

| Field | Value |
|---|---|
| Applies to | `src/actions/**` |
| Framework | Next.js 16 Server Functions |
| Date | 2026-10-21 |
| Related | `FORMS.md`, `DATA_FETCHING.md`, `API_CONTRACT.md` |

## 1. What a Server Action is

A function marked with `"use server"` that runs **on the server**, receives
arguments from the browser, and can read the session cookie and call the
backend with the bearer token. It is the only way the browser may trigger a
mutation.

```ts
// src/actions/post.ts
"use server";

import { revalidatePath, updateTag } from "next/cache";
import { getPost, likePost } from "@/lib/dal/posts";

export async function likePostAction(postId: number) {
  const post = await likePost(postId);       // the DAL attaches the token
  updateTag(`post:${postId}`);
  updateTag("posts");
  return { likesCount: post.likesCount, isLikedByMe: post.isLikedByMe };
}
```

## 2. Rules

1. **Every action must verify the session itself.** A Server Action is
   reachable by a direct POST — it is not protected by the layout, the
   proxy, or the page that renders it.
2. **Never trust the client.** Re-validate every input on the server.
3. **Never return a token.** The action returns plain data.
4. **Return errors, do not throw them**, for expected failures (invalid
   password, duplicate user). Throw only for unexpected errors, which the
   error boundary handles.
5. **One file per domain**: `auth.ts`, `post.ts`, `comment.ts`, `follow.ts`,
   `favorite.ts`, `story.ts`, `chat.ts`, `profile.ts`, `search.ts`.
6. **Never import a Client Component** into an action file, and never import
   an action into a Server Component for its side effect only — call it from a
   form or from a Client Component.

## 3. Action states

```ts
// src/lib/types/action.ts
export type ActionState =
  | { status: "idle" }
  | { status: "error"; message: string; fieldErrors?: Record<string, string> }
  | { status: "success"; message?: string };
```

Use React 19's `useActionState` so the form re-renders with the returned
state.

```tsx
"use client";

import { useActionState } from "react";
import { loginAction, type AuthActionState } from "@/actions/auth";

export function LoginForm() {
  const [state, formAction, pending] = useActionState<AuthActionState, FormData>(
    loginAction,
    { status: "idle" },
  );

  return (
    <form action={formAction} className="space-y-4">
      <Input name="userName" error={state.fieldErrors?.userName} />
      <Input name="password" type="password" error={state.fieldErrors?.password} />
      {state.message && <p role="alert" className="text-sm text-destructive">{state.message}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
```

* `pending` comes from `useActionState` — it is `true` while the action runs.
* `useFormStatus` gives the same information to a **child** of the form
  (e.g. a submit button) — it must be rendered inside the `<form>`.
* Server Function calls are dispatched **sequentially** on the client; put
  parallel work inside one action or a Route Handler.

## 4. Progressive enhancement

A `<form action={serverAction}>` submits even before hydration, and works
without JavaScript. That is why forms are preferred over `onClick` handlers
that call an action.

```tsx
<form action={createPostAction}>
  <input name="caption" />
  <button type="submit">Share</button>
</form>
```

`next/form`'s `<Form>` adds client-side navigation and prefetching of the
`loading.tsx` boundary. With a **string** `action` it uses native GET
semantics; with a **function** `action` it uses React + a Server Action
(`replace` and `scroll` are ignored).

## 5. File uploads

Uploads are the one case where a plain Server Action is awkward: the browser
must send the binary to the server. Use a **Route Handler** as a relay.

```ts
// src/app/api/upload/post/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

const MAX_FILES = 10;
const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const form = await request.formData();
  const files = form.getAll("images").filter((f): f is File => f instanceof File);

  if (files.length === 0) return NextResponse.json({ message: "At least one image is required" }, { status: 400 });
  if (files.length > MAX_FILES) return NextResponse.json({ message: "At most 10 images" }, { status: 400 });

  for (const file of files) {
    if (!ALLOWED.includes(file.type)) return NextResponse.json({ message: "Only JPG, PNG and WEBP" }, { status: 400 });
    if (file.size > MAX_SIZE) return NextResponse.json({ message: "File too large" }, { status: 400 });
  }

  const upstream = new FormData();
  for (const file of files) upstream.append("images", file);

  const post = await apiFetch(ENDPOINTS.posts.list, {
    method: "POST",
    body: upstream,
    token: session.accessToken,
  });

  return NextResponse.json({ post });
}
```

Then the action creates the post with the returned image URLs:

```ts
// src/actions/post.ts
"use server";

export async function createPostAction(_prev: ActionState, formData: FormData) {
  const caption = String(formData.get("caption") ?? "").trim();
  const isReel = formData.get("isReel") === "on";

  if (caption.length > 2200) {
    return { status: "error", message: "The caption is too long.", fieldErrors: { caption: "Max 2200 characters" } };
  }

  const files = formData.getAll("images").filter((f): f is File => f instanceof File);
  if (files.length === 0) {
    return { status: "error", message: "Pick at least one image.", fieldErrors: { images: "Required" } };
  }

  const body = new FormData();
  for (const file of files) body.append("images", file);
  body.append("content", caption);
  if (isReel) body.append("isReel", "true");

  const post = await apiFetch<PostDto>(ENDPOINTS.posts.list, {
    method: "POST",
    body,
    token: (await requireSession()).accessToken,
  });

  updateTag("posts");
  updateTag("feed");
  revalidatePath("/feed");
  return { status: "success", postId: post.id };
}
```

> Validate the files in the browser **and** in the Route Handler. The browser
> check is for UX; the server check is the real one.

## 6. Optimistic updates

React 19's `useOptimistic` gives an instant UI while the action runs.

```tsx
"use client";

import { useOptimistic, useTransition } from "react";

export function LikeButton({ postId, initialCount, initialLiked }: Props) {
  const [optimistic, setOptimistic] = useOptimistic(
    { count: initialCount, liked: initialLiked },
    (state) => ({ count: state.count + (state.liked ? -1 : 1), liked: !state.liked }),
  );
  const [pending, startTransition] = useTransition();

  return (
    <button
      aria-pressed={optimistic.liked}
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          setOptimistic(state);
          await likePostAction(postId);
        })
      }
    >
      <Heart filled={optimistic.liked} />
      <span>{optimistic.count}</span>
    </button>
  );
}
```

Rules:

* `useOptimistic` state is discarded when the action finishes and the real
  data arrives — that is the reconciliation.
* Roll back on failure by returning an error state and letting the server
  value win.
* Never optimistically toggle something the backend may reject (for example
  "already liked" → 409): treat a 409 as success.

## 7. Invalidating after a mutation

| Mutation | Invalidate |
|---|---|
| create post | `updateTag("posts")`, `updateTag("feed")`, `revalidatePath("/feed")` |
| delete post | `updateTag("posts")`, `updateTag(`post:${id}`)`, `revalidatePath(`/post/${id}`)` |
| like / unlike | `updateTag(`post:${id}`)`, `updateTag("posts")` |
| comment | `updateTag(`post:${id}`)` |
| favourite | `updateTag(`post:${id}`)`, `revalidatePath("/saved")` |
| follow / unfollow | `updateTag(`profile:${userId}`)`, `updateTag("feed")` |
| profile update | `updateTag(`profile:${userId}`)`, `updateTag(`user:${userName}`)` |
| story created | `revalidatePath("/stories")` |
| message sent | `revalidatePath(`/messages/${chatId}`)` |

Use `updateTag` (Server Actions only) when the user should see their own
change immediately; use `revalidateTag(tag, "max")` for background
revalidation.

## 8. Action inventory

| File | Actions |
|---|---|
| `auth.ts` | `loginAction`, `registerAction`, `logoutAction`, `forgotPasswordAction`, `resetPasswordAction`, `changePasswordAction` |
| `post.ts` | `createPostAction`, `deletePostAction`, `likePostAction`, `unlikePostAction`, `viewPostAction`, `loadMorePostsAction` |
| `comment.ts` | `createCommentAction`, `deleteCommentAction` |
| `follow.ts` | `followAction`, `unfollowAction` |
| `favorite.ts` | `favoriteAction`, `unfavoriteAction` |
| `story.ts` | `createStoryAction`, `deleteStoryAction`, `likeStoryAction`, `viewStoryAction` |
| `chat.ts` | `createChatAction`, `sendMessageAction`, `deleteMessageAction`, `deleteChatAction` |
| `profile.ts` | `updateProfileAction`, `uploadAvatarAction`, `removeAvatarAction` |
| `search.ts` | `saveSearchAction`, `deleteSearchHistoryAction`, `clearSearchHistoryAction` |

## 9. Anti-patterns

| Anti-pattern | Why it is wrong |
|---|---|
| A Server Action that trusts `formData.userId` | The user id must come from the session |
| An action that returns the access token | It would be sent to the browser |
| Throwing for a validation error | The error boundary shows a generic page instead of a field error |
| Reading the session in the page and passing the token to an action | The action must fetch the session itself |
| A Server Action that does a 30 s job | It blocks the response — use `after()` or a queue |
| One giant `actions/index.ts` | Split by domain |
| Calling an action from another action with `await` at module scope | Actions are request-scoped |
