import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { seo, siteUrl } from "@/lib/seo";
import { calculateLifeGraph, type LifeGraphResult, type LifeGraphHouse } from "@/lib/life-graph";
import { ShareStoryModal, type ShareCardData } from "@/components/share-story-modal";
import { readStoredUserSession } from "@/lib/user-session";
import { recordDivinationHistory } from "@/lib/member-history";
import { useState, useMemo, useEffect } from "react";
import { TrendingUp, Share2, Sparkles, Bookmark, Check } from "lucide-react";

export const Route = createFileRoute("/life-graph")({
  head: () =>
    seo({
      title: "ดูกราฟชีวิต 12 เรือนชะตา — วิเคราะห์กราฟชีวิตแม่นๆ ช่วงวัยรุ่งเรืองที่สุด ฟรี",
      description:
        "โปรแกรมคำนวณกราฟชีวิต 12 เรือนชะตา (วาสนา ทรัพย์ เพื่อน ญาติ บริวาร ศัตรู คู่ครอง โรคภัย ความสุข การงาน ลาภยศ หายนะ) พล็อตเส้นกราฟชีวิต 1-12 แต้ม ชี้จุดรุ่งเรืองและช่วงอายุทองคำ",
      path: "/life-graph",
      canonicalUrl: `${siteUrl}/life-graph`,
      keywords: [
        "กราฟชีวิต",
        "ดูกราฟชีวิต",
        "กราฟชีวิต 12 เรือน",
        "กราฟชีวิต 2569",
        "ดูดวงกราฟชีวิต",
        "กราฟชีวิตแม่นๆ",
        "คำนวณกราฟชีวิต",
        "ช่วงอายุรุ่งเรือง",
        "Likhitfa",
      ],
    }),
  component: LifeGraphPage,
});

