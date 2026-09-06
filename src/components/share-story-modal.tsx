import { useEffect, useRef, useState } from "react";
import { BrandMark } from "./site-header";

export interface ShareCardData {
  category: string; // e.g. "สีเสื้อมงคลประจำวัน", "คำทำนายฝัน", "ผลดูดวงปาจื้อ", "ผลวิเคราะห์เบอร์มงคล"
  categoryCn?: string; // e.g. "今日吉色", "解梦", "八字"
  title: string;
  subtitle?: string;
  highlights: { label: string; value: string; color?: string }[];
  quote?: string;
  footerTag?: string;
}

interface ShareStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ShareCardData;
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

      // 1. วาดพื้นหลัง Gradient ดาร์กโกลด์หรูหรา
      const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1920);
      bgGrad.addColorStop(0, "#0c0a09");
      bgGrad.addColorStop(0.5, "#1c1917");
      bgGrad.addColorStop(1, "#0a0908");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1080, 1920);

      // วาดกรอบสีทอง Ornate Border
      ctx.strokeStyle = "rgba(217, 119, 6, 0.4)";
      ctx.lineWidth = 4;
      ctx.strokeRect(50, 50, 980, 1820);

      ctx.strokeStyle = "rgba(251, 191, 36, 0.7)";
      ctx.lineWidth = 2;
      ctx.strokeRect(70, 70, 940, 1780);

      // วาดลวดลายมุมจีน
      const drawCorner = (x: number, y: number, angle: number) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.strokeStyle = "#fbbf24";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, 40);
        ctx.lineTo(0, 0);
        ctx.lineTo(40, 0);
        ctx.stroke();
        ctx.restore();
      };
      drawCorner(85, 85, 0);
      drawCorner(995, 85, Math.PI / 2);
      drawCorner(995, 1835, Math.PI);
      drawCorner(85, 1835, -Math.PI / 2);

      // 2. โลโก้และแบรนด์
      ctx.textAlign = "center";
      ctx.fillStyle = "#d97706";
      ctx.font = "bold 28px sans-serif";
      ctx.fillText("LIKHITFA · ลิขิตฟ้า", 540, 160);

      ctx.fillStyle = "#fbbf24";
      ctx.font = "32px serif";
      ctx.fillText("天 · 地 · 人 · 和", 540, 210);

      // 3. หมวดหมู่ Badge
      ctx.fillStyle = "rgba(217, 119, 6, 0.2)";
      ctx.beginPath();
      ctx.roundRect(340, 270, 400, 60, 30);
      ctx.fill();
      ctx.strokeStyle = "rgba(251, 191, 36, 0.6)";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = "#fef08a";
      ctx.font = "bold 26px sans-serif";
      ctx.fillText(`${data.category} ${data.categoryCn ? `· ${data.categoryCn}` : ""}`, 540, 310);

      // 4. หัวข้อหลัก Title
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 64px sans-serif";
      ctx.fillText(data.title.slice(0, 22), 540, 440);

      if (data.subtitle) {
        ctx.fillStyle = "#cbd5e1";
        ctx.font = "36px sans-serif";
        ctx.fillText(data.subtitle.slice(0, 35), 540, 510);
      }

      // เส้นแบ่งทองคำ
      const lineGrad = ctx.createLinearGradient(200, 580, 880, 580);
      lineGrad.addColorStop(0, "rgba(217, 119, 6, 0)");
      lineGrad.addColorStop(0.5, "rgba(251, 191, 36, 0.8)");
      lineGrad.addColorStop(1, "rgba(217, 119, 6, 0)");
      ctx.strokeStyle = lineGrad;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(200, 580);
      ctx.lineTo(880, 580);
      ctx.stroke();

      // 5. กล่องไฮไลต์ (Highlights Grid)
      let currentY = 660;
      data.highlights.slice(0, 5).forEach((h) => {
        // กล่องพื้นหลัง
        ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
        ctx.beginPath();
        ctx.roundRect(140, currentY, 800, 110, 16);
        ctx.fill();
        ctx.strokeStyle = "rgba(217, 119, 6, 0.25)";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // ข้อความในกล่อง
        ctx.textAlign = "left";
        ctx.fillStyle = "#94a3b8";
        ctx.font = "28px sans-serif";
        ctx.fillText(h.label, 180, currentY + 45);

        ctx.fillStyle = h.color || "#fbbf24";
        ctx.font = "bold 34px sans-serif";
        ctx.fillText(h.value.slice(0, 28), 180, currentY + 85);

        currentY += 135;
      });

      // 6. ข้อความ Quote / คำทำนายสรุป
      if (data.quote) {
        ctx.fillStyle = "rgba(251, 191, 36, 0.06)";
        ctx.beginPath();
        ctx.roundRect(140, 1380, 800, 260, 20);
        ctx.fill();
        ctx.strokeStyle = "rgba(251, 191, 36, 0.3)";
        ctx.stroke();

        ctx.textAlign = "center";
        ctx.fillStyle = "#fef08a";
        ctx.font = "italic 32px serif";
        ctx.fillText("“ คำทำนายมงคล ”", 540, 1440);

        ctx.fillStyle = "#e2e8f0";
        ctx.font = "28px sans-serif";
        // ตัดคำแบ่ง 2 บรรทัด
        const words = data.quote.slice(0, 90);
        const mid = Math.floor(words.length / 2);
        const line1 = words.slice(0, mid);
        const line2 = words.slice(mid);
        ctx.fillText(line1, 540, 1510);
        ctx.fillText(line2, 540, 1560);
      }

      // 7. Footer Watermark
      ctx.textAlign = "center";
      ctx.fillStyle = "#fbbf24";
      ctx.font = "bold 32px sans-serif";
      ctx.fillText("www.likhitfa.online", 540, 1750);

      ctx.fillStyle = "#64748b";
      ctx.font = "24px sans-serif";
      ctx.fillText(data.footerTag || "ศาสตร์ดูดวงระดับพรีเมียม · ปาจื้อ · ไพ่ยิปซี · เลขมงคล", 540, 1795);

      // ดาวน์โหลดไฟล์
      const link = document.createElement("a");
      link.download = `likhitfa-story-${Date.now()}.png`;
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
          text: `${data.title} ${data.subtitle || ""} เช็คดวงชะตาได้ที่ Likhitfa`,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fade-in">
      <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-gold/30 bg-card p-6 shadow-2xl">
        {/* ปิดปุ่ม */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-gold/20 bg-background/60 text-muted-foreground transition hover:border-gold hover:text-gold"
          aria-label="Close modal"
        >
          ✕
        </button>

        <h3 className="font-display text-xl text-foreground">
          แชร์ลง <span className="text-gold">IG Story / LINE</span>
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          สร้างการ์ดดวงชะตาสไตล์พรีเมียมสีทอง บันทึกภาพลงมือถือได้ทันที
        </p>

        {/* ตัวอย่างการ์ด 9:16 พรีวิว */}
        <div className="my-4 flex flex-1 items-center justify-center overflow-y-auto py-2">
          <div
            ref={cardRef}
            className="ornate-border relative aspect-[9/16] w-64 overflow-hidden rounded-2xl bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950 p-4 text-center shadow-gold"
          >
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

            {data.quote && (
              <div className="mt-3 rounded-lg border border-gold/20 bg-gold/5 p-2 text-[9px] italic text-amber-100 line-clamp-3">
                "{data.quote}"
              </div>
            )}

            <div className="absolute bottom-3 left-0 right-0 text-[8px] text-gold/80">
              www.likhitfa.online
            </div>
          </div>
        </div>

        {/* ปุ่มกด Action */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={downloadCardImage}
            disabled={downloading}
            className="flex-1 rounded-xl bg-gradient-gold py-3 text-xs font-semibold text-primary-foreground shadow-gold transition hover:scale-[1.02] disabled:opacity-50"
          >
            {downloading ? "กำลังสร้างภาพ..." : "📥 บันทึกภาพลงเครื่อง (Story 9:16)"}
          </button>
          <button
            onClick={shareNative}
            className="rounded-xl border border-gold/30 bg-card/60 px-4 py-3 text-xs text-foreground transition hover:border-gold hover:text-gold"
          >
            {copied ? "✓ คัดลอกแล้ว" : "แชร์ / ลิงก์"}
          </button>
        </div>
      </div>
    </div>
  );
}
