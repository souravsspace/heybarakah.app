import disposableDomains from "disposable-email-domains";
import { z } from "zod";

const disposableSet = new Set(disposableDomains);

const schema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(5)
    .max(254)
    .email("Invalid email."),
});

export function parseWaitlistEmail(
  input: unknown
): { ok: true; email: string } | { ok: false; error: string } {
  const parsed = schema.safeParse({ email: input });

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, error: issue?.message ?? "Invalid email." };
  }

  const email = parsed.data.email;
  const domain = email.split("@")[1];

  if (!domain || disposableSet.has(domain)) {
    return { ok: false, error: "Please use a non-disposable email." };
  }

  return { ok: true, email };
}
