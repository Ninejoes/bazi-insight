export interface AuspiciousName {
  id: string;
  name: string;
  meaning: string;
  gender: "male" | "female" | "unisex";
  goal: "wealth" | "leadership" | "support" | "health";
  scoreNumber: number;
  scoreGrade: "A+" | "A";
  freeFromKalakiniDays: string[];
}

export const BIRTH_DAY_RULES: Record<
  string,
  {
    label: string;
    forbidden: string;
    forbiddenLetters: string[];
    dominantCategory: string;
  }
> = {
  sunday: {
    label: "วันอาทิตย์",
    forbidden: "ศ ษ ส ห ฬ ฮ",
    forbiddenLetters: ["ศ", "ษ", "ส", "ห", "ฬ", "ฮ"],
    dominantCategory: "บริวาร: สระทั้งหมด, เดช: ก ข ค ฆ ง, ศรี: จ ฉ ช ซ ฌ ญ",
  },
  monday: {
    label: "วันจันทร์",
    forbidden: "สระทั้งหมด (ะ า ิ ี ึ ื ุ ู เ แ โ ใ ไ)",
    forbiddenLetters: ["ะ", "า", "ิ", "ี", "ึ", "ื", "ุ", "ู", "เ", "แ", "โ", "ใ", "ไ", "ำ", "ฤ", "ฦ"],
    dominantCategory: "บริวาร: ก ข ค ฆ ง, เดช: จ ฉ ช ซ ฌ ญ, ศรี: ฎ ฏ ฐ ฑ ฒ ณ",
  },
  tuesday: {
    label: "วันอังคาร",
    forbidden: "ก ข ค ฆ ง",
    forbiddenLetters: ["ก", "ข", "ค", "ฆ", "ง"],
    dominantCategory: "บริวาร: จ ฉ ช ซ ฌ ญ, เดช: ฎ ฏ ฐ ฑ ฒ ณ, ศรี: ด ต ถ ท ธ น",
  },
  wednesday_day: {
    label: "วันพุธ (กลางวัน)",
    forbidden: "จ ฉ ช ซ ฌ ญ",
    forbiddenLetters: ["จ", "ฉ", "ช", "ซ", "ฌ", "ญ"],
    dominantCategory: "บริวาร: ฎ ฏ ฐ ฑ ฒ ณ, เดช: ด ต ถ ท ธ น, ศรี: บ ป ผ ฝ พ ฟ ภ ม",
  },
  wednesday_night: {
    label: "วันพุธ (กลางคืน/ราหู)",
    forbidden: "บ ป ผ ฝ พ ฟ ภ ม",
    forbiddenLetters: ["บ", "ป", "ผ", "ฝ", "พ", "ฟ", "ภ", "ม"],
    dominantCategory: "บริวาร: ย ร ล ว, เดช: ศ ษ ส ห ฬ ฮ, ศรี: สระทั้งหมด",
  },
  thursday: {
    label: "วันพฤหัสบดี",
    forbidden: "ด ต ถ ท ธ น",
    forbiddenLetters: ["ด", "ต", "ถ", "ท", "ธ", "น"],
    dominantCategory: "บริวาร: บ ป ผ ฝ พ ฟ ภ ม, เดช: ย ร ล ว, ศรี: ศ ษ ส ห ฬ ฮ",
  },
  friday: {
    label: "วันศุกร์",
    forbidden: "ย ร ล ว",
    forbiddenLetters: ["ย", "ร", "ล", "ว"],
    dominantCategory: "บริวาร: ศ ษ ส ห ฬ ฮ, เดช: สระทั้งหมด, ศรี: ก ข ค ฆ ง",
  },
  saturday: {
    label: "วันเสาร์",
    forbidden: "ฎ ฏ ฐ ฑ ฒ ณ",
    forbiddenLetters: ["ฎ", "ฏ", "ฐ", "ฑ", "ฒ", "ณ"],
    dominantCategory: "บริวาร: ด ต ถ ท ธ น, เดช: บ ป ผ ฝ พ ฟ ภ ม, ศรี: ย ร ล ว",
  },
};

