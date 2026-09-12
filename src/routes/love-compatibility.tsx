import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { seo, siteUrl } from "@/lib/seo";
import {
  analyzeLoveCompatibility,
  type CompatibilityAnalysis,
  type LovePersonInput,
} from "@/lib/love-compatibility";
import { ShareStoryModal, type ShareCardData } from "@/components/share-story-modal";
import { readStoredUserSession } from "@/lib/user-session";
import { recordDivinationHistory } from "@/lib/member-history";
import { useState, useMemo } from "react";
import {
  HeartHandshake,
  User,
  Heart,
  Share2,
  Sparkles,
  Check,
  AlertTriangle,
  Gem,
  MapPin,
  Bookmark,
} from "lucide-react";

export const Route = createFileRoute("/love-compatibility")({
  head: () =>
    seo({
      title: "ดูดวงสมพงษ์เนื้อคู่ — เช็คดวงความรัก ธาตุสมพงษ์ นักษัตรคู่แท้ ความเข้ากันได้ ฟรี",
      description:
        "โปรแกรมคำนวณดวงสมพงษ์เนื้อคู่และความรัก 2 คน คำนวณธาตุ 5 ธาตุ ปีนักษัตรซาฮะ-ลักฮะ วันเกิดสมพงษ์ ประเมินคะแนนความเข้ากันได้ 0-100% พร้อมข้อควรระวังและวิธีเสริมดวงคู่ครอง",
      path: "/love-compatibility",
      canonicalUrl: `${siteUrl}/love-compatibility`,
      keywords: [
        "ดูดวงสมพงษ์",
        "ดูดวงเนื้อคู่",
        "ดวงความรัก",
        "เช็คดวงสองคน",
        "ธาตุสมพงษ์",
        "นักษัตรสมพงษ์",
        "คู่แท้",
        "ดวงสมพงษ์ 2569",
        "Likhitfa",
      ],
    }),
  component: LoveCompatibilityPage,
});

