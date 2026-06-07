export type DreamRecord = {
  id: string;
  keyword: string;
  letter: string;
  category: string;
  meaning: string;
  numbers: string;
  time: string;
  advice: string;
};

export type FAQRecord = {
  id: string;
  q: string;
  a: string;
  sortOrder: number;
};

export type AboutContent = {
  title: string;
  description: string;
  story: string[];
  vision: string;
  mission: string;
};

export type ContactContent = {
  email: string;
  phone: string;
  line: string;
  facebook: string;
  address: string;
  hoursWeekday: string;
  hoursSaturday: string;
};

export type SiteContent = {
  about: AboutContent;
  contact: ContactContent;
};

export const dreamSeed: DreamRecord[] = [
  {
    id: "dream-snake",
    keyword: "งู",
    letter: "ง",
    category: "สัตว์",
    meaning: "ฝันเห็นงูใหญ่เลื้อยเข้าหา หมายถึงเนื้อคู่หรือผู้สนับสนุนใหม่กำลังเข้ามาในชีวิต",
    numbers: "7, 14, 47, 71",
    time: "เช้ามืด",
    advice: "ทำบุญ ปล่อยปลา หรือถวายผลไม้สีเหลือง",
  },
  {
    id: "dream-clear-water",
    keyword: "น้ำใส",
    letter: "น",
    category: "ธรรมชาติ",
    meaning: "แสดงถึงโชคลาภและสุขภาพดี ความสะอาดของจิตใจ",
    numbers: "2, 9, 25, 92",
    time: "กลางคืน",
    advice: "ดื่มน้ำสะอาดถวายพระ",
  },
  {
    id: "dream-monk",
    keyword: "พระสงฆ์",
    letter: "พ",
    category: "คน",
    meaning: "ได้รับการคุ้มครอง สิริมงคล และมีผู้ใหญ่ช่วยเหลือ",
    numbers: "09, 99",
    time: "เช้า",
    advice: "สวดมนต์หรือทำบุญถวายสังฆทาน",
  },
  {
    id: "dream-broken-tooth",
    keyword: "ฟันหัก",
    letter: "ฟ",
    category: "ร่างกาย",
    meaning: "ควรระวังการสูญเสียหรือความขัดแย้งในครอบครัว",
    numbers: "13, 31",
    time: "กลางคืน",
    advice: "ทำบุญอุทิศส่วนกุศลและพูดจาอย่างระมัดระวัง",
  },
  {
    id: "dream-gold",
    keyword: "ทอง",
    letter: "ท",
    category: "สิ่งของ",
    meaning: "การเงินดีขึ้น มีโชคลาภหรือโอกาสใหม่ด้านทรัพย์สิน",
    numbers: "27, 72",
    time: "เช้ามืด",
    advice: "จัดกระเป๋าเงินให้สะอาดและบริจาคตามกำลัง",
  },
];

export const faqSeed: FAQRecord[] = [
  {
    id: "faq-free",
    q: "การดูดวงในเว็บไซต์มีค่าใช้จ่ายหรือไม่?",
    a: "ฟีเจอร์หลักทั้งหมดเปิดให้ใช้ฟรี ฟีเจอร์พรีเมียมบางส่วนจะมีการแจ้งราคาก่อนใช้งาน",
    sortOrder: 1,
  },
  {
    id: "faq-privacy",
    q: "ข้อมูลส่วนตัวของฉันปลอดภัยหรือไม่?",
    a: "เราเก็บข้อมูลทั้งหมดด้วยการเข้ารหัสตามมาตรฐาน และปฏิบัติตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA)",
    sortOrder: 2,
  },
  {
    id: "faq-delete",
    q: "ฉันสามารถลบบัญชีของฉันได้หรือไม่?",
    a: "ได้ สามารถลบบัญชีและข้อมูลส่วนตัวทั้งหมดได้ที่หน้า โปรไฟล์ → ตั้งค่าและความเป็นส่วนตัว",
    sortOrder: 3,
  },
  {
    id: "faq-accuracy",
    q: "ผลทำนายแม่นยำแค่ไหน?",
    a: "ผลทำนายเป็นแนวทางเพื่อช่วยทบทวนตนเอง ไม่ควรใช้แทนคำแนะนำด้านการแพทย์ การเงิน หรือกฎหมาย",
    sortOrder: 4,
  },
];

export const siteContentSeed: SiteContent = {
  about: {
    title: "ลิขิตฟ้า · ศาสตร์โบราณในมือคุณ",
    description:
      "Likhitfa เกิดจากความตั้งใจที่จะนำศาสตร์ดูดวงตะวันออกอันลึกซึ้ง — ปาจื้อ ไพ่ทาโรต์ และทำนายฝัน — มาถ่ายทอดในรูปแบบที่เข้าใจง่ายและสวยงามสำหรับคนยุคใหม่",
    story: [
      "จุดเริ่มต้นของลิขิตฟ้ามาจากบทสนทนาเล็กๆ ระหว่างนักออกแบบ นักพัฒนา และอาจารย์ดูดวงจีนรุ่นใหม่ ที่เชื่อว่าศาสตร์การดูดวงไม่ควรน่ากลัวหรือยากเกินไป",
      "เราจึงสร้างประสบการณ์ที่ผสานความสวยงาม ความแม่นยำ และการเข้าถึงได้ของยุคดิจิทัล เพื่อให้ทุกคนสามารถทำความรู้จักตัวเองผ่านสายตาของศาสตร์ที่สืบทอดมานานหลายพันปี",
    ],
    vision: "ทำให้ศาสตร์การดูดวงเป็นเครื่องมือที่ใช้ทบทวนตัวเองได้ทุกวัน เข้าถึงง่ายและใช้งานสนุก",
    mission: "ส่งมอบประสบการณ์ดูดวงที่งดงาม น่าเชื่อถือ และมีจริยธรรมในทุกการตีความ",
  },
  contact: {
    email: "hello@likhitfa.com",
    phone: "02-123-4567",
    line: "@likhitfa",
    facebook: "facebook.com/likhitfa",
    address: "ชั้น 12 อาคารฟ้าลิขิต ถ.สุขุมวิท กรุงเทพฯ 10110",
    hoursWeekday: "จันทร์ - ศุกร์ · 09:00 - 18:00",
    hoursSaturday: "เสาร์ · 10:00 - 16:00",
  },
};
