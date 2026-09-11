import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { seo, siteUrl } from "@/lib/seo";
import { BRAHMA_HOUSES, calculateBrahmaHouse, type BrahmaHouse } from "@/lib/brahma-wheel";
import { useState, useRef } from "react";
import {
  Sparkles,
  Compass,
  AlertTriangle,
  Heart,
  Briefcase,
  Coins,
  Activity,
  CheckCircle2,
  Gift,
  RefreshCw,
} from "lucide-react";

export const Route = createFileRoute("/brahma-wheel")({
  head: () =>
    seo({
      title: "กงล้อพรหมชาติโบราณ — พยากรณ์ดวงชะตาตามอายุย่าง 12 ที่นั่ง Likhitfa",
      description:
        "หมุนกงล้อพรหมชาติโบราณ ศาสตร์ทำนายชะตาชีวิตตามอายุย่าง ชายวนขวา หญิงวนซ้าย ตกที่นั่งเจดีย์ ฉัตรเงิน คอขาด ปราสาท พร้อมวิธีทำบุญสะเดาะเคราะห์",
      path: "/brahma-wheel",
      canonicalUrl: `${siteUrl}/brahma-wheel`,
      keywords: [
        "กงล้อพรหมชาติ",
        "ดวงพรหมชาติ",
        "ตำราพรหมชาติ",
        "ดูดวงอายุย่าง",
        "ทำนายดวงตามอายุ",
        "ที่นั่งพรหมชาติ",
        "พรหมชาติ 12 เรือน",
      ],
    }),
  component: BrahmaWheelPage,
});

