import ActivityKit
import SwiftUI
import WidgetKit

@available(iOS 16.2, *)
struct LockedNowLiveActivity: Widget {
  private let cream = Color(r: 245, g: 235, b: 219, o: 1)

  var body: some WidgetConfiguration {
    ActivityConfiguration(for: BarakahLockAttributes.self) { context in
      lockScreenBanner(context)
        .activityBackgroundTint(Color.black.opacity(0.55))
        .activitySystemActionForegroundColor(cream)
    } dynamicIsland: { context in
      let info = PrayerCatalog.info(context.state.prayerName)
      let end = Date(timeIntervalSince1970: context.state.endEpoch)
      let start = Date(timeIntervalSince1970: context.state.startEpoch)
      return DynamicIsland {
        DynamicIslandExpandedRegion(.leading) {
          ZStack {
            ProgressView(timerInterval: start...end, countsDown: false) { EmptyView() } currentValueLabel: { EmptyView() }
              .progressViewStyle(.circular)
              .tint(cream)
              .frame(width: 44, height: 44)
            LockMotif(direction: .editorial, size: 18, color: cream)
          }
        }
        DynamicIslandExpandedRegion(.trailing) {
          VStack(alignment: .trailing, spacing: 2) {
            Text("IN").font(BarakahFont.sans(8, weight: .bold)).tracking(1.6).foregroundColor(cream)
            Text(timerInterval: Date()...end, countsDown: true)
              .font(BarakahFont.mono(20)).foregroundColor(.white).monospacedDigit()
              .frame(maxWidth: 64)
          }
        }
        DynamicIslandExpandedRegion(.center) {
          VStack(alignment: .leading, spacing: 2) {
            HStack(spacing: 8) {
              Text(info.title).font(BarakahFont.serif(18)).foregroundColor(.white)
              Text(info.arabic).font(BarakahFont.arabic(14)).foregroundColor(cream)
            }
            Text(end, style: .time).font(BarakahFont.mono(11)).foregroundColor(.white.opacity(0.55))
          }
          .frame(maxWidth: .infinity, alignment: .leading)
        }
        DynamicIslandExpandedRegion(.bottom) {
          HStack {
            Label("Lock now", systemImage: "lock.fill")
              .font(BarakahFont.sans(12, weight: .semibold)).foregroundColor(cream)
            Spacer()
            Label("Open Barakah", systemImage: "chevron.right")
              .labelStyle(.titleAndIcon).font(BarakahFont.sans(12, weight: .medium))
              .foregroundColor(.white.opacity(0.55))
          }
          .padding(.top, 6)
        }
      } compactLeading: {
        LockMotif(direction: .editorial, size: 14, color: cream)
      } compactTrailing: {
        Text(timerInterval: Date()...end, countsDown: true)
          .font(BarakahFont.mono(12)).foregroundColor(cream).monospacedDigit().frame(maxWidth: 44)
      } minimal: {
        LockMotif(direction: .editorial, size: 14, color: cream)
      }
      .keylineTint(cream)
    }
  }

  private func lockScreenBanner(_ context: ActivityViewContext<BarakahLockAttributes>) -> some View {
    let info = PrayerCatalog.info(context.state.prayerName)
    let end = Date(timeIntervalSince1970: context.state.endEpoch)
    return HStack(spacing: 12) {
      LockMotif(direction: .editorial, size: 22, color: cream)
      VStack(alignment: .leading, spacing: 1) {
        Text("QUIET NOW").font(BarakahFont.sans(8, weight: .bold)).tracking(1.8).foregroundColor(cream)
        Text(info.title).font(BarakahFont.serif(19)).foregroundColor(.white)
      }
      Spacer()
      Text(timerInterval: Date()...end, countsDown: true)
        .font(BarakahFont.mono(18)).foregroundColor(.white).monospacedDigit().frame(maxWidth: 70)
    }
    .padding(14)
  }
}
