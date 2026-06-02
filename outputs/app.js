const stems = [
  { han: "甲", th: "เจี่ย", element: "ไม้", polarity: "+", className: "wood", quote: "เหมือนต้นไม้ใหญ่ที่ยืนหยัด เติบโตช้าแต่มั่นคง" },
  { han: "乙", th: "อี่", element: "ไม้", polarity: "-", className: "wood", quote: "เหมือนเถาวัลย์อ่อนโยน ปรับตัวเก่งและเชื่อมผู้คน" },
  { han: "丙", th: "ปิ่ง", element: "ไฟ", polarity: "+", className: "fire", quote: "เจิดจ้าดั่งดวงอาทิตย์ ให้ความอบอุ่นและแรงบันดาลใจ" },
  { han: "丁", th: "ติง", element: "ไฟ", polarity: "-", className: "fire", quote: "เหมือนเปลวเทียนที่ละเอียดอ่อน ส่องสว่างในจังหวะที่พอดี" },
  { han: "戊", th: "อู่", element: "ดิน", polarity: "+", className: "earth", quote: "เหมือนภูเขาที่หนักแน่น เป็นที่พึ่งและรับแรงกดดันได้ดี" },
  { han: "己", th: "จี่", element: "ดิน", polarity: "-", className: "earth", quote: "เหมือนผืนดินเพาะปลูก เข้าใจรายละเอียดและเลี้ยงดูสิ่งต่าง ๆ" },
  { han: "庚", th: "เกิง", element: "ทอง", polarity: "+", className: "metal", quote: "เหมือนเหล็กกล้า ตรง ชัด และพร้อมตัดสินใจ" },
  { han: "辛", th: "ซิน", element: "ทอง", polarity: "-", className: "metal", quote: "เหมือนอัญมณี มีรสนิยม ละเอียด และต้องการการขัดเกลา" },
  { han: "壬", th: "เหริน", element: "น้ำ", polarity: "+", className: "water", quote: "เหมือนมหาสมุทร มองไกล ไหลลึก และคิดเป็นระบบใหญ่" },
  { han: "癸", th: "กุ่ย", element: "น้ำ", polarity: "-", className: "water", quote: "เหมือนสายฝน อ่อนไหว เฉียบคม และซึมซับข้อมูลเก่ง" },
];

const branches = [
  { han: "子", th: "ชวด", animal: "หนู", element: "น้ำ", className: "water", hidden: [9] },
  { han: "丑", th: "ฉลู", animal: "วัว", element: "ดิน", className: "earth", hidden: [5, 9, 7] },
  { han: "寅", th: "ขาล", animal: "เสือ", element: "ไม้", className: "wood", hidden: [0, 2, 4] },
  { han: "卯", th: "เถาะ", animal: "กระต่าย", element: "ไม้", className: "wood", hidden: [1] },
  { han: "辰", th: "มะโรง", animal: "มังกร", element: "ดิน", className: "earth", hidden: [4, 1, 9] },
  { han: "巳", th: "มะเส็ง", animal: "งู", element: "ไฟ", className: "fire", hidden: [2, 4, 6] },
  { han: "午", th: "มะเมีย", animal: "ม้า", element: "ไฟ", className: "fire", hidden: [3, 5] },
  { han: "未", th: "มะแม", animal: "แพะ", element: "ดิน", className: "earth", hidden: [5, 3, 1] },
  { han: "申", th: "วอก", animal: "ลิง", element: "ทอง", className: "metal", hidden: [6, 8, 4] },
  { han: "酉", th: "ระกา", animal: "ไก่", element: "ทอง", className: "metal", hidden: [7] },
  { han: "戌", th: "จอ", animal: "สุนัข", element: "ดิน", className: "earth", hidden: [4, 7, 3] },
  { han: "亥", th: "กุน", animal: "หมู", element: "น้ำ", className: "water", hidden: [8, 0] },
];

const elementOrder = ["ไม้", "ไฟ", "ดิน", "ทอง", "น้ำ"];
const elementClass = { "ไม้": "wood", "ไฟ": "fire", "ดิน": "earth", "ทอง": "metal", "น้ำ": "water" };
const elementHan = { "ไม้": "木", "ไฟ": "火", "ดิน": "土", "ทอง": "金", "น้ำ": "水" };
const labels = [
  { key: "hour", th: "時 ยาม" },
  { key: "day", th: "日 วัน" },
  { key: "month", th: "月 เดือน" },
  { key: "year", th: "年 ปี" },
];

const els = {
  appShell: document.querySelector("#appShell"),
  appTitle: document.querySelector("#appTitle"),
  baziTabs: document.querySelector("#baziTabs"),
  profileStatus: document.querySelector("#profileStatus"),
  name: document.querySelector("#name"),
  email: document.querySelector("#email"),
  gender: document.querySelector("#gender"),
  date: document.querySelector("#date"),
  time: document.querySelector("#time"),
  privacyConsent: document.querySelector("#privacyConsent"),
  consentLine: document.querySelector(".consent-line"),
  predictBtn: document.querySelector("#predictBtn"),
  predictionStatus: document.querySelector("#predictionStatus"),
  birthLine: document.querySelector("#birthLine"),
  pillarGrid: document.querySelector("#pillarGrid"),
  dayMasterTitle: document.querySelector("#dayMasterTitle"),
  dayMasterQuote: document.querySelector("#dayMasterQuote"),
  strengthBar: document.querySelector("#strengthBar"),
  strengthText: document.querySelector("#strengthText"),
  todayTitle: document.querySelector("#todayTitle"),
  todaySummary: document.querySelector("#todaySummary"),
  todayScore: document.querySelector("#todayScore"),
  luckyNumbers: document.querySelector("#luckyNumbers"),
  luckyColor: document.querySelector("#luckyColor"),
  luckyTime: document.querySelector("#luckyTime"),
  todayAdvice: document.querySelector("#todayAdvice"),
  insightPanel: document.querySelector("#insightPanel"),
  matrixGrid: document.querySelector("#matrixGrid"),
  luckList: document.querySelector("#luckList"),
  starList: document.querySelector("#starList"),
  calendarTitle: document.querySelector("#calendarTitle"),
  calendarSummary: document.querySelector("#calendarSummary"),
  calendarList: document.querySelector("#calendarList"),
  qimenTitle: document.querySelector("#qimenTitle"),
  qimenSummary: document.querySelector("#qimenSummary"),
  qimenBestScore: document.querySelector("#qimenBestScore"),
  qimenBoard: document.querySelector("#qimenBoard"),
  qimenNote: document.querySelector("#qimenNote"),
  qimenUse: document.querySelector("#qimenUse"),
  oracleTitle: document.querySelector("#oracleTitle"),
  oracleSummary: document.querySelector("#oracleSummary"),
  oracleScore: document.querySelector("#oracleScore"),
  oracleQuestion: document.querySelector("#oracleQuestion"),
  analyzeQuestion: document.querySelector("#analyzeQuestion"),
  analysisState: document.querySelector("#analysisState"),
  oracleMeta: document.querySelector("#oracleMeta"),
  oracleReading: document.querySelector("#oracleReading"),
};

