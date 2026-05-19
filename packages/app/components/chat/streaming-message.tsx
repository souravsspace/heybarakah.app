import { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import type { ThemeColors } from "@/contexts/theme-context";

export function StreamingMessage({
  colors,
  content,
  done,
}: {
  colors: ThemeColors;
  content: string;
  done: boolean;
}) {
  const caretOpacity = useSharedValue(1);

  useEffect(() => {
    if (done) {
      caretOpacity.value = withTiming(0, { duration: 180 });
      return;
    }
    caretOpacity.value = withRepeat(
      withTiming(0.2, { duration: 520, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
  }, [done, caretOpacity]);

  const caretStyle = useAnimatedStyle(() => ({
    opacity: caretOpacity.value,
  }));

  return (
    <View
      style={{
        alignSelf: "flex-start",
        maxWidth: "92%",
        paddingHorizontal: 4,
        paddingVertical: 6,
        marginVertical: 6,
      }}
    >
      <Text
        style={{
          color: colors.ink,
          fontSize: 15,
          lineHeight: 23,
        }}
      >
        {content}
        <Animated.Text
          style={[
            { color: colors.primary, fontSize: 15, lineHeight: 23 },
            caretStyle,
          ]}
        >
          {" ▍"}
        </Animated.Text>
      </Text>
    </View>
  );
}
