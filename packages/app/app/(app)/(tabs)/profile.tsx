import { api } from "@barakah/core/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo } from "react";
import { Alert, Linking, Pressable, Text, View } from "react-native";
import Animated, {
  FadeInDown,
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import { ProfileMesh } from "@/components/meshes";
import { ScrollBlurHeader } from "@/components/scroll-blur-header";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { LINKS } from "@/constants/links";
import { type ThemeColors, useTheme } from "@/contexts/theme-context";
import { useUser } from "@/contexts/user-context";
import { authClient } from "@/lib/auth-client";
import { useSubscription } from "@/lib/subscription";

const SPLIT_RE = /\s+/;
const NON_ALPHANUM_RE = /[^a-z0-9]/g;

const METHOD_LABEL: Record<string, string> = {
  isna: "ISNA",
  mwl: "Muslim World League",
  "umm-al-qura": "Umm al-Qura",
  egyptian: "Egyptian",
  karachi: "Karachi",
  custom: "Custom",
};

const PLAN_VALUE_LABEL: Record<string, string> = {
  yearly: "Premium",
  monthly: "Premium",
  family: "Family",
  lifetime: "Lifetime",
};

export default function Profile() {
  const router = useRouter();
  const { user } = useUser();
  const profile = useQuery(api.lib.users.getMyProfile);
  const deleteAccount = useMutation(api.lib.users.deleteMyAccount);
  const { activeSubscription } = useSubscription();
  const { colors, scheme } = useTheme();
  const isPremium = !!activeSubscription;
  const subscriptionLabel = activeSubscription
    ? (PLAN_VALUE_LABEL[activeSubscription.productId] ?? "Premium")
    : "Free";
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
    },
  });

  const name = profile?.name?.trim() || user?.name?.trim() || "friend";
  const email = user?.email ?? null;
  const handle = useMemo(
    () =>
      `@${(profile?.name || user?.name || "friend")
        .toLowerCase()
        .replace(NON_ALPHANUM_RE, "")
        .slice(0, 18)}`,
    [profile?.name, user?.name]
  );
  const parts = name.split(SPLIT_RE).filter(Boolean);
  const initials =
    parts.length >= 2
      ? `${parts[0][0]}${parts.at(-1)?.[0] ?? ""}`.toUpperCase()
      : name.slice(0, 2).toUpperCase();

  const methodKey = profile?.calcMethod ?? "mwl";
  const themeLabel = scheme === "dark" ? "Dark" : "Light";
  const cardSurface =
    scheme === "dark" ? "rgba(20,26,23,0.55)" : "rgba(255,255,255,0.55)";

  const go = (path: string) => {
    Haptics.selectionAsync().catch(() => undefined);
    router.push(path as never);
  };

  const handleLogout = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(
      () => undefined
    );
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        // Leave the authed area immediately to a blocking screen; the slow
        // network sign-out (RevenueCat + Better Auth) runs there.
        onPress: () => {
          router.replace("/logging-out" as never);
        },
      },
    ]);
  };

  const openMail = (to: string, subject: string) => {
    Haptics.selectionAsync().catch(() => undefined);
    Linking.openURL(
      `mailto:${to}?subject=${encodeURIComponent(subject)}`
    ).catch(() => Alert.alert("Mail unavailable", `Email: ${to}`));
  };

  const openUrl = (url: string) => {
    Haptics.selectionAsync().catch(() => undefined);
    Linking.openURL(url).catch(() => Alert.alert("Cannot open link", url));
  };

  const openSettings = () => {
    Haptics.selectionAsync().catch(() => undefined);
    Linking.openSettings().catch(() => undefined);
  };

  const runDelete = async () => {
    try {
      // Purge Convex app data first while the session is still valid, then
      // remove the auth record. Routing to the blocking screen runs sign-out.
      await deleteAccount({});
      let authRemoved = true;
      try {
        await authClient.deleteUser();
      } catch {
        authRemoved = false;
      }
      if (!authRemoved) {
        Alert.alert(
          "Account partially deleted",
          "Your data was removed but your login could not be fully deleted. Email support@heybarakah.app to finish."
        );
      }
      router.replace("/logging-out" as never);
    } catch {
      Alert.alert(
        "Could not delete account",
        "Something went wrong. Check your connection and try again, or email support@heybarakah.app."
      );
    }
  };

  const confirmDelete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(
      () => undefined
    );
    let note = "";
    if (activeSubscription?.source === "revenuecat") {
      note =
        " Your subscription is billed by Apple and is not cancelled by deleting your account — manage or cancel it in Settings › Apple ID › Subscriptions.";
    } else if (activeSubscription?.source === "polar") {
      note =
        " Your subscription was purchased on the web and is not cancelled by deleting your account — manage it from your original purchase receipt.";
    }
    Alert.alert(
      "Delete account",
      `This permanently removes your account and data. This cannot be undone.${note}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            runDelete();
          },
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      <ProfileMesh dark={scheme === "dark"} />
      <Animated.ScrollView
        contentContainerStyle={{ paddingTop: insets.top, paddingBottom: 140 }}
        onScroll={onScroll}
        scrollEventThrottle={16}
        scrollIndicatorInsets={{ top: insets.top }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
          <Text
            style={{
              fontFamily: "LibreBaskerville-Bold",
              fontSize: 30,
              color: colors.ink,
              letterSpacing: -0.5,
            }}
          >
            Profile
          </Text>
        </View>

        <Animated.View
          entering={FadeInDown.duration(360).springify().damping(18)}
          style={{ paddingHorizontal: 20, marginTop: 18 }}
        >
          <HeaderCard
            colors={colors}
            email={email}
            handle={handle}
            imageUrl={profile?.imageUrl ?? null}
            initials={initials}
            isPremium={isPremium}
            name={name}
            onPress={() => go("/personal-details")}
            planLabel={subscriptionLabel}
            surface={cardSurface}
          />
        </Animated.View>

        <Section colors={colors} delay={60} title="Account">
          <Card colors={colors} surface={cardSurface}>
            <Row
              colors={colors}
              onPress={() => go("/subscription")}
              sf="crown.fill"
              title="Subscription"
              value={subscriptionLabel}
            />
            <Divider colors={colors} />
            <Row
              colors={colors}
              onPress={() => go("/preferences")}
              sf="slider.horizontal.3"
              title="Preferences"
              value={themeLabel}
            />
            <Divider colors={colors} />
            <Row
              colors={colors}
              onPress={() => go("/calc-method")}
              sf="globe"
              title="Calculation Method"
              value={METHOD_LABEL[methodKey] ?? methodKey}
            />
          </Card>
        </Section>

        <Section colors={colors} delay={140} title="Permissions">
          <Card colors={colors} surface={cardSurface}>
            <PermissionRow
              colors={colors}
              granted={!!profile?.locationGranted}
              onEnable={openSettings}
              sf="location.fill"
              title="Location"
            />
            <Divider colors={colors} />
            <PermissionRow
              colors={colors}
              granted={!!profile?.notifGranted}
              onEnable={openSettings}
              sf="bell.fill"
              title="Notifications"
            />
          </Card>
        </Section>

        <Section colors={colors} delay={220} title="Support & Legal">
          <Card colors={colors} surface={cardSurface}>
            <Row
              colors={colors}
              onPress={() =>
                openMail("support@heybarakah.app", "Feature request")
              }
              sf="megaphone.fill"
              title="Request a Feature"
            />
            <Divider colors={colors} />
            <Row
              colors={colors}
              onPress={() =>
                openMail("support@heybarakah.app", "Support request")
              }
              sf="envelope.fill"
              title="Support Email"
            />
            <Divider colors={colors} />
            <Row
              colors={colors}
              onPress={() => openUrl(LINKS.terms)}
              sf="doc.text.fill"
              title="Terms and Conditions"
            />
            <Divider colors={colors} />
            <Row
              colors={colors}
              onPress={() => openUrl(LINKS.privacy)}
              sf="lock.shield.fill"
              title="Privacy Policy"
            />
          </Card>
        </Section>

        <Section colors={colors} delay={280} title="Account Actions">
          <Card colors={colors} surface={cardSurface}>
            <Row
              colors={colors}
              onPress={handleLogout}
              sf="rectangle.portrait.and.arrow.right"
              title="Log out"
            />
            <Divider colors={colors} />
            <Row
              colors={colors}
              danger
              onPress={confirmDelete}
              sf="trash.fill"
              title="Delete Account"
            />
          </Card>
        </Section>
      </Animated.ScrollView>
      <ScrollBlurHeader scrollY={scrollY} />
    </View>
  );
}

function HeaderCard({
  colors,
  email,
  handle,
  imageUrl,
  initials,
  isPremium,
  name,
  onPress,
  planLabel,
  surface,
}: {
  colors: ThemeColors;
  email: string | null;
  handle: string;
  imageUrl: string | null;
  initials: string;
  isPremium: boolean;
  name: string;
  onPress: () => void;
  planLabel: string;
  surface: string;
}) {
  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 14,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: surface,
            gap: 14,
            opacity: pressed ? 0.92 : 1,
          }}
        >
          {imageUrl ? (
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                overflow: "hidden",
              }}
            >
              <Image
                contentFit="cover"
                source={{ uri: imageUrl }}
                style={{ width: 56, height: 56 }}
              />
            </View>
          ) : (
            <GradientAvatar initials={initials} size={56} />
          )}
          <View style={{ flex: 1, minWidth: 0 }}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              <IconSymbol
                color={isPremium ? colors.premium : colors.inkMuted}
                name={(isPremium ? "crown.fill" : "person.fill") as never}
                size={12}
              />
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "700",
                  letterSpacing: 0.6,
                  color: isPremium ? colors.premium : colors.inkMuted,
                  textTransform: "uppercase",
                }}
              >
                {isPremium ? planLabel : "Free"}
              </Text>
            </View>
            <Text
              numberOfLines={1}
              style={{
                fontFamily: "LibreBaskerville-Bold",
                fontSize: 18,
                color: colors.ink,
                marginTop: 2,
              }}
            >
              {name}
            </Text>
            <Text
              numberOfLines={1}
              style={{ fontSize: 12, color: colors.inkMuted, marginTop: 1 }}
            >
              {email ?? handle}
            </Text>
          </View>
          <IconSymbol
            color={colors.chevron}
            name={"chevron.right" as never}
            size={16}
          />
        </View>
      )}
    </Pressable>
  );
}

function GradientAvatar({
  initials,
  size,
}: {
  initials: string;
  size: number;
}) {
  const r = size / 2;
  return (
    <View style={{ width: size, height: size }}>
      <Svg height={size} width={size}>
        <Defs>
          <LinearGradient id="avatar-grad" x1="0%" x2="100%" y1="0%" y2="100%">
            <Stop offset="0%" stopColor="#29603E" />
            <Stop offset="100%" stopColor="#29603E" />
          </LinearGradient>
        </Defs>
        <Circle cx={r} cy={r} fill="url(#avatar-grad)" r={r} />
      </Svg>
      <View
        style={{
          position: "absolute",
          width: size,
          height: size,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            color: "#FFFFFF",
            fontSize: size * 0.36,
            fontWeight: "700",
            letterSpacing: 0.5,
          }}
        >
          {initials}
        </Text>
      </View>
    </View>
  );
}

function Section({
  children,
  colors,
  delay,
  title,
}: {
  children: React.ReactNode;
  colors: ThemeColors;
  delay: number;
  title: string;
}) {
  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(360).springify().damping(18)}
      style={{ marginTop: 28 }}
    >
      <Text
        style={{
          paddingHorizontal: 20,
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

function Card({
  children,
  colors,
  surface,
}: {
  children: React.ReactNode;
  colors: ThemeColors;
  surface: string;
}) {
  return (
    <View
      style={{
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: surface,
        overflow: "hidden",
      }}
    >
      {children}
    </View>
  );
}

function Divider({ colors }: { colors: ThemeColors }) {
  return (
    <View
      style={{ height: 1, marginLeft: 70, backgroundColor: colors.divider }}
    />
  );
}

function Row({
  colors,
  danger,
  onPress,
  sf,
  subtitle,
  title,
  value,
}: {
  colors: ThemeColors;
  danger?: boolean;
  onPress: () => void;
  sf: string;
  subtitle?: string;
  title: string;
  value?: string;
}) {
  const iconColor = danger ? colors.error : colors.ink;
  const iconBg = danger ? colors.errorSoft : colors.neutralSoft;
  const titleColor = danger ? colors.error : colors.ink;
  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 14,
            paddingVertical: 14,
            gap: 12,
            opacity: pressed ? 0.7 : 1,
          }}
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: iconBg,
            }}
          >
            <IconSymbol color={iconColor} name={sf as never} size={22} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text
              numberOfLines={1}
              style={{ fontSize: 15, fontWeight: "600", color: titleColor }}
            >
              {title}
            </Text>
            {subtitle ? (
              <Text
                numberOfLines={2}
                style={{ fontSize: 12, color: colors.inkMuted, marginTop: 2 }}
              >
                {subtitle}
              </Text>
            ) : null}
          </View>
          {value ? (
            <Text
              numberOfLines={1}
              style={{ fontSize: 13, color: colors.inkMuted, maxWidth: 140 }}
            >
              {value}
            </Text>
          ) : null}
          <IconSymbol
            color={colors.chevron}
            name={"chevron.right" as never}
            size={14}
          />
        </View>
      )}
    </Pressable>
  );
}

function PermissionRow({
  colors,
  granted,
  onEnable,
  sf,
  title,
}: {
  colors: ThemeColors;
  granted: boolean;
  onEnable: () => void;
  sf: string;
  title: string;
}) {
  const content = (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 14,
        paddingVertical: 14,
        gap: 12,
      }}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.neutralSoft,
        }}
      >
        <IconSymbol color={colors.ink} name={sf as never} size={22} />
      </View>
      <Text
        numberOfLines={1}
        style={{
          flex: 1,
          fontSize: 15,
          fontWeight: "600",
          color: colors.ink,
        }}
      >
        {title}
      </Text>
      {granted ? (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: colors.primary,
            backgroundColor: "transparent",
          }}
        >
          <View
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: colors.primary,
            }}
          />
          <Text
            style={{
              fontSize: 11,
              fontWeight: "700",
              color: colors.primary,
              letterSpacing: 0.4,
            }}
          >
            Enabled
          </Text>
        </View>
      ) : (
        <View
          style={{
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: colors.primary,
            backgroundColor: "transparent",
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: "700",
              color: colors.primary,
              letterSpacing: 0.4,
            }}
          >
            Enable
          </Text>
        </View>
      )}
    </View>
  );

  if (granted) {
    return content;
  }
  return <Pressable onPress={onEnable}>{content}</Pressable>;
}
