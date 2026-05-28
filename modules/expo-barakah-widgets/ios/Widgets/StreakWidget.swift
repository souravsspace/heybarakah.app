import SwiftUI
import WidgetKit

@available(iOS 17.0, *)
struct StreakWidget: Widget {
  var body: some WidgetConfiguration {
    AppIntentConfiguration(
      kind: "barakah.streak",
      intent: StreakConfigIntent.self,
      provider: BarakahProvider<StreakConfigIntent>()
    ) { entry in
      StreakView(entry: entry)
    }
    .configurationDisplayName("Streak")
    .description("Your consistency, day by day.")
    .supportedFamilies([.systemSmall])
  }
}

@available(iOS 17.0, *)
struct StreakView: View {
  let entry: BarakahEntry
  @Environment(\.colorScheme) private var scheme

  var body: some View {
    let dir = entry.direction
    let tok = dir.tokens(scheme)
    let s = (entry.snapshot ?? SamplePayload.snapshot).streak

    Group {
      switch dir {
      case .editorial: stEditorial(tok, s)
      case .bold: stBold(s)
      case .dawn: stDawn(tok, s)
      case .night: stNight(tok, s)
      case .arch: stArch(tok, s)
      case .celestial: stCelestial(tok, s)
      }
    }
    .glassShell(dir, size: .small)
  }

  // MARK: editorial

  private func stEditorial(_ tok: DirectionTokens, _ s: WidgetSnapshot.Streak) -> some View {
    VStack(alignment: .leading, spacing: 0) {
      HStack { Spacer(); bestLabel("BEST \(s.best)", tok.muted) }
      HStack(alignment: .firstTextBaseline, spacing: 6) {
        Text("\(s.days)").font(BarakahFont.serif(62)).foregroundColor(tok.ink)
        Text("days").font(BarakahFont.serif(13)).italic().foregroundColor(tok.muted)
      }
      .padding(.top, 4)
      Spacer(minLength: 0)
      PrayerDoneRow(done: s.todayDone, accent: tok.accent, label: tok.muted, border: tok.hairline)
      Hairline(color: tok.hairline).padding(.top, 6)
      Text("All five, on time.").font(BarakahFont.serif(10.5)).italic().foregroundColor(tok.ink).padding(.top, 4)
    }
  }

  // MARK: bold

  private func stBold(_ s: WidgetSnapshot.Streak) -> some View {
    let cream = Color(hex: 0xF5EBDB)
    let gold = Color(hex: 0xE4C168)
    return VStack(alignment: .leading, spacing: 0) {
      HStack { Spacer(); bestLabel("BEST \(s.best)", gold) }
      HStack(alignment: .firstTextBaseline, spacing: 6) {
        Text("\(s.days)").font(BarakahFont.serif(64)).foregroundColor(cream)
        Text("days").font(BarakahFont.serif(12)).italic().foregroundColor(gold)
      }
      .padding(.top, 4)
      Spacer(minLength: 0)
      HStack(alignment: .bottom, spacing: 2) {
        ForEach(Array(s.history.suffix(14).enumerated()), id: \.offset) { _, h in
          RoundedRectangle(cornerRadius: 1)
            .fill(h == 1 ? gold : cream.opacity(0.18))
            .frame(height: h == 1 ? 14 : 3)
            .frame(maxWidth: .infinity)
        }
      }
      .frame(height: 14)
      .padding(.bottom, 4)
      PrayerDoneRow(done: s.todayDone, accent: gold, label: cream.opacity(0.55), border: cream.opacity(0.32), dark: true)
    }
  }

  // MARK: dawn

