import { createFileRoute } from "@tanstack/react-router";
import {
  buildLotteryFrequency,
  getRecentLotteryDraws,
  hasLotteryData,
  normalizeLotteryData,
  type LotteryDrawDate,
  type LotteryHistoryItem,
} from "@/lib/lottery";
import { json } from "@/lib/supabase-rest";

const GLO_ENDPOINT = "https://www.glo.or.th/api/checking/getLotteryResult";

function cleanDrawDate(input: Partial<LotteryDrawDate>): LotteryDrawDate {
  const now = new Date();
  const date = input.date === "16" ? "16" : "01";
  const monthNumber = Number.parseInt(String(input.month || now.getMonth() + 1), 10);
  const yearNumber = Number.parseInt(String(input.year || now.getFullYear()), 10);

  return {
    date,
    month: String(Number.isFinite(monthNumber) ? Math.min(12, Math.max(1, monthNumber)) : now.getMonth() + 1).padStart(2, "0"),
    year: String(Number.isFinite(yearNumber) ? Math.min(2099, Math.max(2020, yearNumber)) : now.getFullYear()),
  };
}

async function fetchLotteryResult(draw: LotteryDrawDate) {
  const response = await fetch(GLO_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "User-Agent": "Likhitfa/1.0",
    },
    body: JSON.stringify(draw),
  });

  if (!response.ok) {
    throw new Error(`GLO API returned ${response.status}`);
  }

  const payload = await response.json().catch(() => null);
  const data = normalizeLotteryData(payload?.response?.result?.data);
  if (!hasLotteryData(data)) {
    throw new Error("ไม่พบข้อมูลงวดนี้จาก GLO");
  }
  return data;
}

async function fetchHistory(limit: number) {
  const draws = getRecentLotteryDraws(limit);
  const settled = await Promise.allSettled(
    draws.map(async (date) => ({ date, data: await fetchLotteryResult(date) })),
  );
  return settled
    .filter((item): item is PromiseFulfilledResult<LotteryHistoryItem> => item.status === "fulfilled")
    .map((item) => item.value);
}

export const Route = createFileRoute("/api/lottery")({
  server: {
    handlers: {
      OPTIONS: async () => json(null, { status: 204 }),
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const mode = url.searchParams.get("mode") || "result";

          if (mode === "history") {
            const limit = Math.min(
              36,
              Math.max(1, Number.parseInt(url.searchParams.get("limit") || "12", 10) || 12),
            );
            const history = await fetchHistory(limit);
            return json({
              ok: true,
              source: "glo",
              history,
              frequency: buildLotteryFrequency(history),
            });
          }

          const date = cleanDrawDate({
            date: url.searchParams.get("date") || undefined,
            month: url.searchParams.get("month") || undefined,
            year: url.searchParams.get("year") || undefined,
          });
          const data = await fetchLotteryResult(date);
          return json({ ok: true, source: "glo", date, data });
        } catch (error) {
          return json(
            {
              ok: false,
              error: error instanceof Error ? error.message : "โหลดข้อมูลสลากไม่สำเร็จ",
            },
            { status: 502 },
          );
        }
      },
    },
  },
});
