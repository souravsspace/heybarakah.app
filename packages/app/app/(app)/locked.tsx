import { useMemo } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";

interface LockedApp {
  id: string;
  name: string;
  sf: string;
  tint: string;
}

const APPS: LockedApp[] = [
  { id: "instagram", name: "Instagram", sf: "camera.fill", tint: "#E1306C" },
  {
    id: "tiktok",
    name: "TikTok",
    sf: "music.note",
    tint: "#000000",
  },
  { id: "x", name: "X", sf: "xmark", tint: "#000000" },
  {
    id: "youtube",
    name: "YouTube",
    sf: "play.rectangle.fill",
    tint: "#FF0000",
  },
  {
    id: "facebook",
    name: "Facebook",
    sf: "person.2.fill",
    tint: "#1877F2",
  },
  {
    id: "snapchat",
    name: "Snapchat",
    sf: "bolt.fill",
    tint: "#FFFC00",
  },
  {
    id: "reddit",
    name: "Reddit",
    sf: "bubble.left.and.bubble.right.fill",
    tint: "#FF4500",
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    sf: "phone.fill",
    tint: "#25D366",
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

  const stats = useMemo(() => {
    const total = APPS.length;
    const upcoming = nextPrayer ? fmt12(nextPrayer.time) : "—";
    return { total, upcoming };
  }, [nextPrayer]);

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-md" style={{ paddingTop: 8, gap: 4 }}>
          <Text
            style={{
              fontSize: 10,
              fontWeight: "700",
              letterSpacing: 2.4,
              color: "#6B7280",
              textTransform: "uppercase",
            }}
          >
            Locked apps
          </Text>
          <Text
            className="font-serif text-ink"
            style={{ fontSize: 28, lineHeight: 34 }}
          >
            Quiet at salah.
          </Text>
        </View>

        <View
          className="mx-md"
          style={{
            marginTop: 20,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: "#E5E7EB",
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
                color: "#6B7280",
                textTransform: "uppercase",
              }}
            >
              Apps locked
            </Text>
            <Text
              className="font-serif"
              style={{
                fontSize: 32,
                color: "#000",
                fontVariant: ["tabular-nums"],
              }}
            >
              {stats.total}
            </Text>
          </View>
          <View
            style={{ width: 1, backgroundColor: "#EFEFEF", marginVertical: 4 }}
          />
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 10,
                fontWeight: "700",
                letterSpacing: 1.6,
                color: "#6B7280",
                textTransform: "uppercase",
              }}
            >
              Next lock
            </Text>
            <Text
              className="font-serif"
              style={{
                fontSize: 32,
                color: "#000",
                fontVariant: ["tabular-nums"],
              }}
            >
              {stats.upcoming}
            </Text>
          </View>
        </View>

        <View className="px-md" style={{ marginTop: 28, gap: 12 }}>
          <Text
            style={{
              fontSize: 10,
              fontWeight: "700",
              letterSpacing: 2.4,
              color: "#6B7280",
              textTransform: "uppercase",
            }}
          >
            Apps
          </Text>

          <View
            style={{
              borderRadius: 20,
              borderWidth: 1,
              borderColor: "#E5E7EB",
              overflow: "hidden",
            }}
          >
            {APPS.map((app, i) => (
              <View
                key={app.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  gap: 14,
                  borderTopWidth: i === 0 ? 0 : 1,
                  borderTopColor: "#EFEFEF",
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    backgroundColor: `${app.tint}12`,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <IconSymbol
                    color={app.tint}
                    name={app.sf as never}
                    size={20}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{ fontSize: 16, fontWeight: "600", color: "#000" }}
                  >
                    {app.name}
                  </Text>
                  <Text
                    style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}
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
                    backgroundColor: "#E8F0EA",
                  }}
                >
                  <View
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: "#29603E",
                    }}
                  />
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: "700",
                      color: "#29603E",
                      letterSpacing: 0.4,
                    }}
                  >
                    LOCKED
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {todayPrayerTimes ? (
          <View className="px-md" style={{ marginTop: 28 }}>
            <View
              style={{
                borderRadius: 20,
                backgroundColor: "#FAFAF7",
                padding: 20,
                gap: 6,
              }}
            >
              <Text
                className="font-serif"
                style={{ fontSize: 18, color: "#000" }}
              >
                How locking works
              </Text>
              <Text style={{ fontSize: 14, color: "#6B7280", lineHeight: 20 }}>
                Five times a day, from adhan through iqama, these apps will not
                open. Calls, messages, and the Qur'an stay reachable.
              </Text>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
