# Barakah — Backend Ops & Project Notes

Single reference for running, testing, deploying, and force-updating the Barakah
backend, plus the condensed Convex→Cloudflare migration record and code-review log.

> Backend = Hono + OpenAPI on Cloudflare (D1 / KV / R2 / Workers / Durable
> Objects), in `packages/api`. **Convex is fully removed** — app + marketing talk
> only to the CF API.

**Contents**
1. [Base URLs & endpoint map](#1-base-urls--endpoint-map)
2. [OAuth redirect / callback URLs](#2-oauth-redirect--callback-urls)
3. [Polar (purchases) — checkout, redirect, webhook](#3-polar-purchases--checkout-redirect-webhook)
4. [Resend (email) webhook](#4-resend-email-webhook)
5. [Realtime sync (WebSocket + Durable Object)](#5-realtime-sync-websocket--durable-object)
6. [Run & test the API](#6-run--test-the-api)
7. [App / marketing pointing at the API](#7-app--marketing-pointing-at-the-api)
8. [Deploy to Cloudflare](#8-deploy-to-cloudflare)
9. [End-to-end test flows + pre-run checklist](#9-end-to-end-test-flows--pre-run-checklist)
10. [Force-update & OTA operations](#10-force-update--ota-operations)
11. [Migration record (Convex → Cloudflare)](#11-migration-record-convex--cloudflare)
12. [Code-review log](#12-code-review-log)
13. [Appendix A — endpoint inventory](#appendix-a--endpoint-inventory)
14. [Appendix B — secrets / env](#appendix-b--secrets--env)

---

## 1. Base URLs & endpoint map

API base URL depends on environment (`BETTER_AUTH_URL` for the API,
`EXPO_PUBLIC_API_URL` for the app, `PUBLIC_API_URL` for marketing):

| Env | API base URL |
|---|---|
| Local (`wrangler dev`) | `http://localhost:8787` |
| Cloudflare dev worker (`barakah-api-dev`) | `https://barakah-api-dev.<subdomain>.workers.dev` |
| Production worker (`barakah-api`) | custom domain, e.g. `https://api.heybarakah.app` |

Paths (relative to base URL):

| Purpose | Path |
|---|---|
| Health check | `GET /api/v1/health` |
| OpenAPI JSON | `GET /api/v1/doc` |
| API docs (Scalar UI) | `GET /api/v1/docs` |
| Realtime sync (WebSocket) | `GET /api/v1/sync` (upgrade; `wss://` in prod) |
| Better Auth (all auth flows) | `/api/auth/*` |
| OAuth callback (Google) | `/api/auth/callback/google` |
| OAuth callback (Apple) | `/api/auth/callback/apple` |
| Polar webhook | `POST /api/v1/webhooks/polar` |
| Resend webhook | `POST /api/v1/webhooks/resend` |

> Auth is mounted at `/api/auth/*` (NOT under `/api/v1`). Domain routes + webhooks
> are under `/api/v1`.

> **Docs gate:** `/api/v1/doc` + `/api/v1/docs` 404 (`{"message":"Not Found"}`)
> unless `DOCS_ENABLED=true` (or `DEBUG=true`) is set on the env — keeps the API
> surface unpublished in prod by default. Local: in `.dev.vars`; restart
> `wrangler dev` after adding. Deployed: `wrangler secret put DOCS_ENABLED`.

> **OpenAPI status coverage:** every route documents its non-200 responses too —
> `401` (`{message}`, missing/invalid session), `422` (Zod `{success,error}` for
> request-schema failures; `{message}` for handler-thrown rejections like an
> oversized avatar), `429` (`{error}`, rate limit), `500` (`{message}`). Shared
> response shapes live in `src/stoker/openapi/helpers/error-responses.ts`.

---

## 2. OAuth redirect / callback URLs

Better Auth builds callbacks as `${BETTER_AUTH_URL}/api/auth/callback/<provider>`.
Whatever `BETTER_AUTH_URL` is (per env) is the base.

**Google** (Google Cloud Console → Credentials → OAuth 2.0 Client)
- Authorized redirect URI: `${BETTER_AUTH_URL}/api/auth/callback/google`
  - Local: `http://localhost:8787/api/auth/callback/google`
  - Dev worker: `https://barakah-api-dev.<subdomain>.workers.dev/api/auth/callback/google`
  - Prod: `https://api.heybarakah.app/api/auth/callback/google`
- Add every environment's URL you actually use. `GOOGLE_CLIENT_ID` /
  `GOOGLE_CLIENT_SECRET` go into the API secrets.

**Apple** (Apple Developer → Identifiers → Services ID → Sign in with Apple)
- Return URL: `${BETTER_AUTH_URL}/api/auth/callback/apple`
- Domain: the API host (e.g. `api.heybarakah.app`). Apple rejects `localhost` —
  use a tunnel (`cloudflared tunnel`) or test Apple only against the deployed worker.
- `APPLE_CLIENT_ID` = the **Services ID** (`com.souravsspace.Barakah.signin`),
  `APPLE_APP_BUNDLE_IDENTIFIER` = `com.souravsspace.Barakah`.
- `APPLE_CLIENT_SECRET` = JWT from `packages/core/scripts/generate-apple-secret.ts`
  (expires ≤6 months — rotate). Native "Sign in with Apple" on iOS uses the bundle
  id directly; the Services ID return URL is for the web/relay flow.

**Email OTP** — no redirect URL. Passwordless code-by-email: app calls
`/api/auth/email-otp/send-verification-otp` then `/api/auth/sign-in/email-otp` with
the 6-digit code (delivered by Resend, `RESEND_AUTH_EMAIL` sender).

> After changing `BETTER_AUTH_URL`, make the app's `EXPO_PUBLIC_API_URL` and
> marketing's `PUBLIC_API_URL` point at the same base, and ensure the origin is in
> the API CORS allow-list (web origins + `barakah://`; `exp://` only when
> `ALLOW_EXPO_ORIGINS` is set for dev).

---

## 3. Polar (purchases) — checkout, redirect, webhook

- **Marketing checkout link** lives in `packages/marketing/src/app-config.ts`
  (`POLAR_CHECKOUT_SANDBOX` in `astro dev`, `POLAR_CHECKOUT_PROD` in prod). Polar-
  hosted URL — no redirect to host yourself for the buy button.
- **Post-purchase redirect (success URL):** configure in the Polar dashboard for
  the checkout link/product. Point at a marketing success page or app deep link
  (`barakah://`). Account linking does NOT depend on it — it happens via webhook +
  claim-by-email.
- **Webhook URL** (Polar dashboard → Webhooks): `${API_BASE}/api/v1/webhooks/polar`
  - Secret (`polar_whs_...`) → API secret `POLAR_WEBHOOK_SECRET`.
  - On `order.paid` the API records the order, activates a lifetime subscription,
    queues a receipt email. Links by `metadata.authUserId` if present; otherwise
    buyer claims in-app by email (`POST /api/v1/subscription/claim-polar`).

---

## 4. Resend (email) webhook

- **Webhook URL** (Resend dashboard → Webhooks): `${API_BASE}/api/v1/webhooks/resend`
- Signing secret (`whsec_...`) → API secret `RESEND_WEBHOOK_SECRET`.
- Marks queued emails bounced/complained. Signature verified constant-time; stale
  deliveries (>5 min) rejected.

---

## 5. Realtime sync (WebSocket + Durable Object)

App live-updates like Convex did, over the Hono/CF backend. A mutation on one
device pushes an invalidation to the user's **other** devices, which refetch
(~300ms). No polling.

**How it works:**
- Per-user Durable Object `SyncHub` (`packages/api/src/sync/sync-hub.ts`) holds each
  device's WebSocket via the Hibernation API (idle connections cost ~0).
- After a successful mutation, `sync-notify` middleware derives a topic from the
  URL path and RPC-broadcasts it into the user's DO, which fans an
  `{type:"invalidate",topics}` frame to every connected socket.
- Client (`packages/app/lib/sync-socket.ts`, started by `hooks/use-realtime-sync.ts`)
  maps each topic → React Query keys → `invalidateQueries`. Exponential-backoff
  reconnect, reconnect on app foreground, heartbeat every 25s.
- Endpoint `GET /api/v1/sync` (auth-gated upgrade). Native sends the Better Auth
  `Cookie` header; web rides the credentialed cookie. URL derives from
  `EXPO_PUBLIC_API_URL` (`https://` → `wss://`).

**Topics → keys:** `prayer-logs` (→ prayer-logs, streak, achievements),
`achievements`, `locations`, `shield`, `subscription`, `me`. (dhikr is
client-local — no topic.)

**Deploy note:** `wrangler deploy --env development` applies the `SyncHub` DO
migration (`new_sqlite_classes`, in `wrangler.toml` under both top-level and
`[env.development]` — named envs don't inherit DO blocks). No DO = `/sync` 500s.

**Test (two clients, same account):**
1. Sign in on two devices (or device + simulator).
2. Device A logs a prayer.
3. Device B's home/streak updates within ~1s with **no** interaction. Repeat for
   achievement unlock, location add/rename, shield toggle, subscription change,
   profile edit.
4. Background B, mutate on A, foreground B → reconnects and shows fresh data.
5. `wrangler tail --env development` shows `GET /api/v1/sync` 101 on connect.

---

## 6. Run & test the API

All commands from `packages/api` (or root passthrough `bun run *:api`).

```bash
# Install (repo root)
bun install

# Apply migrations to LOCAL miniflare D1 (first run / after a new migration)
bun run db:migrate

# Start the API locally (wrangler dev → http://localhost:8787)
bun run dev

# Smoke-test (another shell)
curl http://localhost:8787/api/v1/health
open  http://localhost:8787/api/v1/docs        # Scalar API explorer (DOCS_ENABLED)

# Test suite (vitest + @cloudflare/vitest-pool-workers; real D1/KV/R2 via miniflare;
# migrations auto-load from src/db/migrations — no .sql imports).
bun run test                                   # 214 tests / 42 files

# Typecheck everything (repo root)
bun turbo typecheck
```

Local API secrets live in `packages/api/.dev.vars` (git-ignored). It must contain
the Appendix-B vars: `BETTER_AUTH_SECRET` (≥32 chars), `BETTER_AUTH_URL`,
`SITE_URL`, `NATIVE_APP_URL`, `GOOGLE_*`, `APPLE_*`, `RESEND_*`,
`POLAR_WEBHOOK_SECRET`, `REVENUECAT_SECRET_KEY`, and dev gates
`ALLOW_EXPO_ORIGINS` / `ALLOW_MOCK_SUBSCRIPTIONS`.

---

## 7. App / marketing pointing at the API

**No native rebuild needed for server-side changes** — API work is server-side and
app changes are pure JS/TS (no native module / config-plugin changes).

- **JS/TS changes** (hooks, screens, lib): reload Metro — `cd packages/app && bun
  run start`, press `r`. No prebuild.
- **Native rebuild** (`bun run prebuild` + `bun run ios/android`) only when you
  change native code, config plugins, `app.json`, or add a native dep.

Point the app at the API via `EXPO_PUBLIC_API_URL` in `packages/app/.env`, then
restart Metro (env inlined at bundle time):
- **iOS simulator / web:** `EXPO_PUBLIC_API_URL=http://localhost:8787`
- **Physical device:** `localhost` won't resolve — use your Mac's LAN IP
  (`http://192.168.x.x:8787`, run `wrangler dev --ip 0.0.0.0`), a tunnel
  (`cloudflared`/`ngrok`), or the deployed dev worker.

> Apple/Google sign-in can't use `localhost` as a redirect — for OAuth flows point
> the app at the deployed dev worker (or a tunnel) so the callback is reachable +
> registered in the provider console.

**Marketing:**
```bash
cd packages/marketing
bun run dev        # astro dev — uses the Polar SANDBOX checkout link
```
Set `PUBLIC_API_URL` in `packages/marketing/.env` (waitlist posts to
`${PUBLIC_API_URL}/api/v1/marketing/waitlist`).

---

## 8. Deploy to Cloudflare

Dev CF resources exist (D1 `barakah-db-dev`, KV, R2 — ids in `wrangler.toml`
`[env.development]`). To bring the dev API online:

```bash
cd packages/api

# 1. Put each secret on the dev worker (repeat per Appendix-B var):
wrangler secret put BETTER_AUTH_SECRET --env development
wrangler secret put GOOGLE_CLIENT_ID --env development
# … GOOGLE_CLIENT_SECRET, APPLE_CLIENT_ID, APPLE_APP_BUNDLE_IDENTIFIER,
#   APPLE_CLIENT_SECRET, RESEND_API_KEY, RESEND_AUDIENCE_ID, RESEND_FROM,
#   RESEND_REPLY_TO, RESEND_AUTH_EMAIL, RESEND_WEBHOOK_SECRET,
#   POLAR_WEBHOOK_SECRET, REVENUECAT_SECRET_KEY, BETTER_AUTH_URL, SITE_URL,
#   NATIVE_APP_URL, ALLOW_EXPO_ORIGINS

# 2. Apply migrations to the remote dev D1:
bun run db:migrate:dev

# 3. Deploy:
wrangler deploy --env development

# 4. Take the printed workers.dev URL and set it as:
#    - BETTER_AUTH_URL secret (re-put with the real URL)
#    - app EXPO_PUBLIC_API_URL · marketing PUBLIC_API_URL
#    - Google/Apple redirect URIs · Polar + Resend webhook URLs
```

Production (`barakah-api`) needs its D1/KV/R2 ids created and filled into
`wrangler.toml` (`database_id` is still `<placeholder>`), then the same flow
without `--env development`. CI deploy: `.github/workflows/deploy-api.yml`.

### Cloudflare dev — update loop (run after each change)

The app points at the deployed dev worker, so API changes are NOT live until you
redeploy. Match the command to what you changed:

| You changed | Run (from `packages/api`) |
|---|---|
| API code (routes/handlers/middleware/`src/sync/*`) | `wrangler deploy --env development` |
| DB schema (`src/db/schema.ts`) | `bun run db:generate` → `bun run db:migrate:dev` → `wrangler deploy --env development` |
| `wrangler.toml` bindings/DO/migrations | `wrangler deploy --env development` |
| A secret value (`.dev.vars`) | `wrangler secret put <NAME> --env development` (no redeploy) |
| Non-secret var (`[env.development.vars]`) | `wrangler deploy --env development` |
| App JS/TS only | nothing on CF — reload Metro (`r`) |
| App `.env` (`EXPO_PUBLIC_*`) | restart Metro (env inlined at bundle time) |

Post-deploy checks:
```bash
cd packages/api
wrangler deploy --env development                                   # prints live URL
curl https://barakah-api-dev.<subdomain>.workers.dev/api/v1/health  # smoke test
wrangler tail --env development                                     # live logs
```

> If `wrangler deploy` prints a URL different from `BETTER_AUTH_URL`, update all
> three (`wrangler.toml` `[env.development.vars] BETTER_AUTH_URL`, app
> `EXPO_PUBLIC_API_URL`, marketing `PUBLIC_API_URL`) **and** the Google/Apple
> redirect URIs + Polar/Resend webhook URLs to the new base — they must match.

---

## 9. End-to-end test flows + pre-run checklist

1. **Email sign-in:** app → enter email → `send-verification-otp` → Resend delivers
   code → enter code → `sign-in/email-otp` → session cookie set.
2. **Prayer log:** log a prayer → `POST /api/v1/prayer-logs` returns updated streak
   + any newly-unlocked achievements (no extra round-trip).
3. **Purchase (Polar web):** buy via marketing checkout → Polar webhook →
   subscription activates → open app, claim by email if not auto-linked → paywall
   clears (RevenueCat SDK also reflects entitlement instantly).
4. **RevenueCat (in-app):** purchase → `POST /api/v1/subscription/revenuecat`
   verifies server-side and reconciles the D1 row (never overwrites a Polar one).
5. **Realtime sync:** two devices same account → mutate on A → B updates within ~1s
   (see §5).

**Checklist before a real run:**
- [ ] `packages/api/.dev.vars` filled (or worker secrets set for the deployed env)
- [ ] `BETTER_AUTH_SECRET` ≥ 32 chars
- [ ] `EXPO_PUBLIC_API_URL` (app) + `PUBLIC_API_URL` (marketing) point at the API
- [ ] Google/Apple redirect URIs registered for the chosen `BETTER_AUTH_URL`
- [ ] Polar webhook → `/api/v1/webhooks/polar`, Resend → `/api/v1/webhooks/resend`
- [ ] Remote D1 migrated (`db:migrate:dev` / `:prod`) before first real traffic
- [ ] `SyncHub` DO migration applied (`wrangler deploy --env development`) for realtime
- [ ] `DOCS_ENABLED` set only where you want the API explorer exposed
- [ ] `ALLOW_MOCK_SUBSCRIPTIONS` unset in production

---

## 10. Force-update & OTA operations

Two layers gate app versions:

- **Layer A — store force-update (hard block).** `appConfig` holds
  `minSupportedVersion`. App reads its installed native version and, if below it,
  shows a non-dismissible modal sending the user to TestFlight / App Store. Changing
  the value blocks every open client within seconds, no app rebuild.
- **Layer B — OTA (EAS Update).** JS-only fixes ship over-the-air via `eas update`;
  the app fetches + reloads on launch. No store trip, no popup.

**Source of truth = the `appConfig` table**, now served by the CF API:
`GET /api/v1/app-config` (read) + an internal `setAppConfig` write. Seed/update the
row on the deployed worker (e.g. `wrangler d1 execute` against the `appConfig`
table, or an admin/seed script in `packages/api`).

> **Historical (Convex era — no longer used):** the value used to be seeded with
> `npx convex run lib/appConfig:setAppConfig '{"minSupportedVersion":"0.9.2",
> "iosStoreUrl":"itms-beta://"}'` (add `--prod` for prod). Kept only as context;
> Convex is removed.

**`iosStoreUrl` values:**
- Private TestFlight: `itms-beta://` (opens TestFlight; no-op on simulator).
- Sharper TestFlight target: `itms-beta://beta.itunes.apple.com/v1/app/<APPLE_APP_ID>`
- Public App Store (launch): `https://apps.apple.com/app/id<APPLE_APP_ID>`

`<APPLE_APP_ID>` = numeric Apple ID from App Store Connect → App Information.

**Force everyone onto a new native build:** native code can't change over OTA →
new build **and** raised min version.
1. Bump version in all 3 files: root `package.json`, `packages/app/package.json`,
   `packages/app/app.json`.
2. `cd packages/app && eas build -p ios --profile production && eas submit -p ios
   --profile production`.
3. **After** the build is live (TestFlight processed / App Store approved), raise
   `minSupportedVersion` in prod `appConfig`.

> **Ordering is critical.** Raise `minSupportedVersion` only *after* the new build
> is downloadable — too early and users are blocked with nothing to update to.

**Ship a JS-only fix (OTA, no force):**
```bash
cd packages/app
eas update --branch production --message "fix X"
```
Apps pull it on next launch (`use-ota-updates` checks/fetches/reloads).
`runtimeVersion` is tied to `appVersion`, so an OTA only lands on builds with a
matching native version — bumping native version cuts old binaries off OTA and
pushes them down the store-update path.

> OTA needs `expo-updates` baked into the binary. The first build after adding it
> must be a fresh `eas build`; `eas update` does nothing until a build embedding
> expo-updates is installed.

**File map (app side):**

| Concern | File |
|---|---|
| Config source | CF API `app-config` route (`packages/api/src/routes/app-config/`) |
| Version compare | `packages/app/lib/semver.ts` |
| Gate hook | `packages/app/hooks/use-forced-update.ts` |
| Blocking modal UI | `packages/app/components/force-update-modal.tsx` |
| Gate wiring (store link) | `packages/app/components/force-update-gate.tsx` |
| Mount point | `packages/app/app/_layout.tsx` |
| OTA auto-check | `packages/app/hooks/use-ota-updates.ts` |
| runtimeVersion + updates url | `packages/app/app.json` |

---

## 11. Migration record (Convex → Cloudflare)

**Done.** `packages/api` (Hono + `@hono/zod-openapi` + vendored `stoker` helpers +
Drizzle/D1) fully replaced the Convex backend. App + marketing are Convex-free;
`packages/core` kept its pure domain logic (`src/`) and dropped `convex/`.

**Stack mapping:**

| Convex concept | Cloudflare replacement |
|---|---|
| tables + indexes | D1 (SQLite) + Drizzle |
| queries/mutations/actions | Hono routes (read=GET, write=POST; internal = service fn) |
| reactivity (`useQuery`) | `SyncHub` Durable Object + WebSocket invalidations (§5) |
| Better Auth (`@convex-dev/better-auth`) | `better-auth-cloudflare` (D1+KV); emailOTP + Apple + Google + Expo |
| file storage (avatars) | R2 (worker-proxied PUT; public blob proxy GET) |
| prayer-time cache | KV hot blob + D1 metadata row |
| `@convex-dev/resend` | `resend` SDK + durable D1 `emailQueue` + cron retry sweep |
| Convex scheduler | Workers Cron Triggers (cache-expiry sweep, email retry) |
| dashboard secrets | `wrangler secret` + `.dev.vars` (Appendix B) |

**Key facts / decisions:**
- Pre-launch (no prod users/data) → no backfill/shadow-read/rollback flag; straight
  CF-only conversion. Backfill scripts exist (`scripts/backfill/`) but never ran.
- 12 app D1 tables (Appendix A) + generated Better Auth tables (singular
  `user`/`account`/`session`/`verification`, `usePlural:false`).
- Auth transport = session **cookie** for both web and Expo (`@better-auth/expo`
  stores/replays Set-Cookie). No anonymous plugin, no email/password.
- Multi-row writes use `db.batch()` (D1's only txn primitive; drizzle
  `db.transaction()` throws on D1). UNIQUE natural-key indexes + atomic
  `onConflictDoUpdate` upserts guard concurrent writes.
- Runtime is workerd: no `Bun.*` / bare `node:*` in `packages/api` runtime code —
  Web Crypto / Workers bindings only (`nodejs_compat` where a dep needs it).
- Reused from `@barakah/core/src` (do NOT rewrite): achievements eval/calendar/
  definitions, prayer math (aladhan/adhan-js/cache-key/normalize/log-status), polar
  webhook parser, revenuecat sync, validators.

**Still open / blocked on user action:**
- 🔴 **Phase 9 prod deploy** — needs CF secrets + prod D1/KV/R2 ids (still
  `<placeholder>` in `wrangler.toml`). Dev resources are live.
- Apple client secret rotation runbook (`APPLE_CLIENT_SECRET` JWT expires ≤6 months).
- Avatar blob migration (Convex storage → R2) — N/A pre-launch (no data).
- Observability (Sentry/Logpush) — optional.

---

## 12. Code-review log

### 2026-06-13 — full-codebase bug hunt (5 sonnet agents)
api · app (JS + native) · core · env · mails · marketing · `expo-app-blocker` ·
scripts · root config. **Found:** 5 CRITICAL · 14 HIGH · 18 MEDIUM · ~15 LOW.
**Fixed:** 31 per-file commits on `dev`; typecheck 6/6, 199 api tests + core green.

Highlights (fixed): account-delete error surfacing; preserve `activatedAt` across
RC re-sync; iOS `ManagedSettingsStore.shield` writes on main thread; Android overlay
guarded by `Settings.canDrawOverlays`; plugin `application-groups` /
`BGTaskSchedulerPermittedIdentifiers` merged not overwritten; midnight-safe `today`
key; Ramadan/sacred-month ranges through 2040; `reset-db` writes all statements to a
`.sql` file; backfill `INSERT OR IGNORE`; capped expired-cache purge (D1 10MB);
`completedAt` real-date validation; dropped unused `past_due` status.

> ⚠️ Native fixes (iOS shield threading, Android overlay, cross-midnight relock)
> compile-clean but **need a device build to verify**.

**Deferred:** H5 rate-limit KV TOCTOU (needs Durable Object or CF Rate-Limiting
binding — infra decision); plugin substitution timing refactor; ~15 LOW nits in
agent transcripts.

### 2026-06-10/11 — `packages/api` reviews (rounds 1 & 2)
Multiple parallel `code-reviewer` passes over ~9,200 LOC. Landed on `dev`, full
suite green. Notable fixes: `subscriptions.polarOrderId` + `users.authUserId` +
`prayerTimeCaches.cacheKey` UNIQUE (migrations 0005/0006) with atomic upserts;
generic 5xx message unless DEBUG; `reset-db --remote` guarded behind `--yes` +
non-prod env; `db.batch()` for dhikr/achievements/account-purge; idempotency anon
scope folds in IP + caches only 2xx; `emailOTP` pinned `otpLength:6/expiresIn:300/
allowedAttempts:3`; deterministic Polar-over-RC precedence; `[env.development]` cron
triggers added; account-delete purges `emailQueue` + `prayerTimeCaches`; zod bounds
across user-locations/users/prayer-times/shield/waitlist; constant-time Svix verify
+ replay window; receipt-HTML escaping; lowercased email lookups + optimistic-lock
claim.

**Deferred (by decision):** avatar-endpoint auth scheme (breaks native client);
`prayerTimeCaches` full re-key (`userId`→`authUserId`, breaking migration — did the
deletion-completeness fix instead); reuse core streak primitives (blocked by "never
modify `packages/core`"); timestamp-storage standardization (breaking migration);
`z.unknown()` typed-response contracts; HTTP happy-path tests for authed mutations;
per-route `security:[{BearerAuth:[]}]` doc declarations.

---

## Appendix A — endpoint inventory

`query`=GET, `mutation`=POST, `internalMutation`/internal `action`=service fn (not HTTP).

| Domain | Fn | API endpoint / internal |
|---|---|---|
| appConfig | getAppConfig | `GET /app-config` |
| | setAppConfig | internal |
| dhikr | getToday / increment / setTarget / reset | `GET /dhikr/today` · `POST /dhikr/increment` · `POST /dhikr/target` · `POST /dhikr/reset` |
| achievements | listForMe / listUnseen / markSeen | `GET /achievements` · `GET /achievements/unseen` · `POST /achievements/seen` |
| | runEvaluate | internal (called by logPrayer) |
| healthCheck | get | `GET /health` |
| marketing | joinWaitlist | `POST /marketing/waitlist` |
| prayerTimes | getCachedPrayerTimes / refreshPrayerTimes | `GET /prayer-times` · `POST /prayer-times/refresh` |
| | upsertPrayerTimesCache | internal |
| polar | recordPaidOrder / queueOrderConfirmationEmail / markOrderEmailConfirmed / clearOrderConfirmationEmailQueued | internal |
| | webhook | `POST /api/v1/webhooks/polar` |
| resend | handleEmailEvent | internal |
| | webhook | `POST /api/v1/webhooks/resend` |
| userLocations | listMine / create / rename / remove / setActive | `GET /locations` · `POST /locations` · `POST /locations/:id/rename` · `POST /locations/:id/remove` · `POST /locations/:id/active` |
| users | getMyAccount / getMyAvatarUrl / upsertProfile / deleteMyAccount / setAvatar | `GET /me` · `GET /me/avatar` · `POST /me/profile` · `POST /me/delete` · `POST /me/avatar` (raw bytes) |
| | purgeUserData | internal |
| subscriptions | getMySubscription / claimPolarByEmail / claimMockSubscription / syncRevenueCatEntitlement | `GET /subscription` · `POST /subscription/claim-polar` · `POST /subscription/claim-mock` (dev-gated) · `POST /subscription/revenuecat` |
| | applyRevenueCatEntitlement | internal |
| shieldSelection | getMine / upsertIos / upsertAndroid / setWindows / setEnabled | `GET /shield` · `POST /shield/ios` · `POST /shield/android` · `POST /shield/windows` · `POST /shield/enabled` |
| prayerLogs | getMyWeek / logPrayer / getStreak / clearPrayer | `GET /prayer-logs/week` · `POST /prayer-logs` (returns streak + unlocked) · `GET /prayer-logs/streak` · `POST /prayer-logs/clear` |

**D1 tables (12):** `users`, `subscriptions`, `polarOrders`, `prayerTimeCaches`,
`prayerLogs`, `shieldSelection`, `dhikrDaily`, `dhikrAggregate`, `userLocations`,
`userAchievements`, `userAchievementCounters`, `appConfig` (+ Better Auth tables).

---

## Appendix B — secrets / env

`wrangler secret` + `.dev.vars`. Bindings (`DB`/`KV`/`R2`/`SYNC`) live in
`wrangler.toml`, not secrets.

```
BETTER_AUTH_SECRET            # openssl rand -base64 32 (≥32 chars)
BETTER_AUTH_URL              # API base URL (per-env)
SITE_URL                     # https://heybarakah.app
NATIVE_APP_URL               # barakah://
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
APPLE_CLIENT_ID              # com.souravsspace.Barakah.signin
APPLE_APP_BUNDLE_IDENTIFIER  # com.souravsspace.Barakah
APPLE_CLIENT_SECRET          # output of packages/core/scripts/generate-apple-secret.ts
RESEND_API_KEY
RESEND_AUDIENCE_ID
RESEND_FROM                  # "Barakah <salam@heybarakah.app>"
RESEND_REPLY_TO              # hello@heybarakah.app
RESEND_AUTH_EMAIL            # "Barakah <no-reply@heybarakah.app>"
RESEND_WEBHOOK_SECRET        # whsec_...
POLAR_WEBHOOK_SECRET         # polar_whs_...
REVENUECAT_SECRET_KEY        # sk_... (server-side entitlement verify)
ALLOW_MOCK_SUBSCRIPTIONS     # dev only — MUST stay unset in prod
ALLOW_EXPO_ORIGINS           # CORS gate for Expo origins
DOCS_ENABLED                 # expose /doc + /docs (unset in prod)
```
