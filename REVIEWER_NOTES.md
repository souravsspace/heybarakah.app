# App Review Notes — paste into App Store Connect

Copy the block below into **App Review Information → Notes**. Fill the two
placeholders with the values you set as `REVIEW_OTP_EMAIL` / `REVIEW_OTP_CODE`.

---

```
SIGN-IN (required)
This app uses passwordless sign-in (email one-time code, plus Apple and Google).
For review, use the email option with the demo account below — it accepts a fixed
code and sends no email.

  Email:  <REVIEW_OTP_EMAIL>      e.g. appreview@heybarakah.app
  Code:   <REVIEW_OTP_CODE>       e.g. 424242

Steps: tap "Continue with email" → enter the email above → enter the code above.
"Sign in with Apple" and "Continue with Google" also work, but please use email.

PREMIUM ACCESS
The demo account has Premium granted, so the paywall is bypassed and the full
core feature is testable.

CORE FEATURE — prayer-window app lock
Barakah blocks distracting apps during the five daily Islamic prayer windows
(fajr through isha) using Apple Family Controls (DeviceActivity + ManagedSettings).

To test:
1. On first launch, grant the Screen Time / Family Controls permission when asked.
2. Choose which apps to block.
3. The lock (shield) activates during a prayer window and clears once the prayer
   is logged. To see it immediately without waiting for a real prayer time, use
   the dev toggle on the locked screen (or set a prayer time near the current
   clock in settings).

WHY FAMILY CONTROLS
The com.apple.developer.family-controls entitlement is used only to let the user
voluntarily block their own distracting apps during their own prayer times. No
parental-control or third-party monitoring; the user opts in and selects the apps.

LOCATION
Used only to calculate accurate prayer times for the user's city (when-in-use).

ACCOUNT DELETION
Settings tab → Profile → Delete Account (confirmation dialog, removes account
and data in-app).

RESTORE PURCHASES
Paywall → "Restore purchases". Subscriptions are Apple IAP via RevenueCat.

SUPPORT
support@heybarakah.app
```

---

## After approval
Disable the static demo code:

```bash
cd packages/api
bunx wrangler secret delete REVIEW_OTP_EMAIL
bunx wrangler secret delete REVIEW_OTP_CODE
```
