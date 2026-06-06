import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useState } from "react";
import {
  analyzeBazi,
  elementSymbol,
  hiddenStemReading,
  pillarRole,
  type BaziAnalysis,
  type BaziInput,
} from "@/lib/bazi-engine";

export const Route = createFileRoute("/bazi")({
  head: () => ({
    meta: [
      { title: "ปาจื้อ 八字 — Likhitfa" },
      { name: "description", content: "อ่านดวงปาจื้อจาก 4 เสา ธาตุ และวัยจร" },
    ],
  }),
  component: BaziPage,
});

const mainTabs = ["ภาพรวม", "โชควัยจร", "ดาว", "หลักการ"] as const;
const subTabs = ["ปาจื้อ", "พยากรณ์", "ปฏิทินมงคล", "ฉีเหมิน"] as const;

type PillarCardData = {
  label: string;
  labelCn: string;
  role: string;
  roleTh: string;
  stem: string;
  stemTh: string;
  branch: string;
  branchTh: string;
  elemStem: string;
  elemBranch: Parameters<typeof elementSymbol>[0];
  hidden: string[];
  isDay?: boolean;
};

function BaziPage() {
  const [tab, setTab] = useState<(typeof mainTabs)[number]>("ภาพรวม");
  const [sub, setSub] = useState<(typeof subTabs)[number]>("ปาจื้อ");
  const [birthInput, setBirthInput] = useState<BaziInput>({
    name: "",
    gender: "หญิง",
    birthDate: "",
    birthTime: "",
  });
  const [analysis, setAnalysis] = useState<BaziAnalysis | null>(null);
  const [formError, setFormError] = useState("");

  const runAnalysis = (nextInput: BaziInput) => {
    if (!nextInput.birthDate || !nextInput.birthTime) {
      setFormError("กรุณากรอกวันเกิดและเวลาเกิดก่อนกดทำนายดวง");
      return;
    }
    setFormError("");
    setBirthInput(nextInput);
    setAnalysis(analyzeBazi(nextInput));
  };

  return (
    <div className="relative min-h-screen">
      <SiteHeader subtitle="ปาจื้อ" subtitleCn="八字" />

      <main className="mx-auto max-w-7xl px-6 pt-10 pb-12">
        <FormCard
          value={birthInput}
          error={formError}
          onChange={setBirthInput}
          onAnalyze={runAnalysis}
        />
        {analysis ? <SummaryBar analysis={analysis} /> : <BaziEmptyState />}

        {/* Tabs */}
        <div className="mt-8 grid grid-cols-4 gap-2 rounded-2xl glass p-1.5">
          {mainTabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`relative rounded-xl px-4 py-3 text-sm transition-all ${
                tab === t
                  ? "bg-jade/15 text-foreground shadow-[inset_0_0_0_1px_oklch(0.62_0.10_165/0.4)]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {subTabs.map((s) => (
            <button
              key={s}
              onClick={() => setSub(s)}
              className={`rounded-full px-6 py-2.5 text-sm transition-all ${
                sub === s
                  ? "bg-gradient-gold text-primary-foreground shadow-gold"
                  : "border border-border bg-card/40 text-muted-foreground hover:border-gold/30 hover:text-gold"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="mt-8 space-y-6">
          {!analysis && <BaziGuidePanel />}
          {analysis && sub === "ปาจื้อ" && tab === "ภาพรวม" && (
            <OverviewPanel analysis={analysis} />
          )}
          {analysis && sub === "ปาจื้อ" && tab === "ภาพรวม" && <ChartCard analysis={analysis} />}
          {analysis && sub === "ปาจื้อ" && tab === "ภาพรวม" && <MetricsGrid analysis={analysis} />}
          {analysis && sub === "ปาจื้อ" && tab === "โชควัยจร" && (
            <LuckCyclesPanel analysis={analysis} />
          )}
          {analysis && sub === "ปาจื้อ" && tab === "ดาว" && <TenGodsPanel analysis={analysis} />}
          {sub === "ปาจื้อ" && tab === "หลักการ" && <PrinciplesPanel />}
          {analysis && sub === "พยากรณ์" && <ForecastPanel analysis={analysis} />}
          {analysis && sub === "ปฏิทินมงคล" && <CalendarPanel analysis={analysis} />}
          {analysis && sub === "ฉีเหมิน" && <QimenPanel analysis={analysis} />}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

function FormCard({
  value,
  error,
  onChange,
  onAnalyze,
}: {
  value: BaziInput;
  error: string;
  onChange: (next: BaziInput) => void;
  onAnalyze: (next: BaziInput) => void;
}) {
  const update = (patch: Partial<BaziInput>) => {
    onChange({ ...value, ...patch });
  };

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onAnalyze({
      name: String(form.get("name") || ""),
      gender: String(form.get("gender") || "หญิง") as BaziInput["gender"],
      birthDate: String(form.get("birthDate") || ""),
      birthTime: String(form.get("birthTime") || ""),
    });
  };

  return (
    <form onSubmit={submit} className="glass-strong rounded-3xl p-6 shadow-elegant">
      <div className="grid gap-4 md:grid-cols-[1fr_140px_180px_140px_auto]">
        <Field label="ชื่อ">
          <input
            name="name"
            value={value.name}
            onChange={(event) => update({ name: event.target.value })}
            className="input-styled"
          />
        </Field>
        <Field label="เพศ">
          <select
            name="gender"
            value={value.gender}
            onChange={(event) => update({ gender: event.target.value as BaziInput["gender"] })}
            className="input-styled"
          >
            <option>หญิง</option>
            <option>ชาย</option>
            <option>ไม่ระบุ</option>
          </select>
        </Field>
        <Field label="วันเกิด">
          <input
            name="birthDate"
            type="date"
            value={value.birthDate}
            onChange={(event) => update({ birthDate: event.target.value })}
            className="input-styled"
          />
        </Field>
        <Field label="เวลาเกิด">
          <input
            name="birthTime"
            type="time"
            value={value.birthTime}
            onChange={(event) => update({ birthTime: event.target.value })}
            className="input-styled"
          />
        </Field>
        <div className="flex items-end">
          <button
            type="submit"
            className="h-12 w-full whitespace-nowrap rounded-xl bg-gradient-gold px-7 text-sm font-semibold text-primary-foreground shadow-gold transition-transform hover:scale-[1.02] md:w-auto"
          >
            ทำนายดวง
          </button>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2 rounded-xl border border-jade/20 bg-jade/5 px-4 py-2.5 text-xs text-jade">
        <span className="h-1.5 w-1.5 rounded-full bg-jade" />
        กรอกวันเกิดและเวลาเกิด ระบบจะคำนวณ 4 เสาใหม่จากข้อมูลที่ใส่
      </div>
      {error && (
        <div className="mt-3 rounded-xl border border-rose-400/25 bg-rose-400/10 px-4 py-2.5 text-xs text-rose-200">
          {error}
        </div>
      )}
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      {children}
    </label>
  );
}

function SummaryBar({ analysis }: { analysis: BaziAnalysis }) {
  const { chart, context } = analysis;
  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-border bg-card/40 px-5 py-3 text-xs text-muted-foreground">
      <Pill>{analysis.input.name || "ไม่ระบุชื่อ"}</Pill>
      <span className="text-gold/40">·</span>
      <span>{context.strengthLabel}</span>
      <span className="text-gold/40">·</span>
      <span>
        <strong className="text-foreground">Day Master</strong>{" "}
        <span className="font-cn text-gold">{chart.day.stem.han}</span> {chart.day.stem.element}
      </span>
      <span className="text-gold/40">·</span>
      <span>
        เดือนจีน <span className="font-cn text-gold">{chart.month.branch.han}</span>{" "}
        {chart.month.branch.th} (<span className="font-cn">{chart.month.solarTerm?.name}</span>)
      </span>
      <span className="text-gold/40">·</span>
      <span>
        ธาตุให้คุณ <span className="text-gold">{context.useful.join(" / ")}</span>
      </span>
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-gold/10 px-3 py-1 text-gold">{children}</span>;
}

function BaziEmptyState() {
  return (
    <div className="mt-4 rounded-2xl border border-gold/15 bg-card/40 px-5 py-3 text-xs text-muted-foreground">
      ยังไม่มีผลทำนาย กรอกวันเกิดและเวลาเกิดแล้วกด <span className="text-gold">ทำนายดวง</span>{" "}
      เพื่อคำนวณ 4 เสา ธาตุ ดาวสิบเทพ วัยจร และปฏิทินมงคลจากข้อมูลจริง
    </div>
  );
}

function BaziGuidePanel() {
  return (
    <section className="glass-strong rounded-3xl p-8 text-center shadow-elegant">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-gold/30 bg-gradient-gold-soft font-cn text-4xl text-gold">
        八字
      </div>
      <h3 className="mt-5 font-display text-3xl text-foreground">เริ่มคำนวณดวงปาจื้อ</h3>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        หน้านี้จะไม่แสดงผลลัพธ์ตัวอย่างก่อนกรอกข้อมูล ระบบจะอ่านจากวันเกิด เวลาเกิด และเพศที่ใส่
        แล้วแปลงเป็น 4 เสาเพื่อสร้างคำทำนายเฉพาะบุคคล
      </p>
      <div className="mt-6 grid gap-3 md:grid-cols-3">
        <MiniStat label="ขั้นที่ 1" value="กรอกข้อมูลเกิด" />
        <MiniStat label="ขั้นที่ 2" value="กดทำนายดวง" />
        <MiniStat label="ขั้นที่ 3" value="อ่านผลเฉพาะบุคคล" />
      </div>
    </section>
  );
}

function OverviewPanel({ analysis }: { analysis: BaziAnalysis }) {
  const today = analysis.today;
  return (
    <section className="glass-strong relative overflow-hidden rounded-3xl p-8 shadow-elegant">
      <div className="absolute right-6 top-6 flex h-24 w-24 flex-col items-center justify-center rounded-full bg-gradient-gold-soft border border-gold/30">
        <div className="font-display text-4xl font-semibold text-gold">{today.dayScore}</div>
        <div className="text-[10px] tracking-wider text-muted-foreground">คะแนนวัน</div>
      </div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
        คำทำนายวันนี้
      </div>
      <h3 className="mt-2 font-display text-3xl text-foreground">
        <span className="font-cn text-gold">{today.title.split(" · ")[0]}</span> ·{" "}
        {today.title.split(" · ")[1]}
      </h3>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
        {today.summary}
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <MiniStat label="เลขมงคล" value={today.lucky} />
        <MiniStat label="สีเสริม" value={today.luckyColor} />
        <MiniStat label="เวลาดี" value={today.luckyTime} />
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {today.advice.map(([title, body], index) => (
          <InsightBox
            key={title}
            tone={["work", "money", "love", "health"][index]}
            title={title}
            body={body}
            sources={
              index === 0
                ? "สูตร: 官煞/印"
                : index === 1
                  ? "สูตร: 財星"
                  : index === 2
                    ? "สูตร: ดาวคู่ครอง/กิ่งวัน"
                    : "สูตร: 冲/刑/害"
            }
          />
        ))}
      </div>
    </section>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card/50 px-4 py-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-lg text-gold">{value}</div>
    </div>
  );
}

function InsightBox({
  title,
  body,
  sources,
  tone,
}: {
  title: string;
  body: string;
  sources: string;
  tone: string;
}) {
  const dot =
    { work: "bg-amber-300", money: "bg-emerald-300", love: "bg-rose-300", health: "bg-sky-300" }[
      tone
    ] || "bg-gold";
  return (
    <div className="rounded-2xl border border-border bg-card/40 p-5">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
        {title}
      </div>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{body}</p>
      <div className="mt-3 text-[10px] uppercase tracking-wider text-gold/50">{sources}</div>
    </div>
  );
}

function ChartCard({ analysis }: { analysis: BaziAnalysis }) {
  const chartPillars = [
    { label: "ยาม", labelCn: "時", pillar: analysis.chart.hour },
    { label: "วัน", labelCn: "日", pillar: analysis.chart.day, isDay: true },
    { label: "เดือน", labelCn: "月", pillar: analysis.chart.month },
    { label: "ปี", labelCn: "年", pillar: analysis.chart.year },
  ].map((item) => {
    const role = item.isDay
      ? ["日元", "วันเกิด"]
      : pillarRole(analysis.chart.day.stem, item.pillar.stem);
    return {
      label: item.label,
      labelCn: item.labelCn,
      role: role[0],
      roleTh: role[1],
      stem: item.pillar.stem.han,
      stemTh: item.pillar.stem.th,
      branch: item.pillar.branch.han,
      branchTh: item.pillar.branch.th,
      elemStem: `${item.pillar.stem.element}${item.pillar.stem.polarity}`,
      elemBranch: item.pillar.branch.element,
      hidden: item.pillar.branch.hidden.map((idx) =>
        hiddenStemReading(analysis.chart.day.stem, idx),
      ),
      isDay: item.isDay,
    };
  });

  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="glass-strong rounded-3xl p-6 shadow-elegant">
        <div className="flex items-center justify-between">
          <h4 className="font-display text-xl text-foreground">
            ดวงชะตา <span className="font-cn text-gold">本命八字</span>
          </h4>
          <div className="text-xs text-muted-foreground">
            {analysis.input.gender} · {analysis.input.birthDate} {analysis.input.birthTime} · 4 เสา{" "}
            <span className="font-cn text-gold/70">
              {analysis.chart.year.stem.han}
              {analysis.chart.year.branch.han}/{analysis.chart.month.stem.han}
              {analysis.chart.month.branch.han}/{analysis.chart.day.stem.han}
              {analysis.chart.day.branch.han}/{analysis.chart.hour.stem.han}
              {analysis.chart.hour.branch.han}
            </span>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-4 gap-3">
          {chartPillars.map((p) => (
            <PillarCard key={p.label} pillar={p} />
          ))}
        </div>
      </div>

      <div className="glass-strong rounded-3xl p-6 shadow-elegant">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
          ธาตุประจำตัว
        </div>
        <h4 className="mt-2 font-display text-3xl text-foreground">
          {analysis.chart.day.stem.element}
          {analysis.chart.day.stem.polarity === "+" ? "หยาง" : "หยิน"}{" "}
          <span className="text-gold/80">
            ({analysis.chart.day.stem.th}{" "}
            <span className="font-cn">{analysis.chart.day.stem.han}</span>)
          </span>
        </h4>
        <p className="mt-3 text-sm italic text-muted-foreground">
          "{analysis.context.profile.nature}"
        </p>
        <div className="mt-5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>ความแข็งแรง</span>
            <span className="text-gold">{analysis.strength.toFixed(1)} / 100</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-card">
            <div className="h-full bg-gradient-gold" style={{ width: `${analysis.strength}%` }} />
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          จากเดือนจีน{" "}
          <span className="font-cn text-gold">{analysis.chart.month.solarTerm?.name}</span> กิ่งดิน
          และธาตุแฝง
        </p>
      </div>
    </section>
  );
}

function PillarCard({ pillar }: { pillar: PillarCardData }) {
  const elemColor = (e: string) =>
    e.includes("ไฟ")
      ? "bg-rose-500/20 text-rose-200"
      : e.includes("น้ำ")
        ? "bg-sky-500/20 text-sky-200"
        : e.includes("ทอง")
          ? "bg-amber-500/20 text-amber-200"
          : e.includes("ดิน")
            ? "bg-stone-500/20 text-stone-200"
            : "bg-emerald-500/20 text-emerald-200";

  return (
    <div
      className={`rounded-2xl border p-4 text-center ${pillar.isDay ? "border-gold/40 bg-gold/5 shadow-gold" : "border-border bg-card/40"}`}
    >
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {pillar.label}
      </div>
      <div className="font-cn text-xs text-gold/60">{pillar.labelCn}</div>
      <div className="mt-2 text-[10px] text-gold">{pillar.role}</div>
      <div className="text-[10px] text-muted-foreground">{pillar.roleTh}</div>

      <div className="mt-3 font-cn text-5xl text-foreground">{pillar.stem}</div>
      <div className="text-[10px] text-muted-foreground">{pillar.stemTh}</div>
      <span
        className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] ${elemColor(pillar.elemStem)}`}
      >
        <span className="font-cn">
          {elementSymbol(
            pillar.elemStem.replace("+", "").replace("-", "") as Parameters<
              typeof elementSymbol
            >[0],
          )}
        </span>{" "}
        {pillar.elemStem}
      </span>

      <div className="mt-4 font-cn text-5xl text-foreground">{pillar.branch}</div>
      <div className="text-[10px] text-muted-foreground">{pillar.branchTh}</div>
      <span
        className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] ${elemColor(pillar.elemBranch)}`}
      >
        <span className="font-cn">
          {elementSymbol(pillar.elemBranch as Parameters<typeof elementSymbol>[0])}
        </span>{" "}
        {pillar.elemBranch}
      </span>

      <div className="mt-3 space-y-0.5 text-[10px] text-muted-foreground">
        {pillar.hidden.map((h, i) => (
          <div key={i} className="font-cn">
            {h}
          </div>
        ))}
      </div>
    </div>
  );
}

