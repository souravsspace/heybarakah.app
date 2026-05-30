# Code Review — 2026-05-30

Branch: `dev` (after fast-forward merge of `feat/official-expo-widgets`).
Method: 4 parallel `code-reviewer` subagents, scoped by domain. Each read real code and cited line numbers.

Scope:
1. **App frontend** — `packages/app` (routes, components, hooks, contexts, lib)
2. **Core backend** — `packages/core` (Convex functions, polar webhook, achievements, prayer logic)
3. **Native modules + widgets** — `modules/**`, `migration-staging/**`, `patches/**`
4. **Marketing / env / mails / build config**

Status legend: ✅ fixed this pass · ⏭️ deferred · ℹ️ info/no-action · ✔️ already fixed in code (reviewer used stale lines)

---

## Critical

| ID | Loc | Issue | Status |
|----|-----|-------|--------|
| P1-A | `app/lib/oauth/use-apple-auth.ts:27` | Apple sign-in called with no cryptographic `nonce` → replay risk on server token validation. | ⏭️ needs server-side nonce verification coordination |
| C1 | `modules/expo-app-blocker/ios/ExpoAppBlockerModule.swift:527` | `applyBlocks` mutates `ManagedSettingsStore.shield.*` off main thread. FamilyControls requires main-thread mutation → silent no-op / EXC_BAD_ACCESS. | ⏭️ Swift, needs device build to verify |
| C2 | `…ExpoAppBlockerModule.swift:312,326` | `isTemporarilyUnlocked`/`getRemainingUnlockTime` call `relockApps()` inline off `stateQueue` → data race on `currentBlockConfig` + store. | ⏭️ Swift, needs device build |

---

## High

| ID | Loc | Issue | Status |
|----|-----|-------|--------|
| A-H1 | `app/hooks/usePrayerShield.ts` + `lib/prayer-shield-notifications.ts` | 30s active-app interval unconditionally cancels+reschedules ALL shield notifications → wastes iOS 64-notif quota, dup/missing window. | ✅ guard with scheduleKey |
| A-H3 | `app/lib/subscription.tsx:142` | RC configure effect deps on `user` object (new ref every Convex poll) → re-runs `linkRevenueCatToUser`/`Purchases.logIn` on every heartbeat. | ✅ dep on `user?._id` |
| A-H2 | `app/lib/subscription.tsx:134` | `refresh()` after unmount, no `cancelled` check. | ✔️ code already has `if (cancelled) return` before refresh |
| C-H1 | `core/convex/lib/prayerTimes.ts:118` | `refreshPrayerTimes` action: auth checked AFTER cache miss but BEFORE fetch; unauth caller floods AlAdhan API w/ unique keys → 3rd-party cost amplification. | ✅ auth before fetch |
| C-H2 | `core/convex/lib/achievements.ts:287` | `markSeen` `codes: v.array(v.string())` unbounded → amplification. Legit max ≈ 34. | ✅ maxLength 100 |
| N-H1 | `modules/expo-app-blocker/plugin/src/index.js:571` | Global `IPHONEOS_DEPLOYMENT_TARGET` pbxproj regex clobbers widget extension's 17.0 → 16.0; widgets `@available(17/18)` → empty/crash slots on iOS16. | ✅ removed pbxproj global replace |
| N-H2 | `migration-staging/LockNowWidget/LockNowWidget.swift:5` | `LockNowControl()` not gated `if #available(iOS 18.0, *)` unlike active `@bittingz` bundle. | ✅ availability gate added |
| N-H3 | `…ExpoAppBlockerModule.swift:190` | `clearAllBlocks` fire-and-forget `Function` returns before async clear → TOCTOU stale read. | ⏭️ Swift |
| N-H4 | `…ExpoAppBlockerModule.swift:1091` | Picker result leaks undeclared `"description"` = `String(describing:)` dump of Apple system obj (future PII/format risk). | ✅ removed |
| M-1 | `core/convex/lib/marketing.ts:9` | `joinWaitlist` public action, no rate limit → Resend quota/billing abuse. | ⏭️ needs rate-limiter component |
| M-2 | `marketing/src/components/SuccessConfetti.tsx:18` | RAF loop, no `cancelAnimationFrame` cleanup → leak on unmount. | ✅ cleanup added |
| M-3 | `turbo.json:7` | marketing build outputs miss `.wrangler/**` → stale worker from cache. | ⏭️ per-pkg turbo.json |
| M-4 | `marketing` + `mails` `package.json` | no `typecheck` script → type errors invisible in CI. | ⏭️ |
| M-5 | `biome.jsonc:6` | whole `packages/marketing` excluded from lint → islands unanalyzed. | ⏭️ |

