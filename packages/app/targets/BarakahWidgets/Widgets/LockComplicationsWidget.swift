import SwiftUI
import WidgetKit

struct LockComplicationsWidget: Widget {
  let kind = "barakah.lock-complications"

  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: BarakahProvider()) { entry in
      LockComplicationsView(entry: entry)
        .containerBackground(.clear, for: .widget)
    }
    .configurationDisplayName("Next prayer")
    .description("A glance on the lock screen.")
    .supportedFamilies([
      .accessoryCircular,
      .accessoryRectangular,
      .accessoryInline,
    ])
  }
}

private struct LockComplicationsView: View {
  @Environment(\.widgetFamily) var family
  let entry: BarakahEntry

  var body: some View {
    switch family {
    case .accessoryCircular:
      circular
    case .accessoryRectangular:
      rectangular
    case .accessoryInline:
      inline
    default:
      inline
    }
  }

  private var circular: some View {
    ZStack {
      AccessoryWidgetBackground()
      VStack(spacing: 0) {
        Text(letter)
          .font(BarakahFont.serif(size: 18))
        Text(shortCountdown)
          .font(BarakahFont.mono(size: 9))
      }
    }
    .widgetAccentable()
  }

  private var rectangular: some View {
    VStack(alignment: .leading, spacing: 2) {
      Text("Next".uppercased())
        .font(BarakahFont.sans(size: 8, weight: .semibold))
        .tracking(1.0)
      Text(title)
        .font(BarakahFont.serif(size: 16))
      Text("\(timeText) · \(shortCountdown)")
        .font(BarakahFont.mono(size: 11))
    }
    .widgetAccentable()
  }

  private var inline: some View {
    Text("\(title) · \(shortCountdown)")
      .widgetAccentable()
  }

  // MARK: - Data

  private var snapshot: WidgetSnapshot? { entry.snapshot }

  private var next: WidgetSnapshot.Prayer? {
    guard let prayers = snapshot?.prayers else { return nil }
    let now = entry.date
    return prayers.first { p in
      guard let s = SharedStore.date(from: p.startISO) else { return false }
      return s > now
    } ?? prayers.last
  }

  private var title: String { PrayerLabel.title(next?.name ?? "fajr") }
  private var letter: String { PrayerLabel.eyebrow(next?.name ?? "fajr") }

  private var timeText: String {
    guard let s = SharedStore.date(from: next?.startISO ?? "") else { return "—" }
    return DateFormatters.timeOfDay.string(from: s)
  }

  private var shortCountdown: String {
    guard let s = SharedStore.date(from: next?.startISO ?? "") else { return "—" }
    return RelativeFormatter.short(now: entry.date, target: s)
  }
}
