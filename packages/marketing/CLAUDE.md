# marketing

Purpose: Astro marketing site deployed to Cloudflare Workers.

## Structure

- `src/pages/` owns routes, including legal pages, success page, and LLM text routes.
- `src/components/` holds Astro components plus React islands such as `WaitlistForm` and `Faq`.
- `src/layouts/` owns page shells and SEO/JSON-LD wiring.
- `src/styles/global.css` defines Tailwind v4 theme tokens.
- `src/app-config.ts` is the shared site copy/config source.
- `src/lib/waitlist.ts` POSTs the waitlist email to the Cloudflare API (`PUBLIC_API_URL`).

## Rules

- Use `Layout.astro` for normal pages so canonical, metadata, sitemap links, and JSON-LD stay consistent.
- Use `client:*` directives only for interactive React components.
- Keep waitlist submissions going through `src/lib/waitlist.ts`.
- Import marketing env through `src/env.ts`; it re-exports `@barakah/env/marketing`.
- Keep Tailwind v4 tokens in `src/styles/global.css`.
- Keep Cloudflare worker settings in `wrangler.jsonc`; build output target is `dist/_worker.js/index.js`.
- Preserve Astro server output and the Cloudflare adapter in `astro.config.mjs`.
- Do not include `/success`, `/llms.txt`, or `/llms-full.txt` in the sitemap filter.

## Commands

- `bun run dev`
- `bun run build`
- `bun run preview`
- `bun run preview:worker`
- `bun run deploy`
