import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Text, useWindowDimensions, View } from "react-native";
import { BodyText } from "@/components/onboarding/body-text";
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

const SCREEN_PAD_X = 24;

const PERMS = [
  {
    icon: "location-outline" as const,
    title: "Location",
    detail: "Accurate prayer times for where you are.",
  },
  {
    icon: "notifications-outline" as const,
    title: "Notifications",
    detail: "A quiet adhan one minute before each lock.",
  },
];

export default function Permissions() {
  const { dispatch } = useOnboardingState();
  const { next } = useOnboardingNav();
  const { width } = useWindowDimensions();
  const fullWidth = width - SCREEN_PAD_X * 2;
  const [busy, setBusy] = useState(false);

  async function allow() {
    setBusy(true);
    const loc = await requestLocationPermission();
    const notif = await requestNotificationPermission();
    dispatch({
      type: "SET_FIELD",
      payload: { locationGranted: loc, notifGranted: notif },
    });
    setBusy(false);
    next();
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
      <FadeSlideIn className="flex-1 items-center gap-md" delay={120}>
        <View className="items-center gap-[2px]">
          <Headline size="h1">{"Two quiet\npermissions."}</Headline>
          <BodyText size="sm" tone="muted">
            Both are needed to lock your phone at {"\n"} the right moment, in
            the right place.
          </BodyText>
        </View>

        <FadeSlideIn delay={260}>
          <View
            className="rounded-2xl border border-neutral bg-surface"
            style={{
              width: fullWidth,
              paddingHorizontal: 18,
              paddingTop: 4,
              paddingBottom: 4,
            }}
          >
            {PERMS.map((p, i) => (
              <PermRow
                detail={p.detail}
                icon={p.icon}
                isLast={i === PERMS.length - 1}
                key={p.title}
                title={p.title}
              />
            ))}
          </View>
        </FadeSlideIn>

        <FadeSlideIn delay={380}>
          <View className="mt-xs flex-row items-center gap-sm">
            <Reassure label="No tracking" />
            <Dot />
            <Reassure label="Revoke any time" />
          </View>
        </FadeSlideIn>
      </FadeSlideIn>
    </ScreenShell>
  );
}

function PermRow({
  icon,
  title,
  detail,
  isLast,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  detail: string;
  isLast: boolean;
}) {
  return (
    <View>
      <View
        className="flex-row items-center"
        style={{ paddingVertical: 18, gap: 14 }}
      >
        <View
          className="items-center justify-center"
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            backgroundColor: "rgba(41,96,62,0.07)",
          }}
        >
          <Ionicons color="#29603E" name={icon} size={20} />
        </View>
        <View className="flex-1">
          <View className="flex-row items-center justify-between">
            <Text
              className="font-sans text-ink"
              style={{ fontSize: 15, fontWeight: "600", letterSpacing: -0.1 }}
            >
              {title}
            </Text>
            <Text
              className="font-sans text-tertiary"
              style={{ fontSize: 10, letterSpacing: 1.4, fontWeight: "700" }}
            >
              REQUIRED
            </Text>
          </View>
          <Text
            className="font-sans text-tertiary"
            style={{ fontSize: 13, lineHeight: 18, marginTop: 2 }}
          >
            {detail}
          </Text>
        </View>
      </View>
      {isLast ? null : (
        <View style={{ height: 1, backgroundColor: "#EFEFEF" }} />
      )}
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
