import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Text, View } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import { BodyText } from "@/components/onboarding/body-text";
import { FadeSlideIn } from "@/components/onboarding/fade-slide-in";
import { Headline } from "@/components/onboarding/headline";
import { DeviceFrame } from "@/components/onboarding/illustrations/device-frame";
import { ScreenShell } from "@/components/onboarding/screen-shell";
import { Button } from "@/components/ui/button";
import { useOnboardingNav } from "@/hooks/use-onboarding-nav";

export default function LockPreview() {
  const { next } = useOnboardingNav();

  return (
    <ScreenShell
      footer={
        <View style={{ paddingHorizontal: 8 }}>
          <Button label="I want this" onPress={next} />
        </View>
      }
      scroll={false}
    >
      <FadeSlideIn className="flex-1 items-center gap-md" delay={120}>
        <View className="items-center gap-[2px]">
          <Headline size="h1">{"This is what\nsalah looks like."}</Headline>
          <BodyText size="sm" tone="muted">
            During prayer, your home screen disappears.
          </BodyText>
        </View>

        <FadeSlideIn delay={240}>
          <DeviceFrame height={500} width={270}>
            <LockScreen />
          </DeviceFrame>
        </FadeSlideIn>

        <View className="mt-auto flex-row items-center gap-[6px]">
          <Ionicons color="#6B7280" name="lock-closed-outline" size={12} />
          <Text
            className="font-sans text-caption text-tertiary"
            style={{ letterSpacing: 0.4 }}
          >
            Lock applies only inside salah windows.
          </Text>
        </View>
      </FadeSlideIn>
    </ScreenShell>
  );
}

function LockScreen() {
  return (
    <View className="flex-1 bg-primary">
      <BackgroundHalo />

      <View
        className="flex-row items-center justify-between"
        style={{
          position: "absolute",
          top: 14,
          left: 16,
          right: 16,
          height: 16,
          zIndex: 2,
        }}
      >
        <Text
          className="font-sans text-surface"
          style={{ fontSize: 12, fontWeight: "600", letterSpacing: -0.2 }}
        >
          5:42
        </Text>
        <View className="flex-row items-center gap-[5px]">
          <Image
            contentFit="contain"
            source={require("../../assets/images/onboarding/lock-preview/dual-cell-signals.png")}
            style={{ width: 16, height: 10 }}
            tintColor="#FFFFFF"
            transition={0}
          />
          <Image
            contentFit="contain"
            source={require("../../assets/images/onboarding/lock-preview/wifi.png")}
            style={{ width: 13, height: 10 }}
            tintColor="#FFFFFF"
            transition={0}
          />
          <Image
            contentFit="contain"
            source={require("../../assets/images/onboarding/lock-preview/battery.png")}
            style={{ width: 22, height: 11 }}
            tintColor="#FFFFFF"
            transition={0}
          />
        </View>
      </View>

      <View
        className="flex-1 items-center justify-center"
        style={{ paddingHorizontal: 20, paddingTop: 44 }}
      >
        <View className="flex-row items-center gap-[8px]">
          <View
            style={{
              width: 18,
              height: 1,
              backgroundColor: "rgba(255,255,255,0.35)",
            }}
          />
          <Text
            className="font-sans text-surface"
            style={{
              fontSize: 9,
              letterSpacing: 2.4,
              opacity: 0.85,
              fontWeight: "700",
            }}
          >
            MAGHRIB
          </Text>
          <View
            style={{
              width: 18,
              height: 1,
              backgroundColor: "rgba(255,255,255,0.35)",
            }}
          />
        </View>

        <View style={{ marginTop: 18 }}>
          <CountdownRing progress={0.62} size={146} time="18:42" />
        </View>

        <Text
          className="mt-md text-center font-serif text-surface"
          style={{ fontSize: 26, lineHeight: 30 }}
        >
          Return to{"\n"}Allah
        </Text>

        <View
          style={{
            marginTop: 14,
            height: 1,
            width: 32,
            backgroundColor: "rgba(255,255,255,0.3)",
          }}
        />

        <Text
          className="mt-sm text-center text-surface"
          style={{
            fontSize: 13,
            lineHeight: 22,
            opacity: 0.78,
            writingDirection: "rtl",
          }}
        >
          إِنَّ ٱلصَّلَوٰةَ تَنْهَىٰ عَنِ ٱلْفَحْشَآءِ
        </Text>
      </View>

      <View
        style={{
          paddingBottom: 16,
          alignItems: "center",
        }}
      >
        <Text
          className="font-sans text-surface"
          style={{
            fontSize: 9,
            opacity: 0.45,
            letterSpacing: 2,
            fontWeight: "700",
          }}
        >
          BARAKAH
        </Text>
      </View>
    </View>
  );
}

function BackgroundHalo() {
  return (
    <Svg
      height="100%"
      pointerEvents="none"
      style={{ position: "absolute", inset: 0 }}
      width="100%"
    >
      <Defs>
        <LinearGradient id="halo" x1="0.5" x2="0.5" y1="0" y2="1">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.08} />
          <Stop offset="0.5" stopColor="#FFFFFF" stopOpacity={0.02} />
          <Stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
        </LinearGradient>
      </Defs>
      <Circle cx="50%" cy="48%" fill="url(#halo)" r="130" />
    </Svg>
  );
}

function CountdownRing({
  size,
  progress,
  time,
}: {
  size: number;
  progress: number;
  time: string;
}) {
  const stroke = 2.5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - progress);
  const tickCount = 60;

  return (
    <View style={{ width: size, height: size }}>
      <Svg height={size} width={size}>
        {Array.from({ length: tickCount }).map((_, i) => {
          const angle = (i / tickCount) * Math.PI * 2 - Math.PI / 2;
          const inner = r - 5;
          const outer = r - 1;
          const x1 = size / 2 + Math.cos(angle) * inner;
          const y1 = size / 2 + Math.sin(angle) * inner;
          const x2 = size / 2 + Math.cos(angle) * outer;
          const y2 = size / 2 + Math.sin(angle) * outer;
          const isHour = i % 5 === 0;
          return (
            <Circle
              cx={(x1 + x2) / 2}
              cy={(y1 + y2) / 2}
              fill="#FFFFFF"
              key={`${x1}-${y1}`}
              opacity={isHour ? 0.55 : 0.22}
              r={isHour ? 0.9 : 0.5}
            />
          );
        })}

        <Circle
          cx={size / 2}
          cy={size / 2}
          fill="none"
          r={r}
          stroke="rgba(255,255,255,0.15)"
          strokeWidth={stroke}
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          fill="none"
          r={r}
          stroke="#FFFFFF"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          strokeWidth={stroke}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View
        className="absolute items-center justify-center"
        style={{ width: size, height: size }}
      >
        <Text
          className="font-sans text-surface"
          style={{
            fontSize: 8.5,
            letterSpacing: 1.6,
            opacity: 0.65,
            fontWeight: "700",
          }}
        >
          UNLOCKS IN
        </Text>
        <Text
          className="mt-[4px] font-serif text-surface"
          style={{ fontSize: 30, fontWeight: "700", lineHeight: 32 }}
        >
          {time}
        </Text>
        <Text
          className="mt-[2px] font-sans text-surface"
          style={{
            fontSize: 8.5,
            letterSpacing: 1.6,
            opacity: 0.55,
            fontWeight: "700",
          }}
        >
          MIN · SEC
        </Text>
      </View>
    </View>
  );
}
