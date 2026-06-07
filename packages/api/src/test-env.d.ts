/// <reference types="@cloudflare/vitest-pool-workers/types" />

declare module "*.sql?raw" {
  const content: string;
  export default content;
}

// biome-ignore lint/style/noNamespace: ambient augmentation of the generated Cloudflare.Env
declare namespace Cloudflare {
  interface Env {
    DB: import("@cloudflare/workers-types").D1Database;
    KV: import("@cloudflare/workers-types").KVNamespace;
    R2: import("@cloudflare/workers-types").R2Bucket;
  }
}
