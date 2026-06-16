import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, ScrollView, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { ProfileMesh } from "@/components/meshes";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { type ThemeColors, useTheme } from "@/contexts/theme-context";
import { hapticSelection } from "@/lib/haptics";

// Shared shell for the account sub-screens (Subscription, Preferences,
// Calculation method). Mirrors the polished Profile tab: green-dome mesh,
// large serif title, and staggered section entrances — so the settings area
// feels of a piece with the rest of the app.
export function SettingsScreen({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { colors, scheme } = useTheme();

  const goBack = () => {
    hapticSelection();
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/profile" as never);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      <ProfileMesh dark={scheme === "dark"} />
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <View
          style={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 4 }}
        >
          <Pressable
            accessibilityLabel="Go back"
            accessibilityRole="button"
            hitSlop={8}
            onPress={goBack}
            style={({ pressed }) => ({
              width: 38,
              height: 38,
              borderRadius: 19,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: colors.surfaceSoft,
              borderWidth: 1,
              borderColor: colors.border,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <IconSymbol
              color={colors.ink}
              name={"chevron.left" as never}
              size={16}
            />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={{ paddingBottom: 56 }}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            entering={FadeInDown.duration(300)}
            style={{ paddingHorizontal: 20, paddingTop: 10 }}
          >
            <Text
              style={{
                fontFamily: "LibreBaskerville-Bold",
                fontSize: 30,
                lineHeight: 36,
                color: colors.ink,
                letterSpacing: -0.5,
              }}
            >
              {title}
            </Text>
            {subtitle ? (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 9,
                  marginTop: 10,
                }}
              >
                <View
                  style={{
                    width: 6,
                    height: 6,
                    backgroundColor: colors.primary,
                    transform: [{ rotate: "45deg" }],
                  }}
                />
                <Text
                  style={{
                    flex: 1,
                    fontSize: 13,
                    lineHeight: 18,
                    color: colors.inkMuted,
                  }}
                >
                  {subtitle}
                </Text>
              </View>
            ) : null}
          </Animated.View>

          {children}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

export function Section({
  children,
  colors,
  delay = 0,
  title,
}: {
  children: React.ReactNode;
  colors: ThemeColors;
  delay?: number;
  title: string;
}) {
  return (
    <Animated.View
      entering={FadeInDown.duration(300).delay(delay)}
      style={{ marginTop: 26 }}
    >
      <Text
        style={{
          paddingHorizontal: 24,
          fontSize: 11,
          fontWeight: "700",
          letterSpacing: 2,
          color: colors.inkMuted,
          textTransform: "uppercase",
          marginBottom: 10,
        }}
      >
        {title}
      </Text>
      <View style={{ paddingHorizontal: 20 }}>{children}</View>
    </Animated.View>
  );
}

export function Card({
  children,
  colors,
}: {
  children: React.ReactNode;
  colors: ThemeColors;
}) {
  return (
    <View
      style={{
        borderRadius: 18,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.card,
        overflow: "hidden",
      }}
    >
      {children}
    </View>
  );
}
