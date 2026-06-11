import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Text, View } from "react-native";
import { FadeSlideIn } from "@/components/onboarding/fade-slide-in";
import { Headline } from "@/components/onboarding/headline";
import { LinkButton } from "@/components/onboarding/link-button";
import { ScreenShell } from "@/components/onboarding/screen-shell";
import { Button } from "@/components/ui/button";
import { useOnboardingNav } from "@/hooks/use-onboarding-nav";
import { useOnboardingState } from "@/hooks/use-onboarding-state";
import {
  requestLocationPermission,
  requestNotificationPermission,
} from "@/hooks/use-permissions";

const PERMS = [
  {
    icon: "compass-outline" as const,
    numeral: "١",
    title: "Where you stand",
    detail: "Your times match your sky.",
  },
  {
    icon: "notifications-outline" as const,
    numeral: "٢",
    title: "When to call",
    detail: "One quiet adhan before each salah.",
  },
];

export default function Permissions() {
  const { dispatch } = useOnboardingState();
  const { next } = useOnboardingNav();
  const [busy, setBusy] = useState(false);

  async function allow() {
    setBusy(true);
    try {
      const loc = await requestLocationPermission();
      const notif = await requestNotificationPermission();
      dispatch({
        type: "SET_FIELD",
        payload: { locationGranted: loc, notifGranted: notif },
      });
      next();
    } catch {
      // Unexpected permission throw — advance rather than wedging busy=true.
      next();
    } finally {
      setBusy(false);
    }
  }

  function skip() {
    dispatch({
      type: "SET_FIELD",
      payload: { locationGranted: false, notifGranted: false },
    });
    next();
  }

  return (
    <ScreenShell
      footer={
        <View className="gap-sm" style={{ paddingHorizontal: 8 }}>
          <Button
            disabled={busy}
            label={busy ? "Asking…" : "Allow both"}
            onPress={allow}
          />
          <LinkButton label="Skip for now" onPress={skip} />
        </View>
      }
      scroll={false}
    >
      <View
        className="flex-1"
        style={{ width: "100%", maxWidth: 360, alignSelf: "center" }}
      >
        <FadeSlideIn delay={80}>
          <View className="items-center" style={{ paddingTop: 8 }}>
            <Text
              className="font-serif text-ink"
              style={{ fontSize: 26, lineHeight: 32 }}
            >
              ﷽
            </Text>
          </View>
        </FadeSlideIn>

        <FadeSlideIn delay={220}>
          <View style={{ marginTop: 24 }}>
            <Headline align="center" size="h1">
              {"Two needs.\nOne salah."}
            </Headline>
            <Text
              className="text-center font-sans text-tertiary"
              style={{
                marginTop: 8,
                fontSize: 13,
                lineHeight: 18,
                fontStyle: "italic",
              }}
            >
              Both lead you to prayer.
            </Text>
          </View>
        </FadeSlideIn>

        <FadeSlideIn delay={340}>
          <View className="flex-row" style={{ marginTop: 28, gap: 12 }}>
            {PERMS.map((p) => (
              <PillarCard
                detail={p.detail}
                icon={p.icon}
                key={p.title}
                numeral={p.numeral}
                title={p.title}
              />
            ))}
          </View>
        </FadeSlideIn>

        <FadeSlideIn delay={500}>
          <View className="mt-md flex-row items-center justify-center gap-sm">
            <Reassure label="No tracking" />
            <Dot />
            <Reassure label="Revoke any time" />
          </View>
        </FadeSlideIn>

        <View style={{ flex: 1 }} />
      </View>
    </ScreenShell>
  );
}

function PillarCard({
  icon,
  numeral,
  title,
  detail,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  numeral: string;
  title: string;
  detail: string;
}) {
  return (
    <View
      className="rounded-lg border border-neutral bg-surface"
      style={{
        flex: 1,
        paddingHorizontal: 14,
        paddingTop: 14,
        paddingBottom: 16,
      }}
    >
      <View className="flex-row items-center justify-between">
        <Text
          className="font-serif text-primary"
          style={{ fontSize: 16, lineHeight: 20 }}
        >
          {numeral}
        </Text>
        <View
          className="bg-primary"
          style={{ width: 14, height: 1, opacity: 0.6 }}
        />
      </View>
      <View style={{ marginTop: 22, alignItems: "flex-start" }}>
        <Ionicons color="#29603E" name={icon} size={26} />
      </View>
      <Text
        className="font-serif text-ink"
        style={{ marginTop: 12, fontSize: 17, lineHeight: 22 }}
      >
        {title}
      </Text>
      <Text
        className="font-sans text-tertiary"
        style={{ marginTop: 6, fontSize: 12, lineHeight: 17 }}
      >
        {detail}
      </Text>
    </View>
  );
}

function Reassure({ label }: { label: string }) {
  return <Text className="font-sans text-caption text-tertiary">{label}</Text>;
}

function Dot() {
  return (
    <View
      className="bg-neutral"
      style={{ width: 3, height: 3, borderRadius: 2 }}
    />
  );
}
