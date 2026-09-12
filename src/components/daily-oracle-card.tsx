import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Sparkles, RotateCcw, Compass, ArrowRight, Share2, Volume2, ShieldCheck, Flame } from "lucide-react";

interface OracleReading {
  title: string;
  prophecy: string;
  element: string;
  elementColor: string;
  luckyNumbers: string;
  auspiciousColor: string;
  caiShenDirection: string;
  mindfulAdvice: string;
  bestHour: string;
}

const ORACLES: OracleReading[] = [
  {
    title: "ฟ้าเปิดรับทรัพย์ · ดาวพฤหัสบดีส่องสว่าง",
    prophecy: "จังหวะฟ้าเปิดรับพลังงานบวกสูงสุดในรอบสัปดาห์ สิ่งที่ตั้งใจเจรจาหรือเริ่มลงมือทำจะได้รับการเกื้อหนุน มีเกณฑ์พบกัลยาณมิตรหรือผู้ใหญ่อุปถัมภ์",
    element: "ธาตุทอง 🪙 (เสริมบารมี & วาสนา)",
    elementColor: "text-amber-300",
    luckyNumbers: "8 · 28 · 789",
    auspiciousColor: "สีเหลืองทอง และ สีเขียวเหนี่ยวทรัพย์",
    caiShenDirection: "ทิศตะวันออกเฉียงเหนือ (ทิศเศรษฐี)",
    mindfulAdvice: "ตั้งสมาธิยามเช้า ดื่มน้ำสะอาด 1 แก้ว เจรจาด้วยความอ่อนน้อมจะเปลี่ยนวิกฤตเป็นโอกาส",
    bestHour: "09:09 - 11:29 น. (ยามมะเส็งรับทรัพย์)",
  },
  {
    title: "มังกรผงาดฟ้า · ชัยชนะและการงานก้าวหน้า",
    prophecy: "พลังหยางกำลังไหลเวียนเข้ามาทดแทนความติดขัด อุปสรรคที่เคยสะดุดจะเริ่มคลี่คลายอย่างน่าอัศจรรย์ จงมั่นใจในความสามารถของตนเองแล้วลุยให้เต็มที่",
    element: "ธาตุไฟ 🔥 (เสริมอำนาจ & ความเฉียบขาด)",
    elementColor: "text-rose-400",
    luckyNumbers: "9 · 39 · 459",
    auspiciousColor: "สีแดงทับทิม และ สีส้มอิฐ",
    caiShenDirection: "ทิศใต้ (ทิศมังกรไฟ)",
    mindfulAdvice: "อย่าลังเลกับโอกาสที่เข้ามาอย่างกะทันหัน ตัดสินใจบนความถูกต้องแล้วผลลัพธ์จะงดงาม",
    bestHour: "13:00 - 14:59 น. (ยามมะแมแห่งมิตรภาพ)",
  },
  {
    title: "สายน้ำหลั่งไหล · โชคลาภและการเงินหมุนเวียน",
    prophecy: "กระแสการเงินและลาภลอยมีความคล่องตัวเป็นพิเศษ มีโอกาสได้รับข่าวดีเรื่องเงินก้อน หนี้สินได้รับการชำระ หรือมีโชคจากการค้าขายและสลากมงคล",
    element: "ธาตุน้ำ 💧 (เสริมความลื่นไหล & สติปัญญา)",
    elementColor: "text-sky-400",
    luckyNumbers: "1 · 16 · 816",
    auspiciousColor: "สีน้ำเงินเข้ม และ สีดำประกายทอง",
    caiShenDirection: "ทิศเหนือ (ทิศทรัพย์คงคามังกร)",
    mindfulAdvice: "แบ่งเงินทำบุญเล็กๆ น้อยๆ หรือปล่อยปลา เพื่อเปิดทางกระแสทรัพย์ให้ไหลเวียนไม่ขาดสาย",
    bestHour: "07:00 - 08:59 น. (ยามมะโรงเปิดคลัง)",
  },
  {
    title: "พสุธามั่นคง · ความสุขสงบและความรักสมหวัง",
    prophecy: "ดวงความสัมพันธ์ราบรื่น อบอุ่น มีความเข้าใจซึ่งกันและกัน ใครที่กำลังรอคอยความชัดเจนจะได้รับคำตอบที่ดีเยี่ยม ครอบครัวเกื้อกูล",
    element: "ธาตุดิน ⛰️ (เสริมความมั่นคง & หนักแน่น)",
    elementColor: "text-amber-400",
    luckyNumbers: "5 · 56 · 652",
    auspiciousColor: "สีครีมเอิร์ธโทน และ สีชมพูกลีบบัว",
    caiShenDirection: "ทิศตะวันตกเฉียงใต้ (ทิศความรักสุขสม)",
    mindfulAdvice: "รับฟังคนรอบข้างให้มากขึ้น การให้เกียรติซึ่งกันและกันคือเคล็ดลับดวงมหาเสน่ห์ที่ดีที่สุด",
    bestHour: "15:00 - 16:59 น. (ยามวอกคล่องตัว)",
  },
  {
    title: "พฤกษาผลิใบ · ความคิดสร้างสรรค์และโอกาสใหม่",
    prophecy: "สมองปลอดโปร่ง ไอเดียใหม่ๆ จะสร้างผลตอบแทนมหาศาล เหมาะแก่การศึกษาหาความรู้ วางแผนการลงทุน หรือเปิดตัวผลงานใหม่",
    element: "ธาตุไม้ 🌿 (เสริมการเติบโต & ชีวิตชีวา)",
    elementColor: "text-emerald-400",
    luckyNumbers: "3 · 38 · 838",
    auspiciousColor: "สีเขียวใบตอง และ สีเทาพรีเมียม",
    caiShenDirection: "ทิศตะวันออก (ทิศรุ่งอรุณ)",
    mindfulAdvice: "อย่ากลัวความผิดพลาด ทุกการเรียนรู้คือก้าวสำคัญสู่ความสำเร็จที่ยั่งยืน",
    bestHour: "05:00 - 06:59 น. (ยามเถาะแห่งรุ่งเช้า)",
  },
];

