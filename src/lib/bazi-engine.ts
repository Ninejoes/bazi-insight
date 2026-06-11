type ElementName = "ไม้" | "ไฟ" | "ดิน" | "ทอง" | "น้ำ";

type Stem = {
  han: string;
  th: string;
  element: ElementName;
  polarity: "+" | "-";
};

type Branch = {
  han: string;
  th: string;
  element: ElementName;
  hidden: number[];
};

type Pillar = {
  stem: Stem;
  branch: Branch;
  index: number;
  source?: string;
  solarTerm?: { month: number; day: number; branch: number; name: string; th: string };
};

export type BaziInput = {
  name: string;
  gender: "หญิง" | "ชาย" | "ไม่ระบุ";
  birthDate: string;
  birthTime: string;
};

export type BaziAnalysis = {
  input: BaziInput;
  chart: {
    year: Pillar;
    month: Pillar;
    day: Pillar;
    hour: Pillar;
  };
  context: {
    dm: Stem;
    useful: ElementName[];
    unfavorable: ElementName[];
    dominant: [ElementName, number][];
    relations: { han: string; label: string; meaning: string; count: number }[];
    roles: Record<"self" | "output" | "wealth" | "officer" | "resource", ElementName>;
    relationCounts: Record<string, number>;
    topRelation?: { han: string; label: string; meaning: string; count: number };
    strengthLabel: string;
    profile: { nature: string; career: string; stress: string; remedy: string };
  };
  strength: number;
  today: {
    dayScore: number;
    title: string;
    summary: string;
    lucky: string;
    luckyTime: string;
    luckyColor: string;
    advice: [string, string][];
    components: { label: string; points: number; detail: string }[];
  };
  forecast: {
    label: string;
    score: number;
    title: string;
    body: string;
    action: string;
  }[];
  calendar: {
    d: string;
    w: string;
    stem: string;
    th: string;
    score: number;
    tag: string;
    note: string;
  }[];
  luckCycles: {
    age: string;
    years: string;
    stem: string;
    th: string;
    note: string;
  }[];
  tenGods: {
    cn: string;
    count: number;
    th: string;
    desc: string;
  }[];
  qimen: {
    best: {
      dir: string;
      door: string;
      doorCn: string;
      elem: ElementName;
      score: number;
      tag: string;
    };
    directions: {
      dir: string;
      door: string;
      doorCn: string;
      elem: ElementName;
      score: number;
      tag: string;
    }[];
  };
};

const elementOrder: ElementName[] = ["ไม้", "ไฟ", "ดิน", "ทอง", "น้ำ"];
const elementHan: Record<ElementName, string> = {
  ไม้: "木",
  ไฟ: "火",
  ดิน: "土",
  ทอง: "金",
  น้ำ: "水",
};

const stems: Stem[] = [
  { han: "甲", th: "เจี่ย", element: "ไม้", polarity: "+" },
  { han: "乙", th: "อี่", element: "ไม้", polarity: "-" },
  { han: "丙", th: "ปิ๋ง", element: "ไฟ", polarity: "+" },
  { han: "丁", th: "ติง", element: "ไฟ", polarity: "-" },
  { han: "戊", th: "อู้", element: "ดิน", polarity: "+" },
  { han: "己", th: "จี้", element: "ดิน", polarity: "-" },
  { han: "庚", th: "เกิง", element: "ทอง", polarity: "+" },
  { han: "辛", th: "ซิน", element: "ทอง", polarity: "-" },
  { han: "壬", th: "เหริน", element: "น้ำ", polarity: "+" },
  { han: "癸", th: "กุย", element: "น้ำ", polarity: "-" },
];

const branches: Branch[] = [
  { han: "子", th: "ชวด", element: "น้ำ", hidden: [9] },
  { han: "丑", th: "ฉลู", element: "ดิน", hidden: [5, 9, 7] },
  { han: "寅", th: "ขาล", element: "ไม้", hidden: [0, 2, 4] },
  { han: "卯", th: "เถาะ", element: "ไม้", hidden: [1] },
  { han: "辰", th: "มะโรง", element: "ดิน", hidden: [4, 1, 9] },
  { han: "巳", th: "มะเส็ง", element: "ไฟ", hidden: [2, 4, 6] },
  { han: "午", th: "มะเมีย", element: "ไฟ", hidden: [3, 5] },
  { han: "未", th: "มะแม", element: "ดิน", hidden: [5, 3, 1] },
  { han: "申", th: "วอก", element: "ทอง", hidden: [6, 8, 4] },
  { han: "酉", th: "ระกา", element: "ทอง", hidden: [7] },
  { han: "戌", th: "จอ", element: "ดิน", hidden: [4, 7, 3] },
  { han: "亥", th: "กุน", element: "น้ำ", hidden: [8, 0] },
];

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

const colorByElement: Record<ElementName, string> = {
  ไม้: "เขียวหยก",
  ไฟ: "แดงทับทิม",
  ดิน: "เหลืองทอง",
  ทอง: "ขาวมุก",
  น้ำ: "น้ำเงินเข้ม",
};

const stemProfiles: Record<
  ElementName,
  { nature: string; career: string; stress: string; remedy: string }
> = {
  ไม้: {
    nature: "เติบโตจากการเรียนรู้และการเชื่อมโยงผู้คน",
    career: "เหมาะกับงานวางแผน คอนเทนต์ การศึกษา การตลาด และงานที่ต้องสร้างเครือข่าย",
    stress: "เครียดง่ายเมื่อถูกเร่งให้ตัดสินใจโดยไม่มีข้อมูล",
    remedy: "ใช้พื้นที่สีเขียว จัดลำดับงานเป็นขั้น และเริ่มจากงานเล็กที่เห็นความคืบหน้า",
  },
  ไฟ: {
    nature: "ขับเคลื่อนด้วยแรงบันดาลใจ การมองเห็น และการสื่อสาร",
    career: "เหมาะกับงานขาย พรีเซนต์ แบรนด์ ครีเอทีฟ สื่อ และบทบาทที่ต้องปลุกพลังทีม",
    stress: "หมดแรงเมื่อให้พลังคนอื่นมากเกินไปโดยไม่พัก",
    remedy: "ลดสิ่งรบกวน ทำงานเป็นรอบสั้น ๆ และเลือกเวลาที่แสง/บรรยากาศช่วยให้ใจเปิด",
  },
  ดิน: {
    nature: "มั่นคง รับผิดชอบ และเก่งกับการทำสิ่งซับซ้อนให้เป็นระบบ",
    career: "เหมาะกับงานบริหาร โปรเจกต์ อสังหา การเงินหลังบ้าน การดูแลลูกค้า และ operation",
    stress: "แบกเรื่องคนอื่นมากเกินไปจนตัดสินใจช้า",
    remedy: "เขียนขอบเขตให้ชัด แยกเรื่องของตัวเองกับเรื่องที่รับมา และทำ checklist ก่อนรับปาก",
  },
  ทอง: {
    nature: "ชัด ตรง มีมาตรฐาน และต้องการผลลัพธ์ที่วัดได้",
    career:
      "เหมาะกับงานกฎหมาย การเงิน วิเคราะห์ คุณภาพ กลยุทธ์ การเจรจา และสินค้าที่ต้องใช้ความน่าเชื่อถือ",
    stress: "กดดันตัวเองเมื่อทุกอย่างยังไม่สมบูรณ์",
    remedy: "ตั้งเกณฑ์พอใช้ได้ก่อน แล้วค่อยปรับให้คมขึ้น อย่ารอ perfect จนพลาดจังหวะ",
  },
  น้ำ: {
    nature: "คิดลึก เชื่อมข้อมูลเก่ง และอ่านบรรยากาศรอบตัวได้ไว",
    career: "เหมาะกับงานวิจัย ที่ปรึกษา กลยุทธ์ เทคโนโลยี ภาษา งานข้อมูล และงานที่ต้องอ่านคน",
    stress: "คิดวนหรือรับข้อมูลมากจนใจล้า",
    remedy: "จำกัดข้อมูลเข้า เลือกคุยกับคนที่นิ่ง และจดสิ่งที่รู้จริงแยกจากสิ่งที่กังวล",
  },
};

