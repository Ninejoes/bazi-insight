// -------------------------------------------------------------
// NUMEROLOGY DATA & CALCULATION ENGINES
// ศาสตร์เลขศาสตร์เบอร์โทรศัพท์ และเลขศาสตร์ชื่อ-นามสกุล (ทักษาปกรณ์)
// -------------------------------------------------------------

export interface NumberPairAnalysis {
  pair: string;
  category: "wealth" | "career" | "love" | "wisdom" | "caution" | "general";
  score: number; // -10 to +10
  meaning: string;
  keywords: string[];
  isAuspicious: boolean;
}

export interface PhoneAnalysisResult {
  phoneNumber: string;
  formattedNumber: string;
  sum: number;
  sumTitle: string;
  sumDescription: string;
  sumGrade: "A+" | "A" | "B+" | "B" | "C" | "D";
  scores: {
    career: number; // 0 - 100
    wealth: number;
    love: number;
    health: number;
    overall: number;
  };
  pairs: NumberPairAnalysis[];
  suitableCareers: string[];
  advice: string;
}

// ศาสตร์ผลรวมตัวเลข (มงคล/ปานกลาง/ควรระวัง)
const SUM_MEANINGS: Record<
  number,
  { title: string; description: string; grade: "A+" | "A" | "B+" | "B" | "C" | "D" }
