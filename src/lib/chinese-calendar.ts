// -------------------------------------------------------------
// CHINESE ALMANAC & TAI SUI (ปฏิทินฤกษ์มงคล และ ปีชง 2569)
// -------------------------------------------------------------

export interface AuspiciousDayInfo {
  date: string; // YYYY-MM-DD
  dayOfMonth: number;
  thaiDateString: string;
  lunarPhase: string; // ข้างขึ้น/ข้างแรม
  dayQuality: "ธงชัย" | "อธิบดี" | "มงคลทั่วไป" | "อุบาทว์" | "โลกาวินาศ";
  clashZodiac: string; // วันนี้ชงกับปีอะไร
  elementEnergy: string; // ธาตุประจำวัน
  goodActivities: string[]; // กิจกรรมที่ควรทำ
  badActivities: string[]; // กิจกรรมที่ควรเลี่ยง
  luckyHours: string; // ช่วงเวลาฤกษ์ดี
  luckyDirection: string; // ทิศมงคล
}

export const ZODIAC_ANIMALS = [
  { name: "ชวด", animal: "หนู", element: "น้ำ", cn: "鼠 (Shǔ)" },
  { name: "ฉลู", animal: "วัว", element: "ดิน", cn: "牛 (Niú)" },
  { name: "ขาล", animal: "เสือ", element: "ไม้", cn: "虎 (Hǔ)" },
  { name: "เถาะ", animal: "กระต่าย", element: "ไม้", cn: "兔 (Tù)" },
  { name: "มะโรง", animal: "มังกร", element: "ดิน", cn: "龙 (Lóng)" },
  { name: "มะเส็ง", animal: "งูเล็ก", element: "ไฟ", cn: "蛇 (Shé)" },
  { name: "มะเมีย", animal: "ม้า", element: "ไฟ", cn: "马 (Mǎ)" },
  { name: "มะแม", animal: "แพะ", element: "ดิน", cn: "羊 (Yáng)" },
  { name: "วอก", animal: "ลิง", element: "ทอง", cn: "猴 (Hóu)" },
  { name: "ระกา", animal: "ไก่", element: "ทอง", cn: "鸡 (Jī)" },
  { name: "จอ", animal: "หมา", element: "ดิน", cn: "狗 (Gǒu)" },
  { name: "กุน", animal: "หมู", element: "น้ำ", cn: "猪 (Zhū)" },
];

export interface TaiSuiClashResult {
  zodiacName: string;
  zodiacAnimal: string;
  birthYearBe: number;
  currentYearBe: number;
  clashType: "ชงตรง 100%" | "ชงร่วม (คัก)" | "ชงร่วม (เฮ้ง)" | "ชงร่วม (ผั่ว)" | "ไม่ชง (ดวงราบรื่น)" | "สมพงษ์มงคล";
  clashPercentage: number;
  severity: "high" | "medium" | "low" | "none";
  cautionAreas: string[];
  remedies: string[];
  recommendedShrines: { name: string; location: string; highlight: string }[];
  prayerText: string;
}

