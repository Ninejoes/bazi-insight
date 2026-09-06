export interface ColorItem {
  name: string;
  hex: string;
  secondaryHex?: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
}

export interface DayLuckyColors {
  dayIndex: number; // 0 = Sunday, 1 = Monday, ... 6 = Saturday
  dayName: string;
  dayNameCn: string;
  dayColor: string;
  planet: string;
  element: string;
  categories: {
    work: { title: "การงานก้าวหน้า"; colors: ColorItem[]; description: string };
    wealth: { title: "โชคลาภเงินทอง"; colors: ColorItem[]; description: string };
    love: { title: "ความรักเสน่ห์"; colors: ColorItem[]; description: string };
    power: { title: "อำนาจบารมี เมตตา"; colors: ColorItem[]; description: string };
    inauspicious: { title: "กาลกิณี (ห้ามใส่)"; colors: ColorItem[]; description: string };
  };
  gemstones: string[];
  jewelry: string;
  dressingTip: string;
}

export const LUCKY_COLORS_WEEK: DayLuckyColors[] = [
  {
    dayIndex: 0,
    dayName: "วันอาทิตย์",
    dayNameCn: "星期日 · 太阳",
    dayColor: "แดง",
    planet: "พระอาทิตย์ (สุริยะ)",
    element: "ธาตุไฟ",
    categories: {
      work: {
        title: "การงานก้าวหน้า",
        colors: [
          { name: "สีส้ม / สีแสด", hex: "#f97316", bgClass: "bg-orange-500", borderClass: "border-orange-500/40", textClass: "text-orange-400" },
          { name: "สีเทา / สีควันบุหรี่", hex: "#64748b", bgClass: "bg-slate-500", borderClass: "border-slate-500/40", textClass: "text-slate-300" },
        ],
        description: "ช่วยเสริมความกระตือรือร้น ไอเดียสร้างสรรค์ ผู้ใหญ่เห็นผลงานชัดเจน",
      },
      wealth: {
        title: "โชคลาภเงินทอง",
        colors: [
          { name: "สีเขียวเหนี่ยวทรัพย์", hex: "#10b981", bgClass: "bg-emerald-500", borderClass: "border-emerald-500/40", textClass: "text-emerald-400" },
          { name: "สีเขียวมะกอก", hex: "#65a30d", bgClass: "bg-lime-600", borderClass: "border-lime-600/40", textClass: "text-lime-400" },
        ],
        description: "ดึงดูดกระแสเงินสด ลูกค้าคล่องตัว โชคลาภก้อนโต",
      },
      love: {
        title: "ความรักเสน่ห์",
        colors: [
          { name: "สีเขียวพาสเทล", hex: "#34d399", bgClass: "bg-emerald-400", borderClass: "border-emerald-400/40", textClass: "text-emerald-300" },
          { name: "สีดำ / สีเทาเข้ม", hex: "#334155", bgClass: "bg-slate-700", borderClass: "border-slate-700/40", textClass: "text-slate-300" },
        ],
        description: "เพิ่มความน่าดึงดูด พูดจามีเสน่ห์ คนรักเอาใจใส่",
      },
      power: {
        title: "อำนาจบารมี เมตตา",
        colors: [
          { name: "สีแดงทับทิม", hex: "#ef4444", bgClass: "bg-red-500", borderClass: "border-red-500/40", textClass: "text-red-400" },
          { name: "สีชมพูกลีบบัว", hex: "#ec4899", bgClass: "bg-pink-500", borderClass: "border-pink-500/40", textClass: "text-pink-400" },
        ],
        description: "ลูกน้องเกรงใจ ผู้ใหญ่อุปถัมภ์ช่วยเหลือยามติดขัด",
      },
      inauspicious: {
        title: "กาลกิณี (ห้ามใส่)",
        colors: [
          { name: "สีน้ำเงิน / สีฟ้าคราม", hex: "#2563eb", bgClass: "bg-blue-600", borderClass: "border-blue-600/40", textClass: "text-blue-400" },
        ],
        description: "อาจมีอุปสรรคติดขัด เจรจาล่าช้า เสียอารมณ์ง่าย",
      },
    },
    gemstones: ["ทับทิม (Ruby)", "โกเมนเอกเทศ", "อำพันสีส้ม"],
    jewelry: "เครื่องประดับทองคำแท้หรือทองคำขาว เพิ่มพลังงานธาตุไฟ",
    dressingTip: "เน้นเสื้อผ้าโทนสว่าง มีสีเขียวหรือส้มเป็นจุดเด่น เช่น เนกไท ผ้าพันคอ หรือกระเป๋า",
  },
  {
    dayIndex: 1,
    dayName: "วันจันทร์",
    dayNameCn: "星期一 · 太阴",
    dayColor: "เหลือง",
    planet: "พระจันทร์ (จันทรา)",
    element: "ธาตุดิน/น้ำ",
    categories: {
      work: {
        title: "การงานก้าวหน้า",
        colors: [
          { name: "สีเทาเงิน / ควันบุหรี่", hex: "#94a3b8", bgClass: "bg-slate-400", borderClass: "border-slate-400/40", textClass: "text-slate-300" },
          { name: "สีฟ้าอ่อน", hex: "#38bdf8", bgClass: "bg-sky-400", borderClass: "border-sky-400/40", textClass: "text-sky-300" },
        ],
        description: "ประสานงานราบรื่น ลดความขัดแย้ง งานโปรเจกต์ผ่านฉลุย",
      },
      wealth: {
        title: "โชคลาภเงินทอง",
        colors: [
          { name: "สีม่วงเข้ม / สีม่วงเปลือกมังคุด", hex: "#8b5cf6", bgClass: "bg-purple-500", borderClass: "border-purple-500/40", textClass: "text-purple-300" },
          { name: "สีดำเงา", hex: "#1e293b", bgClass: "bg-slate-800", borderClass: "border-slate-800/40", textClass: "text-slate-200" },
        ],
        description: "เรียกทรัพย์ก้อนใหญ่ รับเงินปันผลหรือผลตอบแทนจากการลงทุน",
      },
      love: {
        title: "ความรักเสน่ห์",
        colors: [
          { name: "สีฟ้า / สีน้ำเงินสด", hex: "#0284c7", bgClass: "bg-sky-600", borderClass: "border-sky-600/40", textClass: "text-sky-300" },
          { name: "สีขาวไข่มุก", hex: "#f8fafc", bgClass: "bg-slate-100", borderClass: "border-slate-300/40", textClass: "text-slate-800" },
        ],
        description: "ดูอบอุ่น น่าเข้าหา คนโสดมีเกณฑ์คนเข้ามาทักทาย",
      },
      power: {
        title: "อำนาจบารมี เมตตา",
        colors: [
          { name: "สีเขียวมรกต", hex: "#059669", bgClass: "bg-emerald-600", borderClass: "border-emerald-600/40", textClass: "text-emerald-300" },
        ],
        description: "เสริมความน่าเชื่อถือ คำพูดมีน้ำหนัก",
      },
      inauspicious: {
        title: "กาลกิณี (ห้ามใส่)",
        colors: [
          { name: "สีแดงสด / สีเลือดหมู", hex: "#dc2626", bgClass: "bg-red-600", borderClass: "border-red-600/40", textClass: "text-red-400" },
        ],
        description: "ทำให้ใจร้อน เสียสมาธิ มีเรื่องกวนใจกะทันหัน",
      },
    },
    gemstones: ["มุกดาหาร (Moonstone)", "ไข่มุกแท้", "อเมทิสต์ (Amethyst)"],
    jewelry: "เครื่องประดับเงินแท้หรือมุก เสริมความอ่อนโยนสง่างาม",
    dressingTip: "ใส่โทนสีสุภาพ ครีม ขาว ตัดด้วยสีม่วงอ่อนหรือฟ้าคราม",
  },
  {
    dayIndex: 2,
    dayName: "วันอังคาร",
    dayNameCn: "星期二 · 荧惑",
    dayColor: "ชมพู",
    planet: "พระอังคาร",
    element: "ธาตุลม/ไฟ",
    categories: {
      work: {
        title: "การงานก้าวหน้า",
        colors: [
          { name: "สีน้ำเงินเข้ม / กรมท่า", hex: "#1e3a8a", bgClass: "bg-blue-900", borderClass: "border-blue-700/40", textClass: "text-blue-300" },
          { name: "สีฟ้าคราม", hex: "#0284c7", bgClass: "bg-sky-600", borderClass: "border-sky-600/40", textClass: "text-sky-300" },
        ],
        description: "มีความมั่นใจ การตัดสินใจเด็ดขาด เจรจาต่อรองชนะ",
      },
      wealth: {
        title: "โชคลาภเงินทอง",
        colors: [
          { name: "สีส้มแสด", hex: "#ea580c", bgClass: "bg-orange-600", borderClass: "border-orange-600/40", textClass: "text-orange-300" },
          { name: "สีทอง / มัสตาร์ด", hex: "#d97706", bgClass: "bg-amber-600", borderClass: "border-amber-600/40", textClass: "text-amber-300" },
        ],
        description: "เงินสะพัด ลาภลอยจากการเสี่ยงโชค หรือค้าขายกำไรดี",
      },
      love: {
        title: "ความรักเสน่ห์",
        colors: [
          { name: "สีชมพูบานเย็น", hex: "#db2777", bgClass: "bg-pink-600", borderClass: "border-pink-600/40", textClass: "text-pink-300" },
          { name: "สีแดงเบอร์กันดี", hex: "#991b1b", bgClass: "bg-red-800", borderClass: "border-red-800/40", textClass: "text-red-300" },
        ],
        description: "เสริมความรักเร่าร้อน มั่นคง ความสัมพันธ์มีชีวิตชีวา",
      },
      power: {
        title: "อำนาจบารมี เมตตา",
        colors: [
          { name: "สีม่วงคราม", hex: "#7c3aed", bgClass: "bg-violet-600", borderClass: "border-violet-600/40", textClass: "text-violet-300" },
        ],
        description: "ควบคุมลูกทีมได้ราบรื่น มีอำนาจในการสั่งการ",
      },
      inauspicious: {
        title: "กาลกิณี (ห้ามใส่)",
        colors: [
          { name: "สีเหลืองสด / สีขาวล้วน", hex: "#eab308", bgClass: "bg-yellow-500", borderClass: "border-yellow-500/40", textClass: "text-yellow-400" },
        ],
        description: "อาจถูกเอาเปรียบ ขัดแข้งขัดขา การเงินรั่วไหล",
      },
    },
    gemstones: ["โกเมนสีส้ม (Spessartite)", "โรสควอตซ์ (Rose Quartz)", "คาร์เนเลียน"],
    jewelry: "เครื่องประดับโรสโกลด์ (Rose Gold) หรือทองคำ เสริมเสน่ห์",
    dressingTip: "ใส่โทนสีชมพูร่วมกับกางเกง/กระโปรงสีกรมท่า เพิ่มความน่าเชื่อถือ",
  },
  {
    dayIndex: 3,
    dayName: "วันพุธ",
    dayNameCn: "星期三 · 辰星",
    dayColor: "เขียว",
    planet: "พระพุธ",
    element: "ธาตุน้ำ/ไม้",
    categories: {
      work: {
        title: "การงานก้าวหน้า",
        colors: [
          { name: "สีส้มสด / สีแสด", hex: "#f97316", bgClass: "bg-orange-500", borderClass: "border-orange-500/40", textClass: "text-orange-400" },
          { name: "สีทองคำ", hex: "#ca8a04", bgClass: "bg-yellow-600", borderClass: "border-yellow-600/40", textClass: "text-yellow-300" },
        ],
        description: "วาจาศักดิ์สิทธิ์ เจรจาปิดการขายง่าย ลูกค้าเชื่อมั่น",
      },
      wealth: {
        title: "โชคลาภเงินทอง",
        colors: [
          { name: "สีดำสนิท", hex: "#0f172a", bgClass: "bg-slate-900", borderClass: "border-slate-700/40", textClass: "text-slate-200" },
          { name: "สีเทาชาร์โคล", hex: "#334155", bgClass: "bg-slate-700", borderClass: "border-slate-700/40", textClass: "text-slate-300" },
        ],
        description: "เงินทองไหลมาเทมา ทรัพย์สินงอกเงย มีโชคเรื่องอสังหาฯ",
      },
      love: {
        title: "ความรักเสน่ห์",
        colors: [
          { name: "สีเขียวเหนี่ยวใจ", hex: "#16a34a", bgClass: "bg-green-600", borderClass: "border-green-600/40", textClass: "text-green-300" },
          { name: "สีเหลืองมัสตาร์ด", hex: "#d97706", bgClass: "bg-amber-600", borderClass: "border-amber-600/40", textClass: "text-amber-300" },
        ],
        description: "คนโสดพบคนถูกใจ คู่รักเข้าใจกันลึกซึ้งยิ่งขึ้น",
      },
      power: {
        title: "อำนาจบารมี เมตตา",
        colors: [
          { name: "สีเขียวใบตอง", hex: "#22c55e", bgClass: "bg-green-500", borderClass: "border-green-500/40", textClass: "text-green-400" },
        ],
        description: "เข้าหาผู้ใหญ่ได้รับความเอ็นดู มีคนคอยหนุนหลัง",
      },
      inauspicious: {
        title: "กาลกิณี (ห้ามใส่)",
        colors: [
          { name: "สีชมพูสด / สีบานเย็น", hex: "#ec4899", bgClass: "bg-pink-500", borderClass: "border-pink-500/40", textClass: "text-pink-400" },
        ],
        description: "การสื่อสารผิดพลาด เกิดความเข้าใจผิด เอกสารมีปัญหา",
      },
    },
    gemstones: ["มรกต (Emerald)", "หยกพม่า (Jade)", "เพริดอต (Peridot)"],
    jewelry: "หยกเขียว หรือเครื่องประดับเงินรมดำ ช่วยกักเก็บพลังงานโชคลาภ",
    dressingTip: "ใส่โทนเขียวธรรมชาติ หรือดำ-เทาเพื่อเรียกทรัพย์",
  },
  {
    dayIndex: 4,
    dayName: "วันพฤหัสบดี",
    dayNameCn: "星期四 · 岁星",
    dayColor: "ส้ม",
    planet: "พระพฤหัสบดี (ครู)",
    element: "ธาตุดิน/ไม้",
    categories: {
      work: {
        title: "การงานก้าวหน้า",
        colors: [
          { name: "สีขาว / ครีมงาช้าง", hex: "#f1f5f9", bgClass: "bg-slate-100", borderClass: "border-slate-300/40", textClass: "text-slate-800" },
          { name: "สีฟ้าทะเล", hex: "#06b6d4", bgClass: "bg-cyan-500", borderClass: "border-cyan-500/40", textClass: "text-cyan-400" },
        ],
        description: "สติปัญญาเฉียบแหลม ทำงานสำคัญสำเร็จลุล่วง มีผลงานโดดเด่น",
      },
      wealth: {
        title: "โชคลาภเงินทอง",
        colors: [
          { name: "สีแดงสด / สีทับทิม", hex: "#dc2626", bgClass: "bg-red-600", borderClass: "border-red-600/40", textClass: "text-red-400" },
          { name: "สีส้มสดใส", hex: "#ea580c", bgClass: "bg-orange-600", borderClass: "border-orange-600/40", textClass: "text-orange-300" },
        ],
        description: "เงินเข้าหลายทาง มีลาภลอยหรือโบนัสก้อนพิเศษ",
      },
      love: {
        title: "ความรักเสน่ห์",
        colors: [
          { name: "สีส้มพีช", hex: "#fb923c", bgClass: "bg-orange-400", borderClass: "border-orange-400/40", textClass: "text-orange-300" },
          { name: "สีเหลืองทอง", hex: "#eab308", bgClass: "bg-yellow-500", borderClass: "border-yellow-500/40", textClass: "text-yellow-400" },
        ],
        description: "ความสัมพันธ์มั่นคง มีความอบอุ่น ได้รับของขวัญจากคนรัก",
      },
      power: {
        title: "อำนาจบารมี เมตตา",
        colors: [
          { name: "สีน้ำเงินเข้ม", hex: "#1e40af", bgClass: "bg-blue-800", borderClass: "border-blue-800/40", textClass: "text-blue-300" },
        ],
        description: "ผู้ใหญ่เกรงใจและให้เกียรติ มอบหมายงานสำคัญให้ดูแล",
      },
      inauspicious: {
        title: "กาลกิณี (ห้ามใส่)",
        colors: [
          { name: "สีดำสนิท / สีม่วงเข้ม", hex: "#0f172a", bgClass: "bg-slate-900", borderClass: "border-slate-700/40", textClass: "text-slate-200" },
        ],
        description: "อาจมีคนจ้องจับผิด งานล่าช้ากว่ากำหนด",
      },
    },
    gemstones: ["บุษราคัม (Yellow Sapphire)", "โอปอลไฟ", "ซิทริน (Citrine)"],
    jewelry: "ทองคำแท้เสริมบารมีธาตุไม้และครูบาอาจารย์",
    dressingTip: "ใส่สีส้ม ครีม หรือแดงอ่อน เพิ่มความสง่างามและความมั่งคั่ง",
  },
  {
    dayIndex: 5,
    dayName: "วันศุกร์",
    dayNameCn: "星期五 · 太白",
    dayColor: "ฟ้า",
    planet: "พระศุกร์",
    element: "ธาตุน้ำ/ทอง",
    categories: {
      work: {
        title: "การงานก้าวหน้า",
        colors: [
          { name: "สีเขียวมินต์ / เขียวสด", hex: "#10b981", bgClass: "bg-emerald-500", borderClass: "border-emerald-500/40", textClass: "text-emerald-400" },
          { name: "สีขาวบริสุทธิ์", hex: "#f8fafc", bgClass: "bg-slate-50", borderClass: "border-slate-200/40", textClass: "text-slate-700" },
        ],
        description: "งานบริการ งานสร้างสรรค์ ประชาสัมพันธ์ประสบความสำเร็จสูง",
      },
      wealth: {
        title: "โชคลาภเงินทอง",
        colors: [
          { name: "สีชมพูพาสเทล / ชมพูกุหลาบ", hex: "#f472b6", bgClass: "bg-pink-400", borderClass: "border-pink-400/40", textClass: "text-pink-300" },
          { name: "สีฟ้าคราม", hex: "#38bdf8", bgClass: "bg-sky-400", borderClass: "border-sky-400/40", textClass: "text-sky-300" },
        ],
        description: "รับทรัพย์จากเสน่ห์และการพูด มีโชคจากการเข้าสังคม",
      },
      love: {
        title: "ความรักเสน่ห์",
        colors: [
          { name: "สีฟ้าสดใส", hex: "#0ea5e9", bgClass: "bg-sky-500", borderClass: "border-sky-500/40", textClass: "text-sky-300" },
          { name: "สีชมพูหวาน", hex: "#ec4899", bgClass: "bg-pink-500", borderClass: "border-pink-500/40", textClass: "text-pink-300" },
        ],
        description: "เสน่ห์ล้นเหลือ เป็นที่รักของทุกคนที่พบเห็น",
      },
      power: {
        title: "อำนาจบารมี เมตตา",
        colors: [
          { name: "สีส้มอิฐ", hex: "#c2410c", bgClass: "bg-orange-700", borderClass: "border-orange-700/40", textClass: "text-orange-300" },
        ],
        description: "ได้รับการสนับสนุนจากเพื่อนร่วมงานและลูกค้า",
      },
      inauspicious: {
        title: "กาลกิณี (ห้ามใส่)",
        colors: [
          { name: "สีเทาเข้ม / สีควันบุหรี่", hex: "#475569", bgClass: "bg-slate-600", borderClass: "border-slate-600/40", textClass: "text-slate-300" },
        ],
        description: "ทำให้เสน่ห์ลดลง เกิดเรื่องเข้าใจผิดในความสัมพันธ์",
      },
    },
    gemstones: ["ไพลิน (Blue Sapphire)", "เทอร์ควอยซ์", "ลาพิส ลาซูลี"],
    jewelry: "เครื่องประดับเพชร พลอยสีฟ้า หรือทองคำขาว",
    dressingTip: "เสื้อผ้าเนื้อผ้าพริ้วไหว โทนฟ้า ชมพู หรือขาว ผสานกันอย่างลงตัว",
  },
  {
    dayIndex: 6,
    dayName: "วันเสาร์",
    dayNameCn: "星期六 · 镇星",
    dayColor: "ม่วง",
    planet: "พระเสาร์",
    element: "ธาตุดิน/ไฟ",
    categories: {
      work: {
        title: "การงานก้าวหน้า",
        colors: [
          { name: "สีแดงเลือดนก / สีแดงเข้ม", hex: "#991b1b", bgClass: "bg-red-800", borderClass: "border-red-800/40", textClass: "text-red-300" },
          { name: "สีเทาเงิน", hex: "#94a3b8", bgClass: "bg-slate-400", borderClass: "border-slate-400/40", textClass: "text-slate-300" },
        ],
        description: "ทนทานต่องานหนัก แก้ไขวิกฤตได้สำเร็จ หัวหน้าไว้วางใจ",
      },
      wealth: {
        title: "โชคลาภเงินทอง",
        colors: [
          { name: "สีฟ้าคราม / น้ำเงินสด", hex: "#0284c7", bgClass: "bg-sky-600", borderClass: "border-sky-600/40", textClass: "text-sky-300" },
          { name: "สีดำเงางาม", hex: "#020617", bgClass: "bg-slate-950", borderClass: "border-slate-800/40", textClass: "text-slate-200" },
        ],
        description: "เงินทองมั่นคง ได้รับโชคจากความอดทนและการรอคอย",
      },
      love: {
        title: "ความรักเสน่ห์",
        colors: [
          { name: "สีม่วงเข้ม / ม่วงลาเวนเดอร์", hex: "#9333ea", bgClass: "bg-purple-600", borderClass: "border-purple-600/40", textClass: "text-purple-300" },
          { name: "สีชมพูอ่อน", hex: "#f472b6", bgClass: "bg-pink-400", borderClass: "border-pink-400/40", textClass: "text-pink-300" },
        ],
        description: "ดูมีเสน่ห์ลึกลับ ชวนค้นหา คนรักดูแลเป็นพิเศษ",
      },
      power: {
        title: "อำนาจบารมี เมตตา",
        colors: [
          { name: "สีน้ำเงินเข้ม", hex: "#172554", bgClass: "bg-blue-950", borderClass: "border-blue-900/40", textClass: "text-blue-300" },
        ],
        description: "มีอำนาจต่อรองสูง บารมีความน่าเคารพเกรงขาม",
      },
      inauspicious: {
        title: "กาลกิณี (ห้ามใส่)",
        colors: [
          { name: "สีเขียวสด / เขียวใบไม้", hex: "#15803d", bgClass: "bg-green-700", borderClass: "border-green-700/40", textClass: "text-green-300" },
        ],
        description: "งานติดขัด เกิดปัญหาเหนื่อยล้าเกินความจำเป็น",
      },
    },
    gemstones: ["นิลแท้ (Black Onyx)", "อเมทิสต์", "ไพลินสีน้ำเงินดำ"],
    jewelry: "เครื่องประดับนิลดำหรือเงินรมดำ ช่วยปกป้องคุ้มครองจากพลังลบ",
    dressingTip: "ใส่โทนสีม่วงตัดกับดำหรือฟ้าคราม ให้ความรู้สึกลึกลับและทรงพลัง",
  },
];

export function getLuckyColorsByDayIndex(dayIndex: number): DayLuckyColors {
  const safeIndex = ((dayIndex % 7) + 7) % 7;
  return LUCKY_COLORS_WEEK[safeIndex];
}

export function getTodayLuckyColors(): DayLuckyColors {
  const today = new Date();
  return getLuckyColorsByDayIndex(today.getDay());
}
