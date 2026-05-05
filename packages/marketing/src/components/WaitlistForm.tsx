import { type FormEvent, useState } from "react";
import { ArrowRight, Check } from "../lib/icons";

type Status = "idle" | "submitting" | "success" | "error";

export default function WaitlistForm({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email.");
      setStatus("error");
      return;
    }
    setStatus("submitting");
    setTimeout(() => setStatus("success"), 600);
  }

  if (status === "success") {
    return (
      <div
        className="flex items-center gap-3 rounded-[4px] border border-[color:var(--color-primary)] bg-[color:var(--color-primary-soft)] px-4 py-3.5 text-[color:var(--color-primary-press)]"
        role="status"
      >
        <Check size={18} />
        <span className="text-[15px]">You're on the list. We'll be in touch.</span>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate aria-label="Join the waitlist">
      <div
        className={`flex flex-col gap-2.5 sm:flex-row ${compact ? "" : ""}`}
      >
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          aria-label="Email address"
          className="flex-1 rounded-[4px] border border-[color:var(--color-border)] bg-white px-4 py-3.5 text-[15px] outline-none transition-colors hover:border-[color:var(--color-border-strong)] focus:border-[color:var(--color-primary)]"
        />
        <button
          type="submit"
          disabled={status === "submitting"}
          className="group inline-flex items-center justify-center gap-2 rounded-full bg-[color:var(--color-primary)] px-7 py-3.5 text-white shadow-[0_8px_24px_rgba(41,96,62,0.28)] transition-all duration-200 ease-[var(--ease-out)] hover:bg-[color:var(--color-primary-hover)] active:scale-[0.98] active:bg-[color:var(--color-primary-press)] disabled:opacity-60"
        >
          <span className="t-eyebrow">{status === "submitting" ? "Joining" : "Join waitlist"}</span>
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
      {error ? (
        <p className="mt-2 text-sm text-[color:var(--color-error)]" role="alert">
          {error}
        </p>
      ) : (
        <p className="mt-2.5 text-[13px] text-[color:var(--color-fg-subtle)]">
          No spam. One quiet email when we open access.
        </p>
      )}
    </form>
  );
}
