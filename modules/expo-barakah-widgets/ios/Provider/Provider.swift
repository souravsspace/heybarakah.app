import AppIntents
import WidgetKit

@available(iOS 17.0, *)
struct BarakahEntry: TimelineEntry {
  let date: Date
  let snapshot: WidgetSnapshot?
  let direction: Direction
}

/// One provider drives every configurable family. The chosen style is read
/// off the configuration intent and carried on the entry as a `Direction`.
@available(iOS 17.0, *)
struct BarakahProvider<Intent>: AppIntentTimelineProvider
where Intent: WidgetConfigurationIntent & DirectionProviding {
  func placeholder(in _: Context) -> BarakahEntry {
    BarakahEntry(date: Date(), snapshot: SamplePayload.snapshot, direction: .editorial)
  }

  func snapshot(for configuration: Intent, in _: Context) async -> BarakahEntry {
    BarakahEntry(
      date: Date(),
      snapshot: SharedStore.load() ?? SamplePayload.snapshot,
      direction: configuration.direction
    )
  }

  func timeline(for configuration: Intent, in _: Context) async -> Timeline<BarakahEntry> {
    let now = Date()
    let snapshot = SharedStore.load()
    let direction = configuration.direction
    var entries: [BarakahEntry] = [
      BarakahEntry(date: now, snapshot: snapshot, direction: direction),
    ]

    if let snapshot {
      let boundaries = snapshot.prayers.flatMap { prayer -> [Date] in
        [SharedStore.date(from: prayer.startISO), SharedStore.date(from: prayer.endISO)]
          .compactMap { $0 }
      }
      for date in boundaries where date > now {
        entries.append(BarakahEntry(date: date, snapshot: snapshot, direction: direction))
      }
    }

    return Timeline(entries: entries, policy: .after(nextRefresh(from: now, snapshot: snapshot)))
  }

  private func nextRefresh(from now: Date, snapshot: WidgetSnapshot?) -> Date {
    let calendar = Calendar.current
    let nextMidnight = calendar.nextDate(
      after: now,
      matching: DateComponents(hour: 0, minute: 0, second: 5),
      matchingPolicy: .nextTime
    ) ?? now.addingTimeInterval(3600)

    if let snapshot {
      let upcoming = snapshot.prayers
        .compactMap { SharedStore.date(from: $0.endISO) }
        .filter { $0 > now }
        .sorted()
        .first
      if let upcoming, upcoming < nextMidnight {
        return upcoming
      }
    }
    return nextMidnight
  }
}
