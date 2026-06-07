import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { seo } from "@/lib/seo";
import { type DreamRecord } from "@/lib/admin-content";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/dream")({
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
  const searchDreams = (query: string) => {
    const keyword = query.trim().toLowerCase();
    const matched = keyword
      ? dreams.filter((dream) => dream.keyword.toLowerCase().includes(keyword))
      : dreams.slice(0, 2);
    setResults(matched);
    setShow(true);
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
            {results.map((r, i) => (
              <article
                key={i}
                className="glass-strong rounded-3xl p-6 shadow-elegant animate-fade-up"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      ฝันถึง
                    </div>
                    <h3 className="mt-1 font-display text-3xl text-foreground">{r.keyword}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {r.numbers
                      .split(",")
                      .map((n) => n.trim())
                      .filter(Boolean)
                      .slice(0, 4)
                      .map((n) => (
                        <span
                          key={n}
                          className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/30 bg-gradient-gold-soft font-display text-lg text-gold"
                        >
                          {n}
                        </span>
                      ))}
                  </div>
                </div>
                <div className="gold-divider my-5" />
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="md:col-span-2">
                    <div className="text-[10px] uppercase tracking-wider text-gold/70">
                      ความหมาย
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-foreground/90">{r.meaning}</p>
                  </div>
                  <div className="space-y-3">
                    <div className="rounded-xl border border-border bg-card/40 p-3">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        ช่วงเวลาฝัน
                      </div>
                      <div className="mt-1 text-sm text-gold">{r.time}</div>
                    </div>
                    <div className="rounded-xl border border-border bg-card/40 p-3">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        วิธีแก้เคล็ด
                      </div>
                      <div className="mt-1 text-xs text-foreground/80">{r.advice}</div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
