# Prayer Shield — what to do

Branch: `feat/prayer-shield`

This screen + backend ship app-blocking during prayer windows via `expo-app-blocker` (Screen Time on iOS, UsageStats overlay on Android) plus local notifications + best-effort background task for reliability.

---

## 1. Before you build (one-time)

### 1a. Apple Team ID

Open `packages/app/app.json`, replace:

```json
"appleTeamId": "TODO_APPLE_TEAM_ID"
```

with your real Apple Developer Team ID (10-char alphanumeric, e.g. `ABC1234DEF`). Find at https://developer.apple.com/account → Membership.

### 1b. Apple Developer Portal — register 4 App IDs

Each needs **Family Controls** + **App Groups** capabilities:

1. `com.souravsspace.Barakah` (main)
2. `com.souravsspace.Barakah.DeviceActivityMonitor`
3. `com.souravsspace.Barakah.ShieldAction`
4. `com.souravsspace.Barakah.ShieldConfiguration`

Create App Group: `group.com.souravsspace.Barakah.shield` — assign to all 4 App IDs.

Use **Family Controls (Development)** capability in Xcode while waiting for Apple distribution approval. Dev builds work fully. Marked "Development only" in Signing & Capabilities.

### 1c. Submit Family Controls distribution approval (parallel — takes days/weeks)

Submit **once per bundle ID** (4 total): https://developer.apple.com/contact/request/family-controls-distribution

Required for TestFlight / App Store submission. NOT required for dev builds on your device.

---

## 2. Build + run dev

From `packages/app`:

```bash
bunx expo prebuild --clean
bunx expo run:ios --device
```

**Physical device required.** Screen Time APIs do not work in the iOS simulator.

For Android:
```bash
bunx expo run:android
```
Works in emulator.

### Xcode capability assignment

After `prebuild --clean`, open the generated Xcode workspace:

```
packages/app/ios/Barakah.xcworkspace
```

For each of the 4 targets (main + 3 extensions):
- **Signing & Capabilities** tab
- Add **Family Controls (Development)** capability
- Confirm **App Groups** capability shows `group.com.souravsspace.Barakah.shield` checked
- Confirm signing team matches `appleTeamId` in app.json

---

## 3. First-run flow on device

1. Launch app, navigate to Locked tab
2. Tap **Pick** word-toggle
3. CTA prompt → tap **Enable Screen Time** → grant in system sheet
4. Inline picker renders → select social apps to silence at salah → done
5. Notification permission prompt (first time scheduling) → grant
6. Back to **Quieted** word-toggle → confirms selection rendered via `BlockedAppsNativeList` (real names + icons rendered by Apple)
7. Window pills row — toggle Fajr/Dhuhr/Asr/Maghrib/Isha to choose which prayers
8. Shield engages immediately. Apps show Barakah's shield overlay ("Quiet at salah.") during prayer windows.

---

## 4. How it works

| Component | Role |
|---|---|
| `convex/lib/shieldSelection.ts` | Stores selection blob (iOS) or package names (Android) + chosen windows per user. Cross-device sync. |
| `expo-app-blocker` library | Picker UI, native list, shield apply/clear, temp unlock, foreground monitor (Android) |
| `hooks/usePrayerShield.ts` | On change + AppState→active: applies shield always-on, temp-unlocks during non-prayer windows. Computes from `usePrayerTimes`. |
| `lib/prayer-shield-notifications.ts` | Schedules 5 local notifications daily, 1 min before each chosen prayer window |
| `lib/prayer-shield-task.ts` | Registers `expo-background-task` for best-effort daily wake |

**Window duration:** hardcoded 20 min per prayer. Edit `WINDOW_DURATION_MIN` in `hooks/usePrayerShield.ts` to change.

---

## 5. v1 limitations (acknowledged)

| Limitation | Impact | Future fix |
|---|---|---|
| iOS shield reliability depends on user opening app or notif | If user ignores notif + doesn't open for >24h, shield state stays at last computed value | Native `expo-prayer-shield` module w/ DeviceActivityCenter scheduling |
| Android polling ~500ms | Blocked app briefly visible before overlay | Inherent to UsageStatsManager approach |
| Cross-device iOS restore | New device shows picker pre-filled but user must re-confirm to apply native shield | iCloud-backed FamilyActivitySelection (Apple limitation) |
| No per-app window override | Window pills are global, apply to all selected apps | Add per-app sheet in v2 |
| BG task no-op body | Just exists to keep iOS happy; doesn't actively refresh shield | Cache shield state to AsyncStorage and have task call temp-unlock from cache |

---

## 6. Open work (next sessions)

In priority order:

1. **Native scheduling module** (`modules/expo-prayer-shield`) — fork `expo-app-blocker`'s DeviceActivityMonitor extension to handle prayer-window activities natively. Eliminates "must open app" footgun. Requires device iteration.
2. **Per-app window override** — bottom sheet on row tap, accordion w/ 5 prayer checkboxes per app.
3. **Shield button → du'a flow** — wire `addPendingUnlockListener` to a short du'a screen the user must complete to unlock early.
4. **Tests** — window-math + scheduling logic w/ `bun:test`.
5. **Strictness configurability** — pull `WINDOW_DURATION_MIN` from `users.strictness` profile field (`adhan-iqama` = 20m, `full-window` = until next prayer).

---

## 7. EAS build (when ready for TestFlight)

App.json already has `extra.eas.build.experimental.ios.appExtensions` for the 3 extensions. Run:

```bash
eas build --profile development --platform ios
```

Requires Family Controls distribution approval to upload to TestFlight.

---

## 8. Troubleshooting

**`Failed to load '@bacons/apple-targets'` during prebuild**
→ `bun add @bacons/apple-targets` as direct dep of `packages/app` (already done; re-run if monorepo resolver issue).

**Shield doesn't appear after picking apps**
→ Confirm Screen Time permission granted: Settings → Screen Time → "Barakah" listed.
→ Confirm Family Controls (Development) capability is checked in Xcode for all 4 targets.

**`canOpenURL` errors in logs**
→ Stale code from earlier `lockedApps` model. None should remain. If seen, file an issue.

**Notification didn't fire**
→ iOS: Settings → Notifications → Barakah → Allow.
→ Verify in app: trigger a window pill toggle to force reschedule.

**Android shield not engaging**
→ Grant "Display over other apps" + "Usage access" in system settings. Library exposes `openOverlaySettings()` + `openUsageStatsSettings()` if needed in UI.

---

## 9. Git

Branch: `feat/prayer-shield`
PR ready: https://github.com/souravsspace/heybarakah.app/pull/new/feat/prayer-shield

Commits to date: 18 (configured + backend + screen + hook + reliability layer).
