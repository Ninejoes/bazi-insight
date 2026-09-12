import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { seo, siteUrl } from "@/lib/seo";
import {
  WISH_CATEGORIES,
  SHRINE_DEITIES,
  calculateDeityAuspiciousNumbers,
  playTempleBell,
  getPrayerHistory,
  savePrayerHistory,
  clearPrayerHistory,
  type WishCategoryKey,
  type ShrineDeity,
  type PrayerHistoryItem,
  type AuspiciousResult,
} from "@/lib/virtual-shrine";
import { ShareStoryModal, type ShareCardData } from "@/components/share-story-modal";
import { recordDivinationHistory } from "@/lib/member-history";
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
  ArrowRight,
  Bell,
  BookOpen,
  MapPin,
  Navigation,
  ExternalLink,
  Calendar,
  User,
  Clock,
  Info,
  CheckCircle2,
} from "lucide-react";

export const Route = createFileRoute("/virtual-shrine")({
  head: () =>
    seo({
      title: "ไหว้พระออนไลน์ ขอพรสิ่งศักดิ์สิทธิ์ จุดธูปเทียนเสมือนจริง รับเลขมงคล — ลิขิตฟ้า",
      description:
        "ห้องไหว้พระออนไลน์เสมือนจริง 10 องค์ศักดิ์สิทธิ์ เห็นองค์พระสมเกียรติ จุดธูป 3 ดอก จุดเทียนคู่ ถวายดอกไม้ สวดมนต์พร้อมเสียงระฆัง เขียนคำอธิษฐานจิต และกราบพระ 3 ครั้ง พร้อมรับเลขเด็ดมงคลและแผนที่ Google Maps สถานที่ไหว้จริง",
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
        "เลขเด็ดมงคล",
        "ไหว้พระแก้ชง",
        "Likhitfa",
      ],
    }),
  component: VirtualShrinePage,
});

