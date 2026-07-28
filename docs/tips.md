# Tip Creator Modal — Hardened Payment-Stub Orchestration

Complete monetization UX for one-off tips: multi-step accessible dialog with payment intent orchestration, idempotent retry, and receipt state.

## Flow Diagram

```
┌─────────────────────────────────────┐
│ Amount Selection                    │
│ - Presets ($5/$10/$25/$50)         │
│ - Custom input (min/max bounds)    │
│ - Message (optional, ≤200 chars)   │
│ - Fee preview                       │
└─────────────┬───────────────────────┘
              │
              ↓
┌─────────────────────────────────────┐
│ Confirm & Review                    │
│ - Total amount                      │
│ - Platform fee breakdown            │
│ - Message preview                   │
│ - Creator receives                  │
└─────────────┬───────────────────────┘
              │
              ↓
┌─────────────────────────────────────┐
│ Processing (POST /tips/intents)     │
│ + (POST /tips/intents/{id}/confirm) │
│ - Spinner + "Don't close" message   │
│ - Timeout → "Check status" stub     │
└──────┬──────────────────────┬───────┘
       │ ✓                     │ ✗
       ↓                       ↓
   ┌────────────┐         ┌──────────┐
   │ Success    │         │ Failed   │
   │ (receipt)  │         │ (retry)  │
   └────────────┘         └──────────┘
```

## State Machine

**States:**
- `amount` — Preset/custom entry, message, fee preview
- `confirm` — Final review before payment
- `processing` — Waiting for intent creation → confirmation
- `success` — Receipt with tip ID, "View activity" link
- `failed` — Error message, preserved amount, "Try again"
- `cancelled` — User dismissed (no side effects)

**Transitions:**
```
amount → confirm → processing → success
         ↓           ↓
         └─────back  failed ─→ amount (try again)
cancel → (close, no error)
```

