const isBlockedDomain = typeof document !== "undefined" && document.documentElement.dataset.domainAllowed === "false";

if ((typeof window !== "undefined" && window.__LIKHITFA_DOMAIN_ALLOWED__ === false) || isBlockedDomain) {
  throw new Error("Likhitfa domain lock: unauthorized host");
}

if (typeof document !== "undefined") {
  document.addEventListener("contextmenu", (event) => event.preventDefault());
  document.addEventListener("dragstart", (event) => {
    if (event.target?.closest?.("img, .deck-select-card, .tarot-card-face")) event.preventDefault();
  });
  document.addEventListener("copy", (event) => {
    if (!event.target?.closest?.("input, textarea")) event.preventDefault();
  });
  document.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    if ((event.metaKey || event.ctrlKey) && ["s", "u", "p"].includes(key)) event.preventDefault();
  });
}

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
  homeScreen: document.querySelector("#homeScreen"),
  homeBtn: document.querySelector("#homeBtn"),
  brandHomeBtn: document.querySelector("#brandHomeBtn"),
  baziTabs: document.querySelector("#baziTabs"),
  profileStatus: document.querySelector("#profileStatus"),
  name: document.querySelector("#name"),
  gender: document.querySelector("#gender"),
  date: document.querySelector("#date"),
  time: document.querySelector("#time"),
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
  tarotWorkspace: document.querySelector("#tarotWorkspace"),
  tarotQuestion: document.querySelector("#tarotQuestion"),
  shuffleTarotBtn: document.querySelector("#shuffleTarotBtn"),
  tarotSpreadTabs: document.querySelector("#tarotSpreadTabs"),
  tarotTopicTabs: document.querySelector("#tarotTopicTabs"),
  tarotDeckGrid: document.querySelector("#tarotDeckGrid"),
  tarotSelectionTitle: document.querySelector("#tarotSelectionTitle"),
  tarotSelectionHelp: document.querySelector("#tarotSelectionHelp"),
  tarotPickProgress: document.querySelector("#tarotPickProgress"),
  tarotMeta: document.querySelector("#tarotMeta"),
  tarotDeckCount: document.querySelector("#tarotDeckCount"),
  tarotResult: document.querySelector("#tarotResult"),
  tarotResultCard: document.querySelector("#tarotResultCard"),
  tarotBackBtn: document.querySelector("#tarotBackBtn"),
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
const elementDailyGuides = {
  "ไม้": {
    work: "ต่อยอดงานที่ต้องคุยกับคนหรือวางโครงใหม่ แบ่งงานเป็นลำดับแล้วเริ่มจากจุดที่โตต่อได้",
    money: "เงินเด่นจากการต่อยอดลูกค้าเดิม แพ็กเกจใหม่ หรือไอเดียที่ยังขยายได้",
    love: "ความสัมพันธ์ดีขึ้นเมื่อพูดเรื่องอนาคตแบบค่อยเป็นค่อยไป ไม่กดให้อีกฝ่ายตอบทันที",
    avoid: "เปลี่ยนแผนหลายรอบจนคนตามไม่ทัน",
  },
  "ไฟ": {
    work: "ใช้กับงานพรีเซนต์ ไลฟ์ ขาย อธิบาย หรือปล่อยคอนเทนต์ที่ต้องการให้คนเห็น",
    money: "เงินมาจากการทำให้ข้อเสนอชัดและน่าสนใจ ระวังซื้อเพราะอารมณ์ตอนเห็นของ",
    love: "พูดตรงได้แต่ต้องเหลือพื้นที่ให้อีกฝ่ายตอบ ความอบอุ่นสำคัญกว่าการชนะเหตุผล",
    avoid: "เร่งทุกอย่างพร้อมกันจนพลังตกก่อนถึงงานสำคัญ",
  },
  "ดิน": {
    work: "เหมาะเก็บรายละเอียด จัดระบบ สรุป requirement และทำเรื่องซับซ้อนให้อยู่ใน checklist",
    money: "ดีต่อการปิดรูรั่ว ตรวจบิล ตั้งงบ หรือคุยเรื่องราคาแบบมีหลักฐาน",
    love: "แสดงความใส่ใจผ่านการช่วยจัดการเรื่องจริงมากกว่าพูดหวานอย่างเดียว",
    avoid: "แบกรับปัญหาคนอื่นจนเรื่องตัวเองค้าง",
  },
  "ทอง": {
    work: "เหมาะตัดสินใจ ตรวจคุณภาพ เซ็นเอกสาร ตั้งมาตรฐาน หรือเจรจาเงื่อนไขให้คม",
    money: "ใช้กับการตั้งราคา ทวงยอดค้าง ตรวจสัญญา และตัดรายจ่ายที่ไม่จำเป็น",
    love: "ความชัดเจนช่วยได้ แต่ลดโทนคำพูดแข็งเพื่อไม่ให้อีกฝ่ายตั้งการ์ด",
    avoid: "รอให้ทุกอย่างสมบูรณ์ก่อนเริ่มจนพลาดจังหวะ",
  },
  "น้ำ": {
    work: "เหมาะวิจัย อ่านข้อมูล วางกลยุทธ์ คุยหลังบ้าน หรือเตรียมคำตอบก่อนเจรจา",
    money: "เงินเด่นจากข้อมูล การเปรียบเทียบราคา การอ่านแนวโน้ม และการไม่รีบโอน",
    love: "ฟังให้มากขึ้น ถามให้ลึกขึ้น แล้วค่อยสรุป จะลดการเข้าใจผิดได้ดี",
    avoid: "คิดวนหรือรับข้อมูลมากเกินไปจนไม่ลงมือ",
  },
};
const relationActionGuides = {
  "เพื่อนร่วมทาง": { focus: "ยืนจุดยืนของตัวเอง", risk: "ดื้อหรือถือความเห็นตัวเองเกินไป" },
  "แรงแข่งขัน": { focus: "ใช้แรงกดจากคนรอบตัวเป็นวินัย", risk: "เปรียบเทียบจนตัดสินใจพลาด" },
  "พรสวรรค์": { focus: "ปล่อยผลงาน ทดลอง และสร้างประโยชน์ให้คนเห็น", risk: "เพลินกับไอเดียจนไม่สรุปผล" },
  "นักแสดงออก": { focus: "สื่อสารให้ชัด ขายไอเดีย หรือทำคอนเทนต์", risk: "พูดตรงเกินจนคนรับสารปิดใจ" },
  "รายได้เสริม": { focus: "มองหาโอกาสเงินจากช่องทางใหม่", risk: "ขยายเร็วเกินก่อนพิสูจน์ตัวเลข" },
  "ทรัพย์หลัก": { focus: "จัดการเงิน สัญญา ราคา และสิ่งที่วัดผลได้", risk: "ยึดผลประโยชน์จนความสัมพันธ์ตึง" },
  "แรงกดดัน": { focus: "รับโจทย์ท้าทายแบบมีแผน", risk: "ฝืนรับภาระเพื่อพิสูจน์ตัวเอง" },
  "ระเบียบ": { focus: "ทำเรื่องทางการ เอกสาร กติกา และความน่าเชื่อถือ", risk: "เคร่งกฎจนขยับช้า" },
  "ญาณ/กลยุทธ์": { focus: "อ่านข้อมูลลึก วางแผน และใช้ความรู้เฉพาะทาง", risk: "เก็บตัววิเคราะห์นานเกินไป" },
  "ผู้สนับสนุน": { focus: "ขอคำแนะนำ เรียนรู้ หรือใช้ผู้ช่วยให้ถูกคน", risk: "รอคนช่วยจนไม่เริ่มเอง" },
};
const seasonalGuides = {
  "ไม้": "เดือนเกิดให้พลังการเติบโตและการเริ่มใหม่ ดวงจะตอบสนองดีเมื่อมีแผนระยะยาว",
  "ไฟ": "เดือนเกิดให้พลังการมองเห็นและชื่อเสียง ดวงจะเด่นเมื่อกล้าแสดงผลงาน",
  "ดิน": "เดือนเกิดให้พลังโครงสร้างและความรับผิดชอบ ดวงจะดีเมื่อจัดระบบก่อนเร่งผล",
  "ทอง": "เดือนเกิดให้พลังมาตรฐานและการตัดสินใจ ดวงจะชัดเมื่อมีเกณฑ์วัดผล",
  "น้ำ": "เดือนเกิดให้พลังข้อมูลและความยืดหยุ่น ดวงจะเดินดีเมื่อฟังสัญญาณรอบตัว",
};
const branchClashes = {
  "子": "午",
  "午": "子",
  "丑": "未",
  "未": "丑",
  "寅": "申",
  "申": "寅",
  "卯": "酉",
  "酉": "卯",
  "辰": "戌",
  "戌": "辰",
  "巳": "亥",
  "亥": "巳",
};
const branchCombinations = {
  "子": ["丑"],
  "丑": ["子"],
  "寅": ["亥"],
  "亥": ["寅"],
  "卯": ["戌"],
  "戌": ["卯"],
  "辰": ["酉"],
  "酉": ["辰"],
  "巳": ["申"],
  "申": ["巳"],
  "午": ["未"],
  "未": ["午"],
};
const stemCombinations = {
  "甲": { pair: "己", element: "ดิน" },
  "己": { pair: "甲", element: "ดิน" },
  "乙": { pair: "庚", element: "ทอง" },
  "庚": { pair: "乙", element: "ทอง" },
  "丙": { pair: "辛", element: "น้ำ" },
  "辛": { pair: "丙", element: "น้ำ" },
  "丁": { pair: "壬", element: "ไม้" },
  "壬": { pair: "丁", element: "ไม้" },
  "戊": { pair: "癸", element: "ไฟ" },
  "癸": { pair: "戊", element: "ไฟ" },
};
const branchHarms = {
  "子": ["未"],
  "未": ["子"],
  "丑": ["午"],
  "午": ["丑"],
  "寅": ["巳"],
  "巳": ["寅", "申"],
  "卯": ["辰"],
  "辰": ["卯"],
  "申": ["亥", "巳"],
  "亥": ["申"],
  "酉": ["戌"],
  "戌": ["酉"],
};
const branchPunishments = {
  "子": ["卯"],
  "卯": ["子"],
  "寅": ["巳", "申"],
  "巳": ["寅", "申"],
  "申": ["寅", "巳"],
  "丑": ["戌", "未"],
  "戌": ["丑", "未"],
  "未": ["丑", "戌"],
  "辰": ["辰"],
  "午": ["午"],
  "酉": ["酉"],
  "亥": ["亥"],
};
const solarMonthStarts = [
  { month: 0, day: 6, branch: 1, name: "小寒", th: "เสี่ยวหาน" },
  { month: 1, day: 4, branch: 2, name: "立春", th: "ลี่ชุน" },
  { month: 2, day: 6, branch: 3, name: "惊蛰", th: "จิงเจ๋อ" },
  { month: 3, day: 5, branch: 4, name: "清明", th: "ชิงหมิง" },
  { month: 4, day: 6, branch: 5, name: "立夏", th: "ลี่เซี่ย" },
  { month: 5, day: 6, branch: 6, name: "芒种", th: "หมางจ้ง" },
  { month: 6, day: 7, branch: 7, name: "小暑", th: "เสี่ยวสู่" },
  { month: 7, day: 8, branch: 8, name: "立秋", th: "ลี่ชิว" },
  { month: 8, day: 8, branch: 9, name: "白露", th: "ไป๋ลู่" },
  { month: 9, day: 8, branch: 10, name: "寒露", th: "หานลู่" },
  { month: 10, day: 7, branch: 11, name: "立冬", th: "ลี่ตง" },
  { month: 11, day: 7, branch: 0, name: "大雪", th: "ต้าเสวี่ย" },
];

