import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AreaChart } from "@/components/area-chart";

const WEEK = [
  { label: "Mon", value: 4 },
  { label: "Tue", value: 5 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 5 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 4 },
  { label: "Sun", value: 5 },
];

const PRAYER_BREAKDOWN = [
  { name: "Fajr", value: 5, of: 7 },
  { name: "Dhuhr", value: 7, of: 7 },
  { name: "Asr", value: 6, of: 7 },
  { name: "Maghrib", value: 7, of: 7 },
  { name: "Isha", value: 6, of: 7 },
];

export default function Progress() {
  const total = WEEK.reduce((s, d) => s + d.value, 0);
  const possible = WEEK.length * 5;
  const pct = Math.round((total / possible) * 100);
  const streak = 12;

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
            Progress
          </Text>
          <Text
            className="font-serif text-ink"
            style={{ fontSize: 28, lineHeight: 34 }}
          >
            This week.
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
              On time
            </Text>
            <Text
              className="font-serif"
              style={{
                fontSize: 36,
                color: "#000",
                fontVariant: ["tabular-nums"],
              }}
            >
              {pct}%
            </Text>
            <Text style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>
              {total} of {possible} prayers
            </Text>
          </View>
          <View
            style={{ width: 1, backgroundColor: "#EFEFEF", marginVertical: 4 }}
          />
          <View style={{ flex: 1, paddingLeft: 20 }}>
            <Text
              style={{
                fontSize: 10,
                fontWeight: "700",
                letterSpacing: 1.6,
                color: "#6B7280",
                textTransform: "uppercase",
              }}
            >
              Streak
            </Text>
            <Text
              className="font-serif"
              style={{
                fontSize: 36,
                color: "#000",
                fontVariant: ["tabular-nums"],
              }}
            >
              {streak}
            </Text>
            <Text style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>
              days, mā shāʾ Allāh
            </Text>
          </View>
        </View>

        <View
          className="mx-md"
          style={{
            marginTop: 16,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: "#E5E7EB",
            padding: 16,
            paddingBottom: 8,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 4,
              paddingHorizontal: 4,
            }}
          >
            <Text
              style={{
                fontSize: 10,
                fontWeight: "700",
                letterSpacing: 1.6,
                color: "#6B7280",
                textTransform: "uppercase",
              }}
            >
              Daily prayers
            </Text>
            <Text style={{ fontSize: 11, color: "#6B7280" }}>last 7 days</Text>
          </View>
          <AreaChart data={WEEK} max={5} />
        </View>

        <View className="px-md" style={{ marginTop: 24, gap: 12 }}>
          <Text
            style={{
              fontSize: 10,
              fontWeight: "700",
              letterSpacing: 2.4,
              color: "#6B7280",
              textTransform: "uppercase",
            }}
          >
            By prayer
          </Text>
          <View
            style={{
              borderRadius: 20,
              borderWidth: 1,
              borderColor: "#E5E7EB",
              overflow: "hidden",
            }}
          >
            {PRAYER_BREAKDOWN.map((p, i) => {
              const ratio = p.value / p.of;
              return (
                <View
                  key={p.name}
                  style={{
                    paddingHorizontal: 20,
                    paddingVertical: 14,
                    borderTopWidth: i === 0 ? 0 : 1,
                    borderTopColor: "#EFEFEF",
                    gap: 8,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text
                      style={{ fontSize: 15, fontWeight: "600", color: "#000" }}
                    >
                      {p.name}
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: "#29603E",
                        fontVariant: ["tabular-nums"],
                      }}
                    >
                      {p.value}/{p.of}
                    </Text>
                  </View>
                  <View
                    style={{
                      height: 4,
                      borderRadius: 999,
                      backgroundColor: "#F5F5F4",
                      overflow: "hidden",
                    }}
                  >
                    <View
                      style={{
                        height: "100%",
                        width: `${ratio * 100}%`,
                        backgroundColor: "#29603E",
                      }}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
