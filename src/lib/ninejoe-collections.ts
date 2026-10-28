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
  deityGroup: "caishen" | "vessavana" | "lakshmi" | "ganesha" | "durga" | "koi" | "spiritual";
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
  if (combined.includes("durga") || combined.includes("ทุรคา")) {
    return { group: "durga", label: "พระแม่ทุรคา (บารมี & ชัยชนะ)" };
  }
  if (combined.includes("koi") || combined.includes("คาร์ฟ") || combined.includes("ปลาคราฟ")) {
    return { group: "koi", label: "ปลาคาร์ฟมงคล (อุดมสมบูรณ์)" };
  }
  if (combined.includes("shiva") || combined.includes("ศิวะ")) {
    return { group: "spiritual", label: "พระศิวะมหาเทพ (มหาบารมี & ขจัดอุปสรรค)" };
  }
  if (combined.includes("nezha") || combined.includes("นาจา")) {
    return { group: "spiritual", label: "นาจาซาไท้จื้อ (ขจัดอุปสรรค & ชัยชนะ)" };
  }
  if (
    combined.includes("wukong") ||
    combined.includes("หงอคง") ||
    combined.includes("white ape") ||
    combined.includes("ape god") ||
    combined.includes("hanuman") ||
    combined.includes("หนุมาน")
  ) {
    return { group: "spiritual", label: "พญาวานร / หงอคง / หนุมาน (อำนาจ & คุ้มครอง)" };
  }
  if (
    combined.includes("solar") ||
    combined.includes("sun god") ||
    combined.includes("sun goddess") ||
    combined.includes("สุริยะ") ||
    combined.includes("สุริยัน")
  ) {
    return { group: "spiritual", label: "สุริยเทพ & เทพีสุริยะ (แสงทิพย์ & รุ่งโรจน์)" };
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
      // Merge live data with FALLBACK_COLLECTIONS so any new collections missing from Supabase still display
      const liveSlugs = new Set(spiritualOnly.map((c) => c.slug));
      const missingFromLive = FALLBACK_COLLECTIONS.filter((c) => !liveSlugs.has(c.slug));
      const merged = [...spiritualOnly, ...missingFromLive];
      memoryCache = merged;
      lastFetchTime = now;
      return merged;
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
    "id": "0b7f12b1-1704-4cea-a4f5-00bcfafb438c",
    "slug": "crystal-lotus-bal-ganesha",
    "title": "Crystal Lotus Bal Ganesha – พระพิฆเนศน้อยบัวแก้วคริสตัลออโรร่า",
    "description": "คอลเลกชันพระพิฆเนศน้อยประทับดอกบัวแก้วคริสตัลเรืองแสงออโรร่ามหาลาภ เสริมพลังปัญญา บารมีความสำเร็จ ขจัดอุปสรรคทั้งปวง และนำพาความสุขความร่มเย็น",
    "category": "🌟 Spiritual Art",
    "cover_image": "https://ninejoe.online/images/wallpapers/crystal-lotus-bal-ganesha/crystal-lotus-bal-ganesha-01.png",
    "tags": [
      "Spiritual",
      "Ganesha",
      "Bal Ganesha",
      "Crystal Lotus",
      "Aurora",
      "Wisdom",
      "Success"
    ],
    "collection_images": [
      {
        "alt_text": "พระพิฆเนศน้อยบัวแก้วคริสตัลออโรร่า #1 — Crystal Lotus Bal Ganesha – พระพิฆเนศน้อยบัวแก้วคริสตัลออโรร่า",
        "image_url": "https://ninejoe.online/images/wallpapers/crystal-lotus-bal-ganesha/crystal-lotus-bal-ganesha-01.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/crystal-lotus-bal-ganesha/crystal-lotus-bal-ganesha-01.png",
        "download_url": "https://ninejoe.online/images/wallpapers/crystal-lotus-bal-ganesha/crystal-lotus-bal-ganesha-01.png",
        "sort_order": 0
      },
      {
        "alt_text": "พระพิฆเนศน้อยบัวแก้วคริสตัลออโรร่า #2 — Crystal Lotus Bal Ganesha – พระพิฆเนศน้อยบัวแก้วคริสตัลออโรร่า",
        "image_url": "https://ninejoe.online/images/wallpapers/crystal-lotus-bal-ganesha/crystal-lotus-bal-ganesha-02.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/crystal-lotus-bal-ganesha/crystal-lotus-bal-ganesha-02.png",
        "download_url": "https://ninejoe.online/images/wallpapers/crystal-lotus-bal-ganesha/crystal-lotus-bal-ganesha-02.png",
        "sort_order": 1
      },
      {
        "alt_text": "พระพิฆเนศน้อยบัวแก้วคริสตัลออโรร่า #3 — Crystal Lotus Bal Ganesha – พระพิฆเนศน้อยบัวแก้วคริสตัลออโรร่า",
        "image_url": "https://ninejoe.online/images/wallpapers/crystal-lotus-bal-ganesha/crystal-lotus-bal-ganesha-03.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/crystal-lotus-bal-ganesha/crystal-lotus-bal-ganesha-03.png",
        "download_url": "https://ninejoe.online/images/wallpapers/crystal-lotus-bal-ganesha/crystal-lotus-bal-ganesha-03.png",
        "sort_order": 2
      },
      {
        "alt_text": "พระพิฆเนศน้อยบัวแก้วคริสตัลออโรร่า #4 — Crystal Lotus Bal Ganesha – พระพิฆเนศน้อยบัวแก้วคริสตัลออโรร่า",
        "image_url": "https://ninejoe.online/images/wallpapers/crystal-lotus-bal-ganesha/crystal-lotus-bal-ganesha-04.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/crystal-lotus-bal-ganesha/crystal-lotus-bal-ganesha-04.png",
        "download_url": "https://ninejoe.online/images/wallpapers/crystal-lotus-bal-ganesha/crystal-lotus-bal-ganesha-04.png",
        "sort_order": 3
      },
      {
        "alt_text": "พระพิฆเนศน้อยบัวแก้วคริสตัลออโรร่า #5 — Crystal Lotus Bal Ganesha – พระพิฆเนศน้อยบัวแก้วคริสตัลออโรร่า",
        "image_url": "https://ninejoe.online/images/wallpapers/crystal-lotus-bal-ganesha/crystal-lotus-bal-ganesha-05.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/crystal-lotus-bal-ganesha/crystal-lotus-bal-ganesha-05.png",
        "download_url": "https://ninejoe.online/images/wallpapers/crystal-lotus-bal-ganesha/crystal-lotus-bal-ganesha-05.png",
        "sort_order": 4
      },
      {
        "alt_text": "พระพิฆเนศน้อยบัวแก้วคริสตัลออโรร่า #6 — Crystal Lotus Bal Ganesha – พระพิฆเนศน้อยบัวแก้วคริสตัลออโรร่า",
        "image_url": "https://ninejoe.online/images/wallpapers/crystal-lotus-bal-ganesha/crystal-lotus-bal-ganesha-06.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/crystal-lotus-bal-ganesha/crystal-lotus-bal-ganesha-06.png",
        "download_url": "https://ninejoe.online/images/wallpapers/crystal-lotus-bal-ganesha/crystal-lotus-bal-ganesha-06.png",
        "sort_order": 5
      },
      {
        "alt_text": "พระพิฆเนศน้อยบัวแก้วคริสตัลออโรร่า #7 — Crystal Lotus Bal Ganesha – พระพิฆเนศน้อยบัวแก้วคริสตัลออโรร่า",
        "image_url": "https://ninejoe.online/images/wallpapers/crystal-lotus-bal-ganesha/crystal-lotus-bal-ganesha-07.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/crystal-lotus-bal-ganesha/crystal-lotus-bal-ganesha-07.png",
        "download_url": "https://ninejoe.online/images/wallpapers/crystal-lotus-bal-ganesha/crystal-lotus-bal-ganesha-07.png",
        "sort_order": 6
      },
      {
        "alt_text": "พระพิฆเนศน้อยบัวแก้วคริสตัลออโรร่า #8 — Crystal Lotus Bal Ganesha – พระพิฆเนศน้อยบัวแก้วคริสตัลออโรร่า",
        "image_url": "https://ninejoe.online/images/wallpapers/crystal-lotus-bal-ganesha/crystal-lotus-bal-ganesha-08.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/crystal-lotus-bal-ganesha/crystal-lotus-bal-ganesha-08.png",
        "download_url": "https://ninejoe.online/images/wallpapers/crystal-lotus-bal-ganesha/crystal-lotus-bal-ganesha-08.png",
        "sort_order": 7
      }
    ]
  },
  {
    "id": "aec658d3-4739-401f-a4fe-84bfec425331",
    "slug": "mythic-sun-wukong-golden-ember",
    "title": "Mythic Sun Wukong – พญาวานรทองคำเพลิงชาญชัย",
    "description": "คอลเลกชันซุนหงอคง พญาวานรทองคำเพลิง สไตล์หมึกจีนโบราณประกายเปลวทอง เสริมพลังอำนาจ ชัยชนะเหนืออุปสรรค ความเฉลียวฉลาด และความกล้าหาญไร้พ่าย",
    "category": "🌟 Spiritual Art",
    "cover_image": "https://ninejoe.online/images/wallpapers/mythic-sun-wukong-golden-ember/mythic-sun-wukong-golden-ember-01.png",
    "tags": [
      "Spiritual",
      "Sun Wukong",
      "Monkey King",
      "Golden Ink",
      "Power",
      "Victory",
      "Courage"
    ],
    "collection_images": [
      {
        "alt_text": "พญาวานรทองคำเพลิง ซุนหงอคง #1 — Mythic Sun Wukong – พญาวานรทองคำเพลิงชาญชัย",
        "image_url": "https://ninejoe.online/images/wallpapers/mythic-sun-wukong-golden-ember/mythic-sun-wukong-golden-ember-01.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/mythic-sun-wukong-golden-ember/mythic-sun-wukong-golden-ember-01.png",
        "download_url": "https://ninejoe.online/images/wallpapers/mythic-sun-wukong-golden-ember/mythic-sun-wukong-golden-ember-01.png",
        "sort_order": 0
      },
      {
        "alt_text": "พญาวานรทองคำเพลิง ซุนหงอคง #2 — Mythic Sun Wukong – พญาวานรทองคำเพลิงชาญชัย",
        "image_url": "https://ninejoe.online/images/wallpapers/mythic-sun-wukong-golden-ember/mythic-sun-wukong-golden-ember-02.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/mythic-sun-wukong-golden-ember/mythic-sun-wukong-golden-ember-02.png",
        "download_url": "https://ninejoe.online/images/wallpapers/mythic-sun-wukong-golden-ember/mythic-sun-wukong-golden-ember-02.png",
        "sort_order": 1
      },
      {
        "alt_text": "พญาวานรทองคำเพลิง ซุนหงอคง #3 — Mythic Sun Wukong – พญาวานรทองคำเพลิงชาญชัย",
        "image_url": "https://ninejoe.online/images/wallpapers/mythic-sun-wukong-golden-ember/mythic-sun-wukong-golden-ember-03.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/mythic-sun-wukong-golden-ember/mythic-sun-wukong-golden-ember-03.png",
        "download_url": "https://ninejoe.online/images/wallpapers/mythic-sun-wukong-golden-ember/mythic-sun-wukong-golden-ember-03.png",
        "sort_order": 2
      },
      {
        "alt_text": "พญาวานรทองคำเพลิง ซุนหงอคง #4 — Mythic Sun Wukong – พญาวานรทองคำเพลิงชาญชัย",
        "image_url": "https://ninejoe.online/images/wallpapers/mythic-sun-wukong-golden-ember/mythic-sun-wukong-golden-ember-04.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/mythic-sun-wukong-golden-ember/mythic-sun-wukong-golden-ember-04.png",
        "download_url": "https://ninejoe.online/images/wallpapers/mythic-sun-wukong-golden-ember/mythic-sun-wukong-golden-ember-04.png",
        "sort_order": 3
      },
      {
        "alt_text": "พญาวานรทองคำเพลิง ซุนหงอคง #5 — Mythic Sun Wukong – พญาวานรทองคำเพลิงชาญชัย",
        "image_url": "https://ninejoe.online/images/wallpapers/mythic-sun-wukong-golden-ember/mythic-sun-wukong-golden-ember-05.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/mythic-sun-wukong-golden-ember/mythic-sun-wukong-golden-ember-05.png",
        "download_url": "https://ninejoe.online/images/wallpapers/mythic-sun-wukong-golden-ember/mythic-sun-wukong-golden-ember-05.png",
        "sort_order": 4
      },
      {
        "alt_text": "พญาวานรทองคำเพลิง ซุนหงอคง #6 — Mythic Sun Wukong – พญาวานรทองคำเพลิงชาญชัย",
        "image_url": "https://ninejoe.online/images/wallpapers/mythic-sun-wukong-golden-ember/mythic-sun-wukong-golden-ember-06.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/mythic-sun-wukong-golden-ember/mythic-sun-wukong-golden-ember-06.png",
        "download_url": "https://ninejoe.online/images/wallpapers/mythic-sun-wukong-golden-ember/mythic-sun-wukong-golden-ember-06.png",
        "sort_order": 5
      },
      {
        "alt_text": "พญาวานรทองคำเพลิง ซุนหงอคง #7 — Mythic Sun Wukong – พญาวานรทองคำเพลิงชาญชัย",
        "image_url": "https://ninejoe.online/images/wallpapers/mythic-sun-wukong-golden-ember/mythic-sun-wukong-golden-ember-07.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/mythic-sun-wukong-golden-ember/mythic-sun-wukong-golden-ember-07.png",
        "download_url": "https://ninejoe.online/images/wallpapers/mythic-sun-wukong-golden-ember/mythic-sun-wukong-golden-ember-07.png",
        "sort_order": 6
      },
      {
        "alt_text": "พญาวานรทองคำเพลิง ซุนหงอคง #8 — Mythic Sun Wukong – พญาวานรทองคำเพลิงชาญชัย",
        "image_url": "https://ninejoe.online/images/wallpapers/mythic-sun-wukong-golden-ember/mythic-sun-wukong-golden-ember-08.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/mythic-sun-wukong-golden-ember/mythic-sun-wukong-golden-ember-08.png",
        "download_url": "https://ninejoe.online/images/wallpapers/mythic-sun-wukong-golden-ember/mythic-sun-wukong-golden-ember-08.png",
        "sort_order": 7
      },
      {
        "alt_text": "พญาวานรทองคำเพลิง ซุนหงอคง #9 — Mythic Sun Wukong – พญาวานรทองคำเพลิงชาญชัย",
        "image_url": "https://ninejoe.online/images/wallpapers/mythic-sun-wukong-golden-ember/mythic-sun-wukong-golden-ember-09.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/mythic-sun-wukong-golden-ember/mythic-sun-wukong-golden-ember-09.png",
        "download_url": "https://ninejoe.online/images/wallpapers/mythic-sun-wukong-golden-ember/mythic-sun-wukong-golden-ember-09.png",
        "sort_order": 8
      },
      {
        "alt_text": "พญาวานรทองคำเพลิง ซุนหงอคง #10 — Mythic Sun Wukong – พญาวานรทองคำเพลิงชาญชัย",
        "image_url": "https://ninejoe.online/images/wallpapers/mythic-sun-wukong-golden-ember/mythic-sun-wukong-golden-ember-10.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/mythic-sun-wukong-golden-ember/mythic-sun-wukong-golden-ember-10.png",
        "download_url": "https://ninejoe.online/images/wallpapers/mythic-sun-wukong-golden-ember/mythic-sun-wukong-golden-ember-10.png",
        "sort_order": 9
      }
    ]
  },
  {
    "id": "512c681d-2cfc-4fd7-ac1f-2ae33af6d315",
    "slug": "radiant-golden-lotus-ganesha",
    "title": "Radiant Golden Lotus Ganesha – พระพิฆเนศบัวทองคำมหาลาภ",
    "description": "คอลเลกชันพระพิฆเนศประทับบัวทองคำมหาลาภ เปล่งรัศมีทองคำทอประกายแห่งความอุดมสมบูรณ์ เสริมโชคลาภ เงินทองไหลมาเทมา และธุรกิจการค้ารุ่งเรือง",
    "category": "🌟 Spiritual Art",
    "cover_image": "https://ninejoe.online/images/wallpapers/radiant-golden-lotus-ganesha/radiant-golden-lotus-ganesha-01.png",
    "tags": [
      "Spiritual",
      "Ganesha",
      "Golden Lotus",
      "Wealth",
      "Prosperity",
      "Abundance"
    ],
    "collection_images": [
      {
        "alt_text": "พระพิฆเนศบัวทองคำมหาลาภ #1 — Radiant Golden Lotus Ganesha – พระพิฆเนศบัวทองคำมหาลาภ",
        "image_url": "https://ninejoe.online/images/wallpapers/radiant-golden-lotus-ganesha/radiant-golden-lotus-ganesha-01.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/radiant-golden-lotus-ganesha/radiant-golden-lotus-ganesha-01.png",
        "download_url": "https://ninejoe.online/images/wallpapers/radiant-golden-lotus-ganesha/radiant-golden-lotus-ganesha-01.png",
        "sort_order": 0
      },
      {
        "alt_text": "พระพิฆเนศบัวทองคำมหาลาภ #2 — Radiant Golden Lotus Ganesha – พระพิฆเนศบัวทองคำมหาลาภ",
        "image_url": "https://ninejoe.online/images/wallpapers/radiant-golden-lotus-ganesha/radiant-golden-lotus-ganesha-02.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/radiant-golden-lotus-ganesha/radiant-golden-lotus-ganesha-02.png",
        "download_url": "https://ninejoe.online/images/wallpapers/radiant-golden-lotus-ganesha/radiant-golden-lotus-ganesha-02.png",
        "sort_order": 1
      },
      {
        "alt_text": "พระพิฆเนศบัวทองคำมหาลาภ #3 — Radiant Golden Lotus Ganesha – พระพิฆเนศบัวทองคำมหาลาภ",
        "image_url": "https://ninejoe.online/images/wallpapers/radiant-golden-lotus-ganesha/radiant-golden-lotus-ganesha-03.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/radiant-golden-lotus-ganesha/radiant-golden-lotus-ganesha-03.png",
        "download_url": "https://ninejoe.online/images/wallpapers/radiant-golden-lotus-ganesha/radiant-golden-lotus-ganesha-03.png",
        "sort_order": 2
      },
      {
        "alt_text": "พระพิฆเนศบัวทองคำมหาลาภ #4 — Radiant Golden Lotus Ganesha – พระพิฆเนศบัวทองคำมหาลาภ",
        "image_url": "https://ninejoe.online/images/wallpapers/radiant-golden-lotus-ganesha/radiant-golden-lotus-ganesha-04.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/radiant-golden-lotus-ganesha/radiant-golden-lotus-ganesha-04.png",
        "download_url": "https://ninejoe.online/images/wallpapers/radiant-golden-lotus-ganesha/radiant-golden-lotus-ganesha-04.png",
        "sort_order": 3
      },
      {
        "alt_text": "พระพิฆเนศบัวทองคำมหาลาภ #5 — Radiant Golden Lotus Ganesha – พระพิฆเนศบัวทองคำมหาลาภ",
        "image_url": "https://ninejoe.online/images/wallpapers/radiant-golden-lotus-ganesha/radiant-golden-lotus-ganesha-05.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/radiant-golden-lotus-ganesha/radiant-golden-lotus-ganesha-05.png",
        "download_url": "https://ninejoe.online/images/wallpapers/radiant-golden-lotus-ganesha/radiant-golden-lotus-ganesha-05.png",
        "sort_order": 4
      },
      {
        "alt_text": "พระพิฆเนศบัวทองคำมหาลาภ #6 — Radiant Golden Lotus Ganesha – พระพิฆเนศบัวทองคำมหาลาภ",
        "image_url": "https://ninejoe.online/images/wallpapers/radiant-golden-lotus-ganesha/radiant-golden-lotus-ganesha-06.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/radiant-golden-lotus-ganesha/radiant-golden-lotus-ganesha-06.png",
        "download_url": "https://ninejoe.online/images/wallpapers/radiant-golden-lotus-ganesha/radiant-golden-lotus-ganesha-06.png",
        "sort_order": 5
      },
      {
        "alt_text": "พระพิฆเนศบัวทองคำมหาลาภ #7 — Radiant Golden Lotus Ganesha – พระพิฆเนศบัวทองคำมหาลาภ",
        "image_url": "https://ninejoe.online/images/wallpapers/radiant-golden-lotus-ganesha/radiant-golden-lotus-ganesha-07.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/radiant-golden-lotus-ganesha/radiant-golden-lotus-ganesha-07.png",
        "download_url": "https://ninejoe.online/images/wallpapers/radiant-golden-lotus-ganesha/radiant-golden-lotus-ganesha-07.png",
        "sort_order": 6
      },
      {
        "alt_text": "พระพิฆเนศบัวทองคำมหาลาภ #8 — Radiant Golden Lotus Ganesha – พระพิฆเนศบัวทองคำมหาลาภ",
        "image_url": "https://ninejoe.online/images/wallpapers/radiant-golden-lotus-ganesha/radiant-golden-lotus-ganesha-08.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/radiant-golden-lotus-ganesha/radiant-golden-lotus-ganesha-08.png",
        "download_url": "https://ninejoe.online/images/wallpapers/radiant-golden-lotus-ganesha/radiant-golden-lotus-ganesha-08.png",
        "sort_order": 7
      },
      {
        "alt_text": "พระพิฆเนศบัวทองคำมหาลาภ #9 — Radiant Golden Lotus Ganesha – พระพิฆเนศบัวทองคำมหาลาภ",
        "image_url": "https://ninejoe.online/images/wallpapers/radiant-golden-lotus-ganesha/radiant-golden-lotus-ganesha-09.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/radiant-golden-lotus-ganesha/radiant-golden-lotus-ganesha-09.png",
        "download_url": "https://ninejoe.online/images/wallpapers/radiant-golden-lotus-ganesha/radiant-golden-lotus-ganesha-09.png",
        "sort_order": 8
      },
      {
        "alt_text": "พระพิฆเนศบัวทองคำมหาลาภ #10 — Radiant Golden Lotus Ganesha – พระพิฆเนศบัวทองคำมหาลาภ",
        "image_url": "https://ninejoe.online/images/wallpapers/radiant-golden-lotus-ganesha/radiant-golden-lotus-ganesha-10.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/radiant-golden-lotus-ganesha/radiant-golden-lotus-ganesha-10.png",
        "download_url": "https://ninejoe.online/images/wallpapers/radiant-golden-lotus-ganesha/radiant-golden-lotus-ganesha-10.png",
        "sort_order": 9
      }
    ]
  },
  {
    "id": "202b6b05-7843-47a4-a877-0d4950d0b5d9",
    "slug": "celestial-white-ape-god",
    "title": "Celestial White Ape God – พญาวานรเผือกหมึกทองคำ",
    "description": "คอลเลกชันพญาวานรเผือกหมึกทองคำ วิจิตรศิลป์พู่กันจีนโบราณ สัญลักษณ์แห่งความจงรักภักดี แคล้วคลาดปลอดภัย ปกป้องคุ้มครอง และความสำเร็จอันรุ่งโรจน์",
    "category": "🌟 Spiritual Art",
    "cover_image": "https://ninejoe.online/images/wallpapers/celestial-white-ape-god/celestial-white-ape-god-01.png",
    "tags": [
      "Spiritual",
      "Hanuman",
      "Wukong",
      "White Ape",
      "Golden Ink",
      "Protection",
      "Success"
    ],
    "collection_images": [
      {
        "alt_text": "พญาวานรเผือกหมึกทองคำนำโชค #1 — Celestial White Ape God – พญาวานรเผือกหมึกทองคำ",
        "image_url": "https://ninejoe.online/images/wallpapers/celestial-white-ape-god/celestial-white-ape-god-01.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/celestial-white-ape-god/celestial-white-ape-god-01.png",
        "download_url": "https://ninejoe.online/images/wallpapers/celestial-white-ape-god/celestial-white-ape-god-01.png",
        "sort_order": 0
      },
      {
        "alt_text": "พญาวานรเผือกหมึกทองคำนำโชค #2 — Celestial White Ape God – พญาวานรเผือกหมึกทองคำ",
        "image_url": "https://ninejoe.online/images/wallpapers/celestial-white-ape-god/celestial-white-ape-god-02.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/celestial-white-ape-god/celestial-white-ape-god-02.png",
        "download_url": "https://ninejoe.online/images/wallpapers/celestial-white-ape-god/celestial-white-ape-god-02.png",
        "sort_order": 1
      },
      {
        "alt_text": "พญาวานรเผือกหมึกทองคำนำโชค #3 — Celestial White Ape God – พญาวานรเผือกหมึกทองคำ",
        "image_url": "https://ninejoe.online/images/wallpapers/celestial-white-ape-god/celestial-white-ape-god-03.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/celestial-white-ape-god/celestial-white-ape-god-03.png",
        "download_url": "https://ninejoe.online/images/wallpapers/celestial-white-ape-god/celestial-white-ape-god-03.png",
        "sort_order": 2
      },
      {
        "alt_text": "พญาวานรเผือกหมึกทองคำนำโชค #4 — Celestial White Ape God – พญาวานรเผือกหมึกทองคำ",
        "image_url": "https://ninejoe.online/images/wallpapers/celestial-white-ape-god/celestial-white-ape-god-04.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/celestial-white-ape-god/celestial-white-ape-god-04.png",
        "download_url": "https://ninejoe.online/images/wallpapers/celestial-white-ape-god/celestial-white-ape-god-04.png",
        "sort_order": 3
      },
      {
        "alt_text": "พญาวานรเผือกหมึกทองคำนำโชค #5 — Celestial White Ape God – พญาวานรเผือกหมึกทองคำ",
        "image_url": "https://ninejoe.online/images/wallpapers/celestial-white-ape-god/celestial-white-ape-god-05.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/celestial-white-ape-god/celestial-white-ape-god-05.png",
        "download_url": "https://ninejoe.online/images/wallpapers/celestial-white-ape-god/celestial-white-ape-god-05.png",
        "sort_order": 4
      },
      {
        "alt_text": "พญาวานรเผือกหมึกทองคำนำโชค #6 — Celestial White Ape God – พญาวานรเผือกหมึกทองคำ",
        "image_url": "https://ninejoe.online/images/wallpapers/celestial-white-ape-god/celestial-white-ape-god-06.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/celestial-white-ape-god/celestial-white-ape-god-06.png",
        "download_url": "https://ninejoe.online/images/wallpapers/celestial-white-ape-god/celestial-white-ape-god-06.png",
        "sort_order": 5
      },
      {
        "alt_text": "พญาวานรเผือกหมึกทองคำนำโชค #7 — Celestial White Ape God – พญาวานรเผือกหมึกทองคำ",
        "image_url": "https://ninejoe.online/images/wallpapers/celestial-white-ape-god/celestial-white-ape-god-07.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/celestial-white-ape-god/celestial-white-ape-god-07.png",
        "download_url": "https://ninejoe.online/images/wallpapers/celestial-white-ape-god/celestial-white-ape-god-07.png",
        "sort_order": 6
      },
      {
        "alt_text": "พญาวานรเผือกหมึกทองคำนำโชค #8 — Celestial White Ape God – พญาวานรเผือกหมึกทองคำ",
        "image_url": "https://ninejoe.online/images/wallpapers/celestial-white-ape-god/celestial-white-ape-god-08.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/celestial-white-ape-god/celestial-white-ape-god-08.png",
        "download_url": "https://ninejoe.online/images/wallpapers/celestial-white-ape-god/celestial-white-ape-god-08.png",
        "sort_order": 7
      },
      {
        "alt_text": "พญาวานรเผือกหมึกทองคำนำโชค #9 — Celestial White Ape God – พญาวานรเผือกหมึกทองคำ",
        "image_url": "https://ninejoe.online/images/wallpapers/celestial-white-ape-god/celestial-white-ape-god-09.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/celestial-white-ape-god/celestial-white-ape-god-09.png",
        "download_url": "https://ninejoe.online/images/wallpapers/celestial-white-ape-god/celestial-white-ape-god-09.png",
        "sort_order": 8
      },
      {
        "alt_text": "พญาวานรเผือกหมึกทองคำนำโชค #10 — Celestial White Ape God – พญาวานรเผือกหมึกทองคำ",
        "image_url": "https://ninejoe.online/images/wallpapers/celestial-white-ape-god/celestial-white-ape-god-10.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/celestial-white-ape-god/celestial-white-ape-god-10.png",
        "download_url": "https://ninejoe.online/images/wallpapers/celestial-white-ape-god/celestial-white-ape-god-10.png",
        "sort_order": 9
      }
    ]
  },
  {
    "id": "82ccdf67-2621-453c-acb5-c23cd0e88fac",
    "slug": "cosmic-sapphire-maha-ganesha",
    "title": "Cosmic Sapphire Maha Ganesha – พระพิฆเนศกายแซฟไฟร์จักรวาล",
    "description": "คอลเลกชันพระพิฆเนศกายสีน้ำเงินแซฟไฟร์ประกายดาราจักร มหาพลังคอสมิกแห่งสติปัญญา บารมี และการเปิดขุมทรัพย์แห่งความมั่งคั่งมหาศาล",
    "category": "🌟 Spiritual Art",
    "cover_image": "https://ninejoe.online/images/wallpapers/cosmic-sapphire-maha-ganesha/cosmic-sapphire-maha-ganesha-01.png",
    "tags": [
      "Spiritual",
      "Ganesha",
      "Sapphire",
      "Cosmic",
      "Galaxy",
      "Wisdom",
      "Fortune"
    ],
    "collection_images": [
      {
        "alt_text": "พระพิฆเนศกายแซฟไฟร์จักรวาล #1 — Cosmic Sapphire Maha Ganesha – พระพิฆเนศกายแซฟไฟร์จักรวาล",
        "image_url": "https://ninejoe.online/images/wallpapers/cosmic-sapphire-maha-ganesha/cosmic-sapphire-maha-ganesha-01.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/cosmic-sapphire-maha-ganesha/cosmic-sapphire-maha-ganesha-01.png",
        "download_url": "https://ninejoe.online/images/wallpapers/cosmic-sapphire-maha-ganesha/cosmic-sapphire-maha-ganesha-01.png",
        "sort_order": 0
      },
      {
        "alt_text": "พระพิฆเนศกายแซฟไฟร์จักรวาล #2 — Cosmic Sapphire Maha Ganesha – พระพิฆเนศกายแซฟไฟร์จักรวาล",
        "image_url": "https://ninejoe.online/images/wallpapers/cosmic-sapphire-maha-ganesha/cosmic-sapphire-maha-ganesha-02.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/cosmic-sapphire-maha-ganesha/cosmic-sapphire-maha-ganesha-02.png",
        "download_url": "https://ninejoe.online/images/wallpapers/cosmic-sapphire-maha-ganesha/cosmic-sapphire-maha-ganesha-02.png",
        "sort_order": 1
      },
      {
        "alt_text": "พระพิฆเนศกายแซฟไฟร์จักรวาล #3 — Cosmic Sapphire Maha Ganesha – พระพิฆเนศกายแซฟไฟร์จักรวาล",
        "image_url": "https://ninejoe.online/images/wallpapers/cosmic-sapphire-maha-ganesha/cosmic-sapphire-maha-ganesha-03.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/cosmic-sapphire-maha-ganesha/cosmic-sapphire-maha-ganesha-03.png",
        "download_url": "https://ninejoe.online/images/wallpapers/cosmic-sapphire-maha-ganesha/cosmic-sapphire-maha-ganesha-03.png",
        "sort_order": 2
      },
      {
        "alt_text": "พระพิฆเนศกายแซฟไฟร์จักรวาล #4 — Cosmic Sapphire Maha Ganesha – พระพิฆเนศกายแซฟไฟร์จักรวาล",
        "image_url": "https://ninejoe.online/images/wallpapers/cosmic-sapphire-maha-ganesha/cosmic-sapphire-maha-ganesha-04.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/cosmic-sapphire-maha-ganesha/cosmic-sapphire-maha-ganesha-04.png",
        "download_url": "https://ninejoe.online/images/wallpapers/cosmic-sapphire-maha-ganesha/cosmic-sapphire-maha-ganesha-04.png",
        "sort_order": 3
      },
      {
        "alt_text": "พระพิฆเนศกายแซฟไฟร์จักรวาล #5 — Cosmic Sapphire Maha Ganesha – พระพิฆเนศกายแซฟไฟร์จักรวาล",
        "image_url": "https://ninejoe.online/images/wallpapers/cosmic-sapphire-maha-ganesha/cosmic-sapphire-maha-ganesha-05.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/cosmic-sapphire-maha-ganesha/cosmic-sapphire-maha-ganesha-05.png",
        "download_url": "https://ninejoe.online/images/wallpapers/cosmic-sapphire-maha-ganesha/cosmic-sapphire-maha-ganesha-05.png",
        "sort_order": 4
      },
      {
        "alt_text": "พระพิฆเนศกายแซฟไฟร์จักรวาล #6 — Cosmic Sapphire Maha Ganesha – พระพิฆเนศกายแซฟไฟร์จักรวาล",
        "image_url": "https://ninejoe.online/images/wallpapers/cosmic-sapphire-maha-ganesha/cosmic-sapphire-maha-ganesha-06.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/cosmic-sapphire-maha-ganesha/cosmic-sapphire-maha-ganesha-06.png",
        "download_url": "https://ninejoe.online/images/wallpapers/cosmic-sapphire-maha-ganesha/cosmic-sapphire-maha-ganesha-06.png",
        "sort_order": 5
      },
      {
        "alt_text": "พระพิฆเนศกายแซฟไฟร์จักรวาล #7 — Cosmic Sapphire Maha Ganesha – พระพิฆเนศกายแซฟไฟร์จักรวาล",
        "image_url": "https://ninejoe.online/images/wallpapers/cosmic-sapphire-maha-ganesha/cosmic-sapphire-maha-ganesha-07.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/cosmic-sapphire-maha-ganesha/cosmic-sapphire-maha-ganesha-07.png",
        "download_url": "https://ninejoe.online/images/wallpapers/cosmic-sapphire-maha-ganesha/cosmic-sapphire-maha-ganesha-07.png",
        "sort_order": 6
      },
      {
        "alt_text": "พระพิฆเนศกายแซฟไฟร์จักรวาล #8 — Cosmic Sapphire Maha Ganesha – พระพิฆเนศกายแซฟไฟร์จักรวาล",
        "image_url": "https://ninejoe.online/images/wallpapers/cosmic-sapphire-maha-ganesha/cosmic-sapphire-maha-ganesha-08.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/cosmic-sapphire-maha-ganesha/cosmic-sapphire-maha-ganesha-08.png",
        "download_url": "https://ninejoe.online/images/wallpapers/cosmic-sapphire-maha-ganesha/cosmic-sapphire-maha-ganesha-08.png",
        "sort_order": 7
      },
      {
        "alt_text": "พระพิฆเนศกายแซฟไฟร์จักรวาล #9 — Cosmic Sapphire Maha Ganesha – พระพิฆเนศกายแซฟไฟร์จักรวาล",
        "image_url": "https://ninejoe.online/images/wallpapers/cosmic-sapphire-maha-ganesha/cosmic-sapphire-maha-ganesha-09.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/cosmic-sapphire-maha-ganesha/cosmic-sapphire-maha-ganesha-09.png",
        "download_url": "https://ninejoe.online/images/wallpapers/cosmic-sapphire-maha-ganesha/cosmic-sapphire-maha-ganesha-09.png",
        "sort_order": 8
      },
      {
        "alt_text": "พระพิฆเนศกายแซฟไฟร์จักรวาล #10 — Cosmic Sapphire Maha Ganesha – พระพิฆเนศกายแซฟไฟร์จักรวาล",
        "image_url": "https://ninejoe.online/images/wallpapers/cosmic-sapphire-maha-ganesha/cosmic-sapphire-maha-ganesha-10.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/cosmic-sapphire-maha-ganesha/cosmic-sapphire-maha-ganesha-10.png",
        "download_url": "https://ninejoe.online/images/wallpapers/cosmic-sapphire-maha-ganesha/cosmic-sapphire-maha-ganesha-10.png",
        "sort_order": 9
      }
    ]
  },
  {
    "id": "4c7907d5-f6be-48f8-a00a-65d91216a118",
    "slug": "vibrant-water-splash-ganesha",
    "title": "Vibrant Water-Splash Dancing Ganesha – พระพิฆเนศร่ายรำสายธาราสวรรค์",
    "description": "คอลเลกชันพระพิฆเนศปางร่ายรำนาฏราช สาดละอองน้ำสายรุ้งเปี่ยมชีวิตชีวา เสริมพลังความสุข ความคิดสร้างสรรค์ โชคลาภสดใส และความสมปรารถนาในทุกกิจการ",
    "category": "🌟 Spiritual Art",
    "cover_image": "https://ninejoe.online/images/wallpapers/vibrant-water-splash-ganesha/water-splash-dancing-ganesha-01.png",
    "tags": [
      "Spiritual",
      "Ganesha",
      "Dancing Ganesha",
      "Water Splash",
      "Joy",
      "Vitality",
      "Prosperity"
    ],
    "collection_images": [
      {
        "alt_text": "พระพิฆเนศปางร่ายรำนาฏราชสาดสายธาราสวรรค์ #1 — Vibrant Water-Splash Dancing Ganesha – พระพิฆเนศร่ายรำสายธาราสวรรค์",
        "image_url": "https://ninejoe.online/images/wallpapers/vibrant-water-splash-ganesha/water-splash-dancing-ganesha-01.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/vibrant-water-splash-ganesha/water-splash-dancing-ganesha-01.png",
        "download_url": "https://ninejoe.online/images/wallpapers/vibrant-water-splash-ganesha/water-splash-dancing-ganesha-01.png",
        "sort_order": 0
      },
      {
        "alt_text": "พระพิฆเนศปางร่ายรำนาฏราชสาดสายธาราสวรรค์ #2 — Vibrant Water-Splash Dancing Ganesha – พระพิฆเนศร่ายรำสายธาราสวรรค์",
        "image_url": "https://ninejoe.online/images/wallpapers/vibrant-water-splash-ganesha/water-splash-dancing-ganesha-02.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/vibrant-water-splash-ganesha/water-splash-dancing-ganesha-02.png",
        "download_url": "https://ninejoe.online/images/wallpapers/vibrant-water-splash-ganesha/water-splash-dancing-ganesha-02.png",
        "sort_order": 1
      },
      {
        "alt_text": "พระพิฆเนศปางร่ายรำนาฏราชสาดสายธาราสวรรค์ #3 — Vibrant Water-Splash Dancing Ganesha – พระพิฆเนศร่ายรำสายธาราสวรรค์",
        "image_url": "https://ninejoe.online/images/wallpapers/vibrant-water-splash-ganesha/water-splash-dancing-ganesha-03.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/vibrant-water-splash-ganesha/water-splash-dancing-ganesha-03.png",
        "download_url": "https://ninejoe.online/images/wallpapers/vibrant-water-splash-ganesha/water-splash-dancing-ganesha-03.png",
        "sort_order": 2
      },
      {
        "alt_text": "พระพิฆเนศปางร่ายรำนาฏราชสาดสายธาราสวรรค์ #4 — Vibrant Water-Splash Dancing Ganesha – พระพิฆเนศร่ายรำสายธาราสวรรค์",
        "image_url": "https://ninejoe.online/images/wallpapers/vibrant-water-splash-ganesha/water-splash-dancing-ganesha-04.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/vibrant-water-splash-ganesha/water-splash-dancing-ganesha-04.png",
        "download_url": "https://ninejoe.online/images/wallpapers/vibrant-water-splash-ganesha/water-splash-dancing-ganesha-04.png",
        "sort_order": 3
      },
      {
        "alt_text": "พระพิฆเนศปางร่ายรำนาฏราชสาดสายธาราสวรรค์ #5 — Vibrant Water-Splash Dancing Ganesha – พระพิฆเนศร่ายรำสายธาราสวรรค์",
        "image_url": "https://ninejoe.online/images/wallpapers/vibrant-water-splash-ganesha/water-splash-dancing-ganesha-05.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/vibrant-water-splash-ganesha/water-splash-dancing-ganesha-05.png",
        "download_url": "https://ninejoe.online/images/wallpapers/vibrant-water-splash-ganesha/water-splash-dancing-ganesha-05.png",
        "sort_order": 4
      },
      {
        "alt_text": "พระพิฆเนศปางร่ายรำนาฏราชสาดสายธาราสวรรค์ #6 — Vibrant Water-Splash Dancing Ganesha – พระพิฆเนศร่ายรำสายธาราสวรรค์",
        "image_url": "https://ninejoe.online/images/wallpapers/vibrant-water-splash-ganesha/water-splash-dancing-ganesha-06.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/vibrant-water-splash-ganesha/water-splash-dancing-ganesha-06.png",
        "download_url": "https://ninejoe.online/images/wallpapers/vibrant-water-splash-ganesha/water-splash-dancing-ganesha-06.png",
        "sort_order": 5
      },
      {
        "alt_text": "พระพิฆเนศปางร่ายรำนาฏราชสาดสายธาราสวรรค์ #7 — Vibrant Water-Splash Dancing Ganesha – พระพิฆเนศร่ายรำสายธาราสวรรค์",
        "image_url": "https://ninejoe.online/images/wallpapers/vibrant-water-splash-ganesha/water-splash-dancing-ganesha-07.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/vibrant-water-splash-ganesha/water-splash-dancing-ganesha-07.png",
        "download_url": "https://ninejoe.online/images/wallpapers/vibrant-water-splash-ganesha/water-splash-dancing-ganesha-07.png",
        "sort_order": 6
      },
      {
        "alt_text": "พระพิฆเนศปางร่ายรำนาฏราชสาดสายธาราสวรรค์ #8 — Vibrant Water-Splash Dancing Ganesha – พระพิฆเนศร่ายรำสายธาราสวรรค์",
        "image_url": "https://ninejoe.online/images/wallpapers/vibrant-water-splash-ganesha/water-splash-dancing-ganesha-08.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/vibrant-water-splash-ganesha/water-splash-dancing-ganesha-08.png",
        "download_url": "https://ninejoe.online/images/wallpapers/vibrant-water-splash-ganesha/water-splash-dancing-ganesha-08.png",
        "sort_order": 7
      },
      {
        "alt_text": "พระพิฆเนศปางร่ายรำนาฏราชสาดสายธาราสวรรค์ #9 — Vibrant Water-Splash Dancing Ganesha – พระพิฆเนศร่ายรำสายธาราสวรรค์",
        "image_url": "https://ninejoe.online/images/wallpapers/vibrant-water-splash-ganesha/water-splash-dancing-ganesha-09.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/vibrant-water-splash-ganesha/water-splash-dancing-ganesha-09.png",
        "download_url": "https://ninejoe.online/images/wallpapers/vibrant-water-splash-ganesha/water-splash-dancing-ganesha-09.png",
        "sort_order": 8
      },
      {
        "alt_text": "พระพิฆเนศปางร่ายรำนาฏราชสาดสายธาราสวรรค์ #10 — Vibrant Water-Splash Dancing Ganesha – พระพิฆเนศร่ายรำสายธาราสวรรค์",
        "image_url": "https://ninejoe.online/images/wallpapers/vibrant-water-splash-ganesha/water-splash-dancing-ganesha-10.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/vibrant-water-splash-ganesha/water-splash-dancing-ganesha-10.png",
        "download_url": "https://ninejoe.online/images/wallpapers/vibrant-water-splash-ganesha/water-splash-dancing-ganesha-10.png",
        "sort_order": 9
      }
    ]
  },
  {
    "id": "230c6c86-c2d4-4a72-ade7-bd07d905a61c",
    "slug": "royal-elephant-bal-ganesha",
    "title": "Royal Elephant Bal Ganesha – พระพิฆเนศน้อยคชสารเผือกทรงเครื่องทอง",
    "description": "คอลเลกชันพระพิฆเนศน้อยประทับคชสารเผือกมงคล เส้นสายทองคำพู่กันจีนโบราณ เสริมวาสนา บารมียิ่งใหญ่ ผู้ใหญ่อุปถัมภ์ค้ำชู และเกียรติยศชื่อเสียง",
    "category": "🌟 Spiritual Art",
    "cover_image": "https://ninejoe.online/images/wallpapers/royal-elephant-bal-ganesha/royal-elephant-bal-ganesha-01.png",
    "tags": [
      "Spiritual",
      "Ganesha",
      "White Elephant",
      "Royal",
      "Golden Ink",
      "Nobility",
      "Honor"
    ],
    "collection_images": [
      {
        "alt_text": "พระพิฆเนศน้อยคชสารเผือกทรงเครื่องทองคำ #1 — Royal Elephant Bal Ganesha – พระพิฆเนศน้อยคชสารเผือกทรงเครื่องทอง",
        "image_url": "https://ninejoe.online/images/wallpapers/royal-elephant-bal-ganesha/royal-elephant-bal-ganesha-01.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/royal-elephant-bal-ganesha/royal-elephant-bal-ganesha-01.png",
        "download_url": "https://ninejoe.online/images/wallpapers/royal-elephant-bal-ganesha/royal-elephant-bal-ganesha-01.png",
        "sort_order": 0
      },
      {
        "alt_text": "พระพิฆเนศน้อยคชสารเผือกทรงเครื่องทองคำ #2 — Royal Elephant Bal Ganesha – พระพิฆเนศน้อยคชสารเผือกทรงเครื่องทอง",
        "image_url": "https://ninejoe.online/images/wallpapers/royal-elephant-bal-ganesha/royal-elephant-bal-ganesha-02.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/royal-elephant-bal-ganesha/royal-elephant-bal-ganesha-02.png",
        "download_url": "https://ninejoe.online/images/wallpapers/royal-elephant-bal-ganesha/royal-elephant-bal-ganesha-02.png",
        "sort_order": 1
      },
      {
        "alt_text": "พระพิฆเนศน้อยคชสารเผือกทรงเครื่องทองคำ #3 — Royal Elephant Bal Ganesha – พระพิฆเนศน้อยคชสารเผือกทรงเครื่องทอง",
        "image_url": "https://ninejoe.online/images/wallpapers/royal-elephant-bal-ganesha/royal-elephant-bal-ganesha-03.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/royal-elephant-bal-ganesha/royal-elephant-bal-ganesha-03.png",
        "download_url": "https://ninejoe.online/images/wallpapers/royal-elephant-bal-ganesha/royal-elephant-bal-ganesha-03.png",
        "sort_order": 2
      },
      {
        "alt_text": "พระพิฆเนศน้อยคชสารเผือกทรงเครื่องทองคำ #4 — Royal Elephant Bal Ganesha – พระพิฆเนศน้อยคชสารเผือกทรงเครื่องทอง",
        "image_url": "https://ninejoe.online/images/wallpapers/royal-elephant-bal-ganesha/royal-elephant-bal-ganesha-04.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/royal-elephant-bal-ganesha/royal-elephant-bal-ganesha-04.png",
        "download_url": "https://ninejoe.online/images/wallpapers/royal-elephant-bal-ganesha/royal-elephant-bal-ganesha-04.png",
        "sort_order": 3
      },
      {
        "alt_text": "พระพิฆเนศน้อยคชสารเผือกทรงเครื่องทองคำ #5 — Royal Elephant Bal Ganesha – พระพิฆเนศน้อยคชสารเผือกทรงเครื่องทอง",
        "image_url": "https://ninejoe.online/images/wallpapers/royal-elephant-bal-ganesha/royal-elephant-bal-ganesha-05.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/royal-elephant-bal-ganesha/royal-elephant-bal-ganesha-05.png",
        "download_url": "https://ninejoe.online/images/wallpapers/royal-elephant-bal-ganesha/royal-elephant-bal-ganesha-05.png",
        "sort_order": 4
      },
      {
        "alt_text": "พระพิฆเนศน้อยคชสารเผือกทรงเครื่องทองคำ #6 — Royal Elephant Bal Ganesha – พระพิฆเนศน้อยคชสารเผือกทรงเครื่องทอง",
        "image_url": "https://ninejoe.online/images/wallpapers/royal-elephant-bal-ganesha/royal-elephant-bal-ganesha-06.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/royal-elephant-bal-ganesha/royal-elephant-bal-ganesha-06.png",
        "download_url": "https://ninejoe.online/images/wallpapers/royal-elephant-bal-ganesha/royal-elephant-bal-ganesha-06.png",
        "sort_order": 5
      },
      {
        "alt_text": "พระพิฆเนศน้อยคชสารเผือกทรงเครื่องทองคำ #7 — Royal Elephant Bal Ganesha – พระพิฆเนศน้อยคชสารเผือกทรงเครื่องทอง",
        "image_url": "https://ninejoe.online/images/wallpapers/royal-elephant-bal-ganesha/royal-elephant-bal-ganesha-07.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/royal-elephant-bal-ganesha/royal-elephant-bal-ganesha-07.png",
        "download_url": "https://ninejoe.online/images/wallpapers/royal-elephant-bal-ganesha/royal-elephant-bal-ganesha-07.png",
        "sort_order": 6
      },
      {
        "alt_text": "พระพิฆเนศน้อยคชสารเผือกทรงเครื่องทองคำ #8 — Royal Elephant Bal Ganesha – พระพิฆเนศน้อยคชสารเผือกทรงเครื่องทอง",
        "image_url": "https://ninejoe.online/images/wallpapers/royal-elephant-bal-ganesha/royal-elephant-bal-ganesha-08.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/royal-elephant-bal-ganesha/royal-elephant-bal-ganesha-08.png",
        "download_url": "https://ninejoe.online/images/wallpapers/royal-elephant-bal-ganesha/royal-elephant-bal-ganesha-08.png",
        "sort_order": 7
      },
      {
        "alt_text": "พระพิฆเนศน้อยคชสารเผือกทรงเครื่องทองคำ #9 — Royal Elephant Bal Ganesha – พระพิฆเนศน้อยคชสารเผือกทรงเครื่องทอง",
        "image_url": "https://ninejoe.online/images/wallpapers/royal-elephant-bal-ganesha/royal-elephant-bal-ganesha-09.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/royal-elephant-bal-ganesha/royal-elephant-bal-ganesha-09.png",
        "download_url": "https://ninejoe.online/images/wallpapers/royal-elephant-bal-ganesha/royal-elephant-bal-ganesha-09.png",
        "sort_order": 8
      }
    ]
  },
  {
    "id": "d153500d-c2ef-44ae-a3af-5abf7b47de6f",
    "slug": "heavenly-golden-temple-ganesha",
    "title": "Heavenly Golden Temple Ganesha – พระพิฆเนศสวรรค์วิมานทองคำ",
    "description": "คอลเลกชันพระพิฆเนศแสงสวรรค์เหนือมหาปราสาททองคำ ส่องประกายแสงทิพย์แห่งความศักดิ์สิทธิ์ เสริมความสงบร่มเย็น เมตตามหานิยม และปาฏิหาริย์แห่งโชคลาภ",
    "category": "🌟 Spiritual Art",
    "cover_image": "https://ninejoe.online/images/wallpapers/heavenly-golden-temple-ganesha/heavenly-golden-temple-ganesha-01.png",
    "tags": [
      "Spiritual",
      "Ganesha",
      "Golden Temple",
      "Heavenly",
      "Divine Light",
      "Miracles"
    ],
    "collection_images": [
      {
        "alt_text": "พระพิฆเนศสวรรค์วิมานทองคำบันดาลโชค #1 — Heavenly Golden Temple Ganesha – พระพิฆเนศสวรรค์วิมานทองคำ",
        "image_url": "https://ninejoe.online/images/wallpapers/heavenly-golden-temple-ganesha/heavenly-golden-temple-ganesha-01.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/heavenly-golden-temple-ganesha/heavenly-golden-temple-ganesha-01.png",
        "download_url": "https://ninejoe.online/images/wallpapers/heavenly-golden-temple-ganesha/heavenly-golden-temple-ganesha-01.png",
        "sort_order": 0
      },
      {
        "alt_text": "พระพิฆเนศสวรรค์วิมานทองคำบันดาลโชค #2 — Heavenly Golden Temple Ganesha – พระพิฆเนศสวรรค์วิมานทองคำ",
        "image_url": "https://ninejoe.online/images/wallpapers/heavenly-golden-temple-ganesha/heavenly-golden-temple-ganesha-02.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/heavenly-golden-temple-ganesha/heavenly-golden-temple-ganesha-02.png",
        "download_url": "https://ninejoe.online/images/wallpapers/heavenly-golden-temple-ganesha/heavenly-golden-temple-ganesha-02.png",
        "sort_order": 1
      },
      {
        "alt_text": "พระพิฆเนศสวรรค์วิมานทองคำบันดาลโชค #3 — Heavenly Golden Temple Ganesha – พระพิฆเนศสวรรค์วิมานทองคำ",
        "image_url": "https://ninejoe.online/images/wallpapers/heavenly-golden-temple-ganesha/heavenly-golden-temple-ganesha-03.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/heavenly-golden-temple-ganesha/heavenly-golden-temple-ganesha-03.png",
        "download_url": "https://ninejoe.online/images/wallpapers/heavenly-golden-temple-ganesha/heavenly-golden-temple-ganesha-03.png",
        "sort_order": 2
      },
      {
        "alt_text": "พระพิฆเนศสวรรค์วิมานทองคำบันดาลโชค #4 — Heavenly Golden Temple Ganesha – พระพิฆเนศสวรรค์วิมานทองคำ",
        "image_url": "https://ninejoe.online/images/wallpapers/heavenly-golden-temple-ganesha/heavenly-golden-temple-ganesha-04.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/heavenly-golden-temple-ganesha/heavenly-golden-temple-ganesha-04.png",
        "download_url": "https://ninejoe.online/images/wallpapers/heavenly-golden-temple-ganesha/heavenly-golden-temple-ganesha-04.png",
        "sort_order": 3
      },
      {
        "alt_text": "พระพิฆเนศสวรรค์วิมานทองคำบันดาลโชค #5 — Heavenly Golden Temple Ganesha – พระพิฆเนศสวรรค์วิมานทองคำ",
        "image_url": "https://ninejoe.online/images/wallpapers/heavenly-golden-temple-ganesha/heavenly-golden-temple-ganesha-05.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/heavenly-golden-temple-ganesha/heavenly-golden-temple-ganesha-05.png",
        "download_url": "https://ninejoe.online/images/wallpapers/heavenly-golden-temple-ganesha/heavenly-golden-temple-ganesha-05.png",
        "sort_order": 4
      },
      {
        "alt_text": "พระพิฆเนศสวรรค์วิมานทองคำบันดาลโชค #6 — Heavenly Golden Temple Ganesha – พระพิฆเนศสวรรค์วิมานทองคำ",
        "image_url": "https://ninejoe.online/images/wallpapers/heavenly-golden-temple-ganesha/heavenly-golden-temple-ganesha-06.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/heavenly-golden-temple-ganesha/heavenly-golden-temple-ganesha-06.png",
        "download_url": "https://ninejoe.online/images/wallpapers/heavenly-golden-temple-ganesha/heavenly-golden-temple-ganesha-06.png",
        "sort_order": 5
      },
      {
        "alt_text": "พระพิฆเนศสวรรค์วิมานทองคำบันดาลโชค #7 — Heavenly Golden Temple Ganesha – พระพิฆเนศสวรรค์วิมานทองคำ",
        "image_url": "https://ninejoe.online/images/wallpapers/heavenly-golden-temple-ganesha/heavenly-golden-temple-ganesha-07.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/heavenly-golden-temple-ganesha/heavenly-golden-temple-ganesha-07.png",
        "download_url": "https://ninejoe.online/images/wallpapers/heavenly-golden-temple-ganesha/heavenly-golden-temple-ganesha-07.png",
        "sort_order": 6
      },
      {
        "alt_text": "พระพิฆเนศสวรรค์วิมานทองคำบันดาลโชค #8 — Heavenly Golden Temple Ganesha – พระพิฆเนศสวรรค์วิมานทองคำ",
        "image_url": "https://ninejoe.online/images/wallpapers/heavenly-golden-temple-ganesha/heavenly-golden-temple-ganesha-08.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/heavenly-golden-temple-ganesha/heavenly-golden-temple-ganesha-08.png",
        "download_url": "https://ninejoe.online/images/wallpapers/heavenly-golden-temple-ganesha/heavenly-golden-temple-ganesha-08.png",
        "sort_order": 7
      },
      {
        "alt_text": "พระพิฆเนศสวรรค์วิมานทองคำบันดาลโชค #9 — Heavenly Golden Temple Ganesha – พระพิฆเนศสวรรค์วิมานทองคำ",
        "image_url": "https://ninejoe.online/images/wallpapers/heavenly-golden-temple-ganesha/heavenly-golden-temple-ganesha-09.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/heavenly-golden-temple-ganesha/heavenly-golden-temple-ganesha-09.png",
        "download_url": "https://ninejoe.online/images/wallpapers/heavenly-golden-temple-ganesha/heavenly-golden-temple-ganesha-09.png",
        "sort_order": 8
      },
      {
        "alt_text": "พระพิฆเนศสวรรค์วิมานทองคำบันดาลโชค #10 — Heavenly Golden Temple Ganesha – พระพิฆเนศสวรรค์วิมานทองคำ",
        "image_url": "https://ninejoe.online/images/wallpapers/heavenly-golden-temple-ganesha/heavenly-golden-temple-ganesha-10.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/heavenly-golden-temple-ganesha/heavenly-golden-temple-ganesha-10.png",
        "download_url": "https://ninejoe.online/images/wallpapers/heavenly-golden-temple-ganesha/heavenly-golden-temple-ganesha-10.png",
        "sort_order": 9
      }
    ]
  },
  {
    "id": "0b650f00-8801-40e1-ac80-569f59aed209",
    "slug": "divine-azure-waterfall-ganesha",
    "title": "Divine Azure Waterfall Ganesha – พระพิฆเนศมหาธาราสวรรค์สีครามทอง",
    "description": "คอลเลกชันพระพิฆเนศกายสีครามมรกตเครื่องทรงทองคำ ประทับเหนือน้ำตกสวรรค์ มหาธาราแห่งความอุดมสมบูรณ์ เสริมความราบรื่น ร่มเย็นเป็นสุข และทรัพย์สินไม่ขาดสาย",
    "category": "🌟 Spiritual Art",
    "cover_image": "https://ninejoe.online/images/wallpapers/divine-azure-waterfall-ganesha/azure-waterfall-maha-ganesha-01.png",
    "tags": [
      "Spiritual",
      "Ganesha",
      "Azure Waterfall",
      "Heavenly River",
      "Calm",
      "Abundance"
    ],
    "collection_images": [
      {
        "alt_text": "พระพิฆเนศมหาธาราสวรรค์สีครามทอง #1 — Divine Azure Waterfall Ganesha – พระพิฆเนศมหาธาราสวรรค์สีครามทอง",
        "image_url": "https://ninejoe.online/images/wallpapers/divine-azure-waterfall-ganesha/azure-waterfall-maha-ganesha-01.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/divine-azure-waterfall-ganesha/azure-waterfall-maha-ganesha-01.png",
        "download_url": "https://ninejoe.online/images/wallpapers/divine-azure-waterfall-ganesha/azure-waterfall-maha-ganesha-01.png",
        "sort_order": 0
      },
      {
        "alt_text": "พระพิฆเนศมหาธาราสวรรค์สีครามทอง #2 — Divine Azure Waterfall Ganesha – พระพิฆเนศมหาธาราสวรรค์สีครามทอง",
        "image_url": "https://ninejoe.online/images/wallpapers/divine-azure-waterfall-ganesha/azure-waterfall-maha-ganesha-02.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/divine-azure-waterfall-ganesha/azure-waterfall-maha-ganesha-02.png",
        "download_url": "https://ninejoe.online/images/wallpapers/divine-azure-waterfall-ganesha/azure-waterfall-maha-ganesha-02.png",
        "sort_order": 1
      },
      {
        "alt_text": "พระพิฆเนศมหาธาราสวรรค์สีครามทอง #3 — Divine Azure Waterfall Ganesha – พระพิฆเนศมหาธาราสวรรค์สีครามทอง",
        "image_url": "https://ninejoe.online/images/wallpapers/divine-azure-waterfall-ganesha/azure-waterfall-maha-ganesha-03.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/divine-azure-waterfall-ganesha/azure-waterfall-maha-ganesha-03.png",
        "download_url": "https://ninejoe.online/images/wallpapers/divine-azure-waterfall-ganesha/azure-waterfall-maha-ganesha-03.png",
        "sort_order": 2
      },
      {
        "alt_text": "พระพิฆเนศมหาธาราสวรรค์สีครามทอง #4 — Divine Azure Waterfall Ganesha – พระพิฆเนศมหาธาราสวรรค์สีครามทอง",
        "image_url": "https://ninejoe.online/images/wallpapers/divine-azure-waterfall-ganesha/azure-waterfall-maha-ganesha-04.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/divine-azure-waterfall-ganesha/azure-waterfall-maha-ganesha-04.png",
        "download_url": "https://ninejoe.online/images/wallpapers/divine-azure-waterfall-ganesha/azure-waterfall-maha-ganesha-04.png",
        "sort_order": 3
      },
      {
        "alt_text": "พระพิฆเนศมหาธาราสวรรค์สีครามทอง #5 — Divine Azure Waterfall Ganesha – พระพิฆเนศมหาธาราสวรรค์สีครามทอง",
        "image_url": "https://ninejoe.online/images/wallpapers/divine-azure-waterfall-ganesha/azure-waterfall-maha-ganesha-05.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/divine-azure-waterfall-ganesha/azure-waterfall-maha-ganesha-05.png",
        "download_url": "https://ninejoe.online/images/wallpapers/divine-azure-waterfall-ganesha/azure-waterfall-maha-ganesha-05.png",
        "sort_order": 4
      },
      {
        "alt_text": "พระพิฆเนศมหาธาราสวรรค์สีครามทอง #6 — Divine Azure Waterfall Ganesha – พระพิฆเนศมหาธาราสวรรค์สีครามทอง",
        "image_url": "https://ninejoe.online/images/wallpapers/divine-azure-waterfall-ganesha/azure-waterfall-maha-ganesha-06.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/divine-azure-waterfall-ganesha/azure-waterfall-maha-ganesha-06.png",
        "download_url": "https://ninejoe.online/images/wallpapers/divine-azure-waterfall-ganesha/azure-waterfall-maha-ganesha-06.png",
        "sort_order": 5
      },
      {
        "alt_text": "พระพิฆเนศมหาธาราสวรรค์สีครามทอง #7 — Divine Azure Waterfall Ganesha – พระพิฆเนศมหาธาราสวรรค์สีครามทอง",
        "image_url": "https://ninejoe.online/images/wallpapers/divine-azure-waterfall-ganesha/azure-waterfall-maha-ganesha-07.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/divine-azure-waterfall-ganesha/azure-waterfall-maha-ganesha-07.png",
        "download_url": "https://ninejoe.online/images/wallpapers/divine-azure-waterfall-ganesha/azure-waterfall-maha-ganesha-07.png",
        "sort_order": 6
      },
      {
        "alt_text": "พระพิฆเนศมหาธาราสวรรค์สีครามทอง #8 — Divine Azure Waterfall Ganesha – พระพิฆเนศมหาธาราสวรรค์สีครามทอง",
        "image_url": "https://ninejoe.online/images/wallpapers/divine-azure-waterfall-ganesha/azure-waterfall-maha-ganesha-08.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/divine-azure-waterfall-ganesha/azure-waterfall-maha-ganesha-08.png",
        "download_url": "https://ninejoe.online/images/wallpapers/divine-azure-waterfall-ganesha/azure-waterfall-maha-ganesha-08.png",
        "sort_order": 7
      }
    ]
  },
  {
    "id": "2ca8c2c5-c2fb-4919-af93-49b556c9d26f",
    "slug": "cosmic-mahadeva-lord-shiva",
    "title": "Cosmic Mahadeva Lord Shiva – พระศิวะมหาเทพ กาแล็กซีเขาไกรลาส",
    "description": "คอลเลกชันพระศิวะมหาเทพ กาแล็กซีดวงดาวเหนือยอดเขาไกรลาส ถือตรีศูลเพลิงประกายทอง เสริมมหาอำนาจบารมี ขจัดอุปสรรคและสิ่งอัปมงคลทั้งปวง หนุนดวงชะตาให้เข้มแข็ง",
    "category": "🌟 Spiritual Art",
    "cover_image": "https://ninejoe.online/images/wallpapers/cosmic-mahadeva-lord-shiva/cosmic-mahadeva-lord-shiva-01.png",
    "tags": [
      "Spiritual",
      "Shiva",
      "Mahadeva",
      "Mount Kailash",
      "Trishula",
      "Power",
      "Protection"
    ],
    "collection_images": [
      {
        "alt_text": "พระศิวะมหาเทพ กาแล็กซีเขาไกรลาส #1 — Cosmic Mahadeva Lord Shiva – พระศิวะมหาเทพ กาแล็กซีเขาไกรลาส",
        "image_url": "https://ninejoe.online/images/wallpapers/cosmic-mahadeva-lord-shiva/cosmic-mahadeva-lord-shiva-01.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/cosmic-mahadeva-lord-shiva/cosmic-mahadeva-lord-shiva-01.png",
        "download_url": "https://ninejoe.online/images/wallpapers/cosmic-mahadeva-lord-shiva/cosmic-mahadeva-lord-shiva-01.png",
        "sort_order": 0
      },
      {
        "alt_text": "พระศิวะมหาเทพ กาแล็กซีเขาไกรลาส #2 — Cosmic Mahadeva Lord Shiva – พระศิวะมหาเทพ กาแล็กซีเขาไกรลาส",
        "image_url": "https://ninejoe.online/images/wallpapers/cosmic-mahadeva-lord-shiva/cosmic-mahadeva-lord-shiva-02.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/cosmic-mahadeva-lord-shiva/cosmic-mahadeva-lord-shiva-02.png",
        "download_url": "https://ninejoe.online/images/wallpapers/cosmic-mahadeva-lord-shiva/cosmic-mahadeva-lord-shiva-02.png",
        "sort_order": 1
      },
      {
        "alt_text": "พระศิวะมหาเทพ กาแล็กซีเขาไกรลาส #3 — Cosmic Mahadeva Lord Shiva – พระศิวะมหาเทพ กาแล็กซีเขาไกรลาส",
        "image_url": "https://ninejoe.online/images/wallpapers/cosmic-mahadeva-lord-shiva/cosmic-mahadeva-lord-shiva-03.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/cosmic-mahadeva-lord-shiva/cosmic-mahadeva-lord-shiva-03.png",
        "download_url": "https://ninejoe.online/images/wallpapers/cosmic-mahadeva-lord-shiva/cosmic-mahadeva-lord-shiva-03.png",
        "sort_order": 2
      },
      {
        "alt_text": "พระศิวะมหาเทพ กาแล็กซีเขาไกรลาส #4 — Cosmic Mahadeva Lord Shiva – พระศิวะมหาเทพ กาแล็กซีเขาไกรลาส",
        "image_url": "https://ninejoe.online/images/wallpapers/cosmic-mahadeva-lord-shiva/cosmic-mahadeva-lord-shiva-04.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/cosmic-mahadeva-lord-shiva/cosmic-mahadeva-lord-shiva-04.png",
        "download_url": "https://ninejoe.online/images/wallpapers/cosmic-mahadeva-lord-shiva/cosmic-mahadeva-lord-shiva-04.png",
        "sort_order": 3
      },
      {
        "alt_text": "พระศิวะมหาเทพ กาแล็กซีเขาไกรลาส #5 — Cosmic Mahadeva Lord Shiva – พระศิวะมหาเทพ กาแล็กซีเขาไกรลาส",
        "image_url": "https://ninejoe.online/images/wallpapers/cosmic-mahadeva-lord-shiva/cosmic-mahadeva-lord-shiva-05.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/cosmic-mahadeva-lord-shiva/cosmic-mahadeva-lord-shiva-05.png",
        "download_url": "https://ninejoe.online/images/wallpapers/cosmic-mahadeva-lord-shiva/cosmic-mahadeva-lord-shiva-05.png",
        "sort_order": 4
      },
      {
        "alt_text": "พระศิวะมหาเทพ กาแล็กซีเขาไกรลาส #6 — Cosmic Mahadeva Lord Shiva – พระศิวะมหาเทพ กาแล็กซีเขาไกรลาส",
        "image_url": "https://ninejoe.online/images/wallpapers/cosmic-mahadeva-lord-shiva/cosmic-mahadeva-lord-shiva-06.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/cosmic-mahadeva-lord-shiva/cosmic-mahadeva-lord-shiva-06.png",
        "download_url": "https://ninejoe.online/images/wallpapers/cosmic-mahadeva-lord-shiva/cosmic-mahadeva-lord-shiva-06.png",
        "sort_order": 5
      },
      {
        "alt_text": "พระศิวะมหาเทพ กาแล็กซีเขาไกรลาส #7 — Cosmic Mahadeva Lord Shiva – พระศิวะมหาเทพ กาแล็กซีเขาไกรลาส",
        "image_url": "https://ninejoe.online/images/wallpapers/cosmic-mahadeva-lord-shiva/cosmic-mahadeva-lord-shiva-07.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/cosmic-mahadeva-lord-shiva/cosmic-mahadeva-lord-shiva-07.png",
        "download_url": "https://ninejoe.online/images/wallpapers/cosmic-mahadeva-lord-shiva/cosmic-mahadeva-lord-shiva-07.png",
        "sort_order": 6
      },
      {
        "alt_text": "พระศิวะมหาเทพ กาแล็กซีเขาไกรลาส #8 — Cosmic Mahadeva Lord Shiva – พระศิวะมหาเทพ กาแล็กซีเขาไกรลาส",
        "image_url": "https://ninejoe.online/images/wallpapers/cosmic-mahadeva-lord-shiva/cosmic-mahadeva-lord-shiva-08.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/cosmic-mahadeva-lord-shiva/cosmic-mahadeva-lord-shiva-08.png",
        "download_url": "https://ninejoe.online/images/wallpapers/cosmic-mahadeva-lord-shiva/cosmic-mahadeva-lord-shiva-08.png",
        "sort_order": 7
      },
      {
        "alt_text": "พระศิวะมหาเทพ กาแล็กซีเขาไกรลาส #9 — Cosmic Mahadeva Lord Shiva – พระศิวะมหาเทพ กาแล็กซีเขาไกรลาส",
        "image_url": "https://ninejoe.online/images/wallpapers/cosmic-mahadeva-lord-shiva/cosmic-mahadeva-lord-shiva-09.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/cosmic-mahadeva-lord-shiva/cosmic-mahadeva-lord-shiva-09.png",
        "download_url": "https://ninejoe.online/images/wallpapers/cosmic-mahadeva-lord-shiva/cosmic-mahadeva-lord-shiva-09.png",
        "sort_order": 8
      },
      {
        "alt_text": "พระศิวะมหาเทพ กาแล็กซีเขาไกรลาส #10 — Cosmic Mahadeva Lord Shiva – พระศิวะมหาเทพ กาแล็กซีเขาไกรลาส",
        "image_url": "https://ninejoe.online/images/wallpapers/cosmic-mahadeva-lord-shiva/cosmic-mahadeva-lord-shiva-10.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/cosmic-mahadeva-lord-shiva/cosmic-mahadeva-lord-shiva-10.png",
        "download_url": "https://ninejoe.online/images/wallpapers/cosmic-mahadeva-lord-shiva/cosmic-mahadeva-lord-shiva-10.png",
        "sort_order": 9
      }
    ]
  },
  {
    "id": "357176b0-111c-4d3e-a5aa-9a1f58ec6c19",
    "slug": "radiant-solar-goddess",
    "title": "Radiant Solar Goddess – เทพีสุริยะแสงทิพย์ประกายทอง",
    "description": "คอลเลกชันเทพีสุริยะแห่งแสงทิพย์ ประกายทองส่องสว่างนำทางความสำเร็จ เสริมพลังความสดใส ความหวัง พลังชีวิต เมตตามหาเสน่ห์ และเงินทองไม่ขัดสน",
    "category": "🌟 Spiritual Art",
    "cover_image": "https://ninejoe.online/images/wallpapers/radiant-solar-goddess/radiant-solar-goddess-01.png",
    "tags": [
      "Spiritual",
      "Sun Goddess",
      "Solar",
      "Golden Light",
      "Hope",
      "Prosperity",
      "Blessing"
    ],
    "collection_images": [
      {
        "alt_text": "เทพีสุริยะแสงทิพย์ประกายทองคำ #1 — Radiant Solar Goddess – เทพีสุริยะแสงทิพย์ประกายทอง",
        "image_url": "https://ninejoe.online/images/wallpapers/radiant-solar-goddess/radiant-solar-goddess-01.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/radiant-solar-goddess/radiant-solar-goddess-01.png",
        "download_url": "https://ninejoe.online/images/wallpapers/radiant-solar-goddess/radiant-solar-goddess-01.png",
        "sort_order": 0
      },
      {
        "alt_text": "เทพีสุริยะแสงทิพย์ประกายทองคำ #2 — Radiant Solar Goddess – เทพีสุริยะแสงทิพย์ประกายทอง",
        "image_url": "https://ninejoe.online/images/wallpapers/radiant-solar-goddess/radiant-solar-goddess-02.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/radiant-solar-goddess/radiant-solar-goddess-02.png",
        "download_url": "https://ninejoe.online/images/wallpapers/radiant-solar-goddess/radiant-solar-goddess-02.png",
        "sort_order": 1
      },
      {
        "alt_text": "เทพีสุริยะแสงทิพย์ประกายทองคำ #3 — Radiant Solar Goddess – เทพีสุริยะแสงทิพย์ประกายทอง",
        "image_url": "https://ninejoe.online/images/wallpapers/radiant-solar-goddess/radiant-solar-goddess-03.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/radiant-solar-goddess/radiant-solar-goddess-03.png",
        "download_url": "https://ninejoe.online/images/wallpapers/radiant-solar-goddess/radiant-solar-goddess-03.png",
        "sort_order": 2
      },
      {
        "alt_text": "เทพีสุริยะแสงทิพย์ประกายทองคำ #4 — Radiant Solar Goddess – เทพีสุริยะแสงทิพย์ประกายทอง",
        "image_url": "https://ninejoe.online/images/wallpapers/radiant-solar-goddess/radiant-solar-goddess-04.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/radiant-solar-goddess/radiant-solar-goddess-04.png",
        "download_url": "https://ninejoe.online/images/wallpapers/radiant-solar-goddess/radiant-solar-goddess-04.png",
        "sort_order": 3
      },
      {
        "alt_text": "เทพีสุริยะแสงทิพย์ประกายทองคำ #5 — Radiant Solar Goddess – เทพีสุริยะแสงทิพย์ประกายทอง",
        "image_url": "https://ninejoe.online/images/wallpapers/radiant-solar-goddess/radiant-solar-goddess-05.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/radiant-solar-goddess/radiant-solar-goddess-05.png",
        "download_url": "https://ninejoe.online/images/wallpapers/radiant-solar-goddess/radiant-solar-goddess-05.png",
        "sort_order": 4
      },
      {
        "alt_text": "เทพีสุริยะแสงทิพย์ประกายทองคำ #6 — Radiant Solar Goddess – เทพีสุริยะแสงทิพย์ประกายทอง",
        "image_url": "https://ninejoe.online/images/wallpapers/radiant-solar-goddess/radiant-solar-goddess-06.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/radiant-solar-goddess/radiant-solar-goddess-06.png",
        "download_url": "https://ninejoe.online/images/wallpapers/radiant-solar-goddess/radiant-solar-goddess-06.png",
        "sort_order": 5
      },
      {
        "alt_text": "เทพีสุริยะแสงทิพย์ประกายทองคำ #7 — Radiant Solar Goddess – เทพีสุริยะแสงทิพย์ประกายทอง",
        "image_url": "https://ninejoe.online/images/wallpapers/radiant-solar-goddess/radiant-solar-goddess-07.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/radiant-solar-goddess/radiant-solar-goddess-07.png",
        "download_url": "https://ninejoe.online/images/wallpapers/radiant-solar-goddess/radiant-solar-goddess-07.png",
        "sort_order": 6
      },
      {
        "alt_text": "เทพีสุริยะแสงทิพย์ประกายทองคำ #8 — Radiant Solar Goddess – เทพีสุริยะแสงทิพย์ประกายทอง",
        "image_url": "https://ninejoe.online/images/wallpapers/radiant-solar-goddess/radiant-solar-goddess-08.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/radiant-solar-goddess/radiant-solar-goddess-08.png",
        "download_url": "https://ninejoe.online/images/wallpapers/radiant-solar-goddess/radiant-solar-goddess-08.png",
        "sort_order": 7
      }
    ]
  },
  {
    "id": "2de29b1e-2076-42a1-aad9-06d76651cba2",
    "slug": "blazing-solar-sovereign",
    "title": "Blazing Solar Sovereign – สุริยเทพจอมราชันย์ ดาบเพลิงสุริยัน",
    "description": "คอลเลกชันสุริยเทพจอมราชันย์ ดาบเพลิงสุริยันเรืองอำนาจ เสริมความเป็นผู้นำ ชัยชนะในการแข่งขัน การเลื่อนขั้นเลื่อนตำแหน่ง และเกียรติยศสูงสุด",
    "category": "🌟 Spiritual Art",
    "cover_image": "https://ninejoe.online/images/wallpapers/blazing-solar-sovereign/blazing-solar-sovereign-01.png",
    "tags": [
      "Spiritual",
      "Sun God",
      "Solar Sovereign",
      "Flame Sword",
      "Victory",
      "Leadership",
      "Success"
    ],
    "collection_images": [
      {
        "alt_text": "สุริยเทพจอมราชันย์ ดาบเพลิงสุริยัน #1 — Blazing Solar Sovereign – สุริยเทพจอมราชันย์ ดาบเพลิงสุริยัน",
        "image_url": "https://ninejoe.online/images/wallpapers/blazing-solar-sovereign/blazing-solar-sovereign-01.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/blazing-solar-sovereign/blazing-solar-sovereign-01.png",
        "download_url": "https://ninejoe.online/images/wallpapers/blazing-solar-sovereign/blazing-solar-sovereign-01.png",
        "sort_order": 0
      },
      {
        "alt_text": "สุริยเทพจอมราชันย์ ดาบเพลิงสุริยัน #2 — Blazing Solar Sovereign – สุริยเทพจอมราชันย์ ดาบเพลิงสุริยัน",
        "image_url": "https://ninejoe.online/images/wallpapers/blazing-solar-sovereign/blazing-solar-sovereign-02.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/blazing-solar-sovereign/blazing-solar-sovereign-02.png",
        "download_url": "https://ninejoe.online/images/wallpapers/blazing-solar-sovereign/blazing-solar-sovereign-02.png",
        "sort_order": 1
      },
      {
        "alt_text": "สุริยเทพจอมราชันย์ ดาบเพลิงสุริยัน #3 — Blazing Solar Sovereign – สุริยเทพจอมราชันย์ ดาบเพลิงสุริยัน",
        "image_url": "https://ninejoe.online/images/wallpapers/blazing-solar-sovereign/blazing-solar-sovereign-03.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/blazing-solar-sovereign/blazing-solar-sovereign-03.png",
        "download_url": "https://ninejoe.online/images/wallpapers/blazing-solar-sovereign/blazing-solar-sovereign-03.png",
        "sort_order": 2
      },
      {
        "alt_text": "สุริยเทพจอมราชันย์ ดาบเพลิงสุริยัน #4 — Blazing Solar Sovereign – สุริยเทพจอมราชันย์ ดาบเพลิงสุริยัน",
        "image_url": "https://ninejoe.online/images/wallpapers/blazing-solar-sovereign/blazing-solar-sovereign-04.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/blazing-solar-sovereign/blazing-solar-sovereign-04.png",
        "download_url": "https://ninejoe.online/images/wallpapers/blazing-solar-sovereign/blazing-solar-sovereign-04.png",
        "sort_order": 3
      },
      {
        "alt_text": "สุริยเทพจอมราชันย์ ดาบเพลิงสุริยัน #5 — Blazing Solar Sovereign – สุริยเทพจอมราชันย์ ดาบเพลิงสุริยัน",
        "image_url": "https://ninejoe.online/images/wallpapers/blazing-solar-sovereign/blazing-solar-sovereign-05.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/blazing-solar-sovereign/blazing-solar-sovereign-05.png",
        "download_url": "https://ninejoe.online/images/wallpapers/blazing-solar-sovereign/blazing-solar-sovereign-05.png",
        "sort_order": 4
      },
      {
        "alt_text": "สุริยเทพจอมราชันย์ ดาบเพลิงสุริยัน #6 — Blazing Solar Sovereign – สุริยเทพจอมราชันย์ ดาบเพลิงสุริยัน",
        "image_url": "https://ninejoe.online/images/wallpapers/blazing-solar-sovereign/blazing-solar-sovereign-06.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/blazing-solar-sovereign/blazing-solar-sovereign-06.png",
        "download_url": "https://ninejoe.online/images/wallpapers/blazing-solar-sovereign/blazing-solar-sovereign-06.png",
        "sort_order": 5
      },
      {
        "alt_text": "สุริยเทพจอมราชันย์ ดาบเพลิงสุริยัน #7 — Blazing Solar Sovereign – สุริยเทพจอมราชันย์ ดาบเพลิงสุริยัน",
        "image_url": "https://ninejoe.online/images/wallpapers/blazing-solar-sovereign/blazing-solar-sovereign-07.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/blazing-solar-sovereign/blazing-solar-sovereign-07.png",
        "download_url": "https://ninejoe.online/images/wallpapers/blazing-solar-sovereign/blazing-solar-sovereign-07.png",
        "sort_order": 6
      },
      {
        "alt_text": "สุริยเทพจอมราชันย์ ดาบเพลิงสุริยัน #8 — Blazing Solar Sovereign – สุริยเทพจอมราชันย์ ดาบเพลิงสุริยัน",
        "image_url": "https://ninejoe.online/images/wallpapers/blazing-solar-sovereign/blazing-solar-sovereign-08.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/blazing-solar-sovereign/blazing-solar-sovereign-08.png",
        "download_url": "https://ninejoe.online/images/wallpapers/blazing-solar-sovereign/blazing-solar-sovereign-08.png",
        "sort_order": 7
      }
    ]
  },
  {
    "id": "fa642d22-cdff-49ba-a3c0-608115fbbb72",
    "slug": "golden-astral-bal-ganesha",
    "title": "Golden Astral Bal Ganesha – พระพิฆเนศน้อยออร่าทองคำเรืองรอง",
    "description": "คอลเลกชันพระพิฆเนศน้อยก้าวสู่ความสำเร็จ พร้อมเงาออร่าจักรวาลมหาคเณศทองคำหนุนหลัง เสริมพลังแห่งความมุ่งมั่น ความคิดริเริ่มสร้างสรรค์ และความสำเร็จอันยิ่งใหญ่",
    "category": "🌟 Spiritual Art",
    "cover_image": "https://ninejoe.online/images/wallpapers/golden-astral-bal-ganesha/golden-astral-bal-ganesha-01.png",
    "tags": [
      "Spiritual",
      "Ganesha",
      "Bal Ganesha",
      "Golden Astral",
      "Aura",
      "Divine Light",
      "Good Fortune"
    ],
    "collection_images": [
      {
        "alt_text": "พระพิฆเนศน้อยออร่าทองคำเรืองรอง พลังจักรวาลมหาคเณศ #1 — Golden Astral Bal Ganesha – พระพิฆเนศน้อยออร่าทองคำเรืองรอง",
        "image_url": "https://ninejoe.online/images/wallpapers/golden-astral-bal-ganesha/golden-astral-bal-ganesha-01.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/golden-astral-bal-ganesha/golden-astral-bal-ganesha-01.png",
        "download_url": "https://ninejoe.online/images/wallpapers/golden-astral-bal-ganesha/golden-astral-bal-ganesha-01.png",
        "sort_order": 0
      },
      {
        "alt_text": "พระพิฆเนศน้อยออร่าทองคำเรืองรอง พลังจักรวาลมหาคเณศ #2 — Golden Astral Bal Ganesha – พระพิฆเนศน้อยออร่าทองคำเรืองรอง",
        "image_url": "https://ninejoe.online/images/wallpapers/golden-astral-bal-ganesha/golden-astral-bal-ganesha-02.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/golden-astral-bal-ganesha/golden-astral-bal-ganesha-02.png",
        "download_url": "https://ninejoe.online/images/wallpapers/golden-astral-bal-ganesha/golden-astral-bal-ganesha-02.png",
        "sort_order": 1
      },
      {
        "alt_text": "พระพิฆเนศน้อยออร่าทองคำเรืองรอง พลังจักรวาลมหาคเณศ #3 — Golden Astral Bal Ganesha – พระพิฆเนศน้อยออร่าทองคำเรืองรอง",
        "image_url": "https://ninejoe.online/images/wallpapers/golden-astral-bal-ganesha/golden-astral-bal-ganesha-03.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/golden-astral-bal-ganesha/golden-astral-bal-ganesha-03.png",
        "download_url": "https://ninejoe.online/images/wallpapers/golden-astral-bal-ganesha/golden-astral-bal-ganesha-03.png",
        "sort_order": 2
      },
      {
        "alt_text": "พระพิฆเนศน้อยออร่าทองคำเรืองรอง พลังจักรวาลมหาคเณศ #4 — Golden Astral Bal Ganesha – พระพิฆเนศน้อยออร่าทองคำเรืองรอง",
        "image_url": "https://ninejoe.online/images/wallpapers/golden-astral-bal-ganesha/golden-astral-bal-ganesha-04.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/golden-astral-bal-ganesha/golden-astral-bal-ganesha-04.png",
        "download_url": "https://ninejoe.online/images/wallpapers/golden-astral-bal-ganesha/golden-astral-bal-ganesha-04.png",
        "sort_order": 3
      },
      {
        "alt_text": "พระพิฆเนศน้อยออร่าทองคำเรืองรอง พลังจักรวาลมหาคเณศ #5 — Golden Astral Bal Ganesha – พระพิฆเนศน้อยออร่าทองคำเรืองรอง",
        "image_url": "https://ninejoe.online/images/wallpapers/golden-astral-bal-ganesha/golden-astral-bal-ganesha-05.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/golden-astral-bal-ganesha/golden-astral-bal-ganesha-05.png",
        "download_url": "https://ninejoe.online/images/wallpapers/golden-astral-bal-ganesha/golden-astral-bal-ganesha-05.png",
        "sort_order": 4
      },
      {
        "alt_text": "พระพิฆเนศน้อยออร่าทองคำเรืองรอง พลังจักรวาลมหาคเณศ #6 — Golden Astral Bal Ganesha – พระพิฆเนศน้อยออร่าทองคำเรืองรอง",
        "image_url": "https://ninejoe.online/images/wallpapers/golden-astral-bal-ganesha/golden-astral-bal-ganesha-06.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/golden-astral-bal-ganesha/golden-astral-bal-ganesha-06.png",
        "download_url": "https://ninejoe.online/images/wallpapers/golden-astral-bal-ganesha/golden-astral-bal-ganesha-06.png",
        "sort_order": 5
      },
      {
        "alt_text": "พระพิฆเนศน้อยออร่าทองคำเรืองรอง พลังจักรวาลมหาคเณศ #7 — Golden Astral Bal Ganesha – พระพิฆเนศน้อยออร่าทองคำเรืองรอง",
        "image_url": "https://ninejoe.online/images/wallpapers/golden-astral-bal-ganesha/golden-astral-bal-ganesha-07.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/golden-astral-bal-ganesha/golden-astral-bal-ganesha-07.png",
        "download_url": "https://ninejoe.online/images/wallpapers/golden-astral-bal-ganesha/golden-astral-bal-ganesha-07.png",
        "sort_order": 6
      },
      {
        "alt_text": "พระพิฆเนศน้อยออร่าทองคำเรืองรอง พลังจักรวาลมหาคเณศ #8 — Golden Astral Bal Ganesha – พระพิฆเนศน้อยออร่าทองคำเรืองรอง",
        "image_url": "https://ninejoe.online/images/wallpapers/golden-astral-bal-ganesha/golden-astral-bal-ganesha-08.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/golden-astral-bal-ganesha/golden-astral-bal-ganesha-08.png",
        "download_url": "https://ninejoe.online/images/wallpapers/golden-astral-bal-ganesha/golden-astral-bal-ganesha-08.png",
        "sort_order": 7
      }
    ]
  },
  {
    "id": "5bbf605e-a6d6-455d-aef5-3789550f94e3",
    "slug": "mythic-nezha-golden-flame",
    "title": "Mythic Nezha Golden Flame – นาจาซาไท้จื้อ เพลิงทองคำพู่กันหมึก",
    "description": "คอลเลกชันนาจาซาไท้จื้อ เหยียบกงล้อเพลิงวายุ ทวนประกายเปลวทอง สไตล์หมึกจีนทรงพลัง เสริมพลังขจัดอุปสรรค ศัตรูพ่ายแพ้ ชัยชนะในการต่อสู้ และความสำเร็จคล่องตัว",
    "category": "🌟 Spiritual Art",
    "cover_image": "https://ninejoe.online/images/wallpapers/mythic-nezha-golden-flame/mythic-nezha-golden-flame-01.png",
    "tags": [
      "Spiritual",
      "Nezha",
      "Third Prince",
      "Golden Flame",
      "Wind Fire Wheels",
      "Protection",
      "Overcoming Obstacles"
    ],
    "collection_images": [
      {
        "alt_text": "นาจาซาไท้จื้อ เพลิงทองคำพู่กันหมึก #1 — Mythic Nezha Golden Flame – นาจาซาไท้จื้อ เพลิงทองคำพู่กันหมึก",
        "image_url": "https://ninejoe.online/images/wallpapers/mythic-nezha-golden-flame/mythic-nezha-golden-flame-01.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/mythic-nezha-golden-flame/mythic-nezha-golden-flame-01.png",
        "download_url": "https://ninejoe.online/images/wallpapers/mythic-nezha-golden-flame/mythic-nezha-golden-flame-01.png",
        "sort_order": 0
      },
      {
        "alt_text": "นาจาซาไท้จื้อ เพลิงทองคำพู่กันหมึก #2 — Mythic Nezha Golden Flame – นาจาซาไท้จื้อ เพลิงทองคำพู่กันหมึก",
        "image_url": "https://ninejoe.online/images/wallpapers/mythic-nezha-golden-flame/mythic-nezha-golden-flame-02.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/mythic-nezha-golden-flame/mythic-nezha-golden-flame-02.png",
        "download_url": "https://ninejoe.online/images/wallpapers/mythic-nezha-golden-flame/mythic-nezha-golden-flame-02.png",
        "sort_order": 1
      },
      {
        "alt_text": "นาจาซาไท้จื้อ เพลิงทองคำพู่กันหมึก #3 — Mythic Nezha Golden Flame – นาจาซาไท้จื้อ เพลิงทองคำพู่กันหมึก",
        "image_url": "https://ninejoe.online/images/wallpapers/mythic-nezha-golden-flame/mythic-nezha-golden-flame-03.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/mythic-nezha-golden-flame/mythic-nezha-golden-flame-03.png",
        "download_url": "https://ninejoe.online/images/wallpapers/mythic-nezha-golden-flame/mythic-nezha-golden-flame-03.png",
        "sort_order": 2
      },
      {
        "alt_text": "นาจาซาไท้จื้อ เพลิงทองคำพู่กันหมึก #4 — Mythic Nezha Golden Flame – นาจาซาไท้จื้อ เพลิงทองคำพู่กันหมึก",
        "image_url": "https://ninejoe.online/images/wallpapers/mythic-nezha-golden-flame/mythic-nezha-golden-flame-04.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/mythic-nezha-golden-flame/mythic-nezha-golden-flame-04.png",
        "download_url": "https://ninejoe.online/images/wallpapers/mythic-nezha-golden-flame/mythic-nezha-golden-flame-04.png",
        "sort_order": 3
      },
      {
        "alt_text": "นาจาซาไท้จื้อ เพลิงทองคำพู่กันหมึก #5 — Mythic Nezha Golden Flame – นาจาซาไท้จื้อ เพลิงทองคำพู่กันหมึก",
        "image_url": "https://ninejoe.online/images/wallpapers/mythic-nezha-golden-flame/mythic-nezha-golden-flame-05.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/mythic-nezha-golden-flame/mythic-nezha-golden-flame-05.png",
        "download_url": "https://ninejoe.online/images/wallpapers/mythic-nezha-golden-flame/mythic-nezha-golden-flame-05.png",
        "sort_order": 4
      },
      {
        "alt_text": "นาจาซาไท้จื้อ เพลิงทองคำพู่กันหมึก #6 — Mythic Nezha Golden Flame – นาจาซาไท้จื้อ เพลิงทองคำพู่กันหมึก",
        "image_url": "https://ninejoe.online/images/wallpapers/mythic-nezha-golden-flame/mythic-nezha-golden-flame-06.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/mythic-nezha-golden-flame/mythic-nezha-golden-flame-06.png",
        "download_url": "https://ninejoe.online/images/wallpapers/mythic-nezha-golden-flame/mythic-nezha-golden-flame-06.png",
        "sort_order": 5
      },
      {
        "alt_text": "นาจาซาไท้จื้อ เพลิงทองคำพู่กันหมึก #7 — Mythic Nezha Golden Flame – นาจาซาไท้จื้อ เพลิงทองคำพู่กันหมึก",
        "image_url": "https://ninejoe.online/images/wallpapers/mythic-nezha-golden-flame/mythic-nezha-golden-flame-07.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/mythic-nezha-golden-flame/mythic-nezha-golden-flame-07.png",
        "download_url": "https://ninejoe.online/images/wallpapers/mythic-nezha-golden-flame/mythic-nezha-golden-flame-07.png",
        "sort_order": 6
      },
      {
        "alt_text": "นาจาซาไท้จื้อ เพลิงทองคำพู่กันหมึก #8 — Mythic Nezha Golden Flame – นาจาซาไท้จื้อ เพลิงทองคำพู่กันหมึก",
        "image_url": "https://ninejoe.online/images/wallpapers/mythic-nezha-golden-flame/mythic-nezha-golden-flame-08.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/mythic-nezha-golden-flame/mythic-nezha-golden-flame-08.png",
        "download_url": "https://ninejoe.online/images/wallpapers/mythic-nezha-golden-flame/mythic-nezha-golden-flame-08.png",
        "sort_order": 7
      }
    ]
  },
  {
    "id": "3d274806-1732-4b08-a59a-6c05e5508a8e",
    "slug": "crimson-lotus-prince-nezha",
    "title": "Crimson Lotus Prince Nezha – นาจาปราบมาร ผ้าแพรแดงกงล้ออัคคี",
    "description": "คอลเลกชันนาจาเทพเจ้าแห่งชัยชนะ สะบัดผ้าแพรแดงหงเหอ พร้อมกงล้อเพลิงอัคคีและทวนศักดิ์สิทธิ์ เสริมความกล้าหาญ ชัยชนะเหนือมารอุปสรรค โชคลาภและการคุ้มครองปลอดภัย",
    "category": "🌟 Spiritual Art",
    "cover_image": "https://ninejoe.online/images/wallpapers/crimson-lotus-prince-nezha/crimson-lotus-prince-nezha-01.png",
    "tags": [
      "Spiritual",
      "Nezha",
      "Crimson Ribbon",
      "Lotus Prince",
      "Fire Wheels",
      "Victory",
      "Courage"
    ],
    "collection_images": [
      {
        "alt_text": "นาจาปราบมาร ผ้าแพรแดงกงล้ออัคคี #1 — Crimson Lotus Prince Nezha – นาจาปราบมาร ผ้าแพรแดงกงล้ออัคคี",
        "image_url": "https://ninejoe.online/images/wallpapers/crimson-lotus-prince-nezha/crimson-lotus-prince-nezha-01.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/crimson-lotus-prince-nezha/crimson-lotus-prince-nezha-01.png",
        "download_url": "https://ninejoe.online/images/wallpapers/crimson-lotus-prince-nezha/crimson-lotus-prince-nezha-01.png",
        "sort_order": 0
      },
      {
        "alt_text": "นาจาปราบมาร ผ้าแพรแดงกงล้ออัคคี #2 — Crimson Lotus Prince Nezha – นาจาปราบมาร ผ้าแพรแดงกงล้ออัคคี",
        "image_url": "https://ninejoe.online/images/wallpapers/crimson-lotus-prince-nezha/crimson-lotus-prince-nezha-02.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/crimson-lotus-prince-nezha/crimson-lotus-prince-nezha-02.png",
        "download_url": "https://ninejoe.online/images/wallpapers/crimson-lotus-prince-nezha/crimson-lotus-prince-nezha-02.png",
        "sort_order": 1
      },
      {
        "alt_text": "นาจาปราบมาร ผ้าแพรแดงกงล้ออัคคี #3 — Crimson Lotus Prince Nezha – นาจาปราบมาร ผ้าแพรแดงกงล้ออัคคี",
        "image_url": "https://ninejoe.online/images/wallpapers/crimson-lotus-prince-nezha/crimson-lotus-prince-nezha-03.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/crimson-lotus-prince-nezha/crimson-lotus-prince-nezha-03.png",
        "download_url": "https://ninejoe.online/images/wallpapers/crimson-lotus-prince-nezha/crimson-lotus-prince-nezha-03.png",
        "sort_order": 2
      },
      {
        "alt_text": "นาจาปราบมาร ผ้าแพรแดงกงล้ออัคคี #4 — Crimson Lotus Prince Nezha – นาจาปราบมาร ผ้าแพรแดงกงล้ออัคคี",
        "image_url": "https://ninejoe.online/images/wallpapers/crimson-lotus-prince-nezha/crimson-lotus-prince-nezha-04.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/crimson-lotus-prince-nezha/crimson-lotus-prince-nezha-04.png",
        "download_url": "https://ninejoe.online/images/wallpapers/crimson-lotus-prince-nezha/crimson-lotus-prince-nezha-04.png",
        "sort_order": 3
      },
      {
        "alt_text": "นาจาปราบมาร ผ้าแพรแดงกงล้ออัคคี #5 — Crimson Lotus Prince Nezha – นาจาปราบมาร ผ้าแพรแดงกงล้ออัคคี",
        "image_url": "https://ninejoe.online/images/wallpapers/crimson-lotus-prince-nezha/crimson-lotus-prince-nezha-05.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/crimson-lotus-prince-nezha/crimson-lotus-prince-nezha-05.png",
        "download_url": "https://ninejoe.online/images/wallpapers/crimson-lotus-prince-nezha/crimson-lotus-prince-nezha-05.png",
        "sort_order": 4
      },
      {
        "alt_text": "นาจาปราบมาร ผ้าแพรแดงกงล้ออัคคี #6 — Crimson Lotus Prince Nezha – นาจาปราบมาร ผ้าแพรแดงกงล้ออัคคี",
        "image_url": "https://ninejoe.online/images/wallpapers/crimson-lotus-prince-nezha/crimson-lotus-prince-nezha-06.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/crimson-lotus-prince-nezha/crimson-lotus-prince-nezha-06.png",
        "download_url": "https://ninejoe.online/images/wallpapers/crimson-lotus-prince-nezha/crimson-lotus-prince-nezha-06.png",
        "sort_order": 5
      },
      {
        "alt_text": "นาจาปราบมาร ผ้าแพรแดงกงล้ออัคคี #7 — Crimson Lotus Prince Nezha – นาจาปราบมาร ผ้าแพรแดงกงล้ออัคคี",
        "image_url": "https://ninejoe.online/images/wallpapers/crimson-lotus-prince-nezha/crimson-lotus-prince-nezha-07.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/crimson-lotus-prince-nezha/crimson-lotus-prince-nezha-07.png",
        "download_url": "https://ninejoe.online/images/wallpapers/crimson-lotus-prince-nezha/crimson-lotus-prince-nezha-07.png",
        "sort_order": 6
      },
      {
        "alt_text": "นาจาปราบมาร ผ้าแพรแดงกงล้ออัคคี #8 — Crimson Lotus Prince Nezha – นาจาปราบมาร ผ้าแพรแดงกงล้ออัคคี",
        "image_url": "https://ninejoe.online/images/wallpapers/crimson-lotus-prince-nezha/crimson-lotus-prince-nezha-08.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/crimson-lotus-prince-nezha/crimson-lotus-prince-nezha-08.png",
        "download_url": "https://ninejoe.online/images/wallpapers/crimson-lotus-prince-nezha/crimson-lotus-prince-nezha-08.png",
        "sort_order": 7
      },
      {
        "alt_text": "นาจาปราบมาร ผ้าแพรแดงกงล้ออัคคี #9 — Crimson Lotus Prince Nezha – นาจาปราบมาร ผ้าแพรแดงกงล้ออัคคี",
        "image_url": "https://ninejoe.online/images/wallpapers/crimson-lotus-prince-nezha/crimson-lotus-prince-nezha-09.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/crimson-lotus-prince-nezha/crimson-lotus-prince-nezha-09.png",
        "download_url": "https://ninejoe.online/images/wallpapers/crimson-lotus-prince-nezha/crimson-lotus-prince-nezha-09.png",
        "sort_order": 8
      },
      {
        "alt_text": "นาจาปราบมาร ผ้าแพรแดงกงล้ออัคคี #10 — Crimson Lotus Prince Nezha – นาจาปราบมาร ผ้าแพรแดงกงล้ออัคคี",
        "image_url": "https://ninejoe.online/images/wallpapers/crimson-lotus-prince-nezha/crimson-lotus-prince-nezha-10.png",
        "thumbnail_url": "https://ninejoe.online/images/wallpapers/crimson-lotus-prince-nezha/crimson-lotus-prince-nezha-10.png",
        "download_url": "https://ninejoe.online/images/wallpapers/crimson-lotus-prince-nezha/crimson-lotus-prince-nezha-10.png",
        "sort_order": 9
      }
    ]
  },
  {
    "id": "42fc83ea-252e-4024-9c35-794b38855dc0",
    "slug": "grand-full-moon-lotus-festival",
    "title": "Grand Full Moon Lotus Festival – จันทรามหาบารมี",
    "description": "คอลเลกชันจันทรามหาบารมีและเทศกาลบัวสวรรค์ใต้แสงจันทร์วันเพ็ญ เสริมพลังเมตตามหาเสน่ห์ ความอุดมสมบูรณ์พูนสุข และลาภลอยมหาศาล",
    "category": "🌟 Spiritual Art",
    "cover_image": "https://ninejoe.online/images/wallpapers/grand-full-moon-lotus-festival/fullmoon-festival-bal-ganesha.png",
    "tags": [
      "Spiritual",
      "Full Moon",
      "Lotus Festival",
      "Ganesha",
      "Shiva",
      "Vishnu",
      "Lakshmi",
      "Durga",
      "Krishna",
      "Hanuman",
      "Brahma",
      "Indra",
      "Parvati"
    ],
    "collection_images": [
      {
        "alt_text": "พระพิฆเนศ — Grand Full Moon Lotus Festival – จันทรามหาบารมี (fullmoon-festival-bal-ganesha)",
        "image_url": "https://ninejoe.online/images/wallpapers/grand-full-moon-lotus-festival/fullmoon-festival-bal-ganesha.png",
        "sort_order": 0
      },
      {
        "alt_text": "พระแม่ทุรคา — Grand Full Moon Lotus Festival – จันทรามหาบารมี (fullmoon-festival-goddess-durga)",
        "image_url": "https://ninejoe.online/images/wallpapers/grand-full-moon-lotus-festival/fullmoon-festival-goddess-durga.png",
        "sort_order": 1
      },
      {
        "alt_text": "พระแม่ลักษมี — Grand Full Moon Lotus Festival – จันทรามหาบารมี (fullmoon-festival-goddess-lakshmi)",
        "image_url": "https://ninejoe.online/images/wallpapers/grand-full-moon-lotus-festival/fullmoon-festival-goddess-lakshmi.png",
        "sort_order": 2
      },
      {
        "alt_text": "พระสุรัสวดี — Grand Full Moon Lotus Festival – จันทรามหาบารมี (fullmoon-festival-goddess-saraswati)",
        "image_url": "https://ninejoe.online/images/wallpapers/grand-full-moon-lotus-festival/fullmoon-festival-goddess-saraswati.png",
        "sort_order": 3
      },
      {
        "alt_text": "พระแม่อุมาเทวี — Grand Full Moon Lotus Festival – จันทรามหาบารมี (fullmoon-festival-lord-hanuman)",
        "image_url": "https://ninejoe.online/images/wallpapers/grand-full-moon-lotus-festival/fullmoon-festival-lord-hanuman.png",
        "sort_order": 4
      },
      {
        "alt_text": "พระกฤษณะ — Grand Full Moon Lotus Festival – จันทรามหาบารมี (fullmoon-festival-lord-krishna)",
        "image_url": "https://ninejoe.online/images/wallpapers/grand-full-moon-lotus-festival/fullmoon-festival-lord-krishna.png",
        "sort_order": 5
      },
      {
        "alt_text": "พระขันธกุมาร — Grand Full Moon Lotus Festival – จันทรามหาบารมี (fullmoon-festival-lord-murugan)",
        "image_url": "https://ninejoe.online/images/wallpapers/grand-full-moon-lotus-festival/fullmoon-festival-lord-murugan.png",
        "sort_order": 6
      },
      {
        "alt_text": "ภาพมงคล — Grand Full Moon Lotus Festival – จันทรามหาบารมี (fullmoon-festival-lord-rama)",
        "image_url": "https://ninejoe.online/images/wallpapers/grand-full-moon-lotus-festival/fullmoon-festival-lord-rama.png",
        "sort_order": 7
      },
      {
        "alt_text": "พระศิวะ — Grand Full Moon Lotus Festival – จันทรามหาบารมี (fullmoon-festival-lord-shiva)",
        "image_url": "https://ninejoe.online/images/wallpapers/grand-full-moon-lotus-festival/fullmoon-festival-lord-shiva.png",
        "sort_order": 8
      },
      {
        "alt_text": "พระนารายณ์ — Grand Full Moon Lotus Festival – จันทรามหาบารมี (fullmoon-festival-lord-vishnu)",
        "image_url": "https://ninejoe.online/images/wallpapers/grand-full-moon-lotus-festival/fullmoon-festival-lord-vishnu.png",
        "sort_order": 9
      }
    ]
  },
  {
    "id": "4cf8d512-dc09-4553-a814-c45e51b8f264",
    "slug": "golden-hour-temple-reflections",
    "title": "Golden Sunset & Temple Reflections – สุริยันสะท้อนแว่นทอง",
    "description": "คอลเลกชันแสงสุริยันอัสดงสะท้อนแว่นทองและวัดริมน้ำ เสริมพลังธาตุไฟแห่งความสำเร็จ เกียรติยศ การค้าขายรุ่งเรือง และโชคลาภดั่งทองทา",
    "category": "🌟 Spiritual Art",
    "cover_image": "https://ninejoe.online/images/wallpapers/golden-hour-temple-reflections/golden-glasses-bal-ganesha-reflection-4.png",
    "tags": [
      "Spiritual",
      "Ganesha",
      "Krishna",
      "Sunset",
      "Golden Hour",
      "Temple Reflection",
      "พระพิฆเนศ",
      "พระกฤษณะ",
      "วอลเปเปอร์สายมู"
    ],
    "collection_images": [
      {
        "alt_text": "พระพิฆเนศ — Golden Sunset & Temple Reflections – สุริยันสะท้อนแว่นทอง (golden-glasses-bal-ganesha-reflection-4)",
        "image_url": "https://ninejoe.online/images/wallpapers/golden-hour-temple-reflections/golden-glasses-bal-ganesha-reflection-4.png",
        "sort_order": 0
      },
      {
        "alt_text": "พระพิฆเนศ — Golden Sunset & Temple Reflections – สุริยันสะท้อนแว่นทอง (golden-glasses-bal-ganesha-sunlight-5)",
        "image_url": "https://ninejoe.online/images/wallpapers/golden-hour-temple-reflections/golden-glasses-bal-ganesha-sunlight-5.png",
        "sort_order": 1
      },
      {
        "alt_text": "พระพิฆเนศ — Golden Sunset & Temple Reflections – สุริยันสะท้อนแว่นทอง (golden-glasses-bal-ganesha-sunset-3)",
        "image_url": "https://ninejoe.online/images/wallpapers/golden-hour-temple-reflections/golden-glasses-bal-ganesha-sunset-3.png",
        "sort_order": 2
      },
      {
        "alt_text": "ภาพมงคล — Golden Sunset & Temple Reflections – สุริยันสะท้อนแว่นทอง (golden-glasses-blue-deity-sunset-11)",
        "image_url": "https://ninejoe.online/images/wallpapers/golden-hour-temple-reflections/golden-glasses-blue-deity-sunset-11.png",
        "sort_order": 3
      },
      {
        "alt_text": "พระพิฆเนศ — Golden Sunset & Temple Reflections – สุริยันสะท้อนแว่นทอง (golden-glasses-ganesha-evening-sun-8)",
        "image_url": "https://ninejoe.online/images/wallpapers/golden-hour-temple-reflections/golden-glasses-ganesha-evening-sun-8.png",
        "sort_order": 4
      },
      {
        "alt_text": "พระพิฆเนศ — Golden Sunset & Temple Reflections – สุริยันสะท้อนแว่นทอง (golden-glasses-ganesha-gem-sunset-2)",
        "image_url": "https://ninejoe.online/images/wallpapers/golden-hour-temple-reflections/golden-glasses-ganesha-gem-sunset-2.png",
        "sort_order": 5
      },
      {
        "alt_text": "พระพิฆเนศ — Golden Sunset & Temple Reflections – สุริยันสะท้อนแว่นทอง (golden-glasses-ganesha-golden-reflection-7)",
        "image_url": "https://ninejoe.online/images/wallpapers/golden-hour-temple-reflections/golden-glasses-ganesha-golden-reflection-7.png",
        "sort_order": 6
      },
      {
        "alt_text": "พระพิฆเนศ — Golden Sunset & Temple Reflections – สุริยันสะท้อนแว่นทอง (golden-glasses-ganesha-riverside-temple-6)",
        "image_url": "https://ninejoe.online/images/wallpapers/golden-hour-temple-reflections/golden-glasses-ganesha-riverside-temple-6.png",
        "sort_order": 7
      },
      {
        "alt_text": "ภาพมงคล — Golden Sunset & Temple Reflections – สุริยันสะท้อนแว่นทอง (golden-glasses-goddess-above-lotus-12)",
        "image_url": "https://ninejoe.online/images/wallpapers/golden-hour-temple-reflections/golden-glasses-goddess-above-lotus-12.png",
        "sort_order": 8
      },
      {
        "alt_text": "ภาพมงคล — Golden Sunset & Temple Reflections – สุริยันสะท้อนแว่นทอง (golden-glasses-goddess-golden-lotus-13)",
        "image_url": "https://ninejoe.online/images/wallpapers/golden-hour-temple-reflections/golden-glasses-goddess-golden-lotus-13.png",
        "sort_order": 9
      },
      {
        "alt_text": "ภาพมงคล — Golden Sunset & Temple Reflections – สุริยันสะท้อนแว่นทอง (golden-glasses-goddess-lotus-sunset-10)",
        "image_url": "https://ninejoe.online/images/wallpapers/golden-hour-temple-reflections/golden-glasses-goddess-lotus-sunset-10.png",
        "sort_order": 10
      },
      {
        "alt_text": "ภาพมงคล — Golden Sunset & Temple Reflections – สุริยันสะท้อนแว่นทอง (golden-glasses-goddess-palace-reflection-9)",
        "image_url": "https://ninejoe.online/images/wallpapers/golden-hour-temple-reflections/golden-glasses-goddess-palace-reflection-9.png",
        "sort_order": 11
      },
      {
        "alt_text": "พระกฤษณะ — Golden Sunset & Temple Reflections – สุริยันสะท้อนแว่นทอง (golden-glasses-krishna-sunset-1)",
        "image_url": "https://ninejoe.online/images/wallpapers/golden-hour-temple-reflections/golden-glasses-krishna-sunset-1.png",
        "sort_order": 12
      }
    ]
  },
  {
    "id": "910d51da-c937-4ee9-a9f5-5df40c877ec7",
    "slug": "heavenly-lotus-realm-bodhisattva",
    "title": "Heavenly Pink Lotus Realm – บัวชมพูสรวงสวรรค์และพระโพธิสัตว์",
    "description": "คอลเลกชันแดนบัวชมพูสวรรค์ พระพุทธรูปน้อย และพระโพธิสัตว์กวนอิม เสริมเมตตาธรรมอันบริสุทธิ์ แคล้วคลาด ปัดเป่าทุกข์โศก และความร่มเย็น",
    "category": "🌟 Spiritual Art",
    "cover_image": "https://ninejoe.online/images/wallpapers/heavenly-lotus-realm-bodhisattva/heavenly-lotus-bal-ganesha-1.png",
    "tags": [
      "Spiritual",
      "Bodhisattva",
      "Guanyin",
      "Baby Buddha",
      "Ganesha",
      "Lotus Realm",
      "พระแม่กวนอิม",
      "พระพุทธรูปน้อย",
      "วอลเปเปอร์สายมู"
    ],
    "collection_images": [
      {
        "alt_text": "พระพิฆเนศ — Heavenly Pink Lotus Realm – บัวชมพูสรวงสวรรค์และพระโพธิสัตว์ (heavenly-lotus-bal-ganesha-1)",
        "image_url": "https://ninejoe.online/images/wallpapers/heavenly-lotus-realm-bodhisattva/heavenly-lotus-bal-ganesha-1.png",
        "sort_order": 0
      },
      {
        "alt_text": "พระโพธิสัตว์กวนอิม — Heavenly Pink Lotus Realm – บัวชมพูสรวงสวรรค์และพระโพธิสัตว์ (heavenly-lotus-bodhisattva-guanyin-7)",
        "image_url": "https://ninejoe.online/images/wallpapers/heavenly-lotus-realm-bodhisattva/heavenly-lotus-bodhisattva-guanyin-7.png",
        "sort_order": 1
      },
      {
        "alt_text": "พระพุทธรูปน้อย — Heavenly Pink Lotus Realm – บัวชมพูสรวงสวรรค์และพระโพธิสัตว์ (heavenly-lotus-buddha-child-10)",
        "image_url": "https://ninejoe.online/images/wallpapers/heavenly-lotus-realm-bodhisattva/heavenly-lotus-buddha-child-10.png",
        "sort_order": 2
      },
      {
        "alt_text": "พระพุทธรูปน้อย — Heavenly Pink Lotus Realm – บัวชมพูสรวงสวรรค์และพระโพธิสัตว์ (heavenly-lotus-buddha-throne-4)",
        "image_url": "https://ninejoe.online/images/wallpapers/heavenly-lotus-realm-bodhisattva/heavenly-lotus-buddha-throne-4.png",
        "sort_order": 3
      },
      {
        "alt_text": "ภาพมงคล — Heavenly Pink Lotus Realm – บัวชมพูสรวงสวรรค์และพระโพธิสัตว์ (heavenly-lotus-celestial-bloom-5)",
        "image_url": "https://ninejoe.online/images/wallpapers/heavenly-lotus-realm-bodhisattva/heavenly-lotus-celestial-bloom-5.png",
        "sort_order": 4
      },
      {
        "alt_text": "ภาพมงคล — Heavenly Pink Lotus Realm – บัวชมพูสรวงสวรรค์และพระโพธิสัตว์ (heavenly-lotus-goddess-celestial-9)",
        "image_url": "https://ninejoe.online/images/wallpapers/heavenly-lotus-realm-bodhisattva/heavenly-lotus-goddess-celestial-9.png",
        "sort_order": 5
      },
      {
        "alt_text": "ภาพมงคล — Heavenly Pink Lotus Realm – บัวชมพูสรวงสวรรค์และพระโพธิสัตว์ (heavenly-lotus-goddess-floating-14)",
        "image_url": "https://ninejoe.online/images/wallpapers/heavenly-lotus-realm-bodhisattva/heavenly-lotus-goddess-floating-14.png",
        "sort_order": 6
      },
      {
        "alt_text": "ภาพมงคล — Heavenly Pink Lotus Realm – บัวชมพูสรวงสวรรค์และพระโพธิสัตว์ (heavenly-lotus-goddess-gold-throne-15)",
        "image_url": "https://ninejoe.online/images/wallpapers/heavenly-lotus-realm-bodhisattva/heavenly-lotus-goddess-gold-throne-15.png",
        "sort_order": 7
      },
      {
        "alt_text": "ภาพมงคล — Heavenly Pink Lotus Realm – บัวชมพูสรวงสวรรค์และพระโพธิสัตว์ (heavenly-lotus-goddess-heaven-ray-8)",
        "image_url": "https://ninejoe.online/images/wallpapers/heavenly-lotus-realm-bodhisattva/heavenly-lotus-goddess-heaven-ray-8.png",
        "sort_order": 8
      },
      {
        "alt_text": "ภาพมงคล — Heavenly Pink Lotus Realm – บัวชมพูสรวงสวรรค์และพระโพธิสัตว์ (heavenly-lotus-goddess-luminous-6)",
        "image_url": "https://ninejoe.online/images/wallpapers/heavenly-lotus-realm-bodhisattva/heavenly-lotus-goddess-luminous-6.png",
        "sort_order": 9
      },
      {
        "alt_text": "ภาพมงคล — Heavenly Pink Lotus Realm – บัวชมพูสรวงสวรรค์และพระโพธิสัตว์ (heavenly-lotus-goddess-palace-13)",
        "image_url": "https://ninejoe.online/images/wallpapers/heavenly-lotus-realm-bodhisattva/heavenly-lotus-goddess-palace-13.png",
        "sort_order": 10
      },
      {
        "alt_text": "ภาพมงคล — Heavenly Pink Lotus Realm – บัวชมพูสรวงสวรรค์และพระโพธิสัตว์ (heavenly-lotus-goddess-sunlight-11)",
        "image_url": "https://ninejoe.online/images/wallpapers/heavenly-lotus-realm-bodhisattva/heavenly-lotus-goddess-sunlight-11.png",
        "sort_order": 11
      },
      {
        "alt_text": "ภาพมงคล — Heavenly Pink Lotus Realm – บัวชมพูสรวงสวรรค์และพระโพธิสัตว์ (heavenly-lotus-golden-goddess-3)",
        "image_url": "https://ninejoe.online/images/wallpapers/heavenly-lotus-realm-bodhisattva/heavenly-lotus-golden-goddess-3.png",
        "sort_order": 12
      },
      {
        "alt_text": "ภาพมงคล — Heavenly Pink Lotus Realm – บัวชมพูสรวงสวรรค์และพระโพธิสัตว์ (heavenly-lotus-radiant-glow-2)",
        "image_url": "https://ninejoe.online/images/wallpapers/heavenly-lotus-realm-bodhisattva/heavenly-lotus-radiant-glow-2.png",
        "sort_order": 13
      }
    ]
  },
  {
    "id": "726ab426-6269-4471-a2ac-7484b425f16f",
    "slug": "golden-sacred-geometry-astral",
    "title": "Astral Sacred Geometry – ลำแสงทิพย์มหาบารมี",
    "description": "คอลเลกชันลำแสงมณฑลจักรวาลและเรขาคณิตศักดิ์สิทธิ์ เสริมการดึงดูดพลังงานบวก การปรับสมดุลธาตุ และความเจริญรุ่งเรืองขั้นสูง",
    "category": "🌟 Spiritual Art",
    "cover_image": "https://ninejoe.online/images/wallpapers/golden-sacred-geometry-astral/astral-geometry-durga.png",
    "tags": [
      "Spiritual",
      "Hindu Deities",
      "Sacred Geometry",
      "Astral Light",
      "Ganesha",
      "Lakshmi",
      "Saraswati",
      "Shiva",
      "Vishnu",
      "Brahma",
      "Indra",
      "Durga"
    ],
    "collection_images": [
      {
        "alt_text": "พระแม่ทุรคา — Astral Sacred Geometry – ลำแสงทิพย์มหาบารมี (astral-geometry-durga)",
        "image_url": "https://ninejoe.online/images/wallpapers/golden-sacred-geometry-astral/astral-geometry-durga.png",
        "sort_order": 0
      },
      {
        "alt_text": "พระพิฆเนศ — Astral Sacred Geometry – ลำแสงทิพย์มหาบารมี (astral-geometry-ganesha)",
        "image_url": "https://ninejoe.online/images/wallpapers/golden-sacred-geometry-astral/astral-geometry-ganesha.png",
        "sort_order": 1
      },
      {
        "alt_text": "พระแม่อุมาเทวี — Astral Sacred Geometry – ลำแสงทิพย์มหาบารมี (astral-geometry-hanuman)",
        "image_url": "https://ninejoe.online/images/wallpapers/golden-sacred-geometry-astral/astral-geometry-hanuman.png",
        "sort_order": 2
      },
      {
        "alt_text": "พระกฤษณะ — Astral Sacred Geometry – ลำแสงทิพย์มหาบารมี (astral-geometry-krishna)",
        "image_url": "https://ninejoe.online/images/wallpapers/golden-sacred-geometry-astral/astral-geometry-krishna.png",
        "sort_order": 3
      },
      {
        "alt_text": "พระแม่ลักษมี — Astral Sacred Geometry – ลำแสงทิพย์มหาบารมี (astral-geometry-lakshmi)",
        "image_url": "https://ninejoe.online/images/wallpapers/golden-sacred-geometry-astral/astral-geometry-lakshmi.png",
        "sort_order": 4
      },
      {
        "alt_text": "พระสุรัสวดี — Astral Sacred Geometry – ลำแสงทิพย์มหาบารมี (astral-geometry-saraswati)",
        "image_url": "https://ninejoe.online/images/wallpapers/golden-sacred-geometry-astral/astral-geometry-saraswati.png",
        "sort_order": 5
      },
      {
        "alt_text": "พระศิวะ — Astral Sacred Geometry – ลำแสงทิพย์มหาบารมี (astral-geometry-shiva)",
        "image_url": "https://ninejoe.online/images/wallpapers/golden-sacred-geometry-astral/astral-geometry-shiva.png",
        "sort_order": 6
      },
      {
        "alt_text": "พระนารายณ์ — Astral Sacred Geometry – ลำแสงทิพย์มหาบารมี (astral-geometry-vishnu)",
        "image_url": "https://ninejoe.online/images/wallpapers/golden-sacred-geometry-astral/astral-geometry-vishnu.png",
        "sort_order": 7
      }
    ]
  },
  {
    "id": "0f11dc49-3e7b-497f-abe2-4f0466bd0b9e",
    "slug": "cosmic-sapphire-waters-moon",
    "title": "Cosmic Sapphire Waters – เกลียวแสงสามพิภพ",
    "description": "คอลเลกชันเกลียวแสงจักรวาลและธาราไพลินศักดิ์สิทธิ์ เสริมพลังจิตตานุภาพ สมาธิปัญญาญาณ และการคุ้มครองคุ้มภัยจากทั้งสามพิภพ",
    "category": "🌟 Spiritual Art",
    "cover_image": "https://ninejoe.online/images/wallpapers/cosmic-sapphire-waters-moon/sapphire-cosmic-durga.png",
    "tags": [
      "Spiritual",
      "Hindu Deities",
      "Sapphire Light",
      "Cosmic",
      "Ganesha",
      "Shiva",
      "Lakshmi",
      "Saraswati",
      "Vishnu",
      "Hanuman",
      "Brahma",
      "Durga"
    ],
    "collection_images": [
      {
        "alt_text": "พระแม่ทุรคา — Cosmic Sapphire Waters – เกลียวแสงสามพิภพ (sapphire-cosmic-durga)",
        "image_url": "https://ninejoe.online/images/wallpapers/cosmic-sapphire-waters-moon/sapphire-cosmic-durga.png",
        "sort_order": 0
      },
      {
        "alt_text": "พระพิฆเนศ — Cosmic Sapphire Waters – เกลียวแสงสามพิภพ (sapphire-cosmic-ganesha)",
        "image_url": "https://ninejoe.online/images/wallpapers/cosmic-sapphire-waters-moon/sapphire-cosmic-ganesha.png",
        "sort_order": 1
      },
      {
        "alt_text": "พระแม่อุมาเทวี — Cosmic Sapphire Waters – เกลียวแสงสามพิภพ (sapphire-cosmic-hanuman)",
        "image_url": "https://ninejoe.online/images/wallpapers/cosmic-sapphire-waters-moon/sapphire-cosmic-hanuman.png",
        "sort_order": 2
      },
      {
        "alt_text": "พระกฤษณะ — Cosmic Sapphire Waters – เกลียวแสงสามพิภพ (sapphire-cosmic-krishna)",
        "image_url": "https://ninejoe.online/images/wallpapers/cosmic-sapphire-waters-moon/sapphire-cosmic-krishna.png",
        "sort_order": 3
      },
      {
        "alt_text": "พระแม่ลักษมี — Cosmic Sapphire Waters – เกลียวแสงสามพิภพ (sapphire-cosmic-lakshmi)",
        "image_url": "https://ninejoe.online/images/wallpapers/cosmic-sapphire-waters-moon/sapphire-cosmic-lakshmi.png",
        "sort_order": 4
      },
      {
        "alt_text": "พระสุรัสวดี — Cosmic Sapphire Waters – เกลียวแสงสามพิภพ (sapphire-cosmic-saraswati)",
        "image_url": "https://ninejoe.online/images/wallpapers/cosmic-sapphire-waters-moon/sapphire-cosmic-saraswati.png",
        "sort_order": 5
      },
      {
        "alt_text": "พระศิวะ — Cosmic Sapphire Waters – เกลียวแสงสามพิภพ (sapphire-cosmic-shiva)",
        "image_url": "https://ninejoe.online/images/wallpapers/cosmic-sapphire-waters-moon/sapphire-cosmic-shiva.png",
        "sort_order": 6
      },
      {
        "alt_text": "พระนารายณ์ — Cosmic Sapphire Waters – เกลียวแสงสามพิภพ (sapphire-cosmic-vishnu)",
        "image_url": "https://ninejoe.online/images/wallpapers/cosmic-sapphire-waters-moon/sapphire-cosmic-vishnu.png",
        "sort_order": 7
      }
    ]
  },
  {
    "id": "8911053b-46d7-4fe0-8378-971d9654846a",
    "slug": "golden-dawn-lotus-sanctuary",
    "title": "Golden Dawn Lotus Sanctuary – สนธยาสายธารบัวทอง",
    "description": "คอลเลกชันสายธารทิพย์และดอกบัวทองคำยามสนธยา เสริมความสงบเย็นในจิตใจ โชคลาภเงินทองที่ไหลมาเทมาดั่งสายน้ำไม่ขาดสาย",
    "category": "🌟 Spiritual Art",
    "cover_image": "https://ninejoe.online/images/wallpapers/golden-dawn-lotus-sanctuary/dawn-lotus-bal-durga.png",
    "tags": [
      "Spiritual",
      "Hindu Deities",
      "Golden Lotus",
      "Bal Ganesha",
      "Bal Lakshmi",
      "Bal Saraswati",
      "Bal Krishna",
      "Bal Durga",
      "Bal Hanuman",
      "Bal Indra",
      "Bal Parvati"
    ],
    "collection_images": [
      {
        "alt_text": "พระแม่ทุรคา — Golden Dawn Lotus Sanctuary – สนธยาสายธารบัวทอง (dawn-lotus-bal-durga)",
        "image_url": "https://ninejoe.online/images/wallpapers/golden-dawn-lotus-sanctuary/dawn-lotus-bal-durga.png",
        "sort_order": 0
      },
      {
        "alt_text": "พระพิฆเนศ — Golden Dawn Lotus Sanctuary – สนธยาสายธารบัวทอง (dawn-lotus-bal-ganesha)",
        "image_url": "https://ninejoe.online/images/wallpapers/golden-dawn-lotus-sanctuary/dawn-lotus-bal-ganesha.png",
        "sort_order": 1
      },
      {
        "alt_text": "พระกฤษณะ — Golden Dawn Lotus Sanctuary – สนธยาสายธารบัวทอง (dawn-lotus-bal-krishna)",
        "image_url": "https://ninejoe.online/images/wallpapers/golden-dawn-lotus-sanctuary/dawn-lotus-bal-krishna.png",
        "sort_order": 2
      },
      {
        "alt_text": "พระแม่ลักษมี — Golden Dawn Lotus Sanctuary – สนธยาสายธารบัวทอง (dawn-lotus-bal-lakshmi)",
        "image_url": "https://ninejoe.online/images/wallpapers/golden-dawn-lotus-sanctuary/dawn-lotus-bal-lakshmi.png",
        "sort_order": 3
      },
      {
        "alt_text": "พระขันธกุมาร — Golden Dawn Lotus Sanctuary – สนธยาสายธารบัวทอง (dawn-lotus-bal-murugan)",
        "image_url": "https://ninejoe.online/images/wallpapers/golden-dawn-lotus-sanctuary/dawn-lotus-bal-murugan.png",
        "sort_order": 4
      },
      {
        "alt_text": "พระสุรัสวดี — Golden Dawn Lotus Sanctuary – สนธยาสายธารบัวทอง (dawn-lotus-bal-saraswati)",
        "image_url": "https://ninejoe.online/images/wallpapers/golden-dawn-lotus-sanctuary/dawn-lotus-bal-saraswati.png",
        "sort_order": 5
      },
      {
        "alt_text": "พระศิวะ — Golden Dawn Lotus Sanctuary – สนธยาสายธารบัวทอง (dawn-lotus-bal-shiva)",
        "image_url": "https://ninejoe.online/images/wallpapers/golden-dawn-lotus-sanctuary/dawn-lotus-bal-shiva.png",
        "sort_order": 6
      },
      {
        "alt_text": "พระนารายณ์ — Golden Dawn Lotus Sanctuary – สนธยาสายธารบัวทอง (dawn-lotus-bal-vishnu)",
        "image_url": "https://ninejoe.online/images/wallpapers/golden-dawn-lotus-sanctuary/dawn-lotus-bal-vishnu.png",
        "sort_order": 7
      }
    ]
  },
  {
    "id": "ce81ab3f-cabc-41e3-87af-1af6bd84d44a",
    "slug": "sacred-mountain-temple-exposure",
    "title": "Sacred Mountain & Himmapan – มหาบารมีผาหิมพานต์",
    "description": "คอลเลกชันมหาบารมีแห่งขุนเขาหิมพานต์และวิมานสวรรค์ แสงตะวันส่องผ่านยอดผา เสริมความมั่นคง บารมี เกียรติยศ และความสง่างาม",
    "category": "🌟 Spiritual Art",
    "cover_image": "https://ninejoe.online/images/wallpapers/sacred-mountain-temple-exposure/exposure-mountain-durga-shrine.png",
    "tags": [
      "Spiritual",
      "Hindu Deities",
      "Himmapan",
      "Ganesha",
      "Shiva",
      "Vishnu",
      "Lakshmi",
      "Saraswati",
      "Brahma",
      "Indra",
      "Hanuman",
      "Krishna",
      "Durga"
    ],
    "collection_images": [
      {
        "alt_text": "พระแม่ทุรคา — Sacred Mountain & Himmapan – มหาบารมีผาหิมพานต์ (exposure-mountain-durga-shrine)",
        "image_url": "https://ninejoe.online/images/wallpapers/sacred-mountain-temple-exposure/exposure-mountain-durga-shrine.png",
        "sort_order": 0
      },
      {
        "alt_text": "พระพิฆเนศ — Sacred Mountain & Himmapan – มหาบารมีผาหิมพานต์ (exposure-mountain-ganesha)",
        "image_url": "https://ninejoe.online/images/wallpapers/sacred-mountain-temple-exposure/exposure-mountain-ganesha.png",
        "sort_order": 1
      },
      {
        "alt_text": "พระแม่อุมาเทวี — Sacred Mountain & Himmapan – มหาบารมีผาหิมพานต์ (exposure-mountain-hanuman-summit)",
        "image_url": "https://ninejoe.online/images/wallpapers/sacred-mountain-temple-exposure/exposure-mountain-hanuman-summit.png",
        "sort_order": 2
      },
      {
        "alt_text": "พระกฤษณะ — Sacred Mountain & Himmapan – มหาบารมีผาหิมพานต์ (exposure-mountain-krishna-twilight)",
        "image_url": "https://ninejoe.online/images/wallpapers/sacred-mountain-temple-exposure/exposure-mountain-krishna-twilight.png",
        "sort_order": 3
      },
      {
        "alt_text": "พระแม่ลักษมี — Sacred Mountain & Himmapan – มหาบารมีผาหิมพานต์ (exposure-mountain-lakshmi-lotus)",
        "image_url": "https://ninejoe.online/images/wallpapers/sacred-mountain-temple-exposure/exposure-mountain-lakshmi-lotus.png",
        "sort_order": 4
      },
      {
        "alt_text": "พระขันธกุมาร — Sacred Mountain & Himmapan – มหาบารมีผาหิมพานต์ (exposure-mountain-murugan-peak)",
        "image_url": "https://ninejoe.online/images/wallpapers/sacred-mountain-temple-exposure/exposure-mountain-murugan-peak.png",
        "sort_order": 5
      },
      {
        "alt_text": "ภาพมงคล — Sacred Mountain & Himmapan – มหาบารมีผาหิมพานต์ (exposure-mountain-rama-temple)",
        "image_url": "https://ninejoe.online/images/wallpapers/sacred-mountain-temple-exposure/exposure-mountain-rama-temple.png",
        "sort_order": 6
      },
      {
        "alt_text": "พระสุรัสวดี — Sacred Mountain & Himmapan – มหาบารมีผาหิมพานต์ (exposure-mountain-saraswati-shrine)",
        "image_url": "https://ninejoe.online/images/wallpapers/sacred-mountain-temple-exposure/exposure-mountain-saraswati-shrine.png",
        "sort_order": 7
      },
      {
        "alt_text": "พระศิวะ — Sacred Mountain & Himmapan – มหาบารมีผาหิมพานต์ (exposure-mountain-shiva-kedarnath)",
        "image_url": "https://ninejoe.online/images/wallpapers/sacred-mountain-temple-exposure/exposure-mountain-shiva-kedarnath.png",
        "sort_order": 8
      },
      {
        "alt_text": "พระนารายณ์ — Sacred Mountain & Himmapan – มหาบารมีผาหิมพานต์ (exposure-mountain-vishnu-vaikuntha)",
        "image_url": "https://ninejoe.online/images/wallpapers/sacred-mountain-temple-exposure/exposure-mountain-vishnu-vaikuntha.png",
        "sort_order": 9
      }
    ]
  },
  {
    "id": "8e41a4dc-5ce2-4bc2-8abf-36fa3c7d1126",
    "slug": "joyful-sacred-swings-deities",
    "title": "Joyful Sacred Swings – เทพน้อยเริงชิงช้าสวรรค์",
    "description": "คอลเลกชันองค์เทพน้อยทรงชิงช้าบุปผาสวรรค์ เปี่ยมด้วยความรื่นรมย์ สดใส เสริมพลังชีวิต ความสุขกายสบายใจ และความราบรื่นในทุกก้าว",
    "category": "🌟 Spiritual Art",
    "cover_image": "https://ninejoe.online/images/wallpapers/joyful-sacred-swings-deities/swing-bal-durga-red.png",
    "tags": [
      "Spiritual",
      "Hindu Deities",
      "Bal Ganesha",
      "Sacred Swing",
      "Lakshmi",
      "Shiva",
      "Parvati",
      "Vishnu",
      "Brahma",
      "Saraswati",
      "Murugan",
      "เทพน้อย"
    ],
    "collection_images": [
      {
        "alt_text": "พระแม่ทุรคา — Joyful Sacred Swings – เทพน้อยเริงชิงช้าสวรรค์ (swing-bal-durga-red)",
        "image_url": "https://ninejoe.online/images/wallpapers/joyful-sacred-swings-deities/swing-bal-durga-red.png",
        "sort_order": 0
      },
      {
        "alt_text": "พระพิฆเนศ — Joyful Sacred Swings – เทพน้อยเริงชิงช้าสวรรค์ (swing-bal-ganesha-yellow)",
        "image_url": "https://ninejoe.online/images/wallpapers/joyful-sacred-swings-deities/swing-bal-ganesha-yellow.png",
        "sort_order": 1
      },
      {
        "alt_text": "พระแม่อุมาเทวี — Joyful Sacred Swings – เทพน้อยเริงชิงช้าสวรรค์ (swing-bal-hanuman-orange)",
        "image_url": "https://ninejoe.online/images/wallpapers/joyful-sacred-swings-deities/swing-bal-hanuman-orange.png",
        "sort_order": 2
      },
      {
        "alt_text": "พระกฤษณะ — Joyful Sacred Swings – เทพน้อยเริงชิงช้าสวรรค์ (swing-bal-krishna-blue)",
        "image_url": "https://ninejoe.online/images/wallpapers/joyful-sacred-swings-deities/swing-bal-krishna-blue.png",
        "sort_order": 3
      },
      {
        "alt_text": "พระแม่ลักษมี — Joyful Sacred Swings – เทพน้อยเริงชิงช้าสวรรค์ (swing-bal-lakshmi-pink)",
        "image_url": "https://ninejoe.online/images/wallpapers/joyful-sacred-swings-deities/swing-bal-lakshmi-pink.png",
        "sort_order": 4
      },
      {
        "alt_text": "พระขันธกุมาร — Joyful Sacred Swings – เทพน้อยเริงชิงช้าสวรรค์ (swing-bal-murugan-gold)",
        "image_url": "https://ninejoe.online/images/wallpapers/joyful-sacred-swings-deities/swing-bal-murugan-gold.png",
        "sort_order": 5
      },
      {
        "alt_text": "พระสุรัสวดี — Joyful Sacred Swings – เทพน้อยเริงชิงช้าสวรรค์ (swing-bal-saraswati-white)",
        "image_url": "https://ninejoe.online/images/wallpapers/joyful-sacred-swings-deities/swing-bal-saraswati-white.png",
        "sort_order": 6
      },
      {
        "alt_text": "พระศิวะ — Joyful Sacred Swings – เทพน้อยเริงชิงช้าสวรรค์ (swing-bal-shiva-cyan)",
        "image_url": "https://ninejoe.online/images/wallpapers/joyful-sacred-swings-deities/swing-bal-shiva-cyan.png",
        "sort_order": 7
      }
    ]
  },
  {
    "id": "8eccfc8b-3748-491d-8e1d-eecfa6f771cf",
    "slug": "divine-eyes-sacred-gaze",
    "title": "Divine Eyes: Sacred Gaze – ดวงเนตรทิพย์สิริมงคล",
    "description": "คอลเลกชันดวงเนตรทิพย์แห่งองค์มหาเทพและพระแม่ เปล่งประกายแสงสว่างแห่งปัญญาญาณ การรู้แจ้ง และการคุ้มครองพิทักษ์ภัย คมชัดระดับ Ultra HD 9:16",
    "category": "🌟 Spiritual Art",
    "cover_image": "https://ninejoe.online/images/wallpapers/divine-eyes-sacred-gaze/divine-eyes-bal-ganesha.png",
    "tags": [
      "Spiritual",
      "Hindu Deities",
      "Divine Eyes",
      "Bal Ganesha",
      "Shiva",
      "Lakshmi",
      "Durga",
      "Hanuman",
      "Krishna",
      "Parvati",
      "วอลเปเปอร์สายมู"
    ],
    "collection_images": [
      {
        "alt_text": "พระพิฆเนศ — Divine Eyes: Sacred Gaze – ดวงเนตรทิพย์สิริมงคล (divine-eyes-bal-ganesha)",
        "image_url": "https://ninejoe.online/images/wallpapers/divine-eyes-sacred-gaze/divine-eyes-bal-ganesha.png",
        "sort_order": 0
      },
      {
        "alt_text": "พระแม่ทุรคา — Divine Eyes: Sacred Gaze – ดวงเนตรทิพย์สิริมงคล (divine-eyes-goddess-durga)",
        "image_url": "https://ninejoe.online/images/wallpapers/divine-eyes-sacred-gaze/divine-eyes-goddess-durga.png",
        "sort_order": 1
      },
      {
        "alt_text": "พระแม่ลักษมี — Divine Eyes: Sacred Gaze – ดวงเนตรทิพย์สิริมงคล (divine-eyes-goddess-lakshmi)",
        "image_url": "https://ninejoe.online/images/wallpapers/divine-eyes-sacred-gaze/divine-eyes-goddess-lakshmi.png",
        "sort_order": 2
      },
      {
        "alt_text": "ภาพมงคล — Divine Eyes: Sacred Gaze – ดวงเนตรทิพย์สิริมงคล (divine-eyes-goddess-radha)",
        "image_url": "https://ninejoe.online/images/wallpapers/divine-eyes-sacred-gaze/divine-eyes-goddess-radha.png",
        "sort_order": 3
      },
      {
        "alt_text": "พระสุรัสวดี — Divine Eyes: Sacred Gaze – ดวงเนตรทิพย์สิริมงคล (divine-eyes-goddess-saraswati)",
        "image_url": "https://ninejoe.online/images/wallpapers/divine-eyes-sacred-gaze/divine-eyes-goddess-saraswati.png",
        "sort_order": 4
      },
      {
        "alt_text": "พระแม่อุมาเทวี — Divine Eyes: Sacred Gaze – ดวงเนตรทิพย์สิริมงคล (divine-eyes-lord-hanuman)",
        "image_url": "https://ninejoe.online/images/wallpapers/divine-eyes-sacred-gaze/divine-eyes-lord-hanuman.png",
        "sort_order": 5
      },
      {
        "alt_text": "พระกฤษณะ — Divine Eyes: Sacred Gaze – ดวงเนตรทิพย์สิริมงคล (divine-eyes-lord-krishna)",
        "image_url": "https://ninejoe.online/images/wallpapers/divine-eyes-sacred-gaze/divine-eyes-lord-krishna.png",
        "sort_order": 6
      },
      {
        "alt_text": "พระศิวะ — Divine Eyes: Sacred Gaze – ดวงเนตรทิพย์สิริมงคล (divine-eyes-lord-shiva)",
        "image_url": "https://ninejoe.online/images/wallpapers/divine-eyes-sacred-gaze/divine-eyes-lord-shiva.png",
        "sort_order": 7
      }
    ]
  },
  {
    "id": "b8527dfd-4e51-475a-a12e-72c21625027a",
    "slug": "bal-hindu-deities-sacred-garden",
    "title": "Bal Hindu Deities – เทพน้อยพนาสวรรค์ มงคลบารมีแดนทิพย์",
    "description": "รวมวอลเปเปอร์มงคลพระมหาเทพและพระแม่องค์น้อยในอิริยาบถเปี่ยมเมตตาบารมี ท่ามกลางสวนทิพย์พฤกษาสวรรค์และสระบัวสถิต เสริมพลังศิริมงคล ความสุขอันบริสุทธิ์ เมตตามหานิยม และความอุดมสมบูรณ์ในชีวิต ออกแบบสำหรับหน้าจอมือถือ Ultra HD 9:16 ฟรี",
    "category": "🌟 Spiritual Art",
    "cover_image": "https://ninejoe.online/images/wallpapers/bal-hindu-deities-sacred-garden/bal-ganesha-peaceful-garden.png",
    "tags": [
      "Spiritual",
      "Hindu Deities",
      "Bal Ganesha",
      "Bal Shiva",
      "Bal Lakshmi",
      "Bal Saraswati",
      "Bal Vishnu",
      "Bal Rama",
      "Bal Durga",
      "Bal Parvati",
      "Bal Murugan",
      "เทพน้อย",
      "วอลเปเปอร์สายมู"
    ],
    "collection_images": [
      {
        "alt_text": "พระพิฆเนศน้อย — Bal Ganesha in Sacred Blossom Garden (มงคลความสำเร็จ ปัญญาบริสุทธิ์)",
        "image_url": "https://ninejoe.online/images/wallpapers/bal-hindu-deities-sacred-garden/bal-ganesha-peaceful-garden.png",
        "sort_order": 0
      },
      {
        "alt_text": "พระศิวะน้อย — Bal Shiva & Nandi Kailash Spring (มงคลสันติสุข ชนะอุปสรรค พลังชีวิต)",
        "image_url": "https://ninejoe.online/images/wallpapers/bal-hindu-deities-sacred-garden/bal-shiva-nandi-kailash-spring.png",
        "sort_order": 1
      },
      {
        "alt_text": "พระแม่ลักษมีน้อย — Bal Lakshmi Pink Lotus & Elephants (มงคลโชคลาภ ทรัพย์สิน ความมั่งคั่ง)",
        "image_url": "https://ninejoe.online/images/wallpapers/bal-hindu-deities-sacred-garden/bal-lakshmi-pink-lotus-elephants.png",
        "sort_order": 2
      },
      {
        "alt_text": "พระสุรัสวดีน้อย — Bal Saraswati Swan Lake & Veena (มงคลสติปัญญา การศึกษา ความคิดสร้างสรรค์)",
        "image_url": "https://ninejoe.online/images/wallpapers/bal-hindu-deities-sacred-garden/bal-saraswati-veena-swan-lake.png",
        "sort_order": 3
      },
      {
        "alt_text": "พระนารายณ์น้อย — Bal Vishnu & Garuda Sacred Waters (มงคลคุ้มครอง ร่มเย็น ปกป้องรักษา)",
        "image_url": "https://ninejoe.online/images/wallpapers/bal-hindu-deities-sacred-garden/bal-vishnu-garuda-lotus-river.png",
        "sort_order": 4
      },
      {
        "alt_text": "พระรามน้อย — Bal Rama & Golden Bow in Sacred Forest (มงคลเกียรติยศ ชัยชนะ ความซื่อตรง)",
        "image_url": "https://ninejoe.online/images/wallpapers/bal-hindu-deities-sacred-garden/bal-rama-golden-bow-deer-forest.png",
        "sort_order": 5
      },
      {
        "alt_text": "พระแม่ทุรคาน้อย — Bal Durga & Lion Cub in Blossom Meadow (มงคลอำนาจ ขจัดศัตรู ความแคล้วคลาด)",
        "image_url": "https://ninejoe.online/images/wallpapers/bal-hindu-deities-sacred-garden/bal-durga-lion-cub-flower-meadow.png",
        "sort_order": 6
      },
      {
        "alt_text": "พระแม่อุมาเทวีน้อย — Bal Parvati & Tiger Cub Mountain Sanctuary (มงคลความรัก เมตตามหานิยม ความสมบูรณ์พูนสุข)",
        "image_url": "https://ninejoe.online/images/wallpapers/bal-hindu-deities-sacred-garden/bal-parvati-tiger-cub-himalaya.png",
        "sort_order": 7
      },
      {
        "alt_text": "พระขันธกุมารน้อย — Bal Murugan Peacock & Golden Spear (มงคลความกล้าหาญ ความสำเร็จในหน้าที่การงาน)",
        "image_url": "https://ninejoe.online/images/wallpapers/bal-hindu-deities-sacred-garden/bal-murugan-golden-spear-peacock.png",
        "sort_order": 8
      }
    ]
  },
  {
    "id": "0dd52b36-c3b3-4017-a7fd-a4992de3bb87",
    "slug": "maha-ganapati-wallpapers-7-auspicious-day-colors-collection",
    "title": "Maha Ganapati Wallpapers – 7 Auspicious Day Colors Collection",
    "description": "คอลเลกชันวอลเปเปอร์พระพิฆเนศมหาเศรษฐี (Lord Ganesha) ประทับบนบัลลังก์ดอกบัว เสวยสุขพร้อมบริวารหนูมุสิกะ เสริมสิริมงคล โชคลาภ ความสำเร็จ ขจัดอุปสรรค และความเจริญรุ่งเรือง ออกแบบครบ 7 สีมงคลประจำวันเกิด คมชัดระดับ Ultra HD 9:16 ดาวน์โหลดฟรี",
    "category": "🌟 Spiritual Art",
    "cover_image": "https://ninejoe.online/images/wallpapers/maha-ganesha-7-day-colors/ganesha-ruby-red.png",
    "tags": [
      "ganesha",
      "พระพิฆเนศ",
      "lord ganesha",
      "ganapati",
      "วอลเปเปอร์สายมู",
      "วอลเปเปอร์มงคล",
      "วอลเปเปอร์พระพิฆเนศ",
      "7 วันเกิด",
      "spiritual art",
      "mobile wallpaper",
      "prosperity",
      "success",
      "luck",
      "wealth"
    ],
    "collection_images": [
      {
        "alt_text": "พระพิฆเนศ สีแดงมงคล (วันอาทิตย์) — เสริมอำนาจบารมี ผู้นำ ความกล้าหาญ เกียรติยศ",
        "image_url": "https://ninejoe.online/images/wallpapers/maha-ganesha-7-day-colors/ganesha-ruby-red.png",
        "sort_order": 0
      },
      {
        "alt_text": "พระพิฆเนศ สีฟ้า/น้ำเงิน (วันศุกร์) — เสริมการค้าขาย โชคลาภเงินทอง เสน่ห์เมตตา",
        "image_url": "https://ninejoe.online/images/wallpapers/maha-ganesha-7-day-colors/ganesha-sapphire-blue.png",
        "sort_order": 1
      },
      {
        "alt_text": "พระพิฆเนศ สีเขียวมรกต (วันพุธ) — เสริมสติปัญญา วาจาเรียกทรัพย์ การเจรจาราบรื่น",
        "image_url": "https://ninejoe.online/images/wallpapers/maha-ganesha-7-day-colors/ganesha-emerald-green.png",
        "sort_order": 2
      },
      {
        "alt_text": "พระพิฆเนศ สีม่วง/ชมพูเข้ม (วันเสาร์/อังคาร) — ชนะการแข่งขัน ป้องกันสิ่งชั่วร้าย มั่นคง",
        "image_url": "https://ninejoe.online/images/wallpapers/maha-ganesha-7-day-colors/ganesha-amethyst-purple.png",
        "sort_order": 3
      },
      {
        "alt_text": "พระพิฆเนศ สีเหลือง/ทองคำ (วันจันทร์) — มหาเสน่ห์ เมตตามหานิยม เงินทองไหลมาเทมา",
        "image_url": "https://ninejoe.online/images/wallpapers/maha-ganesha-7-day-colors/ganesha-radiant-gold.png",
        "sort_order": 4
      },
      {
        "alt_text": "พระพิฆเนศ สีส้มอรุณ (วันพฤหัสบดี) — เสริมความก้าวหน้า ผู้ใหญ่เกื้อหนุน การศึกษา",
        "image_url": "https://ninejoe.online/images/wallpapers/maha-ganesha-7-day-colors/ganesha-sunset-orange.png",
        "sort_order": 5
      },
      {
        "alt_text": "พระพิฆเนศ สีชมพูดอกบัว (วันอังคาร) — เสริมความรัก ความเมตตา สุขภาพและความสุข",
        "image_url": "https://ninejoe.online/images/wallpapers/maha-ganesha-7-day-colors/ganesha-lotus-pink.png",
        "sort_order": 6
      }
    ]
  },
  {
    "id": "518ae87b-6059-4def-9bee-696bf12f9ff9",
    "slug": "maha-durga-wallpapers-5-auspicious-elements-collection",
    "title": "Maha Durga Wallpapers – 5 Auspicious Elements Collection",
    "description": "คอลเลกชันวอลเปเปอร์พระแม่ทุรคามหาเทวี (Goddess Durga) ขี่สิงโต ทรงศาสตราวุธศักดิ์สิทธิ์ เสริมพลังมหาบารมี ชัยชนะเด็ดขาดเหนืออุปสรรค และความแคล้วคลาดปลอดภัย ออกแบบพิเศษ 5 ธาตุมงคล (ไฟ, น้ำ, ไม้, มนตรา, ทอง) คมชัดระดับ Ultra HD 9:16 สำหรับหน้าจอมือถือ ดาวน์โหลดฟรี",
    "category": "🌟 Spiritual Art",
    "cover_image": "https://ninejoe.online/images/wallpapers/maha-durga-5-elements/durga-crimson-fire.png",
    "tags": [
      "durga",
      "พระแม่ทุรคา",
      "แม่ทุรคา",
      "goddess durga",
      "วอลเปเปอร์สายมู",
      "วอลเปเปอร์มงคล",
      "spiritual art",
      "mobile wallpaper",
      "hindu deity",
      "protection",
      "victory",
      "lion",
      "5 ธาตุ"
    ],
    "collection_images": [
      {
        "alt_text": "พระแม่ทุรคา ธาตุไฟ (Fire) — มหาอำนาจ ชัยชนะเด็ดขาด เผาผลาญอุปสรรค",
        "image_url": "https://ninejoe.online/images/wallpapers/maha-durga-5-elements/durga-crimson-fire.png",
        "sort_order": 0
      },
      {
        "alt_text": "พระแม่ทุรคา ธาตุน้ำ (Water) — ปัญญาญาณ ความสงบร่มเย็น ชนะใจศัตรู",
        "image_url": "https://ninejoe.online/images/wallpapers/maha-durga-5-elements/durga-sapphire-water.png",
        "sort_order": 1
      },
      {
        "alt_text": "พระแม่ทุรคา ธาตุไม้ (Wood) — การเติบโต ก้าวหน้าในหน้าที่การงาน อุดมสมบูรณ์",
        "image_url": "https://ninejoe.online/images/wallpapers/maha-durga-5-elements/durga-emerald-wood.png",
        "sort_order": 2
      },
      {
        "alt_text": "พระแม่ทุรคา ธาตุลม/มนตรา (Aether) — มหาเสน่ห์ เมตตามหานิยม ลาภลอย",
        "image_url": "https://ninejoe.online/images/wallpapers/maha-durga-5-elements/durga-royal-purple.png",
        "sort_order": 3
      },
      {
        "alt_text": "พระแม่ทุรคา ธาตุทอง-ดิน (Gold/Earth) — มหาเศรษฐี ความมั่งคั่งมั่นคง บารมีสูงสุด",
        "image_url": "https://ninejoe.online/images/wallpapers/maha-durga-5-elements/durga-radiant-gold.png",
        "sort_order": 4
      }
    ]
  },
  {
    "id": "03f23e18-128b-47e4-9e06-97378a55ad52",
    "slug": "lakshmi-3d-chibi-premium-wallpapers",
    "title": "Lakshmi 3D Chibi Premium Wallpapers",
    "description": "A premium collection of adorable Lakshmi 3D Chibi wallpapers inspired by prosperity, abundance, beauty, and positive energy.\\n\\nFeaturing elegant fantasy artwork in multiple color themes including Gold, Pink, White, Green, Blue, and Purple. Designed for mobile devices with stunning details, soft lighting, and luxurious aesthetics.\\n\\nPerfect for wallpaper lovers, spiritual art collectors, and anyone who enjoys beautiful premium digital artwork.",
    "category": "🌟 Spiritual Art",
    "cover_image": "https://res.cloudinary.com/dhhzjeskm/image/upload/v1782308479/ChatGPT_Image_Jun_24_2026_08_38_29_PM_erlrsb.png",
    "tags": [
      "lakshmi",
      "goddess lakshmi",
      "chibi art",
      "3d wallpaper",
      "spiritual wallpaper",
      "fantasy art",
      "mobile wallpaper",
      "premium wallpaper",
      "prosperity",
      "abundance",
      "wealth",
      "luxury",
      "lotus",
      "digital art"
    ],
    "collection_images": [
      {
        "alt_text": "",
        "image_url": "https://res.cloudinary.com/dhhzjeskm/image/upload/v1782308479/ChatGPT_Image_Jun_24_2026_08_38_29_PM_erlrsb.png",
        "sort_order": 0
      },
      {
        "alt_text": "",
        "image_url": "https://res.cloudinary.com/dhhzjeskm/image/upload/v1782308479/ChatGPT_Image_Jun_24_2026_08_38_32_PM_q837g3.png",
        "sort_order": 2
      },
      {
        "alt_text": "",
        "image_url": "https://res.cloudinary.com/dhhzjeskm/image/upload/v1782308479/ChatGPT_Image_Jun_24_2026_08_38_38_PM_bh2hxs.png",
        "sort_order": 4
      },
      {
        "alt_text": "",
        "image_url": "https://res.cloudinary.com/dhhzjeskm/image/upload/v1782308479/ChatGPT_Image_Jun_24_2026_08_38_41_PM_hh9v8u.png",
        "sort_order": 6
      },
      {
        "alt_text": "",
        "image_url": "https://res.cloudinary.com/dhhzjeskm/image/upload/v1782308479/ChatGPT_Image_Jun_24_2026_08_38_24_PM_njwteu.png",
        "sort_order": 8
      },
      {
        "alt_text": "",
        "image_url": "https://res.cloudinary.com/dhhzjeskm/image/upload/v1782308480/ChatGPT_Image_Jun_24_2026_08_38_35_PM_redsaz.png",
        "sort_order": 10
      }
    ]
  },
  {
    "id": "4125b195-fdd9-4011-83a7-1d28f55f13be",
    "slug": "lucky-koi-collection-6-fortune-colors-wallpapers",
    "title": "Lucky Koi Collection – 6 Fortune Colors Wallpapers",
    "description": "A premium collection of fantasy koi fish wallpapers inspired by prosperity, abundance, harmony, and positive energy. Featuring 6 unique color themes designed to enhance your mobile screen with elegance and symbolic fortune.\\n\\nPerfect for wallpaper lovers, spiritual art collectors, and aesthetic enthusiasts.",
    "category": "🌟 Spiritual Art",
    "cover_image": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1781324411/ChatGPT_Image_Jun_13_2026_11_19_46_AM_ggsnhm.png",
    "tags": [
      "koi fish",
      "lucky koi",
      "fortune",
      "prosperity",
      "abundance",
      "spiritual wallpaper",
      "fantasy art",
      "mobile wallpaper",
      "gold",
      "pink",
      "purple",
      "blue",
      "green"
    ],
    "collection_images": [
      {
        "alt_text": "",
        "image_url": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1781324411/ChatGPT_Image_Jun_13_2026_11_19_46_AM_ggsnhm.png",
        "sort_order": 0
      },
      {
        "alt_text": "",
        "image_url": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1781324410/ChatGPT_Image_Jun_13_2026_11_19_49_AM_o1bvqx.png",
        "sort_order": 1
      },
      {
        "alt_text": "",
        "image_url": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1781324410/ChatGPT_Image_Jun_13_2026_11_19_51_AM_peaud6.png",
        "sort_order": 2
      },
      {
        "alt_text": "",
        "image_url": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1781324410/ChatGPT_Image_Jun_13_2026_11_19_56_AM_jvzn35.png",
        "sort_order": 3
      },
      {
        "alt_text": "",
        "image_url": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1781324410/ChatGPT_Image_Jun_13_2026_11_19_58_AM_xhscse.png",
        "sort_order": 4
      },
      {
        "alt_text": "",
        "image_url": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1781324410/ChatGPT_Image_Jun_13_2026_11_19_53_AM_avcgqz.png",
        "sort_order": 5
      }
    ]
  },
  {
    "id": "b876b035-1325-496b-a823-dc56ecc42883",
    "slug": "goddess-of-fortune-3d-premium-pink-collection",
    "title": "Goddess of Fortune 3D Premium Pink Collection",
    "description": "A premium collection of adorable 3D Goddess of Fortune wallpapers featuring soft pink pastel tones, luxurious fantasy details, lotus flowers, golden coins, and elegant spiritual aesthetics.\\n\\nDesigned for mobile devices, each wallpaper combines wealth, prosperity, beauty, and positive energy in a charming chibi art style. Perfect for lock screens, home screens, and collectors of fantasy spiritual artwork.\\n\\nIncludes high-resolution wallpapers optimized for modern smartphones.",
    "category": "🌟 Spiritual Art",
    "cover_image": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1781190135/ChatGPT_Image_Jun_11_2026_09_56_29_PM_zdd67q.png",
    "tags": [],
    "collection_images": [
      {
        "alt_text": "",
        "image_url": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1781190135/ChatGPT_Image_Jun_11_2026_09_56_29_PM_zdd67q.png",
        "sort_order": 0
      },
      {
        "alt_text": "",
        "image_url": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1781190135/ChatGPT_Image_Jun_11_2026_09_56_26_PM_cskion.png",
        "sort_order": 2
      },
      {
        "alt_text": "",
        "image_url": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1781190135/ChatGPT_Image_Jun_11_2026_09_56_32_PM_vjbu4s.png",
        "sort_order": 4
      },
      {
        "alt_text": "",
        "image_url": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1781190132/ChatGPT_Image_Jun_11_2026_09_56_35_PM_shggnb.png",
        "sort_order": 6
      },
      {
        "alt_text": "",
        "image_url": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1781190068/ChatGPT_Image_Jun_11_2026_09_56_38_PM_ib26bu.png",
        "sort_order": 8
      }
    ]
  },
  {
    "id": "3f908282-c2a6-4259-abf6-115d1f77d9c4",
    "slug": "ganesha-3d-lucky-wallpapers-6-auspicious-colors-collection",
    "title": "Ganesha 3D Lucky Wallpapers - 6 Auspicious Colors Collection",
    "description": "Premium 3D Baby Ganesha wallpaper collection featuring 6 auspicious colors designed for mobile devices. Each wallpaper is crafted with detailed fantasy artwork, soft lighting, luxury ornaments, and symbolic prosperity elements.\\n\\nColors Included:\\n• Gold - Wealth & Success\\n• Red - Power & Fortune\\n• Green - Growth & Opportunities\\n• Blue - Peace & Wisdom\\n• Purple - Luck & Spiritual Energy\\n• Pink - Love & Harmony\\n\\nPerfect for lock screens and home screens.\\nHigh-resolution quality for modern smartphones.",
    "category": "🌟 Spiritual Art",
    "cover_image": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780932960/ChatGPT_Image_Jun_8_2026_10_35_44_PM_megxnj.png",
    "tags": [
      "ganesha",
      "wallpaper",
      "3d",
      "phone wallpaper",
      "lucky wallpaper",
      "auspicious",
      "wealth",
      "prosperity",
      "gold",
      "red",
      "green",
      "blue",
      "purple",
      "pink",
      "spiritual",
      "baby ganesha",
      "fantasy art"
    ],
    "collection_images": [
      {
        "alt_text": "",
        "image_url": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780932960/ChatGPT_Image_Jun_8_2026_10_35_44_PM_megxnj.png",
        "sort_order": 0
      },
      {
        "alt_text": "",
        "image_url": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780932960/ChatGPT_Image_Jun_8_2026_10_35_39_PM_nyjc08.png",
        "sort_order": 1
      },
      {
        "alt_text": "",
        "image_url": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780932961/ChatGPT_Image_Jun_8_2026_10_35_37_PM_yvrz3u.png",
        "sort_order": 2
      },
      {
        "alt_text": "",
        "image_url": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780932961/ChatGPT_Image_Jun_8_2026_10_35_35_PM_la1jak.png",
        "sort_order": 3
      },
      {
        "alt_text": "",
        "image_url": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780932960/ChatGPT_Image_Jun_8_2026_10_35_32_PM_alstzo.png",
        "sort_order": 4
      },
      {
        "alt_text": "",
        "image_url": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780932971/ChatGPT_Image_Jun_8_2026_10_35_26_PM_rugtrm.png",
        "sort_order": 5
      }
    ]
  },
  {
    "id": "ce984c2b-b563-4976-a4c0-b12f76813373",
    "slug": "cute-ganesha-premium-wallpapers-collection",
    "title": "Cute Ganesha Premium Wallpapers Collection",
    "description": "A premium collection of cute 3D Ganesha wallpapers featuring luxury pastel themes, divine blessings, prosperity, abundance, and positive energy. Designed in high-quality vertical format for mobile lock screens and home screens.",
    "category": "🌟 Spiritual Art",
    "cover_image": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780753189/ChatGPT_Image_6_%E0%B8%A1%E0%B8%B4.%E0%B8%A2._2569_20_38_15_uo28kb.png",
    "tags": [
      "ganesha",
      "cute ganesha",
      "wallpaper",
      "mobile wallpaper",
      "lockscreen",
      "hindu art",
      "spiritual",
      "prosperity",
      "wealth",
      "pastel",
      "luxury",
      "3d art",
      "ai wallpaper",
      "cute elephant",
      "divine"
    ],
    "collection_images": [
      {
        "alt_text": "",
        "image_url": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780753189/ChatGPT_Image_6_%E0%B8%A1%E0%B8%B4.%E0%B8%A2._2569_20_38_15_uo28kb.png",
        "sort_order": 0
      },
      {
        "alt_text": "",
        "image_url": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780753205/ChatGPT_Image_6_%E0%B8%A1%E0%B8%B4.%E0%B8%A2._2569_20_38_21_ob42q0.png",
        "sort_order": 1
      },
      {
        "alt_text": "",
        "image_url": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780753187/ChatGPT_Image_6_%E0%B8%A1%E0%B8%B4.%E0%B8%A2._2569_20_38_24_lfx53e.png",
        "sort_order": 2
      },
      {
        "alt_text": "",
        "image_url": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780753187/ChatGPT_Image_6_%E0%B8%A1%E0%B8%B4.%E0%B8%A2._2569_20_38_27_m3dyai.png",
        "sort_order": 3
      },
      {
        "alt_text": "",
        "image_url": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780753186/ChatGPT_Image_6_%E0%B8%A1%E0%B8%B4.%E0%B8%A2._2569_20_38_29_fkdlpz.png",
        "sort_order": 4
      }
    ]
  },
  {
    "id": "7a84bf1e-ecec-4e32-8581-eb140c3f2498",
    "slug": "cute-ganesha-wallpapers-6-auspicious-color-collection",
    "title": "Cute Ganesha Wallpapers – 6 Auspicious Color Collection",
    "description": "A beautiful collection of cute Ganesha wallpapers in six auspicious color themes. Designed in a premium fantasy style with gold details, lotus flowers, prosperity symbols, and a charming mouse companion. Perfect for mobile wallpapers, inspiration, and spiritual aesthetics.",
    "category": "🌟 Spiritual Art",
    "cover_image": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780644605/ChatGPT_Image_5_%E0%B8%A1%E0%B8%B4.%E0%B8%A2._2569_14_28_14_yc2vys.png",
    "tags": [],
    "collection_images": [
      {
        "alt_text": "",
        "image_url": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780644605/ChatGPT_Image_5_%E0%B8%A1%E0%B8%B4.%E0%B8%A2._2569_14_28_14_yc2vys.png",
        "sort_order": 0
      },
      {
        "alt_text": "",
        "image_url": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780644605/ChatGPT_Image_5_%E0%B8%A1%E0%B8%B4.%E0%B8%A2._2569_14_27_53_am1zaf.png",
        "sort_order": 1
      },
      {
        "alt_text": "",
        "image_url": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780644605/ChatGPT_Image_5_%E0%B8%A1%E0%B8%B4.%E0%B8%A2._2569_14_27_50_xntmtf.png",
        "sort_order": 2
      },
      {
        "alt_text": "",
        "image_url": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780644605/ChatGPT_Image_5_%E0%B8%A1%E0%B8%B4.%E0%B8%A2._2569_14_27_57_r4s5dj.png",
        "sort_order": 3
      },
      {
        "alt_text": "",
        "image_url": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780644605/ChatGPT_Image_5_%E0%B8%A1%E0%B8%B4.%E0%B8%A2._2569_14_27_55_pv9ei8.png",
        "sort_order": 4
      },
      {
        "alt_text": "",
        "image_url": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780644606/ChatGPT_Image_5_%E0%B8%A1%E0%B8%B4.%E0%B8%A2._2569_14_27_48_gyczc2.png",
        "sort_order": 5
      },
      {
        "alt_text": "",
        "image_url": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780644605/ChatGPT_Image_5_%E0%B8%A1%E0%B8%B4.%E0%B8%A2._2569_14_28_12_ruop2m.png",
        "sort_order": 6
      }
    ]
  },
  {
    "id": "adbb8fe8-ffe5-417d-b7e5-bd51e56c635a",
    "slug": "caishen-god-of-wealth-wallpapers-collection",
    "title": "Caishen God of Wealth Wallpapers Collection",
    "description": "A premium collection of Caishen (Chinese God of Wealth) wallpapers designed to symbolize prosperity, abundance, success, and financial fortune. Featuring five elegant color themes including Gold, Red Gold, White Gold, Blue Gold, and Emerald Gold. Perfect for mobile wallpapers, spiritual inspiration, and aesthetic backgrounds.",
    "category": "🌟 Spiritual Art",
    "cover_image": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780544132/ChatGPT_Image_4_%E0%B8%A1%E0%B8%B4.%E0%B8%A2._2569_10_35_03_rrfoln.png",
    "tags": [
      "caishen",
      "god of wealth",
      "prosperity",
      "abundance",
      "fortune",
      "lucky wallpaper",
      "chinese deity",
      "wealth",
      "success",
      "mobile wallpaper",
      "gold wallpaper",
      "spiritual art",
      "feng shui",
      "wallpaper collection",
      "aesthetic wallpaper"
    ],
    "collection_images": [
      {
        "alt_text": "",
        "image_url": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780544132/ChatGPT_Image_4_%E0%B8%A1%E0%B8%B4.%E0%B8%A2._2569_10_35_03_rrfoln.png",
        "sort_order": 0
      },
      {
        "alt_text": "",
        "image_url": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780544128/ChatGPT_Image_4_%E0%B8%A1%E0%B8%B4.%E0%B8%A2._2569_10_35_11_va14q1.png",
        "sort_order": 1
      },
      {
        "alt_text": "",
        "image_url": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780544128/ChatGPT_Image_4_%E0%B8%A1%E0%B8%B4.%E0%B8%A2._2569_10_35_06_e7ysbn.png",
        "sort_order": 2
      },
      {
        "alt_text": "",
        "image_url": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780544129/ChatGPT_Image_4_%E0%B8%A1%E0%B8%B4.%E0%B8%A2._2569_10_35_14_bfqefk.png",
        "sort_order": 3
      },
      {
        "alt_text": "",
        "image_url": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780544128/ChatGPT_Image_4_%E0%B8%A1%E0%B8%B4.%E0%B8%A2._2569_10_35_08_vw4xcq.png",
        "sort_order": 4
      }
    ]
  },
  {
    "id": "8c4b5ef9-2eb0-4be4-aa42-f874e44e1f6a",
    "slug": "lakshmi-blessed-wallpapers-collection-2026",
    "title": "Lakshmi Blessed Wallpapers Collection 2026",
    "description": "A beautiful collection of Lakshmi-inspired wallpapers designed to symbolize love, prosperity, abundance, and success. Featuring three premium color themes: White Gold, Rose Gold, and Turquoise Gold. Perfect for mobile wallpapers, spiritual inspiration, and aesthetic backgrounds.",
    "category": "🌟 Spiritual Art",
    "cover_image": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780382285/ChatGPT_Image_2_%E0%B8%A1%E0%B8%B4.%E0%B8%A2._2569_13_37_21_f6feje.png",
    "tags": [
      "lakshmi",
      "wallpaper",
      "spiritual",
      "prosperity",
      "abundance",
      "wealth",
      "love",
      "success",
      "white-gold",
      "rose-gold",
      "turquoise-gold",
      "mobile-wallpaper",
      "aesthetic",
      "divine",
      "lotus"
    ],
    "collection_images": [
      {
        "alt_text": "",
        "image_url": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780382285/ChatGPT_Image_2_%E0%B8%A1%E0%B8%B4.%E0%B8%A2._2569_13_37_21_f6feje.png",
        "sort_order": 0
      },
      {
        "alt_text": "",
        "image_url": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780382285/ChatGPT_Image_2_%E0%B8%A1%E0%B8%B4.%E0%B8%A2._2569_13_37_24_kkxybb.png",
        "sort_order": 1
      },
      {
        "alt_text": "",
        "image_url": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780382285/ChatGPT_Image_2_%E0%B8%A1%E0%B8%B4.%E0%B8%A2._2569_13_37_03_o2jrlb.png",
        "sort_order": 2
      },
      {
        "alt_text": "",
        "image_url": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780382285/ChatGPT_Image_2_%E0%B8%A1%E0%B8%B4.%E0%B8%A2._2569_13_37_00_nectd5.png",
        "sort_order": 3
      }
    ]
  },
  {
    "id": "618cc18f-171e-4686-b69d-036d8ecdd99b",
    "slug": "vessavana-guardian-wallpapers-collection",
    "title": "Vessavana Guardian Wallpapers Collection",
    "description": "คอลเลกชันวอลเปเปอร์ท้าวเวสสุวรรณ 3 สี 3 พลัง สำหรับสายมูที่ต้องการเสริมโชคลาภ การเงิน การงาน และการคุ้มครอง ภาพความละเอียดสูงระดับ HD เหมาะสำหรับหน้าจอมือถือทุกขนาด ดาวน์โหลดฟรีและใช้งานได้ทันที",
    "category": "🌟 Spiritual Art",
    "cover_image": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780317703/ChatGPT_Image_1_%E0%B8%A1%E0%B8%B4.%E0%B8%A2._2569_19_41_16_xvy9dm.png",
    "tags": [
      "ท้าวเวสสุวรรณ",
      "วอลเปเปอร์สายมู",
      "วอลเปเปอร์มงคล",
      "wallpaper",
      "wallpaper hd",
      "thai wallpaper",
      "lucky wallpaper",
      "wealth wallpaper",
      "prosperity",
      "protection",
      "wealth",
      "luck",
      "mobile wallpaper",
      "spiritual wallpaper"
    ],
    "collection_images": [
      {
        "alt_text": "",
        "image_url": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780317703/ChatGPT_Image_1_%E0%B8%A1%E0%B8%B4.%E0%B8%A2._2569_19_41_16_xvy9dm.png",
        "sort_order": 0
      },
      {
        "alt_text": "",
        "image_url": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780317704/ChatGPT_Image_1_%E0%B8%A1%E0%B8%B4.%E0%B8%A2._2569_19_41_10_wka7wc.png",
        "sort_order": 1
      },
      {
        "alt_text": "",
        "image_url": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780317704/ChatGPT_Image_1_%E0%B8%A1%E0%B8%B4.%E0%B8%A2._2569_19_41_05_v1wtqv.png",
        "sort_order": 2
      }
    ]
  },
  {
    "id": "e61ee207-a220-4ade-ad17-292c5162b4e9",
    "slug": "luxury-ganesha-wallpapers-collection",
    "title": "Luxury Ganesha Wallpapers Collection",
    "description": "A premium collection of luxury Ganesha wallpapers featuring elegant gold, pink, and blue color themes. Designed with celestial ornaments, lotus flowers, sparkling crystals, and divine prosperity elements. Perfect for mobile backgrounds, spiritual inspiration, manifestation visuals, and aesthetic wallpaper collections.",
    "category": "🌟 Spiritual Art",
    "cover_image": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780237287/ChatGPT_Image_31_%E0%B8%9E.%E0%B8%84._2569_21_21_14_aimgla.png",
    "tags": [
      "ganesha",
      "lord ganesha",
      "wallpaper",
      "mobile wallpaper",
      "spiritual wallpaper",
      "luxury wallpaper",
      "hindu art",
      "divine",
      "lotus",
      "prosperity",
      "gold wallpaper",
      "pink wallpaper",
      "blue wallpaper",
      "celestial",
      "fantasy art",
      "meditation",
      "blessing",
      "manifestation",
      "sacred art",
      "phone background"
    ],
    "collection_images": [
      {
        "alt_text": "",
        "image_url": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780237287/ChatGPT_Image_31_%E0%B8%9E.%E0%B8%84._2569_21_21_14_aimgla.png",
        "sort_order": 0
      },
      {
        "alt_text": "",
        "image_url": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780237289/ChatGPT_Image_31_%E0%B8%9E.%E0%B8%84._2569_21_21_09_odchuu.png",
        "sort_order": 1
      },
      {
        "alt_text": "",
        "image_url": "https://res.cloudinary.com/dhhzjeskm/image/upload/q_auto/f_auto/v1780237288/ChatGPT_Image_31_%E0%B8%9E.%E0%B8%84._2569_21_21_12_mbmxwl.png",
        "sort_order": 2
      }
    ]
  }

];
