import SwiftUI

/// Small (~16pt) per-direction glyph echoed across complications, the
/// Control Center tile, and the Dynamic Island. Drawn in a 16×16 space.
struct LockMotif: View {
  let direction: Direction
  var size: CGFloat = 16
  var color: Color = .white

  var body: some View {
    let s = size / 16
    Canvas { ctx, _ in
      switch direction {
      case .editorial:
        var line = Path()
        line.move(to: CGPoint(x: 2 * s, y: 8 * s))
        line.addLine(to: CGPoint(x: 14 * s, y: 8 * s))
        ctx.stroke(line, with: .color(color), style: StrokeStyle(lineWidth: 1.2 * s, lineCap: .round))
        ctx.fill(
          Path(ellipseIn: CGRect(x: 6.4 * s, y: 6.4 * s, width: 3.2 * s, height: 3.2 * s)),
          with: .color(color))
      case .bold:
        var tri = Path()
        tri.move(to: CGPoint(x: 8 * s, y: 2 * s))
        tri.addLine(to: CGPoint(x: 14 * s, y: 13 * s))
        tri.addLine(to: CGPoint(x: 2 * s, y: 13 * s))
        tri.closeSubpath()
        ctx.fill(tri, with: .color(color))
      case .dawn:
        var arc = Path()
        arc.move(to: CGPoint(x: 2 * s, y: 10 * s))
        arc.addQuadCurve(to: CGPoint(x: 14 * s, y: 10 * s), control: CGPoint(x: 8 * s, y: 2 * s))
        ctx.stroke(arc, with: .color(color), style: StrokeStyle(lineWidth: 1.4 * s, lineCap: .round))
        var horizon = Path()
        horizon.move(to: CGPoint(x: 1 * s, y: 12 * s))
        horizon.addLine(to: CGPoint(x: 15 * s, y: 12 * s))
        ctx.stroke(horizon, with: .color(color.opacity(0.6)), style: StrokeStyle(lineWidth: 1 * s, lineCap: .round))
      case .night:
        var crescent = Path()
        crescent.addEllipse(in: CGRect(x: 1.5 * s, y: 2 * s, width: 12 * s, height: 12 * s))
        crescent.addEllipse(in: CGRect(x: 5 * s, y: 2.5 * s, width: 11 * s, height: 11 * s))
        ctx.fill(crescent, with: .color(color), style: FillStyle(eoFill: true))
      case .arch:
        var arch = Path()
        arch.move(to: CGPoint(x: 3 * s, y: 14 * s))
        arch.addLine(to: CGPoint(x: 3 * s, y: 7 * s))
        arch.addQuadCurve(to: CGPoint(x: 8 * s, y: 2 * s), control: CGPoint(x: 3 * s, y: 2 * s))
        arch.addQuadCurve(to: CGPoint(x: 13 * s, y: 7 * s), control: CGPoint(x: 13 * s, y: 2 * s))
        arch.addLine(to: CGPoint(x: 13 * s, y: 14 * s))
        ctx.stroke(arch, with: .color(color), style: StrokeStyle(lineWidth: 1.3 * s, lineJoin: .round))
      case .celestial:
        ctx.fill(
          Path(ellipseIn: CGRect(x: 4.8 * s, y: 4.8 * s, width: 6.4 * s, height: 6.4 * s)),
          with: .color(color))
        for i in 0..<8 {
          let a = Double(i) * .pi / 4
          var ray = Path()
          ray.move(to: CGPoint(x: (8 + cos(a) * 5.2) * s, y: (8 + sin(a) * 5.2) * s))
          ray.addLine(to: CGPoint(x: (8 + cos(a) * 7) * s, y: (8 + sin(a) * 7) * s))
          ctx.stroke(ray, with: .color(color), style: StrokeStyle(lineWidth: 1.1 * s, lineCap: .round))
        }
      }
    }
    .frame(width: size, height: size)
  }
}