function VirtualShrinePage() {
  const [selectedCategory, setSelectedCategory] = useState<WishCategoryKey | "all">("all");
  const [activeDeity, setActiveDeity] = useState<ShrineDeity>(SHRINE_DEITIES[0]);

  // Ritual State
  const [isIncenseLit, setIsIncenseLit] = useState(false);
  const [isLeftCandleLit, setIsLeftCandleLit] = useState(false);
  const [isRightCandleLit, setIsRightCandleLit] = useState(false);
  const [flowerType, setFlowerType] = useState<"lotus" | "jasmine" | "marigold">("lotus");
  const [isFlowerOffered, setIsFlowerOffered] = useState(false);
  const [userName, setUserName] = useState("");
  const [userBirth, setUserBirth] = useState("");
  const [prayerText, setPrayerText] = useState("");
  const [bowCount, setBowCount] = useState(0);
  const [isRitualDone, setIsRitualDone] = useState(false);

  // Lucky Number & Post-prayer Result
  const [luckyResult, setLuckyResult] = useState<AuspiciousResult | null>(null);
  const [copiedNumber, setCopiedNumber] = useState(false);

  // History & Share
  const [historyList, setHistoryList] = useState<PrayerHistoryItem[]>([]);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareData, setShareData] = useState<ShareCardData | null>(null);

  // Initialize prayer template when active deity changes
  useEffect(() => {
    setPrayerText(
      `ขออำนาจบารมีแห่ง${activeDeity.name} ${activeDeity.temple} โปรดเมตตาคุ้มครองข้าพเจ้า ให้ประสบความสุข ความเจริญในชีวิต การงานราบรื่น การเงินคล่องตัว แคล้วคลาดปลอดภัยเทอญ`,
    );
  }, [activeDeity]);

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
    // Reset ritual states for the new deity
    setIsIncenseLit(false);
    setIsLeftCandleLit(false);
    setIsRightCandleLit(false);
    setIsFlowerOffered(false);
    setBowCount(0);
    setIsRitualDone(false);
    setLuckyResult(null);
    setCopiedNumber(false);

    // Play soft temple bell
    playTempleBell("deep");
  };

  const handleResetRitual = () => {
    setIsIncenseLit(false);
    setIsLeftCandleLit(false);
    setIsRightCandleLit(false);
    setIsFlowerOffered(false);
    setBowCount(0);
    setIsRitualDone(false);
    setLuckyResult(null);
    setCopiedNumber(false);
    playTempleBell("high");
  };

  const handleLightAll = () => {
    setIsIncenseLit(true);
    setIsLeftCandleLit(true);
    setIsRightCandleLit(true);
    setIsFlowerOffered(true);
    playTempleBell("high");
  };

  const handleBow = () => {
    if (bowCount < 3) {
      const next = bowCount + 1;
      setBowCount(next);
      playTempleBell(next === 3 ? "bowl" : "high");
      if (next === 3) {
        setIsRitualDone(true);
        // Calculate lucky number immediately
        const calculated = calculateDeityAuspiciousNumbers(activeDeity, userName, userBirth);
        setLuckyResult(calculated);

        // Save prayer to local history
        savePrayerHistory({
          deityId: activeDeity.id,
          deityName: activeDeity.name,
          templeName: activeDeity.temple,
          wishCategory: selectedCategory === "all" ? activeDeity.primaryWishKeys[0] : selectedCategory,
          userName: userName.trim() || "ผู้มีจิตศรัทธา",
          userBirthDate: userBirth.trim() || undefined,
          prayerText: prayerText.trim(),
          flowerType: flowerType === "lotus" ? "ดอกบัวสัตตบงกช" : flowerType === "marigold" ? "ดอกดาวเรืองทอง" : "พวงมาลัยมะลิสด",
          luckyTwoDigit: calculated.twoDigit,
          luckyThreeDigit: calculated.threeDigit,
        });
        setHistoryList(getPrayerHistory());

        // Sync to member divination history
        recordDivinationHistory({
          type: "ไหว้พระออนไลน์",
          title: `ไหว้พระขอพร: ${activeDeity.name} (${activeDeity.temple})`,
          result: `กราบไหว้สำเร็จ 3 วาระ · เลขมงคลประจำจิต ${calculated.twoDigit} / ${calculated.threeDigit}`,
          url: "/virtual-shrine",
          metadata: {
            deityName: activeDeity.name,
            templeName: activeDeity.temple,
            userName: userName.trim() || "ผู้มีจิตศรัทธา",
            prayerText: prayerText.trim(),
            luckyTwoDigit: calculated.twoDigit,
            luckyThreeDigit: calculated.threeDigit,
          },
        });

        // Prepare share data
        const dateFormatted = new Date().toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" });
        setShareData({
          category: `ไหว้พระขอพร · ${activeDeity.temple}`,
          categoryCn: "佛光普照 · สาธุ",
          title: activeDeity.name,
          subtitle: `ขอพรสำเร็จ ณ วันที่ ${dateFormatted}`,
          bgImageUrl: activeDeity.imageUrl,
          theme: "shrine",
          luckyNumbers: {
            twoDigit: calculated.twoDigit,
            threeDigit: calculated.threeDigit,
          },
          devoteeName: userName.trim() || "ผู้มีจิตศรัทธา",
          templeName: activeDeity.temple,
          badgeText: activeDeity.badge,
          dateText: dateFormatted,
          highlights: [
            { label: "ผู้ขอพร", value: userName.trim() || "ผู้มีจิตศรัทธา" },
            { label: "สถานที่", value: `${activeDeity.temple} ${activeDeity.province}` },
            { label: "เลขมงคล", value: `${calculated.twoDigit} / ${calculated.threeDigit}` },
            { label: "พุทธคุณเด่น", value: activeDeity.badge },
          ],
          quote: prayerText.trim() || activeDeity.chantMeaning,
          footerTag: "ไหว้พระออนไลน์เสมือนจริง www.likhitfa.online",
        });
      }
    }
  };

  const handleCopyLucky = () => {
    if (!luckyResult) return;
    void navigator.clipboard.writeText(`เลขมงคล ${activeDeity.name}: 2 ตัว [${luckyResult.twoDigit}] 3 ตัว [${luckyResult.threeDigit}]`);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2500);
  };

  const quickWishes = [
    { label: "การเงิน & ปลดหนี้", text: `ขออำนาจบารมีแห่ง${activeDeity.name} โปรดดลบันดาลให้ข้าพเจ้ามีสภาพคล่องทางการเงิน ปลดเปลื้องหนี้สิน ค้าขายร่ำรวย เงินทองไหลมาเทมาไม่ขาดมือเทอญ` },
    { label: "การงาน & ก้าวหน้า", text: `ขออำนาจบารมีแห่ง${activeDeity.name} โปรดเมตตาให้หน้าที่การงานเจริญรุ่งเรือง เลื่อนขั้นเลื่อนตำแหน่ง ธุรกิจเติบโตก้าวไกล ไร้อุปสรรคขัดขวางเทอญ` },
    { label: "สุขภาพ & ปลอดภัย", text: `ขออำนาจบารมีแห่ง${activeDeity.name} โปรดปกป้องคุ้มครองข้าพเจ้าและครอบครัว ให้มีสุขภาพร่างกายแข็งแรง ปราศจากโรคภัยไข้เจ็บ เดินทางแคล้วคลาดปลอดภัยเทอญ` },
    { label: "ความรัก & คู่ครอง", text: `ขออำนาจบารมีแห่ง${activeDeity.name} โปรดประทานพรมงคล นำพาคู่แท้ที่มีศีลเสมอกันเข้ามาในชีวิต ครองคู่ด้วยความรัก ความเข้าใจ และความผาสุกเทอญ` },
  ];

  return (
    <div className="relative min-h-screen bg-[#07090e] text-slate-100 selection:bg-gold/30">
      <SiteHeader subtitle="ไหว้พระออนไลน์" subtitleCn="線上禮佛" />

      <main className="mx-auto max-w-7xl px-4 pt-6 pb-20 sm:px-6">
        {/* Banner Section */}
        <section className="relative mb-8 overflow-hidden rounded-3xl border border-gold/25 bg-gradient-to-r from-[#121724] via-[#0d101a] to-[#121724] p-6 shadow-2xl md:p-8">
          <div className="pointer-events-none absolute -right-6 -top-10 font-cn text-[160px] leading-none text-gold/[0.04]">
            佛
          </div>
          <div className="relative z-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3.5 py-1 text-[11px] tracking-[0.2em] text-gold">
                <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
                VIRTUAL SHRINE · พุทธานุภาพคุ้มครอง ๑๐ พระอาราม
              </div>
              <h1 className="mt-2 font-display text-3xl text-foreground sm:text-4xl">
                ไหว้พระออนไลน์ <span className="text-gold">เสมือนจริง</span>
              </h1>
              <p className="mt-1 max-w-2xl text-xs text-muted-foreground sm:text-sm">
                กราบไหว้องค์พระศักดิ์สิทธิ์ จุดธูป ๓ ดอก จุดเทียนคู่ ถวายดอกไม้ สวดมนต์กราบ ๓ ครั้ง และรับเลขเด็ดมงคลประจำองค์พระ
              </p>
            </div>

            {/* Quick Status Pill */}
            <div className="flex items-center gap-3 rounded-2xl border border-gold/20 bg-gold/5 px-4 py-3">
              <div className="relative h-10 w-10 overflow-hidden rounded-full border border-gold/40 shadow-inner">
                <img src={activeDeity.imageUrl} alt={activeDeity.name} className="h-full w-full object-cover" />
              </div>
              <div className="text-left">
                <div className="text-[10px] uppercase tracking-wider text-gold/80">กำลังกราบไหว้</div>
                <div className="font-display text-sm font-semibold text-foreground">{activeDeity.name}</div>
                <div className="text-[11px] text-muted-foreground">{activeDeity.province}</div>
              </div>
            </div>
          </div>
        </section>

        {/* 2-COLUMN MAIN WORKSPACE: 1/4 Left (Selector) + 3/4 Right (Altar & Ritual) */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          
          {/* ============================================================== */}
          {/* LEFT COLUMN (1/4 - lg:col-span-3 or 4) — DEITY SELECTOR SIDEBAR */}
          {/* ============================================================== */}
          <aside className="lg:col-span-4 xl:col-span-3">
            <div className="sticky top-20 space-y-4">
              
              {/* Category Filter Chips */}
              <div className="rounded-2xl border border-gold/20 bg-[#0c101a] p-3 shadow-lg">
                <div className="mb-2.5 flex items-center justify-between text-xs font-semibold text-gold">
                  <span>เลือกเรื่องที่อยากขอพร</span>
                  <span className="text-[10px] text-muted-foreground">({filteredDeities.length} องค์)</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory("all")}
                    className={`rounded-lg px-2.5 py-1 text-xs transition cursor-pointer ${
                      selectedCategory === "all"
                        ? "bg-gold text-primary-foreground font-semibold shadow-gold"
                        : "bg-gold/5 text-muted-foreground hover:bg-gold/10 hover:text-foreground"
                    }`}
                  >
                    ทั้งหมด
                  </button>
                  {WISH_CATEGORIES.map((c) => (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => setSelectedCategory(c.key)}
                      className={`rounded-lg px-2.5 py-1 text-xs transition cursor-pointer ${
                        selectedCategory === c.key
                          ? "bg-gold text-primary-foreground font-semibold shadow-gold"
                          : "bg-gold/5 text-muted-foreground hover:bg-gold/10 hover:text-foreground"
                      }`}
                    >
                      {c.label.split(" & ")[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sacred Deities List (Scrollable list with real photo thumbnails) */}
              <div className="rounded-2xl border border-gold/20 bg-[#0c101a] p-3 shadow-xl">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  เลือกองค์พระเพื่อเริ่มกราบไหว้
                </div>
                <div className="max-h-[640px] space-y-2 overflow-y-auto pr-1">
                  {filteredDeities.map((deity) => {
                    const isSelected = activeDeity.id === deity.id;
                    return (
                      <button
                        key={deity.id}
                        type="button"
                        onClick={() => handleSelectDeity(deity)}
                        className={`group flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition cursor-pointer ${
                          isSelected
                            ? "border-gold bg-gradient-to-r from-gold/20 via-gold/10 to-transparent shadow-[0_0_20px_rgba(212,175,55,0.25)] ring-1 ring-gold"
                            : "border-gold/10 bg-black/40 hover:border-gold/40 hover:bg-gold/5"
                        }`}
                      >
                        {/* Deity Thumbnail Photo */}
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-gold/30 shadow-md">
                          <img
                            src={deity.imageUrl}
                            alt={deity.name}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                            loading="lazy"
                          />
                          {isSelected && (
                            <span className="absolute inset-0 border-2 border-gold rounded-xl shadow-inner animate-pulse" />
                          )}
                        </div>

                        {/* Deity Text */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <div className="truncate font-display text-sm font-semibold text-foreground group-hover:text-gold">
                              {deity.name}
                            </div>
                            {isSelected && (
                              <span className="shrink-0 rounded-full bg-gold px-1.5 py-0.5 text-[9px] font-bold text-black">
                                เลือกอยู่
                              </span>
                            )}
                          </div>
                          <div className="truncate text-xs text-muted-foreground">{deity.temple}</div>
                          <div className="mt-1 flex items-center gap-1 text-[10px] text-gold/80">
                            <Sparkles className="h-3 w-3 shrink-0" />
                            <span className="truncate">{deity.badge}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          </aside>

          {/* ============================================================== */}
          {/* RIGHT COLUMN (3/4 - lg:col-span-8 or 9) — INTERACTIVE ALTAR   */}
          {/* ============================================================== */}
          <div className="space-y-8 lg:col-span-8 xl:col-span-9">

            {/* DEITY HERO TITLE & BADGE */}
            <div className="rounded-3xl border border-gold/30 bg-[#0d111c] p-6 shadow-2xl">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs text-gold">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>{activeDeity.badge}</span>
                  </div>
                  <h2 className="mt-2 font-display text-2xl text-foreground sm:text-3xl">
                    {activeDeity.name}
                  </h2>
                  <p className="text-sm text-gold/90">{activeDeity.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    ประดิษฐาน ณ {activeDeity.temple} ({activeDeity.location} จ.{activeDeity.province})
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleLightAll}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-gold/40 bg-gold/10 px-3.5 py-2 text-xs font-semibold text-gold transition hover:bg-gold/20 cursor-pointer"
                  >
                    <Flame className="h-4 w-4" />
                    <span>จุดเครื่องสักการะทั้งหมด</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleResetRitual}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-muted-foreground transition hover:bg-white/10 hover:text-foreground cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>เริ่มใหม่</span>
                  </button>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-gold/15 bg-black/40 p-3 text-xs leading-relaxed text-slate-300">
                <span className="font-semibold text-gold">พุทธคุณและบารมี: </span>
                {activeDeity.description}
              </div>
            </div>

            {/* INTERACTIVE SHRINE ROOM (THE SACRED ALTAR) */}
            <section className="relative overflow-hidden rounded-3xl border-2 border-gold/40 bg-gradient-to-b from-[#0e121d] via-[#090c15] to-[#04060b] p-6 shadow-[0_0_80px_rgba(0,0,0,0.9)] md:p-10">
              
              {/* Sacred Temple Ambience Background */}
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(212,175,55,0.18)_0%,transparent_70%)]" />
              <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-80 w-80 rounded-full bg-gold/10 blur-3xl" />

              {/* CELESTIAL STATUE IN CENTER WITH GOLDEN HALO */}
              <div className="relative mx-auto max-w-md text-center">
                {/* Divine Glowing Halo */}
                <div className="relative mx-auto inline-block">
                  <div className={`absolute -inset-4 rounded-3xl bg-gradient-to-t from-gold/30 to-amber-300/20 blur-xl transition-opacity duration-700 ${
                    bowCount > 0 ? "opacity-100 scale-105" : "opacity-60"
                  }`} />

                  {/* Sacred Image Frame */}
                  <div className="relative mx-auto h-[340px] w-[260px] sm:h-[420px] sm:w-[310px] overflow-hidden rounded-3xl border-2 border-gold/60 shadow-[0_15px_50px_rgba(0,0,0,0.9)] ring-2 ring-gold/20">
                    <img
                      src={activeDeity.imageUrl}
                      alt={activeDeity.name}
                      className={`h-full w-full object-cover transition-transform duration-700 ${
                        bowCount > 0 ? "scale-105" : "scale-100"
                      }`}
                    />

                    {/* Gold Light Gradient Overlay at bottom */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                    
                    {/* Floating Title Inside Frame */}
                    <div className="absolute bottom-3 left-0 right-0 text-center">
                      <div className="font-display text-sm font-bold text-gold drop-shadow-md">
                        {activeDeity.name}
                      </div>
                      <div className="text-[10px] text-slate-300 drop-shadow">
                        {activeDeity.temple}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bow Counter Glow Indicator */}
                {bowCount > 0 && (
                  <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/20 px-3.5 py-1 text-xs font-semibold text-gold animate-bounce">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>กราบถวายสักการะแล้ว {bowCount}/๓ ครั้ง</span>
                  </div>
                )}
              </div>

              {/* ALTAR TABLE (โต๊ะหมู่บูชาทองคำ) */}
              <div className="relative mt-8 rounded-2xl border-t-2 border-gold/40 bg-gradient-to-b from-[#171b26] via-[#0d1017] to-black p-5 shadow-2xl">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-gold/40 bg-[#121622] px-4 py-0.5 text-[11px] font-semibold text-gold shadow">
                  แท่นเครื่องสักการะมงคล
                </div>

                {/* Offerings Row: Left Candle, Incense Urn, Flower Tray, Right Candle */}
                <div className="grid grid-cols-4 items-end gap-2 pt-4 sm:gap-4">
                  
                  {/* 1. LEFT CANDLE */}
                  <div className="flex flex-col items-center">
                    <button
                      type="button"
                      onClick={() => {
                        setIsLeftCandleLit(!isLeftCandleLit);
                        playTempleBell("high");
                      }}
                      className="group flex flex-col items-center cursor-pointer"
                    >
                      {/* Flame Animation */}
                      <div className="h-8 flex items-end">
                        {isLeftCandleLit ? (
                          <div className="relative h-6 w-3 animate-pulse">
                            <div className="absolute inset-0 rounded-full bg-gradient-to-t from-orange-500 via-amber-300 to-yellow-100 shadow-[0_0_15px_#ff9900]" />
                            <div className="absolute left-1 top-1 h-3 w-1 rounded-full bg-white/80" />
                          </div>
                        ) : (
                          <div className="h-2 w-0.5 bg-slate-600 group-hover:bg-amber-500 transition" />
                        )}
                      </div>
                      {/* Candle Body */}
                      <div className="h-16 w-3.5 rounded-t-sm bg-gradient-to-b from-amber-200 via-amber-400 to-amber-500 border border-gold/40 shadow-md" />
                      {/* Candle Stand */}
                      <div className="h-3 w-7 rounded-sm bg-gradient-to-r from-gold/60 via-amber-300 to-gold/60 shadow" />
                      <span className="mt-2 text-[10px] text-muted-foreground group-hover:text-gold">
                        {isLeftCandleLit ? "เทียนสว่าง" : "คลิกจุดเทียน"}
                      </span>
                    </button>
                  </div>

                  {/* 2. INCENSE URN (3 INCENSES) */}
                  <div className="flex flex-col items-center">
                    <button
                      type="button"
                      onClick={() => {
                        setIsIncenseLit(!isIncenseLit);
                        playTempleBell("deep");
                      }}
                      className="group flex flex-col items-center cursor-pointer"
                    >
                      {/* Smoke & Glowing Tips */}
                      <div className="h-12 flex flex-col items-center justify-end">
                        {isIncenseLit && (
                          <div className="relative mb-1 flex justify-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-orange-500 shadow-[0_0_10px_#ff4500] animate-ping" />
                            <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_10px_#ff8c00] animate-ping delay-75" />
                            <span className="h-2 w-2 rounded-full bg-orange-500 shadow-[0_0_10px_#ff4500] animate-ping delay-150" />
                          </div>
                        )}
                        {/* 3 Sticks */}
                        <div className="flex gap-1.5">
                          <div className={`h-10 w-0.5 ${isIncenseLit ? "bg-amber-400" : "bg-stone-500"}`} />
                          <div className={`h-11 w-0.5 ${isIncenseLit ? "bg-amber-300" : "bg-stone-500"}`} />
                          <div className={`h-10 w-0.5 ${isIncenseLit ? "bg-amber-400" : "bg-stone-500"}`} />
                        </div>
                      </div>
                      {/* Urn Base */}
                      <div className="h-8 w-12 rounded-b-xl rounded-t-sm bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-700 border border-gold shadow-lg flex items-center justify-center text-[9px] font-bold text-black/80">
                        ธูป ๓
                      </div>
                      <span className="mt-2 text-[10px] text-muted-foreground group-hover:text-gold">
                        {isIncenseLit ? "ธูปติดแล้ว" : "คลิกจุดธูป"}
                      </span>
                    </button>
                  </div>

                  {/* 3. FLOWER OFFERING TRAY */}
                  <div className="flex flex-col items-center">
                    <button
                      type="button"
                      onClick={() => {
                        setIsFlowerOffered(!isFlowerOffered);
                        playTempleBell("high");
                      }}
                      className="group flex flex-col items-center cursor-pointer"
                    >
                      <div className="h-12 flex items-end">
                        {isFlowerOffered ? (
                          <div className="text-2xl animate-pulse">
                            {flowerType === "lotus" ? "🪷" : flowerType === "marigold" ? "🌼" : "🏵️"}
                          </div>
                        ) : (
                          <div className="text-lg opacity-40 group-hover:opacity-80 transition">🪷</div>
                        )}
                      </div>
                      {/* Tray Base */}
                      <div className="h-7 w-12 rounded-t-lg bg-gradient-to-r from-gold/70 via-amber-300 to-gold/70 border border-gold shadow flex items-center justify-center text-[9px] font-semibold text-black">
                        พานบูชา
                      </div>
                      <span className="mt-2 text-[10px] text-muted-foreground group-hover:text-gold">
                        {isFlowerOffered ? "ถวายแล้ว" : "คลิกถวาย"}
                      </span>
                    </button>
                  </div>

                  {/* 4. RIGHT CANDLE */}
                  <div className="flex flex-col items-center">
                    <button
                      type="button"
                      onClick={() => {
                        setIsRightCandleLit(!isRightCandleLit);
                        playTempleBell("high");
                      }}
                      className="group flex flex-col items-center cursor-pointer"
                    >
                      <div className="h-8 flex items-end">
                        {isRightCandleLit ? (
                          <div className="relative h-6 w-3 animate-pulse">
                            <div className="absolute inset-0 rounded-full bg-gradient-to-t from-orange-500 via-amber-300 to-yellow-100 shadow-[0_0_15px_#ff9900]" />
                            <div className="absolute right-1 top-1 h-3 w-1 rounded-full bg-white/80" />
                          </div>
                        ) : (
                          <div className="h-2 w-0.5 bg-slate-600 group-hover:bg-amber-500 transition" />
                        )}
                      </div>
                      <div className="h-16 w-3.5 rounded-t-sm bg-gradient-to-b from-amber-200 via-amber-400 to-amber-500 border border-gold/40 shadow-md" />
                      <div className="h-3 w-7 rounded-sm bg-gradient-to-r from-gold/60 via-amber-300 to-gold/60 shadow" />
                      <span className="mt-2 text-[10px] text-muted-foreground group-hover:text-gold">
                        {isRightCandleLit ? "เทียนสว่าง" : "คลิกจุดเทียน"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Flower selector tabs */}
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2 border-t border-gold/15 pt-3">
                  <span className="text-[11px] text-muted-foreground">เลือกชนิดดอกไม้:</span>
                  {[
                    { id: "lotus", label: "ดอกบัวหลวงสัตตบงกช 🪷" },
                    { id: "jasmine", label: "พวงมาลัยมะลิสด 🏵️" },
                    { id: "marigold", label: "ดอกดาวเรืองทอง 🌼" },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => {
                        setFlowerType(f.id as any);
                        setIsFlowerOffered(true);
                        playTempleBell("high");
                      }}
                      className={`rounded-lg px-2.5 py-1 text-xs transition cursor-pointer ${
                        flowerType === f.id
                          ? "bg-gold/20 text-gold border border-gold font-semibold"
                          : "bg-white/5 text-muted-foreground hover:bg-white/10"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* CHANT & MANTRAS SECTION */}
              <div className="mt-8 rounded-2xl border border-gold/25 bg-[#0b0e17] p-5 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gold">
                    <BookOpen className="h-4 w-4" />
                    <span>{activeDeity.chantTitle}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => playTempleBell("bowl")}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gold/30 bg-gold/10 px-2.5 py-1 text-xs text-gold hover:bg-gold/20 cursor-pointer"
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                    <span>เคาะระฆังวัด</span>
                  </button>
                </div>

                {/* Namo 3 times */}
                <div className="mt-3 text-center text-xs text-amber-200/90 font-mono">
                  {activeDeity.namoText}
                </div>

                {/* Pali Chant */}
                <div className="mt-3 rounded-xl border border-gold/20 bg-gold/5 p-4 text-center font-display text-base leading-relaxed text-foreground sm:text-lg">
                  &ldquo;{activeDeity.chantPali}&rdquo;
                </div>

                {/* Meaning */}
                <div className="mt-3 text-center text-xs text-muted-foreground">
                  <span className="text-gold font-semibold">คำแปล: </span>
                  {activeDeity.chantMeaning}
                </div>
              </div>

              {/* PRAYER PETITION FORM */}
              <div className="mt-8 rounded-2xl border border-gold/20 bg-[#0b0e17] p-5 shadow-xl">
                <div className="flex items-center gap-2 text-sm font-semibold text-gold">
                  <User className="h-4 w-4" />
                  <span>คำอธิษฐานจิตส่วนบุคคล</span>
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-xs text-muted-foreground">ชื่อ-นามสกุล ผู้ขอพร</label>
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="เช่น นาย สมชาย ใจดี"
                      className="mt-1 w-full rounded-xl border border-gold/20 bg-black/50 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">วันเดือนปีเกิด / ราศี (ถ้ามี)</label>
                    <input
                      type="text"
                      value={userBirth}
                      onChange={(e) => setUserBirth(e.target.value)}
                      placeholder="เช่น 15 มีนาคม 2535 ราศีมีน"
                      className="mt-1 w-full rounded-xl border border-gold/20 bg-black/50 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none"
                    />
                  </div>
                </div>

                {/* Quick Wish Buttons */}
                <div className="mt-3">
                  <div className="text-[11px] text-muted-foreground mb-1.5">เลือกคำอธิษฐานสำเร็จรูป:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {quickWishes.map((w) => (
                      <button
                        key={w.label}
                        type="button"
                        onClick={() => setPrayerText(w.text)}
                        className="rounded-lg border border-gold/15 bg-gold/5 px-2.5 py-1 text-[11px] text-slate-300 hover:border-gold/40 hover:bg-gold/15 transition cursor-pointer"
                      >
                        {w.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-3">
                  <label className="text-xs text-muted-foreground">ข้อความอธิษฐานจิต</label>
                  <textarea
                    rows={3}
                    value={prayerText}
                    onChange={(e) => setPrayerText(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-gold/20 bg-black/50 p-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none"
                  />
                </div>

                {/* STEP: BOW 3 TIMES BUTTON */}
                <div className="mt-6 text-center">
                  <button
                    type="button"
                    onClick={handleBow}
                    className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-semibold shadow-2xl transition cursor-pointer sm:w-auto sm:px-12 ${
                      bowCount >= 3
                        ? "border border-emerald-500/50 bg-emerald-950/40 text-emerald-300"
                        : "bg-gradient-gold text-primary-foreground shadow-gold hover:scale-[1.02]"
                    }`}
                  >
                    <Bell className="h-5 w-5" />
                    <span>
                      {bowCount === 0
                        ? "กราบพระครั้งที่ ๑ (กดกราบ ๓ ครั้ง)"
                        : bowCount === 1
                          ? "กราบพระครั้งที่ ๒"
                          : bowCount === 2
                            ? "กราบพระครั้งที่ ๓ (น้อมรับพร)"
                            : "อธิษฐานจิตเสร็จสมบูรณ์แล้ว 🙏"}
                    </span>
                  </button>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {bowCount < 3
                      ? "กดกราบครบ ๓ ครั้งเพื่อทำพิธีให้สมบูรณ์และเปิดรับเลขเด็ดมงคล"
                      : "ขออำนาจบารมีสิ่งศักดิ์สิทธิ์ดลบันดาลให้สำเร็จสมปรารถนาทุกประการ"}
                  </p>
                </div>
              </div>
            </section>

            {/* ============================================================== */}
            {/* POST-WORSHIP SUCCESS SECTION (LUCKY NUMBERS & GOOGLE MAPS)     */}
            {/* ============================================================== */}
            {isRitualDone && luckyResult && (
              <section className="space-y-6 animate-fadeIn">
                
                {/* 1. LUCKY NUMBERS CARD */}
                <div className="rounded-3xl border-2 border-gold/50 bg-gradient-to-b from-[#161a29] via-[#0f1320] to-[#0a0d16] p-6 shadow-2xl">
                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/15 px-3 py-1 text-xs font-semibold text-gold">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>สิริมงคลนำโชค · เลขเด็ดประจำองค์พระ</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyLucky}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gold/30 bg-gold/10 px-2.5 py-1 text-xs text-gold hover:bg-gold/20 cursor-pointer"
                    >
                      {copiedNumber ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copiedNumber ? "คัดลอกแล้ว" : "คัดลอกเลข"}</span>
                    </button>
                  </div>

                  <div className="mt-4 text-center">
                    <div className="text-xs text-muted-foreground">
                      เลขมงคลจากการกราบขอพร {activeDeity.name}
                    </div>
                    
                    {/* Numbers Display */}
                    <div className="my-4 flex items-center justify-center gap-4 sm:gap-8">
                      <div className="rounded-2xl border border-gold/40 bg-black/60 px-6 py-4 shadow-inner">
                        <div className="text-[10px] uppercase tracking-wider text-gold/80">เลขท้าย ๒ ตัว</div>
                        <div className="font-display text-4xl font-bold tracking-widest text-gold sm:text-5xl">
                          {luckyResult.twoDigit}
                        </div>
                      </div>
                      <div className="rounded-2xl border border-gold/40 bg-black/60 px-6 py-4 shadow-inner">
                        <div className="text-[10px] uppercase tracking-wider text-gold/80">เลขท้าย ๓ ตัว</div>
                        <div className="font-display text-4xl font-bold tracking-widest text-amber-300 sm:text-5xl">
                          {luckyResult.threeDigit}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-gold/20 bg-gold/5 p-3 text-xs text-slate-300 max-w-lg mx-auto">
                      <span className="font-semibold text-gold">คำทำนายเลขมงคล: </span>
                      {luckyResult.meaning}
                    </div>
                  </div>
                </div>

                {/* 2. REAL-WORLD WORSHIP RECOMMENDATIONS WITH GOOGLE MAPS */}
                <div className="rounded-3xl border border-gold/30 bg-[#0d111c] p-6 shadow-2xl">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gold">
                    <MapPin className="h-4 w-4" />
                    <span>สถานที่ไหว้จริงยอดนิยม (เดินทางไปกราบไหว้ด้วยตนเอง)</span>
                  </div>
                  
                  <div className="mt-4 rounded-2xl border border-gold/20 bg-black/40 p-5">
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                      <div>
                        <div className="font-display text-lg font-bold text-foreground">
                          {activeDeity.realLocation.name}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1.5">
                          <Navigation className="h-3.5 w-3.5 text-gold shrink-0" />
                          <span>{activeDeity.realLocation.address}</span>
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-gold shrink-0" />
                          <span>เวลาเปิดให้สักการะ: {activeDeity.realLocation.openingHours}</span>
                        </p>
                      </div>

                      {/* Google Maps Direct Button */}
                      <a
                        href={activeDeity.realLocation.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-gradient-gold px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-gold hover:scale-[1.02] transition"
                      >
                        <Navigation className="h-4 w-4" />
                        <span>เปิด Google Maps นำทาง ↗</span>
                      </a>
                    </div>

                    {/* Practical Tips */}
                    <div className="mt-4 rounded-xl border border-gold/15 bg-gold/5 p-3 text-xs text-slate-300">
                      <span className="font-semibold text-gold">คำแนะนำในการไปไหว้จริง: </span>
                      {activeDeity.realLocation.practicalTips}
                    </div>

                    {/* Alternative Shrines */}
                    {activeDeity.realLocation.alternativeShrines && activeDeity.realLocation.alternativeShrines.length > 0 && (
                      <div className="mt-4 border-t border-gold/10 pt-3">
                        <div className="text-[11px] font-semibold text-gold mb-2">สถานที่ไหว้สาขาอื่นที่คนนิยมไหว้:</div>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {activeDeity.realLocation.alternativeShrines.map((alt) => (
                            <a
                              key={alt.name}
                              href={alt.googleMapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 p-2.5 text-xs text-slate-300 hover:border-gold/30 hover:bg-gold/10 transition"
                            >
                              <div>
                                <div className="font-medium text-foreground">{alt.name}</div>
                                <div className="text-[10px] text-muted-foreground">{alt.location}</div>
                              </div>
                              <ExternalLink className="h-3.5 w-3.5 text-gold shrink-0" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. SHARE STORY CARD ACTION */}
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const currentLucky = luckyResult || calculateDeityAuspiciousNumbers(activeDeity, userName, userBirth);
                      const dateFormatted = new Date().toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" });
                      setShareData({
                        category: `ไหว้พระขอพร · ${activeDeity.temple}`,
                        categoryCn: "佛光普照 · สาธุ",
                        title: activeDeity.name,
                        subtitle: `ขอพรสำเร็จ ณ วันที่ ${dateFormatted}`,
                        bgImageUrl: activeDeity.imageUrl,
                        theme: "shrine",
                        luckyNumbers: {
                          twoDigit: currentLucky.twoDigit,
                          threeDigit: currentLucky.threeDigit,
                        },
                        devoteeName: userName.trim() || "ผู้มีจิตศรัทธา",
                        templeName: activeDeity.temple,
                        badgeText: activeDeity.badge,
                        dateText: dateFormatted,
                        highlights: [
                          { label: "ผู้ขอพร", value: userName.trim() || "ผู้มีจิตศรัทธา" },
                          { label: "สถานที่", value: `${activeDeity.temple} ${activeDeity.province}` },
                          { label: "เลขมงคล", value: `${currentLucky.twoDigit} / ${currentLucky.threeDigit}` },
                          { label: "พุทธคุณเด่น", value: activeDeity.badge },
                        ],
                        quote: prayerText.trim() || activeDeity.chantMeaning,
                        footerTag: "ไหว้พระออนไลน์เสมือนจริง www.likhitfa.online",
                      });
                      setIsShareModalOpen(true);
                    }}
                    className="inline-flex items-center gap-2 rounded-xl border border-gold/40 bg-gold/10 px-5 py-3 text-xs font-semibold text-gold transition hover:bg-gold/20 shadow-md cursor-pointer"
                  >
                    <Share2 className="h-4 w-4" />
                    <span>แชร์การ์ดอนุโมทนาบุญ (9:16 สตอรี่)</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleResetRitual}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-xs text-muted-foreground transition hover:bg-white/10 hover:text-foreground cursor-pointer"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>ไหว้พระองค์นี้ใหม่อีกครั้ง</span>
                  </button>
                </div>

              </section>
            )}

            {/* PRAYER HISTORY (บันทึกประวัติการไหว้พระ) */}
            {historyList.length > 0 && (
              <section className="rounded-3xl border border-gold/20 bg-[#0d111c] p-6 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gold">
                    <Calendar className="h-4 w-4" />
                    <span>ประวัติการขอพรของท่าน ({historyList.length} ครั้ง)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      clearPrayerHistory();
                      setHistoryList([]);
                    }}
                    className="text-[11px] text-muted-foreground hover:text-rose-400 transition cursor-pointer"
                  >
                    ล้างประวัติ
                  </button>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {historyList.slice(0, 6).map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-gold/10 bg-black/40 p-3.5 text-xs text-slate-300"
                    >
                      <div className="flex items-center justify-between text-gold font-semibold">
                        <span>{item.deityName}</span>
                        <span className="text-[10px] text-muted-foreground font-normal">
                          {new Date(item.timestamp).toLocaleDateString("th-TH")}
                        </span>
                      </div>
                      <div className="mt-1 text-[11px] text-muted-foreground">{item.templeName}</div>
                      <p className="mt-2 line-clamp-2 italic text-slate-400">&ldquo;{item.prayerText}&rdquo;</p>
                      {item.luckyTwoDigit && item.luckyThreeDigit && (
                        <div className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-gold/10 px-2 py-0.5 text-[10px] font-mono text-gold">
                          <span>เลขมงคล:</span>
                          <span className="font-bold">{item.luckyTwoDigit}</span>
                          <span>/</span>
                          <span className="font-bold">{item.luckyThreeDigit}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

          </div>
        </div>
      </main>

      <SiteFooter />

      {/* Share Story Modal */}
      {isShareModalOpen && shareData && (
        <ShareStoryModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          data={shareData}
        />
      )}
    </div>
  );
}
