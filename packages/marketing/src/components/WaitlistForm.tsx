import { type FormEvent, useState } from "react";

import { joinWaitlist } from "@/lib/convex";

import { Check } from "../lib/icons";

type Status = "idle" | "submitting" | "success" | "error";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!EMAIL_PATTERN.test(email)) {
      setError("Enter a valid email.");
      setStatus("error");
      return;
    }
    setStatus("submitting");
    try {
      const data = await joinWaitlist(email);
      if (!data.ok) {
        setError(data.error ?? "Something went wrong. Try again.");
        setStatus("error");
        return;
      }
      if (data.warning) {
        setError(data.warning);
      }
      setStatus("success");
    } catch {
      setError("Network error. Try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div
        className="flex items-center gap-3 rounded-[4px] border border-[color:var(--color-primary)] bg-[color:var(--color-primary-soft)] px-4 py-3.5 text-[color:var(--color-primary-press)]"
        role="status"
      >
        <Check size={18} />
        <span className="text-sm">
          {error ?? "You're on the list. We'll be in touch."}
        </span>
      </div>
    );
  }

  return (
    <form
      aria-label="Join the waitlist"
      className="mx-auto w-full max-w-[380px]"
      noValidate
      onSubmit={onSubmit}
    >
      <div className="flex items-center gap-1.5 rounded-full border border-[color:var(--color-border)] bg-white p-1 pl-1.5 transition-all duration-200 ease-[var(--ease-out)] focus-within:border-[color:var(--color-primary)] focus-within:shadow-[0_0_0_3px_rgba(41,96,62,0.12)] hover:border-[color:var(--color-border-strong)]">
        <input
          aria-label="Email address"
          autoComplete="off"
          className="min-w-0 flex-1 appearance-none border-0 bg-transparent px-3 py-2 font-medium text-[color:var(--color-fg)] text-sm tracking-wide outline-none placeholder:text-[color:var(--color-fg-subtle)] focus:border-0 focus:shadow-none focus:outline-none focus:ring-0"
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          style={{
            boxShadow: "none",
            outline: "none",
            WebkitAppearance: "none",
          }}
          type="email"
          value={email}
        />
        <button
          className="inline-flex shrink-0 items-center justify-center rounded-full bg-[color:var(--color-primary)] px-5 py-3 font-bold text-white text-xs uppercase tracking-[0.1em] shadow-[inset_0_0_0_2px_rgba(255,255,255,0.95),0_0_0_1.5px_#29603E,0_6px_18px_rgba(41,96,62,0.28)] transition-all duration-200 ease-[var(--ease-out)] hover:bg-[color:var(--color-primary-hover)] active:scale-[0.98] active:bg-[color:var(--color-primary-press)] disabled:opacity-60"
          disabled={status === "submitting"}
          type="submit"
        >
          {status === "submitting" ? "Joining" : "Join waitlist"}
        </button>
      </div>
      {error ? (
        <p
          className="mt-2 text-[color:var(--color-error)] text-sm"
          role="alert"
        >
          {error}
        </p>
      ) : (
        <p className="mt-2.5 text-[color:var(--color-fg-subtle)] text-xs">
          No spam. One quiet email when we open access.
        </p>
      )}
    </form>
  );
}
