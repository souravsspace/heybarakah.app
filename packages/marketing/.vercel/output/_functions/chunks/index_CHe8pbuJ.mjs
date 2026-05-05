import { c as createComponent } from './astro-component_BHplyUPg.mjs';
import { o as createRenderInstruction, m as maybeRenderHead, h as addAttribute, n as renderComponent, r as renderTemplate, p as Fragment } from './entrypoint_5wAl8JpP.mjs';
import { a as appConfig, $ as $$Layout } from './Layout_DjLgjzM-.mjs';
import { jsx, jsxs } from 'react/jsx-runtime';
import { useState } from 'react';

async function renderScript(result, id) {
  const inlined = result.inlinedScripts.get(id);
  let content = "";
  if (inlined != null) {
    if (inlined) {
      content = `<script type="module">${inlined}</script>`;
    }
  } else {
    const resolved = await result.resolve(id);
    content = `<script type="module" src="${result.userAssetsBase ? (result.base === "/" ? "" : result.base) + result.userAssetsBase : ""}${resolved}"></script>`;
  }
  return createRenderInstruction({ type: "script", id, content });
}

const base = (size = 20) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round",
  strokeLinejoin: "round"
});
function Check({ size, ...rest }) {
  return /* @__PURE__ */ jsx("svg", { ...base(size), ...rest, children: /* @__PURE__ */ jsx("path", { d: "M20 6 9 17l-5-5" }) });
}
function ChevronDown({ size, ...rest }) {
  return /* @__PURE__ */ jsx("svg", { ...base(size), ...rest, children: /* @__PURE__ */ jsx("path", { d: "m6 9 6 6 6-6" }) });
}

function WaitlistForm({
  compact = false
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email.");
      setStatus("error");
      return;
    }
    setStatus("submitting");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Something went wrong. Try again.");
        setStatus("error");
        return;
      }
      setStatus("success");
    } catch {
      setError("Network error. Try again.");
      setStatus("error");
    }
  }
  if (status === "success") {
    return /* @__PURE__ */ jsxs(
      "div",
      {
        className: "flex items-center gap-3 rounded-[4px] border border-[color:var(--color-primary)] bg-[color:var(--color-primary-soft)] px-4 py-3.5 text-[color:var(--color-primary-press)]",
        role: "status",
        children: [
          /* @__PURE__ */ jsx(Check, { size: 18 }),
          /* @__PURE__ */ jsx("span", { className: "text-sm", children: "You're on the list. We'll be in touch." })
        ]
      }
    );
  }
  return /* @__PURE__ */ jsxs(
    "form",
    {
      "aria-label": "Join the waitlist",
      className: "mx-auto w-full max-w-[380px]",
      noValidate: true,
      onSubmit,
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 rounded-full border border-[color:var(--color-border)] bg-white p-1 pl-1.5 transition-all duration-200 ease-[var(--ease-out)] focus-within:border-[color:var(--color-primary)] focus-within:shadow-[0_0_0_3px_rgba(41,96,62,0.12)] hover:border-[color:var(--color-border-strong)]", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              "aria-label": "Email address",
              autoComplete: "off",
              className: "flex-1 min-w-0 appearance-none border-0 bg-transparent px-3 py-2 text-sm font-medium tracking-wide text-[color:var(--color-fg)] placeholder:text-[color:var(--color-fg-subtle)] outline-none focus:outline-none focus:ring-0 focus:border-0 focus:shadow-none",
              onChange: (e) => setEmail(e.target.value),
              placeholder: "you@example.com",
              required: true,
              style: {
                boxShadow: "none",
                outline: "none",
                WebkitAppearance: "none"
              },
              type: "email",
              value: email
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              className: "inline-flex shrink-0 items-center justify-center rounded-full bg-[color:var(--color-primary)] px-5 py-3 text-xs font-bold uppercase tracking-[0.1em] text-white shadow-[inset_0_0_0_2px_rgba(255,255,255,0.95),0_0_0_1.5px_#29603E,0_6px_18px_rgba(41,96,62,0.28)] transition-all duration-200 ease-[var(--ease-out)] hover:bg-[color:var(--color-primary-hover)] active:scale-[0.98] active:bg-[color:var(--color-primary-press)] disabled:opacity-60",
              disabled: status === "submitting",
              type: "submit",
              children: status === "submitting" ? "Joining" : "Join waitlist"
            }
          )
        ] }),
        error ? /* @__PURE__ */ jsx(
          "p",
          {
            className: "mt-2 text-sm text-[color:var(--color-error)]",
            role: "alert",
            children: error
          }
        ) : /* @__PURE__ */ jsx("p", { className: "mt-2.5 text-xs text-[color:var(--color-fg-subtle)]", children: "No spam. One quiet email when we open access." })
      ]
    }
  );
}

