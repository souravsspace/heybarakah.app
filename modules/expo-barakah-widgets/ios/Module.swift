import ExpoModulesCore
import WidgetKit

public class ExpoWidgetsModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ExpoWidgets")

    AsyncFunction("setSnapshot") { (json: String) -> Void in
      WidgetSuite.defaults()?.set(json, forKey: WidgetSuite.snapshotKey)
      WidgetCenter.shared.reloadAllTimelines()
    }

    AsyncFunction("reloadTimelines") { () -> Void in
      WidgetCenter.shared.reloadAllTimelines()
    }

    AsyncFunction("peekPendingDhikr") { () -> Int in
      WidgetSuite.defaults()?.integer(forKey: WidgetSuite.pendingDhikrKey) ?? 0
    }

    AsyncFunction("ackPendingDhikr") { (count: Int) -> Void in
      guard let suite = WidgetSuite.defaults(), count > 0 else { return }
      let current = suite.integer(forKey: WidgetSuite.pendingDhikrKey)
      let next = max(0, current - count)
      suite.set(next, forKey: WidgetSuite.pendingDhikrKey)
    }

    AsyncFunction("startLockActivity") {
      (name: String, startISO: String, endISO: String) async throws -> String in
      if #available(iOS 16.2, *) {
        return try await LockActivityController.start(
          name: name,
          startISO: startISO,
          endISO: endISO
        )
      }
      throw Exception(
        name: "ActivityKitUnavailable",
        description: "ActivityKit requires iOS 16.2+"
      )
    }

    AsyncFunction("endLockActivity") { (id: String) async throws -> Void in
      if #available(iOS 16.2, *) {
        try await LockActivityController.end(id: id)
        return
      }
      throw Exception(
        name: "ActivityKitUnavailable",
        description: "ActivityKit requires iOS 16.2+"
      )
    }

    AsyncFunction("endAllLockActivities") { () async throws -> Void in
      if #available(iOS 16.2, *) {
        await LockActivityController.endAll()
        return
      }
      throw Exception(
        name: "ActivityKitUnavailable",
        description: "ActivityKit requires iOS 16.2+"
      )
    }
  }
}
