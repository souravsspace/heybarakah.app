import SwiftUI
import WidgetKit

@main
struct LockNowWidgetBundle: WidgetBundle {
  var body: some Widget {
    if #available(iOS 18.0, *) {
      LockNowControl()
    }
  }
}
