// @ts-check

import react from "@astrojs/react";
import cloudflare from "@astrojs/cloudflare";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  site: "https://heybarakah.app",
  output: "server",
  adapter: cloudflare({
    entrypointResolution: "auto",
    imageService: "passthrough",
    platformProxy: {
      enabled: true,
    },
  }),
  integrations: [
    react(),
    sitemap({
      filter: (page) =>
        !page.includes("/success") &&
        !page.includes("/llms.txt") &&
        !page.includes("/llms-full.txt"),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      external: [
        "node:util",
        "node:stream",
        "node:events",
        "node:os",
        "node:path",
        "node:crypto",
        "node:child_process",
        "child_process",
        "fs",
      ],
    },
  },
});
