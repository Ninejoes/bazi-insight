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
  เพื่อนร่วมทาง: "พลังตัวตนเด่น เหมาะยืนจุดยืนของตัวเองและทำสิ่งที่ต้องใช้ความมั่นใจ",
  แรงแข่งขัน: "มีแรงผลักจากคนรอบตัว ระวังเปรียบเทียบตัวเอง แต่ใช้แรงนี้สร้างวินัยได้ดี",
  พรสวรรค์: "เหมาะปล่อยผลงาน แสดงทักษะ และทำสิ่งที่สร้างความสุขให้คนอื่น",
  นักแสดงออก: "คำพูดมีพลัง แต่ต้องระวังตรงเกินไป ใช้กับการขายหรือคอนเทนต์จะดี",
  รายได้เสริม: "มีจังหวะเห็นช่องทางเงินใหม่ แต่ควรทดสอบเล็กก่อนขยาย",
  ทรัพย์หลัก: "เหมาะจัดการรายรับ รายจ่าย ราคา และข้อตกลงที่ชัดเจน",
  แรงกดดัน: "เจอโจทย์ท้าทาย แต่ถ้าคุมจังหวะได้จะกลายเป็นผลงานที่คนเห็น",
  ระเบียบ: "เหมาะทำเรื่องทางการ เอกสาร กติกา และสิ่งที่ต้องการความน่าเชื่อถือ",
  "ญาณ/กลยุทธ์": "เหมาะศึกษา วางแผน อ่านสัญญาณ และใช้ข้อมูลเงียบ ๆ ก่อนขยับ",
  ผู้สนับสนุน: "มีพลังผู้ช่วย ความรู้ และคำแนะนำจากคนมีประสบการณ์",
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
  const advice: [string, string][] = [
    [
      "งาน",
      `วันนี้เหมาะกับงานที่มีกรอบชัด ใช้ข้อมูลช่วยตัดสินใจ และค่อย ๆ ปิดทีละเรื่อง เพราะดวงมีแรงงาน/แรงกดดัน/ผู้สนับสนุนรวม ${workScore} จุด`,
    ],
    [
      "เงิน",
      `เรื่องเงินควรใช้ตัวเลขและเงื่อนไขที่ตรวจสอบได้ ดวงนี้มีจุดเกี่ยวกับรายรับ/ทรัพย์ ${moneyScore} จุด ธาตุทรัพย์ของ ${ctx.dm.han} คือ ${ctx.roles.wealth}`,
    ],
    [
      "ความรัก",
      `ความสัมพันธ์ควรคุยด้วยจังหวะที่เปิดพื้นที่ให้อีกฝ่ายตอบ จุดคู่สัมพันธ์ของดวงนี้อยู่ที่ธาตุ ${spouseElement} น้ำหนักประมาณ ${loveScore.toFixed(1)}`,
    ],
    [
      "ควรเลี่ยง",
      `${daily.clashMatches.length ? `มีแรงปะทะกับ${daily.clashMatches.map((item) => item.label).join(" / ")}` : "ไม่พบแรงปะทะเด่น"}; ${daily.harmMatches.length ? `มีจุดรบกวนกับ${daily.harmMatches.map((item) => item.label).join(" / ")}` : "ไม่พบจุดรบกวนเด่น"}; ${daily.punishmentMatches.length ? `มีแรงกดซ้ำกับ${daily.punishmentMatches.map((item) => item.label).join(" / ")}` : "ไม่พบแรงกดซ้ำเด่น"}`,
    ],
  ];

  return {
    dayScore: daily.value,
    lucky,
    luckyTime,
    luckyColor: colorByElement[ctx.useful[0]],
    title: `${todayPillar.stem.han}${todayPillar.branch.han} · ${relationName}`,
    summary: `${opening} · ผลวันนี้อ่านจากดวงเกิดของคุณ ไม่ใช่คำทำนายรวม: พลังวันนี้เน้น “${relationName}” (${daily.stemRelation[2]}). ${branchEffect}; ${mainPositive ? `ตัวช่วยหลักคือ ${mainPositive.detail}` : `ธาตุที่ช่วยปรับสมดุลคือ ${usefulText}`}. ${mainNegative ? `จุดที่ควรระวังคือ ${mainNegative.detail}` : relationProfiles[relationName]}`,
    advice,
    components: daily.components,
  };
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
