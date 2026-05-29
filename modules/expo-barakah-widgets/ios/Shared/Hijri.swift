import Foundation

enum Hijri {
  private static let formatter: DateFormatter = {
    var calendar = Calendar(identifier: .islamicUmmAlQura)
    calendar.locale = Locale(identifier: "en_US")
    let f = DateFormatter()
    f.calendar = calendar
    f.locale = Locale(identifier: "en_US")
    f.dateFormat = "d MMMM"
    return f
  }()

  /// e.g. "17 Dhuʻl-Qiʻdah" — the Umm al-Qura month for the given date.
  static func dateString(for date: Date = Date()) -> String {
    formatter.string(from: date)
  }
}
