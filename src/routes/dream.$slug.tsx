import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { type DreamRecord } from "@/lib/admin-content";
import { seo, siteUrl } from "@/lib/seo";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/dream/$slug")({
  head: ({ params, ...ctx }) => {
    const dream = (ctx as { loaderData?: { dream?: DreamRecord | null } }).loaderData?.dream;
    if (dream) return dreamSeo(dream);

    return seo({
      title: `ฝันเห็น${decodeURIComponent(params.slug)}`,
      description: `ดูคำทำนายฝันเห็น${decodeURIComponent(params.slug)} เลขเด็ด ช่วงเวลาฝัน และวิธีแก้เคล็ด`,
      path: `/dream/${encodeURIComponent(params.slug)}`,
      keywords: ["ทำนายฝัน", `ฝันเห็น${decodeURIComponent(params.slug)}`, "เลขเด็ดความฝัน"],
    });
  },
  loader: async ({ params }) => ({
    slug: params.slug,
    dream: await loadDreamBySlug(params.slug),
  }),
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
    const currentDream = dream;
    let mounted = true;

    async function loadRelated() {
      const response = await fetch(`/api/dreams?q=${encodeURIComponent(currentDream.category)}`);
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

  return (
    <div className="min-h-screen">
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
            <InfoCard title="เลขเด็ดจากความฝัน" value={dream.numbers || "ไม่ระบุ"} large />
            <InfoCard title="ช่วงเวลาฝัน" value={dream.time || "ไม่ระบุ"} />
            <InfoCard title="หมวดคำฝัน" value={dream.category || "ทั่วไป"} />
          </section>

          <section className="mt-5 rounded-2xl border border-border bg-card/40 p-5">
            <div className="text-[10px] uppercase tracking-wider text-gold/70">วิธีแก้เคล็ด</div>
            <p className="mt-2 text-sm leading-relaxed text-foreground/85">{dream.advice}</p>
          </section>
        </article>

        {related.length > 0 && (
          <section className="mt-10">
            <h2 className="font-display text-3xl text-foreground">คำค้นหาใกล้เคียง</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              คำฝันในหมวดเดียวกันที่อาจเกี่ยวข้องกับความฝันของคุณ
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((item) => (
                <Link key={item.id} to="/dream/$slug" params={{ slug: item.keyword }} className="group">
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
      </main>
      <SiteFooter />
    </div>
  );
}

function InfoCard({ title, value, large = false }: { title: string; value: string; large?: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-card/40 p-5">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{title}</div>
      <div className={`mt-2 text-gold ${large ? "font-display text-3xl" : "text-lg font-semibold"}`}>
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
  const canonical = `${window.location.origin}/dream/${encodeURIComponent(dream.keyword)}`;
  document.title = title;
  setMeta("description", description);
  setMeta("keywords", [`ทำนายฝัน`, `ฝันเห็น${dream.keyword}`, "เลขเด็ดความฝัน", dream.category].join(", "));
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
