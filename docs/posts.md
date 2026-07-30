# Creator Dashboard Posts

The creator posts flow (`/dashboard/posts` and `/dashboard/posts/new`) lets authenticated creators list and publish posts. This document describes what was implemented, how it fits into the rest of the app, and how to verify or extend it.

## Summary for project owners

**What changed:** The dashboard posts list and composer were migrated from manual `useEffect` / `useState` fetching to **TanStack Query**, matching patterns already used for subscriptions, analytics, and the subscriber feed.

**Why it matters:**

| Before | After |
|--------|-------|
| One-off fetch on mount; no shared cache | Cached list with 30s stale time, 1 retry, refetch on window focus |
| Plain `"Loading..."` text | Card skeleton placeholders (4 cards) |
| Inline red error text | Reusable `ErrorState` with **Try again** (calls `refetch`) |
| New posts only appeared after full remount | Creating a post **invalidates the posts cache** so the list refreshes after redirect |

**Routes affected:**

| Route | Component | Purpose |
|-------|-----------|---------|
| `/dashboard/posts` | `PostList` | Creator's post list |
| `/dashboard/posts/new` | `PostComposer` | Create and publish a post |

Both routes are wrapped in `CreatorGuard` (creator-only access).

## Architecture

### Data flow

```
PostsPage (Suspense + skeleton fallback)
└── PostList
    ├── usePosts() → GET /posts
    ├── PostListSkeletonGroup (initial load)
    ├── ErrorState (failure + retry)
    └── EmptyState / post cards

NewPostPage
└── PostComposer
    ├── Local Zod validation
    └── useCreatePost() → POST /posts
        └── onSuccess → invalidate posts cache → redirect ?published=1
```

### Relationship to the subscriber feed

Posts appear in **two separate flows** in this codebase:

| Flow | Audience | Hook | Endpoint | Pagination |
|------|----------|------|----------|------------|
| **Creator dashboard** | Creator managing their own posts | `usePosts` | `GET /posts` | None (full list) |
| **Subscriber home feed** | Fan viewing subscribed creators | `useFeed` | `GET /feed` | Cursor-based infinite scroll |

