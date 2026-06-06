import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { articles, getArticle, type Article } from "@/lib/articles";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/articles/$slug")({
  head: ({ params }) => {
    const a = getArticle(params.slug);
    return seo({
      title: a?.title ?? "บทความ",
      description: a?.excerpt ?? "บทความดูดวงจาก Likhitfa",
      path: `/articles/${params.slug}`,
      image: a?.cover,
      type: "article",
      keywords: ["บทความดูดวง", a?.category ?? "ดูดวง", a?.title ?? "Likhitfa"],
      publishedTime: a?.date,
    });
  },
  loader: ({ params }) => {
    const a = getArticle(params.slug);
    if (!a) throw notFound();
    return a;
  },
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center text-center">
      <div>
        <h1 className="font-display text-4xl text-gold">ไม่พบบทความ</h1>
        <Link to="/articles" className="mt-3 inline-block text-sm text-gold underline">
          ดูบทความทั้งหมด
        </Link>
      </div>
    </div>
  ),
  component: ArticleDetail,
});

function ArticleDetail() {
  const a = Route.useLoaderData() as Article;
  const related = articles
    .filter((x) => x.slug !== a.slug && x.category === a.category)
    .slice(0, 3);

  return (
    <div className="min-h-screen">
      <SiteHeader subtitle="บทความ" subtitleCn="文章" />
      <main className="mx-auto max-w-3xl px-6 pt-10 pb-12">
        <Link to="/articles" className="text-xs text-gold/80 hover:text-gold">
          ← กลับสู่บทความทั้งหมด
        </Link>
        <article className="mt-6">
          <div className="text-[11px] uppercase tracking-[0.25em] text-gold">{a.category}</div>
          <h1 className="mt-2 font-display text-4xl text-foreground md:text-5xl">{a.title}</h1>
          <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
            <span>{a.author}</span>
            <span>·</span>
            <span>{a.date}</span>
            <span>·</span>
            <span>{a.readMin} นาที</span>
          </div>
          <div className="mt-8 aspect-[16/9] overflow-hidden rounded-2xl">
            <img src={a.cover} alt={a.title} className="h-full w-full object-cover" />
          </div>
          <div className="prose prose-invert mt-8 max-w-none space-y-4 text-[15px] leading-relaxed text-foreground/90">
            <p className="text-lg italic text-muted-foreground">{a.excerpt}</p>
            {a.content.map((p: string, i: number) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </article>

        {related.length > 0 && (
          <section className="mt-16">
            <div className="gold-divider mb-6" />
            <h2 className="font-display text-2xl text-foreground">บทความที่เกี่ยวข้อง</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {related.map((r) => (
                <Link key={r.slug} to="/articles/$slug" params={{ slug: r.slug }} className="group">
                  <div className="aspect-[16/10] overflow-hidden rounded-xl">
                    <img
                      src={r.cover}
                      alt={r.title}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                    />
                  </div>
                  <div className="mt-2 text-sm text-foreground group-hover:text-gold">
                    {r.title}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
