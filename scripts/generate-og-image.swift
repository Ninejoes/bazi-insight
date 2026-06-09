import AppKit

let width = 1200
let height = 630
let size = NSSize(width: width, height: height)
let image = NSImage(size: size)

func color(_ hex: UInt32) -> NSColor {
  let r = CGFloat((hex >> 16) & 0xff) / 255
  let g = CGFloat((hex >> 8) & 0xff) / 255
  let b = CGFloat(hex & 0xff) / 255
  return NSColor(red: r, green: g, blue: b, alpha: 1)
}

func paragraph(alignment: NSTextAlignment = .left, lineHeight: CGFloat = 1.18) -> NSMutableParagraphStyle {
  let style = NSMutableParagraphStyle()
  style.alignment = alignment
  style.lineHeightMultiple = lineHeight
  return style
}

func font(_ name: String, _ size: CGFloat, fallbackWeight: NSFont.Weight = .regular) -> NSFont {
  NSFont(name: name, size: size) ?? NSFont.systemFont(ofSize: size, weight: fallbackWeight)
}

func drawText(
  _ text: String,
  in rect: NSRect,
  font: NSFont,
  color: NSColor,
  alignment: NSTextAlignment = .left,
  lineHeight: CGFloat = 1.16
) {
  let attrs: [NSAttributedString.Key: Any] = [
    .font: font,
    .foregroundColor: color,
    .paragraphStyle: paragraph(alignment: alignment, lineHeight: lineHeight),
  ]
  (text as NSString).draw(in: rect, withAttributes: attrs)
}

func roundedRect(_ rect: NSRect, radius: CGFloat, fill: NSColor, stroke: NSColor? = nil, lineWidth: CGFloat = 1) {
  let path = NSBezierPath(roundedRect: rect, xRadius: radius, yRadius: radius)
  fill.setFill()
  path.fill()
  if let stroke {
    stroke.setStroke()
    path.lineWidth = lineWidth
    path.stroke()
  }
}

image.lockFocus()

let context = NSGraphicsContext.current!.cgContext
context.setFillColor(color(0x030811).cgColor)
context.fill(CGRect(x: 0, y: 0, width: width, height: height))

for i in 0..<80 {
  let alpha = CGFloat(80 - i) / 80 * 0.035
  context.setStrokeColor(NSColor(red: 0.95, green: 0.65, blue: 0.21, alpha: alpha).cgColor)
  context.setLineWidth(1)
  let x = CGFloat(i) * 18
  context.move(to: CGPoint(x: x, y: 0))
  context.addLine(to: CGPoint(x: x + 190, y: CGFloat(height)))
  context.strokePath()
}

let cardRect = NSRect(x: 78, y: 74, width: 1044, height: 482)
roundedRect(
  cardRect,
  radius: 36,
  fill: NSColor(red: 0.055, green: 0.091, blue: 0.135, alpha: 1),
  stroke: NSColor(red: 0.87, green: 0.62, blue: 0.24, alpha: 0.38),
  lineWidth: 3
)

let logoRect = NSRect(x: 126, y: 428, width: 88, height: 88)
let logoPath = NSBezierPath(ovalIn: logoRect)
NSColor(red: 0.96, green: 0.69, blue: 0.28, alpha: 1).setFill()
logoPath.fill()
drawText(
  "L",
  in: NSRect(x: 126, y: 424, width: 88, height: 72),
  font: font("HelveticaNeue-Bold", 56, fallbackWeight: .heavy),
  color: color(0x07111f),
  alignment: .center
)

drawText(
  "LIKHITFA",
  in: NSRect(x: 238, y: 476, width: 300, height: 32),
  font: font("HelveticaNeue-Bold", 23, fallbackWeight: .bold),
  color: color(0xf3bd55)
)
drawText(
  "Likhitfa ลิขิตฟ้า",
  in: NSRect(x: 238, y: 421, width: 520, height: 64),
  font: font("NotoSansThai-ExtraBold", 43, fallbackWeight: .heavy),
  color: color(0xf8f3e9)
)

drawText(
  "ดูดวงปาจื้อ ไพ่ยิปซี และทำนายฝันในเว็บเดียว",
  in: NSRect(x: 126, y: 286, width: 870, height: 72),
  font: font("NotoSansThai-ExtraBold", 47, fallbackWeight: .heavy),
  color: color(0xf8f3e9)
)

drawText(
  "ศาสตร์ดูดวงที่อ่านง่าย ใช้งานได้จริง พร้อมบทความและผลอ่านที่เข้าใจง่าย",
  in: NSRect(x: 126, y: 214, width: 900, height: 58),
  font: font("NotoSansThai-Medium", 30, fallbackWeight: .medium),
  color: NSColor(red: 0.78, green: 0.74, blue: 0.66, alpha: 1)
)

let pillRect = NSRect(x: 126, y: 134, width: 296, height: 50)
roundedRect(
  pillRect,
  radius: 25,
  fill: NSColor(red: 0.12, green: 0.16, blue: 0.20, alpha: 1),
  stroke: NSColor(red: 0.87, green: 0.62, blue: 0.24, alpha: 0.42),
  lineWidth: 1.5
)
drawText(
  "www.likhitfa.online",
  in: NSRect(x: 154, y: 140, width: 250, height: 36),
  font: font("HelveticaNeue-Bold", 23, fallbackWeight: .bold),
  color: color(0xf3bd55)
)

drawText(
  "BaZi • Tarot • Dream",
  in: NSRect(x: 764, y: 138, width: 300, height: 34),
  font: font("HelveticaNeue-Medium", 24, fallbackWeight: .medium),
  color: NSColor(red: 0.62, green: 0.58, blue: 0.50, alpha: 1),
  alignment: .right
)

image.unlockFocus()

guard
  let tiff = image.tiffRepresentation,
  let bitmap = NSBitmapImageRep(data: tiff),
  let jpg = bitmap.representation(using: .jpeg, properties: [.compressionFactor: 0.9])
else {
  fatalError("Could not render og-image.jpg")
}

try jpg.write(to: URL(fileURLWithPath: "public/og-image.jpg"))
