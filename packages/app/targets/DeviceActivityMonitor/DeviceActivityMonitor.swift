import DeviceActivity
import ManagedSettings
import FamilyControls
import Foundation

@available(iOS 15.0, *)
class AppBlockerDeviceActivityMonitor: DeviceActivityMonitor {
  // CONFIGURE: Replace with your App Group identifier
  private let appGroupIdentifier = "group.com.souravsspace.Barakah.shield"
  private let temporaryUnlockKey = "appBlocker.temporaryUnlock.v1"
  private let blockConfigStorageKey = "appBlocker.blockConfiguration.v1"
  private let prayerActivityPrefix = "appBlocker.prayer."
  private let prayerWindowsKey = "appBlocker.prayerWindows.v1"

  private let store = ManagedSettingsStore()
  private var sharedDefaults: UserDefaults?

  override init() {
    super.init()
    sharedDefaults = UserDefaults(suiteName: appGroupIdentifier)
    log("init suite=\(appGroupIdentifier) defaults=\(sharedDefaults == nil ? "nil" : "ok")")
  }

  // Breadcrumb logger. The DeviceActivityMonitor extension runs in its own
  // process with a tiny (~6MB) memory budget; when it crashes or is jetsammed
  // mid-`intervalDidStart` the shield never applies and the OS shows a "Barakah
  // has crashed" report attributed to the host app. Nothing here reaches the
  // JS/PostHog layer, so these NSLogs are the only window into the salah path.
  // Read them on-device via Console.app (filter "BarakahShield") or
  // `idevicesyslog | grep BarakahShield`.
  private func log(_ message: String) {
    NSLog("[BarakahShield][monitor] \(message)")
  }

  override func intervalDidEnd(for activity: DeviceActivityName) {
    super.intervalDidEnd(for: activity)
    log("intervalDidEnd activity=\(activity.rawValue)")
    // Prayer window over → lift the shield so apps are usable until the next
    // salah. The token config stays persisted for the next window start.
    if activity.rawValue.hasPrefix(prayerActivityPrefix) {
      clearShields()
      return
    }
    // Temporary-unlock relock path: the earned unlock has expired. Only put the
    // shield back if we're still inside a prayer window — otherwise the window
    // already ended and apps should stay free until the next salah.
    sharedDefaults?.removeObject(forKey: temporaryUnlockKey)
    if isInsidePrayerWindow() {
      reapplyBlockConfiguration()
    } else {
      clearShields()
    }
  }

  private func isInsidePrayerWindow() -> Bool {
    guard
      let windows = sharedDefaults?.array(forKey: prayerWindowsKey)
        as? [[String: Int]]
    else {
      return false
    }
    let now = Calendar.current.dateComponents([.hour, .minute], from: Date())
    let nowMinutes = (now.hour ?? 0) * 60 + (now.minute ?? 0)
    return windows.contains { window in
      guard let start = window["start"], let end = window["end"] else {
        return false
      }
      // Window crossing midnight is stored as end < start, so the range wraps.
      if end < start {
        return nowMinutes >= start || nowMinutes < end
      }
      return nowMinutes >= start && nowMinutes < end
    }
  }

  override func intervalDidStart(for activity: DeviceActivityName) {
    super.intervalDidStart(for: activity)
    log("intervalDidStart activity=\(activity.rawValue)")
    // Prayer window started → engage the shield from the stored selection, even
    // if the app is closed.
    if activity.rawValue.hasPrefix(prayerActivityPrefix) {
      reapplyBlockConfiguration()
    }
    log("intervalDidStart done activity=\(activity.rawValue)")
  }

  private func clearShields() {
    store.shield.applications = nil
    store.shield.applicationCategories = nil
    store.shield.webDomains = nil
  }

  private func reapplyBlockConfiguration() {
    // Extensions have no access to the host app's UserDefaults.standard sandbox.
    // If sharedDefaults is nil (entitlement misconfigured), bail out rather than
    // silently clearing all shields via the fall-through.
    guard let userDefaults = sharedDefaults else {
      log("reapply BAIL sharedDefaults=nil (app-group entitlement missing?)")
      return
    }

    guard let configDict = userDefaults.dictionary(forKey: blockConfigStorageKey) else {
      log("reapply no persisted config → clearing shields")
      store.shield.applications = nil
      store.shield.applicationCategories = nil
      store.shield.webDomains = nil
      return
    }

    log("reapply config found keys=\(configDict.keys.count) → parsing")
    guard let blockConfig = parseBlockConfig(configDict) else {
      log("reapply parseBlockConfig returned nil → leaving shield untouched")
      return
    }

    log("reapply parsed items=\(blockConfig.items.count) active=\(blockConfig.isActive) → applying")
    applyBlocks(blockConfig)
  }

