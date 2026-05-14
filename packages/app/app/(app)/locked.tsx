import { api } from "@barakah/core/convex/_generated/api";
import { ALL_WINDOWS, type PrayerWindow } from "@barakah/core/shieldSelection";
import { useMutation, useQuery } from "convex/react";
import {
  type AndroidBlockableApp,
  BlockedAppsNativeList,
  type FamilyActivityPickerSelectionEvent,
  FamilyActivityPickerView,
  getBlockConfiguration,
  getInstalledApps,
  getPermissionStatus,
  type IOSBlockedItem,
  type PermissionStatus,
  requestPermissions,
  setBlockConfiguration,
  setBlockedApps,
} from "expo-app-blocker";
import * as Haptics from "expo-haptics";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScrollBlurHeader } from "@/components/scroll-blur-header";
import { useTheme } from "@/contexts/theme-context";
import { usePrayerShield } from "@/hooks/usePrayerShield";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";

type Door = "quieted" | "pick";

const WINDOW_LABELS: Record<PrayerWindow, string> = {
  fajr: "Fajr",
  dhuhr: "Dhuhr",
  asr: "Asr",
  maghrib: "Maghrib",
  isha: "Isha",
};

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
  const { nextPrayer } = usePrayerTimes();
  const { colors, scheme } = useTheme();
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
    },
  });

  usePrayerShield();

  const [door, setDoor] = useState<Door>("quieted");
  const [perm, setPerm] = useState<PermissionStatus | null>(null);
  const [iosItems, setIosItems] = useState<IOSBlockedItem[]>([]);
  const [iosSelectionLocal, setIosSelectionLocal] = useState<string>("");
  const [installed, setInstalled] = useState<AndroidBlockableApp[]>([]);
  const [search, setSearch] = useState("");
  const [pendingAndroid, setPendingAndroid] = useState<Set<string>>(new Set());

  const selection = useQuery(api.lib.shieldSelection.getMine);
  const upsertIos = useMutation(api.lib.shieldSelection.upsertIos);
  const upsertAndroid = useMutation(api.lib.shieldSelection.upsertAndroid);
  const setWindowsMut = useMutation(api.lib.shieldSelection.setWindows);

  useEffect(() => {
    if (Platform.OS === "web") {
      return;
    }
    getPermissionStatus()
      .then(setPerm)
      .catch(() => null);
    if (Platform.OS === "ios") {
      const cfg = getBlockConfiguration();
      if (cfg?.blockedItems) {
        setIosItems(cfg.blockedItems);
      }
      if (selection?.iosSelectionData) {
        setIosSelectionLocal(selection.iosSelectionData);
      }
    }
    if (Platform.OS === "android") {
      getInstalledApps()
        .then(setInstalled)
        .catch(() => null);
      if (selection?.androidPackageNames) {
        setPendingAndroid(new Set(selection.androidPackageNames));
      }
    }
  }, [selection]);

  const itemCount =
    Platform.OS === "ios"
      ? (selection?.iosItemCount ?? iosItems.length)
      : (selection?.androidPackageNames?.length ?? 0);

  const upcoming = nextPrayer ? fmt12(nextPrayer.time) : null;
  const upcomingName = nextPrayer ? nextPrayer.name : null;

  const windows = useMemo<PrayerWindow[]>(
    () =>
      (selection?.windows as PrayerWindow[] | undefined) ?? [...ALL_WINDOWS],
    [selection?.windows]
  );

  const toggleWindow = useCallback(
    async (w: PrayerWindow) => {
      Haptics.selectionAsync();
      const next = windows.includes(w)
        ? windows.filter((x) => x !== w)
        : [...windows, w];
      await setWindowsMut({ windows: next });
    },
    [windows, setWindowsMut]
  );

  const onPickerChange = useCallback(
    async (event: FamilyActivityPickerSelectionEvent) => {
      const filtered = event.items;
      setIosItems(filtered);
      setIosSelectionLocal(event.selectionData);
      if (filtered.length > 0) {
        await setBlockConfiguration({
          blockedItems: filtered,
          isActive: true,
        });
      }
      await upsertIos({
        iosSelectionData: event.selectionData,
        iosItemCount: filtered.length,
      });
    },
    [upsertIos]
  );

  const toggleAndroid = useCallback((pkg: string) => {
    setPendingAndroid((prev) => {
      const next = new Set(prev);
      if (next.has(pkg)) {
        next.delete(pkg);
      } else {
        next.add(pkg);
      }
      return next;
    });
  }, []);

  const saveAndroid = useCallback(async () => {
    const pkgs = [...pendingAndroid];
    setBlockedApps(pkgs);
    await upsertAndroid({ androidPackageNames: pkgs });
    setDoor("quieted");
  }, [pendingAndroid, upsertAndroid]);

  const requestPerm = useCallback(async () => {
    const result = await requestPermissions();
    setPerm(result);
  }, []);

  const filteredInstalled = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = q
      ? installed.filter(
          (a) =>
            a.name.toLowerCase().includes(q) ||
            a.packageName.toLowerCase().includes(q)
        )
      : installed;
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }, [installed, search]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      <Animated.ScrollView
        contentContainerStyle={{ paddingTop: insets.top, paddingBottom: 160 }}
        onScroll={onScroll}
        scrollEventThrottle={16}
        scrollIndicatorInsets={{ top: insets.top }}
        showsVerticalScrollIndicator={false}
      >
        <Hero
          colors={colors}
          itemCount={itemCount}
          upcoming={upcoming}
          upcomingName={upcomingName}
        />
        <WindowPills
          colors={colors}
          onToggle={toggleWindow}
          windows={windows}
        />
        <View
          style={{
            flexDirection: "row",
            gap: 24,
            paddingHorizontal: 20,
            paddingTop: 20,
          }}
        >
          <DoorTab
            active={door === "quieted"}
            color={colors.ink}
            label="Quieted"
            mutedColor={colors.inkSubtle}
            onPress={() => setDoor("quieted")}
          />
          <DoorTab
            active={door === "pick"}
            color={colors.ink}
            label="Pick"
            mutedColor={colors.inkSubtle}
            onPress={() => setDoor("pick")}
          />
        </View>
        <View
          style={{
            backgroundColor: colors.divider,
            height: 1,
            marginTop: 10,
          }}
        />

        {door === "quieted" ? (
          <QuietedDoor
            androidPackageNames={selection?.androidPackageNames ?? []}
            colors={colors}
            installed={installed}
            iosItems={iosItems}
            iosSelectionLocal={iosSelectionLocal}
            onSwitchToPick={() => setDoor("pick")}
          />
        ) : (
          <PickDoor
            colors={colors}
            filteredInstalled={filteredInstalled}
            iosSelectionLocal={iosSelectionLocal}
            onPickerChange={onPickerChange}
            onRequestPerm={requestPerm}
            onSaveAndroid={saveAndroid}
            onSearchChange={setSearch}
            onToggleAndroid={toggleAndroid}
            pendingAndroid={pendingAndroid}
            perm={perm}
            scheme={scheme}
            search={search}
          />
        )}
      </Animated.ScrollView>
      <ScrollBlurHeader scrollY={scrollY} />
    </View>
  );
}

