import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { seo, siteUrl } from "@/lib/seo";
import {
  generateAuspiciousDaysForMonth,
  type AuspiciousDayInfo,
} from "@/lib/chinese-calendar";
import { ShareStoryModal, type ShareCardData } from "@/components/share-story-modal";
import { useState } from "react";
import { Share2, ChevronLeft, ChevronRight, Check, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/auspicious-calendar")({
  head: () =>
    seo({
      title: "ปฏิทินฤกษ์มงคล 2569 ฤกษ์ออกรถ ฤกษ์ขึ้นบ้านใหม่ วันธงชัย",
      description:
        "เช็คปฏิทินฤกษ์มงคล 2569 คำนวณวันธงชัย วันอธิบดี ฤกษ์ออกรถใหม่ ฤกษ์ขึ้นบ้านใหม่ ฤกษ์เปิดกิจการ ฤกษ์แต่งงาน และวันชงประจำวันตามศาสตร์ปฏิทินจีน-ไทย",
      path: "/auspicious-calendar",
      canonicalUrl: `${siteUrl}/auspicious-calendar`,
      keywords: [
        "ปฏิทินฤกษ์มงคล",
        "ฤกษ์ออกรถ",
        "ฤกษ์ขึ้นบ้านใหม่",
        "วันธงชัย 2569",
        "ฤกษ์แต่งงาน",
        "ปฏิทินจีน 2569",
        "วันดี",
      ],
    }),
  component: AuspiciousCalendarPage,
});

const FILTER_ACTIVITIES = [
  "ทั้งหมด",
  "ออกรถใหม่",
  "ขึ้นบ้านใหม่",
  "เปิดร้านค้า/กิจการ",
  "เซ็นสัญญาสำคัญ",
  "เสี่ยงโชค",
];

function AuspiciousCalendarPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [selectedFilter, setSelectedFilter] = useState("ทั้งหมด");
  const [activeDay, setActiveDay] = useState<AuspiciousDayInfo | null>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const days = generateAuspiciousDaysForMonth(year, month);

  // กำหนดวันแรกของเดือนตกวันไหนในสัปดาห์ (0 = Sun, ... 6 = Sat)
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay();

  const handlePrevMonth = () => {
    if (month === 1) {
      setYear(year - 1);
      setMonth(12);
    } else {
      setMonth(month - 1);
    }
    setActiveDay(null);
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setYear(year + 1);
      setMonth(1);
    } else {
      setMonth(month + 1);
    }
    setActiveDay(null);
  };

  const MONTH_NAMES = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
  ];

  const shareData: ShareCardData | null = activeDay
    ? {
        category: "ปฏิทินฤกษ์มงคล",
        categoryCn: "吉日吉时",
        title: `ฤกษ์ดี ${activeDay.thaiDateString}`,
        subtitle: `พลังงาน${activeDay.dayQuality} · ${activeDay.elementEnergy}`,
        highlights: [
          { label: "คุณภาพวัน", value: `วัน${activeDay.dayQuality}`, color: activeDay.dayQuality === "ธงชัย" ? "#fbbf24" : "#34d399" },
          { label: "ฤกษ์มงคล", value: activeDay.luckyHours, color: "#fef08a" },
          { label: "ทิศมงคล", value: activeDay.luckyDirection },
          { label: "ชงกับปี", value: activeDay.clashZodiac, color: "#f87171" },
          { label: "กิจกรรมเด่น", value: activeDay.goodActivities.slice(0, 3).join(", ") },
        ],
        quote: `วัน${activeDay.thaiDateString} เป็น${activeDay.dayQuality} เหมาะแก่การ${activeDay.goodActivities.slice(0, 2).join(" และ ")}`,
        footerTag: "เช็คปฏิทินฤกษ์มงคลได้ที่ www.likhitfa.online",
      }
    : null;

  return (
    <div className="relative min-h-screen">
      <SiteHeader subtitle="ปฏิทินฤกษ์มงคล" subtitleCn="择日" />

      <main className="mx-auto max-w-6xl px-5 pt-10 pb-16">
        {/* Banner ส่วนหัว */}
        <section className="glass-strong relative overflow-hidden rounded-3xl p-8 shadow-elegant md:p-10">
          <div className="pointer-events-none absolute -right-6 -top-6 font-cn text-[150px] leading-none text-gold/[0.05]">
            历
          </div>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-3.5 py-1 text-[11px] tracking-wider text-gold">
              <span className="font-cn">通胜择日</span> · ปฏิทินฤกษ์มงคลจีน-ไทย 2569
            </div>
            <h1 className="mt-4 font-display text-3xl text-foreground md:text-5xl">
              ปฏิทินฤกษ์มงคล <span className="text-gradient-gold italic">วันธงชัย & ฤกษ์ดี</span>
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              คำนวณวันมงคล วันธงชัย วันอธิบดี และวันชงประจำวันตามหลักโหราศาสตร์สากล
              เลือกวันดีสำหรับการเริ่มต้นสิ่งสำคัญในชีวิต เพื่อเสริมความเจริญรุ่งเรืองและราบรื่น
            </p>

            {/* ตัวกรองกิจกรรม */}
            <div className="mt-8 flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground mr-1">เลือกฤกษ์ตามกิจกรรม:</span>
              {FILTER_ACTIVITIES.map((act) => (
                <button
                  key={act}
                  onClick={() => setSelectedFilter(act)}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-medium transition ${
                    selectedFilter === act
                      ? "bg-gradient-gold text-primary-foreground shadow-gold"
                      : "border border-border bg-card/60 text-muted-foreground hover:border-gold/40 hover:text-gold"
                  }`}
                >
                  {act}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ตัวควบคุมเดือน */}
        <section className="mt-10">
          <div className="glass-strong flex items-center justify-between rounded-2xl p-4">
            <button
              onClick={handlePrevMonth}
              className="inline-flex items-center gap-1 rounded-xl border border-border px-4 py-2 text-xs text-muted-foreground transition hover:border-gold hover:text-gold"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>เดือนก่อนหน้า</span>
            </button>
            <div className="text-center">
              <h2 className="font-display text-xl text-foreground">
                {MONTH_NAMES[month - 1]} {year + 543}
              </h2>
              <span className="font-cn text-xs text-gold/70">{year} 年 {month} 月</span>
            </div>
            <button
              onClick={handleNextMonth}
              className="inline-flex items-center gap-1 rounded-xl border border-border px-4 py-2 text-xs text-muted-foreground transition hover:border-gold hover:text-gold"
            >
              <span>เดือนถัดไป</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* สัญลักษณ์คำอธิบาย */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50" />
              <span>วันธงชัย (ดีเยี่ยมสูงสุด)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-emerald-500" />
              <span>วันอธิบดี (ก้าวหน้ามั่งคง)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-slate-600" />
              <span>วันมงคลทั่วไป</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-rose-500" />
              <span>วันอุบาทว์ / ควรเลี่ยงงานมงคล</span>
            </div>
          </div>

          {/* ตารางปฏิทิน */}
          <div className="mt-6 glass-strong overflow-hidden rounded-3xl p-4 md:p-6">
            {/* หัววันในสัปดาห์ */}
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-muted-foreground pb-3 border-b border-border">
              <span className="text-rose-400">อาทิตย์</span>
              <span>จันทร์</span>
              <span>อังคาร</span>
              <span>พุธ</span>
              <span>พฤหัสบดี</span>
              <span>ศุกร์</span>
              <span className="text-purple-400">เสาร์</span>
            </div>

            {/* ช่องวันในเดือน */}
            <div className="mt-3 grid grid-cols-7 gap-2">
              {/* เติมช่องว่างก่อนวันแรกของเดือน */}
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-[85px] rounded-2xl bg-transparent" />
              ))}

              {days.map((dayInfo) => {
                const isSelected = activeDay?.date === dayInfo.date;
                const isMatchFilter =
                  selectedFilter === "ทั้งหมด" ||
                  dayInfo.goodActivities.includes(selectedFilter);

                let badgeColor = "border-slate-800 bg-card/40 text-muted-foreground";
                if (dayInfo.dayQuality === "ธงชัย") {
                  badgeColor = "border-amber-500/50 bg-amber-500/10 text-amber-300";
                } else if (dayInfo.dayQuality === "อธิบดี") {
                  badgeColor = "border-emerald-500/50 bg-emerald-500/10 text-emerald-300";
                } else if (dayInfo.dayQuality === "อุบาทว์" || dayInfo.dayQuality === "โลกาวินาศ") {
                  badgeColor = "border-rose-500/30 bg-rose-500/10 text-rose-300";
                }

                return (
                  <button
                    key={dayInfo.date}
                    onClick={() => setActiveDay(dayInfo)}
                    className={`group relative flex min-h-[95px] flex-col justify-between rounded-2xl border p-2.5 text-left transition-all hover:scale-[1.02] ${
                      isSelected
                        ? "border-gold bg-gold/15 shadow-gold"
                        : isMatchFilter
                        ? `${badgeColor} hover:border-gold/50`
                        : "border-border/30 bg-card/20 opacity-40 hover:opacity-100"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-display text-base font-bold text-foreground">
                        {dayInfo.dayOfMonth}
                      </span>
                      <span className="text-[9px] text-muted-foreground">
                        {dayInfo.lunarPhase}
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <div className="text-[10px] font-semibold text-gold line-clamp-1">
                        {dayInfo.dayQuality}
                      </div>
                      <div className="text-[9px] text-muted-foreground line-clamp-1">
                        ชง{dayInfo.clashZodiac}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* การ์ดรายละเอียดวันมงคลที่เลือก */}
        {activeDay && (
          <section className="mt-8 rounded-3xl border border-gold/30 bg-stone-900/60 p-6 md:p-8 shadow-elegant animate-fade-in">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs text-amber-200">
                  <span>วัน{activeDay.dayQuality}</span> · <span>{activeDay.lunarPhase}</span>
                </div>
                <h3 className="mt-2 font-display text-2xl text-foreground md:text-3xl">
                  {activeDay.thaiDateString}
                </h3>
              </div>
              <button
                onClick={() => setIsShareOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-gold/40 bg-gold/10 px-4 py-2 text-xs font-semibold text-gold hover:bg-gold/20"
              >
                <Share2 className="h-4 w-4" />
                <span>แชร์การ์ดฤกษ์วันนี้</span>
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-4">
              <div className="rounded-2xl border border-border bg-card/40 p-4">
                <div className="text-[10px] text-muted-foreground uppercase">AUSPICIOUS TIME</div>
                <div className="mt-1 font-semibold text-gold">{activeDay.luckyHours}</div>
                <div className="text-xs text-muted-foreground mt-1">ช่วงเวลาฤกษ์มงคล</div>
              </div>

              <div className="rounded-2xl border border-border bg-card/40 p-4">
                <div className="text-[10px] text-muted-foreground uppercase">LUCKY DIRECTION</div>
                <div className="mt-1 font-semibold text-foreground">{activeDay.luckyDirection}</div>
                <div className="text-xs text-muted-foreground mt-1">ทิศมงคลนำโชค</div>
              </div>

              <div className="rounded-2xl border border-border bg-card/40 p-4">
                <div className="text-[10px] text-muted-foreground uppercase">ELEMENT ENERGY</div>
                <div className="mt-1 font-semibold text-foreground">{activeDay.elementEnergy}</div>
                <div className="text-xs text-muted-foreground mt-1">พลังงานธาตุประจำวัน</div>
              </div>

              <div className="rounded-2xl border border-rose-500/20 bg-rose-950/20 p-4">
                <div className="text-[10px] text-rose-400 uppercase">CLASH ZODIAC</div>
                <div className="mt-1 font-semibold text-rose-300">{activeDay.clashZodiac}</div>
                <div className="text-xs text-rose-300/70 mt-1">ไม่ควรเป็นประธานในพิธี</div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/15 p-5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                  <Check className="h-4 w-4 shrink-0" />
                  <span>กิจกรรมที่ส่งเสริม (ควรทำ)</span>
                </div>
                <ul className="mt-2.5 space-y-1.5 text-xs text-emerald-200/90">
                  {activeDay.goodActivities.map((g, i) => (
                    <li key={i}>• {g}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-rose-500/30 bg-rose-950/15 p-5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-400">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>กิจกรรมที่ควรระวังหรือหลีกเลี่ยง</span>
                </div>
                <ul className="mt-2.5 space-y-1.5 text-xs text-rose-200/90">
                  {activeDay.badActivities.map((b, i) => (
                    <li key={i}>• {b}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        )}
      </main>

      {shareData && (
        <ShareStoryModal
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
          data={shareData}
        />
      )}

      <SiteFooter />
    </div>
  );
}
