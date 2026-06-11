# @barakah/api

Purpose: Hono + OpenAPI backend on a full Cloudflare stack (D1, KV, R2, Workers).
Replicates the `@barakah/core` Convex surface. Built in parallel; cutover is flag-gated
and later (see root `MIGRATION_CONVEX_TO_CLOUDFLARE.md`). **Never modify `packages/core`.**

## Structure

- `src/index.ts` — Worker entry; mounts the `OpenAPIHono` app.
- `src/db/` — Drizzle D1 schema, `createDatabase` factory, generated migrations.
- `src/auth/` — `better-auth-cloudflare` (`createAuth`), session resolver.
- `src/routes/<domain>/` — one folder per domain, files `*.routes.ts` (OpenAPI contract),
  `*.handlers.ts` (logic), `*.index.ts` (wire route→handler), `*.test.ts`.
- `src/routes/webhooks/` — polar, resend.
- `src/lib/` — `create-app`, `create-router`, `configure-open-api`, r2, kv-cache, resend, json-columns.
- `src/middlewares/` — logger, auth-session resolver, KV rate-limit.
- `src/stoker/` — vendored http-status helpers + openapi error/notFound (from texly).
- `src/types/app-type.ts` — `AppBindings` (`Bindings: { DB, KV, R2, … }`, `Variables: { logger, user, auth }`).

## Rules

- **Reuse `@barakah/core/src/*` domain logic verbatim** (prayer math, achievement eval,
  polar/webhook parse, revenuecat sync, validators). Import via subpath exports — do NOT rewrite.
  Only Convex handlers (`convex/lib/*`) + schema + http routing get reimplemented here.
- **Runtime is workerd, not Bun/Node.** In `src/` runtime code use Web/Workers APIs
  (Web Crypto, `fetch`, bindings) — **no `Bun.*`, no bare `node:*`**. `nodejs_compat` is on
  only for deps that need it. (Root CLAUDE.md's `Bun.file`/`Bun.$`/`Bun.env` rule applies to
  Bun-run scripts/tests, not Worker runtime.)
- Read env from `c.env` bindings (Zod-validated in `src/env.ts`), never a global singleton.
- `query`→GET, `mutation`→POST, `internalMutation`/internal `action`→service fn (not HTTP-exposed).
- Bound every list query (date-range / `LIMIT` + cursor). Multi-row writes use `db.batch()`.
- Preserve subscription source precedence: RevenueCat must NOT overwrite Polar-owned.
- Preserve `authUserId` continuity and anonymous→real account linking.
- API base path `/api/v1`. Auth mounted at `/api/auth/*`.

## TDD (mandatory)

Write the colocated `*.test.ts` **before** the implementation (red→green→refactor).
A non-`index` source file is not done until its sibling test passes. Binding-backed tests
use **vitest + `@cloudflare/vitest-pool-workers`** (D1/KV/R2 via miniflare). Pure logic keeps
its existing `bun:test` in `@barakah/core` — don't duplicate.

## Per-file done checklist

test first + passing → `bun x ultracite fix` → `bun turbo typecheck` (zero errors) →
per-file conventional commit (scope `api`) → check the box in the migration doc.

## Commands

- `bun run dev` — wrangler dev (local D1/KV/R2 via miniflare)
- `bun run typecheck` — tsc --noEmit
- `bun run test` — vitest (workers pool)
- `bun run db:generate` — drizzle-kit generate
- `bun run db:migrate` — wrangler d1 migrations apply
- `bun run deploy` — wrangler deploy
- `bun run cf:typegen` — wrangler types
