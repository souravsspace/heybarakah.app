import AppIntents
import SwiftUI
import WidgetKit

@available(iOS 18.0, *)
struct LockNowControl: ControlWidget {
  var body: some ControlWidgetConfiguration {
    StaticControlConfiguration(kind: "barakah.lock-now") {
      ControlWidgetButton(action: StartQuietControlIntent()) {
        Label("Quiet for du'a", systemImage: "moon.stars.fill")
      }
    }
    .displayName("Quiet for du'a")
    .description("Begin a short, silent moment.")
  }
}
