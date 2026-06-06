import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { seo } from "@/lib/seo";
import { useMemo, useState } from "react";
import { getCategory, tarotCards, type TarotCard, type TarotCategory } from "@/lib/tarot-cards";
import {
  drawSelectedCards,
  interpretTarotCard,
  summarizeTarotReading,
  type DrawnTarotCard,
} from "@/lib/tarot-engine";

export const Route = createFileRoute("/tarot/$type")({
  head: ({ params }) => {
    const c = getCategory(params.type);
    return seo({
      title: `${c?.title ?? "ไพ่ยิปซี"} Tarot Reading`,
      description: c?.tagline ?? "ดูดวงไพ่ยิปซีพร้อมคำแปลและคำแนะนำเฉพาะหมวด",
      path: `/tarot/${params.type}`,
      keywords: ["ไพ่ยิปซี", "Tarot", c?.title ?? "ดูดวงไพ่", c?.titleEn ?? "tarot reading"],
    });
  },
  loader: ({ params }) => {
    const c = getCategory(params.type);
    if (!c) throw notFound();
    return c;
  },
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="font-display text-4xl text-gold">ไม่พบหมวดนี้</h1>
        <Link to="/tarot" className="mt-4 inline-block text-sm text-gold underline">
          กลับไปเลือกหมวด
        </Link>
      </div>
    </div>
  ),
  component: TarotReading,
});

