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
    const appLocalReact = dirname(requireFromApp.resolve("react"));

    expect(aliasedReact).toBe(workspaceReactDirectory);
    // The alias must be rooted in the workspace node_modules — never a nested
    // app-local copy. Under a hoisted install app-local react already resolves
    // to the same workspace path (equal, and healthy); when a duplicate nested
    // copy exists the alias must still win, so assert the root, not inequality.
    expect(aliasedReact?.startsWith(join(workspaceRoot, "node_modules"))).toBe(
      true
    );
    if (appLocalReact !== workspaceReactDirectory) {
      expect(aliasedReact).not.toBe(appLocalReact);
    }
    expect(config.watchFolders).toContain(workspaceRoot);
    expect(config.resolver?.nodeModulesPaths?.[0]).toBe(
      join(workspaceRoot, "node_modules")
    );
    expect(config.resolver?.disableHierarchicalLookup).not.toBe(true);
  });
});
