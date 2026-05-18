import Foundation

enum SharedSuite {
  static let appGroup = "group.com.souravsspace.Barakah.shield"
  static let snapshotKey = "widget.snapshot.v1"
  static let pendingDhikrKey = "widget.dhikr.pending"
  static let activityIdKey = "widget.lockActivity.id"

  static func defaults() -> UserDefaults? {
    return UserDefaults(suiteName: appGroup)
  }
}