---

## Medium

| ID | Loc | Issue | Status |
|----|-----|-------|--------|
| A-M1 | `app/app/log-prayer.tsx:66` | Past-date log shows TODAY's prayer window text (wrong adhan for that date). | ⏭️ |
| A-M3 | `app/app/(app)/(tabs)/logging-out.tsx:12` | signOut→dispatch→router.replace IIFE, no unmount guard → `router.replace` on detached navigator can throw. | ⏭️ |
| A-M4 | `app/hooks/useWidgetSync.ts:70` | Timer ref clobbered between effect runs; old cleanup clears NEW timer → dropped snapshot write. | ⏭️ |
| C-M1 | `core/convex/lib/dhikr.ts:12` | `sumDhikrDaily` `.collect()` unbounded on aggregate-miss path. | ✅ `.take(50_000)` |
| C-M3 | `core/convex/lib/achievements.ts:266` | `listUnseen` `.collect()` no cap. | ✅ `.take(ACHIEVEMENTS.length+10)` |
| C-M4 | `core/convex/lib/achievements.ts:113` | `runEvaluate` userAchievements `.collect()` implicit-bounded only. | ✅ `.take(ACHIEVEMENTS.length+10)` |
| C-M2 | `core/convex/lib/prayerLogs.ts:201` | `getStreak` `.collect()` up to ~4000 rows/call. Bounded+intentional; follow-up: server-side streak counter. | ⏭️ documented |
| N-M3 | `…ExpoAppBlockerModule.swift:618` | Cross-midnight relock truncates to 23:59:59 → session ends 1–59 min early. | ⏭️ Swift |
| Mk-6 | `core/convex/lib/marketing.ts:31` | Resend `validation_error` returns `{ok:true}` → user sees success but email never saved. | ✅ return ok:false |
| Mk-7 | `marketing/src/lib/convex.ts:8` | `ConvexHttpClient` re-instantiated every submit. | ✅ hoisted to module scope |
| Mk-9 | `marketing/public/pricing.md` | hardcoded price, drifts from `app-config.ts`. | ⏭️ convert to generated route |
| Mk-8 | `marketing/wrangler.jsonc:12` | dead `SESSION` KV binding (unused). | ✅ removed |

---

## Low / Info

| ID | Loc | Issue | Status |
|----|-----|-------|--------|
| A-L5 | `app/app/(app)/(tabs)/locked.tsx:48` | `SHOW_UNLOCK_PREVIEW = NODE_ENV!=='production'` → DEV panel leaks into TestFlight. Use `__DEV__`. | ✅ |
| A-L1 | `app/app/(onboarding)/_layout.tsx:30` | Double-negative paywall redirect guard hard to audit. | ⏭️ |
| Mk-12 | `mails/emails/*.tsx` | brand `Img alt=""` → add `alt="Barakah App logo"`. | ✅ x3 |
| Mk-15 | `marketing/src/components/WaitlistForm.tsx:67` | `autoComplete="off"` blocks email autofill. | ✅ `email` |
| Mk-13 | `marketing/src/layouts/Layout.astro:151` | missing `twitter:site` meta. | ⏭️ |
| Mk-14 | `tsconfig.json:12` | `noUnusedLocals/Parameters` globally false. | ⏭️ |
| Mk-11 | `marketing/package.json:2` | unscoped name vs `@barakah/*`. | ⏭️ |
| C-L1 | `core/scripts/generate-apple-secret.ts:16` | `\r\n` not stripped (dev script). | ⏭️ |
| N-L3 | `expo-app-blocker/ios/ExpoAppBlockerConfig.swift:16` | silent `UserDefaults.standard` fallback for group id. | ⏭️ Swift |
| N-L4 | `expo-barakah-widgets/ios/Widgets/SalahArcWidget.swift:60` | hardcoded "· Mecca" misleading per-tz. | ⏭️ Swift |

