# Server-Backed Entitlements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move subscription access checks from client AsyncStorage to server-owned Convex entitlement state, then fix the reviewed auth routing, error handling, accessibility, and typecheck gaps.

**Architecture:** Convex owns active subscription truth in a new `subscriptions` table. The app stores only a pending selected plan locally until the authenticated user claims it through a mock entitlement mutation. Protected routes require both an authenticated user and an active server subscription.

**Tech Stack:** Expo Router, React Native, Convex, Better Auth, AsyncStorage for local pending state only, Bun, Turbo, TypeScript.

---

## File structure

- Modify: `packages/core/convex/schema.ts` — add the `subscriptions` table and tighten profile field validators.
- Create: `packages/core/convex/subscriptions.ts` — server-owned subscription query and mock-claim mutation.
- Modify: `packages/core/convex/users.ts` — remove client-write entitlement fields from profile upsert and mirror stricter validators.
- Modify generated Convex files after codegen: `packages/core/convex/_generated/api.d.ts`, `packages/core/convex/_generated/dataModel.d.ts` if `convex codegen` changes them.
- Modify: `packages/app/lib/subscription.tsx` — keep only pending plan in AsyncStorage and call Convex for claim/restore access checks.
- Modify: `packages/app/app/(app)/_layout.tsx` — enforce `user + active subscription` before rendering protected app routes.
- Modify: `packages/app/app/index.tsx` — route authenticated users by server entitlement state.
- Modify: `packages/app/app/(account)/_layout.tsx` — remove the unconditional authenticated redirect to `/home`; add button role.
- Modify: `packages/app/app/(account)/auth.tsx` — claim pending plans server-side and handle errors.
- Modify: `packages/app/app/(account)/email-otp.tsx` — add rejection-safe loading handling, stronger validation, labels.
- Modify: `packages/app/app/(app)/no-active-sub.tsx` — restore by checking server state; handle rejection; add button role.
- Modify: `packages/app/app/(app)/logging-out.tsx` — navigate after logout reset instead of leaving spinner forever.
- Modify: `packages/app/app/(app)/home.tsx` — stop sending `plan` and `trialStartedAt` to profile upsert.
- Modify: `packages/app/package.json` and `packages/core/package.json` — add package-level `typecheck` scripts.

## Task 1: Add server entitlement schema

**Files:**

- Modify: `packages/core/convex/schema.ts`

- [ ] **Step 1: Replace broad profile validators and add subscriptions table**

Use this shape in `packages/core/convex/schema.ts`:

```ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const productId = v.union(
  v.literal("yearly"),
  v.literal("monthly"),
  v.literal("family")
);

const profileFields = {
  authUserId: v.string(),
  name: v.optional(v.string()),
  gender: v.optional(v.union(v.literal("male"), v.literal("female"))),
  madhab: v.optional(
    v.union(
      v.literal("hanafi"),
      v.literal("shafii"),
      v.literal("maliki"),
      v.literal("hanbali"),
      v.literal("none")
    )
  ),
  consistency: v.optional(
    v.union(
      v.literal("never"),
      v.literal("sometimes"),
      v.literal("most"),
      v.literal("all")
    )
  ),
  struggle: v.optional(
    v.union(
      v.literal("phone"),
      v.literal("forgetting"),
      v.literal("fajr"),
      v.literal("khushu")
    )
  ),
  goal: v.optional(
    v.union(
      v.literal("all-five"),
      v.literal("khushu"),
      v.literal("phone-addiction"),
      v.literal("fajr")
    )
  ),
  calcMethod: v.optional(
    v.union(
      v.literal("isna"),
      v.literal("mwl"),
      v.literal("umm-al-qura"),
      v.literal("egyptian"),
      v.literal("karachi"),
      v.literal("custom")
    )
  ),
  strictness: v.optional(
    v.union(
      v.literal("adhan-iqama"),
      v.literal("full-window"),
      v.literal("custom")
    )
  ),
  locationGranted: v.optional(v.boolean()),
  notifGranted: v.optional(v.boolean()),
  prayersToLock: v.optional(
    v.object({
      fajr: v.boolean(),
      dhuhr: v.boolean(),
      asr: v.boolean(),
      maghrib: v.boolean(),
      isha: v.boolean(),
    })
  ),
  completedAt: v.optional(v.string()),
};

export default defineSchema({
  users: defineTable(profileFields).index("by_authUserId", ["authUserId"]),
  subscriptions: defineTable({
    authUserId: v.string(),
    productId,
    status: v.literal("active"),
    source: v.literal("mock"),
    claimedAt: v.string(),
    expiresAt: v.optional(v.string()),
  })
    .index("by_authUserId", ["authUserId"])
    .index("by_authUserId_status", ["authUserId", "status"]),
});
```

