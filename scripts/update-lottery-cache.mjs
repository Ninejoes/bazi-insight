import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, "..");

const GLO_LATEST_ENDPOINT = "https://www.glo.or.th/api/lottery/getLatestLottery";
const GLO_RESULT_ENDPOINT = "https://www.glo.or.th/api/checking/getLotteryResult";
const PRIZE_KEYS = [
  "first",
  "near1",
  "second",
  "third",
  "fourth",
  "fifth",
  "last3f",
  "last3b",
  "last2",
];

function normalizeLotteryData(raw = {}) {
  if (!raw || typeof raw !== "object") return {};
  const output = {};
  for (const key of PRIZE_KEYS) {
    const numberRows = raw[key]?.number || raw[key]?.numbers || raw[key] || [];
    const values = (Array.isArray(numberRows) ? numberRows : [numberRows])
      .map((item) => {
        if (typeof item === "string" || typeof item === "number") return String(item).trim();
        return String(item?.value || item?.number || item?.lotteryNumber || "").trim();
      })
      .filter(Boolean)
      .map((value) => ({ value }));
    if (values.length) output[key] = { number: values };
  }
  return output;
}

function hasLotteryData(data = {}) {
  return PRIZE_KEYS.some((key) => (data[key]?.number || []).length > 0);
}

function extractLotteryResult(payload = {}) {
  return (
    payload?.response?.result ||
    payload?.data?.result ||
    payload?.result ||
    payload?.response ||
    payload?.data ||
    payload
  );
}

function extractLotteryData(payload = {}) {
  const result = extractLotteryResult(payload);
  return result?.data || result?.lotteryResult || result;
}

function drawFromIsoDate(value) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, date] = value.split("-");
  return { date, month, year };
}

function drawKey(draw) {
  return `${draw.year}-${draw.month}-${draw.date}`;
}

function getRecentLotteryDraws(limit = 120, from = new Date()) {
  const draws = [];
  const cursor = new Date(from);
  cursor.setHours(12, 0, 0, 0);
  cursor.setDate(cursor.getDate() >= 16 ? 16 : 1);

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

async function postGlo(endpoint, body = {}) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "User-Agent": "Likhitfa/1.0",
    },
    body: JSON.stringify(body),
  });
  const text = await response.text();
  let payload = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = { raw: text };
  }
  if (!response.ok) {
    throw new Error(`GLO API returned ${response.status}: ${text.slice(0, 160)}`);
  }
  return payload;
}

async function fetchLatestDraw() {
  const payload = await postGlo(GLO_LATEST_ENDPOINT, {});
  const result = extractLotteryResult(payload);
  const date = drawFromIsoDate(result?.date);
  const data = normalizeLotteryData(extractLotteryData(payload));
  if (!date || !hasLotteryData(data)) throw new Error("Latest lottery payload is incomplete");
  return {
    date,
    isoDate: result.date,
    data,
    pdfUrl: result.pdf_url || null,
    youtubeUrl: result.youtube_url || null,
  };
}

async function fetchDraw(draw) {
  const payload = await postGlo(GLO_RESULT_ENDPOINT, draw);
  const result = extractLotteryResult(payload);
  const data = normalizeLotteryData(extractLotteryData(payload));
  if (!hasLotteryData(data)) throw new Error(`No lottery data for ${drawKey(draw)}`);
  return {
    date: drawFromIsoDate(result?.date) || draw,
    isoDate: result?.date || drawKey(draw),
    data,
    pdfUrl: result?.pdf_url || null,
    youtubeUrl: result?.youtube_url || null,
  };
}

async function main() {
  const limit = Number.parseInt(process.argv[2] || "120", 10) || 120;
  const latest = await fetchLatestDraw();
  const draws = getRecentLotteryDraws(limit, new Date(`${latest.isoDate}T12:00:00+07:00`));
  const history = [];
  const seen = new Set();

  for (const draw of draws) {
    try {
      const item = drawKey(draw) === drawKey(latest.date) ? latest : await fetchDraw(draw);
      const key = drawKey(item.date);
      if (!seen.has(key)) {
        seen.add(key);
        history.push(item);
      }
      process.stdout.write(".");
    } catch (error) {
      process.stdout.write("x");
      console.warn(`\nSkipped ${drawKey(draw)}: ${error.message}`);
    }
  }
  process.stdout.write("\n");

  const cache = {
    generatedAt: new Date().toISOString(),
    source: "Government Lottery Office (GLO)",
    sourceUrl: "https://www.glo.or.th/",
    latestDate: latest.date,
    latestIsoDate: latest.isoDate,
    history,
  };

  const pretty = JSON.stringify(cache, null, 2);
  const tsFile = resolve(rootDir, "src/data/lottery-cache.ts");
  const apiFile = resolve(rootDir, "api/lottery-cache.js");
  await mkdir(dirname(tsFile), { recursive: true });
  await writeFile(
    tsFile,
    `/* eslint-disable prettier/prettier */\nimport type { LotteryCache } from "@/lib/lottery";\n\nexport const lotteryCache = ${pretty} satisfies LotteryCache;\n`,
  );
  await writeFile(
    apiFile,
    `/* eslint-disable prettier/prettier */\nexport const lotteryCache = ${pretty};\n\nexport default lotteryCache;\n`,
  );
  console.log(`Wrote ${history.length} lottery draws to cache.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
