# Barakah App — UI Kit

Pixel recreation of the **heybarakah.app** mobile flow as a clickable web prototype. Refreshed from `souravsspace/heybarakah.app` → `packages/app`.

## Screens

### Onboarding (`(onboarding)/*`)
1. **Welcome** — swipe-stack of the 12 welcome-card topics, "Bismillah" CTA.
2. **Promise** — "Locks you out during salah." with the twin-mosque illustration + 3 steps.
3. **Lock preview** — green ceremonial device with countdown ring and Arabic ayah.
4. **Madhab quiz** — option-row cluster for fiqh selection.
5. **Paywall** — yearly / monthly / family plans with "TRY FOR $0.00" CTA.

### Main app (`(app)/*`)
6. **Home** — date line ("Mon, Apr 12 · 11 Ramaḍān 1446"), `Assalāmu ʿalaykum` greeting, focal "In progress" card with the mosque-minaret corner motif, today ledger with five prayer rows (active row enlarged with progress hairline).
7. **Progress** — "Mā shāʾ Allāh." hero with `18/35` on-time count, daily area chart, and the by-prayer matrix (on-time fill / late hatched / qadā filled / empty hairline).
8. **Dhikr** — full-screen tasbih counter for *Subhanallah*: Arabic + phonetic + meaning, `132px` count, rising primary-soft fill driven by progress.
9. **Locked** — "Five times. Hands quiet." manifesto, suggested social-app row with selection rings, all-apps list with search + per-row toggles.
10. **Profile** — gradient avatar header card with PREMIUM badge, and Account / Permissions / Support & Legal / Account Actions sections.

All five main-app screens share the dark floating tab-bar (Home · Progress · Dhikr · Lock · You) and a subtle radial-mesh background tuned per screen.

## Files
- `index.html` — host page; groups all ten frames under **Onboarding** and **App** with a sticky nav strip.
- `ios-frame.jsx` — device chrome (starter component).
- `components.jsx` — atoms: `Button`, `OptionRow`, `OnboardingHeader`, `StatusBar`, `MeshBg`, `MosqueMinaret`, `MosquePodium`, `MosqueTwin`, `WelcomeIllust`, `Icon`, `IconBox`, `AppGlyph`, `TabBar`, `GradientAvatar`.
- `screens.jsx` — five onboarding compositions.
- `app-screens.jsx` — five main-app compositions plus `PrayerRow`, `AreaChart`, `PrayerMatrix`, `PermissionRow`.

## Fidelity notes
- Tokens lifted from `tailwind.config.js`: primary `#29603E`, ink `#0F1311`, tertiary `#6B7280`, neutral `#E5E7EB`, cream `#F5EBDB`, paper `#F4F2EE`. Type pairs Inter sans / Libre Baskerville Bold.
- Copy lifted verbatim from `welcome-card-content.ts`, `app-config.ts`, `(app)/home.tsx`, `(app)/locked.tsx`, `(app)/dhikr/_layout.tsx`, `(app)/profile.tsx`.
- Mosque illustrations are inline-SVG approximations of the production `components/onboarding/illustrations/*` set — geometric, not pictorial.
- Social-app icons and the all-apps list use monogram placeholders; the production app uses real app icons.
- Static state: each prayer row + dhikr counter + permission row is fixed at a representative value; nothing animates between screens.
