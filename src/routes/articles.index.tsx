import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
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

const categories = ["ทั้งหมด", "ปาจื้อ", "ไพ่ยิปซี", "ทำนายฝัน"];

function ArticlesIndex() {
  const [active, setActive] = useState("ทั้งหมด");
  const [items, setItems] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadArticles() {
      const response = await fetch("/api/articles");
      const data = await response.json().catch(() => ({}));
      if (!mounted) return;
      if (!response.ok || !data.ok) {
        setError(data.error || "โหลดบทความจาก Supabase ไม่สำเร็จ");
        setLoading(false);
        return;
      }
      setItems(data.articles || []);
      if (mounted) setLoading(false);
    }

    void loadArticles();

    return () => {
      mounted = false;
    };
  }, []);

  const filtered = active === "ทั้งหมด" ? items : items.filter((a) => a.category === active);
  const featured = filtered[0];
  const rest = filtered.slice(1);

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
              onClick={() => setActive(c)}
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
            ยังไม่มีบทความจาก Supabase
          </div>
        ) : null}

        {featured && (
          <Link to="/articles/$slug" params={{ slug: featured.slug }} className="mt-10 block">
            <article className="glass-strong overflow-hidden rounded-3xl shadow-elegant transition hover:shadow-gold md:grid md:grid-cols-2">
              <div className="aspect-[16/10] overflow-hidden md:aspect-auto">
                <img
                  src={featured.cover}
                  alt={featured.title}
                  className="h-full w-full object-cover transition group-hover:scale-105"
                />
              </div>
              <div className="flex flex-col justify-center p-8">
                <div className="text-[11px] uppercase tracking-[0.25em] text-gold">
                  FEATURED · {featured.category}
                </div>
                <h2 className="mt-2 font-display text-3xl text-foreground md:text-4xl">
                  {featured.title}
                </h2>
                <p className="mt-3 text-sm text-muted-foreground">{featured.excerpt}</p>
                <div className="mt-5 flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{featured.author}</span>
                  <span>·</span>
                  <span>{featured.date}</span>
                  <span>·</span>
                  <span>{featured.readMin} นาที</span>
                </div>
              </div>
            </article>
          </Link>
        )}

        <section className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rest.map((a) => (
            <Link key={a.slug} to="/articles/$slug" params={{ slug: a.slug }}>
              <article className="ornate-border h-full overflow-hidden rounded-2xl glass-strong transition hover:-translate-y-1 hover:shadow-gold">
                <div className="aspect-[16/10] overflow-hidden">
                  <img src={a.cover} alt={a.title} className="h-full w-full object-cover" />
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
      </main>
      <SiteFooter />
    </div>
  );
}