  private func stDawn(_ tok: DirectionTokens, _ s: WidgetSnapshot.Streak) -> some View {
    let last14 = Array(s.history.suffix(14))
    return VStack(alignment: .leading, spacing: 0) {
      HStack { Spacer(); Text("↑ \(s.best)").font(BarakahFont.mono(9.5)).foregroundColor(tok.muted) }
      HStack(alignment: .firstTextBaseline, spacing: 6) {
        Text("\(s.days)").font(BarakahFont.serif(50)).foregroundColor(tok.ink)
        Text("days").font(BarakahFont.serif(11)).italic().foregroundColor(tok.muted)
      }
      .padding(.top, 4)
      Spacer(minLength: 0)
      LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 4), count: 7), spacing: 4) {
        ForEach(Array(last14.enumerated()), id: \.offset) { i, h in
          Circle()
            .fill(h == 1 ? tok.accent : Color.clear)
            .overlay { if h != 1 { Circle().strokeBorder(tok.hairline, lineWidth: 1) } }
            .overlay {
              if i == last14.count - 1 { Circle().strokeBorder(tok.accent, lineWidth: 1.5).padding(-2) }
            }
            .aspectRatio(1, contentMode: .fit)
        }
      }
    }
  }

  // MARK: night

  private func stNight(_ tok: DirectionTokens, _ s: WidgetSnapshot.Streak) -> some View {
    let gold = Color(hex: 0xE4C168)
    return VStack(alignment: .leading, spacing: 0) {
      HStack { Spacer(); bestLabel("BEST \(s.best)", tok.accent) }
      HStack(alignment: .firstTextBaseline, spacing: 6) {
        Text("\(s.days)").font(BarakahFont.serif(54)).foregroundColor(tok.ink)
        Text("days").font(BarakahFont.serif(12)).italic().foregroundColor(tok.muted)
      }
      .padding(.top, 4)
      Spacer(minLength: 0)
    }
    .frame(maxWidth: .infinity, alignment: .leading)
    .background { Constellation(history: s.history, accent: gold) }
  }

  // MARK: arch

  private func stArch(_ tok: DirectionTokens, _ s: WidgetSnapshot.Streak) -> some View {
    VStack(alignment: .leading, spacing: 0) {
      HStack(alignment: .firstTextBaseline, spacing: 6) {
        Text("\(s.days)").font(BarakahFont.serif(50)).foregroundColor(tok.ink)
        Text("days").font(BarakahFont.serif(11)).italic().foregroundColor(tok.muted)
      }
      .padding(.top, 4)
      Spacer(minLength: 0)
      PrayerDoneRow(done: s.todayDone, accent: tok.accent, label: tok.muted, border: tok.hairline, compact: true)
      Text("Best \(s.best) days.").font(BarakahFont.serif(10)).italic().foregroundColor(tok.muted).padding(.top, 4)
    }
    .padding(.trailing, 28)
    .overlay(alignment: .trailing) { NotchColumn(days: s.days, accent: tok.accent) }
  }

  // MARK: celestial

  private func stCelestial(_ tok: DirectionTokens, _ s: WidgetSnapshot.Streak) -> some View {
    let gold = Color(hex: 0xE4C168)
    return VStack(alignment: .leading, spacing: 0) {
      HStack { Spacer(); Text("↑ \(s.best)").font(BarakahFont.sans(9, weight: .bold)).foregroundColor(Color(r: 245, g: 235, b: 219, o: 0.6)) }
      Spacer(minLength: 0)
      HStack(alignment: .firstTextBaseline, spacing: 6) {
        Text("\(s.days)").font(BarakahFont.serif(44)).foregroundColor(Color(hex: 0xF5EBDB))
        Text("days").font(BarakahFont.serif(11)).italic().foregroundColor(tok.muted)
      }
      Text("spiralling outward").font(BarakahFont.serif(9.5)).italic().foregroundColor(tok.muted)
    }
    .frame(maxWidth: .infinity, alignment: .leading)
    .background { Spiral(days: s.days, accent: gold) }
  }

  private func bestLabel(_ text: String, _ color: Color) -> some View {
    Text(text).font(BarakahFont.sans(9, weight: .bold)).tracking(0.7).foregroundColor(color)
  }
}

// MARK: - Prayer-done row

@available(iOS 17.0, *)
struct PrayerDoneRow: View {
  let done: Int
  let accent: Color
  let label: Color
  let border: Color
  var dark = false
  var compact = false

