export interface PlateAnalysisResult {
  plateInput: string;
  cleanedPlate: string;
  prefixDigits: string;
  letters: string;
  digits: string;
  letterSum: number;
  digitSum: number;
  grandTotal: number;
  grade: "A+" | "A" | "B" | "C" | "D";
  score: number;
  overallMeaning: string;
  pros: string[];
  cautions: string[];
  dimensions: {
    safety: number;
    wealth: number;
    prestige: number;
    smoothness: number;
  };
  pairs: Array<{
    pair: string;
    meaning: string;
    isAuspicious: boolean;
  }>;
  colorAdvice?: {
    birthDay: string;
    favorableColors: string[];
    unfavorableColors: string[];
    description: string;
  };
  remedies: string[];
}

export const THAI_LETTER_VALUES: Record<string, number> = {
  ก: 1, ด: 1, ถ: 1, ท: 1, ภ: 1,
  ข: 2, ช: 2, ง: 2, บ: 2, ป: 2,
  ต: 3, ฑ: 3, ฒ: 3, ฆ: 3,
  ค: 4, ธ: 4, ญ: 4, ร: 4, ษ: 4,
  ฉ: 5, ฌ: 5, ณ: 5, น: 5, ม: 5, ห: 5, ฮ: 5, ฬ: 5, ฎ: 5, ฏ: 5,
  จ: 6, ล: 6, ว: 6, อ: 6,
  ซ: 7, ศ: 7, ส: 7,
  พ: 8, ฟ: 8, ผ: 8, ฝ: 8, ย: 8,
  ฐ: 9,
};

