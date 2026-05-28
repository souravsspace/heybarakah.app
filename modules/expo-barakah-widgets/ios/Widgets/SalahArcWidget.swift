import SwiftUI
import WidgetKit

@available(iOS 17.0, *)
struct SalahArcWidget: Widget {
  var body: some WidgetConfiguration {
    AppIntentConfiguration(
      kind: "barakah.salah",
      intent: SalahArcConfigIntent.self,
      provider: BarakahProvider<SalahArcConfigIntent>()
    ) { entry in
      SalahArcView(entry: entry)
    }
    .configurationDisplayName("Salah Arc")
    .description("Your next prayer at a glance.")
    .supportedFamilies([.systemMedium])
  }
}

@available(iOS 17.0, *)
struct SalahArcView: View {
  let entry: BarakahEntry
  @Environment(\.colorScheme) private var scheme

  var body: some View {
    let dir = entry.direction
    let tok = dir.tokens(scheme)
    let state = PrayerState.from(entry.snapshot ?? SamplePayload.snapshot)
    let hijri = Hijri.dateString()

    Group {
      switch dir {
      case .editorial: saEditorial(tok, state, hijri)
      case .bold: saBold(state, hijri)
      case .dawn: saDawn(tok, state, hijri)
      case .night: saNight(tok, state, hijri)
      case .arch: saArch(tok, state, hijri)
      case .celestial: saCelestial(tok, state, hijri)
      }
    }
    .glassShell(dir, size: .medium)
  }

  // MARK: editorial

  private func saEditorial(_ tok: DirectionTokens, _ s: PrayerState, _ hijri: String) -> some View {
    VStack(alignment: .leading, spacing: 2) {
      HStack(alignment: .top) {
        Eyebrow(text: s.isLocked ? "Quiet now" : "Next", lead: true, color: tok.muted, accent: tok.accent)
        Spacer()
        Text(s.display.arabic).font(BarakahFont.serif(18)).foregroundColor(tok.ink.opacity(0.72))
      }
      HStack(alignment: .firstTextBaseline, spacing: 10) {
        Text(s.display.title).font(BarakahFont.serif(30)).foregroundColor(tok.ink)
        Text(s.isLocked ? "\(s.countdownText) left" : "in \(s.countdownText)")
          .font(BarakahFont.serif(16)).italic().foregroundColor(tok.muted)
      }
      .padding(.top, 4)
      HStack {
        Text("\(s.timeText) · Mecca").font(BarakahFont.mono(10.5)).foregroundColor(tok.muted)
        Spacer()
        Text(hijri.uppercased()).font(BarakahFont.sans(9.5, weight: .bold)).tracking(1.3).foregroundColor(tok.muted)
      }
      Spacer(minLength: 0)
      SalahRail(points: s.points, tok: tok, currentGlow: tok.accent)
    }
  }

  // MARK: bold

  private func saBold(_ s: PrayerState, _ hijri: String) -> some View {
    let cream = Color(hex: 0xF5EBDB)
    let gold = Color(hex: 0xE4C168)
    return VStack(alignment: .leading, spacing: 2) {
      HStack(alignment: .top) {
        Eyebrow(text: s.isLocked ? "Quiet now" : "Next prayer", lead: true, color: cream.opacity(0.62), accent: cream.opacity(0.62))
        Spacer()
        Text(s.display.arabic).font(BarakahFont.serif(20)).foregroundColor(cream)
      }
      HStack(alignment: .firstTextBaseline, spacing: 10) {
        Text(s.display.title).font(BarakahFont.serif(32)).foregroundColor(cream)
        Text(s.isLocked ? "\(s.countdownText) left" : "in \(s.countdownText)")
          .font(BarakahFont.serif(14)).italic().foregroundColor(gold)
      }
      .padding(.top, 4)
      Text("\(s.timeText) · \(hijri)").font(BarakahFont.mono(11)).foregroundColor(cream.opacity(0.65))
      Spacer(minLength: 0)
      HStack(spacing: 6) {
        ForEach(s.points) { p in
          VStack(spacing: 4) {
            Circle()
              .fill(p.isCurrent ? gold : (p.isPast ? cream : Color.clear))
              .frame(width: p.isCurrent ? 10 : 4, height: p.isCurrent ? 10 : 4)
              .overlay {
                if p.isUpcoming {
                  Circle().strokeBorder(cream.opacity(0.32), lineWidth: 1).frame(width: 4, height: 4)
                }
              }
              .shadow(color: p.isCurrent ? gold.opacity(0.6) : .clear, radius: 6)
              .frame(width: 10, height: 10)
            Text(p.info.letter).font(BarakahFont.sans(9, weight: .bold)).tracking(1.1)
              .foregroundColor(p.isCurrent ? gold : cream.opacity(0.5))
          }
          .frame(maxWidth: .infinity)
        }
      }
    }
  }

  // MARK: dawn

