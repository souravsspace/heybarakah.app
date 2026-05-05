import { c as createComponent } from './astro-component_BHplyUPg.mjs';
import { m as maybeRenderHead, h as addAttribute, r as renderTemplate, q as renderHead, n as renderComponent, v as renderSlot } from './entrypoint_5wAl8JpP.mjs';

const appConfig = {
  brand: {
    name: "Barakah App",
    tagline: "Prayer lock for muslims",
    legalName: "Barakah App Ltd."},
  contact: {
    email: "hello@heybarakah.app"
  },
  pricing: {
    lifetimePrice: "$39.99",
    originalPrice: "$165",
    label: "Early access — lifetime",
    checkoutUrl: "https://buy.polar.sh/polar_cl_Y5OrCssvZrWKPBmeacK37ZHOtdBgjBd4R1Hw43u4P8Q"
  },
  routes: {
    pricing: "#pricing"},
  hero: {
    headline: {
      line1: "Your phone,",
      line2: "on prayer time."
    },
    subheadline: "Barakah quietly locks distractions during salah. Five times a day, your phone steps aside so you can show up — not scroll."
  },
  comparisons: [
    {
      name: "Netflix",
      logo: "/netflix-logo.avif",
      logoAlt: "Netflix",
      description: "A standard Netflix subscription is",
      price: "$19.99 / month.",
      comparison: "Barakah lifetime costs less than 2 months of Netflix.",
      comparisonBold: "2 months"
    },
    {
      name: "Food Delivery",
      logo: "/uber-eats-logo.png",
      logoAlt: "Uber Eats",
      description: "Average order value for a single delivery in the US is",
      price: "$27.30.",
      comparison: "Barakah lifetime costs less than 1.5 takeout orders.",
      comparisonBold: "1.5 takeout orders"
    }
  ],
  footer: {
    blurb: "A quiet companion for salah. Show up; not scroll.",
    groups: [
      {
        title: "Barakah",
        links: [
          { label: "Early Access (lifetime)", href: "https://buy.polar.sh/polar_cl_Y5OrCssvZrWKPBmeacK37ZHOtdBgjBd4R1Hw43u4P8Q" },
          { label: "FAQs", href: "#faq" },
          { label: "Join Waitlist", href: "#waitlist" },
          { label: "Consent Preferences", href: "#", emphasis: true }
        ]
      },
      {
        title: "About",
        links: [
          { label: "iOS (Coming soon)", href: "#" },
          { label: "Android (Coming soon)", href: "#" },
          { label: "Email Us", href: "mailto:hello@heybarakah.app" },
          { label: "Twitter / X", href: "#" },
          { label: "Instagram", href: "#" },
          { label: "TikTok", href: "#" }
        ]
      }
    ]
  },
  islamic: {
    prayers: ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"]
  }
};

const $$AnnounceBar = createComponent(($$result, $$props, $$slots) => {
  const { routes } = appConfig;
  return renderTemplate`${maybeRenderHead()}<div class="relative overflow-hidden bg-[color:var(--color-primary)] text-white"> <div aria-hidden="true" class="pointer-events-none absolute inset-0 opacity-[0.08]" style="background-image: repeating-linear-gradient(45deg, transparent 0 10px, white 10px 11px);"></div> <a${addAttribute(routes.pricing, "href")} class="group relative flex items-center justify-center gap-3 px-6 py-2.5 transition-colors hover:bg-[color:var(--color-primary-hover)]"> <span class="relative inline-flex h-2 w-2 shrink-0"> <span class="absolute inset-0 animate-ping rounded-full bg-white/70"></span> <span class="relative inline-flex h-2 w-2 rounded-full bg-white"></span> </span> <span class="t-eyebrow font-bold tracking-[0.18em]">Private beta</span> <span aria-hidden="true" class="hidden h-3 w-px bg-white/40 sm:inline-block"></span> <span class="hidden text-xs tracking-wide text-white/85 sm:inline">Lifetime early access — limited seats</span> <span class="ml-1 inline-flex items-center gap-1 text-xs font-bold tracking-[0.14em] uppercase transition-transform duration-200 group-hover:translate-x-0.5">
Join
<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"> <path d="M5 12h14"></path> <path d="m13 5 7 7-7 7"></path> </svg> </span> </a> </div>`;
}, "/Users/sourav/Workflows/saas/heybarakah_app/packages/marketing/src/components/AnnounceBar.astro", void 0);

const $$Footer = createComponent(($$result, $$props, $$slots) => {
  const { brand, footer } = appConfig;
  const groups = footer.groups;
  const year = (/* @__PURE__ */ new Date()).getFullYear();
  return renderTemplate`${maybeRenderHead()}<footer class="bg-white"> <div class="mx-auto max-w-6xl px-6 pt-20 pb-12"> <div class="flex flex-col items-start gap-14 md:flex-row md:items-start md:justify-center md:gap-24"> <div> <a href="/"${addAttribute(brand.name, "aria-label")} class="inline-block"> <span class="serif text-[2rem] leading-none font-bold tracking-tight text-[color:var(--color-fg)]">${brand.name}</span> </a> <p class="mt-5 max-w-[220px] text-xs leading-5 text-[color:var(--color-fg-muted)]"> ${footer.blurb} </p> </div> <div class="grid grid-cols-2 gap-x-16 gap-y-10"> ${groups.map((g) => renderTemplate`<div> <p class="text-[11px] font-bold uppercase tracking-[0.16em] text-[color:var(--color-fg)]">${g.title}</p> <ul class="mt-5 space-y-3.5"> ${g.links.map((l) => renderTemplate`<li> <a${addAttribute(l.href, "href")}${addAttribute([
    "text-xs leading-5 text-[color:var(--color-fg-muted)] transition-colors hover:text-[color:var(--color-primary)]",
    l.emphasis && "font-bold underline underline-offset-4 text-[color:var(--color-primary)] hover:text-[color:var(--color-primary)]"
  ], "class:list")}> ${l.label} </a> </li>`)} </ul> </div>`)} </div> </div> </div> <div class="border-t border-[color:var(--color-border)]"> <div class="mx-auto max-w-6xl px-6 py-5 text-center text-xs font-bold text-[color:var(--color-fg-muted)]">
Copyright © ${year}. ${brand.legalName} </div> </div> </footer>`;
}, "/Users/sourav/Workflows/saas/heybarakah_app/packages/marketing/src/components/Footer.astro", void 0);

const $$Layout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Layout;
  const {
    title = "Barakah — Your phone, on prayer time.",
    description = "Barakah locks distractions during salah so you show up, not scroll."
  } = Astro2.props;
  return renderTemplate`<html lang="en"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><link rel="icon" type="image/png" href="/barakah-app-icon.png"><link rel="apple-touch-icon" href="/barakah-app-icon.png"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;1,400&family=Inter:wght@400;500;600;700&display=swap"><meta name="generator"${addAttribute(Astro2.generator, "content")}><title>${title}</title><meta name="description"${addAttribute(description, "content")}>${renderHead()}</head> <body class="bg-white text-[color:var(--color-fg)]"> ${renderComponent($$result, "AnnounceBar", $$AnnounceBar, {})} <main> ${renderSlot($$result, $$slots["default"])} </main> ${renderComponent($$result, "Footer", $$Footer, {})} </body></html>`;
}, "/Users/sourav/Workflows/saas/heybarakah_app/packages/marketing/src/layouts/Layout.astro", void 0);

export { $$Layout as $, appConfig as a };