function Hero({
  colors,
  itemCount,
  upcoming,
  upcomingName,
}: {
  colors: ReturnType<typeof useTheme>["colors"];
  itemCount: number;
  upcoming: string | null;
  upcomingName: string | null;
}) {
  return (
    <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
      <Text
        style={{
          color: colors.inkMuted,
          fontSize: 10,
          fontWeight: "700",
          letterSpacing: 2.4,
          textTransform: "uppercase",
        }}
      >
        Quiet apps
      </Text>
      <View
        style={{
          alignItems: "flex-end",
          flexDirection: "row",
          gap: 16,
          marginTop: 6,
        }}
      >
        <Text
          style={{
            color: colors.ink,
            fontFamily: "LibreBaskerville-Bold",
            fontSize: 64,
            lineHeight: 64,
          }}
        >
          {itemCount}
        </Text>
        <View style={{ flex: 1, paddingBottom: 10 }}>
          <Text
            style={{
              color: colors.ink,
              fontFamily: "LibreBaskerville-Bold",
              fontSize: 18,
              lineHeight: 22,
            }}
          >
            Quiet at salah.
          </Text>
          {upcoming ? (
            <Text
              style={{
                color: colors.inkMuted,
                fontSize: 13,
                marginTop: 4,
              }}
            >
              Next quiet at {upcoming} {upcomingName}.
            </Text>
          ) : null}
        </View>
        <View style={{ flexDirection: "row", gap: 4, paddingBottom: 10 }}>
          {ALL_WINDOWS.map((w) => (
            <View
              key={w}
              style={{
                backgroundColor: colors.ink,
                height: 18,
                opacity: 0.85,
                width: 2,
              }}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

function WindowPills({
  colors,
  onToggle,
  windows,
}: {
  colors: ReturnType<typeof useTheme>["colors"];
  onToggle: (w: PrayerWindow) => void;
  windows: PrayerWindow[];
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        paddingHorizontal: 20,
        paddingTop: 20,
      }}
    >
      {ALL_WINDOWS.map((w) => {
        const on = windows.includes(w);
        return (
          <TouchableOpacity
            key={w}
            onPress={() => onToggle(w)}
            style={{
              backgroundColor: on ? colors.primarySoft : "transparent",
              borderColor: on ? colors.primary : colors.border,
              borderRadius: 999,
              borderWidth: 1,
              paddingHorizontal: 14,
              paddingVertical: 8,
            }}
          >
            <Text
              style={{
                color: on ? colors.primary : colors.ink,
                fontSize: 13,
                fontWeight: "600",
              }}
            >
              {WINDOW_LABELS[w]}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function DoorTab({
  active,
  color,
  label,
  mutedColor,
  onPress,
}: {
  active: boolean;
  color: string;
  label: string;
  mutedColor: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress}>
      <Text
        style={{
          color: active ? color : mutedColor,
          fontFamily: "LibreBaskerville-Bold",
          fontSize: 18,
        }}
      >
        {label}
      </Text>
      <View
        style={{
          backgroundColor: active ? color : "transparent",
          height: 1,
          marginTop: 6,
        }}
      />
    </TouchableOpacity>
  );
}

function QuietedDoor({
  androidPackageNames,
  colors,
  installed,
  iosItems,
  iosSelectionLocal,
  onSwitchToPick,
}: {
  androidPackageNames: string[];
  colors: ReturnType<typeof useTheme>["colors"];
  installed: AndroidBlockableApp[];
  iosItems: IOSBlockedItem[];
  iosSelectionLocal: string;
  onSwitchToPick: () => void;
}) {
  if (Platform.OS === "ios") {
    if (iosItems.length === 0) {
      return (
        <EmptyState
          colors={colors}
          onPress={onSwitchToPick}
          subtitle="Tap Pick to choose the apps you want quiet at salah."
          title="Pick the apps that pull at you."
        />
      );
    }
    return (
      <View style={{ paddingHorizontal: 20, paddingTop: 12 }}>
        <BlockedAppsNativeList
          items={iosItems}
          selectionData={iosSelectionLocal}
          style={{ minHeight: 220 }}
        />
      </View>
    );
  }
  if (Platform.OS === "android") {
    if (androidPackageNames.length === 0) {
      return (
        <EmptyState
          colors={colors}
          onPress={onSwitchToPick}
          subtitle="Tap Pick to choose the apps you want quiet at salah."
          title="Pick the apps that pull at you."
        />
      );
    }
    const byPkg = new Map(installed.map((a) => [a.packageName, a]));
    return (
      <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
        {androidPackageNames.map((pkg) => {
          const meta = byPkg.get(pkg);
          return (
            <View
              key={pkg}
              style={{
                alignItems: "center",
                borderBottomColor: colors.divider,
                borderBottomWidth: 1,
                flexDirection: "row",
                gap: 14,
                paddingVertical: 14,
              }}
            >
              <Monogram
                borderColor={colors.border}
                color={colors.ink}
                label={(meta?.name ?? pkg).slice(0, 2)}
                size={44}
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: colors.ink,
                    fontSize: 16,
                    fontWeight: "600",
                  }}
                >
                  {meta?.name ?? pkg}
                </Text>
                <Text
                  style={{ color: colors.inkMuted, fontSize: 12, marginTop: 2 }}
                >
                  {pkg}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    );
  }
  return (
    <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
      <Text style={{ color: colors.inkMuted, fontSize: 14 }}>
        Locking apps is only available on iOS and Android.
      </Text>
    </View>
  );
}

function PickDoor({
  colors,
  filteredInstalled,
  iosSelectionLocal,
  onPickerChange,
  onRequestPerm,
  onSaveAndroid,
  onSearchChange,
  onToggleAndroid,
  pendingAndroid,
  perm,
  scheme,
  search,
}: {
  colors: ReturnType<typeof useTheme>["colors"];
  filteredInstalled: AndroidBlockableApp[];
  iosSelectionLocal: string;
  onPickerChange: (e: FamilyActivityPickerSelectionEvent) => void;
  onRequestPerm: () => void;
  onSaveAndroid: () => void;
  onSearchChange: (s: string) => void;
  onToggleAndroid: (pkg: string) => void;
  pendingAndroid: Set<string>;
  perm: PermissionStatus | null;
  scheme: "light" | "dark";
  search: string;
}) {
  if (Platform.OS === "web") {
    return (
      <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
        <Text style={{ color: colors.inkMuted, fontSize: 14 }}>
          Locking is unavailable on web.
        </Text>
      </View>
    );
  }
  if (!perm?.allGranted) {
    const cta =
      Platform.OS === "ios" ? "Enable Screen Time" : "Enable usage access";
    return (
      <View style={{ paddingHorizontal: 20, paddingTop: 28, gap: 16 }}>
        <Text
          style={{
            color: colors.ink,
            fontFamily: "LibreBaskerville-Bold",
            fontSize: 20,
          }}
        >
          One permission to begin.
        </Text>
        <Text style={{ color: colors.inkMuted, fontSize: 14, lineHeight: 20 }}>
          Barakah needs system permission to shield apps during prayer windows.
          You can revoke it any time.
        </Text>
        <TouchableOpacity
          onPress={onRequestPerm}
          style={{
            alignItems: "center",
            backgroundColor: colors.primary,
            borderRadius: 12,
            paddingVertical: 14,
          }}
        >
          <Text
            style={{
              color: "#FFFFFF",
              fontSize: 15,
              fontWeight: "700",
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            {cta}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (Platform.OS === "ios") {
    return (
      <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
        <Text
          style={{
            color: colors.inkMuted,
            fontSize: 10,
            fontWeight: "700",
            letterSpacing: 2,
            paddingBottom: 12,
            textTransform: "uppercase",
          }}
        >
          Pick apps
        </Text>
        <View
          style={{
            borderColor: colors.border,
            borderRadius: 16,
            borderWidth: 1,
            overflow: "hidden",
          }}
        >
          <FamilyActivityPickerView
            initialSelection={iosSelectionLocal}
            onSelectionChange={onPickerChange}
            style={{ height: 520 }}
            theme={scheme}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
      <View
        style={{
          alignItems: "center",
          borderColor: colors.border,
          borderRadius: 12,
          borderWidth: 1,
          flexDirection: "row",
          paddingHorizontal: 14,
        }}
      >
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={onSearchChange}
          placeholder="Search apps"
          placeholderTextColor={colors.inkSubtle}
          style={{
            color: colors.ink,
            flex: 1,
            fontSize: 15,
            paddingVertical: 12,
          }}
          value={search}
        />
      </View>
      <View style={{ paddingTop: 8 }}>
        {filteredInstalled.length === 0 ? (
          <Text
            style={{
              color: colors.inkMuted,
              fontSize: 14,
              paddingVertical: 24,
              textAlign: "center",
            }}
          >
            No matches.
          </Text>
        ) : (
          filteredInstalled.map((app) => {
            const on = pendingAndroid.has(app.packageName);
            return (
              <TouchableOpacity
                key={app.packageName}
                onPress={() => onToggleAndroid(app.packageName)}
                style={{
                  alignItems: "center",
                  borderBottomColor: colors.divider,
                  borderBottomWidth: 1,
                  flexDirection: "row",
                  gap: 14,
                  paddingVertical: 12,
                }}
              >
                <Monogram
                  borderColor={colors.border}
                  color={colors.ink}
                  label={app.name.slice(0, 2)}
                  size={40}
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: colors.ink,
                      fontSize: 15,
                      fontWeight: "600",
                    }}
                  >
                    {app.name}
                  </Text>
                </View>
                <View
                  style={{
                    alignItems: "center",
                    backgroundColor: on ? colors.primary : "transparent",
                    borderColor: on ? colors.primary : colors.border,
                    borderRadius: 999,
                    borderWidth: 1,
                    height: 24,
                    justifyContent: "center",
                    width: 24,
                  }}
                >
                  {on ? (
                    <Text style={{ color: "#FFFFFF", fontSize: 14 }}>✓</Text>
                  ) : null}
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </View>
      <TouchableOpacity
        onPress={onSaveAndroid}
        style={{
          alignItems: "center",
          backgroundColor: colors.primary,
          borderRadius: 12,
          marginTop: 16,
          paddingVertical: 14,
        }}
      >
        <Text
          style={{
            color: "#FFFFFF",
            fontSize: 14,
            fontWeight: "700",
            letterSpacing: 1,
            textTransform: "uppercase",
          }}
        >
          Save ({pendingAndroid.size})
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function EmptyState({
  colors,
  onPress,
  subtitle,
  title,
}: {
  colors: ReturnType<typeof useTheme>["colors"];
  onPress: () => void;
  subtitle: string;
  title: string;
}) {
  return (
    <View style={{ paddingHorizontal: 20, paddingTop: 32, gap: 12 }}>
      <Text
        style={{
          color: colors.ink,
          fontFamily: "LibreBaskerville-Bold",
          fontSize: 20,
        }}
      >
        {title}
      </Text>
      <Text style={{ color: colors.inkMuted, fontSize: 14, lineHeight: 20 }}>
        {subtitle}
      </Text>
      <TouchableOpacity
        onPress={onPress}
        style={{
          alignSelf: "flex-start",
          borderColor: colors.ink,
          borderRadius: 999,
          borderWidth: 1,
          marginTop: 4,
          paddingHorizontal: 16,
          paddingVertical: 10,
        }}
      >
        <Text style={{ color: colors.ink, fontSize: 13, fontWeight: "600" }}>
          Pick apps
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function Monogram({
  borderColor,
  color,
  label,
  size,
}: {
  borderColor: string;
  color: string;
  label: string;
  size: number;
}) {
  return (
    <View
      style={{
        alignItems: "center",
        borderColor,
        borderRadius: 12,
        borderWidth: 1,
        height: size,
        justifyContent: "center",
        width: size,
      }}
    >
      <Text
        style={{
          color,
          fontFamily: "LibreBaskerville-Bold",
          fontSize: size * 0.36,
        }}
      >
        {label}
      </Text>
    </View>
  );
}
