# Running & Testing Barakah (Cloudflare API)

How to run the `packages/api` Cloudflare backend, point the app/marketing at it,
configure the OAuth + webhook URLs, and test everything end to end.

> Backend = Hono + OpenAPI on Cloudflare (D1 / KV / R2 / Workers), in
> `packages/api`. Convex is fully removed. See `MIGRATION_CONVEX_TO_CLOUDFLARE.md`
> for the build record.

---

## 1. Base URLs & endpoint map

The API base URL depends on environment (set as `BETTER_AUTH_URL` for the API,
`EXPO_PUBLIC_API_URL` for the app, `PUBLIC_API_URL` for marketing):

| Env | API base URL |
|---|---|
| Local (`wrangler dev`) | `http://localhost:8787` |
| Cloudflare dev worker (`barakah-api-dev`) | `https://barakah-api-dev.<your-subdomain>.workers.dev` (after first deploy) |
| Production worker (`barakah-api`) | your custom domain, e.g. `https://api.heybarakah.app` |

Paths (relative to the base URL):

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

> Note: auth is mounted at `/api/auth/*` (NOT under `/api/v1`). Domain routes and
> webhooks are under `/api/v1`.

> **Docs gate:** `/api/v1/doc` + `/api/v1/docs` 404 (`{"message":"Not Found"}`)
> unless `DOCS_ENABLED=true` (or `DEBUG=true`) is set on the env — keeps the API
> surface unpublished in prod by default. Local: it's in `.dev.vars`; restart
> `wrangler dev` after adding it. Deployed: `wrangler secret put DOCS_ENABLED`.

---

## 2. OAuth redirect / callback URLs — how & where to set

Better Auth builds callbacks as `${BETTER_AUTH_URL}/api/auth/callback/<provider>`.
So whatever you set `BETTER_AUTH_URL` to (per environment) is the base.

### Google (Google Cloud Console → Credentials → OAuth 2.0 Client)
- **Authorized redirect URI:** `${BETTER_AUTH_URL}/api/auth/callback/google`
  - Local: `http://localhost:8787/api/auth/callback/google`
  - Dev worker: `https://barakah-api-dev.<subdomain>.workers.dev/api/auth/callback/google`
  - Prod: `https://api.heybarakah.app/api/auth/callback/google`
- Add every environment's URL you actually use.
- The `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` go into the API secrets.

### Apple (Apple Developer → Identifiers → Services ID → Sign in with Apple)
- **Return URL:** `${BETTER_AUTH_URL}/api/auth/callback/apple`
- **Domain:** the API host (e.g. `api.heybarakah.app`). Apple does not accept
  `localhost` — for local Apple testing use a tunnel (e.g. `cloudflared tunnel`)
  or test Apple only against the deployed worker.
- `APPLE_CLIENT_ID` = the **Services ID** (currently `com.souravsspace.Barakah.signin`),
  `APPLE_APP_BUNDLE_IDENTIFIER` = `com.souravsspace.Barakah`.
- `APPLE_CLIENT_SECRET` is the JWT from
  `packages/core/scripts/generate-apple-secret.ts` (expires ≤6 months — rotate).
- Native "Sign in with Apple" on iOS uses the bundle id directly; the Services ID
  return URL is for the web/relay flow.

### Email OTP
- **No redirect URL.** It is passwordless code-by-email: the app calls
  `/api/auth/email-otp/send-verification-otp` then `/api/auth/sign-in/email-otp`
  with the 6-digit code. The code is delivered by Resend (`RESEND_AUTH_EMAIL`
  sender). Nothing to configure in an OAuth console.

> After changing `BETTER_AUTH_URL`, also make sure the app's `EXPO_PUBLIC_API_URL`
> and marketing's `PUBLIC_API_URL` point at the same base, and that the origin is
> in the API CORS allow-list (web origins + `barakah://`; `exp://` only when
> `ALLOW_EXPO_ORIGINS` is set for dev).

---

## 3. Polar (purchases) — checkout, redirect, webhook

- **Marketing checkout link** lives in `packages/marketing/src/app-config.ts`
  (`POLAR_CHECKOUT_SANDBOX` in `astro dev`, `POLAR_CHECKOUT_PROD` in prod builds).
  It's a Polar-hosted checkout URL — no redirect URL to host yourself for the
  buy button.
- **Post-purchase redirect (success URL):** configure it in the **Polar
  dashboard** for the checkout link/product. Point it at a marketing success page
  or the app deep link (`barakah://`). Account linking does not depend on this
  redirect — it happens via the webhook + claim-by-email below.
- **Webhook URL (set in the Polar dashboard → Webhooks):**
  `${API_BASE}/api/v1/webhooks/polar`
  - Dev: `https://barakah-api-dev.<subdomain>.workers.dev/api/v1/webhooks/polar`
  - The webhook secret (`polar_whs_...`) → API secret `POLAR_WEBHOOK_SECRET`.
  - On `order.paid` the API records the order, activates a lifetime subscription,
    and queues a receipt email. It links to a user by `metadata.authUserId` if
    present, otherwise the buyer claims it in-app by email
    (`POST /api/v1/subscription/claim-polar`).

