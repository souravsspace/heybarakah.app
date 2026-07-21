import { beforeEach, describe, expect, mock, test } from "bun:test";

// ──────────────────────────────────────────────────────────────────────────────
// Mocks — must be registered before importing the module under test.
// ──────────────────────────────────────────────────────────────────────────────

// Mutable platform holder. `index.ts` reads `Platform.OS` at call time (not
// import time) for its gating, so mutating `.OS` between tests switches the
// active platform. It is fixed to "ios" at import so the native *view*
// managers (resolved once at module load) are wired up.
const platform: { OS: string } = { OS: "ios" };

// Default implementations, reapplied before each test. The native module is
// captured ONCE at import, so `native` must be a stable reference — we reset the
// mock fns in place rather than swapping the object.
const DEFAULTS: Record<string, () => unknown> = {
  // android permissions
  checkOverlayPermission: async () => true,
  checkUsageStatsPermission: async () => true,
  checkNotificationPermission: async () => true,
  // ios permissions
  getAuthorizationStatus: () => ({ authorized: true, status: "approved" }),
  requestAuthorization: async () => ({ authorized: true, status: "approved" }),
  // android settings + apps
  openOverlaySettings: () => undefined,
  openUsageStatsSettings: () => undefined,
  getInstalledApps: async () => [{ packageName: "com.x", appName: "X" }],
  setBlockedApps: () => undefined,
  getBlockedApps: () => ["com.x"],
  setAndroidConfig: () => undefined,
  startMonitoring: () => undefined,
  stopMonitoring: () => undefined,
  // ios family controls
  presentFamilyActivityPicker: async () => [
    { token: "t1", type: "app", displayName: "App" },
    { type: "summary" },
  ],
  setBlockConfiguration: async () => undefined,
  getBlockConfiguration: () => ({ items: [] }),
  clearAllBlocks: () => undefined,
  scheduleBlockWindows: () => undefined,
  clearScheduledWindows: () => undefined,
  removeBlockedItem: async () => ({ removed: true, remaining: 2 }),
  isAppBlocked: () => true,
  // ios temporary unlock
  temporaryUnlock: async () => ({ unlocked: true, expiresAt: 123 }),
  isTemporarilyUnlocked: () => true,
  getRemainingUnlockTime: () => 42,
  relockApps: async () => ({ locked: true }),
  liftShieldNow: () => undefined,
  checkAndClearPendingUnlock: () => true,
};

const native = Object.fromEntries(
  Object.keys(DEFAULTS).map((key) => [key, mock(DEFAULTS[key])])
) as Record<string, ReturnType<typeof mock>>;

function resetNative() {
  for (const key of Object.keys(DEFAULTS)) {
    native[key].mockReset();
    native[key].mockImplementation(DEFAULTS[key]);
  }
}
const lastListener = { remove: mock(() => undefined) };
const addListener = mock(() => lastListener);

mock.module("expo-modules-core", () => ({
  requireNativeModule: () => native,
  requireNativeViewManager: (name: string) => `NativeView(${name})`,
  EventEmitter: class {
    addListener(event: string, handler: () => void) {
      return addListener(event, handler);
    }
  },
}));

mock.module("react-native", () => ({ Platform: platform }));

const blocker = require("./index") as typeof import("./index");

beforeEach(() => {
  resetNative();
  addListener.mockClear();
  lastListener.remove.mockClear();
  platform.OS = "ios";
});

// ──────────────────────────────────────────────────────────────────────────────
// getPermissionStatus / requestPermissions
// ──────────────────────────────────────────────────────────────────────────────

describe("getPermissionStatus", () => {
  test("android: aggregates all three permission checks (all granted)", async () => {
    platform.OS = "android";
    const result = await blocker.getPermissionStatus();
    expect(result.allGranted).toBe(true);
    expect(result.details).toEqual({
      platform: "android",
      overlay: true,
      usageStats: true,
      notifications: true,
    });
    expect(native.checkOverlayPermission).toHaveBeenCalledTimes(1);
    expect(native.checkUsageStatsPermission).toHaveBeenCalledTimes(1);
    expect(native.checkNotificationPermission).toHaveBeenCalledTimes(1);
  });

  test("android: allGranted false when any permission missing", async () => {
    platform.OS = "android";
    native.checkUsageStatsPermission.mockResolvedValue(false);
    const result = await blocker.getPermissionStatus();
    expect(result.allGranted).toBe(false);
    expect((result.details as { usageStats: boolean }).usageStats).toBe(false);
  });

  test("ios: maps authorization status", async () => {
    platform.OS = "ios";
    const result = await blocker.getPermissionStatus();
    expect(result.allGranted).toBe(true);
    expect(result.details).toEqual({
      platform: "ios",
      authorized: true,
      status: "approved",
    });
  });

  test("ios: allGranted follows `authorized` flag", async () => {
    platform.OS = "ios";
    native.getAuthorizationStatus.mockReturnValue({
      authorized: false,
      status: "denied",
    });
    const result = await blocker.getPermissionStatus();
    expect(result.allGranted).toBe(false);
  });

  test("throws on unsupported platform", async () => {
    platform.OS = "web";
    await expect(blocker.getPermissionStatus()).rejects.toThrow(
      "Unsupported platform"
    );
  });
});

