/** @type {import('@bacons/apple-targets/app.plugin').ConfigFunction} */
module.exports = (config) => {
  const appGroup =
    config.ios?.entitlements?.["com.apple.security.application-groups"]?.[0] ||
    "group.expo.app-blocker";

  return {
    type: "widget",
    name: "BarakahWidgets",
    bundleIdentifier: ".BarakahWidgets",
    deploymentTarget: "16.2",
    entitlements: {
      "com.apple.security.application-groups": [appGroup],
    },
  };
};
