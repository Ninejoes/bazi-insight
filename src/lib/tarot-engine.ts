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
    daily: "จังหวะของวัน การตัดสินใจเล็ก ๆ และวิธีดูแลใจให้ผ่านวันนี้อย่างราบรื่น",
    weekly: "เรื่องที่ค่อย ๆ เห็นผลภายในสัปดาห์ ทั้งงาน ความสัมพันธ์ และภาระที่ต้องจัดลำดับ",
    monthly: "ภาพรวมของเดือน การเปลี่ยนผ่าน แผนระยะกลาง และบทเรียนที่ควรเก็บไปใช้ต่อ",
    career: "งาน เป้าหมาย บทบาท ความรับผิดชอบ และโอกาสที่ต้องลงมืออย่างเป็นระบบ",
    finance: "การเงิน รายรับรายจ่าย ความมั่นคง และการใช้ทรัพยากรให้คุ้มค่า",
    love: "ความสัมพันธ์ ความรู้สึก การสื่อสาร และขอบเขตที่ทำให้หัวใจปลอดภัยขึ้น",
    health: "สุขภาพกาย สุขภาพใจ พลังงานส่วนตัว และการดูแลตัวเองอย่างสม่ำเสมอ",
    family: "ครอบครัว คนใกล้ตัว บริวาร และบรรยากาศภายในบ้าน",
    study: "การเรียน การสอบ การพัฒนาทักษะ และวินัยที่ทำให้ผลลัพธ์ดีขึ้น",
    luck: "โชค จังหวะเสี่ยง โอกาสกะทันหัน และสิ่งที่ควรทำเพื่อเปิดทางให้ตัวเอง",
  };
  return focus[category.slug] || "สถานการณ์ตรงหน้าและทางเลือกที่ควรพิจารณาอย่างรอบคอบ";
}

function positionLead(position: string, index: number) {
  const label = position || `ใบที่ ${index + 1}`;
  const normalized = label.toLowerCase();
  if (normalized.includes("บทสรุป") || normalized.includes("ผลลัพธ์")) {
    return `ตำแหน่ง “${label}” คือภาพรวมสุดท้ายของคำอ่าน`;
  }
  if (normalized.includes("อุปสรรค") || normalized.includes("ระวัง")) {
    return `ตำแหน่ง “${label}” ชี้จุดที่ควรระวังเป็นพิเศษ`;
  }
  if (normalized.includes("โอกาส") || normalized.includes("ส่งเสริม")) {
    return `ตำแหน่ง “${label}” เปิดให้เห็นโอกาสที่ใช้ต่อยอดได้`;
  }
  if (normalized.includes("ความรัก") || normalized.includes("สัมพันธ์")) {
    return `ตำแหน่ง “${label}” เน้นความรู้สึกและการสื่อสาร`;
  }
  if (normalized.includes("เงิน") || normalized.includes("ทรัพย์")) {
    return `ตำแหน่ง “${label}” เน้นเงิน ทรัพยากร และความคุ้มค่า`;
  }
  if (normalized.includes("งาน")) {
    return `ตำแหน่ง “${label}” พูดถึงงาน บทบาท และความรับผิดชอบ`;
  }
  return `ตำแหน่ง “${label}” ชวนให้ดูสถานการณ์แบบใจเย็น`;
}

function orientationText(item: DrawnTarotCard, meaning: ReturnType<typeof cardMeaning>) {
  if (!item.reversed) {
    return `${item.card.name} ในลักษณะปกติทำให้เรื่อง “${meaning.keyword}” เด่นขึ้น จังหวะนี้ยังพอเปิดทางให้ขยับต่อได้`;
  }

  return `${item.card.name} แบบกลับหัวไม่ได้แปลว่าร้ายเสมอไป แต่บอกว่าเรื่อง “${meaning.keyword}” ยังติดขัดหรือใช้ผิดจังหวะ`;
}

