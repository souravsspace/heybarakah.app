import AppIntents
import WidgetKit

struct IncrementDhikrIntent: AppIntent {
  static var title: LocalizedStringResource = "Add one dhikr"
  static var description: IntentDescription = "Adds one count to today's dhikr."
  static var isDiscoverable: Bool = false

  func perform() async throws -> some IntentResult {
    SharedStore.enqueueDhikrIncrement()
    WidgetCenter.shared.reloadTimelines(ofKind: "barakah.dhikr")
    return .result()
  }
}
