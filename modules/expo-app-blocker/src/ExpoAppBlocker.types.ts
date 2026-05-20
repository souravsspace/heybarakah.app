// ──────────────────────────────────────────────────────────────────────────────
// Permission types
// ──────────────────────────────────────────────────────────────────────────────

export interface PermissionStatus {
  allGranted: boolean;
  details: AndroidPermissions | IOSPermissions;
}

export interface AndroidPermissions {
  notifications: boolean;
  overlay: boolean;
  platform: "android";
  usageStats: boolean;
}

export interface IOSPermissions {
  authorized: boolean;
  platform: "ios";
  status: "notDetermined" | "denied" | "approved";
}

// ──────────────────────────────────────────────────────────────────────────────
// App selection types
// ──────────────────────────────────────────────────────────────────────────────

export interface AndroidBlockableApp {
  iconBase64?: string | null;
  name: string;
  packageName: string;
}

export interface IOSBlockedItem {
  bundleIdentifier?: string;
  categoryName?: string;
  displayName?: string;
  domain?: string;
  iconBase64?: string;
  token: string;
  type: "app" | "category" | "webDomain";
}

// ──────────────────────────────────────────────────────────────────────────────
// iOS-specific types
// ──────────────────────────────────────────────────────────────────────────────

export interface IOSBlockConfiguration {
  blockedItems: IOSBlockedItem[];
  isActive: boolean;
  schedule?: {
    intervalStart: number;
    intervalEnd: number;
    repeats: boolean;
    warningTime: number;
  };
}

export interface TemporaryUnlockResult {
  expiresAt: number;
  unlocked: boolean;
}

export interface RelockResult {
  locked: boolean;
}

export interface FamilyActivityPickerSelectionEvent {
  /** Selected apps, categories, and web domains (pass to setBlockConfiguration) */
  items: IOSBlockedItem[];
  /** Base64 string - save and pass back as initialSelection to restore state */
  selectionData: string;
  /** Number of individual apps selected */
  totalApps: number;
  /** Number of categories selected */
  totalCategories: number;
  /** Number of web domains selected */
  totalWebDomains: number;
}

export interface FamilyActivityPickerViewProps {
  /** Increment to programmatically clear the picker selection without remounting */
  clearTrigger?: number;
  /** Base64-encoded FamilyActivitySelection to restore a previous selection */
  initialSelection?: string;
  /** Called each time the user toggles an app or category */
  onSelectionChange?: (event: FamilyActivityPickerSelectionEvent) => void;
  /** Standard React Native style */
  style?: any;
  /** Forces the picker's color scheme: "light", "dark", or "system" (default) */
  theme?: "light" | "dark" | "system";
}

export interface BlockedAppsNativeListProps {
  /** Array of blocked items from picker */
  items: IOSBlockedItem[];
  /** Base64-encoded FamilyActivitySelection for accurate rendering */
  selectionData?: string;
  /** Standard React Native style */
  style?: any;
  /** Forces the list's color scheme: "light" (default), "dark", or "system" */
  theme?: "light" | "dark" | "system";
}

// ──────────────────────────────────────────────────────────────────────────────
// Plugin configuration types
// ──────────────────────────────────────────────────────────────────────────────

