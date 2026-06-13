import { readFile } from "node:fs/promises";

const TARGET_COUNT = 1000;
const BATCH_SIZE = 25;
const siteUrl = "https://www.likhitfa.online";
const dryRun = process.argv.includes("--dry-run");

await loadLocalEnv();

const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || "";

if (!supabaseUrl || !serviceKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

const coverImages = {
  "ทำนายฝัน": [
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=1200&q=80",
  ],
  "ไพ่ยิปซี": [
    "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
  ],
  "ปาจื้อ": [
    "https://images.unsplash.com/photo-1528184039930-bd03972bd974?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80",
  ],
  "เลขศาสตร์": [
    "https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1453733190371-0a9bedd82893?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
  ],
  "ฤกษ์มงคลและฮวงจุ้ย": [
    "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=80",
  ],
  "12 ราศี": [
    "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1532968961962-8a0cb3a2d4f5?auto=format&fit=crop&w=1200&q=80",
  ],
  "12 นักษัตร": [
    "https://images.unsplash.com/photo-1528184039930-bd03972bd974?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1519181245277-cffeb31da2e3?auto=format&fit=crop&w=1200&q=80",
  ],
  "ความเชื่อไทย": [
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1535078035266-a0fa7d3b8f65?auto=format&fit=crop&w=1200&q=80",
  ],
  "เลขเด็ด": [
    "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
  ],
  "พระประจำวันเกิด": [
    "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1528184039930-bd03972bd974?auto=format&fit=crop&w=1200&q=80",
  ],
};

const pools = {
  dream: {
    category: "ทำนายฝัน",
    subjects:
      "งู ช้าง ปลา ทอง เงิน พระ เด็ก บ้าน รถ น้ำ ฝน ไฟ ฟัน ผม เลือด ศพ แมว สุนัข เต่า กบ นก ไก่ เสือ ม้า วัว ควาย กระจก แหวน รองเท้า เสื้อผ้า โทรศัพท์ กระเป๋า ทะเล ภูเขา ป่า ดอกไม้ ต้นไม้ ข้าว ผลไม้ แม่น้ำ น้ำตก ฝนตกหนัก น้ำท่วม พายุ ฟ้าผ่า ดาวตก พระจันทร์ พระอาทิตย์ สะพาน ถนน วัด โรงเรียน โรงพยาบาล ตลาด งานแต่ง งานศพ คนรัก แฟนเก่า พ่อ แม่ ลูก เพื่อน เจ้านาย พระสงฆ์ เทวดา วิญญาณ กุมาร พญานาค มังกร บ้านใหม่ บ้านเก่า ห้องน้ำ ห้องนอน ห้องครัว ประตู หน้าต่าง กุญแจ นาฬิกา หนังสือ เอกสาร บัตร จดหมาย เครื่องบิน รถไฟ เรือ ลิฟต์ บันได ขึ้นเขา หลงทาง ร้องไห้ หัวเราะ ถูกหวย ได้เงิน เสียเงิน".split(" "),
    intents: [
      "หมายถึงอะไร พร้อมเลขมงคลและคำเตือน",
      "ตีความตามตำราไทยและวิธีดูบริบท",
      "ดีหรือร้าย อ่านความหมายแบบเข้าใจง่าย",
      "เลขเด็ดที่เกี่ยวข้องและข้อควรระวัง",
      "คำทำนายด้านงาน เงิน ความรัก",
    ],
    limit: 220,
  },
  tarot: {
    category: "ไพ่ยิปซี",
    subjects:
      "The Fool The Magician The High Priestess The Empress The Emperor The Hierophant The Lovers The Chariot Strength The Hermit Wheel of Fortune Justice The Hanged Man Death Temperance The Devil The Tower The Star The Moon The Sun Judgement The World Ace of Cups Two of Cups Three of Cups Four of Cups Five of Cups Six of Cups Seven of Cups Eight of Cups Nine of Cups Ten of Cups Ace of Pentacles Two of Pentacles Three of Pentacles Four of Pentacles Five of Pentacles Six of Pentacles Seven of Pentacles Eight of Pentacles Nine of Pentacles Ten of Pentacles Ace of Swords Two of Swords Three of Swords Four of Swords Five of Swords Six of Swords Seven of Swords Eight of Swords Nine of Swords Ten of Swords Ace of Wands Two of Wands Three of Wands Four of Wands Five of Wands Six of Wands Seven of Wands Eight of Wands Nine of Wands Ten of Wands".split(/ (?=(?:The|Ace|Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten|Strength|Death|Temperance|Justice|Judgement|Wheel))/).map((item) => item.trim()).filter(Boolean),
    intents: [
      "ความหมายความรัก งาน และการเงิน",
      "ขึ้นตำแหน่งอดีต ปัจจุบัน อนาคต แปลว่าอะไร",
      "กลับหัวควรอ่านอย่างไรให้ไม่สับสน",
      "คำแนะนำจากไพ่สำหรับคนกำลังลังเล",
      "อ่านแบบมือใหม่แต่ใช้ได้จริง",
    ],
    limit: 160,
  },
  bazi: {
    category: "ปาจื้อ",
    subjects:
      "Day Master ธาตุไม้ ธาตุไฟ ธาตุดิน ธาตุทอง ธาตุน้ำ เสา年 เสา月 เสา日 เสา时 ดาวทรัพย์ ดาวอำนาจ ดาวความรู้ ดาวแสดงออก ดาวเพื่อน ดาวคู่ครอง โชควัยจร ปีจร เดือนจร ฤดูเกิด ธาตุสมดุล ธาตุเกิน ธาตุขาด ฤกษ์จีน อาชีพตามธาตุ ความรักตามดวงจีน การเงินตามดวงจีน สุขภาพตามธาตุ ดวงแข็ง ดวงอ่อน ธาตุให้คุณ ธาตุควรระวัง".split(" "),
    intents: [
      "คืออะไร อ่านอย่างไรสำหรับมือใหม่",
      "ใช้ดูงาน เงิน ความรักได้อย่างไร",
      "สัญญาณที่ควรรู้ก่อนอ่านดวง",
      "วิธีแปลแบบเข้าใจง่ายไม่ติดตำรา",
      "ข้อควรระวังในการตีความดวงจีน",
    ],
    limit: 130,
  },
  numerology: {
    category: "เลขศาสตร์",
    subjects:
      "เลข 11 เลข 12 เลข 13 เลข 14 เลข 15 เลข 16 เลข 17 เลข 18 เลข 19 เลข 21 เลข 22 เลข 23 เลข 25 เลข 26 เลข 27 เลข 28 เลข 29 เลข 31 เลข 32 เลข 33 เลข 34 เลข 35 เลข 37 เลข 38 เลข 39 เลข 41 เลข 42 เลข 43 เลข 44 เลข 47 เลข 48 เลข 49 เลข 51 เลข 52 เลข 53 เลข 57 เลข 58 เลข 61 เลข 62 เลข 64 เลข 67 เลข 68 เลข 71 เลข 72 เลข 73 เลข 74 เลข 75 เลข 76 เลข 77 เลข 81 เลข 82 เลข 83 เลข 84 เลข 85 เลข 86 เลข 87 เลข 88 เลข 91 เลข 92 เลข 93 เลข 94 เลข 96 เลข 97 เลข 98 เลข 99".split(/ (?=เลข)/).map((item) => item.trim()).filter(Boolean),
    intents: [
      "ความหมายด้านงาน เงิน และความรัก",
      "ดีไหม เหมาะกับใคร และควรระวังอะไร",
      "ใช้ในเบอร์โทร เลขบ้าน ทะเบียนรถอย่างไร",
      "เลขนี้เสริมดวงด้านไหน",
      "อ่านแบบเลขศาสตร์ไทยเข้าใจง่าย",
    ],
    limit: 130,
  },
  auspicious: {
    category: "ฤกษ์มงคลและฮวงจุ้ย",
    subjects:
      "ฤกษ์ออกรถ ฤกษ์ขึ้นบ้านใหม่ ฤกษ์เปิดร้าน ฤกษ์แต่งงาน ฤกษ์ย้ายบ้าน ฤกษ์ทำบุญบ้าน ฤกษ์เริ่มงานใหม่ ฤกษ์เปิดบริษัท ฮวงจุ้ยหน้าบ้าน ฮวงจุ้ยประตูบ้าน ฮวงจุ้ยห้องนอน ฮวงจุ้ยห้องครัว ฮวงจุ้ยห้องน้ำ ฮวงจุ้ยโต๊ะทำงาน ฮวงจุ้ยร้านค้า ฮวงจุ้ยสำนักงาน ต้นไม้มงคลหน้าบ้าน ต้นไม้มงคลในบ้าน กระเป๋าสตางค์สีมงคล สีรถมงคล หินมงคลเสริมการเงิน หินมงคลเสริมความรัก หินมงคลเสริมการงาน ของมงคลเสริมโชค เครื่องรางยอดนิยม วิธีไหว้พระขอพร".split(/ (?=(?:ฤกษ์|ฮวงจุ้ย|ต้นไม้|กระเป๋า|สีรถ|หิน|ของ|เครื่อง|วิธี))/).map((item) => item.trim()).filter(Boolean),
    intents: [
      "เลือกอย่างไรให้เหมาะกับชีวิตจริง",
      "หลักความเชื่อและข้อควรระวัง",
      "คู่มือสำหรับมือใหม่",
      "เสริมงาน เงิน ความรัก และความสบายใจ",
      "วิธีใช้แบบไม่งมงาย",
    ],
    limit: 120,
  },
  zodiac: {
    category: "12 ราศี",
    subjects:
      "ราศีเมษ ราศีพฤษภ ราศีเมถุน ราศีกรกฎ ราศีสิงห์ ราศีกันย์ ราศีตุลย์ ราศีพิจิก ราศีธนู ราศีมังกร ราศีกุมภ์ ราศีมีน".split(/ (?=ราศี)/).map((item) => item.trim()).filter(Boolean),
    intents: [
      "นิสัย ความรัก งาน และการเงิน",
      "สีมงคล หินมงคล และอาชีพที่เหมาะ",
      "จุดเด่น จุดอ่อน และวิธีเสริมดวง",
      "เข้ากับราศีไหนและควรระวังใคร",
      "ดวงภาพรวมแบบเข้าใจง่าย",
    ],
    limit: 80,
  },
  zodiacYear: {
    category: "12 นักษัตร",
    subjects:
      "ปีชวด ปีฉลู ปีขาล ปีเถาะ ปีมะโรง ปีมะเส็ง ปีมะเมีย ปีมะแม ปีวอก ปีระกา ปีจอ ปีกุน".split(" "),
    intents: [
      "นิสัย ความรัก งาน และการเงิน",
      "คู่มิตรคู่ศัตรูและวิธีเสริมดวง",
      "สีมงคล หินมงคล และอาชีพที่เหมาะ",
      "ข้อดีข้อควรระวังตามปีเกิด",
      "ดวงจีนไทยแบบเข้าใจง่าย",
    ],
    limit: 70,
  },
  belief: {
    category: "ความเชื่อไทย",
    subjects:
      "ไฝบนใบหน้า ไฝที่คิ้ว ไฝที่จมูก ไฝที่ปาก ไฝที่คาง ลายมือ เส้นชีวิต เส้นวาสนา เส้นสมอง เส้นหัวใจ ลายนิ้วมือ รูปนิ้วมือ รูปเท้า รูปหู รูปคิ้ว รูปตา รูปจมูก รูปปาก จิ้งจกทัก ตุ๊กแกร้อง แมวดำ อีกา ค้างคาวเข้าบ้าน ผีอำ ฝันซ้ำ วันห้ามไทย เดือนอ้าย เดือนยี่ ประเพณีไทย".split(/ (?=(?:ไฝ|ลาย|เส้น|รูป|จิ้งจก|ตุ๊กแก|แมว|อีกา|ค้างคาว|ผี|ฝัน|วัน|เดือน|ประเพณี))/).map((item) => item.trim()).filter(Boolean),
    intents: [
      "หมายถึงอะไรตามความเชื่อโบราณ",
      "ดีหรือร้ายและควรทำอย่างไร",
      "อ่านแบบมีเหตุผลไม่งมงาย",
      "ที่มาและความหมายในสังคมไทย",
      "ข้อควรระวังในการตีความ",
    ],
    limit: 70,
  },
  lottery: {
    category: "เลขเด็ด",
    subjects:
      "เลขท้าย 2 ตัว เลขท้าย 3 ตัว เลขหน้า 3 ตัว เลขสถิติย้อนหลัง เลขออกซ้ำ เลขเบิ้ล เลขหาม เลขตอง เลขกลับ เลขคู่ เลขคี่ เลขเด่นประจำงวด สถิติวันหวยออก วิธีอ่านผลรางวัล ความน่าจะเป็นหวยไทย".split(/ (?=(?:เลข|สถิติ|วิธี|ความ))/).map((item) => item.trim()).filter(Boolean),
    intents: [
      "ดูสถิติอย่างไรให้มีสติ",
      "ความหมายและวิธีใช้ข้อมูลย้อนหลัง",
      "อ่านตัวเลขแบบไม่หลงเชื่อเกินจริง",
      "แนวทางวิเคราะห์สำหรับมือใหม่",
      "ข้อควรระวังก่อนใช้เลขเสี่ยงโชค",
    ],
    limit: 50,
  },
  birthday: {
    category: "พระประจำวันเกิด",
    subjects:
      "วันอาทิตย์ วันจันทร์ วันอังคาร วันพุธกลางวัน วันพุธกลางคืน วันพฤหัสบดี วันศุกร์ วันเสาร์".split(/ (?=วัน)/).map((item) => item.trim()).filter(Boolean),
    intents: [
      "พระประจำวันเกิด สีมงคล และคาถา",
      "ของมงคลและวิธีเสริมดวง",
      "นิสัยตามวันเกิดและคำแนะนำ",
      "ดอกไม้บูชาและวิธีตั้งจิต",
      "เสริมงาน เงิน ความรักอย่างไร",
    ],
    limit: 40,
  },
};

const longTailIntents = [
  "ดูอย่างไรให้เข้าใจง่าย",
  "เหมาะกับใครและควรระวังอะไร",
  "คำแนะนำสำหรับมือใหม่",
  "ความหมายเชิงลึกที่คนมักเข้าใจผิด",
  "ใช้ดูงาน เงิน ความรักได้อย่างไร",
  "สัญญาณดีและสัญญาณเตือนที่ควรรู้",
  "วิธีนำไปใช้ในชีวิตประจำวัน",
  "อ่านแบบไม่งมงายและใช้ได้จริง",
  "คำถามยอดนิยมและคำตอบแบบละเอียด",
  "แนวทางเสริมดวงแบบปลอดภัย",
  "เปรียบเทียบความหมายดีร้ายแบบเข้าใจง่าย",
  "ข้อควรระวังก่อนตัดสินใจ",
];

const existing = await loadExistingArticles();
const articles = buildArticles(existing);

console.log(`Prepared ${articles.length} SEO articles`);
console.log(JSON.stringify(countByCategory(articles), null, 2));

if (dryRun) {
  console.log(JSON.stringify({ first: articles[0], last: articles.at(-1) }, null, 2));
  process.exit(0);
}

for (let index = 0; index < articles.length; index += BATCH_SIZE) {
  const chunk = articles.slice(index, index + BATCH_SIZE);
  await request("articles?on_conflict=slug", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify(chunk),
  });
  console.log(`Upserted ${Math.min(index + chunk.length, articles.length)}/${articles.length}`);
}

