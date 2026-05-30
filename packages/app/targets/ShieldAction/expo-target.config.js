/** @type {import('@bacons/apple-targets/app.plugin').ConfigFunction} */
module.exports = (config) => {
  const groups =
    config.ios?.entitlements?.["com.apple.security.application-groups"] ?? [];
  // Pick the shield group by identity, not array position — order in app.json
  // entitlements must not silently route extensions to the wrong App Group.
  const appGroup =
    groups.find((g) => g.includes(".shield")) ?? "group.expo.app-blocker";

  return {
    type: "shield-action",
    name: "ShieldAction",
    deploymentTarget: "16.0",
    bundleIdentifier: ".ShieldAction",
    frameworks: ["ManagedSettings", "ManagedSettingsUI"],
    entitlements: {
      "com.apple.developer.family-controls": true,
      "com.apple.security.application-groups": [appGroup],
    },
  };
};
