import SwiftUI

/// Minutes since local midnight for the given date.
func nowMinutes(_ date: Date = Date()) -> Int {
  let c = Calendar.current.dateComponents([.hour, .minute], from: date)
  return (c.hour ?? 0) * 60 + (c.minute ?? 0)
}

struct SkyTone {
  let sky1: Color
  let sky2: Color
  let sun: Color
  let isMoon: Bool
}

/// Time-of-day sky tone for the celestial direction. Ported from the
/// design's `celestialPalette` — interpolates dawn → noon → dusk → night.
enum Celestial {
  private struct Stop {
    let t: Int
    let sky1: UInt
    let sky2: UInt
    let sun: UInt
    let isMoon: Bool
  }

  private static let stops: [Stop] = [
    .init(t: 0, sky1: 0x0a142a, sky2: 0x020410, sun: 0x9eaccb, isMoon: true),
    .init(t: 4 * 60 + 30, sky1: 0x1f2a4f, sky2: 0x08101e, sun: 0xe8c7a4, isMoon: true),
    .init(t: 6 * 60, sky1: 0xf3b187, sky2: 0xfbe1cc, sun: 0xf59f6c, isMoon: false),
    .init(t: 9 * 60, sky1: 0xc5dcef, sky2: 0xfbf3e6, sun: 0xf5d77b, isMoon: false),
    .init(t: 12 * 60 + 15, sky1: 0x9cc3e8, sky2: 0xf6f1de, sun: 0xfbe79b, isMoon: false),
    .init(t: 15 * 60 + 45, sky1: 0xb2cce2, sky2: 0xf9e3c6, sun: 0xf7b75e, isMoon: false),
    .init(t: 18 * 60 + 42, sky1: 0x7c3c4d, sky2: 0xe4a76b, sun: 0xec6a3e, isMoon: false),
    .init(t: 20 * 60 + 30, sky1: 0x27284d, sky2: 0x5a2f4a, sun: 0xe0a368, isMoon: false),
    .init(t: 23 * 60, sky1: 0x0a142a, sky2: 0x020410, sun: 0xcfd5e6, isMoon: true),
    .init(t: 24 * 60, sky1: 0x0a142a, sky2: 0x020410, sun: 0x9eaccb, isMoon: true),
  ]

  static func tone(_ nowMin: Int) -> SkyTone {
    for i in 0..<(stops.count - 1) {
      let a = stops[i], b = stops[i + 1]
      if nowMin >= a.t && nowMin < b.t {
        let k = Double(nowMin - a.t) / Double(b.t - a.t)
        return SkyTone(
          sky1: lerp(a.sky1, b.sky1, k),
          sky2: lerp(a.sky2, b.sky2, k),
          sun: lerp(a.sun, b.sun, k),
          isMoon: a.isMoon
        )
      }
    }
    let last = stops[stops.count - 1]
    return SkyTone(
      sky1: Color(hex: last.sky1),
      sky2: Color(hex: last.sky2),
      sun: Color(hex: last.sun),
      isMoon: last.isMoon
    )
  }

  private static func lerp(_ a: UInt, _ b: UInt, _ k: Double) -> Color {
    let ar = Double((a >> 16) & 0xFF), ag = Double((a >> 8) & 0xFF), ab = Double(a & 0xFF)
    let br = Double((b >> 16) & 0xFF), bg = Double((b >> 8) & 0xFF), bb = Double(b & 0xFF)
    let rr: Double = ar + (br - ar) * k
    let gg: Double = ag + (bg - ag) * k
    let bl: Double = ab + (bb - ab) * k
    return Color(r: rr, g: gg, b: bl)
  }
}