console.log("SEO article import complete");

function buildArticles(existingArticles) {
  const rows = [];
  const seenTitles = new Set(existingArticles.titles);
  const seenSlugs = new Set(existingArticles.slugs);
  let globalIndex = existingArticles.count + 1;

  for (const pool of Object.values(pools)) {
    let poolCount = 0;
    for (const subject of pool.subjects) {
      for (const intent of pool.intents) {
        if (poolCount >= pool.limit || rows.length >= TARGET_COUNT) break;
        const title = titleFor(pool.category, subject, intent);
        const normalizedTitle = normalize(title);
        if (seenTitles.has(normalizedTitle)) continue;
        let slug = slugify(pool.category, title, globalIndex);
        let suffix = 2;
        while (seenSlugs.has(slug)) {
          slug = `${slug}-${suffix}`;
          suffix += 1;
        }
        const article = makeArticle(pool.category, title, slug, globalIndex);
        rows.push(article);
        seenTitles.add(normalizedTitle);
        seenSlugs.add(slug);
        poolCount += 1;
        globalIndex += 1;
      }
      if (poolCount >= pool.limit || rows.length >= TARGET_COUNT) break;
    }
  }

  for (const pool of Object.values(pools)) {
    for (const subject of pool.subjects) {
      for (const intent of longTailIntents) {
        if (rows.length >= TARGET_COUNT) break;
        const title = longTailTitleFor(pool.category, subject, intent);
        const normalizedTitle = normalize(title);
        if (seenTitles.has(normalizedTitle)) continue;
        let slug = slugify(pool.category, title, globalIndex);
        let suffix = 2;
        while (seenSlugs.has(slug)) {
          slug = `${slug}-${suffix}`;
          suffix += 1;
        }
        const article = makeArticle(pool.category, title, slug, globalIndex);
        rows.push(article);
        seenTitles.add(normalizedTitle);
        seenSlugs.add(slug);
        globalIndex += 1;
      }
      if (rows.length >= TARGET_COUNT) break;
    }
    if (rows.length >= TARGET_COUNT) break;
  }

  if (rows.length !== TARGET_COUNT) {
    throw new Error(`Expected ${TARGET_COUNT} articles, got ${rows.length}`);
  }
  return rows;
}

