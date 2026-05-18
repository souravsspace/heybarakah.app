import SwiftUI

enum BarakahColor {
  static let green = Color(red: 0x29 / 255, green: 0x60 / 255, blue: 0x3E / 255)
  static let ink = Color(red: 0x0A / 255, green: 0x0A / 255, blue: 0x0A / 255)
  static let muted = Color(red: 0x6B / 255, green: 0x72 / 255, blue: 0x80 / 255)
  static let canvas = Color(red: 1, green: 1, blue: 1)
  static let canvasInverted = Color(red: 0x06 / 255, green: 0x16 / 255, blue: 0x0E / 255)
  static let hairline = Color(red: 0xE5 / 255, green: 0xE7 / 255, blue: 0xEB / 255)
  static let hairlineDim = Color(white: 1, opacity: 0.18)
}

enum BarakahFont {
  static let serifFamily = "LibreBaskerville-Bold"
  static let sansFamily = "Inter"

  static func serif(size: CGFloat) -> Font {
    Font.custom(serifFamily, size: size)
  }

  static func sans(size: CGFloat, weight: Font.Weight = .regular) -> Font {
    Font.custom(sansFamily, size: size).weight(weight)
  }

  static func mono(size: CGFloat) -> Font {
    Font.system(size: size, weight: .medium, design: .monospaced)
  }
}

enum BarakahMetric {
  static let hairline: CGFloat = 1
  static let dotSmall: CGFloat = 5
  static let dotCurrent: CGFloat = 9
  static let ringStroke: CGFloat = 1.5
}