function practicalAdvice(
  item: DrawnTarotCard,
  meaning: ReturnType<typeof cardMeaning>,
  category: TarotCategory,
) {
  const core = item.reversed ? meaning.caution : meaning.advice;
  const categoryAdvice: Record<string, string> = {
    daily: "เริ่มจากสิ่งเล็กที่สุดที่ควบคุมได้ในวันนี้ แล้วอย่าปล่อยให้ความคิดฟุ้งซ่านพาออกนอกทาง",
    weekly: "จัดลำดับงานหรือเรื่องสำคัญของสัปดาห์ให้ชัด เลือกทำทีละเรื่อง และกันเวลาไว้สำหรับตรวจทาน",
    monthly: "อย่าเพิ่งตัดสินทั้งเดือนจากเหตุการณ์เดียว ให้ดูแนวโน้มซ้ำ ๆ แล้วค่อยวางแผนระยะต่อไป",
    career: "ใช้ข้อมูล ผลงาน และบทบาทจริงเป็นฐานในการตัดสินใจมากกว่าความรู้สึกกดดันชั่วคราว",
    finance: "เช็กตัวเลขให้ครบ แยกสิ่งจำเป็นออกจากสิ่งที่อยากได้ และอย่าเสี่ยงเพราะอารมณ์",
    love: "คุยให้ตรงแต่ไม่ทำร้ายกัน ฟังอีกฝ่ายให้จบ และกลับมาถามตัวเองว่าต้องการความสัมพันธ์แบบไหน",
    health: "ฟังสัญญาณจากร่างกายและใจ หากเหนื่อยสะสมควรพักก่อนผลักตัวเองต่อ",
    family: "ลดการตีความแทนคนอื่น แล้วเลือกพูดในเวลาที่ทุกฝ่ายพร้อมรับฟัง",
    study: "แบ่งเป้าหมายออกเป็นช่วงสั้น ๆ ทบทวนสม่ำเสมอ และอย่าวัดคุณค่าตัวเองจากคะแนนครั้งเดียว",
    luck: "เปิดรับโอกาสได้ แต่ควรมีขอบเขตและไม่ฝากความหวังทั้งหมดไว้กับดวงเพียงอย่างเดียว",
  };

  return `${core}. ${categoryAdvice[category.slug] || "ใช้ข้อมูลที่มีอยู่ประกอบกับสัญชาตญาณ แล้วเลือกทางที่รับผิดชอบผลลัพธ์ได้จริง"}`;
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
    ? "ถ้าเรื่องนี้ยังติด ๆ ขัด ๆ ให้ชะลอและกลับไปจัดจังหวะใหม่ก่อน ไม่จำเป็นต้องฝืนให้จบในทันที"
    : "จังหวะนี้เดินต่อได้ แต่ควรค่อย ๆ ทำให้ชัดทีละขั้น ไม่ต้องรีบพิสูจน์ทุกอย่างพร้อมกัน";
  const practicalNote = isSummary
    ? `\n\nคำแนะนำที่ใช้ได้จริง: ${advice} เลือกเริ่มจากเรื่องเล็กที่ควบคุมได้ก่อน แล้วค่อยตัดสินใจเรื่องใหญ่เมื่อใจและข้อมูลพร้อมกว่านี้`
    : "";

  return paragraphBreaks(`${position || `ใบที่ ${index + 1}`} : ${item.card.name}${item.reversed ? " (กลับหัว)" : ""}

${period}ในหัวข้อนี้เกี่ยวกับ${focus} ${lead}

${orientation} ภาพรวมของใบนี้ชวนให้มองสถานการณ์ตามจริง ไม่รีบตีความให้ดีหรือร้ายเกินไป และดูว่าตอนนี้ควรใช้แรงไปกับเรื่องไหนก่อน

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
      ? "รอบนี้ไม่ได้เป็นแค่เรื่องเล็ก ๆ ผ่านมาแล้วผ่านไป แต่มีบทเรียนหรือการตัดสินใจสำคัญซ่อนอยู่"
      : "ภาพรวมยังเป็นสถานการณ์ที่จัดการได้ หากค่อย ๆ แยกปัญหาและลงมือทีละขั้น";
  const caution =
    reversedCount >= Math.ceil(items.length / 2)
      ? "จำนวนไพ่กลับหัวค่อนข้างมาก จึงควรชะลอ ตรวจข้อมูล และไม่รีบสรุปเพียงเพราะอยากให้เรื่องจบเร็ว"
      : "ไพ่ส่วนใหญ่เปิดทางพอสมควร แต่ยังควรวางแผนและเช็กความพร้อมก่อนตัดสินใจ";

  return {
    headline: firstMeaning
      ? `${category.title}เด่นที่ “${firstMeaning.keyword}”`
      : "อ่านไพ่ครบแล้ว",
    body:
      first && last && firstMeaning && lastMeaning
        ? `${tone}. จุดเริ่มต้นของคำอ่านวางน้ำหนักไว้ที่ ${first.card.name} จึงควรเริ่มจากการทำความเข้าใจเรื่อง “${firstMeaning.keyword}” ให้ชัดก่อน ส่วนปลายทางของชุดไพ่เชื่อมไปที่ ${last.card.name} ซึ่งพาไปสู่ประเด็น “${lastMeaning.keyword}”. ${caution}. ภาพรวมแนะนำให้ใช้คำทำนายนี้เป็นเหมือนแผนที่ ไม่ใช่คำสั่งตายตัว เลือกหยิบสิ่งที่ตรงกับสถานการณ์จริง แล้วนำไปปรับใช้ด้วยสติ`
        : "ตั้งสมาธิ เลือกไพ่ แล้วระบบจะอ่านผลตามตำแหน่งของหมวดนี้",
    next: lastMeaning
      ? `${lastMeaning.advice} แล้วตรวจอีกครั้งว่าสิ่งที่กำลังทำอยู่ยังตรงกับเป้าหมายจริงของคุณหรือไม่`
      : "เริ่มจากเรื่องเล็กที่ควบคุมได้ก่อน",
  };
}