  var body: some View {
    let size: CGFloat = compact ? 5 : 6
    HStack {
      Text("TODAY \(done)/5").font(BarakahFont.sans(8.5, weight: .bold)).tracking(0.7).foregroundColor(label)
      Spacer()
      HStack(spacing: 3) {
        ForEach(0..<5, id: \.self) { i in
          Circle()
            .fill(i < done ? accent : Color.clear)
            .overlay { if i >= done { Circle().strokeBorder(border, lineWidth: 1) } }
            .frame(width: size, height: size)
        }
      }
    }
  }
}

// MARK: - Constellation (night)

@available(iOS 17.0, *)
private struct Constellation: View {
  let history: [Int]
  let accent: Color

  var body: some View {
    Canvas { ctx, size in
      let cream = Color(r: 245, g: 235, b: 219, o: 1)
      var s: UInt64 = 11
      var pts: [CGPoint] = []
      for _ in 0..<28 {
        s = (s &* 9301 &+ 49297) % 233280
        let x = 18 + Double(s) / 233280 * (Double(size.width) - 30)
        s = (s &* 9301 &+ 49297) % 233280
        let y = Double(size.height) * 0.5 + Double(s) / 233280 * (Double(size.height) * 0.45)
        pts.append(CGPoint(x: x, y: y))
      }
      for i in 0..<(pts.count - 1) where i < history.count - 1 {
        if history[i] == 1 && history[i + 1] == 1 {
          var line = Path()
          line.move(to: pts[i]); line.addLine(to: pts[i + 1])
          ctx.stroke(line, with: .color(accent.opacity(0.2)), lineWidth: 0.6)
        }
      }
      for (i, p) in pts.enumerated() {
        let h = i < history.count && history[i] == 1
        let isToday = i == history.count - 1
        let r: CGFloat = isToday ? 2.4 : (h ? 1.6 : 1)
        let color = isToday ? accent : (h ? cream.opacity(0.85) : cream.opacity(0.18))
        ctx.fill(Path(ellipseIn: CGRect(x: p.x - r, y: p.y - r, width: r * 2, height: r * 2)), with: .color(color))
      }
    }
  }
}

// MARK: - Notch column (arch)

@available(iOS 17.0, *)
private struct NotchColumn: View {
  let days: Int
  let accent: Color

  var body: some View {
    Canvas { ctx, size in
      let w = size.width, h = size.height
      let cx = w - 14
      ctx.fill(Path(CGRect(x: cx - 4, y: 8, width: 20, height: 4)), with: .color(accent.opacity(0.4)))
      ctx.stroke(Path(CGRect(x: cx, y: 16, width: 12, height: h - 24)), with: .color(accent.opacity(0.4)), lineWidth: 1)
      let notches = min(12, days / 4)
      for i in 0..<notches {
        let y = h - 16 - CGFloat(i) * 10
        var line = Path()
        line.move(to: CGPoint(x: cx, y: y)); line.addLine(to: CGPoint(x: cx + 12, y: y))
        ctx.stroke(line, with: .color(accent.opacity(0.45)), lineWidth: 1)
      }
    }
    .frame(width: 28)
  }
}

// MARK: - Spiral (celestial)

@available(iOS 17.0, *)
private struct Spiral: View {
  let days: Int
  let accent: Color

  var body: some View {
    Canvas { ctx, size in
      let cx = size.width / 2, cy = size.height / 2
      let a = 4.0, b = 1.4
      for i in 0..<days {
        let theta = Double(i) * 0.55
        let r = a + b * theta
        let x = cx + r * cos(theta)
        let y = cy + r * sin(theta)
        let op = 0.3 + Double(i) / Double(max(1, days)) * 0.65
        ctx.fill(Path(ellipseIn: CGRect(x: x - 1.4, y: y - 1.4, width: 2.8, height: 2.8)), with: .color(accent.opacity(op)))
      }
    }
  }
}