---

## 4. Resend (email) webhook

- **Webhook URL (Resend dashboard → Webhooks):**
  `${API_BASE}/api/v1/webhooks/resend`
- Signing secret (`whsec_...`) → API secret `RESEND_WEBHOOK_SECRET`.
- Used to mark queued emails bounced/complained. Signature is verified
  (constant-time) and stale deliveries (>5 min) are rejected.

---

## 4b. Realtime sync (WebSocket + Durable Object)

The app live-updates like Convex did — but over this Hono/Cloudflare backend. A
mutation on one device pushes an invalidation to the user's **other** devices,
which refetch (~300ms). No polling.

**How it works:**
- Per-user Durable Object `SyncHub` (`packages/api/src/sync/sync-hub.ts`) holds
  each device's WebSocket via the Hibernation API (idle connections cost ~0).
- After a successful mutation, `sync-notify` middleware derives a topic from the
  URL path and RPC-broadcasts it into the user's DO, which fans an
  `{type:"invalidate",topics}` frame out to every connected socket.
- Client (`packages/app/lib/sync-socket.ts`, started by `hooks/use-realtime-sync.ts`)
  maps each topic → React Query keys → `invalidateQueries`. Reconnects with
  exponential backoff, reconnects on app foreground, heartbeats every 25s.
- Endpoint: `GET /api/v1/sync` (auth-gated upgrade). Native sends the Better Auth
  `Cookie` header; web rides the credentialed cookie. URL derives from
  `EXPO_PUBLIC_API_URL` (`https://` → `wss://`).

**Topics → keys:** `prayer-logs` (→ prayer-logs, streak, achievements),
`achievements`, `locations`, `shield`, `subscription`, `me`. (dhikr is
client-local — no topic.)

