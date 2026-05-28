# expo-barakah-widgets

iOS widget extension sources for Barakah, built through the
[`@bittingz/expo-widgets`](https://github.com/mike-stewart-dev/expo-widgets)
config plugin. **Not** an autolinked Expo module — there is intentionally no
`expo-module.config.json`; the plugin consumes `ios/` directly.

## How it wires up

`packages/app/app.json` registers the plugin with `ios.src` pointing at
`ios/`. On prebuild the plugin:

- copies `ios/Module.swift` over the package's app-side Expo module
  (`Name("ExpoWidgets")`) — this is the JS↔native bridge, compiled into the
  **main app**. The app calls it through `packages/app/lib/widgets-native.ts`.
- compiles every other `ios/**` Swift file into the **widget extension** target.
- forces the App Group to `group.com.souravsspace.Barakah.expowidgets`.
- files listed in `moduleDependencies` are also compiled into the app module so
  `Module.swift` can reference shared types (snapshot, store, live activity).

## Layout

- `Module.swift` — `ExpoWidgets` bridge (app side).
- `Shared/` — snapshot model, app-group store, direction tokens, glass shell,
  theme, motif glyphs, prayer-state model, hijri, live-activity attributes +
  controller.
- `Config/` — `AppEnum` styles + `WidgetConfigurationIntent`s (one per family).
- `Provider/` — generic `AppIntentTimelineProvider` + sample payload.
- `Widgets/` — Salah Arc, Dhikr, Streak, Ayah, lock complications.
- `Controls/` — Lock Now `ControlWidget` (iOS 18).
- `Activity/` — Locked-now Live Activity / Dynamic Island.
- `Intents/` — dhikr increment + quiet-mode intents.
- `WidgetBundle.swift` — `@main` bundle.
- `Fonts/`, `Assets.xcassets/` — embedded via `expo-native-fonts` + the plugin.

Deployment target 17.0 (AppIntentConfiguration); the Control Center widget is
guarded behind iOS 18.
