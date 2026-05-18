import SwiftUI
import WidgetKit

@main
struct BarakahWidgetsBundle: WidgetBundle {
  var body: some Widget {
    SalahArcWidget()
    StreakWidget()
    DhikrWidget()
    AyahWidget()
    LockComplicationsWidget()
    if #available(iOS 18.0, *) {
      LockNowControl()
    }
    LockedNowLiveActivity()
  }
}
