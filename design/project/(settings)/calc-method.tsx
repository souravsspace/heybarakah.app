import { api } from "@barakah/core/convex/_generated/api";
import { useMutation } from "convex/react";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { type ThemeColors, useTheme } from "@/contexts/theme-context";
import { useUser } from "@/contexts/user-context";

type Method =
  | "isna"
  | "mwl"
  | "umm-al-qura"
  | "egyptian"
  | "karachi"
  | "custom";

type Madhab = "hanafi" | "shafii" | "maliki" | "hanbali" | "none";

interface MethodOption {
  key: Method;
  region: string;
  title: string;
}

const METHODS: MethodOption[] = [
  {
    key: "mwl",
    title: "Muslim World League",
    region: "Europe, Far East, parts of US",
  },
  { key: "isna", title: "ISNA", region: "North America" },
  { key: "umm-al-qura", title: "Umm al-Qura", region: "Saudi Arabia" },
  {
    key: "egyptian",
    title: "Egyptian General Authority",
    region: "Africa, Levant",
  },
  { key: "karachi", title: "Karachi", region: "Pakistan, Bangladesh, India" },
  { key: "custom", title: "Custom", region: "Manual angle settings" },
];

const MADHAB_OPTIONS: { key: Madhab; label: string; note: string }[] = [
  { key: "hanafi", label: "Hanafi", note: "Asr at shadow length 2x" },
  { key: "shafii", label: "Shāfiʿī", note: "Asr at shadow length 1x" },
  { key: "maliki", label: "Mālikī", note: "Asr at shadow length 1x" },
  { key: "hanbali", label: "Ḥanbalī", note: "Asr at shadow length 1x" },
  { key: "none", label: "Not specified", note: "Use default (Shāfiʿī)" },
];

export default function CalcMethod() {
  const router = useRouter();
  const { colors, scheme } = useTheme();
  const { profile } = useUser();
  const upsertProfile = useMutation(api.lib.users.upsertProfile);
  const [saving, setSaving] = useState<Method | null>(null);
  const [savingMadhab, setSavingMadhab] = useState<Madhab | null>(null);

  const current = profile?.calcMethod ?? "mwl";
  const currentMadhab: Madhab = profile?.madhab ?? "none";

  const pick = async (m: Method) => {
    if (m === current || saving) {
      return;
    }
    setSaving(m);
    Haptics.selectionAsync().catch(() => undefined);
    try {
      await upsertProfile({ calcMethod: m });
    } finally {
      setSaving(null);
    }
  };

  const pickMadhab = async (m: Madhab) => {
    if (m === currentMadhab || savingMadhab) {
      return;
    }
    setSavingMadhab(m);
    Haptics.selectionAsync().catch(() => undefined);
    try {
      await upsertProfile({ madhab: m });
    } finally {
      setSavingMadhab(null);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <ScreenHeader
          colors={colors}
          onBack={() => router.back()}
          title="Calculation Method"
        />
        <ScrollView
          contentContainerStyle={{ paddingBottom: 80 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ paddingHorizontal: 20, marginTop: 8 }}>
            <Text
              style={{
                fontSize: 13,
                color: colors.inkMuted,
                lineHeight: 19,
                marginBottom: 18,
              }}
            >
              Sets fajr and isha angles. Choose the convention used in your
              region or by scholars you follow.
            </Text>

            <View
              style={{
                borderRadius: 16,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.card,
                overflow: "hidden",
              }}
            >
              {METHODS.map((m, i) => (
                <View key={m.key}>
                  {i > 0 ? <Divider colors={colors} /> : null}
                  <OptionRow
                    colors={colors}
                    disabled={!!saving}
                    onPress={() => pick(m.key)}
                    saving={saving === m.key}
                    selected={current === m.key}
                    subtitle={m.region}
                    title={m.title}
                  />
                </View>
              ))}
            </View>

            <Text
              style={{
                marginTop: 28,
                fontSize: 11,
                fontWeight: "700",
                letterSpacing: 2,
                color: colors.inkMuted,
                textTransform: "uppercase",
                marginBottom: 10,
                paddingHorizontal: 4,
              }}
            >
              Madhab
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: colors.inkMuted,
                lineHeight: 19,
                marginBottom: 14,
                paddingHorizontal: 4,
              }}
            >
              Determines asr timing based on shadow length.
            </Text>

            <View
              style={{
                borderRadius: 16,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.card,
                overflow: "hidden",
              }}
            >
              {MADHAB_OPTIONS.map((m, i) => (
                <View key={m.key}>
                  {i > 0 ? <Divider colors={colors} /> : null}
                  <OptionRow
                    colors={colors}
                    disabled={!!savingMadhab}
                    onPress={() => pickMadhab(m.key)}
                    saving={savingMadhab === m.key}
                    selected={currentMadhab === m.key}
                    subtitle={m.note}
                    title={m.label}
                  />
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function OptionRow({
  colors,
  disabled,
  onPress,
  saving,
  selected,
  subtitle,
  title,
}: {
  colors: ThemeColors;
  disabled: boolean;
  onPress: () => void;
  saving: boolean;
  selected: boolean;
  subtitle: string;
  title: string;
}) {
  return (
    <Pressable disabled={disabled} onPress={onPress}>
      {({ pressed }) => (
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 14,
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            opacity: pressed ? 0.92 : 1,
          }}
        >
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text
              style={{
                fontSize: 15,
                fontWeight: "600",
                color: colors.ink,
              }}
            >
              {title}
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: colors.inkMuted,
                marginTop: 2,
              }}
            >
              {subtitle}
            </Text>
          </View>
          <View
            style={{
              width: 22,
              height: 22,
              borderRadius: 11,
              borderWidth: selected ? 7 : 1.5,
              borderColor: selected ? colors.primary : colors.border,
              opacity: saving ? 0.5 : 1,
            }}
          />
        </View>
      )}
    </Pressable>
  );
}

function Divider({ colors }: { colors: ThemeColors }) {
  return (
    <View
      style={{ height: 1, marginLeft: 16, backgroundColor: colors.divider }}
    />
  );
}

function ScreenHeader({
  colors,
  onBack,
  title,
}: {
  colors: ThemeColors;
  onBack: () => void;
  title: string;
}) {
  return (
    <View
      style={{
        paddingHorizontal: 20,
        paddingTop: 4,
        paddingBottom: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
      }}
    >
      <Pressable
        onPress={() => {
          Haptics.selectionAsync().catch(() => undefined);
          onBack();
        }}
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.surfaceSoft,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <IconSymbol
          color={colors.ink}
          name={"chevron.left" as never}
          size={16}
        />
      </Pressable>
      <Text
        style={{
          flex: 1,
          textAlign: "center",
          fontSize: 16,
          fontWeight: "700",
          color: colors.ink,
          marginRight: 36,
        }}
      >
        {title}
      </Text>
    </View>
  );
}
