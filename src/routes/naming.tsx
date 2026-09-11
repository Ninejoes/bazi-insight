import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { seo, siteUrl } from "@/lib/seo";
import {
  BIRTH_DAY_RULES,
  filterAuspiciousNames,
  AUSPICIOUS_NAMES_CATALOG,
  type AuspiciousName,
} from "@/lib/naming-data";
import { useState, useMemo } from "react";
import {
  PenTool,
  Sparkles,
  Search,
  CheckCircle2,
  Copy,
  Check,
  Coins,
  Shield,
  Heart,
  Activity,
  Shuffle,
  Lightbulb,
} from "lucide-react";

export const Route = createFileRoute("/naming")({
  head: () =>
    seo({
      title: "ระบบตั้งชื่อมงคล คัดสรรชื่อดีความหมายรวยตามวันเกิด Likhitfa",
      description:
        "ระบบค้นหาและตั้งชื่อมงคลตามวันเกิด คัดกรองอักษรกาลกิณี 100% เสริมโชคลาภ บารมี และความรัก พร้อมผลรวมเลขศาสตร์ชั้นครูและคำแปลมงคล",
      path: "/naming",
      canonicalUrl: `${siteUrl}/naming`,
      keywords: [
        "ตั้งชื่อมงคล",
        "ชื่อมงคลตามวันเกิด",
        "ตั้งชื่อลูก",
        "เปลี่ยนชื่อมงคล",
        "ชื่อความหมายดี",
        "ทักษาปกรณ์ตั้งชื่อ",
        "ชื่อเสริมดวง",
      ],
    }),
  component: NamingPage,
});

const GOAL_OPTIONS = [
  { id: "all", label: "ทุกเป้าหมายมงคล", icon: Sparkles },
  { id: "wealth", label: "การเงิน & โชคลาภ", icon: Coins },
  { id: "leadership", label: "บารมี & ผู้นำ", icon: Shield },
  { id: "support", label: "เมตตา & คนอุปถัมภ์", icon: Heart },
  { id: "health", label: "สุขภาพ & ร่มเย็น", icon: Activity },
];

