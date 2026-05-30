# Migration Plan: `@bittingz/expo-widgets` → official `expo-widgets`

> **Status:** Foundation laid on branch `feat/official-expo-widgets` (official `expo-widgets@56.0.16` installed in `packages/app`). `@bittingz` is still the **active** widget plugin and the app is unbroken on `dev`. The remaining work — porting ~2,276 lines of bespoke SwiftUI to Expo UI and validating on a device — is a **Mac/device-bound feature effort** and is intentionally not done headlessly.
>
> **Why migrate:** `@bittingz/expo-widgets` is community-maintained, requires a local patch to even `pod install` on SDK 54+, and is untested on the New Architecture. Official `expo-widgets` is first-party (repo `expo/expo`, maintained by the Expo team).
>
> **This plan is grounded in the actual installed package** (`node_modules/expo-widgets@56.0.16`), not docs guesswork.

---

## 0. Capability verdict (confirmed by reading the package)

| App feature (today, in `@bittingz`) | Official `expo-widgets` 56.0.16 | Verdict |
| --- | --- | --- |
| Home-screen widgets, multiple families (`Ayah`, `Dhikr`, `SalahArc`, `Streak`, `LockComplications`) | `createWidget(name, (props, ctx) => JSX)` with `@expo/ui/swift-ui`; families via `ios.supportedFamilies` | **Port** (UI rewrite) |
| Interactive dhikr increment (`IncrementDhikrIntent` App Intent) | `addUserInteractionListener((e)=>…)` — button/toggle in widget fires `{source,target}` to JS | **Replace** — no native App Intent needed |
| Quiet-start interaction (`StartQuietControlIntent`) | same interaction mechanism | **Replace** |
| Live Activity (`BarakahLockAttributes`, Dynamic Island) | `createLiveActivity(name, comp)`, push-to-start token, dismissal policy, layouts | **Port** |
| Configurable widgets | `ios.configuration.parameters` (string/number/boolean/enum) | **Supported** |
| App-group data sharing | `groupIdentifier` plugin prop | **Supported** |
| **Control Center / lock-screen Control (`LockNowControl`, iOS 18)** | **No first-party support, no custom-Swift escape hatch in the plugin props** | **Gap — see §6** |

**Bottom line:** every feature except the standalone WidgetKit **Control** has a clean official path. The Control is the only true gap.

## 1. Official API surface (from `node_modules/expo-widgets/build`)

- `createWidget<Props, Config>(name, (props, ctx: WidgetEnvironment<Config>) => JSX.Element): Widget` — widget component uses the `'widget'` directive (like `'use client'`) and renders `@expo/ui/swift-ui` views.
- `createLiveActivity<T>(name, component): LiveActivityFactory<T>` — `name` must match the widget config entry.
- `addUserInteractionListener(listener): EventSubscription` — `UserInteractionEvent = { source, target }` (which widget, which button/toggle).
- `addPushToStartTokenListener`, `addUserInteractionListener`, `LiveActivity`/`LiveActivityFactory` classes, `after()` (timeline helper).
- Config-plugin props (`ExpoWidgetsConfigPluginProps`): `bundleIdentifier?`, `groupIdentifier?`, `enablePushNotifications?`, `frequentUpdates?`, `widgets?: WidgetConfig[]`.
- `WidgetConfig`: `{ name, displayName, description, ios: { supportedFamilies, contentMarginsDisabled?, configuration? }, android? }`.

## 2. Data contract — already a clean seam

The TS data model already exists and is well-isolated:

- `packages/app/lib/widgets-native.ts` exposes the **entire** native surface behind plain functions: `setSnapshot(snapshot)`, `reloadTimelines()`, `peekPendingDhikr()`, `ackPendingDhikr(n)`, `startLockActivity()`, `endLockActivity()`, `endAllLockActivities()`. It talks to a custom `ExpoWidgets` native module (the `@bittingz` `Module.swift`).
- `packages/app/lib/widget-snapshot.ts` builds the `WidgetSnapshot` payload.
- Native shape (`modules/expo-barakah-widgets/ios/Shared/WidgetSnapshot.swift`): `{ v, generatedAt, tz, date, prayers[{name,adhanISO,startISO,endISO}], tomorrowFajrISO?, streak{days,best,history[],todayDone}, dhikr{count,target,sessionTotal}, ayah{arabic,translation,surah,reference}, lockNow?{name,endISO} }`.
- App group: `group.com.souravsspace.Barakah.expowidgets`; snapshot key `widget.snapshot.v1`; dhikr queue key `widget.dhikr.pending`; activity-id key `widget.lockActivity.id`.

