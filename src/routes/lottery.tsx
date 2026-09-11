import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  Flame,
  Snowflake,
  TrendingUp,
  RotateCcw,
  ArrowRight,
  Filter,
  Layers,
  Sparkles,
  Calendar,
  Grid,
} from "lucide-react";
import {
  buildLotteryFrequency,
  lotteryDrawKey,
  lotteryPrizeRows,
  lotteryPrizes,
  thaiLotteryDate,
  thaiMonths,
  type LotteryDrawDate,
  type LotteryFrequencyMap,
  type LotteryFrequencyMode,
  type LotteryHistoryItem,
  type LotteryResultData,
} from "@/lib/lottery";
import { seo } from "@/lib/seo";
import { friendlyErrorMessage } from "@/lib/friendly-error";

type LotteryTab = "result" | "stats" | "radar" | "follower" | "probability" | "predict";
type LotteryApiResponse = {
  ok?: boolean;
  error?: string;
  mode?: "latest" | "result";
  date?: LotteryDrawDate;
  latestDate?: LotteryDrawDate;
  latestIsoDate?: string;
  nextDraw?: LotteryDrawDate;
  source?: "cache" | "glo";
  cachedAt?: string;
  pdfUrl?: string | null;
  youtubeUrl?: string | null;
  data?: LotteryResultData;
  history?: LotteryHistoryItem[];
  frequency?: LotteryFrequencyMap;
};

const tabs: { id: LotteryTab; label: string; sub: string }[] = [
  { id: "result", label: "ผลรางวัล", sub: "ตรวจผลสลากตามงวด" },
  { id: "stats", label: "สถิติย้อนหลัง", sub: "เลขออกบ่อย 1-5 ปี" },
  { id: "radar", label: "เรดาร์ 100 ประตู", sub: "Heatmap 00-99 ตามวัน" },
  { id: "follower", label: "ระบบเลขตาม", sub: "งวดถัดไปมักออกเลขไหน" },
  { id: "probability", label: "ความน่าจะเป็น", sub: "โอกาสถูกรางวัลจริง" },
  { id: "predict", label: "ทำนายเลข", sub: "สุ่มเลขจากสถิติ" },
];

const freqLabels: Record<LotteryFrequencyMode, string> = {
  last2: "เลขท้าย 2 ตัว",
  last3b: "เลขท้าย 3 ตัว",
  last3f: "เลขหน้า 3 ตัว",
  first: "รางวัลที่ 1",
};

const LOTTERY_HISTORY_LIMIT = 120;

type LotteryPredictionItem = {
  number: string;
  count: number;
  modelScore: number;
  observedRate: number;
  reason: string;
};

type LotteryPredictionGroup = {
  key: LotteryFrequencyMode;
  label: string;
  digits: number;
  baselineOdds: string;
  sampleSize: number;
  items: LotteryPredictionItem[];
};

type LotteryDataSummary = {
  latestDate: LotteryDrawDate | null;
  nextDraw: LotteryDrawDate | null;
  historyCount: number;
  historyLimit: number;
  dataSource: string;
  cachedAt: string;
};

export const Route = createFileRoute("/lottery")({
  head: () =>
    seo({
      title: "ตรวจหวย สลากกินแบ่งรัฐบาล เลขเด็ดงวดนี้ สถิติหวย & ความน่าจะเป็น",
      description:
        "ตรวจสลากกินแบ่งรัฐบาล ตรวจหวยงวดล่าสุดและย้อนหลัง วิเคราะห์สถิติเลขที่ออกบ่อย คำนวณความน่าจะเป็นทางคณิตศาสตร์ และแนวทางเลขเด็ดงวดนี้แม่นๆ",
      path: "/lottery",
      keywords: [
        "ตรวจหวย",
        "ตรวจสลากกินแบ่งรัฐบาล",
        "ผลสลากกินแบ่ง",
        "เลขเด็ดงวดนี้",
        "สถิติหวย",
        "ตรวจหวยย้อนหลัง",
        "แนวทางหวย",
        "เลขเด็ด",
        "Likhitfa",
      ],
    }),
  component: LotteryPage,
});

