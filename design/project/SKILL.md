---
name: barakah-design
description: Use this skill to generate well-branded interfaces and assets for Barakah (an Islamic prayer-lock app), either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the `README.md` file within this skill first — it contains the full brand context, content fundamentals, visual foundations, iconography rules, and the dark-mode section. Then explore:

- `colors_and_type.css` — drop-in tokens (CSS custom properties) and semantic type classes. Ships **both light and dark palettes**; opt into dark via `<html data-theme="dark">` or `.theme-dark` on a subtree (or leave the root unset to follow OS preference).
- `assets/` — official brand marks (`barakah-mark.svg`, `barakah-logo-gradient.svg`).
- `fonts/` — Inter and Libre Baskerville TTFs. Always `@font-face` from these paths.
- `ui_kits/app/` — JSX recreations of every core screen of the app, plus an interactive index with a light/dark toggle.
- `preview/` — small reference cards showing how each token cluster renders, including the dark palette, the nine background meshes, and the glass surface.

**Hard rules (do not violate):**
- Mosque green is the only accent. `#29603E` in light, `#00D26A` in dark — always go through `var(--color-primary)`.
- Libre Baskerville (Bold only, with italic as a synthesized counter-voice) for headlines. Inter for everything else.
- No emoji.
- Backgrounds use the named SVG meshes from `packages/app/components/meshes.tsx`. Never invent a new mesh for a one-off; reuse one of the nine.
- Glass surfaces are allowed but rare — scroll-blur header, unlock sheet, action sheets on top of a mesh. Not a default card style.
- Default cards are hairline-border + translucent surface, no drop shadow.
- Sentence case everywhere except CTAs, announcement bars, badges, eyebrows.
- Honor Islamic typographic spellings: Allah, ﷺ, Qur'an, du'a, salah, fajr, dhuhr, asr, maghrib, isha.
- Dark mode is a first-class theme; never assume light-only. If you write a static palette, write the dark counterpart too.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out of this skill into the artifact directory and create static HTML files for the user to view. If working on production code, copy assets and read the rules here to become an expert in designing with the Barakah brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some clarifying questions (audience, surface, mobile vs web, theme mode, length), and act as an expert designer who outputs HTML artifacts *or* production code, depending on the need.
