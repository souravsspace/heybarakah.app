# Staged: `LockNowWidget` apple-targets Control

These files implement the iOS-18 Control Center / lock-screen **Control** (`LockNowControl`) as a standalone `@bacons/apple-targets` **widget** extension — the official-`expo-widgets` replacement for the Control, which official `expo-widgets` cannot host itself.

## Why it's staged here (not under `packages/app/targets/`)

`@bacons/apple-targets` **cannot add a second WidgetKit extension while `@bittingz/expo-widgets`'s widget extension (`BarakahWidgetExtension`) still exists.** During `expo prebuild`, apple-targets matches the existing `@bittingz` widgetkit-extension as its `targetToUpdate` and crashes:

```
TypeError: [ios.xcodeProjectBeta2]: withIosXcodeProjectBeta2BaseMod:
  Cannot read properties of undefined (reading 'removeFromProject')
  at applyXcodeChanges (@bacons/apple-targets/build/with-xcode-changes.js:223)
```

Through apple-targets, this Control extension can't be added while the `@bittingz` widget extension is present (the `removeFromProject` crash above). So it can only be **activated as part of the `@bittingz` removal cutover**, not before. Until then it lives here so prebuild stays green.

## How to activate (during the cutover — see EXPO_WIDGETS_MIGRATION_PLAN.md §6/§8)

1. Complete the widget + Live Activity port to official `expo-widgets` and remove the `@bittingz` plugin block + dependency (so `BarakahWidgetExtension` no longer exists).
2. Move this folder to `packages/app/targets/LockNowWidget/`.
3. Remove the `LockNowControl()` line from any remaining widget bundle (it's currently still in `@bittingz`'s `BarakahWidgetBundle`); this Control is now self-contained here.
4. `expo prebuild --clean` → confirm the `LockNowWidget` target appears and apple-targets no longer errors.
5. Build on a device (iOS 18+) and confirm the Control shows in Control Center / lock screen and opens the app.

## Files

- `expo-target.config.js` — apple-targets `widget` type, `deploymentTarget: "18.0"`, bundle id `.LockNowWidget`. No entitlements needed (the Control only opens the app).
- `LockNowWidget.swift` — `@main` `WidgetBundle` hosting only the Control (target-local).
- `LockNowControl.swift` — the `ControlWidget` (verbatim from the working `@bittingz` version; target-local).
- `_shared/StartQuietControlIntent.swift` — `StartQuietControlIntent` + `OpenBarakahIntent` (open-app intents). In apple-targets' **`_shared/`** dir so the intents are linked into **both** the main app and the extension — required for the open-app intent to actually foreground Barakah.

> If the Control doesn't reliably foreground the app on device, change `OpenBarakahIntent` to return `.result(opensIntent: OpenURLIntent(URL(string: "barakah://")!))` with a deep link.

> Not yet device-validated — Swift compiles only inside an Xcode target, which requires the cutover + a Mac build.