const AUSPICIOUS_NUMBERS: Record<number, { meaning: string; grade: "A+" | "A" | "B"; pros: string[] }> = {
  9: { meaning: "เลขแห่งความก้าวหน้า สิ่งศักดิ์สิทธิ์คุ้มครอง แคล้วคลาดปลอดภัยสูงสุด", grade: "A+", pros: ["คุ้มครองปลอดภัย", "เจริญรุ่งเรือง", "มีชื่อเสียง"] },
  14: { meaning: "พลังปัญญาและเสน่ห์เมตตา เจรจาค้าขายคล่องตัว ผู้ใหญ่ให้การสนับสนุน", grade: "A+", pros: ["เจรจาสำเร็จ", "ผู้ใหญ่หนุนหลัง", "งานราบรื่น"] },
  15: { meaning: "เสน่ห์เมตตามหานิยม มีมิตรสหายและผู้เกื้อหนุนที่ดี ชะตารุ่งโรจน์", grade: "A+", pros: ["เมตตามหานิยม", "ไร้อุปสรรค", "คนช่วยเหลือ"] },
  19: { meaning: "พลังแห่งความสำเร็จขั้นสูง วาสนาบารมี โดดเด่นเป็นผู้นำ มีโชคลาภ", grade: "A+", pros: ["บารมีเด่น", "ความสำเร็จสูง", "ชนะคู่แข่ง"] },
  24: { meaning: "เลขยอดนิยมมหาเสน่ห์ ทรัพย์สินเงินทองไหลมาเทมา ความรักสุขสมหวัง", grade: "A+", pros: ["เงินทองคล่องตัว", "เสน่ห์ดึงดูด", "ไร้ศัตรู"] },
  28: { meaning: "พลังความกล้าหาญ กล้าได้กล้าเสีย เหมาะกับงานธุรกิจหมุนเงินก้อนใหญ่", grade: "A", pros: ["ค้าขายเงินสะพัด", "ใจกว้าง", "มีวิสัยทัศน์"] },
  36: { meaning: "คู่ทรัพย์คู่โชค ความรักราบรื่น การเงินมั่นคง การงานมีคนอุปถัมภ์", grade: "A+", pros: ["การเงินดีเยี่ยม", "ความรักราบรื่น", "งานก้าวหน้า"] },
  41: { meaning: "พลังแห่งปัญญาและการสื่อสาร เดินทางปลอดภัย มีเครือข่ายคอนเนกชันกว้าง", grade: "A+", pros: ["ติดต่อราบรื่น", "ไหวพริบดี", "ปลอดภัย"] },
  42: { meaning: "เลขวาจาเรียกทรัพย์ ผู้คนรักใคร่ เจรจาค้าขายร่ำรวย", grade: "A+", pros: ["เจรจามั่งคั่ง", "วาจาศักดิ์สิทธิ์", "มิตรรักใคร่"] },
  45: { meaning: "เลขครูบารมี สติปัญญาและความสุขสงบ ชนะอุปสรรคทั้งปวง", grade: "A+", pros: ["ปัญญาสูง", "แคล้วคลาด", "ชีวิตสงบสุข"] },
  50: { meaning: "พลังปัญญาเชื่อมโยงต่างแดน การค้าออนไลน์หรือเดินทางไกลไร้กังวล", grade: "A", pros: ["ก้าวไกล", "มีโชคต่างแดน", "ทันยุคทันสมัย"] },
  51: { meaning: "ความสุขสมหวัง มีโชคลาภไม่ขาดสาย การงานเลื่อนขั้น เลื่อนตำแหน่ง", grade: "A+", pros: ["สุขสมหวัง", "เงินไม่ขาดมือ", "ตำแหน่งมั่นคง"] },
  54: { meaning: "เลขมหาราชาแห่งความสำเร็จ ความก้าวหน้าทั้งการเงินและสุขภาพ", grade: "A+", pros: ["มั่นคงยั่งยืน", "สุขภาพดี", "ผู้ใหญ่เกื้อกูล"] },
  55: { meaning: "เลขแห่งความสงบสุข บารมีธรรม สิ่งศักดิ์สิทธิ์ปกป้องคุ้มครอง ไร้เคราะห์", grade: "A+", pros: ["แคล้วคลาด", "ใจเย็นมีสติ", "บารมีสูง"] },
  56: { meaning: "เลขมหาเศรษฐี คู่ทรัพย์คู่ปัญญา ทั้งรวยทั้งฉลาด มีความสุขสมบูรณ์", grade: "A+", pros: ["มหาเศรษฐี", "ความสุขสมบูรณ์", "ความสำเร็จ"] },
  59: { meaning: "เลขแห่งเทพคุ้มครอง เดินทางใกล้ไกลปลอดภัย มีความสำเร็จเหนือความคาดหมาย", grade: "A+", pros: ["เทพรักษา", "แคล้วคลาด", "โชคไม่คาดฝัน"] },
  63: { meaning: "เสน่ห์วาจา เงินทองและความรักไหลลื่น ขับขี่สบายใจ ไร้อารมณ์ร้อน", grade: "A+", pros: ["เสน่ห์แรง", "เงินเข้าสม่ำเสมอ", "ขับขี่สบายใจ"] },
  65: { meaning: "คู่ดาวศุภเคราะห์คู่ใหญ่ ชีวิตมีความมั่นคง ร่ำรวยสุขสบายทั้งครอบครัว", grade: "A+", pros: ["ความมั่นคงสูง", "ร่ำรวยสบาย", "เกียรติยศ"] },
};

