import ManagedSettingsUI
import ManagedSettings
import UIKit

class ShieldConfigurationExtension: ShieldConfigurationDataSource {

  private let appGroupIdentifier = "group.com.souravsspace.Barakah.shield"

  // All values below are replaced by the config plugin at prebuild time
  private let shieldTitle = "Quiet at salah."
  private let shieldSubtitle = "{appName} rests for prayer."
  private let shieldPrimaryButtonLabel = "Hold for du'a"
  private let shieldSecondaryButtonLabel = "none"
  // Temporary-unlock state copy — shown briefly while ManagedSettings clears
  // after a successful unlock. Configurable via plugin options.
  private let shieldTempUnlockTitle = "Almost there."
  private let shieldTempUnlockSubtitle = "Quiet lifts in a moment."
  private let shieldTempUnlockButtonLabel = "OK"
  private let shieldPrimaryButtonColor = UIColor(red: 0.161, green: 0.376, blue: 0.243, alpha: 1.0)
  private let shieldBackgroundColor: UIColor? = UIColor(red: 1.000, green: 1.000, blue: 1.000, alpha: 1.0)
  private let shieldBlurStyle: UIBlurEffect.Style? = .systemThickMaterial
  private let shieldTitleColor = UIColor(red: 0.039, green: 0.039, blue: 0.039, alpha: 1.0)
  private let shieldSubtitleColor = UIColor(red: 0.420, green: 0.447, blue: 0.502, alpha: 1.0)

  private var mascotIcon: UIImage? {
    let bundle = Bundle(for: type(of: self))
    return UIImage(named: "shield-icon", in: bundle, compatibleWith: nil)
      ?? UIImage(contentsOfFile: bundle.path(forResource: "shield-icon", ofType: "png") ?? "")
  }

  private func getBlockedAppCount() -> Int {
    guard let defaults = UserDefaults(suiteName: appGroupIdentifier) else { return 0 }
    guard let config = defaults.dictionary(forKey: "appBlocker.blockConfiguration.v1") else { return 0 }
    if let items = config["blockedItems"] as? [[String: Any]] {
      return items.count
    }
    return 0
  }

  private func isTemporarilyUnlocked() -> Bool {
    guard let defaults = UserDefaults(suiteName: appGroupIdentifier) else { return false }
    guard let expiration = defaults.object(forKey: "appBlocker.temporaryUnlock.v1") as? Date else { return false }
    return Date() < expiration
  }

  private func makeConfig(appName: String) -> ShieldConfiguration {
    if isTemporarilyUnlocked() {
      return ShieldConfiguration(
        backgroundBlurStyle: shieldBlurStyle,
        backgroundColor: shieldBackgroundColor,
        icon: mascotIcon,
        title: ShieldConfiguration.Label(text: shieldTempUnlockTitle, color: shieldTitleColor),
        subtitle: ShieldConfiguration.Label(text: shieldTempUnlockSubtitle, color: shieldSubtitleColor),
        primaryButtonLabel: ShieldConfiguration.Label(text: shieldTempUnlockButtonLabel, color: .white),
        primaryButtonBackgroundColor: shieldPrimaryButtonColor,
        secondaryButtonLabel: nil
      )
    }

    let count = getBlockedAppCount()
    // The plugin replaces this placeholder with a Swift string literal
    // containing `\(count)` interpolation, or `""` when the user opted out.
    let context = count > 1 ? " \(count) apps are quiet." : ""
    let subtitle = shieldSubtitle.replacingOccurrences(of: "{appName}", with: appName) + context

    let hasSecondary = !shieldSecondaryButtonLabel.isEmpty && shieldSecondaryButtonLabel != "none"

    return ShieldConfiguration(
      backgroundBlurStyle: shieldBlurStyle,
      backgroundColor: shieldBackgroundColor,
      icon: mascotIcon,
      title: ShieldConfiguration.Label(text: shieldTitle, color: shieldTitleColor),
      subtitle: ShieldConfiguration.Label(text: subtitle, color: shieldSubtitleColor),
      primaryButtonLabel: ShieldConfiguration.Label(text: shieldPrimaryButtonLabel, color: .white),
      primaryButtonBackgroundColor: shieldPrimaryButtonColor,
      secondaryButtonLabel: hasSecondary ? ShieldConfiguration.Label(text: shieldSecondaryButtonLabel, color: shieldSubtitleColor) : nil
    )
  }

  override func configuration(shielding application: Application) -> ShieldConfiguration {
    makeConfig(appName: application.localizedDisplayName ?? "This app")
  }

  override func configuration(shielding application: Application, in category: ActivityCategory) -> ShieldConfiguration {
    makeConfig(appName: category.localizedDisplayName ?? "This category")
  }

  override func configuration(shielding webDomain: WebDomain) -> ShieldConfiguration {
    makeConfig(appName: webDomain.domain ?? "This website")
  }

  override func configuration(shielding webDomain: WebDomain, in category: ActivityCategory) -> ShieldConfiguration {
    makeConfig(appName: webDomain.domain ?? "This website")
  }
}
