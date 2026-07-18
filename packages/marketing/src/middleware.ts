import { defineMiddleware } from "astro:middleware";

import { resolveCheckout } from "@/lib/checkout";

// Resolve the regional checkout once per request from Cloudflare's geo header,
// so every component reads a single Astro.locals.checkout instead of guessing.
export const onRequest = defineMiddleware((context, next) => {
  const country = context.request.headers.get("cf-ipcountry");
  context.locals.checkout = resolveCheckout(country);
  return next();
});