export const AUSPICIOUS_NAMES_CATALOG: AuspiciousName[] = [
  // --- การเงิน & โชคลาภ (Wealth) ---
  { id: "w1", name: "กมลภัทร", meaning: "ผู้มีใจดีงามและเจริญด้วยทรัพย์", gender: "unisex", goal: "wealth", scoreNumber: 24, scoreGrade: "A+", freeFromKalakiniDays: ["sunday", "monday", "thursday", "friday", "saturday"] },
  { id: "w2", name: "ชลัช", meaning: "ผู้เกิดจากน้ำ ดั่งดอกบัวแห่งความบริสุทธิ์และโชคลาภ", gender: "male", goal: "wealth", scoreNumber: 15, scoreGrade: "A+", freeFromKalakiniDays: ["sunday", "monday", "tuesday", "thursday", "friday", "saturday"] },
  { id: "w3", name: "ณภัทร", meaning: "ผู้มีความดีงามเปี่ยมด้วยปัญญาและความมั่งคั่ง", gender: "unisex", goal: "wealth", scoreNumber: 19, scoreGrade: "A+", freeFromKalakiniDays: ["sunday", "monday", "tuesday", "friday"] },
  { id: "w4", name: "ธนภัทร", meaning: "ผู้เจริญด้วยทรัพย์สินศฤงคาร", gender: "male", goal: "wealth", scoreNumber: 24, scoreGrade: "A+", freeFromKalakiniDays: ["sunday", "wednesday_night", "friday", "saturday"] },
  { id: "w5", name: "พงศ์พัศ", meaning: "ผู้มีอำนาจและสมบัติแห่งตระกูล", gender: "male", goal: "wealth", scoreNumber: 36, scoreGrade: "A+", freeFromKalakiniDays: ["tuesday", "wednesday_day", "thursday"] },
  { id: "w6", name: "ภัทรดนัย", meaning: "บุตรผู้เจริญ ร่ำรวยสุขสบาย", gender: "male", goal: "wealth", scoreNumber: 45, scoreGrade: "A+", freeFromKalakiniDays: ["wednesday_day", "friday", "saturday"] },
  { id: "w7", name: "รมิดา", meaning: "ผู้รื่นรมย์ มีความสุขและความมั่งมี", gender: "female", goal: "wealth", scoreNumber: 15, scoreGrade: "A+", freeFromKalakiniDays: ["sunday", "tuesday", "wednesday_day", "saturday"] },
  { id: "w8", name: "ศศิภัทร", meaning: "งดงามดั่งดวงจันทร์และเปี่ยมทรัพย์", gender: "female", goal: "wealth", scoreNumber: 24, scoreGrade: "A+", freeFromKalakiniDays: ["tuesday", "wednesday_day", "thursday", "saturday"] },
  { id: "w9", name: "สิรินทร์", meaning: "ผู้เป็นยอดแห่งความมงคลและโชคลาภ", gender: "female", goal: "wealth", scoreNumber: 36, scoreGrade: "A+", freeFromKalakiniDays: ["tuesday", "wednesday_day", "thursday", "wednesday_night"] },
  { id: "w10", name: "อนันตยศ", meaning: "ผู้มีเกียรติยศและทรัพย์สินไม่มีที่สิ้นสุด", gender: "male", goal: "wealth", scoreNumber: 41, scoreGrade: "A+", freeFromKalakiniDays: ["tuesday", "thursday", "wednesday_night"] },
  { id: "w11", name: "กรกต", meaning: "ผู้มีความสุขดั่งดอกบัว ประสบแต่สิ่งมงคล", gender: "unisex", goal: "wealth", scoreNumber: 14, scoreGrade: "A+", freeFromKalakiniDays: ["sunday", "monday", "thursday", "friday", "saturday"] },
  { id: "w12", name: "ชนกนันท์", meaning: "ผู้เป็นที่ยินดีแห่งบิดา นำพาความเจริญ", gender: "unisex", goal: "wealth", scoreNumber: 36, scoreGrade: "A+", freeFromKalakiniDays: ["sunday", "friday", "saturday"] },

  // --- อำนาจ บารมี ผู้นำ (Leadership) ---
  { id: "l1", name: "กฤติน", meaning: "ผู้มีความเชี่ยวชาญ เฉลียวฉลาดดั่งปราชญ์", gender: "male", goal: "leadership", scoreNumber: 19, scoreGrade: "A+", freeFromKalakiniDays: ["sunday", "monday", "wednesday_night", "friday", "saturday"] },
  { id: "l2", name: "เตชินท์", meaning: "ผู้มีเดชบารมี เป็นยอดแห่งผู้นำ", gender: "male", goal: "leadership", scoreNumber: 36, scoreGrade: "A+", freeFromKalakiniDays: ["sunday", "wednesday_night", "friday", "saturday"] },
  { id: "l3", name: "ปราชญ์", meaning: "ผู้ทรงภูมิปัญญา ผู้รู้ยิ่ง", gender: "male", goal: "leadership", scoreNumber: 24, scoreGrade: "A+", freeFromKalakiniDays: ["sunday", "monday", "tuesday", "thursday", "saturday"] },
  { id: "l4", name: "ภูริช", meaning: "ผู้เป็นใหญ่ในแผ่นดิน มีอำนาจเด็ดขาด", gender: "male", goal: "leadership", scoreNumber: 15, scoreGrade: "A+", freeFromKalakiniDays: ["sunday", "monday", "thursday", "saturday"] },
  { id: "l5", name: "อัครวินท์", meaning: "ผู้ได้รับสิ่งที่ยอดเยี่ยม เป็นเลิศกว่าผู้อื่น", gender: "male", goal: "leadership", scoreNumber: 45, scoreGrade: "A+", freeFromKalakiniDays: ["sunday", "tuesday", "thursday", "wednesday_night"] },
  { id: "l6", name: "กฤษฎิ์", meaning: "ผู้ฉลาด ปราดเปรื่อง มีเกียรติยศ", gender: "male", goal: "leadership", scoreNumber: 19, scoreGrade: "A+", freeFromKalakiniDays: ["sunday", "monday", "wednesday_night", "friday"] },
  { id: "l7", name: "ฐิติกร", meaning: "ผู้สร้างความมั่นคง ดำรงอยู่ในคุณธรรม", gender: "male", goal: "leadership", scoreNumber: 24, scoreGrade: "A+", freeFromKalakiniDays: ["sunday", "monday", "wednesday_night", "friday"] },
  { id: "l8", name: "ธนดล", meaning: "ผู้บันดาลทรัพย์ บันดาลอำนาจ", gender: "male", goal: "leadership", scoreNumber: 19, scoreGrade: "A+", freeFromKalakiniDays: ["sunday", "monday", "friday", "wednesday_night"] },

  // --- เสน่ห์ เมตตามหานิยม มีคนอุปถัมภ์ (Support) ---
  { id: "s1", name: "กานต์พิชชา", meaning: "ผู้เป็นที่รักและมีความรู้ยิ่ง", gender: "female", goal: "support", scoreNumber: 45, scoreGrade: "A+", freeFromKalakiniDays: ["sunday", "thursday", "wednesday_night", "saturday"] },
  { id: "s2", name: "ญาณิน", meaning: "ผู้มีปรีชาญาณและเป็นที่รักใคร่", gender: "female", goal: "support", scoreNumber: 24, scoreGrade: "A+", freeFromKalakiniDays: ["sunday", "monday", "friday", "saturday"] },
  { id: "s3", name: "ปิยพัทธ์", meaning: "ผู้ผูกพันด้วยความรัก มีเสน่ห์จับใจ", gender: "unisex", goal: "support", scoreNumber: 36, scoreGrade: "A+", freeFromKalakiniDays: ["sunday", "monday", "tuesday", "friday", "saturday"] },
  { id: "s4", name: "มณฑิตา", meaning: "ผู้ได้รับการยกย่อง สรรเสริญและเมตตา", gender: "female", goal: "support", scoreNumber: 24, scoreGrade: "A+", freeFromKalakiniDays: ["sunday", "friday", "saturday"] },
  { id: "s5", name: "ลภัส", meaning: "ผู้มีลาภ มีคนคอยเกื้อหนุนเสมอ", gender: "unisex", goal: "support", scoreNumber: 15, scoreGrade: "A+", freeFromKalakiniDays: ["monday", "tuesday", "thursday", "wednesday_night"] },
  { id: "s6", name: "วรินทร", meaning: "ผู้ประเสริฐยิ่ง มีจิตใจโอบอ้อมอารี", gender: "unisex", goal: "support", scoreNumber: 24, scoreGrade: "A+", freeFromKalakiniDays: ["sunday", "monday", "tuesday", "wednesday_night"] },
  { id: "s7", name: "ศศิชา", meaning: "เกิดจากดวงจันทร์ มีเสน่ห์เยือกเย็น", gender: "female", goal: "support", scoreNumber: 15, scoreGrade: "A+", freeFromKalakiniDays: ["tuesday", "thursday", "wednesday_night", "saturday"] },
  { id: "s8", name: "อินทุอร", meaning: "งามผุดผ่องดั่งดวงจันทร์ มีผู้ใหญ่เอ็นดู", gender: "female", goal: "support", scoreNumber: 36, scoreGrade: "A+", freeFromKalakiniDays: ["sunday", "tuesday", "wednesday_night", "saturday"] },

  // --- สุขภาพ ร่มเย็น อายุยืน (Health) ---
  { id: "h1", name: "เกษมสันต์", meaning: "ผู้มีความชื่นบาน ร่มเย็น ปราศจากโรค", gender: "male", goal: "health", scoreNumber: 45, scoreGrade: "A+", freeFromKalakiniDays: ["thursday", "friday", "wednesday_night"] },
  { id: "h2", name: "จิตติภัทร", meaning: "ผู้มีจิตใจผ่องแผ้ว ปลอดภัย ไร้ทุกข์", gender: "male", goal: "health", scoreNumber: 36, scoreGrade: "A+", freeFromKalakiniDays: ["sunday", "friday", "saturday"] },
  { id: "h3", name: "ชิษณุพงศ์", meaning: "ตระกูลของผู้ชนะโรคภัย มีกำลังกายใจสมบูรณ์", gender: "male", goal: "health", scoreNumber: 54, scoreGrade: "A+", freeFromKalakiniDays: ["sunday", "monday", "thursday", "saturday"] },
  { id: "h4", name: "นิพัทธ์", meaning: "ผู้มีความมั่นคง ยืนยง สุขภาพแข็งแรง", gender: "male", goal: "health", scoreNumber: 41, scoreGrade: "A+", freeFromKalakiniDays: ["sunday", "tuesday", "friday", "saturday"] },
  { id: "h5", name: "พิมลพัทธ์", meaning: "ผู้บริสุทธิ์ผุดผ่อง สุขกายสบายใจ", gender: "female", goal: "health", scoreNumber: 45, scoreGrade: "A+", freeFromKalakiniDays: ["sunday", "tuesday", "thursday"] },
  { id: "h6", name: "ศานต์", meaning: "ความสงบเยือกเย็น สุขภาพจิตสมบูรณ์", gender: "unisex", goal: "health", scoreNumber: 19, scoreGrade: "A+", freeFromKalakiniDays: ["tuesday", "wednesday_day", "thursday", "saturday"] },
  { id: "h7", name: "สถิตพร", meaning: "พรแห่งความยั่งยืน อายุวัฒนะ", gender: "unisex", goal: "health", scoreNumber: 24, scoreGrade: "A+", freeFromKalakiniDays: ["tuesday", "wednesday_day", "friday"] },
  { id: "h8", name: "อนามัย", meaning: "ความไม่มีโรค เป็นลาภอันประเสริฐ", gender: "unisex", goal: "health", scoreNumber: 19, scoreGrade: "A+", freeFromKalakiniDays: ["sunday", "tuesday", "thursday"] },
];

export function filterAuspiciousNames({
  birthDay,
  gender,
  goal,
  searchQuery,
}: {
  birthDay?: string;
  gender?: "all" | "male" | "female" | "unisex";
  goal?: "all" | "wealth" | "leadership" | "support" | "health";
  searchQuery?: string;
}): AuspiciousName[] {
  return AUSPICIOUS_NAMES_CATALOG.filter((item) => {
    // 1. Birth day filter (must not contain Kalakini)
    if (birthDay && !item.freeFromKalakiniDays.includes(birthDay)) {
      return false;
    }

    // 2. Gender filter
    if (gender && gender !== "all") {
      if (item.gender !== gender && item.gender !== "unisex") {
        return false;
      }
    }

    // 3. Goal filter
    if (goal && goal !== "all") {
      if (item.goal !== goal) return false;
    }

    // 4. Search query
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchMeaning = item.meaning.toLowerCase().includes(q);
      if (!matchName && !matchMeaning) return false;
    }

    return true;
  });
}
