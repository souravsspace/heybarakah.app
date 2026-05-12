import { api } from "@barakah/core/convex/_generated/api";
import { useQuery } from "convex/react";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useEffect, useMemo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import Animated, {
  Easing,
  FadeInDown,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Path } from "react-native-svg";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useUser } from "@/contexts/user-context";

const COLOR = {
  ink: "#000000",
  inkMuted: "#6B7280",
  inkSubtle: "#9CA3AF",
  primary: "#29603E",
  primaryDark: "#1B3F29",
  primarySoft: "#E8F0EA",
  surface: "#FFFFFF",
  surfaceSoft: "#FAFAF7",
  cream: "#F5EBDB",
  creamSoft: "#FAF4E8",
  border: "#E5E7EB",
  divider: "#EFEFEF",
  error: "#B42318",
  errorSoft: "#FBEAE8",
  neutralSoft: "#F5F5F4",
};

const MADHAB_LABEL: Record<string, string> = {
  hanafi: "Hanafi",
  shafii: "Shāfiʿī",
  maliki: "Mālikī",
  hanbali: "Ḥanbalī",
  none: "Not specified",
};

const METHOD_LABEL: Record<string, string> = {
  isna: "ISNA",
  mwl: "Muslim World League",
  "umm-al-qura": "Umm al-Qura",
  egyptian: "Egyptian",
  karachi: "Karachi",
  custom: "Custom",
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

function greeting(hour: number) {
  if (hour < 5) {
    return "Peaceful night";
  }
  if (hour < 12) {
    return "Good morning";
  }
  if (hour < 17) {
    return "Good afternoon";
  }
  return "Good evening";
}

function hijriDate(): string {
  try {
    return new Intl.DateTimeFormat("en-TN-u-ca-islamic", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date());
  } catch {
    return "";
  }
}

export default function Profile() {
  const router = useRouter();
  const { user } = useUser();
  const profile = useQuery(api.lib.users.getMyProfile);

  const name = profile?.name?.trim() || user?.name?.trim() || "friend";
  const email = user?.email ?? null;
  const initial = name.charAt(0).toUpperCase();
  const hour = useMemo(() => new Date().getHours(), []);
  const hijri = useMemo(() => hijriDate(), []);

  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
    },
  });

  const eyebrowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, 60], [1, 0], "clamp"),
    transform: [
      { translateY: interpolate(scrollY.value, [0, 60], [0, -8], "clamp") },
    ],
  }));

  const madhabKey = profile?.madhab ?? "none";
  const methodKey = profile?.calcMethod ?? "mwl";

  const handleLogout = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    router.replace("/logging-out" as never);
  };

  return (
    <SafeAreaView
      edges={["top"]}
      style={{ flex: 1, backgroundColor: COLOR.surface }}
    >
      <Animated.View
        style={[
          {
            paddingHorizontal: 24,
            paddingTop: 8,
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
          },
          eyebrowStyle,
        ]}
      >
        <View
          style={{ width: 28, height: 1, backgroundColor: COLOR.primary }}
        />
        <Text
          style={{
            fontSize: 10,
            fontWeight: "700",
            letterSpacing: 2.4,
            color: COLOR.inkMuted,
            textTransform: "uppercase",
          }}
        >
          {greeting(hour)}
        </Text>
      </Animated.View>

      <AnimatedScrollView
        contentContainerStyle={{ paddingBottom: 160, paddingTop: 20 }}
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          entering={FadeInDown.duration(560).springify().damping(18)}
          style={{ paddingHorizontal: 24 }}
        >
          <HeroCard email={email} hijri={hijri} initial={initial} name={name} />
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(90).duration(540).springify().damping(18)}
          style={{ marginTop: 36 }}
        >
          <SectionHeader title="Practice" />
          <View
            style={{
              paddingHorizontal: 24,
              marginTop: 14,
              flexDirection: "row",
              gap: 12,
            }}
          >
            <StatTile label="Madhab" value={MADHAB_LABEL[madhabKey] ?? "—"} />
            <StatTile label="Method" value={METHOD_LABEL[methodKey] ?? "—"} />
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(180).duration(540).springify().damping(18)}
          style={{ marginTop: 32 }}
        >
          <SectionHeader title="Permissions" />
          <View
            style={{
              paddingHorizontal: 24,
              marginTop: 14,
              gap: 10,
            }}
          >
            <PermissionRow
              granted={!!profile?.locationGranted}
              label="Location"
              sf="location.fill"
              sublabel={
                profile?.locationGranted
                  ? "Sharing precise location"
                  : "Tap settings to enable"
              }
            />
            <PermissionRow
              granted={!!profile?.notifGranted}
              label="Notifications"
              sf="bell.fill"
              sublabel={
                profile?.notifGranted
                  ? "Prayer reminders on"
                  : "Tap settings to enable"
              }
            />
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(270).duration(540).springify().damping(18)}
          style={{ marginTop: 36, paddingHorizontal: 24 }}
        >
          <LogoutButton onPress={handleLogout} />
        </Animated.View>
      </AnimatedScrollView>
    </SafeAreaView>
  );
}

