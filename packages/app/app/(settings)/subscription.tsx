import { api } from "@barakah/core/convex/_generated/api";
import { useQuery } from "convex/react";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Alert, Linking, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { type ThemeColors, useTheme } from "@/contexts/theme-context";

const BENEFITS: { sf: string; title: string; subtitle: string }[] = [
  {
    sf: "infinity",
    title: "Unlimited dhikr",
    subtitle: "No daily limits, all counters unlocked.",
  },
  {
    sf: "bell.badge.fill",
    title: "Smart reminders",
    subtitle: "Adaptive prayer and dhikr nudges.",
  },
  {
    sf: "chart.line.uptrend.xyaxis",
    title: "Full progress history",
    subtitle: "Lifetime streaks, charts, and insights.",
  },
  {
    sf: "icloud.fill",
    title: "Cloud backup",
    subtitle: "Sync across all your devices.",
  },
];

export default function Subscription() {
  const router = useRouter();
  const { colors, scheme } = useTheme();
  const profile = useQuery(api.lib.users.getMyProfile);
  const isPremium = true; // placeholder until billing wired

  const renewsLabel = profile ? "Renews May 12, 2026" : "Active";

  const openSupport = () => {
    Haptics.selectionAsync().catch(() => undefined);
    Linking.openURL("mailto:support@heybarakah.app?subject=Subscription").catch(
      () => Alert.alert("Mail unavailable", "Email: support@heybarakah.app")
    );
  };

  const manage = () => {
    Haptics.selectionAsync().catch(() => undefined);
    Alert.alert("Manage subscription", "Opening App Store subscriptions…", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Open",
        onPress: () =>
          Linking.openURL("https://apps.apple.com/account/subscriptions"),
      },
    ]);
  };

  const restore = () => {
    Haptics.selectionAsync().catch(() => undefined);
    Alert.alert(
      "Restore purchases",
      "No prior purchases found on this account."
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <Header
          colors={colors}
          onBack={() => router.back()}
          title="Subscription"
        />
        <View style={{ paddingHorizontal: 20, marginTop: 8 }}>
          <PlanCard
            colors={colors}
            isPremium={isPremium}
            renewsLabel={renewsLabel}
          />
        </View>

        <Section colors={colors} title="What's included">
          <Card colors={colors}>
            {BENEFITS.map((b, i) => (
              <View key={b.sf}>
                <BenefitRow
                  colors={colors}
                  sf={b.sf}
                  subtitle={b.subtitle}
                  title={b.title}
                />
                {i < BENEFITS.length - 1 ? <Divider colors={colors} /> : null}
              </View>
            ))}
          </Card>
        </Section>

        <Section colors={colors} title="Manage">
          <Card colors={colors}>
            <ActionRow
              colors={colors}
              onPress={manage}
              sf="creditcard.fill"
              title="Manage subscription"
            />
            <Divider colors={colors} />
            <ActionRow
              colors={colors}
              onPress={restore}
              sf="arrow.clockwise"
              title="Restore purchases"
            />
            <Divider colors={colors} />
            <ActionRow
              colors={colors}
              onPress={openSupport}
              sf="envelope.fill"
              title="Billing support"
            />
          </Card>
        </Section>
      </SafeAreaView>
    </View>
  );
}

