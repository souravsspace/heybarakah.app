# Force-update & OTA — operations

Two layers gate app versions:

- **Layer A — store force-update (hard block).** Convex holds `minSupportedVersion`. App reads its installed native version and, if below it, shows a non-dismissible modal that sends the user to TestFlight / App Store. The Convex query is live — changing the value blocks every open client within seconds, no app rebuild.
- **Layer B — OTA (EAS Update).** JS-only fixes ship over-the-air via `eas update`; the app fetches and reloads on launch. No store trip, no popup.

Source of truth = the `appConfig` table (`packages/core/convex/lib/appConfig.ts`).

---

## Key concept: dev vs prod is a *deployment*, not a flag

Convex has two deployments: your **dev** deployment and the **prod** deployment. `appConfig` lives separately in each. `convex run` and `convex dev`/`deploy` target whichever you point them at:

| Action            | Dev deployment                | Prod deployment              |
| ----------------- | ----------------------------- | ---------------------------- |
| Push functions    | `npx convex dev --once`       | `npx convex deploy`          |
| Run a function    | `npx convex run <fn> '<args>'`| `npx convex run --prod <fn> '<args>'` |
| Open dashboard    | `npx convex dashboard`        | `npx convex dashboard --prod`|

> Pushing functions (deploy) is separate from *running* the seed mutation. A new function (like `setAppConfig`) must be pushed **before** you can run it — that was the `Could not find function` error.

All commands below run from `packages/core`.

---

## 1. First-time setup (run once per deployment)

Push functions, then seed the config row.

**Dev:**
```bash
cd packages/core
npx convex dev --once
npx convex run lib/appConfig:setAppConfig '{"minSupportedVersion":"0.9.2","iosStoreUrl":"itms-beta://"}'
```

**Prod:**
```bash
cd packages/core
npx convex deploy
npx convex run --prod lib/appConfig:setAppConfig '{"minSupportedVersion":"0.9.2","iosStoreUrl":"itms-beta://"}'
```

### iosStoreUrl values

- **Private TestFlight (now):** `itms-beta://` — opens the TestFlight app to the tester's app list. (`itms-beta://` does nothing on a simulator; only real devices.)
- **Sharper TestFlight target:** `itms-beta://beta.itunes.apple.com/v1/app/<APPLE_APP_ID>`
- **Public App Store (at launch):** `https://apps.apple.com/app/id<APPLE_APP_ID>`

`<APPLE_APP_ID>` = the numeric Apple ID from App Store Connect → App Information.

---

## 2. Test the gate works

Set min **above** the installed version → modal must appear. Needs a real/dev build (the native version is null in Expo Go / simulator-less).

```bash
# force the block
npx convex run lib/appConfig:setAppConfig '{"minSupportedVersion":"9.9.9","iosStoreUrl":"itms-beta://"}'
# reset
npx convex run lib/appConfig:setAppConfig '{"minSupportedVersion":"0.9.2","iosStoreUrl":"itms-beta://"}'
```

Add `--prod` to test against the prod deployment.

---

## 3. Force everyone onto a new build (real native release)

Native code can't change over OTA, so this requires a new build **and** raising the min version.

1. Bump version in all 3 files: root `package.json`, `packages/app/package.json`, `packages/app/app.json`.
2. Build + submit:
   ```bash
   cd packages/app
   eas build -p ios --profile production
   eas submit -p ios --profile production
   ```
3. **After** the new build is live (TestFlight processed / App Store approved), raise the min on prod:
   ```bash
   cd packages/core
   npx convex run --prod lib/appConfig:setAppConfig '{"minSupportedVersion":"<NEW_VERSION>","iosStoreUrl":"<store-url>"}'
   ```

> **Ordering is critical.** Raise `minSupportedVersion` only *after* the new build is downloadable. Raise it too early and users are blocked with nothing to update to.

---

## 4. Ship a JS-only fix (OTA, no force)

No version bump, no store trip.

```bash
cd packages/app
eas update --branch production --message "fix X"
```

Apps pull it on next launch (`use-ota-updates` checks, fetches, reloads). `runtimeVersion` is tied to `appVersion`, so an OTA only lands on builds with a matching native version — bumping the native version automatically cuts old binaries off OTA and pushes them down the store-update path.

> OTA needs `expo-updates` baked into the binary. The first build after adding it (this change) must be a fresh `eas build` — `eas update` does nothing until a build embedding expo-updates is installed.

---

## File map

| Concern                    | File |
| -------------------------- | ---- |
| Config table               | `packages/core/convex/schema.ts` (`appConfig`) |
| Query + seed mutation      | `packages/core/convex/lib/appConfig.ts` |
| Version compare            | `packages/app/lib/semver.ts` |
| Gate hook (version check)  | `packages/app/hooks/use-forced-update.ts` |
| Blocking modal UI          | `packages/app/components/force-update-modal.tsx` |
| Gate wiring (store link)   | `packages/app/components/force-update-gate.tsx` |
| Mount point                | `packages/app/app/_layout.tsx` |
| OTA auto-check             | `packages/app/hooks/use-ota-updates.ts` |
| runtimeVersion + updates url | `packages/app/app.json` |
