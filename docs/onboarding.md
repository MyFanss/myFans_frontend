# Creator Onboarding Wizard v2

Production-grade, resumable creator onboarding system with URL-synced state, parallel persistence (localStorage + server), finite-state machine, and comprehensive test coverage.

## Architecture

### Route Structure

```
src/app/(onboarding)/
├── layout.tsx                          # Route group layout
├── onboarding/
│   ├── page.tsx                        # Redirect to /onboarding/identity
│   └── [step]/
│       └── page.tsx                    # Main step page (orchestrator)
```

### URL-Synced State

- **Route**: `/onboarding/:step` (e.g., `/onboarding/identity`, `/onboarding/profile`)
- **Browser history**: Back/forward buttons work naturally
- **Query params**: Optional `?step=1` parameter supported
- **Valid steps**: `identity` (1) → `profile` (2) → `monetization` (3) → `content` (4) → `review` (5)
- **Redirect**: `/onboarding` redirects to `/onboarding/identity`

## Steps

### 1. Identity — Display Name, Handle, Avatar

**Component**: `IdentityStep.tsx`

**Fields**:
- Display Name (required, 2-50 chars)
- Handle (required, 3-30 chars, alphanumeric + underscore/hyphen)
- Avatar URL (optional, must be valid URL)

**Features**:
- Async handle uniqueness check with 500ms debounce + AbortController
- Live validation with inline error messages
- Loading spinner during async check
- Success indicator when handle is available
- Blocks advance if handle unavailable

**Validation**:
- Display name: min 2, max 50 chars
- Handle: min 3, max 30 chars, regex `^[a-zA-Z0-9_-]+$`
- Avatar: valid URL or empty
- Async: checkHandleAvailability(handle, signal) endpoint

### 2. Profile — Bio, Categories, Social Links

**Component**: `ProfileStep.tsx`

**Fields**:
- Bio (optional, max 500 chars, word counter)
- Categories (required, 1-5 selections from server-fetched list)
- Social Links (optional):
  - Twitter URL
  - Instagram URL
  - TikTok URL

**Features**:
- Live character count for bio
- Dynamically loaded categories from API
- Fallback mock categories if API fails
- Optional social link fields
- URL validation for social links

**Validation**:
- Bio: max 500 chars
- Categories: 1-5 required
- Social URLs: valid URL format

### 3. Monetization — Payout Method, KYC Checklist, Terms

**Component**: `MonetizationStep.tsx`

**Fields**:
- Payout Method (required: Bank Transfer or PayPal)
- KYC Status (display only: email verified ✓, identity pending, tax pending)
- Terms Acceptance (required checkbox)

**Features**:
- Payout method dropdown (bank_transfer, paypal)
- Mock KYC checklist (visual, non-interactive)
- Terms acceptance checkbox with links
- Info banner explaining post-onboarding KYC
- Clear messaging about next steps

**Validation**:
- Payout method: must select bank_transfer or paypal (not empty)
- Terms: must be checked (true)

### 4. Content Readiness — Draft Post or Skip

**Component**: `ContentReadinessStep.tsx`

**Fields**:
- Has Draft (checkbox)
- Draft Title (optional, shown if hasDraft checked)
- Skip for Now (button)

**Features**:
- Toggle between "I have content" and "Skip for now"
- Optional draft title input (only when hasDraft = true)
- Content upload stub (UI only, not functional in v1)
- Content tips card with advice
- Skip confirmation dialog with explanation
- "Skip" button appears alongside "Continue"

**Validation**:
- Either hasDraft true OR skippedContent true (exclusive-or handled by dialog)

### 5. Review & Launch — Read-Only Summary + Confirmation

**Component**: `ReviewStep.tsx`

**Features**:
- Read-only display of all collected data (sections 1-4)
- "Edit" button per section → deep link to that step
- Platform guidelines acknowledgment (required checkbox)
- Launch confirmation dialog
- Double-submit protection

**Sections**:
- Identity: Display Name, Handle, Avatar (if provided)
- Profile: Bio, Categories, Social Links (if provided)
- Monetization: Payout Method, Terms Status
- Content: Status (Ready/Skipped), Draft Title (if applicable)

**Accessibility**:
- Platform guidelines rendered in blue info card
- Must check "I understand and agree" before launch
- Launch button disabled until acknowledgement
- Confirmation dialog before final commit

## Finite State Machine (FSM)

Custom reducer pattern with exhaustive TypeScript never-checks.

### States

