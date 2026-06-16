import * as Application from "expo-application";
import { Pressable, Switch, Text, View } from "react-native";
import {
  Card,
  Section,
  SettingsScreen,
} from "@/components/settings/settings-screen";
import { IconSymbol } from "@/components/ui/icon-symbol";
import {
  type ThemeColors,
  type ThemeMode,
  useTheme,
} from "@/contexts/theme-context";
import { hapticSelection, useHapticsPref } from "@/lib/haptics";

export default function Preferences() {
  const { colors, mode, setMode } = useTheme();
  const haptics = useHapticsPref();

  return (
    <SettingsScreen
      subtitle="Tune how Barakah looks and feels."
      title="Preferences"
    >
      <Section colors={colors} delay={40} title="Appearance">
        <AppearanceCard colors={colors} mode={mode} setMode={setMode} />
      </Section>

      <Section colors={colors} delay={90} title="Feedback">
        <Card colors={colors}>
          <ToggleRow
            colors={colors}
            onValueChange={haptics.set}
            subtitle="Subtle haptic feedback on taps and the dhikr counter."
            title="Haptic feedback"
            value={haptics.value}
          />
        </Card>
      </Section>

      <Section colors={colors} delay={140} title="About">
        <AboutCard colors={colors} />
      </Section>
    </SettingsScreen>
  );
}

function AppearanceCard({
  colors,
  mode,
  setMode,
}: {
  colors: ThemeColors;
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
}) {
  return (
    <View
      style={{
        borderRadius: 18,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.card,
        padding: 16,
      }}
    >
      <View style={{ flexDirection: "row", gap: 10 }}>
        <ThemeTile
          colors={colors}
          mode="system"
          onPress={() => setMode("system")}
          selected={mode === "system"}
        />
        <ThemeTile
          colors={colors}
          mode="light"
          onPress={() => setMode("light")}
          selected={mode === "light"}
        />
        <ThemeTile
          colors={colors}
          mode="dark"
          onPress={() => setMode("dark")}
          selected={mode === "dark"}
        />
      </View>
    </View>
  );
}

function ThemeTile({
  colors,
  mode,
  onPress,
  selected,
}: {
  colors: ThemeColors;
  mode: ThemeMode;
  onPress: () => void;
  selected: boolean;
}) {
  const label =
    mode === "system" ? "System" : mode === "light" ? "Light" : "Dark";
  const sf =
    mode === "system"
      ? "circle.lefthalf.filled"
      : mode === "light"
        ? "sun.max.fill"
        : "moon.fill";

  return (
    <Pressable
      onPress={() => {
        hapticSelection();
        onPress();
      }}
      style={{ flex: 1, alignItems: "center", gap: 8 }}
    >
      <View
        style={{
          width: "100%",
          aspectRatio: 0.78,
          borderRadius: 12,
          borderWidth: selected ? 2 : 1,
          borderColor: selected ? colors.primary : colors.border,
          overflow: "hidden",
          backgroundColor: colors.surfaceSoft,
        }}
      >
        <MiniPreview mode={mode} />
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
        <IconSymbol
          color={selected ? colors.primary : colors.inkMuted}
          name={sf as never}
          size={12}
        />
        <Text
          style={{
            fontSize: 12,
            fontWeight: "600",
            color: selected ? colors.primary : colors.inkMuted,
          }}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

function MiniPreview({ mode }: { mode: ThemeMode }) {
  const isDark = mode === "dark";
  const isSystem = mode === "system";
  const bg = isDark ? "#0E1311" : "#FFFFFF";
  const card = isDark ? "#1A2120" : "#F5F5F4";
  const ink = isDark ? "#FFFFFF" : "#000000";
  const muted = isDark ? "#3F4946" : "#D1D5DB";
  const accent = "#29603E";

  if (isSystem) {
    return (
      <View style={{ flex: 1, flexDirection: "row" }}>
        <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
          <MiniContent
            accent={accent}
            bg="#FFFFFF"
            card="#F5F5F4"
            ink="#000000"
            muted="#D1D5DB"
          />
        </View>
        <View style={{ flex: 1, backgroundColor: "#0E1311" }}>
          <MiniContent
            accent="#4FB07A"
            bg="#0E1311"
            card="#1A2120"
            ink="#FFFFFF"
            muted="#3F4946"
          />
        </View>
      </View>
    );
  }

  return (
    <MiniContent
      accent={isDark ? "#4FB07A" : accent}
      bg={bg}
      card={card}
      ink={ink}
      muted={muted}
    />
  );
}

function MiniContent({
  accent,
  bg,
  card,
  ink,
  muted,
}: {
  accent: string;
  bg: string;
  card: string;
  ink: string;
  muted: string;
}) {
  return (
    <View style={{ flex: 1, backgroundColor: bg, padding: 8, gap: 6 }}>
      <View
        style={{
          height: 6,
          width: "55%",
          borderRadius: 3,
          backgroundColor: ink,
        }}
      />
      <View
        style={{
          height: 4,
          width: "35%",
          borderRadius: 2,
          backgroundColor: muted,
        }}
      />
      <View
        style={{
          marginTop: 4,
          height: 30,
          borderRadius: 6,
          backgroundColor: accent,
        }}
      />
      <View
        style={{
          marginTop: 2,
          flex: 1,
          borderRadius: 6,
          backgroundColor: card,
          padding: 5,
          gap: 4,
        }}
      >
        <View
          style={{
            height: 4,
            width: "70%",
            borderRadius: 2,
            backgroundColor: muted,
          }}
        />
        <View
          style={{
            height: 4,
            width: "50%",
            borderRadius: 2,
            backgroundColor: muted,
          }}
        />
        <View
          style={{
            height: 4,
            width: "60%",
            borderRadius: 2,
            backgroundColor: muted,
          }}
        />
      </View>
    </View>
  );
}

function ToggleRow({
  colors,
  onValueChange,
  subtitle,
  title,
  value,
}: {
  colors: ThemeColors;
  onValueChange: (v: boolean) => void;
  subtitle: string;
  title: string;
  value: boolean;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 14,
      }}
    >
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontSize: 15, fontWeight: "600", color: colors.ink }}>
          {title}
        </Text>
        <Text
          style={{
            fontSize: 12,
            color: colors.inkMuted,
            marginTop: 3,
            lineHeight: 16,
          }}
        >
          {subtitle}
        </Text>
      </View>
      <Switch
        ios_backgroundColor={colors.neutralSoft}
        onValueChange={(v) => {
          hapticSelection();
          onValueChange(v);
        }}
        thumbColor="#FFFFFF"
        trackColor={{ false: colors.neutralSoft, true: colors.primary }}
        value={value}
      />
    </View>
  );
}

function AboutCard({ colors }: { colors: ThemeColors }) {
  const version = Application.nativeApplicationVersion ?? "—";
  const build = Application.nativeBuildVersion ?? "—";

  return (
    <Card colors={colors}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 14,
          gap: 14,
        }}
      >
        <Text
          style={{
            flex: 1,
            fontSize: 15,
            fontWeight: "600",
            color: colors.ink,
          }}
        >
          Version
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: colors.inkMuted,
            fontVariant: ["tabular-nums"],
          }}
        >
          {version} ({build})
        </Text>
      </View>
    </Card>
  );
}
