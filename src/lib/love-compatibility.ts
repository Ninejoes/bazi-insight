export interface LovePersonInput {
  name: string;
  gender: "male" | "female" | "other";
  birthDate: string; // YYYY-MM-DD
}

export interface CompatibilityAnalysis {
  person1: {
    name: string;
    dayName: string;
    zodiacSign: string;
    chineseZodiac: string;
    element: string;
  };
  person2: {
    name: string;
    dayName: string;
    zodiacSign: string;
    chineseZodiac: string;
    element: string;
  };
  score: number; // 0 - 100
  levelTitle: string;
  levelBadge: string;
  elementMatchDesc: string;
  zodiacMatchDesc: string;
  dayMatchDesc: string;
  westernZodiacMatchDesc: string;
  strengths: string[];
  cautions: string[];
  advices: string[];
  recommendedShrines: { name: string; location: string; highlight: string }[];
}

const THAI_DAYS = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];

const CHINESE_ZODIAC_NAMES = [
  "ชวด",
  "ฉลู",
  "ขาล",
  "เถาะ",
  "มะโรง",
  "มะเส็ง",
  "มะเมีย",
  "มะแม",
  "วอก",
  "ระกา",
  "จอ",
  "กุน",
];

const FIVE_ELEMENTS = ["ทอง", "ทอง", "น้ำ", "น้ำ", "ไม้", "ไม้", "ไฟ", "ไฟ", "ดิน", "ดิน"];

// Western Zodiac signs based on month/day
function getWesternZodiac(month: number, day: number): { name: string; element: "ไฟ" | "ดิน" | "ลม" | "น้ำ" } {
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return { name: "ราศีเมษ (Aries)", element: "ไฟ" };
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return { name: "ราศีพฤษภ (Taurus)", element: "ดิน" };
  if ((month === 5 && day >= 21) || (month === 6 && day <= 21)) return { name: "ราศีเมถุน (Gemini)", element: "ลม" };
  if ((month === 6 && day >= 22) || (month === 7 && day <= 22)) return { name: "ราศีกรกฎ (Cancer)", element: "น้ำ" };
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return { name: "ราศีสิงห์ (Leo)", element: "ไฟ" };
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return { name: "ราศีกันย์ (Virgo)", element: "ดิน" };
  if ((month === 9 && day >= 23) || (month === 10 && day <= 23)) return { name: "ราศีตุลย์ (Libra)", element: "ลม" };
  if ((month === 10 && day >= 24) || (month === 11 && day <= 21)) return { name: "ราศีพิจิก (Scorpio)", element: "น้ำ" };
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return { name: "ราศีธนู (Sagittarius)", element: "ไฟ" };
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return { name: "ราศีมังกร (Capricorn)", element: "ดิน" };
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return { name: "ราศีกุมภ์ (Aquarius)", element: "ลม" };
  return { name: "ราศีมีน (Pisces)", element: "น้ำ" };
}