const leadKey = "baziInsightLead";
const directions = ["เหนือ", "ตะวันออกเฉียงเหนือ", "ตะวันออก", "ตะวันออกเฉียงใต้", "ใต้", "ตะวันตกเฉียงใต้", "ตะวันตก", "ตะวันตกเฉียงเหนือ", "กลาง"];
const doors = ["เปิด", "พัก", "เกิด", "บาด", "ปิด", "ตื่น", "ตาย", "กลัว", "ทิวทัศน์"];
const colorByElement = {
  "ไม้": "เขียวมรกต",
  "ไฟ": "แดงอิฐ",
  "ดิน": "เหลืองทอง",
  "ทอง": "ขาวมุก",
  "น้ำ": "น้ำเงินเข้ม",
};
const calendarCategories = {
  work: ["เซ็นเอกสาร", "เปิดตัวงาน", "คุยดีล", "ยื่นข้อเสนอ"],
  love: ["นัดพบ", "ขอคืนดี", "คุยความสัมพันธ์", "ปรับความเข้าใจ"],
  rest: ["ทำบุญ", "จัดโต๊ะทำงาน", "พักใจ", "วางแผนใหม่"],
};
const moduleTitles = {
  bazi: "ปาจื้อ 八字",
  oracle: "คำพยากรณ์ 占断",
  calendar: "ปฏิทินมงคล 吉祥",
  qimen: "ฉีเหมิน 奇门",
};
const stemProfiles = {
  "ไม้": {
    nature: "เติบโตจากการเรียนรู้และการเชื่อมโยงผู้คน",
    career: "เหมาะกับงานวางแผน คอนเทนต์ การศึกษา การตลาด และงานที่ต้องสร้างเครือข่าย",
    stress: "เครียดง่ายเมื่อถูกเร่งให้ตัดสินใจโดยไม่มีข้อมูล",
    remedy: "ใช้พื้นที่สีเขียว จัดลำดับงานเป็นขั้น และเริ่มจากงานเล็กที่เห็นความคืบหน้า",
  },
  "ไฟ": {
    nature: "ขับเคลื่อนด้วยแรงบันดาลใจ การมองเห็น และการสื่อสาร",
    career: "เหมาะกับงานขาย พรีเซนต์ แบรนด์ ครีเอทีฟ สื่อ และบทบาทที่ต้องปลุกพลังทีม",
    stress: "หมดแรงเมื่อให้พลังคนอื่นมากเกินไปโดยไม่พัก",
    remedy: "ลดสิ่งรบกวน ทำงานเป็นรอบสั้น ๆ และเลือกเวลาที่แสง/บรรยากาศช่วยให้ใจเปิด",
  },
  "ดิน": {
    nature: "มั่นคง รับผิดชอบ และเก่งกับการทำสิ่งซับซ้อนให้เป็นระบบ",
    career: "เหมาะกับงานบริหาร โปรเจกต์ อสังหา การเงินหลังบ้าน การดูแลลูกค้า และ operation",
    stress: "แบกเรื่องคนอื่นมากเกินไปจนตัดสินใจช้า",
    remedy: "เขียนขอบเขตให้ชัด แยกเรื่องของตัวเองกับเรื่องที่รับมา และทำ checklist ก่อนรับปาก",
  },
  "ทอง": {
    nature: "ชัด ตรง มีมาตรฐาน และต้องการผลลัพธ์ที่วัดได้",
    career: "เหมาะกับงานกฎหมาย การเงิน วิเคราะห์ คุณภาพ กลยุทธ์ การเจรจา และสินค้าที่ต้องใช้ความน่าเชื่อถือ",
    stress: "กดดันตัวเองเมื่อทุกอย่างยังไม่สมบูรณ์",
    remedy: "ตั้งเกณฑ์พอใช้ได้ก่อน แล้วค่อยปรับให้คมขึ้น อย่ารอ perfect จนพลาดจังหวะ",
  },
  "น้ำ": {
    nature: "คิดลึก เชื่อมข้อมูลเก่ง และอ่านบรรยากาศรอบตัวได้ไว",
    career: "เหมาะกับงานวิจัย ที่ปรึกษา กลยุทธ์ เทคโนโลยี ภาษา งานข้อมูล และงานที่ต้องอ่านคน",
    stress: "คิดวนหรือรับข้อมูลมากจนใจล้า",
    remedy: "จำกัดข้อมูลเข้า เลือกคุยกับคนที่นิ่ง และจดสิ่งที่รู้จริงแยกจากสิ่งที่กังวล",
  },
};
const relationProfiles = {
  "เพื่อนร่วมทาง": "พลังตัวตนเด่น เหมาะยืนจุดยืนของตัวเองและทำสิ่งที่ต้องใช้ความมั่นใจ",
  "แรงแข่งขัน": "มีแรงผลักจากคนรอบตัว ระวังเปรียบเทียบตัวเอง แต่ใช้แรงนี้สร้างวินัยได้ดี",
  "พรสวรรค์": "เหมาะปล่อยผลงาน แสดงทักษะ และทำสิ่งที่สร้างความสุขให้คนอื่น",
  "นักแสดงออก": "คำพูดมีพลัง แต่ต้องระวังตรงเกินไป ใช้กับการขายหรือคอนเทนต์จะดี",
  "รายได้เสริม": "มีจังหวะเห็นช่องทางเงินใหม่ แต่ควรทดสอบเล็กก่อนขยาย",
  "ทรัพย์หลัก": "เหมาะจัดการรายรับ รายจ่าย ราคา และข้อตกลงที่ชัดเจน",
  "แรงกดดัน": "เจอโจทย์ท้าทาย แต่ถ้าคุมจังหวะได้จะกลายเป็นผลงานที่คนเห็น",
  "ระเบียบ": "เหมาะทำเรื่องทางการ เอกสาร กติกา และสิ่งที่ต้องการความน่าเชื่อถือ",
  "ญาณ/กลยุทธ์": "เหมาะศึกษา วางแผน อ่านสัญญาณ และใช้ข้อมูลเงียบ ๆ ก่อนขยับ",
  "ผู้สนับสนุน": "มีพลังผู้ช่วย ความรู้ และคำแนะนำจากคนมีประสบการณ์",
};
let activeCalendarFilter = "all";
let activeOracleTopic = "overall";
let analyzedQuestion = "";
let questionAnalysis = null;
let currentProfile = null;
let predictionMade = false;

function loadCustomBackgrounds() {
  [
    ["--celestial-bg", "./assets/bazi-bg-1.png"],
    ["--identity-bg", "./assets/bazi-bg-2.png"],
  ].forEach(([variable, src]) => {
    const image = new Image();
    image.onload = () => document.documentElement.style.setProperty(variable, `url("${src}")`);
    image.src = src;
  });
}

function mod(n, m) {
  return ((n % m) + m) % m;
}

function daysSinceBase(date) {
  const base = Date.UTC(1900, 0, 31);
  return Math.floor((Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - base) / 86400000);
}

function pillarFromIndex(index) {
  return { stem: stems[mod(index, 10)], branch: branches[mod(index, 12)], index: mod(index, 60) };
}

function indexFromStemBranch(stemIndex, branchIndex) {
  for (let i = 0; i < 60; i += 1) {
    if (mod(i, 10) === stemIndex && mod(i, 12) === branchIndex) return i;
  }
  return mod(stemIndex, 60);
}

function getChart(date, hour) {
  const yearIndex = mod(date.getFullYear() - 4, 60);
  const monthBranch = mod(date.getMonth() + 2, 12);
  const monthStem = mod(mod(yearIndex, 10) * 2 + date.getMonth() + 1, 10);
  const dayIndex = mod(daysSinceBase(date), 60);
  const hourBranch = mod(Math.floor((hour + 1) / 2), 12);
  const hourStem = mod((mod(dayIndex, 10) % 5) * 2 + hourBranch, 10);

  return {
    year: pillarFromIndex(yearIndex),
    month: { stem: stems[monthStem], branch: branches[monthBranch], index: indexFromStemBranch(monthStem, monthBranch) },
    day: pillarFromIndex(dayIndex),
    hour: { stem: stems[hourStem], branch: branches[hourBranch], index: indexFromStemBranch(hourStem, hourBranch) },
  };
}

function relation(dayStem, otherStem) {
  const self = elementOrder.indexOf(dayStem.element);
  const other = elementOrder.indexOf(otherStem.element);
  const samePolarity = dayStem.polarity === otherStem.polarity;
  const delta = mod(other - self, 5);

  if (delta === 0) return samePolarity ? ["比肩", "เพื่อนร่วมทาง", "ตัวตน/เครือข่าย"] : ["劫财", "แรงแข่งขัน", "เพื่อน/คู่แข่ง"];
  if (delta === 1) return samePolarity ? ["食神", "พรสวรรค์", "ความคิดสร้างสรรค์"] : ["伤官", "นักแสดงออก", "การสื่อสาร"];
  if (delta === 2) return samePolarity ? ["偏财", "รายได้เสริม", "โอกาสเงิน"] : ["正财", "ทรัพย์หลัก", "การเงินมั่นคง"];
  if (delta === 3) return samePolarity ? ["七杀", "แรงกดดัน", "เป้าหมายท้าทาย"] : ["正官", "ระเบียบ", "งาน/สถานะ"];
  return samePolarity ? ["偏印", "ญาณ/กลยุทธ์", "การเรียนรู้เฉพาะทาง"] : ["正印", "ผู้สนับสนุน", "ความรู้/ผู้ใหญ่"];
}

