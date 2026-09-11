import { useEffect, useRef, useState } from "react";
import { BrandMark } from "./site-header";
import { Download, X, Check } from "lucide-react";

export interface ShareCardData {
  category: string; // e.g. "สีเสื้อมงคลประจำวัน", "คำทำนายฝัน", "ผลดูดวงปาจื้อ", "ผลวิเคราะห์เบอร์มงคล"
  categoryCn?: string; // e.g. "今日吉色", "解梦", "八字"
  title: string;
  subtitle?: string;
  highlights: { label: string; value: string; color?: string }[];
  quote?: string;
  footerTag?: string;
  // Enhanced Story Card Fields:
  bgImageUrl?: string;
  theme?: "default" | "shrine";
  luckyNumbers?: { twoDigit: string; threeDigit: string };
  devoteeName?: string;
  templeName?: string;
  badgeText?: string;
  dateText?: string;
}

interface ShareStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ShareCardData;
}

function wrapThaiCanvasText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  const segments = text.split(/(\s+|[、，,。！？!?])/);
  let currentLine = "";

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    if (!seg) continue;
    const testLine = currentLine ? currentLine + seg : seg;
    if (ctx.measureText(testLine).width <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(currentLine.trim());
        currentLine = "";
      }
      if (ctx.measureText(seg).width > maxWidth) {
        let charLine = "";
        for (let j = 0; j < seg.length; j++) {
          const ch = seg[j];
          if (ctx.measureText(charLine + ch).width > maxWidth) {
            lines.push(charLine);
            charLine = ch;
          } else {
            charLine += ch;
          }
        }
        currentLine = charLine;
      } else {
        currentLine = seg;
      }
    }
  }
  if (currentLine && currentLine.trim()) {
    lines.push(currentLine.trim());
  }
  return lines;
}

