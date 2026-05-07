import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { FadeSlideIn } from "@/components/onboarding/fade-slide-in";
import { Headline } from "@/components/onboarding/headline";
import { ScreenShell } from "@/components/onboarding/screen-shell";
import { useOnboardingNav } from "@/hooks/use-onboarding-nav";

const SCREEN_PAD_X = 24;
const TOTAL_MS = 2200;

const STAGES = [
  "Reading your location",
  "Aligning fiqh & madhab",
  "Computing sunrise & sunset",
  "Mapping prayer windows",
  "Locking your plan",
];

type StageStatus = "done" | "active" | "pending";

function getStageStatus(index: number, active: number): StageStatus {
  if (index < active) return "done";
  if (index === active) return "active";
  return "pending";
}

function getStageTextColor(status: StageStatus) {
  if (status === "pending") return "#9CA3AF";
  if (status === "active") return "#000000";
  return "#6B7280";
}

export default function Calculating() {
  const { next } = useOnboardingNav();
  const { width } = useWindowDimensions();
  const fullWidth = width - SCREEN_PAD_X * 2;
  const [active, setActive] = useState(0);
  const progress = useRef(new Animated.Value(0)).current;
  const nextRef = useRef(next);
  nextRef.current = next;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: TOTAL_MS,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();

    const step = TOTAL_MS / STAGES.length;
    const interval = setInterval(() => {
      setActive((i) => Math.min(i + 1, STAGES.length));
    }, step);

    const t = setTimeout(() => nextRef.current(), TOTAL_MS);
    return () => {
      clearTimeout(t);
      clearInterval(interval);
    };
  }, [progress]);

  const barWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <ScreenShell showBack={false}>
      <FadeSlideIn className="flex-1 items-center gap-md">
        <View
          className="items-center"
          style={{ width: fullWidth, marginTop: 24 }}
        >
          <View
            style={{
              width: 28,
              height: 1,
              backgroundColor: "#29603E",
              marginBottom: 10,
            }}
          />
          <Text
            className="font-sans text-tertiary"
            style={{ fontSize: 10, letterSpacing: 2, fontWeight: "700" }}
          >
            ONE MOMENT
          </Text>
          <View style={{ marginTop: 10 }}>
            <Headline align="center" size="h1">
              {"Building\nyour plan."}
            </Headline>
          </View>
        </View>

        <View
          style={{
            width: fullWidth,
            height: 2,
            backgroundColor: "#EFEFEF",
            borderRadius: 1,
            overflow: "hidden",
            marginTop: 8,
          }}
        >
          <Animated.View
            style={{
              width: barWidth,
              height: "100%",
              backgroundColor: "#29603E",
            }}
          />
        </View>

        <View
          className="rounded-2xl border border-neutral bg-surface"
          style={{
            width: fullWidth,
            paddingHorizontal: 18,
            paddingTop: 4,
            paddingBottom: 4,
            marginTop: 8,
          }}
        >
          {STAGES.map((label, i) => {
            const status = getStageStatus(i, active);
            return (
              <StageRow
                isLast={i === STAGES.length - 1}
                key={label}
                label={label}
                status={status}
              />
            );
          })}
        </View>
      </FadeSlideIn>
    </ScreenShell>
  );
}

function StageRow({
  label,
  status,
  isLast,
}: {
  label: string;
  status: StageStatus;
  isLast: boolean;
}) {
  return (
    <View>
      <View
        className="flex-row items-center"
        style={{ paddingVertical: 14, gap: 14 }}
      >
        <StatusIcon status={status} />
        <Text
          className="font-sans"
          style={{
            flex: 1,
            fontSize: 14,
            fontWeight: status === "active" ? "600" : "500",
            color: getStageTextColor(status),
            letterSpacing: -0.1,
          }}
        >
          {label}
        </Text>
        {status === "active" ? <Pulse /> : null}
      </View>
      {isLast ? null : (
        <View style={{ height: 1, backgroundColor: "#EFEFEF" }} />
      )}
    </View>
  );
}

function StatusIcon({ status }: { status: StageStatus }) {
  if (status === "done") {
    return (
      <View
        className="items-center justify-center"
        style={{
          width: 22,
          height: 22,
          borderRadius: 11,
          backgroundColor: "#29603E",
        }}
      >
        <Ionicons color="#FFFFFF" name="checkmark" size={14} />
      </View>
    );
  }
  if (status === "active") {
    return (
      <View
        className="items-center justify-center"
        style={{
          width: 22,
          height: 22,
          borderRadius: 11,
          borderWidth: 1.5,
          borderColor: "#29603E",
        }}
      >
        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: "#29603E",
          }}
        />
      </View>
    );
  }
  return (
    <View
      style={{
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 1,
        borderColor: "#E5E7EB",
      }}
    />
  );
}

function Pulse() {
  const opacity = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);
  return (
    <Animated.View style={{ opacity, flexDirection: "row", gap: 3 }}>
      <Tick />
      <Tick />
      <Tick />
    </Animated.View>
  );
}

function Tick() {
  return (
    <View
      style={{
        width: 3,
        height: 3,
        borderRadius: 2,
        backgroundColor: "#29603E",
      }}
    />
  );
}
