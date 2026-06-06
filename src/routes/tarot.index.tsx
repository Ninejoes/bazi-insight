import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { tarotCategories } from "@/lib/tarot-cards";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/tarot/")({
  head: () =>
    seo({
      title: "ดูดวงไพ่ยิปซี Tarot",
      description:
        "เลือกหมวดดูดวงไพ่ยิปซี รายวัน รายสัปดาห์ รายเดือน ความรัก การงาน การเงิน สุขภาพ และโชคลาภ",
      path: "/tarot",
      keywords: ["ไพ่ยิปซี", "ไพ่ทาโรต์", "Tarot", "ดูดวงรายวัน", "ดูดวงความรัก"],
    }),
  component: TarotHub,
});

function TarotHub() {
  return (
    <div className="min-h-screen">
      <SiteHeader subtitle="ไพ่ยิปซี" subtitleCn="Tarot" />
      <main className="mx-auto max-w-7xl px-6 pt-12 pb-12">
        <section className="text-center">
          <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/5 px-4 py-1.5 text-[11px] tracking-[0.25em] text-gold/80">
            <span className="h-1 w-1 rounded-full bg-gold" /> TAROT READING
          </div>
          <h1 className="font-display text-4xl text-foreground md:text-6xl">
            เลือกหมวด<span className="text-gradient-gold italic">การดูไพ่</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground">
            เลือกหมวดที่ตรงกับคำถามในใจของคุณ ระบบจะสับและเปิดไพ่ทาโรต์ตามจำนวนตำแหน่งของหมวดนั้น
          </p>
        </section>

        <section className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {tarotCategories.map((c, i) => (
            <Link
              key={c.slug}
              to="/tarot/$type"
              params={{ type: c.slug }}
              className="group animate-fade-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <article className="ornate-border relative h-full overflow-hidden rounded-3xl glass-strong p-6 transition-all hover:-translate-y-1 hover:shadow-gold">
                <div
                  className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${c.accent} opacity-60 group-hover:opacity-100 transition`}
                />
                <div className="relative">
                  <div className="flex items-start justify-between">
                    <div className="inline-flex items-center gap-2 rounded-full border border-gold/20 bg-background/40 px-3 py-1 text-[10px] tracking-wider text-gold/90">
                      {c.titleEn}
                    </div>
                    <div className="text-3xl text-gold/70">{c.icon}</div>
                  </div>
                  <h3 className="mt-8 font-display text-2xl text-foreground">{c.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{c.tagline}</p>
                  <div className="mt-6 flex items-center justify-between">
                    <span className="text-xs text-gold/80">{c.count} ใบ</span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-gold/30 text-gold group-hover:bg-gold group-hover:text-primary-foreground transition">
                      →
                    </span>
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