**Deploy note:** `wrangler deploy --env development` applies the `SyncHub` DO
migration (`new_sqlite_classes`, in `wrangler.toml` under both top-level and
`[env.development]` — named envs don't inherit DO blocks). No DO = `/sync` 500s.

**Test (needs two clients on the same account):**
1. Sign in on two devices (or device + simulator).
2. On device A: log a prayer.
3. Device B's home/streak updates within ~1s **without any interaction** — no
   pull-to-refresh. Repeat for achievement unlock, location add/rename, shield
   toggle, subscription change, profile edit.
4. Background device B, mutate on A, foreground B → it reconnects and shows fresh
   data.
5. Watch it: `wrangler tail --env development` shows a `GET /api/v1/sync` 101 when
   a device connects.

---

## 5. Run & test the API

All commands from `packages/api` (or use the root passthrough `bun run *:api`).

```bash
# Install (repo root)
bun install

# Apply migrations to the LOCAL miniflare D1 (first run / after new migration)
bun run db:migrate            # local

# Start the API locally (wrangler dev → http://localhost:8787)
bun run dev

# In another shell — smoke-test it:
curl http://localhost:8787/api/v1/health           # -> {"status":"ok"} style
open  http://localhost:8787/api/v1/docs            # Scalar API explorer

# Run the test suite (vitest + @cloudflare/vitest-pool-workers, real D1/KV/R2
# via miniflare). Migrations auto-load from src/db/migrations — no .sql imports.
bun run test                  # 199 tests / 42 files

# Typecheck everything (repo root)
bun turbo typecheck
```

Local secrets for the API live in `packages/api/.dev.vars` (git-ignored). It must
contain the Appendix-B vars (see `MIGRATION_CONVEX_TO_CLOUDFLARE.md` §Appendix B):
`BETTER_AUTH_SECRET` (≥32 chars), `BETTER_AUTH_URL`, `SITE_URL`, `NATIVE_APP_URL`,
`GOOGLE_*`, `APPLE_*`, `RESEND_*`, `POLAR_WEBHOOK_SECRET`, `REVENUECAT_SECRET_KEY`,
and the dev gates `ALLOW_EXPO_ORIGINS` / `ALLOW_MOCK_SUBSCRIPTIONS`.

---

## 6. Does the app need a rebuild to test against the API?

**No native rebuild is needed for these changes** — all the API work is
server-side and the app changes are pure JS/TS (no native module / config-plugin
changes). So:

- **JS/TS changes** (hooks, screens, lib): just reload Metro —
  `cd packages/app && bun run start`, press `r` to reload. No prebuild.
- **You only need a native rebuild** (`bun run prebuild` + `bun run ios/android`)
  if you change native code, config plugins, `app.json`, or add a native dep —
  not the case here.

Point the app at the API by setting `EXPO_PUBLIC_API_URL` in `packages/app/.env`,
then restart Metro (env is inlined at bundle time):

- **iOS simulator / web:** `EXPO_PUBLIC_API_URL=http://localhost:8787`
- **Physical device:** `localhost` won't resolve — use your Mac's LAN IP
  (`http://192.168.x.x:8787`, run `wrangler dev --ip 0.0.0.0`) or a tunnel
  (`cloudflared`/`ngrok`), or point at the deployed dev worker.

> Apple/Google sign-in cannot use `localhost` as a redirect — for OAuth flows
> point the app at the deployed dev worker (or a tunnel) so the callback URL is
> reachable and registered in the provider console.

---

## 7. Marketing site

```bash
cd packages/marketing
bun run dev        # astro dev — uses the Polar SANDBOX checkout link
```

Set `PUBLIC_API_URL` in `packages/marketing/.env` to the API base (waitlist posts
to `${PUBLIC_API_URL}/api/v1/marketing/waitlist`).

---

## 8. Deploy to Cloudflare (Phase 9 — needs your secrets)

Dev CF resources already exist (D1 `barakah-db-dev`, KV, R2 — ids in
`wrangler.toml` `[env.development]`). To bring the dev API online:

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
#    - app  EXPO_PUBLIC_API_URL
#    - marketing PUBLIC_API_URL
#    - Google/Apple redirect URIs, Polar + Resend webhook URLs
```

Production (`barakah-api`) needs its D1/KV/R2 ids created and filled into
`wrangler.toml` (`database_id` is still a `<placeholder>`), then the same flow
without `--env development`. CI deploy: `.github/workflows/deploy-api.yml`.

---

## 8b. Cloudflare dev — update loop (run after each change)

The app points at the deployed dev worker (`EXPO_PUBLIC_API_URL=
https://barakah-api-dev.workers.dev`), so API changes are NOT live until you
redeploy. Match the command to what you changed:

| You changed | Run (from `packages/api`) |
|---|---|
| API code (routes/handlers/middleware/`src/sync/*`) | `wrangler deploy --env development` |
| DB schema (`src/db/schema.ts`) | `bun run db:generate` → `bun run db:migrate:dev` → `wrangler deploy --env development` |
| `wrangler.toml` bindings/DO/migrations | `wrangler deploy --env development` (applies new DO/migration) |
| A secret value (`.dev.vars`) | `wrangler secret put <NAME> --env development` (no redeploy needed) |
| Non-secret var (`[env.development.vars]`) | `wrangler deploy --env development` |
| App JS/TS only | nothing on CF — reload Metro (`r`) |
| App `.env` (`EXPO_PUBLIC_*`) | restart Metro (env inlined at bundle time) |

Always-true checks after a deploy:

```bash
cd packages/api
wrangler deploy --env development        # prints the live workers.dev URL
curl https://barakah-api-dev.workers.dev/api/v1/health     # smoke test
wrangler tail --env development          # live logs (watch /sync 101, errors)
```

> If `wrangler deploy` prints a URL different from `BETTER_AUTH_URL`, update all
> three (`wrangler.toml` `[env.development.vars] BETTER_AUTH_URL`, app
> `EXPO_PUBLIC_API_URL`, marketing `PUBLIC_API_URL`) **and** the Google/Apple
> redirect URIs + Polar/Resend webhook URLs to the new base — they must match.

> First-time only: push every secret (§8), run `db:migrate:dev`, register OAuth
> redirect URIs + webhooks. After that this loop is just `deploy` per change.

---

## 9. End-to-end test flows

1. **Email sign-in:** app → enter email → `send-verification-otp` → Resend
   delivers code → enter code → `sign-in/email-otp` → session cookie set.
2. **Prayer log:** log a prayer → `POST /api/v1/prayer-logs` returns updated
   streak + any newly-unlocked achievements (no extra round-trip).
3. **Purchase (Polar web):** buy via marketing checkout → Polar webhook →
   subscription activates → open app, claim by email if not auto-linked → paywall
   clears (RevenueCat SDK also reflects entitlement instantly).
4. **RevenueCat (in-app):** purchase in app → `POST /api/v1/subscription/revenuecat`
   verifies server-side and reconciles the D1 row (never overwrites a Polar one).
5. **Realtime sync:** two devices, same account → mutate on A → B updates within
   ~1s with no interaction (see §4b).

---

## 10. Checklist before a real run

- [ ] `packages/api/.dev.vars` filled (or worker secrets set for the deployed env)
- [ ] `BETTER_AUTH_SECRET` ≥ 32 chars
- [ ] `EXPO_PUBLIC_API_URL` (app) + `PUBLIC_API_URL` (marketing) point at the API
- [ ] Google/Apple redirect URIs registered for the chosen `BETTER_AUTH_URL`
- [ ] Polar webhook → `/api/v1/webhooks/polar`, Resend webhook → `/api/v1/webhooks/resend`
- [ ] Remote D1 migrated (`db:migrate:dev` / `:prod`) before first real traffic
- [ ] `SyncHub` DO migration applied (`wrangler deploy --env development`) for realtime
- [ ] `DOCS_ENABLED` set only where you want the API explorer exposed
- [ ] `ALLOW_MOCK_SUBSCRIPTIONS` unset in production
