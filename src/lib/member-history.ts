import { readStoredUserSession } from "@/lib/user-session";

export interface DivinationHistoryItem {
  id: string;
  type: string;
  category: "chinese" | "tarot" | "dream" | "fortune" | "love" | "numerology" | "shrine" | "general";
  title: string;
  result: string;
  date: string;
  timestamp: number;
  url?: string;
  metadata?: Record<string, unknown>;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
}

export interface ArticleReadItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  cover: string;
  readMin?: number;
  date: string;
  timestamp: number;
}

export interface BookmarkedArticleItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  cover: string;
  excerpt: string;
  savedAt: string;
  timestamp: number;
}

export interface FavoriteNameItem {
  id: string;
  name: string;
  meaning: string;
  gender: string;
  birthDay: string;
  score?: number;
  savedAt: string;
  timestamp: number;
}

export interface MemberStats {
  divinationCount: number;
  articlesReadCount: number;
  bookmarksCount: number;
  favoriteNamesCount: number;
  totalSavedCount: number;
  activeStreakDays: number;
  favoriteCategory: string;
}

const STORAGE_KEYS = {
  DIVINATION: "likhitfa_divination_history_v1",
  ARTICLES_READ: "likhitfa_articles_read_v1",
  BOOKMARKS: "likhitfa_article_bookmarks_v1",
  FAVORITE_NAMES: "likhitfa_favorite_names_v1",
};

export const MEMBER_ACTIVITY_EVENT = "likhitfa:member-activity-updated";

function notifyChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(MEMBER_ACTIVITY_EVENT));
  }
}

function getStoredItems<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredItems<T>(key: string, items: T[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(items));
    notifyChange();
  } catch (err) {
    console.warn(`Failed to save items to ${key}:`, err);
  }
}

function formatThaiNow(): string {
  const now = new Date();
  const d = now.getDate();
  const m = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."][now.getMonth()];
  const y = now.getFullYear() + 543;
  const time = now.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
  return `${d} ${m} ${y} · ${time} น.`;
}

function mapTypeToCategory(type: string): DivinationHistoryItem["category"] {
  const t = type.toLowerCase();
  if (t.includes("ปาจื้อ") || t.includes("จีน") || t.includes("bazi") || t.includes("ชง") || t.includes("tai sui")) return "chinese";
  if (t.includes("ไพ่") || t.includes("tarot") || t.includes("ยิปซี")) return "tarot";
  if (t.includes("ฝัน") || t.includes("dream")) return "dream";
  if (t.includes("เซียมซี") || t.includes("siamsi") || t.includes("พรหมชาติ") || t.includes("กราฟชีวิต")) return "fortune";
  if (t.includes("รัก") || t.includes("สมพงษ์") || t.includes("love") || t.includes("คู่")) return "love";
  if (t.includes("เบอร์") || t.includes("ทะเบียน") || t.includes("ชื่อ") || t.includes("เลข")) return "numerology";
  if (t.includes("ไหว้พระ") || t.includes("วัด") || t.includes("ขอพร") || t.includes("shrine")) return "shrine";
  return "general";
}

/* -------------------------------------------------------------------------- */
/* 1. DIVINATION READING HISTORY                                              */
/* -------------------------------------------------------------------------- */

export function recordDivinationHistory(entry: {
  type: string;
  title: string;
  result: string;
  url?: string;
  metadata?: Record<string, unknown>;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
}): DivinationHistoryItem {
  const category = mapTypeToCategory(entry.type);
  const now = Date.now();
  const item: DivinationHistoryItem = {
    id: `div-${now}-${Math.random().toString(36).slice(2, 7)}`,
    type: entry.type,
    category,
    title: entry.title,
    result: entry.result,
    date: formatThaiNow(),
    timestamp: now,
    url: entry.url,
    metadata: entry.metadata,
    input: entry.input || entry.metadata,
    output: entry.output,
  };

  const existing = getStoredItems<DivinationHistoryItem>(STORAGE_KEYS.DIVINATION);
  const updated = [item, ...existing].slice(0, 200);
  saveStoredItems(STORAGE_KEYS.DIVINATION, updated);

  if (typeof window !== "undefined") {
    const session = readStoredUserSession();
    if (session?.accessToken) {
      fetch("/api/reading-history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({
          type: entry.type,
          title: entry.title,
          result: entry.result,
          input: entry.input || {},
          output: entry.output || {},
        }),
      }).catch((err) => console.warn("Cloud reading history sync failed:", err));
    }
  }

  return item;
}

