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

    init(days: Int, best: Int, history: [Int], todayDone: Int) {
      self.days = days
      self.best = best
      self.history = history
      self.todayDone = todayDone
    }

    // Defaults so a snapshot written by an older app build (before best/history/
    // todayDone existed) still decodes instead of throwing and dropping to sample data.
    init(from decoder: Decoder) throws {
      let c = try decoder.container(keyedBy: CodingKeys.self)
      days = try c.decodeIfPresent(Int.self, forKey: .days) ?? 0
      best = try c.decodeIfPresent(Int.self, forKey: .best) ?? 0
      history = try c.decodeIfPresent([Int].self, forKey: .history) ?? []
      todayDone = try c.decodeIfPresent(Int.self, forKey: .todayDone) ?? 0
    }
  }

  struct Dhikr: Codable, Hashable {
    let count: Int
    let target: Int
    let sessionTotal: Int

    init(count: Int, target: Int, sessionTotal: Int) {
      self.count = count
      self.target = target
      self.sessionTotal = sessionTotal
    }

    init(from decoder: Decoder) throws {
      let c = try decoder.container(keyedBy: CodingKeys.self)
      count = try c.decodeIfPresent(Int.self, forKey: .count) ?? 0
      target = try c.decodeIfPresent(Int.self, forKey: .target) ?? 33
      sessionTotal = try c.decodeIfPresent(Int.self, forKey: .sessionTotal) ?? 0
    }
  }

  struct Ayah: Codable, Hashable {
    let arabic: String
    let translation: String
    let surah: String
    let reference: String

    init(arabic: String, translation: String, surah: String, reference: String) {
      self.arabic = arabic
      self.translation = translation
      self.surah = surah
      self.reference = reference
    }

    init(from decoder: Decoder) throws {
      let c = try decoder.container(keyedBy: CodingKeys.self)
      arabic = try c.decodeIfPresent(String.self, forKey: .arabic) ?? ""
      translation = try c.decodeIfPresent(String.self, forKey: .translation) ?? ""
      surah = try c.decodeIfPresent(String.self, forKey: .surah) ?? ""
      reference = try c.decodeIfPresent(String.self, forKey: .reference) ?? ""
    }
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
