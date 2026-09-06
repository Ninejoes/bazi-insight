import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { seo, siteUrl } from "@/lib/seo";
import {
  calculateTaiSui,
  ZODIAC_ANIMALS,
  type TaiSuiClashResult,
} from "@/lib/chinese-calendar";
import { ShareStoryModal, type ShareCardData } from "@/components/share-story-modal";
import { useState } from "react";
import { Share2, AlertTriangle, Sparkles, Building2, Scroll } from "lucide-react";

export const Route = createFileRoute("/tai-sui")({
  head: () =>
    seo({
      title: "ตรวจปีชง 2569 ปีมะเมีย วิธีแก้ชง วัดไหว้แก้ชง ของไหว้ และบทสวด",
      description:
        "ตรวจปีชง 2569 (ปีมะเมีย) เช็คปีชงตรง ชงร่วม (คัก เฮ้ง ผั่ว) เผยวิธีแก้ชง สถานที่ไหว้แก้ชงยอดนิยม เช่น วัดเล่งเน่ยยี่ ศาลเจ้าพ่อเสือ พร้อมบทสวดบูชาเทพเจ้าไท้ส่วยเอี๊ย",
      path: "/tai-sui",
      canonicalUrl: `${siteUrl}/tai-sui`,
      keywords: [
        "ปีชง 2569",
        "ตรวจปีชง",
        "แก้ปีชง 2569",
        "ปีชง มะเมีย",
        "วิธีแก้ชง",
        "ไหว้ไท้ส่วยเอี๊ย",
        "วัดเล่งเน่ยยี่ แก้ชง",
      ],
    }),
  component: TaiSuiPage,
});

