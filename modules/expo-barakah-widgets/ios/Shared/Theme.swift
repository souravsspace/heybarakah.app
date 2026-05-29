import SwiftUI

extension Color {
  /// 0xRRGGBB integer + opacity.
  init(hex: UInt, opacity: Double = 1) {
    let r = Double((hex >> 16) & 0xFF) / 255
    let g = Double((hex >> 8) & 0xFF) / 255
    let b = Double(hex & 0xFF) / 255
    self.init(.sRGB, red: r, green: g, blue: b, opacity: opacity)
  }

  /// 0-255 channels + opacity.
  init(r: Double, g: Double, b: Double, o: Double = 1) {
    self.init(.sRGB, red: r / 255, green: g / 255, blue: b / 255, opacity: o)
  }
}

enum BarakahFont {
  static let serifFamily = "LibreBaskerville-Bold"
  static let sansFamily = "Inter"

  /// Serif headline. Falls back to the system serif if the face is not
  /// registered in the extension.
  static func serif(_ size: CGFloat) -> Font {
    Font.custom(serifFamily, size: size)
  }

  static func sans(_ size: CGFloat, weight: Font.Weight = .regular) -> Font {
    Font.custom(sansFamily, size: size).weight(weight)
  }

  static func mono(_ size: CGFloat, weight: Font.Weight = .medium) -> Font {
    Font.system(size: size, weight: weight, design: .monospaced)
  }

  /// Arabic — system naskh fallback.
  static func arabic(_ size: CGFloat) -> Font {
    Font.custom("Amiri", size: size)
  }
}