```typescript
type OnboardingFSMState = 
  | 'idle'           // Initial state
  | 'editing'        // User editing form
  | 'validating'     // Form validation in progress
  | 'saving'         // Submitting to server
  | 'advancing'      // Moving to next step
  | 'completed'      // Onboarding complete (terminal)
  | 'error'          // Validation/server error (recoverable)
  | 'blocked'        // Cannot proceed (e.g., handle taken)
```

### Transitions

```
idle → editing (on EDIT)
     → validating (on VALIDATE)
     
editing → validating (on VALIDATE)
        → saving (on SAVE)
        → idle (on RESET)

validating → saving (on SAVE)
           → error (on ERROR)
           → advancing (on ADVANCE)

saving → advancing (on ADVANCE)
       → error (on ERROR)

advancing → completed (on COMPLETE)
          → editing (on EDIT)
          → error (on ERROR)

error → editing (on EDIT)
      → idle (on RESET)
      → blocked (implicitly)

blocked → editing (on UNBLOCK)

completed → [terminal, no transitions]
```

### Events

```typescript
type OnboardingFSMEvent =
  | { type: 'EDIT' }                    // User starts/resumes editing
  | { type: 'VALIDATE' }                // Trigger form validation
  | { type: 'SAVE' }                    // Save to server
  | { type: 'ADVANCE' }                 // Move to next step
  | { type: 'RESET' }                   // Reset to initial state
  | { type: 'ERROR'; error: string }    // Error occurred
  | { type: 'UNBLOCK' }                 // Recover from blocked
  | { type: 'COMPLETE' }                // Finalize onboarding
```

### Context

```typescript
interface OnboardingFSMContext {
  currentStep: number;
  state: OnboardingFSMState;
  error?: string;
  isDirty: boolean;
  isSaving: boolean;
  isValidating: boolean;
}
```

## Draft Persistence

### Parallel Storage Strategy

**localStorage**: Immediate, optimistic writes
- Key: `onboarding_draft_v1`
- Updated on every field change (debounced 500ms per-field)
- Used as fallback if server unreachable

**Server**: Authoritative source
- `GET /api/onboarding/draft` → fetch latest from server
- `PUT /api/onboarding/draft/:step` → upsert step data
- Response includes `updatedAt` timestamp for conflict resolution

### Merge Rules (on Load)

```
if (!serverDraft && !localDraft) → null
if (!serverDraft) → localDraft
if (!localDraft) → serverDraft
if (serverDraft.updatedAt > localDraft.updatedAt) → serverDraft
if (serverDraft.updatedAt === localDraft.updatedAt) 
  → merge at field level (local fields override server)
if (serverDraft.updatedAt < localDraft.updatedAt) → localDraft
```

**Example**: User edits locally (unsaved), server has newer version from another device
→ Server draft wins, local changes lost (timestamp-based)

### API Contract

**GET /api/onboarding/draft**

```json
Response (200):
{
  "step": 2,
  "data": {
    "identity": { "displayName": "John", "handle": "john" },
    "profile": { "bio": "...", "categories": [...] }
  },
  "updatedAt": 1690000000000,
  "version": "1.0"
}

Response (404): No draft exists yet
```

**PUT /api/onboarding/draft/:step**

```json
Request:
{
  "data": {
    "displayName": "John",
    "handle": "john_updated"
  }
}

Response (200): Merged draft (same structure as GET)
```

**POST /api/onboarding/complete**

```json
Request (with Idempotency-Key header):
{
  "identity": {...},
  "profile": {...},
  "monetization": {...},
  "content": {...}
}

Response (200):
{
  "id": "creator-id",
  "status": "completed",
  "createdAt": "2024-07-28T..."
}

Response (409): Already completed (idempotent, safe to retry)
```

## Validation

### Per-Step Schemas (Zod)

```typescript
// Step 1: Identity
identitySchema.parse({
  displayName: string (2-50),
  handle: string (3-30, /^[a-zA-Z0-9_-]+$/),
  avatar?: string (URL)
})

// Step 2: Profile
profileSchema.parse({
  bio: string (≤500),
  categories: string[] (1-5),
  socialLinks: {
    twitter?: string (URL),
    instagram?: string (URL),
    tiktok?: string (URL)
  }
})

// Step 3: Monetization
monetizationSchema.parse({
  payoutMethod: 'bank_transfer' | 'paypal',
  kycCompleted: boolean,
  termsAccepted: boolean (must be true)
})

// Step 4: Content
contentSchema.parse({
  hasDraft: boolean,
  draftTitle?: string,
  skippedContent: boolean
})

// Step 5: Complete Schema
onboardingSchema.parse({
  identity: {...},
  profile: {...},
  monetization: {...},
  content: {...}
})
```

### Async Validation

**Handle Uniqueness Check**