function LifeGraphPage() {
  const session = readStoredUserSession();
  const defaultDate = session?.profile?.birthDate || "1995-06-15";

  const [birthDate, setBirthDate] = useState(defaultDate);
  const [selectedHouse, setSelectedHouse] = useState<LifeGraphHouse | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const result: LifeGraphResult = useMemo(() => {
    return calculateLifeGraph(birthDate);
  }, [birthDate]);

  const handleSaveToHistory = () => {
    recordDivinationHistory({
      type: "กราฟชีวิต",
      title: `กราฟชีวิต: ${result.dayName} ปี${result.zodiacYearName}`,
      result: `ดัชนีเฉลี่ย ${result.averageScore}/12 · เรือนเด่นสุด: ${result.highestHouse.name} (${result.highestHouse.score} แต้ม)`,
      url: "/life-graph",
      metadata: {
        birthDate,
        dayName: result.dayName,
        zodiacYear: result.zodiacYearName,
        highestHouse: result.highestHouse.name,
        lowestHouse: result.lowestHouse.name,
        averageScore: result.averageScore,
      },
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const activeHouse = selectedHouse || result.highestHouse;

  const shareData: ShareCardData = {
    category: "กราฟชีวิต 12 เรือนชะตา",
    categoryCn: "命运图表",
    title: `กราฟชีวิต: ${result.dayName} · ปี${result.zodiacYearName}`,
    subtitle: `จุดเด่นสูงสุด: เรือน${result.highestHouse.name} (${result.highestHouse.score}/12 แต้ม)`,
    highlights: [
      { label: "คะแนนเฉลี่ยชีวิต", value: `${result.averageScore} / 12`, color: "#fbbf24" },
      { label: "เรือนเด่นที่สุด", value: `${result.highestHouse.name} (${result.highestHouse.score} แต้ม)`, color: "#34d399" },
      { label: "เรือนที่ต้องระวัง", value: `${result.lowestHouse.name} (${result.lowestHouse.score} แต้ม)`, color: "#f87171" },
      { label: "เกณฑ์ดวงชะตา", value: result.highestHouse.grade === "excellent" ? "มหาศุภมงคล" : "เจริญก้าวหน้า", color: "#fef08a" },
    ],
    quote: result.overallSummary,
    footerTag: "คำนวณกราฟชีวิตแม่นยำที่ Likhitfa.online",
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader subtitle="กราฟชีวิต 12 เรือน" subtitleCn="命盤圖" />

      <main className="mx-auto max-w-6xl px-4 py-10 md:px-8">
        {/* Header Hero */}
        <section className="text-center">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-xs tracking-widest text-gold">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>THAI LIFE GRAPH ANALYSIS</span>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-5xl">
            ดูดวง<span className="text-gradient-gold">กราฟชีวิต 12 เรือน</span>
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground md:text-base">
            ศาสตร์พยากรณ์ไทยโบราณ ผูกดวงชะตาจากวัน เดือน และปีนักษัตร
            พล็อตเป็นเส้นกราฟพลังชีวิต 12 มิติ เผยจุดสูงสุดของวาสนาและช่วงอายุทองคำ
          </p>
        </section>

        {/* Date Selector Box */}
        <section className="mx-auto mt-8 max-w-xl rounded-2xl border border-gold/20 bg-card/60 p-6 backdrop-blur-md shadow-elegant">
          <label className="block text-xs font-semibold uppercase tracking-wider text-gold/80 mb-2">
            เลือกวันเดือนปีเกิดของคุณ
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="date"
              value={birthDate}
              onChange={(e) => {
                setBirthDate(e.target.value);
                setIsSaved(false);
              }}
              className="flex-1 rounded-xl border border-gold/30 bg-background/80 px-4 py-2.5 text-sm text-foreground focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
            />
            <button
              onClick={handleSaveToHistory}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition cursor-pointer ${
                isSaved
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                  : "border border-gold/40 bg-gold/10 text-gold hover:bg-gold/20"
              }`}
            >
              {isSaved ? (
                <>
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span>บันทึกแล้ว</span>
                </>
              ) : (
                <>
                  <Bookmark className="h-4 w-4" />
                  <span>บันทึกผล</span>
                </>
              )}
            </button>
            <button
              onClick={() => setShareModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-gold px-5 py-2.5 text-sm font-semibold text-stone-950 shadow-gold transition hover:opacity-90 cursor-pointer"
            >
              <Share2 className="h-4 w-4" />
              <span>แชร์การ์ด</span>
            </button>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between text-xs text-muted-foreground">
            <span>เกิดวัน: <strong className="text-gold">{result.dayName}</strong></span>
            <span>ปีนักษัตร: <strong className="text-gold">{result.zodiacYearName}</strong></span>
            <span>ดัชนีพลังชีวิต: <strong className="text-gold">{result.averageScore} / 12</strong></span>
          </div>
        </section>

        {/* Overall Summary Card */}
        <section className="mx-auto mt-8 max-w-4xl rounded-2xl border border-gold/20 bg-gold/5 p-6 backdrop-blur-md">
          <div className="flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold/15 text-gold">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <h2 className="font-display text-lg font-semibold text-gold">ภาพรวมดวงชะตากราฟชีวิต</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{result.overallSummary}</p>
            </div>
          </div>
        </section>

        {/* Interactive Visual Graph (SVG Chart) */}
        <section className="mx-auto mt-10 max-w-5xl rounded-3xl border border-gold/20 bg-card/40 p-6 md:p-8 backdrop-blur-md shadow-elegant">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="font-display text-xl font-bold text-foreground">เส้นกราฟพลังชีวิต 12 เรือน</h3>
              <p className="text-xs text-muted-foreground">คลิกที่แต่ละจุดบนกราฟหรือการ์ดด้านล่างเพื่ออ่านคำทำนายเจาะลึก</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-emerald-400"></span> 10-12 ยอดเยี่ยม</span>
              <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-blue-400"></span> 7-9 ดี</span>
              <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-amber-400"></span> 4-6 ปานกลาง</span>
              <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-rose-400"></span> 1-3 ต้องระวัง</span>
            </div>
          </div>

          {/* SVG Chart Rendering */}
          <div className="relative w-full overflow-x-auto pb-2">
            <svg viewBox="0 0 900 320" className="w-full min-w-[700px] h-64 overflow-visible">
              <defs>
                <linearGradient id="goldAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(217, 119, 6, 0.4)" />
                  <stop offset="100%" stopColor="rgba(217, 119, 6, 0.0)" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[12, 9, 6, 3].map((val) => {
                const y = 260 - (val / 12) * 220;
                return (
                  <g key={val}>
                    <line x1="40" y1={y} x2="880" y2={y} stroke="rgba(217, 119, 6, 0.15)" strokeDasharray="3 3" />
                    <text x="25" y={y + 4} fill="rgba(217, 119, 6, 0.6)" fontSize="10" textAnchor="end">{val}</text>
                  </g>
                );
              })}

              {/* Area under line */}
              <polygon
                points={`
                  40,260
                  ${result.houses.map((h, i) => {
                    const x = 50 + i * 72;
                    const y = 260 - (h.score / 12) * 220;
                    return `${x},${y}`;
                  }).join(" ")}
                  842,260
                `}
                fill="url(#goldAreaGrad)"
              />

              {/* Connecting Line */}
              <polyline
                fill="none"
                stroke="url(#gradientGold)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={result.houses.map((h, i) => {
                  const x = 50 + i * 72;
                  const y = 260 - (h.score / 12) * 220;
                  return `${x},${y}`;
                }).join(" ")}
              />

              {/* Data Points */}
              {result.houses.map((h, i) => {
                const x = 50 + i * 72;
                const y = 260 - (h.score / 12) * 220;
                const isSelected = activeHouse.id === h.id;

                let dotColor = "#f59e0b";
                if (h.score >= 10) dotColor = "#10b981";
                else if (h.score >= 7) dotColor = "#3b82f6";
                else if (h.score <= 3) dotColor = "#f43f5e";

                return (
                  <g
                    key={h.id}
                    className="cursor-pointer transition-transform hover:scale-125"
                    onClick={() => setSelectedHouse(h)}
                  >
                    <circle
                      cx={x}
                      cy={y}
                      r={isSelected ? "7" : "5"}
                      fill={dotColor}
                      stroke="#0c0a09"
                      strokeWidth={isSelected ? "3" : "2"}
                    />
                    {isSelected && (
                      <circle cx={x} cy={y} r="12" fill="none" stroke={dotColor} strokeWidth="1.5" className="animate-ping" />
                    )}
                    <text
                      x={x}
                      y={y - 12}
                      fill={isSelected ? "#fbbf24" : "rgba(255,255,255,0.8)"}
                      fontSize="11"
                      fontWeight={isSelected ? "bold" : "normal"}
                      textAnchor="middle"
                    >
                      {h.score}
                    </text>
                    <text
                      x={x}
                      y="285"
                      fill={isSelected ? "#fbbf24" : "rgba(255,255,255,0.7)"}
                      fontSize="11"
                      fontWeight={isSelected ? "600" : "normal"}
                      textAnchor="middle"
                    >
                      {h.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Active House Detail Callout */}
          <div className="mt-6 rounded-2xl border border-gold/30 bg-card/80 p-5 backdrop-blur-md">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-gold/10 pb-3">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/20 font-display text-xl text-gold">
                  {activeHouse.id}
                </span>
                <div>
                  <h4 className="font-display text-lg font-bold text-foreground">
                    เรือน{activeHouse.name} <span className="font-cn text-gold/70">({activeHouse.nameCn})</span>
                  </h4>
                  <p className="text-xs text-muted-foreground">{activeHouse.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gold">{activeHouse.score} / 12 แต้ม</span>
                <span
                  className={`rounded-full px-3 py-0.5 text-xs font-medium ${
                    activeHouse.grade === "excellent"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : activeHouse.grade === "good"
                      ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                      : activeHouse.grade === "moderate"
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                  }`}
                >
                  {activeHouse.grade === "excellent"
                    ? "ดีเยี่ยม รุ่งเรือง"
                    : activeHouse.grade === "good"
                    ? "ดี ราบรื่น"
                    : activeHouse.grade === "moderate"
                    ? "ปานกลาง"
                    : "ต้องระมัดระวัง"}
                </span>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <p className="text-sm leading-relaxed text-foreground/90">
                <strong className="text-gold">คำทำนาย: </strong>
                {activeHouse.reading}
              </p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                <strong className="text-gold/80">เคล็ดลับเสริมดวง: </strong>
                {activeHouse.advice}
              </p>
            </div>
          </div>
        </section>

        {/* 12 House Grid Cards */}
        <section className="mx-auto mt-12 max-w-5xl">
          <h3 className="font-display text-xl font-bold text-foreground mb-4">
            คำพยากรณ์เจาะลึกครบทั้ง 12 เรือนชะตา
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {result.houses.map((house) => {
              const isSelected = activeHouse.id === house.id;
              return (
                <div
                  key={house.id}
                  onClick={() => setSelectedHouse(house)}
                  className={`group cursor-pointer rounded-2xl border p-4 transition-all ${
                    isSelected
                      ? "border-gold bg-gold/15 shadow-gold"
                      : "border-gold/15 bg-card/40 hover:border-gold/40 hover:bg-card/70"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gold/10 text-xs font-bold text-gold">
                        {house.id}
                      </span>
                      <span className="font-display font-semibold text-foreground group-hover:text-gold transition-colors">
                        เรือน{house.name}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-gold">{house.score} แต้ม</span>
                  </div>
                  <p className="text-xs line-clamp-2 text-muted-foreground group-hover:text-foreground/80 transition-colors">
                    {house.reading}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Golden Age Timeline */}
        <section className="mx-auto mt-14 max-w-5xl rounded-3xl border border-gold/20 bg-card/40 p-6 md:p-8 backdrop-blur-md">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-2xl">⏳</span>
            <div>
              <h3 className="font-display text-xl font-bold text-foreground">ช่วงวัยและจังหวะชีวิต (Age Timeline)</h3>
              <p className="text-xs text-muted-foreground">การหมุนเวียนของพลังงานชะตาชีวิตตามรอบอายุ</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {result.goldenAges.map((age, i) => (
              <div key={i} className="rounded-xl border border-gold/15 bg-gold/5 p-4">
                <div className="text-xs font-semibold text-gold mb-1">{age.ageRange}</div>
                <div className="text-sm font-bold text-foreground mb-1.5">เด่นในเรือน{age.houseName}</div>
                <p className="text-xs text-muted-foreground leading-relaxed">{age.highlight}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />

      <ShareStoryModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        data={shareData}
      />
    </div>
  );
}
