import type { AchievementIcon } from "@barakah/core/achievements";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Modal, Pressable, Text, View } from "react-native";
import Animated, { Easing, FadeIn, FadeOut } from "react-native-reanimated";
import { useTheme } from "@/contexts/theme-context";

interface DialogProps {
  ctaLabel: string;
  description: string;
  eyebrow?: string;
  icon: AchievementIcon;
  onClose: () => void;
  quote?: { source: string; text: string };
  title: string;
  unlocked: boolean;
  unlockedAt: number | null;
  visible: boolean;
}

function formatUnlockedDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    weekday: "long",
  });
}

const DIALOG_ENTER_DURATION = 220;
const DIALOG_EXIT_DURATION = 140;

export function AchievementDialog({
  ctaLabel,
  description,
  eyebrow,
  icon,
  onClose,
  quote,
  title,
  unlocked,
  unlockedAt,
  visible,
}: DialogProps) {
  const { colors, scheme } = useTheme();
  const isDark = scheme === "dark";
  const paper = isDark ? "#141414" : "#FAF7F0";
  const cardBorder = isDark ? colors.border : "rgba(41,96,62,0.16)";
  const blurTint = isDark ? "dark" : "light";
  const dimColor = isDark ? "rgba(0,0,0,0.5)" : "rgba(14,19,17,0.35)";
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
      <View style={{ flex: 1 }}>
        <Animated.View
          entering={FadeIn.duration(DIALOG_ENTER_DURATION)}
          exiting={FadeOut.duration(DIALOG_EXIT_DURATION)}
          style={{
            ...StyleSheetAbsoluteFill,
            backgroundColor: dimColor,
          }}
        >
          <BlurView
            intensity={24}
            style={StyleSheetAbsoluteFill}
            tint={blurTint}
          />
          <Pressable
            accessibilityLabel="Close"
            accessibilityRole="button"
            onPress={onClose}
            style={StyleSheetAbsoluteFill}
          />
        </Animated.View>

        <View
          pointerEvents="box-none"
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 24,
          }}
        >
          <Animated.View
            accessibilityViewIsModal
            entering={FadeIn.duration(DIALOG_ENTER_DURATION).easing(
              Easing.out(Easing.cubic)
            )}
            exiting={FadeOut.duration(DIALOG_EXIT_DURATION)}
            style={{
              width: "100%",
              maxWidth: 360,
              backgroundColor: paper,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: cardBorder,
              paddingHorizontal: 24,
              paddingTop: 18,
              paddingBottom: 20,
              gap: 16,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "700",
                  letterSpacing: 1.4,
                  textTransform: "uppercase",
                  color: unlocked ? colors.primary : colors.inkSubtle,
                }}
              >
                {eyebrow ?? "Achievement"}
              </Text>
              <Pressable
                accessibilityLabel="Close"
                accessibilityRole="button"
                hitSlop={12}
                onPress={onClose}
                style={({ pressed }) => ({
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: pressed
                    ? isDark
                      ? "rgba(255,255,255,0.06)"
                      : "rgba(0,0,0,0.04)"
                    : "transparent",
                })}
              >
                <Ionicons color={colors.inkMuted} name="close" size={20} />
              </Pressable>
            </View>

            <View style={{ alignItems: "center", gap: 12 }}>
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  borderWidth: 1.5,
                  borderColor: ringColor,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons color={iconColor} name={icon} size={26} />
              </View>
              <Text
                style={{
                  fontFamily: "LibreBaskerville-Bold",
                  fontSize: 22,
                  lineHeight: 28,
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
                  paddingLeft: 12,
                  gap: 4,
                }}
              >
                <Text
                  style={{
                    fontFamily: "LibreBaskerville-Bold",
                    fontSize: 13,
                    lineHeight: 20,
                    color: colors.ink,
                  }}
                >
                  {`"${quote.text}"`}
                </Text>
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: "700",
                    letterSpacing: 0.6,
                    color: colors.inkSubtle,
                    textTransform: "uppercase",
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
                paddingVertical: 13,
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
        </View>
      </View>
    </Modal>
  );
}

const StyleSheetAbsoluteFill = {
  position: "absolute" as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
};
