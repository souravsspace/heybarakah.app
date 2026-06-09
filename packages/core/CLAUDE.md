# @barakah/core

Purpose: Shared, framework-agnostic domain logic reused by the app and `@barakah/api`.

## Structure

- `src/` holds reusable domain code for achievements, auth emails, marketing, polar, prayer, shieldSelection, subscriptions, and users.
- Public imports come from `index.ts` and the package subpath exports in `package.json`.

## Rules

- Keep reusable validators, calculation logic, webhook parsing, and exported types under `src/<domain>/`.
- Export new domain surface from `src/<domain>/index.ts`, then add a package subpath export if external packages need it.
- Keep `src/` pure: no Convex, no Workers bindings, no Expo imports — only portable TypeScript so both the app and `@barakah/api` can consume it.
- Preserve prayer-time behavior: AlAdhan primary, `adhan` fallback where supported, cache-key helpers in `src/prayer`.
- Preserve subscription source precedence; RevenueCat sync must not overwrite Polar-owned subscriptions.
- Tests are `bun:test` colocated as `*.test.ts`.

## Commands

- `bun run typecheck`
