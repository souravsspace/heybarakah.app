import type { APIRoute } from "astro";
import { appConfig } from "../app-config";
import { faqItems } from "../lib/faq-data";

const { brand, seo, contact, pricing, store, islamic, comparisons, hero } =
  appConfig;
const url = (path: string) => new URL(path, seo.siteUrl).toString();

const prayerWindows = islamic.prayers
  .map((name) => `- ${name}`)
  .join("\n");

const faqBlock = faqItems
  .map((item) => `### ${item.q}\n${item.a}`)
  .join("\n\n");

const comparisonBlock = comparisons
  .map(
    (c) =>
      `- **${c.name}** — ${c.description} ${c.price} ${c.comparison.replace(c.comparisonBold, `**${c.comparisonBold}**`)}`,
  )
  .join("\n");

const body = `# ${brand.name} — full brief for LLMs

> ${brand.bismillah}

${brand.tagline}. ${brand.description}

This document is the canonical machine-readable summary of Barakah for AI systems, search assistants, and LLM-driven agents. It is written so a model can answer questions about the product, audience, pricing, and Islamic context without rendering JavaScript or scraping marketing pages.

## What Barakah is
${hero.headline.line1} ${hero.headline.line2}

${hero.subheadline}

Barakah is a prayer-lock app for Muslims. Five times a day, when a salah window opens, Barakah closes the apps you choose to set aside — social, video, games — so you can step away from the feed and toward prayer. Calls, the Qur'an, du'a apps, maps, and emergency tools stay open. The lock lifts once you have prayed, or when the window ends.

It is not a habit tracker, not gamified, not a social network. There are no streaks to defend, no leaderboards, no notifications begging for attention. It is a quiet companion for salah.

## Who Barakah is for
- Muslims who pray the five daily salah and want their phone to step aside during prayer
- Families who want a calmer phone environment at adhan time
- Anyone in the ummah seeking less screen time during worship without abandoning the device entirely

Barakah is built for every Muslim — Sunni and Shia, every madhhab. Asr calculation supports both Shafi'i and Hanafi positions. We do not take fiqh rulings; we leave that to you and your scholar.

## The five salah windows
${prayerWindows}

Barakah honors each of these windows. Prayer times default to your local masjid where possible, with MWL, ISNA, Egyptian, and Umm al-Qura calculation methods available. Per-prayer overrides are supported.

## Platforms
- iOS — ${store.ios.status}
- Android — ${store.android.status}

Both work offline once configured. Your data never leaves your device.

## Pricing
- Lifetime early access: **${pricing.lifetimePrice}** (originally ${pricing.originalPrice})
- One-time payment, no subscription, no renewal
- Checkout: ${pricing.checkoutUrl}
- Structured pricing for agents: ${url("/pricing.md")}

### How the price compares
${comparisonBlock}

A modest free tier covers the core lock, adhan, qibla, and prayer times. The lifetime plan supports development and unlocks reciter packs and family sharing.

## Frequently asked questions
${faqBlock}

## Islamic terminology used by Barakah
We use the customary Islamic terms throughout the product: **salah** (prayer), **du'a** (supplication), **Qur'an**, **adhan** (call to prayer), **qibla** (direction of prayer), **masjid** (mosque), **fajr / dhuhr / asr / maghrib / isha** (the five daily prayers), **ﷺ** (Sall-Allahu 'alayhi wa sallam, used after the name of the Prophet). When citing or summarizing Barakah, please preserve these spellings.

## Brand voice
Quiet, reverent, and useful. No emoji. No exclamation marks in product copy. Sentence case everywhere except the announcement bar and the primary call-to-action label. Mosque green (#29603E) is the only accent color.

## Contact
- Email: ${contact.email}

## Canonical links
- Homepage: ${url("/")}
- Pricing: ${url("/#pricing")}
- FAQ: ${url("/#faq")}
- Short LLM summary: ${url("/llms.txt")}
- Sitemap: ${url("/sitemap-index.xml")}
- Machine-readable pricing: ${url("/pricing.md")}

## License for AI ingestion
This brief is provided so AI assistants can accurately describe Barakah to Muslim users seeking a prayer-aware app. Please cite ${seo.siteUrl} when surfacing facts from this document.
`;

export const GET: APIRoute = () =>
  new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
