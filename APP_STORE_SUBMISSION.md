# App Store Submission — Barakah (A–Z)

Step-by-step to submit **Prayer Lock: Barakah** to App Review.

App is **email OTP + Apple OAuth + Google OAuth** — there is **no password**. Apple
reviewers cannot read our OTP inbox or use our Apple/Google accounts, so reviews
fail with "couldn't sign in" unless we hand them a **static-OTP demo account**.

---

## 0. Prereqs

- Version synced in both files (currently `1.0.2`):
  - `packages/app/package.json` → `version`
  - `packages/app/app.json` → `expo.version`
- Build uploaded to App Store Connect (currently build 20, 1.0.2).
- Know which backend env the release build points at (prod vs dev). The demo
  account only works against the env that has the static-OTP code deployed.

---

## 1. Static-OTP demo account (backend)

Implemented in `packages/api/src/auth/index.ts` + `packages/api/src/env.ts`.

When `REVIEW_OTP_EMAIL` and `REVIEW_OTP_CODE` are both set, that exact email signs
in with the fixed code and **no email is sent**. Everyone else gets a random OTP.

Set the secrets on the release env:

```bash
cd packages/api
bunx wrangler secret put REVIEW_OTP_EMAIL   # e.g. appreview@heybarakah.app
bunx wrangler secret put REVIEW_OTP_CODE    # e.g. 424242
# add --env <name> if the release build targets a named env
```

Deploy:

```bash
cd packages/api
bun run deploy   # add --env <name> for the release env
```

**Security:** this is an auth bypass for one throwaway account. It holds no real
user data. **Unset both secrets after the app is approved** to disable the static
code:

```bash
bunx wrangler secret delete REVIEW_OTP_EMAIL
bunx wrangler secret delete REVIEW_OTP_CODE
```

---

## 2. Grant Premium to the demo account

Core feature (prayer-window app lock) is behind the paywall. Reviewer must reach it.

1. Sign into the app once as `appreview@heybarakah.app`, code `424242` — creates
   the user + RevenueCat customer (app user id = Better Auth user id).
2. RevenueCat dashboard → **Customers** → find that app user id → **Grant
   promotional entitlement** → `Barakah Premium` → lifetime.
3. App reflects premium on next `/me/subscription` fetch → paywall gone.

---

## 3. Screenshots (required — currently 0/10)

Min 1 (first 3 show on the install sheet) for **6.5" iPhone**:
`1242×2688` or `1284×2778`. Simulator: iPhone 14 Plus / 15 Plus.

Shoot, in order of impact:
1. Home — prayer times
2. Locked shield (app blocked during prayer window)
3. Log prayer
4. Dhikr counter
5. Paywall

---

## 4. App Review Information section

- ✅ **Sign-in required**
- **User name:** `appreview@heybarakah.app`
- **Password:** `424242` (the static OTP — only credential)
- **Contact info:** real name / phone / email
- **Notes:**

> Sign-in: tap "Continue with email", enter `appreview@heybarakah.app`, then code
> `424242` (static review code — no email is sent). Apple/Google sign-in also work
> but use email for review.
>
> This account has Premium granted, so the paywall is bypassed.
>
> Core feature: Barakah blocks distracting apps during the five daily Islamic
> prayer windows (fajr–isha) using Apple Family Controls (DeviceActivity +
> ManagedSettings). On first launch grant the Screen Time permission, then choose
> apps to block. To see the lock immediately without waiting for a real prayer
> time, use the dev toggle on the locked screen / set a prayer time near the
> current clock in settings. The shield clears once the user logs the prayer.
>
> Account deletion: Settings → Account → Delete account.

(Adjust the dev-toggle wording to match the shipped build.)

---

## 5. Other required sections (left nav)

- **App Privacy** — declare data collected: email (account), location (prayer
  calc), purchases, analytics (PostHog). Must not be blank.
- **Age rating** — set in App Information.
- **Account deletion** — Guideline 5.1.1(v). Confirm Settings → Account → Delete
  account works in the uploaded build.
- **Export compliance** — already handled: `ITSAppUsesNonExemptEncryption: false`
  in `app.json`, so no submit-time prompt.

---

## 6. Submit

1. Confirm build 20 (1.0.2) attached.
2. Release option: **Manually release this version** (recommended for v1 — verify
   the approved build before going public).
3. `Save` → `Add for Review` → answer IDFA/compliance prompts → `Submit`.

---

## 7. Top rejection risks

| Risk | Pre-empt |
|------|----------|
| Reviewer can't sign in | static OTP + notes (steps 1, 4) |
| Can't reach core feature | premium granted (step 2) |
| Family Controls entitlement justification | notes explain user-initiated app blocking for salah |
| Demo works against wrong env | deploy secrets to the release env (step 1) |
| Account deletion missing | confirm flow (step 5) |
| Screenshots not real app UI | shoot from the real build (step 3) |

---

## 8. Post-approval

- Unset `REVIEW_OTP_EMAIL` / `REVIEW_OTP_CODE` (step 1).
- If "Manually release" was chosen, release from App Store Connect when ready.
