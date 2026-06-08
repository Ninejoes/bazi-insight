import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { type Article } from "@/lib/articles";
import { jsonLd, seo, siteName, siteUrl } from "@/lib/seo";
import { Fragment, useEffect, useState } from "react";

export const Route = createFileRoute("/articles/$slug")({
  head: ({ params, ...ctx }) => {
    const article = (ctx as { loaderData?: { article?: Article | null } }).loaderData?.article;
    if (article) {
      return articleSeo(article);
    }

    return seo({
      title: "บทความ",
      description: "บทความดูดวงจาก Likhitfa",
      path: `/articles/${params.slug}`,
      type: "article",
      keywords: ["บทความดูดวง", "Likhitfa"],
    });
  },
  loader: async ({ params }) => ({
    slug: params.slug,
    article: await loadArticleBySlug(params.slug),
  }),
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
      const response = await fetch("/api/articles");
      const data = await response.json().catch(() => ({}));
      if (!mounted || !response.ok || !data.ok) return;
      const all = (data.articles || []) as Article[];
      setRelated(
        all
          .filter(
            (item) =>
              item.slug !== currentArticle.slug && item.category === currentArticle.category,
          )
          .slice(0, 3),
      );
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

  return (
    <div className="min-h-screen">
      <SiteHeader subtitle="บทความ" subtitleCn="文章" />
      <main className="mx-auto max-w-3xl px-6 pt-10 pb-12">
        <Link to="/articles" className="text-xs text-gold/80 hover:text-gold">
          ← กลับสู่บทความทั้งหมด
        </Link>
        <article className="mt-6">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: articleJsonLd(a).children }}
          />
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
            <img src={a.cover} alt={a.coverAlt || a.title} className="h-full w-full object-cover" />
          </div>
          <div className="prose prose-invert mt-8 max-w-none space-y-4 text-[15px] leading-relaxed text-foreground/90">
            <p className="text-lg italic text-muted-foreground">{a.excerpt}</p>
            {a.content.map((p: string, i: number) => (
              <ArticleBlock key={i} text={p} />
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
  const canonical = article.canonicalUrl || `${window.location.origin}/articles/${article.slug}`;
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
  setJsonLd("article-json-ld", articleJsonLd(article).children);
}

async function loadArticleBySlug(slug: string): Promise<Article | null> {
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
    canonicalUrl: article.canonicalUrl || `${siteUrl}/articles/${article.slug}`,
    image: absoluteImage(article.cover),
    type: "article",
    keywords: article.keywords || ["บทความดูดวง", article.category, article.title],
    publishedTime: article.date,
  });
}

function articleJsonLd(article: Article) {
  const canonical = article.canonicalUrl || `${siteUrl}/articles/${article.slug}`;
  return jsonLd({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.seoDescription || article.excerpt,
    image: [absoluteImage(article.cover)],
    datePublished: article.date,
    dateModified: article.date,
    author: {
      "@type": "Person",
      name: article.author || siteName,
    },
    publisher: {
      "@type": "Organization",
      name: siteName,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/og-image.jpg`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonical,
    },
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

function setJsonLd(id: string, content: string) {
  let element = document.querySelector<HTMLScriptElement>(`script#${id}`);
  if (!element) {
    element = document.createElement("script");
    element.id = id;
    element.type = "application/ld+json";
    document.head.appendChild(element);
  }
  element.textContent = content;
}

function ArticleBlock({ text }: { text: string }) {
  if (text.startsWith("## ")) {
    return (
      <h2 className="pt-4 font-display text-2xl text-foreground">{renderInline(text.slice(3))}</h2>
    );
  }
  if (text.startsWith("### ")) {
    return <h3 className="pt-2 text-xl font-semibold text-foreground">{renderInline(text.slice(4))}</h3>;
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
