# AGENTS.md

This file provides guidance to AI agents when working with code in this repository.

---

## Design System Reference

When designing or implementing any UI, components, layouts, or visual features, **always consult the `design/` directory first**. It is the single source of truth for the Barakah brand. Do not assume tokens, colors, or patterns — look them up.

**Read these files in order:**

1. **`design/README.md`** — Handoff overview from Claude Design. Read it first.
2. **`design/chats/`** — Conversation transcripts that capture intent and the user's final decisions.
3. **`design/project/README.md`** — Brand context, content fundamentals, visual foundations, iconography.
4. **`design/project/colors_and_type.css`** — Canonical CSS custom properties and semantic type classes.
5. **`design/project/preview/`** — Per-component HTML cards (tokens, buttons, inputs, option rows, plan cards, etc.).
6. **`design/project/assets/`** and **`design/project/fonts/`** — Brand marks, icons, font files.

**Key rules to internalize:**
- Mosque green `#29603E` is the **only** accent. Everything else is black, white, and cool grays.
- Serif (Libre Baskerville) for headlines only. Sans (Inter) for all UI and body.
- No emoji anywhere. No gradients on backgrounds. No bouncy animations.
- Whitespace and hairline borders create separation — not shadows.
- Sentence case everywhere except the announcement bar and primary CTA label (all-caps).
- Always honor Islamic typographic conventions: **Allah, ﷺ, Qur'an, du'a, salah, fajr, dhuhr, asr, maghrib, isha**.

All design work must align with the tokens, components, and rules in `design/`.

---

## 0. Mindset & Approach

**Think before coding. Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them — don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

---

## 1. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

---

## 2. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it — don't delete it.

When your changes create orphans:

- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

---

## 3. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:

- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:

```txt
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

## 4. Git Workflow — Per-File Commits

Every file change must be committed individually. No batching.

1. Write/edit the file
2. `bun x ultracite fix`
3. `bun turbo typecheck` (fix all errors before continuing)
4. `git add <file>` (never `git add .` or `git add -A`)
5. `git commit -m "<type>(<scope>): <summary>"`
6. Move to next file

**Conventional commit format:** `<type>(<scope>): <summary>`

- **type:** `feat`, `fix`, `refactor`, `chore`, `docs`, `style`, `test`, `perf`, `ci`, `build`
- **scope:** `app`, `marketing`, `ui`, `hooks`, `lib`, `constants`, `assets`, `config`, `types`, `tests`
- **summary:** present tense, lowercase, no period, ≤72 chars

---

## 5. Code Rules

### General

- Use `Bun.file()` not `node:fs`. Use `Bun.$` not `execa`. Use `Bun.env` not `dotenv`.
- Prefer `unknown` over `any`. Use `as const` for const assertions.
- Always `await` promises; use `try-catch`; never swallow errors.
- Do **not** add file path comments at the top of files.

### Testing

Use `bun:test`. Do **not** use Jest or Vitest.

### Naming

- `camelCase` — variables, functions
- `PascalCase` — components, classes
- `UPPER_SNAKE_CASE` — constants
- File names should be descriptive and kebab-case or snake_case:
  - Examples: `get-user-id.ts`, `something_like.tsx`

### Imports

Framework imports → `workspace:*` internal packages → relative paths.


<claude-mem-context>
# Memory Context

# [heybarakah_app] recent context, 2026-05-14 2:26am GMT+6

No previous sessions found.
</claude-mem-context>