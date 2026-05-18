import ExpoModulesCore
import WidgetKit

public class WidgetBridgeModule: Module {
  public func definition() -> ModuleDefinition {
    Name("WidgetBridge")

    Events("onWidgetDhikrIncrement")

    AsyncFunction("setSnapshot") { (json: String) -> Void in
      SharedSuite.defaults()?.set(json, forKey: SharedSuite.snapshotKey)
      WidgetCenter.shared.reloadAllTimelines()
    }

    AsyncFunction("reloadTimelines") { () -> Void in
      WidgetCenter.shared.reloadAllTimelines()
    }

    AsyncFunction("consumePendingDhikr") { () -> Int in
      let suite = SharedSuite.defaults()
      let n = suite?.integer(forKey: SharedSuite.pendingDhikrKey) ?? 0
      suite?.set(0, forKey: SharedSuite.pendingDhikrKey)
      return n
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

    OnStartObserving("onWidgetDhikrIncrement") {
      DhikrEventObserver.shared.start(emit: { [weak self] count in
        self?.sendEvent("onWidgetDhikrIncrement", ["count": count])
      })
    }

    OnStopObserving("onWidgetDhikrIncrement") {
      DhikrEventObserver.shared.stop()
    }
  }
}

final class DhikrEventObserver {
  static let shared = DhikrEventObserver()

  private var observer: NSObjectProtocol?

  func start(emit: @escaping (Int) -> Void) {
    stop()
    guard let suite = SharedSuite.defaults() else { return }
    observer = NotificationCenter.default.addObserver(
      forName: UserDefaults.didChangeNotification,
      object: suite,
      queue: .main
    ) { _ in
      let n = suite.integer(forKey: SharedSuite.pendingDhikrKey)
      if n > 0 {
        emit(n)
      }
    }
  }

  func stop() {
    if let observer {
      NotificationCenter.default.removeObserver(observer)
    }
    observer = nil
  }
}
