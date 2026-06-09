# GitHub Repository Review

_Started 2026-05-25 11:41 UTC_

---

## User

can you check this "https://github.com/souravsspace/heybarakah.app" repo and based on the codebase UPDATE the design system? do a full review on the codebase please.

plan first then do the work

## Assistant

_[tool: list_files]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: list_files]_

_[tool: list_files]_

_[tool: list_files]_

_[tool: list_files]_

_[tool: list_files]_

_[tool: list_files]_

_[tool: list_files]_

_[tool: github_list_repos]_

_[tool: github_get_tree]_

_[tool: github_get_tree]_

_[tool: github_get_tree]_

_[tool: github_read_file]_

_[tool: github_read_file]_

_[tool: github_read_file]_

_[tool: github_get_tree]_

_[tool: github_get_tree]_

Good — the repo's `design/` directory was already exported (and this project mirrors it). Now I need to inspect the *actual production source* in `packages/app` and `packages/marketing` to see what's evolved beyond what the existing design system captures.

_[tool: github_get_tree]_

_[tool: github_read_file]_

_[tool: github_read_file]_

_[tool: github_read_file]_

_[tool: github_get_tree]_

_[tool: github_get_tree]_

_[tool: github_read_file]_

Let me look at the rest of the packages/app tree and key production source files to find drift between the existing design system and the *current* production code.

_[tool: github_read_file]_

_[tool: github_read_file]_

_[tool: github_read_file]_

_[tool: github_read_file]_

_[tool: github_read_file]_

_[tool: github_read_file]_

_[tool: github_read_file]_

_[tool: github_get_tree]_

_[tool: github_read_file]_

_[tool: github_read_file]_

_[tool: github_read_file]_

_[tool: github_read_file]_

_[tool: github_read_file]_

_[tool: snip]_

Good — I have enough context now. Let me snip the noisy earlier tool reads and present the plan.# Codebase review → Design System update plan

I read `souravsspace/heybarakah.app@main` top-to-bottom — `CLAUDE.md`, `AGENTS.md`, marketing `global.css` + `app-config.ts`, every screen under `packages/app/app/`, the `components/`, `constants/`, and `contexts/theme-context.tsx`. The current design system was a faithful capture of an earlier moment, but the production code has **drifted in eight material ways**. None of these are documented in `README.md` or tokenised in `colors_and_type.css`.

## What the production code now does that the design system doesn't capture

| # | Drift | Evidence | Severity |
|---|---|---|---|
| 1 | **Dark mode is real and shipped.** | `contexts/theme-context.tsx` defines a full `DARK` palette + `ThemeProvider` + AsyncStorage persistence + `system`/`light`/`dark` mode switch. Every tab calls `useTheme()`. | 🔴 Critical — DS doesn't mention dark mode at all |
| 2 | **Background mesh gradients on every screen.** | `components/meshes.tsx` — 9 named SVG radial-gradient meshes (`HomeMesh`, `LockedMesh`, `ProfileMesh`, `DhikrMesh`, `RecordMesh`, `ProgressMesh`, `UnlockMesh`, `AchievementsMesh`, `SplashMesh`). | 🔴 Contradicts the DS rule "no gradients on backgrounds" |
| 3 | **Dark-mode primary is `#00D26A`, not `#29603E`.** | `theme-context.tsx` LIGHT/DARK objects. Same brand, hue-shifted for legibility on black. | 🔴 New token |
| 4 | **New canvas tones**: `#F8FAF8`, `#F8F1E1` (Hidayah cream), `#F4F6F4`, dark `#0E1311` / `#0B0E0C`. | `meshes.tsx` Rect fills, screen root backgrounds. | 🟡 Missing |
| 5 | **New semantic tokens**: `bgElevated`, `surfaceSoft`, `card`, `chevron`, `premium` (`#C9A23A` / `#E4C168`), `errorSoft`, `neutralSoft`. | `theme-context.tsx` `ThemeColors` shape. | 🟡 Missing |
| 6 | **Glassmorphism is now allowed** on iOS 18+. | `components/glass-surface.tsx` uses `expo-glass-effect` `GlassView` with `BlurView` fallback. | 🟡 DS says "Glassmorphism is banned" |
| 7 | **Italic Libre Baskerville is in active use.** | `locked.tsx` `Hands quiet.` italic; `achievements.tsx` category headers italic. Plus tight negative tracking on display (`-0.6`). | 🟡 DS says headlines have `letter-spacing: 0` |
| 8 | **Three whole new screens** plus expanded onboarding/paywall. | `dhikr.tsx`, `achievements.tsx` + `achievement-card.tsx` + `achievement-dialog.tsx`, `unlock.tsx`. Paywall now: `try-free` → `akhira-worth` → `plans`. | 🟡 Missing from `ui_kits/app/` |

