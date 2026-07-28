# Subscriber Home Feed

The Home Feed (`/home`) displays cursor-paginated posts from creators the user subscribes to. This document describes the architecture, empty states, extension points, and pagination behavior.

## Architecture

### Data Flow

```
HomePage
├── useCurrentUser() → Check auth + subscription status
├── useSubscriptions() → Determine empty state
└── FeedList (if subscribed)
    ├── useFeed(filter) → useInfiniteQuery hook
    ├── IntersectionObserver → Trigger loadMore at bottom
    └── FeedPostCard × N (with deduped posts)
        └── Engagement slots (like/comment/tip)
```

### Query Structure

**Hook:** `useFeed(filter?: FeedFilter)` in `hooks/queries/useFeed.ts`

- Uses `useInfiniteQuery` from TanStack Query v5
- Query key: `queryKeys.feed.infinite(filter)`
- Supports filters: `"all"` | `"media"` | `"text"`
- Cursor-based pagination (backend provides `cursor` for next page)
- **Deduplication:** `select` transforms pages → flattens + removes duplicate IDs
- Default page size: **20 items** (tuned for mobile & desktop infinite scroll)

**API Endpoint:** `GET /feed`

```
Parameters:
- cursor?: string       # Pagination token from previous response
- limit?: number        # Items per page (default: 20)
- filter?: FeedFilter   # Content filter (default: "all")

Response:
{
  posts: FeedPost[],
  cursor?: string,      # Next page cursor (null when no more)
  hasMore?: boolean     # Optional: true if cursor exists
}
```

## Components

### `FeedList`

Main infinite-scroll list component.

**Props:**
- `filter?: FeedFilter` — Active filter (controls query)
- `onActionClick?: (action, post) => void` — Engagement handler

**Features:**
- Intersection Observer at sentinel element (500px rootMargin)
- Prefetch trigger at 80% scroll depth
- Soft-fail on next page load (keeps loaded posts, shows inline retry)
- Skeletons show while `isFetchingNextPage`
- Offline detection via `navigator.onLine`
- Analytics events: `feed_view`, `feed_load_more`

**Empty States (in order):**
1. No initial data + error → ErrorState with retry
2. Loaded but zero posts → Text: "No posts to show"
3. Scrolled to end → "No more posts"

### `FeedPostCard`

Renders a single post with metadata, media, and engagement slots.

**Props:**
- `post: FeedPost` — Post data (includes author, engagement counts)
- `onActionClick?: (action, post) => void` — Button handler

**Engagement Slots:**
```tsx
<Button onClick={() => onActionClick?.("like", post)}>
  ❤️ {post.likeCount}
</Button>
<Button onClick={() => onActionClick?.("comment", post)}>
  💬 {post.commentCount}
</Button>
<Button onClick={() => onActionClick?.("tip", post)}>
  🎁 Tip
</Button>
```

These are **render-ready stubs**. Issues #46 (Likes/Comments) and #50 (Tip Modal) will wire these handlers to backend mutations.

**Layout:**
- Media container: 16:9 aspect ratio (reserved even if no media)
- Images: `loading="lazy"` except first visible post
- Muted/blocked posts: filtered out (client-side)

### `FeedFilters`

Sticky tab bar (mobile: full width, desktop: inline).

**Filters:**
- `All` — All subscribed content
- `Media` — Posts with `mediaUrl`
- `Text` — Posts without media

**Behavior:**
- Sticky to top on scroll
- Tab semantics (`role="tablist"`, `role="tab"`)
- Keyboard navigable (Arrow Left/Right)
- Clicking changes filter → resets feed to page 1

**Analytics:** `feed_filter_change` event on change

### `FeedPostSkeleton` & `FeedPostSkeletonGroup`

Shimmer loading states matching card geometry.

- `FeedPostSkeleton({ withMedia?: boolean })`
- `FeedPostSkeletonGroup({ count?: number })`

## Empty States

### State Matrix

| Condition | Component | CTA |
|-----------|-----------|-----|
| Not authenticated | HomePage → EmptyState | Sign In → `/login?redirect=/home` |
| Authenticated, 0 subscriptions | HomePage → EmptyState | Discover Creators → `/discover` |
| Authenticated, has subscriptions, 0 posts | FeedList → inline text | None (creators may post later) |
| Authenticated, loaded, no more pages | FeedList sentinel → "No more posts" | None |
| Auth, subscriptions, API error (initial) | FeedList → ErrorState | Retry button |
| Auth, subscriptions, API error (next page) | FeedList → inline retry banner | Retry button |

**Offline Detection:**
- If `navigator.onLine === false`, FeedList shows banner: "You're offline. Check your connection."

## Deduplication & Merging

**Problem:** Cursor pagination may return overlapping posts if filtering/sorting changes mid-scroll.

**Solution:** `useFeed` hook's `select` function deduplicates:

