# Code Review — 2026-06-13

Full-codebase bug/issue review. 5 sonnet `code-reviewer` agents, zero coverage gaps:
api · app (JS + native) · core · env · mails · marketing · `expo-app-blocker` (src/plugin/ios/android/targets) · scripts · root config.

**Found:** 5 CRITICAL · 14 HIGH · 18 MEDIUM · ~15 LOW.
**Fixed:** 31 per-file commits on `dev`. typecheck 6/6 green · 199 api tests + core tests green.

> ⚠️ Native fixes (C3, C4, H8, H10, M10/M11, M15) compile-clean but **need a device build to verify** — Swift/Kotlin not runnable in review env.

---

## FIXED

### Critical
| # | File | Fix |
|---|------|-----|
| C1 | `app/(app)/(tabs)/profile.tsx` | await/catch `runDelete()` so account-delete errors surface |
| C2 | `core/subscriptions/index.ts` + `api/.../subscriptions.service.ts` | preserve original `activatedAt` across RC re-sync (new `existingActivatedAt` param) |
| C3 | `expo-app-blocker/ios/ExpoAppBlockerModule.swift` | route all `ManagedSettingsStore.shield` writes through main thread |
| C4 | `expo-app-blocker/android/.../OverlayManager.kt` | guard `show()` with `Settings.canDrawOverlays` (was SecurityException flood/500ms) |
| C5 | `expo-app-blocker/plugin/src/index.js` | merge `application-groups` instead of overwrite (was dropping widgets group) |

### High
| # | File | Fix |
|---|------|-----|
| H1/H2 | `home.tsx`, `hooks/usePrayerShield.ts` | midnight-safe `today` via new `hooks/use-today-key.ts` |
| H3 | `hooks/useWidgetSync.ts` | streak query key reactive to today; derive tomorrow from today |
| H4 | `app/(onboarding)/_layout.tsx` | remove dead `gestureToWelcome` state |
| H6 | `core/achievements/calendar.ts` | extend Ramadan + sacred-month ranges through 2040 (was cliff at 2029) |
| H7 | `api/.../subscriptions.service.ts` | replace `as never` with `PRODUCT_IDS` guard |
| H8 | `expo-app-blocker/ios/ExpoAppBlockerModule.swift` | cross-midnight unlock relocks at real expiry, not 23:59:59 |
| H10 | `expo-app-blocker/ios/ExpoAppBlockerModule.swift` | lock-guard `ensureLoadedPersistedConfig` |
| H12 | `api/scripts/reset-db.ts` | write statements to `.sql` file + `--file` (was: only first statement ran) |
| H13 | `api/scripts/backfill/transform.ts` | `INSERT OR IGNORE` for safe partial re-runs |
| H14 | `expo-app-blocker/plugin/src/index.js` | merge `BGTaskSchedulerPermittedIdentifiers` instead of overwrite |

### Medium
| # | File | Fix |
|---|------|-----|
| M1 | `api/.../subscriptions.service.ts` | `linked` based on `.returning()` row count, not pre-read |
| M2 | `api/.../prayer-logs.service.ts` | cap client `today` in `getStreak` (prevents full-table scan) |
| M3 | `api/.../prayer-times.service.ts` | purge expired caches in capped batches (D1 10MB cap) |
| M4 | `home.tsx` | resync `useCountdown` `now` on target change |
| M5 | `app/(app)/prayer-logged.tsx` | guard `dismissAll` with `canDismiss` |
| M6 | `app/(account)/auth.tsx` | hoist `SYNC_WAIT_MS` to module scope |
| M7 | `core/prayer/log-status.test.ts` | add non-UTC midnight qada boundary tests (behavior was correct) |
| M8 | `core/subscriptions/index.ts`, `api/db/schema.ts` | drop unused `past_due` status |
| M9 | `core/users/validators.ts` | validate `completedAt` is a real date |
| M10/M11 | `expo-app-blocker/ios/ExpoAppBlockerModule.swift` | log previously-swallowed `applyBlocks` errors |
| M12 | `app/widgets/lock-activity.tsx` | reject invalid ISO before native (NaN epoch) |
| M13 | `app/plugins/with-app-groups.js` | discover widget entitlements dynamically (was hardcoded path) |
| M14 | `marketing/src/components/Faq.tsx` | add `aria-controls` linking button → panel |
| M15 | `expo-app-blocker/android/.../AppBlockerService.kt` | widen foreground lookback to 30s |
| M16 | `expo-app-blocker/src/index.ts` | type pending-unlock listener instead of `as any` |
| M17 | `expo-app-blocker/plugin/src/index.js` | validate hex color + expand shorthand |

---

## NOT FIXED

### Deferred with rationale
| # | Issue | Why not |
|---|-------|---------|
| H5 | rate-limit KV TOCTOU (`api/middlewares/rate-limit.ts`) | KV has no CAS; needs Durable Object counter or CF Rate-Limiting binding — infra decision. Known-deferred since 2026-06-09. |
| H9 | `isProcessingUnlockState` data race | False positive — `checkAndApplyUnlockState` is always dispatched on `stateQueue` (serialized). |
| H11 | `APP_GROUP_PLACEHOLDER` in target templates | Build hygiene only; EAS always runs prebuild (substitution). Adding `#error` risks breaking template-as-source. |
| M18 | plugin substitution at config-eval time | Moving into `withDangerousMod` is a behavior-changing refactor; risk > benefit this pass. |

### LOW (~15) — deferred, in agent transcripts
`exp://**` trust scope · avatar chunked-upload bypass · user-locations non-atomic ownership · mock-sub env guard · double `COMPLETE` dispatch · home profile-upsert wide deps · OTP `formatCode` spacing · `build-device.sh` grep filter · dead `fetchAlAdhanTimingsByCoordinates` · biome excludes `modules/` · turbo missing CF env vars · `generate-apple-secret.ts` logs JWT · AppDelegate `RCTLinkingManager` double-dispatch · widget key dedup.

---

## Verification status
- `bun turbo typecheck` — 6/6 packages green
- `bun run test` (api, vitest workers) — 199 passed
- `bun test` (core) — subscriptions, achievements, prayer/log-status green
- **Native** — NOT verified; requires device build (iOS shield threading, Android overlay).

## Next
1. Device build → verify native (C3, C4, H8, H10, M10/M11, M15).
2. H5 infra decision (Durable Object vs CF Rate-Limiting binding).
3. Optional: LOW batch.
