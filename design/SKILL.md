---
name: barakah-design
description: Use this skill to generate well-branded interfaces and assets for Barakah, a faith-centered Islamic learning app whose core function is "prayer lock — put Allah first." For production or throwaway prototypes, mocks, slides, etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files. The system pairs Libre Baskerville (serif, headlines) with Inter (sans, UI), uses mosque-green `#29603E` as the only accent, and leans on whitespace + hairline borders rather than shadows. No emoji. No gradients. Calm, reverent, editorial.

Key files:
- `colors_and_type.css` — all design tokens as CSS variables. Always import this in artifacts.
- `assets/barakah-logo.png` — primary mark. Don't recolor or redraw.
- `ui_kits/app/` — interactive recreation of the mobile app, with reusable JSX components (`Banner`, `Button`, `Card`, `PrayerRow`, `PrayerCountdown`, `LockMark`, `TabBar`).
- `preview/*.html` — small swatches and specimens demonstrating each token.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.
