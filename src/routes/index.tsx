import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () =>
    seo({
      title: "ลิขิตฟ้า (Likhitfa) — ดูดวงปาจื้อ ไพ่ยิปซี ทำนายฝัน ฤกษ์มงคล ฟรี",
      description:
        "เว็บดูดวงครบวงจรอันดับ 1 รวมศาสตร์พยากรณ์ชั้นสูง ดูดวงจีนปาจื้อ 4 เสา (BaZi), ไพ่ยิปซีรายวัน ความรัก การเงิน, ทำนายฝันพร้อมเลขเด็ด, สีเสื้อมงคลประจำวัน, ปฏิทินฤกษ์มงคล 2569, วิเคราะห์เบอร์มงคล และวอลเปเปอร์สายมูพรีเมียม",
      path: "/",
      keywords: [
        "ลิขิตฟ้า",
        "Likhitfa",
        "likhitfa.online",
        "ดูดวง 2569",
        "ดูดวงแม่นๆ",
        "ดูดวงวันเดือนปีเกิด",
        "ปาจื้อ",
        "ดูดวงจีน",
        "ไพ่ยิปซี",
        "ทำนายฝัน",
        "เลขเด็ดงวดนี้",
        "สีเสื้อมงคลวันนี้",
        "ปฏิทินฤกษ์มงคล",
        "วิเคราะห์เบอร์มงคล",
        "แก้ปีชง 2569",
      ],
    }),
  component: Index,
});

const services = [
  {
    href: "/bazi",
    badge: "ดวงจีน",
    badgeCn: "命",
    title: "ปาจื้อ",
    titleCn: "八字",
    tagline: "เปิดแผนผังชะตา 4 เสา",
    desc: "วิเคราะห์จากชื่อ เพศ วันเกิด และเวลาเกิด เพื่ออ่าน 4 เสา ธาตุ และจังหวะวัยจร",
    accent: "from-amber-200/15 via-amber-300/5 to-transparent",
    glyphs: ["天", "地", "人"],
    cta: "เริ่มดูดวงปาจื้อ",
  },
  {
    href: "/tarot",
    badge: "ไพ่ยิปซี",
    badgeCn: "塔",
    title: "Tarot Reading",
    titleCn: "塔罗占卜",
    tagline: "เปิดไพ่ เปิดใจ ไขความลับของชีวิต",
    desc: "เลือกดูวันนี้ สัปดาห์นี้ หรือเดือนนี้ แล้วเปิดไพ่เพื่ออ่านแนวโน้ม",
    accent: "from-rose-300/15 via-fuchsia-300/5 to-transparent",
    glyphs: ["♆", "☾", "✦"],
    cta: "เปิดไพ่ยิปซี",
  },
  {
    href: "/dream",
    badge: "ความฝัน",
    badgeCn: "梦",
    title: "ทำนายฝัน",
    titleCn: "解梦",
    tagline: "ค้นหาความหมายของฝัน",
    desc: "ค้นหาคำฝัน อ่านความหมาย เลขนำโชค วันเวลาฝันบอกเหตุ และวิธีแก้เคล็ดฝันร้าย",
    accent: "from-sky-300/15 via-indigo-300/5 to-transparent",
    glyphs: ["☁", "☾", "★"],
    cta: "เริ่มทำนายฝัน",
  },
];

