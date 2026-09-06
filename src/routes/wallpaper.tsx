import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { seo, siteUrl } from "@/lib/seo";
import { useRef, useState } from "react";

export const Route = createFileRoute("/wallpaper")({
  head: () =>
    seo({
      title: "วอลเปเปอร์สายมู วอลเปเปอร์มงคลเฉพาะบุคคลตามธาตุปาจื้อ ดาวน์โหลดฟรี",
      description:
        "ดาวน์โหลดวอลเปเปอร์สายมูเสริมดวงเฉพาะบุคคลตามธาตุปาจื้อ (ทอง น้ำ ไม้ ไฟ ดิน) เสริมการงาน การเงิน ความรัก โชคลาภ พร้อมอักษรมงคลจีนโบราณ ขนาดความละเอียดสูงสำหรับหน้าจอมือถือ",
      path: "/wallpaper",
      canonicalUrl: `${siteUrl}/wallpaper`,
      keywords: [
        "วอลเปเปอร์สายมู",
        "วอลเปเปอร์เสริมดวง",
        "วอลเปเปอร์ปาจื้อ",
        "วอลเปเปอร์มงคล",
        "วอลเปเปอร์มือถือสายมู",
        "ภาพมงคลเสริมทรัพย์",
      ],
    }),
  component: WallpaperPage,
});

interface ElementTheme {
  id: "gold" | "water" | "wood" | "fire" | "earth";
  name: string;
  nameCn: string;
  colors: [string, string, string]; // Top, Mid, Bottom gradient
  accent: string;
  symbol: string;
  blessingCn: string;
  blessingTh: string;
  bestFor: string;
}

const ELEMENT_THEMES: ElementTheme[] = [
  {
    id: "gold",
    name: "ธาตุทอง (Metal)",
    nameCn: "金",
    colors: ["#1e1b18", "#292524", "#0c0a09"],
    accent: "#fbbf24",
    symbol: "🪙",
    blessingCn: "大吉大利",
    blessingTh: "มหาโชค มหาลาภ บารมีสูงส่ง",
    bestFor: "เสริมอำนาจ ความเด็ดขาด การเงินก้อนใหญ่ ข้าราชการ ผู้บริหาร",
  },
  {
    id: "water",
    name: "ธาตุน้ำ (Water)",
    nameCn: "水",
    colors: ["#082f49", "#0f172a", "#020617"],
    accent: "#38bdf8",
    symbol: "🌊",
    blessingCn: "招财进宝",
    blessingTh: "เงินทองไหลมาเทมา ค้าขายคล่องตัว",
    bestFor: "เสริมการค้าขาย ไหวพริบ โชคลาภลื่นไหล งานออนไลน์และต่างประเทศ",
  },
  {
    id: "wood",
    name: "ธาตุไม้ (Wood)",
    nameCn: "木",
    colors: ["#064e3b", "#022c22", "#020617"],
    accent: "#34d399",
    symbol: "🌿",
    blessingCn: "事业腾飞",
    blessingTh: "การงานก้าวหน้า เติบโตไร้ขีดจำกัด",
    bestFor: "เสริมการเรียน การเติบโตในสายอาชีพ สุขภาพแข็งแรง ความคิดสร้างสรรค์",
  },
  {
    id: "fire",
    name: "ธาตุไฟ (Fire)",
    nameCn: "火",
    colors: ["#450a0a", "#1c1917", "#0c0a09"],
    accent: "#f87171",
    symbol: "🔥",
    blessingCn: "鸿运当头",
    blessingTh: "โชคดีเจิดจรัส ชื่อเสียงโด่งดัง",
    bestFor: "เสริมเสน่ห์ ความรัก ชื่อเสียง ความกระตือรือร้น คนทำงานสายบันเทิง",
  },
  {
    id: "earth",
    name: "ธาตุดิน (Earth)",
    nameCn: "土",
    colors: ["#292524", "#1c1917", "#0c0a09"],
    accent: "#d97706",
    symbol: "⛰️",
    blessingCn: "平安富贵",
    blessingTh: "แคล้วคลาดปลอดภัย ร่ำรวยมั่นคง",
    bestFor: "เสริมความมั่นคง อสังหาริมทรัพย์ ความปลอดภัย และความอดทน",
  },
];

