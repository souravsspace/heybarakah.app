# @barakah/env

Purpose: Typed env entrypoints.

## Structure

- `src/app.ts` exports Expo client env with `EXPO_PUBLIC_` prefix.
- `src/marketing.ts` exports Astro/public env with `PUBLIC_` prefix.
- Package exports are `./app` and `./marketing`.

## Rules

- Add app env vars to `src/app.ts`; add marketing env vars to `src/marketing.ts`.
- Keep `clientPrefix` aligned with the runtime package prefix.
- Keep `runtimeEnv` explicit for every schema key.
- Keep `emptyStringAsUndefined: true`.
- Use `z.url()` for URL env vars.
- Do not put server-only secrets in these client env entrypoints.