export function getDivinationHistory(): DivinationHistoryItem[] {
  return getStoredItems<DivinationHistoryItem>(STORAGE_KEYS.DIVINATION);
}

export function removeDivinationHistoryItem(id: string) {
  const existing = getStoredItems<DivinationHistoryItem>(STORAGE_KEYS.DIVINATION);
  const filtered = existing.filter((item) => item.id !== id);
  saveStoredItems(STORAGE_KEYS.DIVINATION, filtered);

  const session = readStoredUserSession();
  if (session?.accessToken) {
    fetch(`/api/reading-history?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${session.accessToken}` },
    }).catch(() => {});
  }
}

export function clearDivinationHistory() {
  saveStoredItems(STORAGE_KEYS.DIVINATION, []);
}

/* -------------------------------------------------------------------------- */
/* 2. ARTICLE READING HISTORY                                                 */
/* -------------------------------------------------------------------------- */

export function recordArticleRead(article: {
  slug: string;
  title: string;
  category: string;
  cover: string;
  readMin?: number;
}) {
  const now = Date.now();
  const existing = getStoredItems<ArticleReadItem>(STORAGE_KEYS.ARTICLES_READ);
  const withoutCurrent = existing.filter((item) => item.slug !== article.slug);

  const item: ArticleReadItem = {
    id: `art-${article.slug}-${now}`,
    slug: article.slug,
    title: article.title,
    category: article.category,
    cover: article.cover,
    readMin: article.readMin || 3,
    date: formatThaiNow(),
    timestamp: now,
  };

  const updated = [item, ...withoutCurrent].slice(0, 100);
  saveStoredItems(STORAGE_KEYS.ARTICLES_READ, updated);

  const session = readStoredUserSession();
  if (session?.accessToken) {
    fetch("/api/reading-history", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify({
        type: "บทความที่อ่าน",
        title: article.title,
        result: `หมวดหมู่: ${article.category} · อ่าน ${article.readMin || 3} นาที`,
        input: { slug: article.slug, category: article.category },
      }),
    }).catch(() => {});
  }
}

export function getArticleReadingHistory(): ArticleReadItem[] {
  return getStoredItems<ArticleReadItem>(STORAGE_KEYS.ARTICLES_READ);
}

export function removeArticleReadingItem(slug: string) {
  const existing = getStoredItems<ArticleReadItem>(STORAGE_KEYS.ARTICLES_READ);
  const filtered = existing.filter((item) => item.slug !== slug);
  saveStoredItems(STORAGE_KEYS.ARTICLES_READ, filtered);
}

export function clearArticleReadingHistory() {
  saveStoredItems(STORAGE_KEYS.ARTICLES_READ, []);
}

/* -------------------------------------------------------------------------- */
/* 3. BOOKMARKED ARTICLES                                                     */
/* -------------------------------------------------------------------------- */

export function isArticleBookmarked(slug: string): boolean {
  const existing = getStoredItems<BookmarkedArticleItem>(STORAGE_KEYS.BOOKMARKS);
  return existing.some((item) => item.slug === slug);
}

export function toggleArticleBookmark(article: {
  slug: string;
  title: string;
  category: string;
  cover: string;
  excerpt?: string;
}): boolean {
  const existing = getStoredItems<BookmarkedArticleItem>(STORAGE_KEYS.BOOKMARKS);
  const isBookmarked = existing.some((item) => item.slug === article.slug);

  if (isBookmarked) {
    const filtered = existing.filter((item) => item.slug !== article.slug);
    saveStoredItems(STORAGE_KEYS.BOOKMARKS, filtered);
    return false;
  }

  const now = Date.now();
  const newItem: BookmarkedArticleItem = {
    id: `bm-${article.slug}-${now}`,
    slug: article.slug,
    title: article.title,
    category: article.category,
    cover: article.cover,
    excerpt: article.excerpt || "",
    savedAt: formatThaiNow(),
    timestamp: now,
  };

  saveStoredItems(STORAGE_KEYS.BOOKMARKS, [newItem, ...existing]);

  const session = readStoredUserSession();
  if (session?.accessToken) {
    fetch("/api/reading-history", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify({
        type: "บทความที่บันทึก",
        title: article.title,
        result: `บันทึกบทความ ${article.category}`,
        input: { slug: article.slug, category: article.category },
      }),
    }).catch(() => {});
  }

  return true;
}

