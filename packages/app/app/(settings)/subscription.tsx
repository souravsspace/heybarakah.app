import { applicationId } from "expo-application";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import {
  Card,
  Section,
  SettingsScreen,
} from "@/components/settings/settings-screen";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { type ThemeColors, useTheme } from "@/contexts/theme-context";
import { hapticSelection } from "@/lib/haptics";
import { useSubscription } from "@/lib/subscription";

type ProductId = "yearly" | "monthly" | "family" | "lifetime";

const PLAN_LABEL: Record<ProductId, string> = {
  yearly: "Premium",
  monthly: "Premium",
  family: "Family",
  lifetime: "Lifetime",
};

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
  const { colors } = useTheme();
  const { activeSubscription, isSubscriptionLoading, restore } =
    useSubscription();
  const loading = isSubscriptionLoading;
  const isPremium = !!activeSubscription;
  const productId = (activeSubscription?.productId ?? "monthly") as ProductId;
  const [isRestoring, setIsRestoring] = useState(false);

  const openSupport = () => {
    hapticSelection();
    Linking.openURL("mailto:support@heybarakah.app?subject=Subscription").catch(
      () => Alert.alert("Mail unavailable", "Email: support@heybarakah.app")
    );
  };

  const openFamilySettings = () => {
    hapticSelection();
    if (Platform.OS === "android") {
      Linking.openURL(
        "https://support.google.com/googleplay/answer/7007852"
      ).catch(() =>
        Alert.alert("Cannot open", "See Google Play Family Library.")
      );
      return;
    }
    Linking.openURL("App-Prefs:FAMILY_SHARING").catch(() =>
      Linking.openSettings().catch(() => undefined)
    );
  };

  const openFamilyHelp = () => {
    hapticSelection();
    const url =
      Platform.OS === "android"
        ? "https://support.google.com/googleplay/answer/7007852"
        : "https://support.apple.com/HT201079";
    Linking.openURL(url).catch(() => Alert.alert("Cannot open link", url));
  };

  const manage = () => {
    hapticSelection();
    if (Platform.OS === "android") {
      if (!applicationId) {
        Alert.alert(
          "Cannot open",
          "Open the Play Store app to manage subscriptions."
        );
        return;
      }
      Linking.openURL(
        `https://play.google.com/store/account/subscriptions?package=${applicationId}`
      ).catch(() =>
        Alert.alert(
          "Cannot open",
          "Open the Play Store app to manage subscriptions."
        )
      );
      return;
    }
    Linking.openURL("https://apps.apple.com/account/subscriptions").catch(() =>
      Alert.alert(
        "Cannot open",
        "Open the App Store app to manage subscriptions."
      )
    );
  };

  const onRestore = async () => {
    if (isRestoring) {
      return;
    }
    hapticSelection();
    setIsRestoring(true);
    try {
      const ok = await restore();
      Alert.alert(
        ok ? "Restored" : "Nothing to restore",
        ok
          ? "Your subscription is active."
          : "No prior purchases found on this account."
      );
    } catch {
      Alert.alert("Could not restore", "Check your connection and try again.");
    } finally {
      setIsRestoring(false);
    }
  };

  const upgrade = () => {
    hapticSelection();
    router.push("/no-active-sub" as never);
  };

  return (
    <SettingsScreen
      subtitle={
        isPremium
          ? "Your Barakah membership and benefits."
          : "Unlock the full Barakah experience."
      }
      title="Subscription"
    >
      <Animated.View
        entering={FadeInDown.duration(300).delay(30)}
        style={{ paddingHorizontal: 20, marginTop: 22 }}
      >
        {isPremium ? (
          <PlanCard colors={colors} productId={productId} />
        ) : (
          <UpgradeCard colors={colors} loading={loading} onUpgrade={upgrade} />
        )}
      </Animated.View>

      <Section colors={colors} delay={80} title="What's included">
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

      {isPremium && productId === "family" ? (
        <Section colors={colors} delay={120} title="Family sharing">
          <Card colors={colors}>
            <FamilyInfoRow colors={colors} />
            <Divider colors={colors} />
            <ActionRow
              colors={colors}
              onPress={openFamilySettings}
              sf={Platform.OS === "android" ? "person.2.fill" : "gear"}
              title={
                Platform.OS === "android"
                  ? "Open Play Family Library"
                  : "Manage family in Settings"
              }
            />
            <Divider colors={colors} />
            <ActionRow
              colors={colors}
              onPress={openFamilyHelp}
              sf="questionmark.circle.fill"
              title="How family sharing works"
            />
          </Card>
        </Section>
      ) : null}

      {isPremium ? (
        <Section colors={colors} delay={160} title="Manage">
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
              loading={isRestoring}
              onPress={onRestore}
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
      ) : null}
    </SettingsScreen>
  );
}

