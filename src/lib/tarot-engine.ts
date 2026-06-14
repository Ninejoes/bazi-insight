import { tarotCards, type TarotCard, type TarotCategory } from "./tarot-cards";

export type DrawnTarotCard = {
  card: TarotCard;
  reversed: boolean;
};

const suitProfiles = {
  Wands: {
    topic: "งาน/แรงผลัก",
    energy: "แรงผลัก การเริ่มต้น ความกล้า และการลงมือ",
    action: "เริ่มจากสิ่งที่ทำได้จริงก่อน แล้วค่อยขยายผล",
    caution: "ระวังเร่งจนพลังตกหรือรับภาระมากเกินไป",
  },
  Cups: {
    topic: "ความรัก/ความรู้สึก",
    energy: "อารมณ์ ความสัมพันธ์ การเยียวยา และความเข้าใจ",
    action: "ฟังความรู้สึกให้ครบก่อนสรุป และคุยด้วยน้ำเสียงที่เปิดพื้นที่",
    caution: "ระวังตัดสินจากอารมณ์ชั่วคราวหรือคาดหวังโดยไม่พูดออกมา",
  },
  Swords: {
    topic: "ความคิด/การตัดสินใจ",
    energy: "ความคิด การสื่อสาร ความจริง และการตัดสินใจ",
    action: "ตรวจข้อมูล หลักฐาน และถ้อยคำก่อนตอบตกลง",
    caution: "ระวังคิดเร็ว พูดแรง หรือมองเรื่องด้านเดียว",
  },
  Pentacles: {
    topic: "เงิน/ความมั่นคง",
    energy: "เงิน งานจริง สุขภาพกาย ทรัพย์สิน และความมั่นคง",
    action: "ใช้ตัวเลข เงื่อนไข และแผนที่จับต้องได้เป็นหลัก",
    caution: "ระวังยึดความปลอดภัยจนไม่กล้าขยับในจังหวะที่ควร",
  },
};

