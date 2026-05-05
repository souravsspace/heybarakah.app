import { c as createComponent } from './astro-component_BHplyUPg.mjs';
import { n as renderComponent, r as renderTemplate, m as maybeRenderHead, h as addAttribute } from './entrypoint_5wAl8JpP.mjs';
import { $ as $$Layout, a as appConfig } from './Layout_DjLgjzM-.mjs';
import { useEffect } from 'react';
import confetti from 'canvas-confetti';

function SuccessConfetti() {
  useEffect(() => {
    const colors = ["#29603E", "#234F34", "#1B3F29", "#EAF2EC", "#FFFFFF"];
    const duration = 2200;
    const end = Date.now() + duration;
    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.55 },
      colors,
      ticks: 220
    });
    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }, []);
  return null;
}

const $$Success = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Success;
  const { brand, contact, islamic } = appConfig;
  const checkoutId = Astro2.url.searchParams.get("checkout_id");
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, {}, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "SuccessConfetti", SuccessConfetti, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/Users/sourav/Workflows/saas/heybarakah_app/packages/marketing/src/components/SuccessConfetti.tsx", "client:component-export": "default" })} ${maybeRenderHead()}<section class="relative bg-white"> <div class="relative mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 py-24 text-center"> <div class="relative mb-12 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--color-primary)] text-white"> <span aria-hidden="true" class="absolute inset-0 animate-ping rounded-full bg-[color:var(--color-primary)] opacity-25"></span> <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"> <path d="M20 6 9 17l-5-5"></path> </svg> </div> <p class="t-eyebrow mb-6 text-[color:var(--color-primary)]">Seat secured</p> <h1 class="serif text-5xl md:text-7xl leading-[1.02] font-bold tracking-tight text-[color:var(--color-fg)]">
Jazak Allah<br> <span class="italic font-normal text-[color:var(--color-primary)]">khair.</span> </h1> <p class="mt-7 max-w-[460px] leading-7 text-[color:var(--color-fg-muted)]">
A receipt is on its way. ${brand.name} will reach you the moment iOS and Android open.
</p> <ul class="mt-10 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[color:var(--color-fg-subtle)]"> ${islamic.prayers.map((p, i) => renderTemplate`<li class="flex items-center gap-5"> <span>${p}</span> ${i < islamic.prayers.length - 1 && renderTemplate`<span aria-hidden="true" class="h-1 w-1 rounded-full bg-[color:var(--color-border-strong)]"></span>`} </li>`)} </ul> ${checkoutId && renderTemplate`<p class="mt-10 text-[11px] font-mono tracking-tight text-[color:var(--color-fg-subtle)]">
Order · ${checkoutId} </p>`} <div class="mt-12 flex flex-col items-center gap-5 sm:flex-row"> <a href="/" class="inline-flex items-center justify-center gap-2 rounded-full bg-[color:var(--color-primary)] px-7 py-3 text-xs font-bold uppercase tracking-[0.14em] text-white shadow-[0_8px_20px_rgba(41,96,62,0.25)] transition-all hover:bg-[color:var(--color-primary-hover)] active:scale-[0.98]">
Back to home
<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"> <path d="M5 12h14"></path> <path d="m13 5 7 7-7 7"></path> </svg> </a> <a${addAttribute(`mailto:${contact.email}`, "href")} class="text-sm text-[color:var(--color-fg-muted)] underline-offset-4 hover:text-[color:var(--color-primary)] hover:underline"> ${contact.email} </a> </div> <div class="mt-20 flex flex-col items-center gap-3"> <svg width="40" height="14" viewBox="0 0 40 14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" class="text-[color:var(--color-border-strong)]" aria-hidden="true"> <path d="M1 7 Q 7 1 13 7 T 27 7 T 39 7"></path> </svg> <p class="serif italic text-sm text-[color:var(--color-fg-muted)]">
Bismillah ir-Rahman ir-Raheem.
</p> </div> </div> </section> ` })}`;
}, "/Users/sourav/Workflows/saas/heybarakah_app/packages/marketing/src/pages/success.astro", void 0);

const $$file = "/Users/sourav/Workflows/saas/heybarakah_app/packages/marketing/src/pages/success.astro";
const $$url = "/success";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Success,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