> = {
  9: { title: "ดาวเกตุคุ้มครอง เจริญก้าวหน้า", description: "มีสิ่งศักดิ์สิทธิ์คุ้มครอง มักมีลางสังหรณ์แม่นยำ ทำสิ่งใดมักแคล้วคลาดปลอดภัย", grade: "A" },
  14: { title: "มหาเจรจา ปัญญาปราดเปรื่อง", description: "เด่นด้านการติดต่อประสานงาน มีปฏิภาณไหวพริบยอดเยี่ยม ผู้ใหญ่ให้ความเมตตา", grade: "A+" },
  15: { title: "เสน่ห์เมตตา มหาลาภผล", description: "รวมพลังแห่งดวงดาวมงคล มักเป็นที่รักของคนรอบข้าง มีโชคลาภเข้ามาไม่ขาดสาย", grade: "A+" },
  19: { title: "มหาบุรุษ บารมีสูงส่ง", description: "มีความเป็นผู้นำสูง สติปัญญาเฉียบแหลม มักได้รับการยกย่องและเลื่อนตำแหน่งอย่างรวดเร็ว", grade: "A" },
  23: { title: "เสน่ห์แรง บุคลิกโดดเด่น", description: "มีเสน่ห์ทางเพศสูง ดึงดูดความสนใจ แต่มักมีความอ่อนไหวทางอารมณ์ ต้องระวังเรื่องรักซ้อน", grade: "B+" },
  24: { title: "มหาเสน่ห์ เมตตามหานิยม (สุดยอดเลข)", description: "ยอดเลขแห่งความสำเร็จ นุ่มนวล อ่อนโยน มีคนคอยช่วยเหลืออุปถัมภ์ เงินทองคล่องมือ", grade: "A+" },
  28: { title: "นักคิดการใหญ่ หมุนเงินคล่อง", description: "ใจกว้าง กล้าลงทุน มักจับธุรกิจใหญ่หรือเงินก้อนโต แต่ต้องรอบคอบเรื่องการบริหารจัดการ", grade: "B" },
  32: { title: "เสน่ห์แห่งเพศรส มนตราดึงดูด", description: "มีเสน่ห์แรง มีคนมาหลงรัก มักได้ลาภจากเพศตรงข้าม แต่ต้องระวังอารมณ์ชั่ววูบ", grade: "B" },
  36: { title: "คู่มหาโชค ร่ำรวยความรักและการเงิน", description: "ดาวอังคารและดาวศุกร์รวมพลัง เด่นทั้งความรัก เงินทอง และโชคลาภ ประสบความสำเร็จสูง", grade: "A+" },
  40: { title: "พลังแห่งการเดินทางและเทคโนโลยี", description: "ชอบสิ่งใหม่ๆ เดินทางบ่อย งานต่างประเทศหรืองานออนไลน์ส่งผลสำเร็จดี", grade: "A" },
  41: { title: "ปัญญาเป็นทรัพย์ ปากพารวย", description: "พูดอะไรคนเชื่อถือ ติดต่อเจรจาธุรกิจสำเร็จลุล่วง มีไหวพริบในการแก้ปัญหาเฉพาะหน้า", grade: "A+" },
  42: { title: "เทพีแห่งความสุขและมิตรภาพ", description: "ชีวิตราบรื่น มีเพื่อนฝูงคอยหนุนหลัง มีความสุขสงบ อุดมด้วยโชคลาภและรอยยิ้ม", grade: "A+" },
  44: { title: "มหาการสื่อสาร วาจาเป็นเลิศ", description: "เจรจาค้าขายดีเลิศ เหมาะกับงานสื่อสาร พิธีกร เซลล์ หรือค้าขายออนไลน์", grade: "A" },
  45: { title: "มหาโชคเทพประทาน (เลขยอดนิยม)", description: "พลังแห่งดาวพุธและดาวพฤหัสบดี สติปัญญาเลิศล้ำ ความก้าวหน้าสูงสุด เงินทองไหลมาเทมา", grade: "A+" },
  46: { title: "ความสุขสมบูรณ์พูนสุข", description: "มีเสน่ห์ รสนิยมดี ได้รับการดูแลอย่างดี การเงินคล่องตัว มักมีของฝากและโชคลาภ", grade: "A+" },
  50: { title: "ปัญญาลึกซึ้ง คุณธรรมนำชีวิต", description: "มีสัมผัสพิเศษ รักความยุติธรรม เดินทางไกลปลอดภัย ผู้ใหญ่สนับสนุน", grade: "A" },
  51: { title: "ความสำเร็จรอบด้าน มีมิตรดี", description: "เป็นคนใจกว้าง มีผู้ใหญ่อุปถัมภ์ค้ำชู การงานมั่นคง มีเกียรติยศชื่อเสียง", grade: "A+" },
  54: { title: "มหาเศรษฐี ดวงปัญญาและทรัพย์", description: "มีความรอบคอบ มีแบบแผนในการดำเนินชีวิต ร่ำรวยมั่นคงด้วยความสามารถของตนเอง", grade: "A+" },
  55: { title: "พลังแห่งครูบาอาจารย์ เจริญรุ่งเรือง", description: "จิตใจดี มีคุณธรรม มีโชคลาภอย่างสม่ำเสมอ ชีวิตพบเจอแต่ความสงบสุข", grade: "A+" },
  56: { title: "ทรัพย์มั่งคั่ง สติปัญญานำทาง (เลขมังกร)", description: "เลขคู่ทรัพย์คู่ปัญญา โภคทรัพย์สมบูรณ์ ร่ำรวยอย่างมั่นคง เหมาะกับผู้บริหารและเจ้าของกิจการ", grade: "A+" },
  59: { title: "บารมีคุ้มครอง ก้าวหน้าโกอินเตอร์", description: "มีสิ่งศักดิ์สิทธิ์หนุนดวง มีวิสัยทัศน์กว้างไกล งานระดับสากลรุ่งโรจน์", grade: "A+" },
  63: { title: "รักสดใส เงินทองไหลรื่น", description: "เสน่ห์แพรวพราว หาเงินเก่ง มีโอกาสดีๆ วิ่งเข้าหาเสมอ", grade: "A+" },
  64: { title: "วาสนาพารวย โชคลาภสองต่อ", description: "คิดเงินได้เงิน คิดทองได้ทอง การค้าขายกำไรดีเด่น มิตรภาพนำพาความเจริญ", grade: "A+" },
  65: { title: "คู่ทรัพย์คู่วาสนา สำเร็จสมหวัง", description: "ครบครันทั้งเงิน ความรัก และเกียรติยศ จัดเป็นผลรวมยอดนิยมอันดับต้นๆ", grade: "A+" },
  69: { title: "มีรสนิยม ค้าขายกำไรดี", description: "จับสิ่งใดกลายเป็นเงินทอง มีสไตล์เฉพาะตัว ลูกค้าติดใจ", grade: "A" },
};