const relationProfiles: Record<string, string> = {
  เพื่อนร่วมทาง:
    "วันนี้ตัวตนและความต้องการของคุณเด่นกว่าปกติ เหมาะกับการยืนในจุดที่ชัดเจน แต่ควรระวังไม่ให้ความมั่นใจกลายเป็นการตัดสินใจแทนคนอื่น",
  แรงแข่งขัน:
    "มีแรงกระตุ้นจากคนรอบตัวหรือสถานการณ์ที่ทำให้ต้องเร่งตัวเอง หากใช้ให้ถูกทางจะช่วยสร้างวินัย แต่ถ้าเอาแต่เปรียบเทียบอาจทำให้ใจเหนื่อยโดยไม่จำเป็น",
  พรสวรรค์:
    "เหมาะกับการปล่อยผลงาน ใช้ทักษะเฉพาะตัว หรือทำสิ่งที่ทำให้คนอื่นเห็นคุณค่าของคุณมากขึ้น สิ่งสำคัญคือทำให้เรียบง่ายและจับต้องได้",
  นักแสดงออก:
    "คำพูด ความคิด และการนำเสนอมีน้ำหนักเป็นพิเศษ ใช้กับการขาย การเจรจา หรือคอนเทนต์ได้ดี แต่ควรพูดให้พอดีและเหลือพื้นที่ให้อีกฝ่ายรับฟัง",
  รายได้เสริม:
    "มีจังหวะเห็นช่องทางรายรับหรือโอกาสเล็ก ๆ ที่ต่อยอดได้ แต่ยังควรเริ่มจากการทดสอบก่อน อย่าเพิ่งขยายเพียงเพราะรู้สึกว่าโอกาสกำลังมา",
  ทรัพย์หลัก:
    "เรื่องเงินควรกลับมาที่ความชัดเจน รายรับ รายจ่าย ราคา และข้อตกลงต้องตรวจได้ ยิ่งวางระบบดีเท่าไร ความมั่นคงก็ยิ่งเพิ่มขึ้น",
  แรงกดดัน:
    "มีโจทย์ท้าทายเข้ามาทดสอบความนิ่ง หากคุมจังหวะได้ เรื่องที่กดดันจะกลายเป็นผลงานที่คนเห็นความสามารถของคุณ",
  ระเบียบ:
    "เหมาะกับงานทางการ เอกสาร กติกา หรือเรื่องที่ต้องสร้างความน่าเชื่อถือ วันนี้ยิ่งทำตามขั้นตอน ผลลัพธ์ยิ่งชัด",
  "ญาณ/กลยุทธ์":
    "เป็นวันที่เหมาะกับการอ่านสัญญาณ วางแผน และเก็บข้อมูลก่อนขยับ ไม่จำเป็นต้องรีบแสดงตัว แต่ควรรู้ให้มากพอก่อนตัดสินใจ",
  ผู้สนับสนุน:
    "มีแรงจากผู้ช่วย ความรู้ หรือคำแนะนำของคนมีประสบการณ์ หากไม่แน่ใจเรื่องใด การถามให้ถูกคนจะช่วยประหยัดแรงได้มาก",
};

const forecastCatalog: Record<
  string,
  {
    base: string;
    good: string;
    medium: string;
    low: string;
    action: string;
  }
