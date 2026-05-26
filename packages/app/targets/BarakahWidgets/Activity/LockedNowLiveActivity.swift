import ActivityKit
import SwiftUI
import WidgetKit

struct LockedNowLiveActivity: Widget {
  var body: some WidgetConfiguration {
    ActivityConfiguration(for: BarakahLockAttributes.self) { context in
      LockedLockScreen(state: context.state)
        .activityBackgroundTint(BarakahColor.canvasInverted)
        .activitySystemActionForegroundColor(.white)
    } dynamicIsland: { context in
      DynamicIsland {
        DynamicIslandExpandedRegion(.leading) {
          DIExpandedLeading(state: context.state)
        }
        DynamicIslandExpandedRegion(.trailing) {
          DIExpandedTrailing(state: context.state)
        }
        DynamicIslandExpandedRegion(.bottom) {
          DIExpandedBottom(state: context.state)
        }
      } compactLeading: {
        Image(systemName: "moon.stars.fill")
          .foregroundStyle(BarakahColor.green)
      } compactTrailing: {
        Text(timerInterval: timerRange(state: context.state), countsDown: true)
          .font(BarakahFont.mono(size: 12))
          .monospacedDigit()
          .foregroundStyle(.white)
      } minimal: {
        Circle()
          .fill(BarakahColor.green)
          .overlay {
            Image(systemName: "moon.stars.fill")
              .font(.system(size: 10))
              .foregroundStyle(.white)
          }
      }
      .keylineTint(BarakahColor.green)
    }
  }
}

private struct LockedLockScreen: View {
  let state: BarakahLockAttributes.ContentState

  var body: some View {
    HStack(alignment: .top, spacing: 16) {
      VStack(alignment: .leading, spacing: 6) {
        Text("Locked".uppercased())
          .font(BarakahFont.sans(size: 10, weight: .semibold))
          .tracking(1.4)
          .foregroundStyle(.white.opacity(0.7))
        Text(PrayerLabel.title(state.prayerName))
          .font(BarakahFont.serif(size: 24))
          .foregroundStyle(.white)
        ProgressView(timerInterval: timerRange(state: state), countsDown: false)
          .progressViewStyle(.linear)
          .tint(BarakahColor.green)
          .frame(maxWidth: 220)
        Text(timerInterval: timerRange(state: state), countsDown: true)
          .font(BarakahFont.mono(size: 12))
          .foregroundStyle(.white.opacity(0.8))
      }
      Spacer()
      Text(PrayerLabel.arabic(state.prayerName))
        .font(BarakahFont.serif(size: 22))
        .foregroundStyle(.white)
    }
    .padding(16)
  }
}

private struct DIExpandedLeading: View {
  let state: BarakahLockAttributes.ContentState
  var body: some View {
    VStack(alignment: .leading, spacing: 2) {
      Text("Locked".uppercased())
        .font(BarakahFont.sans(size: 9, weight: .semibold))
        .tracking(1.2)
        .foregroundStyle(BarakahColor.green)
      Text(PrayerLabel.title(state.prayerName))
        .font(BarakahFont.serif(size: 18))
    }
  }
}

private struct DIExpandedTrailing: View {
  let state: BarakahLockAttributes.ContentState
  var body: some View {
    Text(timerInterval: timerRange(state: state), countsDown: true)
      .font(BarakahFont.mono(size: 14))
      .multilineTextAlignment(.trailing)
  }
}

private struct DIExpandedBottom: View {
  let state: BarakahLockAttributes.ContentState
  var body: some View {
    ProgressView(timerInterval: timerRange(state: state), countsDown: false)
      .progressViewStyle(.linear)
      .tint(BarakahColor.green)
  }
}

private func timerRange(state: BarakahLockAttributes.ContentState) -> ClosedRange<Date> {
  let start = Date(timeIntervalSince1970: state.startEpoch)
  let end = Date(timeIntervalSince1970: state.endEpoch)
  guard start <= end else {
    let now = Date()
    return now...now.addingTimeInterval(1)
  }
  return start...end
}
