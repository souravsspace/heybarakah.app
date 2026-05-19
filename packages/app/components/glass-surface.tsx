import { type BlurTint, BlurView } from "expo-blur";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import type { ReactNode } from "react";
import { Platform, StyleSheet, View, type ViewStyle } from "react-native";

const LIQUID_GLASS = isLiquidGlassAvailable();

export function GlassSurface({
  height,
  radius,
  borderColor,
  style,
  blurTint,
  fallbackBg,
  colorScheme,
  children,
}: {
  height: number;
  radius: number;
  borderColor: string;
  style?: ViewStyle;
  blurTint?: BlurTint;
  fallbackBg?: string;
  colorScheme?: "auto" | "light" | "dark";
  children?: ReactNode;
}) {
  const dark =
    colorScheme === "dark" ||
    blurTint === "systemUltraThinMaterialDark" ||
    blurTint === "dark";
  const resolvedBlurTint: BlurTint =
    blurTint ?? (dark ? "systemUltraThinMaterialDark" : "systemThinMaterial");
  const resolvedFallbackBg =
    fallbackBg ?? (dark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.55)");

  return (
    <View
      style={[
        {
          height,
          borderRadius: radius,
          borderWidth: 1,
          borderColor,
          overflow: "hidden",
          backgroundColor: LIQUID_GLASS ? "transparent" : resolvedFallbackBg,
        },
        style,
      ]}
    >
      {LIQUID_GLASS ? (
        <GlassView
          colorScheme={colorScheme ?? "auto"}
          glassEffectStyle="regular"
          pointerEvents="none"
          style={[StyleSheet.absoluteFillObject, { borderRadius: radius }]}
        />
      ) : (
        <BlurView
          experimentalBlurMethod="dimezisBlurView"
          intensity={Platform.OS === "ios" ? 60 : 40}
          pointerEvents="none"
          style={StyleSheet.absoluteFillObject}
          tint={resolvedBlurTint}
        />
      )}
      <View style={StyleSheet.absoluteFillObject}>{children}</View>
    </View>
  );
}