const tarotMajor = [
  ["fool", "The Fool", "ไพ่คนเดินทาง", "เริ่มต้น", "ลองเริ่มแบบไม่แบกความคาดหวังมากเกินไป"],
  ["magician", "The Magician", "ไพ่นักสร้าง", "ลงมือ", "มีเครื่องมือพร้อมแล้ว เหลือการเลือกใช้ให้ตรงจุด"],
  ["high-priestess", "The High Priestess", "ไพ่เสียงข้างใน", "สัญชาตญาณ", "ข้อมูลเงียบ ๆ และความรู้สึกแรกมีน้ำหนัก"],
  ["empress", "The Empress", "ไพ่ความอุดมสมบูรณ์", "ดูแล", "สิ่งที่เลี้ยงดูต่อเนื่องจะค่อย ๆ ให้ผล"],
  ["emperor", "The Emperor", "ไพ่โครงสร้าง", "วินัย", "ตั้งขอบเขตและกติกาให้ชัดก่อนเดินต่อ"],
  ["hierophant", "The Hierophant", "ไพ่ครู", "หลักการ", "ใช้ความรู้ ระบบ หรือคำแนะนำจากคนมีประสบการณ์"],
  ["lovers", "The Lovers", "ไพ่ทางเลือก", "สัมพันธ์", "ตัดสินใจจากคุณค่าที่ตรงกัน ไม่ใช่ความกลัวชั่วคราว"],
  ["chariot", "The Chariot", "ไพ่รถศึก", "ควบคุม", "โฟกัสเป้าหมายเดียว แล้วคุมจังหวะให้ไปถึง"],
  ["strength", "Strength", "ไพ่กำลังใจ", "อ่อนโยนแต่มั่นคง", "ใช้ความนุ่มนวลควบคู่กับความเด็ดขาด"],
  ["hermit", "The Hermit", "ไพ่ผู้ค้นหา", "ทบทวน", "ถอยมามองภาพรวมก่อนตอบหรือเดินหน้า"],
  ["wheel", "Wheel of Fortune", "ไพ่วงล้อ", "จังหวะ", "สถานการณ์กำลังเปลี่ยน เลือกขยับในจังหวะที่เปิด"],
  ["justice", "Justice", "ไพ่ความยุติธรรม", "ชัดเจน", "ตรวจเงื่อนไข หลักฐาน และผลลัพธ์ทั้งสองด้าน"],
  ["hanged-man", "The Hanged Man", "ไพ่มุมมองใหม่", "รอจังหวะ", "เปลี่ยนมุมมองก่อนสรุปว่าไปต่อหรือหยุด"],
  ["death", "Death", "ไพ่เปลี่ยนผ่าน", "ปล่อยของเก่า", "ตัดสิ่งที่หมดรอบ เพื่อให้พื้นที่กับสิ่งใหม่"],
  ["temperance", "Temperance", "ไพ่สมดุล", "ปรับจูน", "ประนีประนอมและค่อย ๆ ผสมทางเลือกให้ลงตัว"],
  ["devil", "The Devil", "ไพ่พันธนาการ", "รู้เท่าทัน", "ระวังความอยาก ความกลัว หรือข้อผูกมัดที่ทำให้มองไม่ชัด"],
  ["tower", "The Tower", "ไพ่การรื้อ", "เปลี่ยนฉับพลัน", "ถ้าสิ่งเดิมไม่มั่นคง ต้องกล้ารื้อให้ปลอดภัยกว่าเดิม"],
  ["star", "The Star", "ไพ่ความหวัง", "เยียวยา", "กลับมาเชื่อในทิศทางระยะยาวและดูแลใจให้พอ"],
  ["moon", "The Moon", "ไพ่เงาใจ", "ไม่ชัดเจน", "ตรวจข้อมูลซ้ำ อย่าให้ความกังวลเป็นคนตัดสิน"],
  ["sun", "The Sun", "ไพ่แสงสว่าง", "เปิดเผย", "เรื่องที่ชัด ตรง และจริงใจจะเดินได้ดีที่สุด"],
  ["judgement", "Judgement", "ไพ่การตื่นรู้", "สรุปบทเรียน", "มองบทเรียนเดิม แล้วเลือกทางที่โตขึ้น"],
  ["world", "The World", "ไพ่ครบวงจร", "ปิดรอบ", "มีโอกาสปิดงานหรือสรุปบทสำคัญให้สมบูรณ์"],
];

const tarotSuitProfiles = {
  wands: { th: "ไม้เท้า", symbol: "ไม้เท้า", theme: "แรงผลัก งาน ไอเดีย และการเริ่มต้น", topic: "work" },
  cups: { th: "ถ้วย", symbol: "ถ้วย", theme: "อารมณ์ ความสัมพันธ์ ความรู้สึก และการเยียวยา", topic: "love" },
  swords: { th: "ดาบ", symbol: "ดาบ", theme: "ความคิด การตัดสินใจ การสื่อสาร และความจริง", topic: "mind" },
  pentacles: { th: "เหรียญ", symbol: "เหรียญ", theme: "เงิน งานจริง ทรัพย์สิน สุขภาพกาย และความมั่นคง", topic: "money" },
};

const tarotRanks = [
  ["ace", "Ace", "หนึ่ง", "เมล็ดเริ่มต้น", "เริ่มจากก้าวเล็กที่จับต้องได้"],
  ["two", "Two", "สอง", "การเลือก", "ต้องชั่งน้ำหนักสองทางให้ชัด"],
  ["three", "Three", "สาม", "การร่วมมือ", "มีแรงสนับสนุนจากการประสานคนหรือข้อมูล"],
  ["four", "Four", "สี่", "ฐานมั่นคง", "จัดระบบให้แน่นก่อนขยาย"],
  ["five", "Five", "ห้า", "แรงเสียดทาน", "ระวังปะทะหรือเสียพลังกับเรื่องเล็ก"],
  ["six", "Six", "หก", "การปรับสมดุล", "คืนสมดุลด้วยการให้และรับอย่างพอดี"],
  ["seven", "Seven", "เจ็ด", "การประเมิน", "ต้องเลือกจุดยืนและตรวจข้อเท็จจริง"],
  ["eight", "Eight", "แปด", "การฝึกฝน", "ทำซ้ำอย่างมีวินัยแล้วผลจะค่อย ๆ ชัด"],
  ["nine", "Nine", "เก้า", "ผลใกล้สำเร็จ", "เก็บรายละเอียดสุดท้ายก่อนสรุป"],
  ["ten", "Ten", "สิบ", "บทสรุป", "ปิดรอบเก่าและจัดภาระให้เบาลง"],
  ["page", "Page", "มหาดเล็ก", "ข่าวสาร", "เริ่มเรียนรู้หรือรับข่าวใหม่ด้วยใจเปิด"],
  ["knight", "Knight", "อัศวิน", "การเคลื่อนไหว", "ขยับอย่างมีทิศทาง ระวังเร่งเกินจริง"],
  ["queen", "Queen", "ราชินี", "การดูแล", "ใช้ความเข้าใจและการจัดการอารมณ์ให้ดี"],
  ["king", "King", "ราชา", "การควบคุม", "ตัดสินใจแบบผู้รับผิดชอบภาพรวม"],
];

const tarotTopics = {
  overall: "ภาพรวม",
  work: "งาน",
  money: "เงิน",
  love: "ความรัก",
  mind: "สุขภาพใจ",
  question: "คำถามเฉพาะ",
};

const tarotDeck = [
  ...tarotMajor.map(([id, en, th, keyword, advice], index) => ({
    number: index,
    id: `major-${id}`,
    arcana: "major",
    name: en,
    th,
    keyword,
    advice,
    theme: "บทเรียนหลักของชีวิตและจังหวะสำคัญ",
    topic: "overall",
  })),
  ...Object.entries(tarotSuitProfiles).flatMap(([suit, suitProfile], suitIndex) => tarotRanks.map(([rank, enRank, thRank, keyword, advice], rankIndex) => ({
    number: 22 + (suitIndex * 14) + rankIndex,
    id: `${suit}-${rank}`,
    arcana: "minor",
    suit,
    rank,
    name: `${enRank} of ${suitProfile.th}`,
    th: `${thRank} ${suitProfile.th}`,
    keyword,
    advice,
    theme: suitProfile.theme,
    topic: suitProfile.topic,
  }))),
];

const cloudinaryCloud = "dhhzjeskm";
const tarotCardBackUrl = "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780476296/00_back_of_cards_xxwsgr.png";
const tarotCardUrlsByNumber = {
  "0": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780476296/0_The_Fool_ddtsof.png",
  "1": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780476296/1_The_Magician_a82rmz.png",
  "2": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780476296/2_The_Empress_ehvoac.png",
  "3": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780476296/3_The_Empress_fvyqvg.png",
  "4": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780476296/4_The_Emperor_ymgc9b.png",
  "5": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780476297/5_The_Hierophant_pvehid.png",
  "6": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780476297/6_The_Lovers_hcekpx.png",
  "7": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780476297/7_The_Chariot_ieudqc.png",
  "8": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780476298/8_Strength_e00dbe.png",
  "9": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780476298/9_The_Hermit_rolln7.png",
  "10": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780476298/10_Wheel_of_Fortune_fwr6id.png",
  "11": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780476298/11_Justice_oul52r.png",
  "12": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780476298/12_The_Hanged_Man_obdnym.png",
  "13": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780476299/13_Death_hfwity.png",
  "14": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780476299/14_Temperance_m7jz9m.png",
  "15": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780476299/15_The_Devil_y8pqy5.png",
  "16": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780476299/16_The_Tower_fjrvch.png",
  "17": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780476299/17_The_Star_liofrx.png",
  "18": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780476299/18_The_Moon_wwu1hc.png",
  "19": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780476300/19_The_Sun_vpisw2.png",
  "20": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780476300/20_Judgement_dyzzv1.png",
  "21": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780476300/21_The_World_ixawwn.png",
  "22": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780476301/22_Ace_of_Wands_vaoaps.png",
  "23": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780476301/23_Two_of_Wands_pyehl1.png",
  "24": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780476301/24_Three_of_Wands_qygkeb.png",
  "25": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780476302/25_Four_of_Wands_laqrah.png",
  "26": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780476302/26_Five_of_Wands_ggunmk.png",
  "27": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780476302/27_Six_of_Wands_rrwwnp.png",
  "28": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780476303/28_Seven_of_Wands_omtetf.png",
  "29": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780476303/29_Eight_of_Wands_m7x0i6.png",
  "30": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780476303/30_Nine_of_Wands_aojkpr.png",
  "31": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780476304/31_Ten_of_Wands_aq0azu.png",
  "32": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780476304/32_Page_of_Wands_zozh8e.png",
  "33": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780476304/33_Knight_of_Wands_mh41nx.png",
  "34": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780476305/34_Queen_of_Wands_mx2oqw.png",
  "35": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780476305/35_King_of_Wands_ocm4os.png",
  "36": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780476306/36_Ace_of_Cups_vbvzqu.png",
  "37": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780476306/37_Two_of_Cups_lmyo3g.png",
  "38": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780476306/38_Three_of_Cups_i7rlbl.png",
  "39": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780476307/39_Four_of_Cups_iyzht0.png",
  "40": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780476307/40_Five_of_Cups_fezato.png",
  "41": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780476307/41_Six_of_Cups_oqlq3x.png",
  "42": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780476308/42_Seven_of_Cups_jwl1ih.png",
  "43": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780476309/43_Eight_of_Cups_qwdmhv.png",
  "44": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780476308/44_Nine_of_Cups_wgfbpi.png",
  "45": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780476309/45_Ten_of_Cups_iw8qme.png",
  "46": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780476309/46_Page_of_Cups_ttq7zt.png",
  "47": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780476310/47_Knight_of_Cups_gboclo.png",
  "48": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780476309/48_Queen_of_Cups_tljicg.png",
  "49": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780476310/49_King_of_Cups_idlimu.png",
  "50": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780476310/50_Ace_of_Swords_bdqsrx.png",
  "51": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780476311/51_Two_of_Swords_wdfwcs.png",
  "52": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780476311/52_Three_of_Swords_nvcgfc.png",
  "53": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780476311/53_Four_of_Swords_ivroe6.png",
  "54": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780476312/54_Five_of_Swords_koz9bt.png",
  "55": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780476312/55_Six_of_Swords_mdum3b.png",
  "56": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780476313/56_Seven_of_Swords_vv8coa.png",
  "57": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780476313/57_Eight_of_Swords_cra0dp.png",
  "58": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780476313/58_Nine_of_Swords_wdlil7.png",
  "59": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780476314/59_Ten_of_Swords_nyulxr.png",
  "60": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780476314/60_Page_of_Swords_wysolw.png",
  "61": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780476314/61_Knight_of_Swords_efn0te.png",
  "62": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780476315/62_Queen_of_Swords_rrnnj3.png",
  "63": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780476315/63_King_of_Swords_env2fk.png",
  "64": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780476315/64_Ace_of_Pentacles_yes80s.png",
  "65": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780476316/65_Two_of_Pentacles_puwghn.png",
  "66": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780476316/66_Three_of_Pentacles_ys1gsv.png",
  "67": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780476316/67_Four_of_Pentacles_lhohyp.png",
  "68": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780476317/68_Five_of_Pentacles_wh5nmk.png",
  "69": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780476317/69_Six_of_Pentacles_rjdiwl.png",
  "70": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780476317/70_Seven_of_Pentacles_wqegm0.png",
  "71": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780476318/71_Eight_of_Pentacles_badshe.png",
  "72": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780476318/72_Nine_of_Pentacles_obm1w7.png",
  "73": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780476319/73_Ten_of_Pentacles_wi6vzp.png",
  "74": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780476319/74_Page_of_Pentacles_qyfqiu.png",
  "75": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780476319/75_Knight_of_Pentacles_jvbmuf.png",
  "76": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780476319/76_Queen_of_Pentacles_wlsy73.png",
  "77": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780476320/77_King_of_Pentacles_gqho9y.png",
};
const tarotKnownPublicIds = {
  "major-fool": "0_The_Fool_ddtsof",
  "major-magician": "1_The_Magician_a82rmz",
  "major-high-priestess": "2_The_High_Priestess_mrcwss",
  "major-empress": "3_The_Empress_ehvoac",
  "major-emperor": "4_The_Emperor_fvyqvg",
  "major-hierophant": "5_The_Hierophant_pvehid",
  "major-lovers": "6_The_Lovers_hcekpx",
  "major-chariot": "7_The_Chariot_ieudqj",
  "major-strength": "8_Strength_e00dbe",
  "major-hermit": "9_The_Hermit_rolln7",
  "major-wheel": "10_Wheel_of_Fortune_fwr6e",
  "major-justice": "11_Justice_oul52r",
  "major-hanged-man": "12_The_Hanged_Man_obdnym",
  "major-death": "13_Death_hfwity",
  "major-temperance": "14_Temperance_m7jz9",
  "major-devil": "15_The_Devil_y8pqy5",
  "major-tower": "16_The_Tower_fjrvch",
  "major-star": "17_The_Star_liofro",
  "major-moon": "18_The_Moon_wwu1hl",
  "major-sun": "19_The_Sun_vpisw2",
  "major-judgement": "20_Judgement_dyzzv1",
  "major-world": "21_The_World_ixawwn",
  "wands-ace": "22_Ace_of_Wands_vaoaps",
  "wands-two": "23_Two_of_Wands_pyehl",
  "wands-three": "24_Three_of_Wands_qygke",
  "wands-four": "25_Four_of_Wands_laqra",
  "wands-five": "26_Five_of_Wands_ggunmk",
  "wands-six": "27_Six_of_Wands_rrwwnp",
  "wands-seven": "28_Seven_of_Wands_omtet",
  "wands-eight": "29_Eight_of_Wands_m7x0i6",
  "wands-nine": "30_Nine_of_Wands_aojkp",
  "wands-ten": "31_Ten_of_Wands_aq0azu",
  "wands-page": "32_Page_of_Wands_zozh8",
  "wands-knight": "33_Knight_of_Wands_h41n",
  "wands-queen": "34_Queen_of_Wands_mx2oqw",
  "wands-king": "35_King_of_Wands_ocm4o",
  "cups-ace": "36_Ace_of_Cups_lmyo3",
  "cups-two": "37_Two_of_Cups_vbvzq",
  "cups-three": "38_Three_of_Cups_i7rlbl",
  "cups-four": "39_Four_of_Cups_yzht0",
  "cups-five": "40_Five_of_Cups_fezato",
  "cups-six": "41_Six_of_Cups_oqlq3",
  "cups-seven": "42_Seven_of_Cups_jwl1i",
  "cups-eight": "43_Eight_of_Cups_qwdmhv",
  "cups-nine": "44_Nine_of_Cups_wgfbpi",
  "cups-ten": "45_Ten_of_Cups_iw8qme",
  "cups-page": "46_Page_of_Cups_tljic",
  "cups-knight": "47_Knight_of_Cups_gbocl",
  "cups-queen": "48_Queen_of_Cups_idlim",
  "cups-king": "49_King_of_Cups_idlim",
  "swords-ace": "50_Ace_of_Swords_bdqs",
  "swords-two": "51_Two_of_Swords_wdfwc",
  "swords-three": "52_Three_of_Swords_nvcgf",
  "swords-four": "53_Four_of_Swords_ivroe",
  "swords-five": "54_Five_of_Swords_koz9b",
  "swords-six": "55_Six_of_Swords_mdum3",
  "swords-seven": "56_Seven_of_Swords_vv8coa",
  "swords-eight": "57_Eight_of_Swords_cra0d",
  "swords-nine": "58_Nine_of_Swords_wdlil7",
  "swords-ten": "59_Ten_of_Swords_nyulxr",
  "swords-page": "60_Page_of_Swords_wysolw",
  "swords-knight": "61_Knight_of_Swords_efn0te",
  "swords-queen": "62_Queen_of_Swords_rrnnj3",
  "swords-king": "63_King_of_Swords_env2fk",
  "pentacles-ace": "64_Ace_of_Pentacles_yes80s",
  "pentacles-two": "65_Two_of_Pentacles_puwghn",
  "pentacles-three": "66_Three_of_Pentacles_ys1gsv",
  "pentacles-four": "67_Four_of_Pentacles_lhohyp",
  "pentacles-five": "68_Five_of_Pentacles_wh5nmk",
  "pentacles-six": "69_Six_of_Pentacles_rjdiwl",
  "pentacles-seven": "70_Seven_of_Pentacles_wqegm0",
  "pentacles-eight": "71_Eight_of_Pentacles_badshe",
  "pentacles-nine": "72_Nine_of_Pentacles_obm1w7",
  "pentacles-ten": "73_Ten_of_Pentacles_wi6vzp",
  "pentacles-page": "74_Page_of_Pentacles_qyfqiu",
  "pentacles-knight": "75_Knight_of_Pentacles_jvbmuf",
  "pentacles-queen": "76_Queen_of_Pentacles_wlsy73",
  "pentacles-king": "77_King_of_Pentacles_gqho9y",
};

