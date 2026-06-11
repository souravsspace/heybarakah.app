# `packages/api` — Code Review

**Scope:** Full review of `@barakah/api` (Hono + OpenAPI on Cloudflare D1/KV/R2/Workers,
Drizzle ORM, better-auth). ~9,200 LOC across `src/` and `scripts/`.

**Method:** Five parallel reviewers, one per non-overlapping slice:
1. Auth / session / middlewares / security
2. Core domain routes (achievements, app-config, dhikr, prayer-logs, prayer-times)
3. Subscriptions & webhooks (subscriptions, shield-selection, user-locations, users, polar, resend)
4. DB schema / migrations / lib
5. App wiring / scheduled / scripts / stoker

Reviewed against the API's own rules in `packages/api/CLAUDE.md` (subscription source
precedence, bounded queries, `db.batch()` for multi-row writes, workerd-only runtime APIs,
`c.env` access, reuse of `@barakah/core`). Branch: `claude/packages-api-code-review-19pjgb`
(based on `dev`).

---

## Verdict

Healthy core. The middleware wiring, CORS credential handling, webhook signature
verification (both fail-closed, constant-time), authorization scoping (no IDOR found),
query bounding, and the email-queue leasing design are all genuinely well-engineered.

The weaknesses cluster in three areas: **(1)** non-atomic read-modify-write over KV/D1
(rate-limit, idempotency, subscription activation, dhikr/achievement writes), **(2)**
operational safety of the migration scripts, and **(3)** prod-hardening of error/info
exposure. None are catastrophic, but several should be closed before the Convex→Cloudflare
cutover.

---

## Critical

### C1 — Backfill builds INSERT columns from `rows[0]` only → silent column misalignment / data loss
`scripts/backfill/transform.ts:69-77, 103-109`
`toD1Row` omits any key whose value is `undefined` (line 70-72), so two docs of the same
table can produce rows with **different** column sets. `toInsertSql` then derives the column
list from `Object.keys(rows[0])` (line 103) and applies it to every row via `row[c]`. A
later row missing a `rows[0]` column gets `NULL` for the wrong slot; a later row with a
column `rows[0]` lacks has that data **dropped entirely**. This is the one-shot Convex→D1
backfill that underpins the migration's #1 `authUserId`-continuity invariant — silent
corruption with no validation step to catch it.
**Fix:** compute the union of keys across all rows (stable order) and emit `NULL` for any
row missing a key; or normalize every row to the full column set before building the INSERT.

---

## High

### H1 — Duplicate active subscription rows on concurrent Polar webhook delivery
`src/routes/webhooks/polar/polar.service.ts:72-74`, `src/db/schema.ts:134`
`recordPaidOrder` does read (`resolveExistingPolarSub`) → `db.batch([orderWrite, subWrite])`.
The order row is protected by a `uniqueIndex`, but `subscriptions_by_polarOrderId` is a
**plain `index`, not unique** (verified at schema.ts:134). Two concurrent deliveries of the
same `order.paid` both read `existing = null` and both INSERT → two active `polar` rows for
one order. D1 has no interactive transaction, so the read-then-write isn't atomic. The
existing idempotency test covers only *sequential* redelivery (handled by the order unique
index), not the concurrent path the code comment claims to close. This is also the root
cause that makes the precedence reads (M4/M5) fragile.
**Fix:** add `uniqueIndex` on `subscriptions.polarOrderId` and make the activation an
`onConflictDoUpdate` upsert (like the order row) instead of read-then-insert.

### H2 — Rate limiter & idempotency are non-atomic over KV (bypass / double-execute)
`src/middlewares/rate-limit.ts:39-46`, `src/middlewares/idempotency.ts:39-60`
Both do non-atomic read-modify-write / read-then-write-later over KV, which has no CAS.
- **Rate limit:** N concurrent requests all read the same counter and each write `current+1`
  (last-write-wins) → a concurrent burst largely bypasses the limit.
- **Idempotency:** the response is cached only *after* `next()` completes, so two simultaneous
  retries with the same key both miss the read and both execute the mutation — exactly the
  flaky-network retry case it exists to defend.
