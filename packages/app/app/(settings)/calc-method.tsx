import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import {
  Card,
  Section,
  SettingsScreen,
} from "@/components/settings/settings-screen";
import { type ThemeColors, useTheme } from "@/contexts/theme-context";
import { type CfAccount, useUser } from "@/contexts/user-context";
import { api } from "@/lib/api-client";
import { hapticSelection } from "@/lib/haptics";

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
  const { colors } = useTheme();
  const { profile } = useUser();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState<Method | null>(null);
  const [savingMadhab, setSavingMadhab] = useState<Madhab | null>(null);

  const current = (profile?.calcMethod as Method | undefined) ?? "mwl";
  const currentMadhab: Madhab =
    (profile?.madhab as Madhab | undefined) ?? "none";

  const pick = async (m: Method) => {
    if (m === current || saving) {
      return;
    }
    setSaving(m);
    hapticSelection();
    // Optimistically set calcMethod in the cached account so the radio flips
    // instantly; snapshot first so a failed POST can roll back.
    const snapshot = queryClient.getQueryData<CfAccount | null>(["cf", "me"]);
    queryClient.setQueryData<CfAccount | null>(["cf", "me"], (prev) =>
      prev?.profile == null
        ? prev
        : { ...prev, profile: { ...prev.profile, calcMethod: m } }
    );
    try {
      const res = await api.api.v1.me.profile.$post({
        json: { calcMethod: m },
      });
      if (!res.ok) {
        queryClient.setQueryData(["cf", "me"], snapshot);
        return;
      }
    } catch (err) {
      queryClient.setQueryData(["cf", "me"], snapshot);
      throw err;
    } finally {
      setSaving(null);
    }
    // Background reconciliation only on success; not awaited so a failed refetch
    // can't spuriously roll back the (already correct) optimistic value.
    queryClient.invalidateQueries({ queryKey: ["cf", "me"] });
  };

  const pickMadhab = async (m: Madhab) => {
    if (m === currentMadhab || savingMadhab) {
      return;
    }
    setSavingMadhab(m);
    hapticSelection();
    // Optimistically set madhab in the cached account so the radio flips
    // instantly; snapshot first so a failed POST can roll back.
    const snapshot = queryClient.getQueryData<CfAccount | null>(["cf", "me"]);
    queryClient.setQueryData<CfAccount | null>(["cf", "me"], (prev) =>
      prev?.profile == null
        ? prev
        : { ...prev, profile: { ...prev.profile, madhab: m } }
    );
    try {
      const res = await api.api.v1.me.profile.$post({ json: { madhab: m } });
      if (!res.ok) {
        queryClient.setQueryData(["cf", "me"], snapshot);
        return;
      }
    } catch (err) {
      queryClient.setQueryData(["cf", "me"], snapshot);
      throw err;
    } finally {
      setSavingMadhab(null);
    }
    // Background reconciliation only on success; not awaited so a failed refetch
    // can't spuriously roll back the (already correct) optimistic value.
    queryClient.invalidateQueries({ queryKey: ["cf", "me"] });
  };

  return (
    <SettingsScreen
      subtitle="Set the convention for fajr and isha, and asr timing by your madhab."
      title="Calculation method"
    >
      <Section colors={colors} delay={40} title="Method">
        <Card colors={colors}>
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
        </Card>
      </Section>

      <Section colors={colors} delay={90} title="Madhab">
        <Text
          style={{
            fontSize: 13,
            color: colors.inkMuted,
            lineHeight: 19,
            marginBottom: 12,
            paddingHorizontal: 4,
          }}
        >
          Determines asr timing based on shadow length.
        </Text>
        <Card colors={colors}>
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
        </Card>
      </Section>
    </SettingsScreen>
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
            paddingVertical: 15,
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
                fontWeight: selected ? "700" : "600",
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
              borderWidth: selected ? 2 : 1.5,
              borderColor: selected ? colors.primary : colors.border,
              alignItems: "center",
              justifyContent: "center",
              opacity: saving ? 0.5 : 1,
            }}
          >
            {selected ? (
              <View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: colors.primary,
                }}
              />
            ) : null}
          </View>
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
