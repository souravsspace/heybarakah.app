import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Line, Polygon } from "react-native-svg";
import { FadeSlideIn } from "@/components/onboarding/fade-slide-in";
import { BarakahMark } from "@/components/onboarding/illustrations/barakah-mark";
import { useUser } from "@/contexts/user-context";
import { useSubscription } from "@/lib/subscription";

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
        opacity: 1,
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

export default function NoActiveSub() {
  const router = useRouter();
  const { user } = useUser();
  const { restore } = useSubscription();
  const [isRestoring, setIsRestoring] = useState(false);

  function useDifferentAccount() {
    // Full sign-out (RevenueCat + Better Auth), reset onboarding, clear the
    // account cache, then land on the onboarding welcome flow. Shared with the
    // profile "Log out" action so both behave identically.
    router.replace("/logging-out");
  }

  async function onRestore() {
    setIsRestoring(true);
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
    } finally {
      setIsRestoring(false);
    }
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
                Your access has paused
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
                  The steadfast in salah never walk alone.
                </Text>
                <View style={{ backgroundColor: GOLD, flex: 1, height: 0.8 }} />
              </View>

              {user?.email ? (
                <View
                  style={{
                    borderColor: "rgba(245,235,219,0.25)",
                    borderRadius: 999,
                    borderWidth: 1,
                    paddingHorizontal: 16,
                    paddingVertical: 7,
                  }}
                >
                  <Text
                    className="font-sans"
                    style={{
                      color: "rgba(245,235,219,0.82)",
                      fontSize: 13,
                      fontWeight: "500",
                      letterSpacing: 0.1,
                    }}
                  >
                    {user.email}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>
      </FadeSlideIn>

      <View
        style={{
          gap: 14,
          paddingBottom: 24,
          paddingHorizontal: 24,
        }}
      >
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            Haptics.selectionAsync().catch(() => undefined);
            router.push("/(onboarding)/paywall/plans");
          }}
          style={({ pressed }) => ({
            alignItems: "center",
            backgroundColor: CREAM,
            borderRadius: 20,
            justifyContent: "center",
            minHeight: 64,
            opacity: pressed ? 0.92 : 1,
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
            VIEW PLANS
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          disabled={isRestoring}
          onPress={onRestore}
          style={({ pressed }) => ({
            alignItems: "center",
            backgroundColor: "transparent",
            borderColor: "rgba(245,235,219,0.3)",
            borderRadius: 20,
            borderWidth: 1,
            justifyContent: "center",
            minHeight: 64,
            opacity: pressed ? 0.92 : 1,
          })}
        >
          <Text
            className="font-sans"
            style={{
              color: CREAM,
              fontSize: 14,
              fontWeight: "700",
              letterSpacing: 0.1,
            }}
          >
            {isRestoring ? "Restoring..." : "Restore purchase"}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          hitSlop={12}
          onPress={useDifferentAccount}
          style={{ alignItems: "center", marginTop: 8 }}
        >
          <Text
            className="font-sans"
            style={{
              color: "rgba(245,235,219,0.74)",
              fontSize: 13,
              letterSpacing: 0.1,
              textDecorationLine: "underline",
            }}
          >
            Use a different account
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
