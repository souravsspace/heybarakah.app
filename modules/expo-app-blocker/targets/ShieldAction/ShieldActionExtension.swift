import ManagedSettings
import ManagedSettingsUI
import UIKit
import UserNotifications

class ShieldActionExtension: ShieldActionDelegate {
  private let appGroupIdentifier = "APP_GROUP_PLACEHOLDER"
  private let pendingUnlockKey = "appBlocker.pendingUnlock.v1"
  private let pendingUnlockNotificationIdentifier = "expo.appblocker.pendingUnlock.local"
  // Notification copy + behavior — configurable via plugin options so apps
  // can localize without forking. Defaults preserve the original English
  // copy and the icon attachment.
  private let notificationTitle = "NOTIFICATION_TITLE_PLACEHOLDER"
  private let notificationBody = "NOTIFICATION_BODY_PLACEHOLDER"
  private let notificationAttachIcon = NOTIFICATION_ATTACH_ICON_PLACEHOLDER

  override func handle(action: ShieldAction, for application: ApplicationToken, completionHandler: @escaping (ShieldActionResponse) -> Void) {
    handleAction(action, completionHandler: completionHandler)
  }

  override func handle(action: ShieldAction, for webDomain: WebDomainToken, completionHandler: @escaping (ShieldActionResponse) -> Void) {
    handleAction(action, completionHandler: completionHandler)
  }

  override func handle(action: ShieldAction, for category: ActivityCategoryToken, completionHandler: @escaping (ShieldActionResponse) -> Void) {
    handleAction(action, completionHandler: completionHandler)
  }

  private func handleAction(_ action: ShieldAction, completionHandler: @escaping (ShieldActionResponse) -> Void) {
    switch action {
    case .primaryButtonPressed:
      NSLog("[ShieldAction] primaryButtonPressed")
      setPendingUnlockFlag()
      schedulePendingUnlockNotification { didSchedule in
        NSLog("[ShieldAction] schedulePendingUnlockNotification didSchedule=\(didSchedule)")
        // Always close the shield. The Darwin notification has already been
        // posted by setPendingUnlockFlag, so the host app receives the unlock
        // signal regardless of whether the local notification succeeded.
        // Returning .defer would leave the user stuck behind the shield with
        // no way to dismiss it.
        self.complete(on: .close, completionHandler: completionHandler)
      }

    case .secondaryButtonPressed:
      complete(on: .close, completionHandler: completionHandler)

    @unknown default:
      complete(on: .close, completionHandler: completionHandler)
    }
  }

  private func complete(on response: ShieldActionResponse, completionHandler: @escaping (ShieldActionResponse) -> Void) {
    if Thread.isMainThread {
      completionHandler(response)
      return
    }

    DispatchQueue.main.async {
      completionHandler(response)
    }
  }

  private func setPendingUnlockFlag() {
    guard let sharedDefaults = UserDefaults(suiteName: appGroupIdentifier) else { return }
    sharedDefaults.set(true, forKey: pendingUnlockKey)
    sharedDefaults.synchronize()

    let notificationCenter = CFNotificationCenterGetDarwinNotifyCenter()
    CFNotificationCenterPostNotification(
      notificationCenter,
      CFNotificationName("expo.appblocker.pendingUnlock" as CFString),
      nil,
      nil,
      true
    )
  }

  private func schedulePendingUnlockNotification(completion: @escaping (Bool) -> Void) {
    let center = UNUserNotificationCenter.current()

    center.getNotificationSettings { settings in
      NSLog("[ShieldAction] notif authStatus=\(settings.authorizationStatus.rawValue) alert=\(settings.alertSetting.rawValue) timeSensitive=\(settings.timeSensitiveSetting.rawValue)")
    }

    let content = UNMutableNotificationContent()
    content.title = notificationTitle
    content.body = notificationBody
    content.sound = .default
    content.interruptionLevel = .timeSensitive
    content.userInfo = ["link": "/unlock"]

    // Attach the app icon to the notification only when the app opted in.
    // When false the system app icon is the only icon shown — avoids the
    // "duplicate icon" look on iOS notification banners.
    if notificationAttachIcon, let iconURL = iconFileURL() {
      if let attachment = try? UNNotificationAttachment(identifier: "icon", url: iconURL, options: nil) {
        content.attachments = [attachment]
      }
    }

    let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 0.5, repeats: false)
    let request = UNNotificationRequest(
      identifier: pendingUnlockNotificationIdentifier,
      content: content,
      trigger: trigger
    )

    center.removePendingNotificationRequests(withIdentifiers: [pendingUnlockNotificationIdentifier])
    center.add(request) { error in
      if let error = error {
        NSLog("[ShieldAction] notif add failed: \(error.localizedDescription)")
      } else {
        NSLog("[ShieldAction] notif add ok id=\(self.pendingUnlockNotificationIdentifier)")
      }
      completion(error == nil)
    }
  }

  private func iconFileURL() -> URL? {
    let bundle = Bundle(for: type(of: self))
    // Try shield-icon first (copied by config plugin)
    if let url = bundle.url(forResource: "shield-icon", withExtension: "png") { return url }
    // Try from app group shared container
    if let container = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: appGroupIdentifier) {
      let sharedIcon = container.appendingPathComponent("notification-icon.png")
      if FileManager.default.fileExists(atPath: sharedIcon.path) { return sharedIcon }
    }
    return nil
  }
}