function BrahmaWheelPage() {
  const [gender, setGender] = useState<"male" | "female">("male");
  const [age, setAge] = useState<number>(28);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedHouse, setSelectedHouse] = useState<BrahmaHouse | null>(null);
  const [rotation, setRotation] = useState(0);
  const wheelRef = useRef<HTMLDivElement>(null);

  const handleSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setSelectedHouse(null);

    const house = calculateBrahmaHouse(age, gender);
    // House 1 is at angle 0. There are 12 houses = 30 deg each.
    // Clockwise or counter-clockwise calculation
    const houseIndex = house.id - 1;
    const targetSliceAngle = (360 / 12) * houseIndex;
    
    // Add multiple full rotations (5 to 7 turns = 1800 - 2520 deg)
    const extraSpins = 360 * 5;
    const finalRotation = rotation + extraSpins + (360 - (rotation % 360)) - targetSliceAngle;

    setRotation(finalRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setSelectedHouse(house);
    }, 3200);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <SiteHeader />

      <main className="mx-auto w-full max-w-5xl px-4 py-12 md:py-16">
        {/* Header Title */}
        <div className="text-center space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-xs text-gold font-medium">
            <Compass className="h-3.5 w-3.5" />
            ศาสตร์ตำราพรหมชาติโบราณ 12 เรือนชะตา
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-medium text-gradient-gold">
            กงล้อพรหมชาติพยากรณ์
          </h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
            คำนวณตามอายุย่างและเพศ ชายเวียนขวา หญิงเวียนซ้าย เปิดเผยที่นั่งชะตาชีวิตประจำปีพร้อมวิธีสะเดาะเคราะห์
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Interactive Wheel Visualizer */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center">
            <div className="relative flex items-center justify-center p-4">
              {/* Pointer at the top */}
              <div className="absolute top-0 z-20 -translate-y-2">
                <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[24px] border-t-gold filter drop-shadow-[0_4px_8px_rgba(212,175,55,0.6)]" />
              </div>

              {/* Outer Golden Ring */}
              <div className="relative h-72 w-72 md:h-96 md:w-96 rounded-full border-4 border-gold/40 p-2 shadow-[0_0_50px_rgba(212,175,55,0.2)] bg-gradient-to-b from-slate-950 to-black">
                {/* Rotating Wheel Container */}
                <div
                  ref={wheelRef}
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    transition: isSpinning ? "transform 3.2s cubic-bezier(0.15, 0.95, 0.35, 1)" : "none",
                  }}
                  className="relative h-full w-full rounded-full overflow-hidden border border-gold/30"
                >
                  {/* 12 Slices */}
                  {Object.values(BRAHMA_HOUSES).map((h, i) => {
                    const angle = (360 / 12) * i;
                    const isGreat = h.quality === "great";
                    const isBad = h.quality === "bad";
                    return (
                      <div
                        key={h.id}
                        className="absolute inset-0 flex items-start justify-center"
                        style={{
                          transform: `rotate(${angle}deg)`,
                          transformOrigin: "50% 50%",
                        }}
                      >
                        <div className="pt-2 text-center select-none">
                          <span
                            className={`block text-[11px] md:text-xs font-semibold ${
                              isGreat
                                ? "text-gold font-bold"
                                : isBad
                                ? "text-rose-400"
                                : "text-slate-300"
                            }`}
                          >
                            {h.name}
                          </span>
                          <span className="text-[9px] text-muted-foreground/60">{h.id}</span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Inner Hub */}
                  <div className="absolute inset-0 m-auto h-24 w-24 md:h-32 md:w-32 rounded-full border-2 border-gold/50 bg-gradient-to-b from-slate-900 via-black to-slate-950 p-2 flex flex-col items-center justify-center text-center shadow-2xl z-10">
                    <div className="text-[10px] tracking-widest text-gold/70 uppercase">BRAHMA</div>
                    <div className="font-display text-sm md:text-base font-bold text-gold">พรหมชาติ</div>
                    <div className="text-[9px] text-muted-foreground">{gender === "male" ? "ชาย ↻" : "หญิง ↺"}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Indicators */}
            <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-gold" /> เรือนมงคล
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-slate-400" /> เรือนกลาง
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-rose-400" /> เรือนเคราะห์
              </span>
            </div>
          </div>

          {/* Right Column: Controls & Input */}
          <div className="lg:col-span-6 space-y-6">
            <div className="rounded-3xl border border-gold/20 bg-card/80 p-6 md:p-8 backdrop-blur-xl shadow-elegant space-y-6">
              <div className="space-y-4">
                {/* Gender Selector */}
                <div>
                  <label className="block text-xs font-semibold text-gold/90 uppercase tracking-wider mb-2">
                    เพศสภาพ (มีผลต่อทิศการนับของดวงชะตา)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setGender("male")}
                      className={`rounded-xl py-3 px-4 text-sm font-semibold transition border ${
                        gender === "male"
                          ? "border-gold bg-gold/15 text-gold shadow-gold"
                          : "border-gold/10 bg-background/60 text-muted-foreground hover:bg-gold/5"
                      }`}
                    >
                      ผู้ชาย (เวียนขวา ตามเข็ม)
                    </button>
                    <button
                      type="button"
                      onClick={() => setGender("female")}
                      className={`rounded-xl py-3 px-4 text-sm font-semibold transition border ${
                        gender === "female"
                          ? "border-gold bg-gold/15 text-gold shadow-gold"
                          : "border-gold/10 bg-background/60 text-muted-foreground hover:bg-gold/5"
                      }`}
                    >
                      ผู้หญิง (เวียนซ้าย ทวนเข็ม)
                    </button>
                  </div>
                </div>

                {/* Age Input */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-semibold text-gold/90 uppercase tracking-wider">
                      อายุย่างในปีนี้ (ปี)
                    </label>
                    <span className="text-xs text-muted-foreground">
                      คำนวณอัตโนมัติ: อายุเต็ม + 1 ปี
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={1}
                      max={120}
                      value={age}
                      onChange={(e) => setAge(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className="w-28 rounded-xl border border-gold/20 bg-background/90 px-4 py-3 text-center text-xl font-bold text-foreground focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                    />
                    <div className="flex-1 flex gap-1.5 flex-wrap">
                      {[18, 25, 30, 36, 42, 49, 60].map((quickAge) => (
                        <button
                          key={quickAge}
                          type="button"
                          onClick={() => setAge(quickAge)}
                          className="rounded-lg border border-gold/10 bg-gold/5 px-2.5 py-1 text-xs text-gold hover:bg-gold/15 transition"
                        >
                          {quickAge} ปี
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                disabled={isSpinning}
                onClick={handleSpin}
                className="w-full rounded-2xl bg-gradient-gold py-4 text-base font-semibold text-primary-foreground shadow-gold hover:scale-[1.01] active:scale-[0.99] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSpinning ? (
                  <>
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    กำลังหมุนกงล้อดวงชะตา...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    หมุนกงล้อพรหมชาติพยากรณ์ ➔
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Selected House Prediction Display */}
        {selectedHouse && (
          <div className="mt-12 rounded-3xl border border-gold/30 bg-card/90 p-6 md:p-10 backdrop-blur-2xl shadow-elegant animate-in fade-in slide-in-from-bottom-6 duration-500 space-y-8">
            {/* Header Badge */}
            <div className="text-center space-y-2 border-b border-gold/15 pb-6">
              <span
                className={`inline-block px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                  selectedHouse.quality === "great"
                    ? "bg-gold/15 text-gold border border-gold/30"
                    : selectedHouse.quality === "bad"
                    ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                    : "bg-slate-500/15 text-slate-300 border border-slate-500/30"
                }`}
              >
                อายุย่าง {age} ปี ({gender === "male" ? "ชาย" : "หญิง"}) • ที่นั่งที่ {selectedHouse.id}
              </span>
              <h2 className="text-3xl md:text-4xl font-display font-medium text-gradient-gold">
                {selectedHouse.title}
              </h2>
              <p className="text-sm md:text-base text-foreground/90 max-w-2xl mx-auto leading-relaxed pt-2">
                {selectedHouse.description}
              </p>
            </div>

            {/* 4 Life Aspects */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-gold/15 bg-background/50 p-5 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
                  <Briefcase className="h-4 w-4 text-gold" />
                  การงานและหน้าที่
                </div>
                <p className="text-xs md:text-sm text-foreground/90 leading-relaxed">
                  {selectedHouse.career}
                </p>
              </div>

              <div className="rounded-2xl border border-gold/15 bg-background/50 p-5 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
                  <Coins className="h-4 w-4 text-emerald-400" />
                  การเงินและโชคลาภ
                </div>
                <p className="text-xs md:text-sm text-foreground/90 leading-relaxed">
                  {selectedHouse.wealth}
                </p>
              </div>

              <div className="rounded-2xl border border-gold/15 bg-background/50 p-5 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-rose-300">
                  <Heart className="h-4 w-4 text-rose-400" />
                  ความรักและความสัมพันธ์
                </div>
                <p className="text-xs md:text-sm text-foreground/90 leading-relaxed">
                  {selectedHouse.love}
                </p>
              </div>

              <div className="rounded-2xl border border-gold/15 bg-background/50 p-5 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-sky-300">
                  <Activity className="h-4 w-4 text-sky-400" />
                  สุขภาพและร่างกาย
                </div>
                <p className="text-xs md:text-sm text-foreground/90 leading-relaxed">
                  {selectedHouse.health}
                </p>
              </div>
            </div>

            {/* Cautions & Remedies */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-5 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-rose-400">
                  <AlertTriangle className="h-4 w-4" />
                  ข้อควรระวังประจำปี
                </div>
                <p className="text-xs md:text-sm text-foreground/90 leading-relaxed">
                  {selectedHouse.cautions}
                </p>
              </div>

              <div className="rounded-2xl border border-gold/30 bg-gold/5 p-5 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-gold">
                  <Gift className="h-4 w-4" />
                  แนวทางการทำบุญสะเดาะเคราะห์ & เสริมบารมี
                </div>
                <p className="text-xs md:text-sm text-foreground/90 leading-relaxed">
                  {selectedHouse.blessingRemedy}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