const majorMeanings: Record<string, { keyword: string; advice: string; caution: string }> = {
  "The Fool": {
    keyword: "เริ่มต้น",
    advice: "ลองเริ่มแบบไม่แบกความคาดหวังมากเกินไป",
    caution: "อย่ากระโดดโดยไม่ดูพื้นฐาน",
  },
  "The Magician": {
    keyword: "ลงมือ",
    advice: "เครื่องมือพร้อมแล้ว เหลือการเลือกใช้ให้ตรงจุด",
    caution: "อย่าใช้ความสามารถกระจัดกระจาย",
  },
  "The High Priestess": {
    keyword: "สัญชาตญาณ",
    advice: "ข้อมูลเงียบ ๆ และความรู้สึกแรกมีน้ำหนัก",
    caution: "อย่าเดาจนแทนที่ข้อเท็จจริง",
  },
  "The Empress": {
    keyword: "ดูแล",
    advice: "สิ่งที่เลี้ยงดูต่อเนื่องจะค่อย ๆ ให้ผล",
    caution: "อย่าให้มากจนลืมขอบเขตตัวเอง",
  },
  "The Emperor": {
    keyword: "วินัย",
    advice: "ตั้งขอบเขตและกติกาให้ชัดก่อนเดินต่อ",
    caution: "ระวังควบคุมมากเกินจนคนอื่นอึดอัด",
  },
  "The Hierophant": {
    keyword: "หลักการ",
    advice: "ใช้ความรู้ ระบบ หรือคำแนะนำจากคนมีประสบการณ์",
    caution: "อย่ายึดแบบเดิมจนปิดทางเลือกใหม่",
  },
  "The Lovers": {
    keyword: "ทางเลือก",
    advice: "ตัดสินใจจากคุณค่าที่ตรงกัน ไม่ใช่ความกลัวชั่วคราว",
    caution: "อย่าให้ความลังเลลากเรื่องสำคัญ",
  },
  "The Chariot": {
    keyword: "ควบคุม",
    advice: "โฟกัสเป้าหมายเดียว แล้วคุมจังหวะให้ไปถึง",
    caution: "ระวังฝืนขับเคลื่อนทั้งที่ทิศยังไม่ชัด",
  },
  Strength: {
    keyword: "อ่อนโยนแต่มั่นคง",
    advice: "ใช้ความนุ่มนวลควบคู่กับความเด็ดขาด",
    caution: "อย่ากดอารมณ์จนกลายเป็นความเหนื่อยสะสม",
  },
  "The Hermit": {
    keyword: "ทบทวน",
    advice: "ถอยมามองภาพรวมก่อนตอบหรือเดินหน้า",
    caution: "อย่าเก็บตัวนานจนโอกาสผ่านไป",
  },
  "Wheel of Fortune": {
    keyword: "จังหวะ",
    advice: "สถานการณ์กำลังเปลี่ยน เลือกขยับในจังหวะที่เปิด",
    caution: "อย่าฝากทุกอย่างไว้กับโชค",
  },
  Justice: {
    keyword: "ชัดเจน",
    advice: "ตรวจเงื่อนไข หลักฐาน และผลลัพธ์ทั้งสองด้าน",
    caution: "ระวังตัดสินเร็วโดยฟังไม่ครบ",
  },
  "The Hanged Man": {
    keyword: "มุมมองใหม่",
    advice: "เปลี่ยนมุมมองก่อนสรุปว่าไปต่อหรือหยุด",
    caution: "อย่ารอจนเรื่องที่ต้องทำค้างนาน",
  },
  Death: {
    keyword: "เปลี่ยนผ่าน",
    advice: "ตัดสิ่งที่หมดรอบ เพื่อให้พื้นที่กับสิ่งใหม่",
    caution: "อย่ากอดสิ่งเดิมเพราะกลัวเริ่มใหม่",
  },
  Temperance: {
    keyword: "ปรับจูน",
    advice: "ประนีประนอมและค่อย ๆ ผสมทางเลือกให้ลงตัว",
    caution: "ระวังประนีประนอมจนเสียแกนตัวเอง",
  },
  "The Devil": {
    keyword: "รู้เท่าทัน",
    advice: "ระวังความอยาก ความกลัว หรือข้อผูกมัดที่ทำให้มองไม่ชัด",
    caution: "อย่าตัดสินใจจากแรงดึงดูดชั่วคราว",
  },
  "The Tower": {
    keyword: "รื้อโครงเก่า",
    advice: "ถ้าสิ่งเดิมไม่มั่นคง ต้องกล้ารื้อให้ปลอดภัยกว่าเดิม",
    caution: "อย่าฝืนรักษาโครงสร้างที่พังอยู่แล้ว",
  },
  "The Star": {
    keyword: "เยียวยา",
    advice: "กลับมาเชื่อในทิศทางระยะยาวและดูแลใจให้พอ",
    caution: "อย่าหวังไกลจนไม่ลงมือวันนี้",
  },
  "The Moon": {
    keyword: "ไม่ชัดเจน",
    advice: "ตรวจข้อมูลซ้ำ อย่าให้ความกังวลเป็นคนตัดสิน",
    caution: "ระวังภาพในใจหลอกให้มองเกินจริง",
  },
  "The Sun": {
    keyword: "เปิดเผย",
    advice: "เรื่องที่ชัด ตรง และจริงใจจะเดินได้ดีที่สุด",
    caution: "อย่ามั่นใจจนมองข้ามรายละเอียด",
  },
  Judgement: {
    keyword: "สรุปบทเรียน",
    advice: "มองบทเรียนเดิม แล้วเลือกทางที่โตขึ้น",
    caution: "อย่าตัดสินตัวเองจากอดีตอย่างเดียว",
  },
  "The World": {
    keyword: "ครบวงจร",
    advice: "มีโอกาสปิดงานหรือสรุปบทสำคัญให้สมบูรณ์",
    caution: "อย่าปิดรอบโดยยังไม่ได้เก็บรายละเอียดสำคัญ",
  },
};

