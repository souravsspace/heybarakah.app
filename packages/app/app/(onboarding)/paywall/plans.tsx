import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Linking, Pressable, Text, View } from "react-native";
import { FadeSlideIn } from "@/components/onboarding/fade-slide-in";
import { Headline } from "@/components/onboarding/headline";
import { BarakahMark } from "@/components/onboarding/illustrations/barakah-mark";
import { MosquePodium } from "@/components/onboarding/illustrations/mosque-podium";
import { ScreenShell } from "@/components/onboarding/screen-shell";
import { Button } from "@/components/ui/button";
import { LINKS } from "@/constants/links";
import { PLANS } from "@/constants/onboarding-config";
import { useUser } from "@/contexts/user-context";
import { useOnboardingNav } from "@/hooks/use-onboarding-nav";
import { useOnboardingState } from "@/hooks/use-onboarding-state";
import { useSubscription } from "@/lib/subscription";

type Plan = (typeof PLANS)[number];
type PlanId = Plan["id"];

const PRIMARY = "#29603E";
const NEUTRAL_BORDER = "#E5E7EB";
const CARD_REST = "#F4F2EE";

const CTA_LABELS: Record<PlanId, string> = {
  yearly: "TRY FOR $0.00",
  monthly: "START MONTHLY · $7.99/MO",
  family: "START FAMILY · $4.99/MO",
};

const FOOTER_CAPTIONS: Record<PlanId, string> = {
  yearly: "7 days free, then $39.99 per year.",
  monthly: "$7.99 per month. Cancel anytime.",
  family: "$59.88 per year. Up to 6 members.",
};

const PLAN_COPY: Record<
  PlanId,
  { strikePrice: string; leftSub: string; rightLabel: string }
> = {
  yearly: {
    strikePrice: "$239.88",
    leftSub: "12 mo · $39.99",
    rightLabel: "≈ $3.33 / mo",
  },
  monthly: {
    strikePrice: "$19.99",
    leftSub: "1 mo · $7.99",
    rightLabel: "$7.99 / mo",
  },
  family: {
    strikePrice: "$119.76",
    leftSub: "12 mo · $59.88",
    rightLabel: "$4.99 / mo",
  },
};