function LoveCompatibilityPage() {
  const session = readStoredUserSession();

  const [p1, setP1] = useState<LovePersonInput>({
    name: session?.profile?.displayName || session?.name || "คุณ",
    gender: "female",
    birthDate: session?.profile?.birthDate || "1997-02-14",
  });

  const [p2, setP2] = useState<LovePersonInput>({
    name: "คนรัก",
    gender: "male",
    birthDate: "1995-11-20",
  });

  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const result: CompatibilityAnalysis = useMemo(() => {
    return analyzeLoveCompatibility(p1, p2);
  }, [p1, p2]);

  const handleSaveToHistory = () => {
    recordDivinationHistory({
      type: "ดวงสมพงษ์",
      title: `ดวงสมพงษ์: ${p1.name} & ${p2.name}`,
      result: `คะแนนความสมพงษ์ ${result.score}% (${result.levelTitle}) · ธาตุ${result.person1.element}+${result.person2.element}`,
      url: "/love-compatibility",
      metadata: {
        person1: p1.name,
        person2: p2.name,
        score: result.score,
        levelBadge: result.levelBadge,
        levelTitle: result.levelTitle,
      },
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const shareData: ShareCardData = {
    category: "ดวงสมพงษ์เนื้อคู่ & ความรัก",
    categoryCn: "姻缘合婚",
    title: `${p1.name} & ${p2.name}`,
    subtitle: `${result.levelTitle} (${result.score}%)`,
    highlights: [
      { label: "คะแนนความสมพงษ์", value: `${result.score}%`, color: "#fb7185" },
      { label: "ระดับความสัมพันธ์", value: result.levelBadge, color: "#f43f5e" },
      { label: "ธาตุสมพงษ์", value: `${result.person1.element} & ${result.person2.element}`, color: "#fbbf24" },
      { label: "นักษัตรคู่ครอง", value: `${result.person1.chineseZodiac} & ${result.person2.chineseZodiac}`, color: "#34d399" },
    ],
    quote: result.elementMatchDesc,
    footerTag: "เช็คดวงสมพงษ์ความรักแม่นยำที่ Likhitfa.online",
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader subtitle="ดวงสมพงษ์เนื้อคู่" subtitleCn="姻緣合盤" />

      <main className="mx-auto max-w-6xl px-4 py-10 md:px-8">
        {/* Hero Header */}
        <section className="text-center">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-4 py-1.5 text-xs tracking-widest text-rose-400">
            <HeartHandshake className="h-3.5 w-3.5" />
            <span>LOVE & RELATIONSHIP COMPATIBILITY</span>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-5xl">
            ดูดวง<span className="text-gradient-gold">สมพงษ์เนื้อคู่</span>
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground md:text-base">
            ถอดรหัสบุพเพสันนิวาสของคนสองคน ผสานศาสตร์ธาตุจีน ปีนักษัตรมงคล วันเกิด และราศีสากล
            เผยความเข้ากันได้ จุดแข็ง และเคล็ดลับการครองคู่ให้ยืนยาว
          </p>
        </section>

        {/* Dual Input Form */}
        <section className="mx-auto mt-10 grid max-w-4xl gap-6 md:grid-cols-2">
          {/* Person 1 Box */}
          <div className="rounded-3xl border border-gold/30 bg-card/60 p-6 backdrop-blur-md shadow-elegant">
            <div className="flex items-center gap-2.5 mb-4 border-b border-gold/15 pb-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/15 text-gold">
                <User className="h-4 w-4" />
              </span>
              <div>
                <h3 className="font-display text-base font-bold text-foreground">ฝ่ายที่ 1 (ตัวคุณ)</h3>
                <p className="text-xs text-muted-foreground">กรอกข้อมูลวันเกิดของคุณ</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">ชื่อ / ชื่อเล่น</label>
                <input
                  type="text"
                  value={p1.name}
                  onChange={(e) => setP1({ ...p1, name: e.target.value })}
                  placeholder="เช่น มินนี่"
                  className="w-full rounded-xl border border-gold/25 bg-background/80 px-3.5 py-2 text-sm text-foreground focus:border-gold focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">วันเดือนปีเกิด</label>
                <input
                  type="date"
                  value={p1.birthDate}
                  onChange={(e) => setP1({ ...p1, birthDate: e.target.value })}
                  className="w-full rounded-xl border border-gold/25 bg-background/80 px-3.5 py-2 text-sm text-foreground focus:border-gold focus:outline-none"
                />
              </div>
              <div className="flex items-center justify-between text-xs text-gold/80 pt-1">
                <span>วัน: {result.person1.dayName}</span>
                <span>นักษัตร: {result.person1.chineseZodiac}</span>
                <span>ธาตุ: {result.person1.element}</span>
              </div>
            </div>
          </div>

          {/* Person 2 Box */}
          <div className="rounded-3xl border border-rose-500/30 bg-card/60 p-6 backdrop-blur-md shadow-elegant">
            <div className="flex items-center gap-2.5 mb-4 border-b border-rose-500/15 pb-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/15 text-rose-400">
                <Heart className="h-4 w-4" />
              </span>
              <div>
                <h3 className="font-display text-base font-bold text-foreground">ฝ่ายที่ 2 (คนรัก / คนที่ชอบ)</h3>
                <p className="text-xs text-muted-foreground">กรอกข้อมูลวันเกิดของคนรัก</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">ชื่อ / ชื่อเล่น</label>
                <input
                  type="text"
                  value={p2.name}
                  onChange={(e) => setP2({ ...p2, name: e.target.value })}
                  placeholder="เช่น กวิน"
                  className="w-full rounded-xl border border-rose-500/25 bg-background/80 px-3.5 py-2 text-sm text-foreground focus:border-rose-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">วันเดือนปีเกิด</label>
                <input
                  type="date"
                  value={p2.birthDate}
                  onChange={(e) => setP2({ ...p2, birthDate: e.target.value })}
                  className="w-full rounded-xl border border-rose-500/25 bg-background/80 px-3.5 py-2 text-sm text-foreground focus:border-rose-400 focus:outline-none"
                />
              </div>
              <div className="flex items-center justify-between text-xs text-rose-300/80 pt-1">
                <span>วัน: {result.person2.dayName}</span>
                <span>นักษัตร: {result.person2.chineseZodiac}</span>
                <span>ธาตุ: {result.person2.element}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Compatibility Score & Level Banner */}
        <section className="mx-auto mt-10 max-w-4xl rounded-3xl border border-gold/30 bg-gradient-to-b from-rose-950/20 via-card/80 to-card/60 p-8 text-center backdrop-blur-md shadow-elegant">
          <div className="inline-block rounded-full border border-rose-500/30 bg-rose-500/10 px-4 py-1 text-xs font-semibold text-rose-400 mb-3">
            {result.levelBadge}
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">
            {p1.name} & {p2.name}
          </h2>
          <div className="text-lg font-semibold text-gold mt-1">{result.levelTitle}</div>

          {/* Score Circular Meter */}
          <div className="relative mx-auto my-8 flex h-40 w-40 items-center justify-center">
            <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.08)" strokeWidth="8" fill="none" />
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="url(#roseGoldGradient)"
                strokeWidth="8"
                fill="none"
                strokeDasharray="264"
                strokeDashoffset={264 - (264 * result.score) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="roseGoldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fb7185" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="font-display text-4xl font-extrabold text-foreground">{result.score}%</span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">ความสมพงษ์</span>
            </div>
          </div>

          <div className="mx-auto flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleSaveToHistory}
              className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition cursor-pointer ${
                isSaved
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                  : "border border-rose-500/40 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20"
              }`}
            >
              {isSaved ? (
                <>
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span>บันทึกผลแล้ว</span>
                </>
              ) : (
                <>
                  <Bookmark className="h-4 w-4" />
                  <span>บันทึกผลลงประวัติดูดวง</span>
                </>
              )}
            </button>
            <button
              onClick={() => setShareModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 px-6 py-2.5 text-sm font-semibold text-stone-950 shadow-lg transition hover:opacity-95 cursor-pointer"
            >
              <Share2 className="h-4 w-4" />
              <span>บันทึกการ์ดความรัก Story (9:16)</span>
            </button>
          </div>
        </section>

        {/* 4 Pillars of Match Details */}
        <section className="mx-auto mt-10 max-w-4xl grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-gold/20 bg-card/40 p-5 backdrop-blur-md">
            <div className="text-xs font-semibold uppercase tracking-wider text-gold mb-1">1. ธาตุสมพงษ์ (Five Elements)</div>
            <div className="text-sm font-bold text-foreground mb-2">ธาตุ{result.person1.element} + ธาตุ{result.person2.element}</div>
            <p className="text-xs text-muted-foreground leading-relaxed">{result.elementMatchDesc}</p>
          </div>

          <div className="rounded-2xl border border-gold/20 bg-card/40 p-5 backdrop-blur-md">
            <div className="text-xs font-semibold uppercase tracking-wider text-gold mb-1">2. ปีนักษัตรสมพงษ์ (Chinese Zodiac)</div>
            <div className="text-sm font-bold text-foreground mb-2">ปี{result.person1.chineseZodiac} + ปี{result.person2.chineseZodiac}</div>
            <p className="text-xs text-muted-foreground leading-relaxed">{result.zodiacMatchDesc}</p>
          </div>

          <div className="rounded-2xl border border-gold/20 bg-card/40 p-5 backdrop-blur-md">
            <div className="text-xs font-semibold uppercase tracking-wider text-gold mb-1">3. วันเกิดสมพงษ์ (Thai Day Match)</div>
            <div className="text-sm font-bold text-foreground mb-2">วัน{result.person1.dayName} + วัน{result.person2.dayName}</div>
            <p className="text-xs text-muted-foreground leading-relaxed">{result.dayMatchDesc}</p>
          </div>

          <div className="rounded-2xl border border-gold/20 bg-card/40 p-5 backdrop-blur-md">
            <div className="text-xs font-semibold uppercase tracking-wider text-gold mb-1">4. ราศีสากล (Western Zodiac)</div>
            <div className="text-sm font-bold text-foreground mb-2">{result.person1.zodiacSign} + {result.person2.zodiacSign}</div>
            <p className="text-xs text-muted-foreground leading-relaxed">{result.westernZodiacMatchDesc}</p>
          </div>
        </section>

        {/* Strengths, Cautions, Advices */}
        <section className="mx-auto mt-10 max-w-4xl grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
            <h4 className="flex items-center gap-2 font-display text-sm font-bold text-emerald-400 mb-3">
              <Sparkles className="h-4 w-4" />
              <span>จุดแข็งของความสัมพันธ์</span>
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              {result.strengths.map((item, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-5">
            <h4 className="flex items-center gap-2 font-display text-sm font-bold text-rose-400 mb-3">
              <AlertTriangle className="h-4 w-4" />
              <span>ข้อควรระวังในการครองคู่</span>
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              {result.cautions.map((item, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-rose-400">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-gold/20 bg-gold/5 p-5">
            <h4 className="flex items-center gap-2 font-display text-sm font-bold text-gold mb-3">
              <Gem className="h-4 w-4" />
              <span>เคล็ดลับเสริมดวงคู่ครอง</span>
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              {result.advices.map((item, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-gold">✦</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Recommended Shrines for Couples */}
        <section className="mx-auto mt-12 max-w-4xl rounded-3xl border border-gold/20 bg-card/40 p-6 md:p-8 backdrop-blur-md">
          <div className="flex items-center gap-2.5 mb-6">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/15 text-gold">
              <MapPin className="h-4 w-4" />
            </span>
            <div>
              <h3 className="font-display text-lg font-bold text-foreground">สถานที่ขอพรความรักคู่กัน</h3>
              <p className="text-xs text-muted-foreground">เสริมสิริมงคลให้ชีวิตคู่ราบรื่น ร่มเย็น และรักกันยืนยาว</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {result.recommendedShrines.map((shrine, i) => (
              <div key={i} className="rounded-2xl border border-gold/15 bg-card/60 p-4">
                <div className="text-sm font-bold text-gold mb-1">{shrine.name}</div>
                <div className="text-xs text-muted-foreground/80 mb-2">{shrine.location}</div>
                <p className="text-xs text-foreground/80 leading-relaxed">{shrine.highlight}</p>
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