function WallpaperPage() {
  const [selectedTheme, setSelectedTheme] = useState<ElementTheme>(ELEMENT_THEMES[0]);
  const [ownerName, setOwnerName] = useState("");
  const [downloading, setDownloading] = useState(false);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const handleDownload = () => {
    setDownloading(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // 1. พื้นหลัง Gradient ธาตุ
      const grad = ctx.createLinearGradient(0, 0, 1080, 1920);
      grad.addColorStop(0, selectedTheme.colors[0]);
      grad.addColorStop(0.5, selectedTheme.colors[1]);
      grad.addColorStop(1, selectedTheme.colors[2]);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1080, 1920);

      // 2. ลวดลายวงกลมจักรวาล Cosmic Aura
      const drawRing = (r: number, alpha: number) => {
        ctx.strokeStyle = `rgba(251, 191, 36, ${alpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(540, 850, r, 0, Math.PI * 2);
        ctx.stroke();
      };
      drawRing(220, 0.2);
      drawRing(340, 0.15);
      drawRing(450, 0.08);

      // 3. กรอบทอง Ornate Border
      ctx.strokeStyle = "rgba(217, 119, 6, 0.4)";
      ctx.lineWidth = 4;
      ctx.strokeRect(50, 50, 980, 1820);

      ctx.strokeStyle = "rgba(251, 191, 36, 0.7)";
      ctx.lineWidth = 2;
      ctx.strokeRect(70, 70, 940, 1780);

      // 4. สัญลักษณ์ธาตุจีนขนาดใหญ่เป็นลายน้ำจางๆ
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(251, 191, 36, 0.06)";
      ctx.font = "bold 500px serif";
      ctx.fillText(selectedTheme.nameCn, 540, 1020);

      // 5. โลโก้ด้านบน
      ctx.fillStyle = "#fbbf24";
      ctx.font = "bold 26px sans-serif";
      ctx.fillText("LIKHITFA · ลิขิตฟ้า", 540, 180);

      ctx.fillStyle = "#d97706";
      ctx.font = "24px serif";
      ctx.fillText("天 · 地 · 人 · 和", 540, 225);

      // 6. ตราประทับอักษรมงคลจีนตรงกลาง
      ctx.fillStyle = "rgba(217, 119, 6, 0.15)";
      ctx.beginPath();
      ctx.arc(540, 850, 160, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.fillStyle = "#fef08a";
      ctx.font = "bold 90px serif";
      ctx.fillText(selectedTheme.blessingCn, 540, 885);

      // 7. คำอวยพรภาษาไทย
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 44px sans-serif";
      ctx.fillText(selectedTheme.blessingTh, 540, 1140);

      ctx.fillStyle = selectedTheme.accent;
      ctx.font = "32px sans-serif";
      ctx.fillText(`วอลเปเปอร์เสริมดวง · ${selectedTheme.name}`, 540, 1210);

      // 8. ชื่อเจ้าของดวงชะตา (ถ้ามี)
      if (ownerName.trim()) {
        ctx.fillStyle = "#fef08a";
        ctx.font = "italic 36px sans-serif";
        ctx.fillText(`ดวงชะตามงคลของคุณ ${ownerName.trim()}`, 540, 1340);
      }

      // 9. Watermark ด้านล่าง
      ctx.fillStyle = "#94a3b8";
      ctx.font = "24px sans-serif";
      ctx.fillText("www.likhitfa.online", 540, 1750);

      // สั่งดาวน์โหลด
      const link = document.createElement("a");
      link.download = `likhitfa-wallpaper-${selectedTheme.id}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      <SiteHeader subtitle="วอลเปเปอร์สายมู" subtitleCn="壁纸" />

      <main className="mx-auto max-w-5xl px-5 pt-10 pb-16">
        {/* Banner ส่วนหัว */}
        <section className="glass-strong relative overflow-hidden rounded-3xl p-8 shadow-elegant md:p-10">
          <div className="pointer-events-none absolute -right-6 -top-6 font-cn text-[150px] leading-none text-gold/[0.05]">
            图
          </div>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-3.5 py-1 text-[11px] tracking-wider text-gold">
              <span className="font-cn">开运壁纸</span> · วอลเปเปอร์สายมูเสริมดวงเฉพาะบุคคล
            </div>
            <h1 className="mt-4 font-display text-3xl text-foreground md:text-5xl">
              วอลเปเปอร์สายมู <span className="text-gradient-gold italic">5 ธาตุปาจื้อ</span>
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              ปรับสมดุลพลังงานชีวิตผ่านหน้าจอมือถือที่คุณเปิดดูวันละหลายร้อยครั้ง
              เลือกธาตุที่ต้องการเสริมพลัง พร้อมตราประทับอักษรจีนมงคลโบราณ ดาวน์โหลดความละเอียดสูงฟรี
            </p>
          </div>
        </section>

        {/* แผงปรับแต่งและพรีวิว */}
        <section className="mt-10 grid gap-8 md:grid-cols-[1.2fr_1fr]">
          {/* ฝั่งซ้าย: ตัวเลือกปรับแต่ง */}
          <div className="space-y-6">
            <div className="glass-strong rounded-3xl p-6">
              <h2 className="font-display text-xl text-foreground">1. เลือกธาตุปาจื้อที่ต้องการเสริม</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {ELEMENT_THEMES.map((theme) => {
                  const isSelected = selectedTheme.id === theme.id;
                  return (
                    <button
                      key={theme.id}
                      onClick={() => setSelectedTheme(theme)}
                      className={`flex flex-col items-start rounded-2xl border p-4 text-left transition-all ${
                        isSelected
                          ? "border-gold bg-gold/15 shadow-gold"
                          : "border-border/60 bg-card/40 hover:border-gold/40"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{theme.symbol}</span>
                        <span className="font-display text-sm font-bold text-foreground">
                          {theme.name}
                        </span>
                        <span className="font-cn text-xs text-gold">{theme.nameCn}</span>
                      </div>
                      <p className="mt-1.5 text-[11px] text-muted-foreground line-clamp-2">
                        {theme.bestFor}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="glass-strong rounded-3xl p-6">
              <h2 className="font-display text-xl text-foreground">2. ใส่ชื่อหรือข้อความมงคล (ระบุหรือไม่ก็ได้)</h2>
              <div className="mt-4">
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="เช่น มหาเศรษฐีเงินล้าน, นภัสสร"
                  maxLength={30}
                  className="input-styled h-12 w-full text-sm"
                />
              </div>
            </div>

            <button
              onClick={handleDownload}
              disabled={downloading}
              className="h-14 w-full rounded-2xl bg-gradient-gold text-base font-semibold text-primary-foreground shadow-gold transition hover:scale-[1.02] disabled:opacity-60"
            >
              {downloading ? "กำลังสร้างวอลเปเปอร์ HD..." : "📥 ดาวน์โหลดวอลเปเปอร์ HD (1080x1920)"}
            </button>
          </div>

          {/* ฝั่งขวา: พรีวิวหน้าจอมือถือ 9:16 */}
          <div className="flex flex-col items-center">
            <div className="text-xs text-muted-foreground mb-3">ตัวอย่างหน้าจอมือถือ (9:16)</div>
            <div
              className="ornate-border relative aspect-[9/16] w-64 overflow-hidden rounded-[2.5rem] border-4 border-stone-800 p-5 text-center shadow-2xl"
              style={{
                background: `linear-gradient(180deg, ${selectedTheme.colors[0]} 0%, ${selectedTheme.colors[1]} 50%, ${selectedTheme.colors[2]} 100%)`,
              }}
            >
              {/* ติ่งกล้องหน้ามือถือ */}
              <div className="mx-auto mb-4 h-4 w-24 rounded-full bg-black/50" />

              <div className="flex items-center justify-center gap-1 text-[8px] text-gold/80">
                <span>LIKHITFA</span> · <span className="font-cn">ลิขิตฟ้า</span>
              </div>

              {/* ลายน้ำธาตุขนาดใหญ่ */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center font-cn text-[140px] text-gold/[0.04]">
                {selectedTheme.nameCn}
              </div>

              {/* ตราประทับอักษรจีนมงคล */}
              <div className="relative mt-24">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-2 border-gold/60 bg-gold/10 shadow-gold">
                  <span className="font-cn text-3xl font-bold text-amber-200">
                    {selectedTheme.blessingCn}
                  </span>
                </div>
                <h4 className="mt-4 font-display text-sm font-bold text-foreground">
                  {selectedTheme.blessingTh}
                </h4>
                <div
                  className="mt-1 text-[10px] font-medium"
                  style={{ color: selectedTheme.accent }}
                >
                  {selectedTheme.name}
                </div>

                {ownerName && (
                  <div className="mt-3 text-[10px] italic text-amber-100">
                    ดวงชะตาของคุณ {ownerName}
                  </div>
                )}
              </div>

              <div className="absolute bottom-6 left-0 right-0 text-[8px] text-muted-foreground/60">
                www.likhitfa.online
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
