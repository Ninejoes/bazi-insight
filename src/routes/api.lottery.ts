import { createFileRoute } from "@tanstack/react-router";
import {
  buildLotteryFrequency,
  findCachedLotteryDraw,
  getCachedLotteryHistory,
  getLatestCachedLotteryDraw,
  getNextLotteryDrawDate,
  getRecentLotteryDraws,
  hasLotteryData,
  normalizeLotteryData,
  type LotteryDrawDate,
  type LotteryHistoryItem,
} from "@/lib/lottery";
import { lotteryCache } from "@/data/lottery-cache";
import { json } from "@/lib/supabase-rest";
import { friendlyErrorMessage } from "@/lib/friendly-error";

const GLO_ENDPOINT = "https://www.glo.or.th/api/checking/getLotteryResult";
const GLO_LATEST_ENDPOINT = "https://www.glo.or.th/api/lottery/getLatestLottery";

function cleanDrawDate(input: Partial<LotteryDrawDate>): LotteryDrawDate {
  const now = new Date();
  const date = input.date === "16" ? "16" : "01";
  const monthNumber = Number.parseInt(String(input.month || now.getMonth() + 1), 10);
  const yearNumber = Number.parseInt(String(input.year || now.getFullYear()), 10);

  return {
    date,
    month: String(
      Number.isFinite(monthNumber) ? Math.min(12, Math.max(1, monthNumber)) : now.getMonth() + 1,
    ).padStart(2, "0"),
    year: String(
      Number.isFinite(yearNumber) ? Math.min(2099, Math.max(2020, yearNumber)) : now.getFullYear(),
    ),
  };
}

async function fetchLotteryResult(draw: LotteryDrawDate) {
  const response = await postGlo(GLO_ENDPOINT, draw);
  const payload = await response.json().catch(() => null);
  const data = normalizeLotteryData(payload?.response?.result?.data);
  if (!hasLotteryData(data)) {
    throw new Error("ไม่พบข้อมูลงวดนี้จาก GLO");
  }
  return data;
}

async function fetchLatestLotteryResult() {
  const response = await postGlo(GLO_LATEST_ENDPOINT, {});
  const payload = await response.json().catch(() => null);
  const data = normalizeLotteryData(
    payload?.response?.result?.data ||
      payload?.response?.result?.lotteryResult ||
      payload?.response?.result ||
      payload?.data?.result?.data ||
      payload?.data?.result ||
      payload?.result?.data ||
      payload?.result ||
      payload?.data,
  );
  if (!hasLotteryData(data)) {
    throw new Error("ไม่พบผลรางวัลงวดล่าสุดจาก GLO");
  }
  return data;
}

async function postGlo(endpoint: string, body: unknown) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "User-Agent": "Likhitfa/1.0",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`GLO API returned ${response.status}`);
  }
  return response;
}

async function fetchHistory(limit: number) {
  const draws = getRecentLotteryDraws(limit);
  const settled = await Promise.allSettled(
    draws.map(async (date) => ({ date, data: await fetchLotteryResult(date) })),
  );
  return settled
    .filter(
      (item): item is PromiseFulfilledResult<LotteryHistoryItem> => item.status === "fulfilled",
    )
    .map((item) => item.value);
}

function cachedHistoryPayload(limit: number) {
  const history = getCachedLotteryHistory(lotteryCache, limit);
  return {
    ok: true,
    source: "cache",
    cachedAt: lotteryCache.generatedAt,
    latestDate: lotteryCache.latestDate,
    latestIsoDate: lotteryCache.latestIsoDate,
    nextDraw: getNextLotteryDrawDate(lotteryCache.latestDate),
    history,
    frequency: buildLotteryFrequency(history),
  };
}

export const Route = createFileRoute("/api/lottery")({
  server: {
    handlers: {
      OPTIONS: async () => json(null, { status: 204 }),
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const mode = url.searchParams.get("mode") || "result";
          const forceLive = url.searchParams.get("live") === "1";

          if (mode === "latest") {
            if (!forceLive) {
              const latest = getLatestCachedLotteryDraw(lotteryCache);
              if (latest) {
                return json({
                  ok: true,
                  source: "cache",
                  cachedAt: lotteryCache.generatedAt,
                  mode: "latest",
                  date: latest.date,
                  latestDate: lotteryCache.latestDate,
                  latestIsoDate: lotteryCache.latestIsoDate,
                  nextDraw: getNextLotteryDrawDate(lotteryCache.latestDate),
                  data: latest.data,
                  pdfUrl: latest.pdfUrl,
                  youtubeUrl: latest.youtubeUrl,
                });
              }
            }
            const data = await fetchLatestLotteryResult();
            return json({ ok: true, source: "glo", mode: "latest", data });
          }

          if (mode === "history") {
            const limit = Math.min(
              36,
              Math.max(1, Number.parseInt(url.searchParams.get("limit") || "12", 10) || 12),
            );
            if (!forceLive && lotteryCache.history.length) {
              return json(cachedHistoryPayload(limit));
            }
            const history = await fetchHistory(limit);
            return json({
              ok: true,
              source: "glo",
              nextDraw: getNextLotteryDrawDate(history[0]?.date || new Date()),
              history,
              frequency: buildLotteryFrequency(history),
            });
          }

          const date = cleanDrawDate({
            date: url.searchParams.get("date") || undefined,
            month: url.searchParams.get("month") || undefined,
            year: url.searchParams.get("year") || undefined,
          });
          if (!forceLive) {
            const cached = findCachedLotteryDraw(lotteryCache, date);
            if (cached) {
              return json({
                ok: true,
                source: "cache",
                cachedAt: lotteryCache.generatedAt,
                mode: "result",
                date: cached.date,
                nextDraw: getNextLotteryDrawDate(lotteryCache.latestDate),
                data: cached.data,
                pdfUrl: cached.pdfUrl,
                youtubeUrl: cached.youtubeUrl,
              });
            }
          }
          const data = await fetchLotteryResult(date);
          return json({ ok: true, source: "glo", date, data });
        } catch (error) {
          return json(
            {
              ok: false,
              error: friendlyErrorMessage(error, "โหลดข้อมูลสลากไม่สำเร็จ"),
            },
            { status: 502 },
          );
        }
      },
    },
  },
});
