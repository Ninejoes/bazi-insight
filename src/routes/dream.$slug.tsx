import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { type DreamRecord } from "@/lib/admin-content";
import { seo, siteUrl } from "@/lib/seo";
import { recordDivinationHistory } from "@/lib/member-history";
import { ShareStoryModal, type ShareCardData } from "@/components/share-story-modal";
import { useEffect, useState } from "react";
import { Copy, Check, Share2, Sparkles } from "lucide-react";

export const Route = createFileRoute("/dream/$slug")({
  head: ({ params, ...ctx }) => {
    const dream = (ctx as { loaderData?: { dream?: DreamRecord | null } }).loaderData?.dream;
    if (dream) return dreamSeo(dream);

    const decodedKeyword = decodeURIComponent(params.slug);
    return seo({
      title: `ทำนายฝันเห็น${decodedKeyword} แปลว่าอะไร เลขเด็ดนำโชค`,
      description: `ดูคำทำนายฝันเห็น${decodedKeyword} ฝันเห็น${decodedKeyword}หมายถึงอะไร พร้อมเลขเด็ดงวดนี้ ช่วงเวลาฝันบอกเหตุ และวิธีแก้เคล็ดตามตำราโบราณ`,
      path: `/dream/${encodeURIComponent(params.slug)}`,
      canonicalUrl: `${siteUrl}/dream/${encodeURIComponent(params.slug)}`,
      noindex: false,
      keywords: [
        `ฝันเห็น${decodedKeyword}`,
        `ทำนายฝัน${decodedKeyword}`,
        `เลขเด็ดฝันเห็น${decodedKeyword}`,
        "ทำนายฝัน",
        "เลขเด็ดงวดนี้",
      ],
    });
  },
  loader: async ({ params }) => {
    const dream = await loadDreamBySlug(params.slug);
    if (!dream) throw notFound();
    return { slug: params.slug, dream };
  },
  notFoundComponent: () => (
    <div className="min-h-screen">
      <SiteHeader subtitle="ทำนายฝัน" subtitleCn="解夢" />
      <main className="mx-auto max-w-4xl px-6 pt-16 pb-12 text-center">
        <h1 className="font-display text-4xl text-gold">ไม่พบคำทำนายฝัน</h1>
        <Link to="/dream" className="mt-4 inline-block text-sm text-gold underline">
          กลับไปค้นหาคำทำนายฝัน
        </Link>
      </main>
      <SiteFooter />
    </div>
  ),
  component: DreamDetail,
});