function titleFor(category, subject, intent) {
  if (category === "ทำนายฝัน") return `ฝันเห็น${subject} ${intent}`;
  if (category === "ไพ่ยิปซี") return `ไพ่ ${subject} ${intent}`;
  return `${subject} ${intent}`;
}

function longTailTitleFor(category, subject, intent) {
  const prefix = {
    "ทำนายฝัน": `ฝันเห็น${subject}`,
    "ไพ่ยิปซี": `ความหมายไพ่ ${subject}`,
    "ปาจื้อ": `${subject} ในปาจื้อ`,
    "เลขศาสตร์": `${subject} ในเลขศาสตร์`,
    "ฤกษ์มงคลและฮวงจุ้ย": `${subject}`,
    "12 ราศี": `${subject}`,
    "12 นักษัตร": `${subject}`,
    "ความเชื่อไทย": `${subject}`,
    "เลขเด็ด": `${subject}`,
    "พระประจำวันเกิด": `${subject}`,
  }[category] || subject;
  return `${prefix} ${intent}`;
}

function makeArticle(category, title, slug, index) {
  const description = descriptionFor(category, title);
  const cover = pick(coverImages[category] || coverImages["ความเชื่อไทย"], index);
  const keywords = keywordSet(category, title);
  return {
    slug,
    title,
    excerpt: description,
    category,
    author: "ทีม Likhitfa",
    date: dateFor(index),
    read_min: 7 + (index % 6),
    cover,
    cover_alt: `${title} ภาพประกอบบทความดูดวงและความเชื่อไทย`,
    seo_title: metaTitle(title),
    seo_description: description,
    keywords,
    canonical_url: `${siteUrl}/articles/${slug}`,
    content: contentFor(category, title),
    updated_at: new Date().toISOString(),
  };
}

