import type { APIRoute } from "astro";
import { appConfig } from "../app-config";

const { brand, seo, contact, pricing, store, islamic } = appConfig;
const url = (path: string) => new URL(path, seo.siteUrl).toString();

const lastUpdated = new Date().toISOString().slice(0, 10);

const body = `# ${brand.name}

Last updated: ${lastUpdated}

> ${brand.tagline}. Barakah quietly locks distractions during salah (${islamic.prayers.join(", ")}) so Muslims show up — not scroll.

Barakah is a prayer-lock app for Muslims. Five times a day — at each salah window — Barakah closes the apps you choose to set aside so you can pray without the pull of a feed. It is not a habit tracker, not gamified, not a social network. It is a quiet companion for salah.

## About
- [Homepage](${url("/")})
- [Pricing](${url("/#pricing")})
- [FAQ](${url("/#faq")})
- [Features](${url("/#features")})
- [How it works](${url("/#how")})

## Audience
- Practicing Muslims observing the five daily prayers
- Anyone seeking less screen time during worship
- Families wanting a calmer phone during salah windows

## Platforms
- iOS — ${store.ios.status}
- Android — ${store.android.status}

## Pricing
- Lifetime early access: ${pricing.lifetimePrice} (was ${pricing.originalPrice})
- [Checkout](${pricing.checkoutUrl})
- [Machine-readable pricing](${url("/pricing.md")})

## Contact
- Email: ${contact.email}

## Optional
- [Full LLM brief](${url("/llms-full.txt")})
- [Sitemap](${url("/sitemap-index.xml")})
`;

export const GET: APIRoute = () =>
  new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
