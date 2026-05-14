import { api } from "@barakah/core/convex/_generated/api";
import {
  ALL_WINDOWS,
  APP_CATALOG,
  CATALOG_BY_ID,
  type CatalogApp,
  type PrayerWindow,
} from "@barakah/core/lockedApps";
import { useMutation, useQuery } from "convex/react";
import * as Haptics from "expo-haptics";
import * as Linking from "expo-linking";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Modal, Pressable, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScrollBlurHeader } from "@/components/scroll-blur-header";
import { useTheme } from "@/contexts/theme-context";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";

type Door = "quieted" | "available";

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

  const [door, setDoor] = useState<Door>("quieted");
  const [openAppId, setOpenAppId] = useState<string | null>(null);
  const [installedMap, setInstalledMap] = useState<Record<string, boolean>>({});

  const locked = useQuery(api.lib.lockedApps.listMine);
  const addApp = useMutation(api.lib.lockedApps.addApp);
  const removeApp = useMutation(api.lib.lockedApps.removeApp);
  const setEnabled = useMutation(api.lib.lockedApps.setEnabled);
  const setWindows = useMutation(api.lib.lockedApps.setWindows);
  const syncInstalled = useMutation(api.lib.lockedApps.syncInstalled);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const probes = await Promise.all(
        APP_CATALOG.map(async (app) => {
          try {
            const can = await Linking.canOpenURL(app.scheme);
            return { appId: app.appId, installed: can };
          } catch {
            return { appId: app.appId, installed: false };
          }
        })
      );
      if (cancelled) {
        return;
      }
      const next: Record<string, boolean> = {};
      for (const p of probes) {
        next[p.appId] = p.installed;
      }
      setInstalledMap(next);
      if (locked && locked.length > 0) {
        await syncInstalled({ apps: probes });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [locked, syncInstalled]);

  const lockedCount = locked?.length ?? 0;
  const upcoming = nextPrayer ? fmt12(nextPrayer.time) : null;
  const upcomingName = nextPrayer ? nextPrayer.name : null;

  const lockedByAppId = useMemo(() => {
    const map = new Map<string, NonNullable<typeof locked>[number]>();
    for (const row of locked ?? []) {
      map.set(row.appId, row);
    }
    return map;
  }, [locked]);

  const availableApps = useMemo(() => {
    const installed: CatalogApp[] = [];
    const others: CatalogApp[] = [];
    for (const app of APP_CATALOG) {
      if (lockedByAppId.has(app.appId)) {
        continue;
      }
      if (installedMap[app.appId]) {
        installed.push(app);
      } else {
        others.push(app);
      }
    }
    return { installed, others };
  }, [installedMap, lockedByAppId]);

  const openRow = openAppId ? lockedByAppId.get(openAppId) : undefined;
  const openMeta = openAppId ? CATALOG_BY_ID[openAppId] : undefined;

  const onAdd = useCallback(
    async (appId: string) => {
      Haptics.selectionAsync();
      await addApp({ appId });
    },
    [addApp]
  );

  const onToggleWindow = useCallback(
    async (appId: string, win: PrayerWindow) => {
      const row = lockedByAppId.get(appId);
      if (!row) {
        return;
      }
      const next = row.windows.includes(win)
        ? row.windows.filter((w) => w !== win)
        : [...row.windows, win];
      await setWindows({ appId, windows: next });
    },
    [lockedByAppId, setWindows]
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      <Animated.ScrollView
        contentContainerStyle={{ paddingTop: insets.top, paddingBottom: 140 }}
        onScroll={onScroll}
        scrollEventThrottle={16}
        scrollIndicatorInsets={{ top: insets.top }}
        showsVerticalScrollIndicator={false}
      >
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
            Locked apps
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
              {lockedCount}
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
            <View
              style={{
                flexDirection: "row",
                gap: 4,
                paddingBottom: 10,
              }}
            >
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

        <View
          style={{
            flexDirection: "row",
            gap: 24,
            marginTop: 28,
            paddingHorizontal: 20,
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
            active={door === "available"}
            color={colors.ink}
            label="Available"
            mutedColor={colors.inkSubtle}
            onPress={() => setDoor("available")}
          />
        </View>

        <View
          style={{ height: 1, backgroundColor: colors.divider, marginTop: 12 }}
        />

        {door === "quieted" ? (
          <QuietedList
            colors={colors}
            installedMap={installedMap}
            locked={locked ?? []}
            onRowPress={(id) => setOpenAppId(id)}
          />
        ) : (
          <AvailableGrid
            colors={colors}
            installed={availableApps.installed}
            onAdd={onAdd}
            others={availableApps.others}
          />
        )}
      </Animated.ScrollView>
      <ScrollBlurHeader scrollY={scrollY} />

      <Modal
        animationType="fade"
        onRequestClose={() => setOpenAppId(null)}
        transparent
        visible={!!openAppId}
      >
        <Pressable
          onPress={() => setOpenAppId(null)}
          style={{
            backgroundColor: "rgba(0,0,0,0.4)",
            flex: 1,
            justifyContent: "flex-end",
          }}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              backgroundColor: colors.bg,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingBottom: insets.bottom + 16,
              paddingHorizontal: 20,
              paddingTop: 20,
            }}
          >
            {openRow && openMeta ? (
              <View style={{ gap: 16 }}>
                <View
                  style={{
                    alignItems: "center",
                    flexDirection: "row",
                    gap: 14,
                  }}
                >
                  <Monogram
                    borderColor={colors.border}
                    color={colors.ink}
                    label={openMeta.monogram}
                    size={48}
                  />
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: colors.ink,
                        fontFamily: "LibreBaskerville-Bold",
                        fontSize: 20,
                      }}
                    >
                      {openMeta.name}
                    </Text>
                    <Text
                      style={{
                        color: colors.inkMuted,
                        fontSize: 12,
                        marginTop: 2,
                      }}
                    >
                      {openRow.enabled ? "Locked" : "Paused"}
                      {" · "}
                      {openRow.windows.length} of 5 windows
                    </Text>
                  </View>
                </View>

                <View style={{ height: 1, backgroundColor: colors.divider }} />

                <Text
                  style={{
                    color: colors.inkMuted,
                    fontSize: 10,
                    fontWeight: "700",
                    letterSpacing: 2,
                    textTransform: "uppercase",
                  }}
                >
                  Locked during
                </Text>
                <View
                  style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}
                >
                  {ALL_WINDOWS.map((w) => {
                    const on = openRow.windows.includes(w);
                    return (
                      <TouchableOpacity
                        key={w}
                        onPress={() => onToggleWindow(openRow.appId, w)}
                        style={{
                          backgroundColor: on
                            ? colors.primarySoft
                            : "transparent",
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

                <View style={{ height: 1, backgroundColor: colors.divider }} />

                <TouchableOpacity
                  onPress={() => {
                    setEnabled({
                      appId: openRow.appId,
                      enabled: !openRow.enabled,
                    });
                  }}
                  style={{ paddingVertical: 12 }}
                >
                  <Text style={{ color: colors.ink, fontSize: 16 }}>
                    {openRow.enabled ? "Pause this app" : "Resume locking"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={async () => {
                    await removeApp({ appId: openRow.appId });
                    setOpenAppId(null);
                  }}
                  style={{ paddingVertical: 12 }}
                >
                  <Text style={{ color: colors.ink, fontSize: 16 }}>
                    Remove from list
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function DoorTab({
  active,
  color,
  mutedColor,
  label,
  onPress,
}: {
  active: boolean;
  color: string;
  mutedColor: string;
  label: string;
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

function Monogram({
  borderColor,
  color,
  label,
  size,
  dim,
}: {
  borderColor: string;
  color: string;
  label: string;
  size: number;
  dim?: boolean;
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
        opacity: dim ? 0.4 : 1,
        width: size,
      }}
    >
      <Text
        style={{
          color,
          fontFamily: "LibreBaskerville-Bold",
          fontSize: size * 0.4,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function QuietedList({
  colors,
  locked,
  installedMap,
  onRowPress,
}: {
  colors: ReturnType<typeof useTheme>["colors"];
  locked: NonNullable<
    ReturnType<typeof useQuery<typeof api.lib.lockedApps.listMine>>
  >;
  installedMap: Record<string, boolean>;
  onRowPress: (appId: string) => void;
}) {
  if (locked.length === 0) {
    return (
      <View style={{ paddingHorizontal: 20, paddingTop: 32 }}>
        <Text
          style={{
            color: colors.ink,
            fontFamily: "LibreBaskerville-Bold",
            fontSize: 20,
          }}
        >
          Pick the apps that pull at you.
        </Text>
        <Text style={{ color: colors.inkMuted, fontSize: 14, marginTop: 8 }}>
          Tap Available to add the ones you want quiet at salah.
        </Text>
      </View>
    );
  }
  return (
    <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
      {locked.map((row) => {
        const meta = CATALOG_BY_ID[row.appId];
        if (!meta) {
          return null;
        }
        const isInstalled = installedMap[row.appId] ?? row.installed;
        const dim = !row.enabled;
        return (
          <TouchableOpacity
            key={row._id}
            onPress={() => onRowPress(row.appId)}
            style={{
              alignItems: "center",
              borderBottomColor: colors.divider,
              borderBottomWidth: 1,
              flexDirection: "row",
              gap: 14,
              opacity: dim ? 0.55 : 1,
              paddingVertical: 14,
            }}
          >
            <Monogram
              borderColor={colors.border}
              color={colors.ink}
              label={meta.monogram}
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
                {meta.name}
              </Text>
              <Text
                style={{
                  color: colors.inkMuted,
                  fontSize: 12,
                  marginTop: 2,
                }}
              >
                {row.windows.length === 5
                  ? "All five prayers"
                  : row.windows.map((w) => WINDOW_LABELS[w]).join(" · ")}
                {isInstalled ? "" : " · not installed"}
              </Text>
            </View>
            {dim ? (
              <Text
                style={{
                  color: colors.inkMuted,
                  fontSize: 11,
                  letterSpacing: 1.4,
                  textTransform: "uppercase",
                }}
              >
                paused
              </Text>
            ) : null}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function AvailableGrid({
  colors,
  installed,
  others,
  onAdd,
}: {
  colors: ReturnType<typeof useTheme>["colors"];
  installed: CatalogApp[];
  others: CatalogApp[];
  onAdd: (appId: string) => void;
}) {
  return (
    <View style={{ gap: 24, paddingHorizontal: 20, paddingTop: 16 }}>
      {installed.length > 0 ? (
        <Section
          colors={colors}
          title={`Installed on this phone (${installed.length})`}
        >
          <Grid apps={installed} colors={colors} onAdd={onAdd} />
        </Section>
      ) : null}
      {others.length > 0 ? (
        <Section colors={colors} title="Not installed">
          <Grid apps={others} colors={colors} dim onAdd={onAdd} />
        </Section>
      ) : null}
    </View>
  );
}

function Section({
  colors,
  title,
  children,
}: {
  colors: ReturnType<typeof useTheme>["colors"];
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={{ gap: 12 }}>
      <Text
        style={{
          color: colors.inkMuted,
          fontSize: 10,
          fontWeight: "700",
          letterSpacing: 2,
          textTransform: "uppercase",
        }}
      >
        {title}
      </Text>
      {children}
    </View>
  );
}

function Grid({
  apps,
  colors,
  dim,
  onAdd,
}: {
  apps: CatalogApp[];
  colors: ReturnType<typeof useTheme>["colors"];
  dim?: boolean;
  onAdd: (appId: string) => void;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
      }}
    >
      {apps.map((app) => (
        <GridTile
          app={app}
          colors={colors}
          dim={dim}
          key={app.appId}
          onAdd={onAdd}
        />
      ))}
    </View>
  );
}

function GridTile({
  app,
  colors,
  dim,
  onAdd,
}: {
  app: CatalogApp;
  colors: ReturnType<typeof useTheme>["colors"];
  dim?: boolean;
  onAdd: (appId: string) => void;
}) {
  const flash = useSharedValue(0);
  const onPress = () => {
    flash.value = 1;
    flash.value = withTiming(0, { duration: 220 });
    onAdd(app.appId);
  };
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        alignItems: "center",
        opacity: dim ? 0.4 : 1,
        width: "30%",
      }}
    >
      <Animated.View
        style={{
          alignItems: "center",
          aspectRatio: 1,
          borderColor: colors.border,
          borderRadius: 14,
          borderWidth: 1,
          justifyContent: "center",
          width: "100%",
        }}
      >
        <Text
          style={{
            color: colors.ink,
            fontFamily: "LibreBaskerville-Bold",
            fontSize: 24,
          }}
        >
          {app.monogram}
        </Text>
      </Animated.View>
      <Text
        style={{
          color: colors.ink,
          fontSize: 12,
          marginTop: 8,
          textAlign: "center",
        }}
      >
        {app.name}
      </Text>
    </TouchableOpacity>
  );
}
