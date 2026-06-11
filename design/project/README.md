# Barakah Design System

> **Barakah** is an Islamic *prayer-lock* app. Five times a day, during salah windows, the phone steps aside so the user can show up — not scroll. The product feels calm, editorial, and trustworthy: a white canvas, deep mosque-green accent, and classical serif headlines.

This project is the **design system** for Barakah — tokens, type, components, copy rules, and an interactive UI kit that mirrors the production app.

---

## Sources

This system was authored from the repository **`souravsspace/heybarakah.app`** (default branch `main`). Key source files for full fidelity:

- `DESIGN.md` — the canonical brand spec (colors, type, components, do's/don'ts).
- `CLAUDE.md` / `AGENTS.md` — agent guidance + key brand rules (sentence case, no emoji, Islamic typographic conventions).
- `packages/marketing/src/styles/global.css` — production CSS variables (web).
- `packages/app/contexts/theme-context.tsx` — **the runtime source of truth** for both light and dark palettes (app).
- `packages/app/components/meshes.tsx` — the 9 named background meshes used on every screen.
- `packages/app/components/glass-surface.tsx` — iOS 18 liquid-glass + BlurView fallback wrapper.
- `packages/app/constants/design.ts` — a thin light-mode token snapshot used in places that need raw hex.
- `packages/marketing/src/app-config.ts` — product copy, pricing, footer.
- `packages/app/components/ui/button.tsx` and `packages/app/components/onboarding/*` — exact component implementations referenced here.
- `packages/app/constants/welcome-card-content.ts` — voice/copy reference.
- `assets/` — brand marks, icons, font files (imported into `assets/` and `fonts/` in this project).

Two surfaces are represented:
- **App** (Expo / React Native) — onboarding, prayer-lock home, dhikr counter, achievements, paywall.
- **Marketing site** (web, Tailwind v4) — landing page, FAQ, waitlist.

> **Note:** when this skill was first authored, the app was light-only and used flat-white canvases with no gradients or glass. Production has since shipped dark mode, full-screen background meshes, and selective use of liquid glass. The sections below reflect what's actually shipping today.

---

## Index

| File | Purpose |
|---|---|
| `README.md` | This file. Brand context, content fundamentals, visual foundations, iconography, dark mode. |
| `colors_and_type.css` | All CSS custom properties (light + dark) + semantic type classes. Drop-in for any HTML. |
| `SKILL.md` | Cross-compatible Agent Skill manifest. |
| `fonts/` | `Inter-VariableFont_opsz_wght.ttf`, `LibreBaskerville-Bold.ttf`. |
| `assets/` | Brand marks (`barakah-mark.svg`, `barakah-logo-gradient.svg`), icons, comparison logos. |
| `preview/` | Small HTML cards that populate the Design System tab — one card per token cluster / component cluster, including dark palette + meshes + glass. |
| `ui_kits/app/` | Click-thru recreation of the Barakah mobile app (welcome → onboarding → paywall → home → dhikr → achievements → unlock), with a light/dark toggle. |

---

## CONTENT FUNDAMENTALS

Barakah's voice is **quiet, dignified, and devotional** — never sales-y, never hype.

### Tone
- Calm > urgent. The product is the antidote to noise; the copy must feel like it.
- **Sentence case** for everything that isn't a CTA label, an announcement bar, or an `.t-eyebrow`. Headlines too — `"Your phone, on prayer time."`, not `"Your Phone, On Prayer Time."`.
- All-caps **only** in: primary CTA labels (`TRY FOR $0.00`, `BISMILLAH` is sentence-cased; `BARAKAH` watermark; `MAGHRIB`, `NEXT`, `WORLDWIDE` eyebrows), announcement banners, and badge pills.
- **Second person.** "Your phone, on prayer time." / "You're all set." / "Show up; not scroll."

### Islamic typographic conventions
Honor these spellings everywhere — **never substitute, never anglicize, never auto-correct**:

> **Allah · ﷺ · Qur'an · du'a · salah · fajr · dhuhr · asr · maghrib · isha · adhan · wudu · khushoo · madhab · dhikr · sunnah · Bismillah · in shāʾ Allāh · Assalāmu ʿalaykum · Jannah**

Arabic phrases (`إِنَّ ٱلصَّلَوٰةَ تَنْهَىٰ عَنِ ٱلْفَحْشَآءِ`) appear without translation in atmospheric moments (e.g. the lock screen). Don't gloss them.

