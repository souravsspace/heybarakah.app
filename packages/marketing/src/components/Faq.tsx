import { useState } from "react";
import { ChevronDown } from "../lib/icons";

const items = [
  {
    q: "What is prayer lock, exactly?",
    a: "When a salah window opens, Barakah closes the apps you choose to set aside — social, video, games. Calls, Qur'an, du'a apps, and emergency tools stay open. The lock lifts once you've prayed, or after the window ends.",
  },
  {
    q: "Will it lock me out of important things?",
    a: "No. You decide what gets quieted. Barakah suggests sensible defaults — never your phone, calls, maps, or Qur'an apps. Everything is opt-in.",
  },
  {
    q: "Which prayer time calculation does Barakah use?",
    a: "We default to your local masjid where possible, with MWL, ISNA, Egyptian, and Umm al-Qura available. You can override per-prayer.",
  },
  {
    q: "Does Barakah work without internet?",
    a: "Yes. Prayer times, qibla, and the lock all work offline once configured. Your data never leaves your device.",
  },
  {
    q: "Is Barakah free?",
    a: "Core lock, adhan, qibla, and times are free. A modest subscription supports development and unlocks reciter packs and family sharing.",
  },
  {
    q: "Which madhhab does it follow?",
    a: "Barakah is for every muslim. Asr calculation supports both Shafi'i and Hanafi positions. We don't take rulings on fiqh — we leave that to you and your scholar.",
  },
];

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section
      className="relative border-[color:var(--color-border)] border-b bg-white"
      id="faq"
    >
      <div className="mx-auto max-w-3xl px-6 py-28 md:py-32">
        <div className="text-center">
          <p className="t-eyebrow text-[color:var(--color-primary)]">
            Common questions
          </p>
          <h2 className="serif mt-4 font-bold text-5xl text-[color:var(--color-fg)] leading-[1.1] md:text-7xl">
            Quiet answers.
          </h2>
        </div>

        <div className="mt-14 overflow-hidden rounded-[4px] border border-[color:var(--color-border)]">
          {items.map((item, i) => {
            const isOpen = open === i;
            return (
              <div
                className={
                  i === 0 ? "" : "border-[color:var(--color-border)] border-t"
                }
                key={item.q}
              >
                <button
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-6 bg-white px-6 py-5 text-left transition-colors hover:bg-[color:var(--color-surface-soft)]"
                  onClick={() => setOpen(isOpen ? null : i)}
                  type="button"
                >
                  <span className="font-medium text-[color:var(--color-fg)] text-base leading-6">
                    {item.q}
                  </span>
                  <ChevronDown
                    className={`shrink-0 text-[color:var(--color-fg-muted)] transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                    size={18}
                  />
                </button>
                <div
                  className="grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div className="min-h-0">
                    <p className="px-6 pb-6 text-[color:var(--color-fg-muted)] text-sm leading-6">
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