const $$Hero = createComponent(($$result, $$props, $$slots) => {
  const { brand, hero } = appConfig;
  return renderTemplate`${maybeRenderHead()}<section id="waitlist" class="relative overflow-hidden bg-white border-b border-[color:var(--color-border)]"> <div class="mx-auto max-w-3xl px-6 pt-20 pb-24 text-center md:pt-28 md:pb-32"> <a href="/" class="mb-8 inline-flex items-center gap-3"${addAttribute(brand.name, "aria-label")}> <img src="/barakah-app-icon.png" alt="" class="h-10 w-10 rounded-[9px] shadow-[0_8px_20px_-6px_rgba(41,96,62,0.35)]"> <span class="serif text-2xl font-extrabold tracking-wide text-[color:var(--color-primary)]">${brand.name}</span> </a> <p class="t-eyebrow mb-6 text-[color:var(--color-primary)]">${brand.tagline}</p> <h1 class="serif text-5xl md:text-7xl leading-[1.05] font-bold tracking-tight text-[color:var(--color-fg)]"> ${hero.headline.line1}<br><span class="italic font-normal text-[color:var(--color-primary)]">${hero.headline.line2}</span> </h1> <p class="mx-auto mt-6 max-w-[520px] leading-7 text-[color:var(--color-fg-muted)]"> ${hero.subheadline} </p> <div class="mx-auto mt-10 max-w-[480px]"> ${renderComponent($$result, "WaitlistForm", WaitlistForm, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/Users/sourav/Workflows/saas/heybarakah_app/packages/marketing/src/components/WaitlistForm.tsx", "client:component-export": "default" })} </div> </div> </section>`;
}, "/Users/sourav/Workflows/saas/heybarakah_app/packages/marketing/src/components/Hero.astro", void 0);