function DreamDetail() {
  const { slug, dream: initialDream } = Route.useLoaderData() as {
    slug: string;
    dream: DreamRecord | null;
  };
  const [dream, setDream] = useState<DreamRecord | null>(initialDream);
  const [related, setRelated] = useState<DreamRecord[]>([]);
  const [loading, setLoading] = useState(!initialDream);
  const [error, setError] = useState("");
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadDream() {
      const loaded = await loadDreamBySlug(slug);
      if (!mounted) return;
      if (!loaded) {
        setError("ไม่พบคำทำนายฝันนี้");
        setLoading(false);
        return;
      }
      setDream(loaded);
      setLoading(false);
    }

    if (!initialDream) void loadDream();
    return () => {
      mounted = false;
    };
  }, [initialDream, slug]);

  useEffect(() => {
    if (!dream) return;
    applyClientDreamSeo(dream);

    recordDivinationHistory({
      type: "ทำนายฝัน",
      title: `ฝันเห็น${dream.keyword}`,
      result: `เลขเด็ด ${dream.numbers || "-"} · ${dream.meaning.slice(0, 50)}...`,
      url: `/dream/${encodeURIComponent(dream.keyword)}`,
      metadata: {
        keyword: dream.keyword,
        category: dream.category,
        numbers: dream.numbers,
      },
    });

    const currentDream = dream;
    let mounted = true;

    async function loadRelated() {
      const response = await fetch(
        `/api/dreams?category=${encodeURIComponent(currentDream.category)}&limit=9`,
      );
      const data = await response.json().catch(() => ({}));
      if (!mounted || !response.ok || !data.ok) return;
      const all = (data.dreams || []) as DreamRecord[];
      setRelated(all.filter((item) => item.id !== currentDream.id).slice(0, 8));
    }

    void loadRelated();
    return () => {
      mounted = false;
    };
  }, [dream]);

  const handleCopyNumber = () => {
    if (!dream?.numbers) return;
    navigator.clipboard.writeText(dream.numbers);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2200);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2200);
  };

  const shareData: ShareCardData | null = dream
    ? {
        category: `ทำนายฝันโบราณ · ${dream.category || "ความฝัน"}`,
        categoryCn: "周公解梦",
        title: `ฝันเห็น${dream.keyword}`,
        subtitle: `เลขเด็ดมงคล: ${dream.numbers || "ไม่ระบุ"}`,
        highlights: [
          { label: "เลขเด็ดนำโชค", value: dream.numbers || "ไม่ระบุ", color: "#fbbf24" },
          { label: "หมวดคำฝัน", value: dream.category || "ทั่วไป", color: "#38bdf8" },
          { label: "ช่วงเวลาฝัน", value: dream.time || "ตลอดคืน", color: "#34d399" },
        ],
        quote: dream.meaning,
        footerTag: "ค้นหาคำทำนายฝันโบราณที่ www.likhitfa.online",
      }
    : null;

  if (loading && !dream) {
    return (
      <div className="min-h-screen">
        <SiteHeader subtitle="ทำนายฝัน" subtitleCn="解夢" />
        <main className="mx-auto max-w-4xl px-6 pt-10 pb-12 text-sm text-muted-foreground">
          กำลังโหลดคำทำนายฝัน...
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (!dream) {
    return (
      <div className="min-h-screen">
        <SiteHeader subtitle="ทำนายฝัน" subtitleCn="解夢" />
        <main className="mx-auto max-w-4xl px-6 pt-16 pb-12 text-center">
          <h1 className="font-display text-4xl text-gold">{error || "ไม่พบคำทำนายฝัน"}</h1>
          <Link to="/dream" className="mt-4 inline-block text-sm text-gold underline">
            กลับไปค้นหาคำทำนายฝัน
          </Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

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
        name: "ทำนายฝัน",
        item: `${siteUrl}/dream`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `ฝันเห็น${dream.keyword}`,
        item: `${siteUrl}/dream/${encodeURIComponent(dream.keyword)}`,
      },
    ],
  };

  const dreamFaqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `ฝันเห็น${dream.keyword} แปลว่าอะไร หมายถึงอะไร?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${dream.meaning} เลขเด็ดนำโชค: ${dream.numbers || "ไม่ระบุ"} ช่วงเวลาฝัน: ${dream.time || "ไม่ระบุ"}`,
        },
      },
    ],
  };

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(dreamFaqSchema) }}
      />
      <SiteHeader subtitle="ทำนายฝัน" subtitleCn="解夢" />
      <main className="mx-auto max-w-5xl px-6 pt-10 pb-12">
        <Link to="/dream" className="text-xs text-gold/80 hover:text-gold">
          ← กลับไปค้นหาคำทำนายฝัน
        </Link>

        <article className="glass-strong mt-6 rounded-3xl p-8 shadow-elegant md:p-10">
          <div className="text-[11px] uppercase tracking-[0.28em] text-gold/70">
            DREAM DICTIONARY · {dream.category}
          </div>
          <h1 className="mt-3 font-display text-4xl text-foreground md:text-6xl">
            ฝันเห็น<span className="text-gradient-gold italic">{dream.keyword}</span>
          </h1>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground">{dream.meaning}</p>

          <div className="gold-divider my-8" />

          <section className="grid gap-4 md:grid-cols-3">
            <div className="relative rounded-2xl border border-gold/30 bg-gold/5 p-5">
              <div className="flex items-center justify-between">
                <div className="text-[10px] uppercase tracking-wider text-gold/80">เลขเด็ดจากความฝัน</div>
                {dream.numbers && (
                  <button
                    type="button"
                    onClick={handleCopyNumber}
                    className="inline-flex items-center gap-1 rounded-lg border border-gold/40 bg-gold/10 px-2 py-1 text-[11px] font-semibold text-gold transition hover:bg-gold/20 cursor-pointer"
                  >
                    {copiedNumber ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedNumber ? "คัดลอกแล้ว" : "คัดลอกเลข"}</span>
                  </button>
                )}
              </div>
              <div className="mt-2 font-display text-3xl font-bold text-gold">
                {dream.numbers || "ไม่ระบุ"}
              </div>
            </div>
            <InfoCard title="ช่วงเวลาฝัน" value={dream.time || "ไม่ระบุ"} />
            <InfoCard title="หมวดคำฝัน" value={dream.category || "ทั่วไป"} />
          </section>

          <section className="mt-5 rounded-2xl border border-border bg-card/40 p-5">
            <div className="text-[10px] uppercase tracking-wider text-gold/70">วิธีแก้เคล็ด</div>
            <p className="mt-2 text-sm leading-relaxed text-foreground/85">{dream.advice}</p>
          </section>

          {/* Action & Sharing Bar */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-gold/15 pt-5">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setIsShareOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-gold px-4 py-2 text-xs font-semibold text-stone-950 shadow-gold transition hover:opacity-90 cursor-pointer"
              >
                <Share2 className="h-3.5 w-3.5" />
                แชร์การ์ดคำทำนาย Story
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card/60 px-3.5 py-2 text-xs text-muted-foreground transition hover:border-gold/50 hover:text-foreground cursor-pointer"
              >
                {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedLink ? "คัดลอกลิงก์แล้ว" : "คัดลอกลิงก์"}
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>แชร์ไปยัง:</span>
              <a
                href={`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : `${siteUrl}/dream/${encodeURIComponent(dream.keyword)}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-400 hover:bg-emerald-500/20 cursor-pointer"
              >
                LINE
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : `${siteUrl}/dream/${encodeURIComponent(dream.keyword)}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-sky-500/30 bg-sky-500/10 px-2.5 py-1 text-[11px] font-semibold text-sky-400 hover:bg-sky-500/20 cursor-pointer"
              >
                Facebook
              </a>
            </div>
          </div>
        </article>

        {related.length > 0 && (
          <section className="mt-10">
            <h2 className="font-display text-3xl text-foreground">คำค้นหาใกล้เคียง</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              คำฝันในหมวดเดียวกันที่อาจเกี่ยวข้องกับความฝันของคุณ
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((item) => (
                <Link
                  key={item.id}
                  to="/dream/$slug"
                  params={{ slug: item.keyword }}
                  className="group"
                >
                  <article className="rounded-2xl border border-border bg-card/40 p-4 transition hover:border-gold/50 hover:bg-gold/5">
                    <div className="text-[10px] text-gold/80">{item.category}</div>
                    <h3 className="mt-1 font-display text-xl text-foreground group-hover:text-gold">
                      ฝันเห็น{item.keyword}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                      {item.meaning}
                    </p>
                  </article>
                </Link>
              ))}
            </div>
          </section>
        )}

        {shareData && (
          <ShareStoryModal
            isOpen={isShareOpen}
            onClose={() => setIsShareOpen(false)}
            data={shareData}
          />
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function InfoCard({
  title,
  value,
  large = false,
}: {
  title: string;
  value: string;
  large?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card/40 p-5">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{title}</div>
      <div
        className={`mt-2 text-gold ${large ? "font-display text-3xl" : "text-lg font-semibold"}`}
      >
        {value}
      </div>
    </div>
  );
}

async function loadDreamBySlug(slug: string): Promise<DreamRecord | null> {
  try {
    const keyword = decodeURIComponent(slug);
    const origin = typeof window === "undefined" ? siteUrl : window.location.origin;
    const response = await fetch(`${origin}/api/dreams?keyword=${encodeURIComponent(keyword)}`);
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.ok) return null;
    return (data.dreams?.[0] || null) as DreamRecord | null;
  } catch {
    return null;
  }
}

function dreamSeo(dream: DreamRecord) {
  const description = `ฝันเห็น${dream.keyword} หมายถึงอะไร อ่านคำทำนาย เลขเด็ด ${dream.numbers || "ที่เกี่ยวข้อง"} ช่วงเวลาฝัน และวิธีแก้เคล็ด`;
  return seo({
    title: `ฝันเห็น${dream.keyword} แปลว่าอะไร`,
    description,
    path: `/dream/${encodeURIComponent(dream.keyword)}`,
    canonicalUrl: `${siteUrl}/dream/${encodeURIComponent(dream.keyword)}`,
    keywords: [
      "ทำนายฝัน",
      `ฝันเห็น${dream.keyword}`,
      `ฝัน${dream.keyword}`,
      "เลขเด็ดความฝัน",
      dream.category,
    ],
  });
}

function applyClientDreamSeo(dream: DreamRecord) {
  const metadata = dreamSeo(dream);
  const title = metadata.meta.find((item) => "title" in item)?.title || `ฝันเห็น${dream.keyword}`;
  const description = `ฝันเห็น${dream.keyword} หมายถึงอะไร อ่านคำทำนาย เลขเด็ด ${dream.numbers || "ที่เกี่ยวข้อง"} ช่วงเวลาฝัน และวิธีแก้เคล็ด`;
  const canonical = `${siteUrl}/dream/${encodeURIComponent(dream.keyword)}`;
  document.title = title;
  setMeta("description", description);
  setMeta(
    "keywords",
    [`ทำนายฝัน`, `ฝันเห็น${dream.keyword}`, "เลขเด็ดความฝัน", dream.category].join(", "),
  );
  setProperty("og:title", title);
  setProperty("og:description", description);
  setProperty("og:url", canonical);
  setMeta("twitter:title", title);
  setMeta("twitter:description", description);
  setCanonical(canonical);
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
