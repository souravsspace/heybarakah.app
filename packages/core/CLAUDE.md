# @barakah/core

Purpose: Convex backend and shared domain logic.

## Structure

- `convex/` is the Convex API surface: schema, HTTP routes, auth config, component config, and `lib/` functions.
- `src/` holds reusable domain code for achievements, auth, marketing, polar, prayer, shieldSelection, subscriptions, and users.
- Public imports come from `index.ts` and the package subpath exports in `package.json`.

## Rules

- Keep Convex queries, mutations, actions, and HTTP handlers under `convex/lib/`.
- Keep reusable validators, calculation logic, webhook parsing, and exported types under `src/<domain>/`.
- Export new domain surface from `src/<domain>/index.ts`, then add a package subpath export if external packages need it.
- Do not edit `convex/_generated/` by hand.
- Update `convex/schema.ts` before querying a new table/index access pattern.
- Reuse validators from `src/users`, `src/shieldSelection`, and `src/subscriptions` in Convex schema/args.
- Use `authComponent.safeGetAuthUser(ctx)` for current-user reads in Convex handlers.
- Register HTTP routes only in `convex/http.ts`; existing routes are Better Auth, Polar webhook, and Resend webhook.
- Preserve prayer-time behavior: AlAdhan primary, `adhan` fallback where supported, cache-key helpers in `src/prayer`.
- Preserve subscription source precedence; RevenueCat sync must not overwrite Polar-owned subscriptions.

## Commands

- `bun run dev`
- `bun run dev:setup`
- `bun run reset:db`
- `bun run typecheck`
