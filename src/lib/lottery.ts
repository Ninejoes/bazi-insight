export type LotteryPrizeKey =
  | "first"
  | "near1"
  | "second"
  | "third"
  | "fourth"
  | "fifth"
  | "last3f"
  | "last3b"
  | "last2";

export type LotteryNumber = { value: string };

export type LotteryResultData = Partial<Record<LotteryPrizeKey, { number?: LotteryNumber[] }>>;

export type LotteryHistoryItem = {
  date: LotteryDrawDate;
  isoDate?: string;
  data: LotteryResultData;
  pdfUrl?: string | null;
  youtubeUrl?: string | null;
};

export type LotteryDrawDate = {
  date: string;
  month: string;
  year: string;
};

export type LotteryCache = {
  generatedAt: string;
  source: string;
  sourceUrl: string;
  latestDate: LotteryDrawDate;
  latestIsoDate: string;
  history: LotteryHistoryItem[];
};

export type LotteryFrequencyMode = "last2" | "last3b" | "last3f" | "first";

export type LotteryFrequencyMap = Record<LotteryFrequencyMode, Record<string, number>>;

export const lotteryPrizes: {
  key: LotteryPrizeKey;
  label: string;
  amount: string;
  combinations: number;
  winners: number;
  color: string;
}[] = [
  {
    key: "first",
    label: "รางวัลที่ 1",
    amount: "6,000,000",
    combinations: 1_000_000,
    winners: 1,
    color: "#f6c762",
  },
  {
    key: "near1",
    label: "ใกล้เคียงที่ 1",
    amount: "100,000",
    combinations: 1_000_000,
    winners: 2,
    color: "#d7b56c",
  },
  {
    key: "second",
    label: "รางวัลที่ 2",
    amount: "200,000",
    combinations: 1_000_000,
    winners: 5,
    color: "#b4c08d",
  },
  {
    key: "third",
    label: "รางวัลที่ 3",
    amount: "80,000",
    combinations: 1_000_000,
    winners: 10,
    color: "#8ec7c7",
  },
  {
    key: "fourth",
    label: "รางวัลที่ 4",
    amount: "40,000",
    combinations: 1_000_000,
    winners: 50,
    color: "#80a9c9",
  },
  {
    key: "fifth",
    label: "รางวัลที่ 5",
    amount: "20,000",
    combinations: 1_000_000,
    winners: 100,
    color: "#79b6c7",
  },
  {
    key: "last3f",
    label: "เลขหน้า 3 ตัว",
    amount: "4,000",
    combinations: 1_000,
    winners: 2,
    color: "#d4aa55",
  },
  {
    key: "last3b",
    label: "เลขท้าย 3 ตัว",
    amount: "4,000",
    combinations: 1_000,
    winners: 2,
    color: "#d4aa55",
  },
  {
    key: "last2",
    label: "เลขท้าย 2 ตัว",
    amount: "2,000",
    combinations: 100,
    winners: 1,
    color: "#a7c873",
  },
];

export const lotteryPrizeRows: {
  key: LotteryPrizeKey;
  label: string;
  sub: string;
  emphasis?: "first" | "near";
}[] = [
  { key: "first", label: "รางวัลที่ 1", sub: "6,000,000 บาท", emphasis: "first" },
  { key: "near1", label: "ใกล้เคียงที่ 1", sub: "100,000 บาท", emphasis: "near" },
  { key: "second", label: "รางวัลที่ 2", sub: "200,000 บาท" },
  { key: "third", label: "รางวัลที่ 3", sub: "80,000 บาท" },
  { key: "fourth", label: "รางวัลที่ 4", sub: "40,000 บาท" },
  { key: "fifth", label: "รางวัลที่ 5", sub: "20,000 บาท" },
  { key: "last3f", label: "เลขหน้า 3 ตัว", sub: "4,000 บาท" },
  { key: "last3b", label: "เลขท้าย 3 ตัว", sub: "4,000 บาท" },
  { key: "last2", label: "เลขท้าย 2 ตัว", sub: "2,000 บาท" },
];

export const thaiMonths = [
  "",
  "ม.ค.",
  "ก.พ.",
  "มี.ค.",
  "เม.ย.",
  "พ.ค.",
  "มิ.ย.",
  "ก.ค.",
  "ส.ค.",
  "ก.ย.",
  "ต.ค.",
  "พ.ย.",
  "ธ.ค.",
];