function descriptionFor(category, title) {
  return `อ่าน${title} สำหรับคนที่ต้องการคำอธิบายด้าน${category} แบบเข้าใจง่าย มีที่มา วิธีนำไปใช้ ข้อควรระวัง และคำถามที่พบบ่อย`;
}

function contentFor(category, title) {
  return [
    "## บทนำ",
    intro(category, title),
    "## ความหมายและที่มา",
    meaning(category, title),
    "## วิธีดูและการนำไปใช้",
    howTo(category, title),
    "## คำแนะนำตามสถานการณ์",
    advice(category, title),
    "## ข้อควรระวัง",
    caution(category, title),
    "## คำถามที่พบบ่อย",
    faq(title),
    "## สรุป",
    summary(category, title),
  ];
}

function intro(category, title) {
  return `${title} เป็นหนึ่งในคำค้นที่คนสนใจเมื่ออยากได้คำตอบเรื่องดวง ความเชื่อ หรือสัญญาณที่เกิดขึ้นในชีวิตประจำวัน บทความนี้เขียนขึ้นสำหรับผู้อ่าน Likhitfa ที่ต้องการข้อมูลอ่านง่าย ไม่ใช้ภาษาตำราจนเกินไป และยังคงเคารพความหมายดั้งเดิมของศาสตร์นั้น ๆ\n\nการอ่านเรื่อง${category}ให้ได้ประโยชน์ควรเริ่มจากความเข้าใจว่า สิ่งเหล่านี้เป็นแนวทางประกอบการตัดสินใจ ไม่ใช่คำตัดสินชีวิตแบบตายตัว หากใช้ด้วยสติ จะช่วยให้เรามองสถานการณ์รอบตัวชัดขึ้น กล้าทบทวนตัวเอง และเลือกทางที่เหมาะกับจังหวะชีวิตมากกว่าเดิม`;
}

