import Foundation

// This file provides default configuration values.
// The actual values are injected by the config plugin at prebuild time
// into a generated file in the app's ios directory.
// If the generated file exists, its values override these defaults.

public struct ExpoAppBlockerConfig {
  public static var appGroupIdentifier: String {
    // Plugin writes this into Info.plist at prebuild time.
    if let appGroup = Bundle.main.object(forInfoDictionaryKey: "ExpoAppBlockerAppGroup") as? String,
       !appGroup.isEmpty {
      return appGroup
    }
    // Legacy fallback — kept so older builds don't crash.
    if let appGroup = UserDefaults.standard.string(forKey: "expo.appblocker.appGroup") {
      return appGroup
    }
    return "group.\(Bundle.main.bundleIdentifier ?? "expo.app-blocker")"
  }
}