const $$Checklist = createComponent(($$result, $$props, $$slots) => {
  const questions = [
    {
      q: "Ahmed lives in the UK and is visiting his family in Palestine for 3 weeks. How should he pray?",
      options: [
        "Shorten and combine prayers for the duration of the visit.",
        "Pray normally (do not shorten or combine).",
        "Shorten prayers for the first 15 days, then pray normally.",
        "Shorten prayers only during the journey. Pray normally on arrival in Palestine."
      ],
      answer: 3
    },
    {
      q: "Sarah is scrolling on her phone when the maghrib adhan plays. There are 12 minutes left in the window. What is most correct?",
      options: [
        "Finish the post she's reading first, then make wudu.",
        "Reply to the adhan, stop scrolling, make wudu, and pray straight away.",
        "Wait until isha and pray them together.",
        "Pray quickly without wudu since the time is short."
      ],
      answer: 1
    },
    {
      q: "Yusuf cannot remember if he prayed asr. The asr window is still open. What does he do?",
      options: [
        "Skip it — assume he prayed.",
        "Wait until maghrib and pray qada later.",
        "Pray asr now; act on certainty over doubt.",
        "Pray two rakat as a precaution."
      ],
      answer: 2
    },
    {
      q: "Aisha is in the middle of salah when her phone starts ringing loudly in her pocket. What should she do?",
      options: [
        "Answer the call quietly, then continue.",
        "Speak 'one moment' and silence the phone.",
        "Ignore the phone and continue her salah.",
        "Break her salah, silence the phone, and start again."
      ],
      answer: 2
    },
    {
      q: "Omar wakes up and realises the fajr window has already closed. What is the correct action?",
      options: [
        "Skip fajr — the window is gone.",
        "Pray fajr as qada as soon as he remembers.",
        "Add the rakat onto dhuhr.",
        "Wait until the next morning's fajr and pray two sets."
      ],
      answer: 1
    }
  ];
  return renderTemplate`${maybeRenderHead()}<section id="quiz-section" class="bg-[color:var(--color-surface-soft)] border-b border-[color:var(--color-border)]"${addAttribute(JSON.stringify(questions), "data-questions")}> <div class="mx-auto max-w-3xl px-6 py-24 md:py-28"> <div class="text-center"> <p class="t-eyebrow text-[color:var(--color-primary)]">Test your obligatory knowledge</p> <h2 class="serif mt-3 text-4xl md:text-6xl leading-[1.1] font-bold text-[color:var(--color-fg)]">
Do you need Barakah?
</h2> <p class="mt-4 text-sm md:text-base text-[color:var(--color-fg-muted)]">
5 fard ayn questions (Hanafi madhab); knowledge <em>every</em> Muslim must know.
</p> </div> <!-- Quiz card --> <div id="quiz-card" class="mt-12"> <!-- Segmented progress --> <div id="quiz-progress" class="mx-auto flex max-w-sm items-center gap-1.5"></div> <div class="mt-8 text-center"> <p id="quiz-step" class="text-[13px] font-bold tracking-tight text-[color:var(--color-fg)]">Question 1 of 5</p> <p id="quiz-question" class="mx-auto mt-2 max-w-lg text-[15px] leading-6 text-[color:var(--color-fg)]"></p> </div> <ul id="quiz-options" class="mx-auto mt-6 max-w-xl space-y-2.5"></ul> <div id="quiz-footer" class="mx-auto mt-6 hidden max-w-xl flex-col items-stretch gap-3"> <button id="quiz-next" type="button" class="w-full rounded-[8px] bg-[color:var(--color-primary)] px-6 py-3 text-base font-semibold text-white shadow-[var(--shadow-cta)] hover:opacity-90 transition-opacity">
Next question
</button> <p id="quiz-feedback" class="text-center text-[11px] uppercase tracking-[0.12em] font-semibold text-[color:var(--color-fg-muted)]"></p> </div> </div> <!-- Result card --> <div id="quiz-result" class="mt-14 hidden"> <div class="flex flex-col items-center"> <div class="relative h-44 w-44"> <svg viewBox="0 0 120 120" class="h-full w-full -rotate-90"> <circle cx="60" cy="60" r="52" fill="none" stroke="var(--color-border)" stroke-width="10"></circle> <circle id="result-ring" cx="60" cy="60" r="52" fill="none" stroke="var(--color-primary)" stroke-width="10" stroke-linecap="round" stroke-dasharray="326.7" stroke-dashoffset="326.7" style="transition: stroke-dashoffset 900ms ease, stroke 300ms ease;"></circle> </svg> <div class="absolute inset-0 flex items-center justify-center"> <p id="result-percent" class="serif text-3xl md:text-4xl font-bold text-[color:var(--color-fg)]">0%</p> </div> </div> <p id="result-headline" class="mt-8 text-base font-semibold text-[color:var(--color-fg)]">
Don't risk your akhira.
</p> <p class="mt-3 max-w-xl text-center text-sm text-[color:var(--color-fg-muted)]">
Become an expert at dealing with these scenarios + hundreds more.
</p> <a href="#waitlist" class="mt-8 inline-flex items-center justify-center rounded-[6px] bg-[color:var(--color-primary)] px-6 py-3 text-sm font-semibold text-white shadow-[var(--shadow-cta)] hover:opacity-90 transition-opacity">
Fix my score with Barakah
</a> </div> </div> </div> </section> ${renderScript($$result, "/Users/sourav/Workflows/saas/heybarakah_app/packages/marketing/src/components/Checklist.astro?astro&type=script&index=0&lang.ts")}`;
}, "/Users/sourav/Workflows/saas/heybarakah_app/packages/marketing/src/components/Checklist.astro", void 0);

