import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { seo } from "@/lib/seo";
import { type DreamRecord } from "@/lib/admin-content";
import { readStoredUserSession } from "@/lib/user-session";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/dream/")({
  head: () =>
    seo({
      title: "ทำนายฝัน 解梦",
      description: "ค้นหาความหมายของความฝัน เลขนำโชค ช่วงเวลาฝันบอกเหตุ และวิธีแก้เคล็ดฝันร้าย",
      path: "/dream",
      keywords: ["ทำนายฝัน", "ฝันเห็น", "เลขเด็ด", "解梦", "ความหมายความฝัน"],
    }),
  component: DreamPage,
});

function DreamPage() {
  const [q, setQ] = useState("");
  const [show, setShow] = useState(false);
  const [dreams, setDreams] = useState<DreamRecord[]>([]);
  const [results, setResults] = useState<DreamRecord[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadDreams() {
      const response = await fetch("/api/dreams");
      const data = await response.json().catch(() => ({}));
      if (!mounted) return;
      if (!response.ok || !data.ok) {
        setError(data.error || "โหลดข้อมูลทำนายฝันจาก Supabase ไม่สำเร็จ");
        return;
      }
      setDreams(data.dreams || []);
    }

    void loadDreams();

    return () => {
      mounted = false;
    };
  }, []);

  const popular = dreams.slice(0, 12).map((dream) => dream.keyword);
  const visibleResults = show ? results : dreams.slice(0, 32);
  const searchDreams = (query: string) => {
    const keyword = query.trim().toLowerCase();
    const matched = keyword
      ? dreams.filter((dream) => dreamMatches(dream, keyword))
      : dreams.slice(0, 2);
    setResults(matched);
    setShow(true);
    if (matched[0]) void persistDreamReading(keyword || matched[0].keyword, matched[0]);
  };

  return (
    <div className="relative min-h-screen">
      <SiteHeader subtitle="ทำนายฝัน" subtitleCn="解夢" />

      <main className="mx-auto max-w-5xl px-6 pt-10 pb-12">
        <section className="glass-strong relative overflow-hidden rounded-3xl p-10 shadow-elegant">
          <div className="pointer-events-none absolute -right-10 -top-10 font-cn text-[180px] leading-none text-gold/[0.06]">
            夢
          </div>
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/5 px-3 py-1 text-[11px] tracking-wider text-gold/80">
              <span className="font-cn">解夢</span> · ทำนายฝัน
            </div>
            <h1 className="mt-4 font-display text-4xl text-foreground md:text-5xl">
              ฝันบอกอะไร <span className="text-gradient-gold italic">ลิขิตฟ้ามีคำตอบ</span>
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {error ||
                "ค้นหาคำฝัน อ่านความหมาย เลขนำโชค ช่วงเวลาฝันบอกเหตุ และวิธีแก้เคล็ดฝันร้าย"}
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                searchDreams(q);
              }}
              className="mt-8 flex flex-col gap-3 md:flex-row"
            >
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="พิมพ์สิ่งที่ฝัน เช่น งู น้ำ ฟันหัก..."
                className="input-styled h-14 flex-1 text-base"
              />
              <button className="h-14 rounded-xl bg-gradient-gold px-8 text-sm font-semibold text-primary-foreground shadow-gold transition-transform hover:scale-[1.02]">
                ทำนายฝัน
              </button>
            </form>

            <div className="mt-6">
              <div className="mb-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                คำฝันยอดนิยม
              </div>
              {error ? (
                <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
                  {error}
                </div>
              ) : null}
              <div className="flex flex-wrap gap-2">
                {popular.map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      setQ(p);
                      searchDreams(p);
                    }}
                    className="rounded-full border border-border bg-card/40 px-4 py-1.5 text-xs text-muted-foreground transition-all hover:border-gold/40 hover:text-gold"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {show && (
          <section className="mt-6 space-y-4">
            {results.length === 0 ? (
              <div className="glass-strong rounded-3xl p-6 text-sm text-muted-foreground">
                ไม่พบข้อมูลคำฝันจาก Supabase
              </div>
            ) : null}
            {results.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {results.slice(0, 16).map((dream) => (
                  <DreamSummaryCard key={dream.id} dream={dream} />
                ))}
              </div>
            ) : null}
          </section>
        )}

        {!show && !error && (
          <section className="mt-10">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-3xl text-foreground">คำทำนายฝันยอดนิยม</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  แสดงคำฝันพร้อมความหมายย่อ กดต่อเพื่อดูเลขเด็ด ช่วงเวลาฝัน และวิธีแก้เคล็ด
                </p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {visibleResults.map((dream) => (
                <DreamSummaryCard key={dream.id} dream={dream} />
              ))}
            </div>
          </section>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}

function DreamSummaryCard({ dream }: { dream: DreamRecord }) {
  return (
    <Link to="/dream/$slug" params={{ slug: dream.keyword }} className="group">
      <article className="ornate-border h-full rounded-2xl glass-strong p-5 transition hover:-translate-y-1 hover:shadow-gold">
        <div className="text-[10px] uppercase tracking-wider text-gold/80">{dream.category}</div>
        <h3 className="mt-2 font-display text-2xl text-foreground group-hover:text-gold">
          ฝันเห็น{dream.keyword}
        </h3>
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {dream.meaning}
        </p>
        <div className="mt-4 text-xs font-semibold text-gold">อ่านรายละเอียด →</div>
      </article>
    </Link>
  );
}

function dreamMatches(dream: DreamRecord, keyword: string) {
  return [dream.keyword, dream.category, dream.meaning, dream.numbers, dream.time, dream.advice]
    .join(" ")
    .toLowerCase()
    .includes(keyword);
}

async function persistDreamReading(query: string, dream: DreamRecord) {
  const session = readStoredUserSession();
  await fetch("/api/reading-history", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {}),
    },
    body: JSON.stringify({
      type: "ทำนายฝัน",
      title: `ฝันเห็น${dream.keyword}`,
      result: `เลข ${dream.numbers}`,
      input: { query },
      output: dream,
    }),
  }).catch(() => {});
}