function TarotReading() {
  const category = Route.useLoaderData() as TarotCategory;
  const [phase, setPhase] = useState<"intro" | "select" | "result">("intro");
  const [selected, setSelected] = useState<number[]>([]);
  const [drawn, setDrawn] = useState<DrawnTarotCard[]>([]);
  const [shuffleSeed, setShuffleSeed] = useState(0);

  // Deck for selection: shuffle 24 cards visually
  const deck = useMemo(() => {
    return tarotCards
      .map((card, index) => ({
        card,
        weight: Math.sin((shuffleSeed + 1) * (index + 17) * 9301),
      }))
      .sort((a, b) => a.weight - b.weight)
      .slice(0, 24)
      .map((item) => item.card);
  }, [shuffleSeed]);

  const toggle = (i: number) => {
    setSelected((s) =>
      s.includes(i) ? s.filter((x) => x !== i) : s.length < category.count ? [...s, i] : s,
    );
  };

  const reveal = () => {
    setDrawn(drawSelectedCards(deck, selected, category.count));
    setPhase("result");
  };

  const reset = () => {
    setShuffleSeed((seed) => seed + 1);
    setPhase("intro");
    setSelected([]);
    setDrawn([]);
  };

  return (
    <div className="min-h-screen">
      <SiteHeader subtitle="ไพ่ยิปซี" subtitleCn="Tarot" />

      <main className="mx-auto max-w-6xl px-6 pt-10 pb-12">
        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <div className="text-[11px] uppercase tracking-[0.3em] text-gold/70">
            {category.titleEn}
          </div>
          <h1 className="mt-2 font-display text-4xl text-foreground md:text-5xl">
            ดูดวงไพ่ยิปซี — <span className="text-gradient-gold italic">{category.title}</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">{category.tagline}</p>
          <div className="gold-divider mt-6 w-48" />
        </div>

        {/* Steps */}
        <div className="mx-auto mt-8 flex max-w-md items-center justify-between text-[11px] tracking-wider text-muted-foreground">
          {["สับไพ่", "เลือกไพ่", "อ่านผล"].map((s, i) => {
            const active =
              (phase === "intro" && i === 0) ||
              (phase === "select" && i === 1) ||
              (phase === "result" && i === 2);
            return (
              <div key={s} className="flex flex-1 items-center gap-2">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full border ${active ? "border-gold bg-gradient-gold text-primary-foreground" : "border-gold/30 text-gold/60"}`}
                >
                  {i + 1}
                </div>
                <span className={active ? "text-gold" : ""}>{s}</span>
                {i < 2 && <div className="mx-2 h-px flex-1 bg-gold/15" />}
              </div>
            );
          })}
        </div>

        <section className="glass-strong mt-6 rounded-3xl p-6 shadow-elegant md:p-10">
          {phase === "intro" && <Intro onStart={() => setPhase("select")} />}
          {phase === "select" && (
            <Selection
              count={category.count}
              deck={deck}
              selected={selected}
              onToggle={toggle}
              onReveal={reveal}
              onReset={reset}
            />
          )}
          {phase === "result" && (
            <Result
              drawn={drawn}
              positions={category.positions}
              category={category}
              onReset={reset}
            />
          )}
        </section>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          ผลทำนายเป็นแนวทางเพื่อทบทวนตนเอง ใช้ดุลยพินิจประกอบการตัดสินใจเสมอ
        </p>
      </main>

      <SiteFooter />
    </div>
  );
}

function Intro({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-col items-center text-center">
      <p className="text-sm text-muted-foreground">ตั้งสมาธิ นึกถึงคำถามในใจ แล้วกดสับไพ่</p>
      <div className="relative mx-auto my-10 h-72 w-full max-w-sm">
        {[-16, -8, 0, 8, 16].map((rot, i) => (
          <div
            key={i}
            className="absolute inset-x-0 top-0 mx-auto h-64 w-44 origin-center overflow-hidden rounded-2xl border border-gold/40 shadow-gold"
            style={{ transform: `rotate(${rot}deg)`, zIndex: 10 - Math.abs(rot) }}
          >
            <CardBack />
          </div>
        ))}
      </div>
      <button
        onClick={onStart}
        className="rounded-xl bg-gradient-gold px-10 py-3 text-sm font-semibold text-primary-foreground shadow-gold transition-transform hover:scale-105"
      >
        ✦ สับไพ่ ✦
      </button>
    </div>
  );
}

function Selection({
  count,
  deck,
  selected,
  onToggle,
  onReveal,
  onReset,
}: {
  count: number;
  deck: TarotCard[];
  selected: number[];
  onToggle: (i: number) => void;
  onReveal: () => void;
  onReset: () => void;
}) {
  const done = selected.length === count;
  return (
    <div>
      <div className="text-center">
        <h2 className="font-display text-2xl text-foreground md:text-3xl">
          เลือกไพ่ {selected.length} / {count} ใบ
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          คลิกที่ไพ่เพื่อเลือก เมื่อครบจำนวน กดเปิดผล
        </p>
        <div className="mx-auto mt-4 h-1 w-64 overflow-hidden rounded-full bg-card">
          <div
            className="h-full bg-gradient-gold transition-all"
            style={{ width: `${(selected.length / count) * 100}%` }}
          />
        </div>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {deck.map((_, idx) => {
          const isSel = selected.includes(idx);
          return (
            <button
              key={idx}
              onClick={() => onToggle(idx)}
              disabled={!isSel && selected.length >= count}
              className={`relative h-28 w-20 overflow-hidden rounded-lg border transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                isSel
                  ? "-translate-y-3 border-gold shadow-gold"
                  : "border-gold/20 hover:-translate-y-1 hover:border-gold/50"
              }`}
            >
              <CardBack />
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex justify-center gap-3">
        <button
          onClick={onReset}
          className="rounded-xl border border-gold/30 px-6 py-2.5 text-sm text-gold hover:bg-gold/10"
        >
          สับใหม่
        </button>
        <button
          onClick={onReveal}
          disabled={!done}
          className="rounded-xl bg-gradient-gold px-8 py-2.5 text-sm font-semibold text-primary-foreground shadow-gold disabled:opacity-40"
        >
          เปิดผลทำนาย ✦
        </button>
      </div>
    </div>
  );
}

function Result({
  drawn,
  positions,
  category,
  onReset,
}: {
  drawn: DrawnTarotCard[];
  positions: string[];
  category: TarotCategory;
  onReset: () => void;
}) {
  const count = drawn.length;
  const summary = summarizeTarotReading(drawn, category);
  const gridCols =
    count === 1
      ? "grid-cols-1 max-w-xs mx-auto"
      : count <= 4
        ? "grid-cols-2 md:grid-cols-4"
        : count <= 6
          ? "grid-cols-2 sm:grid-cols-3"
          : "grid-cols-2 sm:grid-cols-3 md:grid-cols-5";

  return (
    <>
      <div className="text-center">
        <div className="text-[11px] uppercase tracking-[0.3em] text-gold/70">Reading Result</div>
        <h2 className="mt-2 font-display text-3xl text-foreground md:text-4xl">{category.title}</h2>
        <div className="gold-divider mx-auto mt-4 w-40" />
      </div>

      <div className="mx-auto mt-6 max-w-3xl rounded-2xl border border-gold/15 bg-card/40 p-5 text-center">
        <div className="font-display text-xl text-gold">{summary.headline}</div>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{summary.body}</p>
        <p className="mt-3 text-xs text-foreground/80">คำแนะนำถัดไป: {summary.next}</p>
      </div>

      <div className={`mt-8 grid gap-x-3 gap-y-8 ${gridCols}`}>
        {drawn.map((d, i) => (
          <div
            key={i}
            className="flex flex-col items-center animate-fade-up"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="relative">
              <div className="absolute -top-3 left-1/2 z-10 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full bg-gradient-gold text-xs font-bold text-primary-foreground shadow-gold">
                {i + 1}
              </div>
              <CardImage card={d.card} reversed={d.reversed} />
            </div>
            <div className="mt-3 text-center">
              <div className="text-xs font-semibold text-foreground">{positions[i]}</div>
              <div className="text-[10px] text-gold/80 mt-0.5">
                {d.card.name}
                {d.reversed ? " · กลับหัว" : ""}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 space-y-3">
        {drawn.map((d, i) => (
          <article
            key={i}
            className="rounded-2xl border border-gold/15 bg-card/40 p-5 animate-fade-up"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="flex gap-4">
              <div className="shrink-0">
                <CardImage card={d.card} reversed={d.reversed} small />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-bold text-gold">
                    {i + 1}
                  </span>
                  <span className="text-xs font-semibold text-gold">
                    ตำแหน่งที่ {i + 1} · {positions[i]}
                  </span>
                </div>
                <h4 className="mt-1 font-display text-xl text-foreground">
                  {d.card.name}
                  {d.reversed && <span className="ml-2 text-sm text-rose-300">(กลับหัว)</span>}
                </h4>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {interpretTarotCard(d, positions[i], category, i)}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-10 flex justify-center gap-3">
        <button
          onClick={onReset}
          className="rounded-xl border border-gold/30 px-6 py-2.5 text-sm text-gold hover:bg-gold/10"
        >
          เปิดไพ่ใหม่
        </button>
        <Link
          to="/tarot"
          className="rounded-xl bg-gradient-gold px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-gold"
        >
          เลือกหมวดอื่น
        </Link>
      </div>
    </>
  );
}

function CardImage({
  card,
  reversed,
  small,
}: {
  card: TarotCard;
  reversed?: boolean;
  small?: boolean;
}) {
  const size = small ? "h-32 w-20" : "h-44 w-28 md:h-52 md:w-32";
  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-gold/40 shadow-gold ${size}`}
    >
      <img
        src={card.url}
        alt={card.name}
        loading="lazy"
        className="h-full w-full object-cover"
        style={{ transform: reversed ? "rotate(180deg)" : undefined }}
      />
    </div>
  );
}

function CardBack() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[oklch(0.25_0.08_290)] via-[oklch(0.18_0.05_270)] to-[oklch(0.20_0.06_250)] p-2">
      <div className="flex h-full w-full items-center justify-center rounded-md border border-gold/50">
        <svg
          viewBox="0 0 24 24"
          className="h-12 w-12"
          fill="none"
          stroke="oklch(0.82 0.13 82)"
          strokeWidth="0.8"
        >
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="5" />
          <path d="M12 3 L13.5 10 L21 12 L13.5 14 L12 21 L10.5 14 L3 12 L10.5 10 Z" />
        </svg>
      </div>
    </div>
  );
}
