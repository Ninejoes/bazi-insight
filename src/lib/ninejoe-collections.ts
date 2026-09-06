/**
 * NineJoe Collections API & Integration Helper
 * ดึงภาพวอลเปเปอร์มงคลและ Creative Art จาก https://ninejoe.online/collections
 */

export interface NineJoeImage {
  image_url: string;
  thumbnail_url?: string;
  download_url?: string;
  alt_text?: string;
  sort_order?: number;
}

export interface NineJoeCollection {
  id: string;
  slug: string;
  title: string;
  description?: string;
  category?: string;
  cover_image: string;
  tags?: string[];
  updated_at?: string;
  collection_images: NineJoeImage[];
}

export interface NineJoeWallpaperItem {
  id: string;
  collectionId: string;
  collectionSlug: string;
  collectionTitle: string;
  collectionCategory: string;
  description: string;
  imageUrl: string;
  thumbnailUrl: string;
  downloadUrl: string;
  altText: string;
  tags: string[];
  deityGroup: "caishen" | "vessavana" | "lakshmi" | "ganesha" | "koi" | "spiritual";
  deityLabel: string;
}

const SUPABASE_URL = "https://wskouqzfhvlotykquiyj.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indza291cXpmaHZsb3R5a3F1aXlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzMTAwMTgsImV4cCI6MjA5NDg4NjAxOH0.MJ0kJOWkYxP8Fs6wK4waIEWAm8930lK5-McUdKoEAc8";

let memoryCache: NineJoeCollection[] | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

export function classifyDeityGroup(
  title: string,
  category: string = "",
  tags: string[] = []
): { group: NineJoeWallpaperItem["deityGroup"]; label: string } {
  const combined = `${title} ${category} ${tags.join(" ")}`.toLowerCase();

  if (combined.includes("caishen") || combined.includes("ไฉ่ซิง") || combined.includes("god of wealth")) {
    return { group: "caishen", label: "เทพเจ้าไฉ่ซิงเอี้ย (โชคลาภ)" };
  }
  if (combined.includes("vessavana") || combined.includes("เวสสุวรรณ") || combined.includes("ท้าวเวส")) {
    return { group: "vessavana", label: "ท้าวเวสสุวรรณ (คุ้มครอง & บารมี)" };
  }
  if (
    combined.includes("lakshmi") ||
    combined.includes("ลักษมี") ||
    combined.includes("goddess of fortune") ||
    combined.includes("fortune goddess")
  ) {
    return { group: "lakshmi", label: "พระแม่ลักษมี & พระแม่ประทานทรัพย์ (ความรัก & มั่งคั่ง)" };
  }
  if (combined.includes("ganesha") || combined.includes("พิฆเนศ") || combined.includes("คเณศ")) {
    return { group: "ganesha", label: "พระพิฆเนศ (ปัญญา & สำเร็จ)" };
  }
  if (combined.includes("koi") || combined.includes("คาร์ฟ") || combined.includes("ปลาคราฟ")) {
    return { group: "koi", label: "ปลาคาร์ฟมงคล (อุดมสมบูรณ์)" };
  }
  return { group: "spiritual", label: "มงคล & สิ่งศักดิ์สิทธิ์" };
}

