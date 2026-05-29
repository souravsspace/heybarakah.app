import AppIntents
import WidgetKit

/// Anything that resolves to a visual direction (used by the generic provider).
protocol DirectionProviding {
  var direction: Direction { get }
}

@available(iOS 17.0, *)
enum WidgetStyle: String, AppEnum {
  case editorial, bold, dawn, night, arch, celestial

  static var typeDisplayRepresentation = TypeDisplayRepresentation(name: "Style")
  static var caseDisplayRepresentations: [WidgetStyle: DisplayRepresentation] = [
    .editorial: "Editorial",
    .bold: "Mosque Green",
    .dawn: "Dawn",
    .night: "Night",
    .arch: "Architectural",
    .celestial: "Celestial",
  ]

  var direction: Direction { Direction(rawValue: rawValue) ?? .editorial }
}

@available(iOS 17.0, *)
enum AyahWidgetStyle: String, AppEnum {
  case dawn, night

  static var typeDisplayRepresentation = TypeDisplayRepresentation(name: "Style")
  static var caseDisplayRepresentations: [AyahWidgetStyle: DisplayRepresentation] = [
    .dawn: "Dawn",
    .night: "Night",
  ]

  var direction: Direction { Direction(rawValue: rawValue) ?? .dawn }
}

@available(iOS 17.0, *)
struct SalahArcConfigIntent: WidgetConfigurationIntent, DirectionProviding {
  static var title: LocalizedStringResource = "Salah Arc"
  static var description = IntentDescription("Choose a visual style for the Salah Arc widget.")

  @Parameter(title: "Style", default: .editorial)
  var style: WidgetStyle

  var direction: Direction { style.direction }
}

@available(iOS 17.0, *)
struct DhikrConfigIntent: WidgetConfigurationIntent, DirectionProviding {
  static var title: LocalizedStringResource = "Dhikr"
  static var description = IntentDescription("Choose a visual style for the Dhikr widget.")

  @Parameter(title: "Style", default: .editorial)
  var style: WidgetStyle

  var direction: Direction { style.direction }
}

@available(iOS 17.0, *)
struct StreakConfigIntent: WidgetConfigurationIntent, DirectionProviding {
  static var title: LocalizedStringResource = "Streak"
  static var description = IntentDescription("Choose a visual style for the Streak widget.")

  @Parameter(title: "Style", default: .editorial)
  var style: WidgetStyle

  var direction: Direction { style.direction }
}

@available(iOS 17.0, *)
struct AyahConfigIntent: WidgetConfigurationIntent, DirectionProviding {
  static var title: LocalizedStringResource = "Ayah of the day"
  static var description = IntentDescription("Choose a visual style for the Ayah widget.")

  @Parameter(title: "Style", default: .dawn)
  var style: AyahWidgetStyle

  var direction: Direction { style.direction }
}
