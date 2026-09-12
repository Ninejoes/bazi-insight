import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { seo, siteUrl } from "@/lib/seo";
import {
  SIAMSI_SHRINES,
  drawRandomSiamsi,
  type SiamsiFortune,
  type SiamsiShrine,
} from "@/lib/siamsi-data";
import { ShareStoryModal, type ShareCardData } from "@/components/share-story-modal";
import { useState, type ReactNode } from "react";
import {
  Scroll,
  Share2,
  Briefcase,
  Coins,
  Heart,
  Activity,
  Search,
  Lightbulb,
  Shield,
  RefreshCw,
} from "lucide-react";
import { recordDivinationHistory } from "@/lib/member-history";

export const Route = createFileRoute("/siamsi")({
  head: () =>
    seo({
      title: "เซียมซีออนไลน์ เสี่ยงทายเซียมซี เจ้าพ่อเสือ หลวงพ่อโสธร เจ้าแม่กวนอิม",
      description:
        "เสี่ยงทายเซียมซีออนไลน์ 28 ใบ จำลองการเขย่าติ้วเซียมซีจากสถานที่ศักดิ์สิทธิ์ ศาลเจ้าพ่อเสือ วัดโสธร ศาลเจ้าแม่กวนอิม ทำนายการงาน การเงิน ความรัก และสุขภาพ",
      path: "/siamsi",
      canonicalUrl: `${siteUrl}/siamsi`,
      keywords: [
        "เซียมซีออนไลน์",
        "เสี่ยงทายเซียมซี",
        "เซียมซีเจ้าพ่อเสือ",
        "เซียมซีหลวงพ่อโสธร",
        "เซียมซีเจ้าแม่กวนอิม",
        "ใบเซียมซี 28 ใบ",
        "ดูดวงเซียมซี",
      ],
    }),
  component: SiamsiPage,
});