### No emoji. Ever.
Brand assets and Ionicons handle all glyph needs. Emoji feels casual and undermines the editorial tone.

### Voice examples (copied from production)

| Surface | Copy |
|---|---|
| Hero | "Your phone, on prayer time." |
| Sub | "Barakah quietly locks distractions during salah. Five times a day, your phone steps aside so you can show up — not scroll." |
| Bismillah card | "Bismillah ir-Rahman ir-Raheem." |
| Welcome card | "Eat with intention" / "Begin meals with gratitude and du'a" / "5 min" |
| Lock preview | "Return to Allah" |
| Home greeting | "Assalāmu ʿalaykum, Sana." / "Your prayer-lock is active. Five times a day, in shāʾ Allah." |
| Home hero | "Next prayer" → *prayer name* → countdown. Active-window label flips to "In progress". |
| Locked tab hero | "Five times." / *"Hands quiet."* (second line italic). Sub: "_n_ apps go quiet for 15 minutes at each prayer." |
| Locked empty-shield | "Choose what should go quiet at salah." / "Pick the apps that pull at you. Barakah will hold them for 15 minutes at every salah." |
| Dhikr counter | Arabic + phonetic + meaning on top. Big tabular count. Completion: "Mashā Allāh". |
| Achievements hero | "Begin where you are" (empty) / *latest unlock title* (filled). Sub eyebrow: "_n_ of _m_ unlocked". |
| Paywall headline | "Lock in your five.\nBegin the return." |
| Trial badge | "7 DAY FREE TRIAL" |
| Permission notice | "Grant permission to begin." / "Barakah needs system permission to quiet apps during prayer. Revoke any time." |

### Microcopy rules
- Prices use a strike-through reference price next to the live price (`$39.99` after `$239.88`).
- Comparison bars are conservational, not boastful — *"costs less than 2 months of Netflix"*, not *"cheaper than Netflix"*.
- Disabled / pending state copy: tertiary gray; never red.
- Status badges (`NEXT`, `7 DAY FREE TRIAL`) are pill-shaped, tracked 0.6–2.4px, 10–12px font.

---

## VISUAL FOUNDATIONS

### Color
The palette is intentionally narrow. **Mosque green `#29603E` is the only accent in light mode.** Everything else is black, white, and cool grays. Cream tones (`#F5EBDB`, `#FAF4E8`, and the new canvas `#F8F1E1` used on the Achievements / Splash screens) appear only as editorial support behind illustrations or as warm ceremonial canvases; never as a UI accent. Peach `#EAB5A8` and sage `#B5CFC0` are **data colors only** — comparison bars on stats screens — and must never carry UI state. Gold `#C9A23A` (`--color-premium`) is reserved for tier indicators on the paywall and achievements; never for primary actions.

