import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { seo } from "@/lib/seo";
import { type DreamRecord } from "@/lib/admin-content";
import { readStoredUserSession } from "@/lib/user-session";
import { useEffect, useState } from "react";

const PAGE_SIZE = 20;

type DreamResponse = {
  ok?: boolean;
  error?: string;
  dreams?: DreamRecord[];
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
};

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
  const [activeQuery, setActiveQuery] = useState("");
  const [dreams, setDreams] = useState<DreamRecord[]>([]);
  const [popular, setPopular] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadDreams() {
      setLoading(true);
      setError("");
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      });
      if (activeQuery) params.set("q", activeQuery);
      const response = await fetch(`/api/dreams?${params.toString()}`);
      const data = (await response.json().catch(() => ({}))) as DreamResponse;
      if (!mounted) return;
      setLoading(false);
      if (!response.ok || !data.ok) {
        setError(data.error || "โหลดข้อมูลทำนายฝันจาก Supabase ไม่สำเร็จ");
        setDreams([]);
        return;
      }
      setDreams(data.dreams || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
      if (activeQuery && data.dreams?.[0]) void persistDreamReading(activeQuery, data.dreams[0]);
    }

    void loadDreams();

    return () => {
      mounted = false;
    };
  }, [activeQuery, page]);

  useEffect(() => {
    let mounted = true;

    async function loadPopular() {
      const response = await fetch(`/api/dreams?page=1&limit=12`);
      const data = (await response.json().catch(() => ({}))) as DreamResponse;
      if (!mounted || !response.ok || !data.ok) return;
      setPopular((data.dreams || []).map((dream) => dream.keyword));
    }

    void loadPopular();

    return () => {
      mounted = false;
    };
  }, []);

  const searchDreams = (query: string, nextPage = 1) => {
    const keyword = query.trim().toLowerCase();
    setPage(nextPage);
    setActiveQuery(keyword);
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
                searchDreams(q, 1);
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
                      searchDreams(p, 1);
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

        {!error && (
          <section className="mt-10">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-3xl text-foreground">
                  {activeQuery ? `ผลค้นหา "${activeQuery}"` : "คำทำนายฝันยอดนิยม"}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {activeQuery
                    ? `ค้นหาจากฐานข้อมูล Supabase พบ ${total.toLocaleString("th-TH")} รายการ`
                    : "โหลดจากฐานข้อมูลทีละ 20 รายการ กดต่อเพื่อดูเลขเด็ด ช่วงเวลาฝัน และวิธีแก้เคล็ด"}
                </p>
              </div>
              {activeQuery ? (
                <button
                  onClick={() => {
                    setQ("");
                    searchDreams("", 1);
                  }}
                  className="rounded-full border border-border px-4 py-2 text-xs text-muted-foreground hover:border-gold/40 hover:text-gold"
                >
                  ล้างคำค้น
                </button>
              ) : null}
            </div>
            {loading ? (
              <div className="glass-strong rounded-3xl p-6 text-sm text-muted-foreground">
                กำลังโหลดข้อมูลจาก Supabase...
              </div>
            ) : dreams.length === 0 ? (
              <div className="glass-strong rounded-3xl p-6 text-sm text-muted-foreground">
                ไม่พบข้อมูลคำฝันจาก Supabase
              </div>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {dreams.map((dream) => (
                    <DreamSummaryCard key={dream.id} dream={dream} />
                  ))}
                </div>
                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
              </>
            )}
          </section>
        )}
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
    <nav className="mt-8 flex flex-wrap items-center justify-center gap-2" aria-label="Dream pages">
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
