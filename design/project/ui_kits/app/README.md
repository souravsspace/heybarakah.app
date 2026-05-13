# Barakah App — UI Kit

Pixel-recreation of the Barakah mobile app flow as a clickable web prototype.

## Screens (left to right)

1. **Welcome** — brand intro with the swipeable card stack. Tap the top card to advance through the 12-card welcome content; tap `Bismillah` to move on.
2. **Onboarding (madhab)** — quiz-style screen with the `OptionRow` cluster. Pick a madhab, tap **Continue**.
3. **Paywall** — yearly / monthly plan cards, all-caps CTA, link row.
4. **Home** — prayer-lock active state. Strict / fajr toggles, today's prayer schedule, "Preview lock screen" entry.
5. **Lock** — ceremonial green, Arabic ayah, transparent bypass button. Tap "Bypass (logged)" to return.

## Files
- `index.html` — host page; shows all five frames side-by-side with a nav strip.
- `ios-frame.jsx` — device chrome (starter component).
- `components.jsx` — atoms: buttons, eyebrow, option row, plan card, switch, progress bar, etc.
- `screens.jsx` — the five full-screen compositions.

## Fidelity notes
- All copy is lifted from the production repo (`welcome-card-content.ts`, `app-config.ts`, lock-screen views).
- Spacing, type, color, radii follow `../../colors_and_type.css`.
- The Arabic ayah on the lock screen is rendered with Libre Baskerville — production uses a system Arabic stack. Flagged.
- Icons are inline SVG approximations of Ionicons for the chrome here (back chevron, lock); for full-fidelity icons, see the iconography card.