const PAIR_MEANINGS: Record<string, { meaning: string; isAuspicious: boolean }> = {
  "14": { meaning: "เจรจาดี มีไหวพริบ", isAuspicious: true },
  "41": { meaning: "ติดต่อสื่อสารคล่องตัว", isAuspicious: true },
  "15": { meaning: "ผู้ใหญ่เมตตา อุปถัมภ์", isAuspicious: true },
  "51": { meaning: "สติปัญญาดี ความสุข", isAuspicious: true },
  "19": { meaning: "บารมีโดดเด่น มีชื่อเสียง", isAuspicious: true },
  "91": { meaning: "ผู้นำ ชัยชนะก้าวหน้า", isAuspicious: true },
  "24": { meaning: "เสน่ห์เมตตา ค้าขายดี", isAuspicious: true },
  "42": { meaning: "วาจาเรียกทรัพย์ สุขภาพดี", isAuspicious: true },
  "36": { meaning: "การเงินคล่องตัว ความรักหวาน", isAuspicious: true },
  "63": { meaning: "ดึงดูดเงินทอง เสน่ห์", isAuspicious: true },
  "45": { meaning: "ปัญญา สติรอบคอบ ปลอดภัย", isAuspicious: true },
  "54": { meaning: "ผู้ใหญ่หนุน นิ่งรอบคอบ", isAuspicious: true },
  "56": { meaning: "รวยทรัพย์ รวยปัญญา", isAuspicious: true },
  "65": { meaning: "โชคลาภไม่ขาดสาย มั่นคง", isAuspicious: true },
  "59": { meaning: "สิ่งศักดิ์สิทธิ์คุ้มครอง แคล้วคลาด", isAuspicious: true },
  "95": { meaning: "ปลอดภัย จิตใจสงบ", isAuspicious: true },
  "89": { meaning: "บารมีกว้างขวาง กล้าได้กล้าเสีย", isAuspicious: true },
  "98": { meaning: "อำนาจบารมี โชคลาภก้อนโต", isAuspicious: true },
  "99": { meaning: "แคล้วคลาดปลอดภัยสูงสุด สิ่งศักดิ์สิทธิ์รักษา", isAuspicious: true },

  // คู่เลขที่ควรระวัง
  "13": { meaning: "ระวังอุบัติเหตุ การเฉี่ยวชนกะทันหัน", isAuspicious: false },
  "31": { meaning: "ใจร้อน มักเกิดรอยขีดข่วนบ่อย", isAuspicious: false },
  "37": { meaning: "ซ่อมจุกจิก มีอุปสรรคการเดินทาง", isAuspicious: false },
  "73": { meaning: "ระวังเรื่องเบรกหรือช่วงล่างบ่อยครั้ง", isAuspicious: false },
  "00": { meaning: "ซ่อมบ่อย หรือไม่ค่อยได้ใช้งาน", isAuspicious: false },
  "03": { meaning: "ระวังผ่าตัดหรืออุบัติเหตุจากการชน", isAuspicious: false },
  "30": { meaning: "ใจร้อน อารมณ์ฉุนเฉียวขณะขับขี่", isAuspicious: false },
  "48": { meaning: "ระวังเรื่องเอกสารใบสั่ง การถูกหลอกลวง", isAuspicious: false },
  "84": { meaning: "มีปากเสียงหรือปัญหาข้อพิพาทบนท้องถนน", isAuspicious: false },
  "67": { meaning: "เงินรั่วไหล ซ่อมแซมบ่อย", isAuspicious: false },
  "76": { meaning: "ค่าใช้จ่ายเกี่ยวกับรถสูงเกินจำเป็น", isAuspicious: false },
};

