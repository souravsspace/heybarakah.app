import SwiftUI
import WidgetKit

struct SalahArcWidget: Widget {
  let kind = "barakah.salah-arc"

  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: BarakahProvider()) { entry in
      SalahArcView(entry: entry)
        .containerBackground(BarakahColor.canvas, for: .widget)
    }
    .configurationDisplayName("Salah arc")
    .description("Your day as a single hairline. Next prayer in serif.")
    .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
  }
}

private struct SalahArcView: View {
  @Environment(\.widgetFamily) var family
  let entry: BarakahEntry

  var body: some View {
    switch family {
    case .systemSmall:
      smallView
    case .systemMedium:
      mediumView
    case .systemLarge:
      largeView
    default:
      smallView
    }
  }

  private var smallView: some View {
    VStack(alignment: .leading, spacing: 8) {
      Eyebrow(text: nextEyebrow)
      Text(nextPrayerTitle)
        .font(BarakahFont.serif(size: 22))
        .foregroundStyle(BarakahColor.ink)
      Spacer(minLength: 4)
      arcRail(showLabels: false)
      Spacer(minLength: 4)
      Text(metaLine)
        .font(BarakahFont.mono(size: 11))
        .foregroundStyle(BarakahColor.muted)
        .widgetURL(URL(string: "barakah://home"))
    }
    .padding(.vertical, 4)
  }

  private var mediumView: some View {
    HStack(alignment: .top, spacing: 18) {
      VStack(alignment: .leading, spacing: 6) {
        Eyebrow(text: nextEyebrow)
        Text(nextPrayerTitle)
          .font(BarakahFont.serif(size: 26))
          .foregroundStyle(BarakahColor.ink)
        Text(metaLine)
          .font(BarakahFont.mono(size: 12))
          .foregroundStyle(BarakahColor.muted)
        Spacer(minLength: 0)
        arcRail(showLabels: true)
      }
      VStack(alignment: .trailing, spacing: 6) {
        Text(arabicName)
          .font(BarakahFont.serif(size: 22))
          .foregroundStyle(BarakahColor.ink)
        Eyebrow(text: progressEyebrow)
      }
    }
    .widgetURL(URL(string: "barakah://home"))
  }

  private var largeView: some View {
    VStack(alignment: .leading, spacing: 14) {
      HStack(alignment: .firstTextBaseline) {
        VStack(alignment: .leading, spacing: 6) {
          Eyebrow(text: nextEyebrow)
          Text(nextPrayerTitle)
            .font(BarakahFont.serif(size: 30))
            .foregroundStyle(BarakahColor.ink)
        }
        Spacer()
        Text(arabicName)
          .font(BarakahFont.serif(size: 26))
          .foregroundStyle(BarakahColor.ink)
      }
      Text(metaLine)
        .font(BarakahFont.mono(size: 13))
        .foregroundStyle(BarakahColor.muted)
      arcRail(showLabels: true)
      Divider().background(BarakahColor.hairline)
      if let ayah = entry.snapshot?.ayah {
        VStack(alignment: .leading, spacing: 6) {
          Text("\u{201C}\(ayah.translation)\u{201D}")
            .font(.custom(BarakahFont.serifFamily, size: 15))
            .italic()
            .foregroundStyle(BarakahColor.ink)
            .lineLimit(3)
          Eyebrow(text: ayah.reference)
        }
      }
    }
    .widgetURL(URL(string: "barakah://home"))
  }

  // MARK: - Computed

  private var snapshot: WidgetSnapshot? { entry.snapshot }

  private var nextPrayer: WidgetSnapshot.Prayer? {
    guard let prayers = snapshot?.prayers else { return nil }
    let now = entry.date
    if let upcoming = prayers.first(where: { p in
      guard let s = SharedStore.date(from: p.adhanISO) else { return false }
      return s > now
    }) {
      return upcoming
    }
    if let tomorrow = snapshot?.tomorrowFajrISO {
      return WidgetSnapshot.Prayer(
        name: "fajr",
        adhanISO: tomorrow,
        startISO: tomorrow,
        endISO: tomorrow
      )
    }
    return prayers.last
  }

