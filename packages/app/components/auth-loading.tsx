import { useEffect } from "react";
import {
  AccessibilityInfo,
  StyleSheet,
  useColorScheme,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import { SplashMesh } from "@/components/meshes";
import {
  BARAKAH_GLYPH_PATHS,
  BARAKAH_GLYPH_VIEWBOX,
} from "@/components/onboarding/illustrations/barakah-mark";

const STROKE_LIGHT = "#29603E";
const STROKE_DARK = "#F5EBDB";
const GLYPH_HEIGHT = 150;
const GLYPH_WIDTH =
  GLYPH_HEIGHT * (BARAKAH_GLYPH_VIEWBOX.width / BARAKAH_GLYPH_VIEWBOX.height);
const UNDERLINE_WIDTH = 84;
const BREATH_MS = 1500;

// Resting frame of the boot splash, looped as the app-wide loading state: the
// SplashMesh halo, the calligraphic brand glyph drawn in strokes, and a hairline
// underline, with a calm breath. Reused everywhere AuthLoading is rendered.
export function AuthLoading() {
  const isDark = useColorScheme() === "dark";
  const stroke = isDark ? STROKE_DARK : STROKE_LIGHT;
  const breath = useSharedValue(1);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
      if (!(mounted && !reduceMotion)) {
        return;
      }
      breath.value = withRepeat(
        withSequence(
          withTiming(0.62, {
            duration: BREATH_MS,
            easing: Easing.out(Easing.quad),
          }),
          withTiming(1, {
            duration: BREATH_MS,
            easing: Easing.out(Easing.quad),
          })
        ),
        -1,
        false
      );
    });
    return () => {
      mounted = false;
      breath.value = 1;
    };
  }, [breath]);

  const breathStyle = useAnimatedStyle(() => ({
    opacity: breath.value,
    transform: [{ scale: 0.985 + breath.value * 0.015 }],
  }));

  return (
    <View
      accessibilityLabel="Loading"
      accessibilityRole="progressbar"
      style={styles.fill}
    >
      <View style={StyleSheet.absoluteFill}>
        <SplashMesh dark={isDark} />
      </View>
      <View style={styles.center}>
        <Animated.View style={[styles.stack, breathStyle]}>
          <Svg
            fill="none"
            height={GLYPH_HEIGHT}
            viewBox={`0 0 ${BARAKAH_GLYPH_VIEWBOX.width} ${BARAKAH_GLYPH_VIEWBOX.height}`}
            width={GLYPH_WIDTH}
          >
            {BARAKAH_GLYPH_PATHS.map((d) => (
              <Path
                d={d}
                key={d}
                stroke={stroke}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={4}
              />
            ))}
          </Svg>
          <View
            style={[
              styles.underline,
              { backgroundColor: stroke, width: UNDERLINE_WIDTH },
            ]}
          />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  stack: { alignItems: "center", justifyContent: "center" },
  underline: { height: 1, marginTop: 22, borderRadius: 1 },
});
