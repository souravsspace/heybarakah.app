import AppIntents

struct StartQuietControlIntent: AppIntent {
  static var title: LocalizedStringResource = "Quiet for du'a"
  static var description = IntentDescription("Open Barakah and request a brief quiet session.")
  static var openAppWhenRun = true

  func perform() async throws -> some IntentResult & OpensIntent {
    .result(opensIntent: OpenBarakahIntent())
  }
}

struct OpenBarakahIntent: AppIntent {
  static var title: LocalizedStringResource = "Open Barakah"
  static var openAppWhenRun = true
  static var isDiscoverable = false

  func perform() async throws -> some IntentResult {
    .result()
  }
}
