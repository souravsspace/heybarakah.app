# Barakah Design System

> **Barakah** is an Islamic *prayer-lock* app. Five times a day, during salah windows, the phone steps aside so the user can show up — not scroll. The product feels calm, editorial, and trustworthy: a white canvas, deep mosque-green accent, and classical serif headlines.

This project is the **design system** for Barakah — tokens, type, components, copy rules, and an interactive UI kit that mirrors the production app.

---

## Sources

This system was authored from the repository **`souravsspace/heybarakah.app`** (default branch `main`). Key source files for full fidelity:

- `DESIGN.md` — the canonical brand spec (colors, type, components, do's/don'ts).
- `CLAUDE.md` / `AGENTS.md` — agent guidance + key brand rules (sentence case, no emoji, Islamic typographic conventions).
- `packages/marketing/src/styles/global.css` — production CSS variables.
- `packages/marketing/src/app-config.ts` — product copy, pricing, footer.
- `packages/app/components/ui/button.tsx` and `packages/app/components/onboarding/*` — exact component implementations referenced here.
- `packages/app/constants/welcome-card-content.ts` — voice/copy reference.
- `assets/` — brand marks, icons, font files (imported into `assets/` and `fonts/` in this project).

Two surfaces are represented:
- **App** (Expo / React Native) — onboarding, prayer-lock home, paywall.
- **Marketing site** (web, Tailwind v4) — landing page, FAQ, waitlist.

---

## Index

| File | Purpose |
|---|---|
| `README.md` | This file. Brand context, content fundamentals, visual foundations, iconography. |
| `colors_and_type.css` | All CSS custom properties + semantic type classes. Drop-in for any HTML. |
| `SKILL.md` | Cross-compatible Agent Skill manifest. |
| `fonts/` | `Inter.ttf`, `LibreBaskerville-Bold.ttf`. |
| `assets/` | Brand marks (`barakah-mark.svg`, `barakah-logo-gradient.svg`), icons, comparison logos. |
| `preview/` | Small HTML cards that populate the Design System tab — one card per token cluster / component cluster. |
| `ui_kits/app/` | Click-thru recreation of the Barakah mobile app (welcome → onboarding → paywall → home). |

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
| Home greeting | "Assalāmu ʿalaykum, Sana." / "Your prayer-lock is active. Five times a day, in shāʾ Allāh." |
| Paywall headline | "Lock in your five.\nBegin the return." |
| Trial badge | "7 DAY FREE TRIAL" |

### Microcopy rules
- Prices use a strike-through reference price next to the live price (`$39.99` after `$239.88`).
- Comparison bars are conservational, not boastful — *"costs less than 2 months of Netflix"*, not *"cheaper than Netflix"*.
- Disabled / pending state copy: tertiary gray; never red.
- Status badges (`NEXT`, `7 DAY FREE TRIAL`) are pill-shaped, tracked 0.6–2.4px, 10–12px font.

---

## VISUAL FOUNDATIONS

### Color
The palette is intentionally narrow. **Mosque green `#29603E` is the only accent.** Everything else is black, white, and cool grays. Cream tones (`#F5EBDB`, `#FAF4E8`) appear only as editorial support behind illustrations or unselected paywall cards; never as a brand accent. Peach `#EAB5A8` and sage `#B5CFC0` are **data colors only** — comparison bars on stats screens — and must never carry UI state.

### Type
Two families:
- **Libre Baskerville Bold** — headlines only. `headline-display 38px`, `h1 31px`, `h2 24px`. Slightly classical, dignified. Never used for body or labels.
- **Inter** — everything functional. `h3 20px/600`, `body 18px/400`, `label 14–16px/500`, `caption 12px/400`, `eyebrow 10px/700` with `0.24em` tracking.

Headlines and small labels share the same `letter-spacing: 0`; only eyebrows and CTAs use tracked uppercase.

### Spacing & layout
Scale: `6 / 14 / 24 / 40 / 100` (xs/sm/md/lg/xl). Layouts are centered, mobile-first, and **stacked vertically** with generous breathing room. There is no multi-column grid. Section gaps trend large; cards use 24px internal padding. The headline is given priority — body copy gets weight contrast (e.g. an emphasized "5 minutes" inside a tertiary paragraph) rather than decorative styling.

### Background
**White (`#FFFFFF`) is the canvas.** No gradients on backgrounds. No noisy textures, no decorative patterns. The single exception is the **lock screen** — a flat `bg-primary` green with a faint white radial halo (8% → 0% opacity). Full-green surfaces are ceremonial: used for the lock screen, occasionally for a banner.

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
**The interface is flat.** Hierarchy comes from contrast and selected fills, not shadow.
- Default cards: no shadow.
- CTA hover/focus (web only): `0 8px 24px rgba(41,96,62,0.28)` — a soft green shadow.
- Welcome swipe cards: the *only* place a card shadow appears in the app. `shadowColor: #0B1710`, offset `0 4–8`, opacity `0.04–0.08`, radius `10–18`.
- Glassmorphism is banned.

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
- ❌ Dark backgrounds, heavy gradients, decorative textures
- ❌ Sans-serif hero treatments
- ❌ Large shadows, glassmorphism
- ❌ Loud uppercase, wide tracking (`>0.24em`)
- ❌ Emoji, anywhere
- ❌ Peach/sage tones as UI state
- ❌ Red, except for `--color-error` on invalid form states

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

Sizes cluster at **20px**, **22px** (selection indicators), and 26–64px for hero positions. Color is either `#29603E` (active / primary), `#0F1311` (ink, on white auth buttons), or `#6B7280` (inactive / tertiary).

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
| Inter font | `uploads/Inter.ttf` | `fonts/Inter.ttf` | Single TTF; production ships variable-axis. Acceptable for static design work. |
| Libre Baskerville | `uploads/LibreBaskerville-Bold.ttf` | `fonts/LibreBaskerville-Bold.ttf` | Bold-only. Production also uses Bold-only — no substitution. |
| Ionicons | (none provided) | CDN `ionicons@7.2.2` | Same library the app uses; CDN-delivered. |

If a non-bold weight of Libre Baskerville is ever needed, **flag and request** — production only ships Bold and the brand spec presumes that.

---

## Working with this system

Drop `colors_and_type.css` into any HTML file:
```html
<link rel="stylesheet" href="colors_and_type.css">
<h1 class="t-display">Your phone, on prayer time.</h1>
<p class="t-body-sm">Barakah quietly locks distractions during salah.</p>
```

Brand color is `var(--color-primary)`. Everything else falls out of that.
