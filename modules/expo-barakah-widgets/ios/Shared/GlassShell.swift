import SwiftUI
import WidgetKit

enum ShellSize {
  case small, medium, large

  var insets: EdgeInsets {
    switch self {
    case .small: return EdgeInsets(top: 14, leading: 16, bottom: 14, trailing: 16)
    case .medium: return EdgeInsets(top: 14, leading: 18, bottom: 14, trailing: 18)
    case .large: return EdgeInsets(top: 18, leading: 20, bottom: 18, trailing: 20)
    }
  }
}

/// Wraps widget content in the Liquid-Glass treatment: the direction's
/// wallpaper as the container background, a translucent tint, a specular
/// top highlight, and a hairline rim.
struct GlassShell: ViewModifier {
  let direction: Direction
  let size: ShellSize
  @Environment(\.colorScheme) private var scheme

  func body(content: Content) -> some View {
    let specularOpacity: Double = (direction == .night || direction == .celestial) ? 0.35 : 0.7
    content
      .padding(size.insets)
      .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
      .background(direction.tokens(scheme).glassTint)
      .overlay(alignment: .top) {
        RadialGradient(
          gradient: Gradient(colors: [Color.white.opacity(0.45), .clear]),
          center: UnitPoint(x: 0.5, y: -0.4),
          startRadius: 0, endRadius: 160)
          .blendMode(.screen)
          .opacity(specularOpacity)
          .allowsHitTesting(false)
      }
      .overlay {
        RoundedRectangle(cornerRadius: 22, style: .continuous)
          .strokeBorder(Color.white.opacity(direction == .night ? 0.10 : 0.18), lineWidth: 0.5)
      }
      .containerBackground(for: .widget) {
        WallpaperView(direction: direction, scheme: scheme)
      }
  }
}

extension View {
  func glassShell(_ direction: Direction, size: ShellSize) -> some View {
    modifier(GlassShell(direction: direction, size: size))
  }
}

/// Eyebrow label — uppercase tracked sans, optional leading accent tick.
struct Eyebrow: View {
  let text: String
  var lead = false
  var color: Color
  var accent: Color

  var body: some View {
    HStack(spacing: 6) {
      if lead {
        Rectangle().fill(accent.opacity(0.7)).frame(width: 14, height: 1)
      }
      Text(text.uppercased())
        .font(BarakahFont.sans(9.5, weight: .bold))
        .tracking(1.7)
        .foregroundColor(color)
    }
  }
}

struct Hairline: View {
  let color: Color
  var body: some View {
    Rectangle().fill(color).frame(height: 1)
  }
}