function SiamsiPage() {
  const [selectedShrine, setSelectedShrine] = useState<SiamsiShrine>(SIAMSI_SHRINES[0]);
  const [isShaking, setIsShaking] = useState(false);
  const [fortune, setFortune] = useState<SiamsiFortune | null>(null);
  const [wish, setWish] = useState("");
  const [isShareOpen, setIsShareOpen] = useState(false);

  const handleShake = () => {
    if (isShaking) return;
    setIsShaking(true);
    setFortune(null);

    // จำลองอนิเมชันเขย่ากระบอกเซียมซี 2.2 วินาที
    setTimeout(() => {
      const drawn = drawRandomSiamsi();
      setFortune(drawn);
      setIsShaking(false);
      recordDivinationHistory({
        type: "เซียมซี",
        title: `เซียมซี ${selectedShrine.name} (ใบที่ ${drawn.number})`,
        result: `${drawn.quality}: ${drawn.summary}`,
        url: "/siamsi",
        metadata: {
          shrine: selectedShrine.name,
          number: drawn.number,
          quality: drawn.quality,
          wish: wish || undefined,
        },
      });
    }, 2200);
  };

  const shareData: ShareCardData | null = fortune
    ? {
        category: `เซียมซี ${selectedShrine.name}`,
        categoryCn: "灵签吉凶",
        title: `ใบที่ ${fortune.number} · ${fortune.quality}`,
        subtitle: fortune.summary.slice(0, 30),
        highlights: [
          { label: "การงาน", value: fortune.aspects.career },
          { label: "การเงิน", value: fortune.aspects.wealth },
          { label: "ความรัก", value: fortune.aspects.love },
          { label: "สุขภาพ", value: fortune.aspects.health },
        ],
        quote: fortune.thaiPoem,
        footerTag: "เสี่ยงทายเซียมซีออนไลน์ได้ที่ www.likhitfa.online",
      }
    : null;

  return (
    <div className="relative min-h-screen">
      <SiteHeader subtitle="เซียมซีออนไลน์" subtitleCn="求签" />

      <main className="mx-auto max-w-5xl px-5 pt-10 pb-16">
        {/* Banner ส่วนหัว */}
        <section className="glass-strong relative overflow-hidden rounded-3xl p-8 shadow-elegant md:p-10">
          <div className="pointer-events-none absolute -right-6 -top-6 font-cn text-[150px] leading-none text-gold/[0.05]">
            签
          </div>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-3.5 py-1 text-[11px] tracking-wider text-gold">
              <span className="font-cn">诚心祈福</span> · เสี่ยงทายเซียมซีศักดิ์สิทธิ์ 28 ใบ
            </div>
            <h1 className="mt-4 font-display text-3xl text-foreground md:text-5xl">
              เซียมซีออนไลน์ <span className="text-gradient-gold italic">ขอพรสิ่งศักดิ์สิทธิ์</span>
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              ตั้งจิตอธิษฐานนึกถึงเรื่องที่ต้องการเสี่ยงทาย เลือกสถานที่ศักดิ์สิทธิ์
              แล้วกดปุ่มเขย่ากระบอกเซียมซีเพื่อรับคำทำนายโบราณ 28 ใบ
            </p>

            {/* แถบเลือกสถานที่ศักดิ์สิทธิ์ */}
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {SIAMSI_SHRINES.map((shrine) => {
                const isSelected = selectedShrine.id === shrine.id;
                return (
                  <button
                    key={shrine.id}
                    type="button"
                    onClick={() => {
                      setSelectedShrine(shrine);
                      setFortune(null);
                    }}
                    className={`flex flex-col items-start rounded-2xl border p-4 text-left transition-all ${
                      isSelected
                        ? "border-gold bg-gold/15 shadow-gold"
                        : "border-border/60 bg-card/40 hover:border-gold/40"
                    }`}
                  >
                    <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl border border-gold/30 bg-gold/10">
                      {shrine.id === "tiger-god" ? (
                        <Shield className="h-5 w-5 text-gold" />
                      ) : shrine.id === "luang-phor-sothorn" ? (
                        <Coins className="h-5 w-5 text-gold" />
                      ) : (
                        <Heart className="h-5 w-5 text-rose-400" />
                      )}
                    </div>
                    <span className="mt-1 font-display text-base font-bold text-foreground">
                      {shrine.name}
                    </span>
                    <span className="font-cn text-xs text-gold/70">{shrine.subtitle}</span>
                    <p className="mt-1.5 text-[11px] text-muted-foreground line-clamp-2">
                      {shrine.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* กระบอกเซียมซี Interactive */}
        <section className="mt-10 text-center">
          <div className="glass-strong mx-auto max-w-lg rounded-3xl p-8 shadow-elegant">
            <div className="font-cn text-xs tracking-widest text-gold/80">
              {selectedShrine.subtitle}
            </div>
            <h2 className="mt-1 font-display text-2xl text-foreground">
              {selectedShrine.deity}
            </h2>

            {/* ช่องกรอกคำอธิษฐานในใจ */}
            <div className="mt-6">
              <input
                type="text"
                value={wish}
                onChange={(e) => setWish(e.target.value)}
                placeholder="พิมพ์คำถามหรือเรื่องที่ตั้งจิตอธิษฐาน (ในใจ)..."
                className="input-styled h-12 w-full text-center text-xs"
              />
            </div>

            {/* กระบอกเซียมซีจำลอง */}
            <div className="relative my-8 flex items-center justify-center">
              <div
                className={`relative flex h-52 w-32 flex-col items-center justify-end rounded-2xl border-2 border-amber-600/60 bg-gradient-to-b from-amber-900 via-amber-950 to-stone-950 p-3 shadow-2xl transition-transform ${
                  isShaking ? "animate-bounce" : "hover:scale-105"
                }`}
                style={{
                  boxShadow: "0 10px 30px rgba(217, 119, 6, 0.2)",
                }}
              >
                {/* แท่งไม้เซียมซีโผล่พ้นกระบอก */}
                <div className="absolute -top-12 flex gap-1">
                  <div className={`h-20 w-2.5 rounded-t-sm bg-gradient-to-b from-amber-200 to-amber-500 shadow-sm ${isShaking ? "translate-y-2 transition-transform" : ""}`} />
                  <div className={`h-24 w-2.5 rounded-t-sm bg-gradient-to-b from-amber-300 to-amber-600 shadow-sm ${isShaking ? "-translate-y-2 transition-transform" : ""}`} />
                  <div className={`h-18 w-2.5 rounded-t-sm bg-gradient-to-b from-amber-200 to-amber-500 shadow-sm ${isShaking ? "translate-y-1 transition-transform" : ""}`} />
                </div>

                {/* ตราประทับอักษรจีนบนกระบอก */}
                <div className="mb-4 rounded-full border border-gold/40 bg-gold/10 p-2 font-cn text-xl text-amber-300">
                  吉
                </div>
                <div className="text-[10px] tracking-wider text-amber-200/60">SIAMSI TUBE</div>
              </div>
            </div>

            {/* ปุ่มกดเขย่าเซียมซี */}
            <button
              type="button"
              onClick={handleShake}
              disabled={isShaking}
              className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-gold px-8 text-base font-semibold text-primary-foreground shadow-gold transition hover:scale-[1.02] disabled:opacity-60"
            >
              <Scroll className="h-5 w-5" />
              {isShaking ? "กำลังเขย่ากระบอกเซียมซี..." : "เขย่ากระบอกเซียมซี"}
            </button>
          </div>
        </section>

        {/* ใบเซียมซีที่สุ่มได้ */}
        {fortune && (
          <section className="mt-10 animate-fade-in">
            <div className="ornate-border rounded-3xl bg-gradient-to-b from-stone-900 via-card to-stone-950 p-6 md:p-10 shadow-elegant">
              <div className="flex flex-col justify-between gap-4 border-b border-gold/20 pb-6 md:flex-row md:items-center">
                <div>
                  <div className="text-xs uppercase tracking-widest text-gold/80">
                    {selectedShrine.name} · ใบเซียมซี
                  </div>
                  <h3 className="mt-1 font-display text-3xl text-foreground md:text-4xl">
                    ใบที่ {fortune.number} : <span className="text-gradient-gold">{fortune.quality}</span>
                  </h3>
                </div>

                <button
                  onClick={() => setIsShareOpen(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-gold/40 bg-gold/10 px-5 py-2.5 text-xs font-semibold text-gold hover:bg-gold/20"
                >
                  <Share2 className="h-4 w-4" />
                  <span>บันทึก / แชร์การ์ดเซียมซี</span>
                </button>
              </div>

              {/* บทกลอนเซียมซีจีน & ไทย */}
              <div className="mt-8 rounded-2xl border border-gold/20 bg-gold/5 p-6 text-center">
                <div className="font-cn text-base leading-relaxed text-amber-200/90 tracking-wide md:text-lg">
                  "{fortune.chinesePoem}"
                </div>
                <div className="mt-3 text-sm italic text-amber-100/80 md:text-base">
                  "{fortune.thaiPoem}"
                </div>
              </div>

              {/* คำทำนายสรุป */}
              <div className="mt-6 text-sm leading-relaxed text-foreground/90">
                <strong className="text-gold">ความหมายโดยรวม:</strong> {fortune.summary}
              </div>

              {/* คำทำนายแยก 5 ด้าน */}
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <AspectCard
                  title="การงานและหน้าที่"
                  desc={fortune.aspects.career}
                  icon={<Briefcase className="h-4 w-4 text-gold" />}
                />
                <AspectCard
                  title="โชคลาภเงินทอง"
                  desc={fortune.aspects.wealth}
                  icon={<Coins className="h-4 w-4 text-gold" />}
                />
                <AspectCard
                  title="ความรักและความสัมพันธ์"
                  desc={fortune.aspects.love}
                  icon={<Heart className="h-4 w-4 text-rose-400" />}
                />
                <AspectCard
                  title="สุขภาพร่างกาย"
                  desc={fortune.aspects.health}
                  icon={<Activity className="h-4 w-4 text-emerald-400" />}
                />
                <AspectCard
                  title="ของหายและการฟ้องร้อง"
                  desc={fortune.aspects.lostItems}
                  icon={<Search className="h-4 w-4 text-amber-400" />}
                />
                <AspectCard
                  title="คำเตือนและข้อคิด"
                  desc={fortune.advice}
                  icon={<Lightbulb className="h-4 w-4 text-gold" />}
                  isHighlight
                />
              </div>

              {/* ปุ่มสุ่มใหม่ */}
              <div className="mt-10 text-center">
                <button
                  onClick={() => setFortune(null)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 px-6 py-2 text-xs text-muted-foreground hover:border-gold hover:text-gold"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>เสี่ยงทายใหม่อีกครั้ง</span>
                </button>
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

function AspectCard({
  title,
  desc,
  icon,
  isHighlight = false,
}: {
  title: string;
  desc: string;
  icon: ReactNode;
  isHighlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        isHighlight
          ? "border-gold/30 bg-gold/10"
          : "border-border/60 bg-card/40"
      }`}
    >
      <div className="flex items-center gap-2">
        <span>{icon}</span>
        <span className="text-xs font-semibold text-foreground">{title}</span>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{desc}</p>
    </div>
  );
}