  private var nextEyebrow: String {
    if isLocked { return "Quiet now" }
    return "Next"
  }

  private var isLocked: Bool {
    guard let prayer = currentLockPrayer else { return false }
    let now = entry.date
    guard let s = SharedStore.date(from: prayer.startISO),
          let e = SharedStore.date(from: prayer.endISO) else {
      return false
    }
    return now >= s && now < e
  }

  private var currentLockPrayer: WidgetSnapshot.Prayer? {
    guard let prayers = snapshot?.prayers else { return nil }
    let now = entry.date
    return prayers.first { p in
      guard let s = SharedStore.date(from: p.startISO),
            let e = SharedStore.date(from: p.endISO) else { return false }
      return now >= s && now < e
    }
  }

  private var displayPrayer: WidgetSnapshot.Prayer? {
    currentLockPrayer ?? nextPrayer
  }

  private var nextPrayerTitle: String {
    PrayerLabel.title(displayPrayer?.name ?? "fajr")
  }

  private var arabicName: String {
    PrayerLabel.arabic(displayPrayer?.name ?? "fajr")
  }

  private var metaLine: String {
    guard let prayer = displayPrayer,
          let adhan = SharedStore.date(from: prayer.adhanISO) else {
      return "—"
    }
    let timeText = DateFormatters.timeOfDay.string(from: adhan)
    let now = entry.date
    if isLocked, let end = SharedStore.date(from: prayer.endISO) {
      return "\(timeText) · ends in \(RelativeFormatter.short(now: now, target: end))"
    }
    return "\(timeText) · in \(RelativeFormatter.short(now: now, target: adhan))"
  }

  private var progressEyebrow: String {
    guard let prayers = snapshot?.prayers else { return "" }
    let now = entry.date
    let passed = prayers.reduce(into: 0) { acc, p in
      if let s = SharedStore.date(from: p.startISO), s <= now { acc += 1 }
    }
    return "\(passed) of \(prayers.count) today"
  }

  private func arcRail(showLabels: Bool) -> some View {
    GeometryReader { geo in
      let width = geo.size.width
      ZStack(alignment: .leading) {
        Rectangle()
          .fill(BarakahColor.hairline)
          .frame(height: BarakahMetric.hairline)
        ForEach(Array(prayerPositions(width: width).enumerated()), id: \.offset) { _, item in
          PrayerDot(state: item.state)
            .offset(x: item.x - item.diameter / 2, y: -item.diameter / 2 + BarakahMetric.hairline / 2)
        }
      }
      .frame(height: BarakahMetric.dotCurrent)
      .padding(.top, BarakahMetric.dotCurrent / 2)
      .overlay(alignment: .topLeading) {
        if showLabels {
          labelRow(width: width)
            .offset(y: BarakahMetric.dotCurrent + 6)
        }
      }
    }
    .frame(height: showLabels ? 34 : BarakahMetric.dotCurrent * 2)
  }

  private func labelRow(width: CGFloat) -> some View {
    let positions = prayerPositions(width: width)
    return ZStack(alignment: .topLeading) {
      ForEach(Array(positions.enumerated()), id: \.offset) { idx, item in
        Text(PrayerLabel.eyebrow(snapshot?.prayers[idx].name ?? ""))
          .font(BarakahFont.sans(size: 8, weight: .semibold))
          .tracking(0.6)
          .foregroundStyle(BarakahColor.muted)
          .offset(x: item.x - 16, y: 0)
          .frame(width: 32)
      }
    }
  }

  private struct PositionedDot {
    let x: CGFloat
    let diameter: CGFloat
    let state: PrayerDot.State
  }