export function getBookmarkedArticles(): BookmarkedArticleItem[] {
  return getStoredItems<BookmarkedArticleItem>(STORAGE_KEYS.BOOKMARKS);
}

export function removeBookmarkedArticle(slug: string) {
  const existing = getStoredItems<BookmarkedArticleItem>(STORAGE_KEYS.BOOKMARKS);
  const filtered = existing.filter((item) => item.slug !== slug);
  saveStoredItems(STORAGE_KEYS.BOOKMARKS, filtered);
}

/* -------------------------------------------------------------------------- */
/* 4. FAVORITE AUSPICIOUS NAMES                                               */
/* -------------------------------------------------------------------------- */

export function isNameFavorited(id: string): boolean {
  const existing = getStoredItems<FavoriteNameItem>(STORAGE_KEYS.FAVORITE_NAMES);
  return existing.some((item) => item.id === id);
}

export function toggleFavoriteName(nameItem: {
  id: string;
  name: string;
  meaning: string;
  gender: string;
  birthDay: string;
  score?: number;
}): boolean {
  const existing = getStoredItems<FavoriteNameItem>(STORAGE_KEYS.FAVORITE_NAMES);
  const isFav = existing.some((item) => item.id === nameItem.id);

  if (isFav) {
    const filtered = existing.filter((item) => item.id !== nameItem.id);
    saveStoredItems(STORAGE_KEYS.FAVORITE_NAMES, filtered);
    return false;
  }

  const now = Date.now();
  const newItem: FavoriteNameItem = {
    id: nameItem.id,
    name: nameItem.name,
    meaning: nameItem.meaning,
    gender: nameItem.gender,
    birthDay: nameItem.birthDay,
    score: nameItem.score,
    savedAt: formatThaiNow(),
    timestamp: now,
  };

  saveStoredItems(STORAGE_KEYS.FAVORITE_NAMES, [newItem, ...existing]);
  return true;
}

export function getFavoriteNames(): FavoriteNameItem[] {
  return getStoredItems<FavoriteNameItem>(STORAGE_KEYS.FAVORITE_NAMES);
}

export function removeFavoriteName(id: string) {
  const existing = getStoredItems<FavoriteNameItem>(STORAGE_KEYS.FAVORITE_NAMES);
  const filtered = existing.filter((item) => item.id !== id);
  saveStoredItems(STORAGE_KEYS.FAVORITE_NAMES, filtered);
}

/* -------------------------------------------------------------------------- */
/* 5. OVERALL MEMBER ACTIVITY STATS                                           */
/* -------------------------------------------------------------------------- */

export function getMemberStats(): MemberStats {
  const div = getDivinationHistory();
  const art = getArticleReadingHistory();
  const bm = getBookmarkedArticles();
  const favNames = getFavoriteNames();

  const activeDaysSet = new Set<string>();
  for (const item of div) {
    const dayKey = new Date(item.timestamp).toISOString().slice(0, 10);
    activeDaysSet.add(dayKey);
  }
  for (const item of art) {
    const dayKey = new Date(item.timestamp).toISOString().slice(0, 10);
    activeDaysSet.add(dayKey);
  }

  const categoryCounts: Record<string, number> = {};
  for (const item of div) {
    categoryCounts[item.type] = (categoryCounts[item.type] || 0) + 1;
  }
  let favoriteCategory = "ปาจื้อ";
  let maxCount = 0;
  for (const [cat, count] of Object.entries(categoryCounts)) {
    if (count > maxCount) {
      maxCount = count;
      favoriteCategory = cat;
    }
  }

  return {
    divinationCount: div.length,
    articlesReadCount: art.length,
    bookmarksCount: bm.length,
    favoriteNamesCount: favNames.length,
    totalSavedCount: bm.length + favNames.length,
    activeStreakDays: Math.max(1, activeDaysSet.size),
    favoriteCategory,
  };
}

export function clearAllMemberActivity() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEYS.DIVINATION);
  window.localStorage.removeItem(STORAGE_KEYS.ARTICLES_READ);
  window.localStorage.removeItem(STORAGE_KEYS.BOOKMARKS);
  window.localStorage.removeItem(STORAGE_KEYS.FAVORITE_NAMES);
  notifyChange();
}
