// Pure helpers that turn plugin config into the Swift literals baked into the
// Shield / DeviceActivityMonitor extension templates at config-eval time. Kept
// in their own module so they can be unit-tested: a bad substitution here (an
// unescaped quote, an unreplaced APP_GROUP_PLACEHOLDER) produces Swift that
// either fails to compile or, worse, silently reads the wrong app group — in
// which case the extension can never read the block config and apps never lock
// at salah. See swift-substitutions.test.js.

// Swift string-literal escaping for substitutions that land inside `"..."`.
function escapeSwiftString(s) {
  return String(s)
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r");
}

function hexToRgb(hex) {
  let h = String(hex).replace("#", "").trim();
  // Expand shorthand #abc → #aabbcc.
  if (h.length === 3) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (!/^[0-9a-fA-F]{6}$/.test(h)) {
    throw new Error(
      `expo-app-blocker: invalid hex color "${hex}" — expected #RGB or #RRGGBB`
    );
  }
  return {
    r: (Number.parseInt(h.substring(0, 2), 16) / 255).toFixed(3),
    g: (Number.parseInt(h.substring(2, 4), 16) / 255).toFixed(3),
    b: (Number.parseInt(h.substring(4, 6), 16) / 255).toFixed(3),
  };
}

function uiColorLiteral(hex) {
  const c = hexToRgb(hex);
  return `UIColor(red: ${c.r}, green: ${c.g}, blue: ${c.b}, alpha: 1.0)`;
}

function dynamicColorExpr(lightHex, darkHex) {
  const light = uiColorLiteral(lightHex);
  if (!darkHex) {
    return light;
  }
  const dark = uiColorLiteral(darkHex);
  return `UIColor { trait in trait.userInterfaceStyle == .dark ? ${dark} : ${light} }`;
}

function renderCountSuffixSwift(template) {
  if (!template) {
    return '""';
  }
  const escaped = escapeSwiftString(template);
  return `"${escaped.replace(/\{count\}/g, "\\(count)")}"`;
}

const BLUR_STYLE_MAP = {
  systemUltraThinMaterial: ".systemUltraThinMaterial",
  systemThinMaterial: ".systemThinMaterial",
  systemMaterial: ".systemMaterial",
  systemThickMaterial: ".systemThickMaterial",
  systemChromeMaterial: ".systemChromeMaterial",
  systemUltraThinMaterialLight: ".systemUltraThinMaterialLight",
  systemThinMaterialLight: ".systemThinMaterialLight",
  systemMaterialLight: ".systemMaterialLight",
  systemThickMaterialLight: ".systemThickMaterialLight",
  systemChromeMaterialLight: ".systemChromeMaterialLight",
  systemUltraThinMaterialDark: ".systemUltraThinMaterialDark",
  systemThinMaterialDark: ".systemThinMaterialDark",
  systemMaterialDark: ".systemMaterialDark",
  systemThickMaterialDark: ".systemThickMaterialDark",
  systemChromeMaterialDark: ".systemChromeMaterialDark",
  regular: ".regular",
  prominent: ".prominent",
  light: ".light",
  dark: ".dark",
  extraLight: ".extraLight",
};