export function analyzeLoveCompatibility(p1: LovePersonInput, p2: LovePersonInput): CompatibilityAnalysis {
  const d1 = new Date(p1.birthDate);
  const d2 = new Date(p2.birthDate);

  const day1 = d1.getDay();
  const day2 = d2.getDay();

  const z1Idx = ((d1.getFullYear() - 4) % 12 + 12) % 12;
  const z2Idx = ((d2.getFullYear() - 4) % 12 + 12) % 12;

  const elem1 = FIVE_ELEMENTS[d1.getFullYear() % 10];
  const elem2 = FIVE_ELEMENTS[d2.getFullYear() % 10];

  const wZodiac1 = getWesternZodiac(d1.getMonth() + 1, d1.getDate());
  const wZodiac2 = getWesternZodiac(d2.getMonth() + 1, d2.getDate());

  let totalScore = 40; // Base score

  // 1. ธาตุสมพงษ์ (Five Elements Match)
  let elementMatchDesc = "";
  const generatingPairs = [
    ["ไม้", "ไฟ"], ["ไฟ", "ดิน"], ["ดิน", "ทอง"], ["ทอง", "น้ำ"], ["น้ำ", "ไม้"]
  ];
  const overcomingPairs = [
    ["ไม้", "ดิน"], ["ดิน", "น้ำ"], ["น้ำ", "ไฟ"], ["ไฟ", "ทอง"], ["ทอง", "ไม้"]
  ];

  const isGen = generatingPairs.some(([a, b]) => (elem1 === a && elem2 === b) || (elem1 === b && elem2 === a));
  const isOver = overcomingPairs.some(([a, b]) => (elem1 === a && elem2 === b) || (elem1 === b && elem2 === a));

  if (isGen) {
    totalScore += 20;
    elementMatchDesc = `ธาตุ${elem1} และ ธาตุ${elem2} เป็น 'คู่ธาตุส่งเสริม' อยู่ร่วมกันแล้วเกื้อหนุนพลังชีวิตให้รุ่งเรือง ดั่งลมหนุนคลื่น`;
  } else if (elem1 === elem2) {
    totalScore += 16;
    elementMatchDesc = `ธาตุ${elem1} ทั้งสองฝ่าย เป็น 'คู่ธาตุเดียวกัน' เข้าใจธรรมชาติของกันและกันได้ลึกซึ้ง มีความผูกพันและรสนิยมคล้ายกัน`;
  } else if (isOver) {
    totalScore += 8;
    elementMatchDesc = `ธาตุ${elem1} และ ธาตุ${elem2} มีความต่างของพลังธาตุ ต้องอาศัยการผ่อนสั้นผ่อนยาว ความใจเย็น และไม่ใช้อารมณ์ปะทะ`;
  } else {
    totalScore += 12;
    elementMatchDesc = `ธาตุ${elem1} และ ธาตุ${elem2} อยู่ในเกณฑ์ปานกลาง สามารถปรับตัวเข้าหากันได้อย่างราบรื่น`;
  }

  // 2. ปีนักษัตรสมพงษ์ (Chinese Zodiac Harmony)
  let zodiacMatchDesc = "";
  // San He (ซาฮะ)
  const sanHeGroups = [
    [8, 0, 4], // วอก ชวด มะโรง
    [2, 6, 10], // ขาล มะเมีย จอ
    [11, 3, 7], // กุน เถาะ มะแม
    [5, 9, 1], // มะเส็ง ระกา ฉลู
  ];
  // Liu He (ลักฮะ)
  const liuHePairs = [
    [0, 1], [2, 11], [3, 10], [4, 9], [5, 8], [6, 7]
  ];
  // Liu Chong (ชงตรง)
  const chongPairs = [
    [0, 6], [1, 7], [2, 8], [3, 9], [4, 10], [5, 11]
  ];

  const isSanHe = sanHeGroups.some(group => group.includes(z1Idx) && group.includes(z2Idx) && z1Idx !== z2Idx);
  const isLiuHe = liuHePairs.some(([a, b]) => (z1Idx === a && z2Idx === b) || (z1Idx === b && z2Idx === a));
  const isChong = chongPairs.some(([a, b]) => (z1Idx === a && z2Idx === b) || (z1Idx === b && z2Idx === a));

  if (isSanHe) {
    totalScore += 22;
    zodiacMatchDesc = `ปี${CHINESE_ZODIAC_NAMES[z1Idx]} และ ปี${CHINESE_ZODIAC_NAMES[z2Idx]} เป็น 'คู่ซาฮะ (สามประสานมงคล)' ถือเป็นคู่ที่ดวงส่งเสริมกันสูงสุด ค้าขายสร้างเนื้อสร้างตัวร่วมกันจะร่ำรวย`;
  } else if (isLiuHe) {
    totalScore += 20;
    zodiacMatchDesc = `ปี${CHINESE_ZODIAC_NAMES[z1Idx]} และ ปี${CHINESE_ZODIAC_NAMES[z2Idx]} เป็น 'คู่ลักฮะ (หกคู่มิตรแท้)' สื่อสารเข้าใจกันง่าย มีความผูกพันและเป็นกำลังใจให้กันเสมอ`;
  } else if (isChong) {
    totalScore += 4;
    zodiacMatchDesc = `ปี${CHINESE_ZODIAC_NAMES[z1Idx]} และ ปี${CHINESE_ZODIAC_NAMES[z2Idx]} เป็น 'คู่ปะทะ (ปีชงกัน)' อาจมีความคิดเห็นตรงกันข้ามในบางเรื่อง ต้องอาศัยการรับฟังและการประนีประนอม`;
  } else {
    totalScore += 14;
    zodiacMatchDesc = `ปี${CHINESE_ZODIAC_NAMES[z1Idx]} และ ปี${CHINESE_ZODIAC_NAMES[z2Idx]} เกื้อหนุนกันตามธรรมชาติ สามารถเรียนรู้ข้อดีของกันและกันได้ดี`;
  }

  // 3. วันเกิดสมพงษ์ (Thai Day Match)
  let dayMatchDesc = "";
  const thaiFriends = [
    [0, 4], // อาทิตย์ - พฤหัส
    [1, 3], // จันทร์ - พุธ
    [2, 5], // อังคาร - ศุกร์
    [6, 3], // เสาร์ - พุธ
  ];
  const thaiEnemies = [
    [0, 2], // อาทิตย์ - อังคาร
    [4, 6], // พฤหัส - เสาร์
  ];

  const isFriend = thaiFriends.some(([a, b]) => (day1 === a && day2 === b) || (day1 === b && day2 === a));
  const isEnemy = thaiEnemies.some(([a, b]) => (day1 === a && day2 === b) || (day1 === b && day2 === a));

  if (isFriend) {
    totalScore += 12;
    dayMatchDesc = `คนเกิดวัน${THAI_DAYS[day1]} กับ วัน${THAI_DAYS[day2]} เป็น 'มิตรคู่บุญ' ตามตำราไทย คุยกันถูกคอ อยู่ด้วยแล้วสบายใจ`;
  } else if (day1 === day2) {
    totalScore += 10;
    dayMatchDesc = `คนเกิดวัน${THAI_DAYS[day1]} เหมือนกัน เข้าใจความรู้สึกและนิสัยใจคอได้ไว แต่อาจมีดื้อชนดื้อบ้างในบางเวลา`;
  } else if (isEnemy) {
    totalScore += 4;
    dayMatchDesc = `คนเกิดวัน${THAI_DAYS[day1]} กับ วัน${THAI_DAYS[day2]} อารมณ์อาจร้อนใส่กันง่าย ต้องหลีกเลี่ยงการพูดประชดประชัน`;
  } else {
    totalScore += 8;
    dayMatchDesc = `คนเกิดวัน${THAI_DAYS[day1]} กับ วัน${THAI_DAYS[day2]} เข้ากันได้ดี มีความสมดุลระหว่างเหตุผลและอารมณ์`;
  }

  // 4. ราศีสากล
  let westernZodiacMatchDesc = "";
  const elemW1 = wZodiac1.element;
  const elemW2 = wZodiac2.element;
  const isElemWGood =
    (elemW1 === "ไฟ" && elemW2 === "ลม") ||
    (elemW1 === "ลม" && elemW2 === "ไฟ") ||
    (elemW1 === "ดิน" && elemW2 === "น้ำ") ||
    (elemW1 === "น้ำ" && elemW2 === "ดิน") ||
    elemW1 === elemW2;

  if (isElemWGood) {
    totalScore += 6;
    westernZodiacMatchDesc = `${wZodiac1.name} (${elemW1}) และ ${wZodiac2.name} (${elemW2}) เป็นการผสมผสานธาตุทางสากลที่ลงตัว ช่วยเติมเต็มมุมมองชีวิตของกันและกัน`;
  } else {
    totalScore += 4;
    westernZodiacMatchDesc = `${wZodiac1.name} (${elemW1}) และ ${wZodiac2.name} (${elemW2}) มีพลังธรรมชาติที่ต่างกัน เป็นเสน่ห์ดึงดูดที่น่าค้นหา`;
  }

  // Cap score between 45 and 99
  const finalScore = Math.min(99, Math.max(45, totalScore));

  let levelTitle = "";
  let levelBadge = "";
  if (finalScore >= 90) {
    levelTitle = "คู่แท้บุพเพสันนิวาส (Soulmate Divine)";
    levelBadge = "สมพงษ์ระดับมงคลสูงสุด";
  } else if (finalScore >= 80) {
    levelTitle = "คู่สร้างคู่สม (Harmonious Union)";
    levelBadge = "สมพงษ์ยอดเยี่ยม";
  } else if (finalScore >= 70) {
    levelTitle = "คู่มิตรเกื้อกูล (Supportive Partners)";
    levelBadge = "สมพงษ์ดีมาก";
  } else if (finalScore >= 60) {
    levelTitle = "คู่พัฒนาศีลเสมอกัน (Growth Companions)";
    levelBadge = "สมพงษ์ปานกลาง";
  } else {
    levelTitle = "คู่บุญคู่บารมี (Karmic Learning)";
    levelBadge = "ต้องอาศัยการปรับจูน";
  }

  const strengths = [
    `แรงดึงดูดและความผูกพัน: ทั้งสองคนมีเคมีที่สื่อสารถึงกันได้ดี มีความจริงใจเป็นพื้นฐาน`,
    `การส่งเสริมด้านทรัพย์สิน: ${isGen || isSanHe ? "โดดเด่นมาก มีเกณฑ์ร่วมกันสร้างความมั่งคั่ง เก็บเงินเป็นกอบเป็นกำ" : "หากแบ่งหน้าที่บริหารเงินชัดเจน จะช่วยให้ความมั่นคงเติบโต"}` ,
    `การเป็นที่พึ่งพาทางใจ: ในยามที่อีกฝ่ายเหนื่อยล้า กำลังใจจากคนรักคือพลังขับเคลื่อนที่สำคัญที่สุด`,
  ];

  const cautions = [
    `การสื่อสารในยามโกรธ: หลีกเลี่ยงการขุดคุ้ยเรื่องเก่าหรือใช้น้ำเสียงประชดประชันเวลาอารมณ์ไม่ดี`,
    `การจัดสรรพื้นที่ส่วนตัว: แม้จะรักกันมาก แต่ควรให้พื้นที่และเวลาส่วนตัวในการทำสิ่งที่ตนรัก`,
    `การเงินและคนรอบข้าง: อย่าให้บุคคลที่สามหรือญาติพี่น้องเข้ามามีบทบาทตัดสินใจเรื่องคู่มากเกินไป`,
  ];

  const advices = [
    `หมั่นเอ่ยคำขอบคุณและชื่นชมในความตั้งใจของอีกฝ่าย แม้จะเป็นเรื่องเล็กน้อยประจำวัน`,
    `หาเวลาทำกิจกรรมหรือไปท่องเที่ยวเปลี่ยนบรรยากาศร่วมกันอย่างน้อยเดือนละ 1 ครั้ง`,
    `ทำบุญถวายสิ่งของเป็นคู่ เช่น หลอดไฟคู่ เชี่ยนหมาก หรือร่วมบริจาคค่าน้ำค่าไฟวัดเพื่อเสริมความร่มเย็น`,
  ];

  const recommendedShrines = [
    {
      name: "ศาลพระแม่ลักษมี (เกษรวิลเลจ)",
      location: "แยกราชประสงค์ กรุงเทพฯ",
      highlight: "ขอพรความรักบริสุทธิ์ ความซื่อสัตย์ และความมั่งคั่งร่ำรวยคู่กัน",
    },
    {
      name: "วัดพระศรีมหาอุมาเทวี (วัดแขกสีลม)",
      location: "ถนนสีลม กรุงเทพฯ",
      highlight: "ขอพรพระแม่อุมาเทวีและพระศิวะ เสริมความมั่นคงในชีวิตคู่ ครองเรือนยืนยาว",
    },
    {
      name: "ศาลเจ้าแม่เขาสามมุข",
      location: "บางแสน ชลบุรี",
      highlight: "ตำนานความรักแท้ ผูกผ้าแดงอธิษฐานจิตให้รักมั่นคงไร้อุปสรรค",
    },
  ];

  return {
    person1: {
      name: p1.name,
      dayName: THAI_DAYS[day1],
      zodiacSign: wZodiac1.name,
      chineseZodiac: CHINESE_ZODIAC_NAMES[z1Idx],
      element: elem1,
    },
    person2: {
      name: p2.name,
      dayName: THAI_DAYS[day2],
      zodiacSign: wZodiac2.name,
      chineseZodiac: CHINESE_ZODIAC_NAMES[z2Idx],
      element: elem2,
    },
    score: finalScore,
    levelTitle,
    levelBadge,
    elementMatchDesc,
    zodiacMatchDesc,
    dayMatchDesc,
    westernZodiacMatchDesc,
    strengths,
    cautions,
    advices,
    recommendedShrines,
  };
}
