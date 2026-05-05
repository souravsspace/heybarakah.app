import type { APIRoute } from "astro";
import { Resend } from "resend";
import { z } from "zod";
import disposableDomains from "disposable-email-domains";
import { env } from "../../env";
import { rateLimit } from "../../lib/rate-limit";
import { welcomeEmail } from "../../lib/welcome-email";

export const prerender = false;

const disposableSet = new Set(disposableDomains);

const schema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(5)
    .max(254)
    .email("Enter a valid email."),
});

function json(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...headers },
  });
}

function clientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

export const POST: APIRoute = async ({ request }) => {
  const ip = clientIp(request);
  const rl = rateLimit(`waitlist:${ip}`, { limit: 5, windowMs: 60 * 60 * 1000 });
  if (!rl.ok) {
    return json(
      { error: "Too many requests. Try again later." },
      429,
      { "retry-after": String(rl.retryAfter) },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "Invalid JSON." }, 400);
  }

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return json({ error: parsed.error.issues[0]?.message ?? "Invalid email." }, 400);
  }

  const email = parsed.data.email;
  const domain = email.split("@")[1];
  if (!domain || disposableSet.has(domain)) {
    return json({ error: "Please use a non-disposable email." }, 400);
  }

  const resend = new Resend(env.RESEND_API_KEY);

  const contact = await resend.contacts.create({
    audienceId: env.RESEND_AUDIENCE_ID,
    email,
    unsubscribed: false,
  });

  if (contact.error && contact.error.name !== "validation_error") {
    return json({ error: "Could not save your email." }, 502);
  }

  const { subject, text, html } = welcomeEmail();
  const send = await resend.emails.send({
    from: env.RESEND_FROM,
    to: email,
    subject,
    text,
    html,
    replyTo: env.RESEND_REPLY_TO,
  });

  if (send.error) {
    return json({ ok: true, warning: "Saved, but confirmation email failed." });
  }

  return json({ ok: true });
};
