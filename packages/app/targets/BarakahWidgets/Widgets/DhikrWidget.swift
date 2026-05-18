import SwiftUI
import WidgetKit

struct DhikrWidget: Widget {
  let kind = "barakah.dhikr"

  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: BarakahProvider()) { entry in
      DhikrView(entry: entry)
        .containerBackground(BarakahColor.canvas, for: .widget)
    }
    .configurationDisplayName("Dhikr")
    .description("A quiet tasbih. Tap a bead to count one.")
    .supportedFamilies([.systemSmall])
  }
}

private struct DhikrView: View {
  let entry: BarakahEntry

  private static let beadCount = 9

  var body: some View {
    VStack(alignment: .leading, spacing: 6) {
      HStack(alignment: .firstTextBaseline) {
        Text("Dhikr".uppercased())
          .font(BarakahFont.sans(size: 9, weight: .semibold))
          .tracking(1.2)
          .foregroundStyle(BarakahColor.muted)
        Spacer()
        Text("\(target)")
          .font(BarakahFont.mono(size: 10))
          .foregroundStyle(BarakahColor.muted)
      }
      Spacer(minLength: 4)
      ZStack {
        beadRing
        VStack(spacing: 0) {
          Text("\(count)")
            .font(BarakahFont.serif(size: 36))
            .foregroundStyle(BarakahColor.ink)
            .minimumScaleFactor(0.6)
            .lineLimit(1)
          Text("today")
            .font(BarakahFont.sans(size: 9, weight: .medium))
            .foregroundStyle(BarakahColor.muted)
        }
      }
      .frame(maxWidth: .infinity, maxHeight: .infinity)
      Button(intent: IncrementDhikrIntent()) {
        Text("Tap to count")
          .font(BarakahFont.sans(size: 10, weight: .semibold))
          .tracking(0.6)
          .foregroundStyle(BarakahColor.green)
          .frame(maxWidth: .infinity, alignment: .leading)
      }
      .buttonStyle(.plain)
    }
  }

  private var snapshot: WidgetSnapshot? { entry.snapshot }
  private var count: Int { snapshot?.dhikr.count ?? 0 }
  private var target: Int { snapshot?.dhikr.target ?? 33 }

  private var beadRing: some View {
    GeometryReader { geo in
      let side = min(geo.size.width, geo.size.height)
      let radius = side / 2 - 6
      let center = CGPoint(x: geo.size.width / 2, y: geo.size.height / 2)
      let filled = min(Self.beadCount, Int(round(Double(count % target) / Double(max(target, 1)) * Double(Self.beadCount))))
      ForEach(0..<Self.beadCount, id: \.self) { i in
        let angle = Double(i) / Double(Self.beadCount) * 2 * .pi - .pi / 2
        let x = center.x + radius * CGFloat(cos(angle))
        let y = center.y + radius * CGFloat(sin(angle))
        bead(filled: i < filled)
          .position(x: x, y: y)
      }
    }
  }

  private func bead(filled: Bool) -> some View {
    Group {
      if filled {
        Circle().fill(BarakahColor.green)
      } else {
        Circle().stroke(BarakahColor.ink.opacity(0.35), lineWidth: 1)
      }
    }
    .frame(width: 6, height: 6)
  }
}