// คู่ตัวเลขสำคัญ (00 - 99)
const PAIR_MEANINGS: Record<string, NumberPairAnalysis> = {
  "14": { pair: "14", category: "career", score: 9, meaning: "ปัญญาเฉียบคม เจรจาฉะฉาน ผู้ใหญ่เมตตา", keywords: ["งานราชการ", "เจรจา", "เอกสาร"], isAuspicious: true },
  "41": { pair: "41", category: "career", score: 9, meaning: "วาจามหาเสน่ห์ ไหวพริบดี ปิดการขายง่าย", keywords: ["การตลาด", "ค้าขาย", "นายหน้า"], isAuspicious: true },
  "15": { pair: "15", category: "wisdom", score: 9, meaning: "มีเหตุผล สติปัญญาดี ผู้ใหญ่ให้ความไว้วางใจ", keywords: ["ที่ปรึกษา", "บริหาร", "วิชาการ"], isAuspicious: true },
  "51": { pair: "51", category: "wisdom", score: 9, meaning: "คิดวิเคราะห์เก่ง มองการณ์ไกล การงานมั่นคง", keywords: ["ผู้บริหาร", "อาจารย์", "วางแผน"], isAuspicious: true },
  "19": { pair: "19", category: "career", score: 8, meaning: "ผู้นำโดดเด่น มีเกียรติยศชื่อเสียง เป็นที่ยอมรับ", keywords: ["ผู้นำ", "ชื่อเสียง", "งานเด่น"], isAuspicious: true },
  "91": { pair: "91", category: "career", score: 8, meaning: "วิสัยทัศน์กว้างไกล ทันสมัย มีความมั่นใจสูง", keywords: ["เทคโนโลยี", "เจ้าของธุรกิจ"], isAuspicious: true },
  "23": { pair: "23", category: "love", score: 6, meaning: "เสน่ห์แรง มีแรงดึงดูดสูง คนเข้าหาเยอะ", keywords: ["เสน่ห์", "บันเทิง", "สังคม"], isAuspicious: true },
  "32": { pair: "32", category: "love", score: 6, meaning: "มีเสน่ห์ทางเพศ คนเอ็นดูช่วยเหลือ ระวังใจร้อน", keywords: ["ค้าขาย", "บริการ", "ความงาม"], isAuspicious: true },
  "24": { pair: "24", category: "wealth", score: 10, meaning: "ยอดคู่เลขเมตตา เงินทองคล่องมือ มิตรสหายช่วยเหลือ", keywords: ["โชคลาภ", "ค้าขาย", "เสน่ห์"], isAuspicious: true },
  "42": { pair: "42", category: "wealth", score: 10, meaning: "อ่อนหวาน มีเสน่ห์ วาจาเรียกทรัพย์ ค้าขายดีเยี่ยม", keywords: ["พูดพารวย", "การเงิน", "ความรัก"], isAuspicious: true },
  "28": { pair: "28", category: "wealth", score: 7, meaning: "หมุนเงินก้อนใหญ่ ใจกล้าได้กล้าเสีย เหมาะกับธุรกิจใหญ่", keywords: ["หมุนเงิน", "ลงทุน", "อสังหาฯ"], isAuspicious: true },
  "82": { pair: "82", category: "wealth", score: 7, meaning: "ใจใหญ่ กล้าลงทุน มักจับเงินก้อนโต มีอำนาจเงิน", keywords: ["การเงิน", "ธุรกิจสีเทา", "ประมูล"], isAuspicious: true },
  "36": { pair: "36", category: "wealth", score: 10, meaning: "คู่ทรัพย์คู่โชค รักดีเงินคล่อง มีโชคลาภเข้ามาตลอด", keywords: ["โชคลาภ", "ความรัก", "เงินทอง"], isAuspicious: true },
  "63": { pair: "63", category: "wealth", score: 10, meaning: "เสน่ห์ดึงดูดทรัพย์ หาเงินง่าย มีโอกาสดีๆ เสมอ", keywords: ["ค้าขายดี", "เสน่ห์แรง", "โชคดี"], isAuspicious: true },
  "45": { pair: "45", category: "wisdom", score: 10, meaning: "ปัญญาประเสริฐ ร่ำรวยมั่นคง มีความสุขสงบในชีวิต", keywords: ["มหาเศรษฐี", "ความสงบ", "ก้าวหน้า"], isAuspicious: true },
  "54": { pair: "54", category: "wisdom", score: 10, meaning: "ดวงความรู้หนุนนำทรัพย์ วางแผนการเงินรอบคอบ", keywords: ["มั่นคง", "วิชาชีพ", "ปลอดภัย"], isAuspicious: true },
  "46": { pair: "46", category: "wealth", score: 9, meaning: "วาจาเป็นเลิศ สุนทรียภาพสูง เงินทองไหลรื่น", keywords: ["ศิลปะ", "การพูด", "อาหาร"], isAuspicious: true },
  "64": { pair: "64", category: "wealth", score: 9, meaning: "มีเสน่ห์ ค้าขายเก่ง หาเงินได้หลายทาง", keywords: ["ออนไลน์", "ครีเอทีฟ", "ยอดขาย"], isAuspicious: true },
  "56": { pair: "56", category: "wealth", score: 10, meaning: "คู่ทรัพย์มหาศาล ปัญญานำพาความมั่งคั่ง สมบูรณ์พร้อม", keywords: ["เศรษฐี", "มั่งคั่ง", "บารมี"], isAuspicious: true },
  "65": { pair: "65", category: "wealth", score: 10, meaning: "สุขสบาย ไร้อุปสรรค มีคนหนุนหลังเรื่องเงิน", keywords: ["สบาย", "โชคลาภ", "สำเร็จ"], isAuspicious: true },
  "59": { pair: "59", category: "wisdom", score: 9, meaning: "สิ่งศักดิ์สิทธิ์คุ้มครอง มีบารมี งานโกอินเตอร์", keywords: ["สายมู", "ต่างประเทศ", "ผู้ใหญ่หนุน"], isAuspicious: true },
  "95": { pair: "95", category: "wisdom", score: 9, meaning: "ดวงแข็ง แคล้วคลาดปลอดภัย มีปัญญาลึกซึ้ง", keywords: ["สุขภาพดี", "ปลอดภัย", "คุณธรรม"], isAuspicious: true },
  "78": { pair: "78", category: "wealth", score: 8, meaning: "คู่มิตรใหญ่ พรรคพวกเยอะ บริวารหนุนนำ ธุรกิจกว้างขวาง", keywords: ["บารมี", "พรรคพวก", "รับเหมา"], isAuspicious: true },
  "87": { pair: "87", category: "wealth", score: 8, meaning: "ดวงเจ้าพ่อ นักเลงใจถึง ลูกน้องเกรงใจ", keywords: ["บารมี", "เจรจาใหญ่", "ปกครอง"], isAuspicious: true },
  "89": { pair: "89", category: "career", score: 8, meaning: "บารมีสูง มีอำนาจเด็ดขาด เหมาะกับงานปกครอง", keywords: ["อำนาจ", "คุมคน", "สากล"], isAuspicious: true },
  "98": { pair: "98", category: "career", score: 8, meaning: "แคล้วคลาด มีสิ่งศักดิ์สิทธิ์คุ้มครอง ใจใหญ่", keywords: ["งานเสี่ยง", "ปลอดภัย", "โชคลาภ"], isAuspicious: true },

  // คู่ระวัง
  "00": { pair: "00", category: "caution", score: -8, meaning: "เก็บตัว โดดเดี่ยว โลกส่วนตัวสูง มีเรื่องลับซ่อนเร้น", keywords: ["เงียบ", "โรคลึกลับ"], isAuspicious: false },
  "01": { pair: "01", category: "caution", score: -7, meaning: "ถูกหักหลัง ถูกเลื่อยขาเก้าอี้ มีคนอิจฉา", keywords: ["ถูกเอาเปรียบ", "ใจร้อน"], isAuspicious: false },
  "10": { pair: "10", category: "caution", score: -7, meaning: "อารมณ์ขึ้นลงง่าย ปวดหัวบ่อย ต้องต่อสู้เหน็ดเหนื่อย", keywords: ["ต่อสู้", "เหนื่อย"], isAuspicious: false },
  "02": { pair: "02", category: "caution", score: -6, meaning: "เสน่ห์มีพิษ ระวังเรื่องรักซ้อน หรือเงินรั่วไหล", keywords: ["รักซ้อน", "ใจอ่อน"], isAuspicious: false },
  "03": { pair: "03", category: "caution", score: -8, meaning: "ใจร้อน อุบัติเหตุ การผ่าตัด มีปากเสียงบ่อย", keywords: ["อุบัติเหตุ", "ใจร้อน"], isAuspicious: false },
  "07": { pair: "07", category: "caution", score: -9, meaning: "ความเครียดสูง แบกรับภาระหนักหน่วง เหนื่อยกายใจ", keywords: ["เครียด", "หนี้สิน"], isAuspicious: false },
  "08": { pair: "08", category: "caution", score: -7, meaning: "ลุ่มหลงง่าย สุรุ่ยสุร่าย ระวังถูกหลอกลงทุน", keywords: ["ความเสี่ยง", "การพนัน"], isAuspicious: false },
  "13": { pair: "13", category: "caution", score: -9, meaning: "เลขแห่งอุบัติเหตุและการผ่าตัด การตัดสินใจผิดพลาด", keywords: ["ระวังตัว", "อารมณ์ร้อน"], isAuspicious: false },
  "31": { pair: "31", category: "caution", score: -9, meaning: "อารมณ์รุนแรง ขัดแย้งกับคนรอบข้างง่าย", keywords: ["ขัดแย้ง", "อุบัติเหตุ"], isAuspicious: false },
  "67": { pair: "67", category: "caution", score: -8, meaning: "ความรักผิดหวัง การเงินฝืดเคือง รายจ่ายล้นมือ", keywords: ["รักร้าว", "เงินสะดุด"], isAuspicious: false },
  "76": { pair: "76", category: "caution", score: -8, meaning: "เงินทองรั่วไหล มีเรื่องให้เสียทรัพย์ไม่คาดคิด", keywords: ["เสียเงิน", "เหนื่อยใจ"], isAuspicious: false },
};