**Migration leverage:** re-implement `lib/widgets-native.ts` against the official `expo-widgets` JS API and **keep its function signatures**, so consumer code barely changes. Identify consumers first: `grep -rn "widgets-native" packages/app`.

## 3. Widget-by-widget porting table (the bulk of the work)

Each is a SwiftUI file to re-express as a `createWidget` Expo UI component. Read the Swift for layout + data binding, reproduce visuals from `design/` (mosque green `#29603E`, Libre Baskerville headlines, Inter body, hairline borders, no gradients/emoji, Islamic typographic conventions).

| Widget | Swift LOC | Families | Notes |
| --- | --- | --- | --- |
| `AyahWidget` | 102 | small/medium | static text; simplest — **port first as the pattern** |
| `StreakWidget` | 280 | small/medium | streak ring + history bars |
| `DhikrWidget` | 238 | small/medium | **interactive** — increment button → `addUserInteractionListener` |
| `SalahArcWidget` | 333 | medium/large | most complex; prayer-time arc, needs `PrayerModel`/`Celestial`/`Direction` math reimplemented in TS or precomputed in the snapshot |
| `LockComplicationsWidget` | 90 | accessory* | lock-screen complications |

> Recommendation: move all derived math (`PrayerModel`, `Direction`, `Celestial`, `Hijri`) **out of Swift and into the snapshot** computed in JS, so widgets become pure presentational components. This shrinks the native surface dramatically.

## 4. Interactions (replaces App Intents)

- Put a button/toggle in `DhikrWidget` (Expo UI) with a stable `target` id (e.g. `"increment"`).
- Register `addUserInteractionListener` at app startup (e.g. in `app/_layout.tsx` or a widgets bootstrap module): on `{source:"dhikr", target:"increment"}` → increment dhikr in app state → `setSnapshot(next)` → reload.
- Delete the native `IncrementDhikrIntent`/`StartQuietControlIntent` and the `pending`/`peek`/`ack` queue — the JS listener handles it directly and authoritatively. (Audit consumers of `peekPendingDhikr`/`ackPendingDhikr` and remove.)

## 5. Live Activity

- `createLiveActivity("lockNow", <component>)` mirroring `BarakahLockAttributes.ContentState { prayerName, startEpoch, endEpoch }`.
- Re-implement `startLockActivity/endLockActivity/endAllLockActivities` in `lib/widgets-native.ts` via the official `LiveActivityFactory`.
- Wire to the existing app-blocker quiet flow (whatever calls `startLockActivity` today — confirm via grep).
- Reproduce Dynamic Island + lock-screen layouts from `LockedNowLiveActivity.swift`.

## 6. The Control gap (`LockNowControl`, iOS 18) — decision required

Official `expo-widgets` cannot define a Control Center control. Options:

1. **Separate `@bacons/apple-targets` control target** — the app already uses `@bacons/apple-targets` for the Screen Time extensions (`DeviceActivityMonitor`, `ShieldAction`, `ShieldConfiguration`). Add one more target containing just `LockNowControl.swift` + the App Intent it needs, sharing the app group. Keeps the feature, isolated from the widget pipeline. **Recommended.**
2. **Drop the Control** — lose the Control-Center/lock-screen quick-lock. Simplest; a UX regression. Requires product sign-off.

This is the one item that needs a human decision before `@bittingz` removal.

## 7. Config-plugin cutover (`app.json`)