const quickTools = [
  {
    href: "/daily-hub",
    badge: "เช็คดวงเช้านี้",
    badgeCn: "日",
    title: "Daily Hub ศูนย์รวมดวงเช้านี้",
    tagline: "สีมงคล ไพ่ยิปซีประจำวัน ฤกษ์ดี และทิศโชคลาภ",
    desc: "ตื่นเช้ามาที่เดียว เช็คสีเสื้อมงคลวันนี้ เปิดไพ่ประจำวัน ตรวจทิศไฉ่ซิงเอี้ย และเลขนำโชค พร้อมแชร์สตอรี่",
    iconBg: "from-amber-400/20 to-yellow-500/10",
    borderGlow: "group-hover:border-amber-400/40",
    glyph: "日",
  },
  {
    href: "/life-graph",
    badge: "12 เรือนชะตา",
    badgeCn: "图",
    title: "ดูกราฟชีวิต 12 เรือน",
    tagline: "พล็อตเส้นกราฟพลังชีวิต 1-12 แต้ม ชี้ช่วงอายุรุ่งเรือง",
    desc: "วิเคราะห์วาสนา ทรัพย์ เพื่อน ญาติ บริวาร ศัตรู คู่ครอง โรคภัย การงาน ลาภยศ พร้อมค้นหาช่วงวัยทองคำ",
    iconBg: "from-emerald-400/20 to-teal-500/10",
    borderGlow: "group-hover:border-emerald-400/40",
    glyph: "命",
  },
  {
    href: "/brahma-wheel",
    badge: "ศาสตร์พรหมชาติโบราณ",
    badgeCn: "轮",
    title: "กงล้อพรหมชาติ 12 ราศี",
    tagline: "หมุนกงล้อพยากรณ์ชะตาชีวิต เวียนขวาชาย เวียนซ้ายหญิง",
    desc: "คำนวณ 12 เรือนชะตาไทยโบราณ ตรวจดวงปีปัจจุบัน ทำนายล่วงหน้า 5 ปี พร้อมบทสวดและเคล็ดสะเดาะเคราะห์",
    iconBg: "from-amber-400/20 to-yellow-600/10",
    borderGlow: "group-hover:border-amber-400/40",
    glyph: "轮",
  },
  {
    href: "/love-compatibility",
    badge: "สมพงษ์เนื้อคู่",
    badgeCn: "缘",
    title: "ดวงสมพงษ์เนื้อคู่ & ความรัก",
    tagline: "เช็คดวง 2 คน ธาตุสมพงษ์ ปีนักษัตร & คะแนนความเข้ากันได้",
    desc: "ถอดรหัสบุพเพสันนิวาส 4 มิติ พร้อมคะแนนเปอร์เซ็นต์ % จุดเด่น และเคล็ดลับการครองเรือนให้ยืนยาว",
    iconBg: "from-rose-400/20 to-pink-500/10",
    borderGlow: "group-hover:border-rose-400/40",
    glyph: "缘",
  },
  {
    href: "/zodiac",
    badge: "ปีมะเมีย 2569",
    badgeCn: "星",
    title: "ดูดวง 12 ราศี ประจำปี 2569",
    tagline: "พยากรณ์เจาะลึก 4 ด้าน งาน เงิน รัก สุขภาพ",
    desc: "คลังคำทำนาย 12 ราศีครบถ้วน อิทธิพลดวงดาวปี 2569 สีมงคลประจำราศี และเลขเด็ดนำโชค",
    iconBg: "from-blue-400/20 to-cyan-500/10",
    borderGlow: "group-hover:border-blue-400/40",
    glyph: "星",
  },
  {
    href: "/destiny-card",
    badge: "VIP Celestial",
    badgeCn: "卡",
    title: "บัตรชะตาชีวิตดิจิทัล",
    tagline: "สรุปขุมพลังดวงชะตาส่วนบุคคล เป็นการ์ดทอง 9:16",
    desc: "สกัดธาตุกำเนิดปาจื้อ สีมงคลคู่ชีพ เลขนำโชคตลอดชีพ และเทพเจ้าคุ้มครองประจำดวงชะตา",
    iconBg: "from-yellow-400/20 to-amber-500/10",
    borderGlow: "group-hover:border-yellow-400/40",
    glyph: "玄",
  },
  {
    href: "/lucky-colors",
    badge: "อัปเดตทุกวัน",
    badgeCn: "色",
    title: "สีเสื้อมงคลประจำวัน",
    tagline: "เช็คสีก่อนออกจากบ้าน เสริมงาน เงิน รัก บารมี",
    desc: "ตารางสีมงคล 5 มิติ และสีกาลกิณีประจำวัน พร้อมทริคแต่งกายเสริมสง่าราศี และการ์ดแชร์สตอรี่",
    iconBg: "from-amber-400/20 to-orange-500/10",
    borderGlow: "group-hover:border-amber-400/40",
    glyph: "彩",
  },
  {
    href: "/phone-analysis",
    badge: "เลขศาสตร์ชั้นสูง",
    badgeCn: "数",
    title: "วิเคราะห์เบอร์มงคล",
    tagline: "ถอดรหัสพลังตัวเลข 10 หลัก ผลรวม & คู่เลข",
    desc: "วิเคราะห์ผลรวมเบอร์ คู่เลข 7 คู่ พลัง 4 มิติ และแนะนำอาชีพที่หนุนนำอย่างละเอียด",
    iconBg: "from-emerald-400/20 to-teal-500/10",
    borderGlow: "group-hover:border-emerald-400/40",
    glyph: "数",
  },
  {
    href: "/plate-analysis",
    badge: "เลขศาสตร์ยานพาหนะ",
    badgeCn: "车",
    title: "วิเคราะห์ทะเบียนรถมงคล",
    tagline: "ถอดรหัส 4 มิติ ผลรวม คู่เลข ธาตุสีรถ และวิธีแก้เคล็ด",
    desc: "วิเคราะห์ความปลอดภัย โชคลาภ และบารมีการขับขี่ ตรวจสอบธาตุสีรถคู่กับวันเกิด พร้อมแผ่นทองตัวเลขแก้เคล็ด",
    iconBg: "from-sky-400/20 to-blue-600/10",
    borderGlow: "group-hover:border-sky-400/40",
    glyph: "车",
  },
  {
    href: "/virtual-shrine",
    badge: "ขอพร 10 วัดดัง",
    badgeCn: "佛",
    title: "ไหว้พระออนไลน์ เสมือนจริง",
    tagline: "จุดธูปเทียน สวดพระคาถา ขอพร 8 มิติ และทำบุญตรงเข้าวัด",
    desc: "จำลองแท่นบูชาศักดิ์สิทธิ์ จุดธูป 3 ดอก เทียนคู่ ถวายดอกไม้ สวดมนต์พร้อมเสียงระฆัง และทำบุญตรงเข้าบัญชีวัด 100% ไม่ผ่านคนกลาง",
    iconBg: "from-amber-400/20 to-yellow-600/10",
    borderGlow: "group-hover:border-amber-400/40",
    glyph: "佛",
  },
  {
    href: "/siamsi",
    badge: "เขย่าติ้ว 28 ใบ",
    badgeCn: "签",
    title: "เซียมซีออนไลน์",
    tagline: "เสี่ยงทาย 3 ศาลเจ้าศักดิ์สิทธิ์ รับคำทำนายแม่นยำ",
    desc: "ศาลเจ้าพ่อเสือ วัดเล่งเน่ยยี่ ศาลเจ้ากวนอู พร้อมคำทำนาย 5 ด้านและการ์ดใบเซียมซีสไตล์โมเดิร์น",
    iconBg: "from-red-400/20 to-rose-500/10",
    borderGlow: "group-hover:border-red-400/40",
    glyph: "签",
  },
  {
    href: "/auspicious-calendar",
    badge: "ปฏิทินจีน 2569",
    badgeCn: "历",
    title: "ปฏิทินฤกษ์มงคล",
    tagline: "ค้นหาฤกษ์ดี วันธงชัย เปิดกิจการ แต่งงาน ออกรถ",
    desc: "ปฏิทินฤกษ์มงคล กิจกรรมมงคล/อัปมงคล และทิศนำโชคประจำวัน คำนวณตามหลักดาราศาสตร์จีน",
    iconBg: "from-blue-400/20 to-indigo-500/10",
    borderGlow: "group-hover:border-blue-400/40",
    glyph: "吉",
  },
  {
    href: "/tai-sui",
    badge: "ปีมะเมีย 2569",
    badgeCn: "岁",
    title: "ตรวจปีชง 2569 & วิธีแก้ชง",
    tagline: "เช็ค 4 นักษัตรชง พร้อมสถานที่ไหว้และบทสวด",
    desc: "คำนวณระดับการชง (ชวด 100%, มะเมีย 75%, เถาะ 50%, ระกา 50%) พร้อมเคล็ดลับผ่อนหนักเป็นเบา",
    iconBg: "from-rose-400/20 to-red-500/10",
    borderGlow: "group-hover:border-rose-400/40",
    glyph: "岁",
  },
  {
    href: "/name-analysis",
    badge: "เลขศาสตร์ & ทักษา",
    badgeCn: "名",
    title: "วิเคราะห์ชื่อ-นามสกุล",
    tagline: "ถอดรหัสกำลังดาว ทักษาปกรณ์ & อักษรกาลกิณี",
    desc: "วิเคราะห์ชื่อ สกุล ผลรวม พร้อมตรวจเช็คอักษรกาลกิณีและอักษรเดช-ศรีตามวันเกิด",
    iconBg: "from-purple-400/20 to-violet-500/10",
    borderGlow: "group-hover:border-purple-400/40",
    glyph: "名",
  },
  {
    href: "/naming",
    badge: "ทักษาปกรณ์ชั้นสูง",
    badgeCn: "赐",
    title: "ระบบตั้งชื่อมงคล คัดกรอง 8 วันเกิด",
    tagline: "คลังชื่อมงคลกว่า 180+ ชื่อ ปลอดกาลกิณี เสริมเดช ศรี มนตรี",
    desc: "ค้นหาชื่อมงคลตามเป้าหมายชีวิต การงาน ธุรกิจ วาสนา พร้อมคำนวณผลรวมเลขศาสตร์และปุ่มสุ่มชื่อนำโชค",
    iconBg: "from-purple-400/20 to-pink-500/10",
    borderGlow: "group-hover:border-purple-400/40",
    glyph: "名",
  },
  {
    href: "/wallpaper",
    badge: "Spiritual Art · NineJoe",
    badgeCn: "图",
    title: "วอลเปเปอร์สายมู & มงคลพรีเมียม",
    tagline: "Spiritual Art องค์เทพเจ้า & ยันต์ 5 ธาตุ",
    desc: "รวมวอลเปเปอร์ 9:16 ระดับ HD ไฉ่ซิงเอี้ย ท้าวเวสสุวรรณ พระแม่ลักษมี พระพิฆเนศ และยันต์ 5 ธาตุปาจื้อ ดาวน์โหลดฟรี",
    iconBg: "from-yellow-400/20 to-amber-500/10",
    borderGlow: "group-hover:border-yellow-400/40",
    glyph: "福",
  },
];