export function flattenWallpapers(collections: NineJoeCollection[]): NineJoeWallpaperItem[] {
  const items: NineJoeWallpaperItem[] = [];

  // กรองเฉพาะหมวด Spiritual Art เท่านั้นตามความต้องการ
  const spiritualCollections = collections.filter((c) =>
    (c.category || "").toLowerCase().includes("spiritual")
  );

  for (const c of spiritualCollections) {
    const { group, label } = classifyDeityGroup(c.title, c.category, c.tags);
    const images = Array.isArray(c.collection_images) && c.collection_images.length > 0
      ? c.collection_images.slice().sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      : [{ image_url: c.cover_image, download_url: c.cover_image, thumbnail_url: c.cover_image }];

    images.forEach((img, idx) => {
      const imgUrl = img.image_url || c.cover_image;
      if (!imgUrl) return;

      items.push({
        id: `${c.id}-${idx}`,
        collectionId: c.id,
        collectionSlug: c.slug,
        collectionTitle: c.title,
        collectionCategory: c.category || "Spiritual Art",
        description: c.description || "",
        imageUrl: imgUrl,
        thumbnailUrl: img.thumbnail_url || imgUrl,
        downloadUrl: img.download_url || imgUrl,
        altText: img.alt_text || `${c.title} #${idx + 1}`,
        tags: c.tags || [],
        deityGroup: group,
        deityLabel: label,
      });
    });
  }

  return items;
}