export interface ShieldConfig {
  /**
   * Background blur style. Default: "systemThickMaterial" (when no backgroundColor is set).
   * Set to null to disable blur (when using backgroundColor only).
   * Both can be combined - blur renders behind the color.
   *
   * Adaptive (light/dark auto):
   * - "systemUltraThinMaterial", "systemThinMaterial", "systemMaterial",
   *   "systemThickMaterial", "systemChromeMaterial"
   *
   * Light only:
   * - "systemUltraThinMaterialLight", "systemThinMaterialLight", "systemMaterialLight",
   *   "systemThickMaterialLight", "systemChromeMaterialLight"
   *
   * Dark only:
   * - "systemUltraThinMaterialDark", "systemThinMaterialDark", "systemMaterialDark",
   *   "systemThickMaterialDark", "systemChromeMaterialDark"
   *
   * Legacy: "regular", "prominent", "light", "dark", "extraLight"
   */
  backgroundBlurStyle?: string | null;
  /**
   * Solid background color (hex). Optional.
   * When set, the shield uses this color instead of (or in addition to) a blur.
   * Example: "#f6f6f6" for light gray, "#1a1a2e" for dark.
   */
  backgroundColor?: string | null;
  /** Path to shield icon image (PNG). Optional. */
  icon?: string;
  /** Primary button background color (hex). Default: "#fb6107" */
  primaryButtonColor?: string;
  /** Primary button label. Default: "Earn Free Time" */
  primaryButtonLabel?: string;
  /** Secondary button label. Set to null to hide. Default: "Not now" */
  secondaryButtonLabel?: string | null;
  /** Subtitle shown on the shield. Use {appName} as placeholder. Default: "{appName} is blocked." */
  subtitle?: string;
  /** Subtitle text color (hex). Default: "#737373" */
  subtitleColor?: string;
  /** Title shown on the shield. Default: "Hold on!" */
  title?: string;
  /** Title text color (hex). Default: "#111111" */
  titleColor?: string;
}

export interface AndroidConfig {
  /** Notification text when app is blocked. Use {appName} as placeholder. */
  notificationText?: string;
  /** Notification title when app is blocked. Use {appName} as placeholder. Default: "App Blocked" */
  notificationTitle?: string;
  /** Hex color (e.g. "#f6f6f6") for the overlay background. Default: "#FFFFFF". */
  overlayBackgroundColor?: string;
  /** Vertical gap (dp) between the icon and the title. Default: 20. */
  overlayIconBottomMargin?: number;
  /** Icon edge length in dp (square). Default: 96. Only used when an overlay icon is configured via the plugin. */
  overlayIconSize?: number;
  /** Inner padding (all sides) in dp. Default: 32. */
  overlayPadding?: number;
  /** Show an indeterminate circular spinner under the body text. Useful as a "launching…" cue during the brief gap between intercept and the deep-link landing. Default: false. */
  overlayShowSpinner?: boolean;
  /** Hex color (e.g. "#7cb518") tinting the spinner. Default: system primary. */
  overlaySpinnerColor?: string;
  /** Spinner edge length in dp (square). Default: 32. */
  overlaySpinnerSize?: number;
  /** Vertical gap (dp) between the body text and the spinner. Default: 24. */
  overlaySpinnerTopMargin?: number;
  /** Body text shown under the overlay title. Use {appName} as placeholder. Default: "{appName} is blocked." */
  overlayText?: string;
  /** Hex color (e.g. "#737373") for the overlay body text. Default: "#737373". */
  overlayTextColor?: string;
  /** Body font size in sp. Default: 16. */
  overlayTextFontSize?: number;
  /** Bold title rendered on the blocking overlay. Use {appName} as placeholder. Default: "App Blocked" */
  overlayTitle?: string;
  /** Render the title in bold. Default: true. */
  overlayTitleBold?: boolean;
  /** Vertical gap (dp) between the title and the body text. Default: 12. */
  overlayTitleBottomMargin?: number;
  /** Hex color (e.g. "#111111") for the overlay title text. Default: "#111111". */
  overlayTitleColor?: string;
  /** Title font size in sp. Default: 24. */
  overlayTitleFontSize?: number;
}

export interface PluginConfig {
  android?: AndroidConfig & {
    /**
     * URL scheme used for deep-linking back into your app when a blocked app is detected.
     * Defaults to your app's `scheme` from app.json, or the package name with dots replaced by hyphens.
     * Must match the scheme registered in your AndroidManifest intent-filter.
     */
    scheme?: string;
  };
  ios?: {
    /** App Group identifier for shared data between app and extensions. Required. */
    appGroup: string;
    /** Shield overlay customization */
    shield?: ShieldConfig;
  };
}
