import Foundation

enum SamplePayload {
  static let snapshot = WidgetSnapshot(
    v: 1,
    generatedAt: "2026-05-18T12:00:00Z",
    tz: "UTC",
    date: "2026-05-18",
    prayers: [
      .init(name: "fajr", adhanISO: "2026-05-18T04:25:00Z", startISO: "2026-05-18T04:18:00Z", endISO: "2026-05-18T04:33:00Z"),
      .init(name: "dhuhr", adhanISO: "2026-05-18T12:42:00Z", startISO: "2026-05-18T12:35:00Z", endISO: "2026-05-18T12:50:00Z"),
      .init(name: "asr", adhanISO: "2026-05-18T16:32:00Z", startISO: "2026-05-18T16:25:00Z", endISO: "2026-05-18T16:40:00Z"),
      .init(name: "maghrib", adhanISO: "2026-05-18T18:49:00Z", startISO: "2026-05-18T18:42:00Z", endISO: "2026-05-18T18:57:00Z"),
      .init(name: "isha", adhanISO: "2026-05-18T20:22:00Z", startISO: "2026-05-18T20:15:00Z", endISO: "2026-05-18T20:30:00Z"),
    ],
    tomorrowFajrISO: "2026-05-19T04:17:00Z",
    streak: .init(
      days: 47,
      best: 62,
      history: [
        1, 0, 1, 1, 0, 1, 1,
        1, 1, 1, 1, 0, 1, 1,
        1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1,
      ],
      todayDone: 3
    ),
    dhikr: .init(count: 21, target: 33, sessionTotal: 155),
    ayah: .init(
      arabic: "إِنَّ ٱلصَّلَوٰةَ تَنْهَىٰ عَنِ ٱلْفَحْشَآءِ وَٱلْمُنكَرِ",
      translation: "Indeed, prayer prohibits immorality and wrongdoing.",
      surah: "Al-ʿAnkabūt",
      reference: "29:45"
    ),
    lockNow: nil
  )
}