- [ ] **Step 2: Run formatter for this file**

Run: `bun x ultracite fix packages/core/convex/schema.ts`

Expected: formatting completes without errors.

- [ ] **Step 3: Commit schema change**

Run:

```bash
git add packages/core/convex/schema.ts
git commit -m "feat(core): add subscription entitlement schema"
```

## Task 2: Add Convex subscription functions

**Files:**

- Create: `packages/core/convex/subscriptions.ts`
- May modify after codegen: `packages/core/convex/_generated/api.d.ts`, `packages/core/convex/_generated/dataModel.d.ts`

- [ ] **Step 1: Create subscription API**

Create `packages/core/convex/subscriptions.ts`:

```ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth";

const productId = v.union(
  v.literal("yearly"),
  v.literal("monthly"),
  v.literal("family")
);

async function getActiveSubscription(ctx: Parameters<typeof query>[0], authUserId: string) {
  return await ctx.db
    .query("subscriptions")
    .withIndex("by_authUserId_status", (q) =>
      q.eq("authUserId", authUserId).eq("status", "active")
    )
    .first();
}

export const getMySubscription = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      return null;
    }
    return await getActiveSubscription(ctx, user._id);
  },
});

export const claimMockSubscription = mutation({
  args: { productId },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const existing = await getActiveSubscription(ctx, user._id);
    if (existing) {
      return existing;
    }

    const id = await ctx.db.insert("subscriptions", {
      authUserId: user._id,
      productId: args.productId,
      status: "active",
      source: "mock",
      claimedAt: new Date().toISOString(),
    });

    return await ctx.db.get(id);
  },
});
```

If TypeScript rejects `Parameters<typeof query>[0]`, replace the helper with duplicated query code in each handler to avoid over-typing Convex internals.

- [ ] **Step 2: Run Convex codegen**

Run: `bun --cwd packages/core convex codegen`

Expected: generated API/data model files include `subscriptions`.

- [ ] **Step 3: Run formatter for core subscription files**

Run: `bun x ultracite fix packages/core/convex/subscriptions.ts packages/core/convex/_generated/api.d.ts packages/core/convex/_generated/dataModel.d.ts`

Expected: formatting completes without errors.

- [ ] **Step 4: Commit subscription API and generated files**

Run:

```bash
git add packages/core/convex/subscriptions.ts packages/core/convex/_generated/api.d.ts packages/core/convex/_generated/dataModel.d.ts
git commit -m "feat(core): add mock subscription entitlement api"
```

## Task 3: Protect profile upsert from entitlement writes

**Files:**

- Modify: `packages/core/convex/users.ts`

- [ ] **Step 1: Replace `profileFields` with constrained non-entitlement fields**

In `packages/core/convex/users.ts`, remove `plan` and `trialStartedAt` from `profileFields` and use the same enum validators as the schema for user preferences.

The object should include only:

```ts
const profileFields = {
  name: v.optional(v.string()),
  gender: v.optional(v.union(v.literal("male"), v.literal("female"))),
  madhab: v.optional(
    v.union(
      v.literal("hanafi"),
      v.literal("shafii"),
      v.literal("maliki"),
      v.literal("hanbali"),
      v.literal("none")
    )
  ),
  consistency: v.optional(
    v.union(
      v.literal("never"),
      v.literal("sometimes"),
      v.literal("most"),
      v.literal("all")
    )
  ),
  struggle: v.optional(
    v.union(
      v.literal("phone"),
      v.literal("forgetting"),
      v.literal("fajr"),
      v.literal("khushu")
    )
  ),
  goal: v.optional(
    v.union(
      v.literal("all-five"),
      v.literal("khushu"),
      v.literal("phone-addiction"),
      v.literal("fajr")
    )
  ),
  calcMethod: v.optional(
    v.union(
      v.literal("isna"),
      v.literal("mwl"),
      v.literal("umm-al-qura"),
      v.literal("egyptian"),
      v.literal("karachi"),
      v.literal("custom")
    )
  ),
  strictness: v.optional(
    v.union(
      v.literal("adhan-iqama"),
      v.literal("full-window"),
      v.literal("custom")
    )
  ),
  locationGranted: v.optional(v.boolean()),
  notifGranted: v.optional(v.boolean()),
  prayersToLock: v.optional(
    v.object({
      fajr: v.boolean(),
      dhuhr: v.boolean(),
      asr: v.boolean(),
      maghrib: v.boolean(),
      isha: v.boolean(),
    })
  ),
  completedAt: v.optional(v.string()),
};
```

