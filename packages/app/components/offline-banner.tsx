import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useOnline } from "@/lib/use-online";

const INK_GREEN = "#1B3F29";
const CREAM = "#F5EBDB";
const GOLD = "#C9A23A";

/**
 * Slim, non-interactive strip pinned below the status bar while the device is
 * offline. Renders nothing when online. Mounted once in the authed shell so it
 * sits above every screen; `pointerEvents="none"` lets taps fall through to the
 * content underneath.
 */
export function OfflineBanner() {
  const insets = useSafeAreaInsets();
  const isOnline = useOnline();

  if (isOnline) {
    return null;
  }

  return (
    <View
      accessibilityLiveRegion="polite"
      pointerEvents="none"
      style={{
        backgroundColor: INK_GREEN,
        borderBottomColor: GOLD,
        borderBottomWidth: 0.8,
        left: 0,
        paddingBottom: 6,
        paddingTop: insets.top + 4,
        position: "absolute",
        right: 0,
        top: 0,
        zIndex: 1000,
      }}
    >
      <Text
        className="font-sans"
        style={{
          color: CREAM,
          fontSize: 12,
          fontWeight: "600",
          letterSpacing: 0.2,
          textAlign: "center",
        }}
      >
        You're offline — showing saved data
      </Text>
    </View>
  );
}
