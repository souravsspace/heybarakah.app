import Foundation

enum WidgetSuite {
  static let appGroup = "group.com.souravsspace.Barakah.expowidgets"
  static let snapshotKey = "widget.snapshot.v1"
  static let pendingDhikrKey = "widget.dhikr.pending"
  static let activityIdKey = "widget.lockActivity.id"

  static func defaults() -> UserDefaults? {
    UserDefaults(suiteName: appGroup)
  }
}

enum SharedStore {
  private static let decoder = JSONDecoder()
  private static let encoder = JSONEncoder()

  private static let isoFormatter: ISO8601DateFormatter = {
    let f = ISO8601DateFormatter()
    f.formatOptions = [.withInternetDateTime]
    return f
  }()

  static func load() -> WidgetSnapshot? {
    guard
      let raw = WidgetSuite.defaults()?.string(forKey: WidgetSuite.snapshotKey),
      let data = raw.data(using: .utf8)
    else {
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
    guard let suite = WidgetSuite.defaults() else { return }
    let current = suite.integer(forKey: WidgetSuite.pendingDhikrKey)
    suite.set(current + 1, forKey: WidgetSuite.pendingDhikrKey)
    bumpSnapshotDhikr(suite: suite)
  }

  private static func bumpSnapshotDhikr(suite: UserDefaults) {
    guard
      let raw = suite.string(forKey: WidgetSuite.snapshotKey),
      let data = raw.data(using: .utf8),
      let snapshot = try? decoder.decode(WidgetSnapshot.self, from: data)
    else {
      return
    }
    let dhikr = WidgetSnapshot.Dhikr(
      count: snapshot.dhikr.count + 1,
      target: snapshot.dhikr.target,
      sessionTotal: snapshot.dhikr.sessionTotal + 1
    )
    let bumped = WidgetSnapshot(
      v: snapshot.v,
      generatedAt: snapshot.generatedAt,
      tz: snapshot.tz,
      date: snapshot.date,
      prayers: snapshot.prayers,
      tomorrowFajrISO: snapshot.tomorrowFajrISO,
      streak: snapshot.streak,
      dhikr: dhikr,
      ayah: snapshot.ayah,
      lockNow: snapshot.lockNow
    )
    if let encoded = try? encoder.encode(bumped),
       let str = String(data: encoded, encoding: .utf8) {
      suite.set(str, forKey: WidgetSuite.snapshotKey)
    }
  }
}