- Remove the `["@bittingz/expo-widgets", {…}]` block.
- Add `["expo-widgets", { bundleIdentifier: "com.souravsspace.Barakah.BarakahWidgets", groupIdentifier: "group.com.souravsspace.Barakah.expowidgets", frequentUpdates: true, widgets: [ …one entry per widget… ] }]`.
- **Keep the app group identifier identical** (`…expowidgets`) so existing shared data continues to decode; otherwise plan a one-time data migration.
- Leave `./plugins/with-app-groups`, `expo-app-blocker`, and the `@bacons/apple-targets` Screen Time extensions untouched. Verify the official widget target's bundle id does not collide with the Screen Time extension ids.
- Reconcile deployment targets: app is `16.4` (`expo-build-properties`); old widget was `17.0`. Confirm the official widget target's minimum and set accordingly.

## 8. Remove `@bittingz` (only after §1–§7 validated on device)

- Remove `@bittingz/expo-widgets` from `packages/app/package.json`.
- Delete `patches/@bittingz%2Fexpo-widgets@3.0.2.patch`; remove `patchedDependencies` entry from the **root** `package.json`; remove `patches/` if empty.
- Remove the `@bittingz` doctor exclude from `packages/app/package.json`.
- Archive (don't silently delete) `modules/expo-barakah-widgets/ios/` — keep a git tag/branch before removal for rollback.
- `bun install`; confirm lockfile no longer references the patch.

## 9. Native regeneration & verification

- `expo prebuild --clean` (ios/android are CNG / gitignored — safe).
- `pod install` — expect no "Unable to determine Swift version" and no unlinked modules.
- Build in Xcode/EAS, install on a **physical device** (widgets/Live Activities/Controls don't fully exercise in Simulator). Verify every widget family, the dhikr interaction round-trip, Live Activity lifecycle tied to salah/quiet windows, and (if kept) the Control.
- `expo-doctor` — the `@bittingz` warning should be gone.

## 10. Rollout & rollback

- Native change → requires a new build (not OTA-only); stage via an EAS channel.
- **Rollback:** revert the branch; restore `@bittingz` dep + patch + `patchedDependencies` + `modules/expo-barakah-widgets/ios/`; `bun install`; `prebuild --clean`; `pod install`.

---

## Skills to use (per project convention)

- `find-skills` — discover any new widget/native skills, install as needed.
- `expo:expo-ui-swift-ui` — `@expo/ui/swift-ui` component vocabulary for writing the widgets.
- `expo:expo-module` — Expo Modules API / config plugins / the `@bacons/apple-targets` Control target.
- `expo:building-native-ui` and the Barakah `design/` system — visual fidelity.
- `context7` / `find-docs` — re-verify the official `expo-widgets` API at implementation time (it is new and moving).

## Effort & risk

- **Effort:** High — ~2,276 lines of bespoke SwiftUI → Expo UI, plus data-layer re-plumbing and a separate Control target.
- **Risk:** Medium-High — visual fidelity without device feedback, app-group/data continuity, the Control gap.
- **Confidence it's achievable:** High for everything except the Control (which has a clean `apple-targets` fallback). This is a real, scoped feature project — best executed on a Mac with device validation, not headless.

## What's already done on this branch

- Installed official `expo-widgets@56.0.16` into `packages/app` (correct workspace placement).
- `@bittingz` left fully intact and active — **the app still builds and the widgets still work.**
- This plan, grounded in the real package API + the app's actual data seam.

## Remaining checklist (needs a Mac + device)

- [ ] Port 5 widgets to `createWidget` Expo UI components (start with `AyahWidget`).
- [ ] Move prayer/qibla/celestial/hijri math from Swift into the JS snapshot.
- [ ] Re-implement `lib/widgets-native.ts` against official `expo-widgets` (keep signatures).
- [ ] Register `addUserInteractionListener` for dhikr increment; delete the pending-dhikr queue + native App Intents.
- [ ] Port the Live Activity via `createLiveActivity`.
- [ ] Decide the `LockNowControl` fate (§6) — recommend a separate `@bacons/apple-targets` target.
- [ ] Swap the `app.json` plugin block (§7), keep the app group id stable.
- [ ] Remove `@bittingz` + patch + Swift tree (§8).
- [ ] `prebuild --clean` + `pod install` + device build + `expo-doctor` (§9).
