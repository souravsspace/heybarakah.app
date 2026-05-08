import { getDefaultConfig } from "expo/metro-config.js";
import { withNativeWind } from "nativewind/dist/metro/index.js";

const config = getDefaultConfig(import.meta.dirname);

export default withNativeWind(config, { input: "./global.css" });
