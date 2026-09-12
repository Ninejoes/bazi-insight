import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { seo, siteUrl } from "@/lib/seo";
import { analyzeBazi, type BaziAnalysis } from "@/lib/bazi-engine";
import { readStoredUserSession } from "@/lib/user-session";
import { recordDivinationHistory } from "@/lib/member-history";
import { ShareStoryModal, type ShareCardData } from "@/components/share-story-modal";
import { useState, useMemo, useEffect } from "react";
import { CreditCard, Palette, Hash, Gem, Sparkles, Share2, Bookmark, Check } from "lucide-react";

export const Route = createFileRoute("/destiny-card")({
  head: () =>
    seo({
      title: "บัตรชะตาชีวิตดิจิทัล Personal Destiny ID Card — สรุปดวงชะตาสายมูระดับ VIP ฟรี",
      description:
        "สร้างบัตรชะตาชีวิตดิจิทัล (Destiny ID Card) บัตรทองคำหรูหรา สรุปธาตุกำเนิดปาจื้อ ราศี นักษัตร สีมงคลคู่ชีพ เลขนำโชคตลอดชีพ และเทพเจ้าคุ้มครองประจำดวง ดาวน์โหลดเป็นภาพ 9:16 ฟรี",
      path: "/destiny-card",
      canonicalUrl: `${siteUrl}/destiny-card`,
      keywords: [
        "บัตรชะตาชีวิต",
        "Destiny ID Card",
        "บัตรสายมู",
        "ธาตุกำเนิดปาจื้อ",
        "สีมงคลคู่ชีพ",
        "เลขนำโชคตลอดชีพ",
        "การ์ดดวงชะตา",
        "Likhitfa",
      ],
    }),
  component: DestinyCardPage,
});

const GUARDIAN_DEITIES: Record<string, { name: string; title: string; blessing: string }> = {
  ไม้: {
    name: "องค์พระพิฆเนศ (Ganesha)",
    title: "เทพเจ้าแห่งปัญญาและความสำเร็จ",
    blessing: "เสริมสติปัญญา ความคิดสร้างสรรค์ และการขจัดอุปสรรคทั้งปวง",
  },
  ไฟ: {
    name: "เทพเจ้ากวนอู (Guan Yu)",
    title: "เทพเจ้าแห่งความซื่อสัตย์และชัยชนะ",
    blessing: "เสริมอำนาจบารมี ชัยชนะในการแข่งขัน และความกล้าหาญ",
  },
  ดิน: {
    name: "ท้าวเวสสุวรรณ (Vessavana)",
    title: "มหาเทพผู้พิทักษ์และเจ้าแห่งทรัพย์สมบัติ",
    blessing: "ขจัดภูตผี ป้องกันภยันตราย และเปิดขุมทรัพย์โชคลาภ",
  },
  ทอง: {
    name: "เทพเจ้าไฉ่ซิงเอี้ย (Caishen)",
    title: "เทพเจ้าแห่งโชคลาภและความมั่งคั่ง",
    blessing: "เปิดประตูทรัพย์ ค้าขายร่ำรวย เงินทองไหลมาเทมาไม่ขาดสาย",
  },
  น้ำ: {
    name: "พระแม่ลักษมี (Lakshmi)",
    title: "เทวีแห่งความรัก ความงดงาม และความมั่งคั่ง",
    blessing: "เสริมเสน่ห์เมตตามหานิยม ความรักสุขสมหวัง และความอุดมสมบูรณ์",
  },
};

const PERMANENT_LUCKY_ITEMS: Record<
  string,
  { colors: string[]; numbers: string; gems: string }
> = {
  ไม้: { colors: ["เขียวมรกต", "เขียวตอง", "ดำ"], numbers: "3, 8, 38", gems: "หยกเขียว, มรกต" },
  ไฟ: { colors: ["แดงทับทิม", "ชมพู", "ม่วง"], numbers: "2, 7, 27", gems: "ทับทิม, โกเมน" },
  ดิน: { colors: ["เหลืองทอง", "น้ำตาลครีม", "ส้มอิฐ"], numbers: "5, 0, 50", gems: "บุษราคัม, ซิทริน" },
  ทอง: { colors: ["ขาวมุก", "เงินเมทัลลิก", "ทองคำ"], numbers: "4, 9, 49", gems: "เพชร, มุกดาหาร" },
  น้ำ: { colors: ["น้ำเงินเข้ม", "ฟ้าทะเล", "ดำสนิท"], numbers: "1, 6, 16", gems: "ไพลิน, อะความารีน" },
};

