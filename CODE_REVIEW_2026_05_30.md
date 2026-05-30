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

---

## Pass 3 — 20-agent full-codebase sweep (2026-05-30)

20 `code-reviewer` agents launched in parallel, one per non-overlapping slice (full A-Z). **14 returned; 6 hit the model session cap** and produced nothing — those slices NOT covered this pass: `components n-z`, `app/lib`, `app/plugins+config`, `convex/lib domain-data` (prayerLogs/prayerTimes/dhikr/achievements/shieldSelection/userLocations/schema/http), `core/src`, `widgets Activity/Config/Shared/staging`, `root config/turbo/biome/patches`. Re-run after cap reset (4:40pm) for full coverage.

Status: ✅ fixed this pass · ⏭️ deferred · ⚠️ judgment-call (needs product/device decision)

### Critical / High — backend
| ID | Loc | Issue | Status |
|----|-----|-------|--------|
| P3-S1 | `core/src/subscriptions` `shouldSkipRcSync` | agent flagged missing `"mock"` — but `sync-revenuecat.test.ts:29` asserts `mock → false`. Mock subs intentionally RC-overwritable. | ⚠️ by design, no change |
| P3-S2 | `core/convex/lib/subscriptions.ts:161` | entitlement with no `expires_date` → `POSITIVE_INFINITY` → perpetual active | ⚠️ app sells **lifetime** purchase; no-expiry likely intended — needs confirm before change |
| P3-S3 | `core/convex/lib/subscriptions.ts:196` | `syncRevenueCatEntitlement` accepts client args then discards them (`_args`) — forgeable-looking dead surface | ⏭️ cleanup |
| P3-S4 | `core/convex/lib/marketing.ts:9` | `joinWaitlist` public, no rate limit (re-confirmed) | ⏭️ needs rate-limiter |
| P3-S5 | `core/convex/lib/auth.ts:33` | `exp://**` wildcard in `trustedOrigins` — verify lib treats as glob not literal | ⏭️ verify |

### High — app frontend
| ID | Loc | Issue | Status |
|----|-----|-------|--------|
| P3-A1 | `app/(account)/email-otp.tsx:46` | agent: OTP type by mode — but better-auth union is `sign-in/email-verification/forget-password/change-email` (no `sign-up`); `sign-in` auto-creates on verify. | ⚠️ not a bug |
| P3-A2 | `app/(app)/(tabs)/locked.tsx:251` | `toggleAndroid` reads `snapshot` set inside `setState` updater → native gets `[]` on first toggle | ✅ compute outside setState |
| P3-A3 | `app/(app)/(tabs)/dhikr-record.tsx:83` | `ROMAN[i]` OOB if PRESETS grows >4 → undefined | ✅ `?? fallback` |
| P3-A4 | `app/(onboarding)/calculating.tsx:31` | auto-advance timer fires after unmount/back → bad nav | ✅ mounted ref |
| P3-A5 | `app/(onboarding)/permissions.tsx:36` | no try-catch → unexpected throw leaves `busy=true` forever (button dead) | ✅ try/catch/finally |
| P3-A6 | `hooks/usePrayerTimes.ts:~408` | `setRefreshing(false)` in `.finally` fires after unmount | ✅ `if(!cancelled)` |
| P3-A7 | `hooks/useWidgetSync.ts:114` | dhikr drain loop awaits `ackPendingDhikr` without re-checking `cancelled` mid-loop | ✅ recheck |
| P3-A8 | `contexts/dhikr-context.tsx:113` | `AsyncStorage.setItem` inside `setTotals` updater (impure, double-fires in strict mode) | ✅ move to useEffect |
| P3-A9 | `contexts/dhikr-context.tsx:146` | `increment` reads stale `active` via closure → one over-increment window on dhikr switch | ✅ activeRef |
| P3-A10 | `components/achievement-popup-provider.tsx:36` | stale `active` read inside `setQueue` updater → new achievement silently dropped | ✅ capture activeCode |
| P3-A11 | `components/achievement-dialog.tsx:232` | swipe-dismiss double-fires `onClose` (double markSeen) | ⏭️ Reanimated worklet — verify on device |