const rankMeanings: Record<string, { keyword: string; advice: string }> = {
  Ace: { keyword: "เมล็ดเริ่มต้น", advice: "เริ่มจากก้าวเล็กที่จับต้องได้" },
  Two: { keyword: "การเลือก", advice: "ชั่งน้ำหนักสองทางให้ชัด" },
  Three: { keyword: "การร่วมมือ", advice: "ประสานคนหรือข้อมูลให้เกิดแรงสนับสนุน" },
  Four: { keyword: "ฐานมั่นคง", advice: "จัดระบบให้แน่นก่อนขยาย" },
  Five: { keyword: "แรงเสียดทาน", advice: "ลดการปะทะและอย่าเสียพลังกับเรื่องเล็ก" },
  Six: { keyword: "ปรับสมดุล", advice: "คืนสมดุลด้วยการให้และรับอย่างพอดี" },
  Seven: { keyword: "ประเมิน", advice: "เลือกจุดยืนและตรวจข้อเท็จจริง" },
  Eight: { keyword: "ฝึกฝน", advice: "ทำซ้ำอย่างมีวินัยแล้วผลจะค่อย ๆ ชัด" },
  Nine: { keyword: "ใกล้สำเร็จ", advice: "เก็บรายละเอียดสุดท้ายก่อนสรุป" },
  Ten: { keyword: "บทสรุป", advice: "ปิดรอบเก่าและจัดภาระให้เบาลง" },
  Page: { keyword: "ข่าวสาร", advice: "เริ่มเรียนรู้หรือรับข่าวใหม่ด้วยใจเปิด" },
  Knight: { keyword: "เคลื่อนไหว", advice: "ขยับอย่างมีทิศทาง ระวังเร่งเกินจริง" },
  Queen: { keyword: "ดูแล", advice: "ใช้ความเข้าใจและการจัดการอารมณ์ให้ดี" },
  King: { keyword: "ควบคุม", advice: "ตัดสินใจแบบผู้รับผิดชอบภาพรวม" },
};

function cardMeaning(card: TarotCard) {
  const major = majorMeanings[card.name];
  if (major) {
    return {
      keyword: major.keyword,
      energy: "จังหวะสำคัญที่ควรรับฟังเป็นพิเศษ",
      advice: major.advice,
      caution: major.caution,
    };
  }

  const [rank, suit] = card.name.split(" of ") as [string, keyof typeof suitProfiles];
  const rankInfo = rankMeanings[rank] || { keyword: "สัญญาณ", advice: "อ่านร่วมกับบริบทของคำถาม" };
  const suitInfo = suitProfiles[suit] || suitProfiles.Pentacles;
  return {
    keyword: rankInfo.keyword,
    energy: suitInfo.energy,
    advice: `${rankInfo.advice}. ${suitInfo.action}`,
    caution: suitInfo.caution,
    topic: suitInfo.topic,
  };
}

function periodText(category: TarotCategory) {
  if (category.slug === "daily") return "วันนี้";
  if (category.slug === "weekly") return "สัปดาห์นี้";
  if (category.slug === "monthly") return "เดือนนี้";
  return "ช่วงนี้";
}

function categoryFocus(category: TarotCategory) {
  const focus: Record<string, string> = {
    daily: "เรื่องที่ต้องเจอในวันนี้และวิธีผ่านวันให้สบายใจขึ้น",
    weekly: "เรื่องเด่นของสัปดาห์ ทั้งงาน ความสัมพันธ์ และสิ่งที่ควรจัดให้เข้าที่",
    monthly: "ภาพรวมของเดือนนี้ ว่าควรเดินหน้าเรื่องไหนและควรชะลอเรื่องไหน",
    career: "งาน หน้าที่ ความก้าวหน้า และโอกาสที่ต้องลงมือจริง",
    finance: "เงิน รายรับ รายจ่าย และสิ่งที่ควรคิดให้รอบคอบ",
    love: "ความรัก ความรู้สึก และวิธีคุยกันให้เข้าใจกว่าเดิม",
    health: "ร่างกาย ใจ และสิ่งที่ควรดูแลตัวเองมากขึ้น",
    family: "ครอบครัว คนใกล้ตัว และบรรยากาศในบ้าน",
    study: "การเรียน การสอบ และวินัยที่ช่วยให้ไปต่อได้",
    luck: "โชค โอกาส และจังหวะที่ควรใช้ด้วยความพอดี",
  };
  return focus[category.slug] || "เรื่องตรงหน้าและทางเลือกที่ควรดูให้ชัด";
}

