# Post Engagement System — Likes, Comments, Optimistic Cache Graph

The engagement system enables users to like posts and comments, create nested replies (1-level deep), and see real-time count updates with optimistic mutations and automatic rollback on failure.

## Architecture

### Data Model

**Post Extensions:**
```typescript
interface FeedPost extends Post {
  isLiked?: boolean;
  likeCount?: number;
  commentCount?: number;
}
```

**Comment Type:**
```typescript
interface Comment {
  id: string;
  postId: string;
  author: { id, name, handle, avatarUrl? };
  body: string;
  createdAt: string;
  parentId?: string;        // For nested replies
  likeCount: number;
  likedByMe: boolean;
  deleted: boolean;         // Soft-delete flag
}
```

### API Endpoints

**File:** `lib/api/interactions.ts`

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/posts/{postId}/like` | Like a post |
| DELETE | `/posts/{postId}/like` | Unlike a post |
| GET | `/posts/{postId}/comments` | List comments (cursor-paginated) |
| POST | `/posts/{postId}/comments` | Create comment (or reply if `parentId` set) |
| DELETE | `/comments/{commentId}` | Delete own comment (soft-delete) |
| POST | `/comments/{commentId}/like` | Like a comment |
| DELETE | `/comments/{commentId}/like` | Unlike a comment |

### Optimistic Mutations

All mutations follow the TanStack Query pattern with three phases:

#### 1. onMutate (Optimistic Update)
```typescript
onMutate: async (postId) => {
  // 1. Cancel in-flight queries
  await queryClient.cancelQueries();
  
  // 2. Snapshot current state
  const previous = queryClient.getQueryData(feedKey);
  
  // 3. Update cache optimistically
  queryClient.setQueryData(feedKey, (old) => ({
    ...old,
    posts: old.posts.map(p =>
      p.id === postId
        ? { ...p, isLiked: !p.isLiked, likeCount: p.likeCount + (p.isLiked ? -1 : 1) }
        : p
    )
  }));
  
  return { previous };
}
```

#### 2. onError (Rollback)
```typescript
onError: (error, variables, context) => {
  if (context?.previous) {
    queryClient.setQueryData(feedKey, context.previous);
  }
  // Show user-friendly error
}
```

#### 3. onSuccess (Cache Invalidation)
```typescript
onSuccess: () => {
  // Invalidate to sync with backend truth
  queryClient.invalidateQueries({ queryKey: queryKeys.feed.all });
}
```

### Cache Consistency Across Surfaces

**Problem:** A post appears on both feed and creator profile. A like on feed must update the same post on profile.

**Solution:** Normalized query keys by entity:
```typescript
queryKeys = {
  feed: { infinite: (filter) => ["feed", "infinite", filter] },
  creators: { detail: (handle) => ["creators", "detail", handle] }
}
```

**Implementation:**
- `onMutate` updates both `feed.infinite()` AND `creators.*.detail(handle)` when post appears in both
- `setQueryData` with a predicate to update all creator queries that contain the post
- `onSuccess` invalidates both query families to force reconciliation with backend

**Example: Feed like → Profile sync**
```typescript
queryClient.setQueriesData(
  { queryKey: queryKeys.creators.detail(""), exact: false },
  (old) => ({
    ...old,
    posts: old.posts.map(p => 
      p.id === postId 
        ? toggleLike(p) 
        : p
    )
  })
);
```

## Components

### PostActions
Wraps like button, comment button, tip button with auth gating.

**Features:**
- Auth check: logged-out users see login prompt
- Pending state: spinner on like during mutation
- aria-pressed for like toggle
- 429 rate-limit handling

**Usage:**
```tsx
<PostActions
  post={post}
  onCommentClick={() => setIsCommentPanelOpen(true)}
  onTipClick={() => handleTip(post)}
/>
```

### CommentPanel (Drawer/Side Panel)
Lazy-mounted container for comments. Mobile: bottom drawer. Desktop: side panel.

**Features:**
- Escape key closes (desktop)
- Focus trap on modal open
- Responsive layout
- role="dialog" semantics

**Usage:**
```tsx
<CommentPanel
  post={post}
  isOpen={isCommentPanelOpen}
  onClose={() => setIsCommentPanelOpen(false)}
  isMobile={isMobile}
/>
```

### CommentList
Paginated list of top-level comments and nested replies.

**Features:**
- Cursor-based pagination with "Load more"
- Soft-delete placeholder: "Comment removed"
- Delete button (self-comments only)
- Reply button with reply composer
- Like count (no like UI yet—stub ready for extension)
- Report menu item (console stub)

### CommentComposer
Text input for posting comments with length limit (500 chars).

**Features:**
- Optimistic append with temp ID
- ID reconciliation on success
- Loading state on submit
- Max-length validation
- Reply to comment support (parentId)

## Hooks

### useLikePost()
Mutation hook for toggling like on post.

```typescript
const { mutate: toggleLike, isPending } = useLikePost();
toggleLike(postId);
```

**Optimistic behavior:**
- Toggles `isLiked` and adjusts `likeCount`
- Updates feed AND creator profile queries
- Rolls back on 401/4xx/5xx
- Auto-refresh on 401 (client-side middleware)
- Shows 429 message if rate-limited

### useCreateComment(postId, onSuccess)
Mutation hook for creating comments.

```typescript
const { mutate: createComment, isPending } = useCreateComment({ postId });
createComment({ body: "Nice post!", parentId?: replyTo });
```

**Optimistic behavior:**
- Prepends comment with temp ID
- Reconciles ID when real comment arrives
- Rolls back on error, preserves prior comments
- onSuccess callback for UI updates (e.g., close reply box)

### useDeleteComment(postId)
Mutation hook for soft-deleting comments.

```typescript
const { mutate: deleteComment, isPending } = useDeleteComment(postId);
deleteComment(commentId);
```

**Optimistic behavior:**
- Sets `deleted: true`, replaces body with "[removed]"
- Rolls back if 403 (not own comment) or other errors

### useComments(postId)
Query hook for fetching paginated comments with deduplication.

```typescript
const { data, fetchNextPage, hasNextPage, isLoading } = useComments(postId);
const comments = data?.comments ?? [];
```

**Deduplication:** Built-in via `select` transform to handle cursor pagination overlaps.

## Auth Gating & Permissions

### Login Flow
Logged-out users see:
- Blue banner: "Sign in to like and comment. [Sign in link]"
- Link includes `redirect` param pointing back to current page
- Like/comment buttons disabled until auth

### Own Comments
Delete button visible only for own comments (`currentUserId === comment.author.id`).

### Rate Limiting (429)
Handled gracefully:
- UI shows: "Too many requests. Please wait before trying again."
- Mutation doesn't invalidate to avoid extra requests
- User can retry manually

## a11y

### Toggle Semantics
```tsx
<button
  aria-pressed={post.isLiked}
  onClick={handleLike}
