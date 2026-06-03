import { Asset } from "expo-asset";
import { File, Paths } from "expo-file-system";
import { Platform } from "react-native";

// metro resolves the static asset module id; typed loosely as TS has no
// ambient declaration for `*.png` imports in this package.
const markModule = require("@/assets/images/barakah-mark-cream.png") as number;

const WIDGET_APP_GROUP = "group.com.souravsspace.Barakah.expowidgets";
const ICON_FILENAME = "barakah-mark-cream.png";

let cachedUri: string | null = null;

/**
 * Copies the cream Barakah mark into the widget extension's shared app-group
 * container and returns its `file://` uri. The Live Activity is rendered by the
 * widget extension process, which can't read the main app bundle, so the shared
 * container is the only place it can load the mark from via `Image`'s `uiImage`.
 * Returns null when the container is unavailable; callers fall back to the moon.
 */
export async function ensureWidgetIconUri(): Promise<string | null> {
  if (Platform.OS !== "ios") {
    return null;
  }
  if (cachedUri) {
    return cachedUri;
  }
  const container = Paths.appleSharedContainers?.[WIDGET_APP_GROUP];
  if (!container) {
    return null;
  }
  const dest = new File(container, ICON_FILENAME);
  if (!dest.exists) {
    const asset = Asset.fromModule(markModule);
    await asset.downloadAsync();
    if (!asset.localUri) {
      return null;
    }
    new File(asset.localUri).copySync(dest);
  }
  cachedUri = dest.uri;
  return cachedUri;
}