export function analyzePhoneNumber(rawPhone: string): PhoneAnalysisResult {
  const digits = rawPhone.replace(/\D/g, "");
  const cleanPhone = digits.slice(-10); // นำ 10 หลักสุดท้าย

  // คำนวณผลรวม
  const sum = cleanPhone.split("").reduce((acc, curr) => acc + parseInt(curr, 10), 0);

  // ตัดคู่ตัวเลข 7 คู่ (ไม่นับ 08x ตัวหน้า 2-3 ตัวแรก แต่วิเคราะห์คู่ 7 คู่หลัง)
  const pairs: NumberPairAnalysis[] = [];
  const startIdx = Math.max(0, cleanPhone.length - 8); // วิเคราะห์ 8 ตัวท้ายเป็น 7 คู่
  for (let i = startIdx; i < cleanPhone.length - 1; i++) {
    const p = cleanPhone.slice(i, i + 2);
    if (PAIR_MEANINGS[p]) {
      pairs.push(PAIR_MEANINGS[p]);
    } else {
      // คู่ทั่วไป
      pairs.push({
        pair: p,
        category: "general",
        score: 3,
        meaning: `คู่พลังงานผสมผสาน เหมาะกับการดำเนินชีวิตประจำวันอย่างสมดุล`,
        keywords: ["สมดุล", "ทั่วไป"],
        isAuspicious: true,
      });
    }
  }

  // คำนวณคะแนนแต่ละด้าน
  let careerScore = 65;
  let wealthScore = 65;
  let loveScore = 65;
  let healthScore = 70;

  for (const p of pairs) {
    if (p.category === "career" || p.category === "wisdom") careerScore += p.score * 3.5;
    if (p.category === "wealth") wealthScore += p.score * 4;
    if (p.category === "love") loveScore += p.score * 3.8;
    if (p.category === "caution") {
      careerScore -= 8;
      wealthScore -= 8;
      loveScore -= 8;
      healthScore -= 12;
    }
  }

  const clamp = (val: number) => Math.min(99, Math.max(30, Math.round(val)));
  careerScore = clamp(careerScore);
  wealthScore = clamp(wealthScore);
  loveScore = clamp(loveScore);
  healthScore = clamp(healthScore);

  const overall = Math.round((careerScore + wealthScore + loveScore + healthScore) / 4);

  // สรุปข้อมูลผลรวม
  const sumInfo = SUM_MEANINGS[sum] || {
    title: `ผลรวม ${sum} พลังชีวิตปานกลาง`,
    description: `ผลรวมเลข ${sum} มีพลังงานส่งเสริมการทำงานและการดำเนินชีวิตตามอัตภาพ แนะนำเสริมด้วยความเพียรพยายามและระมัดระวังรอบคอบ`,
    grade: overall >= 85 ? "A" : overall >= 75 ? "B+" : overall >= 65 ? "B" : "C",
  };

  // อาชีพที่เหมาะสม
  const suitableCareers: string[] = [];
  if (careerScore >= 80) suitableCareers.push("ข้าราชการ", "ผู้บริหาร", "นักวางแผนกลยุทธ์");
  if (wealthScore >= 80) suitableCareers.push("เจ้าของธุรกิจ", "นักลงทุน", "ค้าขายออนไลน์", "อสังหาริมทรัพย์");
  if (loveScore >= 80) suitableCareers.push("งานบริการ", "ประชาสัมพันธ์", "ศิลปิน", "อินฟลูเอนเซอร์");
  if (suitableCareers.length === 0) suitableCareers.push("พนักงานองค์กร", "ธุรกิจส่วนตัว", "ฟรีแลนซ์");

  const formatted = cleanPhone.length === 10
    ? `${cleanPhone.slice(0, 3)}-${cleanPhone.slice(3, 6)}-${cleanPhone.slice(6)}`
    : cleanPhone;

  return {
    phoneNumber: cleanPhone,
    formattedNumber: formatted,
    sum,
    sumTitle: sumInfo.title,
    sumDescription: sumInfo.description,
    sumGrade: sumInfo.grade,
    scores: {
      career: careerScore,
      wealth: wealthScore,
      love: loveScore,
      health: healthScore,
      overall,
    },
    pairs,
    suitableCareers,
    advice:
      overall >= 80
        ? "เบอร์นี้มีกลุ่มเลขมงคลเกื้อหนุนที่ดีเด่น ส่งเสริมให้ชีวิตเจริญก้าวหน้ารวดเร็ว รักษาคุณธรรมและความดีจะยิ่งทวีคูณโชคลาภ"
        : overall >= 65
        ? "เบอร์นี้มีพลังงานสมดุล ใช้ทำงานทั่วไปได้ดี หากมีคู่เลขที่ต้องระวัง แนะนำให้ใช้สติในการตัดสินใจและหมั่นทำบุญเสริมดวง"
        : "เบอร์นี้มีตัวเลขบางคู่ที่อาจส่งผลให้เหน็ดเหนื่อยหรือมีเรื่องจุกจิกกวนใจ หากมีโอกาสสามารถพิจารณาเปลี่ยนเบอร์เพื่อเปิดรับพลังงานมงคลชุดใหม่",
  };
}

