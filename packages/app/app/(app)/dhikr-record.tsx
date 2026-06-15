import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Platform, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RecordMesh } from "@/components/meshes";
import { PRESETS, type Preset, useDhikr } from "@/contexts/dhikr-context";
import { useTheme } from "@/contexts/theme-context";
import { hapticSelection } from "@/lib/haptics";

const ROMAN = ["I", "II", "III", "IV"] as const;

export default function DhikrRecord() {
  const router = useRouter();
  const { colors, scheme } = useTheme();
  const insets = useSafeAreaInsets();
  const { activeIndex, goTo, grandTotal, resetSession, totals } = useDhikr();

  const close = () => {
    if (router.canGoBack()) {
      router.back();
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar
        style={
          Platform.OS === "ios" ? "light" : scheme === "dark" ? "light" : "dark"
        }
      />
      <RecordMesh dark={scheme === "dark"} />
      <View style={{ alignItems: "center", paddingTop: 10 }}>
        <View
          style={{
            width: 36,
            height: 4,
            borderRadius: 999,
            backgroundColor: colors.border,
          }}
        />
      </View>
      <ScrollView
        contentContainerStyle={{
          paddingTop: 18,
          paddingHorizontal: 24,
          paddingBottom: 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={{
            fontFamily: "LibreBaskerville-Bold",
            fontSize: 28,
            lineHeight: 34,
            color: colors.ink,
          }}
        >
          Tasbih
        </Text>
        <Text
          style={{
            marginTop: 4,
            fontSize: 10,
            fontWeight: "700",
            letterSpacing: 2.4,
            color: colors.inkMuted,
            textTransform: "uppercase",
          }}
        >
          Wird record
        </Text>

        <View
          style={{
            height: 1,
            backgroundColor: colors.divider,
            marginTop: 28,
            marginHorizontal: -24,
          }}
        />

        {PRESETS.map((p, i) =>
          i === activeIndex ? (
            <ActiveRow
              colors={colors}
              key={p.id}
              lifetime={totals[p.id] ?? 0}
              preset={p}
              roman={ROMAN[i % ROMAN.length]}
            />
          ) : (
            <CompactRow
              colors={colors}
              key={p.id}
              lifetime={totals[p.id] ?? 0}
              onPress={() => {
                hapticSelection();
                goTo(i);
                close();
              }}
              preset={p}
              roman={ROMAN[i % ROMAN.length]}
            />
          )
        )}

        <View
          style={{
            height: 1,
            backgroundColor: colors.divider,
            marginHorizontal: -24,
          }}
        />
      </ScrollView>

      <View
        style={{
          borderTopWidth: 1,
          borderTopColor: colors.divider,
          paddingHorizontal: 24,
          paddingTop: 14,
          paddingBottom: insets.bottom + 14,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text
          style={{
            fontSize: 11,
            fontWeight: "700",
            letterSpacing: 1.6,
            color: colors.inkMuted,
            textTransform: "uppercase",
            fontVariant: ["tabular-nums"],
          }}
        >
          {grandTotal.toLocaleString()} · all dhikr
        </Text>
        <View style={{ flexDirection: "row", gap: 20 }}>
          <Pressable
            accessibilityLabel="Reset session count"
            accessibilityRole="button"
            hitSlop={10}
            onPress={() => {
              resetSession();
              close();
            }}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: "700",
                letterSpacing: 1.6,
                color: colors.inkMuted,
                textTransform: "uppercase",
              }}
            >
              Reset session
            </Text>
          </Pressable>
          <Pressable
            accessibilityLabel="Close"
            accessibilityRole="button"
            hitSlop={10}
            onPress={close}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: "700",
                letterSpacing: 1.6,
                color: colors.primary,
                textTransform: "uppercase",
              }}
            >
              Done
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

interface RowProps {
  colors: ReturnType<typeof useTheme>["colors"];
  lifetime: number;
  preset: Preset;
  roman: (typeof ROMAN)[number];
}

function ActiveRow({ colors, lifetime, preset, roman }: RowProps) {
  return (
    <View
      style={{
        paddingTop: 28,
        paddingBottom: 28,
        paddingHorizontal: 24,
        marginHorizontal: -24,
        borderTopWidth: 1,
        borderTopColor: colors.divider,
      }}
    >
      <View style={{ flexDirection: "row", gap: 16, alignItems: "flex-start" }}>
        <Text
          numberOfLines={1}
          style={{
            width: 44,
            fontFamily: "LibreBaskerville-Bold",
            fontSize: 28,
            lineHeight: 32,
            color: colors.primary,
            textAlign: "left",
          }}
        >
          {roman}
        </Text>
        <View style={{ flex: 1, gap: 4 }}>
          <Text
            style={{
              fontFamily: "LibreBaskerville-Bold",
              fontSize: 24,
              lineHeight: 30,
              color: colors.ink,
            }}
          >
            {preset.name}
            <Text
              style={{
                fontFamily: "Inter",
                fontSize: 11,
                fontWeight: "700",
                letterSpacing: 1.6,
                color: colors.primary,
              }}
            >
              {"   · ACTIVE"}
            </Text>
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: colors.inkMuted,
              fontStyle: "italic",
            }}
          >
            {preset.meaning}
          </Text>
        </View>
      </View>

      <View style={{ alignItems: "center", marginTop: 22 }}>
        <Text
          style={{
            fontFamily: "Inter",
            fontSize: 42,
            lineHeight: 56,
            fontWeight: "500",
            color: colors.ink,
            textAlign: "center",
          }}
        >
          {preset.arabic}
        </Text>
        <Text
          style={{
            marginTop: 6,
            fontFamily: "Inter",
            fontStyle: "italic",
            fontSize: 15,
            fontWeight: "500",
            color: colors.inkMuted,
            textAlign: "center",
          }}
        >
          {preset.phonetic}
        </Text>
      </View>

      <View style={{ alignItems: "flex-end", marginTop: 18 }}>
        <Text
          style={{
            fontFamily: "LibreBaskerville-Bold",
            fontSize: 22,
            lineHeight: 26,
            color: colors.ink,
            fontVariant: ["tabular-nums"],
          }}
        >
          {lifetime.toLocaleString()}
        </Text>
        <Text
          style={{
            marginTop: 2,
            fontSize: 9,
            fontWeight: "700",
            letterSpacing: 1.6,
            color: colors.inkSubtle,
            textTransform: "uppercase",
          }}
        >
          Lifetime
        </Text>
      </View>
    </View>
  );
}

interface CompactRowProps extends RowProps {
  onPress: () => void;
}

function CompactRow({
  colors,
  lifetime,
  onPress,
  preset,
  roman,
}: CompactRowProps) {
  return (
    <Pressable
      accessibilityLabel={`Switch to ${preset.name}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
        paddingVertical: 18,
        paddingHorizontal: 24,
        marginHorizontal: -24,
        borderTopWidth: 1,
        borderTopColor: colors.divider,
        opacity: pressed ? 0.5 : 1,
      })}
    >
      <Text
        numberOfLines={1}
        style={{
          width: 36,
          fontFamily: "LibreBaskerville-Bold",
          fontSize: 16,
          lineHeight: 22,
          color: colors.inkSubtle,
        }}
      >
        {roman}
      </Text>
      <View style={{ flex: 1, gap: 3 }}>
        <Text
          style={{
            fontFamily: "LibreBaskerville-Bold",
            fontSize: 17,
            lineHeight: 22,
            color: colors.ink,
          }}
        >
          {preset.name}
        </Text>
        <Text
          style={{
            fontSize: 11,
            color: colors.inkMuted,
            fontStyle: "italic",
          }}
        >
          {preset.phonetic}
        </Text>
      </View>
      <Text
        style={{
          fontFamily: "Inter",
          fontSize: 16,
          fontWeight: "600",
          color: colors.ink,
          fontVariant: ["tabular-nums"],
        }}
      >
        {lifetime.toLocaleString()}
      </Text>
    </Pressable>
  );
}
