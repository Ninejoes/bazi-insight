import { createFileRoute, Link } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { Sparkles, Layers, Moon, BookOpen, Bookmark, Flame, ArrowRight, Clock, Star } from "lucide-react";
import { useEffect, useState } from "react";
import {
  getMemberStats,
  getDivinationHistory,
  getArticleReadingHistory,
  getBookmarkedArticles,
  MEMBER_ACTIVITY_EVENT,
  type MemberStats,
  type DivinationHistoryItem,
  type ArticleReadItem,
  type BookmarkedArticleItem,
} from "@/lib/member-history";

export const Route = createFileRoute("/profile/")({
  head: () =>
    seo({
      title: "โปรไฟล์สมาชิก — Likhitfa",
      description: "หน้าโปรไฟล์ส่วนตัว สรุปสถิติดูดวง ประวัติการอ่าน และรายการที่บันทึกไว้",
      path: "/profile",
      noindex: true,
    }),
  component: ProfileOverview,
});

const shortcuts = [
  { to: "/bazi", label: "ดูดวงปาจื้อ", icon: Sparkles, color: "text-amber-400" },
  { to: "/tarot", label: "เปิดไพ่ยิปซี", icon: Layers, color: "text-rose-400" },
  { to: "/dream", label: "ทำนายฝัน", icon: Moon, color: "text-sky-400" },
  { to: "/virtual-shrine", label: "ไหว้พระ 10 วัด", icon: Star, color: "text-yellow-400" },
  { to: "/articles", label: "คลังบทความ", icon: BookOpen, color: "text-emerald-400" },
  { to: "/destiny-card", label: "บัตรชะตาชีวิต", icon: Sparkles, color: "text-amber-300" },
];

