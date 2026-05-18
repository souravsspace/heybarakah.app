import Foundation

enum WidgetSuite {
  static let appGroup = "group.com.souravsspace.Barakah.shield"
  static let snapshotKey = "widget.snapshot.v1"
  static let pendingDhikrKey = "widget.dhikr.pending"

  static func defaults() -> UserDefaults? {
    UserDefaults(suiteName: appGroup)
  }
}

struct WidgetSnapshot: Codable, Hashable {
  struct Prayer: Codable, Hashable {
    let name: String
    let startISO: String
    let endISO: String
  }

  struct Streak: Codable, Hashable {
    let days: Int
  }

  struct Dhikr: Codable, Hashable {
    let count: Int
    let target: Int
  }

  struct Ayah: Codable, Hashable {
    let arabic: String
    let translation: String
    let reference: String
  }

  let v: Int
  let generatedAt: String
  let tz: String
  let date: String
  let prayers: [Prayer]
  let tomorrowFajrISO: String?
  let streak: Streak
  let dhikr: Dhikr
  let ayah: Ayah
}

enum SharedStore {
  private static let decoder: JSONDecoder = {
    let d = JSONDecoder()
    return d
  }()

  private static let isoFormatter: ISO8601DateFormatter = {
    let f = ISO8601DateFormatter()
    f.formatOptions = [.withInternetDateTime]
    return f
  }()

  static func load() -> WidgetSnapshot? {
    guard let raw = WidgetSuite.defaults()?.string(forKey: WidgetSuite.snapshotKey),
          let data = raw.data(using: .utf8) else {
      return nil
    }
    return try? decoder.decode(WidgetSnapshot.self, from: data)
  }

  static func date(from iso: String) -> Date? {
    if let d = isoFormatter.date(from: iso) {
      return d
    }
    let withFractions = ISO8601DateFormatter()
    withFractions.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
    return withFractions.date(from: iso)
  }

  static func enqueueDhikrIncrement() {
    let suite = WidgetSuite.defaults()
    let current = suite?.integer(forKey: WidgetSuite.pendingDhikrKey) ?? 0
    suite?.set(current + 1, forKey: WidgetSuite.pendingDhikrKey)
  }
}