  private func saDawn(_ tok: DirectionTokens, _ s: PrayerState, _ hijri: String) -> some View {
    HStack(spacing: 14) {
      VStack(alignment: .leading, spacing: 0) {
        Eyebrow(text: s.isLocked ? "Quiet now" : "Next", lead: true, color: tok.muted, accent: tok.accent)
        Text(s.display.title).font(BarakahFont.serif(28)).foregroundColor(tok.ink).padding(.top, 4)
        Text(s.display.arabic).font(BarakahFont.serif(14)).foregroundColor(tok.muted).padding(.top, 4)
        Spacer(minLength: 0)
        Text("in \(s.countdownText)").font(BarakahFont.serif(13)).italic().foregroundColor(tok.ink)
        Text("\(s.timeText) · \(hijri)").font(BarakahFont.mono(10)).foregroundColor(tok.muted)
      }
      .frame(maxWidth: .infinity, alignment: .leading)
      Rectangle().fill(tok.hairline).frame(width: 1)
      VStack(spacing: 0) {
        ForEach(s.points) { p in
          HStack(spacing: 8) {
            Circle()
              .fill(p.isCurrent ? tok.accent : (p.isPast ? tok.ink : Color.clear))
              .frame(width: p.isCurrent ? 10 : 5, height: p.isCurrent ? 10 : 5)
              .overlay {
                if p.isUpcoming {
                  Circle().strokeBorder(tok.muted, lineWidth: 1).frame(width: 5, height: 5)
                }
              }
            Text(p.info.title)
              .font(BarakahFont.sans(10.5, weight: p.isCurrent ? .bold : .medium))
              .foregroundColor(p.isCurrent ? tok.accent : tok.ink)
            Spacer()
            Text(formatHM(minuteOfDay: minute(p.adhan))).font(BarakahFont.mono(9.5)).foregroundColor(tok.muted)
          }
          .opacity(p.isUpcoming ? 0.55 : 1)
          .frame(maxHeight: .infinity)
        }
      }
      .frame(maxWidth: .infinity)
    }
  }

  // MARK: night

  private func saNight(_ tok: DirectionTokens, _ s: PrayerState, _ hijri: String) -> some View {
    VStack(alignment: .leading, spacing: 4) {
      Eyebrow(text: s.isLocked ? "In progress" : "Next", lead: true, color: tok.muted, accent: tok.accent)
      HStack(alignment: .bottom, spacing: 12) {
        Text(s.display.title).font(BarakahFont.serif(34)).foregroundColor(tok.ink)
        Text("in \(s.countdownText)").font(BarakahFont.serif(16)).italic().foregroundColor(tok.accent).padding(.bottom, 3)
      }
      HStack {
        Text("\(s.display.arabic) · \(s.timeText)").font(BarakahFont.serif(13)).foregroundColor(tok.muted)
        Spacer()
        Text(hijri.uppercased()).font(BarakahFont.sans(9, weight: .bold)).tracking(1.3).foregroundColor(tok.muted)
      }
      Spacer(minLength: 0)
      SalahRail(points: s.points, tok: tok, currentGlow: tok.accent, fullWidth: true)
    }
  }

  // MARK: arch

  private func saArch(_ tok: DirectionTokens, _ s: PrayerState, _ hijri: String) -> some View {
    ZStack(alignment: .topLeading) {
      ArchShape().stroke(tok.accent.opacity(0.42), lineWidth: 1)
        .frame(width: 90).frame(maxWidth: .infinity, alignment: .trailing).padding(.top, 4)
      VStack(alignment: .leading, spacing: 2) {
        Eyebrow(text: s.isLocked ? "Quiet now" : "Next", lead: true, color: tok.muted, accent: tok.accent)
        Text(s.display.title).font(BarakahFont.serif(28)).foregroundColor(tok.ink).padding(.top, 4)
        Text(s.display.arabic).font(BarakahFont.serif(13)).foregroundColor(tok.muted)
        Text("\(s.timeText) · in \(s.countdownText)").font(BarakahFont.mono(10.5)).foregroundColor(tok.muted).padding(.top, 2)
        Spacer(minLength: 0)
        HStack(alignment: .bottom, spacing: 5) {
          ForEach(s.points) { p in
            VStack(spacing: 3) {
              Spacer(minLength: 0)
              RoundedRectangle(cornerRadius: 2)
                .fill(p.isCurrent ? tok.accent : (p.isPast ? tok.ink.opacity(0.5) : Color.clear))
                .overlay {
                  if p.isUpcoming { RoundedRectangle(cornerRadius: 2).strokeBorder(tok.hairline, lineWidth: 1) }
                }
                .frame(width: 3, height: p.isCurrent ? 22 : (p.isPast ? 6 : 14))
              Text(p.info.letter).font(BarakahFont.sans(8, weight: .bold)).tracking(1)
                .foregroundColor(p.isCurrent ? tok.accent : tok.muted)
            }
            .frame(maxWidth: .infinity)
          }
        }
        .frame(height: 26)
      }
    }
  }

  // MARK: celestial

