import { api } from "@barakah/core/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import * as Haptics from "expo-haptics";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Image,
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
import { LockedMesh } from "@/components/meshes";
import { ScrollBlurHeader } from "@/components/scroll-blur-header";
import { SOCIAL_APPS, type SocialApp } from "@/constants/social-apps";
import { useTheme } from "@/contexts/theme-context";
import { usePrayerShield } from "@/hooks/usePrayerShield";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import {
  type AndroidBlockableApp,
  clearAllBlocks,
  type FamilyActivityPickerSelectionEvent,
  FamilyActivityPickerView,
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

function iosItemLabel(item: IOSBlockedItem): string {
  if (item.type === "app") {
    return item.displayName ?? item.bundleIdentifier ?? "App";
  }
  if (item.type === "category") {
    return item.categoryName ?? "Category";
  }
  return item.domain ?? "Website";
}

function iosItemTypeLabel(item: IOSBlockedItem): string {
  if (item.type === "app") {
    return "APP";
  }
  if (item.type === "category") {
    return "CATEGORY";
  }
  return "WEB";
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

  const itemCount =
    Platform.OS === "ios"
      ? (selection?.iosItemCount ?? iosItems.length)
      : pendingAndroid.size;

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

  const onPickerChange = useCallback(
    async (event: FamilyActivityPickerSelectionEvent) => {
      setIosItems(event.items);
      setIosSelectionLocal(event.selectionData);
      await persistIos(event.items, event.selectionData);
    },
    [persistIos]
  );

  const openIosPickerModal = useCallback(async () => {
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
        openIosPickerModal();
        return;
      }
      if (Platform.OS === "android") {
        toggleAndroid(app.androidPackageName);
      }
    },
    [openIosPickerModal, toggleAndroid]
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
          count={itemCount}
          upcoming={upcoming}
          upcomingName={upcomingName}
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
          onPickerChange={onPickerChange}
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

function EyebrowHead({
  colors,
  label,
  sublabel,
}: {
  colors: ThemeColors;
  label: string;
  sublabel?: string;
}) {
  return (
    <View style={{ gap: 12 }}>
      <View style={{ backgroundColor: colors.primary, height: 1, width: 28 }} />
      <Text
        style={{
          color: colors.inkMuted,
          fontSize: 10,
          fontWeight: "700",
          letterSpacing: 2.4,
        }}
      >
        {label}
      </Text>
      {sublabel ? (
        <Text
          style={{
            color: colors.inkSubtle,
            fontSize: 10,
            fontWeight: "700",
            letterSpacing: 2.4,
            marginTop: -6,
          }}
        >
          {sublabel}
        </Text>
      ) : null}
    </View>
  );
}

function Hero({
  colors,
  count,
  upcoming,
  upcomingName,
}: {
  colors: ThemeColors;
  count: number;
  upcoming: string | null;
  upcomingName: string | null;
}) {
  const sublabel =
    upcoming && upcomingName ? `NEXT ${upcomingName} · ${upcoming}` : undefined;
  return (
    <View style={{ paddingHorizontal: 24, paddingTop: 24 }}>
      <EyebrowHead colors={colors} label="QUIET AT SALAH" sublabel={sublabel} />

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
          maxWidth: 320,
        }}
      >
        {count > 0
          ? `${count} ${count === 1 ? "app goes" : "apps go"} quiet for 15 minutes at each prayer.`
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
    <View style={{ paddingHorizontal: 24, paddingTop: 56 }}>
      <EyebrowHead colors={colors} label="SUGGESTED" />
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

function PickMore({
  colors,
  filteredInstalled,
  iosItems,
  iosSelectionLocal,
  onPickerChange,
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
  onPickerChange: (e: FamilyActivityPickerSelectionEvent) => void;
  onSearchChange: (s: string) => void;
  onToggleAndroid: (pkg: string) => void;
  pendingAndroid: Set<string>;
  perm: PermissionStatus | null;
  scheme: "light" | "dark";
  search: string;
}) {
  if (Platform.OS === "web") {
    return (
      <View style={{ paddingHorizontal: 24, paddingTop: 64 }}>
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
      <View>
        <View style={{ paddingHorizontal: 24, paddingTop: 64 }}>
          <EyebrowHead colors={colors} label="ALL APPS" />
        </View>
        <View
          style={{
            backgroundColor: colors.divider,
            height: 1,
            marginHorizontal: 24,
            marginTop: 16,
          }}
        />
        <FamilyActivityPickerView
          initialSelection={iosSelectionLocal}
          onSelectionChange={onPickerChange}
          style={{
            backgroundColor: "transparent",
            height: 560,
            marginHorizontal: 24,
          }}
          theme={scheme}
        />
        <View
          style={{
            backgroundColor: colors.divider,
            height: 1,
            marginHorizontal: 24,
          }}
        />
        {iosItems.length > 0 ? (
          <View style={{ paddingHorizontal: 24, paddingTop: 56 }}>
            <EyebrowHead
              colors={colors}
              label={`CURRENTLY QUIETED · ${iosItems.length}`}
            />
            <View style={{ marginTop: 16 }}>
              {iosItems.map((item, idx) => (
                <QuietedRow
                  colors={colors}
                  isLast={idx === iosItems.length - 1}
                  item={item}
                  key={item.token}
                />
              ))}
            </View>
          </View>
        ) : null}
      </View>
    );
  }

  return (
    <View style={{ paddingHorizontal: 24, paddingTop: 64 }}>
      <EyebrowHead colors={colors} label="ALL APPS" />
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

function QuietedRow({
  colors,
  isLast,
  item,
}: {
  colors: ThemeColors;
  isLast: boolean;
  item: IOSBlockedItem;
}) {
  const label = iosItemLabel(item);
  const typeLabel = iosItemTypeLabel(item);
  return (
    <View
      style={{
        alignItems: "center",
        borderBottomColor: isLast ? "transparent" : colors.divider,
        borderBottomWidth: 1,
        flexDirection: "row",
        gap: 14,
        paddingVertical: 14,
      }}
    >
      <IconOrMonogram
        borderColor={colors.border}
        color={colors.ink}
        iconBase64={item.iconBase64}
        label={label.slice(0, 2)}
        size={36}
      />
      <Text
        numberOfLines={1}
        style={{
          color: colors.ink,
          flex: 1,
          fontSize: 15,
          fontWeight: "500",
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          color: colors.inkSubtle,
          fontSize: 10,
          fontWeight: "700",
          letterSpacing: 1.8,
        }}
      >
        {typeLabel}
      </Text>
    </View>
  );
}

function IconOrMonogram({
  borderColor,
  color,
  iconBase64,
  label,
  size,
}: {
  borderColor: string;
  color: string;
  iconBase64?: string;
  label: string;
  size: number;
}) {
  if (iconBase64) {
    return (
      <Image
        source={{ uri: `data:image/png;base64,${iconBase64}` }}
        style={{
          borderRadius: 8,
          height: size,
          width: size,
        }}
      />
    );
  }
  return (
    <Monogram
      borderColor={borderColor}
      color={color}
      label={label}
      size={size}
    />
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
      <EyebrowHead colors={colors} label="ONE STEP LEFT" />
      <Text
        style={{
          color: colors.ink,
          fontFamily: "LibreBaskerville-Bold",
          fontSize: 20,
          lineHeight: 26,
          marginTop: 14,
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
            color: colors.primary,
            fontSize: 14,
            fontWeight: "600",
          }}
        >
          {cta}
        </Text>
        <Text
          style={{
            color: colors.primary,
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