---

## Positive

- Auth enforced consistently via `authComponent.safeGetAuthUser`; **no IDOR found** across `core/convex/lib`.
- Polar webhook: SDK `validateEvent` HMAC-SHA256 verify, 403/400 split, raw payload audit, 3-step email dedup idempotency.
- Prior fixes verified: RC entitlement scan `.take(20)`, mock-sub allowlist, shield DoS byte/count bounds, `reset-db` prod guard, auth FSM, date-key pad2, haptics `.catch`.
- Env split `EXPO_PUBLIC_`/`PUBLIC_` clean — no server secrets in client entrypoints.
- Migration plan vs code: App Group id, snapshot/dhikr keys, `barakah.lock-now` control kind all consistent across staged + active widgets.

---

## Notes on deferred items

Swift/native fixes (C1, C2, N-H3, N-M3, N-L3, N-L4) are real but **cannot be compiled/verified in this environment** — they need an iOS device build. Applied only mechanical, clearly-correct native changes (N-H1, N-H2, N-H4). The rest are documented here for the device-port phase of the expo-widgets migration.

P1-A (Apple nonce) and M-1 (waitlist rate-limit) require server-side coordination and a new dependency respectively — deferred with intent noted.

---

## Second pass — regression review of the fixes (same date)

After landing the fix commits, 2 parallel `code-reviewer` agents re-reviewed the diff `2445a45..HEAD` to verify each fix is correct/complete/no-regression. Result: 7 of 9 logic fixes ✅ clean; 2 follow-ups found and fixed:

| Finding | Loc | Action |
|---------|-----|--------|
| `markSeen` still had unbounded `.collect()` — same bug class the batch targeted | `core/convex/lib/achievements.ts:301` | ✅ → `.take(ACHIEVEMENTS.length+10)` |
| leftover `userId: user?._id` optional chain after the non-null auth guard | `core/convex/lib/prayerTimes.ts:168` | ✅ → `user._id` |
| hoisted Convex client safe on Cloudflare but undocumented (revert risk) | `marketing/src/lib/convex.ts:7` | ✅ added intent comment |

Verified equivalences / non-regressions:
- `subscription.tsx` `userId` stabilization — logout (`user→null→userId undefined`) still triggers anonymous reconfigure; no stale `user` left in the effect/callbacks.
- `_layout.tsx` guard rewrite — De Morgan-confirmed identical to original.
- `usePrayerShield` schedule-key — date rollover still reschedules (times change → key changes); deterministic stringify.
- `useWidgetSync` / `logging-out` — cleanup ordering correct, no dropped writes / no nav-after-unmount.
- plugin deployment-target replacer arithmetic — correct for all real iOS version strings (raises <16.0, preserves 16.4/17/18).
- `LockNowWidget.swift` SourceKit errors (`@main`, `LockNowControl not in scope`) confirmed **environmental** — staged file not yet in a compiled target; not caused by the edit.

### Final verification
- `bun turbo typecheck` → **4 packages pass** (core, mails, app, expo-app-blocker). env/marketing have no typecheck task.
- Changed-file lint clean (4 remaining biome errors are in pre-existing untouched files: `testimonial.tsx`, `with-app-groups.js`).
- 25 commits landed, per-file, conventional format.

### Reverted (would have broken the gate)
- `astro check` typecheck script on marketing (needs uninstalled `@astrojs/check`) and `tsc --noEmit` on env (standalone tsconfig lacks node/vite types). Both reverted; proper setup deferred. mails typecheck kept (passes clean).

### Branch housekeeping
- `feat/official-expo-widgets` fast-forward merged into `dev`, then deleted local + remote. Draft PR #4 (feat→dev) auto-closed; its content is fully in `dev`.
