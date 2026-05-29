import SwiftUI

struct DirectionTokens {
  let glassTint: Color
  let ink: Color
  let muted: Color
  let accent: Color
  let hairline: Color
  let pillBg: Color
}

enum Direction: String, CaseIterable {
  case editorial, bold, dawn, night, arch, celestial

  /// Editorial / dawn / arch flip with the system theme; the rest are fixed.
  var themeable: Bool {
    self == .editorial || self == .dawn || self == .arch
  }

  func tokens(_ scheme: ColorScheme) -> DirectionTokens {
    let dark = themeable && scheme == .dark
    switch self {
    case .editorial:
      return dark
        ? DirectionTokens(
          glassTint: Color(r: 20, g: 18, b: 14, o: 0.55),
          ink: Color(hex: 0xf5ebdb),
          muted: Color(r: 245, g: 235, b: 219, o: 0.58),
          accent: Color(hex: 0x29603E),
          hairline: Color(r: 245, g: 235, b: 219, o: 0.18),
          pillBg: Color(r: 255, g: 255, b: 255, o: 0.10))
        : DirectionTokens(
          glassTint: Color(r: 255, g: 250, b: 242, o: 0.38),
          ink: Color(hex: 0x1a1408),
          muted: Color(r: 26, g: 20, b: 8, o: 0.55),
          accent: Color(hex: 0x29603E),
          hairline: Color(r: 26, g: 20, b: 8, o: 0.16),
          pillBg: Color(r: 255, g: 255, b: 255, o: 0.42))
    case .bold:
      return DirectionTokens(
        glassTint: Color(r: 20, g: 55, b: 35, o: 0.62),
        ink: Color(hex: 0xf5ebdb),
        muted: Color(r: 245, g: 235, b: 219, o: 0.62),
        accent: Color(hex: 0xE4C168),
        hairline: Color(r: 245, g: 235, b: 219, o: 0.22),
        pillBg: Color(r: 245, g: 235, b: 219, o: 0.14))
    case .dawn:
      return dark
        ? DirectionTokens(
          glassTint: Color(r: 20, g: 20, b: 18, o: 0.45),
          ink: Color(hex: 0xf5ebdb),
          muted: Color(r: 245, g: 235, b: 219, o: 0.58),
          accent: Color(hex: 0x29603E),
          hairline: Color(r: 245, g: 235, b: 219, o: 0.18),
          pillBg: Color(r: 255, g: 255, b: 255, o: 0.10))
        : DirectionTokens(
          glassTint: Color(r: 255, g: 255, b: 255, o: 0.34),
          ink: Color(hex: 0x2a1c10),
          muted: Color(r: 42, g: 28, b: 16, o: 0.58),
          accent: Color(hex: 0x29603E),
          hairline: Color(r: 42, g: 28, b: 16, o: 0.16),
          pillBg: Color(r: 255, g: 255, b: 255, o: 0.5))
    case .night:
      return DirectionTokens(
        glassTint: Color(r: 8, g: 16, b: 12, o: 0.62),
        ink: Color(r: 245, g: 235, b: 219, o: 0.95),
        muted: Color(r: 245, g: 235, b: 219, o: 0.55),
        accent: Color(hex: 0xE4C168),
        hairline: Color(r: 245, g: 235, b: 219, o: 0.18),
        pillBg: Color(r: 245, g: 235, b: 219, o: 0.10))
    case .arch:
      return dark
        ? DirectionTokens(
          glassTint: Color(r: 20, g: 18, b: 12, o: 0.55),
          ink: Color(hex: 0xf5ebdb),
          muted: Color(r: 245, g: 235, b: 219, o: 0.58),
          accent: Color(hex: 0xE4C168),
          hairline: Color(r: 245, g: 235, b: 219, o: 0.20),
          pillBg: Color(r: 255, g: 255, b: 255, o: 0.10))
        : DirectionTokens(
          glassTint: Color(r: 255, g: 250, b: 236, o: 0.42),
          ink: Color(hex: 0x1B3F29),
          muted: Color(r: 27, g: 63, b: 41, o: 0.55),
          accent: Color(hex: 0x29603E),
          hairline: Color(r: 27, g: 63, b: 41, o: 0.20),
          pillBg: Color(r: 255, g: 250, b: 236, o: 0.48))
    case .celestial:
      return DirectionTokens(
        glassTint: Color(r: 20, g: 30, b: 55, o: 0.42),
        ink: Color(r: 245, g: 235, b: 219, o: 0.96),
        muted: Color(r: 245, g: 235, b: 219, o: 0.65),
        accent: Color(hex: 0xE4C168),
        hairline: Color(r: 245, g: 235, b: 219, o: 0.22),
        pillBg: Color(r: 245, g: 235, b: 219, o: 0.16))
    }
  }
}

/// Full-bleed wallpaper for a direction — what the glass shell refracts.
struct WallpaperView: View {
  let direction: Direction
  let scheme: ColorScheme

  var body: some View {
    GeometryReader { geo in
      let s = max(geo.size.width, geo.size.height)
      let dark = direction.themeable && scheme == .dark
      ZStack {
        switch direction {
        case .editorial:
          LinearGradient(
            colors: dark
              ? [Color(hex: 0x1a1814), Color(hex: 0x0f0e0b), Color(hex: 0x060503)]
              : [Color(hex: 0xf3ead9), Color(hex: 0xe8dcc4), Color(hex: 0xd9c9a9)],
            startPoint: .topLeading, endPoint: .bottomTrailing)
        case .bold:
          Color(hex: 0x1a4329)
          radial(0x3a7f54, center: UnitPoint(x: 0.2, y: 0.2), r: s * 0.9)
          radial(0x0e2e1d, center: UnitPoint(x: 1, y: 1), r: s)
        case .dawn:
          if dark {
            Color(hex: 0x0b0e0c)
            radial(0xf5965a, center: .topLeading, r: s, o: 0.18)
            radial(0x00d26a, center: .bottomTrailing, r: s, o: 0.16)
          } else {
            Color(hex: 0xf3d8c0)
            radial(0xf9c5a3, center: .topLeading, r: s)
            radial(0x6cb592, center: .bottomTrailing, r: s)
            radial(0xf2dc9c, center: UnitPoint(x: 0.8, y: 0.1), r: s * 0.8)
          }
        case .night:
          Color(hex: 0x050d09)
          radial(0x29603e, center: UnitPoint(x: 0.5, y: 1), r: s * 0.7, o: 0.45)
          radial(0xc9a23a, center: UnitPoint(x: 0.8, y: 0.1), r: s * 0.5, o: 0.12)
        case .arch:
          if dark {
            Color(hex: 0x0c0b09)
            radial(0xc9a23a, center: .top, r: s * 0.8, o: 0.18)
            radial(0x29603e, center: .bottom, r: s * 0.7, o: 0.20)
          } else {
            Color(hex: 0xddc69d)
            radial(0xead7b6, center: .top, r: s * 0.85)
            radial(0x29603e, center: .bottom, r: s * 0.7, o: 0.15)
          }
        case .celestial:
          let sky = Celestial.tone(nowMinutes())
          LinearGradient(colors: [sky.sky1, sky.sky2],
                         startPoint: .top, endPoint: .bottom)
        }
      }
    }
    .ignoresSafeArea()
  }

  private func radial(_ hex: UInt, center: UnitPoint, r: CGFloat, o: Double = 1) -> some View {
    RadialGradient(
      gradient: Gradient(colors: [Color(hex: hex, opacity: o), .clear]),
      center: center, startRadius: 0, endRadius: r)
  }
}