>
  {post.isLiked ? "Unlike" : "Like"}
</button>
```

### Dialog Focus
```tsx
<div role="dialog" aria-labelledby="comment-panel-title">
  <h2 id="comment-panel-title">Comments</h2>
  {/* content */}
</div>
```

### Live Regions
Count changes (from optimism settling) should be announced politely—consider `aria-live="polite"` on count elements if backend frequently updates.

## Testing

### Unit Tests
**File:** `src/__tests__/interactions.test.ts`

- Toggle like: state flip, count math
- Rapid clicks: settle to correct final state
- Optimistic comment: prepend, reconcile ID, rollback

### Component Tests
- Double-click like: doesn't drift count
- Create comment: appears optimistically, ID reconciles
- Delete comment: soft-delete placeholder

### Integration Tests
- Feed like reflected in creator profile (shared cache)
- Comment create invalidates post commentCount on feed

### E2E Tests (MSW mock)
- Expand comments → add → appears immediately
- Like toggle updates count, settles correctly
- Fail like → rollback, user can retry
- 429 rate limit → shows message, no UI break

## Performance Considerations

### Query Key Design
Specific keys enable surgical invalidation:
```typescript
queryKeys.interactions.comments(postId)  // Only invalidate this post's comments
queryKeys.feed.infinite(filter)          // Invalidate all feed pages
```

### Debounce vs. Serial Mutations
**Current:** Serial mutations (one at a time, sequential).
- Ensures count stays correct under rapid clicks
- Simpler to reason about
- TanStack Query handles queueing

**Avoid:** Debounce on like button (fires once after delay)
- Loses intent if user clicks multiple times
- Better to let serial mutations handle it

### Lazy Comment Panel
Comments only fetch when panel opens.
- Reduces initial load on feed
- Saves bandwidth for users who don't read comments

### Deduplication in useComments
Cursor pagination may overlap. Built-in `select` transform dedupes by comment ID to prevent duplicates in UI.

## Error Handling

| Status | Behavior |
|--------|----------|
| 401 (expired token) | Auto-refresh + retry (client middleware) |
| 403 (not own comment on delete) | "You can only delete your own comments" |
| 429 (rate limit) | "Too many requests. Please wait." |
| 5xx | "Failed to [action]. Please try again." |

## Deployment Checklist

- [ ] Backend `/feed` endpoint includes `likeCount`, `commentCount`, `likedByMe`
- [ ] Backend `/posts/{id}/like` POST/DELETE implemented
- [ ] Backend `/posts/{id}/comments` GET (cursor), POST, DELETE implemented
- [ ] Backend soft-delete: `deleted: true` flag on comments
- [ ] Backend single-flight like: rapid double-click handled correctly
- [ ] Backend auth: 401 for logged-out, 403 for non-own delete
- [ ] Backend rate limit: 429 with backoff header
- [ ] Frontend tests pass: `npm run test`
- [ ] E2E tests pass: `npm run test:e2e`
- [ ] TypeScript strict: `npm run typecheck`
- [ ] Build succeeds: `npm run build`

## Future Extensions

### Comment Likes
UI ready; hooks partially implemented. Wire up:
```typescript
const { mutate: likeComment } = useLikeComment(postId);
<Button onClick={() => likeComment(comment.id)}>
  {comment.likeCount} {comment.likedByMe ? "♥" : ""}
</Button>
```

### Comment Mentions / Rich Text
Keep plain text for MVP. Extend `CommentComposer` input type if needed.

### Nested Thread Expansion
Currently 1-level replies. To expand: fetch replies by `parentId`, render recursively with indentation.

### Realtime Updates (WebSocket)
Listen for `comment:created`, `post:liked` events to update cache without polling.

## Troubleshooting

### Like count drifts after double-click
- Check: Are mutations serial or concurrent?
- Fix: Ensure `disabled` on like button during `isPending`

### Comment doesn't appear after create
- Check: Did optimistic append happen? (should see temp ID)
- Check: Did reconciliation happen on success? (temp ID → real ID)
- Fix: Review `onSuccess` in `useCreateComment`

### Profile post doesn't update when liked on feed
- Check: Is `queryClient.setQueriesData` being called with predicate?
- Check: Are query keys matching (`creators.detail` pattern)?
- Fix: Ensure `onMutate` updates both feed and creator queries
