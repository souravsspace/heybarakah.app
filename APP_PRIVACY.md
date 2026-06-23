# App Privacy answer sheet — App Store Connect

Fill **App Store Connect → App Privacy** using this. Derived from the code:
PostHog (analytics + crash) identifies with email + name, autocapture on, session
replay off; RevenueCat (purchases); expo-location (prayer times); Resend (auth
email); Better Auth (account).

## Top-level question
**Do you collect data from this app?** → **Yes**

## "Used to track you?" (App Tracking Transparency)
**No tracking.** No IDFA, no ad SDKs, no data brokers, no cross-app/cross-site
tracking. PostHog distinct id = the app's own user id, not a device ad id, and
session replay is disabled. → No ATT prompt required, and **no** data type is
marked "Used to Track You".

---

## Data types to declare

For each: **Linked to the user = Yes** (the analytics SDK identifies the signed-in
user), unless noted. None used for tracking.

| Apple data type | Collected | Purpose | Linked | Source |
|-----------------|-----------|---------|--------|--------|
| **Email Address** | Yes | App Functionality, Analytics | Yes | account + PostHog identify (`user-context.tsx:89`) |
| **Name** | Yes | App Functionality, Analytics | Yes | account + PostHog identify (`user-context.tsx:90`) |
| **Precise Location** | Yes | App Functionality | Yes | `expo-location`; coords stored server-side (`use-locations.ts:205`) |
| **Purchase History** | Yes | App Functionality, Analytics | Yes | RevenueCat IAP |
| **Product Interaction** (Usage Data) | Yes | Analytics | Yes | PostHog autocapture taps/screens (`_layout.tsx:92`) |
| **Other Usage Data** (app lifecycle) | Yes | Analytics | Yes | `captureAppLifecycleEvents` (`analytics.ts:22`) |
| **Crash Data** (Diagnostics) | Yes | App Functionality, Analytics | Yes | PostHog `captureException` (`analytics.ts:70`) |
| **User ID** | Yes | App Functionality, Analytics | Yes | Better Auth user id = PostHog distinct id |

## Notes per purpose
- **App Functionality** — sign-in, prayer-time calc, subscription gating, account.
- **Analytics** — PostHog product analytics + crash/error monitoring.
- **Not** used for: Third-Party Advertising, Developer's Advertising, Tracking.

## Privacy policy
- Privacy policy URL must be set (App Information). Linked in-app from the paywall
  (`plans.tsx:316`) and subscription screen.

## Sanity check before saving
- [ ] No data type marked "Used to Track You"
- [ ] Email, Name, Location, Purchases, Usage, Crash, User ID all declared
- [ ] Privacy policy URL present and reachable
