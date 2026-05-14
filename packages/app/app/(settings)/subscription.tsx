import { api } from "@barakah/core/convex/_generated/api";
import { useQuery } from "convex/react";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Alert, Linking, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { type ThemeColors, useTheme } from "@/contexts/theme-context";

type ProductId = "yearly" | "monthly" | "family" | "lifetime";

const PLAN_LABEL: Record<ProductId, string> = {
  yearly: "Barakah Premium",
  monthly: "Barakah Premium",
  family: "Barakah Family",
  lifetime: "Barakah Lifetime",
};

const PLAN_PRICE: Record<ProductId, { amount: string; period: string }> = {
  yearly: { amount: "$39.99", period: "/year" },
  monthly: { amount: "$4.99", period: "/month" },
  family: { amount: "$59.99", period: "/year" },
  lifetime: { amount: "$99.99", period: "one-time" },
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

function formatDate(iso: string | undefined): string | null {
  if (!iso) {
    return null;
  }
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return null;
  }
  return d.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function Subscription() {
  const router = useRouter();
  const { colors, scheme } = useTheme();
  const subscription = useQuery(api.lib.subscriptions.getMySubscription);
  const loading = subscription === undefined;
  const isPremium = !!subscription;
  const productId = (subscription?.productId ?? "monthly") as ProductId;

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

  const upgrade = () => {
    Haptics.selectionAsync().catch(() => undefined);
    router.push("/no-active-sub" as never);
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
          {isPremium ? (
            <PlanCard
              colors={colors}
              expiresAt={subscription?.expiresAt}
              onManage={manage}
              onRestore={restore}
              productId={productId}
            />
          ) : (
            <UpgradeCard
              colors={colors}
              loading={loading}
              onUpgrade={upgrade}
            />
          )}
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

        {isPremium ? (
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
        ) : null}
      </SafeAreaView>
    </View>
  );
}

function PlanCard({
  colors,
  expiresAt,
  onManage,
  onRestore,
  productId,
}: {
  colors: ThemeColors;
  expiresAt: string | undefined;
  onManage: () => void;
  onRestore: () => void;
  productId: ProductId;
}) {
  const planName = PLAN_LABEL[productId];
  const { amount, period } = PLAN_PRICE[productId];
  const renewsDate = formatDate(expiresAt);
  const renewsLabel =
    productId === "lifetime"
      ? "Lifetime access"
      : renewsDate
        ? `Renews ${renewsDate}`
        : "Auto-renews monthly";

  return (
    <View
      style={{
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.card,
        padding: 22,
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
              letterSpacing: 1.6,
              color: colors.primary,
              textTransform: "uppercase",
            }}
          >
            Current plan · Active
          </Text>
        </View>
        <IconSymbol
          color={colors.premium}
          name={"crown.fill" as never}
          size={18}
        />
      </View>

      <View>
        <Text
          style={{
            fontFamily: "LibreBaskerville-Bold",
            fontSize: 26,
            color: colors.ink,
            letterSpacing: -0.3,
          }}
        >
          {planName}
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-end",
            gap: 4,
            marginTop: 8,
          }}
        >
          <Text
            style={{
              fontFamily: "LibreBaskerville-Bold",
              fontSize: 32,
              color: colors.ink,
              lineHeight: 34,
            }}
          >
            {amount}
          </Text>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: colors.inkMuted,
              marginBottom: 3,
            }}
          >
            {period}
          </Text>
        </View>
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
          size={13}
        />
        <Text style={{ fontSize: 13, color: colors.inkMuted, flex: 1 }}>
          {renewsLabel}
        </Text>
      </View>

      <View style={{ flexDirection: "row", gap: 10 }}>
        <GhostButton colors={colors} label="Manage" onPress={onManage} />
        <GhostButton colors={colors} label="Restore" onPress={onRestore} />
      </View>
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
        borderRadius: 20,
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
          fontSize: 24,
          color: colors.ink,
          letterSpacing: -0.3,
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
          paddingVertical: 14,
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
            letterSpacing: 0.3,
          }}
        >
          {loading ? "Loading…" : "UPGRADE"}
        </Text>
      </Pressable>
    </View>
  );
}

function GhostButton({
  colors,
  label,
  onPress,
}: {
  colors: ThemeColors;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        paddingVertical: 12,
        borderRadius: 999,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: "transparent",
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Text
        style={{
          fontSize: 13,
          fontWeight: "700",
          color: colors.ink,
          letterSpacing: 0.2,
        }}
      >
        {label}
      </Text>
    </Pressable>
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