export const BIRTH_DAY_CAR_COLORS: Record<string, { favorable: string[]; unfavorable: string[]; desc: string }> = {
  sunday: {
    favorable: ["ขาว", "ครีม", "บรอนซ์เงิน (เสริมมลตรี/คนหนุน)", "ดำ", "ม่วง (เสริมทรัพย์)", "เขียว (เสริมอำนาจ)"],
    unfavorable: ["น้ำเงิน", "ฟ้า (สีกาลกิณี)"],
    desc: "คนเกิดวันอาทิตย์: เสริมพลังด้วยสีโทนสว่างหรือสีดำเข้ม หลีกเลี่ยงสีโทนฟ้า/น้ำเงิน",
  },
  monday: {
    favorable: ["ส้ม", "ทอง (เสริมทรัพย์)", "เขียว (เสริมเสน่ห์เมตตา)", "ดำ", "น้ำเงิน (เสริมอำนาจบารมี)"],
    unfavorable: ["แดง (สีกาลกิณี)"],
    desc: "คนเกิดวันจันทร์: สีเขียวและสีทองเสริมความรวยและความราบรื่น ไม่แนะนำสีแดงสด",
  },
  tuesday: {
    favorable: ["ดำ", "ม่วง (เสริมมงคลรวม)", "บรอนซ์ทอง", "ส้ม (เสริมบารมี)", "น้ำตาล"],
    unfavorable: ["ขาว", "ครีม (สีกาลกิณี)"],
    desc: "คนเกิดวันอังคาร: รถสีเข้มโทนดุดันหรือบรอนซ์ทองเสริมพลัง ไม่ถูกกับสีขาวนวล",
  },
  wednesday_day: {
    favorable: ["บรอนซ์เงิน", "เทา (เสริมทรัพย์)", "ขาว", "ครีม (เสริมผู้ใหญ่หนุน)", "น้ำเงิน", "ฟ้า"],
    unfavorable: ["ชมพู (สีกาลกิณี)"],
    desc: "คนเกิดวันพุธกลางวัน: สีโทนเมทัลลิก เทา หรือขาว ช่วยให้แคล้วคลาดและค้าขายขึ้น หลีกเลี่ยงสีชมพู",
  },
  wednesday_night: {
    favorable: ["ดำ", "ม่วงเข้ม (เสริมบารมี)", "ขาว", "ครีม (เสริมการเงิน)", "แดง (เสริมเมตตา)"],
    unfavorable: ["ส้ม", "ทอง (สีกาลกิณี)"],
    desc: "คนเกิดวันพุธกลางคืน (ราหู): ถูกโฉลกกับสีดำ ลึกลับ และแดง หลีกเลี่ยงสีส้มและทอง",
  },
  thursday: {
    favorable: ["ขาว", "บรอนซ์เงิน (เสริมทรัพย์)", "แดง (เสริมอำนาจ)", "ฟ้า", "น้ำเงิน (เสริมความราบรื่น)"],
    unfavorable: ["ดำ", "ม่วง (สีกาลกิณี)"],
    desc: "คนเกิดวันพฤหัสบดี: สีขาว สว่าง ฟ้า หรือแดง ช่วยให้ขับขี่ปลอดภัย ไม่แนะนำรถสีดำเข้ม",
  },
  friday: {
    favorable: ["เขียว (เสริมทรัพย์รุ่งเรือง)", "ชมพู (เสริมมิตรสหาย)", "ขาว", "ทอง (เสริมบารมี)"],
    unfavorable: ["เทาเข้ม", "บรอนซ์เงินเข้ม (สีกาลกิณี)"],
    desc: "คนเกิดวันศุกร์: รถสีเขียว ชมพู หรือขาวทอง ช่วยเรียกเงินเข้ากระเป๋า ไม่แนะนำสีเทาดำหม่น",
  },
  saturday: {
    favorable: ["ดำ", "ม่วง (เสริมบารมีโดยตรง)", "น้ำเงิน", "ฟ้า (เสริมทรัพย์สิน)", "ทอง", "ส้ม"],
    unfavorable: ["เขียว (สีกาลกิณี)"],
    desc: "คนเกิดวันเสาร์: สีดำด้าน ม่วง หรือน้ำเงินเข้มเสริมดวงให้เกรียงไกร ห้ามรถสีเขียว",
  },
};

