import type {
  AchievementCategory,
  AchievementIcon,
  AchievementQuote,
  AchievementTier,
} from "@barakah/core/achievements";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useEffect } from "react";
import { Dimensions, Modal, Pressable, Text, View } from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle, Path } from "react-native-svg";
import { type ThemeColors, useTheme } from "@/contexts/theme-context";

export type AchievementDialogMode = "locked" | "reveal" | "unlocked";

interface DialogProps {
  category: AchievementCategory;
  categoryStats?: { total: number; unlocked: number };
  description: string;
  icon: AchievementIcon;
  mode: AchievementDialogMode;
  onClose: () => void;
  onNext?: () => void;
  onViewAll?: () => void;
  pageCount?: number;
  pageIndex?: number;
  progress?: { current: number; target: number; unit: string };
  quote?: AchievementQuote;
  tier: AchievementTier;
  title: string;
  unlockedAt: number | null;
  visible: boolean;
}

const ENTER_DURATION = 280;
const EXIT_DURATION = 180;
const DRAG_DISMISS = 120;
const CATEGORY_LABEL: Record<AchievementCategory, string> = {
  beginnings: "Beginnings",
  salah: "Salah",
  continuity: "Continuity",
  fajr: "Fajr",
  night: "Night",
  remembrance: "Remembrance",
  mercy: "Mercy",
  seasons: "Seasons",
  reflection: "Reflection",
};

function formatUnlockedDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    weekday: "long",
    year: "numeric",
  });
}

function tierAccent(tier: AchievementTier, colors: ThemeColors): string {
  if (tier === "gold") {
    return colors.primary;
  }
  if (tier === "silver") {
    return colors.inkMuted;
  }
  return colors.inkSubtle;
}

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

function ProgressBar({
  current,
  target,
  color,
  trackColor,
}: {
  color: string;
  current: number;
  target: number;
  trackColor: string;
}) {
  const pct = Math.max(0, Math.min(1, current / target));
  return (
    <View
      style={{
        height: 3,
        borderRadius: 2,
        backgroundColor: trackColor,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          height: 3,
          width: `${pct * 100}%`,
          backgroundColor: color,
        }}
      />
    </View>
  );
}

