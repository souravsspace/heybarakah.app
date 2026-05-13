import { StatusBar } from "expo-status-bar";
import { useMemo } from "react";
import { Text, View } from "react-native";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScrollBlurHeader } from "@/components/scroll-blur-header";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useTheme } from "@/contexts/theme-context";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";

interface LockedApp {
  id: string;
  name: string;
  sf: string;
  tint: string;
  tintDark: string;
}

const APPS: LockedApp[] = [
  {
    id: "instagram",
    name: "Instagram",
    sf: "camera.fill",
    tint: "#E1306C",
    tintDark: "#FF5C8D",
  },
  {
    id: "tiktok",
    name: "TikTok",
    sf: "music.note",
    tint: "#000000",
    tintDark: "#FFFFFF",
  },
  {
    id: "x",
    name: "X",
    sf: "xmark",
    tint: "#000000",
    tintDark: "#FFFFFF",
  },
  {
    id: "youtube",
    name: "YouTube",
    sf: "play.rectangle.fill",
    tint: "#FF0000",
    tintDark: "#FF4D4D",
  },
  {
    id: "facebook",
    name: "Facebook",
    sf: "person.2.fill",
    tint: "#1877F2",
    tintDark: "#4A9CFF",
  },
  {
    id: "snapchat",
    name: "Snapchat",
    sf: "bolt.fill",
    tint: "#E0C200",
    tintDark: "#FFE74A",
  },
  {
    id: "reddit",
    name: "Reddit",
    sf: "bubble.left.and.bubble.right.fill",
    tint: "#FF4500",
    tintDark: "#FF7144",
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    sf: "phone.fill",
    tint: "#25D366",
    tintDark: "#4FD980",
  },
];

function fmt12(time: string) {
  const [h, m] = time.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) {
    return time;
  }
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${period}`;
}

export default function Locked() {
  const { nextPrayer, todayPrayerTimes } = usePrayerTimes();
  const { colors, scheme } = useTheme();
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
    },
  });

  const stats = useMemo(() => {
    const total = APPS.length;
    const upcoming = nextPrayer ? fmt12(nextPrayer.time) : "—";
    return { total, upcoming };
  }, [nextPrayer]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      <Animated.ScrollView
        contentContainerStyle={{ paddingTop: insets.top, paddingBottom: 140 }}
        onScroll={onScroll}
        scrollEventThrottle={16}
        scrollIndicatorInsets={{ top: insets.top }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 20, paddingTop: 8, gap: 4 }}>
          <Text
            style={{
              fontSize: 10,
              fontWeight: "700",
              letterSpacing: 2.4,
              color: colors.inkMuted,
              textTransform: "uppercase",
            }}
          >
            Locked apps
          </Text>
          <Text
            style={{
              fontFamily: "LibreBaskerville-Bold",
              fontSize: 28,
              lineHeight: 34,
              color: colors.ink,
            }}
          >
            Quiet at salah.
          </Text>
        </View>

        <View
          style={{
            marginHorizontal: 20,
            marginTop: 20,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.card,
            padding: 20,
            flexDirection: "row",
            gap: 24,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 10,
                fontWeight: "700",
                letterSpacing: 1.6,
                color: colors.inkMuted,
                textTransform: "uppercase",
              }}
            >
              Apps locked
            </Text>
            <Text
              style={{
                fontFamily: "LibreBaskerville-Bold",
                fontSize: 32,
                color: colors.ink,
                fontVariant: ["tabular-nums"],
              }}
            >
              {stats.total}
            </Text>
          </View>
          <View
            style={{
              width: 1,
              backgroundColor: colors.divider,
              marginVertical: 4,
            }}
          />
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 10,
                fontWeight: "700",
                letterSpacing: 1.6,
                color: colors.inkMuted,
                textTransform: "uppercase",
              }}
            >
              Next lock
            </Text>
            <Text
              style={{
                fontFamily: "LibreBaskerville-Bold",
                fontSize: 32,
                color: colors.ink,
                fontVariant: ["tabular-nums"],
              }}
            >
              {stats.upcoming}
            </Text>
          </View>
        </View>

        <View style={{ paddingHorizontal: 20, marginTop: 28, gap: 12 }}>
          <Text
            style={{
              fontSize: 10,
              fontWeight: "700",
              letterSpacing: 2.4,
              color: colors.inkMuted,
              textTransform: "uppercase",
            }}
          >
            Apps
          </Text>

          <View
            style={{
              borderRadius: 20,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.card,
              overflow: "hidden",
            }}
          >
            {APPS.map((app, i) => {
              const tint = scheme === "dark" ? app.tintDark : app.tint;
              return (
                <View
                  key={app.id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    gap: 14,
                    borderTopWidth: i === 0 ? 0 : 1,
                    borderTopColor: colors.divider,
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      backgroundColor: `${tint}22`,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <IconSymbol color={tint} name={app.sf as never} size={20} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "600",
                        color: colors.ink,
                      }}
                    >
                      {app.name}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        color: colors.inkMuted,
                        marginTop: 2,
                      }}
                    >
                      Locks at every prayer window
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                      borderRadius: 999,
                      backgroundColor: colors.primarySoft,
                    }}
                  >
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
                        fontSize: 11,
                        fontWeight: "700",
                        color: colors.primary,
                        letterSpacing: 0.4,
                      }}
                    >
                      LOCKED
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {todayPrayerTimes ? (
          <View style={{ paddingHorizontal: 20, marginTop: 28 }}>
            <View
              style={{
                borderRadius: 20,
                backgroundColor: colors.surfaceSoft,
                borderWidth: 1,
                borderColor: colors.border,
                padding: 20,
                gap: 6,
              }}
            >
              <Text
                style={{
                  fontFamily: "LibreBaskerville-Bold",
                  fontSize: 18,
                  color: colors.ink,
                }}
              >
                How locking works
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: colors.inkMuted,
                  lineHeight: 20,
                }}
              >
                Five times a day, from adhan through iqama, these apps will not
                open. Calls, messages, and the Qur'an stay reachable.
              </Text>
            </View>
          </View>
        ) : null}
      </Animated.ScrollView>
      <ScrollBlurHeader scrollY={scrollY} />
    </View>
  );
}