function strength(chart) {
  const dayElement = chart.day.stem.element;
  const mother = elementOrder[mod(elementOrder.indexOf(dayElement) - 1, 5)];
  const pillars = [chart.year, chart.month, chart.day, chart.hour];
  let score = 28;
  pillars.forEach((p) => {
    if (p.stem.element === dayElement) score += 10;
    if (p.branch.element === dayElement) score += 12;
    if (p.stem.element === mother) score += 7;
    if (p.branch.element === mother) score += 8;
  });
  if (chart.month.branch.element === dayElement) score += 16;
  if (chart.month.branch.element === mother) score += 10;
  return Math.max(12, Math.min(96, score));
}

function usefulElements(dayElement, score) {
  const i = elementOrder.indexOf(dayElement);
  if (score >= 58) {
    return [elementOrder[mod(i + 1, 5)], elementOrder[mod(i + 2, 5)], elementOrder[mod(i + 3, 5)]];
  }
  return [elementOrder[i], elementOrder[mod(i - 1, 5)], elementOrder[mod(i + 1, 5)]];
}

function scoreLabel(score) {
  if (score >= 84) return "เด่นมาก";
  if (score >= 70) return "ดี";
  if (score >= 56) return "กลาง";
  return "ควรประคอง";
}

function dominantElements(chart) {
  const counts = Object.fromEntries(elementOrder.map((e) => [e, 0]));
  [chart.year, chart.month, chart.day, chart.hour].forEach((p) => {
    counts[p.stem.element] += 1.2;
    counts[p.branch.element] += 1;
    p.branch.hidden.forEach((idx) => {
      counts[stems[idx].element] += 0.35;
    });
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
}

function chartContext(chart, score) {
  const dm = chart.day.stem;
  const useful = usefulElements(dm.element, score);
  const dominant = dominantElements(chart);
  const weak = [...dominant].reverse().slice(0, 2).map(([e]) => e);
  const monthEnergy = chart.month.branch.element;
  return {
    dm,
    useful,
    dominant,
    weak,
    monthEnergy,
    profile: stemProfiles[dm.element],
    strengthLabel: score >= 70 ? "ดวงมีกำลังมาก" : score >= 48 ? "ดวงค่อนข้างสมดุล" : "ดวงต้องการแรงสนับสนุน",
  };
}

function dailyScore(chart, score, today = new Date()) {
  const ctx = chartContext(chart, score);
  const todayPillar = pillarFromIndex(daysSinceBase(today));
  const stemRelation = relation(chart.day.stem, todayPillar.stem);
  const branchMatch = ctx.useful.includes(todayPillar.branch.element);
  const stemMatch = ctx.useful.includes(todayPillar.stem.element);
  const sameBranch = todayPillar.branch.han === chart.day.branch.han;
  const monthSupport = todayPillar.branch.element === chart.month.branch.element;
  const value = Math.min(99, Math.max(38, 48 + (stemMatch ? 15 : 0) + (branchMatch ? 13 : 0) + (sameBranch ? 7 : 0) + (monthSupport ? 5 : 0) + mod(today.getDate() + chart.day.index, 11)));
  return { value, todayPillar, stemRelation, branchMatch, stemMatch, sameBranch, monthSupport };
}

function analyzeQuestionText(rawQuestion) {
  const question = rawQuestion.trim();
  const lower = question.toLowerCase();
  const topicScores = {
    work: /(งาน|โปรเจกต์|โปรเจค|ธุรกิจ|ลูกค้า|สมัคร|ย้ายงาน|ลาออก|เจ้านาย|ทีม|ขาย|คอนเทนต์|เปิดตัว)/.test(lower) ? 3 : 0,
    money: /(เงิน|ลงทุน|รายได้|หนี้|เก็บเงิน|ราคา|ซื้อ|ขาย|กำไร|ขาดทุน|งบ|ค่าใช้จ่าย|โอน)/.test(lower) ? 3 : 0,
    love: /(รัก|แฟน|คนคุย|แต่งงาน|เลิก|คืนดี|สัมพันธ์|เขา|เธอ|คู่)/.test(lower) ? 3 : 0,
    health: /(สุขภาพ|เครียด|นอน|เหนื่อย|ใจ|พัก|ป่วย|กังวล|หมดไฟ)/.test(lower) ? 3 : 0,
    overall: 1,
  };
  const topic = Object.entries(topicScores).sort((a, b) => b[1] - a[1])[0][0];
  const intent = /(ควร|ดีไหม|ได้ไหม|ไหม|มั้ย)/.test(lower)
    ? "decision"
    : /(เมื่อไหร่|ตอนไหน|ช่วงไหน|วันไหน)/.test(lower)
      ? "timing"
      : /(ทำยังไง|อย่างไร|แก้|ปรับ|เริ่ม)/.test(lower)
        ? "advice"
        : "insight";
  const urgency = /(ด่วน|วันนี้|ตอนนี้|ทันที|เร็ว)/.test(lower) ? "เร่งด่วน" : /(เดือนนี้|สัปดาห์นี้|ปีนี้|เร็วๆ)/.test(lower) ? "ระยะใกล้" : "ทั่วไป";
  const polarity = /(เลิก|ออก|หยุด|ขายทิ้ง|ยกเลิก|ปฏิเสธ)/.test(lower) ? "release" : /(เริ่ม|ลงทุน|ซื้อ|สมัคร|เปิด|คุย|ไปต่อ)/.test(lower) ? "start" : "neutral";
  const clarity = question.length >= 12 ? "ชัดเจน" : "กว้าง";
  return { question, topic, intent, urgency, polarity, clarity };
}

function topicFromAnalysis(analysis) {
  return analysis?.topic && analysis.topic !== "overall" ? analysis.topic : activeOracleTopic;
}

function todayReading(chart, score, today = new Date()) {
  const ctx = chartContext(chart, score);
  const daily = dailyScore(chart, score, today);
  const todayPillar = daily.todayPillar;
  const dayScore = daily.value;
  const relationName = daily.stemRelation[1];
  const usefulText = ctx.useful.map((e) => `${elementHan[e]} ${e}`).join(" / ");
  const seed = daysSinceBase(today) + chart.day.index;
  const lucky = [mod(seed + score, 10), mod(seed + chart.month.index, 10), mod(seed + chart.hour.index + ctx.useful.length, 10)].join(" · ");
  const startHour = mod(seed, 12) * 2;
  const luckyTime = `${String(startHour).padStart(2, "0")}:00-${String(mod(startHour + 2, 24)).padStart(2, "0")}:00`;
  const relationInsight = relationProfiles[relationName] || daily.stemRelation[2];
  const opening = dayScore >= 82 ? "จังหวะเปิดชัด" : dayScore >= 68 ? "จังหวะค่อย ๆ ขยับ" : "จังหวะต้องประคอง";

  return {
    todayPillar,
    dayScore,
    lucky,
    luckyTime,
    luckyColor: colorByElement[ctx.useful[0]],
    title: `${todayPillar.stem.han}${todayPillar.branch.han} · ${opening}`,
    summary: dayScore >= 82
      ? `วันนี้ธาตุของวันหนุน ${els.name.value.trim() || "คุณ"} โดยตรง (${usefulText}) เหมาะเปิดเรื่องสำคัญ นัดคุย หรือปล่อยงานที่ต้องการแรงตอบรับ`
      : dayScore >= 68
        ? `วันนี้พลังใช้งานได้ดีแต่ต้องเลือกจังหวะ ความสัมพันธ์ของวันคือ “${relationName}” จึงเหมาะทำเรื่องที่ต้องใช้ความนิ่งและการวางแผน`
        : `วันนี้ธาตุยังไม่หนุนเต็มที่ ใช้วันเพื่อจัดระบบ เก็บข้อมูล และลดภาระที่ไม่จำเป็น จะได้ผลจริงกว่าการเร่งปิดทุกเรื่อง`,
    advice: [
      ["งาน", dayScore >= 75 ? "เริ่มจากงานที่วัดผลได้ ส่งข้อเสนอ หรือคุยกับคนที่มีอำนาจตัดสินใจ" : "เก็บ requirement ให้ครบ แยกงานด่วนกับงานสำคัญ และเลี่ยงประชุมที่ไม่มีข้อสรุป"],
      ["เงิน", ctx.useful.includes("ทอง") ? "เหมาะทบทวนราคา ติดตามยอดค้าง หรือทำข้อเสนอที่มีตัวเลขชัด" : "ตรวจรายจ่ายซ้ำซ้อนและชะลอการซื้อของที่เกิดจากอารมณ์"],
      ["ความรัก", ctx.useful.includes("น้ำ") ? "คุยด้วยเหตุผลและความอ่อนโยน จะคลี่คลายเรื่องค้างใจได้ง่าย" : "ฟังให้จบก่อนตอบ อย่ารีบแปลเจตนาของอีกฝ่าย"],
      ["ควรเลี่ยง", dayScore >= 75 ? "รับปากเร็วเกินไป เพราะโอกาสเข้ามาพร้อมภาระ" : "ตัดสินใจตอนหงุดหงิดหรือเหนื่อย"],
    ],
    insight: `${relationInsight} ภาพรวมดวงคือ ${ctx.strengthLabel} ธาตุเด่นคือ ${ctx.dominant.slice(0, 2).map(([e]) => e).join(" / ")} และธาตุที่ควรเติมคือ ${ctx.useful.join(" / ")}`,
  };
}

function oracleReading(chart, score, date) {
  const ctx = chartContext(chart, score);
  const dm = ctx.dm;
  const useful = ctx.useful;
  const today = todayReading(chart, score, new Date());
  const liveQuestion = els.oracleQuestion.value.trim();
  const question = analyzedQuestion || liveQuestion;
  const analysis = questionAnalysis || (question ? analyzeQuestionText(question) : null);
  const topicMap = {
    overall: {
      label: "ภาพรวม",
      title: "ช่วงนี้ควรจัดลำดับชีวิตใหม่",
      high: "พลังวันนี้ช่วยให้คุณมองเห็นจังหวะสำคัญ เหมาะตัดสินใจเรื่องที่ค้างมานาน",
      low: "พลังวันนี้เหมาะกับการตั้งหลักมากกว่าการเร่งผลลัพธ์ อย่ากดดันตัวเองเกินไป",
      focus: "เลือก 1 เรื่องหลักแล้วทำให้จบ",
      avoid: "เปิดหลายเรื่องพร้อมกันจนพลังแตก",
    },
    work: {
      label: "งาน",
      title: "งานเด่นจากการสื่อสารและการวางระบบ",
      high: "มีเกณฑ์ได้รับโอกาสจากคนที่เห็นศักยภาพของคุณ เหมาะเสนอไอเดียหรือเปิดโปรเจกต์",
      low: "งานยังไปได้ แต่ต้องระวังรายละเอียดหลุด โดยเฉพาะการนัดหมายและข้อความสำคัญ",
      focus: "ทำเอกสาร ข้อเสนอ และเป้าหมายให้ชัด",
      avoid: "รับงานเพราะเกรงใจโดยไม่ตกลงขอบเขต",
    },
    money: {
      label: "เงิน",
      title: "เงินมาจากสิ่งที่จับต้องได้และวัดผลได้",
      high: "เหมาะตั้งราคา ติดตามเงิน หรือเสนอแพ็กเกจใหม่ ลูกค้ามีแนวโน้มตอบรับถ้าข้อเสนอชัด",
      low: "ควรเน้นอุดรอยรั่วทางการเงินก่อนลงทุนเพิ่ม รายจ่ายเล็ก ๆ จะรวมเป็นก้อนใหญ่ได้",
      focus: "แยกเงินจำเป็น เงินลงทุน และเงินตามใจ",
      avoid: "ซื้อของเพื่อปลอบใจหรือรีบโอนเพราะกลัวพลาด",
    },
    love: {
      label: "ความรัก",
      title: "ความสัมพันธ์ต้องการพื้นที่ที่พูดกันตรงแต่ไม่แข็ง",
      high: "เหมาะเปิดใจ นัดคุย หรือเริ่มบทสนทนาที่อยากให้ชัดเจนมานาน",
      low: "ยังไม่ควรบีบเอาคำตอบทันที ฟังอีกฝ่ายให้ครบก่อนสรุป",
      focus: "ถามความรู้สึกจริงด้วยน้ำเสียงอ่อนโยน",
      avoid: "ประชด เงียบใส่ หรือรื้อเรื่องเก่าตอนอารมณ์ขึ้น",
    },
    health: {
      label: "สุขภาพใจ",
      title: "ร่างกายต้องการจังหวะที่สม่ำเสมอ",
      high: "เหมาะเริ่ม routine เล็ก ๆ เช่น นอนให้ตรงเวลา เดินเบา ๆ หรือจัดมุมทำงานใหม่",
      low: "พลังใจอาจแกว่งง่าย ควรลดสิ่งกระตุ้นและอย่าเอาตัวเองไปเทียบใคร",
      focus: "พักสายตา ดื่มน้ำ และทำสิ่งที่ทำให้ใจนิ่ง",
      avoid: "นอนดึกเพราะคิดวนหรือรับข้อมูลเยอะเกินไป",
    },
  };
  const inferredTopic = topicFromAnalysis(analysis);
  const topic = topicMap[inferredTopic] || topicMap[activeOracleTopic];
  const topicBoost = {
    overall: useful.includes(dm.element) ? 4 : 0,
    work: useful.includes("น้ำ") || useful.includes("ไม้") ? 7 : 0,
    money: useful.includes("ทอง") || useful.includes("ดิน") ? 9 : 0,
    love: useful.includes("น้ำ") || useful.includes("ไฟ") ? 8 : 0,
    health: useful.includes("ไม้") || useful.includes("น้ำ") ? 6 : 0,
  };
  const seed = chart.day.index + chart.month.index + today.dayScore + inferredTopic.length + (analysis?.question.length || 0);
  const intentBoost = analysis?.intent === "timing" ? 4 : analysis?.intent === "decision" ? 2 : analysis?.intent === "advice" ? 3 : 0;
  const urgencyPenalty = analysis?.urgency === "เร่งด่วน" && today.dayScore < 70 ? -7 : 0;
  const topicScore = Math.min(99, Math.max(38, today.dayScore + topicBoost[inferredTopic] + intentBoost + urgencyPenalty + mod(seed, 9) - 5));
  const tone = topicScore >= 72 ? topic.high : topic.low;
  const decisive = analysis?.intent === "decision";
  const timingAnswer = topicScore >= 72 ? `ช่วงที่เหมาะคือ ${today.luckyTime} หรือวันที่คะแนนปฏิทินมงคลเกิน 70` : `ยังไม่ใช่จังหวะรีบ ให้ใช้ ${today.luckyTime} เพื่อวางแผน ไม่ใช่ตัดสินใจสุดท้าย`;
  const adviceAnswer = topicScore >= 72 ? "เริ่มจากขั้นตอนเล็กที่พิสูจน์ผลได้ภายใน 3 วัน แล้วค่อยขยาย" : "ลดความเสี่ยงก่อน ทำ checklist และขอข้อมูลเพิ่มหนึ่งชุดก่อนลงมือ";
  const decisionAnswer = topicScore >= 78
    ? "คำตอบคือไปต่อได้ แต่ต้องกำหนดขอบเขต งบ เวลา และตัวชี้วัดให้ชัดก่อน"
    : topicScore >= 62
      ? "คำตอบคือไปต่อแบบทดลองเล็ก ๆ ก่อน ยังไม่ควรลงเต็มแรงหรือผูกมัดยาว"
      : "คำตอบคือรอก่อนหรือชะลอไว้ จังหวะตอนนี้เหมาะกับการเก็บข้อมูลมากกว่าตัดสินใจ";
  const questionMode = analysis?.intent === "timing" ? timingAnswer : analysis?.intent === "advice" ? adviceAnswer : decisionAnswer;
  const answer = question
    ? `คำถาม “${question}” ถูกจัดเป็นเรื่อง${topic.label} / เจตนา${analysis.intent === "decision" ? "ตัดสินใจ" : analysis.intent === "timing" ? "ถามจังหวะเวลา" : analysis.intent === "advice" ? "ขอคำแนะนำ" : "อ่านแนวโน้ม"} / ความเร่ง ${analysis.urgency}: ${decisive ? questionMode : questionMode}`
    : "พิมพ์คำถามแล้วกด “วิเคราะห์คำถาม” ระบบจะแยกหัวข้อและเจตนาก่อนสร้างคำตอบเฉพาะคำถาม";
  const timeline = [
    ["วันนี้", topicScore >= 72 ? "เริ่มจาก action ที่วัดผลได้หนึ่งอย่าง" : "เก็บข้อมูลและลดความคาดหวังที่ไม่จำเป็น"],
    ["3 วัน", useful.includes("ดิน") ? "เห็นความคืบหน้าจากสิ่งที่มีโครงสร้างชัด" : "มีบทสนทนาหรือข้อมูลใหม่ช่วยให้ตัดสินใจง่ายขึ้น"],
    ["7 วัน", topicScore >= 72 ? "มีโอกาสปิดเรื่องหรือได้คำตอบที่รอ ถ้าตามต่อเนื่อง" : "จังหวะจะชัดขึ้นหลังตัดเรื่องรบกวนออก"],
  ];

  return { topic, topicScore, tone, answer, today, useful, timeline, dm, date, ctx, analysis };
}

function getProfile() {
  return {
    id: currentProfile?.id || (crypto.randomUUID ? crypto.randomUUID() : `lead-${Date.now()}-${Math.random().toString(16).slice(2)}`),
    name: els.name.value.trim() || "ผู้มาเยือน",
    email: els.email.value.trim().toLowerCase(),
    gender: els.gender.value,
    birthDate: els.date.value,
    birthTime: els.time.value,
    source: "promo-preview",
    updatedAt: new Date().toISOString(),
  };
}

function loadLead() {
  try {
    return JSON.parse(localStorage.getItem(leadKey));
  } catch {
    return null;
  }
}

async function saveLead(reason = "update") {
  currentProfile = { ...getProfile(), reason };
  localStorage.setItem(leadKey, JSON.stringify(currentProfile));
  if (els.predictionStatus) {
    els.predictionStatus.textContent = "กำลังบันทึกข้อมูลและคำนวณคำทำนาย...";
  }
  try {
    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(currentProfile),
    });
    if (!response.ok) throw new Error("Lead API failed");
    if (els.predictionStatus) els.predictionStatus.textContent = "บันทึกข้อมูลแล้ว แสดงคำทำนายล่าสุดเรียบร้อย";
  } catch {
    if (els.predictionStatus) els.predictionStatus.textContent = "ยังไม่ได้เชื่อมฐานข้อมูล จึงบันทึกไว้ในเบราว์เซอร์และแสดงคำทำนายให้ก่อน";
  }
  return currentProfile;
}

