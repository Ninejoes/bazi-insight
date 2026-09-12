import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { type Article, formatArticleDate, formatArticleReadTime, getArticle } from "@/lib/articles";
import { seo, siteUrl } from "@/lib/seo";
import { Fragment, useEffect, useState } from "react";
import { Calendar, Clock, Bookmark, Share2, Copy, Check, MessageCircle } from "lucide-react";
import {
  recordArticleRead,
  isArticleBookmarked,
  toggleArticleBookmark,
} from "@/lib/member-history";

export const Route = createFileRoute("/articles/$slug")({
  head: ({ params, ...ctx }) => {
    const article =
      (ctx as { loaderData?: { article?: Article | null } }).loaderData?.article ||
      getArticle(params.slug);
    if (article) {
      return articleSeo(article);
    }

    const decodedSlug = decodeURIComponent(params.slug).replace(/[-_]/g, " ");
    return seo({
      title: `${decodedSlug} | บทความดูดวง โหราศาสตร์`,
      description: `อ่านบทความเรื่อง ${decodedSlug} วิเคราะห์ดวงชะตา โหราศาสตร์ ฮวงจุ้ย และศาสตร์พยากรณ์แม่นยำจาก Likhitfa`,
      path: `/articles/${params.slug}`,
      canonicalUrl: `${siteUrl}/articles/${encodeURIComponent(params.slug)}`,
      type: "article",
      noindex: false,
      keywords: [decodedSlug, "บทความดูดวง", "โหราศาสตร์", "ดวงชะตา", "Likhitfa"],
    });
  },
  loader: async ({ params }) => {
    const article = await loadArticleBySlug(params.slug);
    if (!article) throw notFound();
    return { slug: params.slug, article };
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
  const { slug, article: initialArticle } = Route.useLoaderData() as {
    slug: string;
    article: Article | null;
  };
  const [article, setArticle] = useState<Article | null>(initialArticle);
  const [related, setRelated] = useState<Article[]>([]);
  const [loading, setLoading] = useState(!initialArticle);
  const [error, setError] = useState("");
  const [bookmarked, setBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  useEffect(() => {
    if (!article) return;
    recordArticleRead({
      slug: article.slug,
      title: article.title,
      category: article.category,
      cover: article.cover,
      readMin: article.readMin,
    });
    setBookmarked(isArticleBookmarked(article.slug));
  }, [article]);

  const handleBookmarkToggle = () => {
    if (!article) return;
    const nowSaved = toggleArticleBookmark({
      slug: article.slug,
      title: article.title,
      category: article.category,
      cover: article.cover,
      excerpt: article.excerpt,
    });
    setBookmarked(nowSaved);
    setToastMsg(nowSaved ? "บันทึกบทความลงโปรไฟล์เรียบร้อยแล้ว" : "นำออกจากบทความที่บันทึกแล้ว");
    setTimeout(() => setToastMsg(""), 3000);
  };

  const handleCopyLink = () => {
    if (typeof window === "undefined") return;
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setToastMsg("คัดลอกลิงก์บทความเรียบร้อยแล้ว");
    setTimeout(() => {
      setCopied(false);
      setToastMsg("");
    }, 3000);
  };

  const handleShareLine = () => {
    if (typeof window === "undefined") return;
    window.open(`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(window.location.href)}`, "_blank");
  };

  const handleShareFb = () => {
    if (typeof window === "undefined") return;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, "_blank");
  };

  useEffect(() => {
    let mounted = true;

    async function loadArticle() {
      const loaded = await loadArticleBySlug(slug);
      if (!mounted) return;
      if (!loaded) {
        setError("โหลดบทความจาก Supabase ไม่สำเร็จ");
        setLoading(false);
        return;
      }
      setArticle(loaded);
      if (mounted) setLoading(false);
    }

    if (initialArticle) return;
    void loadArticle();

    return () => {
      mounted = false;
    };
  }, [initialArticle, slug]);

  useEffect(() => {
    if (!article) return;
    applyClientArticleSeo(article);
    const currentArticle = article;
    let mounted = true;

    async function loadRelated() {
      const response = await fetch(
        `/api/articles?category=${encodeURIComponent(currentArticle.category)}&limit=4`,
      );
      const data = await response.json().catch(() => ({}));
      if (!mounted || !response.ok || !data.ok) return;
      const all = (data.articles || []) as Article[];
      setRelated(all.filter((item) => item.slug !== currentArticle.slug).slice(0, 3));
    }

    void loadRelated();
    return () => {
      mounted = false;
    };
  }, [article]);

  if (loading && !article) {
    return (
      <div className="min-h-screen">
        <SiteHeader subtitle="บทความ" subtitleCn="文章" />
        <main className="mx-auto max-w-3xl px-6 pt-10 pb-12 text-sm text-muted-foreground">
          กำลังโหลดบทความ...
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <div>
          <h1 className="font-display text-4xl text-gold">{error || "ไม่พบบทความ"}</h1>
          <Link to="/articles" className="mt-3 inline-block text-sm text-gold underline">
            ดูบทความทั้งหมด
          </Link>
        </div>
      </div>
    );
  }

  const a = article;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.seoTitle || a.title,
    description: a.seoDescription || a.excerpt,
    image: absoluteImage(a.cover),
    datePublished: a.date,
    dateModified: a.date,
    author: {
      "@type": "Person",
      name: a.author || "Likhitfa Editorial Team",
    },
    publisher: {
      "@type": "Organization",
      name: "Likhitfa ลิขิตฟ้า",
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/favicon.svg`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteUrl}/articles/${encodeURIComponent(a.slug)}`,
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "หน้าแรก",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "บทความ",
        item: `${siteUrl}/articles`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: a.title,
        item: `${siteUrl}/articles/${encodeURIComponent(a.slug)}`,
      },
    ],
  };

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <SiteHeader subtitle="บทความ" subtitleCn="文章" />
      <main className="mx-auto max-w-3xl px-6 pt-10 pb-12">
        <Link to="/articles" className="text-xs text-gold/80 hover:text-gold">
          ← กลับสู่บทความทั้งหมด
        </Link>
        <article className="mt-6">
          <div className="text-[11px] uppercase tracking-[0.25em] text-gold">{a.category}</div>
          <h1 className="mt-2 font-display text-4xl text-foreground md:text-5xl">{a.title}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{a.author}</span>
            <span>·</span>
            <span className="inline-flex items-center gap-1 font-medium text-slate-300">
              <Calendar className="h-3.5 w-3.5 text-gold/80" />
              <span>เผยแพร่: {formatArticleDate(a.date, a.createdAt)}</span>
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-1 text-gold/90">
              <Clock className="h-3.5 w-3.5" />
              <span>{formatArticleReadTime(a.readMin)}</span>
            </span>
          </div>
          <div className="mt-8 aspect-[16/9] overflow-hidden rounded-2xl">
            <img src={a.cover} alt={a.coverAlt || a.title} className="h-full w-full object-cover" />
          </div>
          <div className="prose prose-invert mt-8 max-w-none space-y-4 text-[15px] leading-relaxed text-foreground/90">
            <p className="text-lg italic text-muted-foreground">{a.excerpt}</p>
            {a.content.map((p: string, i: number) => (
              <ArticleBlock key={i} text={p} />
            ))}
          </div>

          {/* Interactive Member Action & Social Share Bar */}
          <div className="mt-10 rounded-2xl border border-gold/20 bg-card/50 p-5 backdrop-blur-md">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleBookmarkToggle}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition cursor-pointer ${
                    bookmarked
                      ? "bg-gradient-gold text-stone-950 shadow-gold"
                      : "border border-gold/30 bg-gold/5 text-gold hover:bg-gold/15"
                  }`}
                >
                  <Bookmark className={`h-4 w-4 ${bookmarked ? "fill-stone-950" : ""}`} />
                  <span>{bookmarked ? "บันทึกแล้วในโปรไฟล์" : "บันทึกบทความนี้"}</span>
                </button>

                {toastMsg && (
                  <span className="text-xs text-emerald-300 animate-fade-in font-medium">
                    ✓ {toastMsg}
                  </span>
                )}
              </div>

              {/* Social Share Buttons */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground mr-1">แชร์:</span>
                <button
                  type="button"
                  onClick={handleShareLine}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#06C755]/15 text-[#06C755] hover:bg-[#06C755] hover:text-white transition cursor-pointer"
                  title="แชร์ลง LINE"
                >
                  <MessageCircle className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={handleShareFb}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1877F2]/15 text-[#1877F2] hover:bg-[#1877F2] hover:text-white transition cursor-pointer"
                  title="แชร์ลง Facebook"
                >
                  <Share2 className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-gold/20 bg-card/60 text-gold hover:bg-gold/15 transition cursor-pointer"
                  title="คัดลอกลิงก์"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
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
                      alt={r.coverAlt || r.title}
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

function applyClientArticleSeo(article: Article) {
  const metadata = articleSeo(article);
  const title = metadata.meta.find((item) => "title" in item)?.title || article.title;
  const description = article.seoDescription || article.excerpt;
  const canonical = `${siteUrl}/articles/${encodeURIComponent(article.slug)}`;
  const image = absoluteImage(article.cover);
  document.title = title;
  setMeta("description", description);
  setMeta(
    "keywords",
    (article.keywords || ["บทความดูดวง", article.category, article.title]).join(", "),
  );
  setMeta("twitter:title", title);
  setMeta("twitter:description", description);
  setMeta("twitter:image", image);
  setProperty("og:title", title);
  setProperty("og:description", description);
  setProperty("og:image", image);
  setProperty("og:url", canonical);
  setCanonical(canonical);
}

async function loadArticleBySlug(slug: string): Promise<Article | null> {
  const local = getArticle(slug);
  if (local) return local;

  try {
    const origin = typeof window === "undefined" ? siteUrl : window.location.origin;
    const response = await fetch(`${origin}/api/articles?slug=${encodeURIComponent(slug)}`);
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.ok) return null;
    return (data.articles?.[0] || null) as Article | null;
  } catch {
    return null;
  }
}

function articleSeo(article: Article) {
  return seo({
    title: article.seoTitle || article.title,
    description: article.seoDescription || article.excerpt,
    path: `/articles/${article.slug}`,
    canonicalUrl: `${siteUrl}/articles/${encodeURIComponent(article.slug)}`,
    image: absoluteImage(article.cover),
    type: "article",
    keywords: article.keywords || ["บทความดูดวง", article.category, article.title],
    publishedTime: article.date,
  });
}

function absoluteImage(image?: string) {
  if (!image) return `${siteUrl}/og-image.jpg`;
  if (image.startsWith("http")) return image;
  return `${siteUrl}${image.startsWith("/") ? image : `/${image}`}`;
}

function setMeta(name: string, content: string) {
  const selector = `meta[name="${name}"]`;
  let element = document.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute("name", name);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

function setProperty(property: string, content: string) {
  const selector = `meta[property="${property}"]`;
  let element = document.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute("property", property);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

function setCanonical(href: string) {
  let element = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", "canonical");
    document.head.appendChild(element);
  }
  element.setAttribute("href", href);
}

function ArticleBlock({ text }: { text: string }) {
  if (text.startsWith("## ")) {
    return (
      <h2 className="pt-4 font-display text-2xl text-foreground">{renderInline(text.slice(3))}</h2>
    );
  }
  if (text.startsWith("### ")) {
    return (
      <h3 className="pt-2 text-xl font-semibold text-foreground">{renderInline(text.slice(4))}</h3>
    );
  }
  if (text.trim() === "---") {
    return <hr className="my-6 border-gold/20" />;
  }
  if (text.startsWith("> ")) {
    return (
      <blockquote className="rounded-2xl border-l-4 border-gold bg-gold/5 px-5 py-4 text-gold/90">
        {renderInline(text.slice(2))}
      </blockquote>
    );
  }
  if (text.startsWith("- ")) {
    return (
      <ul className="list-disc space-y-2 pl-6">
        {text
          .split("\n")
          .filter((line) => line.trim().startsWith("- "))
          .map((line, index) => (
            <li key={index}>{renderInline(line.replace(/^- /, ""))}</li>
          ))}
      </ul>
    );
  }
  if (/^\d+\.\s/.test(text.trim())) {
    return (
      <ol className="list-decimal space-y-2 pl-6">
        {text
          .split("\n")
          .filter((line) => /^\d+\.\s/.test(line.trim()))
          .map((line, index) => (
            <li key={index}>{renderInline(line.trim().replace(/^\d+\.\s/, ""))}</li>
          ))}
      </ol>
    );
  }
  return (
    <p>
      {text.split("\n").map((line, index) => (
        <Fragment key={index}>
          {index > 0 ? <br /> : null}
          {renderInline(line)}
        </Fragment>
      ))}
    </p>
  );
}

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g).filter(Boolean);
  return parts.map((part, index) => {
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      const href = safeHref(link[2]);
      return (
        <a key={index} href={href} className="text-gold underline" rel="noreferrer" target="_blank">
          {link[1]}
        </a>
      );
    }
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    return <Fragment key={index}>{part}</Fragment>;
  });
}

function safeHref(href: string) {
  return /^https?:\/\//i.test(href) ? href : "#";
}