export default function Plans() {
  const { state, dispatch } = useOnboardingState();
  const { goTo } = useOnboardingNav();
  const router = useRouter();
  const { user } = useUser();
  const {
    purchase,
    offerings,
    offeringsLoading,
    revenueCatReady,
    claimMockSubscription,
    isPurchasing,
    refresh,
    restore,
  } = useSubscription();
  const [showAll, setShowAll] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const selected: PlanId = state.plan ?? "yearly";

  const visible = PLANS.filter((p) => showAll || p.id !== "family");

  useEffect(() => {
    if (revenueCatReady && !offerings && !offeringsLoading) {
      refresh().catch(() => undefined);
    }
  }, [revenueCatReady, offerings, offeringsLoading, refresh]);

  function setPlan(id: PlanId) {
    dispatch({ type: "SET_FIELD", payload: { plan: id } });
  }

  async function onRestore() {
    try {
      const ok = await restore();
      if (ok) {
        router.replace("/home");
        return;
      }
      Alert.alert(
        "Nothing to restore",
        "We could not find an active subscription for this account."
      );
    } catch {
      Alert.alert("Could not restore", "Check your connection and try again.");
    }
  }

  async function tryRealPurchase(): Promise<boolean> {
    if (!(revenueCatReady && offerings?.availablePackages.length)) {
      return false;
    }
    const result = await purchase(selected);
    if (result.ok) {
      const now = new Date().toISOString();
      dispatch({
        type: "SET_FIELD",
        payload: {
          purchasedPlan: selected,
          purchaseCompletedAt: now,
          trialStartedAt: selected === "yearly" ? now : undefined,
        },
      });
      if (user) {
        router.replace("/home");
      } else {
        goTo("/(account)/auth?mode=signup");
      }
      return true;
    }
    if (result.cancelled) {
      return true;
    }
    if (__DEV__ && result.reason === "package-unavailable") {
      return false;
    }
    Alert.alert("Purchase failed", result.reason);
    return true;
  }

  async function start() {
    if (isSubmitting || isPurchasing) {
      return;
    }

    dispatch({
      type: "SET_FIELD",
      payload: { plan: selected },
    });

    setIsSubmitting(true);
    try {
      if (revenueCatReady && !offerings) {
        await refresh();
      }

      const handled = await tryRealPurchase();
      if (handled) {
        return;
      }

      if (__DEV__ && user) {
        await claimMockSubscription(selected);
        router.replace("/home");
        return;
      }

      if (!user) {
        goTo("/(account)/auth?mode=signup");
        return;
      }

      Alert.alert(
        "Plans unavailable",
        "Subscription products are still loading from the App Store. Please try again in a moment."
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      Alert.alert("Purchase failed", message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ScreenShell
      footer={
        <View className="gap-sm">
          {__DEV__ ? (
            <Text
              className="text-center font-sans text-caption text-tertiary"
              style={{ marginBottom: 4 }}
            >
              {`RC ${revenueCatReady ? "ready" : "off"} · offerings ${offerings?.availablePackages.length ?? 0} · user ${user ? "yes" : "no"}${offeringsLoading ? " · loading" : ""}`}
            </Text>
          ) : null}
          <Button label={CTA_LABELS[selected]} onPress={start} />
          <Text className="text-center font-sans text-body-sm text-tertiary">
            {FOOTER_CAPTIONS[selected]}
          </Text>
          {showAll ? null : (
            <Pressable
              className="items-center py-sm"
              onPress={() => setShowAll(true)}
            >
              <Text
                className="font-sans text-label text-tertiary"
                style={{ fontWeight: "600", letterSpacing: 0.6 }}
              >
                VIEW ALL PLANS
              </Text>
            </Pressable>
          )}
          <Pressable className="items-center py-[6px]" onPress={onRestore}>
            <Text className="font-sans text-caption text-tertiary">
              Restore purchases
            </Text>
          </Pressable>
        </View>
      }
      scroll={false}
    >
      <FadeSlideIn className="gap-md">
        <View
          className="flex-row items-center justify-between"
          style={{ paddingTop: 4 }}
        >
          <View className="flex-row items-center" style={{ gap: 8 }}>
            <BarakahMark color="#4B5563" size={26} />
            <Text
              className="font-serif"
              style={{ fontSize: 20, letterSpacing: 0.4, color: "#4B5563" }}
            >
              Barakah
            </Text>
          </View>
          <View className="flex-row" style={{ gap: 6 }}>
            <Pressable
              className="rounded-full bg-neutral-soft px-sm py-[5px]"
              onPress={() => Linking.openURL(LINKS.terms)}
            >
              <Text className="font-sans text-caption text-tertiary">
                Terms
              </Text>
            </Pressable>
            <Pressable
              className="rounded-full bg-neutral-soft px-sm py-[5px]"
              onPress={() => Linking.openURL(LINKS.privacy)}
            >
              <Text className="font-sans text-caption text-tertiary">
                Privacy
              </Text>
            </Pressable>
            <Pressable
              className="rounded-full bg-neutral-soft px-sm py-[5px]"
              onPress={() => goTo("/(account)/auth")}
            >
              <Text className="font-sans text-caption text-tertiary">
                Subscribed?
              </Text>
            </Pressable>
          </View>
        </View>

        <View className="items-center" style={{ marginTop: showAll ? 4 : 12 }}>
          <MosquePodium size={showAll ? 132 : 176} />
        </View>

        <View className="px-sm" style={{ marginTop: showAll ? 4 : 8 }}>
          <Headline size="h2">
            Lock in your five.{"\n"}Begin the return.
          </Headline>
        </View>

        <View style={{ marginTop: showAll ? 18 : 16, gap: 22 }}>
          {visible.map((plan) => (
            <PlanOption
              isSelected={selected === plan.id}
              key={plan.id}
              onPress={() => setPlan(plan.id)}
              plan={plan}
            />
          ))}
        </View>
      </FadeSlideIn>
    </ScreenShell>
  );
}

function PlanOption({
  plan,
  isSelected,
  onPress,
}: {
  plan: Plan;
  isSelected: boolean;
  onPress: () => void;
}) {
  const copy = PLAN_COPY[plan.id];

  return (
    <Pressable onPress={onPress} style={{ position: "relative" }}>
      <PlanBadge id={plan.id} />
      {isSelected ? <SelectedCheck /> : null}
      <View
        className="flex-row items-center justify-between rounded-2xl px-md py-md"
        style={{
          borderWidth: 2.5,
          borderColor: isSelected ? PRIMARY : NEUTRAL_BORDER,
          backgroundColor: isSelected ? "#FFFFFF" : CARD_REST,
        }}
      >
        <View className="flex-1 pr-sm">
          <View className="flex-row items-baseline" style={{ gap: 10 }}>
            <Text
              className="font-sans text-ink"
              style={{ fontSize: 18, fontWeight: "700" }}
            >
              {plan.name}
            </Text>
            <Text
              className="font-sans text-tertiary"
              style={{
                fontSize: 15,
                fontWeight: "500",
                textDecorationLine: "line-through",
              }}
            >
              {copy.strikePrice}
            </Text>
          </View>
          <Text
            className="font-sans text-tertiary"
            style={{ fontSize: 14, fontWeight: "500", marginTop: 4 }}
          >
            {copy.leftSub}
          </Text>
        </View>
        <Text
          className="font-sans text-ink"
          style={{ fontSize: 17, fontWeight: "700" }}
        >
          {copy.rightLabel}
        </Text>
      </View>
    </Pressable>
  );
}

function PlanBadge({ id }: { id: PlanId }) {
  if (id === "yearly") {
    return <Badge backgroundColor={PRIMARY} label="7 DAY FREE TRIAL" />;
  }

  if (id === "family") {
    return <Badge backgroundColor="#0F1311" label="UP TO 6 MEMBERS" />;
  }

  return null;
}

function Badge({
  backgroundColor,
  label,
}: {
  backgroundColor: string;
  label: string;
}) {
  return (
    <View
      className="absolute z-10 rounded-full px-sm py-[3px]"
      style={{ top: -10, left: 16, backgroundColor }}
    >
      <Text
        className="font-sans text-label-sm text-surface"
        style={{ letterSpacing: 0.6, fontWeight: "700" }}
      >
        {label}
      </Text>
    </View>
  );
}

function SelectedCheck() {
  return (
    <View
      className="absolute z-10 rounded-full"
      style={{
        top: -8,
        right: 12,
        width: 22,
        height: 22,
        backgroundColor: PRIMARY,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Ionicons color="#F4EDDF" name="checkmark" size={14} />
    </View>
  );
}