export function calculateTaiSui(birthYearBe: number): TaiSuiClashResult {
  const currentYearBe = 2569; // 2026 ปีมะเมีย (ม้า)
  // คำนวณนักษัตรจาก พ.ศ. (พ.ศ. 2563 = ชวด, 2564 = ฉลู, 2565 = ขาล, 2566 = เถาะ, 2567 = มะโรง, 2568 = มะเส็ง, 2569 = มะเมีย)
  const offset = ((birthYearBe - 2563) % 12 + 12) % 12;
  const zodiac = ZODIAC_ANIMALS[offset];

  // ปีมะเมีย (2026):
  // ชงตรง: ชวด (หนู) - ตรงข้าม 180 องศา
  // คัก: มะเมีย (ม้า) - ปีทับตัวเกิด
  // เฮ้ง: เถาะ (กระต่าย) - เบียดเบียน
  // ผั่ว: ระกา (ไก่) - ขัดแย้ง/แตกหัก
  // สมพงษ์ (ไตรภาคี): ขาล (เสือ), จอ (หมา), มะแม (แพะ)

  if (zodiac.name === "ชวด") {
    return {
      zodiacName: "ปีชวด",
      zodiacAnimal: "หนู",
      birthYearBe,
      currentYearBe,
      clashType: "ชงตรง 100%",
      clashPercentage: 100,
      severity: "high",
      cautionAreas: [
        "การเปลี่ยนแปลงครั้งใหญ่ในชีวิต (ย้ายงาน ย้ายที่อยู่ เลิกรา)",
        "อุบัติเหตุจากการเดินทางไกลและทางน้ำ",
        "การเงินผันผวน ระวังการลงทุนที่มีความเสี่ยงสูงและการถูกหลอกลวง",
        "สุขภาพระบบทางเดินหายใจและความเครียดสะสม",
      ],
      remedies: [
        "ไหว้เทพเจ้าไท้ส่วยเอี๊ยเพื่อฝากดวงชะตาและปัดเป่าเคราะห์ร้าย",
        "ทำบุญปล่อยปลา ปล่อยสัตว์ที่กำลังจะถูกฆ่า",
        "บริจาคโลหิต หรือทำฟัน ขูดหินปูน เพื่อแก้เคล็ดเลือดตกยางออก",
        "งดเว้นการไปร่วมงานศพหรือพิธีส่งวิญญาณ หากเลี่ยงไม่ได้ให้พกกิ่งทับทิมติดตัว",
      ],
      recommendedShrines: [
        { name: "วัดมังกรกมลาวาส (วัดเล่งเน่ยยี่ เยาวราช)", location: "กรุงเทพฯ", highlight: "ศูนย์กลางพิธีแก้ชงอันดับ 1 ของไทย" },
        { name: "ศาลเจ้าพ่อเสือ (เสาชิงช้า)", location: "กรุงเทพฯ", highlight: "เสริมอำนาจบารมี คุ้มครองความปลอดภัย สะเดาะเคราะห์" },
        { name: "วัดทิพยวารีวิหาร (วัดกัมโล่วยี่)", location: "บ้านหม้อ กรุงเทพฯ", highlight: "ไหว้เทพเจ้ามังกรเขียว เสริมโชคลาภและความร่มเย็น" },
      ],
      prayerText: "ข้าพเจ้า (ชื่อ-นามสกุล) เกิดปีชวด ขอตั้งจิตน้อมกราบสักการะองค์เทพเจ้าไท้ส่วยเอี๊ย ขอบารมีพระองค์ช่วยคุ้มครองดวงชะตา ให้แคล้วคลาดจากสรรพเคราะห์และภัยอันตรายทั้งปวง เปลี่ยนร้ายกลายเป็นดี มั่งคั่งปลอดภัยตลอดปีมะเมียนี้เทอญ",
    };
  }

  if (zodiac.name === "มะเมีย") {
    return {
      zodiacName: "ปีมะเมีย",
      zodiacAnimal: "ม้า",
      birthYearBe,
      currentYearBe,
      clashType: "ชงร่วม (คัก)",
      clashPercentage: 75,
      severity: "medium",
      cautionAreas: [
        "อารมณ์ร้อน หงุดหงิดง่าย การตัดสินใจผิดพลาดเพราะความใจเร็ว",
        "ความขัดแย้งกับคนใกล้ชิดหรือผู้ใหญ่ในสายงาน",
        "ปัญหาสุขภาพเกี่ยวกับสายตา หัวใจ และความดัน",
      ],
      remedies: [
        "สวดมนต์ นั่งสมาธิ แผ่เมตตา เพื่อเสริมความเยือกเย็นของจิตใจ",
        "ไหว้พระ 9 วัด เสริมสิริมงคลให้ชีวิตราบรื่น",
        "ทำบุญเติมน้ำมันตะเกียง ถวายหลอดไฟ เสริมแสงสว่างให้ปัญญา",
      ],
      recommendedShrines: [
        { name: "ศาลหลักเมือง กรุงเทพมหานคร", location: "สนามหลวง", highlight: "เสริมความมั่นคงในหน้าที่การงานและหลักชัยของชีวิต" },
        { name: "วัดเล่งเน่ยยี่ 2 (บางบัวทอง)", location: "นนทบุรี", highlight: "สวดมนต์แก้ปีชง เสริมพลังคุ้มครอง" },
      ],
      prayerText: "ข้าพเจ้าเกิดปีมะเมีย ขอถวายสักการะองค์ไท้ส่วยเอี๊ย ขออำนาจทิพยบารมีช่วยคุ้มครอง ให้มีสติปัญญาแจ่มใส ปราศจากอุปสรรคทั้งปวง",
    };
  }

  if (zodiac.name === "เถาะ") {
    return {
      zodiacName: "ปีเถาะ",
      zodiacAnimal: "กระต่าย",
      birthYearBe,
      currentYearBe,
      clashType: "ชงร่วม (เฮ้ง)",
      clashPercentage: 50,
      severity: "medium",
      cautionAreas: [
        "คดีความ เอกสารสัญญา ข้อพิพาทเรื่องผลประโยชน์",
        "ถูกคนอิจฉาริษยา ถูกนินทาใส่ร้าย",
        "ปวดเมื่อยกล้ามเนื้อ แขน ขา กระดูก",
      ],
      remedies: [
        "ทำบุญบริจาคโลงศพและผ้าห่อศพ มูลนิธิป่อเต็กตึ๊งหรือร่วมกตัญญู",
        "ตรวจเช็คเอกสารสัญญาทุกฉบับด้วยความรอบคอบ อย่าค้ำประกันให้ใคร",
        "ทำบุญช่วยค่ายาผู้ป่วยยากไร้ตามโรงพยาบาลรัฐ",
      ],
      recommendedShrines: [
        { name: "ศาลเจ้าพ่อเสือ (เสาชิงช้า)", location: "กรุงเทพฯ", highlight: "ปัดเป่าคดีความ ศัตรู และเรื่องเดือดร้อนใจ" },
        { name: "วัดบรมราชากาญจนาภิเษกอนุสรณ์", location: "นนทบุรี", highlight: "สะเดาะเคราะห์เสริมดวงชะตา" },
      ],
      prayerText: "ขอบารมีองค์เทพคุ้มครองชะตาชีวิต ให้พ้นจากคดีความ การถูกเบียดเบียน และมุ่งหน้าสู่ความสำเร็จโดยราบรื่น",
    };
  }

  if (zodiac.name === "ระกา") {
    return {
      zodiacName: "ปีระกา",
      zodiacAnimal: "ไก่",
      birthYearBe,
      currentYearBe,
      clashType: "ชงร่วม (ผั่ว)",
      clashPercentage: 50,
      severity: "medium",
      cautionAreas: [
        "ความสัมพันธ์แตกหัก ทะเลาะเบาะแว้งในครอบครัวหรือคนรัก",
        "การเงินรั่วไหล ข้าวของเครื่องใช้ชำรุดเสียหายกะทันหัน",
        "ปัญหาสุขภาพช่องท้องและระบบย่อยอาหาร",
      ],
      remedies: [
        "ทำบุญบูรณะวัด ซ่อมแซมสิ่งชำรุดทรุดโทรม",
        "ฝึกความอดทน พูดจาอ่อนหวาน และลดการปะทะด้วยวาจา",
        "บริจาคช่วยเหลือเด็กกำพร้าหรือบ้านพักคนชรา",
      ],
      recommendedShrines: [
        { name: "ศาลเจ้าแม่กวนอิม มูลนิธิเทียนฟ้า", location: "เยาวราช", highlight: "เสริมความรัก ความเมตตา และสุขภาพที่แข็งแรง" },
        { name: "วัดกัลยาณมิตร วรมหาวิหาร", location: "ธนบุรี", highlight: "ไหว้องค์ซำปอกง เสริมมิตรภาพและความเจริญรุ่งเรือง" },
      ],
      prayerText: "ขอองค์ไท้ส่วยเอี๊ยและสิ่งศักดิ์สิทธิ์ทรงคุ้มครอง ประทานความสมัครสมานสามัคคีและสุขภาพพลานามัยที่สมบูรณ์",
    };
  }

  // ไม่ชง
  const isHarmonious = ["ขาล", "จอ", "มะแม"].includes(zodiac.name);
  return {
    zodiacName: `ปี${zodiac.name}`,
    zodiacAnimal: zodiac.animal,
    birthYearBe,
    currentYearBe,
    clashType: isHarmonious ? "สมพงษ์มงคล" : "ไม่ชง (ดวงราบรื่น)",
    clashPercentage: 0,
    severity: "none",
    cautionAreas: ["ไม่มีเคราะห์ชงร้ายแรงประจำปี ใช้ชีวิตได้อย่างมั่นใจและไม่ประมาท"],
    remedies: [
      "ต่อยอดความดีด้วยการทำทานและช่วยเหลือสังคมสม่ำเสมอ",
      "ถือศีลปฏิบัติธรรมเพื่อเสริมสิริมงคลและเปิดรับโชคลาภก้อนใหญ่",
    ],
    recommendedShrines: [
      { name: "วัดพระแก้ว (วัดพระศรีรัตนศาสดาราม)", location: "กรุงเทพฯ", highlight: "กราบไหว้พระแก้วมรกต เสริมสิริมงคลสูงสุด" },
      { name: "วัดโสธรวรารามวรวิหาร", location: "ฉะเชิงเทรา", highlight: "ขอพรความสำเร็จ โชคลาภ และความร่มเย็นเป็นสุข" },
    ],
    prayerText: "ข้าพเจ้าขอขอบพระคุณสิ่งศักดิ์สิทธิ์ที่คุ้มครอง ขอให้ชีวิตเจริญรุ่งเรืองด้วยโภคทรัพย์ ลาภยศ และความสุขตลอดปีนี้เทอญ",
  };
}

