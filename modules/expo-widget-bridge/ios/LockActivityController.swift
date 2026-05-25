import ActivityKit
import Foundation

@available(iOS 16.2, *)
enum LockActivityError: Error {
  case activityKitDisabled
  case invalidDate
  case notFound
}

@available(iOS 16.2, *)
enum LockActivityController {
  static func start(name: String, startISO: String, endISO: String) async throws -> String {
    guard ActivityAuthorizationInfo().areActivitiesEnabled else {
      throw LockActivityError.activityKitDisabled
    }
    let formatter = ISO8601DateFormatter()
    formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
    let fallback = ISO8601DateFormatter()
    fallback.formatOptions = [.withInternetDateTime]
    let start = formatter.date(from: startISO) ?? fallback.date(from: startISO)
    let end = formatter.date(from: endISO) ?? fallback.date(from: endISO)
    guard let start, let end else {
      throw LockActivityError.invalidDate
    }
    let attributes = BarakahLockAttributes(createdEpoch: Date().timeIntervalSince1970)
    let state = BarakahLockAttributes.ContentState(
      prayerName: name,
      startEpoch: start.timeIntervalSince1970,
      endEpoch: end.timeIntervalSince1970
    )
    let content = ActivityContent(state: state, staleDate: end)
    let activity = try Activity<BarakahLockAttributes>.request(
      attributes: attributes,
      content: content,
      pushType: nil
    )
    SharedSuite.defaults()?.set(activity.id, forKey: SharedSuite.activityIdKey)
    return activity.id
  }

  static func end(id: String) async throws {
    let target = Activity<BarakahLockAttributes>.activities.first { $0.id == id }
    guard let activity = target else {
      SharedSuite.defaults()?.removeObject(forKey: SharedSuite.activityIdKey)
      return
    }
    await activity.end(nil, dismissalPolicy: .immediate)
    SharedSuite.defaults()?.removeObject(forKey: SharedSuite.activityIdKey)
  }

  static func endAll() async {
    for activity in Activity<BarakahLockAttributes>.activities {
      await activity.end(nil, dismissalPolicy: .immediate)
    }
    SharedSuite.defaults()?.removeObject(forKey: SharedSuite.activityIdKey)
  }
}
