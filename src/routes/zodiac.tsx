import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { seo, siteUrl } from "@/lib/seo";
import { ZODIAC_2569_DATA, type ZodiacInfo } from "@/lib/zodiac-2569";
import { ShareStoryModal, type ShareCardData } from "@/components/share-story-modal";
import { useState } from "react";

export const Route = createFileRoute("/zodiac")({
  head: () =>
    seo({
      title: "ดูดวง 12 ราศี 2569 — ดวงการงาน การเงิน ความรัก สุขภาพ สีมงคล ครบทุกราศี",
      description:
        "คลังคำทำนายดวงชะตา 12 ราศี ประจำปี 2569 (ปีมะเมีย) เจาะลึกครบ 4 ด้าน การงาน การเงิน ความรัก สุขภาพ เช็คราศีรุ่งโรจน์ ราศีต้องระวัง พร้อมสีมงคลและเลขเด็ดนำโชค",
      path: "/zodiac",
      canonicalUrl: `${siteUrl}/zodiac`,
      keywords: [
        "ดูดวง 12 ราศี",
        "ดูดวงราศี 2569",
        "ดวงปี 2569",
        "ดวงการงาน 12 ราศี",
        "ดวงการเงิน 12 ราศี",
        "ดวงความรัก 12 ราศี",
        "สีมงคลประจำราศี 2569",
        "Likhitfa",
      ],
    }),
  component: ZodiacPage,
});

