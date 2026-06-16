import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Line, Polygon } from "react-native-svg";
import { FadeSlideIn } from "@/components/onboarding/fade-slide-in";
import { BarakahMark } from "@/components/onboarding/illustrations/barakah-mark";
import { hapticSelection } from "@/lib/haptics";
import { useOnline } from "@/lib/use-online";

const MOSQUE_GREEN = "#29603E";
const INK_GREEN = "#1B3F29";
const CREAM = "#F5EBDB";
const GOLD = "#C9A23A";

function KhatamWatermark() {
  return (
    <View
      pointerEvents="none"
      style={{
        alignItems: "center",
        height: 420,
        justifyContent: "center",
        position: "absolute",
        top: -72,
        width: 420,
      }}
    >
      <Svg height={420} viewBox="0 0 420 420" width={420}>
        <Polygon
          fill="none"
          points="210,28 338.7,81.3 392,210 338.7,338.7 210,392 81.3,338.7 28,210 81.3,81.3"
          stroke="rgba(245,235,219,0.08)"
          strokeWidth={1}
        />
        <Polygon
          fill="none"
          points="210,64 313.2,106.8 356,210 313.2,313.2 210,356 106.8,313.2 64,210 106.8,106.8"
          stroke="rgba(245,235,219,0.06)"
          strokeWidth={1}
        />
        <Polygon
          fill="none"
          points="210,38 331.6,210 210,382 88.4,210"
          stroke="rgba(245,235,219,0.09)"
          strokeWidth={0.8}
        />
        <Polygon
          fill="none"
          points="38,210 210,88.4 382,210 210,331.6"
          stroke="rgba(245,235,219,0.09)"
          strokeWidth={0.8}
        />
        <Line
          stroke="rgba(245,235,219,0.06)"
          strokeWidth={0.8}
          x1={210}
          x2={210}
          y1={28}
          y2={392}
        />
        <Line
          stroke="rgba(245,235,219,0.06)"
          strokeWidth={0.8}
          x1={28}
          x2={392}
          y1={210}
          y2={210}
        />
      </Svg>
    </View>
  );
}

export default function ReconnectRequired() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isOnline = useOnline();
  const [isChecking, setIsChecking] = useState(false);

  function onTryAgain() {
    hapticSelection();
    setIsChecking(true);
    // Mark the gate's inputs stale so they refetch once connectivity returns,
    // then re-enter the gate. Fire-and-forget: with the Expo online manager the
    // refetch is *paused* while offline, so awaiting would hang this button
    // forever. The gate re-evaluates on /home and routes back here if still
    // offline past the grace window.
    queryClient.invalidateQueries({ queryKey: ["cf", "me"] }).catch(() => {
      // refetch is paused while offline; nothing to surface here
    });
    queryClient
      .invalidateQueries({ queryKey: ["cf", "subscription"] })
      .catch(() => {
        // refetch is paused while offline; nothing to surface here
      });
    router.replace("/home");
  }

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      style={{ backgroundColor: MOSQUE_GREEN, flex: 1 }}
    >
      <StatusBar style="light" />
      <FadeSlideIn className="flex-1">
        <View
          style={{
            alignItems: "center",
            flex: 1,
            justifyContent: "center",
            overflow: "hidden",
            paddingHorizontal: 24,
            position: "relative",
          }}
        >
          <KhatamWatermark />

          <View style={{ alignItems: "center", gap: 30, width: "100%" }}>
            <BarakahMark color={CREAM} size={92} />

            <View style={{ alignItems: "center", gap: 20, width: "100%" }}>
              <Text
                className="font-serif"
                style={{
                  color: "#FFFFFF",
                  fontSize: 34,
                  lineHeight: 42,
                  textAlign: "center",
                }}
              >
                You've been offline a while
              </Text>

              <View
                style={{
                  alignItems: "center",
                  flexDirection: "row",
                  gap: 12,
                  maxWidth: 320,
                  width: "100%",
                }}
              >
                <View style={{ backgroundColor: GOLD, flex: 1, height: 0.8 }} />
                <Text
                  className="font-serif"
                  style={{
                    color: "rgba(245,235,219,0.86)",
                    flexShrink: 0,
                    fontSize: 13,
                    fontStyle: "italic",
                    lineHeight: 20,
                    textAlign: "center",
                  }}
                >
                  Reconnect to continue.
                </Text>
                <View style={{ backgroundColor: GOLD, flex: 1, height: 0.8 }} />
              </View>

              <Text
                className="font-sans"
                style={{
                  color: "rgba(245,235,219,0.82)",
                  fontSize: 15,
                  lineHeight: 24,
                  maxWidth: 320,
                  textAlign: "center",
                }}
              >
                We need to reach the internet to confirm your subscription.
                Connect to Wi-Fi or mobile data, then try again.
              </Text>
            </View>
          </View>
        </View>
      </FadeSlideIn>

      <View style={{ gap: 14, paddingBottom: 24, paddingHorizontal: 24 }}>
        <Pressable
          accessibilityLabel="Try again"
          accessibilityRole="button"
          accessibilityState={{ disabled: isChecking }}
          disabled={isChecking}
          onPress={onTryAgain}
          style={({ pressed }) => ({
            alignItems: "center",
            backgroundColor: CREAM,
            borderRadius: 20,
            justifyContent: "center",
            minHeight: 64,
            opacity: pressed || isChecking ? 0.92 : 1,
          })}
        >
          <Text
            className="font-sans"
            style={{
              color: INK_GREEN,
              fontSize: 14,
              fontWeight: "800",
              letterSpacing: 0.2,
            }}
          >
            {isChecking ? "CHECKING..." : "TRY AGAIN"}
          </Text>
        </Pressable>

        {isOnline ? null : (
          <Text
            className="font-sans"
            style={{
              color: "rgba(245,235,219,0.6)",
              fontSize: 12,
              letterSpacing: 0.1,
              textAlign: "center",
            }}
          >
            Still no connection detected.
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}
