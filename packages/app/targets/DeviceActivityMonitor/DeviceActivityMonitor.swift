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

  private let store = ManagedSettingsStore()
  private var sharedDefaults: UserDefaults?

  override init() {
    super.init()
    sharedDefaults = UserDefaults(suiteName: appGroupIdentifier)
  }

  override func intervalDidEnd(for activity: DeviceActivityName) {
    super.intervalDidEnd(for: activity)
    // Prayer window over → lift the shield so apps are usable until the next
    // salah. The token config stays persisted for the next window start.
    if activity.rawValue.hasPrefix(prayerActivityPrefix) {
      clearShields()
      return
    }
    // Temporary-unlock relock path: the earned unlock has expired.
    sharedDefaults?.removeObject(forKey: temporaryUnlockKey)
    reapplyBlockConfiguration()
  }

  override func intervalDidStart(for activity: DeviceActivityName) {
    super.intervalDidStart(for: activity)
    // Prayer window started → engage the shield from the stored selection, even
    // if the app is closed.
    if activity.rawValue.hasPrefix(prayerActivityPrefix) {
      reapplyBlockConfiguration()
    }
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
    guard let userDefaults = sharedDefaults else { return }

    guard let configDict = userDefaults.dictionary(forKey: blockConfigStorageKey) else {
      store.shield.applications = nil
      store.shield.applicationCategories = nil
      store.shield.webDomains = nil
      return
    }

    guard let blockConfig = parseBlockConfig(configDict) else {
      return
    }

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

    guard !validAppTokens.isEmpty || !validCategoryTokens.isEmpty || !validWebDomainTokens.isEmpty else {
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
