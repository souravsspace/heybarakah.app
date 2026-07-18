# Barakah

Prayer-aware focus app for Muslims. Barakah locks distracting apps around salah times so you can pray on time and stay present — fajr, dhuhr, asr, maghrib, isha.

## What it does

- **Prayer lock** — blocks selected apps in the window before, during, and after each prayer.
- **Salah-aware schedule** — lock windows follow your local prayer times automatically.
- **Shield + Device Activity** — uses iOS Screen Time (Family Controls) to enforce focus.
- **Gentle nudges** — reminders to pray, not shame.

## Repo layout

Monorepo managed with Turbo + Bun.

- `packages/app` — Expo (React Native) mobile app. Includes native targets:
  - `DeviceActivityMonitor` — schedules prayer-time activity windows.
  - `ShieldAction` — custom shield shown when a blocked app is opened.
- `packages/marketing` — Astro site deployed to Cloudflare (heybarakah.app).
- `packages/ui`, `packages/hooks`, `packages/lib`, `packages/constants` — shared workspace packages.

## Develop

Requirements: Bun, Xcode (for iOS targets), Expo tooling.

```bash
bun install
bun turbo typecheck
bun turbo dev        # run all dev servers
```

Marketing site:

```bash
cd packages/marketing
bun run dev
bun run build
```

Mobile app:

```bash
cd packages/app
bun run ios
```

## Conventions

- Per-file commits, Conventional Commits format (`feat(scope): summary`).
- Run `bun x ultracite fix` + `bun turbo typecheck` before each commit.
- No emoji in product surfaces. Honor Islamic typographic conventions (Allah, ﷺ, Qur'an, du'a, salah).
- Single accent: mosque green `#29603E`. Otherwise black, white, cool grays.

See `CLAUDE.md` and `AGENTS.md` for full contributor guidance.

## License

Proprietary. All rights reserved.
