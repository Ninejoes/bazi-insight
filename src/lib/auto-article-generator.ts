import { getSupabaseConfig, supabaseRequest } from "./supabase-rest";

export type ArticleSlot = "morning" | "forenoon" | "noon" | "afternoon" | "evening";

export type AutoArticleOptions = {
  slot?: ArticleSlot | "auto";
  targetDate?: string; // YYYY-MM-DD
  force?: boolean;
  apiKey?: string;
};

export type GeneratedArticleResult = {
  ok: boolean;
  action: "created" | "updated" | "skipped";
  slug: string;
  slot: ArticleSlot;
  date: string;
  mode: "gemini" | "fallback";
  title: string;
  error?: string;
};

const COVER_IMAGES: Record<ArticleSlot, string[]> = {
  morning: [
    "https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1533294455009-a77b7557d2d1?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80",
  ],
  forenoon: [
    "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?auto=format&fit=crop&w=1200&q=80",
  ],
  noon: [
    "https://images.unsplash.com/photo-1600429991827-5224817554f8?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=1200&q=80",
  ],
  afternoon: [
    "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
  ],
  evening: [
    "https://images.unsplash.com/photo-1514897575457-c4db467cf78e?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1528353518104-dbd48bee7bc4?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1472552944129-b035e9ea3744?auto=format&fit=crop&w=1200&q=80",
  ],
};

const THAI_DAYS = [
  "วันอาทิตย์",
  "วันจันทร์",
  "วันอังคาร",
  "วันพุธ",
  "วันพฤหัสบดี",
  "วันศุกร์",
  "วันเสาร์",
];

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

const DAY_POWER_NUMBERS: Record<number, number> = {
  0: 6,  // อาทิตย์
  1: 18, // จันทร์
  2: 8,  // อังคาร
  3: 17, // พุธ
  4: 19, // พฤหัส
  5: 21, // ศุกร์
  6: 10, // เสาร์
};

export function resolveSlot(slotParam?: string): ArticleSlot {
  if (
    slotParam === "morning" ||
    slotParam === "forenoon" ||
    slotParam === "noon" ||
    slotParam === "afternoon" ||
    slotParam === "evening"
  ) {
    return slotParam;
  }

  // Calculate current hour in Thailand (UTC+7)
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const bangkokTime = new Date(utc + 7 * 3600000);
  const hour = bangkokTime.getHours();

  if (hour < 9) return "morning";        // 00:00 - 08:59 (รอบเช้า 07:00)
  if (hour < 11) return "forenoon";      // 09:00 - 10:59 (รอบสาย 10:00)
  if (hour < 14) return "noon";          // 11:00 - 13:59 (รอบเที่ยง 12:00)
  if (hour < 17) return "afternoon";     // 14:00 - 16:59 (รอบบ่าย 15:00)
  return "evening";                      // 17:00 - 23:59 (รอบเย็น 18:00)
}

export function getBangkokDateString(date = new Date()): string {
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  const bangkok = new Date(utc + 7 * 3600000);
  return bangkok.toISOString().slice(0, 10);
}

export function formatThaiDate(dateStr: string): string {
  const [yearStr, monthStr, dayStr] = dateStr.split("-");
  const year = Number.parseInt(yearStr, 10);
  const month = Number.parseInt(monthStr, 10) - 1;
  const day = Number.parseInt(dayStr, 10);
  const dateObj = new Date(year, month, day);
  const dayName = THAI_DAYS[dateObj.getDay()] || "วันมงคล";
  const monthName = THAI_MONTHS[month] || "";
  const buddhistYear = year + 543;
  return `${dayName}ที่ ${day} ${monthName} พ.ศ. ${buddhistYear}`;
}

type ArticlePayload = {
  title: string;
  excerpt: string;
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
  content: string[];
};

const SLOT_SALTS: Record<ArticleSlot, number> = {
  morning: 11,
  forenoon: 29,
  noon: 47,
  afternoon: 67,
  evening: 89,
};