function renderLockedPreview(message = "กรอกข้อมูลให้ครบ แล้วกด “คำนายดวง” เพื่อแสดงผล") {
  const today = new Date();
  els.profileStatus.textContent = "ยังไม่ได้ประมวลผลดวง · กรอกชื่อ อีเมล เพศ วันเกิด และเวลาเกิด แล้วกดคำนายดวง";
  els.birthLine.textContent = "รอข้อมูลเกิด";
  els.todayTitle.textContent = "พร้อมเปิดคำทำนายส่วนตัว";
  els.todaySummary.textContent = "ด้านล่างคือโครงผลวิเคราะห์ที่จะได้รับ หลังกรอกข้อมูลและกดคำนาย ระบบจะแปลงวันเวลาเกิดเป็นดวงปาจื้อและอ่านร่วมกับพลังของวันนี้";
  els.todayScore.textContent = "--";
  els.luckyNumbers.textContent = "รอคำนาย";
  els.luckyColor.textContent = "รอคำนาย";
  els.luckyTime.textContent = "รอคำนาย";
  els.todayAdvice.innerHTML = [
    ["งาน", "แสดงคำแนะนำจาก Day Master และธาตุให้คุณ"],
    ["เงิน", "ดูจังหวะรายรับ รายจ่าย และเลขที่ช่วยเปิดทาง"],
    ["ความรัก", "อ่านวิธีสื่อสารและจังหวะคุยเรื่องสำคัญ"],
    ["ควรเลี่ยง", "เตือนพฤติกรรมหรือช่วงเวลาที่พลังยังไม่หนุน"],
  ].map(([title, text]) => `
    <article class="advice-card placeholder-card">
      <span>${title}</span>
      <strong>${text}</strong>
    </article>
  `).join("");
  els.insightPanel.innerHTML = `
    <span>สถานะระบบ</span>
    <strong>${message}</strong>
    <small>ข้อมูลจะถูกบันทึกเมื่อกดคำนายดวงเท่านั้น ไม่มีการเก็บจากการพิมพ์เฉย ๆ</small>
  `;
  els.pillarGrid.innerHTML = labels.map(({ th }) => `
    <article class="pillar placeholder-card">
      <div class="pillar-label">${th}</div>
      <div class="god">รอคำนวณ<br>สิบเทพ</div>
      <div class="stem">
        <span class="han">--</span>
        <span class="thai">ก้านฟ้า</span>
        <span class="chip earth">รอข้อมูล</span>
      </div>
      <div class="branch">
        <span class="han">--</span>
        <span class="thai">กิ่งดิน<br>นักษัตร</span>
        <span class="chip water">รอข้อมูล</span>
      </div>
      <div class="hidden-stems"><span>ธาตุแฝงจะแสดงหลังคำนาย</span></div>
    </article>
  `).join("");
  els.dayMasterTitle.textContent = "รอวันเกิดและเวลาเกิด";
  els.dayMasterQuote.textContent = "ระบบจะคำนวณ Day Master ธาตุประจำตัว และความแข็งแรงของดวงหลังจากกดคำนายดวง";
  els.strengthBar.style.width = "0%";
  els.strengthText.textContent = "ยังไม่ได้คำนวณคะแนนธาตุ";
  els.matrixGrid.innerHTML = [
    ["บุคลิกภาพหลัก", "วิเคราะห์จาก Day Master"],
    ["ธาตุให้คุณ", "เลือกจากสมดุลธาตุในดวง"],
    ["งานที่ส่งเสริม", "แนะนำจากธาตุเด่นและดาวสิบเทพ"],
    ["คำแนะนำ", "สรุปเป็น action ที่ทำได้จริง"],
  ].map(([title, text]) => `<div class="metric placeholder-card"><span>${title}</span><strong>${text}</strong></div>`).join("");
  els.luckList.innerHTML = Array.from({ length: 3 }, (_, i) => `
    <div class="luck-item placeholder-card">
      <span>ช่วงวัยจรที่ ${i + 1}</span>
      <strong>รอคำนวณเสาโชควัยจร</strong>
      <span>ระบบต้องใช้เพศ ปีเกิด และเดือนเกิดเพื่อจัดรอบพลัง</span>
    </div>
  `).join("");
  els.starList.innerHTML = ["ตัวตน", "ผลงาน", "ทรัพย์", "งาน/สถานะ"].map((title) => `
    <div class="star-item placeholder-card">
      <span>ดาวสิบเทพ</span>
      <strong>${title}</strong>
      <span>จะแสดงจำนวนและความหมายหลังคำนาย</span>
    </div>
  `).join("");
  els.calendarTitle.textContent = "ปฏิทินมงคลส่วนตัว";
  els.calendarSummary.textContent = "หลังคำนาย ระบบจะจัดอันดับ 14 วันถัดไปจากวันนี้ ไม่ย้อนกลับไปเดือนอื่น";
  els.calendarList.innerHTML = Array.from({ length: 4 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    return `
      <article class="calendar-item placeholder-card">
        <div>
          <strong>${date.toLocaleDateString("th-TH", { day: "numeric", month: "short" })}</strong>
          <span>${date.toLocaleDateString("th-TH", { weekday: "short" })}</span>
        </div>
        <div>
          <strong>รอจับคู่กับธาตุให้คุณ</strong>
          <span>กรอกข้อมูลเกิดเพื่อให้ระบบจัดวันเหมาะกับงาน เงิน ความรัก หรือพัก/แก้เคล็ด</span>
          <div class="calendar-tags"><small>รอคำนาย</small><small>14 วันถัดไป</small></div>
        </div>
        <div class="score"><b>--</b><small>รอ</small></div>
      </article>
    `;
  }).join("");
  els.qimenTitle.textContent = "ฉีเหมินรายยาม";
  els.qimenSummary.textContent = "เมื่อมีข้อมูลเกิด ระบบจะเลือกทิศที่เหมาะกับจังหวะเริ่มงาน คุยเรื่องสำคัญ หรือเดินทาง";
  els.qimenBestScore.textContent = "--";
  els.qimenBoard.innerHTML = directions.map((direction) => `
    <article class="qimen-cell placeholder-card">
      <span>${direction}</span>
      <strong>--门</strong>
      <span>รอประมวลผล</span>
      <small>รอคำนาย</small>
    </article>
  `).join("");
  els.qimenNote.innerHTML = "<strong>รอข้อมูลเกิด</strong><br>กดคำนายดวงเพื่อให้ระบบเลือกทิศแนะนำรายยาม";
  els.qimenUse.innerHTML = ["งาน/ขาย", "ความรัก", "การเงิน", "แก้เคล็ด"].map((title) => `
    <article class="use-card placeholder-card">
      <span>${title}</span>
      <strong>คำแนะนำจะเปลี่ยนตามดวงและทิศเด่น</strong>
    </article>
  `).join("");
  els.oracleTitle.textContent = "ถามคำถาม แล้วให้ระบบอ่านร่วมกับดวง";
  els.oracleSummary.textContent = "คำตอบจะเปลี่ยนตามหัวข้อ คำถาม วันเกิด เวลาเกิด และพลังประจำวัน";
  els.oracleScore.textContent = "--";
  els.oracleMeta.textContent = "รอข้อมูลเกิด";
  els.analysisState.textContent = "กรอกข้อมูลเกิดและกดคำนายดวงก่อน จากนั้นพิมพ์คำถามเพื่อวิเคราะห์คำตอบเฉพาะเรื่อง";
  els.oracleReading.innerHTML = `
    <article class="oracle-main">
      <span class="pending-badge">รอคำนาย</span>
      <h3>ยังไม่เปิดผลคำพยากรณ์</h3>
      <p>เมื่อผู้ใช้กดคำนาย ระบบจะใช้ดวงเกิดจริงเป็นฐาน แล้วคำตอบจะเปลี่ยนตามคำถาม เช่น งาน เงิน ความรัก หรือเรื่องที่ค้างใจ</p>
    </article>
    <div class="oracle-grid">
      ${["คำตอบจากคำถาม", "ควรโฟกัส", "ควรเลี่ยง", "เคล็ดเสริม"].map((title) => `
        <article class="oracle-card placeholder-card">
          <span>${title}</span>
          <strong>รอประมวลผลหลังกรอกข้อมูลและกดคำนาย</strong>
        </article>
      `).join("")}
    </div>
  `;
}

