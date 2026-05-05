import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

const __vite_import_meta_env__ = {"ASSETS_PREFIX": undefined, "BASE_URL": "/", "DEV": false, "MODE": "production", "PROD": true, "SITE": undefined, "SSR": true};
const env = createEnv({
  server: {
    RESEND_API_KEY: z.string().min(1),
    RESEND_AUDIENCE_ID: z.string().min(1),
    RESEND_FROM: z.string().min(1),
    RESEND_REPLY_TO: z.string().min(1).optional(),
    POLAR_WEBHOOK_SECRET: z.string().min(1)
  },
  clientPrefix: "PUBLIC_",
  client: {},
  runtimeEnv: Object.assign(__vite_import_meta_env__, { RESEND_API_KEY: "re_13A56cRi_KYzEKKwrzwSJJnAYEWy8QLDr", RESEND_AUDIENCE_ID: "b952b6bb-c64c-4cf1-a95e-4e7046231afa", RESEND_FROM: "Barakah <salam@heybarakah.app>", RESEND_REPLY_TO: "hello@heybarakah.app", POLAR_WEBHOOK_SECRET: "polar_whs_Ui9DlFaUXQ4yXzEo60kvbzNfIbf0tc8hffFp244GUEw", _: "/Users/sourav/Workflows/saas/heybarakah_app/packages/marketing/node_modules/.bin/astro" }),
  emptyStringAsUndefined: true
});

export { env as e };