// -------------------------------------------------------------
// THAI NAME NUMEROLOGY (เลขศาสตร์ชื่อ และ ทักษาปกรณ์)
// -------------------------------------------------------------

// ตารางค่าตัวเลขอักษรไทย 1 - 9 ตามหลักเลขศาสตร์สากล
const THAI_CHAR_VALUES: Record<string, number> = {
  ก: 1, ด: 1, ถ: 1, ท: 1, ภ: 1, ฤ: 1, ฤๅ: 1, ฦ: 1, ฦๅ: 1, ะ: 1, "ั": 1, า: 1, อำ: 1, "ิ": 1, "่": 1,
  ข: 2, ช: 2, ง: 2, บ: 2, ป: 2, "เ": 2, "แ": 2, "้": 2, "ู": 2, "โ": 2,
  ฆ: 3, ฑ: 3, ฒ: 3, ต: 3, "ี": 3, "๊": 3,
  ค: 4, ธ: 4, ญ: 4, ร: 4, ษ: 4, "ึ": 4, "็": 4,
  ฉ: 5, ฌ: 5, ณ: 5, น: 5, ม: 5, ห: 5, ฬ: 5, ฮ: 5, "ื": 5, "๋": 5,
  จ: 6, ล: 6, ว: 6, อ: 6, "ใ": 6,
  ศ: 7, ส: 7, "์": 7, "ุ": 7,
  ย: 8, ผ: 8, ฝ: 8, พ: 8, ฟ: 8,
  ฏ: 9, ฐ: 9,
};