export async function fetchNineJoeCollections(): Promise<NineJoeCollection[]> {
  const now = Date.now();
  if (memoryCache && now - lastFetchTime < CACHE_TTL_MS) {
    return memoryCache;
  }

  try {
    // ดึงเฉพาะหมวด Spiritual Art จาก NineJoe Supabase โดยตรง
    const url = `${SUPABASE_URL}/rest/v1/collections?select=id,slug,title,description,category,cover_image,tags,updated_at,collection_images(image_url,thumbnail_url,download_url,alt_text,sort_order)&category=ilike.*Spiritual*&status=eq.published&order=created_at.desc`;
    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Supabase request failed: ${res.status}`);
    }

    const data = (await res.json()) as NineJoeCollection[];
    if (Array.isArray(data) && data.length > 0) {
      const spiritualOnly = data.filter((c) =>
        (c.category || "").toLowerCase().includes("spiritual")
      );
      memoryCache = spiritualOnly;
      lastFetchTime = now;
      return spiritualOnly;
    }
  } catch (err) {
    console.warn("Failed to fetch live NineJoe collections, using fallback seed:", err);
  }

  return FALLBACK_COLLECTIONS;
}

/**
 * Fallback Seed Data: คอลเลกชันจริง 10 ชุดจาก ninejoe.online
 */
export const FALLBACK_COLLECTIONS: NineJoeCollection[] = [
  {
    id: "adbb8fe8-ffe5-417d-b7e5-bd51e56c635a",
    slug: "caishen-god-of-wealth-wallpapers-collection",
    title: "Caishen God of Wealth Wallpapers Collection",
    category: "Spiritual Art",
    description: "วอลเปเปอร์เทพเจ้าไฉ่ซิงเอี้ย เทพแห่งโชคลาภและความมั่งคั่งร่ำรวย ออกแบบในสไตล์ลักชูรีทองคำ เสริมฮวงจุ้ยการเงินและธุรกิจการค้า",
    cover_image: "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780544132/ChatGPT_Image_4_%E0%B8%A1%E0%B8%B4.%E0%B8%A2._2569_10_35_03_rrfoln.png",
    tags: ["caishen", "god of wealth", "prosperity", "fortune", "lucky wallpaper", "gold"],
    collection_images: [
      { image_url: "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780544132/ChatGPT_Image_4_%E0%B8%A1%E0%B8%B4.%E0%B8%A2._2569_10_35_03_rrfoln.png", sort_order: 0 },
      { image_url: "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780544133/ChatGPT_Image_4_%E0%B8%A1%E0%B8%B4.%E0%B8%A2._2569_10_34_59_o8zghb.png", sort_order: 1 },
      { image_url: "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780544133/ChatGPT_Image_4_%E0%B8%A1%E0%B8%B4.%E0%B8%A2._2569_10_34_56_szjwhw.png", sort_order: 2 },
      { image_url: "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780544134/ChatGPT_Image_4_%E0%B8%A1%E0%B8%B4.%E0%B8%A2._2569_10_34_52_r6eebp.png", sort_order: 3 },
      { image_url: "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780544134/ChatGPT_Image_4_%E0%B8%A1%E0%B8%B4.%E0%B8%A2._2569_10_34_47_h1y35r.png", sort_order: 4 },
    ],
  },
  {
    id: "618cc18f-171e-4686-b69d-036d8ecdd99b",
    slug: "vessavana-guardian-wallpapers-collection",
    title: "Vessavana Guardian Wallpapers Collection",
    category: "Spiritual Art",
    description: "คอลเลกชันวอลเปเปอร์ท้าวเวสสุวรรณ 3 สี 3 พลัง สำหรับสายมูที่ต้องการเสริมโชคลาภ การเงิน การงาน และการคุ้มครอง ภาพคมชัดระดับ HD",
    cover_image: "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780317703/ChatGPT_Image_1_%E0%B8%A1%E0%B8%B4.%E0%B8%A2._2569_19_41_16_xvy9dm.png",
    tags: ["ท้าวเวสสุวรรณ", "วอลเปเปอร์สายมู", "วอลเปเปอร์มงคล", "protection", "wealth"],
    collection_images: [
      { image_url: "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780317703/ChatGPT_Image_1_%E0%B8%A1%E0%B8%B4.%E0%B8%A2._2569_19_41_16_xvy9dm.png", sort_order: 0 },
      { image_url: "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780317704/ChatGPT_Image_1_%E0%B8%A1%E0%B8%B4.%E0%B8%A2._2569_19_41_10_wka7wc.png", sort_order: 1 },
      { image_url: "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780317704/ChatGPT_Image_1_%E0%B8%A1%E0%B8%B4.%E0%B8%A2._2569_19_41_05_v1wtqv.png", sort_order: 2 },
    ],
  },
  {
    id: "03f23e18-128b-47e4-9e06-97378a55ad52",
    slug: "lakshmi-3d-chibi-premium-wallpapers",
    title: "Lakshmi 3D Chibi Premium Wallpapers",
    category: "Spiritual Art",
    description: "วอลเปเปอร์พระแม่ลักษมี 3D Chibi พรีเมียม เสริมความรัก มหาเสน่ห์ ความร่ำรวย และความโชคดี อ่อนหวานแต่เปี่ยมด้วยพลังศักดิ์สิทธิ์",
    cover_image: "https://res.cloudinary.com/dhhzjeskm/image/upload/v1782308479/ChatGPT_Image_Jun_24_2026_08_38_29_PM_erlrsb.png",
    tags: ["lakshmi", "goddess lakshmi", "chibi art", "3d wallpaper", "love", "wealth"],
    collection_images: [
      { image_url: "https://res.cloudinary.com/dhhzjeskm/image/upload/v1782308479/ChatGPT_Image_Jun_24_2026_08_38_29_PM_erlrsb.png", sort_order: 0 },
      { image_url: "https://res.cloudinary.com/dhhzjeskm/image/upload/v1782308479/ChatGPT_Image_Jun_24_2026_08_38_32_PM_q837g3.png", sort_order: 1 },
      { image_url: "https://res.cloudinary.com/dhhzjeskm/image/upload/v1782308479/ChatGPT_Image_Jun_24_2026_08_38_38_PM_bh2hxs.png", sort_order: 2 },
      { image_url: "https://res.cloudinary.com/dhhzjeskm/image/upload/v1782308479/ChatGPT_Image_Jun_24_2026_08_38_41_PM_hh9v8u.png", sort_order: 3 },
      { image_url: "https://res.cloudinary.com/dhhzjeskm/image/upload/v1782308479/ChatGPT_Image_Jun_24_2026_08_38_24_PM_njwteu.png", sort_order: 4 },
      { image_url: "https://res.cloudinary.com/dhhzjeskm/image/upload/v1782308480/ChatGPT_Image_Jun_24_2026_08_38_35_PM_redsaz.png", sort_order: 5 },
    ],
  },
  {
    id: "4125b195-fdd9-4011-83a7-1d28f55f13be",
    slug: "lucky-koi-collection-6-fortune-colors-wallpapers",
    title: "Lucky Koi Collection – 6 Fortune Colors Wallpapers",
    category: "Spiritual Art",
    description: "ปลาคาร์ฟนำโชค 6 สีมงคล เสริมความอุดมสมบูรณ์ การเงินไหลมาเทมา และความสุขในครอบครัวตามศาสตร์ฮวงจุ้ย",
    cover_image: "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1781324411/ChatGPT_Image_Jun_13_2026_11_19_46_AM_ggsnhm.png",
    tags: ["koi fish", "lucky koi", "fortune", "prosperity", "abundance", "feng shui"],
    collection_images: [
      { image_url: "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1781324411/ChatGPT_Image_Jun_13_2026_11_19_46_AM_ggsnhm.png", sort_order: 0 },
      { image_url: "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1781324410/ChatGPT_Image_Jun_13_2026_11_19_49_AM_o1bvqx.png", sort_order: 1 },
      { image_url: "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1781324410/ChatGPT_Image_Jun_13_2026_11_19_51_AM_peaud6.png", sort_order: 2 },
      { image_url: "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1781324410/ChatGPT_Image_Jun_13_2026_11_19_56_AM_jvzn35.png", sort_order: 3 },
      { image_url: "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1781324410/ChatGPT_Image_Jun_13_2026_11_19_58_AM_xhscse.png", sort_order: 4 },
      { image_url: "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1781324410/ChatGPT_Image_Jun_13_2026_11_19_53_AM_avcgqz.png", sort_order: 5 },
    ],
  },
  {
    id: "e61ee207-a220-4ade-ad17-292c5162b4e9",
    slug: "luxury-ganesha-wallpapers-collection",
    title: "Luxury Ganesha Wallpapers Collection",
    category: "Spiritual Art",
    description: "วอลเปเปอร์พระพิฆเนศ ลักชูรีโกลด์ ดีไซน์หรูหราสง่างาม ประดับด้วยลวดลายดอกบัวและประกายคริสตัล เสริมความสำเร็จและขจัดอุปสรรคทั้งปวง",
    cover_image: "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780237287/ChatGPT_Image_31_%E0%B8%9E.%E0%B8%84._2569_21_21_14_aimgla.png",
    tags: ["ganesha", "lord ganesha", "luxury wallpaper", "gold", "prosperity"],
    collection_images: [
      { image_url: "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780237287/ChatGPT_Image_31_%E0%B8%9E.%E0%B8%84._2569_21_21_14_aimgla.png", sort_order: 0 },
      { image_url: "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780237289/ChatGPT_Image_31_%E0%B8%9E.%E0%B8%84._2569_21_21_09_odchuu.png", sort_order: 1 },
      { image_url: "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780237288/ChatGPT_Image_31_%E0%B8%9E.%E0%B8%84._2569_21_21_12_mbmxwl.png", sort_order: 2 },
    ],
  },
  {
    id: "3f908282-c2a6-4259-abf6-115d1f77d9c4",
    slug: "ganesha-3d-lucky-wallpapers-6-auspicious-colors-collection",
    title: "Ganesha 3D Lucky Wallpapers - 6 Auspicious Colors Collection",
    category: "Spiritual Art",
    description: "พระพิฆเนศ 3D สไตล์น่ารัก 6 สีมงคลประจำวันเกิด เสริมโชคลาภ เมตตามหานิยม และการสอบผ่าน/งานราบรื่น",
    cover_image: "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780932960/ChatGPT_Image_Jun_8_2026_10_35_44_PM_megxnj.png",
    tags: ["ganesha", "3d", "lucky wallpaper", "colors", "baby ganesha"],
    collection_images: [
      { image_url: "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780932960/ChatGPT_Image_Jun_8_2026_10_35_44_PM_megxnj.png", sort_order: 0 },
      { image_url: "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780932960/ChatGPT_Image_Jun_8_2026_10_35_53_PM_q0v13e.png", sort_order: 1 },
      { image_url: "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780932960/ChatGPT_Image_Jun_8_2026_10_35_48_PM_nxfnfb.png", sort_order: 2 },
      { image_url: "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780932960/ChatGPT_Image_Jun_8_2026_10_35_58_PM_p0e36r.png", sort_order: 3 },
      { image_url: "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780932960/ChatGPT_Image_Jun_8_2026_10_36_03_PM_r2ebt2.png", sort_order: 4 },
      { image_url: "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780932961/ChatGPT_Image_Jun_8_2026_10_36_07_PM_o8hczd.png", sort_order: 5 },
    ],
  },
  {
    id: "8c4b5ef9-2eb0-4be4-aa42-f874e44e1f6a",
    slug: "lakshmi-blessed-wallpapers-collection-2026",
    title: "Lakshmi Blessed Wallpapers Collection 2026",
    category: "Spiritual Art",
    description: "พระแม่ลักษมีประทานพร ดีไซน์โรสโกลด์ ไวท์โกลด์ และเทอร์ควอยซ์ เสริมเสน่ห์ ความรัก และความมั่งคั่งอย่างงดงาม",
    cover_image: "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780382285/ChatGPT_Image_2_%E0%B8%A1%E0%B8%B4.%E0%B8%A2._2569_13_37_21_f6feje.png",
    tags: ["lakshmi", "blessed", "rose-gold", "love", "wealth"],
    collection_images: [
      { image_url: "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780382285/ChatGPT_Image_2_%E0%B8%A1%E0%B8%B4.%E0%B8%A2._2569_13_37_21_f6feje.png", sort_order: 0 },
      { image_url: "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780382287/ChatGPT_Image_2_%E0%B8%A1%E0%B8%B4.%E0%B8%A2._2569_13_37_17_c33b8k.png", sort_order: 1 },
      { image_url: "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780382287/ChatGPT_Image_2_%E0%B8%A1%E0%B8%B4.%E0%B8%A2._2569_13_37_12_f60q5c.png", sort_order: 2 },
      { image_url: "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780382287/ChatGPT_Image_2_%E0%B8%A1%E0%B8%B4.%E0%B8%A2._2569_13_37_07_jnvq7p.png", sort_order: 3 },
    ],
  },
  {
    id: "b876b035-1325-496b-a823-dc56ecc42883",
    slug: "goddess-of-fortune-3d-premium-pink-collection",
    title: "Goddess of Fortune 3D Premium Pink Collection",
    category: "Spiritual Art",
    description: "พระแม่ประทานทรัพย์ 3D พรีเมียม พิงค์โกลด์ เสริมโชคลาภ เงินทอง และความอ่อนโยนเปี่ยมเมตตา",
    cover_image: "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1781190135/ChatGPT_Image_Jun_11_2026_09_56_29_PM_zdd67q.png",
    tags: ["goddess of fortune", "3d", "pink", "wealth", "prosperity"],
    collection_images: [
      { image_url: "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1781190135/ChatGPT_Image_Jun_11_2026_09_56_29_PM_zdd67q.png", sort_order: 0 },
      { image_url: "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1781190134/ChatGPT_Image_Jun_11_2026_09_56_44_PM_v3oegt.png", sort_order: 1 },
      { image_url: "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1781190134/ChatGPT_Image_Jun_11_2026_09_56_39_PM_bld94i.png", sort_order: 2 },
      { image_url: "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1781190134/ChatGPT_Image_Jun_11_2026_09_56_34_PM_v21j9v.png", sort_order: 3 },
    ],
  },
  {
    id: "ce984c2b-b563-4976-a4c0-b12f76813373",
    slug: "cute-ganesha-premium-wallpapers-collection",
    title: "Cute Ganesha Premium Wallpapers Collection",
    category: "Spiritual Art",
    description: "วอลเปเปอร์พระพิฆเนศ ลักชูรีพาสเทล 3D ศักดิ์สิทธิ์ เสริมความสำเร็จ ปัญญา ความมั่งคั่ง และเมตตามหานิยม",
    cover_image: "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780753189/ChatGPT_Image_6_%E0%B8%A1%E0%B8%B4.%E0%B8%A2._2569_20_38_15_uo28kb.png",
    tags: ["ganesha", "cute ganesha", "wallpaper", "spiritual", "prosperity", "wealth", "luxury", "3d art"],
    collection_images: [
      { image_url: "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780753189/ChatGPT_Image_6_%E0%B8%A1%E0%B8%B4.%E0%B8%A2._2569_20_38_15_uo28kb.png", sort_order: 0 },
      { image_url: "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780753205/ChatGPT_Image_6_%E0%B8%A1%E0%B8%B4.%E0%B8%A2._2569_20_38_21_ob42q0.png", sort_order: 1 },
      { image_url: "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780753187/ChatGPT_Image_6_%E0%B8%A1%E0%B8%B4.%E0%B8%A2._2569_20_38_24_lfx53e.png", sort_order: 2 },
      { image_url: "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780753187/ChatGPT_Image_6_%E0%B8%A1%E0%B8%B4.%E0%B8%A2._2569_20_38_27_m3dyai.png", sort_order: 3 },
      { image_url: "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780753186/ChatGPT_Image_6_%E0%B8%A1%E0%B8%B4.%E0%B8%A2._2569_20_38_29_fkdlpz.png", sort_order: 4 },
    ],
  },
  {
    id: "7a84bf1e-ecec-4e32-8581-eb140c3f2498",
    slug: "cute-ganesha-wallpapers-6-auspicious-color-collection",
    title: "Cute Ganesha Wallpapers – 6 Auspicious Color Collection",
    category: "Spiritual Art",
    description: "พระพิฆเนศ 6 สีมงคลประจำวันเกิด เสริมดวงชะตารอบด้าน ค้าขายคล่อง การงานราบรื่น ปัดเป่าอุปสรรคทั้งปวง",
    cover_image: "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780644605/ChatGPT_Image_5_%E0%B8%A1%E0%B8%B4.%E0%B8%A2._2569_14_28_14_yc2vys.png",
    tags: ["ganesha", "lucky colors", "auspicious", "wallpaper", "spiritual", "success"],
    collection_images: [
      { image_url: "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780644605/ChatGPT_Image_5_%E0%B8%A1%E0%B8%B4.%E0%B8%A2._2569_14_28_14_yc2vys.png", sort_order: 0 },
      { image_url: "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780644605/ChatGPT_Image_5_%E0%B8%A1%E0%B8%B4.%E0%B8%A2._2569_14_27_53_am1zaf.png", sort_order: 1 },
      { image_url: "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780644605/ChatGPT_Image_5_%E0%B8%A1%E0%B8%B4.%E0%B8%A2._2569_14_27_50_xntmtf.png", sort_order: 2 },
      { image_url: "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780644605/ChatGPT_Image_5_%E0%B8%A1%E0%B8%B4.%E0%B8%A2._2569_14_27_57_r4s5dj.png", sort_order: 3 },
      { image_url: "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780644605/ChatGPT_Image_5_%E0%B8%A1%E0%B8%B4.%E0%B8%A2._2569_14_27_55_pv9ei8.png", sort_order: 4 },
      { image_url: "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780644606/ChatGPT_Image_5_%E0%B8%A1%E0%B8%B4.%E0%B8%A2._2569_14_27_48_gyczc2.png", sort_order: 5 },
      { image_url: "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780644605/ChatGPT_Image_5_%E0%B8%A1%E0%B8%B4.%E0%B8%A2._2569_14_28_12_ruop2m.png", sort_order: 6 },
    ],
  },
];