function buildFallbackArticle(slot: ArticleSlot, dateStr: string): ArticlePayload {
  const thaiDate = formatThaiDate(dateStr);
  const [yearStr, monthStr, dayStr] = dateStr.split("-");
  const d = Number.parseInt(dayStr, 10);
  const m = Number.parseInt(monthStr, 10);
  const dayOfWeek = new Date(Number.parseInt(yearStr, 10), m - 1, d).getDay();
  const powerNum = DAY_POWER_NUMBERS[dayOfWeek] || 9;
  const salt = SLOT_SALTS[slot] || 11;

  // Salt ensures generated numbers across the 5 slots on the exact same date NEVER collide
  const baseSeed = (d * 13 + m * 7 + powerNum + salt) % 100;
  const topDigit1 = (baseSeed % 9) + 1;
  const topDigit2 = ((baseSeed + 4) % 9) + 1;
  const subDigit = (baseSeed * 3 + salt) % 10;

  const pair1 = `${topDigit1}${topDigit2}`;
  const pair2 = `${topDigit2}${subDigit}`;
  const pair3 = `${(powerNum + salt) % 10}${topDigit1}`;
  const pair4 = `${(topDigit1 + 2) % 10}${(topDigit2 + 5) % 10}`;

  const triple1 = `${topDigit1}${pair2}`;
  const triple2 = `${(powerNum + salt) % 9 + 1}${topDigit1}${topDigit2}`;

  if (slot === "morning") {
    return {
      title: `เลขเด็ดมงคลยามเช้า ประจำ${thaiDate} เปิดดวงรับทรัพย์ เลขกำลังวันเด่น`,
      excerpt: `ส่องแนวทางเลขเด็ดมงคลรอบเช้าประจำ${thaiDate} รวมเลขกำลังวัน เลขเด่น 2 ตัว 3 ตัว พร้อมเคล็ดลับเปิดทรัพย์รับโชค`,
      seoTitle: `เลขเด็ดงวดนี้ รอบเช้า ${thaiDate} เลขมงคลกำลังวัน — Likhitfa`,
      seoDescription: `แนวทางเลขเด็ดรอบเช้าประจำ${thaiDate} เลขมงคลเสริมโชคลาภ เลขเด่น 2 ตัว ${pair1}, ${pair2} และ 3 ตัวตรง ${triple1} ดูดวงการเงิน`,
      keywords: ["เลขเด็ด", "เลขเด็ดงวดนี้", "เลขมงคล", "เลขกำลังวัน", "ดวงโชคลาภ", "หวยวันนี้", "แนวทางเลขเด็ด"],
      content: [
        `เริ่มต้นเช้าวันใหม่กับแนวทางเลขเด็ดมงคลประจำ**${thaiDate}** สำหรับผู้ที่กำลังมองหาพลังบวกและแนวทางโชคลาภในวันนี้ การดูดวงตัวเลขตามหลักโหราศาสตร์จะช่วยให้เห็นจังหวะและทิศทางพลังงานที่เกื้อหนุนดวงชะตาของคุณอย่างสมดุล`,
        `### เลขกำลังวันและเลขมงคลเด่นประจำวัน\nสำหรับวันนี้นั้น มีดาวประจำวันส่งอิทธิพลต่อเลขกำลังวันเด่นคือ **${powerNum}** โดยมีเลขเด่นหลักประจำเช้านี้ได้แก่ **${topDigit1}** และ **${topDigit2}** ซึ่งจัดเป็นเลขเปิดทรัพย์ที่มีกระแสเกื้อหนุนความราบรื่นตลอดทั้งวัน`,
        `### ชุดตัวเลขน่าจับตา (รอบเช้า)\n- **เลขเด่นวิ่ง/รูด:** ${topDigit1} - ${topDigit2}\n- **เลขท้าย 2 ตัวมงคล:** ${pair1}, ${pair2}, ${pair3}, ${pair4}\n- **เลขชุด 3 ตัวตรง-โต๊ด:** ${triple1}, ${triple2}`,
        `### ทิศและสีมงคลเสริมโชคลาภ\n- **ทิศมงคลนำโชค:** ทิศตะวันออกเฉียงเหนือ และ ทิศใต้\n- **สีเสริมทรัพย์:** สีเขียวเหนี่ยวทรัพย์ สีทอง และสีขาวนวล\n- **เวลาฤกษ์ดีเจรจาค้าขาย:** 08:09 - 10:39 น.`,
        `*คำเตือนและข้อควรระวัง:* การคาดการณ์ตัวเลขเป็นความเชื่อส่วนบุคคลตามหลักโหราศาสตร์และสถิติตัวเลข โปรดใช้วิจารณญาณในการเปิดรับข้อมูล วางแผนการเงินอย่างมีสติ และไม่นำเงินจำเป็นในชีวิตประจำวันมาเสี่ยงโชค`,
      ],
    };
  }

  if (slot === "forenoon") {
    return {
      title: `เลขเด็ดปฏิทินจีน & เลขเซียมซีมงคลรอบสาย ${thaiDate} ส่องเลขมังกรเปิดทรัพย์`,
      excerpt: `เจาะลึกแนวทางเลขปฏิทินจีนและสถิติเซียมซีมงคลรอบสายประจำ${thaiDate} รวมเลขมงคล 2 ตัว 3 ตัว เสริมบารมีรับทรัพย์`,
      seoTitle: `เลขเด็ดปฏิทินจีน รอบสาย ${thaiDate} เลขเซียมซีมงคล — Likhitfa`,
      seoDescription: `แนวทางเลขปฏิทินจีนและเลขเซียมซีมงคลรอบสาย ${thaiDate} เลขเด่นมังกร ${topDigit1} เลข 2 ตัว ${pair1}, ${pair3} และชุด 3 ตัวตรง ${triple1}`,
      keywords: ["เลขปฏิทินจีน", "เลขเซียมซี", "เลขเด็ดรอบสาย", "หวยปฏิทินจีน", "เลขมงคล", "ดูดวงโชคลาภ"],
      content: [
        `เข้าสู่ช่วงสายของ**${thaiDate}** เวลานี้เป็นช่วงเวลาเสริมธาตุหยิน-หยางให้สมดุลตามตำราจีนโบราณ Likhitfa นำศาสตร์การเทียบเคียงปฏิทินจีนและเลขเซียมซีมงคลมาจัดสรรแนวทางให้ทุกท่าน`,
        `### ศาสตร์ตัวเลขปฏิทินจีนโบราณประจำวัน\nตามรอบจันทรคติและดวงดาวมังกรประจำวัน มีพลังงานธาตุส่งเสริมเลขแกนหลักคือ **${topDigit1}** และตัวเลขเสริมบารมี **${topDigit2}** ซึ่งเชื่อว่าช่วยหนุนนำเรื่องการค้าและการเงิน`,
        `### สรุปชุดตัวเลขมงคลรอบสาย\n- **เลขเด่นเซียมซี:** ${topDigit1} (เด่นหลัก), ${subDigit} (เด่นรอง)\n- **เลขมงคล 2 ตัวคัดพิเศษ:** ${pair1}, ${pair3}, ${pair2}\n- **เลขชุด 3 ตัวเปิดทรัพย์:** ${triple1}, ${triple2}`,
        `### เคล็ดลับเสริมดวงประจำรอบสาย\nก่อนตั้งจิตอธิษฐาน แนะนำให้ดื่มน้ำสะอาด 1 แก้วเพื่อรับพลังธาตุน้ำบริสุทธิ์ และสวดคาถาเงินล้านเพื่อความผ่องใสแห่งจิตใจ`,
      ],
    };
  }

  if (slot === "noon") {
    return {
      title: `วิเคราะห์สถิติหวย & เลขเด็ดรอบเที่ยง ${thaiDate} เจาะลึกเลขท้าย 2 ตัว 3 ตัว`,
      excerpt: `เจาะลึกแนวทางเลขเด็ดรอบเที่ยงประจำ${thaiDate} วิเคราะห์ตามสถิติเลขออกบ่อย เลขวิ่งบน-ล่าง พร้อมคู่เด่นน่าสนใจ`,
      seoTitle: `เลขเด็ดรอบเที่ยง ${thaiDate} สถิติหวยและเลขวิ่งเด่น — Likhitfa`,
      seoDescription: `สรุปแนวทางเลขเด็ดรอบเที่ยง ${thaiDate} วิเคราะห์สถิติเลขท้าย 2 ตัว 3 ตัว เลขวิ่งเด่น ${topDigit1} และคู่โต๊ดเต็งน่าจับตา`,
      keywords: ["สถิติหวย", "เลขเด็ดรอบเที่ยง", "เลขวิ่ง", "เลขท้าย2ตัว", "เลขท้าย3ตัว", "หวยรัฐบาล", "แนวทางหวย"],
      content: [
        `เข้าสู่ช่วงเที่ยงของ**${thaiDate}** เป็นช่วงเวลาที่หลายท่านกำลังติดตามแนวทางตัวเลขเพื่อนำไปวิเคราะห์ประกอบการตัดสินใจ Likhitfa รวบรวมข้อมูลเชิงสถิติและความน่าจะเป็นของตัวเลขมาอัปเดตให้ทุกท่านได้รับชม`,
        `### วิเคราะห์แนวโน้มสถิติตัวเลขช่วงบ่าย\nจากการประมวลผลสถิติย้อนหลังร่วมกับรอบพลังธาตุประจำวัน พบว่าตัวเลขที่มีอัตราความถี่โดดเด่นในช่วงนี้ คือกลุ่มเลขที่มีความสมดุลระหว่างเลขคู่และเลขคี่ โดยมีเลขแกนหลักอยู่ที่ **${topDigit1}**`,
        `### สรุปชุดตัวเลขรอบเที่ยง\n- **เลขวิ่งบน-ล่าง:** ${topDigit1} (เน้นวิ่งบน), ${subDigit} (เน้นล่าง)\n- **จับคู่ 2 ตัวเต็ง:** ${pair1}, ${pair3}, ${pair2}\n- **ชุด 3 ตัวเน้นตรง:** ${triple2}, ${triple1}`,
        `### ข้อคิดการอ่านสถิติหวย\nสถิติตัวเลขคือการรวบรวมข้อมูลผลลัพธ์ในอดีตเพื่อมองหารูปแบบความถี่ ไม่มีการการันตีผลรางวัลล่วงหน้า การเล่นอย่างมีขอบเขตและกำหนดงบประมาณที่แน่นอนคือหัวใจสำคัญของการรักษาความมั่งคั่ง`,
      ],
    };
  }

  if (slot === "afternoon") {
    return {
      title: `ถอดรหัสเลขเด่นสำนักดัง & ปริศนาตัวเลขช่วงบ่าย ${thaiDate} คัดเน้นๆ โค้งสำคัญ`,
      excerpt: `รวบรวมแนวทางเลขเด่นสำนักดังและแปลปริศนาตัวเลขรอบบ่ายประจำ${thaiDate} คัดเลขวิ่งรูดและคู่เด่นน่าจับตา`,
      seoTitle: `เลขเด่นสำนักดัง รอบบ่าย ${thaiDate} ปริศนาตัวเลขนำโชค — Likhitfa`,
      seoDescription: `วิเคราะห์เลขเด็ดสำนักดังรอบบ่าย ${thaiDate} ถอดรหัสปริศนาตัวเลข เลขวิ่งเด่น ${topDigit2} จับคู่ 2 ตัว ${pair2}, ${pair4} และ 3 ตัวตรง`,
      keywords: ["เลขเด็ดสำนักดัง", "ปริศนาตัวเลข", "เลขเด็ดรอบบ่าย", "หวยงวดนี้", "เลขวิ่งรูด", "แนวทางเลขเด็ด"],
      content: [
        `อัปเดตช่วงบ่ายประจำ**${thaiDate}** เป็นช่วงเวลาที่กระแสตัวเลขเริ่มเข้มข้น มีการรวบรวมข้อมูลจากหลากหลายสำนักครูบาอาจารย์และปริศนาภาพคำกลอนตัวเลขนำโชค`,
        `### ถอดรหัสปริศนาตัวเลขรอบบ่าย\nจากปริศนาคำกลอนและกระแสสำนักดัง ชี้ให้เห็นถึงพลังตัวเลขที่มีความร้อนแรง โดยมีตัวเลข **${topDigit2}** และ **${subDigit}** ปรากฏเป็นแกนสำคัญของช่วงบ่ายนี้`,
        `### สรุปตัวเลขเด่นช่วงบ่าย\n- **เลขวิ่งรูดเด่น:** ${topDigit2} (ฟันธง), ${topDigit1} (กันหลุด)\n- **เลข 2 ตัวชุดลุ้น:** ${pair2}, ${pair4}, ${pair1}\n- **เลข 3 ตัวตรงเน้นหนัก:** ${triple1}, ${triple2}`,
        `### ย้ำเตือนสติการลงทุน\nการติดตามแนวทางหลายสำนักอาจทำให้เกิดความลังเลใจ แนะนำให้เลือกชุดตัวเลขที่ตนเองรู้สึกถูกชะตาที่สุดและตั้งงบประมาณอย่างรัดกุม`,
      ],
    };
  }

  // Evening slot
  return {
    title: `สรุปเลขเด็ดโค้งสุดท้ายยามเย็น ${thaiDate} เลขนำโชคความฝัน & เคล็ดลับเสริมดวง`,
    excerpt: `สรุปภาพรวมเลขเด็ดโค้งสุดท้ายยามเย็นประจำ${thaiDate} รวมเลขทำนายฝันยอดนิยม เลขชุดดาวเด่น และแนวทางเตรียมตัวรับโชค`,
    seoTitle: `สรุปเลขเด็ดโค้งสุดท้าย ${thaiDate} เลขเด็ดทำนายฝัน — Likhitfa`,
    seoDescription: `โค้งสุดท้ายเลขเด็ดรอบเย็น ${thaiDate} สรุปเลขเด่น เลขทำนายฝันยอดฮิต เลข 2 ตัว ${pair2}, ${pair4} และเคล็ดลับเสริมดวง`,
    keywords: ["เลขเด็ดโค้งสุดท้าย", "เลขทำนายฝัน", "หวยงวดนี้", "สรุปเลขเด็ด", "เลขเด็ดเย็นนี้", "ดวงโชคลาภ"],
    content: [
      `ส่งท้ายวันด้วยการสรุปภาพรวมเลขเด็ดโค้งสุดท้ายประจำ**${thaiDate}** สำหรับช่วงค่ำนี้ เหมาะสำหรับการทบทวนข้อมูล พักผ่อนจิตใจ และเสริมสร้างสมาธิก่อนเตรียมพร้อมสำหรับวันพรุ่งนี้`,
      `### สรุปเลขรวมดาวเด่นรอบค่ำ\nหลังจากรวบรวมกระแสตัวเลขและความฝันยอดนิยมตลอดทั้งวัน พบว่ากลุ่มตัวเลขที่ได้รับความสนใจสูงสุดคือชุดเลขที่สัมพันธ์กับธาตุประจำวัน ได้แก่เลข **${topDigit2}** และ **${subDigit}**`,
      `### เลขทำนายฝันยอดนิยมประจำงวด\n- **ฝันเห็นพญานาค/งูใหญ่:** เด่น 5 - 6 - 9 (จับคู่ 59, 69, 569)\n- **ฝันเห็นเงินทอง/แก้วแหวน:** เด่น 2 - 4 - 8 (จับคู่ 24, 82, 824)\n- **ฝันเห็นผู้ใหญ่/พระสงฆ์:** เด่น 1 - 7 - 9 (จับคู่ 19, 79, 179)`,
      `### ชุดตัวเลขสรุปโค้งสุดท้าย\n- **เลขท้าย 2 ตัวคัดพิเศษ:** ${pair2}, ${pair4}, ${pair1}\n- **เลขท้าย 3 ตัวคัดพิเศษ:** ${triple1}, ${triple2}`,
      `*ข้อเตือนใจยามเย็น:* โชคลาภที่แท้จริงและยั่งยืนที่สุดเกิดจากการลงมือทำและการบริหารชีวิตอย่างรอบคอบ ขอให้ทุกท่านเสี่ยงโชคด้วยความสนุกสนานและไม่กระทบต่อความสุขของครอบครัว`,
    ],
  };
}