function lockResults(message = "กรอกข้อมูลให้ครบ แล้วกด “คำนายดวง” เพื่อแสดงผล") {
  predictionMade = false;
  els.appShell.classList.add("is-locked");
  els.predictionStatus.textContent = message;
  renderLockedPreview(message);
}

function unlockResults() {
  predictionMade = true;
  els.appShell.classList.remove("is-locked");
}

async function requestPrediction(reason = "prediction-request") {
  const name = els.name.value.trim();
  const email = els.email.value.trim();
  const gender = els.gender.value;
  const date = els.date.value;
  const time = els.time.value;
  if (!name || name === "ผู้มาเยือน") {
    els.predictionStatus.textContent = "กรุณากรอกชื่อก่อนคำนาย";
    els.name.focus();
    return;
  }
  if (!email || !email.includes("@")) {
    els.predictionStatus.textContent = "กรุณากรอกอีเมลให้ถูกต้องก่อนคำนาย";
    els.email.focus();
    return;
  }
  if (!gender) {
    els.predictionStatus.textContent = "กรุณาเลือกเพศก่อนคำนาย";
    els.gender.focus();
    return;
  }
  if (!date) {
    els.predictionStatus.textContent = "กรุณาเลือกวันเกิดก่อนคำนาย";
    els.date.focus();
    return;
  }
  if (!time) {
    els.predictionStatus.textContent = "กรุณาเลือกเวลาเกิดก่อนคำนาย";
    els.time.focus();
    return;
  }
  if (!els.privacyConsent.checked) {
    els.predictionStatus.textContent = "กรุณาติ๊กยินยอมก่อนคำนาย เพื่อให้ระบบใช้ข้อมูลนี้คำนวณและบันทึกผลอ่านให้คุณ";
    els.consentLine.classList.add("is-attention");
    els.privacyConsent.focus();
    return;
  }
  unlockResults();
  update();
  await saveLead(reason);
}

