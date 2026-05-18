import WidgetKit

struct BarakahEntry: TimelineEntry {
  let date: Date
  let snapshot: WidgetSnapshot?
}

struct BarakahProvider: TimelineProvider {
  func placeholder(in _: Context) -> BarakahEntry {
    BarakahEntry(date: Date(), snapshot: SamplePayload.snapshot)
  }

  func getSnapshot(in _: Context, completion: @escaping (BarakahEntry) -> Void) {
    let snapshot = SharedStore.load() ?? SamplePayload.snapshot
    completion(BarakahEntry(date: Date(), snapshot: snapshot))
  }

  func getTimeline(in _: Context, completion: @escaping (Timeline<BarakahEntry>) -> Void) {
    let now = Date()
    let snapshot = SharedStore.load()
    var entries: [BarakahEntry] = [BarakahEntry(date: now, snapshot: snapshot)]

    if let snapshot {
      let boundaries = snapshot.prayers.flatMap { prayer -> [Date] in
        [SharedStore.date(from: prayer.startISO), SharedStore.date(from: prayer.endISO)]
          .compactMap { $0 }
      }
      for date in boundaries where date > now {
        entries.append(BarakahEntry(date: date, snapshot: snapshot))
      }
    }

    let refreshAfter = nextRefreshDate(from: now, snapshot: snapshot)
    completion(Timeline(entries: entries, policy: .after(refreshAfter)))
  }

  private func nextRefreshDate(from now: Date, snapshot: WidgetSnapshot?) -> Date {
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

enum SamplePayload {
  static let snapshot = WidgetSnapshot(
    v: 1,
    generatedAt: "2026-05-18T12:00:00Z",
    tz: "UTC",
    date: "2026-05-18",
    prayers: [
      .init(name: "fajr", startISO: "2026-05-18T04:18:00Z", endISO: "2026-05-18T04:33:00Z"),
      .init(name: "dhuhr", startISO: "2026-05-18T12:35:00Z", endISO: "2026-05-18T12:50:00Z"),
      .init(name: "asr", startISO: "2026-05-18T16:25:00Z", endISO: "2026-05-18T16:40:00Z"),
      .init(name: "maghrib", startISO: "2026-05-18T18:42:00Z", endISO: "2026-05-18T18:57:00Z"),
      .init(name: "isha", startISO: "2026-05-18T20:15:00Z", endISO: "2026-05-18T20:30:00Z"),
    ],
    tomorrowFajrISO: "2026-05-19T04:17:00Z",
    streak: .init(days: 23),
    dhikr: .init(count: 18, target: 33),
    ayah: .init(
      arabic: "إِنَّ مَعَ ٱلْعُسْرِ يُسْرًۭا",
      translation: "Indeed, with hardship will be ease.",
      reference: "Ash-Sharh 94:6"
    )
  )
}