export function ShareStoryModal({ isOpen, onClose, data }: ShareStoryModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isShrine = data.theme === "shrine" || !!data.bgImageUrl;

  const downloadCardImage = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      // ใช้ Canvas API ในตัวเบราว์เซอร์วาดภาพ 1080x1920 (9:16)
      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // 1. วาดรูปพื้นหลัง (ถ้ามี bgImageUrl) หรือใช้ Gradient หรูหรา
      let bgLoaded = false;
      if (data.bgImageUrl) {
        try {
          const bgImg = await new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = data.bgImageUrl!;
          });

          // Aspect fill / cover
          const scale = Math.max(1080 / bgImg.width, 1920 / bgImg.height);
          const w = bgImg.width * scale;
          const h = bgImg.height * scale;
          const x = (1080 - w) / 2;
          const y = (1920 - h) / 2;
          ctx.drawImage(bgImg, x, y, w, h);
          bgLoaded = true;

          // Cinematic Darkening Overlay
          const overlay = ctx.createLinearGradient(0, 0, 0, 1920);
          overlay.addColorStop(0, "rgba(5, 7, 13, 0.78)");
          overlay.addColorStop(0.25, "rgba(8, 11, 20, 0.65)");
          overlay.addColorStop(0.55, "rgba(7, 10, 18, 0.82)");
          overlay.addColorStop(0.8, "rgba(5, 7, 13, 0.94)");
          overlay.addColorStop(1, "rgba(3, 4, 8, 0.98)");
          ctx.fillStyle = overlay;
          ctx.fillRect(0, 0, 1080, 1920);

          // Golden radial glow in center
          const radial = ctx.createRadialGradient(540, 560, 60, 540, 560, 750);
          radial.addColorStop(0, "rgba(212, 175, 55, 0.2)");
          radial.addColorStop(0.7, "transparent");
          ctx.fillStyle = radial;
          ctx.fillRect(0, 0, 1080, 1920);
        } catch {
          bgLoaded = false;
        }
      }

      if (!bgLoaded) {
        const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1920);
        bgGrad.addColorStop(0, "#0c0a09");
        bgGrad.addColorStop(0.5, "#1c1917");
        bgGrad.addColorStop(1, "#0a0908");
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, 1080, 1920);
      }

      // วาดกรอบสีทอง Ornate Border
      ctx.strokeStyle = "rgba(217, 119, 6, 0.5)";
      ctx.lineWidth = 4;
      ctx.strokeRect(40, 40, 1000, 1840);

      ctx.strokeStyle = "rgba(251, 191, 36, 0.75)";
      ctx.lineWidth = 2;
      ctx.strokeRect(60, 60, 960, 1800);

      // วาดลวดลายมุม
      const drawCorner = (x: number, y: number, angle: number) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.strokeStyle = "#fbbf24";
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(0, 45);
        ctx.lineTo(0, 0);
        ctx.lineTo(45, 0);
        ctx.stroke();
        ctx.restore();
      };
      drawCorner(75, 75, 0);
      drawCorner(1005, 75, Math.PI / 2);
      drawCorner(1005, 1845, Math.PI);
      drawCorner(75, 1845, -Math.PI / 2);

      // 2. โลโก้และแบรนด์
      ctx.textAlign = "center";
      ctx.fillStyle = "#fbbf24";
      ctx.font = "bold 34px sans-serif";
      ctx.fillText("LIKHITFA · ลิขิตฟ้า", 540, 150);

      ctx.fillStyle = "#d97706";
      ctx.font = "28px serif";
      ctx.fillText(data.categoryCn || "天 · 地 · 人 · 和", 540, 195);

      // 3. หมวดหมู่ Badge
      const badgeText = data.templeName ? `ไหว้พระขอพร · ${data.templeName}` : data.category;
      ctx.fillStyle = "rgba(217, 119, 6, 0.25)";
      ctx.beginPath();
      ctx.roundRect(240, 235, 600, 64, 32);
      ctx.fill();
      ctx.strokeStyle = "rgba(251, 191, 36, 0.6)";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = "#fef08a";
      ctx.font = "bold 26px sans-serif";
      ctx.fillText(badgeText.slice(0, 36), 540, 277);

      // 4. หัวข้อหลัก Title (ชื่อองค์พระ หรือ เรื่องที่ดูดวง)
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 64px sans-serif";
      ctx.shadowColor = "rgba(0, 0, 0, 0.9)";
      ctx.shadowBlur = 15;
      ctx.fillText(data.title.slice(0, 25), 540, 385);
      ctx.shadowBlur = 0;

      if (data.badgeText) {
        ctx.fillStyle = "#fde047";
        ctx.font = "bold 28px sans-serif";
        ctx.fillText(`✨ ${data.badgeText} ✨`, 540, 440);
      } else if (data.subtitle) {
        ctx.fillStyle = "#cbd5e1";
        ctx.font = "32px sans-serif";
        ctx.fillText(data.subtitle.slice(0, 40), 540, 440);
      }

      // เส้นแบ่งทองคำ
      const lineGrad = ctx.createLinearGradient(200, 490, 880, 490);
      lineGrad.addColorStop(0, "rgba(217, 119, 6, 0)");
      lineGrad.addColorStop(0.5, "rgba(251, 191, 36, 0.8)");
      lineGrad.addColorStop(1, "rgba(217, 119, 6, 0)");
      ctx.strokeStyle = lineGrad;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(200, 490);
      ctx.lineTo(880, 490);
      ctx.stroke();

      if (isShrine && data.luckyNumbers) {
        // ==============================================================
        // SHRINE MODE: LUCKY NUMBERS & PRAYER PETITION CARD
        // ==============================================================
        
        // 5. LUCKY NUMBERS CARD
        const cardY = 530;
        ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
        ctx.beginPath();
        ctx.roundRect(140, cardY, 800, 300, 24);
        ctx.fill();
        ctx.strokeStyle = "rgba(251, 191, 36, 0.5)";
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.fillStyle = "#fbbf24";
        ctx.font = "bold 28px sans-serif";
        ctx.fillText("✦ เลขเด็ดมงคลประจำองค์พระ ✦", 540, cardY + 55);

        // Box 2-digit
        ctx.fillStyle = "rgba(217, 119, 6, 0.2)";
        ctx.beginPath();
        ctx.roundRect(200, cardY + 80, 310, 180, 16);
        ctx.fill();
        ctx.strokeStyle = "rgba(251, 191, 36, 0.4)";
        ctx.stroke();

        ctx.fillStyle = "#cbd5e1";
        ctx.font = "24px sans-serif";
        ctx.fillText("เลขท้าย ๒ ตัว", 355, cardY + 125);

        ctx.fillStyle = "#fbbf24";
        ctx.font = "bold 80px sans-serif";
        ctx.fillText(data.luckyNumbers.twoDigit, 355, cardY + 215);

        // Box 3-digit
        ctx.fillStyle = "rgba(217, 119, 6, 0.2)";
        ctx.beginPath();
        ctx.roundRect(570, cardY + 80, 310, 180, 16);
        ctx.fill();
        ctx.strokeStyle = "rgba(251, 191, 36, 0.4)";
        ctx.stroke();

        ctx.fillStyle = "#cbd5e1";
        ctx.font = "24px sans-serif";
        ctx.fillText("เลขท้าย ๓ ตัว", 725, cardY + 125);

        ctx.fillStyle = "#fde047";
        ctx.font = "bold 80px sans-serif";
        ctx.fillText(data.luckyNumbers.threeDigit, 725, cardY + 215);

        // 6. PRAYER PETITION CARD
        const prayerY = 880;
        ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
        ctx.beginPath();
        ctx.roundRect(140, prayerY, 800, 520, 24);
        ctx.fill();
        ctx.strokeStyle = "rgba(251, 191, 36, 0.35)";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.textAlign = "left";
        ctx.fillStyle = "#94a3b8";
        ctx.font = "26px sans-serif";
        ctx.fillText("ผู้ขอพร:", 180, prayerY + 60);

        ctx.fillStyle = "#f8fafc";
        ctx.font = "bold 28px sans-serif";
        ctx.fillText(data.devoteeName || "ผู้มีจิตศรัทธา", 290, prayerY + 60);

        ctx.textAlign = "right";
        ctx.fillStyle = "#94a3b8";
        ctx.font = "24px sans-serif";
        ctx.fillText(data.dateText || new Date().toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" }), 900, prayerY + 60);

        ctx.strokeStyle = "rgba(251, 191, 36, 0.25)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(180, prayerY + 95);
        ctx.lineTo(900, prayerY + 95);
        ctx.stroke();

        ctx.textAlign = "center";
        ctx.fillStyle = "#fbbf24";
        ctx.font = "italic bold 32px serif";
        ctx.fillText("“ คำอธิษฐานจิต ”", 540, prayerY + 160);

        ctx.fillStyle = "#f1f5f9";
        ctx.font = "28px sans-serif";
        const prayerLines = wrapThaiCanvasText(ctx, `"${data.quote || "ขออำนาจบารมีสิ่งศักดิ์สิทธิ์ดลบันดาลให้สำเร็จสมปรารถนาทุกประการ"}"`, 720);
        prayerLines.slice(0, 5).forEach((line, idx) => {
          ctx.fillText(line, 540, prayerY + 225 + (idx * 48));
        });

        ctx.fillStyle = "#d97706";
        ctx.font = "26px serif";
        ctx.fillText("สาธุ สาธุ สาธุ · น้อมรับพรอันศักดิ์สิทธิ์", 540, prayerY + 475);

      } else {
        // ==============================================================
        // DEFAULT MODE (FOR OTHER SITE FEATURES)
        // ==============================================================
        let currentY = 560;
        data.highlights.slice(0, 5).forEach((h) => {
          ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
          ctx.beginPath();
          ctx.roundRect(140, currentY, 800, 110, 16);
          ctx.fill();
          ctx.strokeStyle = "rgba(217, 119, 6, 0.25)";
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.textAlign = "left";
          ctx.fillStyle = "#94a3b8";
          ctx.font = "28px sans-serif";
          ctx.fillText(h.label, 180, currentY + 45);

          ctx.fillStyle = h.color || "#fbbf24";
          ctx.font = "bold 34px sans-serif";
          ctx.fillText(h.value.slice(0, 28), 180, currentY + 85);

          currentY += 135;
        });

        if (data.quote) {
          ctx.fillStyle = "rgba(251, 191, 36, 0.06)";
          ctx.beginPath();
          ctx.roundRect(140, 1340, 800, 240, 20);
          ctx.fill();
          ctx.strokeStyle = "rgba(251, 191, 36, 0.3)";
          ctx.stroke();

          ctx.textAlign = "center";
          ctx.fillStyle = "#fef08a";
          ctx.font = "italic 32px serif";
          ctx.fillText("“ คำทำนายมงคล ”", 540, 1400);

          ctx.fillStyle = "#e2e8f0";
          ctx.font = "28px sans-serif";
          const lines = wrapThaiCanvasText(ctx, data.quote, 720);
          lines.slice(0, 3).forEach((line, idx) => {
            ctx.fillText(line, 540, 1460 + (idx * 45));
          });
        }
      }

      // 7. Footer Watermark / Website Credit (เครดิตล่างภาพเว็บไซต์)
      ctx.textAlign = "center";
      ctx.fillStyle = "#fbbf24";
      ctx.font = "bold 36px sans-serif";
      ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
      ctx.shadowBlur = 8;
      ctx.fillText("www.likhitfa.online", 540, 1740);
      ctx.shadowBlur = 0;

      ctx.fillStyle = "#94a3b8";
      ctx.font = "24px sans-serif";
      ctx.fillText(data.footerTag || "ศาสตร์ดูดวงระดับพรีเมียม · ปาจื้อ · ไพ่ยิปซี · ไหว้พระออนไลน์", 540, 1790);

      // ดาวน์โหลดไฟล์
      const link = document.createElement("a");
      link.download = `likhitfa-shrine-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Canvas export failed", err);
    } finally {
      setDownloading(false);
    }
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${data.title} — Likhitfa`,
          text: `${data.title} ${data.subtitle || ""} เช็คดวงชะตาและไหว้พระออนไลน์ได้ที่ Likhitfa`,
          url: window.location.href,
        });
      } catch {}
    } else {
      void navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-fade-in">
      <div className="relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-gold/40 bg-[#0c101a] p-5 sm:p-6 shadow-2xl">
        {/* ปิดปุ่ม */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-gold/20 bg-background/60 text-muted-foreground transition hover:border-gold hover:text-gold cursor-pointer"
          aria-label="Close modal"
        >
          <X className="h-4 w-4" />
        </button>

        <h3 className="font-display text-xl text-foreground">
          แชร์การ์ดลง <span className="text-gold">IG Story / LINE</span>
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          {isShrine
            ? "การ์ดอนุโมทนาบุญพร้อมภาพพระและเลขมงคล บันทึกภาพลงมือถือได้ทันที"
            : "สร้างการ์ดดวงชะตาสไตล์พรีเมียมสีทอง บันทึกภาพลงมือถือได้ทันที"}
        </p>

        {/* ตัวอย่างการ์ด 9:16 พรีวิว */}
        <div className="my-3 flex flex-1 items-center justify-center overflow-y-auto py-1">
          {isShrine ? (
            /* ============================================================== */
            /* SHRINE LUXURY STORY CARD PREVIEW (9:16)                        */
            /* ============================================================== */
            <div
              ref={cardRef}
              className="relative aspect-[9/16] w-64 sm:w-72 overflow-hidden rounded-2xl border-2 border-gold/60 p-4 text-center shadow-[0_0_35px_rgba(212,175,55,0.35)] flex flex-col justify-between select-none"
            >
              {/* 1. Background Deity Image with Cinematic Darkening */}
              {data.bgImageUrl && (
                <img
                  src={data.bgImageUrl}
                  alt={data.title}
                  className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center filter brightness-[0.38] contrast-[1.12] scale-105"
                />
              )}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#04060c] via-[#080c16]/80 to-[#05070f]/75" />
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(212,175,55,0.22)_0%,transparent_70%)]" />

              {/* Ornate Gold Frame */}
              <div className="pointer-events-none absolute inset-2 rounded-xl border border-gold/40" />
              <div className="pointer-events-none absolute inset-3 rounded-lg border border-gold/15" />

              {/* Corner Accents */}
              <div className="pointer-events-none absolute top-3.5 left-3.5 h-2.5 w-2.5 border-t-2 border-l-2 border-gold" />
              <div className="pointer-events-none absolute top-3.5 right-3.5 h-2.5 w-2.5 border-t-2 border-r-2 border-gold" />
              <div className="pointer-events-none absolute bottom-3.5 left-3.5 h-2.5 w-2.5 border-b-2 border-l-2 border-gold" />
              <div className="pointer-events-none absolute bottom-3.5 right-3.5 h-2.5 w-2.5 border-b-2 border-r-2 border-gold" />

              {/* TOP HEADER */}
              <div className="relative z-10 pt-1">
                <div className="flex items-center justify-center gap-1.5 text-[10px] font-semibold text-gold drop-shadow">
                  <BrandMark size={16} />
                  <span>LIKHITFA ลิขิตฟ้า</span>
                </div>
                <div className="mt-0.5 text-[8.5px] font-mono tracking-widest text-gold/70">
                  {data.categoryCn || "佛光普照 · สาธุ"}
                </div>

                <div className="mt-2 inline-block rounded-full border border-gold/40 bg-gold/20 px-3 py-0.5 text-[8.5px] font-medium text-amber-200 backdrop-blur-sm shadow-sm">
                  {data.templeName ? `ไหว้พระขอพร · ${data.templeName}` : data.category}
                </div>

                <h4 className="mt-2 font-display text-base font-bold text-white drop-shadow-md leading-snug">
                  {data.title}
                </h4>
                {data.badgeText && (
                  <div className="mt-0.5 inline-flex items-center gap-1 text-[9px] font-medium text-amber-300 drop-shadow">
                    <span>✨</span>
                    <span>{data.badgeText}</span>
                    <span>✨</span>
                  </div>
                )}
              </div>

              {/* CENTER: LUCKY NUMBERS HERO BOX */}
              {data.luckyNumbers && (
                <div className="relative z-10 my-1">
                  <div className="rounded-xl border border-gold/40 bg-black/65 p-2 backdrop-blur-md shadow-lg ring-1 ring-gold/20">
                    <div className="text-[8px] font-semibold tracking-wider text-gold flex items-center justify-center gap-1">
                      <span>✦</span>
                      <span>เลขเด็ดมงคลประจำองค์พระ</span>
                      <span>✦</span>
                    </div>

                    <div className="mt-1 flex items-center justify-center gap-2.5">
                      <div className="rounded-lg border border-gold/30 bg-gold/10 px-2.5 py-1 text-center min-w-[70px]">
                        <div className="text-[7.5px] text-gold/80">เลขท้าย ๒ ตัว</div>
                        <div className="font-display text-xl font-bold tracking-widest text-gold drop-shadow">
                          {data.luckyNumbers.twoDigit}
                        </div>
                      </div>
                      <div className="rounded-lg border border-gold/30 bg-gold/10 px-2.5 py-1 text-center min-w-[70px]">
                        <div className="text-[7.5px] text-amber-300/80">เลขท้าย ๓ ตัว</div>
                        <div className="font-display text-xl font-bold tracking-widest text-amber-300 drop-shadow">
                          {data.luckyNumbers.threeDigit}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* BOTTOM: PRAYER PETITION & CREDIT */}
              <div className="relative z-10 space-y-1.5 pb-1">
                {data.quote && (
                  <div className="rounded-xl border border-gold/25 bg-black/65 p-2 text-left backdrop-blur-md shadow-md">
                    <div className="text-[7.5px] text-gold/80 flex items-center justify-between border-b border-gold/15 pb-1">
                      <span>คำอธิษฐานจิต</span>
                      <span className="text-slate-300 truncate max-w-[120px]">
                        ผู้ขอพร: {data.devoteeName || "ผู้มีจิตศรัทธา"}
                      </span>
                    </div>
                    <p className="mt-1 text-[9px] italic leading-relaxed text-slate-200 line-clamp-3">
                      &ldquo;{data.quote}&rdquo;
                    </p>
                    <div className="mt-0.5 text-center text-[7px] text-gold/60 font-serif">
                      สาธุ สาธุ สาธุ · น้อมรับพรอันศักดิ์สิทธิ์
                    </div>
                  </div>
                )}

                {/* Website Credit (เครดิตล่างภาพเว็บไซต์) */}
                <div className="pt-0.5 text-center">
                  <div className="font-display text-[10px] font-bold tracking-wider text-gold drop-shadow-sm">
                    www.likhitfa.online
                  </div>
                  <div className="text-[7.5px] text-slate-400">
                    {data.footerTag || "ไหว้พระออนไลน์เสมือนจริง · ลิขิตฟ้า"}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ============================================================== */
            /* DEFAULT THEME PREVIEW CARD                                     */
            /* ============================================================== */
            <div
              ref={cardRef}
              className="ornate-border relative aspect-[9/16] w-64 overflow-hidden rounded-2xl bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950 p-4 text-center shadow-gold flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-center gap-1.5 text-[9px] font-semibold text-gold">
                  <BrandMark size={20} />
                  <span>LIKHITFA ลิขิตฟ้า</span>
                </div>

                <div className="mt-3 inline-block rounded-full border border-gold/40 bg-gold/10 px-2.5 py-0.5 text-[9px] text-amber-200">
                  {data.category}
                </div>

                <h4 className="mt-3 line-clamp-2 font-display text-base font-bold text-foreground">
                  {data.title}
                </h4>
                {data.subtitle && (
                  <p className="mt-1 line-clamp-1 text-[10px] text-muted-foreground">
                    {data.subtitle}
                  </p>
                )}

                <div className="my-3 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

                <div className="space-y-1.5 text-left">
                  {data.highlights.slice(0, 4).map((h, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-gold/15 bg-white/[0.03] p-1.5 text-[10px]"
                    >
                      <div className="text-[8px] text-muted-foreground">{h.label}</div>
                      <div className="font-semibold text-gold line-clamp-1">{h.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                {data.quote && (
                  <div className="mt-2 rounded-lg border border-gold/20 bg-gold/5 p-2 text-[9px] italic text-amber-100 line-clamp-2">
                    &ldquo;{data.quote}&rdquo;
                  </div>
                )}

                <div className="mt-2 text-[8px] text-gold/80">
                  www.likhitfa.online
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ปุ่มกด Action */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={downloadCardImage}
            disabled={downloading}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-gold py-3 text-xs font-semibold text-primary-foreground shadow-gold transition hover:scale-[1.02] disabled:opacity-50 cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>{downloading ? "กำลังสร้างภาพ..." : "บันทึกภาพลงเครื่อง (Story 9:16)"}</span>
          </button>
          <button
            onClick={shareNative}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-gold/30 bg-card/60 px-4 py-3 text-xs text-foreground transition hover:border-gold hover:text-gold cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span>คัดลอกแล้ว</span>
              </>
            ) : (
              <span>แชร์ / ลิงก์</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