```typescript
GET /api/onboarding/check-handle?handle=johndoe

Response:
{
  "available": true | false,
  "error"?: "Handle already taken" | "Check cancelled"
}
```

**Implementation**:
- 500ms debounce (useEffect cleanup)
- AbortController to cancel in-flight requests on unmount/step change
- Live indicator (spinner → ✓ available → ✗ taken)
- Blocks advance if taken

## Retry & Error Handling

### Retry Strategy

**Exponential backoff** for server 5xx / network errors:
- 1st retry: 1s delay
- 2nd retry: 2s delay
- 3rd retry: 4s delay
- Max 3 retries total

**No retry** on:
- 4xx validation error (MIME, size, spoof)
- 401/403 auth error (user must re-login)

### Error States

| Error | UX | Retry |
|-------|----|----|
| Handle taken | Inline ✗ badge + message | No |
| Validation failed | Form error under field | User edit |
| Network timeout | Toast + retry button | Yes (1s, 2s, 4s) |
| Server 500 | Toast + retry button | Yes (1s, 2s, 4s) |
| Offline | Banner + retry on reconnect | Yes (immediate) |

## Observability

### Structured Client Events

```typescript
// Event logging (console stub for now, replace with analytics)
interface OnboardingEvent {
  type: 'step_view' | 'step_complete' | 'step_error' | 
        'validation_error' | 'save_error' | 'abandon' | 'complete'
  step?: OnboardingStep
  timestamp: number
  duration?: number
  error?: string
}

// Examples:
{ type: 'step_view', step: 'identity', timestamp: 1690000000000 }
{ type: 'step_complete', step: 'identity', duration: 45000 }
{ type: 'validation_error', step: 'profile', error: 'No categories selected' }
{ type: 'complete', timestamp: 1690000300000 }
```

## Guards & Routing

### Incomplete Creators

If `user.profile.completedAt` is null:
- ✗ Cannot access `/dashboard/**` → redirect to `/onboarding/:step`
- ✓ Can visit `/onboarding` directly

**Implementation**: Client-side `useOnboardingGuard()` hook (useEffect redirect)

### Completed Creators

If `user.profile.completedAt` is set:
- ✗ Cannot re-enter `/onboarding/**` → redirect to `/dashboard`
- ✓ Can access `/dashboard` freely

**Implementation**: Client-side redirect on onboarding page load

### Non-Creators (Subscribers)

If `user.role !== 'creator'`:
- ✗ Cannot enter `/onboarding` at all
- Show "Role mismatch" error

**Implementation**: Server middleware + client check in layout

## Accessibility

### WCAG 2.1 AA Compliance

**Focus Management**:
- Focus trap on step container
- Restore focus when returning from edit
- Logical tab order (fields → buttons)

**Keyboard Navigation**:
- Tab: move through fields
- Enter: submit form / advance step
- Escape: cancel dialog

**Live Regions**:
- Step title + progress announced on step change
- Handle availability status announced (spinner → ✓/✗)
- Form errors announced

**Labels & Descriptions**:
- All form fields have explicit `<label>` elements
- aria-describedby links error messages
- aria-live regions for async status

**Dark Mode**:
- Color contrast ≥4.5:1 (WCAG AA)
- Uses next-themes for toggle
- Correct dark mode styling on all components

**Mobile**:
- Touch targets ≥44px (iOS/Android standard)
- Single-column layout
- No horizontal scroll
- Sticky footer action buttons

## Testing

### Unit Tests

**FSM** (`src/lib/onboarding/__tests__/fsm.test.ts`):
- State transitions (idle → editing → validating → saving → advancing)
- Error handling and recovery
- Helper functions (canAdvance, canSave, isInProgress)
- Dirty tracking

**Schemas** (`src/lib/onboarding/__tests__/schemas.test.ts`):
- Valid/invalid data for each step
- Boundary cases (min/max length, formats)
- Composed schema validation

**Persistence** (`src/lib/onboarding/__tests__/persistence.test.ts`):
- Merge conflict resolution (timestamp-based, field-level)
- Draft creation and updates
- Completion percentage calculation

### Component Tests

**IdentityStep**:
- Async handle check with debounce
- Handle unavailable blocks advance
- Form validation errors display
- Abort on unmount

**ProfileStep**:
- Category multi-select validation
- Bio character counter
- Social link URL validation
- Fallback mock categories if API fails

**MonetizationStep**:
- Payout method selection
- Terms acceptance required
- KYC checklist display (visual only)

**ReviewStep**:
- All data displays correctly
- Edit links navigate to steps
- Platform guidelines acceptance required
- Confirmation dialog before launch