> = {
  ภาพรวม: {
    base: "อ่านจาก Day Master, ธาตุให้คุณ, แรงปะทะ/合 ของกิ่งดิน และสิบเทพรายวัน",
    good:
      "ภาพรวมวันนี้ค่อนข้างเปิดทาง เหมาะกับการเริ่มเรื่องที่เตรียมข้อมูลไว้แล้ว โดยเฉพาะสิ่งที่มีเป้าหมายชัดและไม่ต้องพึ่งดวงอย่างเดียว",
    medium:
      "ภาพรวมยังพอเดินต่อได้ แต่ไม่ใช่วันที่ควรรีบสรุปทุกอย่างในครั้งเดียว แบ่งเรื่องใหญ่ให้เล็กลง แล้วค่อยตรวจรายละเอียดก่อนตัดสินใจ",
    low:
      "ภาพรวมวันนี้ควรประคองจังหวะมากกว่าเร่งผลลัพธ์ ลดเรื่องเสี่ยง เลี่ยงการตอบโต้จากอารมณ์ และเลือกทำเฉพาะเรื่องที่จำเป็นจริง ๆ",
    action: "เลือกเรื่องสำคัญเพียงหนึ่งเรื่อง ตั้งเป้าให้ชัด แล้วปิดให้จบก่อนรับภาระใหม่",
  },
  งาน: {
    base: "อ่านจาก 官煞, 印, กิ่งเดือน และแรงหนุนของธาตุให้คุณ",
    good:
      "งานมีแรงส่งพอสมควร เหมาะกับการคุยเรื่องสำคัญ ทำเอกสาร วางมาตรฐาน หรือปิดงานที่ค้างไว้ โดยเฉพาะงานที่ต้องใช้ความน่าเชื่อถือและความเป็นระบบ",
    medium:
      "งานยังเดินได้ถ้าแยกหน้าที่ให้ชัด อย่าปล่อยให้การประชุมยาวหรือคำขอจากหลายฝ่ายดึงพลังไปหมด วันนี้ต้องรู้ว่าอะไรคือเรื่องหลัก",
    low:
      "งานมีแรงกดดันมากกว่าปกติ ควรเลี่ยงการชนตรง ใช้หลักฐาน ตัวเลข หรือข้อตกลงช่วยพูดแทนความรู้สึก จะลดความเข้าใจผิดได้ดี",
    action: "เขียนเป้าหมาย งานที่ต้องส่ง และเงื่อนไขการตัดสินใจออกมาให้เห็นชัดก่อนลงมือ",
  },
  เงิน: {
    base: "อ่านจาก 財星, output ที่ก่อให้เกิด wealth, และ clash/harm กับเสาวัน",
    good:
      "การเงินมีจังหวะให้เห็นทางเลือกใหม่ เหมาะกับการจัดราคา เจรจาเงื่อนไข หรือแยกช่องทางรายรับให้เป็นระบบมากขึ้น",
    medium:
      "เรื่องเงินควรเดินอย่างระมัดระวัง ตรวจตัวเลข เงื่อนไข และเวลาชำระให้ครบก่อนตกลง อย่าให้ความรีบทำให้มองข้ามรายละเอียด",
    low:
      "วันนี้ไม่เหมาะกับการเสี่ยงเงินก้อนหรือเร่งลงทุน ควรรักษาสภาพคล่องไว้ก่อน แล้วรอดูข้อมูลให้ครบกว่านี้",
    action: "ตรวจรายรับ รายจ่าย สัญญา และวันครบกำหนดก่อนตัดสินใจเรื่องเงินทุกครั้ง",
  },
  ความรัก: {
    base: "อ่านจากดาวคู่สัมพันธ์ตามเพศ, กิ่งวัน, 合/冲/害 และธาตุสื่อสาร",
    good:
      "ความสัมพันธ์มีพื้นที่ให้คุยกันดีขึ้น เหมาะกับการปรับความเข้าใจ เริ่มบทสนทนาที่ค้างไว้ หรือแสดงความใส่ใจแบบเรียบง่ายแต่จริงใจ",
    medium:
      "ความรักต้องใช้จังหวะมากกว่าคำพูดเยอะ ๆ ฟังให้จบก่อนตอบ และอย่ารีบสรุปแทนอีกฝ่ายจากสัญญาณเพียงอย่างเดียว",
    low:
      "ความสัมพันธ์ไวต่อคำพูดและอารมณ์ ควรเลี่ยงการกดดัน คุยตอนเหนื่อย หรือรื้อเรื่องเก่าขึ้นมาตัดสินกันในวันที่ใจยังไม่นิ่ง",
    action: "ถามให้ชัดเพียงหนึ่งเรื่อง แล้วฟังคำตอบจริงโดยไม่รีบป้องกันตัวหรือเอาชนะ",
  },
  สุขภาพใจ: {
    base: "อ่านจากความแรงของ Day Master, ธาตุที่มาก/พร่อง และกิ่งที่เกิด冲刑害",
    good:
      "ใจมีแรงพอจะจัดระบบชีวิต เหมาะกับการออกกำลังเบา ๆ เก็บพื้นที่ส่วนตัว และทำสิ่งเล็ก ๆ ที่ทำให้รู้สึกว่าควบคุมชีวิตตัวเองได้",
    medium:
      "ใจต้องการจังหวะพักเป็นช่วง ๆ อย่ารับข้อมูลมากเกินไป และอย่าบังคับตัวเองให้ตอบทุกเรื่องทันที",
    low:
      "ใจล้าง่ายกว่าปกติ ควรลดสิ่งเร้า เลื่อนเรื่องที่ไม่จำเป็นออกไปก่อน และกลับมาดูแลพื้นฐานอย่างการพักผ่อนให้พอ",
    action: "นอนให้พอ ดื่มน้ำ และตัดหนึ่งสิ่งที่รบกวนใจออกจากวันนี้ก่อน",
  },
};

const branchClashes: Record<string, string[]> = {
  子: ["午"],
  午: ["子"],
  丑: ["未"],
  未: ["丑"],
  寅: ["申"],
  申: ["寅"],
  卯: ["酉"],
  酉: ["卯"],
  辰: ["戌"],
  戌: ["辰"],
  巳: ["亥"],
  亥: ["巳"],
};

const branchCombinations: Record<string, string[]> = {
  子: ["丑"],
  丑: ["子"],
  寅: ["亥"],
  亥: ["寅"],
  卯: ["戌"],
  戌: ["卯"],
  辰: ["酉"],
  酉: ["辰"],
  巳: ["申"],
  申: ["巳"],
  午: ["未"],
  未: ["午"],
};

const branchHarms: Record<string, string[]> = {
  子: ["未"],
  未: ["子"],
  丑: ["午"],
  午: ["丑"],
  寅: ["巳"],
  巳: ["寅", "申"],
  卯: ["辰"],
  辰: ["卯"],
  申: ["亥", "巳"],
  亥: ["申"],
  酉: ["戌"],
  戌: ["酉"],
};

const branchPunishments: Record<string, string[]> = {
  子: ["卯"],
  卯: ["子"],
  寅: ["巳", "申"],
  巳: ["寅", "申"],
  申: ["寅", "巳"],
  丑: ["戌", "未"],
  戌: ["丑", "未"],
  未: ["丑", "戌"],
  辰: ["辰"],
  午: ["午"],
  酉: ["酉"],
  亥: ["亥"],
};

const qimenDirections = [
  "เหนือ",
  "ตะวันออกเฉียงเหนือ",
  "ตะวันออก",
  "ตะวันออกเฉียงใต้",
  "ใต้",
  "ตะวันตกเฉียงใต้",
  "ตะวันตก",
  "ตะวันตกเฉียงเหนือ",
  "กลาง",
];

const qimenDoors = [
  { th: "พัก", cn: "休" },
  { th: "เกิด", cn: "生" },
  { th: "บาด", cn: "傷" },
  { th: "ปิด", cn: "杜" },
  { th: "ทิวทัศน์", cn: "景" },
  { th: "ตาย", cn: "死" },
  { th: "กลัว", cn: "驚" },
  { th: "เปิด", cn: "開" },
];

function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

function daysSinceBase(date: Date) {
  const base = Date.UTC(1900, 0, 31);
  return Math.floor(
    (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - base) / 86400000,
  );
}

function pillarFromIndex(index: number): Pillar {
  return { stem: stems[mod(index, 10)], branch: branches[mod(index, 12)], index: mod(index, 60) };
}

function indexFromStemBranch(stemIndex: number, branchIndex: number) {
  for (let i = 0; i < 60; i += 1) {
    if (mod(i, 10) === stemIndex && mod(i, 12) === branchIndex) return i;
  }
  return mod(stemIndex, 60);
}

function solarMonthInfo(date: Date) {
  let selected = solarMonthStarts[solarMonthStarts.length - 1];
  solarMonthStarts.forEach((item) => {
    if (
      date.getMonth() > item.month ||
      (date.getMonth() === item.month && date.getDate() >= item.day)
    ) {
      selected = item;
    }
  });
  return selected;
}

function monthStemIndex(yearStemIndex: number, monthBranchIndex: number) {
  const tigerStemByYearStem = [2, 4, 6, 8, 0, 2, 4, 6, 8, 0];
  return mod(tigerStemByYearStem[yearStemIndex] + mod(monthBranchIndex - 2, 12), 10);
}