const $$Testimonial = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<section class="bg-white border-b border-[color:var(--color-border)]"> <div class="mx-auto max-w-3xl px-6 py-24 text-center md:py-28"> <div class="flex items-center justify-center gap-1 text-[color:var(--color-primary)]"> ${Array.from({ length: 5 }).map(() => renderTemplate`<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m12 2 3 7h7l-5.5 4.5L18 22l-6-4-6 4 1.5-8.5L2 9h7z"></path></svg>`)} </div> <blockquote class="serif mt-7 text-2xl leading-snug font-bold text-[color:var(--color-fg)] md:text-3xl">
"For the first time in years, I'm praying every salah on time. The phone simply steps aside — and so do the excuses."
</blockquote> <figcaption class="mt-7 text-sm text-[color:var(--color-fg-muted)]">
Yusuf, beta tester · Manchester
</figcaption> </div> </section>`;
}, "/Users/sourav/Workflows/saas/heybarakah_app/packages/marketing/src/components/Testimonial.astro", void 0);

const $$AskScholar = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<section class="bg-white border-b border-[color:var(--color-border)]"> <div class="mx-auto max-w-3xl px-6 py-28 md:py-32"> <div class="grid gap-14 md:grid-cols-[0.95fr_1.05fr] md:items-center"> <div> <p class="t-eyebrow text-[color:var(--color-primary)]">Ask, in arabic or english</p> <h2 class="serif mt-4 text-5xl md:text-7xl leading-[1.1] font-bold text-[color:var(--color-fg)]">
Trusted answers, not chatbots.
</h2> <p class="mt-5 text-base leading-7 text-[color:var(--color-fg-muted)]">
Questions about salah, wudu, fasting, and du'a — answered from authentic sources, reviewed by qualified scholars. No invented rulings, no algorithm guesses.
</p> <ul class="mt-8 space-y-3 text-sm text-[color:var(--color-fg)]"> <li class="flex items-start gap-3"> <span class="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-primary)] text-white"> <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"></path></svg> </span> <span>Sourced from Qur'an and authentic hadith.</span> </li> <li class="flex items-start gap-3"> <span class="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-primary)] text-white"> <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"></path></svg> </span> <span>Reviewed by scholars from four madhāhib.</span> </li> <li class="flex items-start gap-3"> <span class="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-primary)] text-white"> <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"></path></svg> </span> <span>Citations included on every answer.</span> </li> </ul> </div> <div class="rounded-[8px] border border-[color:var(--color-border)] bg-[color:var(--color-surface-soft)] p-5 md:p-6"> <div class="space-y-4"> <div class="flex justify-end"> <div class="max-w-[80%] rounded-[14px] rounded-tr-[4px] bg-[color:var(--color-primary)] px-4 py-3 text-sm leading-5 text-white">
Can I combine maghrib and isha while travelling?
</div> </div> <div class="flex gap-3"> <span class="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white border border-[color:var(--color-border)] text-[color:var(--color-primary)]"> <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 4 6v6c0 5 3.4 9.4 8 10 4.6-.6 8-5 8-10V6l-8-4z"></path></svg> </span> <div class="max-w-[85%] rounded-[14px] rounded-tl-[4px] border border-[color:var(--color-border)] bg-white px-4 py-3 text-sm leading-6 text-[color:var(--color-fg)]"> <p>Yes. The Prophet ﷺ combined maghrib and isha while travelling, both at the time of maghrib (jam' taqdīm) and isha (jam' ta'khīr).</p> <div class="mt-3 flex flex-wrap gap-1.5"> <span class="inline-flex items-center gap-1 rounded-full bg-[color:var(--color-primary-soft)] px-2.5 py-1 text-xs font-medium text-[color:var(--color-primary)]">Sahih Muslim 705</span> <span class="inline-flex items-center gap-1 rounded-full bg-[color:var(--color-primary-soft)] px-2.5 py-1 text-xs font-medium text-[color:var(--color-primary)]">Bukhari 1107</span> </div> </div> </div> <div class="flex items-center gap-2 pl-11 text-xs text-[color:var(--color-fg-subtle)]"> <span class="inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--color-primary)] animate-pulse"></span>
Reviewed by Shaykh Abdullah · Maliki
</div> </div> </div> </div> </div> </section>`;
}, "/Users/sourav/Workflows/saas/heybarakah_app/packages/marketing/src/components/AskScholar.astro", void 0);