**OnboardingLayout**:
- Progress bar updates correctly
- Step indicators show completion state
- Keyboard navigation (Tab, Enter, Escape)
- Sticky footer visibility

### Integration Tests

**Refresh Restore** (`e2e/onboarding.spec.ts`):
- Start onboarding, fill identity step
- Reload page → draft loads from localStorage + server merge
- Correct step restored
- Data intact

**Race Condition**:
- Edit Step 1, edit Step 2, save Step 2 before Step 1 reply arrives
- Server merge handles field-level conflicts
- Both steps correctly saved

**Complete Flow**:
- Fill all 5 steps
- Submit complete
- Idempotency key prevents double-submit
- Redirects to /dashboard with success toast
- Draft cleared from localStorage

### E2E Tests (Playwright)

**Redirect Guards**:
- Incomplete creator hits /dashboard → redirect to /onboarding/identity
- Completed creator hits /onboarding → redirect to /dashboard
- Non-creator hits /onboarding → error state

**Happy Path**:
- Fill all fields across 5 steps
- Navigate with next/prev and edit links
- Submit → success → dashboard

**Validation**:
- Invalid handle blocks advance
- Empty categories blocks advance
- Unchecked terms blocks launch

**Mobile Responsive**:
- No horizontal scroll on mobile viewport
- Touch targets ≥44px
- Sticky footer visible

## Deployment

### Feature Flag

```env
NEXT_PUBLIC_ONBOARDING_V2=true   # Enable new wizard
# If false, show legacy empty state (fallback)
```

### Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3000  # API base URL
```

### Build & CI

- `npm run build` — TypeScript strict mode, no errors
- `npm run test` — all unit tests pass
- `npm run test:e2e` — Playwright E2E pass
- ESLint — no warnings/errors
- Pre-commit hooks — formatting, type check

### Checklist

- [ ] Backend `/api/onboarding/*` endpoints implemented
- [ ] MSW mocks in place for dev/testing
- [ ] Feature flag gate active
- [ ] All unit tests passing
- [ ] E2E tests passing
- [ ] Manual testing: complete flow on desktop + mobile
- [ ] Manual testing: refresh restore mid-flow
- [ ] Manual testing: handle async check + unavailable
- [ ] Accessibility audit: WCAG AA
- [ ] Dark mode tested
- [ ] Internationalization ready (text in constants, not hardcoded)

## Extending

### Adding a Step

1. **Add type** to `OnboardingStep` union in `src/types/onboarding.ts`
2. **Add schema** in `src/lib/onboarding/schemas.ts`
3. **Add step data type** (e.g., `BillingData`) to `src/types/onboarding.ts`
4. **Create component** `src/components/onboarding/BillingStep.tsx` with RHF form
5. **Update step mapping** in `src/lib/onboarding/fsm.ts` (`numberToStep`, `stepToNumber`)
6. **Add route** `/onboarding/billing` → handled by `[step]/page.tsx`
7. **Add test** for schema and component
8. **Update docs** with new step description

## Troubleshooting

### Draft Not Persisting

**Issue**: Refresh loses progress
**Check**:
- localStorage enabled in browser
- API `/api/onboarding/draft` responds 200
- Network tab shows PUT request completing
- Check browser DevTools: Application → Local Storage → `onboarding_draft_v1`

**Fix**: Clear localStorage, reload, and re-fill

### Handle Check Stuck

**Issue**: "Checking..." spinner never completes
**Check**:
- API `/api/onboarding/check-handle` endpoint working
- Network delay > 500ms?
- AbortController triggered on unmount?

**Fix**: Check Network tab, verify endpoint, increase debounce delay if needed

### Redirect Loop

**Issue**: Incomplete creator redirected to /onboarding, but then back to /dashboard
**Check**:
- `user.profile.completedAt` field populated on backend after complete
- Client-side guard using latest user data
- useAuth hook refreshing user after onboarding complete

**Fix**: Ensure backend sets `completedAt` timestamp, client refetches user

### Dark Mode Colors Wrong

**Issue**: Form fields not visible in dark mode
**Check**:
- All backgrounds using `bg-background`, `bg-muted`
- Text using `text-foreground`, `text-muted-foreground`
- Tailwind dark: class applied correctly
- next-themes provider in root layout

**Fix**: Run `npm run build`, check Tailwind output for dark: classes

## Future Enhancements

- Image cropping / rotation UI in avatar upload
- Multi-file content upload (full media pipeline integration)
- Payment method verification UI (not stub)
- Real KYC integration (stub → real vendor)
- Email verification step
- Two-factor authentication setup
- Creator tier selection (free/pro/enterprise)
- Content scheduling integration
- Team member invite step
- Content policy quiz / certification