Plus minor nits: marketing's `--color-primary-soft` is `#EAF2EC` while app's is `#E8F0EA` (DS captures both already, ✅), and the marketing `.t-eyebrow` is 12px/600/0.14em vs app's 10px/700/0.24em — the DS implements the app one but doesn't flag the divergence.

## What I propose to do

I'll keep this surgical (per the repo's own `CLAUDE.md` rule). **No restructure**, no big rewrite — additive edits.

### A. Tokens (`colors_and_type.css`)
Add a `@theme dark`-equivalent — a `[data-theme="dark"] :root` block — that mirrors the production `DARK` object. Add new tokens to the light root too: `--color-bg-elevated`, `--color-surface-soft`, `--color-card`, `--color-chevron`, `--color-premium`, `--color-error-soft`, `--color-neutral-soft`, and the new canvas tones (`--color-canvas-default`, `--color-canvas-hidayah`, `--color-canvas-locked`, `--color-canvas-dawn`).

### B. README rewrites (`README.md`)
- Rewrite the **Background** section: meshes are now the brand's signature — flat white is wrong. Document each of the 9 meshes (what it's for, palette, motion).
- Rewrite the **Elevation** section: glass surfaces are allowed and intentional in lock-screen + sheet contexts.
- Add a new top-level **Dark mode** section covering the dual palette, when each is active, and the bright-green primary shift.
- Add a new **Type — italic & tracking** subsection covering Libre Baskerville Italic and the negative letter-spacing on hero displays.
- Refresh the screen inventory: list Dhikr, Achievements, Unlock, expanded onboarding.

### C. Preview cards (`preview/`)
Add four new preview HTML cards:
- `preview/colors-dark.html` — dark palette swatches
- `preview/meshes.html` — small thumbnails of every mesh (light + dark)
- `preview/glass-surface.html` — glass card example over a locked-mesh background
- `preview/screens-new.html` — index of the three new screen kits

### D. UI kit (`ui_kits/app/`)
Add screen recreations for the three new surfaces:
- `dhikr.jsx` — counter screen w/ progress fill + Mashā Allāh completion state
- `achievements.jsx` — ledger w/ hero rosette, bead row, category sections
- `unlock.jsx` — temporary unlock screen
- Update `index.html` to surface them.
- Add a **dark mode toggle** to the kit so the user can see every screen in both schemes.

### E. SKILL.md
Update the "Hard rules" section to **soften** the bans on gradients and glass — they're now allowed in the specific contexts the production code uses them. Add dark-mode as a first-class consideration.

---

I'll cut scope hard: **no** new components beyond what the production code already defines, **no** speculative tokens, **no** decorative content. Every change traces directly to a file in the repo.

I'll work through this now. Starting with tokens + README — the foundation everything else references.

_[tool: update_todos]_

_[tool: str_replace_edit]_

Starting with tokens. Adding dark mode + the missing semantic tokens to `colors_and_type.css`:

_[tool: str_replace_edit]_

Now adding italic + tight-tracking display variants and finishing touches to the type scale:

_[tool: update_todos]_