const $$PricingCompare = createComponent(($$result, $$props, $$slots) => {
  const { comparisons, pricing} = appConfig;
  return renderTemplate`${maybeRenderHead()}<section id="pricing" class="bg-[color:var(--color-surface-soft)] border-b border-[color:var(--color-border)]"> <div class="mx-auto max-w-3xl px-6 py-28 md:py-32"> <h2 class="serif text-center text-5xl md:text-7xl leading-[1.1] font-bold text-[color:var(--color-fg)]">
What's your akhira worth?
</h2> <div class="mt-16 grid gap-6 md:mt-20 md:grid-cols-2 md:gap-8"> ${comparisons.map((item) => renderTemplate`<div class="flex flex-col items-center rounded-[16px] bg-white p-10 text-center shadow-[0_1px_2px_rgba(0,0,0,0.04)]"> <p class="text-xl font-bold text-[color:var(--color-fg)]"> ${item.name} </p> <div class="mt-10 mb-10 flex h-20 items-center justify-center"> <img${addAttribute(item.logo, "src")}${addAttribute(item.logoAlt, "alt")} class="max-h-16 w-auto object-contain" loading="lazy"> </div> <p class="text-sm leading-6 text-[color:var(--color-fg-muted)]"> ${item.description}${" "} <span class="font-bold text-[color:var(--color-fg)]">${item.price}</span> </p> ${item.comparison && renderTemplate`<p class="mt-5 text-sm leading-6 text-[color:var(--color-fg-muted)]"> ${item.comparison.split(item.comparisonBold).map((part, i, arr) => renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result2) => renderTemplate`${part}${i < arr.length - 1 && renderTemplate`<strong class="text-[color:var(--color-fg)]">${item.comparisonBold}</strong>`}` })}`)} </p>`} </div>`)} </div> <div class="mt-12 flex flex-col items-center"> <span class="relative inline-flex items-center gap-2 mb-5 text-xs font-bold uppercase tracking-[0.22em] text-[color:var(--color-primary)]"> <svg aria-hidden="true" width="22" height="10" viewBox="0 0 22 10" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"> <path d="M1 5 Q 6 1 11 5 T 21 5"></path> </svg> ${pricing.label} <svg aria-hidden="true" width="22" height="10" viewBox="0 0 22 10" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"> <path d="M1 5 Q 6 9 11 5 T 21 5"></path> </svg> </span> <a${addAttribute(pricing.checkoutUrl, "href")} class="flex w-full flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-full bg-[color:var(--color-primary)] px-6 py-4 text-base font-bold uppercase tracking-[0.06em] text-white shadow-[0_8px_24px_rgba(41,96,62,0.28)] transition-all duration-200 hover:bg-[color:var(--color-primary-hover)] active:scale-[0.98] active:bg-[color:var(--color-primary-press)] sm:py-5 sm:text-xl md:text-2xl md:tracking-[0.08em]"> <span>Get Barakah — ${pricing.lifetimePrice}</span><span class="opacity-50 line-through">${pricing.originalPrice}</span> </a> </div> </div> </section>`;
}, "/Users/sourav/Workflows/saas/heybarakah_app/packages/marketing/src/components/PricingCompare.astro", void 0);

const items = [
  {
    q: "What is prayer lock, exactly?",
    a: "When a salah window opens, Barakah closes the apps you choose to set aside — social, video, games. Calls, Qur'an, du'a apps, and emergency tools stay open. The lock lifts once you've prayed, or after the window ends."
  },
  {
    q: "Will it lock me out of important things?",
    a: "No. You decide what gets quieted. Barakah suggests sensible defaults — never your phone, calls, maps, or Qur'an apps. Everything is opt-in."
  },
  {
    q: "Which prayer time calculation does Barakah use?",
    a: "We default to your local masjid where possible, with MWL, ISNA, Egyptian, and Umm al-Qura available. You can override per-prayer."
  },
  {
    q: "Does Barakah work without internet?",
    a: "Yes. Prayer times, qibla, and the lock all work offline once configured. Your data never leaves your device."
  },
  {
    q: "Is Barakah free?",
    a: "Core lock, adhan, qibla, and times are free. A modest subscription supports development and unlocks reciter packs and family sharing."
  },
  {
    q: "Which madhhab does it follow?",
    a: "Barakah is for every muslim. Asr calculation supports both Shafi'i and Hanafi positions. We don't take rulings on fiqh — we leave that to you and your scholar."
  }
];
function Faq() {
  const [open, setOpen] = useState(0);
  return /* @__PURE__ */ jsx("section", { id: "faq", className: "relative bg-white border-b border-[color:var(--color-border)]", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-3xl px-6 py-28 md:py-32", children: [
    /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsx("p", { className: "t-eyebrow text-[color:var(--color-primary)]", children: "Common questions" }),
      /* @__PURE__ */ jsx("h2", { className: "serif mt-4 text-5xl md:text-7xl leading-[1.1] font-bold text-[color:var(--color-fg)]", children: "Quiet answers." })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-14 overflow-hidden rounded-[4px] border border-[color:var(--color-border)]", children: items.map((item, i) => {
      const isOpen = open === i;
      return /* @__PURE__ */ jsxs(
        "div",
        {
          className: i !== 0 ? "border-t border-[color:var(--color-border)]" : "",
          children: [
            /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                "aria-expanded": isOpen,
                onClick: () => setOpen(isOpen ? null : i),
                className: "flex w-full items-center justify-between gap-6 bg-white px-6 py-5 text-left transition-colors hover:bg-[color:var(--color-surface-soft)]",
                children: [
                  /* @__PURE__ */ jsx("span", { className: "text-base font-medium leading-6 text-[color:var(--color-fg)]", children: item.q }),
                  /* @__PURE__ */ jsx(
                    ChevronDown,
                    {
                      size: 18,
                      className: `shrink-0 text-[color:var(--color-fg-muted)] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`
                    }
                  )
                ]
              }
            ),
            /* @__PURE__ */ jsx(
              "div",
              {
                className: "grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out",
                style: { gridTemplateRows: isOpen ? "1fr" : "0fr" },
                children: /* @__PURE__ */ jsx("div", { className: "min-h-0", children: /* @__PURE__ */ jsx("p", { className: "px-6 pb-6 text-sm leading-6 text-[color:var(--color-fg-muted)]", children: item.a }) })
              }
            )
          ]
        },
        item.q
      );
    }) })
  ] }) });
}

const $$FinalCta = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<section class="bg-white border-b border-[color:var(--color-border)]"> <div class="mx-auto max-w-3xl px-6 py-28 text-center md:py-32"> <img src="/barakah-app-icon.png" alt="" class="mx-auto h-20 w-20 rounded-[18px] shadow-[0_30px_60px_-15px_rgba(41,96,62,0.35)]"> <h2 class="serif mt-10 text-5xl md:text-7xl leading-[1.05] font-bold text-[color:var(--color-fg)]">
Begin with bismillah.
</h2> <p class="mx-auto mt-5 max-w-md text-base leading-7 text-[color:var(--color-fg-muted)]">
Join the waitlist for early access. We'll send a single, quiet email when Barakah opens.
</p> <div class="mx-auto mt-9 max-w-md"> ${renderComponent($$result, "WaitlistForm", WaitlistForm, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/Users/sourav/Workflows/saas/heybarakah_app/packages/marketing/src/components/WaitlistForm.tsx", "client:component-export": "default" })} </div> </div> </section>`;
}, "/Users/sourav/Workflows/saas/heybarakah_app/packages/marketing/src/components/FinalCta.astro", void 0);

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, {}, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "Hero", $$Hero, {})} ${renderComponent($$result2, "Checklist", $$Checklist, {})} ${renderComponent($$result2, "Testimonial", $$Testimonial, {})} ${renderComponent($$result2, "AskScholar", $$AskScholar, {})} ${renderComponent($$result2, "PricingCompare", $$PricingCompare, {})} ${renderComponent($$result2, "Faq", Faq, { "client:visible": true, "client:component-hydration": "visible", "client:component-path": "/Users/sourav/Workflows/saas/heybarakah_app/packages/marketing/src/components/Faq.tsx", "client:component-export": "default" })} ${renderComponent($$result2, "FinalCta", $$FinalCta, {})} ` })}`;
}, "/Users/sourav/Workflows/saas/heybarakah_app/packages/marketing/src/pages/index.astro", void 0);

const $$file = "/Users/sourav/Workflows/saas/heybarakah_app/packages/marketing/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
