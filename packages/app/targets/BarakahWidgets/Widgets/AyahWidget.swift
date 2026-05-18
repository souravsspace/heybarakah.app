import SwiftUI
import WidgetKit

struct AyahWidget: Widget {
  let kind = "barakah.ayah"

  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: BarakahProvider()) { entry in
      AyahView(entry: entry)
        .containerBackground(BarakahColor.canvas, for: .widget)
    }
    .configurationDisplayName("Ayah of the day")
    .description("One verse, quietly placed.")
    .supportedFamilies([.systemLarge])
  }
}

private struct AyahView: View {
  let entry: BarakahEntry

  var body: some View {
    VStack(alignment: .leading, spacing: 16) {
      Text("Ayah of the day".uppercased())
        .font(BarakahFont.sans(size: 9, weight: .semibold))
        .tracking(1.4)
        .foregroundStyle(BarakahColor.muted)

      Text(arabic)
        .font(.system(size: 22, weight: .regular))
        .multilineTextAlignment(.trailing)
        .frame(maxWidth: .infinity, alignment: .trailing)
        .foregroundStyle(BarakahColor.ink)
        .lineSpacing(6)
        .environment(\.layoutDirection, .rightToLeft)

      Rectangle()
        .fill(BarakahColor.hairline)
        .frame(height: BarakahMetric.hairline)

      Text("\u{201C}\(translation)\u{201D}")
        .font(.custom(BarakahFont.serifFamily, size: 16))
        .italic()
        .foregroundStyle(BarakahColor.ink)
        .lineSpacing(3)

      Spacer(minLength: 0)

      Text(reference)
        .font(BarakahFont.sans(size: 11, weight: .semibold))
        .tracking(0.6)
        .foregroundStyle(BarakahColor.green)
    }
    .widgetURL(URL(string: "barakah://home"))
  }

  private var snapshot: WidgetSnapshot? { entry.snapshot }
  private var arabic: String { snapshot?.ayah.arabic ?? "" }
  private var translation: String { snapshot?.ayah.translation ?? "" }
  private var reference: String { snapshot?.ayah.reference ?? "" }
}
