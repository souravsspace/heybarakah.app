# barakah

Purpose: Expo React Native app.

## Structure

- `app/` is Expo Router file-based routing with `(account)`, `(app)`, `(onboarding)`, and `(settings)` route groups.
- `components/`, `hooks/`, `contexts/`, `constants/`, and `lib/` hold shared UI, state, config, and integration code.
- `targets/`, `ios/`, `android/`, `plugins/`, and `app.json` carry native app, extension, and config-plugin work.

## Rules

- Use `@/*` for app-local imports; `tsconfig.json` maps it to the package root.
- Keep root providers in `app/_layout.tsx`; it wires the React Query client, Better Auth (CF API), user state, subscription state, onboarding state, theme, splash, and achievement popups.
- Keep authenticated app gating in `app/(app)/_layout.tsx`; unauthenticated users redirect to onboarding and unsubscribed users redirect to `no-active-sub`.
- Keep onboarding navigation/progress behavior in `app/(onboarding)/_layout.tsx` and `hooks/use-onboarding-nav.ts`.
- Use NativeWind classes for app UI where existing components do.
- Use theme colors from `contexts/theme-context.tsx` for dark/light runtime UI.
- Keep RevenueCat code in `lib/revenuecat.ts` and subscription provider behavior in `lib/subscription.tsx`.
- Keep Better Auth Expo client wiring in `lib/auth-client.ts`; env values come from `@barakah/env/app`.
- Treat `expo-app-blocker` as optional at runtime through `lib/app-blocker.ts` stubs.
- Keep Expo config changes in `app.json`; native extension target files live under `targets/`.

## Commands

- `bun run start`
- `bun run ios`
- `bun run android`
- `bun run prebuild`
- `bun run prebuild:clean`
- `bun run pod`
- `bun run lint`
- `bun run typecheck`