function GeometricOrnament() {
  return (
    <Svg
      height={120}
      style={{ position: "absolute", top: -10, right: -20 }}
      viewBox="0 0 120 120"
      width={120}
    >
      <Path
        d="M60 10 L72 38 L102 38 L78 56 L88 86 L60 68 L32 86 L42 56 L18 38 L48 38 Z"
        fill="none"
        opacity={0.08}
        stroke={COLOR.primary}
        strokeWidth={1}
      />
      <Circle
        cx={60}
        cy={60}
        fill="none"
        opacity={0.06}
        r={48}
        stroke={COLOR.primary}
        strokeWidth={1}
      />
    </Svg>
  );
}

function HeroCard({
  email,
  hijri,
  initial,
  name,
}: {
  email: string | null;
  hijri: string;
  initial: string;
  name: string;
}) {
  const breath = useSharedValue(0);
  useEffect(() => {
    breath.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 2400, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      false
    );
  }, [breath]);

  const ringOuter = useAnimatedStyle(() => ({
    opacity: interpolate(breath.value, [0, 1], [0.5, 0.15]),
    transform: [{ scale: interpolate(breath.value, [0, 1], [1, 1.18]) }],
  }));

  const ringInner = useAnimatedStyle(() => ({
    opacity: interpolate(breath.value, [0, 1], [0.9, 0.4]),
    transform: [{ scale: interpolate(breath.value, [0, 1], [1, 1.08]) }],
  }));

  return (
    <View
      style={{
        borderRadius: 24,
        borderWidth: 1,
        borderColor: COLOR.border,
        paddingVertical: 28,
        paddingHorizontal: 24,
        backgroundColor: COLOR.surface,
        overflow: "hidden",
      }}
    >
      <GeometricOrnament />

      <View style={{ alignItems: "center", gap: 18 }}>
        <View
          style={{
            width: 96,
            height: 96,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Animated.View
            style={[
              {
                position: "absolute",
                width: 96,
                height: 96,
                borderRadius: 48,
                borderWidth: 1,
                borderColor: COLOR.primary,
              },
              ringOuter,
            ]}
          />
          <Animated.View
            style={[
              {
                position: "absolute",
                width: 84,
                height: 84,
                borderRadius: 42,
                borderWidth: 1,
                borderColor: COLOR.primary,
              },
              ringInner,
            ]}
          />
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: COLOR.primarySoft,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                fontFamily: "LibreBaskerville-Bold",
                fontSize: 32,
                color: COLOR.primaryDark,
              }}
            >
              {initial}
            </Text>
          </View>
        </View>

        <View style={{ alignItems: "center", gap: 4 }}>
          <Text
            numberOfLines={1}
            style={{
              fontFamily: "LibreBaskerville-Bold",
              fontSize: 28,
              color: COLOR.ink,
              lineHeight: 34,
              textAlign: "center",
            }}
          >
            {name}
          </Text>
          {email ? (
            <Text
              numberOfLines={1}
              style={{
                fontSize: 13,
                color: COLOR.inkMuted,
              }}
            >
              {email}
            </Text>
          ) : null}
        </View>
      </View>

      {hijri ? (
        <View
          style={{
            marginTop: 22,
            paddingTop: 18,
            borderTopWidth: 1,
            borderTopColor: COLOR.divider,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
          }}
        >
          <View
            style={{
              width: 5,
              height: 5,
              borderRadius: 3,
              backgroundColor: COLOR.primary,
            }}
          />
          <Text
            style={{
              fontSize: 12,
              color: COLOR.inkMuted,
              letterSpacing: 0.6,
              textTransform: "uppercase",
              fontWeight: "600",
            }}
          >
            {hijri}
          </Text>
          <View
            style={{
              width: 5,
              height: 5,
              borderRadius: 3,
              backgroundColor: COLOR.primary,
            }}
          />
        </View>
      ) : null}
    </View>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <View
      style={{
        paddingHorizontal: 24,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
      }}
    >
      <View style={{ width: 18, height: 1, backgroundColor: COLOR.primary }} />
      <Text
        style={{
          fontSize: 10,
          fontWeight: "700",
          letterSpacing: 2.4,
          color: COLOR.inkMuted,
          textTransform: "uppercase",
        }}
      >
        {title}
      </Text>
    </View>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  return (
    <AnimatedPressable
      onPressIn={() => {
        scale.value = withSpring(0.97, { damping: 18, stiffness: 220 });
        Haptics.selectionAsync();
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 18, stiffness: 220 });
      }}
      style={[
        {
          flex: 1,
          paddingHorizontal: 16,
          paddingVertical: 18,
          borderRadius: 18,
          borderWidth: 1,
          borderColor: COLOR.border,
          backgroundColor: COLOR.surfaceSoft,
        },
        animStyle,
      ]}
    >
      <Text
        style={{
          fontSize: 10,
          fontWeight: "700",
          letterSpacing: 1.8,
          color: COLOR.inkMuted,
          textTransform: "uppercase",
          marginBottom: 10,
        }}
      >
        {label}
      </Text>
      <Text
        numberOfLines={2}
        style={{
          fontFamily: "LibreBaskerville-Bold",
          fontSize: 18,
          color: COLOR.ink,
          lineHeight: 22,
        }}
      >
        {value}
      </Text>
    </AnimatedPressable>
  );
}

