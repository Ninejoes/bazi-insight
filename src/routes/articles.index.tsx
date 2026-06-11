import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ALL_ARTICLE_CATEGORY, ARTICLE_CATEGORIES } from "@/lib/article-categories";
import { type Article } from "@/lib/articles";
import { seo } from "@/lib/seo";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/articles/")({
  head: () =>
    seo({
      title: "บทความดูดวง",
      description:
        "รวมบทความและความรู้เรื่องปาจื้อ ไพ่ทาโรต์ ทำนายฝัน พิธีกรรมเสริมโชค และแนวทางอ่านดวงอย่างมีสติ",
      path: "/articles",
      keywords: ["บทความดูดวง", "ความรู้ปาจื้อ", "ไพ่ทาโรต์", "ทำนายฝัน", "เสริมโชค"],
    }),
  component: ArticlesIndex,
});

const categories = [ALL_ARTICLE_CATEGORY, ...ARTICLE_CATEGORIES.map((category) => category.value)];
const PAGE_SIZE = 20;

type ArticlesResponse = {
  ok?: boolean;
  error?: string;
  articles?: Article[];
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
};

function ArticlesIndex() {
  const searchParams =
    typeof window === "undefined" ? new URLSearchParams() : new URLSearchParams(window.location.search);
  const initialSearch = searchParams.get("search") || "";
  const [active, setActive] = useState(ALL_ARTICLE_CATEGORY);
  const [search, setSearch] = useState(initialSearch);
  const [activeSearch, setActiveSearch] = useState(initialSearch.trim());
  const [items, setItems] = useState<Article[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadArticles() {
      setLoading(true);
      setError("");
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      });
      if (active !== ALL_ARTICLE_CATEGORY) params.set("category", active);
      if (activeSearch) params.set("q", activeSearch);
      const response = await fetch(`/api/articles?${params.toString()}`);
      const data = (await response.json().catch(() => ({}))) as ArticlesResponse;
      if (!mounted) return;
      if (!response.ok || !data.ok) {
        setError(data.error || "โหลดบทความจาก Supabase ไม่สำเร็จ");
        setLoading(false);
        return;
      }
      setItems(data.articles || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
      setLoading(false);
    }

    void loadArticles();

    return () => {
      mounted = false;
    };
  }, [active, activeSearch, page]);

  return (
    <div className="min-h-screen">
      <SiteHeader subtitle="บทความ" subtitleCn="文章" />
      <main className="mx-auto max-w-7xl px-6 pt-10 pb-12">
        <section className="text-center">
          <div className="text-[11px] uppercase tracking-[0.3em] text-gold/70">JOURNAL</div>
          <h1 className="mt-2 font-display text-4xl text-foreground md:text-6xl">
            บทความ<span className="text-gradient-gold italic">ของลิขิตฟ้า</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground">
            รวมความรู้ บทวิเคราะห์ และคำแนะนำเรื่องดูดวงจากผู้เชี่ยวชาญ
          </p>
        </section>

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => {
                setActive(c);
                setPage(1);
              }}
              className={`rounded-full px-4 py-1.5 text-sm transition ${
                active === c
                  ? "bg-gradient-gold text-primary-foreground shadow-gold"
                  : "border border-gold/20 text-muted-foreground hover:text-gold"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <form
          className="mx-auto mt-5 flex max-w-2xl flex-col gap-3 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            setPage(1);
            setActiveSearch(search.trim());
          }}
        >
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="input-styled flex-1"
            placeholder="ค้นหาบทความ เช่น ปาจื้อ ไพ่ยิปซี ทำนายฝัน"
            type="search"
          />
          <button className="rounded-xl bg-gradient-gold px-6 py-3 text-sm font-semibold text-primary-foreground shadow-gold">
            ค้นหา
          </button>
        </form>

        <div className="mt-4 text-center text-xs text-muted-foreground">
          {activeSearch || active !== ALL_ARTICLE_CATEGORY
            ? `ค้นหาจากฐานข้อมูล Supabase พบ ${total.toLocaleString("th-TH")} บทความ`
            : `แสดงบทความจากฐานข้อมูลทีละ ${PAGE_SIZE} รายการ`}
        </div>

        {loading ? (
          <div className="mt-8 text-center text-sm text-muted-foreground">
            กำลังโหลดบทความล่าสุด...
          </div>
        ) : null}
        {error ? (
          <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-center text-sm text-rose-200">
            {error}
          </div>
        ) : null}
        {!loading && !error && items.length === 0 ? (
          <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-gold/10 bg-gold/5 px-4 py-3 text-center text-sm text-muted-foreground">
            ไม่พบบทความที่ตรงกับคำค้นหรือหมวดที่เลือก
          </div>
        ) : null}

        <section className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((a) => (
            <Link key={a.slug} to="/articles/$slug" params={{ slug: a.slug }} className="group">
              <article className="ornate-border h-full overflow-hidden rounded-2xl glass-strong transition hover:-translate-y-1 hover:shadow-gold">
                <div className="aspect-[16/10] overflow-hidden">
                  <img
                    src={a.cover}
                    alt={a.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <div className="text-[10px] uppercase tracking-wider text-gold/80">
                    {a.category}
                  </div>
                  <h3 className="mt-1.5 font-display text-xl text-foreground">{a.title}</h3>
                  <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{a.excerpt}</p>
                  <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span>{a.date}</span>
                    <span>·</span>
                    <span>{a.readMin} นาที</span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </section>
        {!loading && !error ? (
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        ) : null}
      </main>
      <SiteFooter />
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1).filter(
    (item) => item === 1 || item === totalPages || Math.abs(item - page) <= 2,
  );

  return (
    <nav className="mt-8 flex flex-wrap items-center justify-center gap-2" aria-label="Article pages">
      <button
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="rounded-full border border-border px-4 py-2 text-xs text-muted-foreground disabled:opacity-40 hover:border-gold/40 hover:text-gold"
      >
        ก่อนหน้า
      </button>
      {pages.map((item, index) => {
        const previous = pages[index - 1];
        return (
          <span key={item} className="flex items-center gap-2">
            {previous && item - previous > 1 ? (
              <span className="text-xs text-muted-foreground">...</span>
            ) : null}
            <button
              onClick={() => onPageChange(item)}
              className={`h-9 min-w-9 rounded-full px-3 text-xs font-semibold ${
                item === page
                  ? "bg-gradient-gold text-primary-foreground"
                  : "border border-border text-muted-foreground hover:border-gold/40 hover:text-gold"
              }`}
            >
              {item}
            </button>
          </span>
        );
      })}
      <button
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="rounded-full border border-border px-4 py-2 text-xs text-muted-foreground disabled:opacity-40 hover:border-gold/40 hover:text-gold"
      >
        ถัดไป
      </button>
    </nav>
  );
}