function getChart(date: Date, hour: number): BaziAnalysis["chart"] {
  const baziYear =
    date.getMonth() === 0 || (date.getMonth() === 1 && date.getDate() < 4)
      ? date.getFullYear() - 1
      : date.getFullYear();
  const yearIndex = mod(baziYear - 4, 60);
  const monthInfo = solarMonthInfo(date);
  const monthBranch = monthInfo.branch;
  const monthStem = monthStemIndex(mod(yearIndex, 10), monthBranch);
  const dayIndex = mod(daysSinceBase(date), 60);
  const hourBranch = hour === 23 ? 0 : mod(Math.floor((hour + 1) / 2), 12);
  const hourStem = mod((mod(dayIndex, 10) % 5) * 2 + hourBranch, 10);

  return {
    year: { ...pillarFromIndex(yearIndex), source: `ปีจีนเริ่มประมาณ 立春 ${baziYear}` },
    month: {
      stem: stems[monthStem],
      branch: branches[monthBranch],
      index: indexFromStemBranch(monthStem, monthBranch),
      solarTerm: monthInfo,
    },
    day: { ...pillarFromIndex(dayIndex), source: "คำนวณจากวงจร 60 วัน" },
    hour: {
      stem: stems[hourStem],
      branch: branches[hourBranch],
      index: indexFromStemBranch(hourStem, hourBranch),
      source: "ยามจีน 2 ชั่วโมง",
    },
  };
}

function relation(dayStem: Stem, otherStem: Stem): [string, string, string] {
  const self = elementOrder.indexOf(dayStem.element);
  const other = elementOrder.indexOf(otherStem.element);
  const samePolarity = dayStem.polarity === otherStem.polarity;
  const delta = mod(other - self, 5);

  if (delta === 0)
    return samePolarity
      ? ["比肩", "เพื่อนร่วมทาง", "ตัวตน/เครือข่าย"]
      : ["劫财", "แรงแข่งขัน", "เพื่อน/คู่แข่ง"];
  if (delta === 1)
    return samePolarity
      ? ["食神", "พรสวรรค์", "ความคิดสร้างสรรค์"]
      : ["伤官", "นักแสดงออก", "การสื่อสาร"];
  if (delta === 2)
    return samePolarity
      ? ["偏财", "รายได้เสริม", "โอกาสเงิน"]
      : ["正财", "ทรัพย์หลัก", "การเงินมั่นคง"];
  if (delta === 3)
    return samePolarity ? ["七杀", "แรงกดดัน", "เป้าหมายท้าทาย"] : ["正官", "ระเบียบ", "งาน/สถานะ"];
  return samePolarity
    ? ["偏印", "ญาณ/กลยุทธ์", "การเรียนรู้เฉพาะทาง"]
    : ["正印", "ผู้สนับสนุน", "ความรู้/ผู้ใหญ่"];
}

