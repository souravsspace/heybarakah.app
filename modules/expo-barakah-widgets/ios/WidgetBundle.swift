import SwiftUI
import WidgetKit

@main
struct BarakahWidgetBundle: WidgetBundle {
  var body: some Widget {
    if #available(iOS 17.0, *) {
      SalahArcWidget()
      DhikrWidget()
      StreakWidget()
      AyahWidget()
      LockComplicationsWidget()
    }
    if #available(iOS 16.2, *) {
      LockedNowLiveActivity()
    }
    if #available(iOS 18.0, *) {
      LockNowControl()
    }
  }
}