**Properties:**
- Cannot close during `processing` (except user confirms discard)
- Failed state preserves amount (user doesn't retype)
- Success opens receipt; "Done" closes modal
- Idempotency key generated once per attempt, reused on retry

## API Contract

### Create Tip Intent
```bash
POST /tips/intents
{
  "creatorId": "creator-123",
  "amount": 10.00,
  "currency": "USD",
  "message": "Great content!",
  "idempotencyKey": "uuid-here"
}

→ 200 OK
{
  "id": "intent-456",
  "creatorId": "creator-123",
  "userId": "user-789",
  "amount": 10.00,
  "currency": "USD",
  "message": "Great content!",
  "status": "pending",
  "idempotencyKey": "uuid-here",
  "expiresAt": "2025-08-28T21:10:00Z",
  "createdAt": "2025-08-28T21:00:00Z"
}

→ 409 Conflict (idempotency)
{
  "code": "DUPLICATE_INTENT",
  "intentId": "intent-456",
  "message": "Intent already exists for this idempotency key"
}
```

### Confirm Tip Intent
```bash
POST /tips/intents/{intentId}/confirm
{
  "idempotencyKey": "uuid-here",
  "paymentMethodId": "pm_stub_123",
  "nonce": "nonce_stub"
}

→ 200 OK
{
  "id": "tip-789",
  "creatorId": "creator-123",
  "userId": "user-789",
  "amount": 10.00,
  "currency": "USD",
  "message": "Great content!",
  "status": "completed",
  "createdAt": "2025-08-28T21:00:05Z"
}

→ 402 Payment Required
{
  "code": "INSUFFICIENT_FUNDS",
  "message": "Card declined or insufficient funds"
}

→ 409 Conflict (already confirmed)
{
  "code": "ALREADY_CONFIRMED",
  "message": "Intent already confirmed"
}
```

## Error Mapping

| Status | Code | UI Message | Action |
|--------|------|-----------|--------|
| 401 | UNAUTHORIZED | "Sign in to tip" | Redirect to /login with return URL |
| 402 | INSUFFICIENT_FUNDS | "Payment declined. Try another method." | Show failure, preserve amount, "Try again" |
| 403 | PERMISSION_DENIED | "You cannot tip your own profile" | Disable tip button on own profile |
| 409 | CONFLICT | "Retrying..." | Retrieve existing intent, confirm again (idempotent) |
| 422 | VALIDATION_ERROR | Show field-specific error (e.g., "Amount too low") | Show error, preserve input |
| 5xx | SERVER_ERROR | "Something went wrong. Please try again." | Show failure, allow retry |

## Idempotency & Retry

**Flow:**
1. User initiates tip → generate UUID for `idempotencyKey`
2. POST `/tips/intents` with idempotencyKey
3. If 409 (already exists): retrieve intent ID from response
4. Proceed to confirm with same intent ID
5. If confirm fails (4xx/5xx) and user retries: reuse same idempotencyKey
6. Backend ensures only one successful charge per idempotencyKey

**Why:**
- Network fails after intent created but before response
- User retries thinking first attempt failed
- Idempotency key ensures exact-once delivery (no duplicate charges)

## Components

### TipCreatorModal
Full multi-step modal (6 states above).

**Props:**
```typescript
interface TipCreatorModalProps {
  creator: Creator;
  isOpen: boolean;
  onClose: () => void;
}
```

**Behavior:**
- Focus trap on open
- Escape closes (only if not processing)
- Restore focus to trigger button on close
- aria-describedby links to fee explanation

### TipButton
Entry point: opens modal for given creator.

**Props:**
```typescript
interface TipButtonProps {
  creator: Creator;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}
```

**Hidden cases:**
- Own profile (`user.id === creator.id`)
- Not authenticated (`!user`)
- Creator tips disabled (stub: add `creator.tipsDisabled` flag)

## Validation

### Amount
- Min: `$1.00`
- Max: `$10,000.00`
- Decimal places: max 2 (`.99`, not `.999`)
- Regex: `/^\d+(\.\d{0,2})?$/`

### Message
- Max length: 200 characters
- Allowed: UTF-8 text (no emoji-only spam rule yet)
- Optional

### Locale Parsing
```typescript
// Handle both "1.00" and "1,00" (locale-specific)
const parse = (input: string, locale = "en-US") => {
  const dec = new Intl.NumberFormat(locale).format(1.1)[1]; // "." or ","
  return parseFloat(input.replace(dec === "," ? "," : ".", "."));
};
```

## Cache Updates

### Query Invalidation on Success
```typescript
// Success: creator tip count updated
queryClient.invalidateQueries({
  queryKey: queryKeys.tips.byCreator(creatorId),
});
queryClient.invalidateQueries({
  queryKey: queryKeys.creators.detail(creatorId),
});
```

### Optimistic (Optional, not implemented)
Could prepend "pending tip" to tips list on success; backend confirmation finalizes.
For now: server-driven UI (wait for response).

## Security

### Never Trust Client Calculations
- Fee is displayed only
- Server recalculates and validates on confirm
- Don't save calculated total to localStorage

### Payment Data Handling
- Never log full `nonce` or `paymentMethodId`
- Use stub values in dev/test
- Real payment method IDs/tokens handled by payment processor

### CSRF Protection
- Idempotency key is UUID (not predictable)
- Each intent POST includes authenticated user context
- Confirm endpoint requires valid intent ID

## Accessibility

### Dialog
- `role="dialog"` with `aria-labelledby`
- `aria-describedby="tip-modal-description"` for fee explanation
- Focus trap: first interactive element focused on open
- Escape closes (unless processing without discard option)
- Focus restored to trigger button on close

### Form
- Labeled inputs (`<label>` + `htmlFor`)
- Error messages linked via `aria-describedby`
- aria-pressed on amount presets
- aria-busy during processing

### Validation
- Error message displayed before submit if invalid
- Red border + icon on error fields
- Success toast + modal success state

## Configuration (Stub)

```typescript
interface TipConfig {
  minAmount: number;       // 1.00
  maxAmount: number;       // 10000.00
  platformFeePercentage: number;  // 5
  currency: string;        // "USD"
  disabled?: boolean;      // Creator opted out
}
```

Load from env or creator profile.

## Testing

### Unit (`src/__tests__/tips.test.ts`)
- Amount parsing (locale-aware)
- Fee math (rounding)
- Idempotency key uniqueness + reuse
- State machine transitions
- Validation bounds

### Component
- Step transitions correct
- Cannot close during processing
- Amount preserved on failure
- Fee breakdown visible and correct
- Focus management (trap, restore)

### Integration
- 401 redirects to login with return URL
- 402 shows payment failure, amount preserved
- 409 conflict: idempotent retry succeeds
- Success invalidates creator queries

### E2E (Playwright, `e2e/tips.spec.ts`)
- Open modal from creator profile
- Select preset → confirm → receipt
- Fee breakdown visible
- Processing state (spinner, disable close)
- Success toast + modal receipt
- Failure with "Try again"
- Escape closes (amount state only)
- Cannot tip own profile (button hidden/disabled)
- Unauthenticated redirects to login

### MSW Mocks
- Success: 200 intent created, 200 confirm → receipt
- Failure: 402 Payment Required on confirm
- Slow confirm: 5s delay, timeout → "Check status"
- Conflict: 409 on first intent, 200 on retry (idempotent)

## Deployment Checklist

- [ ] Backend `/tips/intents` POST/GET implemented (stub OK)
- [ ] Backend `/tips/intents/{id}/confirm` POST implemented
- [ ] Idempotency key honored: 409 on duplicate intent
- [ ] Fee calculated server-side and returned
- [ ] 401/402/409/422 error contracts match above
- [ ] Creator tips enabled by default (or `tipsDisabled: false`)
- [ ] Platform fee % configurable
- [ ] Min/max amounts configurable
- [ ] Frontend tests pass: `npm run test`
- [ ] E2E tests pass: `npm run test:e2e`
- [ ] TypeScript strict: `npm run typecheck`
- [ ] Build succeeds: `npm run build`
- [ ] Modal appears on creator profile
- [ ] Tip button hidden on own profile
- [ ] Unauthenticated users prompted to login

## Future Enhancements

- Real Stripe/Stellar payment processing
- Tip history / "View activity" link target
- Recurring tips (e.g., "Tip every post")
- Tip goals / fundraisers
- Tax invoicing
- Bulk tips
- Tipping comments (not just posts/creator)

## Troubleshooting

### Modal won't close
- Check: Is `step === "processing"`?
- Fix: Add explicit cancel button or timeout

### Amount not preserved on failure
- Check: Is `amount` state cleared on close?
- Fix: Only clear on success, not on error

### Fee doesn't match backend
- Check: Is `platformFeePercentage` hardcoded vs. from config?
- Fix: Load from env or server on component mount

### Can tip own profile
- Check: Is `user.id === creator.id` check in `TipButton`?
- Fix: Verify `user` and `creator` IDs are correctly loaded

### Idempotency not working
- Check: Is `idempotencyKey` reused on retry?
- Fix: Store key in state, don't regenerate per attempt

## Related Docs

- [Engagement System](./interactions.md) — Likes/comments (shares similar optimistic patterns)
- [Feed Architecture](./feed.md) — Uses same query key structure for cache sync
