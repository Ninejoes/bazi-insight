import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { seo, siteUrl } from "@/lib/seo";
import { getTodayLuckyColors, type DayLuckyColors } from "@/lib/lucky-colors-data";
import { tarotCards, type TarotCard } from "@/lib/tarot-cards";
import { ShareStoryModal, type ShareCardData } from "@/components/share-story-modal";
import { useState, useMemo } from "react";

export const Route = createFileRoute("/daily-hub")({
  head: () =>
    seo({
      title: "เช็คดวงเช้านี้ Daily Hub — สีเสื้อมงคลวันนี้ ไพ่ยิปซีประจำวัน ฤกษ์ดี และเลขเด็ด",
      description:
        "ศูนย์รวมเช็คดวงตอนเช้าในหน้าเดียว เช็คสีเสื้อมงคลประจำวันวันนี้ สีกาลกิณีห้ามใส่ เปิดไพ่ยิปซีประจำวัน 1 ใบ เช็คทิศโชคลาภไฉ่ซิงเอี้ย และเลขนำโชคประจำวัน ฟรี",
      path: "/daily-hub",
      canonicalUrl: `${siteUrl}/daily-hub`,
      keywords: [
        "เช็คดวงเช้านี้",
        "สีเสื้อมงคลวันนี้",
        "ไพ่ยิปซีประจำวัน",
        "ดวงประจำวัน",
        "ทิศโชคลาภวันนี้",
        "ฤกษ์ดีวันนี้",
        "เลขเด่นวันนี้",
        "Likhitfa",
      ],
    }),
  component: DailyHubPage,
});

const THAI_MONTHS = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

const DAILY_TAROT_MEANINGS: Record<number, { title: string; advice: string }> = {
  0: { title: "การเริ่มต้นใหม่ อิสรภาพ และความกล้าหาญ", advice: "เปิดใจรับสิ่งใหม่ๆ อย่ากลัวความไม่แน่นอน ก้าวแรกจะพาไปสู่ความสำเร็จ" },
  1: { title: "พลังแห่งการเนรมิต ความคิดสร้างสรรค์ และทักษะรอบด้าน", advice: "ใช้ความสามารถที่มีอย่างมั่นใจ วันนี้การเจรจาและการลงมือทำจะได้ผลดีเลิศ" },
  2: { title: "สัญชาตญาณอันแม่นยำ ความสงบนิ่ง และปัญญาญาณ", advice: "ฟังเสียงหัวใจตนเอง มีความลับหรือเรื่องที่ต้องพิจารณาอย่างรอบคอบ" },
  3: { title: "ความอุดมสมบูรณ์ ความรักอบอุ่น และการเจริญงอกงาม", advice: "ได้รับความเมตตา มีโชคลาภทางทรัพย์สิน หรือคนในครอบครัวนำข่าวดีมาให้" },
  4: { title: "อำนาจบารมี ความมั่นคง และการตัดสินใจที่เด็ดขาด", advice: "วางระเบียบแบบแผนให้ชัดเจน เป็นผู้นำที่ยุติธรรม ปัญหาจะได้รับการสะสาง" },
  5: { title: "ศีลธรรม คำปรึกษาจากผู้ใหญ่ และความก้าวหน้าทางปัญญา", advice: "ยึดความถูกต้องเป็นหลัก หากมีปัญหาให้ปรึกษาครูบาอาจารย์หรือผู้ใหญ่" },
  6: { title: "ทางเลือกแห่งความรัก ความสามัคคี และเสน่ห์ดึงดูด", advice: "เลือกสิ่งที่หัวใจต้องการอย่างมีเหตุผล ความสัมพันธ์จะราบรื่นและอบอุ่น" },
  7: { title: "ชัยชนะ ความมุ่งมั่น และการก้าวข้ามอุปสรรค", advice: "มุ่งมั่นต่อไปอย่างไม่ย่อท้อ วันนี้คุณจะเอาชนะความท้าทายได้อย่างน่าภาคภูมิใจ" },
  8: { title: "ความยุติธรรม ความซื่อสัตย์ และความสมดุล", advice: "ตรงไปตรงมา ตรวจสอบเอกสารสัญญาให้รอบคอบ ผลกรรมดีจะให้ผลตอบแทน" },
  9: { title: "การค้นหาความจริง การทบทวนตนเอง และความสงบ", advice: "ให้เวลากับตนเอง อยู่ในมุมสงบเพื่อวางแผนก้าวต่อไปอย่างมีสติ" },
  10: { title: "กงล้อแห่งโชคชะตา โชคลาภฟลุ๊กๆ และการเปลี่ยนแปลงที่ดี", advice: "จังหวะชีวิตกำลังเปลี่ยนไปในทางบวก โชคลาภลอยหรือโอกาสดีกำลังเข้ามาหา" },
};

