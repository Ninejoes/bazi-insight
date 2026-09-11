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

export interface RealShrineLocation {
  name: string;
  address: string;
  province: string;
  googleMapsUrl: string;
  openingHours: string;
  practicalTips: string;
  alternativeShrines?: { name: string; location: string; googleMapsUrl: string }[];
}

export interface AuspiciousNumberSeed {
  twoDigits: string[];
  threeDigits: string[];
  meanings: string[];
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
  imageUrl: string;
  primaryWishKeys: WishCategoryKey[];
  description: string;
  highlight: string;
  namoText: string;
  chantTitle: string;
  chantPali: string;
  chantMeaning: string;
  offeringSuggested: string;
  realLocation: RealShrineLocation;
  luckyNumberSeed: AuspiciousNumberSeed;
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
  luckyTwoDigit?: string;
  luckyThreeDigit?: string;
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
    imageUrl: "/images/shrines/sothorn.jpg",
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
    realLocation: {
      name: "วัดโสธรวรารามวรวิหาร (พระอุโบสถหลวงพ่อโสธร)",
      address: "ถนนเทพคุณากร ต.หน้าเมือง อ.เมืองฉะเชิงเทรา จ.ฉะเชิงเทรา 24000",
      province: "ฉะเชิงเทรา",
      googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=วัดโสธรวรารามวรวิหาร+ฉะเชิงเทรา",
      openingHours: "จันทร์-ศุกร์ 07:00 – 16:30 น. / เสาร์-อาทิตย์-วันหยุด 07:00 – 17:00 น.",
      practicalTips: "ควรแต่งกายสุภาพเรียบร้อย นิยมถวายไข่ต้มและพวงมาลัยมะลิสดเป็นของแก้บนยอดนิยม",
      alternativeShrines: [
        {
          name: "วัดสมานรัตนาราม",
          location: "ต.บางแก้ว อ.เมือง จ.ฉะเชิงเทรา",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=วัดสมานรัตนาราม+ฉะเชิงเทรา",
        },
      ],
    },
    luckyNumberSeed: {
      twoDigits: ["14", "41", "47", "74", "94"],
      threeDigits: ["741", "414", "914", "547"],
      meanings: [
        "เลขคู่มหาลาภโภคทรัพย์ เสริมความมั่นคงในหน้าที่การงานและเงินทองคล่องตัว",
        "เลขสิริมงคล เมตตามหานิยม ผู้ใหญ่อุปถัมภ์ค้ำชู แคล้วคลาดปลอดภัย",
      ],
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
    imageUrl: "/images/shrines/doikham.jpg",
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
    realLocation: {
      name: "วัดพระธาตุดอยคำ (หลวงพ่อทันใจ)",
      address: "108 หมู่ 3 ต.แม่เหียะ อ.เมืองเชียงใหม่ จ.เชียงใหม่ 50100",
      province: "เชียงใหม่",
      googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=วัดพระธาตุดอยคำ+เชียงใหม่",
      openingHours: "เปิดทุกวัน 06:00 – 18:00 น.",
      practicalTips: "การขอพรให้ระบุเพียง 1 เรื่องอย่างชัดเจน และระบุจำนวนพวงมาลัยมะลิสดที่ตั้งใจจะนำมาแก้บน (เริ่มต้น 50 พวง)",
      alternativeShrines: [
        {
          name: "วัดพระสิงห์วรมหาวิหาร",
          location: "ต.พระสิงห์ อ.เมือง จ.เชียงใหม่",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=วัดพระสิงห์วรมหาวิหาร+เชียงใหม่",
        },
      ],
    },
    luckyNumberSeed: {
      twoDigits: ["53", "35", "50", "85", "95"],
      threeDigits: ["553", "550", "853", "950"],
      meanings: [
        "เลขสำเร็จฉับพลันทันใจ โชคลาภก้อนโต ปลดเปลื้องพันธนาการหนี้สิน",
        "เลขชัยชนะแห่งปาฏิหาริย์ การงานประมูลสำเร็จ ร่ำรวยมั่งคั่ง",
      ],
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
    imageUrl: "/images/shrines/vesuwan.jpg",
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
    realLocation: {
      name: "วัดจุฬามณี (ท้าวเวสสุวรรณโณ)",
      address: "หมู่ 9 ต.บางช้าง อ.อัมพวา จ.สมุทรสงคราม 75110",
      province: "สมุทรสงคราม",
      googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=วัดจุฬามณี+สมุทรสงคราม",
      openingHours: "เปิดทุกวัน 06:00 – 24:00 น. (เทศกาลสำคัญเปิด 24 ชั่วโมง)",
      practicalTips: "นิยมไหว้ด้วยธูปแดง 9 ดอก และกุหลาบแดง 9 ดอก ควรกราบไหว้อย่างสำรวมและตั้งสติภาวนา",
      alternativeShrines: [
        {
          name: "วัดจอมเกษ (ท้าวเวสสุวรรณ)",
          location: "ต.ขยาย อ.บางปะหัน จ.พระนครศรีอยุธยา",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=วัดจอมเกษ+อยุธยา",
        },
        {
          name: "วัดไผ่เงินโชตนาราม",
          location: "ถนนจันทน์ ซอย 43 เขตบางคอแหลม กรุงเทพฯ",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=วัดไผ่เงินโชตนาราม+กรุงเทพ",
        },
      ],
    },
    luckyNumberSeed: {
      twoDigits: ["79", "97", "89", "98", "68"],
      threeDigits: ["789", "989", "979", "897"],
      meanings: [
        "เลขคลังสมบัติอัครมหาเศรษฐี เงินทองไหลมาเทมา ป้องกันเสนียดจัญไร",
        "เลขมหาบารมีคุ้มครอง ชนะภัยพาล มีโชคลาภการเสี่ยงทายและลาภลอย",
      ],
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
    imageUrl: "/images/shrines/lakshmi.jpg",
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
    realLocation: {
      name: "ศาลพระแม่ลักษมี ศูนย์การค้าเกษรวิลเลจ (ชั้น 4)",
      address: "ชั้น 4 เกษรวิลเลจ สี่แยกราชประสงค์ ถนนเพลินจิต แขวงลุมพินี เขตปทุมวัน กรุงเทพฯ 10330",
      province: "กรุงเทพฯ",
      googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=ศาลพระแม่ลักษมี+เกษรวิลเลจ",
      openingHours: "เปิดทุกวัน 10:00 – 18:00 น.",
      practicalTips: "นิยมแต่งกายโทนสีชมพูหรือสีสดใส นำดอกบัวสีชมพู 8 ดอก และแอปเปิ้ลสีแดงมาถวาย ห้ามถวายเนื้อสัตว์และของคาวทุกชนิด",
      alternativeShrines: [
        {
          name: "วัดพระศรีมหาอุมาเทวี (วัดแขก สีลม)",
          location: "ถนนปั้น แขวงสีลม เขตบางรัก กรุงเทพฯ",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=วัดแขก+สีลม",
        },
        {
          name: "ศาลพระแม่ลักษมี เซ็นทรัลลาดพร้าว",
          location: "ถนนพหลโยธิน แขวงจตุจักร เขตจตุจักร กรุงเทพฯ",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=พระแม่ลักษมี+เซ็นทรัลลาดพร้าว",
        },
      ],
    },
    luckyNumberSeed: {
      twoDigits: ["28", "82", "36", "63", "88"],
      threeDigits: ["828", "365", "888", "282"],
      meanings: [
        "เลขเสน่ห์เมตตามหานิยม บุพเพสันนิวาสนำพารักแท้ ครองคู่มั่นคง",
        "เลขมหาโภคทรัพย์ดึงดูดเงินทอง ความอุดมสมบูรณ์ในชีวิตคู่และครอบครัว",
      ],
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
    imageUrl: "/images/shrines/brahma.jpg",
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
    realLocation: {
      name: "ศาลท่านท้าวมหาพรหม โรงแรมแกรนด์ ไฮแอท เอราวัณ",
      address: "494 สี่แยกราชประสงค์ ถนนราชดำริ แขวงลุมพินี เขตปทุมวัน กรุงเทพฯ 10330",
      province: "กรุงเทพฯ",
      googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=ศาลท้าวมหาพรหม+เอราวัณ+ราชประสงค์",
      openingHours: "เปิดทุกวัน 06:00 – 22:00 น.",
      practicalTips: "ควรกราบไหว้ให้ครบทั้ง 4 พักตร์ โดยเริ่มต้นจากพักตร์ด้านหน้าแล้วเวียนขวา (ตามเข็มนาฬิกา) จนครบทั้ง 4 ด้าน",
      alternativeShrines: [
        {
          name: "ศาลท้าวมหาพรหม วัดสมานรัตนาราม",
          location: "ต.บางแก้ว อ.เมือง จ.ฉะเชิงเทรา",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=ศาลท้าวมหาพรหม+วัดสมานรัตนาราม",
        },
      ],
    },
    luckyNumberSeed: {
      twoDigits: ["16", "61", "44", "46", "64"],
      threeDigits: ["168", "444", "641", "916"],
      meanings: [
        "เลขรวยตลอดกาล ชะตาลิขิตนำพาวาสนา เลื่อนขั้นเลื่อนตำแหน่งสูง",
        "เลขสติปัญญา พรหมลิขิตคุ้มครอง การริเริ่มธุรกิจและโครงการใหม่ไร้อุปสรรค",
      ],
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
    imageUrl: "/images/shrines/ganesha.jpg",
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
    offeringSuggested: "ดอกดาวเรือง ดอกชบาแดง หรือ ขนมโมทกะ/ลาดู",
    realLocation: {
      name: "เทวาลัยพระพิฆเนศ สี่แยกห้วยขวาง",
      address: "สี่แยกห้วยขวาง ถนนรัชดาภิเษก แขวงดินแดง เขตดินแดง กรุงเทพฯ 10400",
      province: "กรุงเทพฯ",
      googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=เทวาลัยพระพิฆเนศ+ห้วยขวาง",
      openingHours: "เปิดให้สักการะตลอด 24 ชั่วโมง",
      practicalTips: "นิยมถวายดอกดาวเรือง ดอกชบาแดง นมสด ผลไม้มงคล ขนมหวานโมทกะ และกระซิบขอพรที่หูของหนูมุสิกะบริวาร",
      alternativeShrines: [
        {
          name: "วัดสมานรัตนาราม (พระพิฆเนศปางนอนเสวยสุข)",
          location: "ต.บางแก้ว อ.เมือง จ.ฉะเชิงเทรา",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=พระพิฆเนศ+วัดสมานรัตนาราม",
        },
        {
          name: "เทวสถานโบสถ์พราหมณ์ เสาชิงช้า",
          location: "ถนนดินสอ แขวงเสาชิงช้า เขตพระนคร กรุงเทพฯ",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=เทวสถานโบสถ์พราหมณ์+เสาชิงช้า",
        },
      ],
    },
    luckyNumberSeed: {
      twoDigits: ["59", "95", "15", "51", "99"],
      threeDigits: ["599", "955", "159", "999"],
      meanings: [
        "เลขสติปัญญาบรมครู ขจัดอุปสรรคการงาน สอบแข่งขันชนะเลิศ",
        "เลขความสำเร็จอันยิ่งใหญ่ การค้าขายออนไลน์ขยายตัวทะลุเป้า",
      ],
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
    imageUrl: "/images/shrines/chinnarat.jpg",
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
    realLocation: {
      name: "วัดพระศรีรัตนมหาธาตุวรมหาวิหาร (วัดใหญ่ พิษณุโลก)",
      address: "92/3 ถนนพุทธบูชา ต.ในเมือง อ.เมืองพิษณุโลก จ.พิษณุโลก 65000",
      province: "พิษณุโลก",
      googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=วัดพระศรีรัตนมหาธาตุวรมหาวิหาร+พิษณุโลก",
      openingHours: "เปิดทุกวัน 06:30 – 18:00 น.",
      practicalTips: "สักการะด้วยดอกบัวขาว กล้วยไม้สีเหลือง และปิดทองคำเปลวที่ฐานพระ เสริมอำนาจบารมีและชัยชนะ",
      alternativeShrines: [
        {
          name: "วัดเบญจมบพิตรดุสิตวนาราม (พระอุโบสถพระพุทธชินราชจำลอง)",
          location: "ถนนนครปฐม แขวงดุสิต เขตดุสิต กรุงเทพฯ",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=วัดเบญจมบพิตรดุสิตวนาราม",
        },
      ],
    },
    luckyNumberSeed: {
      twoDigits: ["19", "91", "29", "92", "49"],
      threeDigits: ["919", "192", "491", "929"],
      meanings: [
        "เลขชัยชนะเหนือกาลเวลา สอบบรรจุรับราชการสำเร็จ ชนะคู่แข่งอริศัตรู",
        "เลขสง่าราศีมหาอำนาจ ผู้คนยำเกรง เสริมสิริมงคลปกป้องคุ้มครองชะตา",
      ],
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
    imageUrl: "/images/shrines/luangpothuad.jpg",
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
    realLocation: {
      name: "วัดราษฎร์บูรณะ (วัดช้างให้)",
      address: "ต.ควนโนรี อ.โคกโพธิ์ จ.ปัตตานี 94180",
      province: "ปัตตานี",
      googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=วัดช้างให้+ปัตตานี",
      openingHours: "เปิดทุกวัน 08:00 – 17:00 น.",
      practicalTips: "สวดพระคาถาบูชา 3 หรือ 9 จบ เพื่อความเป็นสิริมงคลก่อนขับรถยนต์หรือออกเดินทางไกล",
      alternativeShrines: [
        {
          name: "วัดห้วยมงคล (หลวงปู่ทวดองค์ใหญ่ที่สุดในโลก)",
          location: "ต.ทับใต้ อ.หัวหิน จ.ประจวบคีรีขันธ์",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=วัดห้วยมงคล+หัวหิน",
        },
        {
          name: "วัดพะโคะ (บ้านเกิดหลวงปู่ทวด)",
          location: "ต.ชุมพล อ.สทิงพระ จ.สงขลา",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=วัดพะโคะ+สงขลา",
        },
      ],
    },
    luckyNumberSeed: {
      twoDigits: ["09", "90", "84", "48", "99"],
      threeDigits: ["990", "099", "849", "908"],
      meanings: [
        "เลขแคล้วคลาดนิรันตราย เดินทางปลอดภัยทุกทิศ ไร้ภัยอุบัติเหตุ",
        "เลขบารมีพระโพธิสัตว์ คุ้มครองชีวิตและทรัพย์สิน ร่มเย็นเป็นสุข",
      ],
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
    imageUrl: "/images/shrines/tiger-shrine.jpg",
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
    realLocation: {
      name: "ศาลเจ้าพ่อเสือ พระนคร (เสาชิงช้า)",
      address: "468 ถนนตะนาว แขวงศาลเจ้าพ่อเสือ เขตพระนคร กรุงเทพฯ 10200",
      province: "กรุงเทพฯ",
      googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=ศาลเจ้าพ่อเสือ+เสาชิงช้า+พระนคร",
      openingHours: "เปิดทุกวัน 06:00 – 17:00 น.",
      practicalTips: "นิยมไหว้องค์ตั่วเหล่าเอี๊ย เจ้าพ่อเสือ และองค์เทพเจ้าโชคลาภ นำส้มมงคล 4 ผล และปัดกระดาษยันต์สะเดาะเคราะห์แก้ชง",
      alternativeShrines: [
        {
          name: "ศาลเจ้าพ่อเสือ รามอินทรา กม.4",
          location: "ถนนรามอินทรา แขวงอนุสาวรีย์ เขตบางเขน กรุงเทพฯ",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=ศาลเจ้าพ่อเสือ+รามอินทรา",
        },
      ],
    },
    luckyNumberSeed: {
      twoDigits: ["38", "83", "88", "33", "78"],
      threeDigits: ["838", "388", "783", "883"],
      meanings: [
        "เลขสยบเคราะห์ร้าย พลิกดวงชะตาจากร้ายกลายเป็นดี มหาอำนาจ",
        "เลขมหาโชคลาภชัยชนะ ปราบศัตรูคู่แข่ง ธุรกิจการค้ามีกำไรล้นพ้น",
      ],
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
    imageUrl: "/images/shrines/bhaisajya.jpg",
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
    realLocation: {
      name: "วัดมังกรกมลาวาส (เล่งเน่ยยี่ เยาวราช)",
      address: "423 ถนนเจริญกรุง แขวงป้อมปราบ เขตป้อมปราบศัตรูพ่าย กรุงเทพฯ 10100",
      province: "กรุงเทพฯ",
      googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=วัดมังกรกมลาวาส+เยาวราช",
      openingHours: "เปิดทุกวัน 07:00 – 18:00 น.",
      practicalTips: "กราบไหว้องค์พระพุทธเจ้าหมอยา (เอี๊ยะซือฮุก) เพื่อสุขภาพแข็งแรง ปราศจากโรคภัย นิยมถวายผลไม้สดและน้ำดื่มสะอาด",
      alternativeShrines: [
        {
          name: "วัดบรมราชากาญจนาภิเษกอนุสรณ์ (เล่งเน่ยยี่ 2)",
          location: "ถนนเทศบาล 9 ต.โสนลอย อ.บางบัวทอง จ.นนทบุรี",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=เล่งเน่ยยี่+2+บางบัวทอง",
        },
      ],
    },
    luckyNumberSeed: {
      twoDigits: ["45", "54", "49", "94", "59"],
      threeDigits: ["459", "549", "945", "594"],
      meanings: [
        "เลขโอสถทิพย์ สุขภาพกายใจสมบูรณ์ บรรเทาโรคภัยไข้เจ็บ อายุยืนยาว",
        "เลขแสงสว่างแห่งปัญญา ความผ่องใส ปัดเป่าความกังวลใจและเคราะห์สุขภาพ",
      ],
    },
  },
];

// -------------------------------------------------------------
// AUSPICIOUS NUMBER CALCULATOR
// -------------------------------------------------------------
export interface AuspiciousResult {
  twoDigit: string;
  threeDigit: string;
  meaning: string;
}

export function calculateDeityAuspiciousNumbers(
  deity: ShrineDeity,
  userName = "",
  birthDate = "",
): AuspiciousResult {
  const todayStr = new Date().toISOString().slice(0, 10);
  let hash = 0;
  const combined = `${todayStr}_${deity.id}_${userName}_${birthDate}`;

  for (let i = 0; i < combined.length; i++) {
    hash = (hash << 5) - hash + combined.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);

  const twoList = deity.luckyNumberSeed.twoDigits;
  const threeList = deity.luckyNumberSeed.threeDigits;
  const meanings = deity.luckyNumberSeed.meanings;

  const twoDigit = twoList[absHash % twoList.length] || "89";
  const threeDigit = threeList[(absHash >> 2) % threeList.length] || "789";
  const meaning = meanings[(absHash >> 4) % meanings.length] || deity.luckyNumberSeed.meanings[0];

  return { twoDigit, threeDigit, meaning };
}

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

    const baseFreq = tone === "deep" ? 174 : tone === "high" ? 432 : 285;
    const duration = tone === "bowl" ? 4.5 : 3.8;

    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const osc3 = audioCtx.createOscillator();

    const gain1 = audioCtx.createGain();
    const gain2 = audioCtx.createGain();
    const gain3 = audioCtx.createGain();
    const masterGain = audioCtx.createGain();

    osc1.type = "sine";
    osc2.type = "sine";
    osc3.type = "sine";

    osc1.frequency.setValueAtTime(baseFreq, now);
    osc2.frequency.setValueAtTime(baseFreq * 2.76, now);
    osc3.frequency.setValueAtTime(baseFreq * 5.4, now);

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
  const updated = [newItem, ...existing].slice(0, 30);
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