export function DestinyCardPage() {
  const [name, setName] = useState("ชะตาฟ้าลิขิต");
  const [birthDate, setBirthDate] = useState("1996-08-18");
  const [birthTime, setBirthTime] = useState("09:30");
  const [gender, setGender] = useState<"หญิง" | "ชาย">("หญิง");
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const session = readStoredUserSession();
    if (session) {
      if (session.profile?.displayName || session.name) {
        setName(session.profile?.displayName || session.name);
      }
      if (session.profile?.birthDate) {
        setBirthDate(session.profile.birthDate);
      }
      if (session.profile?.gender === "male" || session.profile?.gender === "ชาย") {
        setGender("ชาย");
      }
    }
  }, []);

  const bazi: BaziAnalysis = useMemo(() => {
    return analyzeBazi({
      name,
      gender,
      birthDate,
      birthTime,
    });
  }, [name, gender, birthDate, birthTime]);

  const dm = bazi.context.dm;
  const element = dm.element; // ไม้, ไฟ, ดิน, ทอง, น้ำ
  const polarity = dm.polarity === "+" ? "หยาง" : "หยิน";
  const guardian = GUARDIAN_DEITIES[element] || GUARDIAN_DEITIES["ทอง"];
  const luckyData = PERMANENT_LUCKY_ITEMS[element] || PERMANENT_LUCKY_ITEMS["ทอง"];

  const cardNumber = `LK-${(dm.han ? dm.han.charCodeAt(0) : 88) * 17}-${birthDate.replace(/-/g, "").slice(2)}`;

  const shareData: ShareCardData = {
    category: "บัตรชะตาชีวิตดิจิทัล",
    categoryCn: "天命玄卡",
    title: `${name} · บัตรชะตาชีวิต`,
    subtitle: `ธาตุประจำตัว: ${dm.th} (${element}${polarity})`,
    highlights: [
      { label: "รหัสบัตรชะตา", value: cardNumber, color: "#fbbf24" },
      { label: "ธาตุกำเนิด", value: `ธาตุ${element} (${polarity})`, color: "#34d399" },
      { label: "สีมงคลคู่ชีพ", value: luckyData.colors.join(", "), color: "#38bdf8" },
      { label: "เลขนำโชคตลอดชีพ", value: luckyData.numbers, color: "#fb7185" },
      { label: "เทพเจ้าคุ้มครอง", value: guardian.name, color: "#fef08a" },
    ],
    quote: `คติธรรมประจำชะตา: สติรู้ทัน วาสนานำพา ปัญญาคุ้มภัย (${guardian.blessing})`,
    footerTag: "สร้างบัตรชะตาชีวิตดิจิทัลของคุณได้ที่ Likhitfa.online",
  };

  const handleSaveToHistory = () => {
    recordDivinationHistory({
      type: "บัตรชะตาชีวิต",
      title: `บัตรชะตาชีวิต: ${name}`,
      result: `ดิถี ${dm.th} (${element}${polarity}) · เลขนำโชค ${luckyData.numbers} · เทพคุ้มครอง ${guardian.name}`,
      url: "/destiny-card",
      metadata: {
        name,
        birthDate,
        cardNumber,
        element,
        polarity,
        luckyNumbers: luckyData.numbers,
        luckyColors: luckyData.colors,
        guardian: guardian.name,
      },
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader subtitle="บัตรชะตาชีวิตดิจิทัล" subtitleCn="天命卡" />

      <main className="mx-auto max-w-5xl px-4 py-10 md:px-8">
        {/* Header Hero */}
        <section className="text-center">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-xs tracking-widest text-gold">
            <CreditCard className="h-3.5 w-3.5" />
            <span>PERSONAL DESTINY IDENTITY CARD</span>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-5xl">
            บัตรชะตาชีวิต<span className="text-gradient-gold">ดิจิทัล</span>
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground md:text-base">
            สกัดรหัสชะตาชีวิตเฉพาะบุคคล (ธาตุปาจื้อ, สีมงคลคู่ชีพ, เลขนำโชค, เทพเจ้าประจำดวง)
            ออกเป็นบัตร VIP Gold Holographic ดาวน์โหลดเป็นภาพหน้าจอมือถือ 9:16 ได้ทันที
          </p>
        </section>

        {/* Input Form Controls */}
        <section className="mx-auto mt-8 max-w-xl rounded-3xl border border-gold/25 bg-card/60 p-6 backdrop-blur-md shadow-elegant">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">ชื่อ / ฉายาสายมู</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-gold/30 bg-background/80 px-3.5 py-2 text-sm text-foreground focus:border-gold focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">เพศ</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as "หญิง" | "ชาย")}
                className="w-full rounded-xl border border-gold/30 bg-background/80 px-3.5 py-2 text-sm text-foreground focus:border-gold focus:outline-none"
              >
                <option value="หญิง">หญิง</option>
                <option value="ชาย">ชาย</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">วันเดือนปีเกิด</label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full rounded-xl border border-gold/30 bg-background/80 px-3.5 py-2 text-sm text-foreground focus:border-gold focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">เวลาเกิด (ไม่ทราบใส่ 09:30)</label>
              <input
                type="time"
                value={birthTime}
                onChange={(e) => setBirthTime(e.target.value)}
                className="w-full rounded-xl border border-gold/30 bg-background/80 px-3.5 py-2 text-sm text-foreground focus:border-gold focus:outline-none"
              />
            </div>
          </div>
        </section>

        {/* Live VIP Gold Holographic Destiny Card */}
        <section className="mx-auto mt-10 max-w-md">
          <div className="relative overflow-hidden rounded-3xl border-2 border-gold/50 bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900 p-7 shadow-2xl backdrop-blur-xl">
            {/* Holographic Sheen Top Corner */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-gold/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-rose-500/10 blur-3xl" />

            {/* Card Header */}
            <div className="flex items-center justify-between border-b border-gold/20 pb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-gold shadow-gold text-stone-950 text-xs font-bold">
                  天
                </div>
                <div>
                  <div className="text-[9px] font-bold uppercase tracking-[0.25em] text-gold/80">
                    LIKHITFA DESTINY ID
                  </div>
                  <div className="font-display text-xs font-semibold text-foreground">
                    บัตรประจำตัวชะตาชีวิต
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-[10px] text-gold/80">{cardNumber}</div>
                <div className="text-[9px] text-muted-foreground">VIP CELESTIAL</div>
              </div>
            </div>

            {/* Name & Day Master */}
            <div className="my-6 text-center">
              <div className="font-display text-2xl font-bold text-foreground md:text-3xl">
                {name}
              </div>
              <div className="mt-1 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-0.5 text-xs font-medium text-gold">
                <span>ดิถี {dm.th} ({dm.han}) · ธาตุ{element} ({polarity})</span>
              </div>
            </div>

            {/* Card Matrix Information */}
            <div className="grid grid-cols-2 gap-3 rounded-2xl border border-gold/15 bg-gold/5 p-4 text-xs">
              <div>
                <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                  <Palette className="h-3 w-3 text-gold" />
                  สีมงคลคู่ชีพ
                </span>
                <p className="font-semibold text-foreground mt-0.5">{luckyData.colors.join(", ")}</p>
              </div>
              <div>
                <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                  <Hash className="h-3 w-3 text-gold" />
                  เลขนำโชคตลอดชีพ
                </span>
                <p className="font-semibold text-gold mt-0.5">{luckyData.numbers}</p>
              </div>
              <div>
                <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                  <Gem className="h-3 w-3 text-gold" />
                  อัญมณีหนุนดวง
                </span>
                <p className="font-semibold text-foreground mt-0.5">{luckyData.gems}</p>
              </div>
              <div>
                <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                  <Sparkles className="h-3 w-3 text-gold" />
                  เทพคุ้มครองประจำดวง
                </span>
                <p className="font-semibold text-gold mt-0.5 line-clamp-1">{guardian.name}</p>
              </div>
            </div>

            {/* 4 Pillars Summary */}
            <div className="mt-4 flex items-center justify-around border-t border-gold/10 pt-3 text-center">
              <div>
                <div className="text-[10px] text-muted-foreground">เสาปี</div>
                <div className="text-xs font-bold text-foreground">{bazi.chart.year.stem.th}{bazi.chart.year.branch.th}</div>
                <div className="text-[9px] font-cn text-gold/60">{bazi.chart.year.stem.han}{bazi.chart.year.branch.han}</div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground">เสาเดือน</div>
                <div className="text-xs font-bold text-foreground">{bazi.chart.month.stem.th}{bazi.chart.month.branch.th}</div>
                <div className="text-[9px] font-cn text-gold/60">{bazi.chart.month.stem.han}{bazi.chart.month.branch.han}</div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground">เสาวัน (ดิถี)</div>
                <div className="text-xs font-bold text-gold">{bazi.chart.day.stem.th}{bazi.chart.day.branch.th}</div>
                <div className="text-[9px] font-cn text-gold">{bazi.chart.day.stem.han}{bazi.chart.day.branch.han}</div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground">เสายาม</div>
                <div className="text-xs font-bold text-foreground">{bazi.chart.hour.stem.th}{bazi.chart.hour.branch.th}</div>
                <div className="text-[9px] font-cn text-gold/60">{bazi.chart.hour.stem.han}{bazi.chart.hour.branch.han}</div>
              </div>
            </div>

            {/* Card Footer Motto */}
            <div className="mt-5 border-t border-gold/15 pt-3 text-center">
              <p className="text-[10px] italic text-muted-foreground">
                "{guardian.blessing}"
              </p>
              <div className="mt-1 font-cn text-[11px] tracking-widest text-gold/60">
                天 · 地 · 人 · 和
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleSaveToHistory}
              className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition cursor-pointer ${
                isSaved
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                  : "border border-gold/40 bg-gold/10 text-gold hover:bg-gold/20"
              }`}
            >
              {isSaved ? (
                <>
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span>บันทึกบัตรแล้ว</span>
                </>
              ) : (
                <>
                  <Bookmark className="h-4 w-4" />
                  <span>บันทึกบัตรลงโปรไฟล์</span>
                </>
              )}
            </button>
            <button
              onClick={() => setShareModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-gold px-6 py-3 text-sm font-bold text-stone-950 shadow-gold transition hover:opacity-90 cursor-pointer"
            >
              <Share2 className="h-4 w-4" />
              <span>บันทึกบัตรชะตาชีวิต Story (9:16)</span>
            </button>
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
