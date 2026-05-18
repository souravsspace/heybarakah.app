import SwiftUI
import WidgetKit

struct StreakWidget: Widget {
  let kind = "barakah.streak"

  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: BarakahProvider()) { entry in
      StreakView(entry: entry)
        .containerBackground(BarakahColor.canvas, for: .widget)
    }
    .configurationDisplayName("Streak")
    .description("Consecutive days you made every salah.")
    .supportedFamilies([.systemSmall])
  }
}

private struct StreakView: View {
  let entry: BarakahEntry

  var body: some View {
    VStack(alignment: .leading, spacing: 0) {
      Text("Consecutive days".uppercased())
        .font(BarakahFont.sans(size: 9, weight: .semibold))
        .tracking(1.2)
        .foregroundStyle(BarakahColor.muted)
      Spacer(minLength: 6)
      Text("\(days)")
        .font(BarakahFont.serif(size: 64))
        .foregroundStyle(BarakahColor.ink)
        .minimumScaleFactor(0.6)
        .lineLimit(1)
      Spacer(minLength: 6)
      Rectangle()
        .fill(BarakahColor.hairline)
        .frame(height: BarakahMetric.hairline)
      Spacer(minLength: 6)
      Text("All five, on time.")
        .font(BarakahFont.serif(size: 12))
        .foregroundStyle(BarakahColor.ink)
    }
    .widgetURL(URL(string: "barakah://progress"))
  }

  private var days: Int { entry.snapshot?.streak.days ?? 0 }
}