function LotteryPage() {
  const now = new Date();
  const [activeTab, setActiveTab] = useState<LotteryTab>("result");
  const [drawDate, setDrawDate] = useState<LotteryDrawDate>({
    date: now.getDate() >= 16 ? "16" : "01",
    month: String(now.getMonth() + 1).padStart(2, "0"),
    year: String(now.getFullYear()),
  });
  const [result, setResult] = useState<LotteryResultData | null>(null);
  const [resultDate, setResultDate] = useState<LotteryDrawDate | null>(null);
  const [latestKnownDate, setLatestKnownDate] = useState<LotteryDrawDate | null>(null);
  const [resultLabel, setResultLabel] = useState("");
  const [history, setHistory] = useState<LotteryHistoryItem[]>([]);
  const [frequency, setFrequency] = useState<LotteryFrequencyMap | null>(null);
  const [nextDraw, setNextDraw] = useState<LotteryDrawDate | null>(null);
  const [dataSource, setDataSource] = useState("");
  const [cachedAt, setCachedAt] = useState("");
  const [freqMode, setFreqMode] = useState<LotteryFrequencyMode>("last2");
  const [selectedPrize, setSelectedPrize] = useState(lotteryPrizes.length - 1);
  const [loading, setLoading] = useState("");
  const [error, setError] = useState("");
  const [seed, setSeed] = useState(1);

  const effectiveFrequency = useMemo(
    () => frequency || (history.length ? buildLotteryFrequency(history) : null),
    [frequency, history],
  );
  const predictions = useMemo(
    () => makePredictionGroups(effectiveFrequency, history, seed),
    [effectiveFrequency, history, seed],
  );
  const dataSummary = useMemo<LotteryDataSummary>(
    () => ({
      latestDate: latestKnownDate || history[0]?.date || null,
      nextDraw,
      historyCount: history.length,
      historyLimit: LOTTERY_HISTORY_LIMIT,
      dataSource,
      cachedAt,
    }),
    [cachedAt, dataSource, history, latestKnownDate, nextDraw],
  );

  useEffect(() => {
    const applyHashTab = () => {
      const hash = window.location.hash.replace("#", "");
      if (tabs.some((tab) => tab.id === hash)) setActiveTab(hash as LotteryTab);
    };
    applyHashTab();
    window.addEventListener("hashchange", applyHashTab);
    return () => window.removeEventListener("hashchange", applyHashTab);
  }, []);

  useEffect(() => {
    void loadLatestResult();
    void loadStats(LOTTERY_HISTORY_LIMIT, { silent: true });
  }, []);

  async function loadResult() {
    setError("");
    setLoading("result");
    try {
      const params = new URLSearchParams(drawDate);
      const response = await fetch(`/api/lottery?${params.toString()}`);
      const data = (await response.json()) as LotteryApiResponse;
      if (!response.ok || !data.ok || !data.data || !data.date) {
        throw new Error(friendlyErrorMessage(data.error, "โหลดผลรางวัลไม่สำเร็จ"));
      }
      setResult(data.data);
      setResultDate(data.date);
      setLatestKnownDate(data.latestDate || latestKnownDate || history[0]?.date || null);
      setNextDraw(data.nextDraw || null);
      setDataSource(formatDataSource(data.source));
      setCachedAt(data.cachedAt || "");
      setResultLabel(data.date ? `งวดประจำวันที่ ${thaiLotteryDate(data.date)}` : "งวดที่เลือก");
    } catch (loadError) {
      setError(friendlyErrorMessage(loadError, "โหลดผลรางวัลไม่สำเร็จ"));
    } finally {
      setLoading("");
    }
  }

  async function loadLatestResult() {
    setError("");
    setLoading("latest");
    try {
      const response = await fetch("/api/lottery?mode=latest");
      const data = (await response.json()) as LotteryApiResponse;
      if (!response.ok || !data.ok || !data.data) {
        throw new Error(friendlyErrorMessage(data.error, "โหลดผลรางวัลงวดล่าสุดไม่สำเร็จ"));
      }
      setResult(data.data);
      setResultDate(data.date || null);
      setLatestKnownDate(data.latestDate || data.date || null);
      setNextDraw(data.nextDraw || null);
      setDataSource(formatDataSource(data.source));
      setCachedAt(data.cachedAt || "");
      setResultLabel(
        data.date ? `งวดประจำวันที่ ${thaiLotteryDate(data.date)}` : "ผลรางวัลงวดล่าสุด",
      );
    } catch (loadError) {
      setError(friendlyErrorMessage(loadError, "โหลดผลรางวัลงวดล่าสุดไม่สำเร็จ"));
    } finally {
      setLoading("");
    }
  }

  async function loadStats(limit = LOTTERY_HISTORY_LIMIT, options: { silent?: boolean } = {}) {
    if (!options.silent) setError("");
    setLoading("stats");
    try {
      const response = await fetch(`/api/lottery?mode=history&limit=${limit}`);
      const data = (await response.json()) as LotteryApiResponse;
      if (!response.ok || !data.ok) {
        throw new Error(friendlyErrorMessage(data.error, "โหลดสถิติไม่สำเร็จ"));
      }
      setHistory(data.history || []);
      setLatestKnownDate(data.latestDate || data.history?.[0]?.date || null);
      setFrequency(data.frequency || null);
      setNextDraw(data.nextDraw || null);
      setDataSource(formatDataSource(data.source));
      setCachedAt(data.cachedAt || "");
      if (!(data.history || []).length) throw new Error("ยังไม่มีข้อมูลย้อนหลังจาก GLO");
    } catch (loadError) {
      if (!options.silent) setError(friendlyErrorMessage(loadError, "โหลดสถิติไม่สำเร็จ"));
    } finally {
      setLoading("");
    }
  }

  async function loadStatsAndPredict() {
    if (!effectiveFrequency) await loadStats(LOTTERY_HISTORY_LIMIT);
    setSeed((value) => value + 1);
  }

  return (
    <div className="min-h-screen">
      <SiteHeader subtitle="เลขเด็ด" subtitleCn="幸運數字" />
      <main className="mx-auto max-w-7xl px-6 pt-10 pb-12">
        <section className="glass-strong relative overflow-hidden rounded-3xl p-8 shadow-elegant">
          <div className="pointer-events-none absolute -right-12 -top-16 font-cn text-[12rem] text-gold/5">
            福
          </div>
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/5 px-4 py-1.5 text-[11px] tracking-[0.25em] text-gold/80">
              LOTTERY · เลขเด็ด
            </div>
            <h1 className="mt-5 font-display text-4xl text-foreground md:text-6xl">
              เลขเด็ด<span className="text-gradient-gold italic">ลิขิตฟ้า</span>
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              ตรวจผลรางวัล ดูสถิติย้อนหลังสูงสุด 5 ปี อ่านความน่าจะเป็น
              และสุ่มเลขจากข้อมูลจริงเพื่อใช้เป็นแนวทางอย่างมีสติ
            </p>
          </div>
        </section>

        <LotteryDataSummaryCard summary={dataSummary} />

        <section className="mt-8 grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-2xl border p-4 text-left transition ${
                activeTab === tab.id
                  ? "border-gold/50 bg-gradient-gold-soft shadow-gold"
                  : "border-border bg-card/40 text-muted-foreground hover:border-gold/30 hover:text-foreground"
              }`}
            >
              <div className="font-display text-xl text-foreground">{tab.label}</div>
              <div className="mt-1 text-xs text-muted-foreground">{tab.sub}</div>
            </button>
          ))}
        </section>

        {error && (
          <div className="mt-6 rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        )}

        <section className="mt-8">
          {activeTab === "result" && (
            <ResultPanel
              drawDate={drawDate}
              setDrawDate={setDrawDate}
              result={result}
              resultDate={resultDate}
              resultLabel={resultLabel}
              loading={loading === "result" || loading === "latest"}
              onLoad={loadResult}
              onLoadLatest={loadLatestResult}
              nextDraw={nextDraw}
              dataSource={dataSource}
              cachedAt={cachedAt}
            />
          )}
          {activeTab === "stats" && (
            <StatsPanel
              history={history}
              frequency={effectiveFrequency}
              freqMode={freqMode}
              setFreqMode={setFreqMode}
              loading={loading === "stats"}
              onLoad={() => loadStats(LOTTERY_HISTORY_LIMIT)}
              nextDraw={nextDraw}
              dataSource={dataSource}
              cachedAt={cachedAt}
            />
          )}
          {activeTab === "radar" && (
            <RadarPanel
              history={history}
              loading={loading === "stats"}
              onLoad={() => loadStats(LOTTERY_HISTORY_LIMIT)}
              nextDraw={nextDraw}
              dataSource={dataSource}
              cachedAt={cachedAt}
            />
          )}
          {activeTab === "follower" && (
            <FollowerPanel
              history={history}
              loading={loading === "stats"}
              onLoad={() => loadStats(LOTTERY_HISTORY_LIMIT)}
              nextDraw={nextDraw}
              dataSource={dataSource}
            />
          )}
          {activeTab === "probability" && (
            <ProbabilityPanel
              selectedPrize={selectedPrize}
              setSelectedPrize={setSelectedPrize}
              summary={dataSummary}
            />
          )}
          {activeTab === "predict" && (
            <PredictPanel
              predictions={predictions}
              hasStats={Boolean(effectiveFrequency)}
              historyCount={history.length}
              summary={dataSummary}
              nextDraw={nextDraw}
              loading={loading === "stats"}
              onRandom={() => setSeed((value) => value + 1)}
              onLoadStats={loadStatsAndPredict}
            />
          )}
        </section>

        <div className="mt-10 rounded-2xl border border-gold/10 bg-card/30 p-5 text-center text-xs leading-relaxed text-muted-foreground">
          ข้อมูลผลรางวัลดึงผ่าน API จากสำนักงานสลากกินแบ่งรัฐบาลเท่าที่ระบบเข้าถึงได้ และเก็บ cache
          ไว้ในระบบเพื่อให้หน้าเว็บเร็วและไม่ต้องดึงข้อมูลทุกครั้ง
          ส่วนการทำนายเป็นการวิเคราะห์เชิงสถิติและความบันเทิง ไม่ใช่การรับประกันผลรางวัล
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function ResultPanel({
  drawDate,
  setDrawDate,
  result,
  resultDate,
  resultLabel,
  loading,
  onLoad,
  onLoadLatest,
  nextDraw,
  dataSource,
  cachedAt,
}: {
  drawDate: LotteryDrawDate;
  setDrawDate: (value: LotteryDrawDate) => void;
  result: LotteryResultData | null;
  resultDate: LotteryDrawDate | null;
  resultLabel: string;
  loading: boolean;
  onLoad: () => void;
  onLoadLatest: () => void;
  nextDraw: LotteryDrawDate | null;
  dataSource: string;
  cachedAt: string;
}) {
  const years = Array.from({ length: 6 }, (_, i) => String(new Date().getFullYear() - i));
  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <div className="glass-strong h-fit rounded-3xl p-6 shadow-elegant">
        <div className="text-[11px] uppercase tracking-wider text-gold/80">Official Result</div>
        <h2 className="mt-2 font-display text-3xl text-foreground">ผลรางวัล</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          ระบบโหลดงวดล่าสุดจากฐานข้อมูลที่เก็บไว้ก่อน และค่อยดึงสดเมื่อเลือกงวดที่ยังไม่มีใน cache
        </p>
        {nextDraw && (
          <div className="mt-4 rounded-2xl border border-gold/20 bg-gold/5 p-4 text-sm">
            <div className="text-xs text-muted-foreground">รอผลงวดถัดไป</div>
            <div className="mt-1 font-display text-2xl text-gold">{thaiLotteryDate(nextDraw)}</div>
          </div>
        )}
        <div className="mt-5 grid gap-3">
          <SelectBox
            label="วันที่ออก"
            value={drawDate.date}
            onChange={(date) => setDrawDate({ ...drawDate, date })}
            options={[
              { value: "01", label: "1" },
              { value: "16", label: "16" },
            ]}
          />
          <SelectBox
            label="เดือน"
            value={drawDate.month}
            onChange={(month) => setDrawDate({ ...drawDate, month })}
            options={thaiMonths.slice(1).map((label, index) => ({
              value: String(index + 1).padStart(2, "0"),
              label,
            }))}
          />
          <SelectBox
            label="ปี"
            value={drawDate.year}
            onChange={(year) => setDrawDate({ ...drawDate, year })}
            options={years.map((year) => ({
              value: year,
              label: `${Number(year) + 543} (${year})`,
            }))}
          />
          <button
            type="button"
            onClick={onLoadLatest}
            disabled={loading}
            className="mt-2 rounded-2xl bg-gradient-gold px-5 py-3 text-sm font-semibold text-primary-foreground shadow-gold disabled:opacity-50"
          >
            {loading ? "กำลังดึงข้อมูล..." : "ผลรางวัลงวดล่าสุด"}
          </button>
          <button
            type="button"
            onClick={onLoad}
            disabled={loading}
            className="rounded-2xl border border-gold/30 px-5 py-3 text-sm font-semibold text-gold hover:bg-gold/10 disabled:opacity-50"
          >
            {loading ? "กำลังดึงข้อมูล..." : "ดูผลตามวันที่เลือก"}
          </button>
        </div>
      </div>

      <div className="glass-strong rounded-3xl p-6 shadow-elegant">
        {result ? (
          <>
            <div className="mb-5 flex items-center gap-2 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" />
              {resultLabel ||
                (resultDate ? `งวดประจำวันที่ ${thaiLotteryDate(resultDate)}` : "ผลรางวัล")}
            </div>
            {(dataSource || cachedAt) && (
              <div className="mb-5 rounded-2xl border border-border bg-card/30 px-4 py-3 text-xs text-muted-foreground">
                {dataSource && <span>แหล่งข้อมูล: {dataSource}</span>}
                {cachedAt && <span> · อัปเดต cache: {formatCacheTime(cachedAt)}</span>}
              </div>
            )}
            <div className="space-y-3">
              {lotteryPrizeRows.map((row) => {
                const numbers = result[row.key]?.number || [];
                if (!numbers.length) return null;
                return (
                  <div
                    key={row.key}
                    className="grid gap-3 rounded-2xl border border-border bg-card/35 p-4 md:grid-cols-[180px_1fr]"
                  >
                    <div>
                      <div className="text-sm font-semibold text-foreground">{row.label}</div>
                      <div className="text-xs text-muted-foreground">{row.sub}</div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {numbers.map((item, index) => (
                        <NumberTag
                          key={`${row.key}-${index}`}
                          value={item.value}
                          emphasis={row.emphasis}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <EmptyState
            title="กำลังรอข้อมูลผลรางวัล"
            body="ระบบจะโหลดงวดล่าสุดจาก cache ให้อัตโนมัติ หากยังไม่ขึ้นให้กดผลรางวัลงวดล่าสุด"
          />
        )}
      </div>
    </div>
  );
}

function LotteryDataSummaryCard({ summary }: { summary: LotteryDataSummary }) {
  const latest = summary.latestDate ? thaiLotteryDate(summary.latestDate) : "กำลังโหลดงวดล่าสุด";
  const next = summary.nextDraw ? thaiLotteryDate(summary.nextDraw) : "รอข้อมูลจากระบบ";
  const source = summary.dataSource || "ฐานข้อมูลกลางของระบบ";
  const cachedAt = summary.cachedAt ? formatCacheTime(summary.cachedAt) : "กำลังตรวจสอบ";

  return (
    <section className="mt-6 rounded-3xl border border-gold/15 bg-card/35 p-5 shadow-elegant">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-gold/75">
            Unified Lottery Dataset
          </div>
          <h2 className="mt-1 font-display text-2xl text-foreground">
            ฐานข้อมูลที่ใช้คำนวณร่วมกัน
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            ผลรางวัล สถิติ ความน่าจะเป็น และคำทำนายทั้งหมดอ้างอิงฐานข้อมูลเดียวกัน
            เพื่อให้ตัวเลขในทุกแท็บสัมพันธ์กัน ไม่ใช่แยกคำนวณคนละชุด
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:min-w-[620px] lg:grid-cols-4">
          <SummaryPill label="งวดล่าสุด" value={latest} />
          <SummaryPill label="รอผลงวด" value={next} />
          <SummaryPill
            label="ข้อมูลย้อนหลัง"
            value={
              summary.historyCount
                ? `${summary.historyCount.toLocaleString("th-TH")} งวด / สูงสุด ${summary.historyLimit.toLocaleString("th-TH")}`
                : "กำลังโหลดสถิติ"
            }
          />
          <SummaryPill label="แหล่งข้อมูล" value={source} sub={`cache ${cachedAt}`} />
        </div>
      </div>
    </section>
  );
}

function SummaryPill({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background/25 px-4 py-3">
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-semibold text-foreground">{value}</div>
      {sub && <div className="mt-1 truncate text-[10px] text-gold/70">{sub}</div>}
    </div>
  );
}

function StatsPanel({
  history,
  frequency,
  freqMode,
  setFreqMode,
  loading,
  onLoad,
  nextDraw,
  dataSource,
  cachedAt,
}: {
  history: LotteryHistoryItem[];
  frequency: LotteryFrequencyMap | null;
  freqMode: LotteryFrequencyMode;
  setFreqMode: (mode: LotteryFrequencyMode) => void;
  loading: boolean;
  onLoad: () => void;
  nextDraw: LotteryDrawDate | null;
  dataSource: string;
  cachedAt: string;
}) {
  const sorted = Object.entries(frequency?.[freqMode] || {}).sort((a, b) => b[1] - a[1]);
  const maxCount = sorted[0]?.[1] || 1;
  return (
    <div className="space-y-6">
      <div className="glass-strong rounded-3xl p-6 shadow-elegant">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-gold/80">Frequency</div>
            <h2 className="mt-2 font-display text-3xl text-foreground">สถิติเลขที่ออกบ่อย</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              คำนวณจากผลย้อนหลังจริงสูงสุด 5 ปีที่เก็บไว้ในระบบ{" "}
              {history.length ? `${history.length.toLocaleString("th-TH")} งวด` : ""}
              {nextDraw ? ` · รอผลงวด ${thaiLotteryDate(nextDraw)}` : ""}
            </p>
            {(dataSource || cachedAt) && (
              <p className="mt-2 text-xs text-muted-foreground">
                {dataSource ? `แหล่งข้อมูล: ${dataSource}` : ""}
                {cachedAt ? ` · cache ล่าสุด ${formatCacheTime(cachedAt)}` : ""}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onLoad}
            disabled={loading}
            className="rounded-2xl border border-gold/30 px-5 py-3 text-sm font-semibold text-gold hover:bg-gold/10 disabled:opacity-50"
          >
            {loading ? "กำลังโหลด..." : "โหลดสถิติ"}
          </button>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {(Object.keys(freqLabels) as LotteryFrequencyMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setFreqMode(mode)}
              className={`rounded-full px-4 py-2 text-xs transition ${
                freqMode === mode
                  ? "bg-gradient-gold text-primary-foreground shadow-gold"
                  : "border border-border text-muted-foreground hover:border-gold/30 hover:text-gold"
              }`}
            >
              {freqLabels[mode]}
            </button>
          ))}
        </div>
        {sorted.length ? (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
            {sorted.slice(0, 64).map(([number, count], index) => (
              <div
                key={number}
                className="rounded-2xl border border-border bg-card/40 p-3 text-center"
              >
                <div className="font-mono text-lg font-semibold text-gold">{number}</div>
                <div className="mt-1 text-[10px] text-muted-foreground">ออก {count} ครั้ง</div>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-background/60">
                  <div
                    className="h-full rounded-full bg-gradient-gold"
                    style={{ width: `${Math.max(10, (count / maxCount) * 100)}%` }}
                  />
                </div>
                <div className="mt-1 text-[9px] text-gold/50">#{index + 1}</div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="กำลังรอสถิติ"
            body="ระบบโหลดสถิติจาก cache ให้อัตโนมัติ หากยังไม่ขึ้นให้กดโหลดสถิติ"
          />
        )}
      </div>

      <div className="glass-strong rounded-3xl p-6 shadow-elegant">
        <h3 className="font-display text-2xl text-foreground">ประวัติผลรางวัลล่าสุด</h3>
        {history.length ? (
          <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {history.slice(0, 12).map((item) => (
              <div
                key={`${item.date.date}-${item.date.month}-${item.date.year}`}
                className="rounded-2xl border border-border bg-card/40 p-4"
              >
                <div className="text-xs text-muted-foreground">
                  งวด {thaiLotteryDate(item.date)}
                </div>
                <div className="mt-2 font-mono text-2xl font-semibold tracking-widest text-gold">
                  {item.data.first?.number?.[0]?.value || "------"}
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  ท้าย 2: {item.data.last2?.number?.[0]?.value || "--"} · ท้าย 3:{" "}
                  {item.data.last3b?.number?.map((number) => number.value).join(", ") || "---"}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="ยังไม่มีประวัติ" body="โหลดสถิติเพื่อแสดงประวัติผลรางวัลย้อนหลัง" />
        )}
      </div>
    </div>
  );
}

function ProbabilityPanel({
  selectedPrize,
  setSelectedPrize,
  summary,
}: {
  selectedPrize: number;
  setSelectedPrize: (index: number) => void;
  summary: LotteryDataSummary;
}) {
  const selected = lotteryPrizes[selectedPrize];
  const probability = selected.winners / selected.combinations;
  const odds = Math.round(selected.combinations / selected.winners);
  const expectedValue =
    probability * Number(selected.amount.replace(/,/g, "")) - (1 - probability) * 80;
  const maxProb =
    lotteryPrizes[lotteryPrizes.length - 1].winners /
    lotteryPrizes[lotteryPrizes.length - 1].combinations;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
      <div className="glass-strong rounded-3xl p-6 shadow-elegant">
        <div className="text-[11px] uppercase tracking-wider text-gold/80">Probability</div>
        <h2 className="mt-2 font-display text-3xl text-foreground">ความน่าจะเป็นที่แท้จริง</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          ส่วนนี้แสดงโอกาสจริงตามจำนวนชุดรางวัลของสลาก แล้วใช้ฐานข้อมูลกลางเดียวกับหน้าสถิติย้อนหลัง{" "}
          {summary.historyCount
            ? `${summary.historyCount.toLocaleString("th-TH")} งวด`
            : "ที่กำลังโหลด"}
          เพื่อให้ผู้ใช้แยกได้ชัดระหว่าง “โอกาสถูกรางวัลจริง” กับ “คะแนนคาดการณ์”
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {lotteryPrizes.map((prize, index) => (
            <button
              key={prize.key}
              type="button"
              onClick={() => setSelectedPrize(index)}
              className={`rounded-2xl border p-4 text-left transition ${
                selectedPrize === index
                  ? "border-gold/50 bg-gradient-gold-soft"
                  : "border-border bg-card/40 hover:border-gold/30"
              }`}
            >
              <div className="text-xs text-muted-foreground">{prize.label}</div>
              <div className="mt-2 font-display text-2xl text-foreground">{prize.amount} บาท</div>
              <div className="mt-1 font-mono text-xs text-gold">
                1 ใน {Math.round(prize.combinations / prize.winners).toLocaleString("th-TH")}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="glass-strong rounded-3xl p-6 shadow-elegant">
        <h3 className="font-display text-2xl text-foreground">{selected.label}</h3>
        <p className="mt-1 text-sm text-muted-foreground">รางวัล {selected.amount} บาท</p>
        {summary.nextDraw && (
          <div className="mt-3 rounded-2xl border border-gold/15 bg-gold/5 px-4 py-3 text-xs text-muted-foreground">
            ใช้ประกอบการอ่านงวดถัดไป {thaiLotteryDate(summary.nextDraw)} · ข้อมูลจาก{" "}
            {summary.dataSource || "ฐานข้อมูลกลาง"}
          </div>
        )}
        <div className="mt-5 grid gap-3">
          <StatBox label="ความน่าจะเป็น" value={formatProbability(probability)} />
          <StatBox label="ใบที่ต้องซื้อเฉลี่ย" value={`${odds.toLocaleString("th-TH")} ใบ`} />
          <StatBox
            label="Expected Value ต่อใบ"
            value={`${expectedValue >= 0 ? "+" : ""}${expectedValue.toFixed(0)} บาท`}
            danger={expectedValue < 0}
          />
        </div>
        <div className="mt-5 space-y-3">
          {lotteryPrizes.map((prize) => {
            const prob = prize.winners / prize.combinations;
            return (
              <div
                key={prize.key}
                className="grid grid-cols-[100px_1fr_90px] items-center gap-3 text-xs"
              >
                <span className="text-muted-foreground">{prize.label}</span>
                <div className="h-2 overflow-hidden rounded-full bg-card">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${(prob / maxProb) * 100}%`, backgroundColor: prize.color }}
                  />
                </div>
                <span className="text-right font-mono text-gold">
                  1/{Math.round(prize.combinations / prize.winners).toLocaleString("th-TH")}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PredictPanel({
  predictions,
  hasStats,
  historyCount,
  summary,
  nextDraw,
  loading,
  onRandom,
  onLoadStats,
}: {
  predictions: LotteryPredictionGroup[];
  hasStats: boolean;
  historyCount: number;
  summary: LotteryDataSummary;
  nextDraw: LotteryDrawDate | null;
  loading: boolean;
  onRandom: () => void;
  onLoadStats: () => void;
}) {
  return (
    <div className="glass-strong rounded-3xl p-6 shadow-elegant">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-gold/80">Prediction</div>
          <h2 className="mt-2 font-display text-3xl text-foreground">เลขเด็ดงวดหน้า</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {hasStats
              ? `วิเคราะห์จากข้อมูลย้อนหลังจริงสูงสุด 5 ปี (${historyCount.toLocaleString("th-TH")} งวด) แล้วถ่วงน้ำหนักตามเลขที่ออกบ่อย`
              : "กำลังรอฐานข้อมูลย้อนหลัง กดดึงสถิติเพื่อใช้ข้อมูลจริงถ่วงน้ำหนัก"}
            {nextDraw ? ` · สำหรับรอผลงวด ${thaiLotteryDate(nextDraw)}` : ""}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            ใช้ฐานเดียวกับแท็บผลรางวัลและสถิติ: งวดล่าสุด{" "}
            {summary.latestDate ? thaiLotteryDate(summary.latestDate) : "กำลังโหลด"} · cache{" "}
            {summary.cachedAt ? formatCacheTime(summary.cachedAt) : "กำลังตรวจสอบ"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onRandom}
            className="rounded-2xl bg-gradient-gold px-5 py-3 text-sm font-semibold text-primary-foreground shadow-gold"
          >
            สุ่มใหม่
          </button>
          <button
            type="button"
            onClick={onLoadStats}
            disabled={loading}
            className="rounded-2xl border border-gold/30 px-5 py-3 text-sm font-semibold text-gold hover:bg-gold/10 disabled:opacity-50"
          >
            {loading ? "กำลังโหลด..." : "ดึงสถิติมาสุ่ม"}
          </button>
        </div>
      </div>
      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        {predictions.map((group) => (
          <div key={group.key} className="rounded-3xl border border-border bg-card/35 p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-[0.25em] text-gold/70">
                  Prediction Band
                </div>
                <h3 className="mt-1 font-display text-2xl text-foreground">{group.label}</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  วิเคราะห์จากฐานเดียวกัน {group.sampleSize.toLocaleString("th-TH")} งวด ·
                  โอกาสจริงโดยฐานรางวัล {group.baselineOdds}
                </p>
              </div>
              <div className="rounded-full border border-gold/20 bg-gold/5 px-3 py-1 text-[11px] text-gold">
                Top 3
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {group.items.map((item, index) => (
                <div
                  key={`${group.key}-${item.number}-${index}`}
                  className={`rounded-2xl border p-4 ${
                    index === 0
                      ? "border-gold/50 bg-gradient-gold-soft"
                      : "border-border bg-background/20"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-gold/30 bg-gold/10 font-mono text-xs text-gold">
                        #{index + 1}
                      </span>
                      <span className="font-mono text-3xl font-semibold tracking-[0.16em] text-foreground">
                        {item.number}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-display text-2xl text-gold">{item.modelScore}%</div>
                      <div className="text-[10px] text-muted-foreground">คะแนนคาดการณ์</div>
                    </div>
                  </div>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-background/70">
                    <div
                      className="h-full rounded-full bg-gradient-gold"
                      style={{ width: `${item.modelScore}%` }}
                    />
                  </div>

                  <div className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                    <div>
                      พบในข้อมูลย้อนหลัง <span className="font-mono text-gold">{item.count}</span>{" "}
                      ครั้ง · อัตราพบ{" "}
                      <span className="font-mono text-gold">
                        {(item.observedRate * 100).toFixed(2)}%
                      </span>
                    </div>
                    <div className="sm:text-right">{item.reason}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-5 border-t border-gold/10 pt-4 text-xs leading-relaxed text-muted-foreground">
        เครื่องมือนี้ใช้เพื่อความบันเทิงและการดูแนวโน้มเชิงสถิติเท่านั้น
        ความน่าจะเป็นจริงของตัวเลขแต่ละชุดยังเป็นการสุ่ม
        ควรใช้เงินอย่างมีขอบเขตและไม่ฝากความหวังทั้งหมดไว้กับการเสี่ยงโชค
      </p>
    </div>
  );
}

function SelectBox({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="text-xs text-muted-foreground">{label}</span>
      <select
        className="input-styled"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function NumberTag({ value, emphasis }: { value: string; emphasis?: "first" | "near" }) {
  const className =
    emphasis === "first"
      ? "border-gold/60 bg-gold/10 text-3xl text-gold"
      : emphasis === "near"
        ? "border-rose-300/40 bg-rose-400/10 text-rose-100"
        : "border-border bg-card/60 text-foreground";
  return (
    <span
      className={`rounded-xl border px-4 py-2 font-mono text-lg font-semibold tracking-[0.12em] ${className}`}
    >
      {value}
    </span>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-gold/20 bg-card/20 p-10 text-center">
      <div className="font-display text-2xl text-foreground">{title}</div>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

function StatBox({
  label,
  value,
  danger = false,
}: {
  label: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card/40 p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`mt-1 font-display text-2xl ${danger ? "text-rose-200" : "text-gold"}`}>
        {value}
      </div>
    </div>
  );
}

function formatProbability(probability: number) {
  const pct = probability * 100;
  if (pct >= 1) return `${pct.toFixed(2)}%`;
  if (pct >= 0.001) return `${pct.toFixed(5)}%`;
  return `${pct.toFixed(8)}%`;
}

function makePredictionGroups(
  frequency: LotteryFrequencyMap | null,
  history: LotteryHistoryItem[],
  seed: number,
): LotteryPredictionGroup[] {
  const sampleSize = Math.max(history.length, 1);
  return [
    {
      key: "first",
      label: "รางวัลที่ 1",
      digits: 6,
      baselineOdds: "ประมาณ 1 ใน 1,000,000",
      sampleSize,
      items: buildFirstPrizePredictions(history, frequency?.first, seed),
    },
    {
      key: "last3f",
      label: "เลขหน้า 3 ตัว",
      digits: 3,
      baselineOdds: "ประมาณ 1 ใน 500",
      sampleSize,
      items: buildExactPrizePredictions(frequency?.last3f, sampleSize, 3, seed + 11),
    },
    {
      key: "last3b",
      label: "เลขท้าย 3 ตัว",
      digits: 3,
      baselineOdds: "ประมาณ 1 ใน 500",
      sampleSize,
      items: buildExactPrizePredictions(frequency?.last3b, sampleSize, 3, seed + 23),
    },
    {
      key: "last2",
      label: "เลขท้าย 2 ตัว",
      digits: 2,
      baselineOdds: "ประมาณ 1 ใน 100",
      sampleSize,
      items: buildExactPrizePredictions(frequency?.last2, sampleSize, 2, seed + 37),
    },
  ];
}

function buildExactPrizePredictions(
  freqMap: Record<string, number> | undefined,
  sampleSize: number,
  digits: number,
  seed: number,
): LotteryPredictionItem[] {
  const entries = Object.entries(freqMap || {})
    .filter(([number]) => number.length === digits)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

  const topEntries = entries.length
    ? entries.slice(0, 12)
    : Array.from({ length: 12 }, (_, index) => [pseudoNumber(seed + index, digits), 0] as const);
  const maxCount = Math.max(...topEntries.map(([, count]) => count), 1);

  return topEntries
    .map(([number, count], index) => {
      const jitter = seeded(seed + index * 13) * 3;
      const hotness = count / maxCount;
      const modelScore = clampScore(46 + hotness * 34 + (1 - index / 12) * 10 + jitter);
      return {
        number,
        count,
        modelScore,
        observedRate: count / sampleSize,
        reason:
          count > 0
            ? `ถ่วงน้ำหนักจากความถี่อันดับ ${index + 1} ในกลุ่ม ${digits} หลัก`
            : "ใช้สูตรกระจายเลขเมื่อข้อมูลซ้ำยังไม่มากพอ",
      };
    })
    .sort((a, b) => b.modelScore - a.modelScore || b.count - a.count)
    .slice(0, 3);
}

function buildFirstPrizePredictions(
  history: LotteryHistoryItem[],
  freqMap: Record<string, number> | undefined,
  seed: number,
): LotteryPredictionItem[] {
  const exactEntries = Object.entries(freqMap || {})
    .filter(([number]) => number.length === 6)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

  const positionalDigits = buildDigitPositionProfile(history);
  const candidates = new Map<string, { count: number; reason: string }>();

  exactEntries.slice(0, 6).forEach(([number, count], index) => {
    candidates.set(number, {
      count,
      reason:
        count > 1
          ? `เคยออกซ้ำ ${count} ครั้งในฐานข้อมูลย้อนหลัง`
          : `อิงรางวัลที่ 1 ย้อนหลังและจัดอันดับตามความใกล้รูปแบบเลข #${index + 1}`,
    });
  });

  Array.from({ length: 9 }, (_, index) => makeProfileCandidate(positionalDigits, seed + index * 19))
    .filter(Boolean)
    .forEach((number, index) => {
      if (!candidates.has(number)) {
        candidates.set(number, {
          count: freqMap?.[number] || 0,
          reason: `ประกอบจาก digit profile รางวัลที่ 1 ย้อนหลังชุดที่ ${index + 1}`,
        });
      }
    });

  const entries = [...candidates.entries()].slice(0, 12);
  const maxScoreBase = Math.max(
    ...entries.map(([number]) => scoreNumberByProfile(number, positionalDigits)),
    1,
  );

  return entries
    .map(([number, meta], index) => {
      const profileScore = scoreNumberByProfile(number, positionalDigits) / maxScoreBase;
      const repeatBonus = Math.min(meta.count, 2) * 6;
      const jitter = seeded(seed + index * 29) * 3;
      return {
        number,
        count: meta.count,
        modelScore: clampScore(45 + profileScore * 38 + repeatBonus + jitter),
        observedRate: meta.count / Math.max(history.length, 1),
        reason: meta.reason,
      };
    })
    .sort((a, b) => b.modelScore - a.modelScore || b.count - a.count)
    .slice(0, 3);
}

function buildDigitPositionProfile(history: LotteryHistoryItem[]) {
  const profile = Array.from({ length: 6 }, () =>
    Object.fromEntries(Array.from({ length: 10 }, (_, digit) => [String(digit), 0])),
  ) as Record<string, number>[];

  for (const item of history) {
    const first = item.data.first?.number?.[0]?.value;
    if (!first || first.length !== 6) continue;
    first.split("").forEach((digit, index) => {
      profile[index][digit] = (profile[index][digit] || 0) + 1;
    });
  }

  return profile;
}

function makeProfileCandidate(profile: Record<string, number>[], seed: number) {
  if (!profile.length) return pseudoNumber(seed, 6);
  return profile
    .map((position, index) => {
      const ranked = Object.entries(position).sort(
        (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
      );
      const pool = ranked.slice(0, 5);
      return pool[Math.floor(seeded(seed + index * 7) * pool.length)]?.[0] || "0";
    })
    .join("")
    .padStart(6, "0")
    .slice(-6);
}

function scoreNumberByProfile(number: string, profile: Record<string, number>[]) {
  return number.split("").reduce((sum, digit, index) => sum + (profile[index]?.[digit] || 0), 0);
}

function clampScore(value: number) {
  return Math.max(35, Math.min(96, Math.round(value)));
}

function pseudoNumber(seed: number, digits: number) {
  return String(Math.floor(seeded(seed) * 10 ** digits)).padStart(digits, "0");
}

function seeded(seed: number) {
  const x = Math.sin(seed * 999) * 10_000;
  return x - Math.floor(x);
}

function formatDataSource(source?: string) {
  if (source === "cache") return "ฐานข้อมูลที่เก็บไว้ในระบบ";
  if (source === "glo") return "สำนักงานสลากกินแบ่งรัฐบาล (ดึงสด)";
  return "";
}

function formatCacheTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const WEEKDAYS = [
  { id: -1, label: "ทุกวัน", desc: "รวมทุกวันออกรางวัล" },
  { id: 0, label: "วันอาทิตย์", desc: "งวดตรงกับวันอาทิตย์" },
  { id: 1, label: "วันจันทร์", desc: "งวดตรงกับวันจันทร์" },
  { id: 2, label: "วันอังคาร", desc: "งวดตรงกับวันอังคาร" },
  { id: 3, label: "วันพุธ", desc: "งวดตรงกับวันพุธ" },
  { id: 4, label: "วันพฤหัสฯ", desc: "งวดตรงกับวันพฤหัสบดี" },
  { id: 5, label: "วันศุกร์", desc: "งวดตรงกับวันศุกร์" },
  { id: 6, label: "วันเสาร์", desc: "งวดตรงกับวันเสาร์" },
];

function getDrawDayOfWeek(item: LotteryHistoryItem): number {
  if (item.isoDate && /^\d{4}-\d{2}-\d{2}$/.test(item.isoDate)) {
    const parts = item.isoDate.split("-").map((s) => Number.parseInt(s, 10));
    return new Date(parts[0], parts[1] - 1, parts[2]).getDay();
  }
  const y = Number.parseInt(item.date.year, 10);
  const m = Number.parseInt(item.date.month, 10) - 1;
  const d = Number.parseInt(item.date.date, 10);
  return new Date(y, m, d).getDay();
}

type RadarMode = "last2" | "top2" | "both";
type RadarFilterChip = "all" | "hot" | "cold" | "double" | "consecutive";

function RadarPanel({
  history,
  loading,
  onLoad,
  nextDraw,
  dataSource,
  cachedAt,
}: {
  history: LotteryHistoryItem[];
  loading: boolean;
  onLoad: () => void;
  nextDraw: LotteryDrawDate | null;
  dataSource: string;
  cachedAt: string;
}) {
  const [radarMode, setRadarMode] = useState<RadarMode>("last2");
  const [selectedWeekday, setSelectedWeekday] = useState<number>(-1);
  const [filterChip, setFilterChip] = useState<RadarFilterChip>("all");
  const [activeNumber, setActiveNumber] = useState<string>("00");

  const filteredHistory = useMemo(() => {
    if (selectedWeekday === -1) return history;
    return history.filter((item) => getDrawDayOfWeek(item) === selectedWeekday);
  }, [history, selectedWeekday]);

  const numberMatrix = useMemo(() => {
    const map: Record<
      string,
      { count: number; draws: { date: LotteryDrawDate; type: string }[] }
    > = {};
    for (let i = 0; i < 100; i += 1) {
      const num = String(i).padStart(2, "0");
      map[num] = { count: 0, draws: [] };
    }

    for (const item of filteredHistory) {
      const last2 = item.data.last2?.number?.[0]?.value;
      const top2 = item.data.first?.number?.[0]?.value?.slice(-2);

      if (radarMode === "last2" || radarMode === "both") {
        if (last2 && map[last2]) {
          map[last2].count += 1;
          map[last2].draws.push({ date: item.date, type: "เลขท้าย 2 ตัว" });
        }
      }
      if (radarMode === "top2" || radarMode === "both") {
        if (top2 && map[top2]) {
          map[top2].count += 1;
          map[top2].draws.push({ date: item.date, type: "2 ตัวบน (ท้ายรางวัลที่ 1)" });
        }
      }
    }

    return map;
  }, [filteredHistory, radarMode]);

  const maxCount = useMemo(() => {
    const counts = Object.values(numberMatrix).map((n) => n.count);
    return Math.max(...counts, 1);
  }, [numberMatrix]);

  const sortedNumbers = useMemo(() => {
    return Object.entries(numberMatrix)
      .map(([num, data]) => ({ num, count: data.count, draws: data.draws }))
      .sort((a, b) => b.count - a.count || a.num.localeCompare(b.num));
  }, [numberMatrix]);

  const hotTop10 = useMemo(() => sortedNumbers.slice(0, 10), [sortedNumbers]);
  const coldNumbers = useMemo(() => sortedNumbers.filter((n) => n.count === 0), [sortedNumbers]);

  const isDouble = (num: string) => num[0] === num[1];
  const isConsecutive = (num: string) => {
    const diff = Math.abs(Number(num[0]) - Number(num[1]));
    return diff === 1 || (num === "09" || num === "90");
  };

  const isVisibleByFilter = (num: string) => {
    if (filterChip === "all") return true;
    if (filterChip === "hot") return hotTop10.some((h) => h.num === num);
    if (filterChip === "cold") return numberMatrix[num]?.count === 0;
    if (filterChip === "double") return isDouble(num);
    if (filterChip === "consecutive") return isConsecutive(num);
    return true;
  };

  const activeData = numberMatrix[activeNumber] || { count: 0, draws: [] };

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="glass-strong rounded-3xl p-6 shadow-elegant">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-gold/20 bg-gold/5 px-3 py-1 text-[11px] uppercase tracking-wider text-gold">
              <Grid className="h-3.5 w-3.5 text-gold" />
              100-Door Heatmap Matrix
            </div>
            <h2 className="mt-2 font-display text-3xl text-foreground">
              เรดาร์ 100 ประตู (เลขท้าย 00–99)
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              แผนผังความร้อนกระจายตัวของตัวเลข 00–99 แยกวิเคราะห์ตามวันในสัปดาห์ที่ออกสลาก
              ช่วยค้นหาเลขค้างที่ยังไม่ออก (เลขดับ) และเลขมาแรงประจำวันอย่างชัดเจน
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span>ฐานข้อมูล: {filteredHistory.length} งวดที่ตรงเงื่อนไข</span>
              {nextDraw && <span>· รอผลงวด {thaiLotteryDate(nextDraw)}</span>}
              {dataSource && <span>· {dataSource}</span>}
            </div>
          </div>
          <button
            type="button"
            onClick={onLoad}
            disabled={loading}
            className="flex items-center gap-2 rounded-2xl border border-gold/30 px-5 py-3 text-sm font-semibold text-gold hover:bg-gold/10 disabled:opacity-50"
          >
            <RotateCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "กำลังโหลด..." : "รีเฟรชสถิติ"}
          </button>
        </div>

        {/* Mode & Day Filters */}
        <div className="mt-6 space-y-4 border-t border-gold/10 pt-5">
          {/* Target Mode */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-gold/80 mr-2">ตำแหน่งเลข:</span>
            <button
              type="button"
              onClick={() => setRadarMode("last2")}
              className={`rounded-full px-3.5 py-1.5 text-xs transition ${
                radarMode === "last2"
                  ? "bg-gradient-gold text-primary-foreground font-semibold shadow-gold"
                  : "border border-border text-muted-foreground hover:border-gold/30 hover:text-gold"
              }`}
            >
              เลขท้าย 2 ตัว (ล่าง)
            </button>
            <button
              type="button"
              onClick={() => setRadarMode("top2")}
              className={`rounded-full px-3.5 py-1.5 text-xs transition ${
                radarMode === "top2"
                  ? "bg-gradient-gold text-primary-foreground font-semibold shadow-gold"
                  : "border border-border text-muted-foreground hover:border-gold/30 hover:text-gold"
              }`}
            >
              2 ตัวบน (ท้ายรางวัลที่ 1)
            </button>
            <button
              type="button"
              onClick={() => setRadarMode("both")}
              className={`rounded-full px-3.5 py-1.5 text-xs transition ${
                radarMode === "both"
                  ? "bg-gradient-gold text-primary-foreground font-semibold shadow-gold"
                  : "border border-border text-muted-foreground hover:border-gold/30 hover:text-gold"
              }`}
            >
              รวมทั้ง 2 ตัวบน + ล่าง
            </button>
          </div>

          {/* Weekday Selector */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-gold/80 mr-2">วันออกรางวัล:</span>
            {WEEKDAYS.map((day) => (
              <button
                key={day.id}
                type="button"
                onClick={() => setSelectedWeekday(day.id)}
                className={`rounded-full px-3 py-1 text-xs transition ${
                  selectedWeekday === day.id
                    ? "bg-gold/25 border border-gold text-gold font-medium"
                    : "border border-border text-muted-foreground hover:border-gold/20 hover:text-foreground"
                }`}
              >
                {day.label}
              </button>
            ))}
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-gold/80 mr-2">คัดกรอง:</span>
            <button
              type="button"
              onClick={() => setFilterChip("all")}
              className={`rounded-lg px-3 py-1 text-xs transition ${
                filterChip === "all"
                  ? "bg-gold/20 text-gold font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              ทั้งหมด (100 ประตู)
            </button>
            <button
              type="button"
              onClick={() => setFilterChip("hot")}
              className={`inline-flex items-center gap-1 rounded-lg px-3 py-1 text-xs transition ${
                filterChip === "hot"
                  ? "bg-amber-500/20 text-amber-300 font-semibold border border-amber-400/40"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Flame className="h-3 w-3 text-amber-400" />
              เลขมาแรง Top 10
            </button>
            <button
              type="button"
              onClick={() => setFilterChip("cold")}
              className={`inline-flex items-center gap-1 rounded-lg px-3 py-1 text-xs transition ${
                filterChip === "cold"
                  ? "bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-400/40"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Snowflake className="h-3 w-3 text-cyan-400" />
              เลขค้าง/ยังไม่ออก ({coldNumbers.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterChip("double")}
              className={`rounded-lg px-3 py-1 text-xs transition ${
                filterChip === "double"
                  ? "bg-purple-500/20 text-purple-300 font-semibold border border-purple-400/40"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              เลขเบิ้ล (00-99)
            </button>
            <button
              type="button"
              onClick={() => setFilterChip("consecutive")}
              className={`rounded-lg px-3 py-1 text-xs transition ${
                filterChip === "consecutive"
                  ? "bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-400/40"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              เลขพี่น้อง
            </button>
          </div>
        </div>
      </div>

      {/* Heatmap Grid & Active Detail Layout */}
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Heatmap 10x10 */}
        <div className="glass-strong rounded-3xl p-6 shadow-elegant">
          <div className="mb-4 flex items-center justify-between text-xs text-muted-foreground">
            <span>คลิกที่ตัวเลขเพื่อดูรายละเอียดประวัติการออกรางวัล</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-sm bg-card/60 border border-border" /> 0 ครั้ง
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-sm bg-gold/20 border border-gold/40" /> ปานกลาง
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-sm bg-gradient-gold" /> สูงสุด
              </span>
            </div>
          </div>

          <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 sm:gap-2">
            {Array.from({ length: 100 }, (_, i) => {
              const num = String(i).padStart(2, "0");
              const data = numberMatrix[num] || { count: 0, draws: [] };
              const count = data.count;
              const intensity = maxCount > 0 ? count / maxCount : 0;
              const isSelected = activeNumber === num;
              const isVisible = isVisibleByFilter(num);

              let heatClasses = "bg-card/40 border-border/50 text-muted-foreground/40";
              if (count === 1) {
                heatClasses = "bg-gold/10 border-gold/25 text-foreground";
              } else if (count === 2) {
                heatClasses = "bg-gold/20 border-gold/40 text-gold font-semibold";
              } else if (count >= 3 && count < maxCount) {
                heatClasses =
                  "bg-amber-500/25 border-amber-400/60 text-amber-300 font-bold shadow-[0_0_10px_rgba(245,158,11,0.2)]";
              } else if (count > 0 && count === maxCount) {
                heatClasses =
                  "bg-gradient-gold text-primary-foreground font-black shadow-gold ring-1 ring-gold";
              }

              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => setActiveNumber(num)}
                  className={`group relative flex flex-col items-center justify-center rounded-xl border p-2 text-center transition-all ${heatClasses} ${
                    isSelected ? "ring-2 ring-gold scale-105 z-10" : ""
                  } ${!isVisible ? "opacity-20 scale-95" : "hover:scale-105"}`}
                >
                  <span className="font-mono text-base sm:text-lg font-bold tracking-tight">
                    {num}
                  </span>
                  <span
                    className={`text-[10px] font-mono leading-none mt-0.5 ${
                      count === maxCount && count > 0
                        ? "text-primary-foreground font-bold"
                        : count > 0
                        ? "text-gold/90"
                        : "text-muted-foreground/50"
                    }`}
                  >
                    {count}x
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Number Details & Highlights */}
        <div className="space-y-6">
          <div className="glass-strong rounded-3xl p-6 shadow-elegant border border-gold/20">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-gold/80 font-semibold">
                เจาะลึกตัวเลข
              </span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                  activeData.count === maxCount && activeData.count > 0
                    ? "bg-gold/20 text-gold border border-gold/40"
                    : activeData.count > 0
                    ? "bg-card text-foreground border border-border"
                    : "bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
                }`}
              >
                {activeData.count === 0
                  ? "เลขค้าง/ยังไม่ออก"
                  : activeData.count === maxCount
                  ? "เลขฮิตอันดับ 1"
                  : `ออกแล้ว ${activeData.count} ครั้ง`}
              </span>
            </div>

            <div className="my-5 text-center">
              <div className="font-mono text-6xl font-black text-gold tracking-wider">
                {activeNumber}
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                สถิติใน {filteredHistory.length} งวดที่ผ่านมา
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="rounded-xl border border-border bg-background/30 p-3">
                <div className="text-[10px] text-muted-foreground">ออกทั้งหมด</div>
                <div className="mt-1 font-display text-xl text-foreground">
                  {activeData.count} ครั้ง
                </div>
              </div>
              <div className="rounded-xl border border-border bg-background/30 p-3">
                <div className="text-[10px] text-muted-foreground">อัตราการออก</div>
                <div className="mt-1 font-display text-xl text-gold">
                  {filteredHistory.length > 0
                    ? ((activeData.count / filteredHistory.length) * 100).toFixed(1)
                    : "0.0"}
                  %
                </div>
              </div>
            </div>

            {/* List of past draws for activeNumber */}
            <div className="mt-5 border-t border-gold/10 pt-4">
              <div className="text-xs font-semibold text-foreground mb-3">
                งวดที่เคยออก ({activeData.draws.length}):
              </div>
              {activeData.draws.length > 0 ? (
                <div className="max-h-48 overflow-y-auto space-y-2 pr-1 text-xs">
                  {activeData.draws.map((d, index) => (
                    <div
                      key={`${lotteryDrawKey(d.date)}-${index}`}
                      className="flex items-center justify-between rounded-lg border border-border/60 bg-background/20 px-3 py-2"
                    >
                      <span className="font-medium text-foreground">
                        {thaiLotteryDate(d.date)}
                      </span>
                      <span className="text-[10px] text-gold/80">{d.type}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border/70 p-4 text-center text-xs text-muted-foreground">
                  ไม่เคยออกในชุดงวดที่เลือกนี้เลย (เป็นเลขดับในสถิติชุดนี้)
                </div>
              )}
            </div>
          </div>

          {/* Quick Top 5 Hot & Cold Box */}
          <div className="glass-strong rounded-3xl p-6 shadow-elegant space-y-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                <Flame className="h-4 w-4" />
                Top 5 เลขมาแรงสุด
              </div>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {hotTop10.slice(0, 5).map((h) => (
                  <button
                    key={h.num}
                    type="button"
                    onClick={() => setActiveNumber(h.num)}
                    className="flex items-center gap-1.5 rounded-xl border border-amber-400/40 bg-amber-400/10 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-400/20"
                  >
                    <span>{h.num}</span>
                    <span className="text-[10px] font-normal opacity-70">({h.count}x)</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-gold/10 pt-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400">
                <Snowflake className="h-4 w-4" />
                ตัวอย่างเลขค้างนาน (0 ครั้ง)
              </div>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {coldNumbers.slice(0, 6).map((c) => (
                  <button
                    key={c.num}
                    type="button"
                    onClick={() => setActiveNumber(c.num)}
                    className="rounded-xl border border-border bg-card/60 px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    {c.num}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FollowerPanel({
  history,
  loading,
  onLoad,
  nextDraw,
  dataSource,
}: {
  history: LotteryHistoryItem[];
  loading: boolean;
  onLoad: () => void;
  nextDraw: LotteryDrawDate | null;
  dataSource: string;
}) {
  const [targetMode, setTargetMode] = useState<"last2" | "top2">("last2");
  const [baseNumber, setBaseNumber] = useState<string>("");
  const [inputVal, setInputVal] = useState<string>("");

  // Sort chronological (oldest to newest)
  const chronological = useMemo(() => {
    return [...history].sort((a, b) => lotteryDrawKey(a.date).localeCompare(lotteryDrawKey(b.date)));
  }, [history]);

  // Default baseNumber to the latest draw's number if not set
  useEffect(() => {
    if (!baseNumber && history.length > 0) {
      const latest = history[0];
      const val =
        targetMode === "last2"
          ? latest.data.last2?.number?.[0]?.value
          : latest.data.first?.number?.[0]?.value?.slice(-2);
      if (val) {
        setBaseNumber(val);
        setInputVal(val);
      }
    }
  }, [history, targetMode, baseNumber]);

  // Compute follower occurrences
  const followerAnalysis = useMemo(() => {
    if (!baseNumber || chronological.length < 2) {
      return {
        occurrences: [],
        topFollowers: [],
        digitFrequency: {},
        bestDigit: null,
      };
    }

    const occurrences: {
      fromDate: LotteryDrawDate;
      toDate: LotteryDrawDate;
      nextNumber: string;
    }[] = [];
    const followerCount: Record<string, number> = {};
    const digitCount: Record<string, number> = {
      "0": 0, "1": 0, "2": 0, "3": 0, "4": 0,
      "5": 0, "6": 0, "7": 0, "8": 0, "9": 0,
    };

    for (let i = 0; i < chronological.length - 1; i += 1) {
      const current = chronological[i];
      const next = chronological[i + 1];

      const currentVal =
        targetMode === "last2"
          ? current.data.last2?.number?.[0]?.value
          : current.data.first?.number?.[0]?.value?.slice(-2);

      const nextVal =
        targetMode === "last2"
          ? next.data.last2?.number?.[0]?.value
          : next.data.first?.number?.[0]?.value?.slice(-2);

      if (currentVal === baseNumber && nextVal) {
        occurrences.push({
          fromDate: current.date,
          toDate: next.date,
          nextNumber: nextVal,
        });
        followerCount[nextVal] = (followerCount[nextVal] || 0) + 1;

        // Count individual digits
        for (const ch of nextVal) {
          if (digitCount[ch] !== undefined) {
            digitCount[ch] += 1;
          }
        }
      }
    }

    const topFollowers = Object.entries(followerCount)
      .map(([num, count]) => ({ num, count }))
      .sort((a, b) => b.count - a.count || a.num.localeCompare(b.num));

    const sortedDigits = Object.entries(digitCount).sort((a, b) => b[1] - a[1]);
    const bestDigit = sortedDigits[0]?.[1] > 0 ? sortedDigits[0] : null;

    return {
      occurrences,
      topFollowers,
      digitFrequency: digitCount,
      bestDigit,
    };
  }, [chronological, baseNumber, targetMode]);

  const handleSelectNumber = (num: string) => {
    setBaseNumber(num);
    setInputVal(num);
  };

  const handleApplyInput = () => {
    const clean = inputVal.trim().padStart(2, "0").slice(-2);
    if (/^\d{2}$/.test(clean)) {
      setBaseNumber(clean);
      setInputVal(clean);
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-strong rounded-3xl p-6 shadow-elegant">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-gold/20 bg-gold/5 px-3 py-1 text-[11px] uppercase tracking-wider text-gold">
              <TrendingUp className="h-3.5 w-3.5 text-gold" />
              Follower Pattern Analysis
            </div>
            <h2 className="mt-2 font-display text-3xl text-foreground">
              ระบบสถิติเลขตาม (Follower Matrix)
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              “เมื่อเลขงวดก่อนหน้าออก XX งวดถัดไปมักจะออกเลขอะไร?”
              คำนวณจากประวัติศาสตร์ผลสลากจริงต่อเนื่องทุกงวด ย้อนรอยความสัมพันธ์ของตัวเลข
            </p>
          </div>
          <button
            type="button"
            onClick={onLoad}
            disabled={loading}
            className="flex items-center gap-2 rounded-2xl border border-gold/30 px-5 py-3 text-sm font-semibold text-gold hover:bg-gold/10 disabled:opacity-50"
          >
            <RotateCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "กำลังโหลด..." : "โหลดสถิติ"}
          </button>
        </div>

        {/* Input & Mode Selector */}
        <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-gold/10 pt-5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gold/80">ตำแหน่ง:</span>
            <button
              type="button"
              onClick={() => setTargetMode("last2")}
              className={`rounded-full px-3.5 py-1.5 text-xs transition ${
                targetMode === "last2"
                  ? "bg-gradient-gold text-primary-foreground font-semibold shadow-gold"
                  : "border border-border text-muted-foreground hover:border-gold/30 hover:text-gold"
              }`}
            >
              เลขท้าย 2 ตัว (ล่าง)
            </button>
            <button
              type="button"
              onClick={() => setTargetMode("top2")}
              className={`rounded-full px-3.5 py-1.5 text-xs transition ${
                targetMode === "top2"
                  ? "bg-gradient-gold text-primary-foreground font-semibold shadow-gold"
                  : "border border-border text-muted-foreground hover:border-gold/30 hover:text-gold"
              }`}
            >
              2 ตัวบน (ท้ายรางวัลที่ 1)
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gold/80">ตรวจเลขตั้งต้น:</span>
            <input
              type="text"
              maxLength={2}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value.replace(/\D/g, ""))}
              onKeyDown={(e) => e.key === "Enter" && handleApplyInput()}
              placeholder="00-99"
              className="w-20 rounded-xl border border-gold/30 bg-background/40 px-3 py-1.5 font-mono text-center text-lg font-bold text-gold focus:border-gold focus:outline-none"
            />
            <button
              type="button"
              onClick={handleApplyInput}
              className="rounded-xl bg-gold/20 px-4 py-2 text-xs font-semibold text-gold hover:bg-gold/30 transition"
            >
              ค้นหาเลขตาม
            </button>
          </div>
        </div>

        {/* Quick Recent Numbers */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-muted-foreground">เลขจากงวดล่าสุด:</span>
          {history.slice(0, 6).map((item) => {
            const num =
              targetMode === "last2"
                ? item.data.last2?.number?.[0]?.value
                : item.data.first?.number?.[0]?.value?.slice(-2);
            if (!num) return null;
            return (
              <button
                key={lotteryDrawKey(item.date)}
                type="button"
                onClick={() => handleSelectNumber(num)}
                className={`rounded-lg px-2.5 py-1 font-mono transition ${
                  baseNumber === num
                    ? "bg-gold text-background font-bold"
                    : "border border-border bg-card/40 text-muted-foreground hover:border-gold/30 hover:text-foreground"
                }`}
              >
                {num}
              </button>
            );
          })}
        </div>
      </div>

      {/* Analysis Results */}
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        {/* Summary Card */}
        <div className="space-y-6">
          <div className="glass-strong rounded-3xl p-6 shadow-elegant border border-gold/20">
            <div className="text-xs uppercase tracking-wider text-gold/80 font-semibold">
              บทสรุปเลขตามงวดถัดไป
            </div>
            <div className="my-5 text-center">
              <div className="text-xs text-muted-foreground mb-1">
                เมื่องวดก่อนหน้าออกเลข
              </div>
              <div className="font-mono text-5xl font-black text-gold tracking-widest">
                {baseNumber}
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                เคยเกิดขึ้นทั้งหมด {followerAnalysis.occurrences.length} ครั้ง ในรอบ 5 ปี
              </div>
            </div>

            {followerAnalysis.occurrences.length > 0 ? (
              <div className="space-y-4 border-t border-gold/10 pt-4">
                {followerAnalysis.bestDigit && (
                  <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-center">
                    <div className="text-[11px] text-amber-300 uppercase tracking-wider font-semibold">
                      เลขวิ่ง/รูด ที่ตามมาบ่อยสุด
                    </div>
                    <div className="mt-1 font-mono text-3xl font-black text-amber-400">
                      เลข {followerAnalysis.bestDigit[0]}
                    </div>
                    <div className="mt-1 text-[11px] text-amber-200/80">
                      ปรากฏในหลักสิบหรือหน่วย {followerAnalysis.bestDigit[1]} ครั้ง
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-xs font-semibold text-foreground mb-2">
                    Top เลขตามที่ออกซ้ำ:
                  </div>
                  <div className="space-y-2">
                    {followerAnalysis.topFollowers.slice(0, 5).map((tf, index) => (
                      <div
                        key={tf.num}
                        className="flex items-center justify-between rounded-xl border border-border bg-background/30 p-2.5 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold/20 font-mono text-[10px] font-bold text-gold">
                            {index + 1}
                          </span>
                          <span className="font-mono text-base font-bold text-gold">
                            {tf.num}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold text-foreground">
                            {tf.count} ครั้ง
                          </span>
                          <span className="text-muted-foreground ml-1.5">
                            (
                            {(
                              (tf.count / followerAnalysis.occurrences.length) *
                              100
                            ).toFixed(0)}
                            %)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border/70 p-6 text-center text-xs text-muted-foreground leading-relaxed">
                เลข <span className="font-bold text-gold">{baseNumber}</span>{" "}
                ยังไม่เคยออกในชุดงวดที่มีประวัติในระบบนี้
                ลองเลือกเลขอื่นที่มีประวัติการออกรางวัล เช่น เลขจากงวดล่าสุดด้านบน
              </div>
            )}
          </div>
        </div>

        {/* Timeline Log */}
        <div className="glass-strong rounded-3xl p-6 shadow-elegant">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-2xl text-foreground">
              ไทม์ไลน์ประวัติศาสตร์เลขตาม ({followerAnalysis.occurrences.length} งวด)
            </h3>
            <span className="text-xs text-muted-foreground">เรียงตามลำดับเวลา</span>
          </div>

          {followerAnalysis.occurrences.length > 0 ? (
            <div className="mt-5 divide-y divide-gold/10">
              {followerAnalysis.occurrences.map((occ, idx) => (
                <div
                  key={`${lotteryDrawKey(occ.fromDate)}-${idx}`}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm hover:bg-gold/5 rounded-xl px-2 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-xs text-muted-foreground">
                      งวด {thaiLotteryDate(occ.fromDate)}
                    </div>
                    <span className="font-mono text-lg font-bold text-foreground bg-card px-2.5 py-0.5 rounded-lg border border-border">
                      {baseNumber}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-gold">
                    <ArrowRight className="h-4 w-4" />
                    <span className="text-xs text-muted-foreground">งวดถัดไป</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-xs text-muted-foreground">
                      งวด {thaiLotteryDate(occ.toDate)}
                    </div>
                    <span className="font-mono text-xl font-black text-gold bg-gold/15 px-3 py-1 rounded-xl border border-gold/40 shadow-sm">
                      {occ.nextNumber}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-dashed border-border/70 p-10 text-center text-xs text-muted-foreground">
              ไม่มีประวัติเลขตามสำหรับเลขนี้ในฐานข้อมูลปัจจุบัน
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
