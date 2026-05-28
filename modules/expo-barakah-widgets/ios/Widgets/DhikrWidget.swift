import SwiftUI
import WidgetKit

@available(iOS 17.0, *)
struct DhikrWidget: Widget {
  var body: some WidgetConfiguration {
    AppIntentConfiguration(
      kind: "barakah.dhikr",
      intent: DhikrConfigIntent.self,
      provider: BarakahProvider<DhikrConfigIntent>()
    ) { entry in
      DhikrView(entry: entry)
    }
    .configurationDisplayName("Dhikr")
    .description("Tap to count. Remember Allah.")
    .supportedFamilies([.systemSmall])
  }
}

private struct DhikrCycle {
  static let arabic = ["سبحان الله", "الحمد لله", "الله أكبر"]
  static let mashaAllah = "ما شاء الله"
}

@available(iOS 17.0, *)
struct DhikrView: View {
  let entry: BarakahEntry
  @Environment(\.colorScheme) private var scheme

  var body: some View {
    let dir = entry.direction
    let tok = dir.tokens(scheme)
    let snap = entry.snapshot ?? SamplePayload.snapshot
    let count = snap.dhikr.count
    let target = max(1, snap.dhikr.target)
    let complete = count >= target
    let cycleIndex = max(0, (count - 1) / target) % DhikrCycle.arabic.count
    let arabic = complete ? DhikrCycle.mashaAllah : DhikrCycle.arabic[cycleIndex]
    let sessionTotal = snap.dhikr.sessionTotal

    Button(intent: IncrementDhikrIntent()) {
      Group {
        switch dir {
        case .editorial: dhEditorial(tok, count, target, arabic, sessionTotal, complete)
        case .bold: dhBold(count, target, arabic, sessionTotal, complete)
        case .dawn: dhDawn(tok, count, target, arabic, complete)
        case .night: dhNight(tok, count, target, arabic, complete, cycleIndex)
        case .arch: dhArch(tok, count, target, arabic)
        case .celestial: dhCelestial(tok, count, target, arabic, sessionTotal)
        }
      }
      .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
    .buttonStyle(.plain)
    .glassShell(dir, size: .small)
  }

  // MARK: editorial

  private func dhEditorial(_ tok: DirectionTokens, _ count: Int, _ target: Int, _ ar: String, _ total: Int, _ complete: Bool) -> some View {
    VStack(spacing: 2) {
      HStack { Spacer(); Text("\(count)/\(target)").font(BarakahFont.mono(10)).foregroundColor(tok.muted) }
      ZStack {
        BeadRing(count: count, target: target, accent: tok.accent, hairline: tok.hairline)
        Text("\(count)").font(BarakahFont.serif(40)).foregroundColor(tok.ink)
      }
      .frame(maxHeight: .infinity)
      Text(ar).font(BarakahFont.serif(13)).foregroundColor(tok.ink)
      HStack {
        Text("\(total) today").font(BarakahFont.sans(9)).foregroundColor(tok.muted)
        Spacer()
        Text(complete ? "Reset" : "Tap").font(BarakahFont.sans(9, weight: .bold)).foregroundColor(tok.accent)
      }
    }
  }

  // MARK: bold

  private func dhBold(_ count: Int, _ target: Int, _ ar: String, _ total: Int, _ complete: Bool) -> some View {
    let cream = Color(hex: 0xF5EBDB)
    let gold = Color(hex: 0xE4C168)
    return VStack(spacing: 2) {
      HStack { Spacer(); Text("\(total)").font(BarakahFont.mono(10)).foregroundColor(cream.opacity(0.5)) }
      VStack(spacing: 4) {
        Text("\(count)").font(BarakahFont.serif(56)).foregroundColor(cream)
        Text(ar).font(BarakahFont.serif(12)).foregroundColor(gold)
      }
      .frame(maxHeight: .infinity)
      GeometryReader { geo in
        ZStack(alignment: .leading) {
          Capsule().fill(cream.opacity(0.12))
          Capsule().fill(LinearGradient(colors: [gold, Color(hex: 0xC9A23A)], startPoint: .leading, endPoint: .trailing))
            .frame(width: geo.size.width * CGFloat(min(count, target)) / CGFloat(target))
        }
      }
      .frame(height: 5)
      Text(complete ? "Reset" : "\(target - count) left")
        .font(BarakahFont.sans(9)).foregroundColor(cream.opacity(0.5))
        .frame(maxWidth: .infinity, alignment: .trailing)
    }
  }

  // MARK: dawn

  private func dhDawn(_ tok: DirectionTokens, _ count: Int, _ target: Int, _ ar: String, _ complete: Bool) -> some View {
    VStack(spacing: 2) {
      HStack { Spacer(); Text("\(count)/\(target)").font(BarakahFont.mono(10)).foregroundColor(tok.muted) }
      ZStack {
        Circle().fill(RadialGradient(colors: [tok.accent.opacity(0.3), .clear], center: .center, startRadius: 0, endRadius: 48))
          .frame(width: 96, height: 96).blur(radius: 2)
        BeadRing(count: count, target: target, accent: tok.accent, hairline: tok.hairline)
        Text("\(count)").font(BarakahFont.serif(42)).foregroundColor(tok.ink)
      }
      .frame(maxHeight: .infinity)
      Text(ar).font(BarakahFont.serif(13)).foregroundColor(tok.ink)
      HStack {
        Text(complete ? "Mashā Allāh" : "of \(target)").font(BarakahFont.serif(9.5)).italic().foregroundColor(tok.muted)
        Spacer()
        Text("+1").font(BarakahFont.sans(9, weight: .bold)).foregroundColor(tok.accent)
      }
    }
  }

  // MARK: night

  private func dhNight(_ tok: DirectionTokens, _ count: Int, _ target: Int, _ ar: String, _ complete: Bool, _ idx: Int) -> some View {
    let tr = ["subḥānAllāh", "alḥamdulillāh", "Allāhu akbar"][idx]
    return VStack(spacing: 2) {
      HStack { Spacer(); Text("\(count)/\(target)").font(BarakahFont.mono(10)).foregroundColor(tok.muted) }
      ZStack {
        Circle().strokeBorder(Color(hex: 0xE4C168).opacity(0.32), lineWidth: 1).frame(width: 92, height: 92)
        BeadRing(count: count, target: target, accent: tok.accent, hairline: Color(r: 245, g: 235, b: 219, o: 0.18))
        Text("\(count)").font(BarakahFont.serif(44)).foregroundColor(tok.ink)
      }
      .frame(maxHeight: .infinity)
      Text(ar).font(BarakahFont.serif(13)).foregroundColor(tok.accent)
      Text(complete ? "Mashā Allāh" : tr).font(BarakahFont.serif(10)).italic().foregroundColor(tok.muted)
    }
  }

  // MARK: arch

  private func dhArch(_ tok: DirectionTokens, _ count: Int, _ target: Int, _ ar: String) -> some View {
    VStack(spacing: 2) {
      Spacer(minLength: 0)
      Text("\(count)").font(BarakahFont.serif(46)).foregroundColor(tok.ink)
      Text(ar).font(BarakahFont.serif(13)).foregroundColor(tok.muted)
      Spacer(minLength: 0)
      HStack(spacing: 3) {
        ForEach(0..<11, id: \.self) { i in
          let filled = i < Int((Double(count) / Double(target) * 11).rounded())
          Circle()
            .fill(filled ? tok.accent : Color.clear)
            .overlay { if !filled { Circle().strokeBorder(tok.hairline, lineWidth: 1) } }
            .frame(width: 6, height: 6)
        }
      }
    }
    .overlay(alignment: .top) {
      ArchShape().stroke(tok.accent.opacity(0.34), lineWidth: 1).padding(.horizontal, 20)
    }
  }

  // MARK: celestial

  private func dhCelestial(_ tok: DirectionTokens, _ count: Int, _ target: Int, _ ar: String, _ total: Int) -> some View {
    let gold = Color(hex: 0xE4C168)
    return VStack(alignment: .leading, spacing: 2) {
      HStack { Spacer(); Text("\(count)/\(target)").font(BarakahFont.mono(9.5)).foregroundColor(tok.muted) }
      Spacer(minLength: 0)
      Text("\(count)").font(BarakahFont.serif(40)).foregroundColor(Color(hex: 0xF5EBDB))
      Text(ar).font(BarakahFont.serif(12)).foregroundColor(tok.ink)
      Text("\(total) today").font(BarakahFont.serif(9.5)).italic().foregroundColor(tok.muted)
    }
    .frame(maxWidth: .infinity, alignment: .leading)
    .background(alignment: .topTrailing) {
      StarField(count: count, target: target, accent: gold)
    }
  }
}

// MARK: - Bead ring

@available(iOS 17.0, *)
private struct BeadRing: View {
  let count: Int
  let target: Int
  let accent: Color
  let hairline: Color
  var beadCount = 9