  private func parseBlockConfig(_ dict: [String: Any]) -> MonitorBlockConfig? {
    let rawItems: [[String: Any]]
    if let blockedItems = dict["blockedItems"] as? [[String: Any]] {
      rawItems = blockedItems
    } else if let appSelections = dict["appSelections"] as? [[String: Any]] {
      rawItems = appSelections.map { item in
        var normalized = item
        normalized["type"] = "app"
        return normalized
      }
    } else {
      return nil
    }

    let items: [MonitorBlockedItemInfo] = rawItems.compactMap { selection -> MonitorBlockedItemInfo? in
      guard let tokenString = selection["token"] as? String else {
        return nil
      }

      let itemTypeRaw = (selection["type"] as? String ?? "app").lowercased()
      let itemType: MonitorBlockedItemType
      switch itemTypeRaw {
      case "category":
        itemType = .category
      case "webdomain":
        itemType = .webDomain
      default:
        itemType = .app
      }

      return MonitorBlockedItemInfo(
        type: itemType,
        tokenId: tokenString,
        appToken: itemType == .app ? decodeApplicationToken(from: tokenString) : nil,
        categoryToken: itemType == .category ? decodeCategoryToken(from: tokenString) : nil,
        webDomainToken: itemType == .webDomain ? decodeWebDomainToken(from: tokenString) : nil
      )
    }

    let isActive = dict["isActive"] as? Bool ?? true
    return MonitorBlockConfig(items: items, isActive: isActive)
  }

  private func applyBlocks(_ config: MonitorBlockConfig) {
    guard config.isActive else {
      store.shield.applications = nil
      store.shield.applicationCategories = nil
      store.shield.webDomains = nil
      return
    }

    let validAppTokens = config.items.compactMap { $0.appToken }
    let validCategoryTokens = config.items.compactMap { $0.categoryToken }
    let validWebDomainTokens = config.items.compactMap { $0.webDomainToken }
    log("applyBlocks apps=\(validAppTokens.count) cats=\(validCategoryTokens.count) web=\(validWebDomainTokens.count)")

    guard !validAppTokens.isEmpty || !validCategoryTokens.isEmpty || !validWebDomainTokens.isEmpty else {
      log("applyBlocks all token sets empty (decode failed?) → clearing shields")
      store.shield.applications = nil
      store.shield.applicationCategories = nil
      store.shield.webDomains = nil
      return
    }

    if !validAppTokens.isEmpty {
      store.shield.applications = Set(validAppTokens)
    } else {
      store.shield.applications = nil
    }

    if !validCategoryTokens.isEmpty {
      store.shield.applicationCategories = .specific(Set(validCategoryTokens))
    } else {
      store.shield.applicationCategories = nil
    }

    if !validWebDomainTokens.isEmpty {
      store.shield.webDomains = Set(validWebDomainTokens)
    } else {
      store.shield.webDomains = nil
    }
    log("applyBlocks shield SET apps=\(validAppTokens.count) cats=\(validCategoryTokens.count) web=\(validWebDomainTokens.count)")
  }

  private func decodeApplicationToken(from encoded: String) -> ApplicationToken? {
    guard let data = Data(base64Encoded: encoded) else {
      return nil
    }

    do {
      return try JSONDecoder().decode(ApplicationToken.self, from: data)
    } catch {
      return nil
    }
  }

  private func decodeCategoryToken(from encoded: String) -> ActivityCategoryToken? {
    guard let data = Data(base64Encoded: encoded) else {
      return nil
    }

    do {
      return try JSONDecoder().decode(ActivityCategoryToken.self, from: data)
    } catch {
      return nil
    }
  }

  private func decodeWebDomainToken(from encoded: String) -> WebDomainToken? {
    guard let data = Data(base64Encoded: encoded) else {
      return nil
    }

    do {
      return try JSONDecoder().decode(WebDomainToken.self, from: data)
    } catch {
      return nil
    }
  }
}

enum MonitorBlockedItemType: String {
  case app
  case category
  case webDomain
}

struct MonitorBlockedItemInfo {
  let type: MonitorBlockedItemType
  let tokenId: String
  let appToken: ApplicationToken?
  let categoryToken: ActivityCategoryToken?
  let webDomainToken: WebDomainToken?
}

struct MonitorBlockConfig {
  let items: [MonitorBlockedItemInfo]
  let isActive: Bool
}
