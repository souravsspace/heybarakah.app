# Migration Plan — Convex → Hono API on full Cloudflare stack (`packages/api`)

Status legend: `[ ]` todo · `[x]` done · `[~]` in progress

---

## ⭐⭐ ACTIVE PHASE (2026-06-09, session 5) — REMOVE CONVEX FULLY, CF API ONLY

**Decision:** app is **pre-launch (no production users/data)** → no backfill, no
shadow-read, no rollback flag. End state: app + marketing talk **only** to the CF
Hono API; Convex is deleted. The earlier flag-gated dual-path (§10) was collapsed
into a straight CF-only conversion.

**Scope nuance:** `packages/core` is **NOT** deleted. It has `convex/` (backend →
DELETE) and `src/` (pure domain logic — prayer math, achievements, validators →
**KEEP**; reused by both app + `packages/api`). The only Convex coupling left in
`src/` is 4 files importing `convex/values` (`v`/`Infer`) → decouple (Phase 6).

### Removal phases (live status)

- [x] **Phase 1 — App data layer → CF-only.** Stripped Convex branches from the 10
  hooks/contexts so each uses the hono RPC client directly, zero convex imports:
  `contexts/user-context`, `lib/subscription`, `hooks/{use-locations,use-forced-update,
  use-widget-interactions,usePrayerLogs,useOfflineSync,useWidgetSync,usePrayerShield,
  usePrayerTimes}`. Collateral CF-type fixes in `locations`/`calc-method`/`profile`
  screens. App typecheck green; those dirs are convex-free.
- [x] **Phase 2 — App screens → CF-only.** All 8 direct-convex screens/components
  converted (one per-file commit each), zero convex imports, app typecheck green:
  `(app)/(tabs)/{home,locked,name,profile}`, `(app)/achievements`,
  `(settings)/{calc-method,personal-details}`, `components/achievement-popup-provider`.
  Wired: upsertProfile→`POST /me/profile` (+invalidate `["cf","me"]`); shield
  getMine/upsertIos/upsertAndroid→`/shield{,/ios,/android}` (react-query `["cf","shield"]`);
  avatar GET→`/me/avatar` (`["cf","me","avatar"]`), **setAvatar→`POST /me/avatar` RAW BYTES
  via `FileSystem.uploadAsync` to `${API_BASE_URL}/api/v1/me/avatar` + cookie replay
  (presign dropped)**; delete→`POST /me/delete`; achievements listForMe/listUnseen/markSeen
  →`/achievements{,/unseen}`+`POST /achievements/seen`. `z.unknown()` responses cast
  `as unknown as T`.
- [x] **Phase 3 — Auth + root layout → CF.** `lib/auth-client.ts` dropped
  `convexClient()`/`crossDomainClient()`, baseURL→`API_BASE_URL`; plugins now
  `emailOTPClient()` + (native-only) `expoClient()` — web rides the credentialed
  cookie, no plugin. `app/_layout.tsx` dropped `ConvexBetterAuthProvider`+
  `ConvexReactClient`+convex instance; `UserProvider` now sits directly under
  `QueryClientProvider`. `EXPO_PUBLIC_API_URL` added to app `.env`+`.env.example`
  (`env.ts` already declared it). App convex-free except Phase 4 flag/env cleanup.
  Typecheck green; per-file commits.
- [x] **Phase 4 — Remove `USE_CF_API` flag + Convex env vars.** `lib/cf-flag.ts`
  now exports only `API_BASE_URL` (= `env.EXPO_PUBLIC_API_URL`, no `?? ""`).
  `env/app.ts` dropped `EXPO_PUBLIC_CONVEX_URL`/`_SITE_URL` + `EXPO_PUBLIC_USE_CF_API`;
  `EXPO_PUBLIC_API_URL` is required (`z.url()`). App `.env`/`.env.example` cleaned.
  Grep `USE_CF_API`/`EXPO_PUBLIC_CONVEX` in app+env = CLEAN. Typecheck green.
- [x] **Phase 5 — Marketing → CF.** `lib/convex.ts`→`lib/waitlist.ts` (fetch
  `POST ${PUBLIC_API_URL}/api/v1/marketing/waitlist`); `WaitlistForm` repointed;
  `env/marketing.ts` + `.env.example` `PUBLIC_CONVEX_URL`→`PUBLIC_API_URL`. Marketing
  src convex-free.
- [x] **Phase 6 — Decouple `core/src` from `convex/values`.** 4 files: `subscriptions/
  validators.ts` (pure `as const` unions + types), `subscriptions/index.ts` (drop `Infer`,
  import types from validators), `shieldSelection/validators.ts` (keep `ALL_WINDOWS`/
  `PrayerWindow`, drop `prayerWindow`/`shieldSelectionFields`), `users/validators.ts`
  (keep `validateProfileInput`+consts, drop `profileFields`). core/src convex-free;
  core+api typecheck green; **api 164 tests green**.
- [x] **Phase 7 — Delete `core/convex/` backend + convex deps.** (7a) `git rm` convex/,
  convex.json, scripts/reset-db.{ts,test.ts}; core dropped dev/dev:setup/reset:db scripts
  + `./convex/*` exports + convex api re-export from index.ts; **collateral fix:** core
  tsconfig now `types:["bun"]` (deleted reset-db.ts had been the only `import "bun"` that
  loaded @types/bun globals for bun:test/process). (7b) dropped convex/@convex-dev deps
  from core/app/marketing(+dead @barakah/core)/root catalog, `dev:convex` script, stale
  `reset:db`; `bun install` → lockfile convex-free.
- [x] **Phase 8 — Verify.** turbo typecheck **6/6 green**; api **164 tests green**;
  `rg -i convex` (excl design bundle + this doc + node_modules) = only historical
  comments + api/CLAUDE port-target refs, **zero imports/code/deps**. Config swept
  (turbo env `PUBLIC_CONVEX_URL`→`PUBLIC_API_URL`, biome dropped `convex/_generated`
  ignore); docs swept (core/app CLAUDE.md). 9 ultracite errors remain but are
  **pre-existing**, unrelated to convex (backfill script, testimonial.tsx, plugin, 2 tests).
- [ ] **Phase 9 — Deploy CF API.** 🔴 **BLOCKED on user secrets** (Appendix B):
  `wrangler secret put …`, `db:migrate:dev`, `wrangler deploy --env development`,
  set `EXPO_PUBLIC_API_URL`. Dev CF resources exist; prod ids still placeholder.