function meaning(category, title) {
  const map = {
    "ทำนายฝัน": `ในตำราทำนายฝัน ความฝันมักถูกมองเป็นภาพสะท้อนของอารมณ์ เหตุการณ์ และลางสังหรณ์ที่เชื่อมกับชีวิตจริง ${title} จึงควรอ่านร่วมกับบริบท เช่น ฝันช่วงไหน รู้สึกอย่างไรในฝัน และช่วงนั้นชีวิตกำลังเจอเรื่องอะไรอยู่\n\nความฝันบางอย่างอาจเกี่ยวกับโชคลาภหรือข่าวสาร แต่บางครั้งก็เป็นเพียงสัญญาณให้ระวังคำพูด ความสัมพันธ์ หรือการตัดสินใจ การอ่านที่ดีจึงไม่ควรดูเฉพาะเลข แต่ควรดูคำเตือนและคำแนะนำประกอบด้วย`,
    "ไพ่ยิปซี": `ไพ่ยิปซีเป็นภาษาสัญลักษณ์ที่ช่วยสะท้อนสถานการณ์และความรู้สึกภายใน ${title} ไม่ควรอ่านแบบท่องจำความหมายไพ่เพียงอย่างเดียว แต่ควรดูตำแหน่งคำถาม จังหวะชีวิต และความสัมพันธ์ของไพ่ใบอื่นร่วมกัน\n\nคำทำนายที่ดีไม่ได้บอกให้รอชะตา แต่ช่วยให้เห็นทางเลือกชัดขึ้น หากไพ่ให้คำเตือน ก็ควรใช้เป็นโอกาสปรับวิธีคิดและวิธีลงมือ ไม่ใช่เหตุผลให้กลัวหรือหยุดชีวิต`,
    "ปาจื้อ": `ปาจื้อหรือดวงจีนสี่เสาใช้วัน เดือน ปี และเวลาเกิดมาอ่านธาตุ ดาว และจังหวะชีวิต ${title} จึงเกี่ยวข้องกับการมองโครงสร้างดวงอย่างเป็นระบบ ทั้งเรื่องงาน เงิน ความรัก สุขภาพ และช่วงเวลาที่ควรเดินหน้าหรือระวังตัว\n\nหัวใจของปาจื้อคือความสมดุล ไม่ใช่การตัดสินว่าธาตุใดดีหรือร้ายเสมอไป ธาตุเดียวกันอาจให้ผลต่างกันเมื่ออยู่ในดวงคนละแบบ`,
    "เลขศาสตร์": `เลขศาสตร์มองตัวเลขเป็นสัญลักษณ์ของจังหวะ บุคลิก และแรงส่งบางอย่างในชีวิต ${title} จึงควรอ่านร่วมกับตำแหน่งของเลข เช่น เบอร์โทร เลขบ้าน ทะเบียนรถ หรือวันเกิด\n\nตัวเลขไม่ได้กำหนดทุกอย่าง แต่ช่วยให้สังเกตแนวโน้มได้ดีขึ้น เมื่อเข้าใจความหมายแล้วควรนำไปใช้ร่วมกับความพร้อม ความตั้งใจ และการวางแผนจริง`,
    "ฤกษ์มงคลและฮวงจุ้ย": `ฤกษ์มงคลและฮวงจุ้ยเกี่ยวข้องกับการเลือกจังหวะและจัดสภาพแวดล้อมให้สนับสนุนชีวิต ${title} จึงไม่ใช่แค่พิธีกรรม แต่เป็นการเตรียมความพร้อมทั้งด้านเวลา สถานที่ และใจของผู้ลงมือ\n\nหลักที่ดีคือเลือกสิ่งที่ทำให้ชีวิตเป็นระเบียบขึ้น สบายใจขึ้น และสอดคล้องกับความจริง ไม่ใช่ฝืนทุกอย่างเพื่อให้ตรงความเชื่อเพียงอย่างเดียว`,
    "12 ราศี": `ราศีช่วยให้เข้าใจบุคลิก จุดแข็ง จุดอ่อน และรูปแบบการตัดสินใจของคนแต่ละกลุ่ม ${title} ควรใช้เป็นภาพรวมเพื่อรู้จักตัวเองและคนรอบตัวมากขึ้น ไม่ใช่ใช้ตัดสินว่าใครต้องเป็นแบบใดเสมอไป\n\nเมื่ออ่านราศีร่วมกับประสบการณ์จริง จะช่วยให้เห็นแนวทางพัฒนาตัวเอง การสื่อสาร และการเลือกจังหวะที่เหมาะกับชีวิต`,
    "12 นักษัตร": `นักษัตรเป็นระบบอ่านปีเกิดที่ผูกกับความเชื่อไทยจีน ${title} ใช้ดูบุคลิก ความสัมพันธ์ คู่มิตรคู่ศัตรู และวิธีเสริมดวงตามจังหวะปี\n\nการอ่านนักษัตรควรใช้เป็นแนวทางกว้าง ๆ เพราะชีวิตจริงยังขึ้นอยู่กับวันเวลาเกิด สิ่งแวดล้อม และการตัดสินใจของแต่ละคน`,
    "ความเชื่อไทย": `ความเชื่อไทยจำนวนมากเกิดจากการสังเกตธรรมชาติ พฤติกรรมคน และคำเตือนของผู้ใหญ่ ${title} จึงมีทั้งมิติทางวัฒนธรรมและมิติทางใจ\n\nการอ่านในยุคปัจจุบันควรมองด้วยเหตุผล ไม่จำเป็นต้องเชื่อทุกอย่างแบบตรงตัว แต่สามารถใช้เป็นเครื่องเตือนใจให้รอบคอบและมีสติมากขึ้น`,
    "เลขเด็ด": `เลขเด็ดและสถิติตัวเลขควรอ่านอย่างมีสติ ${title} มีประโยชน์ในแง่การดูข้อมูลย้อนหลัง แนวโน้ม และรูปแบบตัวเลข แต่ไม่ควรถูกใช้เป็นคำรับประกันผลลัพธ์\n\nสิ่งสำคัญคือแยกความบันเทิง ความเชื่อ และการเงินออกจากกัน ใช้ข้อมูลเท่าที่พอดี และไม่เสี่ยงเกินกำลังของตัวเอง`,
    "พระประจำวันเกิด": `พระประจำวันเกิดและของมงคลตามวันเกิดเป็นความเชื่อที่ช่วยให้ผู้คนตั้งจิตและระลึกถึงความดี ${title} จึงควรอ่านในมุมของการสร้างกำลังใจและการดูแลใจมากกว่าการหวังผลแบบทันที\n\nเมื่อใช้ร่วมกับการทำความดี วินัย และความรับผิดชอบ ความเชื่อนี้จะกลายเป็นเครื่องยึดเหนี่ยวที่พอดีและไม่สร้างภาระ`,
  };
  return map[category] || map["ความเชื่อไทย"];
}