### Medium — app
| ID | Loc | Issue | Status |
|----|-----|-------|--------|
| P3-A12 | `app/(app)/(tabs)/home.tsx:222` | `today=dateKey()` never refreshes across midnight → wrong week/log date | ⏭️ |
| P3-A13 | `app/(app)/(tabs)/profile.tsx:226` | `METHOD_LABEL[k]` undefined for unknown method (initials already safe via `.filter(Boolean)`) | ✅ method fallback |
| P3-A14 | `app/(app)/(tabs)/locked.tsx:107` | `getBlockConfiguration()` overwrites items while picker open | ⏭️ |
| P3-A15 | `app/(account)/no-active-sub.tsx:23` | `router.replace` runs even if `signOut` fails → nav loop | ⏭️ |
| P3-A16 | `hooks/usePrayerTimes.ts:152`, `use-locations.ts:81` | `.then()` without `.catch()` on storage read | ✅ add catch |
| P3-A17 | `hooks/useLockActivityScheduler.ts` | `inFlight.current` ref leak on interval restart | ⏭️ |
| P3-A18 | `constants/notification-copy.ts:89` | `dateSeed` unpadded month/day → cross-platform seed mismatch | ✅ pad |
| P3-A19 | `constants/theme.ts` | Expo-scaffold `Colors`/`Fonts` (blue `#0a7ea4`) still live via use-theme-color/collapsible | ⏭️ brand-color cleanup |
| P3-A20 | `app/(onboarding)/_layout.tsx:30` | agent suggests `user && activeSubscription` (drops `!isPaywallRoute` arm) | ⚠️ semantic change vs my De Morgan rewrite — product decision |

### Marketing / env / mails
| ID | Loc | Issue | Status |
|----|-----|-------|--------|
| P3-M1 | `marketing/src/layouts/Layout.astro` | `set:html={JSON.stringify(...)}` doesn't escape `</script>` (latent XSS if data ever dynamic) | ✅ escape |
| P3-M2 | `marketing/src/components/SuccessConfetti.tsx` | missing `confetti.reset()` → canvas stays in DOM after unmount | ✅ |
| P3-M3 | `marketing/src/components/WaitlistForm.tsx:19` | email not trimmed before validate/submit → valid address rejected | ✅ trim |
| P3-M4 | `marketing/src/layouts/LegalLayout.astro:127` | hardcoded `hello@heybarakah.app` vs `appConfig.contact.email` | ✅ |
| P3-M5 | `env/src/app.ts`, `marketing.ts` | no `server:{}` block → t3-env cross-contamination check inactive | ✅ add server:{} |
| P3-M6 | `env/src/app.ts:13` | RC keys `optional()` → silent missing key breaks IAP with no startup error | ⏭️ schema/refine |
| P3-M7 | `mails/emails/verify-otp.tsx:47` | `formatCode` no numeric/length guard | ⏭️ |
| P3-M8 | `mails/*` purchase `name` not length-capped; `<td>` instead of `<Column>`; SVG logo blocked in Outlook | ⏭️ |
| P3-M9 | `marketing/wrangler.jsonc` | `SESSION` KV binding unused | ⏭️ (Astro Cloudflare session may auto-require it — verify before removing) |
| P3-M10 | `marketing/src/lib/convex.ts`, `env` | no Worker-startup validation of `PUBLIC_CONVEX_URL` (silent undefined) | ⏭️ |

### Native iOS Swift — ALL deferred (need device build; not verifiable headless)
`expo-app-blocker` core (agent 16) graded **4/10** on concurrency: confirmed C1/C2 + found C4 (`clearAllBlocks` fire-and-forget), C5 (`ensureLoadedPersistedConfig` off-main), H2/H4 (interleaved main/stateQueue store writes), H3 cross-midnight truncation, H5 (sync Functions read `currentBlockConfig` unserialized), M3 App-Group key read/write store split, L3 deprecated `synchronize()`, L4/L5 PII in prod logs. Targets/plugin (agent 17): **C1 App-Group id divergence** (extensions derive group from entitlement[0] — breaks silently if bundle id overridden), **C2 plugin does file I/O at config-eval time** (not in `withDangerousMod` → re-copies over substituted Swift on every config load), **C3 `temporaryUnlockKey` Date vs unconditional remove TOCTOU**, M6 no unreplaced-placeholder check. Widgets (agent 18): **SamplePayload hardcoded `2026-05-18` → permanent stale placeholder**, hardcoded `en_US_POSIX` 24h + "· Mecca" label, `LockProvider` 15-min refresh ignores prayer boundary. → All tracked for the device-port phase of the widget migration.


### Pass 3 (continued) — the 7 re-run slices (cap reset, now covered)

**components n-z**
| ID | Loc | Issue | Status |
|----|-----|-------|--------|
| P3-C1 | `components/toggle-row.tsx:15` | `onToggle()` fired by BOTH `Pressable.onPress` AND `Switch.onValueChange` → double-fire = no-op toggle | ✅ |
| P3-C2 | `components/scroll-blur-header.tsx:20` | `insets.top*0.7` = 0 on Android pre-layout → 8 zero-height blur strips | ✅ Math.max floor |
| P3-C3 | `components/parallax-scroll-view.tsx:29` | `useScrollOffset` — verify vs `useScrollViewOffset` (inert parallax if wrong) | ⏭️ verify API |
| P3-C4 | `components/tasbih-row.tsx:61` | `count===1` → `/(count-1)` div-by-zero → NaN position | ✅ guard |

