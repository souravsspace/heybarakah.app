import { useState } from "react";
import { ChevronDown } from "../lib/icons";

const items = [
  {
    q: "What is prayer lock, exactly?",
    a: "When a salah window opens, Barakaah closes the apps you choose to set aside — social, video, games. Calls, Qur'an, du'a apps, and emergency tools stay open. The lock lifts once you've prayed, or after the window ends.",
  },
  {
    q: "Will it lock me out of important things?",
    a: "No. You decide what gets quieted. Barakaah suggests sensible defaults — never your phone, calls, maps, or Qur'an apps. Everything is opt-in.",
  },
  {
    q: "Which prayer time calculation does Barakaah use?",
    a: "We default to your local masjid where possible, with MWL, ISNA, Egyptian, and Umm al-Qura available. You can override per-prayer.",
  },
  {
    q: "Does Barakaah work without internet?",
    a: "Yes. Prayer times, qibla, and the lock all work offline once configured. Your data never leaves your device.",
  },
  {
    q: "Is Barakaah free?",
    a: "Core lock, adhan, qibla, and times are free. A modest subscription supports development and unlocks reciter packs and family sharing.",
  },
  {
    q: "Which madhhab does it follow?",
    a: "Barakaah is for every muslim. Asr calculation supports both Shafi'i and Hanafi positions. We don't take rulings on fiqh — we leave that to you and your scholar.",
  },
];

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="relative">
      <div className="mx-auto max-w-3xl px-6 py-28 md:py-32">
        <div className="text-center">
          <p className="t-eyebrow text-[color:var(--color-primary)]">Common questions</p>
          <h2 className="serif mt-4 text-[36px] leading-[1.1] font-bold text-[color:var(--color-fg)] md:text-[44px]">
            Quiet answers.
          </h2>
        </div>

        <div className="mt-14 overflow-hidden rounded-[4px] border border-[color:var(--color-border)]">
          {items.map((item, i) => {
            const isOpen = open === i;
            return (
              <div
                key={item.q}
                className={i !== 0 ? "border-t border-[color:var(--color-border)]" : ""}
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-6 bg-white px-6 py-5 text-left transition-colors hover:bg-[color:var(--color-surface-soft)]"
                >
                  <span className="text-[16px] font-medium leading-[24px] text-[color:var(--color-fg)]">
                    {item.q}
                  </span>
                  <ChevronDown
                    size={18}
                    className={`shrink-0 text-[color:var(--color-fg-muted)] transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className="grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div className="min-h-0">
                    <p className="px-6 pb-6 text-[15px] leading-[24px] text-[color:var(--color-fg-muted)]">
                      {item.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
