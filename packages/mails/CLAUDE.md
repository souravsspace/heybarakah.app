# @barakah/mails

Purpose: React Email templates.

## Structure

- `emails/verify-otp.tsx`, `emails/waitlist.tsx`, and `emails/purchase.tsx` are the exported templates.
- Each template exports a subject constant, a `render*Email` helper returning `{ html, subject, text }`, and a default React Email component.
- Package exports are explicit per template path in `package.json`.

## Rules

- Add new templates under `emails/` and export them from `package.json`.
- Use `react-email` primitives and `render()` for both HTML and plain text.
- Keep template props typed in the template file.
- Keep email Tailwind config inline unless a real shared mail config is added.
- Use hosted absolute asset URLs in emails.

## Commands

- `bun run dev`
