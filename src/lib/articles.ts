export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  createdAt?: string;
  readMin: number;
  cover: string;
  coverAlt?: string;
  seoTitle?: string;
  seoDescription?: string;
  keywords?: string[];
  canonicalUrl?: string;
  content: string[];
};

export const articles: Article[] = [
  {
    slug: "bazi-101",
    title: "ปาจื้อเบื้องต้น เข้าใจ 4 เสาแห่งชะตา",
    excerpt:
      "ปาจื้อ (八字) คือศาสตร์การคำนวณดวงชะตาจากวันเดือนปีและเวลาเกิด มาทำความเข้าใจ 4 เสาในแบบเข้าใจง่าย",
    category: "ปาจื้อ",
    author: "อ.ฟ้าลิขิต",
    date: "2025-09-12",
    readMin: 6,
    cover: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1200&q=80",
    content: [
      "ปาจื้อแปลตามตัวอักษรว่า ‘แปดอักษร’ คืออักษรสวรรค์ 4 ตัว และอักษรดิน 4 ตัว ที่ได้จากปี เดือน วัน และยามที่เกิด",
      "การอ่านปาจื้อเริ่มจากการแยกธาตุของแต่ละเสา แล้วดูความสัมพันธ์ของธาตุที่เกื้อหนุนและขัดแย้งกัน",
      "เสาแรกคือเสาวันซึ่งหมายถึงตัวเจ้าชะตา เสานี้สำคัญที่สุดในการวิเคราะห์",
      "เมื่อเข้าใจพื้นฐานเหล่านี้แล้ว เราจึงสามารถมองเห็นจังหวะของชีวิตในแต่ละช่วงวัยจรได้ชัดเจนยิ่งขึ้น",
    ],
  },
  {
    slug: "tarot-spread-beginner",
    title: "เริ่มเปิดไพ่ทาโรต์ใบแรก สำหรับมือใหม่",
    excerpt:
      "ก่อนเปิดไพ่ใบแรก สิ่งสำคัญคือการตั้งคำถามให้ชัดเจน บทความนี้รวม 5 ขั้นตอนเริ่มต้นที่มือใหม่ควรรู้",
    category: "ไพ่ยิปซี",
    author: "อ.จันทร์เพ็ญ",
    date: "2025-10-02",
    readMin: 5,
    cover: "https://images.unsplash.com/photo-1577897665977-3a3f25c8a85a?w=1200&q=80",
    content: [
      "การเปิดไพ่ทาโรต์ไม่ใช่เรื่องของการทำนายอนาคต แต่คือกระบวนการทบทวนความคิด ความรู้สึก และมุมมองที่อยู่ในใจเราเอง",
      "ก่อนสับไพ่ ให้นั่งสบาย หายใจเข้าออกช้าๆ แล้วถามคำถามที่ ‘เปิด’ มากกว่าคำถามใช่/ไม่ใช่",
      "เลือกการวางไพ่ที่ตรงกับคำถาม เช่น 3 ใบ (อดีต-ปัจจุบัน-อนาคต) สำหรับคำถามทั่วไป",
      "เมื่อเปิดไพ่แล้ว ให้สังเกตทั้งภาพและความรู้สึกแรกที่ขึ้นมาในใจก่อนจะอ่านความหมาย",
    ],
  },
  {
    slug: "dream-numbers",
    title: "ฝันเห็นอะไรได้เลขอะไร รวมความเชื่อยอดนิยม",
    excerpt: "รวมคำฝันยอดฮิตและเลขเด็ดที่คนไทยนิยมตีความ พร้อมข้อแนะนำในการใช้เลขอย่างมีสติ",
    category: "ทำนายฝัน",
    author: "ทีม Likhitfa",
    date: "2025-10-20",
    readMin: 4,
    cover: "https://images.unsplash.com/photo-1532635241-17e820acc59f?w=1200&q=80",
    content: [
      "ฝันเห็นงู มักตีความว่ามีคนรักหรือเนื้อคู่เข้ามาในชีวิต เลขที่นิยมคือ 06, 56, 89",
      "ฝันเห็นพระสงฆ์ หมายถึงสิ่งศักดิ์สิทธิ์คุ้มครอง มักได้เลขชุด 9 หรือเลข 09",
      "ฝันเห็นน้ำใส โดยทั่วไปสื่อถึงโชคลาภและความสำเร็จที่กำลังจะมาถึง",
      "การตีฝันเป็นความเชื่อ ควรใช้สติและไม่นำไปสู่การพนันเกินตัว",
    ],
  },
  {
    slug: "monthly-energy-guide",
    title: "พลังประจำเดือน วิธีอ่านแนวโน้มเดือนนี้ของคุณ",
    excerpt: "เรียนรู้วิธีอ่านพลังของเดือนผ่านไพ่ทาโรต์ 10 ใบ พร้อมเทคนิคนำมาปรับใช้ในชีวิตจริง",
    category: "ไพ่ยิปซี",
    author: "อ.จันทร์เพ็ญ",
    date: "2025-11-01",
    readMin: 7,
    cover: "https://images.unsplash.com/photo-1518932945647-7a1c969f8be2?w=1200&q=80",
    content: [
      "สเปรด 10 ใบให้ภาพรวมที่ครอบคลุมทั้งสถานะ ปัญหา และแนวทางในเดือนนั้น",
      "เริ่มจากการดูใบที่ 1 ซึ่งสะท้อน ‘ตัวเรา’ ก่อนเสมอ",
      "อย่ารีบสรุปจากใบเดียว ต้องดูองค์รวมและความสัมพันธ์ระหว่างไพ่",
    ],
  },
  {
    slug: "luck-rituals",
    title: "พิธีกรรมเสริมโชคแบบจีนที่ทำได้ง่ายที่บ้าน",
    excerpt: "รวมพิธีกรรมโบราณที่ปรับให้เข้ากับยุคสมัย ทำได้ง่ายและให้พลังบวกแก่ผู้ทำ",
    category: "ปาจื้อ",
    author: "อ.ฟ้าลิขิต",
    date: "2025-11-14",
    readMin: 5,
    cover: "https://images.unsplash.com/photo-1583244532610-2a234c8b81b6?w=1200&q=80",
    content: [
      "การจุดเทียนแดงในวันเกิดเพื่อเสริมพลังธาตุไฟ",
      "การวางเหรียญทองแดงร้อยเชือกแดงไว้ใกล้กระเป๋าเงินเสริมการเงิน",
      "การกวาดบ้านด้วยใจสงบในเช้าวันที่ 1 ของเดือน",
    ],
  },
  {
    slug: "love-tarot-guide",
    title: "อ่านไพ่ความรักให้ตรงใจ ไม่ลำเอียง",
    excerpt: "วิธีตั้งคำถามและตีความไพ่ความรักโดยไม่เอาความหวังของตัวเองไปบดบังคำตอบของไพ่",
    category: "ไพ่ยิปซี",
    author: "อ.จันทร์เพ็ญ",
    date: "2025-11-25",
    readMin: 6,
    cover: "https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?w=1200&q=80",
    content: [
      "เริ่มจากการแยก ‘สิ่งที่อยากให้เกิด’ ออกจาก ‘สิ่งที่กำลังเกิด’",
      "ไพ่ที่ได้คือกระจกสะท้อน ไม่ใช่คำสั่ง ใช้เป็นแนวทางตัดสินใจ",
    ],
  },
];

