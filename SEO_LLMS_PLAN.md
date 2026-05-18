# SEO + llms.txt Plan — `packages/marketing`

**Target:** Astro 6 SSR (Cloudflare) marketing site for **Barakah** — a prayer-lock app for Muslims that quietly mutes distractions during salah (Fajr, Dhuhr, Asr, Maghrib, Isha).

**Domain:** `https://heybarakah.app`
**Twitter:** none yet
**Deliverables:** both `/llms.txt` and `/llms-full.txt`
**Sitemap:** add `@astrojs/sitemap`
**OG image:** generated via codex subagent

---

## Skills to install + use

Selected by install count and fit:

| Skill | Installs | Purpose |
|-------|---------:|---------|
| `coreyhaines31/marketingskills@seo-audit` | 111.5K | On-page SEO audit checklist |
| `coreyhaines31/marketingskills@ai-seo` | 54.6K | `llms.txt` + GEO patterns |
| `addyosmani/web-quality-skills@seo` | 21.6K | Technical SEO + Core Web Vitals |

Skipped (overlap): `resciencelab/opc-skills@seo-geo`, `kostja94/marketing-skills@open-graph`.

Install commands:

```bash
npx skills add coreyhaines31/marketingskills@seo-audit -g -y
npx skills add coreyhaines31/marketingskills@ai-seo -g -y
npx skills add addyosmani/web-quality-skills@seo -g -y
```

---

## Phase 0 — Install + audit

1. Install three skills above.
2. Run `seo-audit` skill against `packages/marketing/` → produce findings list.
3. Run `ai-seo` skill → confirm `llms.txt` structure follows current spec.

---

## Phase 1 — Config foundation

4. **`packages/marketing/astro.config.mjs`** — add `site: "https://heybarakah.app"`, register `@astrojs/sitemap` integration. Filter out `/success` from sitemap.
5. **`packages/marketing/package.json`** — add `@astrojs/sitemap` dependency.
6. **`packages/marketing/src/app-config.ts`** — add `seo` block:
   - `siteUrl: "https://heybarakah.app"`
   - `ogImage: "/og.png"`
   - `locale: "en_US"`
   - `keywords` array (Muslim-focused intent): prayer app, salah, distraction lock for Muslims, halal screen time, Islamic focus app, focus during prayer, phone lock during salah, mindful Muslim app

---

## Phase 2 — OG image (codex subagent)

7. Delegate to `codex:rescue` subagent. Brief:
   - Output: `packages/marketing/public/og.png` at **1200×630**
   - Brand spec: mosque green `#29603E` only accent, white surface, Libre Baskerville headline "Your phone, on prayer time.", Inter subhead "A quiet companion for salah.", Barakah mark from `packages/marketing/public/barakah-mark.svg`
   - Islamic content rules: no emoji, no human figures, no gradients on backgrounds, hairline borders only, sentence case
   - Acceptable execution paths:
     - (a) build SVG by hand + rasterize via `@resvg/resvg-js` or `sharp` (preferred — deterministic, brand-accurate)
     - (b) call `openai images generate` if `OPENAI_API_KEY` present (risk: may break Islamic content rules — manual QA required)
   - Also ship `og.svg` source.

8. **Fallback** if subagent fails: hand-write SVG, rasterize via `bunx @resvg/resvg-js-cli`.

---

## Phase 3 — Layout SEO

9. **`packages/marketing/src/layouts/Layout.astro`** — extend props + head:

   **New props:** `title`, `description`, `image?`, `noindex?`, `type?` (`website|article`), `canonical?`.

   **Head additions:**
   - Canonical: `new URL(Astro.url.pathname, Astro.site)`
   - Open Graph: `og:title`, `og:description`, `og:url`, `og:image` (absolute), `og:image:width=1200`, `og:image:height=630`, `og:image:alt`, `og:type`, `og:site_name=Barakah`, `og:locale=en_US`
   - Twitter card: `twitter:card=summary_large_image`, `twitter:title`, `twitter:description`, `twitter:image`
   - `<meta name="theme-color" content="#29603E">`
   - `<meta name="color-scheme" content="light">`
   - `<meta name="robots" content={noindex ? "noindex,nofollow" : "index,follow"}>`
   - `<meta name="format-detection" content="telephone=no">`
   - `<link rel="manifest" href="/site.webmanifest">`
   - `<link rel="alternate" type="text/plain" href="/llms.txt" title="LLM-friendly summary">`
   - Preload critical font weights with `as="style"`
   - JSON-LD `<script type="application/ld+json">`:
     - `Organization` (Barakah App, url, logo, sameAs, email)
     - `WebSite` (name, url, inLanguage en)
     - `SoftwareApplication` (Barakah, `applicationCategory: LifestyleApplication`, `operatingSystem: iOS, Android`, `offers: $39.99 USD lifetime`)
     - `FAQPage` — Q/A sourced from Faq component

