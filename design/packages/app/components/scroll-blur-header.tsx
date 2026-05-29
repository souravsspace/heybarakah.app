import { BlurView } from "expo-blur";
import Animated, {
  interpolate,
  type SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/theme-context";

const STRIPS = 8;
const STRIP_INTENSITY = 18;

export function ScrollBlurHeader({
  scrollY,
}: {
  scrollY: SharedValue<number>;
}) {
  const insets = useSafeAreaInsets();
  const { scheme } = useTheme();
  const height = insets.top * 0.7;
  const tint = scheme === "dark" ? "dark" : "light";
  const containerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, 24], [0, 1], "clamp"),
  }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height,
          zIndex: 10,
        },
        containerStyle,
      ]}
    >
      {Array.from({ length: STRIPS }).map((_, i) => (
        <BlurView
          intensity={STRIP_INTENSITY}
          // biome-ignore lint/suspicious/noArrayIndexKey: static count
          key={i}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: (height * (STRIPS - i)) / STRIPS,
          }}
          tint={tint}
        />
      ))}
    </Animated.View>
  );
}