  private func prayerPositions(width: CGFloat) -> [PositionedDot] {
    guard let prayers = snapshot?.prayers, !prayers.isEmpty else { return [] }
    let now = entry.date
    let starts = prayers.compactMap { SharedStore.date(from: $0.startISO) }
    guard let first = starts.first, let last = starts.last, last > first else {
      let step = width / CGFloat(max(prayers.count - 1, 1))
      return prayers.enumerated().map { idx, _ in
        PositionedDot(
          x: step * CGFloat(idx),
          diameter: BarakahMetric.dotSmall,
          state: .upcoming
        )
      }
    }
    let span = last.timeIntervalSince(first)
    return prayers.enumerated().map { idx, p in
      let start = SharedStore.date(from: p.startISO) ?? first
      let end = SharedStore.date(from: p.endISO) ?? start
      let ratio = CGFloat(start.timeIntervalSince(first) / span)
      let x = max(0, min(width, ratio * width))
      let state: PrayerDot.State
      if now >= start && now < end {
        state = .current
      } else if now >= end {
        state = .past
      } else {
        state = .upcoming
      }
      let diameter = state == .current ? BarakahMetric.dotCurrent : BarakahMetric.dotSmall
      return PositionedDot(x: x, diameter: diameter, state: state)
    }
  }
}

private struct Eyebrow: View {
  let text: String
  var body: some View {
    Text(text.uppercased())
      .font(BarakahFont.sans(size: 9, weight: .semibold))
      .tracking(1.2)
      .foregroundStyle(BarakahColor.muted)
  }
}

private struct PrayerDot: View {
  enum State { case past, current, upcoming }
  let state: State

  var body: some View {
    switch state {
    case .past:
      Circle()
        .fill(BarakahColor.ink)
        .frame(width: BarakahMetric.dotSmall, height: BarakahMetric.dotSmall)
    case .current:
      ZStack {
        Circle()
          .fill(BarakahColor.green)
          .frame(width: BarakahMetric.dotCurrent, height: BarakahMetric.dotCurrent)
        Circle()
          .stroke(BarakahColor.green.opacity(0.25), lineWidth: BarakahMetric.ringStroke)
          .frame(width: BarakahMetric.dotCurrent + 6, height: BarakahMetric.dotCurrent + 6)
      }
    case .upcoming:
      Circle()
        .stroke(BarakahColor.ink, lineWidth: 1)
        .frame(width: BarakahMetric.dotSmall, height: BarakahMetric.dotSmall)
    }
  }
}

enum PrayerLabel {
  static func title(_ name: String) -> String {
    switch name {
    case "fajr": return "Fajr"
    case "dhuhr": return "Dhuhr"
    case "asr": return "Asr"
    case "maghrib": return "Maghrib"
    case "isha": return "Isha"
    default: return name.capitalized
    }
  }

  static func arabic(_ name: String) -> String {
    switch name {
    case "fajr": return "الفجر"
    case "dhuhr": return "الظهر"
    case "asr": return "العصر"
    case "maghrib": return "المغرب"
    case "isha": return "العشاء"
    default: return ""
    }
  }

  static func eyebrow(_ name: String) -> String {
    switch name {
    case "fajr": return "F"
    case "dhuhr": return "D"
    case "asr": return "A"
    case "maghrib": return "M"
    case "isha": return "I"
    default: return ""
    }
  }
}

enum DateFormatters {
  static let timeOfDay: DateFormatter = {
    let f = DateFormatter()
    f.dateFormat = "HH:mm"
    return f
  }()
}

enum RelativeFormatter {
  static func short(now: Date, target: Date) -> String {
    let interval = target.timeIntervalSince(now)
    if interval <= 0 { return "now" }
    let mins = Int(interval / 60)
    if mins < 60 { return "\(mins)m" }
    let hours = mins / 60
    let rem = mins % 60
    if rem == 0 { return "\(hours)h" }
    return "\(hours)h \(rem)m"
  }
}