function positionLead(position: string, index: number) {
  const label = position || `ใบที่ ${index + 1}`;
  const normalized = label.toLowerCase();
  if (normalized.includes("บทสรุป") || normalized.includes("ผลลัพธ์")) {
    return `ใบนี้คือข้อสรุปของคำทำนาย`;
  }
  if (normalized.includes("อุปสรรค") || normalized.includes("ระวัง")) {
    return `ใบนี้บอกจุดที่ควรระวัง`;
  }
  if (normalized.includes("โอกาส") || normalized.includes("ส่งเสริม")) {
    return `ใบนี้บอกโอกาสที่พอหยิบไปต่อยอดได้`;
  }
  if (normalized.includes("ความรัก") || normalized.includes("สัมพันธ์")) {
    return `ใบนี้เน้นความรู้สึกและการคุยกัน`;
  }
  if (normalized.includes("เงิน") || normalized.includes("ทรัพย์")) {
    return `ใบนี้เน้นเรื่องเงินและความคุ้มค่า`;
  }
  if (normalized.includes("งาน")) {
    return `ใบนี้พูดถึงงานและหน้าที่ที่ต้องรับผิดชอบ`;
  }
  return `ใบนี้ชวนให้ค่อย ๆ ดูเรื่องนี้แบบไม่รีบตัดสิน`;
}

function orientationText(item: DrawnTarotCard, meaning: ReturnType<typeof cardMeaning>) {
  if (!item.reversed) {
    return `${item.card.name} แบบปกติทำให้เรื่อง “${meaning.keyword}” เด่นขึ้น ยังมีทางให้ไปต่อได้`;
  }

  return `${item.card.name} แบบกลับหัวไม่ได้แปลว่าร้ายเสมอไป แค่บอกว่าเรื่อง “${meaning.keyword}” ยังไม่ลื่น หรือยังผิดจังหวะอยู่`;
}

function practicalAdvice(
  item: DrawnTarotCard,
  meaning: ReturnType<typeof cardMeaning>,
  category: TarotCategory,
) {
  const core = item.reversed ? meaning.caution : meaning.advice;
  const categoryAdvice: Record<string, string> = {
    daily: "วันนี้เริ่มจากเรื่องเล็กที่ทำได้ก่อน อย่าให้ความคิดเยอะพาเหนื่อยเกินไป",
    weekly: "สัปดาห์นี้จัดเรื่องสำคัญก่อน ทำทีละอย่าง แล้วค่อยดูผล",
    monthly: "เดือนนี้อย่าตัดสินจากเหตุการณ์เดียว รอดูภาพรวมอีกนิด",
    career: "เรื่องงานให้ดูจากข้อมูลจริงและผลงาน อย่าตัดสินเพราะกดดันชั่วคราว",
    finance: "เรื่องเงินเช็กตัวเลขให้ครบ แยกของจำเป็นกับของอยากได้ให้ชัด",
    love: "เรื่องรักคุยกันตรง ๆ แต่ใช้ถ้อยคำที่ถนอมน้ำใจกัน",
    health: "ถ้าเหนื่อยให้พัก อย่าฝืนร่างกายหรือใจจนเกินไป",
    family: "คุยกันในเวลาที่พร้อมฟัง จะช่วยลดความเข้าใจผิดได้",
    study: "แบ่งเป้าหมายให้เล็กลง แล้วค่อย ๆ ทำให้สม่ำเสมอ",
    luck: "รับโอกาสได้ แต่อย่าเอาความหวังทั้งหมดไปผูกกับโชค",
  };

  return `${core}. ${categoryAdvice[category.slug] || "ดูทั้งข้อมูลและความรู้สึก แล้วเลือกทางที่รับผิดชอบได้"}`;
}

function paragraphBreaks(text: string) {
  return text.replace(/\n{3,}/g, "\n\n").trim();
}

function isFinalCard(position: string, category: TarotCategory, index: number) {
  return index === category.count - 1 || /บทสรุป|ผลลัพธ์/.test(position);
}

