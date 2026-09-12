import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { seo, siteUrl } from "@/lib/seo";
import { analyzeLicensePlate, type PlateAnalysisResult } from "@/lib/plate-analysis";
import { recordDivinationHistory } from "@/lib/member-history";
import { ShareStoryModal, type ShareCardData } from "@/components/share-story-modal";
import { useState } from "react";
import {
  Car,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  Award,
  AlertTriangle,
  Palette,
  CheckCircle2,
  Lightbulb,
  Share2,
} from "lucide-react";

export const Route = createFileRoute("/plate-analysis")({
  head: () =>
    seo({
      title: "วิเคราะห์ทะเบียนรถมงคล — ถอดรหัสเลขศาสตร์ & ทักษาปกรณ์สีรถ Likhitfa",
      description:
        "ตรวจผลรวมทะเบียนรถมงคล วิเคราะห์คู่เลขแคล้วคลาด ปลอดภัย เรียกทรัพย์ และบารมี พร้อมเช็คสีรถถูกโฉลกตามวันเกิดและวิธีแก้เคล็ดทะเบียนรถ",
      path: "/plate-analysis",
      canonicalUrl: `${siteUrl}/plate-analysis`,
      keywords: [
        "วิเคราะห์ทะเบียนรถ",
        "ทะเบียนรถมงคล",
        "ผลรวมทะเบียนรถ",
        "ดูดวงทะเบียนรถ",
        "สีรถถูกโฉลก",
        "เลขทะเบียนมงคล",
        "ตรวจทะเบียนรถ",
      ],
    }),
  component: PlateAnalysisPage,
});

const POPULAR_EXAMPLES = ["1กก 9999", "ขข 168", "9กข 4567", "5กฬ 8888", "3กค 1542"];

const BIRTH_DAYS = [
  { key: "sunday", label: "วันอาทิตย์" },
  { key: "monday", label: "วันจันทร์" },
  { key: "tuesday", label: "วันอังคาร" },
  { key: "wednesday_day", label: "วันพุธ (กลางวัน 06:00-17:59)" },
  { key: "wednesday_night", label: "วันพุธ (กลางคืน 18:00-05:59)" },
  { key: "thursday", label: "วันพฤหัสบดี" },
  { key: "friday", label: "วันศุกร์" },
  { key: "saturday", label: "วันเสาร์" },
];