function howTo(category, title) {
  return `วิธีนำ ${title} ไปใช้ เริ่มจากตั้งคำถามให้ชัดก่อนว่าเราต้องการคำตอบเรื่องใด เช่น งาน เงิน ความรัก สุขภาพใจ หรือจังหวะการเริ่มต้น จากนั้นค่อยอ่านความหมายร่วมกับสถานการณ์จริง ไม่ควรหยิบคำทำนายเพียงประโยคเดียวมาตัดสินทั้งหมด\n\nถ้าเป็นเรื่องที่เกี่ยวกับการตัดสินใจสำคัญ ให้ใช้ข้อมูลจริงประกอบเสมอ เช่น เอกสาร ตัวเลข เวลา ความพร้อมของคนที่เกี่ยวข้อง และผลกระทบระยะยาว ความเชื่อจะช่วยให้ใจนิ่งขึ้น แต่การลงมืออย่างรอบคอบยังเป็นสิ่งที่ทำให้ผลลัพธ์เกิดขึ้นจริง`;
}

function advice(category, title) {
  return `คำแนะนำสำหรับ ${title} คือให้มองเป็นสัญญาณชวนทบทวนมากกว่าคำสั่งเด็ดขาด หากคำอ่านออกมาดี ให้ใช้เป็นแรงสนับสนุนในการลงมือ หากคำอ่านมีข้อควรระวัง ให้ใช้เป็นโอกาสลดความเสี่ยงและวางแผนให้ละเอียดขึ้น\n\nในด้านความรัก ควรสื่อสารตรงไปตรงมาและไม่ตีความแทนอีกฝ่ายมากเกินไป ด้านงานควรดูจังหวะ ความพร้อม และข้อมูลจริง ส่วนเรื่องเงินควรใช้ความรอบคอบมากกว่าความหวัง เพราะความมงคลที่ดีที่สุดคือการไม่ประมาท`;
}

