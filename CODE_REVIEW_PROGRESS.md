# packages/api — Code Review & Fix Progress

**Branch:** `claude/packages-api-code-review-19pjgb` (created from `origin/dev`)
**Last updated:** 2026-06-10

---

## ✅ Done

1. **Branch setup** — created/reset `claude/packages-api-code-review-19pjgb` to `origin/dev` (fresh, based on dev).
2. **Full code review** of `packages/api` (~9,200 LOC) using **5 parallel subagents**, one per non-overlapping slice:
   - Auth / session / middlewares / security
   - Core domain routes (achievements, app-config, dhikr, prayer-logs, prayer-times)
   - Subscriptions & webhooks (subscriptions, shield-selection, user-locations, users, polar, resend)
   - DB schema / migrations / lib
   - App wiring / scheduled / scripts / stoker
3. **Consolidated report** committed at `packages/api/CODE_REVIEW.md` (commit `26ef3be`) and pushed.
4. **Toolchain bring-up** for this fresh container:
   - `bun install` (workspace deps) ✅
   - `bun run typecheck` (packages/api) → **clean** ✅
   - Baseline `bun run test` → 167 passed, **5 failed**. Diagnosed: the 5 failures are **missing-secret artifacts** (no `.dev.vars` in a fresh clone → `parseEnv` throws 500), **not `dev` regressions**.
   - Created a local **gitignored `.dev.vars`** with dummy values → all previously-failing tests now **pass** (full suite green baseline). This file is git-ignored and was NOT committed.
5. **Git identity** set to `Claude <noreply@anthropic.com>` so new commits are verified. (Pre-existing dev history shown as "Unverified" by the stop-hook is inherited from `dev` — intentionally NOT rewritten.)

---

## ⏳ Pending — Fixes (scope: **Everything**, per user)

Per-file workflow required by `packages/api/CLAUDE.md`: test-first → `bun x ultracite fix` → `bun turbo typecheck` (zero errors) → per-file conventional commit (`scope: api`).

Plan: fan out across parallel subagents with **strictly disjoint file ownership** (schema.ts and shared infra files owned by exactly one agent to avoid conflicts). Agents edit + write/adjust colocated tests + self-typecheck; final full `typecheck` + `vitest` gate and per-file commits coordinated centrally.

### Critical
- [ ] **C1** — `scripts/backfill/transform.ts`: `toInsertSql` derives columns from `rows[0]` only → column misalignment / data loss. Fix: union of keys across all rows, `NULL` for missing. (+ `transform.test.ts`)

### High
- [ ] **H1** — `subscriptions.polarOrderId` is a plain index, not unique → duplicate active rows on concurrent Polar redelivery. Fix: `uniqueIndex` in `src/db/schema.ts` + drizzle migration (0005) + `onConflictDoUpdate` in `polar.service.ts`. (+ tests, incl. concurrent path)
- [ ] **H2** — `GET /avatars/:authUserId` unauthenticated PII exposure. **NEEDS DECISION / client coordination** — changing to signed token breaks the native `<Image>` fetch. Proposed: short-lived signed token or explicit product sign-off. *Deferred pending decision; will not silently break the mobile client.*
- [ ] **H3** — `src/stoker/middlewares/on-error.ts`: leaks raw `err.message` on every 5xx. Fix: generic `"Internal Server Error"` for 5xx unless DEBUG; keep message in logger only; preserve message for intentional 4xx HTTPExceptions.
- [ ] **H4** — `scripts/reset-db.ts --remote`: no prod guardrail. Fix: require typed confirmation / allowlisted non-prod env name; print resolved DB name. (+ `reset-db.test.ts`)
- [ ] **H5** — `prayerTimeCaches` keyed on `userId` not `authUserId` → orphaned rows after account deletion. Safe fix: ensure `purgeUserData`/`deleteAccount` also purges `prayerTimeCaches`. (Full re-key is a breaking data migration — **deferred**; do the deletion-completeness fix + integration test now.)