function strength(chart: BaziAnalysis["chart"]) {
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

function usefulElements(dayElement: ElementName, score: number) {
  const i = elementOrder.indexOf(dayElement);
  if (score >= 58)
    return [elementOrder[mod(i + 1, 5)], elementOrder[mod(i + 2, 5)], elementOrder[mod(i + 3, 5)]];
  return [elementOrder[i], elementOrder[mod(i - 1, 5)], elementOrder[mod(i + 1, 5)]];
}

function unfavorableElements(dayElement: ElementName, score: number) {
  const i = elementOrder.indexOf(dayElement);
  return score >= 58
    ? [dayElement, elementOrder[mod(i - 1, 5)]]
    : [elementOrder[mod(i + 2, 5)], elementOrder[mod(i + 3, 5)]];
}

function dominantElements(chart: BaziAnalysis["chart"]) {
  const counts = Object.fromEntries(elementOrder.map((e) => [e, 0])) as Record<ElementName, number>;
  [chart.year, chart.month, chart.day, chart.hour].forEach((p) => {
    counts[p.stem.element] += 1.2;
    counts[p.branch.element] += 1;
    p.branch.hidden.forEach((idx) => {
      counts[stems[idx].element] += 0.35;
    });
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1]) as [ElementName, number][];
}

function dominantRelations(chart: BaziAnalysis["chart"]) {
  const counts = new Map<string, { han: string; label: string; meaning: string; count: number }>();
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

function elementRole(dayElement: ElementName) {
  const i = elementOrder.indexOf(dayElement);
  return {
    self: dayElement,
    output: elementOrder[mod(i + 1, 5)],
    wealth: elementOrder[mod(i + 2, 5)],
    officer: elementOrder[mod(i + 3, 5)],
    resource: elementOrder[mod(i - 1, 5)],
  };
}

function countRelations(chart: BaziAnalysis["chart"]) {
  const counts: Record<string, number> = {};
  [chart.year, chart.month, chart.hour].forEach((p) => {
    [p.stem, ...p.branch.hidden.map((idx) => stems[idx])].forEach((stem) => {
      const r = relation(chart.day.stem, stem);
      counts[r[1]] = (counts[r[1]] || 0) + 1;
    });
  });
  return counts;
}

function chartPillarEntries(chart: BaziAnalysis["chart"]): [string, Pillar][] {
  return [
    ["ปี", chart.year],
    ["เดือน", chart.month],
    ["วัน", chart.day],
    ["ยาม", chart.hour],
  ];
}

function branchMatches(
  chart: BaziAnalysis["chart"],
  todayBranch: Branch,
  matchMap: Record<string, string[]>,
) {
  const targets = matchMap[todayBranch.han] || [];
  return chartPillarEntries(chart)
    .filter(([, pillar]) => targets.includes(pillar.branch.han))
    .map(([label, pillar]) => ({ label, branch: pillar.branch }));
}

function chartContext(chart: BaziAnalysis["chart"], score: number) {
  const dm = chart.day.stem;
  const useful = usefulElements(dm.element, score);
  const relations = dominantRelations(chart);
  return {
    dm,
    useful,
    unfavorable: unfavorableElements(dm.element, score),
    dominant: dominantElements(chart),
    relations,
    roles: elementRole(dm.element),
    relationCounts: countRelations(chart),
    topRelation: relations[0],
    profile: stemProfiles[dm.element],
    strengthLabel:
      score >= 70 ? "ดวงมีกำลังมาก" : score >= 48 ? "ดวงค่อนข้างสมดุล" : "ดวงต้องการแรงสนับสนุน",
  };
}

function dailyScore(chart: BaziAnalysis["chart"], score: number, today = new Date()) {
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
  const tenGodScore =
    {
      เพื่อนร่วมทาง: 2,
      แรงแข่งขัน: score >= 70 ? 2 : -5,
      พรสวรรค์: 7,
      นักแสดงออก: score >= 70 ? 5 : 1,
      รายได้เสริม: 8,
      ทรัพย์หลัก: 7,
      แรงกดดัน: score >= 70 ? 4 : -6,
      ระเบียบ: 5,
      "ญาณ/กลยุทธ์": 5,
      ผู้สนับสนุน: 6,
    }[stemRelation[1]] || 0;

  const components = [
    {
      label: "ฐานวัน",
      points: 46,
      detail: `ตั้งต้นจากเสาวัน ${todayPillar.stem.han}${todayPillar.branch.han}`,
    },
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
    ...(sameBranch
      ? [
          {
            label: "กิ่งวันซ้ำ",
            points: 4,
            detail: `กิ่งวันนี้ซ้ำกับกิ่งวันเกิด ${chart.day.branch.han} ทำให้เรื่องตัวเองเด่นขึ้น`,
          },
        ]
      : []),
    ...(monthSupport
      ? [
          {
            label: "ฤดูกาลหนุน",
            points: 5,
            detail: `กิ่งวันนี้เป็นธาตุเดียวกับเดือนเกิด ${chart.month.branch.han}`,
          },
        ]
      : []),
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
    {
      label: "จังหวะเฉพาะดวง",
      points: mod(chart.day.index + chart.hour.index + today.getDate(), 7) - 3,
      detail: "ปรับจากเสาวันเกิดและยามเกิดของดวงนี้",
    },
  ];
  const value = Math.min(
    99,
    Math.max(
      28,
      components.reduce((sum, item) => sum + item.points, 0),
    ),
  );
  return {
    value,
    todayPillar,
    stemRelation,
    clashMatches,
    combinationMatches,
    harmMatches,
    punishmentMatches,
    components,
  };
}

function todayReading(
  chart: BaziAnalysis["chart"],
  score: number,
  input: BaziInput,
  today = new Date(),
) {
  const ctx = chartContext(chart, score);
  const daily = dailyScore(chart, score, today);
  const todayPillar = daily.todayPillar;
  const relationName = daily.stemRelation[1];
  const usefulText = ctx.useful.map((e) => `${elementHan[e]} ${e}`).join(" / ");
  const seed = daysSinceBase(today) + chart.day.index;
  const lucky = [
    mod(seed + Math.round(score), 10),
    mod(seed + chart.month.index, 10),
    mod(seed + chart.hour.index + ctx.useful.length, 10),
  ].join(" · ");
  const startHour = mod(seed, 12) * 2;
  const luckyTime = `${String(startHour).padStart(2, "0")}:00-${String(mod(startHour + 2, 24)).padStart(2, "0")}:00`;
  const branchEffect = daily.clashMatches.length
    ? `มีแรงปะทะกับ${daily.clashMatches.map((item) => item.label).join(" / ")}`
    : daily.combinationMatches.length
      ? `มีแรงส่งเสริมกับ${daily.combinationMatches.map((item) => item.label).join(" / ")}`
      : "ไม่พบแรงปะทะหรือแรงส่งเสริมเด่นกับดวงเกิด";
  const positive = daily.components
    .filter((item) => item.points > 0)
    .sort((a, b) => b.points - a.points);
  const negative = daily.components
    .filter((item) => item.points < 0)
    .sort((a, b) => a.points - b.points);
  const mainPositive = positive.find((item) => item.label !== "ฐานวัน") || positive[0];
  const mainNegative = negative[0];
  const opening =
    daily.value >= 82
      ? "วันนี้ค่อนข้างเปิดทาง"
      : daily.value >= 68
        ? "วันนี้ค่อย ๆ ขยับได้"
        : "วันนี้ควรประคองจังหวะ";
  const spouseElement = input.gender === "หญิง" ? ctx.roles.officer : ctx.roles.wealth;
  const loveScore = ctx.dominant.find(([element]) => element === spouseElement)?.[1] || 0;
  const workScore =
    (ctx.relationCounts["ระเบียบ"] || 0) +
    (ctx.relationCounts["แรงกดดัน"] || 0) +
    (ctx.relationCounts["ผู้สนับสนุน"] || 0) +
    (ctx.relationCounts["ญาณ/กลยุทธ์"] || 0);
  const moneyScore =
    (ctx.relationCounts["ทรัพย์หลัก"] || 0) + (ctx.relationCounts["รายได้เสริม"] || 0);
  const adviceSeed =
    daysSinceBase(today) +
    chart.year.index * 3 +
    chart.month.index * 5 +
    chart.day.index * 7 +
    chart.hour.index * 11;
  const dayElement = todayPillar.stem.element;
  const branchElement = todayPillar.branch.element;
  const hasWorkPush = ["ระเบียบ", "แรงกดดัน", "ผู้สนับสนุน", "ญาณ/กลยุทธ์"].includes(relationName);
  const hasMoneyPush = ["ทรัพย์หลัก", "รายได้เสริม", "พรสวรรค์", "นักแสดงออก"].includes(
    relationName,
  );
  const communicationPush = ["พรสวรรค์", "นักแสดงออก"].includes(relationName);
  const relationTone =
    daily.value >= 82
      ? "วันนี้เป็นวันที่จังหวะค่อนข้างเปิด"
      : daily.value >= 68
        ? "วันนี้ยังเดินต่อได้ แต่ต้องคุมจังหวะให้ดี"
        : "วันนี้ควรลดแรงปะทะและเลือกทำเท่าที่จำเป็น";
  const relationHint = `เสาวัน ${todayPillar.stem.han}${todayPillar.branch.han} ทำให้เรื่อง “${relationName}” ถูกดึงขึ้นมาเด่น`;
  const supportHint = daily.combinationMatches.length
    ? `มีแรงประสานกับ${daily.combinationMatches.map((item) => item.label).join(" / ")} ช่วยให้เรื่องที่เกี่ยวข้องเปิดทางง่ายขึ้น`
    : ctx.useful.includes(dayElement) || ctx.useful.includes(branchElement)
      ? `ธาตุของวันนี้แตะธาตุที่ช่วยสมดุลคุณคือ ${ctx.useful.join(" / ")}`
      : `ธาตุของวันนี้เป็น ${dayElement}/${branchElement} จึงควรใช้พลังแบบพอดี ไม่ฝืนเกินจังหวะ`;
  const riskHint = [
    ...daily.clashMatches.map((item) => `冲กับ${item.label}`),
    ...daily.harmMatches.map((item) => `害กับ${item.label}`),
    ...daily.punishmentMatches.map((item) => `刑กับ${item.label}`),
  ];
  const pick = (items: string[], offset: number) => items[mod(adviceSeed + offset, items.length)];
  const workAdvice = pick(
    hasWorkPush
      ? [
          `${relationTone} เรื่องงานเหมาะกับงานที่มีกรอบชัด เช่น เอกสาร การคุยกับผู้ใหญ่ การวางกติกา หรือการตัดสินใจที่ต้องอาศัยความเป็นระบบ เพราะ${relationHint} และพื้นดวงมีแรงสนับสนุนด้านงานอยู่ในระดับ ${workScore} จุด`,
          `เหมาะเอางานค้างมาจัดลำดับใหม่ เริ่มจากเรื่องที่มีเจ้าของชัด วัดผลได้ และไม่สร้างภาระต่อเนื่องเกินจำเป็น ${supportHint} คำแนะนำคืออย่าเพิ่งรับโจทย์เพิ่มก่อนปิดของเดิม`,
          `วันนี้ควรใช้ความนิ่งมากกว่าความเร็ว งานที่ต้องเจรจา ขออนุมัติ หรือขอความร่วมมือยังพอเดินได้ แต่ควรเตรียมข้อมูลให้พร้อม เพราะจุดงานในดวงนี้ถูกกระตุ้น ${workScore} จุด`,
        ]
      : communicationPush
        ? [
            `${relationTone} งานเหมาะกับการอธิบาย ขายไอเดีย เขียนคอนเทนต์ หรือสรุปสิ่งซับซ้อนให้คนเข้าใจง่าย เพราะ${relationHint} วันนี้ยิ่งพูดชัด ยิ่งช่วยเปิดทาง`,
            `ควรเลือกงานที่ให้ผลงานพูดแทนตัวเองมากกว่าการชนด้วยตำแหน่งหรืออารมณ์ วันนี้การสื่อสารเด่น แต่ต้องระวังพูดเร็วเกินข้อเท็จจริง`,
            `งานที่ต้องโชว์ทักษะมีจังหวะดีขึ้น หากเป็นงานเอกสารหนักให้แบ่งเป็นรอบสั้น ๆ แล้วตรวจทีละส่วน เพราะแรงงานโดยตรงของดวงนี้มี ${workScore} จุด`,
          ]
        : [
            `${relationTone} งานควรเน้นเก็บรายละเอียด ตรวจเงื่อนไข และกันเวลาพักสมอง เพราะ${relationHint} แต่ไม่ได้หนุนงานตรง ๆ มากนัก`,
            `เหมาะกับงานหลังบ้าน การเคลียร์ข้อมูล หรือการวางแผนเงียบ ๆ มากกว่าการประชุมยาว ${supportHint} หากต้องตัดสินใจ ให้ใช้หลักฐานนำความรู้สึก`,
            `วันนี้ไม่ต้องเร่งพิสูจน์ตัวเอง งานจะเดินดีขึ้นเมื่อแยกเรื่องของคนอื่นออกจากหน้าที่ของตัวเอง แล้วทำสิ่งที่รับผิดชอบให้ชัด แรงงานในดวงมี ${workScore} จุด`,
          ],
    1,
  );
  const moneyAdvice = pick(
    hasMoneyPush
      ? [
          `${relationTone} เรื่องเงินเหมาะกับการจัดราคา เงื่อนไข และช่องทางรายรับให้ชัดขึ้น เพราะ${relationHint} โดยจุดทรัพย์ในดวงเกิดมี ${moneyScore} จุด`,
          `เหมาะทบทวนต้นทุน กำไร และดีลที่ค้างไว้ ธาตุทรัพย์ของ ${ctx.dm.han} คือ ${ctx.roles.wealth} วันนี้ควรใช้ตัวเลขจริงเป็นหลักก่อนคิดขยาย`,
          `ถ้ามีเรื่องซื้อขายหรือเจรจาค่าใช้จ่าย ให้เริ่มจากขอบเขตเล็ก ๆ ก่อน แล้วค่อยเพิ่มน้ำหนักเมื่อเห็นเงื่อนไขครบ ${supportHint}`,
        ]
      : ctx.useful.includes(ctx.roles.wealth)
        ? [
            `การเงินไม่ได้พุ่งแรง แต่ยังพอประคองได้ เพราะธาตุทรัพย์ ${ctx.roles.wealth} เป็นหนึ่งในธาตุที่ช่วยสมดุลดวงนี้ จุดสำคัญคืออย่ารีบตกลงก่อนเห็นเงื่อนไขครบ`,
            `วันนี้เหมาะกับการตรวจรายจ่าย สัญญา รอบบิล หรือราคาที่ตั้งไว้ มากกว่าการลงทุนเสี่ยงใหม่ ภาพรวมด้านทรัพย์อยู่ที่ ${moneyScore} จุด`,
            `รายรับเดินแบบค่อยเป็นค่อยไป เหมาะกับการอุดเงินรั่ว ปรับแพ็กเกจ หรือทำให้ราคากับขอบเขตงานชัดกว่าเดิม`,
          ]
        : [
            `วันนี้เรื่องเงินควรตั้งการ์ดสูง ธาตุทรัพย์ของ ${ctx.dm.han} คือ ${ctx.roles.wealth} แต่พลังวันเด่นที่ ${dayElement}/${branchElement} จึงไม่ควรตัดสินใจจากความอยากทันที`,
            `ไม่เหมาะกับการเสี่ยงเงินก้อนหรือรับเงื่อนไขคลุมเครือ ให้แยกรายจ่ายจำเป็นออกจากรายจ่ายตามอารมณ์ก่อน`,
            `การเงินควรเน้นรักษาสภาพคล่องมากกว่าการขยาย หากมีดีลใหม่ให้ขอหลักฐาน ตัวเลข และระยะเวลาที่ชัดเจน`,
          ],
    2,
  );
  const loveAdvice = pick(
    daily.clashMatches.some((item) => item.label === "วัน") ||
      daily.harmMatches.some((item) => item.label === "วัน")
      ? [
          `ความรักไวต่อคำพูดเป็นพิเศษ เพราะมีแรงกระทบกับเสาวันซึ่งแทนตัวตนและคู่สัมพันธ์ ควรคุยให้สั้น ชัด และไม่ลากเรื่องเก่ามาตัดสินกัน`,
          `ถ้าต้องคุยเรื่องสำคัญ ให้เริ่มจากข้อเท็จจริงก่อนความรู้สึก วันนี้จังหวะสัมพันธ์มีแรงเสียดทานกับกิ่งวัน การพูดช้าลงจะช่วยลดการปะทะได้`,
          `เหมาะกับการพักอารมณ์ก่อนตอบข้อความหรือคุยประเด็นเปราะบาง จุดคู่สัมพันธ์อยู่ที่ธาตุ ${spouseElement} น้ำหนัก ${loveScore.toFixed(1)}`,
        ]
      : daily.combinationMatches.some((item) => item.label === "วัน")
        ? [
            `ความสัมพันธ์มีแรงเปิดใจ เพราะวันนี้มีแรงประสานกับเสาวัน เหมาะกับการปรับความเข้าใจหรือเริ่มบทสนทนาที่ค้างไว้`,
            `คนโสดเหมาะส่งสัญญาณแบบพอดี คนมีคู่เหมาะวางแผนร่วมกัน จุดคู่สัมพันธ์ธาตุ ${spouseElement} มีน้ำหนัก ${loveScore.toFixed(1)}`,
            `วันนี้คำพูดนุ่ม ๆ ได้ผลกว่าการเร่งคำตอบ ความสัมพันธ์จะเดินดีเมื่อให้อีกฝ่ายมีพื้นที่เลือกและมีเวลาคิด`,
          ]
        : communicationPush
          ? [
              `ความรักเด่นที่การสื่อสาร เพราะ${relationHint} ควรพูดตรงแต่ไม่ตัดสินแทนอีกฝ่าย`,
              `เหมาะคุยเรื่องเบา ๆ เพื่อเปิดทางก่อนเข้าประเด็นจริง จุดคู่สัมพันธ์ธาตุ ${spouseElement} มีน้ำหนัก ${loveScore.toFixed(1)}`,
              `ถ้ามีเรื่องค้างใจ ให้ถามทีละเรื่อง วันนี้คำพูดมีน้ำหนัก แต่ถ้าพูดเร็วไปอาจกลายเป็นความกดดัน`,
            ]
          : [
              `ความสัมพันธ์ควรเดินแบบนิ่งและสังเกตมากกว่าบังคับคำตอบ จุดคู่สัมพันธ์ของดวงนี้อยู่ที่ธาตุ ${spouseElement} น้ำหนัก ${loveScore.toFixed(1)}`,
              `เหมาะดูแลความรู้สึกพื้นฐาน เช่น เวลา ความใส่ใจ และการรักษาคำพูด มากกว่าคุยเรื่องใหญ่หลายเรื่องพร้อมกัน`,
              `คนโสดอย่ารีบอ่านใจใครจากสัญญาณเดียว คนมีคู่ควรให้พื้นที่กันก่อน แล้วค่อยสรุปประเด็นเมื่อใจนิ่งขึ้น`,
            ],
    3,
  );
  const avoidAdvice = riskHint.length
      ? pick(
        [
          `ควรเลี่ยงการตัดสินใจแบบชนตรง เพราะวันนี้มี ${riskHint.join(" / ")} หากจำเป็นต้องคุย ให้ใช้เอกสาร ข้อตกลง หรือข้อมูลกลางช่วยพยุงบทสนทนา`,
          `ระวังเรื่องที่เกี่ยวกับ${[
            ...daily.clashMatches,
            ...daily.harmMatches,
            ...daily.punishmentMatches,
          ]
            .map((item) => item.label)
            .join(" / ")} เป็นพิเศษ วันนี้ไม่เหมาะกับการเร่งปิดประเด็นด้วยอารมณ์`,
          `ให้ลดความแข็ง ลดการตอบโต้เร็ว และเว้นระยะกับเรื่องที่กดดัน เพราะแรง ${riskHint.join(" / ")} ทำให้เรื่องเล็กขยายง่ายกว่าปกติ`,
        ],
        4,
      )
    : pick(
        [
          `ไม่พบแรง冲/刑/害เด่นกับดวงเกิด จุดที่ควรเลี่ยงคือความชะล่าใจจากวันที่ดูเหมือนเปิดทาง ตรวจรายละเอียดก่อนส่งงานหรือจ่ายเงินเสมอ`,
          `วันนี้ไม่มีแรงปะทะใหญ่ แต่ควรเลี่ยงการรับปากเกินกำลัง เพราะพลัง ${relationName} อาจดึงให้โฟกัสเรื่องของคนอื่นมากเกินไป`,
          `ไม่เห็นจุดรบกวนหนักระหว่าง 4 เสาเดิมกับวันปัจจุบัน สิ่งที่ควรระวังคือการตัดสินใจเร็วจากความมั่นใจชั่ววูบ`,
        ],
        5,
      );
  const advice: [string, string][] = [
    ["งาน", workAdvice],
    ["เงิน", moneyAdvice],
    ["ความรัก", loveAdvice],
    ["ควรเลี่ยง", avoidAdvice],
  ];

  return {
    dayScore: daily.value,
    lucky,
    luckyTime,
    luckyColor: colorByElement[ctx.useful[0]],
    title: `${todayPillar.stem.han}${todayPillar.branch.han} · ${relationName}`,
    summary: `${opening} · คำอ่านวันนี้คำนวณจากวันและเวลาเกิดของคุณโดยตรง จึงเน้นรายละเอียดเฉพาะดวงมากกว่าคำทำนายรวม ประเด็นหลักของวันนี้คือ “${relationName}” (${daily.stemRelation[2]}) ${branchEffect}. ${mainPositive ? `แรงสนับสนุนที่ควรใช้ให้เป็นประโยชน์คือ ${mainPositive.detail}` : `ธาตุที่ช่วยปรับสมดุลคือ ${usefulText}`}. ${mainNegative ? `ส่วนที่ควรระวังคือ ${mainNegative.detail}` : relationProfiles[relationName]}`,
    advice,
    components: daily.components,
  };
}

function clampScore(score: number) {
  return Math.max(28, Math.min(99, Math.round(score)));
}

function forecastText(label: string, score: number) {
  const catalog = forecastCatalog[label] || forecastCatalog["ภาพรวม"];
  const trend = score >= 78 ? catalog.good : score >= 56 ? catalog.medium : catalog.low;
  return {
    title: `${label} · ${score >= 78 ? "เปิดทาง" : score >= 56 ? "ประคองได้" : "ต้องระวัง"}`,
    body: `${trend} (${catalog.base})`,
    action: catalog.action,
  };
}

function buildForecast(chart: BaziAnalysis["chart"], score: number, input: BaziInput, today: Date) {
  const ctx = chartContext(chart, score);
  const daily = dailyScore(chart, score, today);
  const relationCounts = ctx.relationCounts;
  const relationBoost = (names: string[]) =>
    names.reduce((sum, name) => sum + (relationCounts[name] || 0) * 4, 0);
  const dailyPenalty =
    daily.clashMatches.length * 7 +
    daily.harmMatches.length * 4 +
    daily.punishmentMatches.length * 4;
  const supportBonus = daily.combinationMatches.length * 5;
  const usefulBonus = ctx.useful.includes(daily.todayPillar.stem.element) ? 6 : 0;
  const spouseElement = input.gender === "หญิง" ? ctx.roles.officer : ctx.roles.wealth;
  const spouseWeight = ctx.dominant.find(([element]) => element === spouseElement)?.[1] || 0;
  const wealthBranch =
    daily.todayPillar.stem.element === ctx.roles.wealth ||
    daily.todayPillar.branch.element === ctx.roles.wealth
      ? 8
      : 0;
  const officerBranch =
    daily.todayPillar.stem.element === ctx.roles.officer ||
    daily.todayPillar.branch.element === ctx.roles.officer
      ? 8
      : 0;
  const resourceBranch =
    daily.todayPillar.stem.element === ctx.roles.resource ||
    daily.todayPillar.branch.element === ctx.roles.resource
      ? 7
      : 0;

  const raw = [
    {
      label: "ภาพรวม",
      score: daily.value,
    },
    {
      label: "งาน",
      score:
        48 +
        relationBoost(["ระเบียบ", "แรงกดดัน", "ผู้สนับสนุน", "ญาณ/กลยุทธ์"]) +
        officerBranch +
        supportBonus -
        dailyPenalty * 0.45,
    },
    {
      label: "เงิน",
      score:
        44 +
        relationBoost(["ทรัพย์หลัก", "รายได้เสริม", "พรสวรรค์", "นักแสดงออก"]) +
        wealthBranch +
        supportBonus -
        dailyPenalty * 0.55,
    },
    {
      label: "ความรัก",
      score:
        46 +
        spouseWeight * 7 +
        (daily.combinationMatches.some((item) => item.label === "วัน") ? 12 : 0) -
        (daily.clashMatches.some((item) => item.label === "วัน") ? 16 : 0) -
        daily.harmMatches.length * 5,
    },
    {
      label: "สุขภาพใจ",
      score:
        52 +
        resourceBranch +
        usefulBonus +
        (score >= 70 ? -5 : 6) -
        dailyPenalty +
        (ctx.unfavorable.includes(daily.todayPillar.branch.element) ? -5 : 0),
    },
  ];

  return raw.map((item) => {
    const finalScore = clampScore(item.score);
    return { label: item.label, score: finalScore, ...forecastText(item.label, finalScore) };
  });
}

export function analyzeBazi(input: BaziInput, today = new Date()): BaziAnalysis {
  const birth = new Date(`${input.birthDate}T${input.birthTime || "12:00"}:00`);
  const hour = Number((input.birthTime || "12:00").split(":")[0] || 12);
  const chart = getChart(Number.isNaN(birth.getTime()) ? new Date() : birth, hour);
  const score = strength(chart);
  const ctx = chartContext(chart, score);
  return {
    input,
    chart,
    context: ctx,
    strength: score,
    today: todayReading(chart, score, input, today),
    forecast: buildForecast(chart, score, input, today),
    calendar: buildCalendar(chart, score, today),
    luckCycles: buildLuckCycles(chart, input),
    tenGods: buildTenGods(chart),
    qimen: buildQimen(chart, score, input),
  };
}

function buildCalendar(chart: BaziAnalysis["chart"], score: number, start: Date) {
  const weekdays = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัส", "ศุกร์", "เสาร์"];
  const months = [
    "ม.ค.",
    "ก.พ.",
    "มี.ค.",
    "เม.ย.",
    "พ.ค.",
    "มิ.ย.",
    "ก.ค.",
    "ส.ค.",
    "ก.ย.",
    "ต.ค.",
    "พ.ย.",
    "ธ.ค.",
  ];
  return Array.from({ length: 14 }, (_, i) => {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const day = dailyScore(chart, score, date);
    const stem = `${day.todayPillar.stem.han}${day.todayPillar.branch.han}`;
    const note = [
      day.stemRelation[1],
      day.combinationMatches.length ? "มีแรงส่งเสริม" : null,
      day.clashMatches.length
        ? `มีแรงปะทะกับ${day.clashMatches.map((item) => item.label).join("/")}`
        : null,
      day.harmMatches.length ? "มีจุดรบกวน" : null,
      day.punishmentMatches.length ? "มีแรงกดซ้ำ" : null,
    ]
      .filter(Boolean)
      .join(" · ");
    return {
      d: `${date.getDate()} ${months[date.getMonth()]}`,
      w: weekdays[date.getDay()],
      stem,
      th: `${day.todayPillar.stem.element}/${day.todayPillar.branch.th}`,
      score: day.value,
      tag:
        day.value >= 82
          ? "เหมาะมาก"
          : day.value >= 68
            ? "ดี"
            : day.value >= 50
              ? "กลาง"
              : "ควรประคอง",
      note,
    };
  });
}

function buildLuckCycles(chart: BaziAnalysis["chart"], input: BaziInput) {
  const birthYear = Number(input.birthDate.slice(0, 4)) || new Date().getFullYear();
  const startAge = input.gender === "ชาย" ? 8 : 7;

  return Array.from({ length: 6 }, (_, i) => {
    const index = mod(chart.month.index + chart.year.index + i + 1, 60);
    const pillar = pillarFromIndex(index);
    const age = startAge + i * 10;
    const god = relation(chart.day.stem, pillar.stem);

    return {
      age: `${age}-${age + 9}`,
      years: `${birthYear + age}-${birthYear + age + 9}`,
      stem: `${pillar.stem.han}${pillar.branch.han}`,
      th: `${pillar.stem.element}/${pillar.branch.th}`,
      note: `${god[1]} · ${god[2]}`,
    };
  });
}

function buildTenGods(chart: BaziAnalysis["chart"]) {
  const counts = new Map<string, { cn: string; count: number; th: string; desc: string }>();

  [chart.year, chart.month, chart.day, chart.hour].forEach((pillar, pillarIndex) => {
    [pillar.stem, ...pillar.branch.hidden.map((idx) => stems[idx])].forEach((stem, stemIndex) => {
      const god =
        pillarIndex === 2 && stemIndex === 0
          ? ["日元", "วันเกิด", "ตัวตนหลัก"]
          : relation(chart.day.stem, stem);
      const current = counts.get(god[0]);
      counts.set(god[0], {
        cn: god[0],
        count: (current?.count || 0) + (stemIndex === 0 ? 1 : 0.5),
        th: god[1],
        desc: god[2],
      });
    });
  });

  return [...counts.values()].sort((a, b) => b.count - a.count);
}

function scoreTag(score: number) {
  if (score >= 82) return "เหมาะมาก";
  if (score >= 68) return "ดี";
  if (score >= 50) return "กลาง";
  return "ควรประคอง";
}

function buildQimen(chart: BaziAnalysis["chart"], score: number, input: BaziInput) {
  const birth = new Date(`${input.birthDate}T${input.birthTime || "12:00"}:00`);
  const hour = Number((input.birthTime || "12:00").split(":")[0] || 12);
  const date = Number.isNaN(birth.getTime()) ? new Date() : birth;
  const ctx = chartContext(chart, score);
  const seed = mod(daysSinceBase(date) + hour + chart.day.index, 9);

  const directions = qimenDirections.map((dir, i) => {
    const elem = elementOrder[mod(seed + i, 5)];
    const door = qimenDoors[mod(seed + i, qimenDoors.length)];
    const qimenScore = Math.min(
      99,
      46 +
        (ctx.useful.includes(elem) ? 22 : 0) +
        (i === seed ? 13 : 0) +
        (elem === chart.month.branch.element ? 5 : 0) +
        mod(i * 7 + hour, 13),
    );

    return {
      dir,
      door: door.th,
      doorCn: door.cn,
      elem,
      score: qimenScore,
      tag: scoreTag(qimenScore),
    };
  });
  const best = directions.reduce((winner, item) => (item.score > winner.score ? item : winner));

  return { best, directions };
}

export function pillarRole(dayStem: Stem, stem: Stem) {
  return relation(dayStem, stem);
}

export function elementSymbol(element: ElementName) {
  return elementHan[element];
}

export function hiddenStemReading(dayStem: Stem, stemIndex: number) {
  const stem = stems[stemIndex];
  const role = relation(dayStem, stem);
  return `${stem.han} ${stem.th} ${role[0]} ${role[1]}`;
}