```ts
select: (data) => {
  const posts: FeedPost[] = [];
  const seen = new Set<string>();

  for (const page of data.pages) {
    for (const post of page.posts) {
      if (!seen.has(post.id)) {
        posts.push(post);
        seen.add(post.id);
      }
    }
  }
  return { posts };
}
```

- **Preserve order:** First occurrence kept (if post A appears in page 1 and page 2, page 1 version is shown).
- **Silent dedup:** No UI indicator; user won't notice.

**Test:** `src/__tests__/feed.test.ts` includes:
- `dedupePostsById()` unit test
- `mergePages()` integration test with overlap scenarios

## Performance Budget

- **Initial load:** Max 20 posts (one page)
- **Page load:** ≤ 2 KB (gzipped) per FeedList + skeleton components
- **Per-post card:** ~1 KB minified
- **Image optimization:** `loading="lazy"`, optional priority on first 3 visible
- **Memoization:** Avoid unless profiler justifies (React 19 is efficient)

**Prefetch Strategy:**
- Prefetch next page when user scrolls to 80% (TanStack Query built-in via `getNextPageParam`)

## Extension Slots

### Engagement Actions

All three engagement buttons (like/comment/tip) call `onActionClick` without implementation. Connect them:

**For issue #46 (Likes/Comments):**
```tsx
// In HomePage
const handleEngagement = async (action, post) => {
  if (action === "like") {
    await useLikePost(post.id);
    invalidateQueryClient(queryKeys.feed.infinite());
  }
  // ...
}

// Pass to FeedList
<FeedList onActionClick={handleEngagement} />
```

**For issue #50 (Tip Modal):**
```tsx
const [tipPost, setTipPost] = useState<FeedPost | null>(null);

const handleEngagement = (action, post) => {
  if (action === "tip") {
    setTipPost(post);
    // Open modal
  }
};
```

### Custom Post Rendering

To override card rendering (e.g., rich media, custom metadata):

1. Create `CustomFeedPostCard` component
2. Update FeedList to conditionally render:
   ```tsx
   {posts.map((post) => (
     customRenderer ? (
       <CustomFeedPostCard key={post.id} post={post} />
     ) : (
       <FeedPostCard key={post.id} post={post} />
     )
   ))}
   ```

### Analytics Integration

Four events fire automatically; wire them to your analytics service:

```ts
// In HomePage or FeedList
window.addEventListener("feed_view", (e) => {
  analytics.track("feed_view", e.detail); // { postCount, filter }
});

window.addEventListener("feed_filter_change", (e) => {
  analytics.track("feed_filter_change", e.detail); // { from, to }
});

window.addEventListener("feed_post_action", (e) => {
  analytics.track("feed_post_action", e.detail); // { action, postId }
});

window.addEventListener("feed_load_more", (e) => {
  analytics.track("feed_load_more", e.detail); // { cursor, itemCount }
});
```

## Testing

### Unit Tests
**File:** `src/__tests__/feed.test.ts`

- Deduplication logic
- Page merging with overlaps
- Order preservation

Run: `npm run test -- feed.test.ts`

### Component Tests
**File:** `src/__tests__/FeedFilters.test.tsx`

- Filter rendering
- Active state highlighting
- Callback on change
- Sticky positioning class

Run: `npm run test -- FeedFilters.test.tsx`

### Integration Tests
- Pagination: Page 2 failure keeps Page 1 items
- Filter change resets cursor

### E2E Tests
**File:** `e2e/feed.spec.ts`

- Unauthenticated redirect
- Empty state variants
- Infinite scroll trigger
- Offline behavior
- Post detail navigation
- Engagement buttons render

Run: `npm run test:e2e feed.spec.ts`

## Accessibility

- **Feed:** `<main>` semantic role
- **List:** `<ul role="feed">` (implicit via list items)
- **Cards:** `<article>` semantic
- **Filters:** `tablist` + `tab` roles
- **Loading:** `role="status"` on sentinel (aria-live implied)
- **Errors:** `role="alert"` on ErrorState
- **Images:** `alt` text (author names)
- **Keyboard:** Tab to filters, Arrow Left/Right to switch, Enter/Space to activate

## Type Definitions

**`FeedPost` (in `types/api.ts`):**
```ts
interface FeedPost extends Post {
  author?: {
    id: string;
    name: string;
    handle: string;
    avatarUrl?: string;
  };
  isLiked?: boolean;
  likeCount?: number;
  commentCount?: number;
  isMuted?: boolean;
  isBlocked?: boolean;
}
```

**`FeedFilter` (in `lib/api/feed.ts`):**
```ts
type FeedFilter = "all" | "media" | "text";
```

## Deployment Checklist

- [ ] Backend `/feed` endpoint returns `FeedResponse` shape
- [ ] Cursor pagination tested with mock data
- [ ] Images CDN supports `loading="lazy"`
- [ ] Analytics event handlers wired (optional: defer to phase 2)
- [ ] MSW mocks updated for feed endpoint
- [ ] Tests pass: `npm run test && npm run test:e2e`
- [ ] TypeScript strict: `npm run typecheck`
- [ ] Build succeeds: `npm run build`
