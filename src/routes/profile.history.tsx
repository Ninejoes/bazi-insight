import { createFileRoute, Link } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { readStoredUserSession } from "@/lib/user-session";
import { useEffect, useState } from "react";
import {
  Sparkles,
  BookOpen,
  Bookmark,
  Trash2,
  Clock,
  ExternalLink,
  Heart,
  Calendar,
  Layers,
  Moon,
  Compass,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import {
  getDivinationHistory,
  getArticleReadingHistory,
  getBookmarkedArticles,
  getFavoriteNames,
  removeDivinationHistoryItem,
  clearDivinationHistory,
  removeArticleReadingItem,
  clearArticleReadingHistory,
  removeBookmarkedArticle,
  removeFavoriteName,
  MEMBER_ACTIVITY_EVENT,
  type DivinationHistoryItem,
  type ArticleReadItem,
  type BookmarkedArticleItem,
  type FavoriteNameItem,
} from "@/lib/member-history";

export const Route = createFileRoute("/profile/history")({
  head: () =>
    seo({
      title: "ประวัติการดูและการอ่าน — Likhitfa",
      description: "ประวัติการดูดวงทุกศาสตร์ ประวัติการอ่านบทความ และรายการที่บันทึกไว้ของสมาชิก",
      path: "/profile/history",
      noindex: true,
    }),
  component: HistoryPage,
});

type MainTab = "divination" | "articles" | "saved";

const DIVINATION_FILTER_CHIPS = [
  { id: "all", label: "ทั้งหมด" },
  { id: "chinese", label: "ศาสตร์จีน & ปาจื้อ" },
  { id: "tarot", label: "ไพ่ยิปซี" },
  { id: "dream", label: "ทำนายฝัน" },
  { id: "fortune", label: "เซียมซี & พรหมชาติ" },
  { id: "love", label: "สมพงษ์เนื้อคู่" },
  { id: "numerology", label: "เลขศาสตร์ & ทะเบียน" },
  { id: "shrine", label: "ไหว้พระขอพร" },
];

function HistoryPage() {
  const [activeMainTab, setActiveMainTab] = useState<MainTab>("divination");
  const [divFilter, setDivFilter] = useState("all");
  const [confirmClear, setConfirmClear] = useState<MainTab | null>(null);
  const [notice, setNotice] = useState("");

  const [divinations, setDivinations] = useState<DivinationHistoryItem[]>([]);
  const [articles, setArticles] = useState<ArticleReadItem[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkedArticleItem[]>([]);
  const [favNames, setFavNames] = useState<FavoriteNameItem[]>([]);

  const session = typeof window === "undefined" ? null : readStoredUserSession();

  const reloadData = () => {
    setDivinations(getDivinationHistory());
    setArticles(getArticleReadingHistory());
    setBookmarks(getBookmarkedArticles());
    setFavNames(getFavoriteNames());
  };

  useEffect(() => {
    reloadData();
    window.addEventListener(MEMBER_ACTIVITY_EVENT, reloadData);
    return () => window.removeEventListener(MEMBER_ACTIVITY_EVENT, reloadData);
  }, []);

  const handleClear = (tab: MainTab) => {
    if (tab === "divination") clearDivinationHistory();
    else if (tab === "articles") clearArticleReadingHistory();
    setConfirmClear(null);
    setNotice("ล้างประวัติเรียบร้อยแล้ว");
    setTimeout(() => setNotice(""), 3000);
  };

  const filteredDivinations = divFilter === "all"
    ? divinations
    : divinations.filter((item) => {
        if (divFilter === "chinese") return item.category === "chinese";
        if (divFilter === "tarot") return item.category === "tarot";
        if (divFilter === "dream") return item.category === "dream";
        if (divFilter === "fortune") return item.category === "fortune";
        if (divFilter === "love") return item.category === "love";
        if (divFilter === "numerology") return item.category === "numerology";
        if (divFilter === "shrine") return item.category === "shrine";
        return true;
      });

  return (
    <section className="glass-strong rounded-3xl p-6 md:p-8 shadow-elegant border border-gold/20 space-y-6">
      {/* Page Title & Main Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gold/15 pb-6">
        <div>
          <h1 className="font-display text-2xl md:text-3xl text-foreground font-bold">
            ประวัติการดู & การอ่าน
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            บันทึกกิจกรรมส่วนตัว แยกประเภทให้คุณเปิดย้อนดูได้ทุกเมื่อ
          </p>
        </div>

        {/* 3 Main Categories Tabs */}
        <div className="flex p-1 bg-background/60 rounded-2xl border border-gold/20 max-w-full overflow-x-auto">
          <button
            onClick={() => setActiveMainTab("divination")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition shrink-0 ${
              activeMainTab === "divination"
                ? "bg-gradient-gold text-stone-950 shadow-gold"
                : "text-muted-foreground hover:text-gold"
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span>ประวัติดูดวง ({divinations.length})</span>
          </button>

          <button
            onClick={() => setActiveMainTab("articles")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition shrink-0 ${
              activeMainTab === "articles"
                ? "bg-gradient-gold text-stone-950 shadow-gold"
                : "text-muted-foreground hover:text-gold"
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>ประวัติการอ่าน ({articles.length})</span>
          </button>

          <button
            onClick={() => setActiveMainTab("saved")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition shrink-0 ${
              activeMainTab === "saved"
                ? "bg-gradient-gold text-stone-950 shadow-gold"
                : "text-muted-foreground hover:text-gold"
            }`}
          >
            <Bookmark className="h-4 w-4" />
            <span>บันทึกไว้ ({bookmarks.length + favNames.length})</span>
          </button>
        </div>
      </div>

      {/* Sync Badge for Non-members or Members */}
      {!session && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4 text-xs text-amber-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-400" />
            <span>ประวัติถูกบันทึกบนอุปกรณ์นี้อย่างปลอดภัย เข้าสู่ระบบเพื่อซิงค์ข้อมูลไปยังทุกอุปกรณ์ของคุณ</span>
          </div>
          <Link to="/login" className="font-semibold underline shrink-0 hover:text-white">
            เข้าสู่ระบบ ➔
          </Link>
        </div>
      )}

      {notice && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-3 text-xs text-emerald-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{notice}</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 1: DIVINATION READING HISTORY                              */}
      {/* ============================================================== */}
      {activeMainTab === "divination" && (
        <div className="space-y-6">
          {/* Subcategory Filter Pills */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
              {DIVINATION_FILTER_CHIPS.map((chip) => (
                <button
                  key={chip.id}
                  onClick={() => setDivFilter(chip.id)}
                  className={`rounded-full px-3 py-1 text-xs transition ${
                    divFilter === chip.id
                      ? "bg-gold text-stone-950 font-semibold"
                      : "border border-gold/20 text-muted-foreground hover:text-gold hover:border-gold/40"
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {divinations.length > 0 && (
              <button
                onClick={() => setConfirmClear("divination")}
                className="text-xs text-rose-400/80 hover:text-rose-400 flex items-center gap-1 transition"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>ล้างประวัติดูดวง</span>
              </button>
            )}
          </div>

          {/* Confirm Clear Modal */}
          {confirmClear === "divination" && (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 flex items-center justify-between gap-4">
              <span className="text-xs text-rose-200">ต้องการล้างประวัติดูดวงทั้งหมดจริงหรือไม่?</span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleClear("divination")}
                  className="rounded-lg bg-rose-500 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-600"
                >
                  ยืนยันล้าง
                </button>
                <button
                  onClick={() => setConfirmClear(null)}
                  className="rounded-lg border border-gold/20 px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          )}

          {/* List of Divinations */}
          {filteredDivinations.length > 0 ? (
            <div className="space-y-3">
              {filteredDivinations.map((item) => (
                <article
                  key={item.id}
                  className="group rounded-2xl border border-gold/15 bg-card/40 p-4 md:p-5 hover:border-gold/30 hover:bg-gold/5 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-gold/15 border border-gold/30 px-2.5 py-0.5 text-[10px] font-semibold text-gold">
                        {item.type}
                      </span>
                      <h3 className="font-display text-base font-semibold text-foreground">
                        {item.title}
                      </h3>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {item.result}
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/70 pt-1">
                      <Clock className="h-3 w-3 text-gold/70" />
                      <span>{item.date}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <button
                      onClick={() => removeDivinationHistoryItem(item.id)}
                      className="rounded-lg border border-white/10 p-2 text-muted-foreground hover:border-rose-400/40 hover:text-rose-400 transition"
                      title="ลบรายการนี้"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-gold/20 p-12 text-center space-y-3">
              <Sparkles className="h-8 w-8 text-gold/40 mx-auto" />
              <p className="text-sm text-foreground font-medium">ยังไม่มีประวัติในหมวดหมู่นี้</p>
              <p className="text-xs text-muted-foreground">เริ่มเปิดไพ่ ปาจื้อ หรือเสี่ยงทายเพื่อบันทึกผลชะตา</p>
              <div className="pt-2 flex flex-wrap justify-center gap-2">
                <Link to="/bazi" className="rounded-xl bg-gold/10 px-3 py-1.5 text-xs font-semibold text-gold hover:bg-gold/20">
                  ดูดวงปาจื้อ
                </Link>
                <Link to="/tarot" className="rounded-xl bg-gold/10 px-3 py-1.5 text-xs font-semibold text-gold hover:bg-gold/20">
                  เปิดไพ่ยิปซี
                </Link>
                <Link to="/siamsi" className="rounded-xl bg-gold/10 px-3 py-1.5 text-xs font-semibold text-gold hover:bg-gold/20">
                  เสี่ยงเซียมซี
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: ARTICLE READING HISTORY                                 */}
      {/* ============================================================== */}
      {activeMainTab === "articles" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              แสดงบทความที่คุณเคยเปิดอ่าน ({articles.length} เรื่อง)
            </span>
            {articles.length > 0 && (
              <button
                onClick={() => setConfirmClear("articles")}
                className="text-xs text-rose-400/80 hover:text-rose-400 flex items-center gap-1 transition"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>ล้างประวัติการอ่าน</span>
              </button>
            )}
          </div>

          {/* Confirm Clear Modal */}
          {confirmClear === "articles" && (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 flex items-center justify-between gap-4">
              <span className="text-xs text-rose-200">ต้องการล้างประวัติการอ่านบทความทั้งหมดหรือไม่?</span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleClear("articles")}
                  className="rounded-lg bg-rose-500 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-600"
                >
                  ยืนยันล้าง
                </button>
                <button
                  onClick={() => setConfirmClear(null)}
                  className="rounded-lg border border-gold/20 px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          )}

          {articles.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {articles.map((a) => (
                <div
                  key={a.id}
                  className="rounded-2xl border border-gold/15 bg-card/40 p-4 hover:border-gold/30 hover:bg-gold/5 transition flex gap-3.5 items-center group"
                >
                  <img
                    src={a.cover || "/og-image.jpg"}
                    alt={a.title}
                    className="h-16 w-20 shrink-0 rounded-xl object-cover border border-gold/15 group-hover:scale-105 transition duration-300"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-medium text-gold/90 uppercase">{a.category}</span>
                    <Link
                      to="/articles/$slug"
                      params={{ slug: a.slug }}
                      className="font-semibold text-xs text-foreground group-hover:text-gold transition line-clamp-2 block mt-0.5"
                    >
                      {a.title}
                    </Link>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-1.5">
                      <span>⏱ {a.readMin || 3} นาที</span>
                      <span>•</span>
                      <span>{a.date}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeArticleReadingItem(a.slug)}
                    className="p-2 text-muted-foreground hover:text-rose-400 transition"
                    title="ลบจากประวัติการอ่าน"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-gold/20 p-12 text-center space-y-3">
              <BookOpen className="h-8 w-8 text-gold/40 mx-auto" />
              <p className="text-sm text-foreground font-medium">ยังไม่มีประวัติการอ่านบทความ</p>
              <p className="text-xs text-muted-foreground">เมื่อคุณคลิกอ่านบทความ ระบบจะบันทึกให้อัตโนมัติ</p>
              <Link
                to="/articles"
                className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-gold/10 px-4 py-2 text-xs font-semibold text-gold hover:bg-gold/20 transition"
              >
                <span>ไปยังคลังบทความ ➔</span>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: BOOKMARKS & FAVORITES                                   */}
      {/* ============================================================== */}
      {activeMainTab === "saved" && (
        <div className="space-y-8">
          {/* Section 1: Bookmarked Articles */}
          <div className="space-y-4">
            <h2 className="font-display text-base font-bold text-foreground flex items-center gap-2">
              <Bookmark className="h-4 w-4 text-amber-400" />
              <span>บทความที่บุ๊กมาร์กไว้ ({bookmarks.length} เรื่อง)</span>
            </h2>

            {bookmarks.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {bookmarks.map((bm) => (
                  <div
                    key={bm.id}
                    className="rounded-2xl border border-gold/15 bg-card/40 p-4 hover:border-gold/30 hover:bg-gold/5 transition flex flex-col justify-between group"
                  >
                    <div>
                      <div className="aspect-[16/9] overflow-hidden rounded-xl mb-2.5">
                        <img
                          src={bm.cover}
                          alt={bm.title}
                          className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      </div>
                      <span className="text-[10px] text-gold/80 uppercase font-medium">{bm.category}</span>
                      <Link
                        to="/articles/$slug"
                        params={{ slug: bm.slug }}
                        className="text-xs font-semibold text-foreground group-hover:text-gold line-clamp-2 mt-0.5 block"
                      >
                        {bm.title}
                      </Link>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-gold/10 pt-2 text-xs">
                      <span className="text-[10px] text-muted-foreground">บันทึก: {bm.savedAt}</span>
                      <button
                        onClick={() => removeBookmarkedArticle(bm.slug)}
                        className="text-[11px] text-rose-400 hover:underline"
                      >
                        นำออก
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">ยังไม่มีบทความที่บุ๊กมาร์กไว้ (กดรูปดาวในหน้าบทความเพื่อบันทึก)</p>
            )}
          </div>

          {/* Section 2: Favorite Auspicious Names */}
          <div className="space-y-4 border-t border-gold/15 pt-6">
            <h2 className="font-display text-base font-bold text-foreground flex items-center gap-2">
              <Heart className="h-4 w-4 text-rose-400" />
              <span>ชื่อมงคลที่ชื่นชอบ ({favNames.length} ชื่อ)</span>
            </h2>

            {favNames.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {favNames.map((fn) => (
                  <div
                    key={fn.id}
                    className="rounded-2xl border border-gold/15 bg-card/40 p-4 hover:border-gold/30 transition flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-display text-base font-bold text-gradient-gold">{fn.name}</span>
                        {fn.score && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {fn.score} แต้ม
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{fn.meaning}</p>
                    </div>
                    <button
                      onClick={() => removeFavoriteName(fn.id)}
                      className="p-1.5 text-muted-foreground hover:text-rose-400 transition"
                      title="นำออกจากรายการโปรด"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">ยังไม่มีชื่อมงคลที่บันทึกไว้ (สามารถกดหัวใจในระบบตั้งชื่อมงคลเพื่อบันทึก)</p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
