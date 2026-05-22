# Testing

Two flows to verify in this branch:

1. **ShieldAction banner** — carry-over from prior session; not yet validated on device.
2. **RevenueCat sandbox subscription** — net-new in this branch.

---

## A. ShieldAction banner (carry-over)

### Rebuild

```bash
cd packages/app
bun expo prebuild --clean
open ios/Barakah.xcworkspace
```

Xcode → select device → **Cmd+R**.

### Steps

1. Activate the shield → open a blocked app.
2. Tap **Open Barakah**.
3. Expect:
   - Shield dismisses briefly.
   - Banner appears at the top of the screen.
   - Tap the banner → Barakah opens at `/unlock`.

### Console verification

Open Console.app, attach to the device, filter `ShieldAction`. Expect four log lines:

- `[ShieldAction] primaryButtonPressed`
- `[ShieldAction] notif authStatus=2 alert=2 timeSensitive=2`
- `[ShieldAction] notif add ok id=expo.appblocker.pendingUnlock`
- `[ShieldAction] schedulePendingUnlockNotification didSchedule`

### If the banner does not show

iPhone → **Settings → Barakah → Notifications → Time Sensitive: ON**, then repeat.

Report any deviation from the four log lines above, plus what actually happened on screen.

---

## B. RevenueCat sandbox (iOS only — Android deferred)

> Order matters. App Store Connect must be configured **before** RevenueCat. RC reads product metadata from App Store Connect; missing/misnamed products surface as empty offerings in the app.

### B.1 — Apple Developer + App Store Connect prereqs (one-time, do FIRST)

1. **Paid Apple Developer Program** membership active for the team that owns the bundle ID.
2. **Bundle ID registered** in Apple Developer → Identifiers (must match `packages/app/app.json` → `ios.bundleIdentifier`).
3. **App record exists** in App Store Connect → My Apps → Barakah (same bundle ID).
4. **Agreements, Tax, and Banking → Paid Apps agreement** must be in **Active** status. RC will not return offerings if the Paid Apps contract is not signed.
5. **Sandbox tester:** Users and Access → **Sandbox** → **Testers** → create a tester email + password. Region matches the storefront you want to test.
6. On the iPhone: **Settings → App Store → Sandbox Account** → sign in with the sandbox tester. Do **not** sign out of your real Apple ID anywhere else on the device.
7. **In-App Purchases:** App Store Connect → Apps → Barakah → **Monetization → Subscriptions** → create a subscription group (e.g. `barakah_premium`) and inside it create:
   | Type | Product ID | Notes |
   |---|---|---|
   | Auto-renewable subscription | `barakah_yearly` | 1-year, 7-day introductory free trial |
   | Auto-renewable subscription | `barakah_monthly` | 1-month |
   | Auto-renewable subscription | `barakah_family` | 1-year, Family Sharing enabled |
8. Each product: set price, localization (display name + description), and review screenshot. Status must reach **Ready to Submit**. Sandbox does not require Apple review, but the product cannot be in "Missing Metadata".
9. **App-Specific Shared Secret:** App Store Connect → Apps → Barakah → **App Information → App-Specific Shared Secret** → generate. Copy — you will paste into RC in B.2.

### B.2 — RevenueCat dashboard setup (one-time)

1. RevenueCat → **Project → + New app → Apple App Store**. Set bundle ID to match step B.1.2. Paste the **App-Specific Shared Secret** from B.1.9.
2. **Entitlements** → create entitlement `premium`.
3. **Products** → add the three product identifiers from B.1.7 (`barakah_yearly`, `barakah_monthly`, `barakah_family`). Each must attach to entitlement `premium`.
4. **Offerings** → create offering named `default`. Add three packages mapped to the products above. Mark `default` as the **current** offering.
5. Copy the iOS **sandbox public API key** (starts with `appl_`). Project Settings → API keys → **Apple App Store**.

### B.3 — Environment

Edit `packages/app/.env`:

```
EXPO_PUBLIC_REVENUECAT_IOS_API_KEY=appl_xxxxxxxxxxxxxxxxxxxxxxxxx
# Android setup deferred — do not set yet.
# EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY=
```

If the iOS key is missing, the app falls back to a dev-only mock subscription path so onboarding still completes (see B.10).

### B.4 — Build and run

```bash
cd packages/app
bun install
bun expo prebuild --clean
open ios/Barakah.xcworkspace
```

Xcode → select device → **Cmd+R**.

### B.5 — Purchase flow

1. Launch the app on a fresh install.
2. Walk through onboarding to `/paywall/plans`.
3. Select **Yearly** → tap the CTA.
4. Continue to signup → sign in with Apple / Google.
5. Expect: a StoreKit sandbox sheet appears.
6. Confirm the purchase with the sandbox tester.
7. Expect routing to `/success`.

### B.6 — Verification

- **Convex dashboard → `subscriptions` table**: a row exists with `authUserId = <your user>`, `source = "revenuecat"`, `productId = "yearly"`, `status = "active"`, and the `rcProductIdentifier = "barakah_yearly"`.
- **Profile tab**: the header card shows the **Premium** crown badge; the Account → Subscription row shows `Premium`.
- **Subscription settings** (Profile → Subscription): the plan card reads **Yearly**.

### B.7 — Restore

1. Delete the app from the device.
2. Reinstall via Xcode → sign in with the same account (do not repurchase).
3. Expect routing to `/no-active-sub` (the Convex query has not yet been refreshed by the RC sync).
4. Tap **Restore** on the `/no-active-sub` screen.
5. Expect: a transient sandbox sheet (or no sheet), the entitlement returns, and the app routes to `/home`.

### B.8 — Manage

1. Profile → Subscription → **Manage subscription**.
2. Expect: the iOS subscription management page opens in the App Store app.

### B.9 — Cancelled purchase

1. Repeat B.5 but **Cancel** the sandbox sheet at step 6.
2. Expect: the app routes to `/no-active-sub` without an error alert; no row is written to Convex.

### B.10 — Dev fallback (only when iOS key is blank)

1. Leave `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY` empty.
2. Run the purchase flow.
3. Expect: no StoreKit sheet; the app silently writes a mock `source = "mock"` row via `claimMockSubscription` and routes to `/success`.
4. This path throws in production (Convex env guard).

### B.11 — Polar (web) parity

- The polar webhook route at `POST /api/webhooks/polar` is unchanged.
- Lifetime subscriptions are owned exclusively by polar (web).
- The RC sync mutation explicitly skips any active row whose `source = "polar"`, so a user who purchased lifetime on the web will not be downgraded by a mobile RC event.
- To verify in Convex dashboard: insert a fake polar row manually, then trigger an RC sync (e.g. cancel mobile sub). The polar row should remain untouched.

---

## Reporting

For any failure, please share:

- The exact screen the app was on.
- The Convex `subscriptions` table content (screenshot or row dump).
- The last 20 lines of Console.app filtered for `Purchases` or `ShieldAction`.
