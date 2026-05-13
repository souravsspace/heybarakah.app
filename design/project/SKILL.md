---
name: barakah-design
description: Use this skill to generate well-branded interfaces and assets for Barakah (an Islamic prayer-lock app), either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the `README.md` file within this skill first — it contains the full brand context, content fundamentals, visual foundations, and iconography rules. Then explore:

- `colors_and_type.css` — drop-in tokens (CSS custom properties) and semantic type classes.
- `assets/` — official brand marks (`barakah-mark.svg`, `barakah-logo-gradient.svg`).
- `fonts/` — Inter and Libre Baskerville TTFs. Always `@font-face` from these paths.
- `ui_kits/app/` — JSX recreations of every core screen of the app, plus an interactive index.html.
- `preview/` — small reference cards showing how each token cluster renders.

**Hard rules (do not violate):**
- Mosque green `#29603E` is the only accent. Everything else is black, white, and cool grays.
- Libre Baskerville (Bold only) for headlines. Inter for everything else.
- No emoji. No background gradients. No bouncy animations. No drop shadows on cards.
- Sentence case everywhere except CTAs, announcement bars, badges, eyebrows.
- Honor Islamic typographic spellings: Allah, ﷺ, Qur'an, du'a, salah, fajr, dhuhr, asr, maghrib, isha.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out of this skill into the artifact directory and create static HTML files for the user to view. If working on production code, copy assets and read the rules here to become an expert in designing with the Barakah brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some clarifying questions (audience, surface, mobile vs web, length), and act as an expert designer who outputs HTML artifacts *or* production code, depending on the need.