describe("requestPermissions", () => {
  test("ios: requests authorization and maps it", async () => {
    platform.OS = "ios";
    const result = await blocker.requestPermissions();
    expect(native.requestAuthorization).toHaveBeenCalledTimes(1);
    expect(result.allGranted).toBe(true);
    expect((result.details as { platform: string }).platform).toBe("ios");
  });

  test("android: delegates to getPermissionStatus (no requestAuthorization)", async () => {
    platform.OS = "android";
    const result = await blocker.requestPermissions();
    expect(native.requestAuthorization).not.toHaveBeenCalled();
    expect(result.details.platform).toBe("android");
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Android-only functions: no-op / empty off-platform
// ──────────────────────────────────────────────────────────────────────────────

describe("android-only functions", () => {
  test("openOverlaySettings delegates on android, no-ops elsewhere", () => {
    platform.OS = "android";
    blocker.openOverlaySettings();
    expect(native.openOverlaySettings).toHaveBeenCalledTimes(1);

    platform.OS = "ios";
    blocker.openOverlaySettings();
    expect(native.openOverlaySettings).toHaveBeenCalledTimes(1);
  });

  test("openUsageStatsSettings delegates on android, no-ops elsewhere", () => {
    platform.OS = "android";
    blocker.openUsageStatsSettings();
    expect(native.openUsageStatsSettings).toHaveBeenCalledTimes(1);
    platform.OS = "ios";
    blocker.openUsageStatsSettings();
    expect(native.openUsageStatsSettings).toHaveBeenCalledTimes(1);
  });

  test("getInstalledApps returns [] off android", async () => {
    platform.OS = "ios";
    expect(await blocker.getInstalledApps()).toEqual([]);
    expect(native.getInstalledApps).not.toHaveBeenCalled();
  });

  test("getInstalledApps delegates on android", async () => {
    platform.OS = "android";
    const apps = await blocker.getInstalledApps();
    expect(apps).toEqual([{ packageName: "com.x", appName: "X" }]);
  });

  test("setBlockedApps delegates on android, no-ops elsewhere", () => {
    platform.OS = "android";
    blocker.setBlockedApps(["com.a"]);
    expect(native.setBlockedApps).toHaveBeenCalledWith(["com.a"]);
    platform.OS = "ios";
    blocker.setBlockedApps(["com.b"]);
    expect(native.setBlockedApps).toHaveBeenCalledTimes(1);
  });

  test("getBlockedApps returns [] off android, delegates on android", () => {
    platform.OS = "ios";
    expect(blocker.getBlockedApps()).toEqual([]);
    platform.OS = "android";
    expect(blocker.getBlockedApps()).toEqual(["com.x"]);
  });

  test("configureAndroid forwards config on android", () => {
    platform.OS = "android";
    const cfg = { overlayTitle: "Blocked" } as never;
    blocker.configureAndroid(cfg);
    expect(native.setAndroidConfig).toHaveBeenCalledWith(cfg);
    platform.OS = "ios";
    blocker.configureAndroid(cfg);
    expect(native.setAndroidConfig).toHaveBeenCalledTimes(1);
  });

  test("startMonitoring / stopMonitoring gate on android", () => {
    platform.OS = "android";
    blocker.startMonitoring();
    blocker.stopMonitoring();
    expect(native.startMonitoring).toHaveBeenCalledTimes(1);
    expect(native.stopMonitoring).toHaveBeenCalledTimes(1);
    platform.OS = "ios";
    blocker.startMonitoring();
    blocker.stopMonitoring();
    expect(native.startMonitoring).toHaveBeenCalledTimes(1);
    expect(native.stopMonitoring).toHaveBeenCalledTimes(1);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// iOS Family Controls
// ──────────────────────────────────────────────────────────────────────────────

describe("iOS family-controls functions", () => {
  test("presentFamilyActivityPicker throws off iOS", async () => {
    platform.OS = "android";
    await expect(blocker.presentFamilyActivityPicker()).rejects.toThrow(
      "only available on iOS"
    );
  });

  test("presentFamilyActivityPicker returns native rows (incl. summary) on iOS", async () => {
    platform.OS = "ios";
    const rows = await blocker.presentFamilyActivityPicker();
    expect(rows).toHaveLength(2);
    expect(rows.at(-1)).toEqual({ type: "summary" });
  });

  test("setBlockConfiguration throws off iOS, delegates on iOS", async () => {
    platform.OS = "android";
    await expect(
      blocker.setBlockConfiguration({ items: [] } as never)
    ).rejects.toThrow("only available on iOS");
    platform.OS = "ios";
    await blocker.setBlockConfiguration({ items: [] } as never);
    expect(native.setBlockConfiguration).toHaveBeenCalledTimes(1);
  });

  test("getBlockConfiguration returns null off iOS", () => {
    platform.OS = "android";
    expect(blocker.getBlockConfiguration()).toBeNull();
    platform.OS = "ios";
    expect(blocker.getBlockConfiguration()).toEqual({ items: [] });
  });

  test("clearAllBlocks gates on iOS", () => {
    platform.OS = "android";
    blocker.clearAllBlocks();
    expect(native.clearAllBlocks).not.toHaveBeenCalled();
    platform.OS = "ios";
    blocker.clearAllBlocks();
    expect(native.clearAllBlocks).toHaveBeenCalledTimes(1);
  });

  test("scheduleBlockWindows / clearScheduledWindows gate on iOS", () => {
    const windows = [{ startMinute: 300, endMinute: 316 }] as never;
    platform.OS = "android";
    blocker.scheduleBlockWindows(windows);
    blocker.clearScheduledWindows();
    expect(native.scheduleBlockWindows).not.toHaveBeenCalled();
    expect(native.clearScheduledWindows).not.toHaveBeenCalled();
    platform.OS = "ios";
    blocker.scheduleBlockWindows(windows);
    blocker.clearScheduledWindows();
    expect(native.scheduleBlockWindows).toHaveBeenCalledWith(windows);
    expect(native.clearScheduledWindows).toHaveBeenCalledTimes(1);
  });

  test("removeBlockedItem returns stub off iOS, delegates on iOS", async () => {
    platform.OS = "android";
    expect(await blocker.removeBlockedItem("t1", "app")).toEqual({
      removed: false,
      remaining: 0,
    });
    platform.OS = "ios";
    expect(await blocker.removeBlockedItem("t1", "app")).toEqual({
      removed: true,
      remaining: 2,
    });
    expect(native.removeBlockedItem).toHaveBeenCalledWith("t1", "app");
  });

  test("isAppBlocked returns false off iOS, delegates on iOS", () => {
    platform.OS = "android";
    expect(blocker.isAppBlocked("com.x")).toBe(false);
    platform.OS = "ios";
    expect(blocker.isAppBlocked("com.x")).toBe(true);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// iOS Temporary unlock
// ──────────────────────────────────────────────────────────────────────────────

describe("iOS temporary-unlock functions", () => {
  test("temporaryUnlock throws off iOS", async () => {
    platform.OS = "android";
    await expect(blocker.temporaryUnlock()).rejects.toThrow(
      "only available on iOS"
    );
  });

  test("temporaryUnlock passes default and explicit duration on iOS", async () => {
    platform.OS = "ios";
    await blocker.temporaryUnlock();
    expect(native.temporaryUnlock).toHaveBeenCalledWith(15);
    await blocker.temporaryUnlock(30);
    expect(native.temporaryUnlock).toHaveBeenCalledWith(30);
  });

  test("isTemporarilyUnlocked false off iOS, delegates on iOS", () => {
    platform.OS = "android";
    expect(blocker.isTemporarilyUnlocked()).toBe(false);
    platform.OS = "ios";
    expect(blocker.isTemporarilyUnlocked()).toBe(true);
  });

  test("getRemainingUnlockTime 0 off iOS, delegates on iOS", () => {
    platform.OS = "android";
    expect(blocker.getRemainingUnlockTime()).toBe(0);
    platform.OS = "ios";
    expect(blocker.getRemainingUnlockTime()).toBe(42);
  });

  test("relockApps throws off iOS, delegates on iOS", async () => {
    platform.OS = "android";
    await expect(blocker.relockApps()).rejects.toThrow("only available on iOS");
    platform.OS = "ios";
    expect(await blocker.relockApps()).toEqual({ locked: true });
  });

  test("liftShieldNow gates on iOS", () => {
    platform.OS = "android";
    blocker.liftShieldNow();
    expect(native.liftShieldNow).not.toHaveBeenCalled();
    platform.OS = "ios";
    blocker.liftShieldNow();
    expect(native.liftShieldNow).toHaveBeenCalledTimes(1);
  });

  test("checkAndClearPendingUnlock false off iOS, delegates on iOS", () => {
    platform.OS = "android";
    expect(blocker.checkAndClearPendingUnlock()).toBe(false);
    platform.OS = "ios";
    expect(blocker.checkAndClearPendingUnlock()).toBe(true);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Event listener
// ──────────────────────────────────────────────────────────────────────────────

describe("addPendingUnlockListener", () => {
  test("returns null off iOS", () => {
    platform.OS = "android";
    expect(blocker.addPendingUnlockListener(() => undefined)).toBeNull();
    expect(addListener).not.toHaveBeenCalled();
  });

  test("subscribes to onPendingUnlockRequest on iOS", () => {
    platform.OS = "ios";
    const handler = () => undefined;
    const sub = blocker.addPendingUnlockListener(handler);
    expect(addListener).toHaveBeenCalledWith("onPendingUnlockRequest", handler);
    expect(sub).toBe(lastListener);
    sub?.remove();
    expect(lastListener.remove).toHaveBeenCalledTimes(1);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Native views
// ──────────────────────────────────────────────────────────────────────────────

describe("BlockedAppsNativeList", () => {
  test("returns null off iOS", () => {
    platform.OS = "android";
    expect(
      blocker.BlockedAppsNativeList({ items: [], theme: "light" })
    ).toBeNull();
  });

  test("filters summary rows and maps display names on iOS", () => {
    platform.OS = "ios";
    const el = blocker.BlockedAppsNativeList({
      items: [
        { token: "a", type: "app", displayName: "Instagram" },
        { token: "b", type: "category", categoryName: "Social" },
        { token: "c", type: "webDomain", domain: "x.com" },
        { token: "z", type: "summary" as never },
      ] as never,
      theme: "dark",
    });
    expect(el).not.toBeNull();
    const tokens = (el as { props: { tokens: unknown[] } }).props.tokens;
    expect(tokens).toEqual([
      { token: "a", type: "app", displayName: "Instagram" },
      { token: "b", type: "category", displayName: "Social" },
      { token: "c", type: "webDomain", displayName: "x.com" },
    ]);
  });

  test("falls back to empty display name when all name fields absent", () => {
    platform.OS = "ios";
    const el = blocker.BlockedAppsNativeList({
      items: [{ token: "a", type: "app" }] as never,
      theme: "light",
    });
    const tokens = (el as { props: { tokens: { displayName: string }[] } })
      .props.tokens;
    expect(tokens[0].displayName).toBe("");
  });

  test("defaults theme to light when omitted", () => {
    platform.OS = "ios";
    const el = blocker.BlockedAppsNativeList({ items: [] } as never);
    expect((el as { props: { theme: string } }).props.theme).toBe("light");
  });
});

describe("FamilyActivityPickerView", () => {
  test("returns null off iOS", () => {
    platform.OS = "android";
    expect(blocker.FamilyActivityPickerView({})).toBeNull();
  });

  test("wraps onSelectionChange to strip non-item rows", () => {
    platform.OS = "ios";
    let received: { items: { type: string }[] } | null = null;
    const el = blocker.FamilyActivityPickerView({
      onSelectionChange: (e) => {
        received = e as never;
      },
    });
    const onChange = (el as { props: { onSelectionChange: (e: unknown) => void } })
      .props.onSelectionChange;
    onChange({
      nativeEvent: {
        items: [
          { type: "app" },
          { type: "category" },
          { type: "webDomain" },
          { type: "summary" },
          { type: undefined },
        ],
      },
    });
    expect(received).not.toBeNull();
    expect((received as unknown as { items: { type: string }[] }).items).toEqual([
      { type: "app" },
      { type: "category" },
      { type: "webDomain" },
    ]);
  });

  test("omits clearTrigger prop when undefined, forwards it when set", () => {
    platform.OS = "ios";
    const without = blocker.FamilyActivityPickerView({});
    expect(
      "clearTrigger" in (without as { props: Record<string, unknown> }).props
    ).toBe(false);
    const withTrigger = blocker.FamilyActivityPickerView({ clearTrigger: 3 });
    expect(
      (withTrigger as { props: { clearTrigger: number } }).props.clearTrigger
    ).toBe(3);
  });

  test("defaults initialSelection to empty string and theme to system", () => {
    platform.OS = "ios";
    const el = blocker.FamilyActivityPickerView({});
    const props = (el as { props: { initialSelection: string; theme: string } })
      .props;
    expect(props.initialSelection).toBe("");
    expect(props.theme).toBe("system");
  });
});