function TaiSuiPage() {
  const [selectedYear, setSelectedYear] = useState<number>(2539); // default ปีชวด
  const [result, setResult] = useState<TaiSuiClashResult>(calculateTaiSui(2539));
  const [isShareOpen, setIsShareOpen] = useState(false);

  const handleSelectYear = (yearBe: number) => {
    setSelectedYear(yearBe);
    setResult(calculateTaiSui(yearBe));
  };

  const handleSelectZodiac = (zodiacName: string) => {
    // หาปี พ.ศ. ล่าสุดของนักษัตรนี้
    const idx = ZODIAC_ANIMALS.findIndex((z) => z.name === zodiacName);
    const calculatedYear = 2563 + idx;
    setSelectedYear(calculatedYear);
    setResult(calculateTaiSui(calculatedYear));
  };

  const shareData: ShareCardData = {
    category: "ตรวจปีชง 2569 (ปีมะเมีย)",
    categoryCn: "丙午太岁",
    title: `${result.zodiacName} (${result.zodiacAnimal})`,
    subtitle: `พ.ศ. ${result.birthYearBe} · สถานะ: ${result.clashType}`,
    highlights: [
      {
        label: "สถานะปีชง 2569",
        value: result.clashType,
        color: result.severity === "high" ? "#f87171" : result.severity === "medium" ? "#fbbf24" : "#34d399",
      },
      { label: "เรื่องที่ต้องระวัง", value: result.cautionAreas[0] || "ใช้ชีวิตอย่างมีสติ" },
      { label: "วิธีแก้เคล็ด", value: result.remedies[0] || "ทำบุญบริจาคทาน" },
      { label: "สถานที่แนะนำ", value: result.recommendedShrines[0]?.name || "วัดมังกรกมลาวาส" },
    ],
    quote: result.prayerText.slice(0, 100),
    footerTag: "ตรวจปีชงและวิธีแก้เคล็ดได้ที่ www.likhitfa.online",
  };

  return (
    <div className="relative min-h-screen">
      <SiteHeader subtitle="ตรวจปีชง 2569" subtitleCn="犯太岁" />

      <main className="mx-auto max-w-5xl px-5 pt-10 pb-16">
        {/* Banner ส่วนหัว */}
        <section className="glass-strong relative overflow-hidden rounded-3xl p-8 shadow-elegant md:p-10">
          <div className="pointer-events-none absolute -right-6 -top-6 font-cn text-[150px] leading-none text-gold/[0.05]">
            岁
          </div>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-3.5 py-1 text-[11px] tracking-wider text-gold">
              <span className="font-cn">化解太岁</span> · ตรวจสอบและสะเดาะเคราะห์ปีชง 2569
            </div>
            <h1 className="mt-4 font-display text-3xl text-foreground md:text-5xl">
              ตรวจปีชง 2569 <span className="text-gradient-gold italic">ปีมะเมีย (ม้าไฟ)</span>
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              ปี 2569 ตรงกับปีนักษัตรมะเมีย ตรวจสอบดวงชะตาว่าปีเกิดของคุณเข้าข่ายชงตรง ชงร่วม
              หรือเป็นปีสมพงษ์ พร้อมแนวทางไหว้พระสะเดาะเคราะห์และของไหว้เสริมมงคล
            </p>

            {/* เลือกปีนักษัตร 12 ตัว */}
            <div className="mt-8">
              <div className="text-xs text-muted-foreground mb-2.5">เลือกนักษัตรประจำตัวคุณ:</div>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                {ZODIAC_ANIMALS.map((z) => {
                  const isSelected = result.zodiacName.includes(z.name);
                  return (
                    <button
                      key={z.name}
                      type="button"
                      onClick={() => handleSelectZodiac(z.name)}
                      className={`flex flex-col items-center justify-center rounded-2xl border p-2.5 transition ${
                        isSelected
                          ? "border-gold bg-gold/15 shadow-gold"
                          : "border-border/60 bg-card/40 text-muted-foreground hover:border-gold/40 hover:text-gold"
                      }`}
                    >
                      <span className="font-display text-sm font-semibold text-foreground">
                        ปี{z.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{z.animal}</span>
                      <span className="font-cn text-[9px] text-gold/60">{z.cn.split(" ")[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* หรือเลือกจาก พ.ศ. เกิด */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="text-xs text-muted-foreground">หรือเลือกปีเกิด พ.ศ.:</span>
              <select
                value={selectedYear}
                onChange={(e) => handleSelectYear(parseInt(e.target.value, 10))}
                className="input-styled h-10 px-4 text-xs font-mono"
              >
                {Array.from({ length: 70 }, (_, i) => 2569 - i).map((y) => (
                  <option key={y} value={y}>
                    พ.ศ. {y} (ค.ศ. {y - 543})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* การ์ดสรุปผลปีชง */}
        <section className="mt-10 animate-fade-in">
          <div className="rounded-3xl border border-gold/30 bg-gradient-to-b from-stone-900 via-card to-card p-6 md:p-8 shadow-elegant">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-gold/80">TAI SUI REPORT 2569</div>
                <h2 className="mt-1 font-display text-3xl text-foreground md:text-4xl">
                  {result.zodiacName} ({result.zodiacAnimal}) · พ.ศ. {result.birthYearBe}
                </h2>
                <div className="mt-2.5 flex items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      result.severity === "high"
                        ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                        : result.severity === "medium"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                        : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    }`}
                  >
                    {result.clashType}
                  </span>
                  {result.clashPercentage > 0 && (
                    <span className="text-xs text-muted-foreground">
                      ระดับอิทธิพลเคราะห์ {result.clashPercentage}%
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => setIsShareOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-gold/40 bg-gold/10 px-5 py-3 text-xs font-semibold text-gold hover:bg-gold/20"
              >
                <Share2 className="h-4 w-4" />
                <span>แชร์การ์ดแก้ชง</span>
              </button>
            </div>

            {/* เรื่องที่ต้องระวัง */}
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              <div className="rounded-2xl border border-rose-500/30 bg-rose-950/15 p-5">
                <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  <span>เรื่องที่ต้องระมัดระวังเป็นพิเศษ</span>
                </div>
                <ul className="mt-3 space-y-2 text-xs text-rose-200/90 leading-relaxed">
                  {result.cautionAreas.map((c, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-rose-400">•</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/15 p-5">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                  <Sparkles className="h-4 w-4" />
                  <span>แนวทางเสริมดวง & สะเดาะเคราะห์</span>
                </div>
                <ul className="mt-3 space-y-2 text-xs text-emerald-200/90 leading-relaxed">
                  {result.remedies.map((r, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-emerald-400">•</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* สถานที่ไหว้แก้ชง */}
            <div className="mt-8">
              <h3 className="flex items-center gap-2 font-display text-xl text-foreground">
                <Building2 className="h-5 w-5 text-gold" />
                <span>สถานที่ศักดิ์สิทธิ์แนะนำสำหรับไหว้แก้ชง</span>
              </h3>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {result.recommendedShrines.map((s, i) => (
                  <div key={i} className="rounded-2xl border border-border bg-card/40 p-4">
                    <div className="text-xs font-semibold text-gold">{s.name}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{s.location}</div>
                    <div className="mt-2 text-xs text-foreground/80">{s.highlight}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* บทสวดบูชาไท้ส่วยเอี๊ย */}
            <div className="mt-8 rounded-2xl border border-gold/25 bg-gold/5 p-6">
              <div className="flex items-center gap-2 text-amber-200 font-semibold text-sm">
                <Scroll className="h-4 w-4 text-gold" />
                <span>บทอธิษฐานจิตและคำสวดฝากดวงชะตากับองค์ไท้ส่วยเอี๊ย</span>
              </div>
              <p className="mt-3 text-sm italic leading-relaxed text-amber-100/90">
                "{result.prayerText}"
              </p>
            </div>
          </div>
        </section>
      </main>

      <ShareStoryModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        data={shareData}
      />

      <SiteFooter />
    </div>
  );
}
