# Barakaah Design System

> **Prayer lock: put Allah first.**
> A faith-centered Islamic learning app. Calm, trust-forward, editorial.

---

## What Barakaah is

Barakaah is an Islamic app whose core function — "**prayer lock**" — gently guides users to put Allah first throughout their day. The brand voice is contemplative and educational rather than playful or consumer-app loud. Visually, the system pairs a **classical editorial serif** (Libre Baskerville) for emotional / spiritual headlines with a **modern sans-serif** (Inter) for everything functional. Mosque-green is the only accent; whitespace is the dominant texture.

The product surface is a single mobile app for now. This system anticipates future surfaces (marketing site, settings, onboarding) all sharing the same vocabulary.

## Sources used

This system was built from materials supplied by the user — the original brand spec (tokens, typography, components, do's & don'ts) plus the Barakaah primary mark.

---

## Index

| File / Folder | What's in it |
|---|---|
| `README.md` | This document — context, content fundamentals, visual foundations, iconography. |
| `SKILL.md` | Agent-Skill manifest. Lets Claude Code use this system. |
| `colors_and_type.css` | All design tokens as CSS variables + semantic type classes. Import this in any artifact. |
| `assets/` | Logos, marks, generic imagery. |
| `fonts/` | Libre Baskerville Bold (TTF). Other weights via Google Fonts CDN. |
| `preview/` | Cards rendered into the Design System tab — type, colors, spacing, components, brand. |
| `ui_kits/app/` | The Barakaah mobile app UI kit — interactive recreation. |

---

## Content fundamentals

Barakaah's voice is **gentle, certain, and reverent.** It does not market — it invites. Copy should feel like a wise older relative or a respected teacher: warm, never preachy, never salesy.

**Tone**
- Calm and unhurried. Sentences are short and complete.
- Sincere, not performative. Avoid hype words ("amazing", "game-changing", "revolutionary").
- Faith is the subject, not the spectacle. Write with humility about Allah, the Prophet ﷺ, and worship.

**Person**
- Address the reader as **you** ("Your salah, on time."). Avoid "we" except in trust copy.
- Never use first-person plural cheerleading ("we believe", "we're excited").