// Build the full placeholder → Swift-literal replacement map from the resolved
// app group and the user's plugin config. Every PLACEHOLDER token in the
// template Swift files must have a key here, or it survives into built Swift.
function buildSwiftReplacements(appGroup, pluginConfig = {}) {
  const shield = pluginConfig?.ios?.shield || {};

  const primaryColorExpr = dynamicColorExpr(
    shield.primaryButtonColor || "#fb6107",
    shield.darkPrimaryButtonColor || null
  );
  const titleColorExpr = dynamicColorExpr(
    shield.titleColor || "#111111",
    shield.darkTitleColor || null
  );
  const subtitleColorExpr = dynamicColorExpr(
    shield.subtitleColor || "#737373",
    shield.darkSubtitleColor || null
  );
  const bgColorHex = shield.backgroundColor || null;
  const darkBgColorHex = shield.darkBackgroundColor || null;

  const blurRaw =
    shield.backgroundBlurStyle || (bgColorHex ? null : "systemThickMaterial");
  const blurSwift = blurRaw && BLUR_STYLE_MAP[blurRaw] ? BLUR_STYLE_MAP[blurRaw] : null;

  const notification = pluginConfig?.ios?.notification || {};
  const notificationTitle = notification.title || "App Blocker";
  const notificationBody =
    notification.body ||
    "Tap to return to the app and complete the unlock challenge.";
  const notificationAttachIcon =
    notification.attachIcon === false ? "false" : "true";

  const tempUnlockTitle = shield.tempUnlockTitle || "Almost there!";
  const tempUnlockSubtitle =
    shield.tempUnlockSubtitle ||
    "Your free time is loading. Try again in a moment.";
  const tempUnlockButtonLabel = shield.tempUnlockButtonLabel || "OK";

  const countSuffixTemplate =
    shield.countSuffix === undefined
      ? " You have {count} apps blocked."
      : shield.countSuffix;

  return {
    APP_GROUP_PLACEHOLDER: escapeSwiftString(appGroup),
    SHIELD_TITLE_PLACEHOLDER: escapeSwiftString(shield.title || "Hold on!"),
    SHIELD_SUBTITLE_PLACEHOLDER: escapeSwiftString(
      shield.subtitle || "{appName} is blocked."
    ),
    SHIELD_PRIMARY_BUTTON_PLACEHOLDER: escapeSwiftString(
      shield.primaryButtonLabel || "Earn Free Time"
    ),
    SHIELD_SECONDARY_BUTTON_PLACEHOLDER: escapeSwiftString(
      shield.secondaryButtonLabel === null
        ? "none"
        : shield.secondaryButtonLabel || "Not now"
    ),
    SHIELD_TEMP_UNLOCK_TITLE_PLACEHOLDER: escapeSwiftString(tempUnlockTitle),
    SHIELD_TEMP_UNLOCK_SUBTITLE_PLACEHOLDER:
      escapeSwiftString(tempUnlockSubtitle),
    SHIELD_TEMP_UNLOCK_BUTTON_PLACEHOLDER:
      escapeSwiftString(tempUnlockButtonLabel),
    SHIELD_COUNT_SUFFIX_SWIFT_PLACEHOLDER:
      renderCountSuffixSwift(countSuffixTemplate),
    NOTIFICATION_TITLE_PLACEHOLDER: escapeSwiftString(notificationTitle),
    NOTIFICATION_BODY_PLACEHOLDER: escapeSwiftString(notificationBody),
    NOTIFICATION_ATTACH_ICON_PLACEHOLDER: notificationAttachIcon,
    SHIELD_PRIMARY_COLOR_EXPR_PLACEHOLDER: primaryColorExpr,
    SHIELD_TITLE_COLOR_EXPR_PLACEHOLDER: titleColorExpr,
    SHIELD_SUBTITLE_COLOR_EXPR_PLACEHOLDER: subtitleColorExpr,
    SHIELD_BG_COLOR_PLACEHOLDER: bgColorHex
      ? dynamicColorExpr(bgColorHex, darkBgColorHex)
      : "nil",
    SHIELD_BLUR_STYLE_PLACEHOLDER: blurSwift || "nil",
  };
}

// Apply a replacement map to a Swift template string. Mirrors the loop the
// plugin runs over each copied `.swift` file.
function applySwiftReplacements(content, replacements) {
  let out = content;
  for (const [key, value] of Object.entries(replacements)) {
    out = out.replace(new RegExp(key, "g"), value);
  }
  return out;
}

module.exports = {
  applySwiftReplacements,
  buildSwiftReplacements,
  dynamicColorExpr,
  escapeSwiftString,
  hexToRgb,
  renderCountSuffixSwift,
  uiColorLiteral,
};
