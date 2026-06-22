import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";
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

// Persist only after taps settle so rapid changes don't fire racing POSTs that
// can land out of order and revert the radio. UI updates instantly regardless.
const PERSIST_DEBOUNCE_MS = 350;
type ProfileField = "calcMethod" | "madhab";

export default function CalcMethod() {
  const { colors } = useTheme();
  const { profile } = useUser();
  const queryClient = useQueryClient();

  const current = (profile?.calcMethod as Method | undefined) ?? "mwl";
  const currentMadhab: Madhab =
    (profile?.madhab as Madhab | undefined) ?? "none";

  // Per-field debounce timers + the latest pending value, so only the final
  // selection is POSTed (last-write-wins) and nothing reverts mid-tapping.
  const methodTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const madhabTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingMethod = useRef<Method | null>(null);
  const pendingMadhab = useRef<Madhab | null>(null);

  const persistField = useCallback(
    async (field: ProfileField, value: string) => {
      try {
        await api.api.v1.me.profile.$post({ json: { [field]: value } });
      } finally {
        // Reconcile with server truth (confirms the write, or corrects it if
        // the save failed). The optimistic value already matches on success.
        queryClient.invalidateQueries({ queryKey: ["cf", "me"] });
      }
    },
    [queryClient]
  );

  // Write the optimistic value immediately so the radio flips on every tap,
  // even fast ones; cancel in-flight /me so a focus-refetch can't clobber it.
  const writeOptimistic = useCallback(
    (field: ProfileField, value: string) => {
      queryClient.cancelQueries({ queryKey: ["cf", "me"] });
      queryClient.setQueryData<CfAccount | null>(["cf", "me"], (prev) =>
        prev?.profile == null
          ? prev
          : { ...prev, profile: { ...prev.profile, [field]: value } }
      );
    },
    [queryClient]
  );

  const pick = useCallback(
    (m: Method) => {
      if (m === current) {
        return;
      }
      hapticSelection();
      writeOptimistic("calcMethod", m);
      pendingMethod.current = m;
      if (methodTimer.current) {
        clearTimeout(methodTimer.current);
      }
      methodTimer.current = setTimeout(() => {
        const value = pendingMethod.current;
        pendingMethod.current = null;
        methodTimer.current = null;
        if (value) {
          persistField("calcMethod", value).catch(() => undefined);
        }
      }, PERSIST_DEBOUNCE_MS);
    },
    [current, writeOptimistic, persistField]
  );

  const pickMadhab = useCallback(
    (m: Madhab) => {
      if (m === currentMadhab) {
        return;
      }
      hapticSelection();
      writeOptimistic("madhab", m);
      pendingMadhab.current = m;
      if (madhabTimer.current) {
        clearTimeout(madhabTimer.current);
      }
      madhabTimer.current = setTimeout(() => {
        const value = pendingMadhab.current;
        pendingMadhab.current = null;
        madhabTimer.current = null;
        if (value) {
          persistField("madhab", value).catch(() => undefined);
        }
      }, PERSIST_DEBOUNCE_MS);
    },
    [currentMadhab, writeOptimistic, persistField]
  );

  // Flush a pending write if the user leaves before the debounce fires, so the
  // last selection is never lost.
  useEffect(
    () => () => {
      if (methodTimer.current) {
        clearTimeout(methodTimer.current);
        if (pendingMethod.current) {
          persistField("calcMethod", pendingMethod.current).catch(
            () => undefined
          );
        }
      }
      if (madhabTimer.current) {
        clearTimeout(madhabTimer.current);
        if (pendingMadhab.current) {
          persistField("madhab", pendingMadhab.current).catch(() => undefined);
        }
      }
    },
    [persistField]
  );

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
                onPress={() => pick(m.key)}
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
                onPress={() => pickMadhab(m.key)}
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
  onPress,
  selected,
  subtitle,
  title,
}: {
  colors: ThemeColors;
  onPress: () => void;
  selected: boolean;
  subtitle: string;
  title: string;
}) {
  return (
    <Pressable onPress={onPress}>
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
