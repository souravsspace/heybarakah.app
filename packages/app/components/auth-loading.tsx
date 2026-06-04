import { useEffect } from "react";
import { AccessibilityInfo, useColorScheme, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle, Path } from "react-native-svg";
import { BarakahMark } from "@/components/onboarding/illustrations/barakah-mark";

const LOADER_SIZE = 130;
const CENTER = LOADER_SIZE / 2;
const RING_RADIUS = 58;
const ARC_PATH = "M65 7 A58 58 0 0 1 115.23 36";
const LIGHT_MARK = "#29603E";
const DARK_MARK = "#F5EBDB";
const quintEasing =
  "quint" in Easing
    ? (Easing as typeof Easing & { quint: (t: number) => number }).quint
    : Easing.poly(5);

export function AuthLoading() {
  const scheme = useColorScheme();
  const markColor = scheme === "dark" ? DARK_MARK : LIGHT_MARK;
  const markScale = useSharedValue(1);
  const markOpacity = useSharedValue(1);
  const arcRotation = useSharedValue(0);

  useEffect(() => {
    let mounted = true;

    AccessibilityInfo.isReduceMotionEnabled().then((isReduceMotionEnabled) => {
      if (!(mounted && !isReduceMotionEnabled)) {
        return;
      }

      markScale.value = withRepeat(
        withSequence(
          withTiming(0.965, {
            duration: 1700,
            easing: Easing.out(quintEasing),
          }),
          withTiming(1, {
            duration: 1700,
            easing: Easing.out(quintEasing),
          })
        ),
        -1,
        false
      );
      markOpacity.value = withRepeat(
        withSequence(
          withTiming(0.85, {
            duration: 1700,
            easing: Easing.out(quintEasing),
          }),
          withTiming(1, {
            duration: 1700,
            easing: Easing.out(quintEasing),
          })
        ),
        -1,
        false
      );
      arcRotation.value = withRepeat(
        withTiming(360, {
          duration: 2400,
          easing: Easing.linear,
        }),
        -1,
        false
      );
    });

    return () => {
      mounted = false;
      markScale.value = 1;
      markOpacity.value = 1;
      arcRotation.value = 0;
    };
  }, [arcRotation, markOpacity, markScale]);

  const markStyle = useAnimatedStyle(() => ({
    opacity: markOpacity.value,
    transform: [{ scale: markScale.value }],
  }));

  const arcStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${arcRotation.value}deg` }],
  }));

  return (
    <View
      accessibilityLabel="Loading"
      accessibilityRole="progressbar"
      className="flex-1 items-center justify-center bg-surface"
    >
      <View
        style={{
          alignItems: "center",
          height: LOADER_SIZE,
          justifyContent: "center",
          width: LOADER_SIZE,
        }}
      >
        <Svg
          height={LOADER_SIZE}
          style={{ position: "absolute" }}
          width={LOADER_SIZE}
        >
          <Circle
            cx={CENTER}
            cy={CENTER}
            fill="none"
            r={RING_RADIUS}
            stroke={markColor}
            strokeOpacity={0.18}
            strokeWidth={1.5}
          />
        </Svg>
        <Animated.View
          style={[
            {
              height: LOADER_SIZE,
              position: "absolute",
              width: LOADER_SIZE,
            },
            arcStyle,
          ]}
        >
          <Svg height={LOADER_SIZE} width={LOADER_SIZE}>
            <Path
              d={ARC_PATH}
              fill="none"
              stroke={markColor}
              strokeLinecap="round"
              strokeWidth={1.5}
            />
          </Svg>
        </Animated.View>
        <Animated.View style={markStyle}>
          <BarakahMark color={markColor} size={60} />
        </Animated.View>
      </View>
    </View>
  );
}
