import SwiftUI
import WidgetKit

@available(iOS 17.0, *)
struct AyahWidget: Widget {
  var body: some WidgetConfiguration {
    AppIntentConfiguration(
      kind: "barakah.ayah",
      intent: AyahConfigIntent.self,
      provider: BarakahProvider<AyahConfigIntent>()
    ) { entry in
      AyahView(entry: entry)
    }
    .configurationDisplayName("Ayah of the day")
    .description("One verse, quietly placed.")
    .supportedFamilies([.systemLarge])
  }
}

@available(iOS 17.0, *)
struct AyahView: View {
  let entry: BarakahEntry
  @Environment(\.colorScheme) private var scheme

  var body: some View {
    let dir = entry.direction == .night ? Direction.night : .dawn
    let tok = dir.tokens(scheme)
    let a = (entry.snapshot ?? SamplePayload.snapshot).ayah
    let ref = a.reference.replacingOccurrences(of: ":", with: " : ")

    Group {
      if dir == .night {
        ayNight(tok, a, ref)
      } else {
        ayDawn(tok, a, ref)
      }
    }
    .glassShell(dir, size: .large)
  }

  private func ayDawn(_ tok: DirectionTokens, _ a: WidgetSnapshot.Ayah, _ ref: String) -> some View {
    VStack(alignment: .leading, spacing: 14) {
      HStack {
        Eyebrow(text: "Ayah of the day", lead: true, color: tok.muted, accent: tok.accent)
        Spacer()
        PlayGlyph(color: tok.accent)
      }
      Text(a.arabic).font(BarakahFont.arabic(24)).foregroundColor(tok.ink)
        .multilineTextAlignment(.trailing).frame(maxWidth: .infinity, alignment: .trailing)
        .environment(\.layoutDirection, .rightToLeft).lineSpacing(8)
      Hairline(color: tok.hairline)
      Text("“\(a.translation)”").font(BarakahFont.serif(14.5)).italic().foregroundColor(tok.ink).lineSpacing(4)
      Spacer(minLength: 0)
      HStack {
        Text(a.surah.uppercased()).font(BarakahFont.sans(10, weight: .bold)).tracking(1.4).foregroundColor(tok.accent)
        Spacer()
        Text(ref).font(BarakahFont.mono(10.5)).foregroundColor(tok.muted)
      }
    }
  }

  private func ayNight(_ tok: DirectionTokens, _ a: WidgetSnapshot.Ayah, _ ref: String) -> some View {
    VStack(alignment: .leading, spacing: 16) {
      HStack {
        Eyebrow(text: "Ayah · \(ref)", lead: true, color: tok.muted, accent: tok.accent)
        Spacer()
        PlayGlyph(color: tok.accent)
      }
      Text(a.arabic).font(BarakahFont.arabic(26)).foregroundColor(tok.ink)
        .multilineTextAlignment(.trailing).frame(maxWidth: .infinity, alignment: .trailing)
        .environment(\.layoutDirection, .rightToLeft).lineSpacing(9)
      LinearGradient(colors: [.clear, tok.accent, .clear], startPoint: .leading, endPoint: .trailing)
        .frame(height: 1).opacity(0.6)
      Text("“\(a.translation)”").font(BarakahFont.serif(15.5)).italic().foregroundColor(tok.ink.opacity(0.82)).lineSpacing(5)
      Spacer(minLength: 0)
      Text(a.surah).font(BarakahFont.serif(13)).italic().foregroundColor(tok.accent)
        .frame(maxWidth: .infinity, alignment: .trailing)
    }
  }
}

@available(iOS 17.0, *)
struct PlayGlyph: View {
  var color: Color
  var size: CGFloat = 14

  var body: some View {
    Canvas { ctx, _ in
      let s = size
      ctx.stroke(
        Path(ellipseIn: CGRect(x: 0.5, y: 0.5, width: s - 1, height: s - 1)),
        with: .color(color.opacity(0.5)), lineWidth: 1)
      var tri = Path()
      tri.move(to: CGPoint(x: s * 0.38, y: s * 0.31))
      tri.addLine(to: CGPoint(x: s * 0.69, y: s * 0.5))
      tri.addLine(to: CGPoint(x: s * 0.38, y: s * 0.69))
      tri.closeSubpath()
      ctx.fill(tri, with: .color(color))
    }
    .frame(width: size, height: size)
  }
}