// ทักษาปกรณ์ตามวันเกิด (0 = อาทิตย์, ... 6 = เสาร์, 7 = พุธกลางคืน)
export interface TaksaCategory {
  title: string;
  type: "บริวาร" | "อายุ" | "เดช" | "ศรี" | "มูละ" | "อุตสาหะ" | "มนตรี" | "กาลกิณี";
  chars: string[];
  description: string;
  isKalakini: boolean;
}

export interface DayTaksaRule {
  dayName: string;
  categories: Record<string, TaksaCategory>;
  kalakiniLetters: string[];
}

export const DAY_TAKSA_RULES: Record<number, DayTaksaRule> = {
  0: {
    dayName: "วันอาทิตย์",
    kalakiniLetters: ["ศ", "ษ", "ส", "ห", "ฬ", "ฮ"],
    categories: {
      บริวาร: { title: "บริวาร", type: "บริวาร", chars: ["อ", "ะ", "า", "ิ", "ี", "ึ", "ื", "ุ", "ู", "เ", "แ", "โ", "ใ", "ไ"], description: "ลูกน้อง ผู้ใต้บังคับบัญชา คนในบ้าน", isKalakini: false },
      เดช: { title: "เดช", type: "เดช", chars: ["จ", "ฉ", "ช", "ซ", "ฌ", "ญ"], description: "อำนาจบารมี เกียรติยศชื่อเสียง", isKalakini: false },
      ศรี: { title: "ศรี", type: "ศรี", chars: ["ฎ", "ฏ", "ฐ", "ฑ", "ฒ", "ณ"], description: "สิริมงคล โชคลาภ เสน่ห์เมตตา", isKalakini: false },
      กาลกิณี: { title: "กาลกิณี (ห้ามใช้)", type: "กาลกิณี", chars: ["ศ", "ษ", "ส", "ห", "ฬ", "ฮ"], description: "อุปสรรค ความขัดแย้ง ความสูญเสีย", isKalakini: true },
    },
  },
  1: {
    dayName: "วันจันทร์",
    kalakiniLetters: ["อ", "ะ", "า", "ิ", "ี", "ึ", "ื", "ุ", "ู", "เ", "แ", "โ", "ใ", "ไ"],
    categories: {
      บริวาร: { title: "บริวาร", type: "บริวาร", chars: ["ก", "ข", "ค", "ฆ", "ง"], description: "คนรอบข้างช่วยเหลือเกื้อกูล", isKalakini: false },
      เดช: { title: "เดช", type: "เดช", chars: ["ฎ", "ฏ", "ฐ", "ฑ", "ฒ", "ณ"], description: "ความเด็ดขาด อำนาจการตัดสินใจ", isKalakini: false },
      ศรี: { title: "ศรี", type: "ศรี", chars: ["ด", "ต", "ถ", "ท", "ธ", "น"], description: "เงินทอง ทรัพย์สมบัติ ความมั่งคั่ง", isKalakini: false },
      กาลกิณี: { title: "กาลกิณี (ห้ามใช้)", type: "กาลกิณี", chars: ["อ", "สระทั้งหมด"], description: "ขัดลาภ มีปัญหาเรื่องสุขภาพ", isKalakini: true },
    },
  },
  2: {
    dayName: "วันอังคาร",
    kalakiniLetters: ["ก", "ข", "ค", "ฆ", "ง"],
    categories: {
      บริวาร: { title: "บริวาร", type: "บริวาร", chars: ["จ", "ฉ", "ช", "ซ", "ฌ", "ญ"], description: "มิตรสหายและผู้ร่วมงาน", isKalakini: false },
      เดช: { title: "เดช", type: "เดช", chars: ["ด", "ต", "ถ", "ท", "ธ", "น"], description: "พลังอำนาจ ชัยชนะในการแข่งขัน", isKalakini: false },
      ศรี: { title: "ศรี", type: "ศรี", chars: ["บ", "ป", "ผ", "ฝ", "พ", "ฟ", "ภ", "ม"], description: "เสน่ห์ดึงดูดใจ โชคลาภ", isKalakini: false },
      กาลกิณี: { title: "กาลกิณี (ห้ามใช้)", type: "กาลกิณี", chars: ["ก", "ข", "ค", "ฆ", "ง"], description: "ใจร้อน เกิดอุบัติเหตุง่าย", isKalakini: true },
    },
  },
  3: {
    dayName: "วันพุธ (กลางวัน)",
    kalakiniLetters: ["จ", "ฉ", "ช", "ซ", "ฌ", "ญ"],
    categories: {
      บริวาร: { title: "บริวาร", type: "บริวาร", chars: ["ฎ", "ฏ", "ฐ", "ฑ", "ฒ", "ณ"], description: "มิตรภาพ ความจริงใจ", isKalakini: false },
      เดช: { title: "เดช", type: "เดช", chars: ["บ", "ป", "ผ", "ฝ", "พ", "ฟ", "ภ", "ม"], description: "ความน่าเชื่อถือ วาจาศักดิ์สิทธิ์", isKalakini: false },
      ศรี: { title: "ศรี", type: "ศรี", chars: ["ย", "ร", "ล", "ว"], description: "เงินทองไหลมาเทมา ค้าขายรุ่งเรือง", isKalakini: false },
      กาลกิณี: { title: "กาลกิณี (ห้ามใช้)", type: "กาลกิณี", chars: ["จ", "ฉ", "ช", "ซ", "ฌ", "ญ"], description: "คำพูดสร้างศัตรู เอกสารติดขัด", isKalakini: true },
    },
  },
  4: {
    dayName: "วันพฤหัสบดี",
    kalakiniLetters: ["ด", "ต", "ถ", "ท", "ธ", "น"],
    categories: {
      บริวาร: { title: "บริวาร", type: "บริวาร", chars: ["บ", "ป", "ผ", "ฝ", "พ", "ฟ", "ภ", "ม"], description: "ลูกศิษย์ ผู้ให้ความเคารพ", isKalakini: false },
      เดช: { title: "เดช", type: "เดช", chars: ["ศ", "ษ", "ส", "ห", "ฬ", "ฮ"], description: "ภูมิปัญญา บารมีทางวิชาการ", isKalakini: false },
      ศรี: { title: "ศรี", type: "ศรี", chars: ["อ", "สระทั้งหมด"], description: "เกียรติยศชื่อเสียง ความสุขสงบ", isKalakini: false },
      กาลกิณี: { title: "กาลกิณี (ห้ามใช้)", type: "กาลกิณี", chars: ["ด", "ต", "ถ", "ท", "ธ", "น"], description: "ถูกใส่ร้าย การงานติดขัด", isKalakini: true },
    },
  },
  5: {
    dayName: "วันศุกร์",
    kalakiniLetters: ["ย", "ร", "ล", "ว"],
    categories: {
      บริวาร: { title: "บริวาร", type: "บริวาร", chars: ["ศ", "ษ", "ส", "ห", "ฬ", "ฮ"], description: "มิตรสหายรักใคร่กลมเกลียว", isKalakini: false },
      เดช: { title: "เดช", type: "เดช", chars: ["ก", "ข", "ค", "ฆ", "ง"], description: "เสน่ห์เป็นอาวุธ ชนะใจคน", isKalakini: false },
      ศรี: { title: "ศรี", type: "ศรี", chars: ["จ", "ฉ", "ช", "ซ", "ฌ", "ญ"], description: "ความร่ำรวย รสนิยมดีเลิศ", isKalakini: false },
      กาลกิณี: { title: "กาลกิณี (ห้ามใช้)", type: "กาลกิณี", chars: ["ย", "ร", "ล", "ว"], description: "ความรักผิดหวัง เงินทองรั่วไหล", isKalakini: true },
    },
  },
  6: {
    dayName: "วันเสาร์",
    kalakiniLetters: ["บ", "ป", "ผ", "ฝ", "พ", "ฟ", "ภ", "ม"],
    categories: {
      บริวาร: { title: "บริวาร", type: "บริวาร", chars: ["ด", "ต", "ถ", "ท", "ธ", "น"], description: "ความอดทน มิตรร่วมทุกข์ร่วมสุข", isKalakini: false },
      เดช: { title: "เดช", type: "เดช", chars: ["ย", "ร", "ล", "ว"], description: "ความเด็ดขาด อำนาจปกครอง", isKalakini: false },
      ศรี: { title: "ศรี", type: "ศรี", chars: ["ศ", "ษ", "ส", "ห", "ฬ", "ฮ"], description: "ความมั่นคง ปลอดภัย มีทรัพย์ถาวร", isKalakini: false },
      กาลกิณี: { title: "กาลกิณี (ห้ามใช้)", type: "กาลกิณี", chars: ["บ", "ป", "ผ", "ฝ", "พ", "ฟ", "ภ", "ม"], description: "เหน็ดเหนื่อยแสนสาหัส มีศัตรูในที่มืด", isKalakini: true },
    },
  },
};

