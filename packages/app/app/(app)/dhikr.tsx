import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Preset {
  arabic: string;
  id: string;
  meaning: string;
  target: number;
  translit: string;
}

const PRESETS: Preset[] = [
  {
    id: "subhanallah",
    arabic: "سُبْحَانَ ٱللَّٰه",
    translit: "Subḥān Allāh",
    meaning: "Glory be to Allah",
    target: 33,
  },
  {
    id: "alhamdulillah",
    arabic: "ٱلْحَمْدُ لِلَّٰه",
    translit: "Al-ḥamdu lillāh",
    meaning: "All praise is for Allah",
    target: 33,
  },
  {
    id: "allahuakbar",
    arabic: "ٱللَّٰهُ أَكْبَر",
    translit: "Allāhu akbar",
    meaning: "Allah is the greatest",
    target: 34,
  },
  {
    id: "lailaha",
    arabic: "لَا إِلَٰهَ إِلَّا ٱللَّٰه",
    translit: "Lā ilāha illā Allāh",
    meaning: "There is no god but Allah",
    target: 100,
  },
];

export default function Dhikr() {
  const [activeId, setActiveId] = useState(PRESETS[0].id);
  const [count, setCount] = useState(0);

  const active = useMemo(
    () => PRESETS.find((p) => p.id === activeId) ?? PRESETS[0],
    [activeId]
  );

  useEffect(() => {
    setCount(0);
  }, [activeId]);

  const progress = Math.min(1, count / active.target);
  const complete = count >= active.target;

  const tap = useCallback(() => {
    Haptics.impactAsync(
      complete
        ? Haptics.ImpactFeedbackStyle.Heavy
        : Haptics.ImpactFeedbackStyle.Light
    ).catch(() => undefined);
    setCount((c) => c + 1);
  }, [complete]);

  const reset = useCallback(() => {
    Haptics.selectionAsync().catch(() => undefined);
    setCount(0);
  }, []);

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
            Tasbih
          </Text>
          <Text
            className="font-serif text-ink"
            style={{ fontSize: 28, lineHeight: 34 }}
          >
            Remember Him.
          </Text>
        </View>

        <View
          className="px-md"
          style={{
            marginTop: 20,
            flexDirection: "row",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          {PRESETS.map((p) => {
            const on = p.id === activeId;
            return (
              <Pressable
                key={p.id}
                onPress={() => {
                  Haptics.selectionAsync().catch(() => undefined);
                  setActiveId(p.id);
                }}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: on ? "#29603E" : "#E5E7EB",
                  backgroundColor: on ? "#E8F0EA" : "#FFFFFF",
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: on ? "#29603E" : "#000",
                  }}
                >
                  {p.translit}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View className="mx-md" style={{ marginTop: 24, alignItems: "center" }}>
          <Text
            style={{
              fontSize: 42,
              lineHeight: 56,
              color: "#000",
              textAlign: "center",
              fontFamily: "Inter",
              fontWeight: "500",
            }}
          >
            {active.arabic}
          </Text>
          <Text
            style={{
              marginTop: 6,
              fontSize: 14,
              color: "#6B7280",
              textAlign: "center",
            }}
          >
            {active.meaning}
          </Text>
        </View>

        <Pressable
          onPress={tap}
          style={({ pressed }) => ({
            marginTop: 32,
            marginHorizontal: 24,
            borderRadius: 999,
            aspectRatio: 1,
            backgroundColor: "#29603E",
            justifyContent: "center",
            alignItems: "center",
            transform: [{ scale: pressed ? 0.985 : 1 }],
          })}
        >
          <View
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              right: 12,
              bottom: 12,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.18)",
            }}
          />
          <Text
            style={{
              color: "rgba(255,255,255,0.7)",
              fontSize: 11,
              fontWeight: "700",
              letterSpacing: 2.4,
              textTransform: "uppercase",
            }}
          >
            Tap to count
          </Text>
          <Text
            className="font-serif"
            style={{
              color: "#FFFFFF",
              fontSize: 120,
              lineHeight: 130,
              fontVariant: ["tabular-nums"],
            }}
          >
            {count}
          </Text>
          <Text
            style={{
              color: "rgba(255,255,255,0.7)",
              fontSize: 14,
              fontVariant: ["tabular-nums"],
            }}
          >
            of {active.target}
          </Text>
        </Pressable>

        <View
          className="mx-md"
          style={{
            marginTop: 20,
            height: 4,
            borderRadius: 999,
            backgroundColor: "#F5F5F4",
            overflow: "hidden",
          }}
        >
          <View
            style={{
              height: "100%",
              width: `${progress * 100}%`,
              backgroundColor: "#29603E",
            }}
          />
        </View>

        <View
          className="mx-md"
          style={{
            marginTop: 16,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 13,
              color: "#6B7280",
              fontVariant: ["tabular-nums"],
            }}
          >
            {count >= active.target
              ? "Mashā Allāh, complete."
              : `${active.target - count} remaining`}
          </Text>
          <Pressable
            onPress={reset}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: "#E5E7EB",
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#000" }}>
              Reset
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