Creating a post via `useCreatePost` **only invalidates** `queryKeys.posts.all`. The subscriber feed cache (`queryKeys.feed.*`) is not invalidated automatically. If you need new posts to appear immediately on `/home` without a refresh, add feed invalidation in `useCreatePost` (see [Extension points](#extension-points)).

## Query keys

Defined in `src/lib/query-keys.ts`:

```ts
posts: {
  all: ["posts"],
  lists: () => ["posts", "list"],
  list: () => ["posts", "list"],
}
```

| Key | Used for |
|-----|----------|
| `queryKeys.posts.list()` | Fetching the creator's post list (`usePosts`) |
| `queryKeys.posts.all` | Invalidating all post-related queries after create |

This mirrors the `subscriptions` and `creators` key namespaces.

## Hooks

### `usePosts`

**File:** `src/hooks/queries/usePosts.ts`

- Wraps `useQuery` with `queryFn: listPosts`
- **Auth-gated:** `enabled` when a JWT is present (`api.getToken()`)
- Inherits shared defaults from `QueryProvider`:
  - `staleTime`: 30 seconds
  - `retry`: 1
  - `refetchOnWindowFocus`: true

### `useCreatePost`

**File:** `src/hooks/mutations/useCreatePost.ts`

- Wraps `useMutation` with `mutationFn: createPost`
- On success: `invalidateQueries({ queryKey: queryKeys.posts.all })`
- Optional hook-level `onSuccess(post)` callback for callers

**Component usage:** `PostComposer` calls `mutate` with its own `onSuccess` (redirect) and `onError` (inline message) handlers.

## API layer

**File:** `src/lib/api/posts.ts` (unchanged by this migration)

| Function | Method | Endpoint | Returns |
|----------|--------|----------|---------|
| `listPosts()` | GET | `/posts` | `Post[]` |
| `createPost(input)` | POST | `/posts` | `Post` |

Request body for create: `title`, `body`, `visibility` (`"public"` \| `"subscribers"`), optional `mediaUrl`.

**Type:** `Post` in `src/types/api.ts` — id, title, body, visibility, mediaUrl, authorId, createdAt.

## Components

### `PostList`

**File:** `src/components/posts/PostList.tsx`

**Loading:** Shows `PostListSkeletonGroup` with 4 cards when `isLoading && !data`.

**Error:** Renders `ErrorState` with title *"Failed to load posts"* and a retry button wired to `refetch()`.

**Empty:** Existing `EmptyState` with CTA to create first post.

**Success toast:** After publishing, composer redirects to `/dashboard/posts?published=1`. List reads that query param and shows a green banner for 4 seconds (unchanged UX).

**Note:** The only remaining `useEffect` in this component is for toast auto-dismiss — not for data fetching.

### `PostComposer`

**File:** `src/components/posts/PostComposer.tsx`

- Form state and Zod validation stay local
- Submit uses `useCreatePost().mutate()` with `isPending` for the button label
- Success → redirect to list with `?published=1`
- Failure → inline *"Failed to publish post. Please try again."*

### `PostListSkeleton` / `PostListSkeletonGroup`

**File:** `src/components/posts/PostListSkeleton.tsx`

Lightweight placeholders matching dashboard card layout (`rounded-lg border p-4`):

- Title bar + visibility badge pill
- Date line

Default group size: **4 cards** (within the 3–5 acceptance range). Also used in the page-level Suspense fallback.

### `PostsPage` Suspense fallback

**File:** `src/app/(dashboard)/dashboard/posts/page.tsx`

While `useSearchParams()` suspends, the route shows a header skeleton plus `PostListSkeletonGroup` instead of plain `"Loading..."`.

## UI state matrix

| Condition | UI |
|-----------|-----|
| Initial load, no cached data | 4 skeleton cards |
| API error on list fetch | `ErrorState` + retry |
| Loaded, zero posts | `EmptyState` + "Create new post" |
| Loaded, has posts | Card list (title, visibility badge, date) |
| Redirect after publish (`?published=1`) | Green success banner (4s) |
| Composer submit in flight | Button disabled, label "Publishing..." |
| Composer API error | Red inline error under form |

## Verification checklist

Manual checks for QA or release sign-off:

1. **List load** — Open `/dashboard/posts` as a creator. Brief skeleton, then posts (or empty state).
2. **Error + retry** — Simulate `GET /posts` failure (network tab block or backend down). Confirm `ErrorState` and that **Try again** refetches.
3. **Create flow** — Publish from `/dashboard/posts/new`. Redirect to list, success banner, new post visible without hard refresh.
4. **Cache** — In dev, open React Query Devtools. Confirm key `["posts","list"]` and invalidation after create.
5. **Focus refetch** — With stale data (>30s or after invalidation), switching browser tabs back refetches per global defaults.

## Extension points

### Invalidate feed after create

To show new posts on `/home` immediately after publish:

```ts
// In useCreatePost onSuccess
queryClient.invalidateQueries({ queryKey: queryKeys.feed.all });
```

### Optimistic list updates

Current create flow waits for server response then invalidates. For faster UX, add `onMutate` / rollback in `useCreatePost` (similar to `useSubscribe` in `src/hooks/useSubscription.ts`).

### Post detail page

`/posts/[id]` is still a stub with no fetch. A future `usePost(id)` hook would use something like:

```ts
queryKeys.posts.detail(id) // add to query-keys.ts
```

### Pagination

`listPosts()` returns the full array. If the backend adds cursor or page params, extend `queryKeys.posts.list(filters)` and switch `usePosts` to `useInfiniteQuery` (see `useFeed` for reference).

### Tests

No dedicated unit tests exist yet for dashboard posts. Recommended additions:

- Hook test: `useCreatePost` invalidates `posts.all` on success
- Component test: `PostList` skeleton → data → error states
- E2E: create post → list updates

See `docs/feed.md` for analogous feed testing patterns.

## Files reference

| File | Role |
|------|------|
| `src/lib/query-keys.ts` | `posts` query key factory |
| `src/hooks/queries/usePosts.ts` | List query hook |
| `src/hooks/mutations/useCreatePost.ts` | Create mutation + cache invalidation |
| `src/components/posts/PostList.tsx` | Dashboard list UI |
| `src/components/posts/PostComposer.tsx` | Create form UI |
| `src/components/posts/PostListSkeleton.tsx` | Loading skeletons |
| `src/app/(dashboard)/dashboard/posts/page.tsx` | List route + Suspense fallback |
| `src/app/(dashboard)/dashboard/posts/new/page.tsx` | Composer route |
| `src/lib/api/posts.ts` | HTTP helpers |
| `src/lib/query/client.tsx` | Shared TanStack Query defaults |
| `src/components/ui/error-state.tsx` | Shared error + retry UI |

## Related documentation

- [Subscriber Home Feed](./feed.md) — infinite scroll feed for fans (`useFeed`)
- [Forms](./forms.md) — validation patterns used in `PostComposer`
- [API client README](../src/lib/api/README.md) — auth and request handling