export function analyzeLicensePlate(input: string, birthDayKey?: string): PlateAnalysisResult {
  const cleaned = input.trim().replace(/\s+/g, "");
  
  // Extract patterns: e.g. "1กก9999", "ขข168", "9999"
  const match = cleaned.match(/^([0-9]?)([\u0E01-\u0E2E]+)?([0-9]+)$/);
  
  const prefixDigits = match ? match[1] || "" : "";
  const letters = match ? match[2] || "" : cleaned.replace(/[0-9]/g, "");
  const digits = match ? match[3] || "" : cleaned.replace(/[^0-9]/g, "");

  // Calculate letter sum
  let letterSum = 0;
  if (prefixDigits) {
    letterSum += parseInt(prefixDigits, 10);
  }
  for (const ch of letters) {
    letterSum += THAI_LETTER_VALUES[ch] || 0;
  }

  // Calculate digits sum
  let digitSum = 0;
  for (const d of digits) {
    digitSum += parseInt(d, 10);
  }

  const grandTotal = letterSum + digitSum;

  // Evaluate pairs in the 4 trailing digits
  const pairs: PlateAnalysisResult["pairs"] = [];
  let badPairCount = 0;
  let goodPairCount = 0;

  if (digits.length >= 2) {
    for (let i = 0; i < digits.length - 1; i++) {
      const pair = digits.slice(i, i + 2);
      const info = PAIR_MEANINGS[pair];
      if (info) {
        pairs.push({ pair, meaning: info.meaning, isAuspicious: info.isAuspicious });
        if (info.isAuspicious) goodPairCount++;
        else badPairCount++;
      } else {
        pairs.push({ pair, meaning: "พลังงานปานกลางทั่วไป", isAuspicious: true });
      }
    }
  }

  // Determine grade & score
  let score = 70;
  if (AUSPICIOUS_NUMBERS[grandTotal]) {
    score += 18;
  }
  if (AUSPICIOUS_NUMBERS[digitSum]) {
    score += 10;
  }
  score += goodPairCount * 4;
  score -= badPairCount * 12;

  if (score > 98) score = 98;
  if (score < 40) score = 42;

  let grade: PlateAnalysisResult["grade"] = "B";
  if (score >= 90) grade = "A+";
  else if (score >= 80) grade = "A";
  else if (score >= 65) grade = "B";
  else if (score >= 50) grade = "C";
  else grade = "D";

  // Dimensions
  const safety = Math.min(99, Math.max(50, 80 + (digits.includes("9") ? 8 : 0) - (badPairCount * 14)));
  const wealth = Math.min(99, Math.max(50, 75 + (digits.includes("8") || digits.includes("6") ? 10 : 0) + (goodPairCount * 3)));
  const prestige = Math.min(99, Math.max(50, 72 + (digits.includes("1") || digits.includes("9") ? 12 : 0)));
  const smoothness = Math.min(99, Math.max(50, 78 + (digits.includes("5") || digits.includes("4") ? 8 : 0) - (badPairCount * 10)));

  // Overall meaning
  const overallMeaning = AUSPICIOUS_NUMBERS[grandTotal]?.meaning ||
    `ผลรวมเลขศาสตร์รวม ${grandTotal} เป็นเลขพลังงานปานกลาง เดินทางปลอดภัย มีความคล่องตัวตามจังหวะชีวิต`;

  const pros = AUSPICIOUS_NUMBERS[grandTotal]?.pros || ["มีความคล่องตัว", "การเดินทางราบรื่น", "ปรับตัวได้ดี"];
  const cautions: string[] = [];
  const remedies: string[] = [];

  if (badPairCount > 0) {
    cautions.push("มีคู่เลขที่ต้องระวังเรื่องอารมณ์ใจร้อนหรือการเฉี่ยวชน ควรขับขี่อย่างมีสติ");
    remedies.push("บูชาสิ่งศักดิ์สิทธิ์ประจำรถ เช่น ท้าวเวสสุวรรณ หลวงปู่ทวด หรือพระพุทธรูปปางสมาธิ");
    remedies.push("ติดแผ่นทองคำเปลว 3 จุด บริเวณหลังกระจกมองหลังเพื่อเสริมมงคลแคล้วคลาด");
  } else {
    cautions.push("รักษาการขับขี่ปลอดภัยอย่างมีสติและตรวจเช็คสภาพรถตามระยะ");
    remedies.push("หมั่นทำความสะอาดรถให้สะอาด โปร่งโล่ง เป็นการเปิดรับพลังงานชี่มงคล");
  }

  const result: PlateAnalysisResult = {
    plateInput: input,
    cleanedPlate: cleaned,
    prefixDigits,
    letters,
    digits,
    letterSum,
    digitSum,
    grandTotal,
    grade,
    score,
    overallMeaning,
    pros,
    cautions,
    dimensions: {
      safety,
      wealth,
      prestige,
      smoothness,
    },
    pairs,
    remedies,
  };

  if (birthDayKey && BIRTH_DAY_CAR_COLORS[birthDayKey]) {
    const advice = BIRTH_DAY_CAR_COLORS[birthDayKey];
    result.colorAdvice = {
      birthDay: birthDayKey,
      favorableColors: advice.favorable,
      unfavorableColors: advice.unfavorable,
      description: advice.desc,
    };
  }

  return result;
}