function PlanCard({
  colors,
  productId,
}: {
  colors: ThemeColors;
  productId: ProductId;
}) {
  const planName = PLAN_LABEL[productId];
  const cadence =
    productId === "yearly"
      ? "Yearly"
      : productId === "family"
        ? "Family · Yearly"
        : productId === "lifetime"
          ? "Lifetime access"
          : "Monthly";

  return (
    <View
      style={{
        borderRadius: 22,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.card,
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 22,
        gap: 18,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
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
              fontSize: 10,
              fontWeight: "700",
              letterSpacing: 2,
              color: colors.primary,
              textTransform: "uppercase",
            }}
          >
            Active plan
          </Text>
        </View>
        <IconSymbol
          color={colors.premium}
          name={"crown.fill" as never}
          size={18}
        />
      </View>

      <View style={{ gap: 6 }}>
        <Text
          style={{
            fontFamily: "LibreBaskerville-Bold",
            fontSize: 36,
            color: colors.ink,
            letterSpacing: -0.6,
            lineHeight: 40,
          }}
        >
          {planName}
        </Text>
        <Text style={{ fontSize: 13, color: colors.inkMuted }}>{cadence}</Text>
      </View>

      <View style={{ height: 1, backgroundColor: colors.divider }} />
      <Text style={{ fontSize: 12, color: colors.inkMuted, lineHeight: 17 }}>
        Jazāk Allāhu khayran — your support keeps Barakah running.
      </Text>
    </View>
  );
}

function UpgradeCard({
  colors,
  loading,
  onUpgrade,
}: {
  colors: ThemeColors;
  loading: boolean;
  onUpgrade: () => void;
}) {
  return (
    <View
      style={{
        borderRadius: 22,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.card,
        padding: 22,
        gap: 16,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <IconSymbol
          color={colors.premium}
          name={"crown.fill" as never}
          size={16}
        />
        <Text
          style={{
            fontSize: 10,
            fontWeight: "700",
            letterSpacing: 1.6,
            color: colors.premium,
            textTransform: "uppercase",
          }}
        >
          Free plan
        </Text>
      </View>
      <Text
        style={{
          fontFamily: "LibreBaskerville-Bold",
          fontSize: 26,
          color: colors.ink,
          letterSpacing: -0.3,
          lineHeight: 32,
        }}
      >
        Unlock Barakah Premium
      </Text>
      <Text style={{ fontSize: 13, color: colors.inkMuted, lineHeight: 19 }}>
        Adaptive reminders, lifetime streaks, cloud backup, and every counter
        unlocked.
      </Text>
      <Pressable
        disabled={loading}
        onPress={onUpgrade}
        style={({ pressed }) => ({
          marginTop: 2,
          paddingVertical: 15,
          borderRadius: 999,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.primary,
          opacity: pressed || loading ? 0.85 : 1,
        })}
      >
        <Text
          style={{
            fontSize: 14,
            fontWeight: "700",
            color: "#FFFFFF",
            letterSpacing: 0.5,
          }}
        >
          {loading ? "Loading…" : "UPGRADE"}
        </Text>
      </Pressable>
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
        <IconSymbol color={colors.ink} name={sf as never} size={20} />
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

function FamilyInfoRow({ colors }: { colors: ThemeColors }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-start",
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
        <IconSymbol
          color={colors.ink}
          name={"person.2.fill" as never}
          size={20}
        />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontSize: 15, fontWeight: "600", color: colors.ink }}>
          Up to 6 members
        </Text>
        <Text
          style={{
            fontSize: 12,
            color: colors.inkMuted,
            marginTop: 4,
            lineHeight: 18,
          }}
        >
          {Platform.OS === "android"
            ? "Share Barakah Premium with your Play family group. Add members in the Play Store family settings."
            : "Share Barakah Premium with your Apple Family group. Add members in iOS Settings — Apple manages invites for privacy."}
        </Text>
      </View>
    </View>
  );
}

function ActionRow({
  colors,
  loading,
  onPress,
  sf,
  title,
}: {
  colors: ThemeColors;
  loading?: boolean;
  onPress: () => void;
  sf: string;
  title: string;
}) {
  return (
    <Pressable disabled={loading} onPress={onPress}>
      {({ pressed }) => (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 14,
            paddingVertical: 14,
            gap: 12,
            opacity: pressed || loading ? 0.7 : 1,
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
            <IconSymbol color={colors.ink} name={sf as never} size={20} />
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
          {loading ? (
            <ActivityIndicator color={colors.chevron} size="small" />
          ) : (
            <IconSymbol
              color={colors.chevron}
              name={"chevron.right" as never}
              size={14}
            />
          )}
        </View>
      )}
    </Pressable>
  );
}

function Divider({ colors }: { colors: ThemeColors }) {
  return (
    <View
      style={{ height: 1, marginLeft: 66, backgroundColor: colors.divider }}
    />
  );
}
