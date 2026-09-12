import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { seo, siteUrl } from "@/lib/seo";
import {
  analyzeName,
  type NameAnalysisResult,
  DAY_TAKSA_RULES,
} from "@/lib/numerology";
import { recordDivinationHistory } from "@/lib/member-history";
import { ShareStoryModal, type ShareCardData } from "@/components/share-story-modal";
import { useState } from "react";
import { Share2, AlertTriangle, Check } from "lucide-react";

export const Route = createFileRoute("/name-analysis")({
  head: () =>
    seo({
      title: "วิเคราะห์ชื่อ-นามสกุล ถอดรหัสเลขศาสตร์ & ทักษาปกรณ์ ตั้งชื่อมงคล",
      description:
        "วิเคราะห์ชื่อ-นามสกุลตามหลักเลขศาสตร์และทักษาปกรณ์ ตรวจสอบอักษรกาลกิณี คำนวณผลรวมพลังดวงดาว เสริมดวงชะตา บารมี และโชคลาภ",
      path: "/name-analysis",
      canonicalUrl: `${siteUrl}/name-analysis`,
      keywords: [
        "วิเคราะห์ชื่อ",
        "วิเคราะห์ชื่อนามสกุล",
        "เลขศาสตร์ชื่อ",
        "ตั้งชื่อมงคล",
        "ทักษาปกรณ์",
        "อักษรกาลกิณี",
        "ดูดวงชื่อ",
      ],
    }),
  component: NameAnalysisPage,
});

const DAYS_OF_WEEK = [
  { index: 0, label: "วันอาทิตย์" },
  { index: 1, label: "วันจันทร์" },
  { index: 2, label: "วันอังคาร" },
  { index: 3, label: "วันพุธ (กลางวัน)" },
  { index: 4, label: "วันพฤหัสบดี" },
  { index: 5, label: "วันศุกร์" },
  { index: 6, label: "วันเสาร์" },
];

function NameAnalysisPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dayIndex, setDayIndex] = useState(0);
  const [result, setResult] = useState<NameAnalysisResult | null>(null);
  const [error, setError] = useState("");
  const [isShareOpen, setIsShareOpen] = useState(false);

  const handleAnalyze = () => {
    if (!firstName.trim()) {
      setError("กรุณากรอกชื่อจริงเพื่อวิเคราะห์");
      setResult(null);
      return;
    }
    setError("");
    const res = analyzeName(firstName, lastName, dayIndex);
    setResult(res);
    recordDivinationHistory({
      type: "วิเคราะห์ชื่อ",
      title: `ชื่อ ${res.fullName}`,
      result: `คนเกิด${res.dayName} · ผลรวม ${res.totalScore} (${res.grade})`,
      url: "/name-analysis",
      metadata: {
        fullName: res.fullName,
        firstName: res.firstName,
        lastName: res.lastName,
        dayName: res.dayName,
        totalScore: res.totalScore,
        grade: res.grade,
      },
    });
  };

  const shareData: ShareCardData | null = result
    ? {
        category: "วิเคราะห์ชื่อ-นามสกุล",
        categoryCn: "姓名吉凶",
        title: result.fullName,
        subtitle: `คนเกิด${result.dayName} · เกรดมงคล ${result.grade}`,
        highlights: [
          { label: "เลขศาสตร์ชื่อ", value: `${result.firstNameScore} คะแนน`, color: "#fbbf24" },
          { label: "เลขศาสตร์นามสกุล", value: `${result.lastNameScore} คะแนน` },
          { label: "ผลรวมดวงชะตา", value: `${result.totalScore} คะแนน`, color: "#34d399" },
          {
            label: "ทักษาปกรณ์",
            value: result.hasKalakini ? `พบกาลกิณี (${result.kalakiniFound.join(", ")})` : "ไร้อักษรกาลกิณี (ดีเยี่ยม)",
            color: result.hasKalakini ? "#f87171" : "#34d399",
          },
        ],
        quote: result.totalMeaning,
        footerTag: "วิเคราะห์ชื่อมงคลฟรีได้ที่ www.likhitfa.online",
      }
    : null;

  return (
    <div className="relative min-h-screen">
      <SiteHeader subtitle="วิเคราะห์ชื่อ" subtitleCn="姓名" />

      <main className="mx-auto max-w-5xl px-5 pt-10 pb-16">
        {/* Banner ส่วนหัว */}
        <section className="glass-strong relative overflow-hidden rounded-3xl p-8 shadow-elegant md:p-10">
          <div className="pointer-events-none absolute -right-6 -top-6 font-cn text-[150px] leading-none text-gold/[0.05]">
            名
          </div>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-3.5 py-1 text-[11px] tracking-wider text-gold">
              <span className="font-cn">姓名命理</span> · วิเคราะห์ชื่อ-นามสกุลตามหลักทักษาปกรณ์
            </div>
            <h1 className="mt-4 font-display text-3xl text-foreground md:text-5xl">
              วิเคราะห์ชื่อ-นามสกุล <span className="text-gradient-gold italic">ถอดรหัสเลขศาสตร์</span>
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              คำนวณผลรวมพลังดวงดาวของชื่อและนามสกุล ตรวจสอบอักษรบริวาร เดช ศรี มนตรี
              และอักษรกาลกิณีต้องห้ามตามวันเกิด เพื่อความสำเร็จและความสงบสุขในชีวิต
            </p>

            {/* ฟอร์มกรอกชื่อ */}
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div>
                <label className="text-xs text-muted-foreground">ชื่อจริง (ภาษาไทย)</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="เช่น สิทธิชัย"
                  className="input-styled mt-1.5 h-12 w-full text-sm"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground">นามสกุล (ภาษาไทย - ไม่บังคับ)</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="เช่น มหาลาภ"
                  className="input-styled mt-1.5 h-12 w-full text-sm"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground">วันเกิดของผู้ทำนาย</label>
                <select
                  value={dayIndex}
                  onChange={(e) => setDayIndex(parseInt(e.target.value, 10))}
                  className="input-styled mt-1.5 h-12 w-full text-sm"
                >
                  {DAYS_OF_WEEK.map((d) => (
                    <option key={d.index} value={d.index}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-5">
              <button
                type="button"
                onClick={handleAnalyze}
                className="h-12 rounded-xl bg-gradient-gold px-8 text-sm font-semibold text-primary-foreground shadow-gold transition hover:scale-[1.02]"
              >
                คำนวณเลขศาสตร์ชื่อ
              </button>
            </div>

            {error && (
              <div className="mt-3 flex items-center gap-1.5 text-xs text-rose-400">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </section>

        {/* ผลลัพธ์การวิเคราะห์ */}
        {result && (
          <section className="mt-10 animate-fade-in">
            {/* การ์ดสรุปผลรวม */}
            <div className="rounded-3xl border border-gold/30 bg-gradient-to-b from-stone-900 via-card to-card p-6 md:p-8 shadow-elegant">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-gold/80">NAME ANALYSIS RESULT</div>
                  <h2 className="mt-1 font-display text-3xl text-foreground md:text-4xl">
                    {result.fullName}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    เกิด{result.dayName} · {result.taksaSummary}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-20 w-20 flex-col items-center justify-center rounded-2xl border border-gold/40 bg-gold/10 shadow-gold">
                    <span className="text-[10px] text-muted-foreground">GRADE</span>
                    <span className="font-display text-3xl font-bold text-gradient-gold">
                      {result.grade}
                    </span>
                  </div>
                  <button
                    onClick={() => setIsShareOpen(true)}
                    className="inline-flex items-center gap-2 rounded-xl border border-gold/40 bg-gold/10 px-4 py-3 text-xs font-semibold text-gold hover:bg-gold/20"
                  >
                    <Share2 className="h-4 w-4" />
                    <span>แชร์ลง Story</span>
                  </button>
                </div>
              </div>

              {/* แจ้งเตือนอักษรกาลกิณี */}
              {result.hasKalakini ? (
                <div className="mt-6 flex items-start gap-2 rounded-2xl border border-rose-500/40 bg-rose-950/30 p-4 text-xs text-rose-200">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                  <div>
                    <strong>พบอักษรกาลกิณีในชื่อ:</strong> ตัวอักษร{" "}
                    <span className="font-bold text-rose-300">({result.kalakiniFound.join(", ")})</span>{" "}
                    ถือเป็นกาลกิณีสำหรับคนเกิด{result.dayName} อาจส่งผลให้มีอุปสรรคหรือเหน็ดเหนื่อยมากกว่าปกติ
                    แนะนำให้หลีกเลี่ยงหรือปรึกษาผู้เชี่ยวชาญเพื่อปรับเปลี่ยนชื่อ
                  </div>
                </div>
              ) : (
                <div className="mt-6 flex items-start gap-2 rounded-2xl border border-emerald-500/40 bg-emerald-950/30 p-4 text-xs text-emerald-200">
                  <Check className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                  <div>
                    <strong>ชื่อเป็นมงคลตามทักษาปกรณ์:</strong> ไม่พบอักษรต้องห้าม (กาลกิณี) สำหรับคนเกิด{result.dayName} พลังตัวอักษรเกื้อหนุนดวงชะตาได้เป็นอย่างดี
                  </div>
                </div>
              )}

              {/* ผลรวม 3 ส่วน */}
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-border bg-card/40 p-4 text-center">
                  <div className="text-[11px] text-muted-foreground uppercase">FIRST NAME SUM</div>
                  <div className="mt-1 font-display text-3xl font-bold text-gold">
                    {result.firstNameScore}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">เลขศาสตร์ชื่อจริง</div>
                </div>

                <div className="rounded-2xl border border-border bg-card/40 p-4 text-center">
                  <div className="text-[11px] text-muted-foreground uppercase">LAST NAME SUM</div>
                  <div className="mt-1 font-display text-3xl font-bold text-foreground">
                    {result.lastNameScore || "-"}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">เลขศาสตร์นามสกุล</div>
                </div>

                <div className="rounded-2xl border border-gold/30 bg-gold/10 p-4 text-center">
                  <div className="text-[11px] text-amber-300 uppercase font-semibold">COMBINED SUM</div>
                  <div className="mt-1 font-display text-3xl font-bold text-gradient-gold">
                    {result.totalScore}
                  </div>
                  <div className="text-xs text-amber-200 mt-1">ผลรวมชะตาชีวิตทั้งหมด</div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="rounded-2xl border border-border/60 bg-card/30 p-4 text-sm leading-relaxed text-muted-foreground">
                  <strong className="text-foreground">ความหมายชื่อ ({result.firstNameScore}):</strong>{" "}
                  {result.firstNameMeaning}
                </div>
                {result.lastNameScore > 0 && (
                  <div className="rounded-2xl border border-border/60 bg-card/30 p-4 text-sm leading-relaxed text-muted-foreground">
                    <strong className="text-foreground">ความหมายรวมทั้งชื่อและนามสกุล ({result.totalScore}):</strong>{" "}
                    {result.totalMeaning}
                  </div>
                )}
              </div>
            </div>

            {/* ตารางทักษาประจำวันเกิด */}
            <div className="mt-8 glass-strong rounded-3xl p-6 md:p-8">
              <h3 className="font-display text-2xl text-foreground">
                ตารางอักษรทักษาปกรณ์สำหรับคนเกิด {result.dayName}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                หลักโบราณในการเลือกตัวอักษรเพื่อตั้งชื่อมงคลเสริมบารมี
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {Object.values(DAY_TAKSA_RULES[result.dayIndex].categories).map((cat) => (
                  <div
                    key={cat.title}
                    className={`rounded-2xl border p-4 ${
                      cat.isKalakini
                        ? "border-rose-500/30 bg-rose-950/20"
                        : "border-border/60 bg-card/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-semibold ${cat.isKalakini ? "text-rose-400" : "text-gold"}`}>
                        หมวด{cat.title}
                      </span>
                    </div>
                    <div className="mt-2 text-sm font-medium text-foreground">
                      {cat.chars.join(" ")}
                    </div>
                    <div className="mt-1 text-[11px] text-muted-foreground">
                      {cat.description}
                    </div>
                  </div>
                ))}
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