function renderPillars(chart) {
  els.pillarGrid.innerHTML = labels.map(({ key, th }) => {
    const p = chart[key];
    const topGod = key === "day" ? ["日元", "วันเกิด"] : relation(chart.day.stem, p.stem);
    return `
      <article class="pillar">
        <div class="pillar-label">${th}</div>
        <div class="god">${topGod[0]}<br>${topGod[1]}</div>
        <div class="stem">
          <span class="han">${p.stem.han}</span>
          <span class="thai">${p.stem.th}</span>
          <span class="chip ${p.stem.className}">${elementHan[p.stem.element]} ${p.stem.element}${p.stem.polarity}</span>
        </div>
        <div class="branch">
          <span class="han">${p.branch.han}</span>
          <span class="thai">${p.branch.th}<br>${p.branch.animal}</span>
          <span class="chip ${p.branch.className}">${elementHan[p.branch.element]} ${p.branch.element}</span>
        </div>
        <div class="hidden-stems">
          ${p.branch.hidden.map((idx) => {
            const s = stems[idx];
            const r = relation(chart.day.stem, s);
            return `<span>${s.han} ${s.th} <small>${r[0]}</small></span>`;
          }).join("")}
        </div>
      </article>
    `;
  }).join("");
}

function renderMatrix(chart, score) {
  const dm = chart.day.stem;
  const ctx = chartContext(chart, score);
  const useful = usefulElements(dm.element, score);
  const wealth = elementOrder[mod(elementOrder.indexOf(dm.element) + 2, 5)];
  const officer = elementOrder[mod(elementOrder.indexOf(dm.element) + 3, 5)];
  const output = elementOrder[mod(elementOrder.indexOf(dm.element) + 1, 5)];
  const personality = score >= 70 ? "พลังสูง ชอบนำเกม" : score >= 45 ? "สมดุล ปรับตัวได้" : "ละเอียดอ่อน ต้องการแรงหนุน";
  const metrics = [
    ["บุคลิกภาพหลัก", `${personality} · ${ctx.profile.nature}`],
    ["ธาตุให้คุณ", useful.map((e) => `${elementHan[e]} ${e}`).join(" / ")],
    ["ธาตุโชคลาภ", `${elementHan[wealth]} ${wealth}`],
    ["ธาตุงานและวินัย", `${elementHan[officer]} ${officer}`],
    ["งานที่ส่งเสริม", ctx.profile.career],
    ["คำแนะนำ", score >= 58 ? `${ctx.profile.remedy} ใช้พลังให้เกิดผลงานจริง ลดการฝืนควบคุมทุกอย่าง` : `${ctx.profile.remedy} เพิ่มระบบสนับสนุน เลือกงานที่ค่อย ๆ สะสมแรงได้`],
  ];
  els.matrixGrid.innerHTML = metrics.map(([k, v]) => `<div class="metric"><span>${k}</span><strong>${v}</strong></div>`).join("");
}

function renderLuck(chart, birthYear) {
  const startAge = els.gender.value === "ชาย" ? 8 : 7;
  const items = Array.from({ length: 6 }, (_, i) => {
    const index = mod(chart.month.index + i + chart.year.index + 1, 60);
    const p = pillarFromIndex(index);
    const age = startAge + i * 10;
    const god = relation(chart.day.stem, p.stem);
    return `<div class="luck-item"><span>อายุ ${age}-${age + 9} ปี (${birthYear + age}-${birthYear + age + 9})</span><strong>${p.stem.han}${p.branch.han} ${p.stem.element}/${p.branch.animal}</strong><span>${god[1]} - ${god[2]}</span></div>`;
  });
  els.luckList.innerHTML = items.join("");
}

