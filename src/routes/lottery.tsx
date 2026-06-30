import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  buildLotteryFrequency,
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

type LotteryTab = "result" | "stats" | "probability" | "predict";
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
  { id: "stats", label: "สถิติ", sub: "เลขที่ออกบ่อยย้อนหลัง" },
  { id: "probability", label: "ความน่าจะเป็น", sub: "โอกาสถูกรางวัลจริง" },
  { id: "predict", label: "ทำนาย", sub: "สุ่มเลขจากสถิติ" },
];

const freqLabels: Record<LotteryFrequencyMode, string> = {
  last2: "เลขท้าย 2 ตัว",
  last3b: "เลขท้าย 3 ตัว",
  last3f: "เลขหน้า 3 ตัว",
  first: "รางวัลที่ 1",
};

const LOTTERY_HISTORY_LIMIT = 120;

export const Route = createFileRoute("/lottery")({
  head: () =>
    seo({
      title: "เลขเด็ด ผลสลาก สถิติหวย และความน่าจะเป็น",
      description:
        "ตรวจผลรางวัลสลากกินแบ่งรัฐบาล ดูสถิติเลขที่ออกบ่อย ความน่าจะเป็น และสุ่มเลขเด็ดจากข้อมูลย้อนหลัง",
      path: "/lottery",
      keywords: ["เลขเด็ด", "ผลสลาก", "ตรวจหวย", "สถิติหวย", "ความน่าจะเป็นหวย"],
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
    () => makePredictions(effectiveFrequency, seed),
    [effectiveFrequency, seed],
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

        <section className="mt-8 grid gap-3 md:grid-cols-4">
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
          {activeTab === "probability" && (
            <ProbabilityPanel selectedPrize={selectedPrize} setSelectedPrize={setSelectedPrize} />
          )}
          {activeTab === "predict" && (
            <PredictPanel
              predictions={predictions}
              hasStats={Boolean(effectiveFrequency)}
              historyCount={history.length}
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
}: {
  selectedPrize: number;
  setSelectedPrize: (index: number) => void;
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
  nextDraw,
  loading,
  onRandom,
  onLoadStats,
}: {
  predictions: { first: string; last3: string; last2: string }[];
  hasStats: boolean;
  historyCount: number;
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
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {predictions.map((item, index) => (
          <div
            key={`${item.first}-${index}`}
            className={`rounded-3xl border p-5 text-center ${
              index === 0
                ? "border-gold/50 bg-gradient-gold-soft shadow-gold"
                : "border-border bg-card/40"
            }`}
          >
            <div className="text-[10px] uppercase tracking-wider text-gold/80">
              {index === 0 ? "แนะนำ" : `ชุด ${index + 1}`}
            </div>
            <div className="mt-3 font-mono text-3xl font-semibold tracking-[0.15em] text-foreground">
              {item.first}
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              ท้าย 3: <span className="font-mono text-gold">{item.last3}</span> · ท้าย 2:{" "}
              <span className="font-mono text-gold">{item.last2}</span>
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

function makePredictions(frequency: LotteryFrequencyMap | null, seed: number) {
  const hotLast2 = rankedNumbers(frequency?.last2, 2);
  const hotLast3 = rankedNumbers(frequency?.last3b, 3);
  const hotFirst = rankedNumbers(frequency?.first, 6);
  return Array.from({ length: 5 }, (_, index) => ({
    first: blendCandidate(hotFirst, frequency?.first, 6, seed + index * 17),
    last3: blendCandidate(hotLast3, frequency?.last3b, 3, seed + index * 23),
    last2: blendCandidate(hotLast2, frequency?.last2, 2, seed + index * 31),
  }));
}

function rankedNumbers(freqMap: Record<string, number> | undefined, digits: number) {
  if (!freqMap) return [];
  return Object.entries(freqMap)
    .filter(([number]) => number.length === digits)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([number]) => number);
}

function blendCandidate(
  hotNumbers: string[],
  freqMap: Record<string, number> | undefined,
  digits: number,
  seed: number,
) {
  if (!hotNumbers.length) return weightedPick(freqMap, digits, seed);
  const main = hotNumbers[Math.abs(seed) % Math.min(hotNumbers.length, 12)];
  const companion = weightedPick(freqMap, digits, seed * 3 + 7);
  if (digits === 2) return main;
  if (digits === 3) return `${main.slice(0, 1)}${companion.slice(-2)}`.padStart(3, "0").slice(-3);
  return `${main.slice(0, 3)}${companion.slice(-3)}`.padStart(6, "0").slice(-6);
}

function weightedPick(freqMap: Record<string, number> | undefined, digits: number, seed: number) {
  if (!freqMap || !Object.keys(freqMap).length) {
    return pseudoNumber(seed, digits);
  }
  const entries = Object.entries(freqMap);
  const total = entries.reduce((sum, [, count]) => sum + count, 0);
  let cursor = (seeded(seed) * total) % total;
  for (const [number, count] of entries) {
    cursor -= count;
    if (cursor <= 0) return number;
  }
  return entries[0][0];
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