**Casing**
- Sentence case for buttons, links, headers, body. ("Begin your day", not "Begin Your Day".)
- ALL-CAPS is reserved for two places only: the top announcement bar and the primary CTA label. This signals importance, not loudness.
- Always honor the typographic conventions of Islamic terms: **Allah, ﷺ (after the Prophet's name), Qur'an, du'a, salah, fajr, dhuhr, asr, maghrib, isha**. Do not abbreviate.

**Numbers & metadata**
- Use real numbers in moderation; no vanity stats. Times use 12-hour format with lowercase am/pm ("5:42 am").
- Streaks and counts are quiet labels, not gamified badges.

**Emoji**
- **No emoji** in product UI or copy. The brand uses an iconographic and typographic vocabulary instead.
- The crescent (☾) and star (★) Unicode glyphs may appear sparingly in decorative type contexts, never as functional icons.

**Examples**
- ✅ "Time for Maghrib. Pause for two minutes."
- ✅ "Your salah, on time."
- ✅ "Begin with Bismillah."
- ❌ "🕌 Don't miss your prayers! 🔔" (emoji, hype)
- ❌ "Crush your prayer goals" (gamified)
- ❌ "We've got everything you need" (we-voice, salesy)

---

## Visual foundations

**Color**
- **Mosque green `#29603E`** is the only accent. It appears on the announcement bar, primary CTA, key icons, and prayer-time highlights. Used sparingly so it carries weight.
- The rest of the system is **black on white** with cool grays for hierarchy. Black is reserved for headlines and high-contrast text; gray (`#6B7280`) carries body and metadata.
- A warm off-white (`#FAFAF7`) is available for soft sections that want a quieter, more contemplative feel than pure white.
- Errors are deep crimson (`#B91C1C`), used only for destructive / validation states.

**Type**
- **Libre Baskerville** (serif, 400 / 700) for display, h1, h2 — editorial, scholarly, emotionally weighted.
- **Inter** (sans, 400 / 500 / 600 / 700) for h3 down, all UI chrome, all body. Modern, neutral, dependable.
- Pair every serif headline with sans body — this contrast *is* the brand.
- No uppercase paragraphs. The only all-caps moments are the top announcement bar and the primary CTA label.

**Spacing**
- Five-step scale: `6 / 14 / 24 / 40 / 100`. The jump from `lg → xl` is intentional — it creates the spacious, contemplative breathing room between hero sections.
- Inner card padding is modest (`16px`); outer section spacing is generous. Rooms over rooms.
- Layouts favor a single centered column, fixed width, broad margins. Restraint over density.

**Backgrounds**
- Mostly flat white. Occasional warm off-white sections.
- **No gradients on body backgrounds.** No repeating patterns or textures. No full-bleed lifestyle imagery in the core app.
- The CTA gets a soft green glow (`shadow-cta`) — that is the one expressive moment.

**Animation**
- Quiet and quick. `120ms / 200ms / 320ms` durations with `cubic-bezier(0.16, 1, 0.3, 1)` ease-out for entrances.
- Fades and gentle vertical slides only. **No bounces, no springs, no parallax.** The brand is contemplative; bouncy = playful.
- Prayer-time transitions cross-fade slowly (~600ms) to feel like dawn breaking, not a snap.

**Hover states**
- Primary buttons: shift to `--color-primary-hover` (`#234F34`) — a deeper green. Glow intensifies very slightly.
- Secondary / link: 70% opacity on hover, full opacity on rest.
- Cards: `1px` border darkens to `--color-border-strong`. No translate, no shadow growth.

**Press states**
- Primary buttons: shift to `--color-primary-press` (`#1B3F29`) and scale to `0.98` (subtle, ~80ms).
- Cards / list rows: brief surface tint to `--color-primary-soft` (`#EAF2EC`).

**Borders**
- Hairline `1px solid #E5E7EB` on cards, inputs, dividers. The system relies on borders + whitespace, not shadows, for separation.
- Stronger `#D1D5DB` only when an element is hovered or actively selected.

**Shadow system**
- `shadow-card` (`0 1px 2px rgba(0,0,0,0.04)`) — barely there, for elevated content cards.
- `shadow-pop` (`0 6px 20px rgba(0,0,0,0.08)`) — modals, popovers, sheets.
- `shadow-cta` (`0 8px 24px rgba(41,96,62,0.28)`) — the green glow under the primary CTA. Brand-defining.
- Inner shadows are not used.

**Layout rules**
- Single centered column on mobile (375px design width). Generous side margins (24px min).
- The bottom nav, status bar, and announcement bar are the only fixed elements. Everything else scrolls.
- Cards stack with `--space-md` (24px) gaps. Sections separate with `--space-lg` to `--space-xl`.

**Transparency & blur**
- Used sparingly. The bottom-tab bar may use a backdrop-filter blur (`blur(20px) saturate(180%)`) when content scrolls beneath it. Otherwise solid surfaces.
- Modal scrims are `rgba(0,0,0,0.4)` solid — no blur.

**Imagery vibe**
- When imagery is used (rare): warm, calm, golden-hour. Architectural detail (mosque arches, calligraphy) over people. Black-and-white or warm sepia preferred when photography appears. No saturated, cool, or "stock-photo-bright" imagery.

**Corner radii**
- Buttons & chips: `radius-full` (pill).
- Cards & inputs: `radius-sm` (4px) — modest, dependable, never playful.
- Sheets & modals: `radius-lg` (16px) at top edge only.

**Cards**
- White surface, `1px` border, `radius-sm` (4px), `16px` padding, no shadow by default. Informational, not elevated. Hierarchy comes from typography, not chrome.

---

## Iconography

**Approach.** Barakaah uses a **single line-icon system** — thin strokes, geometric, unfilled. The visual register is closer to architectural drawing than to UI iconography. We pair Lucide icons (open-source, MIT) — a warm, calm line set with consistent `1.75` stroke width — alongside a few brand-specific glyphs (kaaba, crescent, prayer beads) that may need to be sourced from a Muslim-focused icon set later.

**Implementation.**
- **Lucide** is the chosen base set, loaded from CDN: `https://unpkg.com/lucide@latest/dist/lucide.min.js`. Use `data-lucide="name"` on any element, then call `lucide.createIcons()`.
- Icons render at `20px` for inline, `24px` in nav, `16px` for inline label decoration. Stroke `1.75`. Color inherits from `currentColor`.
- All icons are monochrome. Color comes from the surrounding text.

**Custom marks.**
- The Barakaah logo (in `assets/`) is the only "branded" mark. Use it at minimum 32px on dark or light. Do not stretch or recolor — the green is part of the mark.

**Emoji.** **Not used.** Anywhere. See content fundamentals.

**Unicode.** The crescent ☾ and star ★ may appear in decorative serif contexts (e.g. an empty-state illustration), but never as functional icons.

**Substitutions flagged.** Lucide does not include kaaba, prayer-mat, or tasbih glyphs. The UI kit currently uses a serif "kaaba" word-mark or a generic Lucide approximation (`square` or `book-open`) where one of these is needed. **Asking the user to source a Muslim-icon set** (e.g. Muslim Pro Icons, custom from the brand) would be an obvious next step.

---

## Caveats & next steps

- Fonts are loaded from Google Fonts CDN. If brand-licensed font files exist, drop them in `fonts/` and update `colors_and_type.css`.
- Iconography uses Lucide as the base set. Faith-specific glyphs (kaaba, tasbih) need a dedicated source.
- The UI kit is a high-fidelity *recreation from spec* — it has not been cross-checked against shipping product code. Treat as a strong starting point, not source of truth.