function renderStars(chart) {
  const all = [chart.year, chart.month, chart.day, chart.hour].flatMap((p) => [p.stem, ...p.branch.hidden.map((i) => stems[i])]);
  const grouped = new Map();
  all.forEach((s) => {
    const r = relation(chart.day.stem, s);
    grouped.set(r[0], { title: r[1], meaning: r[2], count: (grouped.get(r[0])?.count || 0) + 1 });
  });
  els.starList.innerHTML = [...grouped.entries()].map(([han, item]) => `<div class="star-item"><span>${han} พบ ${item.count} จุด</span><strong>${item.title}</strong><span>${item.meaning}</span></div>`).join("");
}

function renderToday(chart, score, date) {
  const reading = todayReading(chart, score, new Date());
  const ctx = chartContext(chart, score);
  els.todayTitle.textContent = reading.title;
  els.todaySummary.textContent = reading.summary;
  els.todayScore.textContent = reading.dayScore;
  els.luckyNumbers.textContent = reading.lucky;
  els.luckyColor.textContent = reading.luckyColor;
  els.luckyTime.textContent = reading.luckyTime;
  els.todayAdvice.innerHTML = reading.advice.map(([title, text]) => `
    <article class="advice-card">
      <span>${title}</span>
      <strong>${text}</strong>
    </article>
  `).join("");
  els.insightPanel.innerHTML = `
    <span>อ่านเชิงระบบ</span>
    <strong>${scoreLabel(reading.dayScore)} · ${reading.insight}</strong>
    <small>ฤดูกาลเดือนเกิดให้พลัง ${ctx.monthEnergy} ส่วนธาตุที่ยังควรเติมคือ ${ctx.weak.join(" / ")}</small>
  `;
  const today = new Date();
  els.calendarTitle.textContent = `14 วันถัดไปจากวันนี้`;
  els.calendarSummary.textContent = `${els.name.value.trim() || "คุณ"} เกิด ${date.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })} ระบบใช้ธาตุให้คุณ ${usefulElements(chart.day.stem.element, score).join(" / ")} เพื่อจัดอันดับวันตั้งแต่ ${today.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })}`;
}

function renderCalendar(chart, score, startDate) {
  const ctx = chartContext(chart, score);
  const useful = ctx.useful;
  const items = Array.from({ length: 14 }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    const dayPillar = pillarFromIndex(daysSinceBase(date));
    const match = useful.includes(dayPillar.stem.element) + useful.includes(dayPillar.branch.element);
    const dayRelation = relation(chart.day.stem, dayPillar.stem);
    const dayScore = Math.min(98, 48 + match * 17 + (dayPillar.branch.element === chart.day.stem.element ? 7 : 0) + (dayPillar.branch.element === chart.month.branch.element ? 5 : 0) + (i % 4) * 2);
    const category = dayScore >= 82 ? "work" : dayScore >= 70 ? "love" : "rest";
    const tags = calendarCategories[category];
    const action = category === "work"
      ? `เหมาะเปิดตัว นัดคุยดีล หรือตัดสินใจเรื่องงาน เพราะวันนี้ขึ้นดาว${dayRelation[1]}`
      : category === "love"
        ? `เหมาะเจรจา นัดพบ หรือปรับความเข้าใจ ใช้โทนนุ่มแต่ชัด`
        : `เหมาะเก็บรายละเอียด พักแรง เคลียร์พื้นที่ และแก้เคล็ดด้วยสี${colorByElement[useful[0]]}`;
    const avoid = dayScore >= 82 ? "เลี่ยงรับปากเกินกำลัง" : dayScore >= 70 ? "เลี่ยงพูดตอนอารมณ์ไว" : "เลี่ยงเปิดเรื่องใหม่ใหญ่ ๆ";
    if (activeCalendarFilter !== "all" && activeCalendarFilter !== category) return "";
    return `
      <article class="calendar-item ${dayScore >= 82 ? "is-top" : ""}">
        <div>
          <strong>${date.toLocaleDateString("th-TH", { day: "numeric", month: "short" })}</strong>
          <span>${date.toLocaleDateString("th-TH", { weekday: "short" })}</span>
        </div>
        <div>
          <strong>${dayPillar.stem.han}${dayPillar.branch.han} · ${dayPillar.stem.element}/${dayPillar.branch.animal}</strong>
          <span>${action}</span>
          <div class="calendar-tags">${tags.map((tag) => `<small>${tag}</small>`).join("")}</div>
          <span class="avoid-line">ควรเลี่ยง: ${avoid}</span>
        </div>
        <div class="score"><b>${dayScore}</b><small>${scoreLabel(dayScore)}</small></div>
      </article>
    `;
  }).filter(Boolean);
  els.calendarList.innerHTML = items.length ? items.join("") : `<article class="calendar-item"><div></div><div><strong>ยังไม่มีวันที่ตรงตัวกรองนี้</strong><span>ลองเลือก “ทั้งหมด” เพื่อดูวันแนะนำทั้งหมด</span></div><div class="score"><b>--</b></div></article>`;
}

function renderQimen(chart, date, hour) {
  const ctx = chartContext(chart, strength(chart));
  const useful = ctx.useful;
  const seed = mod(daysSinceBase(date) + hour + chart.day.index, 9);
  let best = { score: -1, direction: "", door: "", element: "" };
  const cells = directions.map((direction, i) => {
    const element = elementOrder[mod(seed + i, 5)];
    const score = 46 + (useful.includes(element) ? 22 : 0) + (i === seed ? 13 : 0) + (element === ctx.monthEnergy ? 5 : 0) + mod(i * 7 + hour, 13);
    const door = doors[mod(seed + i, doors.length)];
    if (score > best.score) best = { score, direction, element, door };
    return `
      <article class="qimen-cell ${score > 82 ? "is-best" : ""}">
        <span>${direction}</span>
        <strong>${door}门</strong>
        <span>${elementHan[element]} ${element} · ${score}/100</span>
        <small>${scoreLabel(score)}</small>
      </article>
    `;
  });
  els.qimenBoard.innerHTML = cells.join("");
  els.qimenBestScore.textContent = best.score;
  els.qimenTitle.textContent = `${best.direction} · ${best.door}门`;
  els.qimenSummary.textContent = `ทิศนี้ให้พลัง ${elementHan[best.element]} ${best.element} เข้ากับธาตุให้คุณของดวง ${ctx.dm.han} ${ctx.dm.element} เหมาะใช้เริ่มเรื่องสำคัญ`;
  els.qimenNote.innerHTML = `<strong>ทิศแนะนำตอนนี้: ${best.direction}</strong><br>หันหน้าไปทางนี้ 3-9 นาที ก่อนโทรหาลูกค้า ส่งข้อความสำคัญ ไลฟ์ขายของ หรือเริ่มเดินทาง แล้วตั้งเจตนาให้ชัดหนึ่งเรื่อง`;
  els.qimenUse.innerHTML = [
    ["งาน/ขาย", "เริ่มโทรหรือส่งข้อเสนอจากทิศนี้ ใช้ข้อความสั้น ชัด และปิดด้วย next step"],
    ["ความรัก", "เหมาะเริ่มบทสนทนาด้วยคำถามอ่อนโยน เลี่ยงการทวงคำตอบทันที"],
    ["การเงิน", "ตรวจตัวเลขก่อนโอนหรือเซ็น ถ้าคะแนนทิศเกิน 80 ใช้ยื่นราคาได้"],
    ["แก้เคล็ด", `วางของสี${colorByElement[best.element]}หรือเปิดไฟเล็ก ๆ ทางทิศ${best.direction}`],
  ].map(([title, text]) => `<article class="use-card"><span>${title}</span><strong>${text}</strong></article>`).join("");
}