function getDailyTarotFallback(cardNo: number) {
  return DAILY_TAROT_MEANINGS[cardNo % 11] || {
    title: "พลังงานแห่งความสมดุลและโอกาสทอง",
    advice: "ใช้ชีวิตด้วยสติ ความคิดบวกจะดึงดูดผู้คนและสิ่งดีๆ เข้ามาสู่ชีวิตคุณในวันนี้",
  };
}

export function DailyHubPage() {
  const today = new Date();
  const todayLuckyColors: DayLuckyColors = useMemo(() => getTodayLuckyColors(), []);

  // Format Thai Date
  const thaiDateStr = `วัน${todayLuckyColors.dayName}ที่ ${today.getDate()} ${THAI_MONTHS[today.getMonth()]} พ.ศ. ${today.getFullYear() + 543}`;

  // Deterministic daily card based on date
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const dailyCardIndex = seed % tarotCards.length;
  const todayCard = tarotCards[dailyCardIndex] || tarotCards[0];
  const cardMeaning = getDailyTarotFallback(todayCard.no);

  const [cardRevealed, setCardRevealed] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  // Daily Lucky Numbers
  const mainNumber = (today.getDate() * 3 + todayLuckyColors.dayIndex) % 10;
  const secondaryNumber = (mainNumber + 5) % 10;
  const luckyPair = `${mainNumber}${secondaryNumber}`;

  // Auspicious directions
  const directions = [
    { label: "ทิศเทพเจ้าโชคลาภ (ไฉ่ซิงเอี้ย)", dir: "ทิศตะวันออกเฉียงใต้" },
    { label: "ทิศเทพยินดี (ความรัก เมตตา)", dir: "ทิศใต้" },
    { label: "ทิศอุปถัมภ์ (ผู้ใหญ่หนุนนำ)", dir: "ทิศตะวันตกเฉียงเหนือ" },
  ];

  const shareData: ShareCardData = {
    category: "เช็คดวงเช้านี้ Daily Hub",
    categoryCn: "今日运势",
    title: thaiDateStr,
    subtitle: `สีมงคลงาน: ${todayLuckyColors.categories.work.colors.map((c) => c.name).join(", ")}`,
    highlights: [
      { label: "สีงานเด่น", value: todayLuckyColors.categories.work.colors.map((c) => c.name).join(", "), color: "#34d399" },
      { label: "สีเงินเข้า", value: todayLuckyColors.categories.wealth.colors.map((c) => c.name).join(", "), color: "#fbbf24" },
      { label: "สีกาลกิณีห้ามใส่", value: todayLuckyColors.categories.inauspicious.colors.map((c) => c.name).join(", "), color: "#f87171" },
      { label: "ไพ่ยิปซีวันนี้", value: todayCard.name, color: "#38bdf8" },
      { label: "เลขเด่นนำโชค", value: `${mainNumber}, ${secondaryNumber} (${luckyPair})`, color: "#fb7185" },
    ],
    quote: `เคล็ดลับวันนี้: ${todayLuckyColors.dressingTip}`,
    footerTag: "เช็คดวงตอนเช้าทุกวันได้ที่ Likhitfa.online",
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader subtitle="เช็คดวงเช้านี้" subtitleCn="今日總覽" />

      <main className="mx-auto max-w-6xl px-4 py-10 md:px-8">
        {/* Hero Banner */}
        <section className="text-center">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-xs tracking-widest text-gold">
            <span>☀️ DAILY HOROSCOPE DASHBOARD</span>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-5xl">
            กระดาน<span className="text-gradient-gold">เช็คดวงเช้านี้</span>
          </h1>
          <p className="mt-2 font-display text-base text-gold md:text-lg font-semibold">
            {thaiDateStr}
          </p>
          <p className="mx-auto mt-2 max-w-xl text-xs text-muted-foreground md:text-sm">
            ตื่นเช้ามาที่เดียว เช็คสีเสื้อมงคล เปิดไพ่ยิปซีประจำวัน ตรวจทิศโชคลาภ และเลขนำโชค พร้อมเริ่มวันใหม่อย่างมั่นใจ
          </p>

          <div className="mt-5 flex justify-center">
            <button
              onClick={() => setShareModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-gold px-5 py-2.5 text-xs font-semibold text-stone-950 shadow-gold transition hover:opacity-90"
            >
              <span>📲 บันทึกการ์ดดวงเช้านี้ Story (9:16)</span>
            </button>
          </div>
        </section>

        {/* 1. Today's Lucky Colors Module */}
        <section className="mx-auto mt-10 max-w-5xl rounded-3xl border border-gold/30 bg-card/60 p-6 md:p-8 backdrop-blur-md shadow-elegant">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-gold/15 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🎨</span>
              <div>
                <h2 className="font-display text-xl font-bold text-foreground">
                  สีเสื้อมงคลประจำวัน{todayLuckyColors.dayName}
                </h2>
                <p className="text-xs text-muted-foreground">แต่งตัวเสริมออร่า เรียกงาน รับเงิน ปังทุกการเจรจา</p>
              </div>
            </div>
            <Link
              to="/lucky-colors"
              className="text-xs font-semibold text-gold hover:underline"
            >
              ดูตารางสีครบ 7 วัน →
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* งาน */}
            <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-4">
              <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider mb-2">
                💼 การงานก้าวหน้า
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {todayLuckyColors.categories.work.colors.map((c, i) => (
                  <span
                    key={i}
                    className="inline-block rounded-lg px-2.5 py-1 text-xs font-medium border"
                    style={{ backgroundColor: c.hex, borderColor: "rgba(255,255,255,0.2)", color: "#fff" }}
                  >
                    {c.name}
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground">{todayLuckyColors.categories.work.description}</p>
            </div>

            {/* เงิน */}
            <div className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-4">
              <div className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider mb-2">
                💰 โชคลาภเงินทอง
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {todayLuckyColors.categories.wealth.colors.map((c, i) => (
                  <span
                    key={i}
                    className="inline-block rounded-lg px-2.5 py-1 text-xs font-medium border"
                    style={{ backgroundColor: c.hex, borderColor: "rgba(255,255,255,0.2)", color: "#fff" }}
                  >
                    {c.name}
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground">{todayLuckyColors.categories.wealth.description}</p>
            </div>

            {/* รัก */}
            <div className="rounded-2xl border border-rose-500/25 bg-rose-500/5 p-4">
              <div className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider mb-2">
                💖 เสน่ห์ความรัก
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {todayLuckyColors.categories.love.colors.map((c, i) => (
                  <span
                    key={i}
                    className="inline-block rounded-lg px-2.5 py-1 text-xs font-medium border"
                    style={{ backgroundColor: c.hex, borderColor: "rgba(255,255,255,0.2)", color: "#fff" }}
                  >
                    {c.name}
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground">{todayLuckyColors.categories.love.description}</p>
            </div>

            {/* กาลกิณี */}
            <div className="rounded-2xl border border-rose-600/30 bg-rose-950/20 p-4">
              <div className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider mb-2">
                🚫 กาลกิณี (ห้ามใส่)
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {todayLuckyColors.categories.inauspicious.colors.map((c, i) => (
                  <span
                    key={i}
                    className="inline-block rounded-lg px-2.5 py-1 text-xs font-medium border"
                    style={{ backgroundColor: c.hex, borderColor: "rgba(255,255,255,0.2)", color: "#fff" }}
                  >
                    {c.name}
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-rose-300/80">{todayLuckyColors.categories.inauspicious.description}</p>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-gold/15 bg-gold/5 p-3.5 text-xs text-muted-foreground">
            <strong className="text-gold">เคล็ดลับการแต่งตัววันนี้: </strong>
            {todayLuckyColors.dressingTip}
          </div>
        </section>

        {/* 2. Daily Tarot Card Module */}
        <section className="mx-auto mt-10 max-w-5xl rounded-3xl border border-gold/30 bg-card/60 p-6 md:p-8 backdrop-blur-md shadow-elegant">
          <div className="flex items-center gap-3 border-b border-gold/15 pb-4 mb-6">
            <span className="text-3xl">🃏</span>
            <div>
              <h2 className="font-display text-xl font-bold text-foreground">
                ไพ่ยิปซีประจำวัน (Daily Tarot)
              </h2>
              <p className="text-xs text-muted-foreground">สุ่มพลังงานจักรวาลชี้นำแนวทางชีวิตของคุณในวันนี้</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-8 justify-center">
            {/* Tarot Card Display */}
            <div
              onClick={() => setCardRevealed(true)}
              className="group relative h-72 w-48 cursor-pointer rounded-2xl border-2 border-gold/40 p-2 shadow-gold transition-transform hover:scale-105"
            >
              {cardRevealed ? (
                <div className="h-full w-full overflow-hidden rounded-xl bg-stone-900">
                  <img
                    src={todayCard.url}
                    alt={todayCard.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center rounded-xl bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900 p-4 text-center border border-gold/20">
                  <span className="text-4xl mb-3 animate-pulse">✨</span>
                  <div className="font-display text-sm font-bold text-gold">แตะเพื่อเปิดไพ่</div>
                  <div className="text-[10px] text-muted-foreground mt-1">รับคำทำนายประจำวัน</div>
                </div>
              )}
            </div>

            {/* Reading details */}
            <div className="max-w-md space-y-3">
              {cardRevealed ? (
                <>
                  <div className="inline-block rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-gold">
                    {todayCard.name} (หมายเลข {todayCard.no})
                  </div>
                  <h3 className="font-display text-xl font-bold text-foreground">
                    {cardMeaning.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {cardMeaning.advice}
                  </p>
                  <div className="pt-2">
                    <Link
                      to="/tarot"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-gold hover:underline"
                    >
                      เปิดไพ่ยิปซีเต็มรูปแบบ (ความรัก การงาน การเงิน) →
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="font-display text-lg font-bold text-foreground">
                    ไพ่ประจำวันของคุณพร้อมแล้ว
                  </h3>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    ตั้งจิตให้นิ่ง นึกถึงเป้าหมายของวันนี้ แล้วแตะที่การ์ดเพื่อเปิดรับข้อความชี้นำจากไพ่ทาโรต์
                  </p>
                  <button
                    onClick={() => setCardRevealed(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-gold px-5 py-2 text-xs font-bold text-stone-950 shadow-gold"
                  >
                    <span>เปิดไพ่ประจำวัน</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </section>

        {/* 3. Auspicious Direction & Numbers Grid */}
        <section className="mx-auto mt-10 max-w-5xl grid gap-6 md:grid-cols-2">
          {/* ทิศมงคล */}
          <div className="rounded-3xl border border-gold/20 bg-card/60 p-6 backdrop-blur-md">
            <div className="flex items-center gap-2.5 mb-4 border-b border-gold/15 pb-3">
              <span className="text-2xl">🧭</span>
              <div>
                <h3 className="font-display text-base font-bold text-foreground">ทิศมงคลประจำวัน</h3>
                <p className="text-xs text-muted-foreground">หันหน้าโต๊ะทำงาน เจรจาค้าขาย หรือกราบไหว้</p>
              </div>
            </div>
            <ul className="space-y-3">
              {directions.map((d, i) => (
                <li key={i} className="flex items-center justify-between rounded-xl bg-gold/5 p-3 text-xs">
                  <span className="text-muted-foreground">{d.label}</span>
                  <strong className="text-gold font-bold">{d.dir}</strong>
                </li>
              ))}
            </ul>
          </div>

          {/* เลขเด่นประจำวัน */}
          <div className="rounded-3xl border border-gold/20 bg-card/60 p-6 backdrop-blur-md">
            <div className="flex items-center gap-2.5 mb-4 border-b border-gold/15 pb-3">
              <span className="text-2xl">🔢</span>
              <div>
                <h3 className="font-display text-base font-bold text-foreground">เลขเด่นนำโชควันนี้</h3>
                <p className="text-xs text-muted-foreground">สำหรับใช้ตั้งรหัส เจรจา หรือเสริมสิริมงคล</p>
              </div>
            </div>
            <div className="flex items-center justify-around py-4">
              <div className="text-center">
                <div className="font-display text-4xl font-extrabold text-gold">{mainNumber}</div>
                <div className="text-[11px] text-muted-foreground mt-1">เลขเด่นตัวหลัก</div>
              </div>
              <div className="h-10 w-px bg-gold/20" />
              <div className="text-center">
                <div className="font-display text-4xl font-extrabold text-foreground">{secondaryNumber}</div>
                <div className="text-[11px] text-muted-foreground mt-1">เลขเด่นตัวรอง</div>
              </div>
              <div className="h-10 w-px bg-gold/20" />
              <div className="text-center">
                <div className="font-display text-4xl font-extrabold text-emerald-400">{luckyPair}</div>
                <div className="text-[11px] text-muted-foreground mt-1">คู่เลขมงคล</div>
              </div>
            </div>
            <div className="text-center text-[11px] text-muted-foreground pt-1 border-t border-gold/10">
              * ข้อมูลคำนวณตามหลักมหาทักษาและกำลังวันประจำวันเกิด
            </div>
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
