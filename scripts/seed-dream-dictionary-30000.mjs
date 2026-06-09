import { readFile } from "node:fs/promises";

const TARGET_COUNT = 30000;
const BATCH_SIZE = 500;
const dryRun = process.argv.includes("--dry-run");

await loadLocalEnv();

const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || "";

if (!supabaseUrl || !serviceKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

const categories = [
  {
    name: "สัตว์",
    tone: "สัญชาตญาณ ความสัมพันธ์ และแรงสนับสนุนจากคนรอบตัว",
    roots:
      "งู นก ปลา แมว สุนัข เสือ สิงโต ช้าง ม้า วัว ควาย หมู ไก่ เป็ด ห่าน หนู กระต่าย ลิง กบ คางคก จระเข้ เต่า ปู กุ้ง หอย ผึ้ง ต่อ มด แมงมุม ผีเสื้อ แมลงปอ นกฮูก นกยูง หงส์ มังกร กิเลน พญานาค จิ้งจก ตุ๊กแก ค้างคาว กวาง แพะ แกะ หมาป่า โลมา วาฬ ฉลาม".split(" "),
  },
  {
    name: "คนและครอบครัว",
    tone: "ความผูกพัน ข่าวสาร ผู้ใหญ่ และบทบาทของคนใกล้ตัว",
    roots:
      "พ่อ แม่ ลูก พี่ น้อง ญาติ ปู่ ย่า ตา ยาย ลุง ป้า น้า อา เพื่อน คนรัก แฟน คู่ครอง ครู อาจารย์ เจ้านาย ลูกน้อง พระสงฆ์ เณร หมอ พยาบาล ตำรวจ ทหาร นักเรียน เด็กทารก คนแก่ เจ้าสาว เจ้าบ่าว แขก คนแปลกหน้า ดารา นักร้อง พระราชา ราชินี เศรษฐี คนจน".split(" "),
  },
  {
    name: "ร่างกาย",
    tone: "สุขภาพ ความมั่นใจ การเปลี่ยนแปลง และเรื่องในครอบครัว",
    roots:
      "ฟัน ผม ตา หู ปาก จมูก หน้า มือ เท้า แขน ขา หัวใจ เลือด กระดูก เล็บ ผิวหนัง ท้อง หลัง ไหล่ คอ ลิ้น น้ำตา เหงื่อ แผล ไข้ ป่วย หายป่วย ตั้งครรภ์ คลอดลูก เดิน วิ่ง ล้ม บิน ว่ายน้ำ อาบน้ำ แต่งตัว ส่องกระจก".split(" "),
  },
  {
    name: "ธรรมชาติ",
    tone: "จังหวะชีวิต โอกาส การเติบโต และการปล่อยวาง",
    roots:
      "น้ำ ฝน ลม ไฟ ดิน ภูเขา ทะเล แม่น้ำ น้ำตก ท้องฟ้า เมฆ หมอก ดาว เดือน พระจันทร์ พระอาทิตย์ รุ้ง พายุ ฟ้าร้อง ฟ้าผ่า แผ่นดินไหว ป่า ต้นไม้ ดอกไม้ ใบไม้ ผลไม้ ข้าว หิมะ น้ำแข็ง บ่อน้ำ สระน้ำ น้ำท่วม คลื่น เกาะ ถ้ำ หาดทราย".split(" "),
  },
  {
    name: "สิ่งของและทรัพย์",
    tone: "การเงิน เครื่องมือ โอกาส และสิ่งที่ต้องจัดการให้เป็นระบบ",
    roots:
      "ทอง เงิน แหวน สร้อย กำไล นาฬิกา กระเป๋า รองเท้า เสื้อผ้า หมวก แว่นตา หนังสือ ปากกา โทรศัพท์ คอมพิวเตอร์ กุญแจ ประตู หน้าต่าง บ้าน โต๊ะ เก้าอี้ เตียง หมอน ผ้าห่ม กระจก มีด ดาบ ปืน ธนู เชือก เทียน ธูป โคมไฟ แจกัน จดหมาย เอกสาร บัตร กระดิ่ง ระฆัง".split(" "),
  },
  {
    name: "สถานที่",
    tone: "พื้นที่ชีวิต การเดินทาง หน้าที่ และคนที่เกี่ยวข้องกับสังคม",
    roots:
      "บ้าน วัด โรงเรียน โรงพยาบาล ตลาด ห้าง ร้านอาหาร โรงแรม สนามบิน สถานีรถไฟ ท่าเรือ ถนน สะพาน ป่าเขา ทุ่งนา สวน สุสาน ศาลเจ้า โบสถ์ ห้องน้ำ ห้องครัว ห้องนอน ห้องทำงาน ห้องประชุม ธนาคาร สำนักงาน โรงงาน คุก วัง ปราสาท เมืองเก่า ต่างประเทศ".split(" "),
  },
  {
    name: "เหตุการณ์",
    tone: "สัญญาณการเปลี่ยนจังหวะ การตัดสินใจ และการเริ่มต้นรอบใหม่",
    roots:
      "งานแต่ง งานศพ งานบวช งานเลี้ยง สอบ ประชุม เดินทาง หลงทาง ย้ายบ้าน ซื้อบ้าน ขายของ ได้เงิน เสียเงิน ทะเลาะ ร้องไห้ หัวเราะ ตกจากที่สูง ถูกไล่ตาม หนีไฟ ถูกจับ ได้ของหาย พบของเก่า เปิดประตู ปิดประตู รับรางวัล ถูกหวย ขึ้นเขา ลงเรือ ขึ้นรถ".split(" "),
  },
  {
    name: "สิ่งลี้ลับและมงคล",
    tone: "ลางสังหรณ์ บุญเก่า การคุ้มครอง และสิ่งที่ควรตั้งสติรับฟัง",
    roots:
      "ผี วิญญาณ เทวดา นางฟ้า ยักษ์ พญานาค มังกร กุมาร พระเครื่อง ยันต์ ตะกรุด ศาลพระภูมิ พระพุทธรูป เจ้าแม่ กวนอิม พระพิฆเนศ ฮวงซุ้ย ธูป เทียน คาถา เครื่องราง ดาวตก แสงทอง ระฆังสวรรค์ ประตูฟ้า บันไดสวรรค์ ฤาษี".split(" "),
  },
  {
    name: "อาหาร",
    tone: "ความอุดมสมบูรณ์ การแบ่งปัน และสิ่งที่หล่อเลี้ยงชีวิต",
    roots:
      "ข้าว ขนม น้ำชา กาแฟ นม น้ำผึ้ง ผลไม้ กล้วย มะพร้าว ส้ม ทุเรียน มะม่วง แตงโม ขนมหวาน อาหารเจ ปลาเผา ไก่ต้ม หม้อไฟ ซุป ข้าวต้ม ก๋วยเตี๋ยว ขนมจีน ไข่ น้ำปลา เกลือ น้ำตาล พริก กระเทียม หอมแดง".split(" "),
  },
  {
    name: "ยานพาหนะ",
    tone: "ทิศทางชีวิต ความเร็ว การเดินทาง และการควบคุมสถานการณ์",
    roots:
      "รถ รถยนต์ รถไฟ รถเมล์ รถตู้ รถบรรทุก เรือ เครื่องบิน จักรยาน มอเตอร์ไซค์ เกวียน รถม้า เรือสำเภา เรือหางยาว เรือดำน้ำ บอลลูน ลิฟต์ บันไดเลื่อน รถเข็น รถตำรวจ รถพยาบาล รถดับเพลิง".split(" "),
  },
];

const rareLetterRoots =
  "กบ ขวด ฃวดโบราณ คน ฅนโบราณ ฆ้อง งู จาน ฉัตร ช้าง ซอง ฌาปนกิจ ญาติ ฎีกา ฏักแตน ฐาน ฑูต ฒผู้เฒ่า ณเณร ดอกไม้ ต้นไม้ ถ้ำ ทอง ธูป นก บันได ปลา ผี ฝน พ่อ ฟัน ภูเขา ม้า ยักษ์ รถ ลิง วัด ศาล สุนัข หงส์ ฬาจุฬา อ่าง ฮวงซุ้ย".split(" ");

const modifiers = [
  "",
  "ใหญ่",
  "เล็ก",
  "สีขาว",
  "สีดำ",
  "สีทอง",
  "สีแดง",
  "สีเขียว",
  "เก่า",
  "ใหม่",
  "แตก",
  "หาย",
  "หลายตัว",
  "คู่หนึ่ง",
  "เต็มบ้าน",
  "กลางคืน",
  "กลางวัน",
  "ในน้ำ",
  "บนฟ้า",
  "หน้าบ้าน",
  "หลังบ้าน",
  "ในห้อง",
  "ข้างทาง",
  "โบราณ",
  "สวยงาม",
  "น่ากลัว",
];

const actions = [
  "เดินเข้ามา",
  "อยู่ใกล้ตัว",
  "หายไป",
  "แตกหัก",
  "ได้รับมา",
  "ให้คนอื่น",
  "ถูกขโมย",
  "ลอยอยู่",
  "ตกลงมา",
  "ส่งเสียง",
  "ส่องแสง",
  "เปลี่ยนสี",
  "กลับมาอีกครั้ง",
  "อยู่ในบ้าน",
  "อยู่หน้าประตู",
  "อยู่บนโต๊ะ",
  "อยู่กลางถนน",
  "กำลังตามหา",
  "เจอโดยบังเอิญ",
  "ถือไว้ในมือ",
];

const times = [
  "เช้ามืด",
  "ช่วงเช้า",
  "กลางวัน",
  "เย็น",
  "หัวค่ำ",
  "กลางคืน",
  "ก่อนตื่น",
  "หลังเที่ยงคืน",
];

const cautions = [
  "หลีกเลี่ยงการตัดสินใจด้วยอารมณ์",
  "ตรวจเอกสารและตัวเลขก่อนตกลง",
  "อย่ารับปากแทนผู้อื่นถ้ายังไม่มั่นใจ",
  "พักผ่อนให้พอและลดความกังวลเกินจำเป็น",
  "เก็บหลักฐานการเงินหรือข้อความสำคัญไว้เสมอ",
  "ใช้คำพูดให้นุ่มนวลกับคนใกล้ตัว",
];

const advices = [
  "ทำบุญด้วยน้ำดื่มหรืออาหารแห้ง แล้วตั้งใจอุทิศส่วนกุศล",
  "จัดบ้านและโต๊ะทำงานให้โล่ง เพื่อเปิดทางให้เรื่องใหม่เข้ามา",
  "สวดมนต์สั้น ๆ ก่อนนอน และตั้งใจปล่อยความกังวลออกจากใจ",
  "ทำทานตามกำลัง โดยไม่ต้องประกาศให้ใครรู้",
  "โทรถามไถ่ผู้ใหญ่หรือคนในครอบครัวที่ไม่ได้คุยนาน",
  "เขียนสิ่งที่กังวลลงกระดาษ แล้วค่อยแยกเรื่องที่ควบคุมได้",
];

function hash(value) {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pick(list, seed) {
  return list[seed % list.length];
}

function numbersFor(keyword) {
  const base = hash(keyword);
  const a = base % 100;
  const b = Math.floor(base / 100) % 100;
  const c = Math.floor(base / 10000) % 100;
  const two = [a, b, c].map((n) => String(n).padStart(2, "0"));
  const three = String(base % 1000).padStart(3, "0");
  return [...new Set([...two, three])].join(", ");
}

function cleanKeyword(root, modifier, action) {
  return [root, modifier, action].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
}

function rowFor(index, category, root, modifier, action) {
  const keyword = cleanKeyword(root, modifier, action);
  const seed = hash(`${category.name}:${keyword}`);
  const time = pick(times, seed);
  const caution = pick(cautions, seed >>> 3);
  const advice = pick(advices, seed >>> 7);
  const direction =
    seed % 3 === 0
      ? "มีเกณฑ์ได้ข่าวหรือโอกาสเล็ก ๆ ที่ควรรีบจัดให้เป็นระบบ"
      : seed % 3 === 1
        ? "เรื่องที่ค้างอยู่จะค่อย ๆ ชัดขึ้น หากใช้ข้อมูลจริงประกอบการตัดสินใจ"
        : "เหมาะกับการทบทวนจังหวะชีวิตและเลือกเดินอย่างรอบคอบ";
  return {
    id: `dream-th-${String(index).padStart(5, "0")}`,
    keyword,
    letter: keyword.charAt(0),
    category: category.name,
    meaning: `ฝันเห็น${keyword} ตามตำราฝันไทยมักโยงกับ${category.tone} โดยภาพฝันนี้สื่อว่า${direction} จุดที่ควรระวังคือ${caution} คำทำนายนี้เป็นแนวทางให้สังเกตสัญญาณรอบตัว ไม่ควรใช้แทนการตัดสินใจสำคัญเพียงอย่างเดียว`,
    numbers: numbersFor(keyword),
    time,
    advice,
  };
}

function buildRows() {
  const rows = [];
  const seen = new Set();

  for (const root of rareLetterRoots) {
    const category = categories.find((item) => item.roots.includes(root)) || categories[0];
    const row = rowFor(rows.length + 1, category, root, "", "");
    rows.push(row);
    seen.add(row.keyword);
  }

  outer: for (const category of categories) {
    for (const root of category.roots) {
      for (const modifier of modifiers) {
        for (const action of actions) {
          const keyword = cleanKeyword(root, modifier, action);
          if (!keyword || seen.has(keyword)) continue;
          seen.add(keyword);
          rows.push(rowFor(rows.length + 1, category, root, modifier, action));
          if (rows.length >= TARGET_COUNT) break outer;
        }
      }
    }
  }

  if (rows.length < TARGET_COUNT) {
    throw new Error(`Generated only ${rows.length} dreams`);
  }
  return rows;
}

async function request(path, options = {}) {
  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Supabase request failed ${response.status}: ${detail}`);
  }
  return response;
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
    // CI/Vercel can provide env directly.
  }
}

const rows = buildRows();
console.log(`Generated ${rows.length} Thai dream dictionary rows`);

if (dryRun) {
  console.log(JSON.stringify({ first: rows[0], last: rows.at(-1) }, null, 2));
  process.exit(0);
}

await request("dreams?id=like.dream-th-*", { method: "DELETE" });
await request("dreams?id=like.dream-dict-*", { method: "DELETE" });

for (let index = 0; index < rows.length; index += BATCH_SIZE) {
  const chunk = rows.slice(index, index + BATCH_SIZE);
  await request("dreams?on_conflict=id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify(chunk),
  });
  console.log(`Imported ${Math.min(index + chunk.length, rows.length)}/${rows.length}`);
}

console.log("Dream dictionary import complete");