function NamingPage() {
  const [birthDay, setBirthDay] = useState("sunday");
  const [selectedGoal, setSelectedGoal] = useState<"all" | "wealth" | "leadership" | "support" | "health">("all");
  const [selectedGender, setSelectedGender] = useState<"all" | "male" | "female">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [luckyDrawResult, setLuckyDrawResult] = useState<AuspiciousName | null>(null);

  const filteredNames = useMemo(() => {
    return filterAuspiciousNames({
      birthDay,
      gender: selectedGender,
      goal: selectedGoal,
      searchQuery,
    });
  }, [birthDay, selectedGender, selectedGoal, searchQuery]);

  const currentRule = BIRTH_DAY_RULES[birthDay];

  const handleCopy = (name: string, id: string) => {
    navigator.clipboard.writeText(name);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleLuckyDraw = () => {
    if (filteredNames.length === 0) return;
    const randomIndex = Math.floor(Math.random() * filteredNames.length);
    setLuckyDrawResult(filteredNames[randomIndex]);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <SiteHeader />

      <main className="mx-auto w-full max-w-5xl px-4 py-12 md:py-16">
        {/* Header Title */}
        <div className="text-center space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-xs text-gold font-medium">
            <PenTool className="h-3.5 w-3.5" />
            ศาสตร์ทักษาปกรณ์ & เลขศาสตร์มงคล
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-medium text-gradient-gold">
            ระบบคลังตั้งชื่อมงคลตามวันเกิด
          </h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
            คัดกรองอักษรกาลกิณีต้องห้าม 100% พร้อมคำแปลภาษาบาลี-สันสกฤตที่ไพเราะ ทันสมัย และผลรวมเลขศาสตร์ชั้นครู
          </p>
        </div>

        {/* Filter Controls Box */}
        <div className="rounded-3xl border border-gold/20 bg-card/80 p-6 md:p-8 backdrop-blur-xl shadow-elegant space-y-6">
          {/* Day of Birth Selector */}
          <div>
            <label className="block text-xs font-semibold text-gold/90 uppercase tracking-wider mb-2">
              เลือกวันเกิด (เพื่อคัดกรองอักษรกาลกิณีออก)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.entries(BIRTH_DAY_RULES).map(([k, rule]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => {
                    setBirthDay(k);
                    setLuckyDrawResult(null);
                  }}
                  className={`rounded-xl py-2.5 px-3 text-xs font-medium transition border text-center ${
                    birthDay === k
                      ? "border-gold bg-gold/15 text-gold font-semibold shadow-gold"
                      : "border-gold/10 bg-background/60 text-muted-foreground hover:bg-gold/5"
                  }`}
                >
                  {rule.label}
                </button>
              ))}
            </div>
          </div>

          {/* Kalakini Rule Banner */}
          {currentRule && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-xs">
              <div className="flex items-center gap-2 text-rose-400">
                <span className="font-semibold">✕ อักษรกาลกิณีที่ตัดทิ้งสำหรับ{currentRule.label}:</span>
                <span className="font-bold tracking-wider">{currentRule.forbidden}</span>
              </div>
              <span className="text-emerald-400 flex items-center gap-1 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" /> ทุกชื่อด้านล่างปลอดภัย 100%
              </span>
            </div>
          )}

          {/* Goal & Gender & Search */}
          <div className="grid md:grid-cols-3 gap-4 pt-2">
            {/* Goal Filter */}
            <div>
              <label className="block text-xs font-semibold text-gold/80 mb-2">เป้าหมายเสริมดวง</label>
              <select
                value={selectedGoal}
                onChange={(e) => setSelectedGoal(e.target.value as typeof selectedGoal)}
                className="w-full rounded-xl border border-gold/20 bg-background/90 px-3.5 py-2.5 text-xs text-foreground focus:border-gold focus:outline-none"
              >
                {GOAL_OPTIONS.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Gender Filter */}
            <div>
              <label className="block text-xs font-semibold text-gold/80 mb-2">เพศ</label>
              <select
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value as typeof selectedGender)}
                className="w-full rounded-xl border border-gold/20 bg-background/90 px-3.5 py-2.5 text-xs text-foreground focus:border-gold focus:outline-none"
              >
                <option value="all">ทุกเพศ (ชาย / หญิง / Unisex)</option>
                <option value="male">เฉพาะเพศชาย</option>
                <option value="female">เฉพาะเพศหญิง</option>
              </select>
            </div>

            {/* Search Input */}
            <div>
              <label className="block text-xs font-semibold text-gold/80 mb-2">ค้นหาชื่อหรือความหมาย</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="พิมพ์คำค้นหา..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-gold/20 bg-background/90 pl-9 pr-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-gold focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Lucky Draw Trigger */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gold/15 pt-4">
            <span className="text-xs text-muted-foreground">
              พบชื่อมงคลทั้งหมด <b className="text-gold">{filteredNames.length}</b> ชื่อ
            </span>
            <button
              type="button"
              onClick={handleLuckyDraw}
              className="inline-flex items-center gap-2 rounded-xl bg-gold/15 px-4 py-2 text-xs font-semibold text-gold hover:bg-gold/25 transition border border-gold/30 cursor-pointer"
            >
              <Shuffle className="h-3.5 w-3.5" />
              สุ่มชื่อมงคลแนะนำ 1 ชื่อ
            </button>
          </div>
        </div>

        {/* Lucky Draw Highlight Modal/Card */}
        {luckyDrawResult && (
          <div className="mt-8 rounded-3xl border-2 border-gold bg-gradient-to-br from-gold/20 via-card to-background p-6 md:p-8 shadow-2xl text-center space-y-3 animate-in zoom-in-95 duration-300">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold px-3 py-0.5 text-[10px] font-bold text-primary-foreground uppercase tracking-widest">
              <Sparkles className="h-3 w-3" />
              ชื่อมงคลแนะนำพิเศษสำหรับคุณ
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gradient-gold">
              {luckyDrawResult.name}
            </h2>
            <p className="text-sm text-foreground/90 max-w-md mx-auto">
              "{luckyDrawResult.meaning}"
            </p>
            <div className="flex justify-center items-center gap-3 pt-2">
              <span className="rounded-lg bg-background/80 px-3 py-1 text-xs text-gold font-medium border border-gold/20">
                ผลรวมเลขศาสตร์: {luckyDrawResult.scoreNumber} ({luckyDrawResult.scoreGrade})
              </span>
              <button
                type="button"
                onClick={() => handleCopy(luckyDrawResult.name, "draw")}
                className="inline-flex items-center gap-1.5 rounded-lg bg-gold px-3 py-1 text-xs font-semibold text-primary-foreground hover:opacity-90 transition cursor-pointer"
              >
                {copiedId === "draw" ? (
                  <>
                    <Check className="h-3.5 w-3.5" /> คัดลอกแล้ว
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" /> คัดลอกชื่อ
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Names Grid */}
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNames.map((item) => (
            <div
              key={item.id}
              className="group rounded-2xl border border-gold/15 bg-card/60 p-5 space-y-3 hover:border-gold/40 hover:bg-card/90 transition shadow-sm flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xl font-display font-bold text-foreground group-hover:text-gold transition-colors">
                    {item.name}
                  </span>
                  <span className="rounded-md bg-gold/10 px-2 py-0.5 text-[10px] font-semibold text-gold border border-gold/15">
                    ผลรวม {item.scoreNumber} ({item.scoreGrade})
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {item.meaning}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-gold/10 pt-2.5 text-[11px] text-muted-foreground">
                <span className="text-gold/80 font-medium">
                  {item.gender === "male"
                    ? "เพศชาย"
                    : item.gender === "female"
                    ? "เพศหญิง"
                    : "ชาย/หญิง"}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(item.name, item.id)}
                  className="flex items-center gap-1 text-gold/70 hover:text-gold transition cursor-pointer"
                >
                  {copiedId === item.id ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" />
                      <span className="text-emerald-400">คัดลอกแล้ว</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>คัดลอก</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredNames.length === 0 && (
          <div className="mt-12 rounded-2xl border border-gold/15 bg-card/40 p-8 text-center space-y-2">
            <Lightbulb className="mx-auto h-8 w-8 text-gold/60" />
            <p className="text-sm font-medium text-foreground">ไม่พบชื่อที่ตรงกับเงื่อนไขการค้นหา</p>
            <p className="text-xs text-muted-foreground">
              ลองเปลี่ยนเป้าหมายเสริมดวง หรือปรับคำค้นหาใหม่
            </p>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