function caution(category, title) {
  return `ข้อควรระวังคืออย่าใช้ ${title} เพื่อสร้างความกลัวหรือกดดันตัวเอง ความเชื่อทุกแขนงมีคุณค่าเมื่อทำให้เรามีสติ แต่จะกลายเป็นภาระทันทีถ้าใช้แทนเหตุผลทั้งหมด\n\nหากบทความนี้เกี่ยวกับเลขหรือโชคลาภ ควรใช้เพื่อความบันเทิงและการศึกษาเท่านั้น ไม่ควรใช้เงินเกินกำลัง หากเกี่ยวกับสุขภาพ กฎหมาย หรือการเงินสำคัญ ควรปรึกษาผู้เชี่ยวชาญที่เกี่ยวข้องเสมอ`;
}

function faq(title) {
  return `### 1. ${title} ใช้ดูดวงได้จริงไหม?\nใช้เป็นแนวทางประกอบการสังเกตชีวิตได้ แต่ไม่ควรใช้แทนการตัดสินใจด้วยข้อมูลจริง\n\n### 2. ถ้าคำทำนายไม่ดีควรทำอย่างไร?\nให้ดูว่าเป็นคำเตือนเรื่องใด แล้วปรับพฤติกรรมหรือวางแผนให้รอบคอบขึ้น ไม่จำเป็นต้องตกใจ\n\n### 3. ต้องทำตามทุกคำแนะนำไหม?\nไม่จำเป็น เลือกเฉพาะสิ่งที่เหมาะกับชีวิตจริงและไม่สร้างภาระให้ตัวเอง\n\n### 4. อ่านบ่อยแค่ไหนถึงจะพอดี?\nอ่านเมื่อมีเรื่องต้องทบทวนหรืออยากหาแนวทางก็พอ ไม่ควรอ่านซ้ำจนสับสน\n\n### 5. ใช้ร่วมกับศาสตร์อื่นได้ไหม?\nใช้ร่วมกันได้ เช่น ดูราศีร่วมกับไพ่ หรือดูเลขร่วมกับฤกษ์ แต่ควรใช้เพื่อเสริมมุมมอง ไม่ใช่เพิ่มความกังวล`;
}

function summary(category, title) {
  return `${title} เป็นหัวข้อที่เหมาะกับคนอยากเข้าใจ${category}ในมุมที่ใช้งานได้จริง อ่านเพื่อรู้เท่าทันสถานการณ์ วางแผน และดูแลใจตัวเองให้มั่นคงขึ้น\n\nสิ่งสำคัญที่สุดคือใช้ความเชื่ออย่างมีสติ ให้คำทำนายเป็นเหมือนแผนที่ประกอบการเดินทาง ไม่ใช่กรงที่ปิดกั้นชีวิต เมื่อเราใช้เหตุผล ความพอดี และการลงมือทำควบคู่กัน ความมงคลจะค่อย ๆ เกิดจากวิธีใช้ชีวิตของเราเอง`;
}