**Fix:** treat both as best-effort and document them as such, OR move the operations that need
true atomicity to a Durable Object / Cloudflare native rate-limiting binding. For idempotency,
write a short-TTL "pending" sentinel *before* `next()` and return 409 on a concurrent hit.
(Note: actual auth brute-force limiting is delegated to better-auth's own limiter — good.)

### H3 — `onError` leaks raw `err.message` to clients on every 500 (info disclosure)
`src/stoker/middlewares/on-error.ts:17-23`
The DEBUG gate hides `stack` but never `message`. `parseEnv` (`src/env.ts:45-51`) throws
`"Invalid environment variables: RESEND_API_KEY, ..."` and is called inside the
**unauthenticated** marketing handler (`marketing.handlers.ts:9`), so a misconfigured prod
leaks the names of missing secrets to anyone hitting `/api/v1/marketing/waitlist`. DB driver
messages leak similarly.
**Fix:** for 5xx, return a generic `"Internal Server Error"` unless DEBUG; keep the real
message in the logger only. Preserve `err.message` only for intentional 4xx `HTTPException`s.

### H4 — `reset-db.ts --remote` has no production guardrail
`scripts/reset-db.ts:37-48`
`--remote` clears all 17 tables (incl. `user`/`account`/`session`) on whatever D1 the `DB`
binding resolves to, with no env-name check, no confirmation prompt — only a "careful"
comment in `usage()`. A single mistaken `--remote` against a prod-bound config nukes all
user identity + data.
**Fix:** require a typed confirmation or an allowlisted (non-prod) env/database name; print
the resolved DB name and refuse unless explicitly confirmed.

### H5 — `prayerTimeCaches` keys on `userId` (not `authUserId`) → likely orphaned rows after account deletion
`src/db/schema.ts:166-209`, cross-ref `src/routes/users/users.service.ts:141-205`
The whole app joins on `authUserId`, but `prayerTimeCaches` keys on `userId` (the `users.id`
UUID). The P0 account-deletion path deletes by `authUserId`, so these cache rows are very
likely **not** purged — a GDPR/App-Store deletion-completeness gap plus unbounded orphan
growth. No app table has a physical FK (`ON DELETE CASCADE`), so deletion completeness rests
entirely on exhaustive hand-written code.
**Fix:** confirm `deleteAccount` also purges `prayerTimeCaches`; standardize on one key column
(`authUserId`); add an integration test asserting deletion removes rows from every user-keyed
table. Consider FKs with cascade.

---

## Medium

### M1 — `db.batch()` not used for multi-row writes (rule violation + divergence risk)
- **dhikr** `increment()` / `reset()` write `dhikrDaily` then `dhikrAggregate` as two separate
  awaits — `src/routes/dhikr/dhikr.service.ts:93-107, 145-149`. A failure between them
  permanently desyncs the per-day count from the session aggregate (which only re-seeds on
  first insert). prayer-logs handles the analogous case correctly via `db.batch([...])`.
- **achievements** `runEvaluate` inserts unlocked codes one await-per-code on the hot path of
  every `logPrayer`/dhikr increment — `src/routes/achievements/achievements.service.ts:146-160`.
- **achievements** `markSeen` does a read then N per-row updates — `:324-336`.
- **users** `purgeUserData` issues ~16 sequential `db.delete` calls — non-atomic on the P0
  account-deletion path — `src/routes/users/users.service.ts:141-205`.
**Fix:** build these as batch items and submit with `db.batch(...)`; `markSeen` can be a single
`UPDATE ... WHERE code IN (...) AND seenAt IS NULL`.

### M2 — Idempotency: anon scope collision + caches 4xx
`src/middlewares/idempotency.ts:36-37, 50`
All unauthenticated callers share the `"anon"` scope, so a malicious client can reuse a
victim's `Idempotency-Key` on the same path to fetch a cached response. Separately, any
response `< 500` (incl. 400/401/429) is cached for 24h, so a transient client error pins a
stale failure to that key and legitimate retries can never succeed.
**Fix:** fold `cf-connecting-ip` into the anon scope (or reject idempotency for anon POSTs);
only cache 2xx.

### M3 — OTP & email-bomb hardening relies on better-auth defaults
`src/auth/index.ts:90-110`
`emailOTP({...})` pins no `otpLength`/`expiresIn`/`allowedAttempts` — security-critical values
left implicit and could regress on a dep bump. The `rateLimit` block adds custom rules for
`/sign-in/*` but **not** the OTP send/verify endpoints, so OTP send falls back to the global
limit, allowing email-bombing of a victim address.
**Fix:** explicitly set `otpLength: 6, expiresIn: 300, allowedAttempts: 3`; add a stricter
rate rule for the OTP send endpoint.

### M4 — `claimPolarByEmail` can leave a user with two active rows (precedence non-deterministic)
`src/routes/subscriptions/subscriptions.service.ts:69-120` + `getMySubscription:30-47`
Links every unowned email-matching `polar` row to the user without demoting an existing active
`revenuecat` row. Afterward `getMySubscription` orders by `updatedAt desc limit 1`, so which
source wins depends on write timing — Polar should always win per the invariant.
**Fix:** demote/expire any active RC row when linking a Polar row, OR make `getMySubscription`
explicitly prefer `source === "polar"` over `revenuecat` rather than relying on `updatedAt`.

### M5 — RC precedence guard ignores Polar-row expiry
`src/routes/subscriptions/subscriptions.service.ts:204-209`
`activePolarRow` matches `status === "active"` but not `isExpired(expiresAt)`. Harmless today
(Polar lifetime rows have null `expiresAt`) but inconsistent with `isExpired` used elsewhere;
an expired-but-active Polar row would block legitimate RC sync indefinitely.
**Fix:** also skip the guard when the Polar row is expired.

### M6 — Reuse rule: streak primitives reimplemented instead of imported from `@barakah/core`
`src/routes/prayer-logs/prayer-logs.service.ts:140-201`
`getStreak`'s day-completeness + current-streak machinery duplicates `currentFullStreak` /
`buildDateMap` in `@barakah/core/src/achievements/evaluate.ts` (same status sets, same 800-day
lookback, same `addDays`). The code comment even acknowledges the coupling. `best`/`history`
display derivation is legitimately new. Also check `parseRevenueCatEntitlementPayload`
(`subscriptions.service.ts:293-338`) — confirm core doesn't already export an equivalent.
**Fix:** export the streak primitives from core and import them; keep only display derivation here.

### M7 — Unauthenticated waitlist endpoint triggers Resend under only the global limiter
`src/routes/marketing/marketing.routes.ts`, `create-app.ts:62`
`/marketing/waitlist` is public and each accepted request makes two outbound Resend calls
(contact create + send to the submitted address) under the generous 600/min/IP global limit —
a cost/abuse + Resend-reputation vector.
**Fix:** apply a dedicated tighter rate-limit scope to this route; consider per-email dedupe.

### M8 — OpenAPI doc + Scalar UI exposed unconditionally; timestamp formats inconsistent
- `/api/v1/doc` + `/api/v1/docs` are served in all environments
  (`src/lib/configure-open-api.ts:6-29`) — publishes the full API surface in prod. Consider a
  `DOCS_ENABLED` gate.
- Schema mixes three time representations: `text` ISO (`subscriptions.*At`, `users.completedAt`),
  `integer` epoch-ms (`prayerLogs.updatedAt`, `prayerTimeCaches.*At`), and auth `timestamp_ms`.
  Cross-table sorting/range queries become error-prone. Standardize on integer epoch-ms for new
  columns.

---

## Low / Nits

- **L1** `getCachedPrayerTimes` read handler is unauthenticated/unthrottled beyond the global
  limiter (`prayer-times.handlers.ts:12-22`) — response is sanitized (no GPS/owner), so not an
  IDOR, but confirm anonymous cache-probing is intended.
- **L2** Scheduled handler runs `sweepEmailQueue` then `purgeExpiredPrayerCaches` sequentially
  with no per-task try/catch (`src/scheduled.ts:20-22`); a throw in the first starves the second,
  and the rejected `ctx.waitUntil` promise is unobserved. Wrap each task + log failures.
- **L3** `purgeExpiredPrayerCaches` is a single unbounded `DELETE` by row count
  (`prayer-times.service.ts:331-335`) — fine for D1 in practice; consider `LIMIT`+loop if cold
  backlogs can be large.
- **L4** `enqueueEmail` keyless path gets zero dedupe (UNIQUE over nullable `dedupeKey`), and the
  `onConflictDoNothing` + follow-up `SELECT` has a small race (`src/lib/resend.ts:60-102`). Use
  `onConflictDoUpdate ... RETURNING`.
- **L5** `stringifyJson` can throw uncaught on circular/BigInt while `parseJson` is defensively
  guarded (`src/lib/json-columns.ts`) — asymmetric; low risk given plain inputs.
- **L6** `backfill.ts` is non-idempotent / no partial-failure recovery (single monolithic
  `.sql` applied via `wrangler d1 execute --file`); documented as a one-shot but compounds C1.
- **L7** Logger `debug` emits via `console.log` unconditionally (no level gate) —
  `src/middlewares/logger.ts:15`. No secrets logged today; add a level threshold from env.
- **L8** Polar webhook acks (`200 ok`) and silently drops events with no customer email
  (`polar.index.ts:52-54`) — add a `logger.warn` so a paid order with no email isn't invisible.
- **L9** `prayedAt` accepts any int with no range bound (`dhikr.routes.ts`, `prayer-logs.routes.ts`)
  — cosmetic; consider `min(0)`.
- **L10** `fetchAndNormalize` swallows all fetch/parse errors with bare `catch { return [] }`
  (`prayer-times.service.ts:235`) — deliberate adhan-js fallback, but add a `logger.warn` so
  AlAdhan outages aren't silent.
- **L11** `wrangler.toml`: prod `database_id`/KV/R2 ids are placeholders (deploy fails until set —
  intentional pre-cutover) and `env.development` labeled "Staging" points `SITE_URL` at prod.
- **L12** H2-public: `GET /avatars/:authUserId` is intentionally unauthenticated; the id is a
  high-entropy UUID but a face photo is PII with no expiry. Deserves explicit product sign-off
  rather than a code comment, or serve behind a short-lived signed token.

---

## Verified clean

- **Authorization / IDOR:** every authenticated handler scopes DB access to the session user;
  every service query/write filters on `authUserId`. `user-locations` proves ownership before
  rename/remove/setActive. No IDOR found.
- **Query bounding:** all list queries are bounded (date-range and/or `LIMIT`+cursor).
- **Webhooks:** Polar and Resend both fail-closed without a secret and verify signatures
  (constant-time) **before** any DB work. Resend uses `crypto.subtle.verify` + ±300s timestamp
  window. RC-vs-Polar precedence holds on the single-row path and is tested.
- **CORS:** no wildcard-with-credentials; web origins allowlisted; `.workers.dev`/native schemes
  gated behind `ALLOW_EXPO_ORIGINS`; `credentials: true` only ever paired with a specific origin.
- **Runtime rules:** env read exclusively from `c.env` (Zod-validated); Web Crypto used; no
  `Bun.*` / bare `node:*` in `src/` runtime code. IP rate-limit key uses `cf-connecting-ip` and
  rejects spoofable `x-forwarded-for`/`x-real-ip`.
- **Migrations:** 0000–0004 map 1:1 to the journal, apply cleanly in order, are additive (only
  index drop/recreate, never tables) — no data loss; schema.ts is in sync with the latest migration.
- **Reuse:** Polar `validateWebhook`, RC `shouldSkipRcSync`/`buildRevenueCatSubscriptionDoc` are
  correctly imported from `@barakah/core`.

---

## Suggested priority order

1. **C1** backfill column union — blocks a safe data migration.
2. **H1** subscriptions `polarOrderId` unique index + upsert.
3. **H3** stop leaking `err.message` on 5xx.
4. **H4** `reset-db --remote` guardrail.
5. **H5** confirm `prayerTimeCaches` purged on account deletion (+ deletion-completeness test).
6. **H2 / M1** document KV middlewares as best-effort (or DO); add missing `db.batch()`.
7. M2–M8, then Low/Nits.