async function callGemini(prompt: string, apiKey: string): Promise<ArticlePayload | null> {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.85,
        },
      }),
    });

    if (!response.ok) {
      console.warn("Gemini API error status:", response.status);
      return null;
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) return null;

    const parsed = JSON.parse(rawText) as ArticlePayload;
    if (!parsed.title || !Array.isArray(parsed.content)) return null;
    return parsed;
  } catch (err) {
    console.error("Gemini API call failed:", err);
    return null;
  }
}

function buildGeminiPrompt(slot: ArticleSlot, dateStr: string): string {
  const thaiDate = formatThaiDate(dateStr);
  const slotConfig = {
    morning: {
      name: "รอบเช้า (07:00 น.)",
      theme: "เลขเด็ดมงคลยามเช้า เปิดดวงรับทรัพย์ เลขกำลังวัน ทิศและสีมงคลประจำวันเกิด",
      angle: "เน้นการเปิดรับพลังบวกยามเช้า เลขกำลังวันตามดาวพระเคราะห์ ทิศนำโชค และฤกษ์เวลาเปิดทรัพย์",
    },
    forenoon: {
      name: "รอบสาย (10:00 น.)",
      theme: "เลขเด็ดปฏิทินจีน & เลขเซียมซีมงคลวัดดังรอบสาย สถิติเลขมังกรโชคลาภ",
      angle: "เน้นการถอดรหัสเลขจากปฏิทินจีนโบราณ การเทียบเคียงพลังนักษัตรประจำวัน และเลขเซียมซีมงคล",
    },
    noon: {
      name: "รอบเที่ยง (12:00 น.)",
      theme: "วิเคราะห์สถิติหวย & แนวทางเลขวิ่งบน-ล่าง เจาะลึกเลข 2 ตัว 3 ตัวรอบเที่ยง",
      angle: "เน้นมุมมองเชิงสถิติศาสตร์ เลขออกซ้ำ เลขวิ่งบน-วิ่งล่าง ความน่าจะเป็นของคู่ตัวเลขเด่น",
    },
    afternoon: {
      name: "รอบบ่าย (15:00 น.)",
      theme: "เลขเด่นสำนักดัง & ปริศนาตัวเลขเริงสาร ถอดรหัสตัวเลขนำโชคช่วงบ่าย",
      angle: "เน้นการตีความปริศนาตัวเลข คำกลอนมงคล กระแสเลขเด็ดจากสำนักดัง และการจับคู่เลขธาตุสัมพันธ์",
    },
    evening: {
      name: "รอบเย็น (18:00 น.)",
      theme: "สรุปเลขเด็ดโค้งสุดท้ายยามเย็น เลขนำโชคจากความฝันยอดนิยม เคล็ดลับเสริมดวงก่อนค่ำ",
      angle: "เน้นการรวบรวมเลขเด่นโค้งสุดท้าย การทำนายตัวเลขจากหมวดความฝันยอดฮิต และข้อคิดเตือนสติการเงิน",
    },
  }[slot];

  return `
คุณคือนักเขียนบทความโหราศาสตร์และเลขศาสตร์มืออาชีพของเว็บไซต์ Likhitfa (ลิขิตฟ้า)
กรุณาเขียนบทความ "เลขเด็ด" ประจำ ${thaiDate} สำหรับ ${slotConfig.name}
ธีมหลักประจำรอบ: ${slotConfig.theme}
มุมมองเนื้อหาเฉพาะรอบ: ${slotConfig.angle}

กฎเหล็กป้องกันเนื้อหาซ้ำซ้อน (Anti-Duplication Rules):
1. ห้ามใช้ตัวเลขและหัวข้อซ้ำกับรอบอื่นเด็ดขาด! ตัวเลขที่แนะนำในรอบนี้ต้องถูกคิดค้นขึ้นใหม่ให้เข้ากับธีม "${slotConfig.name}" โดยเฉพาะ
2. เนื้อหาต้องไม่ซ้ำรูปแบบเดิม สำนวนภาษาไทยไพเราะ สละสลวย อ่านง่าย ดึงดูด น่าเชื่อถือ
3. มีการจัดหมวดหมู่ตัวเลขชัดเจน เช่น เลขเด่น, เลขท้าย 2 ตัวตรง, เลขชุด 3 ตัวตรง-โต๊ด
4. มีข้อคิดเตือนสติการเสี่ยงโชคอย่างพอดีและมีสติทุกครั้ง ไม่การันตีผลรางวัล 100%
5. ตอบกลับเป็น JSON Object เท่านั้น ตามรูปแบบนี้:
{
  "title": "หัวข้อบทความที่ดึงดูดใจและตรงตามหลัก SEO (ความยาว 50-80 ตัวอักษร มีวันที่และรอบเวลา)",
  "excerpt": "สรุปสั้นๆ สำหรับแสดงตัวอย่าง (ความยาว 120-160 ตัวอักษร)",
  "seoTitle": "Title สำหรับ Google SEO (ไม่เกิน 65 ตัวอักษร)",
  "seoDescription": "Meta description สำหรับ Google SEO (ไม่เกิน 155 ตัวอักษร)",
  "keywords": ["คำค้นหาหลัก 5-8 คำ เช่น เลขเด็ด, หวยงวดนี้, เลขมงคล..."],
  "content": [
    "ย่อหน้าที่ 1: บทนำและภาพรวมพลังตัวเลขประจำรอบ...",
    "ย่อหน้าที่ 2: ### หัวข้อย่อยเจาะลึกเลขเด่นประจำรอบ...",
    "ย่อหน้าที่ 3: รายละเอียดการจับคู่ตัวเลข 2 ตัว และ 3 ตัว...",
    "ย่อหน้าที่ 4: ทิศทางพลังงานเสริมมงคล หรือเคล็ดลับเฉพาะรอบ...",
    "ย่อหน้าที่ 5: ข้อคิดเตือนสติการเสี่ยงโชคอย่างมีวินัย"
  ]
}
`.trim();
}

