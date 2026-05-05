import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    RESEND_API_KEY: z.string().min(1),
    RESEND_AUDIENCE_ID: z.string().min(1),
    RESEND_FROM: z.string().min(1),
    RESEND_REPLY_TO: z.string().min(1).optional(),
    POLAR_WEBHOOK_SECRET: z.string().min(1),
  },
  clientPrefix: "PUBLIC_",
  client: {},
  runtimeEnv: import.meta.env,
  emptyStringAsUndefined: true,
});
