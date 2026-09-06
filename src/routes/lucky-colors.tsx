import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { seo, siteUrl } from "@/lib/seo";
import {
  LUCKY_COLORS_WEEK,
  getLuckyColorsByDayIndex,
  getTodayLuckyColors,
  type DayLuckyColors,
} from "@/lib/lucky-colors-data";
import { ShareStoryModal, type ShareCardData } from "@/components/share-story-modal";
import { useState } from "react";

export const Route = createFileRoute("/lucky-colors")({
  head: () =>
    seo({
      title: "สีเสื้อมงคลประจำวัน 2569 ตารางสีมงคลเสริมดวง",
      description:
        "เช็คสีเสื้อมงคลประจำวัน เสริมการงาน การเงิน โชคลาภ ความรัก อำนาจบารมี และสีกาลกิณีต้องห้าม อัปเดตแม่นยำตามหลักโหราศาสตร์ไทย-จีน",
      path: "/lucky-colors",
      canonicalUrl: `${siteUrl}/lucky-colors`,
      keywords: [
        "สีเสื้อมงคล",
        "สีเสื้อมงคลวันนี้",
        "สีมงคลประจำวัน",
        "ตารางสีเสื้อมงคล 2569",
        "สีนำโชค",
        "สีกาลกิณี",
      ],
    }),
  component: LuckyColorsPage,
});

