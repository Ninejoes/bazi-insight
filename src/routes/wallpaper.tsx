import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { seo, siteUrl } from "@/lib/seo";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Sparkles,
  Coins,
  Droplets,
  Leaf,
  Flame,
  Mountain,
  Shield,
  Gem,
  Sun,
  Fish,
  Star,
  Compass,
  Maximize2,
  Download,
  X,
  Lightbulb,
} from "lucide-react";
import {
  FALLBACK_COLLECTIONS,
  fetchNineJoeCollections,
  flattenWallpapers,
  type NineJoeCollection,
  type NineJoeWallpaperItem,
} from "@/lib/ninejoe-collections";

export const Route = createFileRoute("/wallpaper")({
  head: () =>
    seo({
      title: "วอลเปเปอร์สายมู มงคลพรีเมียม Spiritual Art NineJoe & ยันต์ 5 ธาตุปาจื้อ ดาวน์โหลดฟรี",
      description:
        "ดาวน์โหลดวอลเปเปอร์สายมูระดับพรีเมียมเฉพาะหมวดหมู่ Spiritual Art จาก NineJoe Collections (เทพเจ้าไฉ่ซิงเอี้ย, ท้าวเวสสุวรรณ, พระแม่ลักษมี, พระพิฆเนศ, ปลาคาร์ฟมงคล) คมชัดระดับ Ultra HD 9:16 ฟรี",
      path: "/wallpaper",
      canonicalUrl: `${siteUrl}/wallpaper`,
      keywords: [
        "วอลเปเปอร์สายมู",
        "วอลเปเปอร์มงคล ninejoe",
        "ninejoe online collections",
        "วอลเปเปอร์ไฉ่ซิงเอี้ย",
        "วอลเปเปอร์ท้าวเวสสุวรรณ",
        "วอลเปเปอร์พระแม่ลักษมี",
        "วอลเปเปอร์พระพิฆเนศ",
        "วอลเปเปอร์ปลาคาร์ฟ",
        "วอลเปเปอร์ปาจื้อ",
        "ภาพมงคลเสริมทรัพย์",
        "วอลเปเปอร์มือถือ hd",
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
  icon: ReactNode;
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
    icon: <Coins className="h-5 w-5 text-amber-400" />,
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
    icon: <Droplets className="h-5 w-5 text-sky-400" />,
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
    icon: <Leaf className="h-5 w-5 text-emerald-400" />,
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
    icon: <Flame className="h-5 w-5 text-rose-400" />,
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
    icon: <Mountain className="h-5 w-5 text-amber-600" />,
    blessingCn: "平安富贵",
    blessingTh: "แคล้วคลาดปลอดภัย ร่ำรวยมั่นคง",
    bestFor: "เสริมความมั่นคง อสังหาริมทรัพย์ ความปลอดภัย และความอดทน",
  },
];

type FilterKey =
  | "all"
  | "caishen"
  | "vessavana"
  | "lakshmi"
  | "ganesha"
  | "koi"
  | "spiritual";

const FILTER_BUTTONS: { key: FilterKey; label: string; icon: ReactNode }[] = [
  { key: "all", label: "ทั้งหมด", icon: <Sparkles className="h-3.5 w-3.5 text-gold" /> },
  { key: "caishen", label: "ไฉ่ซิงเอี้ย", icon: <Coins className="h-3.5 w-3.5 text-amber-400" /> },
  { key: "vessavana", label: "ท้าวเวสสุวรรณ", icon: <Shield className="h-3.5 w-3.5 text-rose-400" /> },
  { key: "lakshmi", label: "พระแม่ลักษมี", icon: <Gem className="h-3.5 w-3.5 text-pink-400" /> },
  { key: "ganesha", label: "พระพิฆเนศ", icon: <Sun className="h-3.5 w-3.5 text-amber-400" /> },
  { key: "koi", label: "ปลาคาร์ฟมงคล", icon: <Fish className="h-3.5 w-3.5 text-sky-400" /> },
  { key: "spiritual", label: "มงคลอื่นๆ", icon: <Star className="h-3.5 w-3.5 text-gold" /> },
];

function WallpaperPage() {
  const [activeTab, setActiveTab] = useState<"ninejoe" | "custom">("ninejoe");
  const [collections, setCollections] = useState<NineJoeCollection[]>(FALLBACK_COLLECTIONS);
  const [filterKey, setFilterKey] = useState<FilterKey>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWallpaper, setSelectedWallpaper] = useState<NineJoeWallpaperItem | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Custom BaZi Talisman Generator State
  const [selectedTheme, setSelectedTheme] = useState<ElementTheme>(ELEMENT_THEMES[0]);
  const [ownerName, setOwnerName] = useState("");
  const [customDownloading, setCustomDownloading] = useState(false);

  // โหลดคอลเลกชันสดจาก NineJoe (Supabase) เฉพาะหมวด Spiritual Art
  useEffect(() => {
    let mounted = true;
    fetchNineJoeCollections().then((data) => {
      if (mounted && data && data.length > 0) {
        setCollections(data);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  // แปลงคอลเลกชันเป็นรายการวอลเปเปอร์เดี่ยว
  const allWallpapers = useMemo(() => flattenWallpapers(collections), [collections]);

  // กรองตาม Filter และ Search
  const filteredWallpapers = useMemo(() => {
    return allWallpapers.filter((item) => {
      // กรองตามหมวด
      if (filterKey === "all") {
        // แสดงทั้งหมดในหมวด Spiritual Art
      } else {
        if (item.deityGroup !== filterKey) return false;
      }

      // ค้นหาตามคำ
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = item.collectionTitle.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesTags = item.tags.some((t) => t.toLowerCase().includes(q));
        const matchesLabel = item.deityLabel.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesTags && !matchesLabel) return false;
      }

      return true;
    });
  }, [allWallpapers, filterKey, searchQuery]);

  // สถิติตัวเลขแต่ละหมวด (เฉพาะ Spiritual Art)
  const counts = useMemo(() => {
    return {
      all: allWallpapers.length,
      caishen: allWallpapers.filter((w) => w.deityGroup === "caishen").length,
      vessavana: allWallpapers.filter((w) => w.deityGroup === "vessavana").length,
      lakshmi: allWallpapers.filter((w) => w.deityGroup === "lakshmi").length,
      ganesha: allWallpapers.filter((w) => w.deityGroup === "ganesha").length,
      koi: allWallpapers.filter((w) => w.deityGroup === "koi").length,
      spiritual: allWallpapers.filter((w) => w.deityGroup === "spiritual").length,
    };
  }, [allWallpapers]);

  // ฟังก์ชันดาวน์โหลดรูปภาพ HD จาก Cloudinary
  const handleDownloadWallpaper = async (item: NineJoeWallpaperItem) => {
    try {
      setDownloadingId(item.id);
      const targetUrl = item.downloadUrl || item.imageUrl;
      const res = await fetch(targetUrl);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      const ext = targetUrl.includes(".png") ? "png" : "jpg";
      a.download = `ninejoe-wallpaper-${item.collectionSlug}-${item.id}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.warn("Direct blob download failed, opening direct image URL:", err);
      window.open(item.downloadUrl || item.imageUrl, "_blank");
    } finally {
      setDownloadingId(null);
    }
  };

  // ฟังก์ชันดาวน์โหลด Custom BaZi Canvas
  const handleDownloadCustom = () => {
    setCustomDownloading(true);
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
      setCustomDownloading(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      <SiteHeader subtitle="วอลเปเปอร์สายมู" subtitleCn="壁纸" />

      <main className="mx-auto max-w-7xl px-4 pt-10 pb-20 sm:px-6">
        {/* Banner ส่วนหัว */}
        <section className="glass-strong relative overflow-hidden rounded-3xl p-6 shadow-elegant md:p-10">
          <div className="pointer-events-none absolute -right-6 -top-6 font-cn text-[160px] leading-none text-gold/[0.05]">
            图
          </div>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-4 py-1 text-[11px] tracking-wider text-gold">
              <span className="font-cn">开运壁纸</span> · เฉพาะหมวดหมู่ Spiritual Art ลิขสิทธิ์แท้จาก{" "}
              <a
                href="https://ninejoe.online/collections"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold underline hover:text-amber-300"
              >
                NineJoe.online
              </a>
            </div>
            <h1 className="mt-4 font-display text-3xl text-foreground md:text-5xl">
              วอลเปเปอร์สายมู <span className="text-gradient-gold italic">Spiritual Art มงคลพรีเมียม</span>
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
              รวมวอลเปเปอร์สายมู องค์เทพเจ้า และภาพมงคลระดับ Ultra HD สำหรับหน้าจอมือถือ (9:16)
              คัดสรรเฉพาะหมวดหมู่ <strong>Spiritual Art</strong> ลิขสิทธิ์แท้จาก{" "}
              <a
                href="https://ninejoe.online/collections"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold underline hover:text-amber-300"
              >
                NineJoe Collections
              </a>{" "}
              (ไฉ่ซิงเอี้ย, ท้าวเวสสุวรรณ, พระแม่ลักษมี, พระพิฆเนศ, ปลาคาร์ฟมงคล) ดาวน์โหลดฟรี และระบบสร้างวอลเปเปอร์ยันต์ 5 ธาตุปาจื้อสลักชื่อเฉพาะบุคคล
            </p>

            {/* แท็บสลับโหมด */}
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => setActiveTab("ninejoe")}
                className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition-all ${
                  activeTab === "ninejoe"
                    ? "bg-gradient-gold text-primary-foreground shadow-gold"
                    : "border border-gold/30 bg-card/40 text-muted-foreground hover:border-gold/60 hover:text-foreground"
                }`}
              >
                <Sparkles className="h-4 w-4" />
                <span>คอลเลกชัน Spiritual Art ({allWallpapers.length} ภาพ HD)</span>
              </button>
              <button
                onClick={() => setActiveTab("custom")}
                className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition-all ${
                  activeTab === "custom"
                    ? "bg-gradient-gold text-primary-foreground shadow-gold"
                    : "border border-gold/30 bg-card/40 text-muted-foreground hover:border-gold/60 hover:text-foreground"
                }`}
              >
                <Compass className="h-4 w-4" />
                <span>สร้างยันต์ 5 ธาตุปาจื้อ (สลักชื่อเฉพาะบุคคล)</span>
              </button>
            </div>
          </div>
        </section>

        {/* แท็บ 1: คอลเลกชัน NineJoe */}
        {activeTab === "ninejoe" && (
          <section className="mt-10 space-y-8 animate-fade-up">
            {/* แถบฟิลเตอร์และค้นหา */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              {/* ปุ่ม Filter Pills */}
              <div className="flex flex-wrap gap-2">
                {FILTER_BUTTONS.map((btn) => {
                  const isSelected = filterKey === btn.key;
                  const count = counts[btn.key];
                  return (
                    <button
                      key={btn.key}
                      onClick={() => setFilterKey(btn.key)}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all ${
                        isSelected
                          ? "border-gold bg-gold/20 text-gold shadow-gold"
                          : "border-border/60 bg-card/40 text-muted-foreground hover:border-gold/40 hover:text-foreground"
                      }`}
                    >
                      <span>{btn.icon}</span>
                      <span>{btn.label}</span>
                      <span className="ml-1 rounded-full bg-background/50 px-1.5 py-0.2 text-[10px] text-muted-foreground">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* ช่องค้นหา */}
              <div className="w-full sm:w-72">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหา เช่น ไฉ่ซิงเอี้ย, ลักษมี, koi..."
                  className="input-styled h-10 w-full text-xs"
                />
              </div>
            </div>

            {/* แกลเลอรีภาพวอลเปเปอร์ 9:16 */}
            {filteredWallpapers.length === 0 ? (
              <div className="glass-strong rounded-3xl p-12 text-center text-muted-foreground">
                <p className="text-base">ไม่พบวอลเปเปอร์ที่ตรงกับคำค้นหา "{searchQuery}"</p>
                <button
                  onClick={() => {
                    setFilterKey("all");
                    setSearchQuery("");
                  }}
                  className="mt-4 text-xs text-gold underline"
                >
                  ล้างตัวกรองทั้งหมด
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {filteredWallpapers.map((item) => {
                  const isDownloading = downloadingId === item.id;
                  return (
                    <div
                      key={item.id}
                      className="group ornate-border relative flex flex-col overflow-hidden rounded-2xl glass-strong transition-all duration-300 hover:-translate-y-1 hover:shadow-gold"
                    >
                      {/* รูปภาพ 9:16 */}
                      <div className="relative aspect-[9/16] w-full overflow-hidden bg-stone-950">
                        <img
                          src={item.imageUrl}
                          alt={item.altText}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />

                        {/* ป้ายเทพเจ้า / หมวดหมู่ มุมบนซ้าย */}
                        <div className="pointer-events-none absolute left-2 top-2 z-10 max-w-[85%] truncate rounded-full border border-gold/30 bg-black/60 px-2 py-0.5 text-[9px] font-medium text-gold backdrop-blur-sm">
                          {item.deityLabel}
                        </div>

                        {/* Overlay แอ็กชันเมื่อ Hover */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 p-3 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100">
                          <button
                            onClick={() => setSelectedWallpaper(item)}
                            className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-gold/40 bg-gold/20 py-2 text-center text-[11px] font-semibold text-gold transition hover:bg-gold hover:text-primary-foreground"
                          >
                            <Maximize2 className="h-3.5 w-3.5" />
                            <span>ขยายดูภาพ</span>
                          </button>
                          <button
                            onClick={() => handleDownloadWallpaper(item)}
                            disabled={isDownloading}
                            className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-gold py-2 text-center text-[11px] font-semibold text-primary-foreground shadow-gold transition hover:scale-105 disabled:opacity-50"
                          >
                            <Download className="h-3.5 w-3.5" />
                            <span>{isDownloading ? "กำลังดาวน์โหลด..." : "ดาวน์โหลด HD"}</span>
                          </button>
                          <a
                            href={`https://ninejoe.online/collections/${item.collectionSlug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 text-[10px] text-muted-foreground hover:text-gold hover:underline"
                          >
                            ดูที่ NineJoe.online ↗
                          </a>
                        </div>
                      </div>

                      {/* ชื่อคอลเลกชันและคำอธิบายย่อด้านล่าง */}
                      <div className="p-3">
                        <h3 className="truncate font-display text-xs font-medium text-foreground">
                          {item.collectionTitle}
                        </h3>
                        <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
                          {item.description || item.collectionCategory}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* แบนเนอร์พาร์ทเนอร์ NineJoe */}
            <div className="glass-strong mt-12 flex flex-col items-center justify-between gap-4 rounded-3xl border border-gold/20 p-6 sm:flex-row md:p-8">
              <div className="space-y-1 text-center sm:text-left">
                <div className="text-xs uppercase tracking-widest text-gold">
                  Official Partner · NineJoe Creative Studio
                </div>
                <h3 className="font-display text-lg text-foreground">
                  อยากได้วอลเปเปอร์และพรอมต์ AI คุณภาพสูงเพิ่มเติม?
                </h3>
                <p className="text-xs text-muted-foreground">
                  เยี่ยมชมแหล่งรวมผลงานออกแบบ UX/UI Design, AI Prompts และ Creative Art คอลเลกชันเต็มได้ที่ NineJoe
                </p>
              </div>
              <a
                href="https://ninejoe.online/collections"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-gradient-gold px-6 py-3 text-xs font-bold text-primary-foreground shadow-gold transition hover:scale-105"
              >
                <span>สำรวจ NineJoe Collections</span>
                <span>↗</span>
              </a>
            </div>
          </section>
        )}

        {/* แท็บ 2: สร้างยันต์ 5 ธาตุปาจื้อ (สลักชื่อเฉพาะบุคคล) */}
        {activeTab === "custom" && (
          <section className="mt-10 grid gap-8 md:grid-cols-[1.2fr_1fr] animate-fade-up">
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
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-gold/25 bg-gold/10">
                            {theme.icon}
                          </span>
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
                <h2 className="font-display text-xl text-foreground">
                  2. ใส่ชื่อหรือข้อความมงคล (ระบุหรือไม่ก็ได้)
                </h2>
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
                onClick={handleDownloadCustom}
                disabled={customDownloading}
                className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-gold text-base font-semibold text-primary-foreground shadow-gold transition hover:scale-[1.02] disabled:opacity-60"
              >
                <Download className="h-5 w-5" />
                <span>
                  {customDownloading
                    ? "กำลังสร้างวอลเปเปอร์ HD..."
                    : "ดาวน์โหลดวอลเปเปอร์ HD (1080x1920)"}
                </span>
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
        )}

        {/* Modal Lightbox แสดงภาพขยาย */}
        {selectedWallpaper && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fade-in"
            onClick={() => setSelectedWallpaper(null)}
          >
            <div
              className="ornate-border relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl glass-strong md:flex-row"
              onClick={(e) => e.stopPropagation()}
            >
              {/* ปุ่มปิด */}
              <button
                onClick={() => setSelectedWallpaper(null)}
                className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-muted-foreground hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>

              {/* ฝั่งซ้าย: รูปภาพ 9:16 เต็มตา */}
              <div className="relative flex aspect-[9/16] w-full items-center justify-center bg-black/90 p-4 md:w-1/2">
                <img
                  src={selectedWallpaper.imageUrl}
                  alt={selectedWallpaper.altText}
                  className="max-h-full max-w-full rounded-xl object-contain shadow-2xl"
                />
              </div>

              {/* ฝั่งขวา: รายละเอียดและปุ่มดาวน์โหลด */}
              <div className="flex flex-1 flex-col justify-between p-6 md:p-8">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs text-gold">
                    {selectedWallpaper.deityLabel}
                  </div>

                  <h2 className="mt-3 font-display text-2xl text-foreground">
                    {selectedWallpaper.collectionTitle}
                  </h2>

                  <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                    {selectedWallpaper.description || "วอลเปเปอร์สายมูความละเอียดสูง เหมาะสำหรับตั้งเป็นภาพหน้าจอมือถือ (Lock Screen / Home Screen) เสริมความเป็นสิริมงคล โชคลาภ และความสำเร็จ"}
                  </p>

                  {/* แท็ก */}
                  {selectedWallpaper.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {selectedWallpaper.tags.slice(0, 6).map((tag, idx) => (
                        <span
                          key={idx}
                          className="rounded-lg border border-border/60 bg-background/50 px-2 py-0.5 text-[10px] text-muted-foreground"
                        >
                          #{tag.replace(/^#/, "")}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-6 flex items-start gap-2 rounded-xl border border-gold/10 bg-gold/5 p-3 text-[11px] text-gold/80">
                    <Lightbulb className="h-4 w-4 shrink-0 text-gold mt-0.5" />
                    <div>
                      <strong>คำแนะนำ:</strong> ภาพนี้มีอัตราส่วน 9:16 ออกแบบมาให้เข้ากับหน้าจอสมาร์ทโฟนทุกรุ่น ดาวน์โหลดแล้วสามารถกดตั้งค่าเป็นภาพพักหน้าจอได้ทันที
                    </div>
                  </div>
                </div>

                <div className="mt-8 space-y-3">
                  <button
                    onClick={() => handleDownloadWallpaper(selectedWallpaper)}
                    disabled={downloadingId === selectedWallpaper.id}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-gold text-sm font-bold text-primary-foreground shadow-gold transition hover:scale-105 disabled:opacity-60"
                  >
                    <Download className="h-4 w-4" />
                    <span>
                      {downloadingId === selectedWallpaper.id
                        ? "กำลังบันทึกภาพ..."
                        : "ดาวน์โหลดภาพ HD ฟรี"}
                    </span>
                  </button>

                  <a
                    href={`https://ninejoe.online/collections/${selectedWallpaper.collectionSlug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-11 w-full items-center justify-center gap-1.5 rounded-xl border border-gold/30 text-xs font-semibold text-gold transition hover:bg-gold/10"
                  >
                    <span>ดูคอลเลกชันเต็มบน NineJoe.online</span>
                    <span>↗</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