export function getArticle(slug: string) {
  return articles.find((a) => a.slug === slug);
}

/**
 * แปลงวันที่บทความให้เป็นภาษาไทยที่อ่านง่าย ชัดเจน
 * รองรับทั้ง "กี่นาทีที่แล้ว / กี่ชั่วโมงที่แล้ว" หากโพสต์ภายในวันเดียวกัน
 * หรือ "12 ก.ย. 2569" หากเป็นวันที่ก่อนหน้า
 */
export function formatArticleDate(dateStr?: string, createdAt?: string): string {
  if (!dateStr && !createdAt) return "";
  try {
    const target = createdAt ? new Date(createdAt) : new Date(dateStr!);
    const now = new Date();
    const diffMs = now.getTime() - target.getTime();

    // หากมีข้อมูล timestamp และโพสต์ภายใน 24 ชม. ที่ผ่านมา
    if (!Number.isNaN(diffMs) && diffMs >= 0 && diffMs < 24 * 60 * 60 * 1000) {
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHour = Math.floor(diffMin / 60);

      if (diffSec < 60) return "เมื่อสักครู่";
      if (diffMin < 60) return `${diffMin} นาทีที่แล้ว`;
      if (diffHour < 24) return `${diffHour} ชั่วโมงที่แล้ว`;
    }

    // แปลงวันที่แบบปี พ.ศ. สั้น เช่น "12 ก.ย. 2569"
    const raw = (dateStr || createdAt || "").split("T")[0].split("-");
    if (raw.length === 3) {
      const year = parseInt(raw[0], 10);
      const month = parseInt(raw[1], 10) - 1;
      const day = parseInt(raw[2], 10);
      const d = new Date(year, month, day);
      if (!Number.isNaN(d.getTime())) {
        return d.toLocaleDateString("th-TH", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
      }
    }

    return target.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr || "";
  }
}

/**
 * แสดงเวลาที่ใช้ในการอ่านอย่างชัดเจน ป้องกันผู้ใช้สับสนกับเวลาโพสต์
 */
export function formatArticleReadTime(readMin?: number): string {
  const min = Math.max(1, Number(readMin) || 3);
  return `อ่าน ${min} นาที`;
}

