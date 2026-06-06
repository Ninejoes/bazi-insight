import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Likhitfa ลิขิตฟ้า — ศาสตร์ดูดวงระดับพรีเมียม" },
      {
        name: "description",
        content: "ปาจื้อ ไพ่ยิปซี ทำนายฝัน — อ่านดวงแบบมืออาชีพ เข้าใจง่าย ใช้งานสะดวก",
      },
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
