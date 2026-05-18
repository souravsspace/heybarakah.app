import AppIntents

struct StartQuietControlIntent: AppIntent {
  static var title: LocalizedStringResource = "Quiet for du'a"
  static var description: IntentDescription = "Open Barakah and request a brief quiet session."
  static var openAppWhenRun: Bool = true

  func perform() async throws -> some IntentResult & OpensIntent {
    return .result(opensIntent: OpenBarakahIntent())
  }
}

struct OpenBarakahIntent: AppIntent {
  static var title: LocalizedStringResource = "Open Barakah"
  static var openAppWhenRun: Bool = true
  static var isDiscoverable: Bool = false

  func perform() async throws -> some IntentResult {
    return .result()
  }
}