function keywordSet(category, title) {
  const shared = ["Likhitfa", "ดูดวงออนไลน์", "เสริมดวง", "ความเชื่อไทย"];
  const byCategory = {
    "ทำนายฝัน": ["ทำนายฝัน", "ฝันเห็น", "เลขเด็ดความฝัน", "คำทำนายฝัน", "ฝันดีฝันร้าย"],
    "ไพ่ยิปซี": ["ไพ่ยิปซี", "ความหมายไพ่", "ดูดวงไพ่ยิปซี", "ไพ่กลับหัว", "ไพ่ทาโรต์"],
    "ปาจื้อ": ["ปาจื้อ", "ดวงจีน", "สี่เสา", "Day Master", "ธาตุจีน"],
    "เลขศาสตร์": ["เลขศาสตร์", "เลขมงคล", "เบอร์มงคล", "ความหมายตัวเลข", "เลขเสริมดวง"],
    "ฤกษ์มงคลและฮวงจุ้ย": ["ฤกษ์มงคล", "ฮวงจุ้ย", "จัดบ้าน", "ของมงคล", "สีมงคล"],
    "12 ราศี": ["ราศี", "12 ราศี", "ดวงราศี", "นิสัยตามราศี", "สีมงคลราศี"],
    "12 นักษัตร": ["นักษัตร", "12 นักษัตร", "ปีเกิด", "ดวงจีนไทย", "คู่มิตรคู่ศัตรู"],
    "ความเชื่อไทย": ["ความเชื่อไทย", "ตำราโบราณ", "ลางบอกเหตุ", "ภูมิปัญญาไทย", "ข้อห้ามไทย"],
    "เลขเด็ด": ["เลขเด็ด", "หวยไทย", "สถิติหวย", "ผลรางวัล", "วิเคราะห์เลข"],
    "พระประจำวันเกิด": ["พระประจำวันเกิด", "วันเกิด", "คาถาประจำวันเกิด", "สีมงคล", "ของมงคล"],
  };
  return Array.from(new Set([title, ...(byCategory[category] || []), ...shared])).slice(0, 10);
}

function metaTitle(title) {
  const value = `${title} | Likhitfa`;
  return value.length <= 60 ? value : `${title.slice(0, 47)}… | Likhitfa`;
}

function slugify(category, title, index) {
  const key = {
    "ทำนายฝัน": "dream",
    "ไพ่ยิปซี": "tarot",
    "ปาจื้อ": "bazi",
    "เลขศาสตร์": "numerology",
    "ฤกษ์มงคลและฮวงจุ้ย": "auspicious",
    "12 ราศี": "zodiac",
    "12 นักษัตร": "chinese-zodiac",
    "ความเชื่อไทย": "thai-belief",
    "เลขเด็ด": "lottery",
    "พระประจำวันเกิด": "birth-buddha",
  }[category] || "article";
  return `seo-${key}-${hashText(title).toString(36)}-${String(index).padStart(4, "0")}`;
}

function dateFor(index) {
  const date = new Date("2026-06-12T00:00:00.000Z");
  date.setUTCDate(date.getUTCDate() - (index % 120));
  return date.toISOString().slice(0, 10);
}

function pick(items, index) {
  return items[index % items.length];
}

function countByCategory(rows) {
  return rows.reduce((counts, row) => {
    counts[row.category] = (counts[row.category] || 0) + 1;
    return counts;
  }, {});
}

function normalize(value) {
  return String(value || "").replace(/\s+/g, " ").trim().toLowerCase();
}

function hashText(text) {
  let hash = 2166136261;
  for (const char of text) {
    hash ^= char.codePointAt(0);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash;
}

async function loadExistingArticles() {
  const titles = new Set();
  const slugs = new Set();
  let offset = 0;

  while (true) {
    const rows = await request(`articles?select=slug,title&limit=1000&offset=${offset}&order=slug.asc`);
    if (!Array.isArray(rows) || rows.length === 0) break;
    for (const row of rows) {
      if (row?.title) titles.add(normalize(row.title));
      if (row?.slug) slugs.add(row.slug);
    }
    if (rows.length < 1000) break;
    offset += rows.length;
  }

  console.log(`Loaded ${titles.size} existing article titles`);
  return { titles, slugs, count: titles.size };
}

async function request(path, options = {}) {
  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    method: options.method || "GET",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    },
    body: options.body,
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Supabase request failed ${response.status}: ${detail}`);
  }

  if (response.status === 204) return null;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

async function loadLocalEnv() {
  try {
    const text = await readFile(new URL("../.env.local", import.meta.url), "utf8");
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
      const [key, ...rest] = trimmed.split("=");
      if (!process.env[key]) process.env[key] = rest.join("=").replace(/^"|"$/g, "");
    }
  } catch {
    // Vercel/CI can provide env directly.
  }
}