function ZodiacPage() {
  const [activeSlug, setActiveSlug] = useState<string>("aries");
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const activeZodiac: ZodiacInfo =
    ZODIAC_2569_DATA.find((z) => z.slug === activeSlug) || ZODIAC_2569_DATA[0];

  const shareData: ShareCardData = {
    category: `ดวงชะตาปี 2569 · ${activeZodiac.name}`,
    categoryCn: "星座运势",
    title: `${activeZodiac.name} (${activeZodiac.nameEn})`,
    subtitle: activeZodiac.headline,
    highlights: [
      { label: "ช่วงเวลาเกิด", value: activeZodiac.dateRange, color: "#fbbf24" },
      { label: "ธาตุประจำราศี", value: activeZodiac.element, color: "#38bdf8" },
      { label: "สีมงคลประจำปี", value: activeZodiac.luckyColors.join(", "), color: "#34d399" },
      { label: "เลขเด่นนำโชค", value: activeZodiac.luckyNumbers, color: "#f43f5e" },
    ],
    quote: activeZodiac.overview2569,
    footerTag: "เช็คดวง 12 ราศีปี 2569 แม่นยำที่ Likhitfa.online",
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader subtitle="ดูดวง 12 ราศี 2569" subtitleCn="十二星座" />

      <main className="mx-auto max-w-6xl px-4 py-10 md:px-8">
        {/* Hero Section */}
        <section className="text-center">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-xs tracking-widest text-gold">
            <span>♈ 2026 ANNUAL HOROSCOPE</span>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-5xl">
            ดูดวง <span className="text-gradient-gold">12 ราศี ประจำปี 2569</span>
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground md:text-base">
            พยากรณ์ดวงชะตาเจาะลึก 4 มิติสำคัญ (การงาน การเงิน ความรัก สุขภาพ)
            ภายใต้อิทธิพลดวงดาวประจำปีมะเมีย ธาตุไฟ พร้อมสีมงคลและเลขเด็ดนำโชค
          </p>
        </section>

        {/* 12 Zodiac Navigation Pills */}
        <section className="mx-auto mt-8 max-w-5xl">
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-2.5">
            {ZODIAC_2569_DATA.map((z) => {
              const isActive = z.slug === activeZodiac.slug;
              return (
                <button
                  key={z.slug}
                  onClick={() => setActiveSlug(z.slug)}
                  className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium transition-all ${
                    isActive
                      ? "bg-gradient-gold text-stone-950 shadow-gold scale-105"
                      : "border border-gold/20 bg-card/60 text-muted-foreground hover:border-gold/50 hover:text-gold hover:bg-card"
                  }`}
                >
                  <span className="text-sm">{z.symbol}</span>
                  <span>{z.name}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Active Zodiac Detail Card */}
        <section className="mx-auto mt-10 max-w-5xl rounded-3xl border border-gold/30 bg-card/60 p-6 md:p-10 backdrop-blur-md shadow-elegant">
          {/* Header of the Sign */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-gold/15 pb-6">
            <div className="flex items-center gap-4">
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-gold text-3xl shadow-gold text-stone-950">
                {activeZodiac.symbol}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">
                    {activeZodiac.name}
                  </h2>
                  <span className="text-sm text-muted-foreground">({activeZodiac.nameEn})</span>
                  <span className="rounded-full bg-gold/15 px-2.5 py-0.5 text-[11px] font-semibold text-gold">
                    {activeZodiac.element}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span>📅 {activeZodiac.dateRange}</span>
                  <span>🪐 ดาวครองราศี: {activeZodiac.rulingPlanet}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShareModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-gold px-4 py-2.5 text-xs font-semibold text-stone-950 shadow-gold transition hover:opacity-90 self-stretch sm:self-auto justify-center"
            >
              <span>📲 บันทึกการ์ด Story (9:16)</span>
            </button>
          </div>

          {/* Headline & Overview */}
          <div className="mt-6 rounded-2xl border border-gold/20 bg-gold/5 p-5">
            <h3 className="font-display text-base font-bold text-gold mb-1.5">
              ✦ {activeZodiac.headline}
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {activeZodiac.overview2569}
            </p>
          </div>

          {/* 4 Pillars of Forecast Grid */}
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {/* 1. Career */}
            <div className="rounded-2xl border border-gold/20 bg-card/50 p-5">
              <div className="flex items-center gap-2 text-sm font-bold text-foreground mb-2">
                <span className="text-lg">💼</span> การงาน & ธุรกิจ
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {activeZodiac.career}
              </p>
            </div>

            {/* 2. Finance */}
            <div className="rounded-2xl border border-gold/20 bg-card/50 p-5">
              <div className="flex items-center gap-2 text-sm font-bold text-foreground mb-2">
                <span className="text-lg">💰</span> การเงิน & โชคลาภ
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {activeZodiac.finance}
              </p>
            </div>

            {/* 3. Love */}
            <div className="rounded-2xl border border-gold/20 bg-card/50 p-5">
              <div className="flex items-center gap-2 text-sm font-bold text-foreground mb-2">
                <span className="text-lg">💖</span> ความรัก & ความสัมพันธ์
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {activeZodiac.love}
              </p>
            </div>

            {/* 4. Health */}
            <div className="rounded-2xl border border-gold/20 bg-card/50 p-5">
              <div className="flex items-center gap-2 text-sm font-bold text-foreground mb-2">
                <span className="text-lg">🩺</span> สุขภาพ & ข้อควรระวัง
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {activeZodiac.health}
              </p>
            </div>
          </div>

          {/* Auspicious Items Bar */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 rounded-2xl border border-gold/20 bg-card/70 p-5">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-gold/80 mb-1">
                🎨 สีมงคลประจำปี
              </div>
              <div className="text-xs font-bold text-foreground">
                {activeZodiac.luckyColors.join(", ")}
              </div>
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-gold/80 mb-1">
                🔢 เลขนำโชค 2569
              </div>
              <div className="text-xs font-bold text-foreground">
                {activeZodiac.luckyNumbers}
              </div>
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-gold/80 mb-1">
                💎 อัญมณีเสริมดวง
              </div>
              <div className="text-xs font-bold text-foreground">
                {activeZodiac.luckyGem}
              </div>
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-gold/80 mb-1">
                ⛩️ เคล็ดลับเสริมดวง
              </div>
              <div className="text-xs font-bold text-foreground line-clamp-2">
                {activeZodiac.blessingTip}
              </div>
            </div>
          </div>
        </section>

        {/* Quick Grid for other signs */}
        <section className="mx-auto mt-16 max-w-5xl">
          <h3 className="font-display text-xl font-bold text-foreground mb-6 text-center">
            เลือกอ่านคำทำนายของราศีอื่นๆ
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
            {ZODIAC_2569_DATA.map((z) => (
              <div
                key={z.slug}
                onClick={() => {
                  setActiveSlug(z.slug);
                  window.scrollTo({ top: 200, behavior: "smooth" });
                }}
                className={`group cursor-pointer rounded-2xl border p-4 transition-all ${
                  z.slug === activeZodiac.slug
                    ? "border-gold bg-gold/15 shadow-gold"
                    : "border-gold/15 bg-card/40 hover:border-gold/40 hover:bg-card/70"
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xl">{z.symbol}</span>
                  <span className="font-display font-semibold text-foreground group-hover:text-gold transition-colors text-sm">
                    {z.name}
                  </span>
                </div>
                <div className="text-[11px] text-muted-foreground mb-2">{z.dateRange}</div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {z.headline}
                </p>
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