let activeCalendarFilter = "all";
let activeOracleTopic = "overall";
let analyzedQuestion = "";
let questionAnalysis = null;
let currentProfile = null;
let predictionMade = false;
let tarotReadingMade = false;
let activeTarotSpread = "day";
let activeTarotTopic = "overall";
let shuffledTarotDeck = [];
let visibleTarotDeck = [];
let selectedTarotCards = [];
let tarotHasShuffled = false;

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

function isBeforeApproxLichun(date) {
  return date.getMonth() === 0 || (date.getMonth() === 1 && date.getDate() < 4);
}

function solarYear(date) {
  return isBeforeApproxLichun(date) ? date.getFullYear() - 1 : date.getFullYear();
}

function solarMonthInfo(date) {
  let selected = solarMonthStarts[solarMonthStarts.length - 1];
  solarMonthStarts.forEach((item) => {
    if (date.getMonth() > item.month || (date.getMonth() === item.month && date.getDate() >= item.day)) {
      selected = item;
    }
  });
  return selected;
}

function monthStemIndex(yearStemIndex, monthBranchIndex) {
  const tigerStemByYearStem = [2, 4, 6, 8, 0, 2, 4, 6, 8, 0];
  const tigerOffset = mod(monthBranchIndex - 2, 12);
  return mod(tigerStemByYearStem[yearStemIndex] + tigerOffset, 10);
}