function PlateAnalysisPage() {
  const [plateInput, setPlateInput] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [result, setResult] = useState<PlateAnalysisResult | null>(null);
  const [error, setError] = useState("");
  const [isShareOpen, setIsShareOpen] = useState(false);

  const handleAnalyze = (inputVal?: string) => {
    const raw = inputVal !== undefined ? inputVal : plateInput;
    if (!raw.trim()) {
      setError("กรุณากรอกหมวดอักษรและหมายเลขทะเบียนรถ");
      return;
    }
    setError("");
    const res = analyzeLicensePlate(raw, birthDay || undefined);
    setResult(res);
    recordDivinationHistory({
      type: "ทะเบียนรถ",
      title: `ทะเบียน ${res.cleanedPlate}`,
      result: `ผลรวม ${res.grandTotal} (เกรด ${res.grade}) · ${res.overallMeaning}`,
      url: "/plate-analysis",
      metadata: {
        plate: res.cleanedPlate,
        grandTotal: res.grandTotal,
        grade: res.grade,
        dayName: BIRTH_DAYS.find((d) => d.key === birthDay)?.label,
      },
    });
  };

  const shareData: ShareCardData | null = result
    ? {
        category: "วิเคราะห์ทะเบียนรถมงคล",
        categoryCn: "车牌数理",
        title: `ทะเบียน ${result.cleanedPlate}`,
        subtitle: `ผลรวม ${result.grandTotal} (เกรด ${result.grade}) · ${result.overallMeaning}`,
        highlights: [
          { label: "ผลรวมทั้งหมด", value: `${result.grandTotal} (${result.grade})`, color: "#fbbf24" },
          { label: "ผลรวมหมวดตัวเลข", value: `${result.digitSum}`, color: "#38bdf8" },
          { label: "ผลรวมหมวดอักษร", value: `${result.letterSum}`, color: "#34d399" },
          { label: "คะแนนมงคล", value: `${result.score}/100 คะแนน`, color: "#f472b6" },
        ],
        quote: result.remedies[0] || "ขับขี่ปลอดภัย มีสติ และเสริมบารมีสิริมงคล",
        footerTag: "วิเคราะห์ทะเบียนรถมงคลฟรีได้ที่ www.likhitfa.online",
      }
    : null;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <SiteHeader />

      <main className="mx-auto w-full max-w-4xl px-4 py-12 md:py-16">
        {/* Header Title */}
        <div className="text-center space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-xs text-gold font-medium">
            <Car className="h-3.5 w-3.5" />
            ศาสตร์เลขศาสตร์ยานพาหนะ & กำลังดาว
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-medium text-gradient-gold">
            วิเคราะห์ทะเบียนรถมงคล
          </h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
            ถอดรหัสพลังหมวดอักษรและตัวเลข ผลรวมเลขศาสตร์ 4 มิติ ความแคล้วคลาด ปลอดภัย เรียกทรัพย์ และสีรถสมพงษ์
          </p>
        </div>

        {/* Input Box */}
        <div className="rounded-3xl border border-gold/20 bg-card/80 p-6 md:p-8 backdrop-blur-xl shadow-elegant space-y-6">
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-gold/90 uppercase tracking-wider mb-2">
                หมวดอักษรและเลขทะเบียนรถ
              </label>
              <input
                type="text"
                placeholder="เช่น 1กก 9999 หรือ ขข 168"
                value={plateInput}
                onChange={(e) => {
                  setPlateInput(e.target.value);
                  if (error) setError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                className="w-full rounded-xl border border-gold/20 bg-background/90 px-4 py-3 text-lg font-medium text-foreground placeholder:text-muted-foreground/60 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gold/90 uppercase tracking-wider mb-2">
                วันเกิดเจ้าของรถ (เพื่อตรวจสีรถมงคล)
              </label>
              <select
                value={birthDay}
                onChange={(e) => setBirthDay(e.target.value)}
                className="w-full rounded-xl border border-gold/20 bg-background/90 px-4 py-3 text-sm text-foreground focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
              >
                <option value="">-- ไม่ระบุวันเกิด --</option>
                {BIRTH_DAYS.map((d) => (
                  <option key={d.key} value={d.key}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>ตัวอย่าง:</span>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_EXAMPLES.map((ex) => (
                  <button
                    key={ex}
                    type="button"
                    onClick={() => {
                      setPlateInput(ex);
                      handleAnalyze(ex);
                    }}
                    className="rounded-lg bg-gold/5 px-2.5 py-1 text-xs text-gold/90 hover:bg-gold/15 transition border border-gold/10"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleAnalyze()}
              className="w-full md:w-auto rounded-xl bg-gradient-gold px-8 py-3 text-sm font-semibold text-primary-foreground shadow-gold hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
            >
              เริ่มวิเคราะห์ทะเบียน ➔
            </button>
          </div>
        </div>

        {/* Results Display */}
        {result && (
          <div className="mt-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Visual License Plate Card */}
            <div className="relative mx-auto max-w-sm rounded-2xl border-4 border-gold/40 bg-gradient-to-b from-slate-900 via-slate-950 to-black p-6 shadow-2xl text-center">
              <div className="text-[10px] uppercase tracking-[0.3em] text-gold/60 mb-1">
                THAILAND LICENCE
              </div>
              <div className="text-3xl md:text-4xl font-extrabold tracking-widest text-gold font-sans">
                {result.cleanedPlate}
              </div>
              <div className="mt-3 flex items-center justify-center gap-4 text-xs text-muted-foreground border-t border-gold/15 pt-2">
                <span>ค่าอักษร: <b className="text-gold">{result.letterSum}</b></span>
                <span>•</span>
                <span>ผลรวมตัวเลข: <b className="text-gold">{result.digitSum}</b></span>
                <span>•</span>
                <span>ผลรวมใหญ่: <b className="text-gold text-sm">{result.grandTotal}</b></span>
              </div>
            </div>

            {/* Share / Save Action */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setIsShareOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-gold/40 bg-gold/10 px-5 py-2.5 text-xs font-semibold text-gold transition-all hover:bg-gold/20 hover:scale-105 cursor-pointer"
              >
                <Share2 className="h-4 w-4" />
                แชร์ผลวิเคราะห์ทะเบียนรถ / บันทึกรูปภาพ
              </button>
            </div>

            {/* Score & Grade Overview */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-gold/20 bg-card/60 p-5 text-center flex flex-col items-center justify-center">
                <span className="text-xs text-muted-foreground mb-1">เกรดมงคล</span>
                <span className="text-4xl font-display font-bold text-gold">{result.grade}</span>
                <span className="text-xs text-gold/80 mt-1">คะแนนรวม {result.score}/100</span>
              </div>

              <div className="md:col-span-2 rounded-2xl border border-gold/20 bg-card/60 p-5 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gold">
                  <Sparkles className="h-4 w-4" />
                  คำทำนายพลังงานภาพรวม
                </div>
                <p className="text-sm leading-relaxed text-foreground/90">
                  {result.overallMeaning}
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {result.pros.map((p, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs text-emerald-400 border border-emerald-500/20"
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 4 Dimensions */}
            <div className="rounded-2xl border border-gold/20 bg-card/60 p-6 space-y-4">
              <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-gold" />
                คะแนนพลังงาน 4 มิติการขับขี่ยานพาหนะ
              </h3>
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <ShieldCheck className="h-3.5 w-3.5" /> แคล้วคลาด ปลอดภัย ไร้อุบัติเหตุ
                    </span>
                    <span className="font-bold text-foreground">{result.dimensions.safety}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-background overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                      style={{ width: `${result.dimensions.safety}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="flex items-center gap-1.5 text-amber-400">
                      <Award className="h-3.5 w-3.5" /> บารมี ผู้นำ คนเคารพเกรงใจ
                    </span>
                    <span className="font-bold text-foreground">{result.dimensions.prestige}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-background overflow-hidden">
                    <div
                      className="h-full rounded-full bg-amber-500 transition-all duration-700"
                      style={{ width: `${result.dimensions.prestige}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="flex items-center gap-1.5 text-gold">
                      <Sparkles className="h-3.5 w-3.5" /> เรียกทรัพย์ ค้าขาย โชคลาภวิ่งเข้าหา
                    </span>
                    <span className="font-bold text-foreground">{result.dimensions.wealth}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-background overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gold transition-all duration-700"
                      style={{ width: `${result.dimensions.wealth}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="flex items-center gap-1.5 text-sky-400">
                      <CheckCircle2 className="h-3.5 w-3.5" /> ความราบรื่น สบายใจ ไม่จุกจิก
                    </span>
                    <span className="font-bold text-foreground">{result.dimensions.smoothness}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-background overflow-hidden">
                    <div
                      className="h-full rounded-full bg-sky-500 transition-all duration-700"
                      style={{ width: `${result.dimensions.smoothness}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Pairs Breakdown */}
            {result.pairs.length > 0 && (
              <div className="rounded-2xl border border-gold/20 bg-card/60 p-6 space-y-3">
                <h3 className="text-base font-semibold text-foreground">
                  วิเคราะห์คู่ตัวเลขในแผ่นป้าย
                </h3>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {result.pairs.map((p, i) => (
                    <div
                      key={i}
                      className={`rounded-xl p-3 border ${
                        p.isAuspicious
                          ? "border-emerald-500/20 bg-emerald-500/5"
                          : "border-rose-500/20 bg-rose-500/5"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-base font-bold text-foreground">{p.pair}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full ${
                            p.isAuspicious
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-rose-500/10 text-rose-400"
                          }`}
                        >
                          {p.isAuspicious ? "คู่มงคล" : "คู่ระวัง"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{p.meaning}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Color Advice */}
            {result.colorAdvice && (
              <div className="rounded-2xl border border-gold/20 bg-card/60 p-6 space-y-3">
                <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                  <Palette className="h-4 w-4 text-gold" />
                  ทักษาปกรณ์สีรถสมพงษ์ ({BIRTH_DAYS.find((d) => d.key === result.colorAdvice?.birthDay)?.label})
                </h3>
                <p className="text-xs text-muted-foreground">{result.colorAdvice.description}</p>
                <div className="grid md:grid-cols-2 gap-4 pt-2">
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 space-y-1">
                    <span className="text-xs font-semibold text-emerald-400">
                      ✓ สีที่ถูกโฉลก เสริมทรัพย์ & บารมี
                    </span>
                    <ul className="text-xs text-foreground/90 space-y-1">
                      {result.colorAdvice.favorableColors.map((c, i) => (
                        <li key={i}>• {c}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3.5 space-y-1">
                    <span className="text-xs font-semibold text-rose-400">
                      ✕ สีกาลกิณีที่ควรหลีกเลี่ยง
                    </span>
                    <ul className="text-xs text-foreground/90 space-y-1">
                      {result.colorAdvice.unfavorableColors.map((c, i) => (
                        <li key={i}>• {c}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Remedies */}
            <div className="rounded-2xl border border-gold/20 bg-card/60 p-6 space-y-3">
              <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-gold" />
                คำแนะนำและวิธีเสริมมงคลประจำรถ
              </h3>
              <ul className="space-y-2 text-xs text-muted-foreground">
                {result.remedies.map((r, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-gold">•</span>
                    <span className="text-foreground/90">{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {shareData && (
          <ShareStoryModal
            isOpen={isShareOpen}
            onClose={() => setIsShareOpen(false)}
            data={shareData}
          />
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
