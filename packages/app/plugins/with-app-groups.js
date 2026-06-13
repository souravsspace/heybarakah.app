/**
 * Ensures the main app AND the widget extension keep BOTH App Groups on their
 * entitlements:
 *   - group.com.souravsspace.Barakah.shield      (expo-app-blocker / shield)
 *   - group.com.souravsspace.Barakah.expowidgets  (@bittingz/expo-widgets)
 *
 * The app's ExpoWidgets bridge writes the snapshot to the expowidgets group and
 * the widget reads it back, so the app must carry that group. @bacons/apple-
 * targets (pulled in by expo-app-blocker) rewrites the app's application-groups
 * to only the shield group during its xcodeproj mod — which runs after
 * withEntitlementsPlist — so a structured pass alone loses. The dangerous mod
 * below rewrites the generated entitlements files on disk as a final pass.
 */
const fs = require("node:fs");
const path = require("node:path");
const { withMod, withEntitlementsPlist } = require("expo/config-plugins");

const KEY = "com.apple.security.application-groups";
const GROUPS = [
  "group.com.souravsspace.Barakah.shield",
  "group.com.souravsspace.Barakah.expowidgets",
];
const DICT_RE = /<dict>/;

/** Inject the union of GROUPS into one entitlements plist on disk. */
function patchEntitlementsFile(filePath) {
  if (!fs.existsSync(filePath)) {
    // A missing file means the target folder name drifted (e.g. expo-widgets
    // renamed its extension); the app group would silently be lost. Warn loudly.
    console.warn(`[with-app-groups] entitlements file not found: ${filePath}`);
    return;
  }
  let xml = fs.readFileSync(filePath, "utf8");
  if (GROUPS.every((g) => xml.includes(g))) {
    return;
  }
  const block = `<key>${KEY}</key>\n  <array>\n${GROUPS.map(
    (g) => `    <string>${g}</string>`
  ).join("\n")}\n  </array>`;
  const arrayRe = new RegExp(
    `<key>${KEY}</key>\\s*<array>[\\s\\S]*?</array>`,
    "m"
  );
  xml = arrayRe.test(xml)
    ? xml.replace(arrayRe, block)
    : xml.replace(DICT_RE, `<dict>\n  ${block}`);
  fs.writeFileSync(filePath, xml);
}

module.exports = function withAppGroups(inputConfig) {
  const config = withEntitlementsPlist(inputConfig, (cfg) => {
    const current = Array.isArray(cfg.modResults[KEY])
      ? cfg.modResults[KEY]
      : [];
    cfg.modResults[KEY] = Array.from(new Set([...current, ...GROUPS]));
    return cfg;
  });

  // `finalized` runs after every other mod (entitlements + bacons' xcodeproj
  // write), so patching the files on disk here has the final say.
  return withMod(config, {
    platform: "ios",
    mod: "finalized",
    action: (cfg) => {
      const iosRoot = cfg.modRequest.platformProjectRoot;
      patchEntitlementsFile(
        path.join(iosRoot, "Barakah", "Barakah.entitlements")
      );
      // The widget extension folder name is owned by expo-widgets and has
      // drifted before (BarakahWidgetExtension → ExpoWidgetsTarget). Discover
      // any widget-extension entitlements on disk instead of hardcoding, so a
      // future rename doesn't silently drop the app group.
      let patchedWidget = false;
      for (const entry of fs.readdirSync(iosRoot, { withFileTypes: true })) {
        if (!(entry.isDirectory() && /widget/i.test(entry.name))) {
          continue;
        }
        const dir = path.join(iosRoot, entry.name);
        for (const file of fs.readdirSync(dir)) {
          if (file.endsWith(".entitlements")) {
            patchEntitlementsFile(path.join(dir, file));
            patchedWidget = true;
          }
        }
      }
      if (!patchedWidget) {
        console.warn(
          "[with-app-groups] no widget extension entitlements found to patch"
        );
      }
      return cfg;
    },
  });
};
