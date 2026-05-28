import Foundation

struct PrayerInfo {
  let name: String
  let title: String
  let arabic: String
  let letter: String
}

enum PrayerCatalog {
  static let order: [PrayerInfo] = [
    .init(name: "fajr", title: "Fajr", arabic: "الفجر", letter: "F"),
    .init(name: "dhuhr", title: "Dhuhr", arabic: "الظهر", letter: "D"),
    .init(name: "asr", title: "Asr", arabic: "العصر", letter: "A"),
    .init(name: "maghrib", title: "Maghrib", arabic: "المغرب", letter: "M"),
    .init(name: "isha", title: "Isha", arabic: "العشاء", letter: "I"),
  ]

  static func info(_ name: String) -> PrayerInfo {
    order.first { $0.name == name } ?? order[0]
  }
}

/// One prayer positioned along the day rail.
struct RailPoint: Identifiable {
  let id: String
  let info: PrayerInfo
  let pct: Double
  let isCurrent: Bool
  let isPast: Bool
  let isUpcoming: Bool
  let adhan: Date
}

/// Derived prayer-day state from a snapshot, evaluated at `now`.
struct PrayerState {
  let display: PrayerInfo
  let isLocked: Bool
  let timeText: String
  let countdownText: String
  let countdownMinutes: Int
  let points: [RailPoint]
  let nextTitle: String

  static func from(_ snapshot: WidgetSnapshot, now: Date = Date()) -> PrayerState {
    let tz = TimeZone(identifier: snapshot.tz) ?? .current
    var cal = Calendar(identifier: .gregorian)
    cal.timeZone = tz

    struct Parsed {
      let info: PrayerInfo
      let adhan: Date
      let start: Date
      let end: Date
    }
    let parsed: [Parsed] = snapshot.prayers.compactMap { p in
      guard
        let adhan = SharedStore.date(from: p.adhanISO),
        let start = SharedStore.date(from: p.startISO),
        let end = SharedStore.date(from: p.endISO)
      else { return nil }
      return Parsed(info: PrayerCatalog.info(p.name), adhan: adhan, start: start, end: end)
    }

    let current = parsed.first { now >= $0.start && now <= $0.end }
    let next = parsed.first { $0.adhan > now }

    // countdown target
    let displayParsed = current ?? next ?? parsed.last
    let display = displayParsed?.info ?? PrayerCatalog.order[0]

    var countdown: TimeInterval = 0
    var timeAnchor = now
    if let current {
      countdown = current.end.timeIntervalSince(now)
      timeAnchor = current.adhan
    } else if let next {
      countdown = next.adhan.timeIntervalSince(now)
      timeAnchor = next.adhan
    } else if let fajrISO = snapshot.tomorrowFajrISO,
              let fajr = SharedStore.date(from: fajrISO) {
      countdown = fajr.timeIntervalSince(now)
      timeAnchor = fajr
    }
    let countdownMin = max(0, Int(countdown / 60))

    // rail positions (by adhan minutes-of-day)
    let minutes = parsed.map { minuteOfDay($0.adhan, cal: cal) }
    let first = minutes.min() ?? 0
    let last = minutes.max() ?? 1
    let span = max(1, last - first)
    let points: [RailPoint] = parsed.map { p in
      let m = minuteOfDay(p.adhan, cal: cal)
      return RailPoint(
        id: p.info.name,
        info: p.info,
        pct: Double(m - first) / Double(span),
        isCurrent: current?.info.name == p.info.name,
        isPast: now > p.end,
        isUpcoming: now < p.start,
        adhan: p.adhan
      )
    }

    let tf = DateFormatter()
    tf.timeZone = tz
    tf.locale = Locale(identifier: "en_US_POSIX")
    tf.dateFormat = "HH:mm"

    return PrayerState(
      display: display,
      isLocked: current != nil,
      timeText: tf.string(from: timeAnchor),
      countdownText: formatCountdown(countdownMin),
      countdownMinutes: countdownMin,
      points: points,
      nextTitle: (next ?? parsed.first)?.info.title ?? display.title
    )
  }

  private static func minuteOfDay(_ date: Date, cal: Calendar) -> Int {
    let c = cal.dateComponents([.hour, .minute], from: date)
    return (c.hour ?? 0) * 60 + (c.minute ?? 0)
  }
}

func formatCountdown(_ min: Int) -> String {
  if min <= 0 { return "now" }
  if min < 60 { return "\(min)m" }
  let h = min / 60
  let m = min % 60
  return m == 0 ? "\(h)h" : "\(h)h \(m)m"
}

func formatHM(minuteOfDay min: Int) -> String {
  let m = ((min % 1440) + 1440) % 1440
  return String(format: "%02d:%02d", m / 60, m % 60)
}
