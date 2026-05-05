# Barakah App — UI Kit

A high-fidelity recreation of the Barakah Islamic-app experience, derived from `uploads/DESIGN.md`. No production codebase was provided; treat this as a strong starting point and flag any drift from the real product.

## Files

- `index.html` — runnable showcase. Opens with five core screens stacked side-by-side in iOS frames.
- `styles.css` — UI-kit-specific classes (`.bk-banner`, `.bk-btn`, `.bk-card`, `.bk-row`, etc). Imports `colors_and_type.css`.
- `Components.jsx` — atomic UI: `Banner`, `Button`, `Card`, `Chip`, `Icon` (Lucide), `TopBar`, `TabBar`, `PrayerRow`, `PrayerCountdown`, `LockMark`, `FakeStatusBar`.
- `Screens.jsx` — five screen compositions: `ScreenWelcome`, `ScreenLocation`, `ScreenHome`, `ScreenPrayerLock`, `ScreenLesson`.
- `ios-frame.jsx` / `tweaks-panel.jsx` — starter components for device chrome and tweaks.

## Screens

1. **Welcome** — display headline, lock-mark visual, primary CTA, link to sign-in.
2. **Location** — onboarding step 2/3: city + madhhab selection.
3. **Home** — banner + countdown ring + today's prayer list + lesson card + chip row + tab bar.
4. **Prayer lock** — full-screen reverent pause on a deep-green ground; serif quote from the Qur'an, "I prayed" button.
5. **Lesson** — editorial reading view with serif quote pull-out and footer actions.

## Visual rules in use

- Single accent: `--color-primary` (#29603E). No other accent colors are introduced.
- Pill buttons (`radius-full`); `radius-sm` (4px) for cards & inputs.
- The CTA glow `0 8px 24px rgba(41,96,62,0.28)` is the brand's only expressive shadow.
- Hairline borders + whitespace handle separation. No drop shadows on cards by default.
- Lucide is the icon set, loaded from CDN with `1.75` stroke. No emoji.
