import { getDefaultConfig } from "expo/metro-config.js";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { withNativeWind } from "nativewind/dist/metro/index.js";

const projectRoot = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = resolve(projectRoot, "../..");
const require = createRequire(`${workspaceRoot}/package.json`);
const config = getDefaultConfig(import.meta.dirname);
const reactPath = dirname(require.resolve("react"));
const reactDomPath = dirname(require.resolve("react-dom"));

config.watchFolders = [workspaceRoot];

config.resolver.disableHierarchicalLookup = true;
config.resolver.nodeModulesPaths = [
  join(workspaceRoot, "node_modules"),
  join(projectRoot, "node_modules"),
];

config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  react: reactPath,
  "react-dom": reactDomPath,
};

export default withNativeWind(config, { input: "./global.css" });
