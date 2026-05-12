import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import {
  GlassContainer,
  GlassView,
  isLiquidGlassAvailable,
} from "expo-glass-effect";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import type { SymbolViewProps } from "expo-symbols";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/ui/icon-symbol";

const PRIMARY = "#29603E";
const INK_MUTED = "#6B7280";

interface TabDef {
  label: string;
  name: string;
  sf: SymbolViewProps["name"];
  sfFilled: SymbolViewProps["name"];
}

const TABS: TabDef[] = [
  { name: "home", label: "Home", sf: "house", sfFilled: "house.fill" },
  {
    name: "dhikr",
    label: "Dhikr",
    sf: "circle.hexagongrid",
    sfFilled: "circle.hexagongrid.fill",
  },
  { name: "locked", label: "Locked", sf: "lock", sfFilled: "lock.fill" },
  {
    name: "progress",
    label: "Progress",
    sf: "chart.xyaxis.line",
    sfFilled: "chart.xyaxis.line",
  },
];

export function FloatingGlassTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const glassy = isLiquidGlassAvailable();

  const currentRouteName = state.routes[state.index]?.name;
  const profileFocused = currentRouteName === "profile";

  function onPress(targetName: string) {
    const route = state.routes.find((r) => r.name === targetName);
    if (!route) {
      return;
    }
    const event = navigation.emit({
      type: "tabPress",
      target: route.key,
      canPreventDefault: true,
    });
    Haptics.selectionAsync().catch(() => undefined);
    const isFocused = route.name === currentRouteName;
    if (!(isFocused || event.defaultPrevented)) {
      navigation.navigate(route.name);
    }
  }

  function onProfilePress() {
    Haptics.selectionAsync().catch(() => undefined);
    if (currentRouteName !== "profile") {
      router.push("/profile" as never);
    }
  }

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrap, { bottom: Math.max(insets.bottom, 12) + 4 }]}
    >
      <Container glassy={glassy}>
        <Pill glassy={glassy} style={styles.mainPill}>
          {TABS.map((t) => {
            const focused = currentRouteName === t.name;
            return (
              <Pressable
                accessibilityLabel={t.label}
                accessibilityRole="button"
                accessibilityState={{ selected: focused }}
                key={t.name}
                onPress={() => onPress(t.name)}
                style={({ pressed }) => [
                  styles.tab,
                  pressed && { opacity: 0.7 },
                ]}
              >
                <IconSymbol
                  color={focused ? PRIMARY : INK_MUTED}
                  name={focused ? t.sfFilled : t.sf}
                  size={focused ? 23 : 22}
                  weight={focused ? "semibold" : "regular"}
                />
                <Text
                  numberOfLines={1}
                  style={[
                    styles.label,
                    { color: focused ? PRIMARY : INK_MUTED },
                  ]}
                >
                  {t.label}
                </Text>
              </Pressable>
            );
          })}
        </Pill>

        <Pill glassy={glassy} style={styles.profilePill}>
          <Pressable
            accessibilityLabel="Profile"
            accessibilityRole="button"
            accessibilityState={{ selected: profileFocused }}
            onPress={onProfilePress}
            style={({ pressed }) => [
              styles.profileTap,
              pressed && { opacity: 0.7 },
            ]}
          >
            <IconSymbol
              color={profileFocused ? PRIMARY : INK_MUTED}
              name={
                profileFocused
                  ? "person.crop.circle.fill"
                  : "person.crop.circle"
              }
              size={26}
              weight={profileFocused ? "semibold" : "regular"}
            />
          </Pressable>
        </Pill>
      </Container>
    </View>
  );
}

function Container({
  children,
  glassy,
}: {
  children: React.ReactNode;
  glassy: boolean;
}) {
  if (glassy) {
    return (
      <GlassContainer spacing={10} style={styles.row}>
        {children}
      </GlassContainer>
    );
  }
  return <View style={styles.row}>{children}</View>;
}

function Pill({
  children,
  style,
  glassy,
}: {
  children: React.ReactNode;
  style: object;
  glassy: boolean;
}) {
  if (glassy) {
    return (
      <GlassView glassEffectStyle="regular" isInteractive style={style}>
        {children}
      </GlassView>
    );
  }
  return (
    <View style={[style, styles.fallbackPill]}>
      <BlurView intensity={80} style={StyleSheet.absoluteFill} tint="light" />
      <View style={styles.fallbackInner}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 16,
    right: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  mainPill: {
    flex: 1,
    flexDirection: "row",
    height: 64,
    borderRadius: 32,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 8,
  },
  profilePill: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    paddingVertical: 6,
  },
  label: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  profileTap: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  fallbackPill: {
    backgroundColor: "rgba(255,255,255,0.6)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(0,0,0,0.08)",
  },
  fallbackInner: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
});