function playOracleChime() {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // Singing bowl harmonic fundamental
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = "sine";
    osc2.type = "triangle";
    osc1.frequency.setValueAtTime(528, ctx.currentTime); // 528Hz Solfeggio Miracle Frequency
    osc2.frequency.setValueAtTime(532, ctx.currentTime); // Gentle beat frequency

    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 3.5);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(ctx.currentTime + 3.6);
    osc2.stop(ctx.currentTime + 3.6);
  } catch {}
}

export function DailyOracleCard() {
  const [isOpen, setIsOpen] = useState(false);
  const [reading, setReading] = useState<OracleReading>(ORACLES[0]);
  const [animating, setAnimating] = useState(false);

  const handleReveal = () => {
    setAnimating(true);
    playOracleChime();

    // Pick deterministic oracle based on day of year + seed, or cycle
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    const nextIdx = (dayOfYear + Math.floor(Math.random() * ORACLES.length)) % ORACLES.length;
    setReading(ORACLES[nextIdx]);

    setTimeout(() => {
      setIsOpen(true);
      setAnimating(false);
    }, 600);
  };

  const handleDrawAgain = () => {
    setAnimating(true);
    playOracleChime();
    setTimeout(() => {
      const randomIdx = Math.floor(Math.random() * ORACLES.length);
      setReading(ORACLES[randomIdx]);
      setAnimating(false);
    }, 500);
  };

  return (
    <div className="relative mx-auto max-w-2xl">
      {!isOpen ? (
        /* ============================================================== */
        /* STAGE 1: MYSTICAL INTERACTIVE CRYSTAL ORACLE SPHERE            */
        /* ============================================================== */
        <div className="group relative overflow-hidden rounded-3xl border-2 border-gold/40 bg-gradient-to-b from-[#151a28]/95 via-[#0b0e17]/95 to-[#04060b]/95 p-8 text-center shadow-[0_0_50px_rgba(212,175,55,0.25)] backdrop-blur-xl transition duration-500 hover:border-gold hover:shadow-[0_0_80px_rgba(212,175,55,0.4)]">
          
          {/* Celestial Aura Behind Sphere */}
          <div className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 h-64 w-64 rounded-full bg-gold/15 blur-3xl group-hover:bg-gold/25 transition-all duration-700" />

          {/* Golden Chinese Glyphs Floating */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-6 font-cn text-4xl font-bold text-gold/[0.08] select-none">
            <span className="animate-pulse">乾</span>
            <span className="animate-pulse delay-100">坤</span>
            <span className="animate-pulse delay-200">坎</span>
            <span className="animate-pulse delay-300">离</span>
          </div>

          <div className="relative z-10 flex flex-col items-center">
            
            {/* The 3D Glowing Crystal Orb */}
            <button
              type="button"
              onClick={handleReveal}
              disabled={animating}
              className="group/orb relative flex h-36 w-36 sm:h-44 sm:w-44 items-center justify-center cursor-pointer transition-transform duration-700 hover:scale-105"
              aria-label="เปิดรหัสฟ้าประจำวัน"
            >
              {/* Outer Pulsing Rings */}
              <div className="absolute inset-0 rounded-full border border-gold/40 animate-ping opacity-30" />
              <div className="absolute -inset-3 rounded-full border-2 border-dashed border-gold/30 animate-[spin_60s_linear_infinite]" />
              <div className="absolute -inset-6 rounded-full border border-gold/15 animate-[spin_40s_linear_infinite_reverse]" />

              {/* Crystal Ball Sphere */}
              <div className={`relative h-full w-full rounded-full bg-gradient-to-br from-[#fef08a] via-[#f59e0b] to-[#1c1917] p-1 shadow-[0_0_40px_rgba(251,191,36,0.6)] ${animating ? "animate-spin" : ""}`}>
                <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-gradient-to-b from-[#181d2e] via-[#090c14] to-black">
                  {/* Swirling Nebula Inside Orb */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(254,240,138,0.4)_0%,transparent_60%)] animate-pulse" />
                  
                  {/* Golden Astrological Star Rune in Center */}
                  <div className="relative font-cn text-5xl sm:text-6xl text-gold drop-shadow-[0_0_20px_#fbbf24] transition duration-500 group-hover/orb:scale-110">
                    命
                  </div>

                  {/* Surface Glare Reflection */}
                  <div className="pointer-events-none absolute left-3 top-3 h-10 w-16 rounded-full bg-gradient-to-b from-white/40 to-transparent blur-xs transform -rotate-45" />
                </div>
              </div>
            </button>

            <div className="mt-6">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3.5 py-1 text-xs font-semibold text-gold shadow-inner">
                <Sparkles className="h-3.5 w-3.5 animate-spin" />
                <span>แท่นพยากรณ์ชะตาฟ้าประทาน (Daily Oracle)</span>
              </span>
              <h3 className="mt-3 font-display text-2xl font-bold text-foreground sm:text-3xl">
                แตะลูกแก้วเพื่อ <span className="text-gradient-gold">เปิดรหัสฟ้าประจำวันของคุณ</span>
              </h3>
              <p className="mt-2 max-w-md text-xs text-muted-foreground sm:text-sm">
                เช็คกระแสพลังงานดวงดาว ทิศรับทรัพย์ไฉ่ซิงเอี้ย เลขนำโชค และคำพยากรณ์เตือนสติใน 3 วินาที
              </p>
            </div>

            {/* CTA Button */}
            <button
              type="button"
              onClick={handleReveal}
              disabled={animating}
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-gold px-8 py-3.5 text-sm font-bold text-primary-foreground shadow-gold transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              <span>{animating ? "กำลังเชื่อมกระแสดวงดาว..." : "เปิดคำทำนายฟ้าประจำวัน 🔮"}</span>
            </button>
          </div>
        </div>
      ) : (
        /* ============================================================== */
        /* STAGE 2: REVEALED DAILY DESTINY PROPHECY CARD                  */
        /* ============================================================== */
        <div className="relative overflow-hidden rounded-3xl border-2 border-gold/60 bg-gradient-to-b from-[#181d2c] via-[#0d101a] to-[#05070d] p-6 sm:p-8 shadow-[0_0_70px_rgba(212,175,55,0.35)] backdrop-blur-2xl animate-fade-in">
          
          {/* Top Header Badge */}
          <div className="flex items-center justify-between border-b border-gold/20 pb-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/15 px-3 py-1 text-xs font-semibold text-gold">
              <Sparkles className="h-3.5 w-3.5" />
              <span>รหัสฟ้าประจำวันของคุณ · สำเร็จสมปรารถนา</span>
            </div>
            
            <button
              type="button"
              onClick={handleDrawAgain}
              disabled={animating}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gold/30 bg-gold/10 px-3 py-1.5 text-xs text-gold hover:bg-gold/20 transition cursor-pointer"
              title="สุ่มเปิดคำทำนายใหม่อีกครั้ง"
            >
              <RotateCcw className={`h-3.5 w-3.5 ${animating ? "animate-spin" : ""}`} />
              <span>ขอพรใหม่</span>
            </button>
          </div>

          {/* Prophecy Title & Description */}
          <div className="mt-5 text-center">
            <h3 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
              {reading.title}
            </h3>
            <p className="mt-3 rounded-2xl border border-gold/20 bg-black/40 p-4 text-sm leading-relaxed text-slate-200 italic shadow-inner">
              &ldquo;{reading.prophecy}&rdquo;
            </p>
          </div>

          {/* 4 Dimension Highlights Grid */}
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            
            {/* 1. Lucky Numbers */}
            <div className="rounded-2xl border border-gold/30 bg-gold/5 p-3.5 text-left">
              <div className="text-[11px] text-muted-foreground flex items-center justify-between">
                <span>เลขมงคลนำโชควันนี้</span>
                <span className="text-xs">✨</span>
              </div>
              <div className="mt-1 font-display text-2xl font-bold tracking-wider text-gold">
                {reading.luckyNumbers}
              </div>
            </div>

            {/* 2. Auspicious Color */}
            <div className="rounded-2xl border border-gold/30 bg-gold/5 p-3.5 text-left">
              <div className="text-[11px] text-muted-foreground">สีเสื้อมงคลเสริมพลัง</div>
              <div className="mt-1 font-semibold text-amber-200 text-sm">
                {reading.auspiciousColor}
              </div>
            </div>

            {/* 3. Wealth Direction */}
            <div className="rounded-2xl border border-gold/30 bg-gold/5 p-3.5 text-left">
              <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Compass className="h-3 w-3 text-gold" />
                <span>ทิศไฉ่ซิงเอี้ยรับทรัพย์</span>
              </div>
              <div className="mt-1 font-semibold text-foreground text-sm">
                {reading.caiShenDirection}
              </div>
            </div>

            {/* 4. Best Auspicious Hour */}
            <div className="rounded-2xl border border-gold/30 bg-gold/5 p-3.5 text-left">
              <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Flame className="h-3 w-3 text-gold" />
                <span>ช่วงเวลาทองคำ (ยามดี)</span>
              </div>
              <div className="mt-1 font-semibold text-emerald-300 text-sm">
                {reading.bestHour}
              </div>
            </div>
          </div>

          {/* Mindful Advice Callout */}
          <div className="mt-4 rounded-xl border border-gold/15 bg-black/50 p-3 text-xs text-slate-300 text-left">
            <span className="font-semibold text-gold">ข้อคิดลิขิตฟ้า: </span>
            {reading.mindfulAdvice}
          </div>

          {/* Deep Exploration CTAs */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 pt-2 border-t border-gold/15">
            <Link
              to="/bazi"
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-gold px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-gold hover:scale-[1.02] transition"
            >
              <span>วิเคราะห์ปาจื้อ 4 เสาชะตา</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            <Link
              to="/virtual-shrine"
              className="inline-flex items-center gap-1.5 rounded-xl border border-gold/40 bg-gold/10 px-4 py-2.5 text-xs font-semibold text-gold hover:bg-gold/20 transition"
            >
              <span>ไหว้พระ 10 วัดดัง</span>
              <span>🪷</span>
            </Link>

            <Link
              to="/tarot"
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-slate-300 hover:bg-white/10 transition"
            >
              <span>เปิดไพ่ยิปซี</span>
              <span>🔮</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