  var body: some View {
    let filled = min(beadCount, Int((Double(count) / Double(target) * Double(beadCount)).rounded(.up)))
    Canvas { ctx, size in
      let radius = min(size.width, size.height) / 2 - 6
      let cx = size.width / 2, cy = size.height / 2
      for i in 0..<beadCount {
        let angle = Double(i) / Double(beadCount) * 2 * .pi - .pi / 2
        let x = cx + cos(angle) * radius
        let y = cy + sin(angle) * radius
        let rect = CGRect(x: x - 3.5, y: y - 3.5, width: 7, height: 7)
        if i < filled {
          ctx.fill(Path(ellipseIn: rect), with: .color(accent))
        } else {
          ctx.stroke(Path(ellipseIn: rect), with: .color(hairline), lineWidth: 1)
        }
      }
    }
    .frame(width: 112, height: 112)
  }
}

// MARK: - Star field (celestial)

@available(iOS 17.0, *)
private struct StarField: View {
  let count: Int
  let target: Int
  let accent: Color

  var body: some View {
    Canvas { ctx, size in
      var s: UInt64 = 7
      let cream = Color(r: 245, g: 235, b: 219, o: 1)
      for i in 0..<target {
        s = (s &* 9301 &+ 49297) % 233280
        let x = (14 + Double(s) / 233280 * (Double(size.width) - 28))
        s = (s &* 9301 &+ 49297) % 233280
        let y = (10 + Double(s) / 233280 * (Double(size.height) - 20))
        s = (s &* 9301 &+ 49297) % 233280
        let r = 0.8 + Double(s) / 233280 * 1.8
        let rect = CGRect(x: x - r, y: y - r, width: r * 2, height: r * 2)
        let color = i < count ? accent.opacity(0.95) : cream.opacity(0.2)
        ctx.fill(Path(ellipseIn: rect), with: .color(color))
      }
    }
  }
}
