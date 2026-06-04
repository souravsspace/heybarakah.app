import { Modal, Pressable, Text, View } from "react-native";
import Animated, { Easing, FadeIn, FadeInDown } from "react-native-reanimated";
import Svg, { Circle, Path } from "react-native-svg";
import { useTheme } from "@/contexts/theme-context";

interface ForceUpdateModalProps {
  currentVersion: string;
  onUpdate: () => void;
  visible: boolean;
}

const ENTER_DURATION = 280;

function Arabesque({ color }: { color: string }) {
  return (
    <Svg fill="none" height={18} viewBox="0 0 120 18" width={120}>
      <Path
        d="M2 9 L40 9"
        stroke={color}
        strokeLinecap="round"
        strokeOpacity={0.5}
        strokeWidth={1}
      />
      <Path
        d="M80 9 L118 9"
        stroke={color}
        strokeLinecap="round"
        strokeOpacity={0.5}
        strokeWidth={1}
      />
      <Path
        d="M44 9 Q50 2 56 9 Q60 14 64 9 Q70 2 76 9"
        stroke={color}
        strokeLinecap="round"
        strokeWidth={1.2}
      />
      <Circle cx={60} cy={9} fill={color} r={1.4} />
    </Svg>
  );
}

export function ForceUpdateModal({
  visible,
  currentVersion,
  onUpdate,
}: ForceUpdateModalProps) {
  const { colors, scheme } = useTheme();

  if (!visible) {
    return null;
  }

  const cardBackground = scheme === "dark" ? "#141414" : "#FFFFFF";

  return (
    <Modal
      animationType="none"
      hardwareAccelerated
      onRequestClose={() => {
        // forced update — swallow Android hardware back, no dismiss
      }}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 24,
        }}
      >
        <Animated.View
          entering={FadeIn.duration(ENTER_DURATION).easing(
            Easing.out(Easing.cubic)
          )}
          style={{
            ...absoluteFill,
            backgroundColor: "rgba(0,0,0,0.6)",
          }}
        />

        <Animated.View
          accessibilityViewIsModal
          entering={FadeInDown.duration(ENTER_DURATION).easing(
            Easing.out(Easing.cubic)
          )}
          style={{
            width: "100%",
            maxWidth: 380,
            borderRadius: 24,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: cardBackground,
            paddingHorizontal: 24,
            paddingVertical: 28,
            gap: 18,
          }}
        >
          <View style={{ alignItems: "center" }}>
            <Arabesque color={colors.primary} />
          </View>

          <View style={{ alignItems: "center", gap: 12 }}>
            <Text
              style={{
                fontFamily: "LibreBaskerville-Bold",
                fontSize: 26,
                lineHeight: 32,
                color: colors.ink,
                textAlign: "center",
              }}
            >
              Update required
            </Text>
            <Text
              style={{
                fontFamily: "Inter",
                fontSize: 14,
                lineHeight: 22,
                color: colors.inkMuted,
                textAlign: "center",
                maxWidth: 300,
              }}
            >
              A new version of Barakah is available. Please update to continue
              using the app.
            </Text>
          </View>

          <Text
            style={{
              fontFamily: "Inter",
              fontSize: 12,
              lineHeight: 18,
              color: colors.inkSubtle,
              textAlign: "center",
              fontVariant: ["tabular-nums"],
            }}
          >
            {`You're on version ${currentVersion}`}
          </Text>

          <Pressable
            accessibilityLabel="Update now"
            accessibilityRole="button"
            onPress={onUpdate}
            style={({ pressed }) => ({
              width: "100%",
              alignItems: "center",
              borderRadius: 999,
              backgroundColor: colors.primary,
              opacity: pressed ? 0.88 : 1,
              paddingVertical: 15,
            })}
          >
            <Text
              style={{
                fontFamily: "Inter",
                fontSize: 13,
                fontWeight: "700",
                letterSpacing: 0.8,
                color: "#FFFFFF",
              }}
            >
              UPDATE NOW
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const absoluteFill = {
  position: "absolute" as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
};
