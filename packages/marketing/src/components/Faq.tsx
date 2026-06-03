import { useRef, useState } from "react";
import { appConfig } from "../app-config";
import { faqItems as items } from "../lib/faq-data";

export default function Faq() {
  const [open, setOpen] = useState<number | null>(null);
  const innerRefs = useRef<(HTMLDivElement | null)[]>([]);

  return (
    <section className="sec qo-band" id="faq" data-od-id="faq">
      <div className="wrap faq-grid">
        <div>
          <div className="faq-aside">
            <span className="eyebrow">FAQ</span>
            <div className="fa-card" style={{ marginTop: "22px" }}>
              <h3 className="serif">Still wondering?</h3>
              <p>
                The short answers are here. Everything is opt-in, offline-first, and yours to
                control.
              </p>
              <a className="btn btn-primary btn-sm" href={`mailto:${appConfig.contact.email}`}>
                Email us
              </a>
            </div>
          </div>
        </div>
        <div className="faq-list" id="faqList">
          {items.map((f, i) => {
            const isOpen = open === i;
            return (
              <div className={isOpen ? "faq-item open" : "faq-item"} key={f.q}>
                <button
                  aria-expanded={isOpen}
                  className="faq-q"
                  onClick={() => setOpen(isOpen ? null : i)}
                  type="button"
                >
                  <span>{f.q}</span>
                  <span aria-hidden="true" className="faq-ic">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </span>
                </button>
                <div
                  className="faq-a"
                  style={{
                    maxHeight: isOpen ? `${innerRefs.current[i]?.scrollHeight ?? 0}px` : "0px",
                  }}
                >
                  <div
                    className="faq-a-inner"
                    ref={(el) => {
                      innerRefs.current[i] = el;
                    }}
                  >
                    {f.a}
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
