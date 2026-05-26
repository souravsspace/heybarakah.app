import { useState } from "react";
import { faqItems as items } from "../lib/faq-data";
import { ChevronDown } from "../lib/icons";

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
            const triggerId = `faq-trigger-${i}`;
            const panelId = `faq-panel-${i}`;
            return (
              <div
                className={
                  i === 0 ? "" : "border-[color:var(--color-border)] border-t"
                }
                key={item.q}
              >
                <button
                  aria-controls={panelId}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-6 bg-white px-6 py-5 text-left transition-colors hover:bg-[color:var(--color-surface-soft)]"
                  id={triggerId}
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
                  aria-labelledby={triggerId}
                  className="grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out"
                  id={panelId}
                  role="region"
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