function PermissionRow({
  granted,
  label,
  sf,
  sublabel,
}: {
  granted: boolean;
  label: string;
  sf: string;
  sublabel: string;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  return (
    <AnimatedPressable
      onPressIn={() => {
        scale.value = withSpring(0.99, { damping: 18, stiffness: 240 });
        Haptics.selectionAsync();
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 18, stiffness: 240 });
      }}
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 14,
          borderRadius: 18,
          borderWidth: 1,
          borderColor: COLOR.border,
          backgroundColor: COLOR.surface,
        },
        animStyle,
      ]}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: granted ? COLOR.primarySoft : COLOR.neutralSoft,
          alignItems: "center",
          justifyContent: "center",
          marginRight: 14,
        }}
      >
        <IconSymbol
          color={granted ? COLOR.primary : COLOR.inkSubtle}
          name={sf as never}
          size={18}
        />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          numberOfLines={1}
          style={{ fontSize: 15, fontWeight: "600", color: COLOR.ink }}
        >
          {label}
        </Text>
        <Text
          numberOfLines={1}
          style={{ fontSize: 12, color: COLOR.inkMuted, marginTop: 2 }}
        >
          {sublabel}
        </Text>
      </View>
      <View
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: granted ? COLOR.primary : COLOR.inkSubtle,
          marginLeft: 12,
        }}
      />
    </AnimatedPressable>
  );
}

function LogoutButton({ onPress }: { onPress: () => void }) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.97, { damping: 18, stiffness: 240 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 18, stiffness: 240 });
      }}
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: 16,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: COLOR.errorSoft,
          backgroundColor: COLOR.surface,
        },
        animStyle,
      ]}
    >
      <IconSymbol
        color={COLOR.error}
        name={"rectangle.portrait.and.arrow.right" as never}
        size={16}
        style={{ marginRight: 10 }}
      />
      <Text
        style={{
          fontSize: 14,
          fontWeight: "700",
          color: COLOR.error,
          letterSpacing: 0.6,
          textTransform: "uppercase",
        }}
      >
        Log out
      </Text>
    </AnimatedPressable>
  );
}