function ProfileOverview() {
  const [stats, setStats] = useState<MemberStats>({
    divinationCount: 0,
    articlesReadCount: 0,
    bookmarksCount: 0,
    favoriteNamesCount: 0,
    totalSavedCount: 0,
    activeStreakDays: 1,
    favoriteCategory: "ปาจื้อ",
  });
  const [recentDivinations, setRecentDivinations] = useState<DivinationHistoryItem[]>([]);
  const [recentArticles, setRecentArticles] = useState<ArticleReadItem[]>([]);
  const [recentBookmarks, setRecentBookmarks] = useState<BookmarkedArticleItem[]>([]);

  useEffect(() => {
    const refresh = () => {
      setStats(getMemberStats());
      setRecentDivinations(getDivinationHistory().slice(0, 3));
      setRecentArticles(getArticleReadingHistory().slice(0, 3));
      setRecentBookmarks(getBookmarkedArticles().slice(0, 3));
    };

    refresh();
    window.addEventListener(MEMBER_ACTIVITY_EVENT, refresh);
    return () => window.removeEventListener(MEMBER_ACTIVITY_EVENT, refresh);
  }, []);

  const statCards = [
    { label: "ครั้งที่ดูดวงจริง", value: stats.divinationCount, sub: `ศาสตร์หลัก: ${stats.favoriteCategory}`, icon: Sparkles },
    { label: "บทความที่อ่านแล้ว", value: stats.articlesReadCount, sub: "คลังความรู้สายมู", icon: BookOpen },
    { label: "รายการที่บันทึกไว้", value: stats.totalSavedCount, sub: `${stats.bookmarksCount} บทความ · ${stats.favoriteNamesCount} ชื่อมงคล`, icon: Bookmark },
    { label: "วันใช้งานสะสม", value: stats.activeStreakDays, sub: "สถิติความต่อเนื่อง", icon: Flame },
  ];

  return (
    <div className="space-y-8">
      {/* 4 Real Stats Grid */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s) => (
          <div key={s.label} className="glass rounded-2xl p-5 border border-gold/15 relative overflow-hidden group hover:border-gold/30 transition">
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">{s.label}</div>
              <s.icon className="h-4 w-4 text-gold/60 group-hover:text-gold transition-colors" />
            </div>
            <div className="mt-2 font-display text-3xl font-bold text-gradient-gold">{s.value}</div>
            <div className="mt-1 text-[11px] text-muted-foreground">{s.sub}</div>
          </div>
        ))}
      </section>

      {/* Quick Launchpad */}
      <section className="glass-strong rounded-3xl p-6 border border-gold/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl text-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-gold" />
            <span>เริ่มต้นดูดวง & เสริมชะตา</span>
          </h2>
          <span className="text-xs text-muted-foreground">เลือกศาสตร์ที่ต้องการ</span>
        </div>
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          {shortcuts.map((s) => (
            <Link
              key={s.to}
              to={s.to}
              className="ornate-border flex flex-col items-center justify-center text-center gap-2 rounded-2xl bg-card/40 p-4 hover:bg-gold/10 hover:border-gold/40 transition group"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold/10 text-gold group-hover:bg-gold group-hover:text-stone-950 transition-all">
                <s.icon className="h-5 w-5" />
              </div>
              <div className="text-xs font-semibold text-foreground group-hover:text-gold transition-colors">{s.label}</div>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Divinations */}
        <section className="glass-strong rounded-3xl p-6 border border-gold/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg text-foreground flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-gold" />
                <span>การดูดวงล่าสุดของคุณ</span>
              </h2>
              <Link to="/profile/history" className="text-xs text-gold hover:underline flex items-center gap-1">
                <span>ดูทั้งหมด</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {recentDivinations.length > 0 ? (
              <ul className="mt-4 divide-y divide-gold/10">
                {recentDivinations.map((h) => (
                  <li key={h.id} className="py-3 flex items-start justify-between gap-3 text-sm">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="inline-block rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-medium text-gold">
                          {h.type}
                        </span>
                        <span className="font-medium text-foreground">{h.title}</span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{h.result}</p>
                      <div className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground/80">
                        <Clock className="h-3 w-3" />
                        <span>{h.date}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-6 rounded-2xl border border-dashed border-gold/20 p-6 text-center">
                <p className="text-xs text-muted-foreground">คุณยังไม่มีประวัติการดูดวง</p>
                <Link
                  to="/bazi"
                  className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-gold/10 px-3 py-1.5 text-xs font-semibold text-gold hover:bg-gold/20 transition"
                >
                  <span>เริ่มดูดวงปาจื้อแรก</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Recently Read Articles */}
        <section className="glass-strong rounded-3xl p-6 border border-gold/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg text-foreground flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-emerald-400" />
                <span>บทความที่เพิ่งอ่าน</span>
              </h2>
              <Link to="/profile/history" className="text-xs text-gold hover:underline flex items-center gap-1">
                <span>ดูประวัติการอ่าน</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {recentArticles.length > 0 ? (
              <ul className="mt-4 divide-y divide-gold/10">
                {recentArticles.map((a) => (
                  <li key={a.id} className="py-3 flex items-center gap-3">
                    <img
                      src={a.cover || "/og-image.jpg"}
                      alt={a.title}
                      className="h-12 w-16 shrink-0 rounded-lg object-cover border border-gold/15"
                    />
                    <div className="flex-1 min-w-0">
                      <Link
                        to="/articles/$slug"
                        params={{ slug: a.slug }}
                        className="text-xs font-semibold text-foreground hover:text-gold transition line-clamp-1 block"
                      >
                        {a.title}
                      </Link>
                      <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span className="text-gold/90">{a.category}</span>
                        <span>•</span>
                        <span>{a.date}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-6 rounded-2xl border border-dashed border-gold/20 p-6 text-center">
                <p className="text-xs text-muted-foreground">ยังไม่มีประวัติการอ่านบทความ</p>
                <Link
                  to="/articles"
                  className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 transition"
                >
                  <span>สำรวจคลังบทความ</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Bookmarked Articles Quick Carousel/Grid */}
      {recentBookmarks.length > 0 && (
        <section className="glass-strong rounded-3xl p-6 border border-gold/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg text-foreground flex items-center gap-2">
              <Bookmark className="h-4 w-4 text-amber-400" />
              <span>บทความที่คุณบันทึกไว้ ({stats.bookmarksCount} เรื่อง)</span>
            </h2>
            <Link to="/profile/history" className="text-xs text-gold hover:underline">
              จัดการคลังบันทึก →
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {recentBookmarks.map((b) => (
              <Link
                key={b.id}
                to="/articles/$slug"
                params={{ slug: b.slug }}
                className="group rounded-2xl border border-gold/15 bg-card/40 p-3 hover:border-gold/40 hover:bg-gold/5 transition"
              >
                <div className="aspect-[16/9] overflow-hidden rounded-xl mb-2.5">
                  <img
                    src={b.cover}
                    alt={b.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>
                <div className="text-[10px] text-gold/80 uppercase font-medium">{b.category}</div>
                <h3 className="text-xs font-semibold text-foreground group-hover:text-gold line-clamp-2 mt-0.5">
                  {b.title}
                </h3>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