export async function generateLuckyNumberArticle(
  options: AutoArticleOptions = {},
): Promise<GeneratedArticleResult> {
  const slot = resolveSlot(options.slot);
  const dateStr = options.targetDate || getBangkokDateString();
  const slug = `lek-ded-${slot}-${dateStr}`;

  // Check if article already exists unless force = true
  if (!options.force) {
    const existing = await supabaseRequest(`articles?slug=eq.${encodeURIComponent(slug)}&select=slug,title`);
    if (existing && existing.ok) {
      const rows = await existing.json().catch(() => []);
      if (Array.isArray(rows) && rows.length > 0) {
        return {
          ok: true,
          action: "skipped",
          slug,
          slot,
          date: dateStr,
          mode: "gemini",
          title: rows[0].title || slug,
        };
      }
    }
  }

  // Check Gemini API key
  const apiKey =
    options.apiKey ||
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_AI_KEY ||
    process.env.VITE_GEMINI_API_KEY;

  let payload: ArticlePayload | null = null;
  let mode: "gemini" | "fallback" = "fallback";

  if (apiKey) {
    const prompt = buildGeminiPrompt(slot, dateStr);
    payload = await callGemini(prompt, apiKey);
    if (payload) {
      mode = "gemini";
    }
  }

  if (!payload) {
    payload = buildFallbackArticle(slot, dateStr);
    mode = "fallback";
  }

  const covers = COVER_IMAGES[slot] || COVER_IMAGES.morning;
  const dayIndex = Number.parseInt(dateStr.slice(-2), 10) || 0;
  const cover = covers[dayIndex % covers.length];

  const fullArticle = {
    slug,
    title: payload.title,
    excerpt: payload.excerpt,
    category: "เลขเด็ด",
    author: "ทีมงาน Likhitfa เลขเด็ด",
    date: dateStr,
    read_min: 3,
    cover,
    cover_alt: payload.title,
    seo_title: payload.seoTitle || payload.title,
    seo_description: payload.seoDescription || payload.excerpt,
    keywords: payload.keywords || ["เลขเด็ด", "หวยงวดนี้", "เลขมงคล"],
    content: payload.content,
    canonical_url: `https://www.likhitfa.online/articles/${slug}`,
    updated_at: new Date().toISOString(),
  };

  const config = getSupabaseConfig();
  if (!config) {
    throw new Error("ยังไม่ได้ตั้งค่า SUPABASE_URL และ SUPABASE_SERVICE_ROLE_KEY บน server");
  }

  const saveResponse = await supabaseRequest("articles?on_conflict=slug", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify(fullArticle),
  });

  if (!saveResponse || !saveResponse.ok) {
    const detail = saveResponse ? await saveResponse.text().catch(() => "") : "network error";
    throw new Error(`บันทึกบทความลง Supabase ไม่สำเร็จ: ${detail}`);
  }

  return {
    ok: true,
    action: options.force ? "updated" : "created",
    slug,
    slot,
    date: dateStr,
    mode,
    title: fullArticle.title,
  };
}
