"use strict";
// Resolve from the app's node_modules, not the package's
const resolve = (mod) => {
  try {
    return require(mod);
  } catch {}
  try {
    return require(require.resolve(mod, { paths: [process.cwd()] }));
  } catch {}
  throw new Error(
    `Cannot find module '${mod}'. Make sure 'expo' is installed.`
  );
};
const {
  withAndroidManifest,
  withEntitlementsPlist,
  withInfoPlist,
  withDangerousMod,
  createRunOncePlugin,
} = resolve("expo/config-plugins");
const fs = require("node:fs");
const path = require("node:path");
const {
  applySwiftReplacements,
  buildSwiftReplacements,
} = require("./swift-substitutions");

// ──────────────────────────────────────────────────────────────────────────────
// Privacy manifest helper
// ──────────────────────────────────────────────────────────────────────────────

// Merges expo-app-blocker's required UserDefaults entry into config.ios.privacyManifests
// so Expo's built-in withPrivacyInfo plugin writes it to PrivacyInfo.xcprivacy on prebuild.
// Required for App Store submission: the blocker uses UserDefaults extensively for
// AppGroup state sharing between the main app and Shield/DeviceActivityMonitor extensions.
function mergeBlockerPrivacyManifest(config) {
  const ios = config.ios ?? {};
  const privacyManifests = ios.privacyManifests ?? {};
  const apiTypes = [...(privacyManifests.NSPrivacyAccessedAPITypes ?? [])];
  const TYPE = "NSPrivacyAccessedAPICategoryUserDefaults";
  const REASON = "CA92.1";
  const existing = apiTypes.find((t) => t.NSPrivacyAccessedAPIType === TYPE);
  if (!existing) {
    apiTypes.push({
      NSPrivacyAccessedAPIType: TYPE,
      NSPrivacyAccessedAPITypeReasons: [REASON],
    });
  } else if (!existing.NSPrivacyAccessedAPITypeReasons.includes(REASON)) {
    existing.NSPrivacyAccessedAPITypeReasons = [
      ...existing.NSPrivacyAccessedAPITypeReasons,
      REASON,
    ];
  }
  return {
    ...config,
    ios: {
      ...ios,
      privacyManifests: {
        ...privacyManifests,
        NSPrivacyAccessedAPITypes: apiTypes,
      },
    },
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// Android
// ──────────────────────────────────────────────────────────────────────────────

function getAndroidScheme(config, pluginConfig) {
  if (pluginConfig?.android?.scheme) {
    return pluginConfig.android.scheme;
  }
  const configScheme = Array.isArray(config.scheme)
    ? config.scheme[0]
    : config.scheme;
  if (configScheme) {
    return configScheme;
  }
  const pkg = config.android?.package;
  if (pkg) {
    return pkg.replace(/\./g, "-");
  }
  return null;
}

function withAppBlockerAndroid(config, pluginConfig) {
  const scheme = getAndroidScheme(config, pluginConfig);

  // Manifest: permissions, service, receiver, and deep-link intent filter
  config = withAndroidManifest(config, (config) => {
    const manifest = config.modResults;
    const mainApplication = manifest.manifest.application?.[0];
    if (!mainApplication) {
      return config;
    }

    if (!manifest.manifest["uses-permission"]) {
      manifest.manifest["uses-permission"] = [];
    }
    const permissions = manifest.manifest["uses-permission"];

    const requiredPermissions = [
      "android.permission.SYSTEM_ALERT_WINDOW",
      "android.permission.FOREGROUND_SERVICE",
      "android.permission.FOREGROUND_SERVICE_SPECIAL_USE",
      "android.permission.RECEIVE_BOOT_COMPLETED",
      "android.permission.POST_NOTIFICATIONS",
    ];

    // PACKAGE_USAGE_STATS needs tools:ignore
    if (
      !permissions.some(
        (p) =>
          p.$?.["android:name"] === "android.permission.PACKAGE_USAGE_STATS"
      )
    ) {
      permissions.push({
        $: {
          "android:name": "android.permission.PACKAGE_USAGE_STATS",
          "tools:ignore": "ProtectedPermissions",
        },
      });
    }

    for (const perm of requiredPermissions) {
      if (!permissions.some((p) => p.$?.["android:name"] === perm)) {
        permissions.push({ $: { "android:name": perm } });
      }
    }

    if (!manifest.manifest.$) {
      manifest.manifest.$ = {};
    }
    manifest.manifest.$["xmlns:tools"] = "http://schemas.android.com/tools";

    // Add AppBlockerService
    if (!mainApplication.service) {
      mainApplication.service = [];
    }
    if (
      !mainApplication.service.some(
        (s) =>
          s.$?.["android:name"] === "expo.modules.appblocker.AppBlockerService"
      )
    ) {
      mainApplication.service.push({
        $: {
          "android:name": "expo.modules.appblocker.AppBlockerService",
          "android:enabled": "true",
          "android:exported": "false",
          "android:foregroundServiceType": "specialUse",
        },
      });
    }

    // Add BootReceiver
    if (!mainApplication.receiver) {
      mainApplication.receiver = [];
    }
    if (
      !mainApplication.receiver.some(
        (r) => r.$?.["android:name"] === "expo.modules.appblocker.BootReceiver"
      )
    ) {
      mainApplication.receiver.push({
        $: {
          "android:name": "expo.modules.appblocker.BootReceiver",
          "android:enabled": "true",
          "android:exported": "true",
        },
        "intent-filter": [
          {
            action: [
              { $: { "android:name": "android.intent.action.BOOT_COMPLETED" } },
            ],
          },
        ],
      });
    }

    // Add deep-link intent filter to MainActivity so notification taps route back to the app
    if (scheme) {
      const activities = mainApplication.activity || [];
      const mainActivity = activities.find(
        (a) =>
          a.$?.["android:name"] === ".MainActivity" ||
          a.$?.["android:name"]?.endsWith(".MainActivity")
      );
      if (mainActivity) {
        if (!mainActivity["intent-filter"]) {
          mainActivity["intent-filter"] = [];
        }
        const alreadyHasScheme = mainActivity["intent-filter"].some((f) =>
          (f.data || []).some((d) => d.$?.["android:scheme"] === scheme)
        );
        if (!alreadyHasScheme) {
          mainActivity["intent-filter"].push({
            action: [{ $: { "android:name": "android.intent.action.VIEW" } }],
            category: [
              { $: { "android:name": "android.intent.category.DEFAULT" } },
              { $: { "android:name": "android.intent.category.BROWSABLE" } },
            ],
            data: [{ $: { "android:scheme": scheme } }],
          });
        }
      }
    }

    return config;
  });

  // Write scheme to strings.xml so AppBlockerService can read it at runtime
  if (scheme) {
    config = withDangerousMod(config, [
      "android",
      (config) => {
        const platformRoot = config.modRequest.platformProjectRoot;
        const valuesDir = path.join(
          platformRoot,
          "app",
          "src",
          "main",
          "res",
          "values"
        );
        const stringsPath = path.join(valuesDir, "strings.xml");

        if (!fs.existsSync(valuesDir)) {
          fs.mkdirSync(valuesDir, { recursive: true });
        }

        let xml = fs.existsSync(stringsPath)
          ? fs.readFileSync(stringsPath, "utf-8")
          : '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n</resources>';

        const tag = `<string name="expo_app_blocker_scheme">${scheme}</string>`;
        if (xml.includes('name="expo_app_blocker_scheme"')) {
          xml = xml.replace(
            /<string name="expo_app_blocker_scheme">.*?<\/string>/,
            tag
          );
        } else {
          xml = xml.replace("</resources>", `    ${tag}\n</resources>`);
        }

        fs.writeFileSync(stringsPath, xml);
        return config;
      },
    ]);
  }

  // Copy the overlay icon (PNG) to `res/drawable/expo_app_blocker_overlay_icon.png`
  // so `OverlayManager.kt` can resolve it via Resources.getIdentifier(...).
  // The icon is rendered above the title in the SYSTEM_ALERT_WINDOW overlay.
  // Path is resolved relative to the project root for consistency with the
  // top-level `icon` config field.
  const overlayIconRel = pluginConfig?.android?.overlay?.icon;
  if (overlayIconRel) {
    config = withDangerousMod(config, [
      "android",
      (config) => {
        const platformRoot = config.modRequest.platformProjectRoot;
        const projectRoot = config.modRequest.projectRoot;
        const drawableDir = path.join(
          platformRoot,
          "app",
          "src",
          "main",
          "res",
          "drawable"
        );
        const iconSrc = path.isAbsolute(overlayIconRel)
          ? overlayIconRel
          : path.join(projectRoot, overlayIconRel);

        if (!fs.existsSync(iconSrc)) {
          throw new Error(
            `[expo-app-blocker] android.overlay.icon points to a missing file: ${iconSrc}`
          );
        }

        if (!fs.existsSync(drawableDir)) {
          fs.mkdirSync(drawableDir, { recursive: true });
        }

        fs.copyFileSync(
          iconSrc,
          path.join(drawableDir, "expo_app_blocker_overlay_icon.png")
        );
        return config;
      },
    ]);
  }

  return config;
}

// ──────────────────────────────────────────────────────────────────────────────
// iOS
// ──────────────────────────────────────────────────────────────────────────────

function withAppBlockerIOS(config, pluginConfig) {
  config = mergeBlockerPrivacyManifest(config);

  const bundleId = config.ios?.bundleIdentifier || "expo.app-blocker";
  const appGroup = pluginConfig?.ios?.appGroup || `group.${bundleId}`;

  config = withEntitlementsPlist(config, (config) => {
    config.modResults["com.apple.developer.family-controls"] = true;
    const groupsKey = "com.apple.security.application-groups";
    const existingGroups = Array.isArray(config.modResults[groupsKey])
      ? config.modResults[groupsKey]
      : [];
    config.modResults[groupsKey] = Array.from(
      new Set([...existingGroups, appGroup])
    );
    return config;
  });

  config = withInfoPlist(config, (config) => {
    const relockId = `${config.ios?.bundleIdentifier || "expo.app-blocker"}.relock`;
    const existingIds = Array.isArray(
      config.modResults.BGTaskSchedulerPermittedIdentifiers
    )
      ? config.modResults.BGTaskSchedulerPermittedIdentifiers
      : [];
    config.modResults.BGTaskSchedulerPermittedIdentifiers = Array.from(
      new Set([...existingIds, relockId])
    );
    config.modResults.ExpoAppBlockerAppGroup = appGroup;
    return config;
  });

  // Populate `targets/` synchronously at config-eval time so the
  // `@bacons/apple-targets` plugin (registered just below) can glob the
  // directory and register the Shield/DeviceActivityMonitor/ShieldConfiguration
  // extensions on the first prebuild. We also run placeholder substitution and
  // copy the shield icon here, not in a later withDangerousMod, so the on-disk
  // state matches the plugin config after every config evaluation — not just
  // during `expo prebuild`. Otherwise non-prebuild config loads (EAS env probe,
  // autolinking, doctor) would re-copy the placeholder templates over the
  // substituted Swift files and leave the tree in a broken state.
  const projectRoot = config._internal?.projectRoot;
  if (projectRoot) {
    const targetsDir = path.join(projectRoot, "targets");
    const packageTargetsDir = path.resolve(__dirname, "..", "..", "targets");

    // 1. Copy template Swift files + expo-target.config.js from this package
    //    into the consumer's `targets/`. Preserves any user-managed assets.
    if (fs.existsSync(packageTargetsDir)) {
      for (const dir of fs.readdirSync(packageTargetsDir)) {
        const srcDir = path.join(packageTargetsDir, dir);
        const destDir = path.join(targetsDir, dir);
        if (!fs.statSync(srcDir).isDirectory()) {
          continue;
        }
        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true });
        }
        for (const file of fs.readdirSync(srcDir)) {
          if (file.endsWith(".swift") || file === "expo-target.config.js") {
            fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
          }
        }
      }
    }

    // 2. Substitute placeholders in the freshly-copied Swift files. The
    //    substitution map is built by the shared `swift-substitutions` module
    //    (unit-tested) so config-eval produces final, build-ready Swift in one
    //    pass.
    const replacements = buildSwiftReplacements(appGroup, pluginConfig);

    if (fs.existsSync(targetsDir)) {
      for (const dir of fs.readdirSync(targetsDir)) {
        const dirPath = path.join(targetsDir, dir);
        if (!fs.statSync(dirPath).isDirectory()) {
          continue;
        }
        for (const file of fs.readdirSync(dirPath)) {
          if (!file.endsWith(".swift")) {
            continue;
          }
          const filePath = path.join(dirPath, file);
          const content = fs.readFileSync(filePath, "utf-8");
          fs.writeFileSync(filePath, applySwiftReplacements(content, replacements));
        }
      }
    }

    // 3. Copy shield icon into ShieldConfiguration + ShieldAction target assets.
    const shieldIcon = pluginConfig?.ios?.shield?.icon;
    if (shieldIcon) {
      const iconSrc = path.isAbsolute(shieldIcon)
        ? shieldIcon
        : path.resolve(projectRoot, shieldIcon);
      if (fs.existsSync(iconSrc)) {
        for (const target of ["ShieldConfiguration", "ShieldAction"]) {
          const assetsDir = path.join(targetsDir, target, "assets");
          if (!fs.existsSync(assetsDir)) {
            fs.mkdirSync(assetsDir, { recursive: true });
          }
          fs.copyFileSync(iconSrc, path.join(assetsDir, "shield-icon.png"));
        }
      }
    }
  }

  // Auto-register `@bacons/apple-targets` so users don't have to add it to
  // their app.json plugins array. Resolved from this package's own
  // node_modules (declared dep), which also makes it work in pnpm/yarn
  // workspaces where transitive plugins aren't hoisted into the app root.
  try {
    const withTargetsDir = resolve("@bacons/apple-targets/app.plugin");
    config = withTargetsDir(config, {});
  } catch (err) {
    throw new Error(
      `[expo-app-blocker] Failed to load '@bacons/apple-targets'. In pnpm or ` +
        "yarn-workspace monorepos, add it as a direct dependency of your app: " +
        `\`pnpm add @bacons/apple-targets\`. Original error: ${err.message}`
    );
  }

  config = withDangerousMod(config, [
    "ios",
    (config) => {
      const platformRoot = config.modRequest.platformProjectRoot;
      const projectName = config.modRequest.projectName;

      // Patch Podfile deployment target (pod itself is auto-linked via expo-module.config.json)
      const podfilePath = path.join(platformRoot, "Podfile");
      if (fs.existsSync(podfilePath)) {
        let podfile = fs.readFileSync(podfilePath, "utf-8");

        podfile = podfile.replace(
          /platform :ios, podfile_properties\['ios\.deploymentTarget'\] \|\| '[\d.]+'/,
          "platform :ios, podfile_properties['ios.deploymentTarget'] || '16.0'"
        );

        fs.writeFileSync(podfilePath, podfile);
      }

      // Patch deployment target in pbxproj
      const pbxprojPath = path.join(
        platformRoot,
        `${projectName}.xcodeproj`,
        "project.pbxproj"
      );
      if (fs.existsSync(pbxprojPath)) {
        let pbxproj = fs.readFileSync(pbxprojPath, "utf-8");
        pbxproj = pbxproj.replace(
          /IPHONEOS_DEPLOYMENT_TARGET = (\d+)\.(\d+);/g,
          (match, major, minor) => {
            const current = Number(major) + Number(minor) / 100;
            return current < 16.0
              ? "IPHONEOS_DEPLOYMENT_TARGET = 16.0;"
              : match;
          }
        );
        fs.writeFileSync(pbxprojPath, pbxproj);
      }

      // Patch AppDelegate with localhost fallback
      const appDelegatePath = path.join(
        platformRoot,
        projectName,
        "AppDelegate.swift"
      );
      if (fs.existsSync(appDelegatePath)) {
        let appDelegate = fs.readFileSync(appDelegatePath, "utf-8");
        const original =
          'return RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: ".expo/.virtual-metro-entry")';
        const replacement = `if let url = RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: ".expo/.virtual-metro-entry") {
      return url
    }
    return URL(string: "http://localhost:8081/.expo/.virtual-metro-entry.bundle?platform=ios&dev=true&lazy=true&minify=false")`;
        if (appDelegate.includes(original)) {
          appDelegate = appDelegate.replace(original, replacement);
          fs.writeFileSync(appDelegatePath, appDelegate);
        }
      }

      // Target Swift files + shield icon are produced at config-eval time
      // (see withAppBlockerIOS). The block below only handles `ios/` patches
      // that depend on the prebuilt platform tree.

      return config;
    },
  ]);

  return config;
}

// ──────────────────────────────────────────────────────────────────────────────
// Combined
// ──────────────────────────────────────────────────────────────────────────────

function withAppBlocker(config, pluginConfig = {}) {
  config = withAppBlockerAndroid(config, pluginConfig);
  config = withAppBlockerIOS(config, pluginConfig);
  return config;
}

module.exports = createRunOncePlugin(
  withAppBlocker,
  "expo-app-blocker",
  "0.1.0"
);