- [ ] **Step 2: Run formatter and commit**

Run:

```bash
bun x ultracite fix packages/core/convex/users.ts
git add packages/core/convex/users.ts
git commit -m "fix(core): reject client entitlement profile writes"
```

## Task 4: Refactor app subscription context to local pending only

**Files:**

- Modify: `packages/app/lib/subscription.tsx`

- [ ] **Step 1: Replace AsyncStorage entitlement map with pending state and Convex calls**

Rewrite the context around these public values:

```ts
interface Ctx {
  activeSubscription: ReturnType<typeof useQuery<typeof api.subscriptions.getMySubscription>>;
  claimPending(): Promise<"claimed" | "already-active" | "no-pending">;
  clearPending(): Promise<void>;
  hydrated: boolean;
  isSubscriptionLoading: boolean;
  pending: ProductId | null;
  purchasePending(productId: ProductId): Promise<void>;
  restore(): Promise<boolean>;
}
```

Implementation rules:

- Keep `STORAGE_KEY = "subscription-pending:v1"`.
- Local state is `{ pending: ProductId | null }`.
- `activeSubscription = useQuery(api.subscriptions.getMySubscription)`.
- `claimPending()` returns `"no-pending"` if no local pending plan exists.
- `claimPending()` calls `useMutation(api.subscriptions.claimMockSubscription)` with `{ productId: pending }`, clears pending, and returns `"claimed"`.
- If `activeSubscription` already exists and there is no pending plan, auth routing can treat it as active.
- `restore()` returns `Boolean(activeSubscription)`; it does not read local entitlement records.
- `clearPending()` removes the pending storage key only.

- [ ] **Step 2: Run formatter and commit**

Run:

```bash
bun x ultracite fix packages/app/lib/subscription.tsx
git add packages/app/lib/subscription.tsx
git commit -m "fix(app): store only pending subscription locally"
```

## Task 5: Enforce server entitlement in route guards

**Files:**

- Modify: `packages/app/app/(app)/_layout.tsx`
- Modify: `packages/app/app/index.tsx`
- Modify: `packages/app/app/(account)/_layout.tsx`

- [ ] **Step 1: Update protected app layout**

In `packages/app/app/(app)/_layout.tsx`, import `useSubscription` and require active entitlement:

```tsx
const { activeSubscription, isSubscriptionLoading } = useSubscription();

if (isLoading || isSubscriptionLoading) {
  return <AuthLoading />;
}
if (!user) {
  return <Redirect href={"/(onboarding)/welcome" as never} />;
}
if (!activeSubscription) {
  return <Redirect href="/no-active-sub" />;
}
```

- [ ] **Step 2: Format, typecheck target, and commit app layout**

Run:

```bash
bun x ultracite fix "packages/app/app/(app)/_layout.tsx"
git add "packages/app/app/(app)/_layout.tsx"
git commit -m "fix(app): require entitlement for app routes"
```

- [ ] **Step 3: Update root index routing**

In `packages/app/app/index.tsx`, import `useSubscription` and route as:

```tsx
const { activeSubscription, isSubscriptionLoading } = useSubscription();

if (isLoading || isSubscriptionLoading) {
  return <AuthLoading />;
}
if (!user) {
  return <Redirect href={"/(onboarding)/welcome" as never} />;
}
if (!activeSubscription) {
  return <Redirect href="/no-active-sub" />;
}
return <Redirect href="/home" />;
```

- [ ] **Step 4: Format and commit index route**

Run:

```bash
bun x ultracite fix packages/app/app/index.tsx
git add packages/app/app/index.tsx
git commit -m "fix(app): route index by active entitlement"
```

- [ ] **Step 5: Remove account layout auth redirect and add back-button role**

In `packages/app/app/(account)/_layout.tsx`:

- Remove `Redirect`, `AuthLoading`, and `useUser` imports.
- Remove the `isLoading` and `user` checks.
- Add `accessibilityRole="button"` to the back `Pressable`.

