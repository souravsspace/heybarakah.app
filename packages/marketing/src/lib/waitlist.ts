import { env } from "@/env";

type WaitlistResult = { ok: boolean; error?: string; warning?: string };

// Module-scope on purpose: PUBLIC_API_URL is baked at build time and the
// request is stateless, so resolving the base URL once per isolate is correct.
const WAITLIST_URL = `${env.PUBLIC_API_URL}/api/v1/marketing/waitlist`;

export async function joinWaitlist(email: string): Promise<WaitlistResult> {
  const res = await fetch(WAITLIST_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return (await res.json()) as WaitlistResult;
}
