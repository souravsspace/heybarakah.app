import ExpoModulesCore
import WidgetKit

public class WidgetBridgeModule: Module {
  public func definition() -> ModuleDefinition {
    Name("WidgetBridge")

    AsyncFunction("setSnapshot") { (json: String) -> Void in
      SharedSuite.defaults()?.set(json, forKey: SharedSuite.snapshotKey)
      WidgetCenter.shared.reloadAllTimelines()
    }

    AsyncFunction("reloadTimelines") { () -> Void in
      WidgetCenter.shared.reloadAllTimelines()
    }

    AsyncFunction("peekPendingDhikr") { () -> Int in
      return SharedSuite.defaults()?.integer(forKey: SharedSuite.pendingDhikrKey) ?? 0
    }

    AsyncFunction("ackPendingDhikr") { (count: Int) -> Void in
      guard let suite = SharedSuite.defaults(), count > 0 else { return }
      let current = suite.integer(forKey: SharedSuite.pendingDhikrKey)
      let next = max(0, current - count)
      suite.set(next, forKey: SharedSuite.pendingDhikrKey)
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
      throw Exception(name: "ActivityKitUnavailable", description: "ActivityKit requires iOS 16.2+")
    }

    AsyncFunction("endLockActivity") { (id: String) async throws -> Void in
      if #available(iOS 16.2, *) {
        try await LockActivityController.end(id: id)
        return
      }
      throw Exception(name: "ActivityKitUnavailable", description: "ActivityKit requires iOS 16.2+")
    }

    AsyncFunction("endAllLockActivities") { () async throws -> Void in
      if #available(iOS 16.2, *) {
        await LockActivityController.endAll()
        return
      }
      throw Exception(name: "ActivityKitUnavailable", description: "ActivityKit requires iOS 16.2+")
    }
  }
}
