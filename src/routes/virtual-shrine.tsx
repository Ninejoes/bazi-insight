import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { seo, siteUrl } from "@/lib/seo";
import {
  WISH_CATEGORIES,
  SHRINE_DEITIES,
  playTempleBell,
  getPrayerHistory,
  savePrayerHistory,
  clearPrayerHistory,
  type WishCategoryKey,
  type ShrineDeity,
  type PrayerHistoryItem,
} from "@/lib/virtual-shrine";
import { ShareStoryModal, type ShareCardData } from "@/components/share-story-modal";
import {
  Coins,
  Briefcase,
  Heart,
  Sparkles,
  Activity,
  GraduationCap,
  Shield,
  Flame,
  Check,
  Copy,
  Share2,
  RotateCcw,
  Volume2,
  ArrowLeft,
  ArrowRight,
  Calendar,
  User,
  Bell,
  BookOpen,
  Award,
} from "lucide-react";

export const Route = createFileRoute("/virtual-shrine")({
  head: () =>
    seo({
      title: "ไหว้พระออนไลน์ ขอพรสิ่งศักดิ์สิทธิ์ จุดธูปเทียนเสมือนจริง ทำบุญตรงเข้าวัด — ลิขิตฟ้า",
      description:
        "ห้องไหว้พระออนไลน์เสมือนจริง จุดธูป 3 ดอก จุดเทียนคู่ ถวายดอกไม้ สวดมนต์พร้อมเสียงระฆัง เขียนคำอธิษฐานจิต และกราบพระ 3 ครั้ง พร้อมร่วมทำบุญตรงเข้าบัญชีวัด 100% ไม่ผ่านคนกลาง",
      path: "/virtual-shrine",
      canonicalUrl: `${siteUrl}/virtual-shrine`,
      keywords: [
        "ไหว้พระออนไลน์",
        "ขอพรสิ่งศักดิ์สิทธิ์",
        "จุดธูปออนไลน์",
        "หลวงพ่อโสธร ออนไลน์",
        "หลวงพ่อทันใจ ออนไลน์",
        "ท้าวเวสสุวรรณ ออนไลน์",
        "พระแม่ลักษมี ออนไลน์",
        "ทำบุญออนไลน์",
        "ไหว้พระแก้ชง",
        "Likhitfa",
      ],
    }),
  component: VirtualShrinePage,
});