export function AchievementDialog({
  category,
  categoryStats,
  description,
  icon,
  mode,
  onClose,
  onNext,
  onViewAll,
  pageCount = 1,
  pageIndex = 0,
  progress,
  quote,
  tier,
  title,
  unlockedAt,
  visible,
}: DialogProps) {
  const { colors, scheme } = useTheme();
  const isDark = scheme === "dark";
  const paper = isDark ? "#141414" : "#FAF7F0";
  const cardBorder = isDark ? colors.border : "rgba(41,96,62,0.16)";
  const blurTint = isDark ? "dark" : "light";
  const dimColor = isDark ? "rgba(0,0,0,0.5)" : "rgba(14,19,17,0.35)";

  const unlocked = mode !== "locked";
  const accent = tierAccent(tier, colors);
  const discFill = unlocked && tier === "gold" ? colors.primary : "transparent";
  const discBorder = unlocked ? accent : colors.border;
  const glyphColor = (() => {
    if (!unlocked) {
      return colors.inkSubtle;
    }
    if (tier === "gold") {
      return "#FFFFFF";
    }
    return colors.primary;
  })();

  const eyebrowText = (() => {
    if (mode === "reveal") {
      return `UNLOCKED · ${CATEGORY_LABEL[category].toUpperCase()}`;
    }
    if (mode === "unlocked") {
      return `${tier.toUpperCase()} · ${CATEGORY_LABEL[category].toUpperCase()}`;
    }
    return `LOCKED · ${CATEGORY_LABEL[category].toUpperCase()}`;
  })();

  // Multiple achievements from one action share a single dialog session: the
  // primary CTA advances through them, then closes (marking all seen) on the
  // last page.
  const isPager = mode === "reveal" && pageCount > 1;
  const onLastPage = pageIndex >= pageCount - 1;

  const ctaLabel = (() => {
    if (mode === "reveal") {
      return isPager && !onLastPage ? "NEXT" : "ALHAMDULILLAH";
    }
    if (mode === "locked") {
      return "KEEP GOING";
    }
    return "CLOSE";
  })();

  const onPrimary = () => {
    if (isPager && !onLastPage) {
      onNext?.();
      return;
    }
    handleClose();
  };

  const translateY = useSharedValue(Dimensions.get("window").height);
  const dragY = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, {
        duration: ENTER_DURATION,
        easing: Easing.out(Easing.cubic),
      });
      dragY.value = 0;
    } else {
      translateY.value = Dimensions.get("window").height;
    }
  }, [visible, translateY, dragY]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value + dragY.value }],
  }));

  const handleClose = () => {
    translateY.value = withTiming(
      Dimensions.get("window").height,
      { duration: EXIT_DURATION, easing: Easing.in(Easing.cubic) },
      (finished) => {
        if (finished) {
          runOnJS(onClose)();
        }
      }
    );
  };

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      dragY.value = Math.max(0, e.translationY);
    })
    .onEnd((e) => {
      if (e.translationY > DRAG_DISMISS || e.velocityY > 800) {
        dragY.value = withTiming(Dimensions.get("window").height, {
          duration: EXIT_DURATION,
        });
        runOnJS(handleClose)();
      } else {
        dragY.value = withTiming(0, { duration: 180 });
      }
    });

  return (
    <Modal
      animationType="none"
      hardwareAccelerated
      onRequestClose={handleClose}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          <Animated.View
            entering={FadeIn.duration(ENTER_DURATION)}
            exiting={FadeOut.duration(EXIT_DURATION)}
            style={{
              ...absoluteFill,
              backgroundColor: dimColor,
            }}
          >
            <BlurView
              intensity={mode === "reveal" ? 32 : 22}
              style={absoluteFill}
              tint={blurTint}
            />
            <Pressable
              accessibilityLabel="Close"
              accessibilityRole="button"
              onPress={handleClose}
              style={absoluteFill}
            />
          </Animated.View>

          <View
            pointerEvents="box-none"
            style={{
              flex: 1,
              justifyContent: "flex-end",
            }}
          >
            <Animated.View
              accessibilityViewIsModal
              style={[
                {
                  backgroundColor: paper,
                  borderTopLeftRadius: 28,
                  borderTopRightRadius: 28,
                  borderTopWidth: 1,
                  borderLeftWidth: 1,
                  borderRightWidth: 1,
                  borderColor: cardBorder,
                  paddingHorizontal: 24,
                  paddingTop: 10,
                  paddingBottom: 28,
                  gap: 16,
                },
                sheetStyle,
              ]}
            >
              <GestureDetector gesture={panGesture}>
                <View
                  style={{
                    paddingVertical: 8,
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: colors.divider,
                    }}
                  />
                </View>
              </GestureDetector>

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
                    color: unlocked ? colors.primary : colors.inkSubtle,
                  }}
                >
                  {eyebrowText}
                </Text>
                <Pressable
                  accessibilityLabel="Close"
                  accessibilityRole="button"
                  hitSlop={12}
                  onPress={handleClose}
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

              {unlocked ? (
                <View style={{ alignItems: "center" }}>
                  <Arabesque color={colors.primary} />
                </View>
              ) : (
                <View
                  style={{
                    height: 1,
                    width: 80,
                    alignSelf: "center",
                    backgroundColor: colors.divider,
                  }}
                />
              )}

              <Animated.View
                entering={FadeIn.duration(220)}
                key={`${pageIndex}-${title}`}
                style={{ alignItems: "center", gap: 14 }}
              >
                <View
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    borderWidth: 1.5,
                    borderColor: discBorder,
                    backgroundColor: discFill,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons color={glyphColor} name={icon} size={36} />
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
                    lineHeight: 22,
                    color: colors.inkMuted,
                    textAlign: "center",
                    maxWidth: 320,
                  }}
                >
                  {description}
                </Text>
              </Animated.View>

              {isPager ? (
                <View
                  style={{
                    flexDirection: "row",
                    alignSelf: "center",
                    gap: 6,
                  }}
                >
                  {Array.from({ length: pageCount }).map((_, i) => (
                    <View
                      key={i}
                      style={{
                        width: i === pageIndex ? 18 : 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor:
                          i === pageIndex ? colors.primary : colors.divider,
                      }}
                    />
                  ))}
                </View>
              ) : null}

              {mode === "locked" && progress ? (
                <View style={{ gap: 8, paddingHorizontal: 8 }}>
                  <Text
                    style={{
                      fontSize: 9,
                      fontWeight: "700",
                      letterSpacing: 1.2,
                      color: colors.inkSubtle,
                      textAlign: "center",
                    }}
                  >
                    PROGRESS
                  </Text>
                  <ProgressBar
                    color={colors.primary}
                    current={progress.current}
                    target={progress.target}
                    trackColor={colors.divider}
                  />
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: "600",
                      color: colors.inkMuted,
                      textAlign: "center",
                      fontVariant: ["tabular-nums"],
                    }}
                  >
                    {`${progress.current} of ${progress.target} · ${progress.unit}`}
                  </Text>
                </View>
              ) : null}

              {unlocked && unlockedAt ? (
                <View style={{ gap: 6, alignItems: "center" }}>
                  <View
                    style={{
                      height: 1,
                      width: 40,
                      backgroundColor: colors.divider,
                    }}
                  />
                  <Text
                    style={{
                      fontSize: 9,
                      fontWeight: "700",
                      letterSpacing: 1.2,
                      color: colors.inkSubtle,
                    }}
                  >
                    UNLOCKED
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      lineHeight: 18,
                      color: colors.inkSubtle,
                      fontVariant: ["tabular-nums"],
                    }}
                  >
                    {formatUnlockedDate(unlockedAt)}
                  </Text>
                </View>
              ) : null}

              {unlocked && quote ? (
                <View
                  style={{
                    paddingHorizontal: 12,
                    paddingTop: 4,
                    gap: 6,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "LibreBaskerville-Bold",
                      fontSize: 13,
                      lineHeight: 22,
                      color: colors.ink,
                      textAlign: "center",
                      fontStyle: "italic",
                    }}
                  >
                    {`"${quote.text}"`}
                  </Text>
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: "700",
                      letterSpacing: 0.8,
                      color: colors.inkSubtle,
                      textTransform: "uppercase",
                    }}
                  >
                    {quote.source}
                  </Text>
                </View>
              ) : null}

              {categoryStats ? (
                <Text
                  style={{
                    fontSize: 11,
                    color: colors.inkSubtle,
                    textAlign: "center",
                    fontVariant: ["tabular-nums"],
                  }}
                >
                  {`${categoryStats.unlocked} of ${categoryStats.total} ${CATEGORY_LABEL[category].toLowerCase()} achievements`}
                </Text>
              ) : null}

              <View style={{ gap: 10, paddingTop: 4 }}>
                <Pressable
                  accessibilityLabel={ctaLabel}
                  accessibilityRole="button"
                  onPress={onPrimary}
                  style={({ pressed }) => ({
                    paddingVertical: 14,
                    borderRadius: 999,
                    alignItems: "center",
                    backgroundColor: pressed
                      ? colors.primaryDark
                      : colors.primary,
                  })}
                >
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontSize: 13,
                      fontWeight: "700",
                      letterSpacing: 0.8,
                    }}
                  >
                    {ctaLabel}
                  </Text>
                </Pressable>
                {mode === "reveal" && onViewAll ? (
                  <Pressable
                    accessibilityLabel="View all achievements"
                    accessibilityRole="button"
                    hitSlop={8}
                    onPress={() => {
                      onViewAll();
                      handleClose();
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "600",
                        color: colors.inkMuted,
                        textAlign: "center",
                      }}
                    >
                      View all achievements
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            </Animated.View>
          </View>
        </View>
      </GestureHandlerRootView>
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