10. **`packages/marketing/public/site.webmanifest`** — Barakah identity, `theme_color: #29603E`, `background_color: #ffffff`, icons referencing existing `barakah-app-icon.png`.

---

## Phase 4 — `/llms.txt` + `/llms-full.txt`

11. **`packages/marketing/src/pages/llms.txt.ts`** — `APIRoute`, returns `text/plain; charset=utf-8`, `Cache-Control: public, max-age=3600, s-maxage=86400`. Content per [llmstxt.org](https://llmstxt.org/) spec:

```markdown
# Barakah App

> Prayer lock for Muslims. Quietly locks distractions during salah (Fajr, Dhuhr, Asr, Maghrib, Isha) so you show up — not scroll.

Built for Muslims who want their phones to step aside during prayer time. Not a habit tracker, not gamified — a quiet companion for salah.

## About
- [Homepage](https://heybarakah.app/)
- [Pricing](https://heybarakah.app/#pricing)
- [FAQ](https://heybarakah.app/#faq)

## Pricing
- Lifetime early access — $39.99 USD (originally $165)

## Platforms
- iOS (coming soon)
- Android (coming soon)

## Contact
- hello@heybarakah.app

## Optional
- [Full LLM brief](https://heybarakah.app/llms-full.txt)
```

12. **`packages/marketing/src/pages/llms-full.txt.ts`** — extended brief. Includes:
    - Full prayer-time philosophy
    - Five salah windows with brief Islamic context (Fajr, Dhuhr, Asr, Maghrib, Isha)
    - All FAQ Q&A inlined
    - Pricing comparison narrative (Netflix, Uber Eats)
    - Brand voice quote: "Bismillah ir-Rahman ir-Raheem"
    - Islamic terminology preserved verbatim: salah, du'a, Qur'an, ﷺ, fajr, dhuhr, asr, maghrib, isha

Both routes source content from `app-config.ts` — single source of truth.

---

## Phase 5 — robots + per-page

13. **`packages/marketing/public/robots.txt`**:

```
User-agent: *
Allow: /

# AI crawlers — explicit allow for LLM ingestion
User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

Sitemap: https://heybarakah.app/sitemap-index.xml
```

14. **`packages/marketing/src/pages/success.astro`** — pass `noindex` + tailored title `"You're on the list — Barakah"`.
15. **`packages/marketing/src/pages/index.astro`** — pass explicit `description` matching brand tagline. Default canonical = root.

---

## Phase 6 — Verify

16. After each file edit:
    - `bun x ultracite fix`
    - `bun turbo typecheck` (fix all errors before moving on)
17. `bun --filter marketing build` — confirm sitemap + `llms.txt` generate without error.
18. Manual curl checks against local preview:
    - `/llms.txt` → 200, `text/plain`
    - `/llms-full.txt` → 200, `text/plain`
    - `/robots.txt` → 200
    - `/sitemap-index.xml` → 200
    - `/og.png` → 200, 1200×630
    - `/` head contains canonical, OG tags, Twitter card, JSON-LD blocks
19. Per-file commits, conventional format per `CLAUDE.md`.

---

## Commit sequence

```
chore(marketing): add astro sitemap dep
feat(marketing): set site url + sitemap integration
feat(marketing): extend app-config with seo block
feat(marketing): generate og image asset
feat(marketing): add web manifest
feat(marketing): expand layout with og, twitter, json-ld, robots meta
feat(marketing): add llms.txt route
feat(marketing): add llms-full.txt route
feat(marketing): add robots.txt with ai-crawler allowlist
feat(marketing): mark success page noindex
```

---

## Risks / open items

- **Codex image-gen path** — subagent picks SVG+rasterize vs OpenAI image API based on env. SVG+rasterize preferred (deterministic, brand-accurate, no Islamic content-rule risk).
- **`@astrojs/sitemap` + Cloudflare SSR** — integration runs at build, compatible.
- **Self-hosting Google Fonts** — deferred; current CDN link kept with `display=swap`. Note as follow-up perf task.
- **OG image manual QA** — verify no emoji, no human figures, mosque green only, before commit.