export function drawSelectedCards(
  deck: TarotCard[],
  selectedIndexes: number[],
  count: number,
): DrawnTarotCard[] {
  const selected = selectedIndexes
    .map((idx) => deck[idx])
    .filter(Boolean)
    .slice(0, count);
  const fallback = tarotCards.filter((card) => !selected.some((item) => item.no === card.no));
  const cards = [...selected, ...fallback].slice(0, count);
  return cards.map((card, index) => ({
    card,
    reversed: (card.no + index + count) % 7 < 2,
  }));
}

export function interpretTarotCard(
  item: DrawnTarotCard,
  position: string,
  category: TarotCategory,
  index: number,
) {
  const meaning = cardMeaning(item.card);
  const period = periodText(category);
  const lead = positionLead(position, index);
  const focus = categoryFocus(category);
  const orientation = orientationText(item, meaning);
  const advice = practicalAdvice(item, meaning, category);
  const isSummary = isFinalCard(position, category, index);
  const reversalNote = item.reversed
    ? "ถ้ายังติดขัดอยู่ ให้ถอยมาดูจังหวะก่อน ไม่ต้องฝืนให้จบเดี๋ยวนี้"
    : "ตอนนี้ยังเดินต่อได้ แค่ค่อย ๆ ทำให้ชัดทีละขั้นก็พอ";
  const practicalNote = isSummary
    ? `\n\nคำแนะนำ: ${advice} เริ่มจากเรื่องที่ทำได้ก่อน แล้วค่อยตัดสินใจเรื่องใหญ่เมื่อพร้อมกว่านี้`
    : "";

  return paragraphBreaks(`${position || `ใบที่ ${index + 1}`} : ${item.card.name}${item.reversed ? " (กลับหัว)" : ""}

${period}เรื่องนี้เกี่ยวกับ${focus} ${lead}

${orientation} ลองดูเรื่องนี้ตามจริง ไม่ต้องรีบมองว่าดีหรือร้ายเกินไป

${reversalNote}${practicalNote}`);
}

export function summarizeTarotReading(items: DrawnTarotCard[], category: TarotCategory) {
  const first = items[0];
  const last = items[items.length - 1] || first;
  const reversedCount = items.filter((item) => item.reversed).length;
  const majorCount = items.filter((item) => majorMeanings[item.card.name]).length;
  const firstMeaning = first ? cardMeaning(first.card) : null;
  const lastMeaning = last ? cardMeaning(last.card) : null;
  const tone =
    majorCount >= Math.max(1, Math.floor(items.length / 3))
      ? "รอบนี้มีเรื่องสำคัญให้คิด ไม่ใช่แค่เรื่องผ่าน ๆ"
      : "ภาพรวมยังพอจัดการได้ ถ้าค่อย ๆ แก้ทีละเรื่อง";
  const caution =
    reversedCount >= Math.ceil(items.length / 2)
      ? "ไพ่กลับหัวค่อนข้างเยอะ ควรชะลอและเช็กข้อมูลก่อน"
      : "ไพ่ส่วนใหญ่ยังพอเปิดทาง แต่ควรวางแผนก่อนตัดสินใจ";

  return {
    headline: firstMeaning
      ? `${category.title}เด่นที่ “${firstMeaning.keyword}”`
      : "อ่านไพ่ครบแล้ว",
    body:
      first && last && firstMeaning && lastMeaning
        ? `${tone} ไพ่ใบแรกคือ ${first.card.name} จึงควรเริ่มจากเรื่อง “${firstMeaning.keyword}” ส่วนใบสรุปคือ ${last.card.name} พาไปที่เรื่อง “${lastMeaning.keyword}”. ${caution} ใช้คำทำนายนี้เป็นแนวทาง แล้วเลือกปรับกับชีวิตจริงของคุณ`
        : "ตั้งสมาธิ เลือกไพ่ แล้วระบบจะอ่านผลตามตำแหน่งของหมวดนี้",
    next: lastMeaning
      ? `${lastMeaning.advice} แล้วลองถามตัวเองว่าสิ่งที่ทำอยู่ยังพาคุณไปทางที่ต้องการไหม`
      : "เริ่มจากเรื่องเล็กที่ควบคุมได้ก่อน",
  };
}