Now README — surgical rewrites to the sections that contradict production, plus a new Dark mode section.

_[tool: str_replace_edit]_

Now the substantive rewrites — Color, Background, Elevation, Type, and a new Dark mode section:

_[tool: str_replace_edit]_

Now adding the **Dark mode** section (new), the new screens inventory, and updating the substitutions table:

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

Updating the voice examples table with new screens, and the Ionicons glyph list:

_[tool: str_replace_edit]_

_[tool: update_todos]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

Good — preview cards are small self-contained HTMLs (~700px wide). Let me build the four new ones:

_[tool: write_file]_

_[tool: write_file]_

Now the glass-surface preview and the screen-index preview:

_[tool: write_file]_

_[tool: write_file]_

_[tool: show_html]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

Moving on — preview cards are self-contained CSS, low risk. On to the UI kit screens. Let me peek at the existing kit structure first:

_[tool: grep]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: grep]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: str_replace_edit]_

Adding `achievements` and `unlock` tones to MeshBg, then creating the two new screens:Now creating `screens-extra.jsx` with the two new screens (Achievements + Unlock), each with a `dark` prop:

_[tool: write_file]_

_[tool: str_replace_edit]_

Now wiring into `index.html` — adding the script include, the two new screens, and a dark-mode toggle:

_[tool: str_replace_edit]_

Let me also update the group header rule colors so they're visible in dark mode:

_[tool: update_todos]_

Updating SKILL.md to soften the absolute bans that no longer match production:

_[tool: write_file]_

Now registering the new preview cards with the design system manifest:

_[tool: register_assets]_

_[tool: update_todos]_

All work done. Surfacing the UI kit for the user to land on so they can see the new screens + dark toggle in context:

_[tool: done]_

_[tool: fork_verifier_agent]_

Full review done. Here's what changed:

**Tokens** (`colors_and_type.css`)
- Added the dark palette as `[data-theme="dark"]` + a `prefers-color-scheme: dark` fallback. Mirrors `theme-context.tsx` exactly.
- New light tokens: `--color-bg-elevated`, `--color-card`, `--color-chevron`, `--color-premium`, `--color-error-soft`, `--color-neutral-soft`, plus four `--canvas-*` tones used as mesh bases.
- Added `.t-display-hero` (negative tracking) and `.t-display-italic` / `.t-h1-italic` for the counter-voice italic the production app started using.

**README** — surgical rewrites of the sections that contradicted production:
- **Background** section now documents the nine named meshes from `meshes.tsx` instead of saying "no gradients on backgrounds".
- **Elevation** section now allows glass for the scroll-blur header + sheets instead of banning it outright.
- New **Dark mode** section with the full token shift table and the canvas layering rules.
- Voice examples, icon glyphs, screen inventory, and substitutions table all refreshed.

**Preview cards** (4 new)
- `colors-dark.html`, `meshes.html` (all 9 × light + dark), `glass-surface.html`, `screens-new.html`.

**UI kit** (`ui_kits/app/`)
- Added `screens-extra.jsx` with `AchievementsScreen` + `UnlockScreen` — both accept a `dark` prop.
- `index.html` now has a **Light/Dark toggle** in the nav strip (the toggle applies to the screens marked "New"; existing screens stay light-only).
- `MeshBg` extended with `achievements` and `unlock` tones plus dark variants for every mesh.

**SKILL.md** — hard rules softened where they no longer matched production (gradients via meshes, glass in specific contexts, dark mode as first-class).

Things I deliberately did **not** do, in keeping with the repo's "surgical changes" principle:
- Did **not** re-light existing screens (Home, Locked, Profile, Dhikr, Progress) for dark mode in the kit — would be a much bigger edit. Only the two new screens have the toggle wired through. Tell me if you want the rest converted.
- Did **not** add a real italic Libre Baskerville font file — flagged in the substitutions table; browser/RN synthesizes it from the Bold, same as production.
- Did **not** invent new components, copy, or tokens that aren't in the codebase.