function PlanCard({
  colors,
  isPremium,
  renewsLabel,
}: {
  colors: ThemeColors;
  isPremium: boolean;
  renewsLabel: string;
}) {
  return (
    <View
      style={{
        borderRadius: 22,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      >
        <Svg height="100%" width="100%">
          <Defs>
            <LinearGradient id="plan-grad" x1="0" x2="1" y1="0" y2="1">
              <Stop offset="0" stopColor={colors.premium} stopOpacity="0.18" />
              <Stop offset="1" stopColor={colors.primary} stopOpacity="0.06" />
            </LinearGradient>
          </Defs>
          <Rect fill={colors.card} height="100%" width="100%" />
          <Rect fill="url(#plan-grad)" height="100%" width="100%" />
        </Svg>
      </View>

      <View style={{ padding: 20, gap: 18 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: colors.premium,
            }}
          >
            <IconSymbol
              color="#FFFFFF"
              name={"crown.fill" as never}
              size={24}
            />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "700",
                  letterSpacing: 0.6,
                  color: colors.premium,
                  textTransform: "uppercase",
                }}
              >
                Current plan
              </Text>
              <View
                style={{
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: colors.primary,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <View
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: 3,
                    backgroundColor: colors.primary,
                  }}
                />
                <Text
                  style={{
                    fontSize: 9,
                    fontWeight: "700",
                    color: colors.primary,
                    letterSpacing: 0.4,
                  }}
                >
                  ACTIVE
                </Text>
              </View>
            </View>
            <Text
              style={{
                fontFamily: "LibreBaskerville-Bold",
                fontSize: 22,
                color: colors.ink,
                marginTop: 4,
              }}
            >
              {isPremium ? "Barakah Premium" : "Free"}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 4 }}>
          <Text
            style={{
              fontFamily: "LibreBaskerville-Bold",
              fontSize: 34,
              color: colors.ink,
              lineHeight: 36,
            }}
          >
            $4.99
          </Text>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: colors.inkMuted,
              marginBottom: 4,
            }}
          >
            /month
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            paddingTop: 14,
            borderTopWidth: 1,
            borderTopColor: colors.divider,
          }}
        >
          <IconSymbol
            color={colors.inkMuted}
            name={"calendar" as never}
            size={14}
          />
          <Text style={{ fontSize: 13, color: colors.inkMuted, flex: 1 }}>
            {renewsLabel}
          </Text>
        </View>
      </View>
    </View>
  );
}

function BenefitRow({
  colors,
  sf,
  subtitle,
  title,
}: {
  colors: ThemeColors;
  sf: string;
  subtitle: string;
  title: string;
}) {
  return (
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
          width: 40,
          height: 40,
          borderRadius: 11,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.neutralSoft,
        }}
      >
        <IconSymbol color={colors.inkMuted} name={sf as never} size={20} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontSize: 15, fontWeight: "600", color: colors.ink }}>
          {title}
        </Text>
        <Text style={{ fontSize: 12, color: colors.inkMuted, marginTop: 2 }}>
          {subtitle}
        </Text>
      </View>
      <IconSymbol
        color={colors.primary}
        name={"checkmark" as never}
        size={16}
      />
    </View>
  );
}

function ActionRow({
  colors,
  onPress,
  sf,
  title,
}: {
  colors: ThemeColors;
  onPress: () => void;
  sf: string;
  title: string;
}) {
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
              width: 40,
              height: 40,
              borderRadius: 11,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: colors.neutralSoft,
            }}
          >
            <IconSymbol color={colors.inkMuted} name={sf as never} size={20} />
          </View>
          <Text
            style={{
              flex: 1,
              fontSize: 15,
              fontWeight: "600",
              color: colors.ink,
            }}
          >
            {title}
          </Text>
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

function Section({
  children,
  colors,
  title,
}: {
  children: React.ReactNode;
  colors: ThemeColors;
  title: string;
}) {
  return (
    <View style={{ marginTop: 28 }}>
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
    </View>
  );
}

function Card({
  children,
  colors,
}: {
  children: React.ReactNode;
  colors: ThemeColors;
}) {
  return (
    <View
      style={{
        borderRadius: 16,
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

function Divider({ colors }: { colors: ThemeColors }) {
  return (
    <View
      style={{ height: 1, marginLeft: 66, backgroundColor: colors.divider }}
    />
  );
}

function Header({
  colors,
  onBack,
  title,
}: {
  colors: ThemeColors;
  onBack: () => void;
  title: string;
}) {
  return (
    <View
      style={{
        paddingHorizontal: 16,
        paddingTop: 6,
        paddingBottom: 8,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
      }}
    >
      <Pressable
        onPress={() => {
          Haptics.selectionAsync().catch(() => undefined);
          onBack();
        }}
      >
        {({ pressed }) => (
          <View
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: colors.surfaceSoft,
              opacity: pressed ? 0.8 : 1,
            }}
          >
            <IconSymbol
              color={colors.ink}
              name={"chevron.left" as never}
              size={16}
            />
          </View>
        )}
      </Pressable>
      <Text
        style={{
          flex: 1,
          textAlign: "center",
          fontSize: 16,
          fontWeight: "700",
          color: colors.ink,
          marginRight: 38,
        }}
      >
        {title}
      </Text>
    </View>
  );
}