> §1–§10 below are the **build record** (backend is built + hardened: 164 vitest /
> 40 files green, `db.batch()` atomicity, polar workerd smoke). They remain for
> reference; the active work is the removal phases above.

---

> **Progress (2026-06-09, session 4):** doc-sync pass — ticked stale §7 boxes
> (40 test files / **163 green**; coverage is **domain-level** not strict per-file →
> §7 sibling-file boxes marked `[~]`/`[ ]` honestly). **DEV CF resources confirmed
> live** (D1/KV/R2 ids set, local `db:migrate` clean); **PROD resources still
> pending**. Added root passthrough scripts (`dev:api`/`test:api`/`build:api`/
> `db:migrate:api[:dev|:prod]`/`deploy:api`/`reset:db:api`) + split api `db:migrate`
> into local/dev/prod. graphify graph refreshed. **§8b backend hardening DONE:**
> unbounded-collect guard already satisfied (every list query `.limit()`-bounded);
> **`db.batch()` atomicity** added to `logPrayer`/`clearPrayer` (log+counter, SQL
> `max(0,…)` increment), polar `recordPaidOrder` (order+sub), `claimPolarByEmail`
> (+ PK-collision rollback test); **`@polar-sh/sdk` workerd smoke GREEN**
> (`deploy --dry-run` = 1.5 MB gzip, well under 3 MB). **164 vitest tests / 40 files
> green, repo typecheck green.** Remaining B (optional): observability (Sentry/Logpush;
> wrangler `observability.enabled=true` already on). **Next: §10 app cutover (C).**
>
> **Progress (2026-06-09, session 3):** code-review of §5/§6/§8b/§9 done (one fix
> landed: idempotency skips `/api/auth/*` so replay can't drop Set-Cookie). **§10
> cutover started, flag-gated (`USE_CF_API`, default OFF — Convex stays live):**
> Hono RPC typed client + d.ts build pipeline (tsc-alias) + env flag + React Query
> provider/managers + **`use-locations` reference dual-path** + tested Convex→D1
> **backfill transform/runner** (run deferred). **163 vitest tests / 40 files green, full repo
> typecheck green.** Remaining §10: ~18 hooks/screens + auth-client (mechanical via
> the proven pattern), avatar-blob copy, live backfill + flag-flip (need creds).
> **Earlier (session 2):** §1–§7 + §8b core + §9 ops done. Deviations: avatar upload
> worker-proxied; auth emailOTP+social (no anonymous); inline-HTML emails; RPC needs
> a built `.d.ts` (cross-package `@/` alias). **Open review findings (not blocking,
> documented):** resend webhook fail-open when secret unset; non-constant-time sig
> compare + no svix-timestamp window; email-queue sweep claim race (overlap → rare
> double-send); rate-limit KV read-modify-write is soft + per-user budget TODO;
> `db.batch()` atomicity + unbounded-collect still deferred. **Also open:** create
> prod CF resources (`wrangler login`); verify `@polar-sh/sdk` under workerd.

---

## ⭐ READ FIRST — cold-start context (for a brand-new session)

You are migrating the **Barakah** app's backend from **Convex** (`packages/core`)
to a new **Hono + OpenAPI API on a full Cloudflare stack** (`packages/api`).

**Goal:** new `packages/api` replicates the `@barakah/core` Convex surface.
Fully Cloudflare: **D1** (database), **KV** (redis-like cache + Better Auth
secondary storage), **R2** (avatar/file storage), **Workers** (deploy).
Every source file in the new package gets a colocated `*.test.ts`.

**Hard constraint:** do **NOT** remove or break `packages/core`. It stays live.
`packages/api` is built + verified in parallel; app cutover is a later, flag-gated
phase (§10). Core retires only after cutover is proven.

**Reference design:** sou'rav's older `texly.chat-api` (Hono + `@hono/zod-openapi`
+ vendored `stoker` helpers + drizzle/d1, per-route `*.routes/*.handlers/*.index/*.test`).

### Repo facts

- **Monorepo**, package manager **Bun**, task runner **Turbo**, linter **ultracite** (Biome).
- Packages: `app` (Expo RN), `core` (Convex backend — *source of truth to port*),
  `marketing` (Astro), `mails` (`@barakah/mails` email templates), `env`, `tsconfig`.
- Shared deps via **Bun catalog** in root `package.json` (`"workspaces.catalog"`):
  `zod ^4`, `better-auth ~1.6.9`, `@better-auth/expo ~1.6.9`, `typescript ~6`, `convex ^1.38`.
- Current git branch: **`dev`** (main branch = `main`).
- Conventions (root `CLAUDE.md`): **per-file commits**, run `bun x ultracite fix`
  + `bun turbo typecheck` before each commit, conventional commits
  `type(scope): summary`. Simplicity-first, surgical changes, TDD-friendly goals.
- `bun:test` for pure logic; this migration uses **vitest** for binding-backed tests (§7).

### Where things live (port FROM → TO)

| From (`packages/core`) | To (`packages/api`) |
|---|---|
| `convex/schema.ts` (12 app tables) | `src/db/schema.ts` Drizzle sqlite tables |
| `convex/lib/*.ts` (query/mutation/action handlers) | `src/routes/<domain>/*.handlers.ts` |
| `convex/http.ts` (auth + polar + resend routes) | `src/routes/webhooks/*` + auth mount |
| `convex/lib/auth.ts`, `auth.config.ts` | `src/auth/index.ts` (`better-auth-cloudflare`) |
| `src/<domain>/*.ts` (pure logic + validators + tests) | **reused as-is** via `@barakah/core/<domain>` import |

> **Key insight:** `packages/core/src/*` is framework-agnostic (pure domain logic,
> validators, already-passing tests). Import and reuse it directly — do **not**
> rewrite prayer math, achievement eval, polar parsing, revenuecat sync, etc.
> Only the Convex *handlers* (`convex/lib/*`) + schema + http routing get reimplemented.

### Commands (run inside `packages/api` once scaffolded)

```bash
bun run dev            # wrangler dev (local D1/KV/R2 via miniflare)
bun run typecheck      # tsc --noEmit
bun run test           # vitest (@cloudflare/vitest-pool-workers)
bun run db:generate    # drizzle-kit generate
bun run db:migrate     # wrangler d1 migrations apply
bun run deploy         # wrangler deploy
# from repo root:
bun turbo typecheck    # all packages
```

### How to resume

1. Find the first unchecked `[ ]` task below (phases run top-to-bottom, §1→§9).
2. Read the referenced `packages/core` file(s) for the behavior to replicate.
3. Write the file **and its `*.test.ts`** (TDD where logic is non-trivial).
4. `bun x ultracite fix` → `bun turbo typecheck` → per-file commit.
5. Check the box here, commit the doc update, move on.

---

## ⚙️ EXECUTION RULES — mandatory for EVERY task

1. **Test-Driven Development — test first, ALWAYS.** Write the `*.test.ts` before
   the implementation. Red → green → refactor. No source file is "done" until its
   colocated test exists and passes. Use the **`test-driven-development`** skill.
   For any bug found mid-migration use **`systematic-debugging`** (repro test first).
2. **Use context7 / `find-docs` for every library — never code from memory.**
   Training data is stale; fetch up-to-date docs + API signatures *before* writing
   against any lib (list in Skill & Docs map below). Verify version against the
   repo's Bun **catalog** in root `package.json`.
3. **Invoke the proper skill for the task** (Skill & Docs map below).
4. **Definition of Done (per file):** test written first + passing →
   `bun x ultracite fix` → `bun turbo typecheck` (zero errors) → per-file
   conventional commit → check the box in this doc.
5. **After each phase:** run the **`code-review`** / `requesting-code-review` skill
   before moving on.
6. **Keep `packages/core` untouched — never delete or modify any code in it.**
   `packages/core` (all of `convex/` and `src/`) stays live and intact for the
   entire migration. Reuse `@barakah/core/src/*` by importing; never edit core to
   fit the new package. The Convex backend keeps running until cutover (§10) is
   proven, and core is retired only as a separate, explicit task after that.
7. **Follow the repo `CLAUDE.md` files exactly** (root + `packages/api/CLAUDE.md`
   once created). Non-negotiables: per-file commits (never `git add .`),
   `bun x ultracite fix` + `bun turbo typecheck` before every commit, conventional
   commit format `type(scope): summary` (scope `api`), simplicity-first (minimum
   code, nothing speculative), surgical changes (touch only what the task needs),
   `unknown` over `any`, always `await` + `try/catch`, no file-path header comments.
   Design/UI work (the §10 app client) must consult `design/` first.
   ⚠️ **Runtime caveat:** root `CLAUDE.md` says use `Bun.file`/`Bun.$`/`Bun.env` —
   that applies to Bun-run scripts/tests, **not** the Worker runtime (workerd). In
   `packages/api` *runtime* code use **Web/Workers APIs** (Web Crypto, `fetch`,
   bindings), not `Bun.*` or `node:*` (enable `nodejs_compat` only where a dep needs it).

### Skill & Docs map

| Task area | Skill | context7 / docs to fetch first |
|---|---|---|
| D1 schema + indexes (§3) | `database-schema-design` | Drizzle ORM (sqlite/d1), `drizzle-kit` |
| Routes + OpenAPI contract (§5) | `api-design` | `@hono/zod-openapi`, Hono on Workers, Scalar |
| Auth (§4) | — | `/zpg6/better-auth-cloudflare`, `better-auth` (catalog ~1.6.9), `@better-auth/expo` |
| Tests (all) | `test-driven-development` | `@cloudflare/vitest-pool-workers`, `vitest` |
| Storage / cache (§6) | — | R2 (presigned PUT), Workers KV, Workers Cache API |
| Webhooks (§6) | — | Polar SDK webhook verify, `resend` SDK + webhook |
| Deploy / cron / bindings (§1,§9) | — | `wrangler.toml`, D1 migrations, Cron Triggers |
| Query efficiency (§3,§5) | `performance-optimization` | D1 `batch()`, index usage |
| Commits | `git-workflow` | — |
| App client (§10) | `expo:native-data-fetching`, `expo:expo-api-routes` | React Query, Hono RPC client |
| Bug triage | `systematic-debugging` | — |

> Run `find-skills` if a task needs a capability not listed here.

---

## Service mapping (Convex → Cloudflare)

| Convex concept | Cloudflare replacement | Notes |
|---|---|---|
| tables + indexes | **D1** (SQLite) + Drizzle | one Drizzle table per `defineTable`, indexes → `index()` |
| queries/mutations/actions | **Hono routes** (`@hono/zod-openapi`) | read=GET, write=POST; `internalMutation` → internal service fn, never HTTP-exposed |
| reactivity (`useQuery` live) | **React Query (polling)** | see §8 — no Durable Objects in v1 |
| Better Auth (`@convex-dev/better-auth`) | **`better-auth-cloudflare`** (D1+KV) | anonymous + email + Apple + Google + Expo |
| file storage (avatars) | **R2** | presigned PUT upload, proxied/public GET |
| prayer-time cache table | **KV hot blob + D1 metadata row** | KV `cacheKey→JSON` TTL=`expiresAt`; D1 durable record |
| `@convex-dev/resend` | **`resend` SDK** + KV/D1 idempotency | webhook handler ported |
| Convex scheduler | **Workers Cron Triggers** | cache-expiry sweep, email retry |
| Convex env / dashboard secrets | **`wrangler secret`** + `.dev.vars` | full list in §Appendix B |

---

## 0. Research & decisions — DONE

- [x] Inventory Convex surface (schema, http, auth, **42 exported functions** incl. 2 public actions `syncRevenueCatEntitlement`+`refreshPrayerTimes` / 13 domains). Full map in Appendix A.
- [x] Confirm `packages/core/src/*` is portable as-is; only `convex/lib/*` + schema + http reimplemented.
- [x] Reference architecture = `texly.chat-api` Hono layout.
- [x] Validate stack via context7: `better-auth-cloudflare` (`/zpg6/better-auth-cloudflare`) = D1+KV+R2+geolocation on Hono with **anonymous** plugin (matches app's anon+Expo auth). KV is Better Auth secondary storage; min KV TTL 60s → rate-limit `window: 60`.
- [x] `find-skills` run; using `api-design`, `database-schema-design`, `test-driven-development`, `code-review`, context7.
- [x] **Decision (§7):** test runner = **vitest + `@cloudflare/vitest-pool-workers`** (D1/KV/R2 bindings need miniflare; `bun:test` can't bind them). Pure `src/` logic stays on its existing `bun:test` inside core.
- [x] **Decision (§8):** **React Query polling, NO Durable Objects in v1.** Rationale below.

---

## 1. Package scaffold — `packages/api`

- [x] `package.json` (`@barakah/api`, type module). Deps: `hono`, `@hono/zod-openapi`, `@scalar/hono-api-reference`, `drizzle-orm`, `drizzle-zod`, `better-auth` (catalog), `better-auth-cloudflare`, `@better-auth/drizzle-adapter`, `@better-auth/expo` (catalog), `resend`, `@polar-sh/sdk`, `zod` (catalog), `@barakah/core` (workspace, for `src/` reuse), `@barakah/mails` (workspace). Dev: `wrangler`, `drizzle-kit`, `@cloudflare/workers-types`, `@cloudflare/vitest-pool-workers`, `vitest`, `@types/bun` (catalog). _(versions verified via npm+context7; @scalar/hono-api-reference & @polar-sh/sdk aligned to core 0.47.1)_
- [x] **Verify core's transitive runtime deps bundle in workerd** — `wrangler deploy --dry-run --env development` builds clean: **gzip 1513 KiB (~1.5 MB)** vs 3 MB paid limit (comfortable). `@polar-sh/sdk` is **type-only** in core (`import type` in `polar/webhook.ts` — erased); the runtime value import is `@polar-sh/sdk/webhooks` (`validateEvent`) in `polar.index.ts`, which loads + runs under workerd (polar.test.ts exercises valid/invalid-sig under vitest-pool-workers). `adhan`/`disposable-email-domains`/`resend` all bundle fine.
- [x] `wrangler.toml` — name, `compatibility_date`, `compatibility_flags=["nodejs_compat"]`, `main=src/index.ts`, bindings: `[[d1_databases]]`, `[[kv_namespaces]]`, `[[r2_buckets]]`, `[vars]`, `[env.development]`. _(bindings named `DB`/`KV`/`R2` per §2; ids are placeholders pending §9 resource creation)_
- [x] `tsconfig.json` extends `@barakah/tsconfig`, alias `@/* → ./src/*`. _(extends `api.json`; dropped `baseUrl` — deprecated in TS7)_
- [x] `drizzle.config.ts` (sqlite, driver `d1-http`, out `./src/db/migrations`).
- [x] `.dev.vars.example` mirroring §Appendix B secrets. _(+ `.gitignore` for `.dev.vars`/`.wrangler`)_
- [x] Scripts: `dev typecheck test db:generate db:migrate deploy cf:typegen`; ultracite wired.
- [x] Register in root workspace + turbo pipeline (`typecheck`, `test`, `build`). _(workspace globs `packages/*`; added `test` task to turbo.json)_
- [x] `packages/api/CLAUDE.md` — package guide (structure, route/handler/test convention, runtime caveat re no `Bun.*`/`node:*`, TDD rule, commands) mirroring `packages/core/CLAUDE.md` style.

## 2. Core app harness (port from texly layout)

- [x] `src/env.ts` — Zod env schema; read from `c.env` Workers bindings (no global singleton). _(diverged from texly's dotenv/process.env singleton per Execution Rule 7; added `parseEnv` + `isTruthyFlag`)_
- [x] `src/lib/create-router.ts` — `OpenAPIHono<AppBindings>` + `defaultHook`.
- [x] `src/lib/create-app.ts` — CORS (Expo `exp://`/`barakah://`/`file://`, app + marketing origins, `*.workers.dev`; gate by `ALLOW_EXPO_ORIGINS`), logger, notFound, onError. _(auth middleware mount deferred to §4 — needs `createAuth`)_
- [x] `src/lib/configure-open-api.ts` — `/doc` + Scalar `/docs`. _(`Scalar()` plugin; bearer securityScheme)_
- [~] `src/middlewares/*` — logger ✓, KV rate-limit ✓. **auth-session resolver (`c.set("user", …)`) deferred to §4** (needs auth).
- [x] `src/stoker/*` — http-status-codes/phrases (verbatim) + `not-found`/`on-error` + `default-hook`/`jsonContent(+Required)`/`createMessageObjectSchema`. _(zod4-correct minimal subset; texly's vendored copy was zod3-broken — `one-of`/`create-error-schema`/param schemas deferred until a route needs them)_
- [x] `src/types/app-type.ts` — `AppBindings { Bindings:{DB,KV,R2,…env vars}; Variables:{logger} }`, `AppRouterHandler`. _(`user`/`auth` Variables added in §4)_
- [x] Tests: `create-app.test.ts` (CORS allow/deny + 404 shape), `env.test.ts`, logger + rate-limit tests. **13 passing** on `@cloudflare/vitest-pool-workers` v4 (`cloudflareTest()` plugin — `defineWorkersConfig` removed in 0.16.x). _(401-unauth test lands in §4)_

## 3. Database layer — D1 + Drizzle

- [x] `src/db/schema.ts` — translate all **12** app tables (§Appendix A) with matching indexes; JSON cols (`raw`, `comparison`, `timings`, `prayersToLock`, arrays) → TEXT `mode:"json"`. Field-shape unions mirror core validators (`$type` annotations; runtime validation stays in routes). _(every table gets a uuid `id` PK + `authUserId` text; `image`/`activePrayerLocationId` are now plain text — R2 key / FK)_
- [x] `src/db/index.ts` — `createDatabase(d1)` drizzle factory (+ `Database` type).
- [x] `src/lib/json-columns.ts` — safe parse/stringify helpers + `json-columns.test.ts`.
- [x] `bun x drizzle-kit generate` → initial migration `0000_swift_mojo.sql` (12 tables, 25 indexes). _(apply to **real** D1 deferred to §9 — needs `wrangler login` + created DB; tests apply it to miniflare)_
- [x] `schema.test.ts` — asserts 12 tables + key index names + round-trips user/shield(json)/prayerLog(enum) on miniflare D1 (migration applied in `beforeAll`).
- [x] Port `scripts/db` seed/clear + test → `scripts/reset-db.ts` (clears all 12 tables via `wrangler d1 execute`, `--remote` flag) + `reset-db.test.ts`. _(Convex JSONL-reset reimagined for D1)_

## 4. Auth — `better-auth-cloudflare`

> ⚠️ **Inventory correction (verified 2026-06-08).** The original §0 inventory
> ("anonymous + email + Apple + Google + Expo") was WRONG. The real surface
> (`packages/app/lib/auth-client.ts` + `convex/lib/auth.ts` + app screens) is
> **emailOTP (passwordless) + Apple + Google + Expo + deleteUser** — **no
> anonymous plugin, no email/password** anywhere. Convex-only `convex()`/
> `crossDomain()` plugins are dropped (web uses the cookie via CORS credentials).
> User chose "match the real app". This also shrinks the #1 `authUserId`-continuity
> risk: there are no anon-only users to relink. Transport for **both** web and
> Expo is the session **cookie** (the `@better-auth/expo` client stores Set-Cookie
> and replays it) — not a raw Bearer token.

- [x] `src/auth/send-otp.ts` — Resend SDK OTP send (inline brand email; react-email NOT reused at runtime — Worker pins `jsxImportSource: hono/jsx` + avoids `react-dom/server` bundle bloat). _(+test)_
- [x] `src/auth/index.ts` — dual-mode `createAuth(env?, cf?, baseURL?)` (CLI schema-gen + runtime); `withCloudflare({ d1, kv, autoDetectIpAddress, geolocationTracking })`. **R2 omitted from withCloudflare** — avatars use our own `lib/r2.ts` (§6), not Better Auth's file API. _(+test)_
- [x] Plugins: `emailOTP({ sendVerificationOTP })` + `expo()`; social **Apple** (`appBundleIdentifier`) **+ Google**; `emailAndPassword` disabled; `user.deleteUser.enabled`; `trustedOrigins` (site, `barakah://`, `appleid.apple.com`, `exp://` gated by `ALLOW_EXPO_ORIGINS`). Ported from `convex/lib/auth.ts`.
- [x] ~~Anonymous→real account linking~~ — **N/A**: app never used anonymous auth. Dropped.
- [x] Generate Better Auth tables via `@better-auth/cli generate` → `src/db/auth-schema.ts` (**singular** `user`/`account`/`session`/`verification`, `usePlural:false` — avoids colliding with the app `users` profile table); wired into `schema` export; migration `0001_legal_solo.sql`. _(`scripts/reset-db` clears them too)_
- [x] KV rate-limit via `withCloudflare` (window 60; custom rules `/sign-in/email`, `/sign-in/social`).
- [x] `src/middlewares/auth-session.ts` — per-request `createAuth` → `getSession({headers})` → `c.var.user` (null-safe) + `c.var.auth`; `requireUser` → 401. Mounted in `create-app` with `/api/auth/*` catch-all.
- [x] `auth.test.ts` — emailOTP send (mocked) → sign-in → cookie session resolves under same id (authUserId continuity); unauth get-session null; `index.test.ts` covers plugin set, social config, trustedOrigin gate, 401.

## 5. Domain routes — `routes/<domain>/{*.routes,*.handlers,*.index,*.test}.ts`

> Per Convex fn: `query`→GET, `mutation`→POST, `internalMutation`→internal service fn (called by webhooks/crons, not HTTP). Reuse `@barakah/core/src/*` logic + validators verbatim. Full endpoint map in §Appendix A.

- [x] **users** — `getMyAccount`, `upsertProfile`, `deleteMyAccount`(P0 purge) + `getMyAvatarUrl`/`setAvatar` (R2). ⚠️ **Deviation:** avatar upload is **worker-proxied PUT** (`POST /me/avatar` raw bytes → validate → `R2.put`; public blob proxy `GET /avatars/:id`), NOT presigned — user chose binding-only (no aws4fetch/S3 creds). `generateAvatarUploadUrl` dropped (presign N/A). `purgeUserData` is set-based D1 DELETEs across all user-keyed tables + R2 blob + BA user/account/session; KV sessions TTL-expire. Tests cover purge (zero rows + no blob) + avatar + auth/422.
- [x] **subscriptions** — `getMySubscription`, `claimPolarByEmail`, `claimMockSubscription` (gate by `ALLOW_MOCK_SUBSCRIPTIONS`), **`syncRevenueCatEntitlement`** (public action → `POST /subscription/revenuecat`; verifies entitlement server-side via `REVENUECAT_SECRET_KEY`, then calls internal `applyRevenueCatEntitlement`). **Preserve source precedence: RC must NOT overwrite Polar-owned.** Reuse `subscriptions/validators` + `sync-revenuecat` (tested). Precedence test first (TDD).
- [x] **prayerLogs** — `getMyWeek`, `logPrayer`, `getStreak`, `clearPrayer`. Reuse `prayer/log-status`. **`logPrayer` response returns updated streak + newly-unlocked achievements** (see §8). Tests.
- [x] **prayerTimes** — `getCachedPrayerTimes` (KV→D1→compute), **`refreshPrayerTimes`** (public action → `POST /prayer-times/refresh`; fetch AlAdhan → `upsertPrayerTimesCache`), internal `upsertPrayerTimesCache`. Reuse `prayer/{aladhan,adhan-js,cache-key,normalize}` (AlAdhan primary, adhan-js fallback). KV-hit + D1-fallback + compute tests.
- [x] **shieldSelection** — `getMine`, `upsertIos`, `upsertAndroid`, `setWindows`, `setEnabled`. Tests.
- [x] **dhikr** — `getToday`, `increment`, `setTarget`, `reset`. Tests.
- [x] **achievements** — `listForMe`, `listUnseen`, `markSeen`; internal `runEvaluate` (invoked inside `logPrayer` handler). Reuse `achievements/{evaluate,calendar,definitions}` (tested). Eval-trigger test.
- [x] **userLocations** — `listMine`, `create`, `rename`, `remove`, `setActive`. Tests.
- [x] **marketing** — `joinWaitlist` (POST; disposable-email check). Reuse `marketing/{waitlist,emails}`. Tests.
- [x] **appConfig** — `getAppConfig`; internal `setAppConfig`. Min-version gate test.
- [x] **healthCheck** — `GET /health`. Test.

## 6. Webhooks, storage, cache libs

- [x] `routes/webhooks/polar` — port `convex/lib/polar.ts` `webhook` → Hono POST. Sig verify, `recordPaidOrder`, queue/mark confirmation email, claim-by-email. Reuse `polar/webhook` parser. Idempotency via D1 `by_polarOrderId`. Tests (valid/invalid sig, dup, claim).
- [x] `routes/webhooks/resend` — port `resend.ts` handler + `handleEmailEvent`. Tests.
- [x] `lib/resend.ts` — Resend SDK send + event idempotency (KV/D1). Reuse `@barakah/mails`. Tests.
- [x] **Rebuild durable email queue/retry** — Convex used `@convex-dev/resend` which gave a durable queue + automatic retry + delivery tracking. Raw `resend` SDK has none. Replicate with a D1 `emailQueue` table (status: queued/sent/failed, attempts, lastError) driven by the polar `queueOrderConfirmationEmail`/`markOrderEmailConfirmed`/`clearOrderConfirmationEmailQueued` flow + a Workers cron retry sweep (§9). Tests: enqueue→send→mark, failure→retry→give-up.
- [x] `lib/r2.ts` — avatar put/get/delete, presigned URL, content-type allowlist, size cap. Tests.
- [x] `lib/kv-cache.ts` — typed get/set/del with TTL + namespacing. Tests.

## 7. Testing — vitest + `@cloudflare/vitest-pool-workers` (DECIDED) — TEST FIRST

> **TDD is mandatory (Execution Rule 1).** Every file: write the failing test
> first, then implement to green, then refactor. A file without a passing
> colocated test is not done.

- [x] `vitest.config.ts` with `@cloudflare/vitest-pool-workers`; local D1/KV/R2 bindings; per-test isolated storage; seed/reset helpers (ported `scripts/db`).
- [~] Colocated `*.test.ts` coverage. **Deviation:** coverage is **domain-level**, not strict per-file — each domain has `<domain>.test.ts` (route end-to-end via `testClient`) + `<domain>.service.test.ts` (handler logic); the `*.handlers/*.routes/*.index` files are tested through those, not via their own sibling test. 40 test files / **163 tests green**.
- [x] Test client = `testClient(createTestApp(router))` (texly pattern) with auth session header.
- [ ] CI gate: a check that fails if any non-index `*.ts` lacks a sibling `*.test.ts`. **Not done** (would fail today — coverage is domain-level, see above). PR workflow runs `turbo test` but has no sibling-file assertion.
- [x] Start each business-critical domain with its test from core (e.g. port `sync-revenuecat.test.ts`, `polar/webhook.test.ts`, `prayer/*.test.ts` expectations) → drive handler impl.
- [x] Pure `src/` logic keeps its existing `bun:test` in `@barakah/core` (don't duplicate).

## 8. Reactivity — React Query polling, NO Durable Objects in v1 (DECIDED)

**Why not Durable Objects / WebSocket push:** under REST, almost every "live" need
dissolves — pushing it would be speculative infra (violates Simplicity-First). Concretely:

- **Achievements unlock:** evaluated server-side *inside* the `logPrayer` POST.
  Return newly-unlocked achievements **in the mutation response** → instant toast,
  zero realtime. `listUnseen` is just an app-open fallback for cross-device unlocks.
- **Prayer streak/week:** `logPrayer` returns the updated streak in its response;
  same-device writes need no push. Shield/DeviceActivity native writes already flow
  through the app group, then sync via API on next foreground.
- **Subscription / paywall unlock:** the **RevenueCat SDK** exposes entitlement
  client-side instantly (its own `customerInfo` listener) — paywall closes without a
  server roundtrip. The D1 subscription row is backend reconciliation, fine to fetch
  on-focus + short poll while the paywall/“restoring” screen is open.
- **Cross-device / server-driven events** (Polar *web* purchase claimed, RC renewal):
  use existing **Expo push** as an out-of-band invalidation signal → client
  invalidates the relevant React Query key on receipt → refetch.

**v1 client policy (app side, §10):**

| Data | Strategy |
|---|---|
| `getMyAccount`, `appConfig`, `userLocations`, `shieldSelection` | fetch on focus, long `staleTime` |
| `prayerLogs` week/streak, `dhikr` today | mutation returns fresh state + `refetchOnFocus` |
| `achievements` | returned in `logPrayer` response + `listUnseen` on app-open |
| `subscription` | RC SDK for instant UX; API on-focus + 3s poll only while paywall/restore open |
| cross-device events | Expo push → query-key invalidation |

- [ ] Document this in app client wrapper when cutover happens (§10). Mutations MUST return derived/side-effect state so the client avoids extra round-trips.
- [x] **Durable Objects explicitly OUT OF SCOPE for v1.** Revisit only if a concrete live-collaboration feature appears.

## 8b. Cross-cutting concerns (apply across ALL phases)

- [x] **API versioning** — base path `/api/v1` (texly pattern); keeps room for v2.
- [x] **Idempotency** — mobile retries duplicate writes. Accept an `Idempotency-Key`
  header on mutations (`logPrayer`, `increment`, claims) → dedupe via KV (TTL) before
  applying. Test double-submit returns same result, no double-write.
- [x] **General rate limiting** — KV-backed limiter middleware on all routes (not just
  auth), window ≥60s. Per-user + per-IP. Test 429 path.
- [x] **Input validation & limits** — Zod on every body/param/query (OpenAPI gives this);
  enforce max body size; reject unknown fields. Test invalid input → 422.
- [x] **Unbounded-collect guard** — every list query is already bounded with `.limit()`
  (done during §5): `WEEK_PRAYER_LOG_LIMIT`, `STREAK_MAX_LOOKBACK*5+10`, `LIST_PRAYER_LOG_LIMIT`,
  `EVALUATE_*`, `ACHIEVEMENTS.length+10`, `MAX_LOCATIONS+1`, dhikr per-user caps. Date-range
  bounds on prayerLogs/dhikr; fixed caps on achievements/locations (small, non-growing sets).
  No `.collect()`-equivalent unbounded read remains.
- [x] **Timezone correctness** — prayer times + logs are tz-sensitive; D1 stores ISO
  strings. Centralize date/tz helpers; reuse `@barakah/core/src/prayer` cache-key tz
  logic. Tests across tz boundaries (day rollover).
- [x] **Atomicity** — multi-row writes use `db.batch()` (D1's only txn primitive — drizzle
  `db.transaction()` throws on D1). Batched paths: `logPrayer`/`clearPrayer` (log + counter,
  counter increment via SQL `max(0, col+delta)` expr so the write needs no stale-read value),
  polar `recordPaidOrder` (order + subscription), `claimPolarByEmail` (sub + order link writes).
  Partial-failure rollback proven by a PK-collision batch test (neither row persists).
  *Single-row writes* (`applyRevenueCatEntitlement`, `claimMock`) need no batch.
  *Achievement eval* stays sequential — it's idempotent + re-runs on every `logPrayer`.
- [ ] **Observability** — Workers tail logs + structured logger; wire error reporting
  (Sentry or Logpush). Health route pings D1. No secrets in logs.
- [x] **Error contract** — consistent shape via vendored `stoker` onError/notFound;
  prod hides stack. Test shape.
- [x] **Secrets hygiene** — `.dev.vars` git-ignored; never commit `.p8`/keys; secrets via
  `wrangler secret` only (§Appendix B).

## 9. Deployment & ops

- [x] **PR CI workflow** (separate from deploy) — `bun install` → `turbo typecheck` + `turbo test` (vitest workers pool) on PRs touching `packages/api/**`. Block merge on red.
- [x] `.github/workflows/deploy-api.yml` — `wrangler secret put` each §Appendix B var, `d1 migrations apply --remote`, `wrangler deploy`. Trigger: `main` + path `packages/api/**`.
- [ ] **Apple client secret rotation** — `APPLE_CLIENT_SECRET` JWT (from `packages/core/scripts/generate-apple-secret.ts`) expires ≤6 months. Document rotation runbook; optionally a cron reminder.
- [~] Create CF resources: D1 db, KV namespace, R2 bucket; record ids in `wrangler.toml`. **DEV done** (`barakah-db-dev` `c7a44a07…`, `barakah-kv-dev` `a6ccf241…`, `barakah-avatars-dev` — ids in `[env.development]`; local `db:migrate` applies clean). **PROD pending** (`barakah-db`/KV/R2 ids still `<placeholder>` — needs creation before cutover).
- [x] Workers **Cron Triggers**: prayer-cache expiry sweep (`by_expiry`), email-retry sweep.
- [ ] Custom domain/route; finalize CORS origins.
- [x] Staging (`env.development`) for parallel verification pre-cutover.

## 10. App cutover (IN PROGRESS — flag-gated, core stays live until flip)

- [x] Generate typed client (**Hono RPC** chosen) + `USE_CF_API` flag. `packages/app/lib/api-client.ts` = `hc<AppType>` with auth transport (native Cookie via `@better-auth/expo` `getCookie`, web credentialed). Flag/base in `lib/cf-flag.ts`; `EXPO_PUBLIC_API_URL`/`EXPO_PUBLIC_USE_CF_API` in `@barakah/env/app`. ⚠️ **Deviation:** cross-package RPC needs an alias-free `.d.ts` — `@/`-aliased source can't resolve from the app program. Added `packages/api/tsconfig.build.json` + `tsc-alias` + `build` script emitting `dist/index.d.ts` (`types` field); turbo `^build` runs it before app typecheck. Exported `AppType` from `src/index.ts` (chained `.route()`, not the loop, to keep RPC types). Exported `PrayersToLock`/`PrayerTimingDay`/`PrayerSource` so the `Database` type is nameable in declarations.
- [~] Wrap reads/writes in React Query per §8 policy. **Done:** `QueryClientProvider` + Expo focus/online managers wired in `_layout`; `lib/query-client.ts`; **`hooks/use-locations.ts` fully dual-pathed as the reference impl** (proves the pattern: `export const useX = USE_CF_API ? useXCf : useXConvex` selected at module load — constant flag, no rules-of-hooks violation; CF rows mapped to the shared shape; branded `Id<>` bridged with `as` casts at the CF boundary; offline mirror shared across both paths). **Remaining (mechanical, same pattern):** `contexts/user-context`, `lib/subscription`, `hooks/{usePrayerLogs,usePrayerTimes,usePrayerShield,useWidgetSync,useOfflineSync,use-widget-interactions,use-forced-update}`, `components/achievement-popup-provider`, `app/(app)/(tabs)/{home,locked,name,profile}`, `app/(app)/achievements`, `app/(settings)/{calc-method,personal-details}`, and the **auth-client** (swap baseURL→CF + drop `convexClient`/`crossDomainClient` plugins when flag on).
- [x] **Data backfill Convex → D1** — `scripts/backfill/{transform,backfill}.ts` (+ tested transform). Preserves `authUserId`; identity tables first (ids kept), app tables get fresh uuid; object/array→JSON; emits ordered `backfill.sql` for `wrangler d1 execute --file`. **Run deferred** (needs `npx convex export` + prod D1 + `wrangler login`).
- [ ] **Avatar blob migration** — existing avatars live in **Convex file storage**. Copy each blob Convex storage → R2 (key `avatars/<authUserId>`), rewrite `users.image`. Not yet scripted.
- [ ] Shadow-read verification vs Convex (sample users' full data graph resolves under preserved ids); auth/session re-auth story (sessions don't carry → users re-login, ids stay).
- [x] **Rollback plan / runbook** — see below. `USE_CF_API` flips back to Convex instantly; Convex stays writable until backfill+verification signed off.
- [ ] Flip flag, monitor, then retire `packages/core` (separate task, after stability window).

### Cutover runbook (rollback-first)

1. **Pre:** create prod CF resources (§9), set secrets, `d1 migrations apply --remote`, deploy worker. Keep Convex live + writable.
2. **Backfill:** `npx convex export` (app tables + better-auth component) → `bun run scripts/backfill/backfill.ts <exportDir> <out>` → review `backfill.sql` → `wrangler d1 execute <DB> --remote --file out/backfill.sql`. Then run the (TBD) avatar-blob copy.
3. **Verify (flag OFF):** point a staging build at `EXPO_PUBLIC_API_URL`, set `EXPO_PUBLIC_USE_CF_API=true` only on that build; shadow-read a sample user's full graph vs Convex under the preserved `authUserId`.
4. **Flip:** ship `EXPO_PUBLIC_USE_CF_API=true`. Users re-login (sessions don't carry; ids stay). Monitor.
5. **Rollback (point-of-no-return = first prod CF *write*):** before any CF write, flipping the flag back to Convex is lossless. After CF writes begin, rolling back needs a reverse-backfill — so freeze, verify, then commit. Keep Convex writable through the stability window.
6. **Retire core:** only after a clean stability window — separate task.

---

## Risks / open questions

- 🔴 **`authUserId` continuity is the #1 migration risk.** EVERY app table keys on
  `authUserId` (the Better Auth user id). Today those ids live in Convex's Better Auth
  component. Migrating to D1 Better Auth, the backfill **must preserve each user's
  existing `authUserId`** when importing the better-auth `user`/`account`/`session`
  tables Convex → D1 — otherwise every user's prayer logs, streaks, subscriptions,
  achievements, shield config orphan. (No anonymous users exist — auth is emailOTP +
  Apple + Google only — so every user has an email/social identity to re-key on.)
  Plan: export Convex better-auth tables, import to D1 keeping ids; verify a sample
  user's full data graph resolves before flag flip. Define the re-auth/session story
  (sessions likely can't carry over → users re-login, but user ids stay).
- Better Auth table shape must match app's existing sessions (anonymous + Apple relay email). Generate schema early, diff vs app expectations.
- `prayerTimeCaches.timings` can be large → store blob in **KV**, keep only metadata + indexes in D1 (watch D1 row-size limits).
- RevenueCat/Polar precedence is business-critical → port `sync-revenuecat` tests **first** (TDD).
- D1 lacks Convex-style multi-statement transactions → wrap multi-row writes in `db.batch()`; assert atomicity in tests.
- Live user-data migration (esp. auth sessions) needs a defined backfill + re-auth plan before cutover.
- **D1 backup/restore** — rely on D1 Time Travel + scheduled `wrangler d1 export` before any destructive migration apply. Never hand-edit an already-applied migration; add a new one.
- **Workers runtime ≠ Bun/Node** — no `Bun.*` or bare `node:*` at runtime (workerd). Use Web Crypto / Workers bindings; `nodejs_compat` only where a dep requires it (see Execution Rule 7).
- **Worker bundle-size limit** (≈3 MB gzip on paid, less on free). `disposable-email-domains` (large list) + `adhan` + `@polar-sh/sdk` + better-auth could approach it. Measure bundle early; lazy-load or trim the disposable list if needed.
- **Auth transport differs by client** — Expo (`@better-auth/expo`) uses **Bearer token**; web/marketing uses **cookie**. Session-resolver middleware must accept both. Test both paths.
- **Marketing site repoint** — the Astro `packages/marketing` site (waitlist signup, Polar web checkout/claim) also talks to the backend. At cutover its endpoints must move to the new API too — not just the app. Verify call sites before retiring core.

---

## Appendix A — function → endpoint inventory (port targets)

Source files in `packages/core/convex/lib/`. `query`=GET, `mutation`=POST, `internalMutation`/`action`(internal)=service fn (not HTTP).

| Domain (file) | Convex fn | Kind | API endpoint / internal |
|---|---|---|---|
| appConfig | getAppConfig | query | `GET /app-config` |
| | setAppConfig | internalMutation | internal |
| dhikr | getToday | query | `GET /dhikr/today` |
| | increment | mutation | `POST /dhikr/increment` |
| | setTarget | mutation | `POST /dhikr/target` |
| | reset | mutation | `POST /dhikr/reset` |
| achievements | listForMe | query | `GET /achievements` |
| | listUnseen | query | `GET /achievements/unseen` |
| | markSeen | mutation | `POST /achievements/seen` |
| | runEvaluate | internalMutation | internal (called by logPrayer) |
| healthCheck | get | query | `GET /health` |
| marketing | joinWaitlist | action | `POST /marketing/waitlist` |
| prayerTimes | getCachedPrayerTimes | query | `GET /prayer-times` |
| | refreshPrayerTimes | **action** | `POST /prayer-times/refresh` (fetch AlAdhan → cache) |
| | upsertPrayerTimesCache | internalMutation | internal |
| polar | recordPaidOrder | internalMutation | internal (webhook) |
| | queueOrderConfirmationEmail | internalMutation | internal |
| | markOrderEmailConfirmed | internalMutation | internal |
| | clearOrderConfirmationEmailQueued | internalMutation | internal |
| | webhook | httpAction | `POST /api/webhooks/polar` |
| resend | handleEmailEvent | internalMutation | internal |
| | (resendHandler webhook) | httpAction | `POST /api/webhooks/resend` |
| userLocations | listMine | query | `GET /locations` |
| | create | mutation | `POST /locations` |
| | rename | mutation | `POST /locations/:id/rename` |
| | remove | mutation | `POST /locations/:id/remove` |
| | setActive | mutation | `POST /locations/:id/active` |
| users | getMyAccount | query | `GET /me` |
| | getMyAvatarUrl | query | `GET /me/avatar` |
| | upsertProfile | mutation | `POST /me/profile` |
| | deleteMyAccount | mutation | `POST /me/delete` |
| | generateAvatarUploadUrl | mutation | `POST /me/avatar/upload-url` (R2 presign) |
| | setAvatar | mutation | `POST /me/avatar` |
| | purgeUserData | internalMutation | internal |
| subscriptions | getMySubscription | query | `GET /subscription` |
| | claimPolarByEmail | mutation | `POST /subscription/claim-polar` |
| | claimMockSubscription | mutation | `POST /subscription/claim-mock` (dev-gated) |
| | syncRevenueCatEntitlement | **action** | `POST /subscription/revenuecat` (authed; verify via `REVENUECAT_SECRET_KEY`) |
| | applyRevenueCatEntitlement | internalMutation | internal (RC sync) |
| shieldSelection | getMine | query | `GET /shield` |
| | upsertIos | mutation | `POST /shield/ios` |
| | upsertAndroid | mutation | `POST /shield/android` |
| | setWindows | mutation | `POST /shield/windows` |
| | setEnabled | mutation | `POST /shield/enabled` |
| prayerLogs | getMyWeek | query | `GET /prayer-logs/week` |
| | logPrayer | mutation | `POST /prayer-logs` (returns streak + unlocked achievements) |
| | getStreak | query | `GET /prayer-logs/streak` |
| | clearPrayer | mutation | `POST /prayer-logs/clear` |

**D1 tables (12, from `convex/schema.ts`):** `users`, `subscriptions`, `polarOrders`,
`prayerTimeCaches`, `prayerLogs`, `shieldSelection`, `dhikrDaily`, `dhikrAggregate`,
`userLocations`, `userAchievements`, `userAchievementCounters`, `appConfig`
(+ Better Auth tables, generated). Index definitions: copy 1:1 from `schema.ts`.

**Reusable core logic (import, do NOT rewrite):**
`src/achievements/{evaluate,calendar,definitions,types}`, `src/auth/emails`,
`src/marketing/{emails,waitlist}`, `src/polar/webhook`,
`src/prayer/{aladhan,adhan-js,cache-key,normalize,log-status,constants,types}`,
`src/subscriptions/{validators,sync-revenuecat}`, `src/users/validators`,
`src/shieldSelection/validators`.

## Appendix B — secrets / env (→ `wrangler secret` + `.dev.vars`)

From `packages/core/.env.example` + `convex/lib` usage. Convex-dashboard secrets
become Worker secrets:

```
BETTER_AUTH_SECRET            # openssl rand -base64 32
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
REVENUECAT_SECRET_KEY        # sk_... (v1 secret REST key, server-side entitlement verify)
ALLOW_MOCK_SUBSCRIPTIONS     # dev only — MUST stay unset in prod
ALLOW_EXPO_ORIGINS           # CORS gate for Expo origins
```

Plus Workers bindings (in `wrangler.toml`, not secrets): `DB` (D1), `KV`, `R2`.
