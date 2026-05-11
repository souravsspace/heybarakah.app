// @ts-check

import react from "@astrojs/react";
import cloudflare from "@astrojs/cloudflare";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: cloudflare({
    entrypointResolution: "auto",
    imageService: "passthrough",
    platformProxy: {
      enabled: true,
    },
  }),
  integrations: [react()],
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
