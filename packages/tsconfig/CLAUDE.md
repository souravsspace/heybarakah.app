# @barakah/tsconfig

Purpose: Shared TypeScript config presets.

## Structure

- `base.json` is the strict shared base used by core, env, and mails.
- `app.json` is the Expo app preset.
- `marketing.json` is the Astro marketing preset.
- `api.json` is an API/Hono JSX preset.
- `package.json` exports each preset as `@barakah/tsconfig/<name>.json`.

## Rules

- Keep preset filenames and package exports in sync.
- Do not add package-specific paths here; define them in the consuming package `tsconfig.json`.
- Preserve strict defaults unless a consuming tool requires a local override.