function getChart(date, hour) {
  const baziYear = solarYear(date);
  const yearIndex = mod(baziYear - 4, 60);
  const monthInfo = solarMonthInfo(date);
  const monthBranch = monthInfo.branch;
  const monthStem = monthStemIndex(mod(yearIndex, 10), monthBranch);
  const dayIndex = mod(daysSinceBase(date), 60);
  const hourBranch = hour === 23 ? 0 : mod(Math.floor((hour + 1) / 2), 12);
  const hourStem = mod((mod(dayIndex, 10) % 5) * 2 + hourBranch, 10);

  return {
    year: { ...pillarFromIndex(yearIndex), source: `ปีจีนเริ่มประมาณ立春 ${baziYear}` },
    month: { stem: stems[monthStem], branch: branches[monthBranch], index: indexFromStemBranch(monthStem, monthBranch), solarTerm: monthInfo },
    day: { ...pillarFromIndex(dayIndex), source: "คำนวณจากวงจร 60 วัน" },
    hour: { stem: stems[hourStem], branch: branches[hourBranch], index: indexFromStemBranch(hourStem, hourBranch), source: "ยามจีน 2 ชั่วโมง" },
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
  let score = 24;
  pillars.forEach((p) => {
    if (p.stem.element === dayElement) score += 8;
    if (p.branch.element === dayElement) score += 10;
    if (p.stem.element === mother) score += 6;
    if (p.branch.element === mother) score += 7;
    p.branch.hidden.forEach((idx, hiddenIndex) => {
      const hiddenElement = stems[idx].element;
      const weight = hiddenIndex === 0 ? 3 : 1.5;
      if (hiddenElement === dayElement) score += weight;
      if (hiddenElement === mother) score += weight * 0.8;
    });
  });
  if (chart.month.branch.element === dayElement) score += 18;
  if (chart.month.branch.element === mother) score += 12;
  return Math.max(12, Math.min(96, score));
}

function usefulElements(dayElement, score) {
  const i = elementOrder.indexOf(dayElement);
  if (score >= 58) {
    return [elementOrder[mod(i + 1, 5)], elementOrder[mod(i + 2, 5)], elementOrder[mod(i + 3, 5)]];
  }
  return [elementOrder[i], elementOrder[mod(i - 1, 5)], elementOrder[mod(i + 1, 5)]];
}

function unfavorableElements(dayElement, score) {
  const i = elementOrder.indexOf(dayElement);
  return score >= 58
    ? [dayElement, elementOrder[mod(i - 1, 5)]]
    : [elementOrder[mod(i + 2, 5)], elementOrder[mod(i + 3, 5)]];
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

function dominantRelations(chart) {
  const counts = new Map();
  [chart.year, chart.month, chart.hour].forEach((p) => {
    const direct = relation(chart.day.stem, p.stem);
    counts.set(direct[1], {
      han: direct[0],
      label: direct[1],
      meaning: direct[2],
      count: (counts.get(direct[1])?.count || 0) + 1.35,
    });
    p.branch.hidden.forEach((idx) => {
      const hidden = relation(chart.day.stem, stems[idx]);
      counts.set(hidden[1], {
        han: hidden[0],
        label: hidden[1],
        meaning: hidden[2],
        count: (counts.get(hidden[1])?.count || 0) + 0.45,
      });
    });
  });
  return [...counts.values()].sort((a, b) => b.count - a.count);
}

function elementRole(dayElement) {
  const i = elementOrder.indexOf(dayElement);
  return {
    self: dayElement,
    output: elementOrder[mod(i + 1, 5)],
    wealth: elementOrder[mod(i + 2, 5)],
    officer: elementOrder[mod(i + 3, 5)],
    resource: elementOrder[mod(i - 1, 5)],
  };
}

function countRelations(chart) {
  const counts = {};
  [chart.year, chart.month, chart.hour].forEach((p) => {
    [p.stem, ...p.branch.hidden.map((idx) => stems[idx])].forEach((stem) => {
      const r = relation(chart.day.stem, stem);
      counts[r[1]] = (counts[r[1]] || 0) + 1;
    });
  });
  return counts;
}

function chartInteractions(chart, targetPillar = null) {
  const target = targetPillar || chart.day;
  return {
    clash: branchMatches(chart, target.branch, branchClashes),
    combine: branchMatches(chart, target.branch, branchCombinations),
    harm: branchMatches(chart, target.branch, branchHarms),
    punishment: branchMatches(chart, target.branch, branchPunishments),
    stemCombine: stemCombinationMatches(chart, target.stem),
  };
}

function chartContext(chart, score) {
  const dm = chart.day.stem;
  const useful = usefulElements(dm.element, score);
  const unfavorable = unfavorableElements(dm.element, score);
  const dominant = dominantElements(chart);
  const relations = dominantRelations(chart);
  const roles = elementRole(dm.element);
  const relationCounts = countRelations(chart);
  const weak = [...dominant].reverse().slice(0, 2).map(([e]) => e);
  const monthEnergy = chart.month.branch.element;
  return {
    dm,
    useful,
    unfavorable,
    dominant,
    relations,
    roles,
    relationCounts,
    topRelation: relations[0],
    weak,
    monthEnergy,
    interactions: chartInteractions(chart),
    seasonNote: seasonalGuides[monthEnergy],
    profile: stemProfiles[dm.element],
    strengthLabel: score >= 70 ? "ดวงมีกำลังมาก" : score >= 48 ? "ดวงค่อนข้างสมดุล" : "ดวงต้องการแรงสนับสนุน",
  };
}

function chartPillarEntries(chart) {
  return [
    ["ปี", chart.year],
    ["เดือน", chart.month],
    ["วัน", chart.day],
    ["ยาม", chart.hour],
  ];
}

function branchMatches(chart, todayBranch, matchMap) {
  const targets = matchMap[todayBranch.han] || [];
  return chartPillarEntries(chart)
    .filter(([, pillar]) => targets.includes(pillar.branch.han))
    .map(([label, pillar]) => ({ label, branch: pillar.branch }));
}

function stemCombinationMatches(chart, todayStem) {
  const combo = stemCombinations[todayStem.han];
  if (!combo) return [];
  return chartPillarEntries(chart)
    .filter(([, pillar]) => pillar.stem.han === combo.pair)
    .map(([label, pillar]) => ({ label, stem: pillar.stem, element: combo.element }));
}

function dailyScore(chart, score, today = new Date()) {
  const ctx = chartContext(chart, score);
  const todayPillar = pillarFromIndex(daysSinceBase(today));
  const stemRelation = relation(chart.day.stem, todayPillar.stem);
  const branchMatch = ctx.useful.includes(todayPillar.branch.element);
  const stemMatch = ctx.useful.includes(todayPillar.stem.element);
  const sameBranch = todayPillar.branch.han === chart.day.branch.han;
  const monthSupport = todayPillar.branch.element === chart.month.branch.element;
  const clashMatches = branchMatches(chart, todayPillar.branch, branchClashes);
  const combinationMatches = branchMatches(chart, todayPillar.branch, branchCombinations);
  const harmMatches = branchMatches(chart, todayPillar.branch, branchHarms);
  const punishmentMatches = branchMatches(chart, todayPillar.branch, branchPunishments);
  const stemCombos = stemCombinationMatches(chart, todayPillar.stem);
  const tenGodScore = {
    "เพื่อนร่วมทาง": 2,
    "แรงแข่งขัน": score >= 70 ? 2 : -5,
    "พรสวรรค์": 7,
    "นักแสดงออก": score >= 70 ? 5 : 1,
    "รายได้เสริม": 8,
    "ทรัพย์หลัก": 7,
    "แรงกดดัน": score >= 70 ? 4 : -6,
    "ระเบียบ": 5,
    "ญาณ/กลยุทธ์": 5,
    "ผู้สนับสนุน": 6,
  }[stemRelation[1]] || 0;
  const components = [
    { label: "ฐานวัน", points: 46, detail: `ตั้งต้นจากเสาวัน ${todayPillar.stem.han}${todayPillar.branch.han}` },
    {
      label: "ก้านฟ้า",
      points: stemMatch ? 14 : -4,
      detail: `พลังหลักของวันนี้เป็นธาตุ${todayPillar.stem.element} ${stemMatch ? "ซึ่งช่วยเปิดทางให้ดวงนี้" : "ซึ่งยังไม่ใช่แรงหนุนหลักของดวงนี้"}`,
    },
    {
      label: "กิ่งดิน",
      points: branchMatch ? 12 : -3,
      detail: `บรรยากาศของวันนี้เป็นธาตุ${todayPillar.branch.element} ${branchMatch ? "ช่วยเติมธาตุที่ดวงต้องการ" : "ยังไม่เติมธาตุหลักของดวงนี้"}`,
    },
    {
      label: "สิบเทพวันนี้",
      points: tenGodScore,
      detail: `เมื่อเทียบกับตัวตนหลักของดวง วันนี้กระตุ้นเรื่อง “${stemRelation[1]}” (${stemRelation[2]})`,
    },
    ...(sameBranch ? [{ label: "กิ่งวันซ้ำ", points: 4, detail: `กิ่งวันนี้ซ้ำกับกิ่งวันเกิด ${chart.day.branch.han} ทำให้เรื่องตัวเองเด่นขึ้น` }] : []),
    ...(monthSupport ? [{ label: "ฤดูกาลหนุน", points: 5, detail: `กิ่งวันนี้เป็นธาตุเดียวกับเดือนเกิด ${chart.month.branch.han}` }] : []),
    ...combinationMatches.map((item) => ({
      label: "กิ่ง合",
      points: 8,
      detail: `มีแรงส่งเสริมกับ${item.label} ช่วยให้เรื่องนั้นเปิดง่ายขึ้น`,
    })),
    ...clashMatches.map((item) => ({
      label: "กิ่ง冲",
      points: -12,
      detail: `มีแรงปะทะกับ${item.label} ควรลดการตัดสินใจแบบชนตรง ๆ`,
    })),
    ...harmMatches.map((item) => ({
      label: "กิ่ง害",
      points: -7,
      detail: `มีจุดรบกวนกับ${item.label} ระวังเรื่องเล็กที่ค้างสะสม`,
    })),
    ...punishmentMatches.map((item) => ({
      label: "กิ่ง刑",
      points: -6,
      detail: `มีแรงกดซ้ำกับ${item.label} ระวังตัดสินใจแข็งหรือกดดันตัวเองเกินไป`,
    })),
    ...stemCombos.map((item) => ({
      label: "ก้าน合",
      points: 6,
      detail: `ก้านวันนี้เข้าคู่กับ${item.label} ช่วยเปิดพลังธาตุ${item.element}`,
    })),
    {
      label: "จังหวะเฉพาะดวง",
      points: mod(chart.day.index + chart.hour.index + today.getDate(), 7) - 3,
      detail: `ปรับจากเสาวันเกิดและยามเกิดของดวงนี้`,
    },
  ];
  const value = Math.min(99, Math.max(28, components.reduce((sum, item) => sum + item.points, 0)));
  return { value, todayPillar, stemRelation, branchMatch, stemMatch, sameBranch, monthSupport, clashMatches, combinationMatches, harmMatches, punishmentMatches, stemCombos, components };
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

function pickBySeed(items, seed) {
  return items[mod(seed, items.length)];
}

function hashString(value) {
  return [...value].reduce((hash, char) => mod((hash * 31) + char.charCodeAt(0), 2147483647), 7);
}

function seededRandom(seed) {
  let value = mod(seed || 1, 2147483647);
  return () => {
    value = mod(value * 48271, 2147483647);
    return value / 2147483647;
  };
}

function shuffleBySeed(items, seed) {
  const random = seededRandom(seed);
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function tarotImage(publicId, width = 460) {
  return `https://res.cloudinary.com/${cloudinaryCloud}/image/upload/f_auto,q_auto,w_${width}/${publicId}`;
}

function resizeCloudinaryUrl(url, width = 460) {
  if (!url) return "";
  if (url.includes("/image/upload/q_auto/f_auto/")) {
    return url.replace("/image/upload/q_auto/f_auto/", `/image/upload/f_auto,q_auto,w_${width}/`);
  }
  return url.replace("/image/upload/", `/image/upload/f_auto,q_auto,w_${width}/`);
}

function tarotCardImage(card, width = 460) {
  const directUrl = tarotCardUrlsByNumber[String(card.number)];
  if (directUrl) return resizeCloudinaryUrl(directUrl, width);

  const publicId = tarotKnownPublicIds[card.id];
  return publicId ? tarotImage(publicId, width) : "";
}

function tarotCardBackImage(width = 220) {
  return resizeCloudinaryUrl(tarotCardBackUrl, width);
}

function tarotSpreadConfig(spread = activeTarotSpread) {
  const spreads = {
    day: {
      label: "วันนี้",
      cards: 1,
      title: "ดวงวันนี้",
      summary: "เลือกไพ่ 1 ใบ เพื่ออ่านพลังวันนี้ แล้วแยกผลเป็นภาพรวม งาน เงิน ความรัก ควรระวัง และคำแนะนำ",
      positions: ["พลังวันนี้"],
    },
    week: {
      label: "สัปดาห์นี้",
      cards: 7,
      title: "ดวงสัปดาห์นี้",
      summary: "เลือกไพ่ 7 ใบ เพื่ออ่านแนวโน้มรายวัน พร้อมสรุปภาพรวมของสัปดาห์",
      positions: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    },
    month: {
      label: "เดือนนี้",
      cards: 10,
      title: "ดวงเดือนนี้ 10 ใบ",
      summary: "เลือกไพ่ 10 ใบ เพื่ออ่านสถานการณ์หลัก สิ่งท้าทาย รากของเรื่อง แนวโน้ม และผลลัพธ์โดยรวมของเดือนนี้",
      positions: ["Career", "Finance", "Love", "Health", "Family", "Travel", "Learning", "Opportunity", "Challenge", "Advice"],
    },
  };
  return spreads[spread] || null;
}

function tarotTopicText(topic) {
  return tarotTopics[topic] || tarotTopics.overall;
}

function tarotCardEnergy(card) {
  if (card.arcana === "major") return "จังหวะสำคัญที่ควรรับฟังเป็นพิเศษ";
  const suitEnergy = {
    wands: "แรงผลัก การเริ่มต้น และการลงมือ",
    cups: "ความรู้สึก ความสัมพันธ์ และการเยียวยา",
    swords: "ความคิด การสื่อสาร และการตัดสินใจ",
    pentacles: "ความมั่นคง เงิน งานจริง และสุขภาพกาย",
  };
  return suitEnergy[card.suit] || "พลังภาพรวมของสถานการณ์";
}

function tarotTopicAction(card, topic, reversed) {
  const topicRules = {
    overall: {
      upright: "จัดลำดับเรื่องสำคัญก่อน แล้วเดินทีละขั้นให้เห็นผลจริง",
      reversed: "ชะลอการสรุปภาพรวม เพราะยังมีข้อมูลหรืออารมณ์ที่ทำให้มองไม่ครบ",
    },
    work: {
      upright: "ใช้พลังใบนี้กับงานที่ต้องสื่อสาร ตัดสินใจ วางแผน หรือผลักงานให้จบ",
      reversed: "ระวังรับงานเกินกำลัง สื่อสารเร็วเกินไป หรือข้ามขั้นตอนที่ควรตรวจ",
    },
    money: {
      upright: "เหมาะกับการดูตัวเลข วางงบ ตรวจเงื่อนไข และเลือกทางที่จับต้องได้",
      reversed: "หลีกเลี่ยงการจ่ายตามอารมณ์ ลงทุนเพราะกลัวพลาด หรือเชื่อข้อมูลด้านเดียว",
    },
    love: {
      upright: "พูดคุยอย่างตรงไปตรงมาแต่ยังรักษาความรู้สึกของกันและกัน",
      reversed: "อย่าเร่งคำตอบหรือใช้ความเงียบเป็นการทดสอบ ควรให้พื้นที่ก่อนคุยต่อ",
    },
    mind: {
      upright: "กลับมาอยู่กับสิ่งที่ควบคุมได้ หายใจให้ช้าลง แล้วเลือกก้าวเล็กที่ทำได้วันนี้",
      reversed: "ลดสิ่งกระตุ้นและพักจากการคิดวน ก่อนตัดสินใจเรื่องที่ใช้พลังใจสูง",
    },
  };
  const rule = topicRules[topic] || topicRules.overall;
  const suitHint = card.topic && card.topic === topic
    ? ` ไพ่ใบนี้ตรงกับหัวข้อ${tarotTopicText(topic)} จึงให้น้ำหนักมากกว่าปกติ`
    : "";
  return `${reversed ? rule.reversed : rule.upright}${suitHint}`;
}

function tarotPositionReading(position, card, topic, reversed) {
  const topicName = tarotTopicText(topic);
  const orientation = reversed ? "พลังติดขัด/ต้องทบทวน" : "พลังเปิดทาง";
  const positionHint = {
    "พลังวันนี้": "เป็นบรรยากาศหลักของวันนี้",
    "Current Energy": "คือพลังหลักที่ครอบวันนี้",
    "Work": "บอกจังหวะด้านงานและการลงมือ",
    "Money": "บอกจังหวะการเงินและการตัดสินใจเรื่องทรัพย์",
    "Love": "สะท้อนความสัมพันธ์และการสื่อสารด้วยใจ",
    "Advice": "คือคำแนะนำที่ควรถือไว้ก่อนตัดสินใจ",
    "Monday": "คือจังหวะของวันจันทร์",
    "Tuesday": "คือจังหวะของวันอังคาร",
    "Wednesday": "คือจังหวะของวันพุธ",
    "Thursday": "คือจังหวะของวันพฤหัสบดี",
    "Friday": "คือจังหวะของวันศุกร์",
    "Saturday": "คือจังหวะของวันเสาร์",
    "Sunday": "คือจังหวะของวันอาทิตย์",
    "Career": "คือทิศทางงานและเป้าหมายของเดือนนี้",
    "Finance": "คือจังหวะการเงิน รายรับ รายจ่าย และความมั่นคง",
    "Health": "คือสัญญาณด้านพลังใจ พลังงาน และการดูแลตัวเอง",
    "Family": "คือเรื่องบ้าน ครอบครัว หรือคนใกล้ตัว",
    "Travel": "คือจังหวะการเดินทาง การย้ายที่ หรือการเปลี่ยนสภาพแวดล้อม",
    "Learning": "คือสิ่งที่ควรเรียนรู้ ปรับตัว หรือทบทวน",
    "Opportunity": "คือโอกาสที่ควรมองเห็นและคว้าจังหวะ",
    "Challenge": "คือข้อท้าทายที่ควรระวังในเดือนนี้",
    "สถานการณ์หลักของเดือน": "คือแกนหลักที่เดือนนี้จะพาคุณเจอ",
    "สิ่งที่ขวาง/ท้าทาย": "คือเงื่อนไขที่ทำให้เรื่องไม่ไหลง่าย",
    "สิ่งที่เพิ่งผ่านมา": "สะท้อนเหตุการณ์หรืออารมณ์ที่เพิ่งส่งผลถึงตอนนี้",
    "สิ่งที่ควรโฟกัส": "บอกเรื่องที่ควรใช้แรงและเวลาให้ชัด",
    "แนวโน้มใกล้ ๆ": "คือทิศทางที่จะเริ่มเห็นในช่วงถัดไป",
    "ตัวผู้ถาม": "สะท้อนท่าทีและพลังของคุณในเรื่องนี้",
    "สิ่งแวดล้อม/คนรอบตัว": "บอกแรงจากคนรอบตัวหรือบริบทภายนอก",
    "สิ่งที่ควรทำ": "คือวิธีใช้พลังให้เกิดผล",
    "สิ่งที่ควรระวัง": "คือจุดที่ควรตรวจให้รอบคอบ",
    "แกนสถานการณ์": "บอกแกนของเรื่องในช่วงนี้",
    "สิ่งที่ท้าทาย": "ชี้แรงต้านหรือเงื่อนไขที่ต้องจัดการ",
    "รากของเรื่อง": "อธิบายเหตุลึกที่ทำให้เรื่องนี้สำคัญ",
    "อดีตใกล้": "สะท้อนสิ่งที่เพิ่งส่งผลมาถึงตอนนี้",
    "เป้าหมาย": "บอกภาพที่ใจอยากไปให้ถึง",
    "แนวโน้มถัดไป": "แสดงจังหวะที่จะเริ่มเห็นต่อจากนี้",
    "ตัวคุณ": "สะท้อนท่าทีของผู้ถาม",
    "สิ่งรอบตัว": "บอกแรงจากคน สถานการณ์ หรือสภาพแวดล้อม",
    "ความหวัง/ความกังวล": "เผยความคาดหวังหรือความกลัวที่มีผลต่อคำถาม",
    "ผลลัพธ์": "สรุปทิศทางหากยังเดินตามรูปแบบเดิม",
    "สถานการณ์ปัจจุบัน": "คือหน้าตาของเรื่องตอนนี้",
    "อุปสรรค/แรงต้าน": "คือสิ่งที่ทำให้เรื่องไม่ไหลลื่น",
    "อดีตที่ส่งผล": "คือบทเรียนหรือเหตุการณ์ที่ยังทิ้งแรงไว้",
    "สิ่งที่มองเห็น/เป้าหมาย": "คือสิ่งที่ผู้ถามกำลังมองหา",
    "อนาคตใกล้": "คือจังหวะที่ใกล้จะเกิดขึ้น",
    "ท่าทีของคุณ": "คือวิธีที่ผู้ถามกำลังรับมือ",
    "อิทธิพลรอบตัว": "คือแรงจากคนหรือบริบทภายนอก",
    "ความหวัง/ความกลัว": "คือความรู้สึกที่ดึงคำตอบให้เอียง",
    "ผลลัพธ์โดยรวม": "คือภาพรวมปลายทางของหน้าไพ่ชุดนี้",
  };
  const lead = positionHint[position] || "เป็นส่วนหนึ่งของคำตอบ";
  if (reversed) {
    return `${topicName}: ${lead} ในรูปแบบ${orientation}. ${card.th} ชี้ให้ตรวจเรื่อง “${card.keyword}” ที่อาจยังไม่ลงตัว. ${tarotTopicAction(card, topic, true)}.`;
  }
  return `${topicName}: ${lead} ในรูปแบบ${orientation}. ${card.th} เปิดพลังด้าน${tarotCardEnergy(card)} โดยจุดเด่นคือ “${card.keyword}”. ${tarotTopicAction(card, topic, false)}.`;
}

function tarotSummary(cards, topic, spread) {
  const majorCount = cards.filter((card) => card.card.arcana === "major").length;
  const reversedCount = cards.filter((card) => card.reversed).length;
  const topicHits = cards.filter((card) => card.card.topic === topic).length;
  const firstCard = cards[0]?.card;
  const outcomeCard = cards[cards.length - 1]?.card || firstCard;
  const spreadInfo = tarotSpreadConfig(spread);
  const tone = majorCount >= Math.max(2, Math.floor(cards.length / 3)) ? "มีบทเรียนใหญ่หรือการตัดสินใจสำคัญ" : "เป็นจังหวะที่จัดการได้ด้วยการลงมือทีละขั้น";
  const caution = reversedCount >= Math.ceil(cards.length / 2)
    ? "ไพ่กลับหัวมาก แนะนำให้ชะลอ ตรวจข้อมูล และไม่รีบสรุป"
    : "ไพ่ส่วนใหญ่เปิดทางพอสมควร แต่ยังควรวางแผนก่อนตัดสินใจ";
  const topicLine = topicHits
    ? `มีไพ่ที่ตรงกับหัวข้อ ${tarotTopicText(topic)} ${topicHits} ใบ จึงอ่านเรื่องนี้ได้ค่อนข้างชัด`
    : `หัวข้อ ${tarotTopicText(topic)} ต้องอ่านร่วมกับภาพรวมและบริบทของคำถาม`;
  const opening = firstCard ? `แกนแรกเปิดด้วย ${firstCard.th} จึงเริ่มจากเรื่อง “${firstCard.keyword}”` : "";
  const ending = outcomeCard ? `ทิศทางปลายทางโยงกับ ${outcomeCard.th} คือ “${outcomeCard.keyword}”` : "";
  return `${spreadInfo.label}: ${tone}. ${topicLine}. ${opening}. ${ending}. ${caution}.`;
}

function tarotPlainSummary(cards, topic) {
  const first = cards[0]?.card;
  const second = cards[1]?.card;
  const last = cards[cards.length - 1]?.card || first;
  const reversedCount = cards.filter((item) => item.reversed).length;
  const topicCards = cards.filter((item) => item.card.topic === topic);
  const mood = reversedCount >= Math.ceil(cards.length / 2)
    ? "ควรชะลอและตรวจความพร้อมก่อนเดินหน้า"
    : "เดินหน้าได้ แต่ควรมีแผนและจังหวะที่ชัด";
  const focus = topicCards[0]?.card || first;
  return {
    headline: focus ? `${tarotTopicText(topic)}ช่วงนี้เด่นที่ “${focus.keyword}”` : "อ่านไพ่ครบแล้วระบบจะสรุปให้",
    body: first && last
      ? `ไพ่เปิดเรื่องด้วย ${first.th} และปลายทางโยงกับ ${last.th} ภาพรวมจึงเป็นจังหวะที่${mood}. ถ้ามีคำถามเฉพาะ ให้ใช้คำตอบนี้เป็นแนวทางทบทวนก่อนตัดสินใจจริง`
      : "",
    next: second ? `เริ่มจาก ${second.advice}` : "เริ่มจากเรื่องเล็กที่ควบคุมได้ก่อน",
  };
}

function tarotActionSummary(cards, topic) {
  const uprightCards = cards.filter((item) => !item.reversed);
  const reversedCards = cards.filter((item) => item.reversed);
  const strongest = uprightCards[0]?.card || cards[0]?.card;
  const caution = reversedCards[0]?.card || cards[cards.length - 1]?.card;
  const outcome = cards[cards.length - 1]?.card || strongest;
  return {
    main: strongest ? `เริ่มจากพลังของ ${strongest.th}: ใช้ “${strongest.keyword}” เป็นแกนตัดสินใจ` : "เลือกไพ่ครบแล้วระบบจะสรุปแกนคำตอบให้",
    action: strongest ? tarotTopicAction(strongest, topic, false) : "",
    caution: caution ? `${caution.th}: ระวังด้าน “${caution.keyword}” โดยเฉพาะเมื่อเรื่องเริ่มเร่งหรือมีข้อมูลไม่ครบ` : "",
    outcome: outcome ? `หากเดินตามคำแนะนำ ทิศทางจะไปสู่บทเรียนของ ${outcome.th}: ${outcome.advice}` : "",
  };
}

function tarotPositionLabel(position, index, spread = activeTarotSpread) {
  const monthLabels = [
    "สถานะของเจ้าชะตา",
    "สถานการณ์ทั่วไปในช่วงนี้",
    "สิ่งที่มุ่งหวัง",
    "อดีตที่ผ่านมา",
    "สิ่งที่เพิ่งเกิดขึ้น",
    "อนาคตที่จะเกิดขึ้น",
    "ปัญหาและแนวทางแก้ไข",
    "อิทธิพลรอบข้าง",
    "ความคิดภายในใจ",
    "บทสรุป",
  ];
  const weekLabels = ["วันจันทร์", "วันอังคาร", "วันพุธ", "วันพฤหัสบดี", "วันศุกร์", "วันเสาร์", "วันอาทิตย์"];
  if (spread === "month") return monthLabels[index] || position;
  if (spread === "week") return weekLabels[index] || position;
  return "พลังวันนี้";
}

function renderDailyReadingSections(cardItem) {
  const card = cardItem.card;
  const reversed = cardItem.reversed;
  const sections = ["Current Energy", "Work", "Money", "Love", "Advice"];
  return `
    <div class="tarot-insight-grid daily-reading-grid">
      ${sections.map((position) => `
        <div>
          <span>${position}</span>
          <strong>${tarotPositionReading(position, card, "overall", reversed)}</strong>
        </div>
      `).join("")}
    </div>
  `;
}

function updateTarotStepper() {
  const spread = tarotSpreadConfig();
  const complete = spread && selectedTarotCards.length === spread.cards;
  const currentStep = complete ? "reveal" : tarotHasShuffled ? "select" : "shuffle";
  if (!document.querySelector("#tarotStepper")) return;
  document.querySelectorAll("#tarotStepper .stepper-item").forEach((item) => {
    item.classList.toggle("is-active", item.dataset.step === currentStep);
    item.classList.toggle("is-done", item.dataset.step === "shuffle" && tarotHasShuffled);
  });
}

function tarotCounterText(spread) {
  return `เลือกแล้ว ${selectedTarotCards.length} / ${spread.cards} ใบ`;
}

function updateTarotSelectionState() {
  const spread = tarotSpreadConfig();
  if (!spread) {
    els.tarotSelectionTitle.textContent = "เลือกช่วงคำทำนายก่อน";
    els.tarotSelectionHelp.textContent = "เลือกวันนี้ สัปดาห์นี้ หรือเดือนนี้ แล้วระบบจะสับไพ่ชุดใหม่ให้";
    if (els.tarotPickProgress) els.tarotPickProgress.style.width = "0%";
    els.tarotDeckGrid.innerHTML = `
      <div class="tarot-start-hint">
        <strong>ยังไม่ได้เลือกช่วงเวลา</strong>
        <span>แตะปุ่มด้านบนเพื่อเริ่มเลือกไพ่</span>
      </div>
    `;
    return;
  }
  const nextPick = Math.min(selectedTarotCards.length + 1, spread.cards);
  els.tarotSelectionTitle.textContent = tarotHasShuffled
    ? selectedTarotCards.length >= spread.cards
      ? `เลือกครบ ${spread.cards} ใบแล้ว`
      : `เลือกไพ่ ${nextPick} จาก ${spread.cards}`
    : "กองไพ่ทาโรต์";
  els.tarotSelectionHelp.textContent = tarotHasShuffled ? `${tarotCounterText(spread)} · ${spread.summary}` : "กดสับไพ่เพื่อสุ่มไพ่ 54 ใบสำหรับเลือก";
  if (els.tarotPickProgress) {
    els.tarotPickProgress.style.width = `${Math.min(100, (selectedTarotCards.length / spread.cards) * 100)}%`;
  }
  els.shuffleTarotBtn.textContent = tarotHasShuffled ? "สับไพ่ใหม่" : "สับไพ่";
  updateTarotStepper();
  document.querySelectorAll(".deck-select-card").forEach((button) => {
    const selectedIndex = selectedTarotCards.findIndex((item) => String(item.deckIndex) === button.dataset.deckIndex);
    button.classList.toggle("is-selected", selectedIndex >= 0);
    const order = button.querySelector(".pick-order");
    if (order) order.textContent = selectedIndex >= 0 ? selectedIndex + 1 : "";
  });
}

function renderTarotDeck() {
  if (!tarotSpreadConfig()) {
    updateTarotSelectionState();
    return;
  }
  if (!tarotHasShuffled) {
    els.tarotDeckGrid.classList.add("is-deck-ready");
    els.tarotDeckGrid.classList.remove("is-card-selection");
    els.tarotDeckGrid.innerHTML = `
      <button class="tarot-deck-stack" type="button" id="tarotDeckStack" aria-label="กดเพื่อสับไพ่">
        <span class="deck-card-layer layer-one"></span>
        <span class="deck-card-layer layer-two"></span>
        <span class="deck-card-layer layer-three"></span>
        <span class="deck-card-label">กองไพ่ทาโรต์</span>
      </button>
    `;
    document.querySelector("#tarotDeckStack")?.addEventListener("click", resetTarotDeck);
    updateTarotSelectionState();
    return;
  }
  if (!visibleTarotDeck.length) {
    visibleTarotDeck = shuffledTarotDeck.slice(0, 54);
  }
  if (els.tarotDeckCount) els.tarotDeckCount.textContent = visibleTarotDeck.length;
  els.tarotDeckGrid.classList.remove("is-deck-ready");
  els.tarotDeckGrid.classList.add("is-card-selection");
  els.tarotDeckGrid.innerHTML = visibleTarotDeck.map((card, deckIndex) => `
    <button class="deck-select-card" type="button" data-deck-index="${deckIndex}" style="--deck-i: ${deckIndex};" aria-label="เลือกไพ่ใบที่ ${deckIndex + 1}">
      <img src="${tarotCardBackImage(180)}" alt="" onerror="this.remove()" />
      <span class="card-back-fallback">✦</span>
      <span class="pick-order"></span>
    </button>
  `).join("");
  document.querySelectorAll(".deck-select-card").forEach((button) => {
    button.addEventListener("click", () => {
      const deckIndex = Number(button.dataset.deckIndex);
      const selectedIndex = selectedTarotCards.findIndex((item) => item.deckIndex === deckIndex);
      if (selectedIndex >= 0) {
        selectedTarotCards.splice(selectedIndex, 1);
      } else if (selectedTarotCards.length < tarotSpreadConfig().cards) {
        const card = visibleTarotDeck[deckIndex];
        selectedTarotCards.push({ deckIndex, card, reversed: mod(hashString(`${card.id}|${deckIndex}|${selectedTarotCards.length}`), 5) === 0 });
      }
      tarotReadingMade = false;
      updateTarotSelectionState();
      if (selectedTarotCards.length === tarotSpreadConfig().cards) {
        window.setTimeout(renderTarotReading, 220);
      }
    });
  });
  updateTarotSelectionState();
}

function resetTarotDeck() {
  const seed = hashString(`${Date.now()}|${activeTarotSpread}|${Math.random()}`);
  shuffledTarotDeck = shuffleBySeed(tarotDeck, seed);
  visibleTarotDeck = shuffledTarotDeck.slice(0, 54);
  selectedTarotCards = [];
  tarotHasShuffled = true;
  tarotReadingMade = false;
  els.tarotWorkspace?.classList.remove("is-result-mode");
  renderTarotDeck();
  renderTarotEmpty();
}

function showTarotPicker() {
  const currentSpread = activeTarotSpread || "day";
  activeTarotSpread = currentSpread;
  selectedTarotCards = [];
  shuffledTarotDeck = [];
  visibleTarotDeck = [];
  tarotHasShuffled = false;
  tarotReadingMade = false;
  els.tarotWorkspace?.classList.remove("is-result-mode");
  document.querySelectorAll("#tarotSpreadTabs button").forEach((item) => {
    item.classList.toggle("is-active", item.dataset.spread === activeTarotSpread);
  });
  renderTarotDeck();
  renderTarotEmpty();
  els.tarotDeckGrid?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderTarotEmpty() {
  if (!els.tarotResult) return;
  const spread = tarotSpreadConfig();
  els.tarotMeta.textContent = spread ? `รอเลือกไพ่ · ${spread.label}` : "รอเลือกช่วงคำทำนาย";
  if (els.tarotDeckCount) els.tarotDeckCount.textContent = tarotDeck.length;
  if (!spread) {
    els.tarotResult.innerHTML = `
      <article class="tarot-empty">
        <span>เริ่มใหม่</span>
        <h3>เลือกช่วงคำทำนายก่อน</h3>
        <p>ระบบจะไม่เลือกค่าเริ่มต้นให้ และจะสับไพ่ใหม่ทุกครั้งที่เข้าหน้าไพ่ยิปซี</p>
      </article>
    `;
    return;
  }
  els.tarotResult.innerHTML = `
    <article class="tarot-empty">
      <span>พร้อมเริ่มอ่านไพ่</span>
      <h3>${spread.title}</h3>
      <p>${spread.summary} เลือกไพ่ให้ครบตามจำนวน ระบบจะเปิดผลทำนายให้อัตโนมัติ</p>
    </article>
  `;
}

function renderTarotReading() {
  const spread = activeTarotSpread;
  const topic = activeTarotTopic;
  const question = "";
  const spreadInfo = tarotSpreadConfig(spread);
  if (!spreadInfo) {
    updateTarotSelectionState();
    return;
  }
  if (selectedTarotCards.length !== spreadInfo.cards) {
    updateTarotSelectionState();
    return;
  }
  const cards = spreadInfo.positions.map((position, index) => ({
    position,
    card: selectedTarotCards[index].card,
    reversed: selectedTarotCards[index].reversed,
  }));
  tarotReadingMade = true;
  els.tarotWorkspace?.classList.add("is-result-mode");
  els.tarotMeta.textContent = "";
  const questionLine = question ? `<p><strong>คำถาม:</strong> ${question}</p>` : "";
  els.tarotResult.innerHTML = `
    <article class="tarot-spread-board tarot-spread-board-${spread}">
      <h3>${spreadInfo.title}</h3>
      ${questionLine}
      <div class="tarot-spread-map">
        ${cards.map(({ position, card, reversed }, index) => `
          <a class="tarot-map-card" href="#tarot-reading-${index + 1}">
            <span>${index + 1}</span>
            <img src="${tarotCardImage(card, 260) || tarotCardBackImage(260)}" alt="${card.th}" onerror="this.onerror=null;this.src='${tarotCardBackImage(260)}'" />
            <strong>${tarotPositionLabel(position, index, spread)}</strong>
            <small>${card.th}${reversed ? " · ไพ่กลับหัว" : ""}</small>
          </a>
        `).join("")}
      </div>
    </article>
    <div class="tarot-reading-list">
      ${cards.map(({ position, card, reversed }, index) => `
        <article class="tarot-reading-item ${reversed ? "is-reversed" : ""}" id="tarot-reading-${index + 1}">
          <div class="tarot-reading-thumb">
            <img src="${tarotCardImage(card, 260) || tarotCardBackImage(260)}" alt="${card.th}" onerror="this.onerror=null;this.src='${tarotCardBackImage(260)}'" />
            ${reversed ? `<span class="reversed-badge">ไพ่กลับหัว</span>` : ""}
          </div>
          <div class="tarot-reading-copy">
            <span>ตำแหน่งที่ ${index + 1} ${tarotPositionLabel(position, index, spread)}</span>
            <h3>${card.th}${reversed ? " · ไพ่กลับหัว" : ""}</h3>
            <p class="tarot-card-name">ไพ่ที่ได้คือ ${card.th}${reversed ? " ในรูปแบบไพ่กลับหัว" : ""}</p>
            <p>${tarotPositionReading(position, card, topic, reversed)}</p>
          </div>
        </article>
      `).join("")}
    </div>
  `;
  els.tarotWorkspace?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function branchClashText(chart, todayPillar) {
  const targets = branchMatches(chart, todayPillar.branch, branchClashes);
  if (!targets.length) return "";
  return `วันนี้มีสัญญาณปะทะกับ${targets.map((item) => `${item.label}`).join(" / ")} จึงควรลดการคุยแบบชนตรง ๆ`;
}

function termNote(text) {
  return `<small class="formula-note">${text}</small>`;
}

function personalDailyAdvice(chart, ctx, daily, dayScore) {
  const todayPillar = daily.todayPillar;
  const relationName = daily.stemRelation[1];
  const monthRelation = relation(chart.day.stem, chart.month.stem);
  const hourRelation = relation(chart.day.stem, chart.hour.stem);
  const gender = els.gender.value || "ไม่ระบุ";
  const spouseElement = gender === "หญิง" ? ctx.roles.officer : ctx.roles.wealth;
  const spouseStar = gender === "หญิง" ? "ดาวคู่ครอง/สถานะความสัมพันธ์" : "ดาวคู่สัมพันธ์/แรงดึงดูด";
  const clashText = branchClashText(chart, todayPillar) || "ไม่พบแรงปะทะเด่นกับดวงเกิด";
  const harmText = daily.harmMatches.length ? `มีจุดรบกวนกับ${daily.harmMatches.map((item) => item.label).join(" / ")}` : "ไม่พบจุดรบกวนเด่น";
  const punishmentText = daily.punishmentMatches.length ? `มีแรงกดซ้ำกับ${daily.punishmentMatches.map((item) => item.label).join(" / ")}` : "ไม่พบแรงกดซ้ำเด่น";
  const workScore = (ctx.relationCounts["ระเบียบ"] || 0) + (ctx.relationCounts["แรงกดดัน"] || 0) + (ctx.relationCounts["ผู้สนับสนุน"] || 0) + (ctx.relationCounts["ญาณ/กลยุทธ์"] || 0);
  const moneyScore = (ctx.relationCounts["ทรัพย์หลัก"] || 0) + (ctx.relationCounts["รายได้เสริม"] || 0);
  const loveScore = ctx.dominant.find(([element]) => element === spouseElement)?.[1] || 0;
  return [
    [
      "งาน",
      `วันนี้เหมาะกับงานที่มีกรอบชัด ใช้ข้อมูลช่วยตัดสินใจ และค่อย ๆ ปิดทีละเรื่อง เพราะดวงมีแรงงาน/แรงกดดัน/ผู้สนับสนุนรวม ${workScore} จุด เดือนเกิดเน้น “${monthRelation[1]}” ส่วนพลังวันนี้เน้น “${relationName}” ${termNote(`สูตร: 官杀/印 · ธาตุงาน ${ctx.roles.officer} · ธาตุสนับสนุน ${ctx.roles.resource}`)}`,
    ],
    [
      "เงิน",
      `เรื่องเงินควรใช้ตัวเลขและเงื่อนไขที่ตรวจสอบได้เป็นหลัก ดวงนี้มีจุดเกี่ยวกับรายรับ/ทรัพย์ ${moneyScore} จุด และ${ctx.useful.includes(ctx.roles.wealth) ? "ธาตุทรัพย์อยู่ในกลุ่มที่ช่วยเปิดทาง" : "ธาตุทรัพย์ยังไม่ใช่แรงหนุนหลัก"} จึงเหมาะกับการเช็กสัญญา ราคา หรืองบก่อนตัดสินใจ ${termNote(`สูตร: 财星 · ธาตุทรัพย์ของ ${ctx.dm.han} คือ ${ctx.roles.wealth}`)}`,
    ],
    [
      "ความรัก",
      `ความสัมพันธ์ควรคุยด้วยจังหวะที่เปิดพื้นที่ให้อีกฝ่ายตอบ ไม่บีบให้สรุปทันที จุดคู่สัมพันธ์ของดวงนี้อยู่ที่ธาตุ ${spouseElement} น้ำหนักประมาณ ${loveScore.toFixed(1)} และยามเกิดเน้น “${hourRelation[1]}” ${termNote(`สูตร: ${spouseStar} · กิ่งวันเกิด ${chart.day.branch.han}${chart.day.branch.th}`)}`,
    ],
    [
      "ควรเลี่ยง",
      `${clashText}; ${harmText}; ${punishmentText}. ถ้าจะทำเรื่องใหญ่ ควรระวังวันที่คะแนนต่ำกว่า 70 และลดการใช้พลังแบบฝืน โดยเฉพาะธาตุที่ทำให้ดวงเสียสมดุล: ${ctx.unfavorable.join(" / ")} ${termNote("สูตร: ตรวจ冲/刑/害 และธาตุที่ไม่หนุนดวง")}`,
    ],
  ];
}

function personalTopicReading(topicKey, base, ctx, today, analysis, topicScore) {
  const topRelation = ctx.topRelation?.label || today.todayPillar.stem.element;
  const topGuide = relationActionGuides[topRelation] || relationActionGuides[today.stemRelation?.[1]] || { focus: base.focus, risk: base.avoid };
  const wealthCount = (ctx.relationCounts["ทรัพย์หลัก"] || 0) + (ctx.relationCounts["รายได้เสริม"] || 0);
  const officerCount = (ctx.relationCounts["ระเบียบ"] || 0) + (ctx.relationCounts["แรงกดดัน"] || 0);
  const outputCount = (ctx.relationCounts["พรสวรรค์"] || 0) + (ctx.relationCounts["นักแสดงออก"] || 0);
  const resourceCount = (ctx.relationCounts["ผู้สนับสนุน"] || 0) + (ctx.relationCounts["ญาณ/กลยุทธ์"] || 0);
  const topicLines = {
    overall: {
      title: `${ctx.strengthLabel} · เด่นที่${topRelation}`,
      high: `ภาพรวมวันนี้พอขยับได้ ให้เลือกเรื่องสำคัญเพียง 1 เรื่องก่อน แล้วใช้จุดเด่นของดวงคือ “${topRelation}” ช่วยพาไป`,
      low: `วันนี้ควรตั้งหลักก่อน ไม่ต้องเร่งทุกอย่างพร้อมกัน จุดที่ควรระวังคือการใช้พลังกับเรื่องที่ยังไม่ชัด`,
      focus: topGuide.focus,
      avoid: topGuide.risk,
    },
    work: {
      title: `งาน · มีแรงงาน ${officerCount} / แรงสนับสนุน ${resourceCount} / แรงสื่อสาร ${outputCount}`,
      high: `งานเดินได้ดีเมื่อมีขอบเขตชัด เหมาะกับการจัดลำดับ วางแผน เอกสาร หรือคุยงานที่ต้องมีหลักฐานรองรับ`,
      low: `งานยังควรประคอง ให้ลดงานแทรกและหลีกเลี่ยงการรับปากก่อนเห็นขอบเขตจริง`,
      focus: `ทำเป้าหมาย ขอบเขต และ next step ให้ชัด`,
      avoid: topGuide.risk,
    },
    money: {
      title: `เงิน · จุดทรัพย์ ${wealthCount} จุด`,
      high: `เรื่องเงินเหมาะกับสิ่งที่วัดผลได้ เช่น ราคา สัญญา ยอดค้าง หรืองบประมาณ ไม่ควรตัดสินใจจากความรู้สึกอย่างเดียว`,
      low: `เงินควรเน้นปิดรอยรั่วก่อนเพิ่มความเสี่ยง แยกเงินจำเป็น เงินลงทุน และเงินตามใจให้ชัด`,
      focus: `ตรวจตัวเลข เงื่อนไข และหลักฐานก่อนตอบตกลง`,
      avoid: ctx.profile.stress,
    },
    love: {
      title: `ความรัก · ต้องคุยให้มีพื้นที่`,
      high: `เหมาะกับการคุยแบบตรงแต่ไม่กดดัน บอกความต้องการให้ชัด และเปิดโอกาสให้อีกฝ่ายตอบในจังหวะของเขา`,
      low: `ถ้าคุยเรื่องสำคัญ ให้ชะลอคำพูดแรง ๆ และอย่ารีบสรุปแทนอีกฝ่าย`,
      focus: `ถามทีละประเด็น ฟังให้ครบ แล้วค่อยสรุป`,
      avoid: topGuide.risk,
    },
    health: {
      title: `สุขภาพใจ · ลดสิ่งรบกวนและกลับมาที่จังหวะตัวเอง`,
      high: `เหมาะกับการจัด routine เล็ก ๆ ที่ทำได้จริง เช่น พักเป็นรอบ ดื่มน้ำ เดินเบา ๆ หรือจัดพื้นที่ทำงาน`,
      low: `ใจอาจล้าง่ายถ้ารับข้อมูลมากเกินไป ให้ลดสิ่งกระตุ้นและแยกเรื่องที่ควบคุมได้ก่อน`,
      focus: ctx.useful.includes("น้ำ") ? "พักใจด้วยความเงียบ ดื่มน้ำ และลดหน้าจอ" : "จัดพื้นที่ ทำ checklist และพักเป็นรอบสั้น",
      avoid: `ฝืนทำหลายเรื่องพร้อมกันจนพักไม่พอ`,
    },
  };
  const personalized = topicLines[topicKey] || topicLines.overall;
  const questionTail = analysis
    ? ` คำถามนี้ถูกอ่านเป็น${analysis.intent} / ${analysis.urgency} / โทน${analysis.polarity}`
    : "";
  return {
    ...base,
    title: personalized.title,
    high: `${personalized.high}${questionTail}`,
    low: `${personalized.low}${questionTail}`,
    focus: personalized.focus,
    avoid: personalized.avoid,
    tone: topicScore >= 72 ? personalized.high : personalized.low,
  };
}

function todayReading(chart, score, today = new Date()) {
  const ctx = chartContext(chart, score);
  const daily = dailyScore(chart, score, today);
  const todayPillar = daily.todayPillar;
  const dayScore = daily.value;
  const relationName = daily.stemRelation[1];
  const dayGuide = elementDailyGuides[todayPillar.stem.element];
  const topGuide = relationActionGuides[ctx.topRelation?.label] || relationActionGuides[relationName];
  const usefulText = ctx.useful.map((e) => `${elementHan[e]} ${e}`).join(" / ");
  const seed = daysSinceBase(today) + chart.day.index;
  const lucky = [mod(seed + score, 10), mod(seed + chart.month.index, 10), mod(seed + chart.hour.index + ctx.useful.length, 10)].join(" · ");
  const startHour = mod(seed, 12) * 2;
  const luckyTime = `${String(startHour).padStart(2, "0")}:00-${String(mod(startHour + 2, 24)).padStart(2, "0")}:00`;
  const relationInsight = relationProfiles[relationName] || daily.stemRelation[2];
  const opening = dayScore >= 82 ? "วันนี้ค่อนข้างเปิดทาง" : dayScore >= 68 ? "วันนี้ค่อย ๆ ขยับได้" : "วันนี้ควรประคองจังหวะ";
  const positiveFactors = daily.components.filter((item) => item.points > 0).sort((a, b) => b.points - a.points);
  const negativeFactors = daily.components.filter((item) => item.points < 0).sort((a, b) => a.points - b.points);
  const mainPositive = positiveFactors.find((item) => item.label !== "ฐานวัน") || positiveFactors[0];
  const mainNegative = negativeFactors[0];
  const branchEffect = daily.clashMatches.length
    ? `มีแรงปะทะกับ${daily.clashMatches.map((item) => item.label).join(" / ")}`
    : daily.combinationMatches.length
      ? `มีแรงส่งเสริมกับ${daily.combinationMatches.map((item) => item.label).join(" / ")}`
      : `ไม่พบแรงปะทะหรือแรงส่งเสริมเด่นกับดวงเกิด`;
  const personalSignal = ctx.topRelation
    ? `พื้นดวงเด่นด้าน “${ctx.topRelation.label}” (${ctx.topRelation.meaning}) จึงควรใช้วันนี้เพื่อ${topGuide.focus}`
    : `พื้นดวงต้องใช้ธาตุ ${ctx.useful.join(" / ")} เพื่อเปิดจังหวะ`;
  const summary = [
    `ผลวันนี้อ่านจากดวงเกิดของคุณ ไม่ใช่คำทำนายรวม: พลังวันนี้เน้น “${relationName}” (${daily.stemRelation[2]})`,
    `${branchEffect}; ${mainPositive ? `ตัวช่วยหลักคือ ${mainPositive.detail}` : personalSignal}`,
    mainNegative ? `จุดที่ควรระวังคือ ${mainNegative.detail}` : `จุดเด่นคือ ${personalSignal}`,
  ].join(" ");

  return {
    todayPillar,
    dayScore,
    lucky,
    luckyTime,
    luckyColor: colorByElement[ctx.useful[0]],
    title: `${todayPillar.stem.han}${todayPillar.branch.han} · ${relationName}`,
    summary: `${opening} · ${summary}`,
    advice: personalDailyAdvice(chart, ctx, daily, dayScore),
    insight: `${relationInsight} ภาพรวมวันนี้ควรใช้จังหวะที่วางแผนได้ ไม่เร่งจนเกินจำเป็น ดวงนี้มีจุดเด่นด้าน ${ctx.relations.slice(0, 2).map((r) => r.label).join(" / ")} ธาตุที่ช่วยปรับสมดุลคือ ${ctx.useful.join(" / ")}`,
    stemRelation: daily.stemRelation,
    components: daily.components,
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
      high: "วันนี้พอเห็นทิศทางชัดขึ้น เหมาะเลือกเรื่องสำคัญและลงมือแบบมีแผน",
      low: "วันนี้เหมาะกับการตั้งหลัก ตรวจข้อมูล และลดความคาดหวังที่เร่งเกินไป",
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
  const topicBase = topicMap[inferredTopic] || topicMap[activeOracleTopic];
  const topicBoost = {
    overall: useful.includes(dm.element) ? 4 : 0,
    work: useful.includes("น้ำ") || useful.includes("ไม้") ? 7 : 0,
    money: useful.includes("ทอง") || useful.includes("ดิน") ? 9 : 0,
    love: useful.includes("น้ำ") || useful.includes("ไฟ") ? 8 : 0,
    health: useful.includes("ไม้") || useful.includes("น้ำ") ? 6 : 0,
  };
  const baseSeed = chart.day.index + chart.month.index + today.dayScore;
  const scoreForTopic = (topicKey, extra = 0) => Math.min(99, Math.max(38, today.dayScore + topicBoost[topicKey] + extra + mod(baseSeed + topicKey.length, 9) - 5));
  const defaultCards = ["work", "money", "love", "health"].map((topicKey) => {
    const cardScore = scoreForTopic(topicKey);
    const cardTopic = personalTopicReading(topicKey, topicMap[topicKey], ctx, today, null, cardScore);
    return {
      label: cardTopic.label,
      title: cardTopic.title,
      text: cardScore >= 72 ? cardTopic.high : cardTopic.low,
      score: cardScore,
    };
  });
  const intentBoost = analysis?.intent === "timing" ? 4 : analysis?.intent === "decision" ? 2 : analysis?.intent === "advice" ? 3 : 0;
  const urgencyPenalty = analysis?.urgency === "เร่งด่วน" && today.dayScore < 70 ? -7 : 0;
  const topicScore = scoreForTopic(inferredTopic, intentBoost + urgencyPenalty + (analysis?.question.length ? mod(analysis.question.length, 7) : 0));
  const topic = personalTopicReading(inferredTopic, topicBase, ctx, today, analysis, topicScore);
  const tone = topicScore >= 72 ? topic.high : topic.low;
  const decisive = analysis?.intent === "decision";
  const topGuide = relationActionGuides[ctx.topRelation?.label] || { focus: topic.focus, risk: topic.avoid };
  const timingAnswer = topicScore >= 72
    ? `ช่วงที่เหมาะคือ ${today.luckyTime} หรือวันที่คะแนนปฏิทินมงคลเกิน 70 โดยเลือกงานที่ใช้ ${topGuide.focus}`
    : `ยังไม่ใช่จังหวะรีบ ให้ใช้ ${today.luckyTime} เพื่อวางแผนและลดความเสี่ยงเรื่อง ${topGuide.risk}`;
  const adviceAnswer = topicScore >= 72
    ? `เริ่มจากขั้นตอนเล็กที่พิสูจน์ผลได้ภายใน 3 วัน และใช้ธาตุ ${useful[0]} เป็นตัวนำ`
    : `ลดความเสี่ยงก่อน ทำ checklist และขอข้อมูลเพิ่มหนึ่งชุด โดยเฉพาะจุดที่เกี่ยวกับ ${ctx.profile.stress}`;
  const decisionAnswer = topicScore >= 78
    ? `คำตอบคือไปต่อได้ แต่ต้องกำหนดขอบเขต งบ เวลา และตัวชี้วัดให้ชัดก่อน เพราะดวงนี้เดินดีเมื่อ ${topGuide.focus}`
    : topicScore >= 62
      ? `คำตอบคือไปต่อแบบทดลองเล็ก ๆ ก่อน ยังไม่ควรลงเต็มแรงหรือผูกมัดยาว จุดระวังคือ ${topGuide.risk}`
      : `คำตอบคือรอก่อนหรือชะลอไว้ จังหวะตอนนี้เหมาะกับการเก็บข้อมูลมากกว่า เพราะ ${ctx.profile.stress}`;
  const questionMode = analysis?.intent === "timing" ? timingAnswer : analysis?.intent === "advice" ? adviceAnswer : decisionAnswer;
  const todayTenGod = relation(dm, today.todayPillar.stem);
  const answer = question
    ? `ระบบอ่านคำถามนี้เป็นเรื่อง${topic.label} และประเมินว่าเป็นคำถามแบบ${analysis.intent === "decision" ? "ตัดสินใจ" : analysis.intent === "timing" ? "ถามจังหวะเวลา" : analysis.intent === "advice" ? "ขอคำแนะนำ" : "อ่านแนวโน้ม"} ระดับความเร่ง: ${analysis.urgency}. ${decisive ? questionMode : questionMode}`
    : `นี่คือคำพยากรณ์ตั้งต้นจากวันและเวลาเกิดของคุณ วันนี้พลังหลักของดวงเน้น “${todayTenGod[1]}” (${todayTenGod[2]}) และใช้ธาตุที่ช่วยปรับสมดุลคือ ${useful.join(" / ")} เป็นตัวอ่านผล ด้านล่างคือภาพรวมเรื่องงาน เงิน ความรัก และสุขภาพใจ หากมีเรื่องเฉพาะ ให้พิมพ์คำถามแล้วกด “วิเคราะห์คำถาม”`;
  const timeline = [
    ["วันนี้", topicScore >= 72 ? "เริ่มจาก action ที่วัดผลได้หนึ่งอย่าง" : "เก็บข้อมูลและลดความคาดหวังที่ไม่จำเป็น"],
    ["3 วัน", useful.includes("ดิน") ? "เห็นความคืบหน้าจากสิ่งที่มีโครงสร้างชัด" : "มีบทสนทนาหรือข้อมูลใหม่ช่วยให้ตัดสินใจง่ายขึ้น"],
    ["7 วัน", topicScore >= 72 ? "มีโอกาสปิดเรื่องหรือได้คำตอบที่รอ ถ้าตามต่อเนื่อง" : "จังหวะจะชัดขึ้นหลังตัดเรื่องรบกวนออก"],
  ];

  return { topic, topicScore, tone, answer, today, useful, timeline, dm, date, ctx, analysis, defaultCards };
}

function getProfile() {
  return {
    id: currentProfile?.id || (crypto.randomUUID ? crypto.randomUUID() : `lead-${Date.now()}-${Math.random().toString(16).slice(2)}`),
    name: els.name.value.trim() || "ผู้มาเยือน",
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
  els.profileStatus.textContent = "ยังไม่ได้ประมวลผลดวง · กรอกชื่อ เพศ วันเกิด และเวลาเกิด แล้วกดคำนายดวง";
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
  const gender = els.gender.value;
  const date = els.date.value;
  const time = els.time.value;
  if (!name || name === "ผู้มาเยือน") {
    els.predictionStatus.textContent = "กรุณากรอกชื่อก่อนคำนาย";
    els.name.focus();
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
  const wealth = ctx.roles.wealth;
  const officer = ctx.roles.officer;
  const output = ctx.roles.output;
  const resource = ctx.roles.resource;
  const personality = score >= 70 ? "พลังสูง ชอบนำเกม" : score >= 45 ? "สมดุล ปรับตัวได้" : "ละเอียดอ่อน ต้องการแรงหนุน";
  const interactionText = [
    ctx.interactions.clash.length ? `แรงปะทะ: ${ctx.interactions.clash.map((i) => i.label).join(" / ")}` : "",
    ctx.interactions.combine.length ? `แรงส่งเสริม: ${ctx.interactions.combine.map((i) => i.label).join(" / ")}` : "",
    ctx.interactions.harm.length ? `จุดรบกวน: ${ctx.interactions.harm.map((i) => i.label).join(" / ")}` : "",
    ctx.interactions.punishment.length ? `แรงกดซ้ำ: ${ctx.interactions.punishment.map((i) => i.label).join(" / ")}` : "",
  ].filter(Boolean).join(" · ") || "ไม่พบแรงปะทะ/แรงส่งเสริมเด่นกับกิ่งวันเกิด";
  const metrics = [
    ["ตัวตนหลัก", `${dm.han}${dm.element} · ${personality} · เดือนเกิดอยู่ในช่วง ${chart.month.solarTerm?.th || "ฤดูกาลจีน"}`],
    ["น้ำหนักดวง", `คะแนน ${score}/100 จากเดือนเกิด ธาตุเด่น และธาตุแฝงใน 4 เสา`],
    ["ธาตุที่ช่วยปรับสมดุล", useful.map((e) => `${elementHan[e]} ${e}`).join(" / ")],
    ["ธาตุที่ควรใช้พอดี", ctx.unfavorable.map((e) => `${elementHan[e]} ${e}`).join(" / ")],
    ["การเงิน", `${elementHan[wealth]} ${wealth} · จุดทรัพย์ ${(ctx.relationCounts["ทรัพย์หลัก"] || 0) + (ctx.relationCounts["รายได้เสริม"] || 0)} จุด ${termNote("สูตร: 财星")}`],
    ["งาน/สถานะ", `${elementHan[officer]} ${officer} · จุดงาน ${(ctx.relationCounts["ระเบียบ"] || 0) + (ctx.relationCounts["แรงกดดัน"] || 0)} จุด ${termNote("สูตร: 官杀")}`],
    ["การสื่อสาร/ผลงาน", `${elementHan[output]} ${output} · จุดสื่อสาร ${(ctx.relationCounts["พรสวรรค์"] || 0) + (ctx.relationCounts["นักแสดงออก"] || 0)} จุด ${termNote("สูตร: 食伤")}`],
    ["ความรู้/ผู้สนับสนุน", `${elementHan[resource]} ${resource} · จุดสนับสนุน ${(ctx.relationCounts["ผู้สนับสนุน"] || 0) + (ctx.relationCounts["ญาณ/กลยุทธ์"] || 0)} จุด ${termNote("สูตร: 印")}`],
    ["ความสัมพันธ์ของเสา", interactionText],
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
    <strong>${scoreLabel(reading.dayScore)} · คะแนนวันนี้ ${reading.dayScore}/100 จากพลังวันเทียบกับดวงเกิด</strong>
    <small>ฐานคำนวณ: ปี ${chart.year.stem.han}${chart.year.branch.han}, เดือน ${chart.month.stem.han}${chart.month.branch.han}, วัน ${chart.day.stem.han}${chart.day.branch.han}, ยาม ${chart.hour.stem.han}${chart.hour.branch.han}</small>
    <small>ตัวตนหลัก: ${chart.day.stem.han}${ctx.dm.element} · น้ำหนักดวง ${score}/100 · ธาตุที่ช่วยปรับสมดุล ${ctx.useful.join(" / ")}</small>
    <small>จุดเด่นในดวง: ${ctx.relations.slice(0, 4).map((r) => `${r.label} ${r.count.toFixed(1)}`).join(" / ")}</small>
    <div class="calc-breakdown">
      ${reading.components
        .filter((item) => item.label !== "ฐานวัน")
        .sort((a, b) => Math.abs(b.points) - Math.abs(a.points))
        .slice(0, 5)
        .map((item) => `<small><b>${item.points > 0 ? "+" : ""}${item.points}</b> ${item.label}: ${item.detail}</small>`)
        .join("")}
    </div>
  `;
  const today = new Date();
  els.calendarTitle.textContent = `14 วันถัดไปจากวันนี้`;
  els.calendarSummary.textContent = `${els.name.value.trim() || "คุณ"} เกิด ${date.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })} ระบบใช้ธาตุให้คุณ ${usefulElements(chart.day.stem.element, score).join(" / ")} เพื่อจัดอันดับวันตั้งแต่ ${today.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })}`;
}

function renderCalendar(chart, score, startDate) {
  const items = Array.from({ length: 14 }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    const day = dailyScore(chart, score, date);
    const dayPillar = day.todayPillar;
    const dayRelation = day.stemRelation;
    const dayScore = day.value;
    const category = dayScore >= 82 ? "work" : dayScore >= 70 ? "love" : "rest";
    const topPositive = day.components.filter((c) => c.points > 0 && c.label !== "ฐานวัน").sort((a, b) => b.points - a.points)[0];
    const topNegative = day.components.filter((c) => c.points < 0).sort((a, b) => a.points - b.points)[0];
    const tags = [
      dayRelation[1],
      day.branchMatch ? "ธาตุช่วยสมดุล" : "ธาตุไม่หนุนหลัก",
      day.combinationMatches.length ? "มีแรงส่งเสริม" : "",
      day.clashMatches.length ? "มีแรงปะทะ" : "",
      day.harmMatches.length ? "มีจุดรบกวน" : "",
      day.punishmentMatches.length ? "มีแรงกดซ้ำ" : "",
    ].filter(Boolean);
    const action = `${topPositive ? topPositive.detail : `วันนี้ขึ้นดาว${dayRelation[1]}`} · เหมาะกับ${dayRelation[2]}`;
    const avoid = topNegative ? topNegative.detail : "ไม่พบแรงปะทะเด่น แต่ยังควรเลือกงานให้ตรงจังหวะ";
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
  els.qimenSummary.textContent = `โหมดนี้เป็นฉีเหมินเบื้องต้น/จำลองจากเวลา ธาตุให้คุณ และทิศ ไม่ใช่การตั้งกระดานฉีเหมินเต็มสูตรแบบซินแส`;
  els.qimenNote.innerHTML = `<strong>ทิศแนะนำแบบจำลอง: ${best.direction}</strong><br>ระบบให้คะแนนจากธาตุ ${elementHan[best.element]} ${best.element}, ยามเกิด และธาตุให้คุณ ${ctx.useful.join(" / ")} หากต้องการความแม่นระดับซินแสต้องใช้การตั้งกระดานฉีเหมินเต็มสูตร`;
  els.qimenUse.innerHTML = [
    ["งาน/ขาย", `ใช้เป็นตัวช่วยเลือกจังหวะเริ่มต้นเท่านั้น ถ้าคะแนน ${best.score} สูง ให้เริ่มเรื่องที่ต้องใช้ธาตุ${best.element}`],
    ["ความรัก", "ใช้เพื่อเลือกบรรยากาศและทิศนั่งคุย ไม่ใช่คำตัดสินความสัมพันธ์"],
    ["การเงิน", "ใช้ประกอบการวางแผน ไม่แทนการตรวจตัวเลข สัญญา หรือความเสี่ยงจริง"],
    ["แก้เคล็ด", `วางของสี${colorByElement[best.element]}หรือเปิดไฟเล็ก ๆ ทางทิศ${best.direction}`],
  ].map(([title, text]) => `<article class="use-card"><span>${title}</span><strong>${text}</strong></article>`).join("");
}

function renderOracle(chart, score, date) {
  const reading = oracleReading(chart, score, date);
  els.oracleTitle.textContent = reading.analysis ? `${reading.topic.label} · ${reading.topic.title}` : "คำพยากรณ์ตั้งต้น · งาน เงิน ความรัก สุขภาพใจ";
  els.oracleSummary.textContent = reading.analysis
    ? `อ่านจาก Day Master ${reading.dm.han} ${reading.dm.element} และธาตุให้คุณ ${reading.useful.join(" / ")}`
    : `ระบบอ่านตั้งต้นจากดวงเกิด Day Master ${reading.dm.han}${reading.dm.element}, ธาตุให้คุณ ${reading.useful.join(" / ")} และพลังวันนี้`;
  els.oracleScore.textContent = reading.topicScore;
  els.oracleMeta.textContent = `${date.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })} · ${reading.analysis ? reading.topic.label : "ตั้งต้น"}`;
  const oracleCards = reading.analysis
    ? `
      <article class="oracle-card">
        <span>ผลวิเคราะห์คำถาม</span>
        <strong>${reading.answer}</strong>
      </article>
      <article class="oracle-card">
        <span>ระบบตรวจพบ</span>
        <strong>หัวข้อ ${reading.topic.label} · เจตนา ${reading.analysis.intent} · ความชัดเจน ${reading.analysis.clarity}</strong>
      </article>
      <article class="oracle-card">
        <span>ควรโฟกัส</span>
        <strong>${reading.topic.focus}</strong>
      </article>
      <article class="oracle-card">
        <span>ควรเลี่ยง</span>
        <strong>${reading.topic.avoid}</strong>
      </article>
    `
    : reading.defaultCards.map((card) => `
      <article class="oracle-card">
        <span>${card.label} · ${card.score}/100</span>
        <strong>${card.text}</strong>
      </article>
    `).join("");
  els.oracleReading.innerHTML = `
    <article class="oracle-main">
      <h3>${reading.analysis ? (reading.topicScore >= 72 ? "จังหวะเปิด" : "จังหวะตั้งหลัก") : "คำพยากรณ์ตั้งต้น"}</h3>
      <p>${reading.analysis ? reading.tone : reading.answer}</p>
    </article>
    <div class="oracle-grid">
      ${oracleCards}
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

  els.profileStatus.textContent = `${els.name.value.trim() || "ผู้มาเยือน"} · ${ctx.strengthLabel} · Day Master ${dm.han} ${dm.element} · เดือนจีน ${chart.month.branch.han}${chart.month.branch.th} (${chart.month.solarTerm?.name || "节气"}) · ธาตุให้คุณ ${ctx.useful.join(" / ")}`;
  els.birthLine.textContent = `${els.gender.value} · ${date.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })} ${els.time.value} · 4 เสา ${chart.year.stem.han}${chart.year.branch.han}/${chart.month.stem.han}${chart.month.branch.han}/${chart.day.stem.han}${chart.day.branch.han}/${chart.hour.stem.han}${chart.hour.branch.han}`;
  els.dayMasterTitle.textContent = `${dm.element}${dm.polarity === "+" ? "หยาง" : "หยิน"} (${dm.th} ${dm.han})`;
  els.dayMasterQuote.textContent = `"${dm.quote}"`;
  els.strengthBar.style.width = `${score}%`;
  els.strengthText.textContent = `ความแข็งแรง ${score}/100 จากเดือนจีน ${chart.month.solarTerm?.name || "节气"}, ก้านฟ้า, กิ่งดิน และธาตุแฝง`;

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

function setPredictionMethod(method) {
  els.appShell.dataset.method = method;
  document.querySelectorAll(".method-card").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.method === method);
  });
  if (method === "bazi") {
    els.appTitle.textContent = moduleTitles.bazi;
    if (!predictionMade) renderLockedPreview();
    return;
  }
  if (method === "tarot") {
    els.appTitle.textContent = "ไพ่ยิปซี Tarot";
    resetTarotFlow();
    return;
  }
  els.appTitle.textContent = "หน้าหลัก";
}

function resetTarotFlow() {
  activeTarotSpread = "day";
  activeTarotTopic = "overall";
  selectedTarotCards = [];
  shuffledTarotDeck = [];
  visibleTarotDeck = [];
  tarotHasShuffled = false;
  tarotReadingMade = false;
  els.tarotWorkspace?.classList.remove("is-result-mode");
  document.querySelectorAll("#tarotSpreadTabs button").forEach((item) => {
    item.classList.toggle("is-active", item.dataset.spread === activeTarotSpread);
  });
  renderTarotEmpty();
  renderTarotDeck();
}

document.querySelectorAll(".method-card").forEach((button) => {
  if (!button.dataset.method) return;
  button.addEventListener("click", () => setPredictionMethod(button.dataset.method));
});

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
  els.gender.value = "";
  els.date.value = "";
  els.time.value = "";
  lockResults("ตั้งดวงใหม่แล้ว กรอกข้อมูลให้ครบก่อนคำนาย");
});