function LuckyColorsPage() {
  const todayData = getTodayLuckyColors();
  const [selectedDay, setSelectedDay] = useState<number>(todayData.dayIndex);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const current: DayLuckyColors = getLuckyColorsByDayIndex(selectedDay);

  const shareData: ShareCardData = {
    category: "สีเสื้อมงคลประจำวัน",
    categoryCn: current.dayNameCn,
    title: `สีมงคล ${current.dayName}`,
    subtitle: `พลังแห่งดาว${current.planet} · ${current.element}`,
    highlights: [
      { label: "💰 การเงินโชคลาภ", value: current.categories.wealth.colors.map((c) => c.name).join(", "), color: "#34d399" },
      { label: "💼 การงานก้าวหน้า", value: current.categories.work.colors.map((c) => c.name).join(", "), color: "#38bdf8" },
      { label: "💖 เสน่ห์ความรัก", value: current.categories.love.colors.map((c) => c.name).join(", "), color: "#f472b6" },
      { label: "👑 อำนาจบารมี", value: current.categories.power.colors.map((c) => c.name).join(", "), color: "#fbbf24" },
      { label: "❌ สีกาลกิณี (ห้ามใส่)", value: current.categories.inauspicious.colors.map((c) => c.name).join(", "), color: "#ef4444" },
    ],
    quote: current.dressingTip,
    footerTag: "เช็คสีเสื้อมงคลทุกวันได้ที่ www.likhitfa.online",
  };

  return (
    <div className="relative min-h-screen">
      <SiteHeader subtitle="สีเสื้อมงคล" subtitleCn="吉色" />

      <main className="mx-auto max-w-5xl px-5 pt-10 pb-16">
        {/* Banner ส่วนหัว */}
        <section className="glass-strong relative overflow-hidden rounded-3xl p-8 shadow-elegant md:p-10">
          <div className="pointer-events-none absolute -right-6 -top-6 font-cn text-[150px] leading-none text-gold/[0.05]">
            色
          </div>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-3.5 py-1 text-[11px] tracking-wider text-gold">
              <span className="font-cn">今日吉色</span> · ตารางสีเสื้อมงคล 2569
            </div>
            <h1 className="mt-4 font-display text-3xl text-foreground md:text-5xl">
              สีเสื้อมงคล <span className="text-gradient-gold italic">เสริมพลังชีวิต</span>
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              เลือกสวมใส่สีที่เกื้อหนุนดวงชะตาในแต่ละวันเพื่อเปิดรับพลังงานบวก เสริมโชคลาภ การงาน ความรัก
              และหลีกเลี่ยงสีกาลกิณีที่อาจบั่นทอนจังหวะชีวิต
            </p>

            {/* แถบเลือกวัน 7 วัน */}
            <div className="mt-8 flex flex-wrap gap-2">
              {LUCKY_COLORS_WEEK.map((item) => {
                const isActive = item.dayIndex === selectedDay;
                const isToday = item.dayIndex === todayData.dayIndex;
                return (
                  <button
                    key={item.dayIndex}
                    onClick={() => setSelectedDay(item.dayIndex)}
                    className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-medium transition-all ${
                      isActive
                        ? "bg-gradient-gold text-primary-foreground shadow-gold"
                        : "border border-border bg-card/60 text-muted-foreground hover:border-gold/40 hover:text-gold"
                    }`}
                  >
                    <span>{item.dayName}</span>
                    {isToday && (
                      <span
                        className={`rounded-full px-1.5 py-0.2 text-[9px] ${
                          isActive ? "bg-black/20 text-white" : "bg-gold/20 text-gold"
                        }`}
                      >
                        วันนี้
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ข้อมูลประจำวันที่เลือก */}
        <section className="mt-10">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-cn text-xs text-gold/70">{current.dayNameCn}</span>
                <span className="text-xs text-muted-foreground">· {current.planet} · {current.element}</span>
              </div>
              <h2 className="mt-1 font-display text-3xl text-foreground">
                ตารางสีมงคลสำหรับ <span className="text-gold">{current.dayName}</span>
              </h2>
            </div>
            <button
              onClick={() => setIsShareOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gold/40 bg-gold/10 px-5 py-2.5 text-xs font-semibold text-gold transition hover:bg-gold/20"
            >
              <span>🖼️ แชร์ลง Story / LINE</span>
            </button>
          </div>

          {/* Grid การ์ดสี 5 ด้าน */}
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {/* โชคลาภเงินทอง */}
            <ColorCard
              title="โชคลาภ เงินทอง (ทรัพย์สมบัติ)"
              badge="WEALTH"
              icon="💰"
              colors={current.categories.wealth.colors}
              description={current.categories.wealth.description}
              borderHighlight="border-emerald-500/30 hover:border-emerald-500/60"
            />

            {/* การงานก้าวหน้า */}
            <ColorCard
              title="การงาน การเจรจา (ผู้ใหญ่เอ็นดู)"
              badge="CAREER"
              icon="💼"
              colors={current.categories.work.colors}
              description={current.categories.work.description}
              borderHighlight="border-sky-500/30 hover:border-sky-500/60"
            />

            {/* เสน่ห์ความรัก */}
            <ColorCard
              title="ความรัก เสน่ห์เมตตา (คนรักเอาใจ)"
              badge="LOVE"
              icon="💖"
              colors={current.categories.love.colors}
              description={current.categories.love.description}
              borderHighlight="border-pink-500/30 hover:border-pink-500/60"
            />

            {/* อำนาจบารมี */}
            <ColorCard
              title="อำนาจบารมี เมตตามหานิยม (คนเกรงใจ)"
              badge="POWER"
              icon="👑"
              colors={current.categories.power.colors}
              description={current.categories.power.description}
              borderHighlight="border-amber-500/30 hover:border-amber-500/60"
            />
          </div>

          {/* สีกาลกิณี ต้องห้าม */}
          <div className="mt-6 rounded-3xl border border-rose-500/30 bg-rose-950/15 p-6 md:p-8">
            <div className="flex items-center gap-2.5 text-rose-400">
              <span className="text-xl">⚠️</span>
              <h3 className="font-display text-xl">สีกาลกิณี ประจำ{current.dayName} (ห้ามใส่เด็ดขาด)</h3>
            </div>
            <p className="mt-2 text-xs text-rose-300/80">
              {current.categories.inauspicious.description}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {current.categories.inauspicious.colors.map((c) => (
                <div
                  key={c.name}
                  className="flex items-center gap-2.5 rounded-2xl border border-rose-500/40 bg-rose-950/30 px-4 py-2"
                >
                  <span
                    className="h-4 w-4 rounded-full border border-white/20 shadow-sm"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span className="text-sm font-semibold text-rose-200">{c.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* เคล็ดลับการแต่งตัวและเครื่องประดับ */}
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div className="glass-strong rounded-3xl p-6">
              <div className="text-[11px] uppercase tracking-wider text-gold/80">STYLE TIPS</div>
              <h4 className="mt-1 font-display text-lg text-foreground">💡 เคล็ดลับการแต่งกาย</h4>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {current.dressingTip}
              </p>
            </div>

            <div className="glass-strong rounded-3xl p-6">
              <div className="text-[11px] uppercase tracking-wider text-gold/80">GEMSTONES & ACCESSORIES</div>
              <h4 className="mt-1 font-display text-lg text-foreground">💎 อัญมณีและเครื่องประดับมงคล</h4>
              <div className="mt-3 space-y-2">
                <div className="text-sm text-foreground">
                  <span className="text-muted-foreground">อัญมณี: </span>
                  <span className="font-medium text-amber-200">{current.gemstones.join(", ")}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  <span>เครื่องประดับ: </span>
                  <span className="text-foreground">{current.jewelry}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* โมดอลสำหรับแชร์สตอรี่ */}
      <ShareStoryModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        data={shareData}
      />

      <SiteFooter />
    </div>
  );
}

function ColorCard({
  title,
  badge,
  icon,
  colors,
  description,
  borderHighlight,
}: {
  title: string;
  badge: string;
  icon: string;
  colors: { name: string; hex: string }[];
  description: string;
  borderHighlight: string;
}) {
  return (
    <article
      className={`glass-strong rounded-3xl border p-6 transition-all duration-300 hover:-translate-y-1 ${borderHighlight}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
        <span className="rounded-full border border-border bg-card/60 px-2.5 py-0.5 text-[9px] uppercase tracking-wider text-muted-foreground">
          {badge}
        </span>
      </div>

      <h3 className="mt-3 font-display text-lg text-foreground">{title}</h3>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>

      <div className="mt-5 space-y-2">
        {colors.map((c) => (
          <div
            key={c.name}
            className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card/40 p-3"
          >
            <span
              className="h-6 w-6 shrink-0 rounded-full border border-white/20 shadow-md"
              style={{ backgroundColor: c.hex }}
            />
            <span className="text-sm font-semibold text-foreground">{c.name}</span>
          </div>
        ))}
      </div>
    </article>
  );
}
