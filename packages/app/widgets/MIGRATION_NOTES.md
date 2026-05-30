# Widgets — official `expo-widgets` migration notes

The home-screen widgets, the interactive Dhikr tap, and the Live Activity now run
on first-party **`expo-widgets`** (`@expo/ui/swift-ui`). `@bittingz/expo-widgets`
and its pod-install patch are gone. All work below was done **headless on `dev`**;
none of the native rendering has been compiled or seen on a device yet.

## Architecture (changed from `@bittingz`)

- **Push model, not pull.** The app pushes timeline entries to each widget via
  `widget.updateTimeline(...)` (`lib/widgets-native.ts`). There is no longer a
  JSON snapshot read by native Swift. `setSnapshot` builds entries at "now" + each
  future prayer boundary and pushes them to every widget in `widgets/index.ts`.
- **Pure presentational widgets.** All prayer/celestial/hijri math moved to
  `lib/widget-derive.ts` (unit-tested). Widget layouts derive state from
  `ctx.date` per timeline entry.
- **Interaction.** The Dhikr button has `target: "increment"`;
  `hooks/use-widget-interactions.ts` listens via `addUserInteractionListener` and
  commits to Convex. The native `IncrementDhikrIntent` + pending-dhikr queue are
  removed.
- **Live Activity.** `widgets/lock-activity.tsx` (`createLiveActivity`). The old
  opaque-id API is preserved through a synthetic-id → instance map so
  `useLockActivityScheduler` is unchanged.
- **Control Center control — DROPPED 2026-05-31.** `LockNowControl` was a
  `@bacons/apple-targets` widget target at `targets/LockNowWidget/`. It collided
  with `expo-widgets`: both add a WidgetKit extension, and apple-targets'
  `applyXcodeChanges` falls back to `targets[0]` (= expo-widgets'
  `ExpoWidgetsTarget`) and crashes on `removeFromProject` of undefined during
  prebuild. Lock-screen presence is covered by expo-widgets' `LockComplications`
  (accessoryCircular/Rectangular/Inline). To restore the Control later, patch
  apple-targets to drop the `?? targets[0]` fallback so a 2nd widget extension is
  created (re-adds a `patches/` entry, the thing this migration removed).

## Known fidelity losses (no `@expo/ui` equivalent)

`@expo/ui/swift-ui` has no `Canvas`/`Path`, gradients, or glass blur. So:
the bead ring, salah arc, streak history, and lock motif are approximated with
`Gauge` / shapes / SF Symbols; gradients became flat colors (`widgets/theme.ts`);
the glass shell became a solid `containerBackground`. Expect to tune visuals on
device.

## Device / Mac validation (NOT done — required before shipping)

1. `bun run prebuild:clean` — verified green 2026-05-31 after dropping
   `targets/LockNowWidget/` (see Control Center note above).
2. `bun run pod` — expect no "Unable to determine Swift version".
3. Build to a **physical iOS 18+ device** (widgets/Live Activities/Control don't
   fully exercise in Simulator).
4. Verify each family, the Dhikr tap round-trip (incl. background/cold-start
   delivery), and the Live Activity tied to salah/quiet windows.
5. `expo-doctor` — the `@bittingz` warning should be gone.

## Open follow-ups to confirm on device

- **Live Activity config:** `createLiveActivity("LockNow", …)` may need a matching
  entry / `NSSupportsLiveActivities` in the `expo-widgets` plugin block in
  `app.json`; verify the activity registers.
- **Widget deployment target:** interactive buttons need iOS 17+; the extension
  target's minimum (vs the app's `16.4`) may need bumping.
- **Style picker:** the old per-widget style enum (editorial/bold/dawn/…) was not
  wired as a widget `configuration` parameter; widgets render their default
  direction. Add `configuration.parameters` if the picker is wanted.
- **Rollback:** tag `pre-bittingz-removal-2026-05-30`.