**app/lib**
| ID | Loc | Issue | Status |
|----|-----|-------|--------|
| P3-L1 | `lib/revenuecat.ts:79` | `logOutRevenueCat` throws `LOGOUT_CALLED_WITH_ANONYMOUS_USER` (no anon guard); `Promise<void>` contract implies safe | ✅ anon guard |
| P3-L2 | `lib/prayer-shield-notifications.ts:101` | cancel-then-reschedule: interrupt = zero notifications + wiped ids (worse in bg task) | ⏭️ schedule-first refactor |
| P3-L3 | `lib/subscription.tsx:127` | double `getCustomerInfo`+sync on startup then `refresh()` repeats it | ⏭️ |
| P3-L4 | `lib/prayer-shield-task.ts:47` | bg task deserializes `times` w/o validation → silent zero-schedule on schema drift | ⏭️ |
| P3-L5 | `lib/oauth/use-apple-auth.ts:27` | Apple nonce missing (re-confirm of P1-A) | ⏭️ server coord |

**convex domain-data**
| ID | Loc | Issue | Status |
|----|-----|-------|--------|
| P3-D1 | `convex/lib/prayerTimes.ts:93` | `getCachedPrayerTimes` (public, no auth) returns seed user's **exact lat/long** (cacheKey uses rounded) → GPS leak | ✅ strip lat/long |
| P3-D2 | `convex/lib/dhikr.ts:50,78,122,157` | regex-only date validation accepts `2024-02-30` (prayerLogs uses full `validateDateKey`) | ✅ shared validateDateKey |
| P3-D3 | `convex/lib/shieldSelection.ts:110` | `setWindows` array no length cap | ✅ cap |
| P3-D4 | `convex/lib/achievements.ts:189` | `listForMe` `.collect()` (mutation path already bounded) | ✅ `.take` |
| P3-D5 | prior fixes verified | auth-before-fetch, bounded collects, webhook sig — all confirmed sound | ✅ |

**core/src**
| ID | Loc | Issue | Status |
|----|-----|-------|--------|
| P3-R1 | `src/prayer/aladhan.ts:52` | month-boundary fetch drops days spanning into next month (silent partial week) | ⏭️ needs 2-month merge |
| P3-R2 | `src/achievements/evaluate.ts:63` | `buildDateMap` could count non-canonical prayer toward 5-of-5 if a `sunrise` log enters | ⏭️ latent |
| P3-R3 | `src/prayer/adhan-js.ts:161` | `formatInTimezone` en-GB can emit `24:00` (log-status.ts has the workaround, this doesn't) | ⏭️ |
| P3-R4 | `src/achievements/evaluate.ts:199` | comeback fires for sparse first-time logs (day1+day9) | ⚠️ product |

**widgets Activity/Shared/staging**
| ID | Loc | Issue | Status |
|----|-----|-------|--------|
| P3-W1 | `Activity/LockedNowLiveActivity.swift:31,60,79` | `Text(timerInterval: Date()...end)` freezes start at render → drift | ⏭️ Swift/device |
| P3-W2 | `Shared/SharedStore.swift:50` | `bumpSnapshotDhikr` non-atomic read-modify-write race on rapid taps | ⏭️ Swift |
| P3-W3 | `Shared/WidgetSnapshot.swift:76` | `LockNow` no `decodeIfPresent` defaults → missing key drops WHOLE snapshot to nil | ⏭️ Swift |

**root config**
| ID | Loc | Issue | Status |
|----|-----|-------|--------|
| P3-RC1 | `turbo.json:8` + `marketing/.gitignore` | `.wrangler/` not in build outputs nor gitignored | ✅ gitignore (+turbo note) |
| P3-RC2 | `modules/expo-app-blocker/package.json:44` | TS `~5.9.2` forks workspace catalog `~6.0.3` under hoisted linker | ✅ catalog: |
| P3-RC3 | `app.json` | widget ext deploymentTarget 17.0 vs app 16.4 → archive "higher min OS" error | ⚠️ needs target reconcile (migration phase) |
| P3-RC4 | `targets/*/expo-target.config.js:4` | extension app group read by array index `[0]` → silent wrong group if order changes | ✅ find-by-value |
| P3-RC5 | `biome.jsonc:6` | `packages/marketing` + `modules/` fully excluded from lint | ⏭️ scope to css |
| P3-RC6 | `tsconfig/base.json:18` | `noUncheckedIndexedAccess:false` workspace-wide | ⏭️ incremental |

**Full coverage achieved: 20/20 slices reviewed across Pass 3.**
