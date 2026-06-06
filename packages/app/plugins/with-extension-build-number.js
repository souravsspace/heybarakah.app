/**
 * Keeps every iOS app-extension target's CFBundleVersion in sync with the main
 * app target.
 *
 * @bacons/apple-targets (pulled in by expo-app-blocker) generates the extension
 * targets with a default CURRENT_PROJECT_VERSION of "1" and never syncs it to
 * the app. With `appVersionSource: remote` + `autoIncrement`, EAS bumps only the
 * main app target's CURRENT_PROJECT_VERSION (e.g. to 12). Xcode then refuses to
 * sign because "The CFBundleVersion of an app extension ('1') must match that of
 * its containing parent app ('12')".
 *
 * apple-targets writes the pbxproj during a standard xcodeproject mod, so this
 * runs as a `finalized` on-disk pass (after every other mod) and rewrites the
 * generated project.pbxproj. The main app is always the highest version because
 * EAS only ever increments it, so the max value found is the app's build number.
 */
const fs = require("node:fs");
const path = require("node:path");
const { withMod } = require("expo/config-plugins");

const VERSION_RE = /CURRENT_PROJECT_VERSION = (\d+);/g;

/** Set every CURRENT_PROJECT_VERSION in the pbxproj to the highest one present. */
function syncBuildNumbers(pbxprojPath) {
  if (!fs.existsSync(pbxprojPath)) {
    return;
  }
  const contents = fs.readFileSync(pbxprojPath, "utf8");
  const versions = [...contents.matchAll(VERSION_RE)].map((m) => Number(m[1]));
  if (versions.length === 0) {
    return;
  }
  const max = Math.max(...versions);
  const synced = contents.replace(
    VERSION_RE,
    `CURRENT_PROJECT_VERSION = ${max};`
  );
  if (synced !== contents) {
    fs.writeFileSync(pbxprojPath, synced);
  }
}

module.exports = function withExtensionBuildNumber(config) {
  return withMod(config, {
    platform: "ios",
    mod: "finalized",
    action: (cfg) => {
      const iosRoot = cfg.modRequest.platformProjectRoot;
      const projectDir = fs
        .readdirSync(iosRoot)
        .find((name) => name.endsWith(".xcodeproj"));
      if (projectDir) {
        syncBuildNumbers(path.join(iosRoot, projectDir, "project.pbxproj"));
      }
      return cfg;
    },
  });
};