In **dark mode** the accent shifts to a brighter `#00D26A` so the green stays legible on near-black surfaces. See [Dark mode](#dark-mode) below.

### Type
Two families:
- **Libre Baskerville Bold** — headlines only. `headline-display 38px`, `h1 31px`, `h2 24px`. Slightly classical, dignified. Never used for body or labels.
- **Inter** — everything functional. `h3 20px/600`, `body 18px/400`, `label 14–16px/500`, `caption 12px/400`, `eyebrow 10px/700` with `0.24em` tracking.

**Italic Libre Baskerville** is used sparingly as a counter-voice next to an upright serif sibling. Production uses it for:
- the locked-screen second line (`Five times.` / *`Hands quiet.`*)
- achievement category labels (`Beginnings`, `Salah`, `Continuity`…)

Never set a whole headline in italic; always pair with an upright sibling. Because the project ships Libre Baskerville **Bold only**, the italic is browser/RN-synthesized — acceptable for now; flag and request the italic file if a higher-fidelity surface needs it.

**Tracking on big headlines.** Display sizes (≥30px) in the production code use slight negative tracking (`-0.018em` / `-0.6px`) to keep the serif from feeling airy at scale. The `.t-display-hero` class in `colors_and_type.css` bakes this in. Smaller headlines and all UI labels keep `letter-spacing: 0`. Only eyebrows and CTAs use tracked uppercase.

> **Eyebrow divergence flagged.** The app uses `10px / 700 / 0.24em` for eyebrows. Marketing's `global.css` defines `.t-eyebrow` as `12px / 600 / 0.14em`. These are intentionally different (web reads at smaller scale than a phone) — the `.t-eyebrow` class in this skill ships the **app** value. Use the marketing one only when matching the web hero specifically.

### Spacing & layout
Scale: `6 / 14 / 24 / 40 / 100` (xs/sm/md/lg/xl). Layouts are centered, mobile-first, and **stacked vertically** with generous breathing room. There is no multi-column grid. Section gaps trend large; cards use 24px internal padding. The headline is given priority — body copy gets weight contrast (e.g. an emphasized "5 minutes" inside a tertiary paragraph) rather than decorative styling.

### Background
**Backgrounds are quiet canvases, not flat white.** The production app paints every screen with a **soft radial-gradient mesh** on top of a near-white (or in dark mode, near-black) base. These meshes are intentional and brand-defining — they read as light coming into a room, not as decoration. They live in [`packages/app/components/meshes.tsx`](https://github.com/souravsspace/heybarakah.app/blob/main/packages/app/components/meshes.tsx).

The nine canonical meshes (each ships both a light and a dark variant):

| Mesh | Used on | Light base | Mood |
|---|---|---|---|
| `HomeMesh` | Home tab | `#F8FAF8` | Dawn from the top-left, mosque-green wash bottom-right |
| `LockedMesh` | Locked tab | `#F4F6F4` | Cool column from above, green floor-glow |
| `ProfileMesh` | Profile tab | `#F8FAF8` | Warm dome from the top |
| `DhikrMesh` | Dhikr counter | `#F8FAF8` | Halo crown at top, faint green ring |
| `RecordMesh` | Dhikr record | `#F8FAF8` | Margin warmth from the left |
| `ProgressMesh` | Progress | `#F8FAF8` | Green sweep from bottom-left |
| `UnlockMesh` | Unlock flow | `#F8FAF8` | Threshold light from above + two corner washes |
| `AchievementsMesh` | Achievements ledger | `#F8F1E1` (`--canvas-hidayah`) | Cream paper, gold-warm crown, faint green whispers |
| `SplashMesh` | App launch | `#F8F1E1` | Cream paper, single quiet accent |

**Rules:**
- Meshes are full-bleed, behind everything. They never carry interaction.
- Always pair with the corresponding base color from `--canvas-*` tokens — don't put a mesh on plain white.
- Cards and rows sit *on top of* the mesh as translucent surfaces (`rgba(255,255,255,0.06–0.42)` in light, `rgba(26,26,26,0.10–0.58)` in dark) with a hairline border. The mesh shows through.
- Never invent a new mesh for a one-off; reuse the existing nine. If a screen genuinely needs a new mood, add it to `meshes.tsx` first and update this table.

The single full-color exception remains the **lock screen itself** — a flat `bg-primary` green with a faint white radial halo (8% → 0% opacity). That ceremonial usage is distinct from the editorial meshes above.

### Imagery
The welcome card stack uses 12 illustrated PNGs (warm cream-and-green palette, no people detail). Tone is warm, editorial, no grain or filters. Apart from those illustrations and a single `mihrab.png` photograph, imagery is sparse.

### Iconography (full section below)
Ionicons set — `checkmark-circle`, `lock-closed-outline`, `logo-apple`, `logo-google`, `mail-outline`. Status-bar glyphs (`battery.png`, `wifi.png`, `dual-cell-signals.png`) live as bitmap PNGs in the lock-preview only.

### Borders & dividers
The interface separates content with **hairline borders, not shadows**.
- `1px solid #E5E7EB` for default cards and inputs.
- `1.5px` for option rows, auth provider buttons, inputs.
- `2.5px` for paywall plan cards (only here does border weight communicate emphasis).
- In-card list dividers: `1px solid #EFEFEF` (lighter than the card border).

### Elevation
**The interface is mostly flat.** Hierarchy comes from contrast and selected fills, not shadow.
- Default cards: no shadow. A 1px hairline border + a 6–42%-opacity surface fill over the screen mesh is enough separation.
- CTA hover/focus (web only): `0 8px 24px rgba(41,96,62,0.28)` — a soft green shadow. In dark mode the same token uses `rgba(0,210,106,0.22)`.
- Welcome swipe cards: the *only* place a card shadow appears in the app. `shadowColor: #0B1710`, offset `0 4–8`, opacity `0.04–0.08`, radius `10–18`.

**Glass is allowed, sparingly.** Production ships `components/glass-surface.tsx`, which uses iOS 18's `expo-glass-effect` `GlassView` when available and falls back to `expo-blur` / `BlurView` everywhere else. Use it for:
- the **scroll-blur header** that fades the status-bar area as content scrolls under it (`scroll-blur-header.tsx`)
- floating action sheets and the unlock-confirm panel
- chrome on top of the locked screen's full-bleed mesh

Use the `--glass-fallback-bg` and `--glass-border` tokens. Glass surfaces always sit *over* a mesh or full-bleed color — never over flat white, where the blur reads as nothing. Glass is not a general card style; default to the hairline-border card.

### Corner radii
`sm 4 · md 8 · lg 12 · xl 16 · 2xl 24 · full 9999`. Buttons and cards default to **16px (`rounded-2xl`)**. Inputs `18px`. Pills (`chip`, `badge`, `progress-bar`) use `full`. Welcome cards use `xl` (12). Geometry is soft and approachable, never sharp.

### Cards
White surface · 1px neutral border · `rounded-2xl` (16px) · 24px padding. They feel like *outlined containers*, not floating panels. Cards never have drop shadows in normal flow.

### Selection / state
Selected option rows animate (160ms `ease-out`):
- Fill: white → `#E8F0EA` (primary-soft)
- Border: `#E5E7EB` → `#29603E`
- Label color: ink → primary
- Trailing icon: neutral hollow circle → solid green `checkmark-circle`

Disabled buttons: `bg-neutral` fill, `text-tertiary` label, no border. Pressed state for everything is a quiet **opacity drop** to 0.92 (main buttons, plan cards) or 0.6 (link buttons). Light haptic on press, native side.

---

## DARK MODE

Dark mode is a **first-class theme**, not an inverted afterthought. It ships in production via `packages/app/contexts/theme-context.tsx`, persists user preference in AsyncStorage (`@barakah/app-theme-mode`), and supports three modes: `system` (default), `light`, `dark`.

Key shifts:

| Token | Light | Dark | Why |
|---|---|---|---|
| `--color-primary` | `#29603E` | `#00D26A` | Brighter mosque green so the accent stays legible on near-black surfaces. Still the only accent. |
| `--color-primary-soft` | `#E8F0EA` | `#0E2A1B` | Selection fill darkens into a deep mosque tone, not a wash of light. |
| `--color-bg` | `#FFFFFF` | `#000000` | True black on OLED. |
| `--color-surface` | `#FFFFFF` | `#141414` | Cards live just above the canvas. |
| `--color-card` | `#FFFFFF` | `#1A1A1A` | Card-rest is the *lightest* near-black; surface-soft (`#171717`) sits between. |
| `--color-bg-elevated` | `#FFFFFF` | `#0E0E0E` | Sheets, modals — slightly above the canvas, below the surfaces. |
| `--color-border` | `#EAEAEA` | `#262626` | Hairlines stay just barely visible. |
| `--color-ink-muted` | `#6B7280` | `#8E8E93` | iOS-system-secondary on dark. |
| `--color-premium` | `#C9A23A` | `#E4C168` | Gold lifts slightly for contrast. |
| `--color-error` | `#B42318` | `#FF453A` | iOS-system-red on dark. |

**The dark canvas is layered.** Screens use one of three base tones depending on mood:
- `--canvas-default: #0E1311` — Home, Achievements (slightly green-tinted)
- `--canvas-locked: #0B0E0C` — Locked, Profile, Dhikr, Progress, Record, Unlock (cooler, deeper)
- Every screen still wears its `*Mesh` on top — the dark meshes use luminous-green and cool-mist stops at 7–42% opacity to suggest depth without ever turning into a vignette.

**Status bar.** Light mode → dark icons. Dark mode → light icons. The mode tracks `useTheme().scheme` and pipes into Expo's `<StatusBar>`.

**How to opt in (HTML).** The skill's `colors_and_type.css` ships both palettes:
```html
<!-- explicit dark -->
<html data-theme="dark">…

<!-- explicit light -->
<html data-theme="light">…

<!-- follow OS preference (default) -->
<html>…
```
Or scope to a subtree with `class="theme-dark"`. When unset, the stylesheet picks up `@media (prefers-color-scheme: dark)`.

**What to avoid in dark mode:**
- Don't reuse the light `#29603E` on a dark surface — it sits at 4.2:1 against `#141414`, below AA Large. Use `var(--color-primary)`, which auto-switches to `#00D26A`.
- Don't drop a pure white card onto the dark canvas. Use `--color-card` (`#1A1A1A`) with a `--color-border` (`#262626`) hairline.
- Don't tint the cream canvas (`--canvas-hidayah`) into dark; it collapses to `--canvas-default` (`#0E1311`) on Achievements in dark mode.

---

### Animation
- **Default entrance:** `FadeSlideIn` — opacity 0→1, translateY 8→0 over **220ms ease-out cubic**, with small staggered delays (e.g. `120ms`, `260ms`, `520ms`).
- **Count-ups:** `800–1400ms`.
- **Selection transitions:** `160ms ease-out` color interpolation.
- **Progress bars:** `250ms ease-out` width animation.
- **Breathing / loading loops:** slow, calm, looping — never bouncy.
- **Welcome card swipe:** `320ms ease-out`. Cards offset by 8/10px steps; rotate ±9° only during drag.
- **Never:** spring bounce, scale punches, glow pulses, parallax.

### Transparency & blur
Used **only** on the lock screen: white text at `0.78` / `0.65` / `0.45` opacity to suggest reverence and recede behind the green. Background `rgba(255,255,255,0.35)` hairlines around the prayer-name eyebrow. No `backdrop-filter`. No frosted glass.

### Focus
`outline: 2px solid var(--color-primary); outline-offset: 2px; border-radius: 2px` — applied only on `:focus-visible`. Keyboard users see the green ring; mouse users don't.

### Layout grids (web)
A single fixed-width centered column dominates the marketing page. The hero takes the middle of the viewport. Comparison sections live in a generous 2-column row that collapses to one on mobile.

### Don'ts (from `DESIGN.md`, verbatim intent)
- ❌ Dark *gradient* backgrounds, decorative textures, busy patterns. (Editorial meshes are fine — see above.)
- ❌ Sans-serif hero treatments
- ❌ Large drop shadows on cards; use hairline borders + a soft surface fill instead
- ❌ Loud uppercase, wide tracking (`>0.24em`)
- ❌ Emoji, anywhere
- ❌ Peach/sage tones as UI state
- ❌ Gold (`--color-premium`) as a primary action color; it's for tier indicators only
- ❌ Red, except for `--color-error` on invalid form states
- ❌ Inventing a new background mesh for a single screen — reuse the nine in `meshes.tsx`
- ❌ Whole-headline italic; italic serif is a counter-voice, always paired with an upright sibling

---

## ICONOGRAPHY

Barakah uses **two distinct icon systems**, one per surface.

### App (Expo / React Native)
`@expo/vector-icons` → **Ionicons**. Single-color, outlined or filled by glyph name. The codebase exclusively imports from `Ionicons`; no other icon set is used.

Glyphs observed in production:
| Glyph | Where |
|---|---|
| `checkmark-circle` | selected option row, paywall check |
| `checkmark` | tiny check inside the paywall selected-pill |
| `lock-closed-outline` | lock-preview footnote |
| `logo-apple`, `logo-google`, `mail-outline` | auth provider buttons |
| `trophy-outline` | Home → Achievements entry (top-right disc) |
| `chevron-back` | Achievements + sheet headers |
| `arrow-forward` | empty-shield CTA tail |
| `add` | empty-shield add-disc |

Sizes cluster at **18–20px** in chrome, **22px** for selection indicators, and 26–64px for hero positions. Color is either `var(--color-primary)` (active / primary), `var(--color-ink)` (on white auth buttons), or `var(--color-ink-muted)` (inactive / tertiary).

**Status-bar glyphs** on the lock-screen mock (`battery.png`, `wifi.png`, `dual-cell-signals.png`) are tiny bitmap PNGs tinted `#FFFFFF`. They are *only* used there.

### Marketing
`packages/marketing/src/lib/icons.tsx` defines a tiny **inline-SVG** icon kit — currently just a check / chevron / mail / arrow set, hand-rolled and stroke-weighted to match Ionicons visually. No icon font is loaded on web; SVGs render inline so they inherit `currentColor`.

### Use in this design system
For the UI kit and previews in this project, Ionicons is delivered via the **public Ionicons CDN** so we don't have to bundle the icon font:

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/ionicons@7.2.2/dist/ionicons/ionicons.esm.js"></script>
<script nomodule src="https://cdn.jsdelivr.net/npm/ionicons@7.2.2/dist/ionicons/ionicons.js"></script>

<ion-icon name="checkmark-circle" style="color: var(--color-primary); font-size: 22px;"></ion-icon>
```

This is a **direct substitution** — same vendor, same glyph names — not a swap. Flagged here only because it's a runtime delivery change.

### Logos & marks
- `assets/barakah-mark.svg` — the official Barakah glyph (production marketing & app icon). 2.1KB. Inherits `currentColor` via `fill`.
- `assets/barakah-logo-gradient.svg` — the angular-gradient logotype variant used at large scale on landing.
- `assets/barakah-mark-no-g.svg` — gradient-less mark for use in monochrome or print.

### Emoji & unicode
**Never.** The brand explicitly rejects emoji. Unicode symbols are also avoided; what looks like a separator dot in copy ("`12 mo · $39.99`") is a `·` (middot, U+00B7), not a decorative bullet.

---

## Substitutions flagged

| Item | Provided | Used | Notes |
|---|---|---|---|
| Inter font | `uploads/Inter-VariableFont_opsz_wght.ttf` | `fonts/Inter-VariableFont_opsz_wght.ttf` | Variable-axis (opsz + wght 100–900) — matches production. Self-hosted; no substitution. |
| Libre Baskerville Bold | `uploads/LibreBaskerville-Bold.ttf` | `fonts/LibreBaskerville-Bold.ttf` | Bold-only. Production also uses Bold-only — no substitution. |
| Libre Baskerville Italic | (none provided) | Browser/RN-synthesized | Used as a counter-voice (e.g. locked-screen second line). Production also relies on `fontStyle: "italic"` synthesis. Flag and request a real italic file if needed. |
| Ionicons | (none provided) | CDN `ionicons@7.2.2` | Same library the app uses; CDN-delivered. |
| Marketing tokens vs app tokens | One stylesheet | Two palettes referenced | `colors_and_type.css` carries both; use `--color-primary-soft` (app, `#E8F0EA`) by default, `--color-primary-soft-2` (`#EAF2EC`) when matching marketing pixel-for-pixel. |

If a non-bold weight of Libre Baskerville is ever needed, **flag and request** — production only ships Bold and the brand spec presumes that.

---

## SURFACES

The app ships these screens (status as of latest `main`):

**Onboarding** — `welcome` → `problem` → `promise` → `lock-preview` → quiz (`gender` → `madhab` → `consistency` → `struggle` → `goal`) → config (`calc-method` → `prayers` → `strictness`) → `permissions` → `prayer-times` → `calculating` → `testimonial` → `stats` → `hadith` → `commit` → paywall (`try-free` → `akhira-worth` → `plans`).

**App tabs** — `home` (greeting + next-prayer hero + ledger), `locked` (shield setup + suggested + all-apps list), `dhikr` (counter + completion), `progress`, `profile`.

**Modal / sub-screens** — `achievements` (ledger w/ categories, beads, hero rosette), `unlock` (temporary unlock w/ countdown), `dhikr-record` (preset switcher).

The `ui_kits/app/` directory contains a click-thru HTML recreation of the main loops. The kit's `index.html` exposes a light/dark toggle that flips `data-theme` on the root.

---

## Working with this system

Drop `colors_and_type.css` into any HTML file:
```html
<link rel="stylesheet" href="colors_and_type.css">
<h1 class="t-display">Your phone, on prayer time.</h1>
<p class="t-body-sm">Barakah quietly locks distractions during salah.</p>
```

Brand color is `var(--color-primary)`. Everything else falls out of that.

To opt into dark mode for a page or subtree:
```html
<html data-theme="dark">     <!-- explicit dark -->
<html data-theme="light">    <!-- explicit light -->
<html>                       <!-- follow OS preference -->
```

To put a card on top of one of the meshes, paint the screen with the right canvas token, drop the mesh SVG behind everything, and use a translucent surface for the card so the mesh shows through:
```css
.screen        { background: var(--canvas-default); position: relative; }
.screen-mesh   { position: absolute; inset: 0; pointer-events: none; }
.card          { background: rgba(255,255,255,0.42); border: 1px solid var(--glass-border);
                 border-radius: var(--radius-2xl); backdrop-filter: blur(8px); }
```

For full mesh SVG references, see [`packages/app/components/meshes.tsx`](https://github.com/souravsspace/heybarakah.app/blob/main/packages/app/components/meshes.tsx) — the same gradients work in static HTML with `<svg viewBox="0 0 320 220">…</svg>` set to `position: absolute; inset: 0`.
