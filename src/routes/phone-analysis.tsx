import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { seo, siteUrl } from "@/lib/seo";
import {
  analyzePhoneNumber,
  type PhoneAnalysisResult,
} from "@/lib/numerology";
import { ShareStoryModal, type ShareCardData } from "@/components/share-story-modal";
import { useState, type ReactNode } from "react";
import {
  Coins,
  Briefcase,
  Heart,
  Shield,
  Share2,
  AlertTriangle,
  Target,
  Lightbulb,
} from "lucide-react";

export const Route = createFileRoute("/phone-analysis")({
  head: () =>
    seo({
      title: "เช็คเบอร์มงคล วิเคราะห์เบอร์โทรศัพท์ ทำนายผลรวมเลขศาสตร์",
      description:
        "เช็คผลรวมเบอร์มงคล วิเคราะห์คู่ตัวเลข 7 คู่ในเบอร์โทรศัพท์ ตรวจสอบคะแนนการเงิน การงาน ความรัก และสุขภาพ พร้อมคำแนะนำตามหลักเลขศาสตร์โบราณ",
      path: "/phone-analysis",
      canonicalUrl: `${siteUrl}/phone-analysis`,
      keywords: [
        "เช็คเบอร์มงคล",
        "วิเคราะห์เบอร์โทรศัพท์",
        "ผลรวมเบอร์มงคล",
        "ทำนายเบอร์โทร",
        "เบอร์มงคลตามวันเกิด",
        "คู่เลขมงคล",
      ],
    }),
  component: PhoneAnalysisPage,
});

const POPULAR_PHONE_EXAMPLES = [
  "0891234567",
  "0958965415",
  "0639824659",
  "0816892465",
  "0987895642",
];

function PhoneAnalysisPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [result, setResult] = useState<PhoneAnalysisResult | null>(null);
  const [error, setError] = useState("");
  const [isShareOpen, setIsShareOpen] = useState(false);

  const handleAnalyze = (inputVal?: string) => {
    const raw = inputVal !== undefined ? inputVal : phoneNumber;
    const clean = raw.replace(/\D/g, "");
    if (clean.length < 9 || clean.length > 10) {
      setError("กรุณากรอกเบอร์โทรศัพท์ให้ครบ 9-10 หลัก");
      setResult(null);
      return;
    }
    setError("");
    const analysis = analyzePhoneNumber(clean);
    setResult(analysis);
  };

  const shareData: ShareCardData | null = result
    ? {
        category: "วิเคราะห์เบอร์มงคล",
        categoryCn: "吉凶数理",
        title: `เบอร์ ${result.formattedNumber}`,
        subtitle: `ผลรวม ${result.sum} (${result.sumGrade}) · ${result.sumTitle}`,
        highlights: [
          { label: "การเงินโชคลาภ", value: `${result.scores.wealth}/100 คะแนน`, color: "#34d399" },
          { label: "การงานอำนาจ", value: `${result.scores.career}/100 คะแนน`, color: "#38bdf8" },
          { label: "เสน่ห์ความรัก", value: `${result.scores.love}/100 คะแนน`, color: "#f472b6" },
          { label: "แคล้วคลาดปลอดภัย", value: `${result.scores.health}/100 คะแนน`, color: "#fbbf24" },
          { label: "คะแนนรวมทั้งหมด", value: `เกรด ${result.sumGrade} (${result.scores.overall}%)` },
        ],
        quote: result.advice,
        footerTag: "เช็คเบอร์มงคลฟรีได้ที่ www.likhitfa.online",
      }
    : null;

  return (
    <div className="relative min-h-screen">
      <SiteHeader subtitle="เช็คเบอร์มงคล" subtitleCn="数理" />

      <main className="mx-auto max-w-5xl px-5 pt-10 pb-16">
        {/* Banner ส่วนหัว */}
        <section className="glass-strong relative overflow-hidden rounded-3xl p-8 shadow-elegant md:p-10">
          <div className="pointer-events-none absolute -right-6 -top-6 font-cn text-[150px] leading-none text-gold/[0.05]">
            数
          </div>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-3.5 py-1 text-[11px] tracking-wider text-gold">
              <span className="font-cn">手机数理</span> · เช็คเบอร์มงคลตามหลักเลขศาสตร์
            </div>
            <h1 className="mt-4 font-display text-3xl text-foreground md:text-5xl">
              วิเคราะห์เบอร์โทรศัพท์ <span className="text-gradient-gold italic">ถอดรหัสคู่เลข</span>
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              ค้นหาพลังงานตัวเลข 10 หลักที่ซ่อนอยู่ในเบอร์มือถือของคุณ ถอดรหัสผลรวมมงคล
              และคู่ตัวเลข 7 คู่ที่ส่งอิทธิพลต่อการงาน การเงิน ความรัก และความแคล้วคลาด
            </p>

            {/* ฟอร์มกรอกเบอร์โทร */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAnalyze();
              }}
              className="mt-8 flex flex-col gap-3 md:flex-row"
            >
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="กรอกเบอร์โทรศัพท์ เช่น 0812345678"
                maxLength={12}
                className="input-styled h-14 flex-1 text-lg font-mono tracking-widest text-foreground"
              />
              <button
                type="submit"
                className="h-14 rounded-xl bg-gradient-gold px-8 text-sm font-semibold text-primary-foreground shadow-gold transition-transform hover:scale-[1.02]"
              >
                วิเคราะห์เบอร์มงคล
              </button>
            </form>

            {error && (
              <div className="mt-3 flex items-center gap-1.5 text-xs text-rose-400">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* ตัวอย่างเบอร์ให้กดทดลอง */}
            <div className="mt-5 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-muted-foreground">ตัวอย่างเบอร์ยอดมงคล:</span>
              {POPULAR_PHONE_EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => {
                    setPhoneNumber(ex);
                    handleAnalyze(ex);
                  }}
                  className="rounded-full border border-border bg-card/60 px-3 py-1 font-mono text-[11px] text-muted-foreground hover:border-gold/40 hover:text-gold"
                >
                  {ex.slice(0, 3)}-{ex.slice(3, 6)}-{ex.slice(6)}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ผลการวิเคราะห์ */}
        {result && (
          <section className="mt-10 animate-fade-in">
            {/* กล่องสรุปผลรวมและเกรด */}
            <div className="rounded-3xl border border-gold/30 bg-gradient-to-b from-stone-900 via-card to-card p-6 md:p-8 shadow-elegant">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-gold/80">OVERALL RESULT</div>
                  <h2 className="mt-1 font-display text-3xl text-foreground md:text-4xl">
                    เบอร์ {result.formattedNumber}
                  </h2>
                  <p className="mt-2 text-sm text-gold">
                    ผลรวมเลข {result.sum} · {result.sumTitle}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-20 w-20 flex-col items-center justify-center rounded-2xl border border-gold/40 bg-gold/10 shadow-gold">
                    <span className="text-[10px] text-muted-foreground">GRADE</span>
                    <span className="font-display text-3xl font-bold text-gradient-gold">
                      {result.sumGrade}
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

              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {result.sumDescription}
              </p>

              {/* คะแนน 4 มิติ */}
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <ScoreCard
                  label="การเงินและโชคลาภ"
                  score={result.scores.wealth}
                  icon={<Coins className="h-4 w-4 text-emerald-400" />}
                  color="text-emerald-400"
                />
                <ScoreCard
                  label="การงานและบารมี"
                  score={result.scores.career}
                  icon={<Briefcase className="h-4 w-4 text-sky-400" />}
                  color="text-sky-400"
                />
                <ScoreCard
                  label="ความรักและเสน่ห์"
                  score={result.scores.love}
                  icon={<Heart className="h-4 w-4 text-pink-400" />}
                  color="text-pink-400"
                />
                <ScoreCard
                  label="สุขภาพและแคล้วคลาด"
                  score={result.scores.health}
                  icon={<Shield className="h-4 w-4 text-amber-400" />}
                  color="text-amber-400"
                />
              </div>
            </div>

            {/* เจาะลึกคู่ตัวเลข 7 คู่ */}
            <div className="mt-8">
              <h3 className="font-display text-2xl text-foreground">
                ถอดรหัสคู่เลขภายในเบอร์ (7 คู่ตัวเลข)
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                คู่ตัวเลขแต่ละคู่ส่งพลังงานต่อดวงชะตาในด้านที่แตกต่างกัน
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {result.pairs.map((p, index) => (
                  <div
                    key={`${p.pair}-${index}`}
                    className={`rounded-2xl border p-4 transition-all ${
                      p.isAuspicious
                        ? "border-border/60 bg-card/40 hover:border-gold/40"
                        : "border-rose-500/30 bg-rose-950/15"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-2xl font-bold text-gold">
                        {p.pair}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] ${
                          p.isAuspicious
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-rose-500/10 text-rose-400"
                        }`}
                      >
                        {p.isAuspicious ? "คู่มงคล" : "ควรระวัง"}
                      </span>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      {p.meaning}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* อาชีพที่เหมาะสมและคำแนะนำ */}
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              <div className="glass-strong rounded-3xl p-6">
                <div className="text-[11px] uppercase tracking-wider text-gold/80">CAREER MATCH</div>
                <h4 className="flex items-center gap-2 mt-1 font-display text-lg text-foreground">
                  <Target className="h-5 w-5 text-gold" />
                  <span>เหมาะกับอาชีพและธุรกิจ</span>
                </h4>
                <div className="mt-3 flex flex-wrap gap-2">
                  {result.suitableCareers.map((c, i) => (
                    <span
                      key={i}
                      className="rounded-xl border border-gold/20 bg-gold/5 px-3 py-1.5 text-xs text-amber-200"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              <div className="glass-strong rounded-3xl p-6">
                <div className="text-[11px] uppercase tracking-wider text-gold/80">EXPERT ADVICE</div>
                <h4 className="flex items-center gap-2 mt-1 font-display text-lg text-foreground">
                  <Lightbulb className="h-5 w-5 text-gold" />
                  <span>คำแนะนำเสริมดวง</span>
                </h4>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {result.advice}
                </p>
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

function ScoreCard({
  label,
  score,
  icon,
  color,
}: {
  label: string;
  score: number;
  icon: ReactNode;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card/40 p-4">
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="text-xs">{label}</span>
        <span>{icon}</span>
      </div>
      <div className={`mt-2 font-display text-2xl font-bold ${color}`}>
        {score} <span className="text-xs text-muted-foreground font-normal">/ 100</span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border">
        <div
          className="h-full bg-gradient-gold transition-all duration-500"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
