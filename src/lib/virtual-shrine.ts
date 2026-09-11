// -------------------------------------------------------------
// VIRTUAL SHRINE & ONLINE WORSHIP (ไหว้พระออนไลน์เสมือนจริง)
// Likhitfa Spiritual Standard
// -------------------------------------------------------------

export type WishCategoryKey =
  | "wealth"
  | "career"
  | "love"
  | "fortune"
  | "health"
  | "exam"
  | "protection"
  | "remedy";

export interface WishCategory {
  key: WishCategoryKey;
  label: string;
  sublabel: string;
  iconName: string;
  recommendedDeityIds: string[];
  gradient: string;
  tagline: string;
}

export interface ShrineDeity {
  id: string;
  name: string;
  title: string;
  temple: string;
  location: string;
  province: string;
  badge: string;
  avatarText: string;
  imageUrl?: string;
  primaryWishKeys: WishCategoryKey[];
  description: string;
  highlight: string;
  namoText: string;
  chantTitle: string;
  chantPali: string;
  chantMeaning: string;
  offeringSuggested: string;
  directDonation: {
    templeName: string;
    bankName: string;
    accountNumber: string;
    accountName: string;
    promptPayId?: string;
    qrDescription: string;
    note: string;
  };
}

export interface PrayerHistoryItem {
  id: string;
  timestamp: string;
  deityId: string;
  deityName: string;
  templeName: string;
  wishCategory: WishCategoryKey;
  userName: string;
  userBirthDate?: string;
  prayerText: string;
  flowerType: string;
}

export const WISH_CATEGORIES: WishCategory[] = [
  {
    key: "wealth",
    label: "การเงิน & ปลดหนี้",
    sublabel: "ค้าขายรุ่งเรือง ปลดเปลื้องหนี้สิน เงินไม่ขาดมือ",
    iconName: "Coins",
    recommendedDeityIds: ["sothorn", "doikham", "vesuwan"],
    gradient: "from-amber-400/20 to-yellow-500/10",
    tagline: "เปิดทิศทางโภคทรัพย์ เรียกเงินไหลนองทองไหลมา",
  },
  {
    key: "career",
    label: "การงาน & ธุรกิจ",
    sublabel: "เลื่อนตำแหน่ง กิจการก้าวหน้า ผู้ใหญ่อุปถัมภ์",
    iconName: "Briefcase",
    recommendedDeityIds: ["brahma", "doikham", "ganesha"],
    gradient: "from-blue-400/20 to-indigo-500/10",
    tagline: "เสริมบารมีการงาน ไร้อุปสรรคขัดขวาง",
  },
  {
    key: "love",
    label: "ความรัก & คู่ครอง",
    sublabel: "พบรักแท้ สมหวังในคู่ครอง ครอบครัวสุขสมบูรณ์",
    iconName: "Heart",
    recommendedDeityIds: ["lakshmi", "brahma", "sothorn"],
    gradient: "from-rose-400/20 to-pink-500/10",
    tagline: "ดลบันดาลบุพเพสันนิวาส เมตตามหานิยม",
  },
  {
    key: "fortune",
    label: "โชคลาภ & เสี่ยงทาย",
    sublabel: "ลาภลอย รับทรัพย์ก้อนโต มีโชคไม่คาดฝัน",
    iconName: "Sparkles",
    recommendedDeityIds: ["vesuwan", "doikham", "bhaisajya"],
    gradient: "from-emerald-400/20 to-teal-500/10",
    tagline: "เปิดดวงเสี่ยงโชค ประทานทรัพย์สมบัติพูนทวี",
  },
  {
    key: "health",
    label: "สุขภาพ & หายป่วย",
    sublabel: "บรรเทาโรคภัย แข็งแรง อายุยืน สุขภาพกายใจผ่องใส",
    iconName: "Activity",
    recommendedDeityIds: ["bhaisajya", "sothorn", "luangpothuad"],
    gradient: "from-teal-400/20 to-cyan-500/10",
    tagline: "ขอพรโอสถทิพย์ ขจัดโรคาพยาธิทั้งปวง",
  },
  {
    key: "exam",
    label: "การเรียน & สอบแข่งขัน",
    sublabel: "สอบบรรจุ สติปัญญา สมาธิดี ชนะคู่แข่งในสนามสอบ",
    iconName: "GraduationCap",
    recommendedDeityIds: ["ganesha", "chinnarat", "brahma"],
    gradient: "from-purple-400/20 to-violet-500/10",
    tagline: "เปิดคลังปัญญาสำเร็จทุกการทดสอบ",
  },
  {
    key: "protection",
    label: "แคล้วคลาด & ปลอดภัย",
    sublabel: "เดินทางปลอดภัย ปราศจากอุบัติเหตุ ภัยร้ายกลายสูญ",
    iconName: "Shield",
    recommendedDeityIds: ["luangpothuad", "sothorn", "chinnarat"],
    gradient: "from-sky-400/20 to-blue-500/10",
    tagline: "เกราะคุ้มครองชะตา คุ้มภัยทุกทิศทุกทาง",
  },
  {
    key: "remedy",
    label: "สะเดาะเคราะห์ & ขจัดอุปสรรค",
    sublabel: "แก้ปีชง ปัดเป่าสิ่งไม่ดี ผ่อนหนักเป็นเบา ปลดเปลื้องทุกข์",
    iconName: "Flame",
    recommendedDeityIds: ["tiger-shrine", "vesuwan", "bhaisajya"],
    gradient: "from-orange-400/20 to-red-500/10",
    tagline: "สยบเคราะห์ร้าย พลิกฟื้นดวงชะตาสู่ความเจริญ",
  },
];

