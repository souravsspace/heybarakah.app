# Achievement popup + icon redesign — A–Z plan

Scope: fix the three reported issues and ship a brand-aligned centered dialog. No new backend work.

## Reported issues

1. **Popup is a bottom sheet** — user wants a centered alert dialog like shadcn/ui.
2. **No close affordance** — needs an X button.
3. **Design feels off-brand** — full visual redesign per `design/`.
4. **"Continue" does nothing** — currently markSeen + setActive(null) fire, but touch routing through the absolute bottom sheet over a full-screen backdrop Pressable can swallow taps. Restructure resolves it.
5. **Top-right home trophy icon does not navigate** — `(app)/achievements.tsx` is a hidden NativeTabs trigger; `router.push("/achievements")` from inside the tab group doesn't surface a hidden sibling tab. Move route out of `(app)` to root stack.
6. **Trophy icon color** — should be white (filled mosque-green circle), per the user.

## Design decisions

- **Anatomy** — shadcn AlertDialog vibe, Barakah brand discipline:
  - Backdrop: `expo-blur` `BlurView` `intensity={24}` over `rgba(0,0,0,0.5)` (dark) / `rgba(14,19,17,0.35)` (light).
  - Card: centered, `maxWidth: 360`, `borderRadius: 20`, hairline border `rgba(41,96,62,0.16)` light / `colors.border` dark, paper surface `colors.bg` / `#FAF7F0`. No shadow (brand).
  - Top row: eyebrow `Achievement unlocked` left, X close button right (`Ionicons close` 20px, ink muted).
  - Center column: 56px circle ring icon, serif title 22px, sans description 14px / 21px line-height, optional quote block w/ left rule mosque green.
  - Action: single full-width mosque-green pill CTA `Continue`. Tap → `markSeen` + close.
- **Motion**: opacity 0→1 (180ms) + scale 0.96→1 (220ms) ease-out cubic enter; opacity 1→0 (140ms) exit. No spring, no bounce.
- **Trophy home icon**: filled `colors.primary` circle bg, white `trophy-outline` glyph; press state darkens to `colors.primaryDark`.
- **Accessibility**: dialog has `accessibilityViewIsModal`, X has `accessibilityLabel="Close"`, backdrop tap also closes.

## Routing change

- Move `packages/app/app/(app)/achievements.tsx` → `packages/app/app/achievements.tsx` (root stack screen).
- Remove `<NativeTabs.Trigger hidden name="achievements" />` from `packages/app/app/(app)/_layout.tsx`.
- Register `<Stack.Screen name="achievements" />` in `packages/app/app/_layout.tsx`.
- `(app)/home.tsx` already pushes `/achievements`, no change to the route string.

## Component rewrites

- Rename `achievement-detail-sheet.tsx` → `achievement-dialog.tsx`. Reused by both the screen's tap-to-detail and the popup provider.
- `achievement-popup-provider.tsx` swaps import to dialog; keeps queue + dismissedRef race guard.

## Touch-routing fix

- Inside the Modal, structure: a `View` (full-screen flex) containing:
  - Absolutely positioned `BlurView` backdrop with an over-layered `Pressable` for backdrop dismiss.
  - A centered card `View` (not a Pressable), with its own internal Pressables for X and CTA.
- Card area is _not_ a Pressable, so child taps reach the CTA cleanly.

## Steps A–Z

A. Write this plan file (this commit).
B. Move achievements screen out of `(app)` group; update both layouts.
C. Recolor home top-right icon to filled mosque green + white glyph.
D. Replace `achievement-detail-sheet.tsx` with a centered `achievement-dialog.tsx` (BlurView backdrop, scale+fade, X close, full-width CTA, design tokens).
E. Update the achievements screen and popup provider to use the new dialog component.
F. `bun x ultracite fix` + `bun turbo typecheck` — green.
G. Per-file conventional commits.
H. `git push origin dev`.

## Verification

- Cold sim: home → trophy icon tap → `/achievements` screen renders.
- Tap a locked card → centered dialog opens, X closes, backdrop closes.
- Log Fajr on time → popup renders centered with "Achievement unlocked" eyebrow → press Continue → dialog closes, achievement marked `seenAt` (re-open app, popup does not re-show).
- Light + dark scheme both render; no flicker.

## Out of scope

- No new achievement types, no animation embellishments, no schema changes.
- Convex `dev` not needed (no backend touched).