function VirtualShrinePage() {
  const [selectedCategory, setSelectedCategory] = useState<WishCategoryKey | "all">("all");
  const [activeDeity, setActiveDeity] = useState<ShrineDeity | null>(null);

  // Ritual State
  const [isIncenseLit, setIsIncenseLit] = useState(false);
  const [isLeftCandleLit, setIsLeftCandleLit] = useState(false);
  const [isRightCandleLit, setIsRightCandleLit] = useState(false);
  const [flowerType, setFlowerType] = useState<string>("lotus");
  const [isFlowerOffered, setIsFlowerOffered] = useState(false);
  const [userName, setUserName] = useState("");
  const [userBirth, setUserBirth] = useState("");
  const [prayerText, setPrayerText] = useState("");
  const [bowCount, setBowCount] = useState(0);
  const [isRitualDone, setIsRitualDone] = useState(false);

  // Donation / Completion Step
  const [isCompleted, setIsCompleted] = useState(false);
  const [copiedBank, setCopiedBank] = useState(false);
  const [historyList, setHistoryList] = useState<PrayerHistoryItem[]>([]);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareData, setShareData] = useState<ShareCardData | null>(null);

  useEffect(() => {
    setHistoryList(getPrayerHistory());
  }, []);

  // Filtered deities
  const filteredDeities = useMemo(() => {
    if (selectedCategory === "all") return SHRINE_DEITIES;
    return SHRINE_DEITIES.filter((d) => d.primaryWishKeys.includes(selectedCategory));
  }, [selectedCategory]);

  const handleSelectDeity = (deity: ShrineDeity) => {
    setActiveDeity(deity);
    // Reset ritual states
    setIsIncenseLit(false);
    setIsLeftCandleLit(false);
    setIsRightCandleLit(false);
    setIsFlowerOffered(false);
    setBowCount(0);
    setIsRitualDone(false);
    setIsCompleted(false);
    setCopiedBank(false);

    // Pre-fill standard prayer template
    setPrayerText(
      `ขออำนาจบารมีแห่ง${deity.name} ${deity.temple} โปรดเมตตาคุ้มครองข้าพเจ้า ให้ประสบความสุข ความเจริญในชีวิต การงานราบรื่น การเงินคล่องตัว แคล้วคลาดปลอดภัยเทอญ`,
    );

    // Play welcome temple chime
    playTempleBell("deep");

    window.scrollTo({ top: 350, behavior: "smooth" });
  };

  const handleResetRitual = () => {
    setIsIncenseLit(false);
    setIsLeftCandleLit(false);
    setIsRightCandleLit(false);
    setIsFlowerOffered(false);
    setBowCount(0);
    setIsRitualDone(false);
    setIsCompleted(false);
  };

  const handleBow = () => {
    if (bowCount < 3) {
      const next = bowCount + 1;
      setBowCount(next);
      playTempleBell(next === 3 ? "bowl" : "high");
      if (next === 3) {
        setIsRitualDone(true);
      }
    }
  };

  const handleFinishPrayer = (withDonationView = true) => {
    if (!activeDeity) return;

    // Save to local storage history
    const saved = savePrayerHistory({
      deityId: activeDeity.id,
      deityName: activeDeity.name,
      templeName: activeDeity.temple,
      wishCategory: selectedCategory === "all" ? activeDeity.primaryWishKeys[0] : selectedCategory,
      userName: userName.trim() || "ผู้มีจิตศรัทธา",
      userBirthDate: userBirth.trim() || undefined,
      prayerText: prayerText.trim(),
      flowerType: flowerType === "lotus" ? "ดอกบัวสัตตบงกช" : flowerType === "marigold" ? "ดอกดาวเรืองทอง" : "พวงมาลัยมะลิสด",
    });

    setHistoryList(getPrayerHistory());
    setIsCompleted(true);

    // Set share card data
    setShareData({
      category: `ไหว้พระขอพร · ${activeDeity.temple}`,
      categoryCn: "佛光普照",
      title: activeDeity.name,
      subtitle: `ขอพรสำเร็จ ณ วันที่ ${new Date().toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" })}`,
      highlights: [
        { label: "ผู้ขอพร", value: userName.trim() || "ผู้มีจิตศรัทธา" },
        { label: "สถานที่", value: `${activeDeity.temple} ${activeDeity.province}` },
        { label: "พุทธคุณเด่น", value: activeDeity.badge },
        { label: "เครื่องสักการะ", value: "ธูป ๓ เทียนคู่ ดอกไม้มงคล" },
      ],
      quote: prayerText.slice(0, 95) || activeDeity.chantMeaning,
      footerTag: "ไหว้พระออนไลน์เสมือนจริง www.likhitfa.online",
    });

    playTempleBell("bowl");
  };

  const handleCopyAccount = () => {
    if (!activeDeity) return;
    void navigator.clipboard.writeText(activeDeity.directDonation.accountNumber.replace(/-/g, ""));
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 3000);
  };

  return (
    <div className="relative min-h-screen">
      <SiteHeader subtitle="ไหว้พระออนไลน์" subtitleCn="線上禮佛" />

      <main className="mx-auto max-w-6xl px-5 pt-10 pb-20">
        {/* Hero Section */}
        <section className="glass-strong relative overflow-hidden rounded-3xl p-8 shadow-elegant md:p-12">
          <div className="pointer-events-none absolute -right-6 -top-10 font-cn text-[180px] leading-none text-gold/[0.04]">
            佛
          </div>
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-4 py-1.5 text-[11px] tracking-[0.2em] text-gold">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" />
              VIRTUAL SHRINE · พุทธานุภาพคุ้มครอง
            </div>
            <h1 className="mt-5 font-display text-4xl text-foreground md:text-6xl">
              ไหว้พระออนไลน์ <span className="text-gradient-gold italic">เสมือนจริง</span>
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
              จิตที่ตั้งมั่น ณ ที่ใด พุทธานุภาพย่อมคุ้มครอง ณ ที่นั้น สำหรับผู้ที่ไม่มีเวลาไปวัด
              หรืออยู่แดนไกล ร่วมจุดธูปเทียน สวดพระคาถา ตั้งจิตอธิษฐาน และทำบุญตรงเข้าบัญชีวัด 100%
              โดยไม่ผ่านคนกลาง
            </p>
          </div>
        </section>

        {/* STEP 1: WISH CATEGORY SELECTOR */}
        <section className="mt-10">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.25em] text-gold/80 font-semibold">
                Step 1 · เลือกเรื่องที่ต้องการขอพร
              </div>
              <h2 className="mt-1 font-display text-2xl text-foreground md:text-3xl">
                วันนี้คุณต้องการขอพรสิ่งศักดิ์สิทธิ์เรื่องใด?
              </h2>
            </div>
            {historyList.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById("prayer-history-section");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="inline-flex items-center gap-1.5 text-xs text-gold/90 hover:text-gold transition font-medium"
              >
                <BookOpen className="h-4 w-4" />
                ดูประวัติการขอพรของคุณ ({historyList.length} ครั้ง)
              </button>
            )}
          </div>

          {/* Category Chips */}
          <div className="mt-6 flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={`rounded-2xl px-4 py-2.5 text-xs font-semibold transition ${
                selectedCategory === "all"
                  ? "bg-gradient-gold text-primary-foreground shadow-gold"
                  : "border border-border bg-card/40 text-muted-foreground hover:border-gold/30 hover:text-foreground"
              }`}
            >
              ทั้งหมด (10 พระอาราม)
            </button>
            {WISH_CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => setSelectedCategory(cat.key)}
                className={`flex items-center gap-1.5 rounded-2xl px-4 py-2.5 text-xs font-semibold transition ${
                  selectedCategory === cat.key
                    ? "bg-gradient-gold text-primary-foreground shadow-gold"
                    : "border border-border bg-card/40 text-muted-foreground hover:border-gold/30 hover:text-foreground"
                }`}
              >
                {cat.key === "wealth" && <Coins className="h-3.5 w-3.5" />}
                {cat.key === "career" && <Briefcase className="h-3.5 w-3.5" />}
                {cat.key === "love" && <Heart className="h-3.5 w-3.5" />}
                {cat.key === "fortune" && <Sparkles className="h-3.5 w-3.5" />}
                {cat.key === "health" && <Activity className="h-3.5 w-3.5" />}
                {cat.key === "exam" && <GraduationCap className="h-3.5 w-3.5" />}
                {cat.key === "protection" && <Shield className="h-3.5 w-3.5" />}
                {cat.key === "remedy" && <Flame className="h-3.5 w-3.5" />}
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Deities Grid */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredDeities.map((deity) => {
              const isSelected = activeDeity?.id === deity.id;
              return (
                <div
                  key={deity.id}
                  className={`group relative overflow-hidden rounded-3xl border p-6 transition-all duration-300 ${
                    isSelected
                      ? "border-gold bg-[#121622] ring-2 ring-gold/50 shadow-[0_10px_35px_rgba(245,199,98,0.18)]"
                      : "border-border/70 bg-card/40 hover:border-gold/40 hover:bg-card/70"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="rounded-full border border-gold/30 bg-gold/10 px-2.5 py-1 text-[10px] font-semibold text-gold">
                      {deity.badge}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {deity.province}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-gold font-display text-lg font-bold text-primary-foreground shadow-gold">
                      {deity.avatarText.slice(0, 2)}
                    </div>
                    <div>
                      <h3 className="font-display text-xl text-foreground group-hover:text-gold transition">
                        {deity.name}
                      </h3>
                      <div className="text-xs text-muted-foreground">{deity.temple}</div>
                    </div>
                  </div>

                  <p className="mt-3.5 text-xs leading-relaxed text-muted-foreground line-clamp-3">
                    {deity.description}
                  </p>

                  <div className="mt-4 border-t border-gold/10 pt-3 text-[11px] text-gold/90 font-medium">
                    ✨ เด่น: {deity.highlight}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSelectDeity(deity)}
                    className={`mt-4 w-full rounded-xl py-2.5 text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? "bg-gradient-gold text-primary-foreground shadow-gold"
                        : "border border-gold/30 text-gold hover:bg-gold/10"
                    }`}
                  >
                    <span>{isSelected ? "กำลังกราบไหว้ ณ แท่นบูชา" : "เข้าสู่ห้องไหว้พระ"}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* STEP 2: VIRTUAL ALTAR ROOM (Only when deity is selected) */}
        {activeDeity && (
          <section
            id="virtual-altar-section"
            className="mt-14 scroll-mt-24 space-y-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.25em] text-gold font-semibold">
                  Step 2 · พิธีการไหว้พระเสมือนจริง
                </div>
                <h2 className="mt-1 font-display text-3xl text-foreground">
                  แท่นบูชาศักดิ์สิทธิ์: {activeDeity.name}
                </h2>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {activeDeity.temple} ({activeDeity.province})
                </div>
              </div>

              <button
                type="button"
                onClick={handleResetRitual}
                className="flex items-center gap-1.5 rounded-xl border border-border px-3.5 py-1.5 text-xs text-muted-foreground hover:text-foreground transition"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                เริ่มพิธีใหม่
              </button>
            </div>

            {/* Main Altar Stage */}
            <div className="relative overflow-hidden rounded-3xl border border-gold/40 bg-gradient-to-b from-[#161b2a] via-[#0e121e] to-[#080a11] p-6 sm:p-10 shadow-[0_20px_70px_rgba(0,0,0,0.85)] ring-1 ring-gold/25">
              {/* Spiritual Radiance Aura */}
              <div
                className={`pointer-events-none absolute left-1/2 top-1/4 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl transition-opacity duration-1000 ${
                  bowCount === 3
                    ? "h-96 w-96 bg-amber-400/30 opacity-100"
                    : isIncenseLit
                    ? "h-72 w-72 bg-gold/15 opacity-80"
                    : "h-48 w-48 bg-gold/5 opacity-40"
                }`}
              />

              {/* Deity Centerpiece Icon / Medallion */}
              <div className="relative mx-auto flex max-w-md flex-col items-center text-center">
                <div className="relative flex h-28 w-28 items-center justify-center rounded-full border-2 border-gold/60 bg-gradient-to-b from-amber-500/20 to-black p-2 shadow-[0_0_35px_rgba(245,199,98,0.3)] ring-4 ring-gold/20">
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-gold shadow-inner font-display text-3xl font-black text-primary-foreground tracking-wider">
                    {activeDeity.avatarText}
                  </div>
                  {/* Floating Gold Lotus Emblem */}
                  <span className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-black border border-gold/60 text-xs text-gold">
                    ☸
                  </span>
                </div>

                <h3 className="mt-4 font-display text-2xl sm:text-3xl font-bold text-foreground">
                  {activeDeity.name}
                </h3>
                <div className="text-xs text-gold/90 font-medium">
                  {activeDeity.title}
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  {activeDeity.location}, {activeDeity.province}
                </div>
              </div>

              {/* ALTAR INTERACTIVE ELEMENTS (Twin Candles, Incense Burner, Flower Tray) */}
              <div className="mt-8 grid grid-cols-3 items-end gap-3 sm:gap-6 border-b border-gold/15 pb-8">
                {/* Left Candle */}
                <div className="flex flex-col items-center text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsLeftCandleLit((v) => !v);
                      playTempleBell("high");
                    }}
                    className="group relative flex flex-col items-center cursor-pointer focus:outline-none"
                  >
                    {/* Flame */}
                    <div
                      className={`h-7 w-3 rounded-full transition-all duration-300 ${
                        isLeftCandleLit
                          ? "bg-gradient-to-t from-orange-500 via-amber-300 to-yellow-100 shadow-[0_0_18px_rgba(251,191,36,0.9)] animate-pulse"
                          : "h-2 w-1 bg-muted-foreground/30 opacity-40"
                      }`}
                    />
                    {/* Candle stick */}
                    <div className="mt-1 h-20 w-4 rounded-t-sm bg-gradient-to-b from-amber-100 via-amber-200 to-amber-400 border border-amber-500/40 shadow-md" />
                    {/* Stand */}
                    <div className="h-3 w-8 rounded-full bg-gradient-gold shadow-sm border border-gold" />
                  </button>
                  <span className="mt-2 text-[10px] text-muted-foreground">
                    {isLeftCandleLit ? "เทียนซ้าย: จุดแล้ว" : "แตะเพื่อจุดเทียนซ้าย"}
                  </span>
                </div>

                {/* Center Incense Burner (กระถางธูปทองเหลือง & ธูป 3 ดอก) */}
                <div className="flex flex-col items-center text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsIncenseLit((v) => !v);
                      playTempleBell("deep");
                    }}
                    className="group relative flex flex-col items-center cursor-pointer focus:outline-none"
                  >
                    {/* Rising Smoke Particles (CSS Simulation) */}
                    <div className="relative h-12 w-12 flex justify-center">
                      {isIncenseLit && (
                        <div className="absolute inset-0 flex justify-center space-x-1 pointer-events-none">
                          <span className="w-0.5 h-10 bg-gradient-to-t from-amber-300 to-transparent rounded-full animate-ping opacity-60" />
                          <span className="w-0.5 h-12 bg-gradient-to-t from-gold to-transparent rounded-full animate-pulse opacity-80" />
                          <span className="w-0.5 h-8 bg-gradient-to-t from-amber-300 to-transparent rounded-full animate-ping opacity-50" />
                        </div>
                      )}
                    </div>

                    {/* 3 Incense Sticks */}
                    <div className="flex items-end justify-center space-x-1.5 -mt-2">
                      <div className="flex flex-col items-center">
                        <div
                          className={`h-1.5 w-1.5 rounded-full ${
                            isIncenseLit
                              ? "bg-red-500 shadow-[0_0_8px_#ef4444]"
                              : "bg-muted-foreground/40"
                          }`}
                        />
                        <div className="h-16 w-0.5 bg-amber-800" />
                      </div>
                      <div className="flex flex-col items-center">
                        <div
                          className={`h-1.5 w-1.5 rounded-full ${
                            isIncenseLit
                              ? "bg-red-500 shadow-[0_0_8px_#ef4444]"
                              : "bg-muted-foreground/40"
                          }`}
                        />
                        <div className="h-20 w-0.5 bg-amber-800" />
                      </div>
                      <div className="flex flex-col items-center">
                        <div
                          className={`h-1.5 w-1.5 rounded-full ${
                            isIncenseLit
                              ? "bg-red-500 shadow-[0_0_8px_#ef4444]"
                              : "bg-muted-foreground/40"
                          }`}
                        />
                        <div className="h-16 w-0.5 bg-amber-800" />
                      </div>
                    </div>

                    {/* Brass Incense Burner Bowl */}
                    <div className="relative mt-1 flex h-10 w-20 items-center justify-center rounded-b-2xl border-2 border-gold bg-gradient-to-b from-yellow-600 via-amber-500 to-yellow-700 shadow-gold">
                      <span className="font-cn text-xs font-bold text-amber-950">
                        福
                      </span>
                    </div>
                  </button>
                  <span className="mt-2 text-[10px] text-muted-foreground">
                    {isIncenseLit ? "ธูป ๓ ดอก: จุดบูชาแล้ว" : "แตะเพื่อจุดธูป ๓ ดอก"}
                  </span>
                </div>

                {/* Right Candle */}
                <div className="flex flex-col items-center text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRightCandleLit((v) => !v);
                      playTempleBell("high");
                    }}
                    className="group relative flex flex-col items-center cursor-pointer focus:outline-none"
                  >
                    {/* Flame */}
                    <div
                      className={`h-7 w-3 rounded-full transition-all duration-300 ${
                        isRightCandleLit
                          ? "bg-gradient-to-t from-orange-500 via-amber-300 to-yellow-100 shadow-[0_0_18px_rgba(251,191,36,0.9)] animate-pulse"
                          : "h-2 w-1 bg-muted-foreground/30 opacity-40"
                      }`}
                    />
                    {/* Candle stick */}
                    <div className="mt-1 h-20 w-4 rounded-t-sm bg-gradient-to-b from-amber-100 via-amber-200 to-amber-400 border border-amber-500/40 shadow-md" />
                    {/* Stand */}
                    <div className="h-3 w-8 rounded-full bg-gradient-gold shadow-sm border border-gold" />
                  </button>
                  <span className="mt-2 text-[10px] text-muted-foreground">
                    {isRightCandleLit ? "เทียนขวา: จุดแล้ว" : "แตะเพื่อจุดเทียนขวา"}
                  </span>
                </div>
              </div>

              {/* FLOWER OFFERING TRAY */}
              <div className="mt-6 flex flex-col items-center text-center">
                <div className="text-xs text-gold/80 font-medium mb-3">
                  เลือกเครื่องสักการะถวายแท่นบูชา:
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFlowerType("lotus");
                      setIsFlowerOffered(true);
                      playTempleBell("bowl");
                    }}
                    className={`rounded-xl px-3.5 py-1.5 text-xs transition ${
                      flowerType === "lotus" && isFlowerOffered
                        ? "bg-gold/20 text-gold border border-gold/40 font-semibold"
                        : "border border-border bg-card/40 text-muted-foreground hover:border-gold/30"
                    }`}
                  >
                    🪷 ถวายดอกบัวหลวงสัตตบงกช
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFlowerType("jasmine");
                      setIsFlowerOffered(true);
                      playTempleBell("bowl");
                    }}
                    className={`rounded-xl px-3.5 py-1.5 text-xs transition ${
                      flowerType === "jasmine" && isFlowerOffered
                        ? "bg-gold/20 text-gold border border-gold/40 font-semibold"
                        : "border border-border bg-card/40 text-muted-foreground hover:border-gold/30"
                    }`}
                  >
                    🌸 ถวายพวงมาลัยมะลิสด
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFlowerType("marigold");
                      setIsFlowerOffered(true);
                      playTempleBell("bowl");
                    }}
                    className={`rounded-xl px-3.5 py-1.5 text-xs transition ${
                      flowerType === "marigold" && isFlowerOffered
                        ? "bg-gold/20 text-gold border border-gold/40 font-semibold"
                        : "border border-border bg-card/40 text-muted-foreground hover:border-gold/30"
                    }`}
                  >
                    🌼 ถวายดอกดาวเรืองทอง
                  </button>
                </div>
              </div>

              {/* CHANT & PRAYER SCRIPTURE BOX */}
              <div className="mt-8 rounded-2xl border border-gold/25 bg-background/50 p-6">
                <div className="flex items-center justify-between border-b border-gold/15 pb-3">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-gold" />
                    <span className="font-display text-base font-bold text-foreground">
                      {activeDeity.chantTitle}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => playTempleBell("bowl")}
                    className="flex items-center gap-1 rounded-lg border border-gold/30 bg-gold/10 px-2.5 py-1 text-xs text-gold hover:bg-gold/20 transition"
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                    เคาะระฆังวัด
                  </button>
                </div>

                <div className="mt-4 space-y-3 text-center">
                  <div className="text-xs font-semibold text-amber-300/90 tracking-wider">
                    {activeDeity.namoText}
                  </div>
                  <div className="font-serif text-base sm:text-lg leading-relaxed text-foreground font-medium px-4">
                    {activeDeity.chantPali}
                  </div>
                  <div className="text-xs italic leading-relaxed text-muted-foreground/90 max-w-xl mx-auto pt-1">
                    (คำแปล: {activeDeity.chantMeaning})
                  </div>
                </div>
              </div>

              {/* USER PRAYER FORM & BOWING ACTIONS */}
              <div className="mt-8 rounded-2xl border border-gold/20 bg-background/30 p-6 space-y-4">
                <div className="text-xs uppercase tracking-wider text-gold font-semibold">
                  ตั้งจิตอธิษฐานขอพร
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">
                      ชื่อ-นามสกุล ผู้ขอพร:
                    </label>
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="เช่น นายธนบดี มีโชคทวี"
                      className="w-full rounded-xl border border-border bg-background/60 px-3 py-2 text-sm text-foreground focus:border-gold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">
                      วันเดือนปีเกิด (ตามสะดวก):
                    </label>
                    <input
                      type="text"
                      value={userBirth}
                      onChange={(e) => setUserBirth(e.target.value)}
                      placeholder="เช่น วันอังคาร 15 มกราคม 2535"
                      className="w-full rounded-xl border border-border bg-background/60 px-3 py-2 text-sm text-foreground focus:border-gold focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-muted-foreground mb-1">
                    คำอธิษฐานจิต:
                  </label>
                  <textarea
                    rows={3}
                    value={prayerText}
                    onChange={(e) => setPrayerText(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background/60 p-3 text-sm text-foreground focus:border-gold focus:outline-none leading-relaxed"
                  />
                  {/* Quick suggested prayer chips */}
                  <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
                    <span className="text-muted-foreground">ข้อความแนะนำ:</span>
                    <button
                      type="button"
                      onClick={() =>
                        setPrayerText(
                          `ขออานุภาพแห่ง${activeDeity.name} โปรดเปิดทิศทางโภคทรัพย์ ให้การเงินไหลมาเทมา ปลดเปลื้องหนี้สิน ค้าขายเจริญรุ่งเรืองเทอญ`,
                        )
                      }
                      className="rounded-md bg-gold/10 px-2 py-0.5 text-gold hover:bg-gold/20 transition"
                    >
                      + การเงินปลดหนี้
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setPrayerText(
                          `ขอพึ่งบารมี${activeDeity.name} โปรดดลบันดาลให้การงานก้าวหน้า ได้เลื่อนขั้นเลื่อนตำแหน่ง มีผู้ใหญ่อุปถัมภ์ค้ำชูเทอญ`,
                        )
                      }
                      className="rounded-md bg-gold/10 px-2 py-0.5 text-gold hover:bg-gold/20 transition"
                    >
                      + การงานเลื่อนขั้น
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setPrayerText(
                          `ขออานุภาพแห่ง${activeDeity.name} ดลบันดาลให้ข้าพเจ้าและครอบครัวแคล้วคลาดปลอดภัยจากสรรพภัยทั้งปวง สุขภาพแข็งแรงไร้โรคาเทอญ`,
                        )
                      }
                      className="rounded-md bg-gold/10 px-2 py-0.5 text-gold hover:bg-gold/20 transition"
                    >
                      + สุขภาพแคล้วคลาด
                    </button>
                  </div>
                </div>

                {/* 3 Bows Button Counter */}
                <div className="border-t border-gold/15 pt-5 text-center">
                  <div className="text-xs text-muted-foreground mb-3">
                    ขั้นตอนสุดท้าย: ตั้งจิตสำรวมแล้วกดกราบ ๓ ครั้ง เพื่อความเป็นสิริมงคล
                  </div>

                  <div className="flex flex-col items-center gap-3">
                    <button
                      type="button"
                      onClick={handleBow}
                      disabled={bowCount >= 3}
                      className={`relative overflow-hidden rounded-2xl px-8 py-3.5 font-display text-base font-bold transition-all ${
                        bowCount < 3
                          ? "bg-gradient-gold text-primary-foreground shadow-gold hover:scale-105 active:scale-95"
                          : "border border-gold/40 bg-gold/20 text-gold cursor-default"
                      }`}
                    >
                      {bowCount === 0 && "กราบครั้งที่ ๑ (บูชาคุณพระพุทธเจ้า)"}
                      {bowCount === 1 && "กราบครั้งที่ ๒ (บูชาคุณพระธรรมเจ้า)"}
                      {bowCount === 2 && "กราบครั้งที่ ๓ (บูชาคุณพระสงฆ์ / ครูบาอาจารย์)"}
                      {bowCount >= 3 && "✨ อภิวาทกราบครบ ๓ ครั้งแล้ว สาธุ"}
                    </button>

                    {/* Progress indicators */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className={`h-2.5 w-2.5 rounded-full ${bowCount >= 1 ? "bg-gold" : "bg-border"}`} />
                      <span className={`h-2.5 w-2.5 rounded-full ${bowCount >= 2 ? "bg-gold" : "bg-border"}`} />
                      <span className={`h-2.5 w-2.5 rounded-full ${bowCount >= 3 ? "bg-gold" : "bg-border"}`} />
                      <span className="ml-1 text-[11px] text-gold font-medium">
                        {bowCount}/3 ครั้ง
                      </span>
                    </div>
                  </div>

                  {/* Proceed to Donation / Blessing */}
                  {isRitualDone && (
                    <div className="mt-6 animate-fade-in border-t border-gold/20 pt-6">
                      <button
                        type="button"
                        onClick={() => handleFinishPrayer(true)}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-gold px-8 py-4 font-display text-lg font-bold text-primary-foreground shadow-gold hover:scale-105 transition"
                      >
                        <span>รับพรมงคล & ข้อมูลทำบุญตรงเข้าวัด</span>
                        <ArrowRight className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* STEP 3: DIRECT TEMPLE E-DONATION & BLESSING COMPLETE */}
            {isCompleted && (
              <div
                id="temple-donation-section"
                className="mt-10 rounded-3xl border border-gold/40 bg-[#0c101c] p-6 sm:p-10 shadow-2xl space-y-6 animate-fade-in"
              >
                <div className="text-center max-w-xl mx-auto">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-gold/15 text-gold border border-gold/40 text-2xl shadow-gold mb-3">
                    🙏
                  </div>
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                    การอธิษฐานจิตเสร็จสมบูรณ์
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    ขออำนาจคุณพระศรีรัตนตรัย และบารมีแห่ง{activeDeity.name} โปรดอภิบาลคุ้มครอง{" "}
                    <span className="text-gold font-semibold">{userName || "ท่านและครอบครัว"}</span>{" "}
                    ให้เจริญด้วยจตุรพิธพรชัย อายุ วรรณะ สุขะ พละ ทุกประการ
                  </p>
                </div>

                {/* Direct Donation Info Box */}
                <div className="rounded-2xl border border-gold/30 bg-background/50 p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gold/15 pb-3">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-gold" />
                      <span className="text-sm font-bold text-foreground">
                        ร่วมทำบุญตรงเข้าวัด (ไม่ผ่านคนกลาง 100%)
                      </span>
                    </div>
                    <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] text-emerald-400 font-medium">
                      🛡️ โอนตรงเข้าบัญชีวัด ปลอดภัย
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    เพื่อความบริสุทธิ์แห่งจิตศรัทธา เว็บไซต์ Likhitfa
                    ไม่มีการรับเงินบริจาคผ่านระบบของเว็บแต่อย่างใด
                    หากท่านประสงค์จะร่วมถวายปัจจัยทำบุญ สามารถใช้แอปพลิเคชันธนาคาร
                    โอนตรงเข้าบัญชีทางการของวัดได้ตามรายละเอียดด้านล่าง:
                  </p>

                  <div className="rounded-xl border border-border bg-background/60 p-4 space-y-2.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">วัด/สถานที่:</span>
                      <span className="font-semibold text-foreground">
                        {activeDeity.directDonation.templeName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ธนาคาร:</span>
                      <span className="font-semibold text-foreground">
                        {activeDeity.directDonation.bankName}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">เลขที่บัญชี:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm sm:text-base font-bold text-gold">
                          {activeDeity.directDonation.accountNumber}
                        </span>
                        <button
                          type="button"
                          onClick={handleCopyAccount}
                          className="rounded-lg border border-gold/30 bg-gold/10 px-2.5 py-1 text-[10px] text-gold hover:bg-gold/20 transition flex items-center gap-1"
                        >
                          {copiedBank ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          <span>{copiedBank ? "คัดลอกแล้ว" : "คัดลอก"}</span>
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ชื่อบัญชี:</span>
                      <span className="font-semibold text-foreground text-right">
                        {activeDeity.directDonation.accountName}
                      </span>
                    </div>
                    <div className="border-t border-border/50 pt-2 text-[11px] text-muted-foreground italic">
                      หมายเหตุ: {activeDeity.directDonation.note}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsShareModalOpen(true)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-gold/40 bg-gold/10 px-4 py-2.5 text-xs font-semibold text-gold hover:bg-gold/20 transition"
                    >
                      <Share2 className="h-4 w-4" />
                      <span>สร้างการ์ดอนุโมทนาบุญ (9:16 แชร์สตอรี่)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="text-xs text-muted-foreground hover:text-foreground transition"
                    >
                      กลับขึ้นด้านบน ↑
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* STEP 4: PRAYER HISTORY SECTION */}
        <section id="prayer-history-section" className="mt-20 border-t border-gold/15 pt-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-xs uppercase tracking-wider text-gold/80 font-semibold">
                บันทึกบุญบารมี (Prayer Diary)
              </div>
              <h2 className="font-display text-2xl text-foreground">
                ประวัติการไหว้พระขอพรของคุณ
              </h2>
            </div>
            {historyList.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  clearPrayerHistory();
                  setHistoryList([]);
                }}
                className="text-xs text-muted-foreground hover:text-rose-400 transition"
              >
                ล้างประวัติ
              </button>
            )}
          </div>

          {historyList.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {historyList.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-border/70 bg-card/40 p-4 text-xs space-y-2 hover:border-gold/30 transition"
                >
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>
                      {new Date(item.timestamp).toLocaleDateString("th-TH", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <span className="text-gold font-medium">{item.flowerType}</span>
                  </div>
                  <div className="font-semibold text-sm text-foreground">
                    {item.deityName}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {item.templeName}
                  </div>
                  <p className="text-muted-foreground/90 italic line-clamp-2 border-t border-border/40 pt-2">
                    &ldquo;{item.prayerText}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border/70 p-8 text-center text-xs text-muted-foreground">
              ยังไม่มีประวัติการไหว้พระ เมื่อท่านทำพิธีอธิษฐานจิตด้านบน
              ระบบจะบันทึกประวัติการขอพรไว้ในเครื่องนี้ให้โดยอัตโนมัติ
            </div>
          )}
        </section>
      </main>

      {/* Share Modal */}
      {shareData && (
        <ShareStoryModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          data={shareData}
        />
      )}

      <SiteFooter />
    </div>
  );
}