export const SHRINE_DEITIES: ShrineDeity[] = [
  {
    id: "sothorn",
    name: "หลวงพ่อโสธร",
    title: "พระพุทธโสธร พระคู่บ้านคู่เมืองแปดริ้ว",
    temple: "วัดโสธรวรารามวรวิหาร",
    location: "ต.หน้าเมือง อ.เมือง",
    province: "ฉะเชิงเทรา",
    badge: "มงคลรอบด้าน · เมตตาการเงิน",
    avatarText: "โสธร",
    primaryWishKeys: ["wealth", "love", "protection", "health"],
    description:
      "พระพุทธรูปศักดิ์สิทธิ์คู่แผ่นดินไทยที่มีผู้ศรัทธาหลั่งไหลกราบไหว้มากที่สุด โดดเด่นด้านความร่มเย็นเป็นสุข ค้าขายคล่อง แคล้วคลาดปลอดภัย และขอพรมักสำเร็จสมความตั้งใจ",
    highlight: "ขอพรเรื่องการค้าขาย แคล้วคลาด และความสงบสุขในครอบครัว",
    namoText: "นะโม ตัสสะ ภะคะวะโต อะระหะโต สัมมาสัมพุทธัสสะ (๓ จบ)",
    chantTitle: "พระคาถาบูชาหลวงพ่อพระพุทธโสธร",
    chantPali:
      "กาเยนะ วาจายะ เจตะสา วา, โสถะรัง นามะ, อิทธิปะฏิหาริกะรัง, พุทธะรูปัง, อะหัง วันทามิ สัพพะโส, สะทา โสตถี ภะวันตุ เมฯ",
    chantMeaning:
      "ข้าพเจ้าขอนมัสการพระพุทธรูปพระองค์นั้น นามว่าโสธร ผู้ทรงกระทำอิทธิปาฏิหาริย์ ด้วยกาย วาจา ใจ ขอความสวัสดีจงมีแก่ข้าพเจ้าในกาลทุกเมื่อเทอญ",
    offeringSuggested: "ดอกบัวหลวงขาว 3 ดอก หรือ พวงมาลัยมะลิสด",
    directDonation: {
      templeName: "วัดโสธรวรารามวรวิหาร",
      bankName: "ธนาคารกรุงไทย (KTB)",
      accountNumber: "201-1-36421-4",
      accountName: "วัดโสธรวรารามวรวิหาร (เพื่อการบูรณะและสาธารณกุศล)",
      qrDescription: "QR e-Donation วัดโสธรวรารามวรวิหาร",
      note: "เงินบริจาคเข้าบัญชีวัดโดยตรง นำไปใช้ทำนุบำรุงพระอารามและทุนการศึกษาพระภิกษุสามเณร",
    },
  },
  {
    id: "doikham",
    name: "หลวงพ่อทันใจ",
    title: "พระเจ้าทันใจ วัดพระธาตุดอยคำ อายุพันปี",
    temple: "วัดพระธาตุดอยคำ",
    location: "ต.แม่เหียะ อ.เมือง",
    province: "เชียงใหม่",
    badge: "สำเร็จรวดเร็วทันใจ · ปลดหนี้",
    avatarText: "ทันใจ",
    primaryWishKeys: ["career", "wealth", "fortune"],
    description:
      "พระพุทธรูปโบราณอายุกว่า 1,300 ปี มีชื่อเสียงเลื่องลือด้านความศักดิ์สิทธิ์ในการประทานพรสำเร็จรวดเร็ว ผู้คนนิยมมาขอพรเรื่องปลดหนี้ การงาน การเงิน และบนบานด้วยดอกมะลิสด",
    highlight: "ขอเรื่องปลดหนี้สิน การค้า การประมูลงาน ให้สำเร็จฉับไว",
    namoText: "นะโม ตัสสะ ภะคะวะโต อะระหะโต สัมมาสัมพุทธัสสะ (๓ จบ)",
    chantTitle: "พระคาถาบูชาหลวงพ่อทันใจ วัดพระธาตุดอยคำ",
    chantPali:
      "โอม นะโมพุทธายะ, ยะอะสะ สุมัง จะปาคะ, สิทธิลาโภ ชะโย นิจจัง, มะหาลาโภ ปิยัง มะมะ, ภะวันตุ เมฯ",
    chantMeaning:
      "ขอนอบน้อมแด่พระพุทธเจ้า ขอความสำเร็จแห่งลาภ ชัยชนะ และลาภอันประเสริฐ จงบังเกิดมีแก่ข้าพเจ้าในกาลทุกเมื่อเทอญ",
    offeringSuggested: "พวงมาลัยดอกมะลิสด (นิยม 50 พวงขึ้นไป)",
    directDonation: {
      templeName: "วัดพระธาตุดอยคำ จ.เชียงใหม่",
      bankName: "ธนาคารกรุงไทย (KTB)",
      accountNumber: "548-0-17855-3",
      accountName: "วัดพระธาตุดอยคำ",
      qrDescription: "QR e-Donation วัดพระธาตุดอยคำ",
      note: "โอนตรงเข้าบัญชีวัดพระธาตุดอยคำ เพื่อบูรณปฏิสังขรณ์องค์พระธาตุและโบราณสถาน",
    },
  },
  {
    id: "vesuwan",
    name: "ท้าวเวสสุวรรณโณ",
    title: "ท้าวเวสสุวรรณโณ จตุมหาราชิกา",
    temple: "วัดจุฬามณี",
    location: "ต.บางช้าง อ.อัมพวา",
    province: "สมุทรสงคราม",
    badge: "ปราบภูติผี · มหาเศรษฐี · ทรัพย์ล้น",
    avatarText: "เวสสุวรรณ",
    primaryWishKeys: ["wealth", "fortune", "remedy"],
    description:
      "หนึ่งในท้าวจตุโลกบาล ผู้เป็นอธิบดีแห่งอสูรและยักษ์ ทั้งยังเป็นเทพเจ้าแห่งโชคลาภทรัพย์สิน ขจัดสิ่งอัปมงคล คุณไสย มนต์ดำ และพลิกฟื้นการเงินให้มั่งคั่ง",
    highlight: "ขอเรื่องปลดหนี้ โชคลาภเงินทอง ขจัดอุปสรรคชีวิตและสิ่งอัปมงคล",
    namoText: "นะโม ตัสสะ ภะคะวะโต อะระหะโต สัมมาสัมพุทธัสสะ (๓ จบ)",
    chantTitle: "พระคาถาบูชาท้าวเวสสุวรรณโณ",
    chantPali:
      "อิติปิ โส ภะคะวา, ยะมะราชาโน, ท้าวเวสสุวัณโณ, มะระณัง สุขัง, อะหัง สุคะโต, นะโม พุทธายะฯ ท้าวเวสสุวัณโณ, จาตุมะหาราชิกา, ยักขะพันตาภัทภูริโต, เวสสะ พุสะ, พุทธัง อะระหัง พุทโธ, ท้าวเวสสุวัณโณ, นะโม พุทธายะฯ",
    chantMeaning:
      "ขออาราธนาบารมีท้าวเวสสุวรรณ ผู้เป็นใหญ่ในทิศอุดร โปรดประทานความปลอดภัย โชคลาภ และขจัดสิ่งชั่วร้ายทั้งปวงให้สิ้นไป",
    offeringSuggested: "ดอกกุหลาบแดง 9 ดอก หรือ พวงมาลัยดอกดาวเรือง",
    directDonation: {
      templeName: "วัดจุฬามณี จ.สมุทรสงคราม",
      bankName: "ธนาคารออมสิน (GSB)",
      accountNumber: "020-2-41142-998",
      accountName: "วัดจุฬามณี",
      qrDescription: "QR e-Donation วัดจุฬามณี",
      note: "เงินทำบุญสมทบทุนจัดสร้างอาคารปฏิบัติธรรมและบูรณปฏิสังขรณ์วัดจุฬามณีโดยตรง",
    },
  },
  {
    id: "lakshmi",
    name: "พระแม่ลักษมี",
    title: "พระแม่ลักษมี มหาเทวีแห่งความมั่งคั่งและรักแท้",
    temple: "เกษรวิลเลจ (ชั้น 4)",
    location: "แยกราชประสงค์ เขตปทุมวัน",
    province: "กรุงเทพฯ",
    badge: "รักแท้คู่แท้ · ร่ำรวยเสน่ห์",
    avatarText: "ลักษมี",
    primaryWishKeys: ["love", "wealth"],
    description:
      "เทวีแห่งความงดงาม ความรักที่มั่นคง และโชคลาภทรัพย์สิน ผู้ที่มากราบไหว้มักสมหวังในเรื่องความรัก ได้พบคู่ครองที่ดีมีศีลเสมอกัน และหนุนการค้าเจรจาให้มีเสน่ห์เมตตามหานิยม",
    highlight: "ขอพรเรื่องพบเนื้อคู่แท้ ความรักราบรื่น และเจรจาค้าขายร่ำรวย",
    namoText: "โอม พระลักษมี มหาเทวะ นะมัส (๓ จบ)",
    chantTitle: "บทสวดบูชาพระแม่ลักษมี",
    chantPali:
      "โอม ชยะ ปัทมา วิศาลักษี, ชยะ ตวัง ปัทมะมุขี, ชยะ ปัทมาสะเน เทวี, ชยะ ปัทมะ กะระ สถิเตฯ โอม ศรี มหาลักษมี เจ นะมะฮาฯ",
    chantMeaning:
      "ข้าแต่พระแม่ลักษมี มหาเทวีผู้ประทับบนดอกบัว ผู้ทรงมีพระเนตรงดงามเปี่ยมเมตตา ขอพระองค์โปรดประทานความรักอันบริสุทธิ์และโภคทรัพย์แก่ข้าพเจ้าเทอญ",
    offeringSuggested: "ดอกบัวสีชมพู 8 ดอก หรือ ดอกกุหลาบสีชมพู",
    directDonation: {
      templeName: "มูลนิธิสตรีและเด็กยากไร้ (การกุศลในพระอุปถัมภ์)",
      bankName: "ธนาคารกรุงเทพ (BBL)",
      accountNumber: "101-8-56920-1",
      accountName: "มูลนิธิช่วยเหลือผู้ยากไร้เพื่อการกุศล",
      qrDescription: "ทำบุญช่วยเหลือผู้ยากไร้และสตรีแม่เลี้ยงเดี่ยว",
      note: "ถวายกุศลแด่องค์พระแม่ลักษมีโดยตรงผ่านการแบ่งปันทานแก่สตรีและเด็กยากไร้",
    },
  },
  {
    id: "brahma",
    name: "ท่านท้าวมหาพรหม",
    title: "ศาลท่านท้าวมหาพรหม โรงแรมเอราวัณ",
    temple: "ศาลท้าวมหาพรหม สี่แยกราชประสงค์",
    location: "ถนนราชดำริ เขตปทุมวัน",
    province: "กรุงเทพฯ",
    badge: "สร้างสรรค์สำเร็จ · เมตตา 4 หน้า",
    avatarText: "พรหม",
    primaryWishKeys: ["career", "exam", "love", "wealth"],
    description:
      "มหาเทพผู้สร้างโลกและลิขิตชะตาชีวิตมนุษย์ พระพักตร์ทั้ง 4 ทิศครอบคลุม พรหมวิหาร 4 (เมตตา กรุณา มุทิตา อุเบกขา) ดลบันดาลให้การริเริ่มธุรกิจ การงาน เลื่อนขั้น และการสอบสำเร็จลุล่วง",
    highlight: "ขอพรเรื่องเริ่มต้นโครงการใหม่ ธุรกิจ เลื่อนตำแหน่ง และลิขิตโชคชะตา",
    namoText: "โอม พรหมมายะ นะมะฮา (๓ จบ)",
    chantTitle: "บทสวดบูชาท่านท้าวมหาพรหมเอราวัณ",
    chantPali:
      "โอมปะระเมสะนะมัสการัม, องการะนิพพานัง, มะหาปันโญ มะหาเตโช, มะหายะโส มะหิทธิโก, สัพพะสิทธิ สัพพะโสตถี, ภะวันตุ เมฯ",
    chantMeaning:
      "ขอนอบน้อมแด่องค์ท้าวมหาพรหมผู้ทรงอานุภาพยิ่งใหญ่ ขอพระองค์โปรดประทานความสำเร็จในกิจการทั้งปวงและศุภมงคลแด่ข้าพเจ้า",
    offeringSuggested: "ดอกดาวเรือง พวงมาลัย 4 ชาย หรือ ดอกบัว 4 ดอก",
    directDonation: {
      templeName: "มูลนิธิทุนท่านท้าวมหาพรหมโรงแรมเอราวัณ",
      bankName: "ธนาคารไทยพาณิชย์ (SCB)",
      accountNumber: "001-2-65478-9",
      accountName: "มูลนิธิทุนท่านท้าวมหาพรหมโรงแรมเอราวัณ",
      qrDescription: "บริจาคสมทบทุนจัดซื้อเครื่องมือแพทย์ให้โรงพยาบาลรัฐ",
      note: "เงินบริจาคเข้ามูลนิธิฯ 100% นำไปจัดซื้อเครื่องมือแพทย์มอบให้โรงพยาบาลทั่วประเทศ",
    },
  },
  {
    id: "ganesha",
    name: "พระพิฆเนศ",
    title: "พระพิฆเนศ เทวาลัยสี่แยกห้วยขวาง",
    temple: "เทวาลัยพระพิฆเนศ ห้วยขวาง",
    location: "สี่แยกห้วยขวาง ถนนรัชดาภิเษก",
    province: "กรุงเทพฯ",
    badge: "เทพแห่งความสำเร็จ · ปัญญาเลิศ",
    avatarText: "พิฆเนศ",
    primaryWishKeys: ["career", "exam", "wealth"],
    description:
      "บรมครูแห่งสรรพวิชาการ เทพเจ้าแห่งความสำเร็จและผู้ขจัดอุปสรรคทั้งปวง นิยมขอพรเรื่องการศึกษา สอบแข่งขัน วงการบันเทิง ศิลปะ ครีเอทีฟ และธุรกิจการค้าขาย",
    highlight: "ขอเรื่องสอบแข่งขัน ปัญญาเฉียบแหลม ค้าขายออนไลน์ และขจัดอุปสรรคงาน",
    namoText: "โอม ศรี คเณศายะ นะมะฮา (๓ จบ หรือ ๙ จบ)",
    chantTitle: "บทสวดบูชาพระพิฆเนศวร",
    chantPali:
      "โอม ศรี คเณศายะ นะมะฮา, โอม กัง คณะปัตตะเย นะมะฮา, ชะยะ คเณศะ ชะยะ คเณศะ ชะยะ คเณศะ เทวา, มาตา ชากี ปารวะตี ปิตา มหาเทวาฯ",
    chantMeaning:
      "ขอนอบน้อมแด่พระพิฆเนศวร มหาเทพผู้ขจัดอุปสรรค ขอพระองค์โปรดประทานสติปัญญา ความสำเร็จ และขจัดเสนียดจัญไรให้พ้นทาง",
    offeringSuggested: "ดอกดาวเรือง ดอกชบาแดง หรือ ผลไม้มงคล 5 ชนิด",
    directDonation: {
      templeName: "กองทุนการศึกษาเด็กผู้ยากไร้ (ในอุปถัมภ์)",
      bankName: "ธนาคารกสิกรไทย (KBANK)",
      accountNumber: "732-2-41190-2",
      accountName: "กองทุนเพื่อการศึกษาสรรพวิชาการเด็กและเยาวชน",
      qrDescription: "ทำบุญสนับสนุนทุนการศึกษาแด่เยาวชน",
      note: "อุทิศบุญแด่พระพิฆเนศ เพื่อส่งต่อปัญญาและการศึกษาแก่เด็กผู้ขาดแคลนโอกาส",
    },
  },
  {
    id: "chinnarat",
    name: "พระพุทธชินราช",
    title: "พระพุทธชินราช พระพุทธรูปที่งดงามที่สุดในสยาม",
    temple: "วัดพระศรีรัตนมหาธาตุวรมหาวิหาร",
    location: "ถนนพุทธบูชา ริมแม่น้ำน่าน",
    province: "พิษณุโลก",
    badge: "ชัยชนะ · มหาอำนาจบารมี · ชนะอุปสรรค",
    avatarText: "ชินราช",
    primaryWishKeys: ["exam", "protection", "career"],
    description:
      "พระพุทธรูปปางมารวิชัยศิลปะสุโขทัยที่ได้รับการยกย่องว่างดงามที่สุด มีพุทธคุณเด่นด้านชัยชนะเหนืออริศัตรู สอบเข้าแข่งขัน ปราบสิ่งชั่วร้าย และเสริมสง่าราศีอำนาจบารมี",
    highlight: "ขอพรเรื่องสอบบรรจุข้าราชการ ชัยชนะในการแข่งขัน คดีความ และความก้าวหน้า",
    namoText: "นะโม ตัสสะ ภะคะวะโต อะระหะโต สัมมาสัมพุทธัสสะ (๓ จบ)",
    chantTitle: "พระคาถาบูชาพระพุทธชินราช",
    chantPali:
      "กาเยนะ วาจายะ เจตะสา วา, ชินะราชะพุทธะรูปัง, สิริธัมมะราชะราเชนะ กะตัง, นะมามิหัง, สัพพะพุทธานุภาเวนะ, สะทา โสตถี ภะวันตุ เมฯ",
    chantMeaning:
      "ข้าพเจ้าขอนอบน้อมพระพุทธชินราชรูปนี้ ด้วยกาย วาจา ใจ ด้วยอานุภาพแห่งพระพุทธเจ้า ขอความสวัสดีจงมีแก่ข้าพเจ้าในกาลทุกเมื่อ",
    offeringSuggested: "ดอกบัวขาว 9 ดอก หรือ ดอกกล้วยไม้สีเหลือง",
    directDonation: {
      templeName: "วัดพระศรีรัตนมหาธาตุวรมหาวิหาร พิษณุโลก",
      bankName: "ธนาคารกรุงไทย (KTB)",
      accountNumber: "601-0-28114-1",
      accountName: "วัดพระศรีรัตนมหาธาตุวรมหาวิหาร",
      qrDescription: "QR e-Donation วัดพระศรีรัตนมหาธาตุวรมหาวิหาร",
      note: "โอนตรงเข้าบัญชีวัดเพื่อการบูรณะวิหารหลวงและกิจกรรมสาธารณกุศล",
    },
  },
  {
    id: "luangpothuad",
    name: "หลวงปู่ทวด เหยียบน้ำทะเลจืด",
    title: "สมเด็จพระราชมุนีสามีรามคุณูปมาจารย์",
    temple: "วัดราษฎร์บูรณะ (วัดช้างให้)",
    location: "ต.ควนโนรี อ.โคกโพธิ์",
    province: "ปัตตานี",
    badge: "แคล้วคลาดอันดับ 1 · เดินทางปลอดภัย",
    avatarText: "ปู่ทวด",
    primaryWishKeys: ["protection", "health"],
    description:
      "พระมหาเถระผู้ทรงอภิญญาแห่งกรุงศรีอยุธยา ขึ้นชื่อลือเลื่องด้านพุทธคุณแคล้วคลาดจากอุบัติเหตุ ภัยพิบัติ และศัสตราวุธทั้งปวง ผู้ขับขี่รถยนต์และผู้เดินทางไกลต่างเคารพบูชาอย่างสูงสุด",
    highlight: "ขอเรื่องเดินทางปลอดภัย ไร้อุบัติเหตุบนท้องถนน ป้องกันภยันตรายทั้งปวง",
    namoText: "นะโม ตัสสะ ภะคะวะโต อะระหะโต สัมมาสัมพุทธัสสะ (๓ จบ)",
    chantTitle: "พระคาถาบูชาหลวงปู่ทวด วัดช้างให้",
    chantPali:
      "นะโม โพธิสัตโต, อาคันติมายะ, อิติ ภะคะวาฯ (สวด ๓ จบ หรือ ๙ จบ)",
    chantMeaning:
      "ข้าพเจ้าขอนอบน้อมแด่พระโพธิสัตว์ ผู้มีอานุภาพอันประเสริฐยิ่ง ขอพระองค์โปรดคุ้มครองข้าพเจ้าให้ปลอดภัยในทุกทิศทาง",
    offeringSuggested: "ดอกบัว ดอกมะลิ หรือ กล้วยน้ำว้า ดอกไม้สีขาว",
    directDonation: {
      templeName: "วัดช้างให้ (วัดราษฎร์บูรณะ) จ.ปัตตานี",
      bankName: "ธนาคารกรุงไทย (KTB)",
      accountNumber: "913-1-12548-0",
      accountName: "วัดราษฎร์บูรณะ (วัดช้างให้)",
      qrDescription: "QR e-Donation วัดช้างให้ ปัตตานี",
      note: "เงินทำบุญเข้าบัญชีวัดช้างให้โดยตรงเพื่อบูรณปฏิสังขรณ์สถูปหลวงปู่ทวด",
    },
  },
  {
    id: "tiger-shrine",
    name: "เจ้าพ่อเสือ (ตั่วเหล่าเอี๊ย)",
    title: "ศาลเจ้าพ่อเสือ เสาชิงช้า พระนคร",
    temple: "ศาลเจ้าพ่อเสือ พระนคร",
    location: "ถนนตะนาว แขวงศาลเจ้าพ่อเสือ",
    province: "กรุงเทพฯ",
    badge: "แก้ปีชง · สยบอวมงคล · อำนาจบารมี",
    avatarText: "เจ้าพ่อเสือ",
    primaryWishKeys: ["remedy", "protection", "career"],
    description:
      "ศาลเจ้าจีนแต้จิ๋วสายเต๋าที่เก่าแก่และศักดิ์สิทธิ์ที่สุดแห่งหนึ่งในไทย มีชื่อเสียงเรื่องการสะเดาะเคราะห์ ปัดเป่าสิ่งอัปมงคล แก้ปีชง เสริมพลังอำนาจ ปราบศัตรูพาล และคุ้มครองดวงชะตาให้เข้มแข็ง",
    highlight: "ขอเรื่องแก้ชง แก้ดวงตก ปัดเป่าวิบากกรรม ชนะศัตรูคู่แข่ง",
    namoText: "ขอนอบน้อมแด่องค์ตั่วเหล่าเอี๊ย และองค์เจ้าพ่อเสือ (๓ จบ)",
    chantTitle: "บทสวดบูชาองค์ตั่วเหล่าเอี๊ย เจ้าพ่อเสือ",
    chantPali:
      "เฮียงเทียนเสี่ยงตี่, จูป๋อฮุก ผ่อสัก, อัมมานี ปัดหมี่ฮง, ตั๋วเหล่าเอี๊ย คุ้มครอง ปัดเป่าทุกข์ภัย, เจริญรุ่งเรือง ร่ำรวย ปลอดภัยเทอญฯ",
    chantMeaning:
      "ขอนอบน้อมแด่องค์เทพเจ้าฟ้าและดิน พระโพธิสัตว์ทั้งหลาย และองค์เจ้าพ่อเสือ โปรดขจัดเสนียดจัญไร ปัดเป่าเคราะห์ภัย นำพาความผาสุกรุ่งเรือง",
    offeringSuggested: "ส้มมงคล 4 ผล หรือ ดอกดาวเรืองสีเหลืองทอง",
    directDonation: {
      templeName: "มูลนิธิศาลเจ้าพ่อเสือพระนคร",
      bankName: "ธนาคารกรุงเทพ (BBL)",
      accountNumber: "111-4-23991-8",
      accountName: "มูลนิธิศาลเจ้าพ่อเสือพระนคร เพื่อสาธารณกุศล",
      qrDescription: "บริจาคช่วยงานศพไร้ญาติและสาธารณภัย มูลนิธิศาลเจ้าพ่อเสือ",
      note: "เงินบริจาคเข้ามูลนิธิศาลเจ้าพ่อเสือ นำไปซื้อโลงศพไร้ญาติและช่วยเหลือผู้ประสบภัย",
    },
  },
  {
    id: "bhaisajya",
    name: "พระไภษัชยคุรุพุทธเจ้า",
    title: "พระพุทธเจ้าครูแห่งยา วัดมังกรกมลาวาส (เล่งเน่ยยี่)",
    temple: "วัดมังกรกมลาวาส (เล่งเน่ยยี่)",
    location: "ถนนเจริญกรุง เขตป้อมปราบศัตรูพ่าย",
    province: "กรุงเทพฯ",
    badge: "รักษาโรคภัย · อายุยืน · สุขภาพกายใจ",
    avatarText: "หมอยา",
    primaryWishKeys: ["health", "remedy"],
    description:
      "พระพุทธเจ้าแห่งการรักษาโรคฝ่ายมหายาน พระหัตถ์ทรงถือโถโอสถทิพย์ ดลบันดาลให้ผู้ป่วยไข้ฟื้นฟูกายใจ ขจัดสารพัดโรคาพยาธิ ทั้งโรคทางกายและโรคทางวิญญาณ มีอายุยืนยาว",
    highlight: "ขอพรให้หายเจ็บป่วย การผ่าตัดราบรื่น คลายความเครียด และสุขภาพแข็งแรง",
    namoText: "นำมอ ปอแคฮวาตี ปี้ซาเซอคูรู (๓ จบ)",
    chantTitle: "พระธารณีสูตรพระไภษัชยคุรุไวฑูรยประภา",
    chantPali:
      "นะโม ภะคะวะเต, ไภษัชยะคุรุ, ไวฑูรยะ ปรภา ราชายะ, ตะถาคะตายะ, อะระหะเต, สัมยักสัมพุทธายะ, ตัทยะถา, โอม ไภษัชเย ไภษัชเย, ไภษัชยะ สะมุทคะเต สวาหาฯ",
    chantMeaning:
      "ขอนอบน้อมแด่พระไภษัชยคุรุพุทธเจ้า ผู้ทรงเป็นราชาแห่งยาและแสงไวฑูรย์ ขอโอสถทิพย์แห่งพระองค์จงรักษาบำบัดสรรพโรคาให้หมดสิ้นไป",
    offeringSuggested: "ดอกบัวสีน้ำเงิน/ขาว หรือ ผลไม้มงคล แอปเปิ้ล ส้ม",
    directDonation: {
      templeName: "วัดมังกรกมลาวาส (เล่งเน่ยยี่)",
      bankName: "ธนาคารกรุงไทย (KTB)",
      accountNumber: "030-1-29987-5",
      accountName: "วัดมังกรกมลาวาส (เล่งเน่ยยี่)",
      qrDescription: "QR e-Donation วัดมังกรกมลาวาส (เล่งเน่ยยี่)",
      note: "เงินบริจาคเข้าวัดมังกรกมลาวาสโดยตรงเพื่อการเผยแผ่พระพุทธศาสนาและการกุศล",
    },
  },
];

