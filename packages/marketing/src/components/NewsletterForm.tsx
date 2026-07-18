import { type FormEvent, useState } from "react";

import { joinWaitlist } from "@/lib/waitlist";

type Status = "idle" | "submitting" | "success" | "error";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const trimmed = email.trim();
    if (!EMAIL_PATTERN.test(trimmed)) {
      setError("Enter a valid email.");
      setStatus("error");
      return;
    }
    setStatus("submitting");
    try {
      const data = await joinWaitlist(trimmed);
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
      <div className="waitlist done" role="status">
        <span style={{ color: "#fff" }}>
          {error ?? "Jazak Allahu khayran — you're subscribed."}
        </span>
      </div>
    );
  }

  return (
    <>
      <form aria-label="Subscribe to the newsletter" className="waitlist" noValidate onSubmit={onSubmit}>
        <input
          aria-label="Email address"
          autoComplete="email"
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          required
          type="email"
          value={email}
        />
        <button className="btn btn-light" disabled={status === "submitting"} type="submit">
          {status === "submitting" ? "Subscribing" : "Subscribe"}
        </button>
      </form>
      {status === "error" && error ? (
        <p className="final-fine" role="alert" style={{ color: "#FFB4A8" }}>
          {error}
        </p>
      ) : null}
    </>
  );
}