### Medium
- [ ] **M1** — Add `db.batch()` for multi-row writes:
  - `dhikr.service.ts` `increment()`/`reset()` (daily + aggregate)
  - `achievements.service.ts` `runEvaluate` (unlock inserts) + `markSeen` (single `UPDATE ... WHERE code IN (...)`)
  - `users.service.ts` `purgeUserData` (~16 deletes → batch, atomic)
- [ ] **M2** — `idempotency.ts`: fold `cf-connecting-ip` into `anon` scope; cache only 2xx. (+ test)
- [ ] **M3** — `auth/index.ts`: pin `emailOTP({ otpLength: 6, expiresIn: 300, allowedAttempts: 3 })`; add stricter rate rule for OTP send endpoint (anti email-bomb).
- [ ] **M4** — `subscriptions.service.ts`: `claimPolarByEmail` should demote/expire active RC row when linking Polar, OR `getMySubscription` prefer `source === "polar"` over `revenuecat`. (+ test)
- [ ] **M5** — `subscriptions.service.ts` RC precedence guard (`:204-209`): also skip when Polar row is expired (mirror `isExpired`). (+ test)
- [ ] **M6** — Reuse core streak primitives instead of reimplementing in `prayer-logs.service.ts`. **BLOCKED** — would require adding exports to `@barakah/core`, which both CLAUDE.md files forbid ("Never modify `packages/core`"). *Left as-is; documented.* (Will re-confirm whether an existing core export can be imported without modifying core.)
- [ ] **M7** — `marketing` waitlist: add a dedicated tighter `rateLimit` scope (public Resend trigger currently only under global 600/min/IP).
- [ ] **M8** —
  - Gate OpenAPI `/doc` + Scalar `/docs` behind a flag in prod (`configure-open-api.ts` / `index.ts`). **(will fix)**
  - Standardize timestamp storage (text ISO vs integer ms vs auth `timestamp_ms`). **Deferred** — large breaking schema/data migration; documented only.

### Low / Nits
- [ ] **L2** — `scheduled.ts`: wrap each task in try/catch (per-task isolation) + log failures.
- [ ] **L4** — `lib/resend.ts` `enqueueEmail`: use `onConflictDoUpdate ... RETURNING` to close the keyless/race gap.
- [ ] **L7** — `middlewares/logger.ts`: add a level gate for `debug` (env-driven).
- [ ] **L8** — `polar.index.ts`: `logger.warn` when acking + dropping an event with no customer email.
- [ ] **L9** — `dhikr.routes.ts` / `prayer-logs.routes.ts`: add `min(0)` bound on `prayedAt`.
- [ ] **L10** — `prayer-times.service.ts` `fetchAndNormalize`: `logger.warn` instead of silent `catch { return [] }`.
- [ ] **L1** — confirm `getCachedPrayerTimes` anonymous read is intended (doc/no change).
- [ ] **L3** — `purgeExpiredPrayerCaches`: optional `LIMIT`+loop (low priority).
- [ ] **L11/L12** — `wrangler.toml` placeholder ids / staging `SITE_URL`; avatar endpoint sign-off (doc only).

---

## Deferred items requiring a decision (won't silently change)

- **H2** — avatar endpoint auth scheme (breaks native client).
- **H5 full re-key** — `prayerTimeCaches.userId → authUserId` (breaking migration; doing the deletion-completeness fix instead).
- **M6** — blocked by "Never modify `packages/core`".
- **M8 timestamp standardization** — breaking schema/data migration.

---

## Notes
- `.dev.vars` (dummy, gitignored) exists locally for the test gate — do not commit.
- Run gate before each commit: `bun run typecheck` + targeted `bunx vitest run <file>`.
- Pre-existing `dev` commit history is "Unverified" per the stop-hook; inherited, not rewritten.