function Index() {
  return (
    <div className="relative min-h-screen">
      <SiteHeader />

      <main className="relative mx-auto max-w-7xl px-6 pt-16 pb-12">
        {/* Hero */}
        <section className="relative mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/5 px-4 py-1.5 text-[11px] tracking-[0.25em] text-gold/80">
            <span className="h-1 w-1 rounded-full bg-gold" />
            ศาสตร์โบราณ · ตีความร่วมสมัย
          </div>
          <h1 className="font-display text-5xl font-medium leading-[1.05] text-foreground md:text-7xl">
            อ่านลิขิตฟ้า
            <br />
            <span className="text-gradient-gold italic">ด้วยศาสตร์ที่แม่นยำ</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
            รวมสามศาสตร์การดูดวงสำคัญไว้ในที่เดียว — ปาจื้อจีนโบราณ ไพ่ทาโรต์ และทำนายฝัน
            พร้อมระบบวิเคราะห์ที่ออกแบบมาให้เข้าใจง่ายสำหรับยุคใหม่
          </p>
          <div className="mx-auto mt-8 flex items-center justify-center gap-6 font-cn text-2xl text-gold/40">
            <span>命</span>
            <span className="h-px w-12 bg-gold/30" />
            <span>運</span>
            <span className="h-px w-12 bg-gold/30" />
            <span>和</span>
          </div>
        </section>

        {/* Services */}
        <section className="mt-20">
          <div className="mb-10 flex items-center justify-center gap-4">
            <span className="h-px w-12 bg-gold/30" />
            <h2 className="font-display text-2xl text-foreground">เลือกบริการดูดวง</h2>
            <span className="h-px w-12 bg-gold/30" />
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {services.map((s, i) => (
              <Link
                key={s.href}
                to={s.href}
                className="group relative animate-fade-up"
                style={{ animationDelay: `${i * 120}ms` }}
              >
                <article className="ornate-border relative h-full overflow-hidden rounded-3xl glass-strong p-7 transition-all duration-500 hover:-translate-y-1 hover:shadow-gold">
                  {/* accent backdrop */}
                  <div
                    className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${s.accent} opacity-60 transition-opacity duration-500 group-hover:opacity-100`}
                  />
                  {/* floating chinese glyphs */}
                  <div className="pointer-events-none absolute right-4 top-4 flex flex-col gap-1 font-cn text-[64px] leading-none text-gold/[0.08]">
                    {s.glyphs.map((g, idx) => (
                      <span key={idx}>{g}</span>
                    ))}
                  </div>

                  <div className="relative">
                    <div className="inline-flex items-center gap-2 rounded-full border border-gold/20 bg-background/40 px-3 py-1 text-[11px] tracking-wider text-gold/90">
                      <span className="font-cn">{s.badgeCn}</span>
                      <span className="h-3 w-px bg-gold/30" />
                      {s.badge}
                    </div>

                    <div className="mt-32 space-y-2">
                      <div className="font-cn text-sm text-gold/60">{s.titleCn}</div>
                      <h3 className="font-display text-3xl text-foreground">{s.title}</h3>
                      <p className="text-sm text-gold/80">{s.tagline}</p>
                      <p className="text-xs leading-relaxed text-muted-foreground">{s.desc}</p>
                    </div>

                    <div className="mt-8 flex items-center justify-between">
                      <span className="text-sm font-medium text-gold transition-all group-hover:tracking-wider">
                        {s.cta}
                      </span>
                      <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/30 text-gold transition-all group-hover:bg-gold group-hover:text-primary-foreground">
                        →
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>

        {/* Popular Spiritual Tools Grid */}
        <section className="mt-24">
          <div className="mb-4 text-center">
            <div className="mx-auto mb-3 inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/5 px-4 py-1 text-[11px] tracking-[0.2em] text-gold/90">
              <span className="h-1 w-1 rounded-full bg-gold" />
              ศาสตร์เสริมดวง & เครื่องมือยอดนิยม
            </div>
            <h2 className="font-display text-3xl font-medium text-foreground md:text-4xl">
              เครื่องมือเสริมดวงชะตาประจำวัน
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-xs text-muted-foreground md:text-sm">
              เลือกใช้เครื่องมือคำนวณดวงชะตา เลขศาสตร์ และฤกษ์ยามโบราณ เพื่อนำไปใช้ในชีวิตประจำวัน
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {quickTools.map((tool, i) => (
              <Link
                key={tool.href}
                to={tool.href}
                className="group relative animate-fade-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div
                  className={`ornate-border relative h-full overflow-hidden rounded-2xl glass-strong p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-gold ${tool.borderGlow}`}
                >
                  <div
                    className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${tool.iconBg} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
                  />

                  {/* Chinese Glyph backdrop */}
                  <div className="pointer-events-none absolute right-3 top-3 font-cn text-5xl font-bold text-gold/[0.07] transition-all duration-300 group-hover:scale-110 group-hover:text-gold/[0.12]">
                    {tool.glyph}
                  </div>

                  <div className="relative flex h-full flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/20 bg-background/50 px-2.5 py-0.5 text-[10px] tracking-wider text-gold/90">
                          <span className="font-cn text-xs">{tool.badgeCn}</span>
                          <span className="h-2 w-px bg-gold/30" />
                          {tool.badge}
                        </span>
                        <span className="text-xs text-gold/50 transition-transform group-hover:translate-x-1 group-hover:text-gold">
                          →
                        </span>
                      </div>

                      <h3 className="mt-4 font-display text-xl text-foreground group-hover:text-gold transition-colors">
                        {tool.title}
                      </h3>
                      <p className="mt-1 text-xs font-medium text-gold/80">{tool.tagline}</p>
                      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{tool.desc}</p>
                    </div>

                    <div className="mt-6 flex items-center gap-2 border-t border-gold/10 pt-3 text-[11px] text-gold/70 group-hover:text-gold">
                      <span>เปิดใช้งานเครื่องมือ</span>
                      <span>›</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Trust band */}
        <section className="mt-24">
          <div className="gold-divider mb-10" />
          <div className="grid gap-8 text-center md:grid-cols-3">
            {[
              { cn: "精", th: "แม่นยำ", desc: "อ้างอิงตำราคลาสสิกผสานการคำนวณยุคใหม่" },
              { cn: "雅", th: "งดงาม", desc: "ออกแบบทุกหน้าจอด้วยมาตรฐานพรีเมียม" },
              { cn: "易", th: "ใช้ง่าย", desc: "อ่านผลได้ทันที ไม่ต้องเป็นผู้เชี่ยวชาญ" },
            ].map((v) => (
              <div key={v.th} className="space-y-2">
                <div className="font-cn text-4xl text-gold">{v.cn}</div>
                <div className="font-display text-xl text-foreground">{v.th}</div>
                <p className="text-xs text-muted-foreground">{v.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