export interface NameAnalysisResult {
  firstName: string;
  lastName: string;
  fullName: string;
  dayIndex: number;
  dayName: string;
  firstNameScore: number;
  lastNameScore: number;
  totalScore: number;
  firstNameMeaning: string;
  totalMeaning: string;
  kalakiniFound: string[];
  hasKalakini: boolean;
  taksaSummary: string;
  grade: "A+" | "A" | "B+" | "B" | "C";
}

export function calculateTextSum(text: string): number {
  let sum = 0;
  for (const char of text) {
    if (THAI_CHAR_VALUES[char]) {
      sum += THAI_CHAR_VALUES[char];
    }
  }
  return sum;
}

export function analyzeName(firstName: string, lastName: string, dayIndex: number): NameAnalysisResult {
  const fName = firstName.trim();
  const lName = lastName.trim();
  const full = `${fName} ${lName}`.trim();

  const fScore = calculateTextSum(fName);
  const lScore = calculateTextSum(lName);
  const total = fScore + lScore;

  const dayRule = DAY_TAKSA_RULES[dayIndex] || DAY_TAKSA_RULES[0];
  const kalakiniList = dayRule.kalakiniLetters;

  // ตรวจจับอักษรกาลกิณีในชื่อ
  const kalakiniFound: string[] = [];
  for (const char of fName) {
    if (kalakiniList.includes(char) && !kalakiniFound.includes(char)) {
      kalakiniFound.push(char);
    }
  }

  const fMeaning = SUM_MEANINGS[fScore]?.description || `พลังเลข ${fScore} ส่งเสริมการดำเนินชีวิตด้วยความมานะบากบั่น`;
  const tMeaning = SUM_MEANINGS[total]?.description || `ผลรวมชีวิต ${total} บ่งบอกถึงจังหวะชีวิตที่ต้องการความรอบคอบและความพากเพียรเพื่อความสำเร็จ`;

  const grade: "A+" | "A" | "B+" | "B" | "C" =
    kalakiniFound.length > 0
      ? "C"
      : (SUM_MEANINGS[total]?.grade as "A+" | "A" | "B+" | "B") || "B";

  return {
    firstName: fName,
    lastName: lName,
    fullName: full,
    dayIndex,
    dayName: dayRule.dayName,
    firstNameScore: fScore,
    lastNameScore: lScore,
    totalScore: total,
    firstNameMeaning: fMeaning,
    totalMeaning: tMeaning,
    kalakiniFound,
    hasKalakini: kalakiniFound.length > 0,
    taksaSummary: kalakiniFound.length > 0
      ? `พบอักษรกาลกิณี (${kalakiniFound.join(", ")}) ในชื่อสำหรับคนเกิด${dayRule.dayName}`
      : `ไม่พบอักษรกาลกิณีในชื่อ เป็นมงคลตามหลักทักษาปกรณ์ของคนเกิด${dayRule.dayName}`,
    grade,
  };
}
