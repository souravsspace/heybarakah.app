import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { useTheme } from "@/contexts/theme-context";
import { hapticSelection } from "@/lib/haptics";

interface OfflineOverlayProps {
  description?: string;
  onRetry?: () => void;
  title?: string;
}

/**
 * Full-cover state for screens that need the network and have no cached data to
 * fall back on (e.g. achievements, avatar). Render it in place of the screen
 * body only when offline AND no cached data exists — never over content that
 * already hydrated from the persisted query cache.
 */
export function OfflineOverlay({
  title = "You're offline",
  description = "Connect to the internet to load this screen.",
  onRetry,
}: OfflineOverlayProps) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        alignItems: "center",
        backgroundColor: colors.bg,
        flex: 1,
        gap: 16,
        justifyContent: "center",
        paddingHorizontal: 32,
      }}
    >
      <View
        style={{
          alignItems: "center",
          borderColor: colors.border,
          borderRadius: 999,
          borderWidth: 1,
          height: 72,
          justifyContent: "center",
          width: 72,
        }}
      >
        <Ionicons
          color={colors.inkMuted}
          name="cloud-offline-outline"
          size={34}
        />
      </View>

      <Text
        className="font-serif"
        style={{
          color: colors.ink,
          fontSize: 24,
          lineHeight: 30,
          textAlign: "center",
        }}
      >
        {title}
      </Text>

      <Text
        className="font-sans"
        style={{
          color: colors.inkMuted,
          fontSize: 15,
          lineHeight: 22,
          maxWidth: 300,
          textAlign: "center",
        }}
      >
        {description}
      </Text>

      {onRetry ? (
        <Pressable
          accessibilityLabel="Try again"
          accessibilityRole="button"
          hitSlop={8}
          onPress={() => {
            hapticSelection();
            onRetry();
          }}
          style={({ pressed }) => ({
            alignItems: "center",
            borderColor: colors.border,
            borderRadius: 14,
            borderWidth: 1,
            justifyContent: "center",
            marginTop: 8,
            minHeight: 48,
            opacity: pressed ? 0.9 : 1,
            paddingHorizontal: 28,
          })}
        >
          <Text
            className="font-sans"
            style={{
              color: colors.ink,
              fontSize: 14,
              fontWeight: "700",
              letterSpacing: 0.2,
            }}
          >
            Try again
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
