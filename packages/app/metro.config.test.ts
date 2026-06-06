import { describe, expect, test } from "bun:test";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import config from "./metro.config";

const requireFromApp = createRequire(`${import.meta.dirname}/app/_layout.tsx`);
const requireFromReactNative = createRequire(
  require.resolve("react-native/package.json")
);
const workspaceRoot = join(import.meta.dirname, "../..");
const workspaceReactDirectory = dirname(
  requireFromReactNative.resolve("react")
);

describe("metro config", () => {
  test("forces React to resolve from the workspace before app-local modules", () => {
    const aliasedReact = config.resolver?.extraNodeModules?.react;

    expect(aliasedReact).toBe(workspaceReactDirectory);
    expect(aliasedReact).not.toBe(dirname(requireFromApp.resolve("react")));
    expect(config.watchFolders).toContain(workspaceRoot);
    expect(config.resolver?.nodeModulesPaths?.[0]).toBe(
      join(workspaceRoot, "node_modules")
    );
    expect(config.resolver?.disableHierarchicalLookup).not.toBe(true);
  });
});