  private func saCelestial(_ tok: DirectionTokens, _ s: PrayerState, _ hijri: String) -> some View {
    let sky = Celestial.tone(nowMinutes())
    return VStack(alignment: .leading, spacing: 2) {
      HStack(alignment: .top) {
        Eyebrow(text: s.isLocked ? "Quiet now" : "Next", lead: true, color: tok.muted, accent: tok.accent)
        Spacer()
        Text("\(formatHM(minuteOfDay: nowMinutes())) · \(hijri)").font(BarakahFont.mono(10.5)).foregroundColor(tok.muted)
      }
      Text(s.display.title).font(BarakahFont.serif(28)).foregroundColor(tok.ink).padding(.top, 2)
      Text(s.isLocked ? "ends in \(s.countdownText)" : "in \(s.countdownText) · \(s.timeText)")
        .font(BarakahFont.serif(12)).italic().foregroundColor(tok.muted)
      Spacer(minLength: 0)
      CelestialArc(points: s.points, sky: sky, ink: tok.ink).frame(height: 44)
    }
  }

  private func minute(_ date: Date) -> Int {
    let c = Calendar.current.dateComponents([.hour, .minute], from: date)
    return (c.hour ?? 0) * 60 + (c.minute ?? 0)
  }
}

// MARK: - Rail

@available(iOS 17.0, *)
private struct SalahRail: View {
  let points: [RailPoint]
  let tok: DirectionTokens
  let currentGlow: Color
  var fullWidth = false

  var body: some View {
    GeometryReader { geo in
      let w = geo.size.width
      ZStack(alignment: .topLeading) {
        Rectangle().fill(tok.hairline).frame(width: w, height: 1).position(x: w / 2, y: 6)
        ForEach(points) { p in
          let x = (fullWidth ? p.pct : 0.04 + p.pct * 0.92) * w
          dot(p).position(x: x, y: 6)
          if !fullWidth {
            Text(p.info.letter)
              .font(BarakahFont.sans(8, weight: .bold)).tracking(1)
              .foregroundColor(p.isCurrent ? tok.accent : tok.muted)
              .position(x: x, y: 22)
          }
        }
      }
    }
    .frame(height: fullWidth ? 14 : 28)
  }

  @ViewBuilder
  private func dot(_ p: RailPoint) -> some View {
    if p.isCurrent {
      Circle().fill(tok.accent)
        .frame(width: fullWidth ? 9 : 12, height: fullWidth ? 9 : 12)
        .shadow(color: currentGlow.opacity(0.7), radius: 7)
    } else if p.isPast {
      Circle().fill(tok.ink.opacity(0.5)).frame(width: 4, height: 4)
    } else {
      Circle().strokeBorder(tok.hairline, lineWidth: 1).frame(width: 6, height: 6)
    }
  }
}

// MARK: - Arch shape (pointed mihrab)

struct ArchShape: Shape {
  func path(in rect: CGRect) -> Path {
    var p = Path()
    let w = rect.width, h = rect.height
    let shoulder = h * 0.4
    p.move(to: CGPoint(x: 0, y: h))
    p.addLine(to: CGPoint(x: 0, y: shoulder))
    p.addQuadCurve(to: CGPoint(x: w / 2, y: 0), control: CGPoint(x: 0, y: 0))
    p.addQuadCurve(to: CGPoint(x: w, y: shoulder), control: CGPoint(x: w, y: 0))
    p.addLine(to: CGPoint(x: w, y: h))
    return p
  }
}

// MARK: - Celestial arc

@available(iOS 17.0, *)
private struct CelestialArc: View {
  let points: [RailPoint]
  let sky: SkyTone
  let ink: Color

  var body: some View {
    GeometryReader { geo in
      let w = geo.size.width
      let h = geo.size.height
      let cream = Color(r: 245, g: 235, b: 219, o: 1)
      ZStack(alignment: .topLeading) {
        ArcPath().stroke(cream.opacity(0.22), style: StrokeStyle(lineWidth: 1, dash: [2, 3]))
        ForEach(points) { p in
          let x = p.pct * w
          let y = h - sin(p.pct * .pi) * h * 0.85
          Circle()
            .fill(p.isPast ? cream.opacity(0.5) : (p.isCurrent ? sky.sun : cream.opacity(0.35)))
            .frame(width: p.isCurrent ? 8 : 4.4, height: p.isCurrent ? 8 : 4.4)
            .position(x: x, y: y)
        }
        let t = sunT
        let sx = t * w
        let sy = h - sin(t * .pi) * h * 0.85
        Circle().fill(sky.sun).frame(width: 13, height: 13)
          .shadow(color: sky.sun.opacity(0.8), radius: 8)
          .position(x: sx, y: sy)
      }
    }
  }

  private var sunT: Double {
    let start = 4 * 60 + 30
    let end = 23 * 60
    return max(0, min(1, Double(nowMinutes() - start) / Double(end - start)))
  }
}

private struct ArcPath: Shape {
  func path(in rect: CGRect) -> Path {
    var p = Path()
    p.move(to: CGPoint(x: 0, y: rect.height))
    p.addQuadCurve(
      to: CGPoint(x: rect.width, y: rect.height),
      control: CGPoint(x: rect.width / 2, y: -rect.height * 0.7))
    return p
  }
}