- [ ] **Step 6: Format and commit account layout**

Run:

```bash
bun x ultracite fix "packages/app/app/(account)/_layout.tsx"
git add "packages/app/app/(account)/_layout.tsx"
git commit -m "fix(app): allow auth screen to handle post-auth claims"
```

## Task 6: Update auth claim flow

**Files:**

- Modify: `packages/app/app/(account)/auth.tsx`

- [ ] **Step 1: Use server entitlement and pending claim result**

Change the subscription destructure to:

```ts
const {
  activeSubscription,
  claimPending,
  hydrated,
  isSubscriptionLoading,
  pending,
} = useSubscription();
```

Update the effect guard to wait for user, pending hydration, and server subscription query:

```ts
if (!(user && hydrated) || isSubscriptionLoading || handlingRef.current) {
  return;
}
```

Replace the async body with this routing logic:

```ts
try {
  const result = pending ? await claimPending() : "no-pending";
  const hasActiveSubscription = Boolean(activeSubscription) || result === "claimed";

  if (mode === "signup" && result === "claimed") {
    router.replace("/success" as never);
    return;
  }

  if (hasActiveSubscription) {
    if (!state.completedAt) {
      dispatch({ type: "COMPLETE" });
    }
    router.replace("/home");
    return;
  }

  router.replace("/no-active-sub" as never);
} catch {
  handlingRef.current = false;
  Alert.alert(
    "Could not verify subscription",
    "We could not finish checking your subscription. Please try again."
  );
}
```

Keep the dependency array aligned with values used by the effect.

- [ ] **Step 2: Add provider button accessibility labels**

On each provider `Pressable`, add:

```tsx
accessibilityLabel={
  p.id === "email" && mode === "signup" ? "Sign up with email" : p.label
}
accessibilityState={{ busy: loadingProvider === p.id, disabled: isOAuthLoading }}
```

On Terms and Privacy text links, add `accessibilityRole="link"` and explicit labels.

- [ ] **Step 3: Format and commit auth screen**

Run:

```bash
bun x ultracite fix "packages/app/app/(account)/auth.tsx"
git add "packages/app/app/(account)/auth.tsx"
git commit -m "fix(app): claim pending plans through server entitlement"
```

## Task 7: Harden email OTP UI

**Files:**

- Modify: `packages/app/app/(account)/email-otp.tsx`

- [ ] **Step 1: Add simple email and OTP validators**

Add near constants:

```ts
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OTP_PATTERN = /^\d{6}$/;
```

Use `EMAIL_PATTERN.test(trimmed)` instead of `includes("@")`.

Use `OTP_PATTERN.test(trimmedCode)` and show `"Enter the 6-digit code from your email."` for invalid codes.

- [ ] **Step 2: Wrap auth calls in try/catch/finally**

For `sendCode()`, use:

```ts
setIsLoading(true);
try {
  const { error } = await authClient.emailOtp.sendVerificationOtp({
    email: trimmed,
    type: "sign-in",
  });
  if (error) {
    Alert.alert("Could not send code", error.message ?? "Try again.");
    return;
  }
  setEmail(trimmed);
  setStep("code");
} catch {
  Alert.alert("Could not send code", "Check your connection and try again.");
} finally {
  setIsLoading(false);
}
```

For `verify()`, mirror the same pattern around `authClient.signIn.emailOtp` and keep the existing `router.replace` on success.

- [ ] **Step 3: Add accessibility labels**

Add to email input:

```tsx
accessibilityLabel="Email address"
accessibilityHint="Enter the email address for your Barakah account"
```

Add to OTP input:

```tsx
accessibilityLabel="Verification code"
accessibilityHint="Enter the 6-digit code sent to your email"
```

Add to CTA `Pressable`:

```tsx
accessibilityState={{ busy: isLoading, disabled: isLoading }}
```

- [ ] **Step 4: Format and commit OTP screen**

Run:

```bash
bun x ultracite fix "packages/app/app/(account)/email-otp.tsx"
git add "packages/app/app/(account)/email-otp.tsx"
git commit -m "fix(app): harden email otp failures"
```

## Task 8: Harden no-subscription and logout screens

**Files:**

- Modify: `packages/app/app/(app)/no-active-sub.tsx`
- Modify: `packages/app/app/(app)/logging-out.tsx`

- [ ] **Step 1: Update no-active-sub restore handling**

