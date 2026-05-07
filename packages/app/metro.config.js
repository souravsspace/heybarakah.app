const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(import.meta.dirname);

module.exports = withNativeWind(config, { input: "./global.css" });