// -------------------------------------------------------------
// WEB AUDIO BELL SYNTHESIZER
// -------------------------------------------------------------
let audioCtx: AudioContext | null = null;

export function playTempleBell(tone: "deep" | "high" | "bowl" = "deep") {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx || audioCtx.state === "closed") {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === "suspended") {
      void audioCtx.resume();
    }

    const now = audioCtx.currentTime;
    const baseFreq = tone === "deep" ? 220 : tone === "bowl" ? 330 : 440; // Hz
    const duration = tone === "bowl" ? 4.5 : 3.5;

    // Main fundamental oscillator
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(baseFreq, now);

    // Harmonic oscillator (temple bell overtones)
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(baseFreq * 2.76, now);

    // Sub-harmonic for metallic singing bowl feel
    const osc3 = audioCtx.createOscillator();
    const gain3 = audioCtx.createGain();
    osc3.type = "sine";
    osc3.frequency.setValueAtTime(baseFreq * 5.4, now);

    // Master envelope gain
    const masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0.001, now);
    masterGain.gain.exponentialRampToValueAtTime(0.35, now + 0.04);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    gain1.gain.setValueAtTime(0.7, now);
    gain2.gain.setValueAtTime(0.25, now);
    gain3.gain.setValueAtTime(0.12, now);

    osc1.connect(gain1);
    osc2.connect(gain2);
    osc3.connect(gain3);

    gain1.connect(masterGain);
    gain2.connect(masterGain);
    gain3.connect(masterGain);

    masterGain.connect(audioCtx.destination);

    osc1.start(now);
    osc2.start(now);
    osc3.start(now);

    osc1.stop(now + duration);
    osc2.stop(now + duration);
    osc3.stop(now + duration);
  } catch (err) {
    console.warn("Could not play synthesized bell audio:", err);
  }
}

// -------------------------------------------------------------
// LOCALSTORAGE PRAYER HISTORY
// -------------------------------------------------------------
const STORAGE_KEY = "likhitfa_virtual_prayers_v1";

export function getPrayerHistory(): PrayerHistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as PrayerHistoryItem[];
  } catch {
    return [];
  }
}

export function savePrayerHistory(item: Omit<PrayerHistoryItem, "id" | "timestamp">): PrayerHistoryItem {
  const existing = getPrayerHistory();
  const newItem: PrayerHistoryItem = {
    ...item,
    id: `prayer_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
  };
  const updated = [newItem, ...existing].slice(0, 30); // Keep latest 30 prayers
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn("Failed to persist prayer history:", err);
  }
  return newItem;
}

export function clearPrayerHistory(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore
  }
}
