# Server-backed auth entitlements design

## Goal

Fix the reviewed auth and subscription risks by moving app access decisions to server-owned entitlement state while keeping the current purchase flow as a temporary mock.

## Audience

This spec is for engineers working on the Expo app and Convex core package.

## Scope

Included:

- Server-owned subscription entitlement schema and Convex functions.
- App route guards that require both authentication and active entitlement.
- Pending-plan claim flow after authentication.
- Auth UI error-handling and accessibility fixes.
- Package-level typecheck gates and focused regression tests where practical.

Excluded:

- Real App Store, Play Store, or RevenueCat validation.
- Marketing/API package changes unrelated to auth access.
- Broad UI redesign beyond accessibility and bug fixes.

## Current risks

- `(account)/_layout.tsx` redirects authenticated users to `/home`, so `auth.tsx` may not run subscription claim logic.
- `(app)/_layout.tsx` checks only for `user`, allowing authenticated-but-unsubscribed users into protected routes.
- `packages/app/lib/subscription.tsx` stores entitlement truth in AsyncStorage.
- `packages/core/convex/users.ts` accepts entitlement-like profile fields from clients.
- OTP, restore, and claim flows can leave loading states stuck when promises reject.
- `bunx turbo run typecheck` currently runs zero package tasks for app/core.

## Chosen approach

Use a server-backed mock entitlement model.

Convex becomes the source of truth for whether an authenticated user has an active subscription. The app may still store a selected pending plan locally before sign-in, but it cannot use AsyncStorage as proof of access.

This is intentionally smaller than full purchase-provider integration, but it removes the immediate client-side authorization bypass and creates a clean seam for RevenueCat or store receipt validation later.

## Core design

### Schema

Add a `subscriptions` table with one active entitlement per auth user:

- `authUserId`
- `productId`: `yearly | monthly | family`
- `status`: `active`
- `source`: `mock`
- `claimedAt`
- optional `expiresAt`

Add indexes by `authUserId` and by `authUserId,status` if Convex supports the needed query shape cleanly.

### Convex API

Add subscription functions:

- `getMySubscription`: returns the current authenticated user's active subscription or `null`.
- `claimMockSubscription(productId)`: authenticated mutation that creates or returns an active mock subscription for the current user.

The mutation is named as mock-oriented on purpose, so future production purchase validation is not confused with trusted receipt verification.

### Profile API

Remove client-write access to `plan` and `trialStartedAt` from profile upsert args. Keep onboarding-completion and preference fields separate from entitlement state.

Tighten obvious validators to match app enums where doing so is surgical.

## App design

### Subscription context

Repurpose `SubscriptionProvider` so local storage contains only `pending` plan state.

The context should expose:

- `pending`
- `hydrated`
- `purchasePending(productId)`
- `claimPending()`
- `clearPending()`

`claimPending()` calls the Convex mutation when a pending product exists, then clears pending local state. Active access comes from the server subscription query, not local storage.

### Route guards

Update protected app routing:

- If auth is loading or server subscription is loading, render `AuthLoading`.
- If no user, redirect to onboarding welcome.
- If user exists but no active subscription, redirect to `/no-active-sub`.
- Otherwise render protected app routes.

Update `index.tsx` similarly so authenticated users without entitlement do not go straight to `/home`.

Update `(account)/_layout.tsx` so it does not blindly redirect all authenticated users to `/home`. If needed, it can render the stack and let `auth.tsx` run the post-auth claim flow.

### Auth flow

After OTP or OAuth establishes a user, `auth.tsx` should:

1. Wait for user, pending subscription hydration, and server subscription query state.
2. If a pending plan exists, call `claimPending()`.
3. Re-check active entitlement state.
4. Route signup claim success to `/success`, existing active users to `/home`, and no entitlement to `/no-active-sub`.
5. Catch failures, release the handling lock, and show a recoverable alert.

### No active subscription

Restore should re-check server subscription state and route home only if active. Rejected restore/check calls must clear loading and show a retryable error.

### Auth UI accessibility

Add explicit labels and roles to:

- email input
- OTP input
- back buttons
- legal links
- provider buttons where visible label can vary by mode

No visual redesign is required.

## Tests and quality gates

Add package scripts:

- `packages/app`: `typecheck: tsc --noEmit`
- `packages/core`: `typecheck: tsc --noEmit`

Focused tests should prioritize pure logic where the current stack supports it without introducing a new test framework:

- subscription pending-state helpers if extracted
- profile validator behavior if practical
- existing reset-db coverage remains unchanged

Manual verification for this pass:

- `bun x ultracite fix`
- `bun turbo typecheck`
- `bun test`

## Trade-offs

- Server-backed mock entitlements are safer than AsyncStorage but are not a billing system.
- Mock claim mutation still trusts the app that a plan was selected; future production work must replace it with receipt validation.
- Route guard fixes may expose existing users without server subscriptions to `/no-active-sub` until they claim a mock plan or test data is migrated.

## Rollout notes

This change is safe for development builds. Before production billing, replace `claimMockSubscription` with a provider-verified entitlement mutation and migrate or remove mock subscription records.