function renderOracle(chart, score, date) {
  const reading = oracleReading(chart, score, date);
  els.oracleTitle.textContent = `${reading.topic.label} · ${reading.topic.title}`;
  els.oracleSummary.textContent = `อ่านจาก Day Master ${reading.dm.han} ${reading.dm.element} และธาตุให้คุณ ${reading.useful.join(" / ")}`;
  els.oracleScore.textContent = reading.topicScore;
  els.oracleMeta.textContent = `${date.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })} · ${reading.topic.label}`;
  els.oracleReading.innerHTML = `
    <article class="oracle-main">
      <h3>${reading.topicScore >= 72 ? "จังหวะเปิด" : "จังหวะตั้งหลัก"}</h3>
      <p>${reading.tone}</p>
    </article>
    <div class="oracle-grid">
      <article class="oracle-card">
        <span>${reading.analysis ? "ผลวิเคราะห์คำถาม" : "คำตอบจากคำถาม"}</span>
        <strong>${reading.answer}</strong>
      </article>
      <article class="oracle-card">
        <span>ระบบตรวจพบ</span>
        <strong>${reading.analysis ? `หัวข้อ ${reading.topic.label} · เจตนา ${reading.analysis.intent} · ความชัดเจน ${reading.analysis.clarity}` : "ยังไม่มีคำถามเฉพาะ ระบบจึงอ่านจากหัวข้อที่เลือกก่อน"}</strong>
      </article>
      <article class="oracle-card">
        <span>ควรโฟกัส</span>
        <strong>${reading.topic.focus}</strong>
      </article>
      <article class="oracle-card">
        <span>ควรเลี่ยง</span>
        <strong>${reading.topic.avoid}</strong>
      </article>
      <article class="oracle-card">
        <span>เคล็ดเสริม</span>
        <strong>ใช้เลข ${reading.today.lucky} สี${reading.today.luckyColor} และเริ่มเรื่องสำคัญช่วง ${reading.today.luckyTime}</strong>
      </article>
      <article class="oracle-card">
        <span>พื้นดวงที่เกี่ยวข้อง</span>
        <strong>${reading.ctx.profile.nature} จุดที่ต้องระวังคือ ${reading.ctx.profile.stress}</strong>
      </article>
      <article class="oracle-card">
        <span>ธาตุช่วยเปิดทาง</span>
        <strong>${reading.useful.map((e) => `${elementHan[e]} ${e}`).join(" / ")} · ใช้ในสี เวลา คน หรือสภาพแวดล้อมที่เลือก</strong>
      </article>
    </div>
    <div class="oracle-timeline">
      ${reading.timeline.map(([label, text]) => `<article class="timeline-item"><span>${label}</span><strong>${text}</strong></article>`).join("")}
    </div>
  `;
}

function update() {
  const [year, month, day] = els.date.value.split("-").map(Number);
  const hour = Number((els.time.value || "00:00").split(":")[0]);
  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) return;
  const chart = getChart(date, hour);
  const score = strength(chart);
  const dm = chart.day.stem;
  const ctx = chartContext(chart, score);

  els.profileStatus.textContent = `${els.name.value.trim() || "ผู้มาเยือน"} · ${ctx.strengthLabel} · Day Master ${dm.han} ${dm.element} · ธาตุให้คุณ ${ctx.useful.join(" / ")}`;
  els.birthLine.textContent = `${els.gender.value} · ${date.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })} ${els.time.value}`;
  els.dayMasterTitle.textContent = `${dm.element}${dm.polarity === "+" ? "หยาง" : "หยิน"} (${dm.th} ${dm.han})`;
  els.dayMasterQuote.textContent = `"${dm.quote}"`;
  els.strengthBar.style.width = `${score}%`;
  els.strengthText.textContent = `ความแข็งแรงโดยประมาณ ${score}/100 จากฤดูกาล ก้านฟ้า กิ่งดิน และธาตุแฝง`;

  renderPillars(chart);
  renderToday(chart, score, date);
  renderMatrix(chart, score);
  renderLuck(chart, year);
  renderStars(chart);
  renderCalendar(chart, score, new Date());
  renderQimen(chart, date, hour);
  renderOracle(chart, score, date);
}

function runQuestionAnalysis() {
  if (!predictionMade) {
    renderLockedPreview("กรอกข้อมูลเกิดและกด “คำนายดวง” ก่อน ระบบจึงจะวิเคราะห์คำถามแบบเฉพาะตัวได้");
    return;
  }
  const question = els.oracleQuestion.value.trim();
  if (!question) {
    analyzedQuestion = "";
    questionAnalysis = null;
    els.analysisState.textContent = "พิมพ์คำถามก่อน แล้วระบบจะวิเคราะห์หัวข้อและเจตนาให้";
    update();
    return;
  }
  analyzedQuestion = question;
  questionAnalysis = analyzeQuestionText(question);
  if (questionAnalysis.topic !== "overall") {
    activeOracleTopic = questionAnalysis.topic;
    document.querySelectorAll(".oracle-chip").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.oracle === activeOracleTopic);
    });
  }
  els.analysisState.textContent = `วิเคราะห์แล้ว: เรื่อง${topicMapLabel(questionAnalysis.topic)} · เจตนา ${questionAnalysis.intent} · ความเร่ง ${questionAnalysis.urgency}`;
  update();
}

function topicMapLabel(topic) {
  return ({ overall: "ภาพรวม", work: "งาน", money: "เงิน", love: "ความรัก", health: "สุขภาพใจ" })[topic] || "ภาพรวม";
}

document.querySelectorAll(".tab").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".tab, .tab-panel").forEach((el) => el.classList.remove("is-active"));
    button.classList.add("is-active");
    document.querySelector(`#${button.dataset.tab}`).classList.add("is-active");
    document.querySelectorAll(".module").forEach((el) => el.classList.remove("is-active"));
    document.querySelector("#module-bazi").classList.add("is-active");
    els.appTitle.textContent = moduleTitles.bazi;
    document.querySelectorAll(".bottom-nav button").forEach((el) => el.classList.toggle("is-active", el.dataset.module === "bazi"));
  });
});

document.querySelectorAll(".bottom-nav button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".bottom-nav button, .module").forEach((el) => el.classList.remove("is-active"));
    button.classList.add("is-active");
    document.querySelector(`#module-${button.dataset.module}`).classList.add("is-active");
    els.appTitle.textContent = moduleTitles[button.dataset.module];
  });
});

document.querySelectorAll(".filter-chip").forEach((button) => {
  button.addEventListener("click", () => {
    activeCalendarFilter = button.dataset.filter;
    document.querySelectorAll(".filter-chip").forEach((el) => el.classList.remove("is-active"));
    button.classList.add("is-active");
    if (predictionMade) update();
  });
});

document.querySelectorAll(".oracle-chip").forEach((button) => {
  button.addEventListener("click", () => {
    activeOracleTopic = button.dataset.oracle;
    analyzedQuestion = "";
    questionAnalysis = null;
    els.analysisState.textContent = "เลือกหัวข้อแล้ว พิมพ์คำถามและกดวิเคราะห์เพื่อให้คำตอบเฉพาะขึ้น";
    document.querySelectorAll(".oracle-chip").forEach((el) => el.classList.remove("is-active"));
    button.classList.add("is-active");
    if (predictionMade) update();
  });
});

els.analyzeQuestion.addEventListener("click", runQuestionAnalysis);
els.oracleQuestion.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    runQuestionAnalysis();
  }
});

document.querySelector("#resetBtn").addEventListener("click", () => {
  els.name.value = "";
  els.email.value = "";
  els.gender.value = "";
  els.date.value = "";
  els.time.value = "";
  els.privacyConsent.checked = false;
  els.consentLine.classList.remove("is-attention");
  lockResults("ตั้งดวงใหม่แล้ว กรอกข้อมูลให้ครบก่อนคำนาย");
});

els.predictBtn.addEventListener("click", () => requestPrediction("prediction-button"));

[els.name, els.email, els.gender, els.date, els.time].forEach((el) => {
  el.addEventListener("input", () => {
    if (predictionMade) {
      lockResults("ข้อมูลเปลี่ยนแล้ว กด “คำนายดวง” อีกครั้งเพื่อแสดงผลใหม่");
    }
  });
});

els.privacyConsent.addEventListener("change", () => {
  if (els.privacyConsent.checked) {
    els.consentLine.classList.remove("is-attention");
  }
});

els.oracleQuestion.addEventListener("input", () => {
  if (!predictionMade) {
    els.analysisState.textContent = "คำถามจะถูกอ่านร่วมกับดวงหลังกรอกข้อมูลและกดคำนายดวง";
    return;
  }
  if (els.oracleQuestion.value.trim() !== analyzedQuestion) {
    els.analysisState.textContent = "คำถามมีการเปลี่ยนแปลง กด “วิเคราะห์คำถาม” เพื่อประมวลผลใหม่";
  }
});

loadCustomBackgrounds();
lockResults();