els.homeBtn.addEventListener("click", () => setPredictionMethod("choose"));
els.brandHomeBtn.addEventListener("click", () => setPredictionMethod("choose"));

els.predictBtn.addEventListener("click", () => requestPrediction("prediction-button"));

document.querySelectorAll("#tarotSpreadTabs button").forEach((button) => {
  button.addEventListener("click", () => {
    activeTarotSpread = button.dataset.spread;
    document.querySelectorAll("#tarotSpreadTabs button").forEach((item) => item.classList.toggle("is-active", item === button));
    selectedTarotCards = [];
    shuffledTarotDeck = [];
    visibleTarotDeck = [];
    tarotHasShuffled = false;
    tarotReadingMade = false;
    els.tarotWorkspace?.classList.remove("is-result-mode");
    renderTarotDeck();
    renderTarotEmpty();
  });
});

document.querySelectorAll("#tarotTopicTabs button").forEach((button) => {
  button.addEventListener("click", () => {
    activeTarotTopic = button.dataset.topic;
    document.querySelectorAll("#tarotTopicTabs button").forEach((item) => item.classList.toggle("is-active", item === button));
    els.tarotWorkspace?.classList.remove("is-result-mode");
    renderTarotEmpty();
  });
});

els.shuffleTarotBtn.addEventListener("click", resetTarotDeck);
els.tarotBackBtn.addEventListener("click", showTarotPicker);
els.tarotQuestion?.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    if (selectedTarotCards.length === tarotSpreadConfig().cards) renderTarotReading();
  }
});

[els.name, els.gender, els.date, els.time].forEach((el) => {
  el.addEventListener("input", () => {
    if (predictionMade) {
      lockResults("ข้อมูลเปลี่ยนแล้ว กด “คำนายดวง” อีกครั้งเพื่อแสดงผลใหม่");
    }
  });
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
renderTarotEmpty();
setPredictionMethod("choose");
