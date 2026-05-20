import { api } from "@barakah/core/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import * as Haptics from "expo-haptics";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Image,
  Platform,
  Pressable,
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
import { LockedMesh } from "@/components/meshes";
import { ScrollBlurHeader } from "@/components/scroll-blur-header";
import { SOCIAL_APPS, type SocialApp } from "@/constants/social-apps";
import { useTheme } from "@/contexts/theme-context";
import { usePrayerShield } from "@/hooks/usePrayerShield";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import {
  type AndroidBlockableApp,
  BlockedAppsNativeList,
  clearAllBlocks,
  getBlockConfiguration,
  getInstalledApps,
  getPermissionStatus,
  type IOSBlockedItem,
  type PermissionStatus,
  presentFamilyActivityPicker,
  requestPermissions,
  setBlockConfiguration,
  setBlockedApps,
} from "@/lib/app-blocker";

type ThemeColors = ReturnType<typeof useTheme>["colors"];

function fmt12(time: string) {
  const [h, m] = time.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) {
    return time;
  }
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${period}`;
}

function summarizeIosSelection(items: IOSBlockedItem[]): string {
  const apps = items.filter((i) => i.type === "app").length;
  const cats = items.filter((i) => i.type === "category").length;
  const webs = items.filter((i) => i.type === "webDomain").length;
  const parts: string[] = [];
  if (apps > 0) {
    parts.push(`${apps} ${apps === 1 ? "app" : "apps"}`);
  }
  if (cats > 0) {
    parts.push(`${cats} ${cats === 1 ? "category" : "categories"}`);
  }
  if (webs > 0) {
    parts.push(`${webs} ${webs === 1 ? "site" : "sites"}`);
  }
  if (parts.length === 0) {
    return "";
  }
  if (parts.length === 1) {
    return parts[0] as string;
  }
  if (parts.length === 2) {
    return `${parts[0]} and ${parts[1]}`;
  }
  return `${parts.slice(0, -1).join(", ")}, and ${parts.at(-1)}`;
}

function quietVerb(items: IOSBlockedItem[]): string {
  const total = items.length;
  if (total === 0) {
    return "go";
  }
  // singular when only one item across all types
  return total === 1 ? "goes" : "go";
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

  const [perm, setPerm] = useState<PermissionStatus | null>(null);
  const [iosItems, setIosItems] = useState<IOSBlockedItem[]>([]);
  const [iosSelectionLocal, setIosSelectionLocal] = useState<string>("");
  const [installed, setInstalled] = useState<AndroidBlockableApp[]>([]);
  const [search, setSearch] = useState("");
  const [pendingAndroid, setPendingAndroid] = useState<Set<string>>(new Set());
  const [pickerOpen, setPickerOpen] = useState(false);

  const selection = useQuery(api.lib.shieldSelection.getMine);
  const upsertIos = useMutation(api.lib.shieldSelection.upsertIos);
  const upsertAndroid = useMutation(api.lib.shieldSelection.upsertAndroid);

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

  const persistIos = useCallback(
    async (items: IOSBlockedItem[], selectionData: string) => {
      if (items.length > 0) {
        await setBlockConfiguration({
          blockedItems: items,
          isActive: true,
        });
      } else {
        clearAllBlocks();
      }
      await upsertIos({
        iosSelectionData: selectionData,
        iosItemCount: items.length,
      });
    },
    [upsertIos]
  );

  const openIosPicker = useCallback(async () => {
    if (pickerOpen) {
      return;
    }
    setPickerOpen(true);
    try {
      const items = await presentFamilyActivityPicker();
      setIosItems(items);
      await persistIos(items, iosSelectionLocal);
    } catch {
      // user cancelled
    } finally {
      setPickerOpen(false);
    }
  }, [iosSelectionLocal, persistIos, pickerOpen]);

  const clearIos = useCallback(async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(
      () => undefined
    );
    setIosItems([]);
    setIosSelectionLocal("");
    await persistIos([], "");
  }, [persistIos]);

  const toggleAndroid = useCallback(
    async (pkg: string) => {
      Haptics.selectionAsync().catch(() => undefined);
      let snapshot: string[] = [];
      setPendingAndroid((prev) => {
        const next = new Set(prev);
        if (next.has(pkg)) {
          next.delete(pkg);
        } else {
          next.add(pkg);
        }
        snapshot = [...next];
        return next;
      });
      setBlockedApps(snapshot);
      try {
        await upsertAndroid({ androidPackageNames: snapshot });
      } catch {
        // best-effort; last-write-wins resolves later taps
      }
    },
    [upsertAndroid]
  );

  const onSocialTap = useCallback(
    (app: SocialApp) => {
      if (Platform.OS === "ios") {
        openIosPicker();
        return;
      }
      if (Platform.OS === "android") {
        toggleAndroid(app.androidPackageName);
      }
    },
    [openIosPicker, toggleAndroid]
  );

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

  const upcoming = nextPrayer ? fmt12(nextPrayer.time) : null;
  const upcomingName = nextPrayer ? nextPrayer.name.toUpperCase() : null;

  const iosSummary = summarizeIosSelection(iosItems);
  const iosVerb = quietVerb(iosItems);
  const heroSubject =
    Platform.OS === "ios"
      ? iosSummary
      : `${pendingAndroid.size} ${pendingAndroid.size === 1 ? "app" : "apps"}`;
  const heroVerb =
    Platform.OS === "ios" ? iosVerb : pendingAndroid.size === 1 ? "goes" : "go";
  const hasSelection =
    Platform.OS === "ios" ? iosItems.length > 0 : pendingAndroid.size > 0;

  return (
    <View style={{ backgroundColor: colors.bg, flex: 1 }}>
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      <LockedMesh dark={scheme === "dark"} />
      <Animated.ScrollView
        contentContainerStyle={{ paddingBottom: 160, paddingTop: insets.top }}
        onScroll={onScroll}
        scrollEventThrottle={16}
        scrollIndicatorInsets={{ top: insets.top }}
        showsVerticalScrollIndicator={false}
      >
        {perm && !perm.allGranted ? (
          <PermissionNotice
            colors={colors}
            onRequestPerm={requestPerm}
            platform={Platform.OS === "ios" ? "ios" : "android"}
          />
        ) : null}
        <Hero
          colors={colors}
          hasSelection={hasSelection}
          subject={heroSubject}
          upcoming={upcoming}
          upcomingName={upcomingName}
          verb={heroVerb}
        />
        {Platform.OS === "android" || !perm?.allGranted ? (
          <SuggestedRow
            colors={colors}
            onTap={onSocialTap}
            selected={pendingAndroid}
          />
        ) : null}
        <PickMore
          colors={colors}
          filteredInstalled={filteredInstalled}
          iosItems={iosItems}
          iosSelectionLocal={iosSelectionLocal}
          onAddApps={openIosPicker}
          onClearIos={clearIos}
          onSearchChange={setSearch}
          onToggleAndroid={toggleAndroid}
          pendingAndroid={pendingAndroid}
          perm={perm}
          scheme={scheme}
          search={search}
        />
      </Animated.ScrollView>
      <ScrollBlurHeader scrollY={scrollY} />
    </View>
  );
}

function Eyebrow({ color, label }: { color: string; label: string }) {
  return (
    <Text
      style={{
        color,
        fontSize: 10,
        fontWeight: "700",
        letterSpacing: 2.4,
      }}
    >
      {label}
    </Text>
  );
}

function Hero({
  colors,
  hasSelection,
  subject,
  upcoming,
  upcomingName,
  verb,
}: {
  colors: ThemeColors;
  hasSelection: boolean;
  subject: string;
  upcoming: string | null;
  upcomingName: string | null;
  verb: string;
}) {
  const right =
    upcoming && upcomingName ? `NEXT ${upcomingName} · ${upcoming}` : null;
  return (
    <View style={{ paddingHorizontal: 24, paddingTop: 24 }}>
      <View
        style={{
          alignItems: "center",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <Eyebrow color={colors.inkMuted} label="QUIET AT SALAH" />
        {right ? <Eyebrow color={colors.inkSubtle} label={right} /> : null}
      </View>

      <Text
        style={{
          color: colors.ink,
          fontFamily: "LibreBaskerville-Bold",
          fontSize: 36,
          letterSpacing: -0.6,
          lineHeight: 42,
          marginTop: 28,
        }}
      >
        Five times.
      </Text>
      <Text
        style={{
          color: colors.ink,
          fontFamily: "LibreBaskerville-Bold",
          fontSize: 36,
          fontStyle: "italic",
          letterSpacing: -0.6,
          lineHeight: 42,
        }}
      >
        Hands quiet.
      </Text>

      <Text
        style={{
          color: colors.inkMuted,
          fontSize: 14,
          lineHeight: 22,
          marginTop: 16,
          maxWidth: 340,
        }}
      >
        {hasSelection
          ? `${subject} ${verb} quiet for 15 minutes at each prayer.`
          : "Pick the apps that pull at you. Each will go quiet for 15 minutes at each prayer."}
      </Text>
    </View>
  );
}

function SuggestedRow({
  colors,
  onTap,
  selected,
}: {
  colors: ThemeColors;
  onTap: (app: SocialApp) => void;
  selected: Set<string>;
}) {
  return (
    <View style={{ paddingHorizontal: 24, paddingTop: 48 }}>
      <Eyebrow color={colors.inkMuted} label="SUGGESTED" />
      {Platform.OS === "android" ? (
        <Text
          style={{
            color: colors.inkMuted,
            fontSize: 13,
            marginTop: 10,
          }}
        >
          Tap to quiet at salah.
        </Text>
      ) : null}
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          marginTop: 20,
          rowGap: 24,
        }}
      >
        {SOCIAL_APPS.map((app) => {
          const isSelected =
            Platform.OS === "android" && selected.has(app.androidPackageName);
          return (
            <TouchableOpacity
              activeOpacity={0.7}
              key={app.id}
              onPress={() => onTap(app)}
              style={{
                alignItems: "center",
                width: "20%",
              }}
            >
              <View
                style={{
                  alignItems: "center",
                  borderColor: isSelected ? colors.primary : "transparent",
                  borderRadius: 14,
                  borderWidth: 1.5,
                  height: 56,
                  justifyContent: "center",
                  padding: 4,
                  width: 56,
                }}
              >
                <Image
                  source={app.logo}
                  style={{
                    height: 44,
                    opacity: isSelected ? 1 : 0.95,
                    width: 44,
                  }}
                />
                {isSelected ? (
                  <View
                    style={{
                      alignItems: "center",
                      backgroundColor: colors.primary,
                      borderColor: colors.bg,
                      borderRadius: 999,
                      borderWidth: 2,
                      height: 18,
                      justifyContent: "center",
                      position: "absolute",
                      right: -2,
                      top: -2,
                      width: 18,
                    }}
                  >
                    <Text
                      style={{
                        color: "#FFFFFF",
                        fontSize: 10,
                        fontWeight: "700",
                      }}
                    >
                      ✓
                    </Text>
                  </View>
                ) : null}
              </View>
              <Text
                numberOfLines={1}
                style={{
                  color: isSelected ? colors.ink : colors.inkMuted,
                  fontSize: 11,
                  fontWeight: isSelected ? "600" : "400",
                  marginTop: 8,
                  textAlign: "center",
                }}
              >
                {app.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function AddAppsButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        alignItems: "center",
        alignSelf: "stretch",
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        flexDirection: "row",
        gap: 8,
        justifyContent: "center",
        opacity: pressed ? 0.85 : 1,
        paddingVertical: 16,
      })}
    >
      <Text
        style={{
          color: "#0A0A0A",
          fontSize: 18,
          fontWeight: "500",
          lineHeight: 20,
        }}
      >
        +
      </Text>
      <Text
        style={{
          color: "#0A0A0A",
          fontSize: 15,
          fontWeight: "600",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function PickMore({
  colors,
  filteredInstalled,
  iosItems,
  iosSelectionLocal,
  onAddApps,
  onClearIos,
  onSearchChange,
  onToggleAndroid,
  pendingAndroid,
  perm,
  scheme,
  search,
}: {
  colors: ThemeColors;
  filteredInstalled: AndroidBlockableApp[];
  iosItems: IOSBlockedItem[];
  iosSelectionLocal: string;
  onAddApps: () => void;
  onClearIos: () => void;
  onSearchChange: (s: string) => void;
  onToggleAndroid: (pkg: string) => void;
  pendingAndroid: Set<string>;
  perm: PermissionStatus | null;
  scheme: "light" | "dark";
  search: string;
}) {
  if (Platform.OS === "web") {
    return (
      <View style={{ paddingHorizontal: 24, paddingTop: 48 }}>
        <Text style={{ color: colors.inkMuted, fontSize: 13 }}>
          Locking is unavailable on web.
        </Text>
      </View>
    );
  }
  if (perm === null) {
    return null;
  }
  if (!perm.allGranted) {
    return null;
  }

  if (Platform.OS === "ios") {
    return (
      <View style={{ paddingHorizontal: 24, paddingTop: 40 }}>
        <AddAppsButton
          label={iosItems.length > 0 ? "Edit quieted apps" : "Add apps"}
          onPress={onAddApps}
        />

        {iosItems.length > 0 ? (
          <View style={{ marginTop: 40 }}>
            <View
              style={{
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Eyebrow
                color={colors.inkMuted}
                label={`CURRENTLY QUIETED · ${iosItems.length}`}
              />
              <Pressable
                accessibilityRole="button"
                hitSlop={8}
                onPress={onClearIos}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.5 : 1,
                  paddingVertical: 4,
                })}
              >
                <Eyebrow color={colors.inkSubtle} label="CLEAR ALL" />
              </Pressable>
            </View>
            <View
              style={{
                backgroundColor: colors.divider,
                height: 1,
                marginTop: 16,
              }}
            />
            <BlockedAppsNativeList
              items={iosItems}
              selectionData={iosSelectionLocal}
              style={{
                backgroundColor: "transparent",
                height: iosItems.length * 56 + 24,
                marginTop: 4,
              }}
              theme={scheme}
            />
          </View>
        ) : null}
      </View>
    );
  }

  return (
    <View style={{ paddingHorizontal: 24, paddingTop: 48 }}>
      <Eyebrow color={colors.inkMuted} label="ALL APPS" />
      <View style={{ marginTop: 16 }}>
        <View
          style={{
            borderBottomColor: colors.divider,
            borderBottomWidth: 1,
            paddingBottom: 8,
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
              fontSize: 15,
              paddingVertical: 10,
            }}
            value={search}
          />
        </View>
        {filteredInstalled.length === 0 ? (
          <Text
            style={{
              color: colors.inkMuted,
              fontSize: 13,
              paddingVertical: 32,
              textAlign: "center",
            }}
          >
            No matches.
          </Text>
        ) : (
          filteredInstalled.map((app, idx) => {
            const on = pendingAndroid.has(app.packageName);
            const isLast = idx === filteredInstalled.length - 1;
            return (
              <TouchableOpacity
                activeOpacity={0.7}
                key={app.packageName}
                onPress={() => onToggleAndroid(app.packageName)}
                style={{
                  alignItems: "center",
                  borderBottomColor: isLast ? "transparent" : colors.divider,
                  borderBottomWidth: 1,
                  flexDirection: "row",
                  gap: 14,
                  paddingVertical: 14,
                }}
              >
                <Monogram
                  borderColor={colors.border}
                  color={colors.ink}
                  label={app.name.slice(0, 2)}
                  size={36}
                />
                <Text
                  style={{
                    color: colors.ink,
                    flex: 1,
                    fontSize: 15,
                    fontWeight: "500",
                  }}
                >
                  {app.name}
                </Text>
                <View
                  style={{
                    alignItems: "center",
                    backgroundColor: on ? colors.primary : "transparent",
                    borderColor: on ? colors.primary : colors.border,
                    borderRadius: 999,
                    borderWidth: 1,
                    height: 22,
                    justifyContent: "center",
                    width: 22,
                  }}
                >
                  {on ? (
                    <Text
                      style={{
                        color: "#FFFFFF",
                        fontSize: 12,
                        fontWeight: "700",
                      }}
                    >
                      ✓
                    </Text>
                  ) : null}
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </View>
    </View>
  );
}

function PermissionNotice({
  colors,
  onRequestPerm,
  platform,
}: {
  colors: ThemeColors;
  onRequestPerm: () => void;
  platform: "ios" | "android";
}) {
  const cta = platform === "ios" ? "Enable Screen Time" : "Enable usage access";
  return (
    <View style={{ paddingHorizontal: 24, paddingTop: 24 }}>
      <Eyebrow color={colors.inkMuted} label="ONE STEP LEFT" />
      <Text
        style={{
          color: colors.ink,
          fontFamily: "LibreBaskerville-Bold",
          fontSize: 20,
          lineHeight: 26,
          marginTop: 12,
        }}
      >
        Grant permission to begin.
      </Text>
      <Text
        style={{
          color: colors.inkMuted,
          fontSize: 13,
          lineHeight: 20,
          marginTop: 8,
        }}
      >
        Barakah needs system permission to quiet apps during prayer. Revoke any
        time.
      </Text>
      <TouchableOpacity
        accessibilityRole="button"
        activeOpacity={0.7}
        onPress={onRequestPerm}
        style={{
          alignItems: "center",
          alignSelf: "flex-start",
          flexDirection: "row",
          gap: 6,
          marginTop: 16,
          paddingVertical: 4,
        }}
      >
        <Text
          style={{
            color: colors.ink,
            fontSize: 14,
            fontWeight: "600",
          }}
        >
          {cta}
        </Text>
        <Text
          style={{
            color: colors.ink,
            fontSize: 14,
            fontWeight: "600",
          }}
        >
          →
        </Text>
      </TouchableOpacity>
      <View
        style={{
          backgroundColor: colors.divider,
          height: 1,
          marginTop: 24,
        }}
      />
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
        borderRadius: 10,
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
          fontSize: size * 0.34,
        }}
      >
        {label}
      </Text>
    </View>
  );
}