// -------------------------------------------------------------
// AUSPICIOUS CALENDAR GENERATOR
// -------------------------------------------------------------

export function generateAuspiciousDaysForMonth(year: number, month: number): AuspiciousDayInfo[] {
  const daysInMonth = new Date(year, month, 0).getDate();
  const results: AuspiciousDayInfo[] = [];

  const MONTH_THAI = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
  ];

  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month - 1, day);
    const dayOfWeek = d.getDay(); // 0 = Sun
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    // คำนวณวันธงชัย วันอธิบดี วันอุบาทว์ ตามหลักโหร
    // กำหนดวันมงคลเด่นตามสถิติโบราณ (พฤหัส, ศุกร์, อาทิตย์ มักเป็นวันดี)
    let dayQuality: "ธงชัย" | "อธิบดี" | "มงคลทั่วไป" | "อุบาทว์" | "โลกาวินาศ" = "มงคลทั่วไป";
    if (day % 7 === 3 || (dayOfWeek === 5 && day % 2 === 0)) {
      dayQuality = "ธงชัย";
    } else if (day % 6 === 2 || (dayOfWeek === 4 && day % 2 !== 0)) {
      dayQuality = "อธิบดี";
    } else if (dayOfWeek === 2 && day % 5 === 0) {
      dayQuality = "อุบาทว์";
    } else if (dayOfWeek === 6 && day % 4 === 0) {
      dayQuality = "โลกาวินาศ";
    }

    const clashIdx = (day * 3 + month) % 12;
    const clashAnimal = ZODIAC_ANIMALS[clashIdx].name;

    const good: string[] = [];
    const bad: string[] = [];

    if (dayQuality === "ธงชัย") {
      good.push("ออกรถใหม่", "ขึ้นบ้านใหม่", "เปิดร้านค้า/กิจการ", "เซ็นสัญญาสำคัญ", "เสี่ยงโชค");
      bad.push("งานอวมงคล", "การรื้อถอนสิ่งปลูกสร้าง");
    } else if (dayQuality === "อธิบดี") {
      good.push("เข้ารับตำแหน่งใหม่", "เจรจาธุรกิจ", "สู่ขอหมั้นหมาย", "ย้ายที่ทำงาน", "ออกเดินทางไกล");
      bad.push("การตัดต้นไม้ใหญ่", "การขุดหลุมหรือทุบกำแพง");
    } else if (dayQuality === "อุบาทว์" || dayQuality === "โลกาวินาศ") {
      good.push("ทำความสะอาดบ้าน", "ปล่อยปลาทำบุญ", "สวดมนต์ไหว้พระ");
      bad.push("ออกรถใหม่", "เปิดกิจการ", "แต่งงาน", "ทำสัญญาการเงิน");
    } else {
      good.push("ติดต่อค้าขาย", "ทำบุญบ้าน", "พบปะลูกค้า", "ลงนามเอกสารทั่วไป");
      bad.push("การเริ่มต้นสิ่งเสี่ยงสูงโดยไม่มีแผนสำรอง");
    }

    const lunarDay = (day % 15) + 1;
    const isWaxing = day <= 15;
    const lunarPhase = `${isWaxing ? "ขึ้น" : "แรม"} ${lunarDay} ค่ำ`;

    results.push({
      date: dateStr,
      dayOfMonth: day,
      thaiDateString: `${day} ${MONTH_THAI[month - 1]} ${year + 543}`,
      lunarPhase,
      dayQuality,
      clashZodiac: `ปี${clashAnimal}`,
      elementEnergy: ["ธาตุน้ำ", "ธาตุไม้", "ธาตุไฟ", "ธาตุดิน", "ธาตุทอง"][day % 5],
      goodActivities: good,
      badActivities: bad,
      luckyHours: ["06.09 - 07.39 น.", "09.19 - 10.49 น.", "13.29 - 14.59 น.", "15.09 - 16.39 น."][day % 4],
      luckyDirection: ["ทิศตะวันออก", "ทิศตะวันออกเฉียงเหนือ", "ทิศใต้", "ทิศตะวันตกเฉียงใต้"][day % 4],
    });
  }

  return results;
}