Change the subscription destructure to `const { restore } = useSubscription();` if unchanged, but make `onRestore()` rejection-safe:

```ts
setIsRestoring(true);
try {
  const ok = await restore();
  if (ok) {
    router.replace("/home");
    return;
  }
  Alert.alert(
    "Nothing to restore",
    "We could not find an active subscription for this account."
  );
} catch {
  Alert.alert(
    "Could not restore",
    "Check your connection and try again."
  );
} finally {
  setIsRestoring(false);
}
```

Add `accessibilityRole="button"` to the back icon `Pressable` and `accessibilityState={{ busy: isRestoring, disabled: isRestoring }}` to restore.

- [ ] **Step 2: Format and commit no-active-sub screen**

Run:

```bash
bun x ultracite fix "packages/app/app/(app)/no-active-sub.tsx"
git add "packages/app/app/(app)/no-active-sub.tsx"
git commit -m "fix(app): handle restore failures"
```

- [ ] **Step 3: Navigate after logout**

In `packages/app/app/(app)/logging-out.tsx`, import `useRouter` and call `router.replace("/(onboarding)/welcome" as never)` after `dispatch({ type: "RESET" })`.

Keep catch blocks, but do not leave the user on the loading screen forever.

- [ ] **Step 4: Format and commit logout screen**

Run:

```bash
bun x ultracite fix "packages/app/app/(app)/logging-out.tsx"
git add "packages/app/app/(app)/logging-out.tsx"
git commit -m "fix(app): leave logout loading screen"
```

## Task 9: Stop profile upload from writing plan fields

**Files:**

- Modify: `packages/app/app/(app)/home.tsx`

- [ ] **Step 1: Remove entitlement fields from upsertProfile call**

Delete these properties from the `upsertProfile({ ... })` call:

```ts
plan: state.plan,
trialStartedAt: state.trialStartedAt,
```

- [ ] **Step 2: Format and commit home screen**

Run:

```bash
bun x ultracite fix "packages/app/app/(app)/home.tsx"
git add "packages/app/app/(app)/home.tsx"
git commit -m "fix(app): keep profile sync separate from entitlement"
```

## Task 10: Add package typecheck scripts

**Files:**

- Modify: `packages/app/package.json`
- Modify: `packages/core/package.json`

- [ ] **Step 1: Add app typecheck script**

In `packages/app/package.json`, change scripts to:

```json
"scripts": {
  "start": "expo start",
  "lint": "expo lint",
  "typecheck": "tsc --noEmit"
}
```

- [ ] **Step 2: Format and commit app package script**

Run:

```bash
bun x ultracite fix packages/app/package.json
git add packages/app/package.json
git commit -m "chore(app): add typecheck script"
```

- [ ] **Step 3: Add core typecheck script**

In `packages/core/package.json`, change scripts to:

```json
"scripts": {
  "dev": "convex dev",
  "dev:setup": "convex dev --configure --until-success",
  "reset:db": "bun scripts/reset-db.ts",
  "typecheck": "tsc --noEmit"
}
```

- [ ] **Step 4: Format and commit core package script**

Run:

```bash
bun x ultracite fix packages/core/package.json
git add packages/core/package.json
git commit -m "chore(core): add typecheck script"
```

## Task 11: Verification and fix loop

**Files:**

- Modify only files directly related to errors reported by verification.

- [ ] **Step 1: Run full formatter**

Run: `bun x ultracite fix`

Expected: no errors. If files are modified, commit each modified file individually, for example `fix(app): format auth route guard` for app code or `fix(core): format subscription api` for core code.

- [ ] **Step 2: Run full typecheck**

Run: `bun turbo typecheck`

Expected: app and core typecheck tasks execute and pass. If a task still says zero tasks, inspect package scripts and Turbo configuration before continuing.

- [ ] **Step 3: Run test suite**

Run: `bun test`

Expected: existing tests pass.

- [ ] **Step 4: Run git status**

Run: `git status --short`

Expected: clean working tree after all per-file commits.

## Plan self-review

- Spec coverage: server schema/API, route guards, pending claim, profile separation, async error handling, accessibility, and typecheck scripts are covered by tasks above.
- Placeholder scan: no unfinished-marker instructions remain.
- Type consistency: subscription context names are consistently `activeSubscription`, `isSubscriptionLoading`, `pending`, `claimPending`, `purchasePending`, `restore`, and `clearPending`.
