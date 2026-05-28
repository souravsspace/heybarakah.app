import Foundation

struct WidgetSnapshot: Codable, Hashable {
  struct Prayer: Codable, Hashable {
    let name: String
    let adhanISO: String
    let startISO: String
    let endISO: String
  }

  struct Streak: Codable, Hashable {
    let days: Int
    let best: Int
    let history: [Int]
    let todayDone: Int
  }

  struct Dhikr: Codable, Hashable {
    let count: Int
    let target: Int
    let sessionTotal: Int
  }

  struct Ayah: Codable, Hashable {
    let arabic: String
    let translation: String
    let surah: String
    let reference: String
  }

  struct LockNow: Codable, Hashable {
    let name: String
    let endISO: String
  }

  let v: Int
  let generatedAt: String
  let tz: String
  let date: String
  let prayers: [Prayer]
  let tomorrowFajrISO: String?
  let streak: Streak
  let dhikr: Dhikr
  let ayah: Ayah
  let lockNow: LockNow?
}