function MetricsGrid({ analysis }: { analysis: BaziAnalysis }) {
  const relationSummary = analysis.context.relations.slice(0, 4);
  const items = [
    {
      label: "ตัวตนหลัก",
      body: (
        <>
          <span className="font-cn text-gold">{analysis.chart.day.stem.han}</span>
          {analysis.chart.day.stem.element} · {analysis.context.strengthLabel} · เดือนเกิดอยู่ช่วง{" "}
          {analysis.chart.month.solarTerm?.th}
        </>
      ),
    },
    {
      label: "น้ำหนักดวง",
      body: (
        <>
          คะแนน <span className="text-gold">{analysis.strength.toFixed(1)}/100</span> จากเดือนเกิด
          ธาตุเด่น และธาตุแฝงใน 4 เสา
        </>
      ),
    },
    {
      label: "ธาตุที่ช่วยปรับสมดุล",
      body: (
        <span className="font-cn text-gold">
          {analysis.context.useful.map((e) => `${elementSymbol(e)} ${e}`).join(" / ")}
        </span>
      ),
    },
    {
      label: "ธาตุที่ควรใช้พอดี",
      body: (
        <span className="font-cn text-gold/80">
          {analysis.context.unfavorable.map((e) => `${elementSymbol(e)} ${e}`).join(" / ")}
        </span>
      ),
    },
    {
      label: "การเงิน",
      body: (
        <>
          <span className="font-cn">{elementSymbol(analysis.context.roles.wealth)}</span>{" "}
          {analysis.context.roles.wealth} · <span className="text-gold/60">สูตร: 財星</span>
        </>
      ),
    },
    {
      label: "งาน/สถานะ",
      body: (
        <>
          <span className="font-cn">{elementSymbol(analysis.context.roles.officer)}</span>{" "}
          {analysis.context.roles.officer} · <span className="text-gold/60">สูตร: 官煞</span>
        </>
      ),
    },
    {
      label: "การสื่อสาร/ผลงาน",
      body: (
        <>
          <span className="font-cn">{elementSymbol(analysis.context.roles.output)}</span>{" "}
          {analysis.context.roles.output} · <span className="text-gold/60">สูตร: 食傷</span>
        </>
      ),
    },
    {
      label: "ความรู้/ผู้สนับสนุน",
      body: (
        <>
          <span className="font-cn">{elementSymbol(analysis.context.roles.resource)}</span>{" "}
          {analysis.context.roles.resource} · <span className="text-gold/60">สูตร: 印</span>
        </>
      ),
    },
  ];

  return (
    <section className="glass-strong rounded-3xl p-6 shadow-elegant">
      <h4 className="font-display text-xl text-foreground">เมตริกซ์แห่งโชคชะตา</h4>
      <div className="mt-3 flex flex-wrap gap-2">
        {relationSummary.map((item) => (
          <span
            key={item.label}
            className="rounded-full border border-gold/20 bg-gold/10 px-3 py-1 text-xs text-gold"
          >
            <span className="font-cn">{item.han}</span> {item.label} {item.count.toFixed(1)}
          </span>
        ))}
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {items.map((it) => (
          <div key={it.label} className="rounded-2xl border border-border bg-card/40 p-4">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {it.label}
            </div>
            <div className="mt-1 text-sm text-foreground">{it.body}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function LuckCyclesPanel({ analysis }: { analysis: BaziAnalysis }) {
  return (
    <section className="glass-strong rounded-3xl p-6 shadow-elegant">
      <h4 className="font-display text-xl text-foreground">
        โชควัยจร <span className="font-cn text-gold">大運</span>
      </h4>
      <div className="mt-5 space-y-3">
        {analysis.luckCycles.map((l, i) => (
          <div
            key={i}
            className="group flex items-center gap-4 rounded-2xl border border-border bg-card/30 p-4 transition-all hover:border-gold/30 hover:bg-card/60"
          >
            <div className="w-32 shrink-0">
              <div className="text-xs text-muted-foreground">อายุ {l.age} ปี</div>
              <div className="text-[10px] text-gold/60">({l.years})</div>
            </div>
            <div className="font-cn text-3xl text-gold">{l.stem}</div>
            <div className="w-24 text-xs text-muted-foreground">{l.th}</div>
            <div className="flex-1 border-l border-border pl-4 text-sm text-foreground/90">
              {l.note}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function TenGodsPanel({ analysis }: { analysis: BaziAnalysis }) {
  return (
    <section className="glass-strong rounded-3xl p-6 shadow-elegant">
      <h4 className="font-display text-xl text-foreground">
        ดาวสิบเทพ <span className="font-cn text-gold">十神</span>
      </h4>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {analysis.tenGods.map((g) => (
          <div
            key={g.cn}
            className="flex items-center gap-4 rounded-2xl border border-border bg-card/30 p-4 transition-all hover:border-gold/30"
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-gold-soft font-cn text-2xl text-gold">
              {g.cn}
            </div>
            <div className="flex-1">
              <div className="text-xs text-muted-foreground">พบ {g.count} จุด</div>
              <div className="font-display text-lg text-foreground">{g.th}</div>
              <div className="text-xs text-muted-foreground">{g.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PrinciplesPanel() {
  const points = [
    "วันเกิดคือแกนหลัก ก้านฟ้าของวันเกิดเรียกว่า Day Master ใช้แทนตัวเรา",
    "ดูฤดูกาลและธาตุรอบตัว เดือนเกิดบอกสภาพแวดล้อม ส่วนปี วัน และยามช่วยเสริมภาพรวม",
    "ประเมินน้ำหนักดวง ดูว่าธาตุตัวตนได้รับแรงหนุนมากหรือน้อยจากฤดูกาลและธาตุรอบตัว",
    "หาธาตุที่ช่วยปรับสมดุล ระบบเลือกธาตุที่ช่วยให้ภาพรวมไม่เอียงไปด้านใดด้านหนึ่งมากเกินไป",
    "อ่านดาวสิบเทพ ใช้ความสัมพันธ์ของธาตุเพื่อแปลเป็นหัวข้อ เช่น งาน เงิน ความสัมพันธ์ ความคิด และผู้สนับสนุน",
  ];
  return (
    <section className="glass-strong rounded-3xl p-8 shadow-elegant">
      <h4 className="font-display text-2xl text-foreground">หลักการดูดวงปาจื้อ</h4>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        ปาจื้อเป็นการอ่านเชิงสัญลักษณ์จากวัน เดือน ปี และเวลาเกิด โดยแปลงเป็น 4 เสา แต่ละเสามี
        "ก้านฟ้า" และ "กิ่งดิน" เพื่อดูแนวโน้มของธาตุและจังหวะชีวิต
      </p>
      <ol className="mt-6 space-y-3">
        {points.map((p, i) => (
          <li key={i} className="flex gap-4 rounded-2xl border border-border bg-card/30 p-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-gold font-display text-sm text-primary-foreground">
              {i + 1}
            </span>
            <span className="text-sm leading-relaxed text-foreground/90">{p}</span>
          </li>
        ))}
      </ol>
      <div className="gold-divider my-6" />
      <p className="text-xs leading-relaxed text-muted-foreground">
        ผลอ่านนี้เป็นแนวทางเชิงวิเคราะห์และความบันเทิง ไม่ใช่คำตัดสินชีวิตหรือคำแนะนำทางการเงิน
        การแพทย์ หรือกฎหมาย สูตรในเว็บใช้การประมาณดาวงจร 60 ก้านฟ้า-กิ่งดินและขอบเขตฤดูกาลจีนรายวัน
      </p>
    </section>
  );
}

function ForecastPanel({ analysis }: { analysis: BaziAnalysis }) {
  const focus = ["ภาพรวม", "งาน", "เงิน", "ความรัก", "สุขภาพใจ"];
  const [active, setActive] = useState("ภาพรวม");
  const forecastDate = new Date().toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const scores = [
    { label: "งาน", score: Math.min(99, analysis.today.dayScore + 6) },
    { label: "เงิน", score: Math.max(28, analysis.today.dayScore - 2) },
    { label: "ความรัก", score: Math.min(99, analysis.today.dayScore + 1) },
    { label: "สุขภาพใจ", score: Math.max(28, analysis.today.dayScore - 6) },
  ];
  return (
    <section className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <div className="glass-strong rounded-3xl p-6 shadow-elegant">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
          คำพยากรณ์ส่วนตัว
        </div>
        <h4 className="mt-2 font-display text-2xl leading-tight text-foreground">
          คำพยากรณ์ตั้งต้น · งาน เงิน ความรัก สุขภาพใจ
        </h4>
        <div className="my-5 flex items-center justify-between rounded-2xl border border-gold/20 bg-gradient-gold-soft p-4">
          <div className="text-xs text-muted-foreground">พลังเรื่องนี้</div>
          <div className="font-display text-4xl text-gold">{analysis.today.dayScore}</div>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          ระบบอ่านตั้งต้นจากดวงเกิด Day Master{" "}
          <span className="font-cn text-gold">{analysis.chart.day.stem.han}</span>
          {analysis.chart.day.stem.element}, ธาตุให้คุณ {analysis.context.useful.join(" / ")}{" "}
          และพลังวันนี้
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {focus.map((f) => (
            <button
              key={f}
              onClick={() => setActive(f)}
              className={`rounded-full px-4 py-1.5 text-xs transition-all ${active === f ? "bg-gradient-gold text-primary-foreground" : "border border-border text-muted-foreground hover:border-gold/30"}`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="mt-5">
          <div className="mb-2 text-[10px] uppercase tracking-wider text-muted-foreground">
            ถามเรื่องที่ค้างใจ
          </div>
          <input placeholder="เช่น เดือนนี้ควรเริ่มโปรเจกต์ใหม่ไหม" className="input-styled" />
          <button className="mt-2 w-full rounded-xl bg-gradient-gold py-3 text-sm font-semibold text-primary-foreground shadow-gold">
            วิเคราะห์คำถาม
          </button>
        </div>
      </div>

      <div className="glass-strong rounded-3xl p-6 shadow-elegant">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
              ผลคำพยากรณ์
            </div>
            <h4 className="mt-1 font-display text-2xl text-foreground">
              คำพยากรณ์ <span className="font-cn text-gold">占斷</span>
            </h4>
          </div>
          <div className="text-right text-[10px] text-muted-foreground">
            {forecastDate} · อ่านจากดวงเกิด
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-gold/15 bg-card/30 p-5">
          <div className="font-display text-lg text-gold">คำพยากรณ์ตั้งต้น</div>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {analysis.today.summary}
          </p>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {scores.map((s) => (
            <div key={s.label} className="rounded-2xl border border-border bg-card/40 p-4">
              <div className="flex items-baseline justify-between">
                <div className="text-xs text-muted-foreground">{s.label}</div>
                <div className="font-display text-lg text-gold">{s.score}/100</div>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-foreground/80">
                แนวโน้มควรประคองและเลือกจังหวะตัดสินใจให้ชัดเจน ใช้ข้อมูลและสัญญาเป็นเครื่องตรวจสอบ
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <SmallNote label="วันนี้" body="เก็บข้อมูลและลดความคาดหวังที่ไม่จำเป็น" />
          <SmallNote label="3 วัน" body="เห็นความคืบหน้าจากสิ่งที่มีโครงสร้างชัด" />
          <SmallNote label="7 วัน" body="จังหวะจะชัดขึ้นหลังตัดเรื่องรบกวนออก" />
        </div>
      </div>
    </section>
  );
}

function SmallNote({ label, body }: { label: string; body: string }) {
  return (
    <div className="rounded-xl border border-border bg-card/40 p-3">
      <div className="text-[10px] uppercase tracking-wider text-gold">{label}</div>
      <div className="mt-1 text-xs text-foreground/80">{body}</div>
    </div>
  );
}

function CalendarPanel({ analysis }: { analysis: BaziAnalysis }) {
  const days = analysis.calendar;

  const scoreColor = (s: number) =>
    s >= 80
      ? "from-emerald-400/30 to-emerald-300/10 text-emerald-200 border-emerald-400/40"
      : s >= 65
        ? "from-gold/30 to-gold/10 text-gold border-gold/40"
        : s >= 45
          ? "from-amber-400/20 to-amber-300/5 text-amber-200 border-amber-400/30"
          : "from-rose-400/20 to-rose-300/5 text-rose-200 border-rose-400/30";

  return (
    <section className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <div className="glass-strong h-fit rounded-3xl p-6 shadow-elegant">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
          ปฏิทินส่วนตัว
        </div>
        <h4 className="mt-2 font-display text-3xl text-foreground">14 วันถัดไป</h4>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          {analysis.input.name || "ไม่ระบุชื่อ"} เกิด {analysis.input.birthDate} ระบบใช้ธาตุให้คุณ{" "}
          {analysis.context.useful.join(" / ")} เพื่อจัดอันดับวัน
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {["ทั้งหมด", "งาน/เงิน", "รัก/เจรจา", "พัก/แก้เคล็ด"].map((t, i) => (
            <button
              key={t}
              className={`rounded-full px-3 py-1.5 text-xs ${i === 0 ? "bg-gradient-gold text-primary-foreground" : "border border-border text-muted-foreground"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-strong rounded-3xl p-6 shadow-elegant">
        <div className="flex items-center justify-between">
          <h4 className="font-display text-xl text-foreground">
            ปฏิทินมงคล <span className="font-cn text-gold">吉祥日历</span>
          </h4>
          <span className="text-xs text-gold/60">อิงธาตุให้คุณของวันนี้</span>
        </div>
        <div className="mt-5 space-y-2">
          {days.map((day, i) => (
            <div
              key={i}
              className={`flex items-center gap-4 rounded-2xl border bg-gradient-to-r p-4 transition-all hover:translate-x-1 ${scoreColor(day.score)}`}
            >
              <div className="w-20 shrink-0 text-xs text-muted-foreground">
                <div className="text-foreground">{day.d}</div>
                <div className="text-[10px]">{day.w}</div>
              </div>
              <div className="w-28 shrink-0">
                <div className="font-cn text-xl text-foreground">{day.stem}</div>
                <div className="text-[10px] text-muted-foreground">{day.th}</div>
              </div>
              <div className="flex-1 text-xs text-foreground/80">
                <div className="font-medium">{day.note}</div>
              </div>
              <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-full border border-current bg-background/30">
                <div className="font-display text-xl leading-none">{day.score}</div>
                <div className="text-[9px] opacity-80">{day.tag}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function QimenPanel({ analysis }: { analysis: BaziAnalysis }) {
  const { best, directions } = analysis.qimen;
  const remedyColor =
    {
      ไม้: "สีเขียวหรือของไม้",
      ไฟ: "แสงไฟหรือสีแดง",
      ดิน: "สีเหลือง/น้ำตาลหรือของเซรามิก",
      ทอง: "สีขาว/ทองหรือโลหะ",
      น้ำ: "สีน้ำเงินหรือแก้วน้ำใส",
    }[best.elem] || "ของที่เข้ากับธาตุเด่น";
  return (
    <section className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <div className="glass-strong h-fit rounded-3xl p-6 shadow-elegant">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
          ฉีเหมินรายยาม
        </div>
        <h4 className="mt-2 font-display text-2xl text-foreground">
          {best.dir} · {best.door} <span className="font-cn text-gold">{best.doorCn}</span>
        </h4>
        <div className="my-5 flex items-center justify-between rounded-2xl border border-gold/20 bg-gradient-gold-soft p-4">
          <div className="text-xs text-muted-foreground">ทิศเด่น</div>
          <div className="font-display text-4xl text-gold">{best.score}</div>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          โหมดนี้เป็นฉีเหมินเบื้องต้น/จำลองจากเวลา ธาตุให้คุณ และทิศ
          ไม่ใช่การตั้งกระดานฉีเหมินเต็มสูตรแบบจีนแส
        </p>
      </div>

      <div className="glass-strong rounded-3xl p-6 shadow-elegant">
        <div className="flex items-center justify-between">
          <h4 className="font-display text-xl text-foreground">
            ฉีเหมิน <span className="font-cn text-gold">奇門</span>
          </h4>
          <span className="text-xs text-gold/60">ทิศมงคลรายยาม</span>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3">
          {directions.map((d) => {
            const isCenter = d.dir === "กลาง";
            return (
              <div
                key={d.dir}
                className={`relative rounded-2xl border p-4 text-center transition-all hover:-translate-y-0.5 ${isCenter ? "border-gold/40 bg-gradient-gold-soft" : "border-border bg-card/40 hover:border-gold/30"}`}
              >
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {d.dir}
                </div>
                <div className="mt-2 font-display text-2xl text-foreground">
                  {d.door} <span className="font-cn text-gold">{d.doorCn}</span>
                </div>
                <div className="mt-1 font-cn text-xs text-muted-foreground">
                  {elementSymbol(d.elem)} {d.elem} · {d.score}/100
                </div>
                <div className="mt-2 text-[10px] text-gold/70">{d.tag}</div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 rounded-2xl border border-gold/15 bg-card/30 p-4">
          <div className="text-sm font-semibold text-foreground">ทิศแนะนำแบบจำลอง: {best.dir}</div>
          <p className="mt-1 text-xs text-muted-foreground">
            ระบบให้คะแนนจากธาตุ <span className="font-cn">{elementSymbol(best.elem)}</span>{" "}
            {best.elem}, เวลาเกิด และธาตุให้คุณ {analysis.context.useful.join(" / ")}{" "}
            หากต้องการความแม่นระดับจีนแสต้องใช้การตั้งกระดานฉีเหมินเต็มสูตร
          </p>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <NoteCard
              title="งาน/ขาย"
              body={`ใช้เป็นตัวช่วยเลือกจังหวะเริ่มต้นเท่านั้น ถ้าคะแนน ${best.score} สูง ให้เริ่มเรื่องที่เข้ากับธาตุ${best.elem}`}
            />
            <NoteCard
              title="ความรัก"
              body="ใช้เพื่อเลือกบรรยากาศและทิศนั่งคุย ไม่ใช่คำตัดสินความสัมพันธ์"
            />
            <NoteCard
              title="การเงิน"
              body="ใช้ประกอบการวางแผน ไม่แทนการตรวจตัวเลข สัญญา หรือความเสี่ยงจริง"
            />
            <NoteCard title="แก้เคล็ด" body={`เสริม${remedyColor}ทางทิศ${best.dir}`} />
          </div>
        </div>
      </div>
    </section>
  );
}

function NoteCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-border bg-card/40 p-3">
      <div className="text-[10px] uppercase tracking-wider text-gold/70">{title}</div>
      <div className="mt-1 text-xs text-foreground/80">{body}</div>
    </div>
  );
}