export function thaiLotteryDate(date: LotteryDrawDate) {
  return `${Number.parseInt(date.date, 10)} ${thaiMonths[Number.parseInt(date.month, 10)]} ${Number.parseInt(date.year, 10) + 543}`;
}

export function lotteryDrawKey(date: LotteryDrawDate) {
  return `${date.year}-${date.month}-${date.date}`;
}

export function lotteryIsoDateToDraw(value: string): LotteryDrawDate | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, date] = value.split("-");
  return { date, month, year };
}

export function compareLotteryDrawDesc(a: LotteryHistoryItem, b: LotteryHistoryItem) {
  return lotteryDrawKey(b.date).localeCompare(lotteryDrawKey(a.date));
}

export function getCachedLotteryHistory(cache: LotteryCache, limit = 24) {
  return [...cache.history].sort(compareLotteryDrawDesc).slice(0, limit);
}

export function findCachedLotteryDraw(cache: LotteryCache, date: LotteryDrawDate) {
  const key = lotteryDrawKey(date);
  return cache.history.find((item) => lotteryDrawKey(item.date) === key) || null;
}

export function getLatestCachedLotteryDraw(cache: LotteryCache) {
  return (
    findCachedLotteryDraw(cache, cache.latestDate) || getCachedLotteryHistory(cache, 1)[0] || null
  );
}

export function getNextLotteryDrawDate(from: LotteryDrawDate | Date = new Date()): LotteryDrawDate {
  const cursor =
    from instanceof Date
      ? new Date(from)
      : new Date(
          Number.parseInt(from.year, 10),
          Number.parseInt(from.month, 10) - 1,
          Number.parseInt(from.date, 10),
          12,
        );
  cursor.setHours(12, 0, 0, 0);
  if (cursor.getDate() < 16) {
    cursor.setDate(16);
  } else {
    cursor.setMonth(cursor.getMonth() + 1);
    cursor.setDate(1);
  }
  return {
    date: String(cursor.getDate()).padStart(2, "0"),
    month: String(cursor.getMonth() + 1).padStart(2, "0"),
    year: String(cursor.getFullYear()),
  };
}

export function getRecentLotteryDraws(limit = 12, from = new Date()) {
  const draws: LotteryDrawDate[] = [];
  const cursor = new Date(from);
  cursor.setHours(12, 0, 0, 0);

  if (cursor.getDate() >= 16) {
    cursor.setDate(16);
  } else {
    cursor.setDate(1);
  }

  for (let i = 0; i < limit; i += 1) {
    draws.push({
      date: String(cursor.getDate()).padStart(2, "0"),
      month: String(cursor.getMonth() + 1).padStart(2, "0"),
      year: String(cursor.getFullYear()),
    });

    if (cursor.getDate() === 16) {
      cursor.setDate(1);
    } else {
      cursor.setMonth(cursor.getMonth() - 1);
      cursor.setDate(16);
    }
  }

  return draws;
}

export function buildLotteryFrequency(history: LotteryHistoryItem[]): LotteryFrequencyMap {
  const freq: LotteryFrequencyMap = { last2: {}, last3b: {}, last3f: {}, first: {} };
  for (const { data } of history) {
    for (const key of Object.keys(freq) as LotteryFrequencyMode[]) {
      const numbers = data[key]?.number?.map((item) => item.value).filter(Boolean) || [];
      for (const number of numbers) {
        freq[key][number] = (freq[key][number] || 0) + 1;
      }
    }
  }
  return freq;
}

export function normalizeLotteryData(raw: unknown): LotteryResultData {
  if (!raw || typeof raw !== "object") return {};
  const source = raw as Record<string, { number?: { value?: unknown }[] }>;
  const output: LotteryResultData = {};
  for (const prize of lotteryPrizeRows) {
    const numbers = source[prize.key]?.number
      ?.map((item) => String(item.value || "").trim())
      .filter(Boolean)
      .map((value) => ({ value }));
    if (numbers?.length) output[prize.key] = { number: numbers };
  }
  return output;
}

export function hasLotteryData(data: LotteryResultData) {
  return lotteryPrizeRows.some((row) => (data[row.key]?.number?.length || 0) > 0);
}
