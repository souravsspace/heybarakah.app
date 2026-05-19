import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, Text, View } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/theme-context";

interface DetailSheetProps {
  ctaLabel: string;
  description: string;
  headerLabel?: string;
  icon: string;
  onClose: () => void;
  quote?: { text: string; source: string };
  title: string;
  unlocked: boolean;
  unlockedAt: number | null;
  visible: boolean;
}

function formatUnlockedDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function AchievementDetailSheet({
  visible,
  onClose,
  headerLabel,
  title,
  description,
  icon,
  unlocked,
  unlockedAt,
  quote,
  ctaLabel,
}: DetailSheetProps) {
  const { colors, scheme } = useTheme();
  const insets = useSafeAreaInsets();
  const paper = scheme === "dark" ? "#141414" : "#FAF7F0";
  const dim = scheme === "dark" ? "rgba(0,0,0,0.62)" : "rgba(14,19,17,0.32)";
  const ringColor = unlocked ? colors.primary : colors.border;
  const iconColor = unlocked ? colors.primary : colors.inkSubtle;

  return (
    <Modal
      animationType="none"
      hardwareAccelerated
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <Pressable
        accessibilityLabel="Close"
        accessibilityRole="button"
        onPress={onClose}
        style={{ flex: 1, backgroundColor: dim }}
      >
        <Animated.View
          entering={FadeIn.duration(180)}
          exiting={FadeOut.duration(160)}
          style={{ flex: 1 }}
        />
      </Pressable>
      <Animated.View
        entering={SlideInDown.springify().damping(22).mass(0.8)}
        exiting={SlideOutDown.duration(220)}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: paper,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          paddingHorizontal: 24,
          paddingTop: 18,
          paddingBottom: insets.bottom + 24,
          gap: 18,
        }}
      >
        <View style={{ alignItems: "center", gap: 6 }}>
          <View
            style={{
              width: 36,
              height: 4,
              borderRadius: 2,
              backgroundColor: colors.divider,
            }}
          />
        </View>
        {headerLabel ? (
          <Text
            style={{
              fontSize: 10,
              fontWeight: "700",
              letterSpacing: 1.4,
              textTransform: "uppercase",
              color: colors.primary,
              textAlign: "center",
            }}
          >
            {headerLabel}
          </Text>
        ) : null}
        <View style={{ alignItems: "center", gap: 14 }}>
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              borderWidth: 1.5,
              borderColor: ringColor,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons
              color={iconColor}
              // biome-ignore lint/suspicious/noExplicitAny: dynamic Ionicons name
              name={icon as any}
              size={32}
            />
          </View>
          <Text
            style={{
              fontFamily: "LibreBaskerville-Bold",
              fontSize: 26,
              lineHeight: 32,
              color: colors.ink,
              textAlign: "center",
            }}
          >
            {title}
          </Text>
          <Text
            style={{
              fontSize: 14,
              lineHeight: 21,
              color: colors.inkMuted,
              textAlign: "center",
              maxWidth: 320,
            }}
          >
            {description}
          </Text>
          {unlocked && unlockedAt ? (
            <Text
              style={{
                fontSize: 11,
                fontWeight: "600",
                letterSpacing: 0.4,
                color: colors.inkSubtle,
                fontVariant: ["tabular-nums"],
              }}
            >
              Unlocked {formatUnlockedDate(unlockedAt)}
            </Text>
          ) : null}
        </View>
        {quote ? (
          <View
            style={{
              borderLeftWidth: 2,
              borderLeftColor: colors.primary,
              paddingLeft: 14,
              gap: 6,
            }}
          >
            <Text
              style={{
                fontFamily: "LibreBaskerville-Bold",
                fontSize: 14,
                lineHeight: 21,
                color: colors.ink,
              }}
            >
              {`"${quote.text}"`}
            </Text>
            <Text
              style={{
                fontSize: 11,
                fontWeight: "700",
                letterSpacing: 0.6,
                color: colors.inkSubtle,
              }}
            >
              {quote.source}
            </Text>
          </View>
        ) : null}
        <Pressable
          accessibilityLabel={ctaLabel}
          accessibilityRole="button"
          onPress={onClose}
          style={({ pressed }) => ({
            paddingVertical: 14,
            borderRadius: 999,
            alignItems: "center",
            backgroundColor: pressed ? colors.primaryDark : colors.primary,
          })}
        >
          <Text
            style={{
              color: "#FFFFFF",
              fontSize: 13,
              fontWeight: "700",
              letterSpacing: 0.8,
              textTransform: "uppercase",
            }}
          >
            {ctaLabel}
          </Text>
        </Pressable>
      </Animated.View>
    </Modal>
  );
}
