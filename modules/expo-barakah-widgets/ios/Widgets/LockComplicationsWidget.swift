import SwiftUI
import WidgetKit

@available(iOS 17.0, *)
struct LockComplicationsWidget: Widget {
  var body: some WidgetConfiguration {
    StaticConfiguration(kind: "barakah.lock-complications", provider: LockProvider()) { entry in
      LockComplicationView(entry: entry)
    }
    .configurationDisplayName("Next prayer")
    .description("Lock-screen complication for your next prayer.")
    .supportedFamilies([.accessoryCircular, .accessoryRectangular, .accessoryInline])
  }
}

@available(iOS 17.0, *)
struct LockEntry: TimelineEntry {
  let date: Date
  let snapshot: WidgetSnapshot?
}

@available(iOS 17.0, *)
struct LockProvider: TimelineProvider {
  func placeholder(in _: Context) -> LockEntry {
    LockEntry(date: Date(), snapshot: SamplePayload.snapshot)
  }

  func getSnapshot(in _: Context, completion: @escaping (LockEntry) -> Void) {
    completion(LockEntry(date: Date(), snapshot: SharedStore.load() ?? SamplePayload.snapshot))
  }

  func getTimeline(in _: Context, completion: @escaping (Timeline<LockEntry>) -> Void) {
    let now = Date()
    let snapshot = SharedStore.load()
    var entries = [LockEntry(date: now, snapshot: snapshot)]
    if let snapshot {
      let bounds = snapshot.prayers
        .compactMap { SharedStore.date(from: $0.endISO) }
        .filter { $0 > now }
      for d in bounds { entries.append(LockEntry(date: d, snapshot: snapshot)) }
    }
    let refresh = now.addingTimeInterval(15 * 60)
    completion(Timeline(entries: entries, policy: .after(refresh)))
  }
}

@available(iOS 17.0, *)
struct LockComplicationView: View {
  let entry: LockEntry
  @Environment(\.widgetFamily) private var family

  var body: some View {
    let s = PrayerState.from(entry.snapshot ?? SamplePayload.snapshot)
    let pct = max(0.04, min(1, 1 - Double(s.countdownMinutes) / 180))

    switch family {
    case .accessoryCircular:
      ZStack {
        AccessoryWidgetBackground()
        Circle().stroke(Color.white.opacity(0.25), lineWidth: 2)
        Circle().trim(from: 0, to: pct)
          .stroke(Color.white, style: StrokeStyle(lineWidth: 2, lineCap: .round))
          .rotationEffect(.degrees(-90))
        VStack(spacing: 0) {
          Text(s.display.letter).font(BarakahFont.serif(18))
          Text(s.countdownText).font(BarakahFont.mono(8)).opacity(0.8)
        }
      }
      .widgetAccentable()
    case .accessoryRectangular:
      HStack(spacing: 8) {
        VStack(alignment: .leading, spacing: 1) {
          Text(s.isLocked ? "NOW" : "NEXT").font(BarakahFont.sans(8, weight: .bold)).tracking(1.8)
          Text(s.display.title).font(BarakahFont.serif(19))
          Text("\(s.timeText) · \(s.countdownText)").font(BarakahFont.mono(9.5)).opacity(0.85)
        }
        Spacer()
        LockMotif(direction: .editorial, size: 22, color: .white).widgetAccentable()
      }
    case .accessoryInline:
      Label {
        Text("\(s.display.title) in \(s.countdownText)")
      } icon: {
        Image(systemName: "circle.dotted")
      }
    default:
      Text(s.display.title)
    }
  }
}
