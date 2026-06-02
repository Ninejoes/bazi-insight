import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const dataDir = join(root, "data");
const leadsFile = join(dataDir, "leads.json");
const port = Number(process.env.PORT || 4173);

const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
};

async function readJson(file, fallback) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch {
    return fallback;
  }
}

async function saveLead(payload) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (supabaseUrl && supabaseKey) {
    const clean = {
      id: String(payload.id || randomUUID()).slice(0, 80),
      name: String(payload.name || "").slice(0, 120),
      gender: String(payload.gender || "").slice(0, 40),
      birth_date: String(payload.birthDate || "").slice(0, 30),
      birth_time: String(payload.birthTime || "").slice(0, 20),
      source: String(payload.source || "bazi-insight").slice(0, 80),
      reason: String(payload.reason || "submit").slice(0, 80),
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };
    const response = await fetch(`${supabaseUrl.replace(/\/$/, "")}/rest/v1/leads?on_conflict=id`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify(clean),
    });
    if (!response.ok) throw new Error(await response.text());
    return clean;
  }

  await mkdir(dataDir, { recursive: true });
  const leads = await readJson(leadsFile, []);
  const now = new Date().toISOString();
  const clean = {
    id: String(payload.id || randomUUID()),
    name: String(payload.name || "").slice(0, 120),
    gender: String(payload.gender || "").slice(0, 40),
    birthDate: String(payload.birthDate || "").slice(0, 30),
    birthTime: String(payload.birthTime || "").slice(0, 20),
    source: String(payload.source || "promo").slice(0, 80),
    reason: String(payload.reason || "submit").slice(0, 80),
    createdAt: payload.createdAt || now,
    updatedAt: now,
  };

  const index = leads.findIndex((lead) => lead.id === clean.id);
  if (index >= 0) {
    leads[index] = { ...leads[index], ...clean, createdAt: leads[index].createdAt || clean.createdAt };
  } else {
    leads.push(clean);
  }
  await writeFile(leadsFile, JSON.stringify(leads, null, 2));
  return clean;
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

function send(res, status, body, type = "application/json; charset=utf-8") {
  res.writeHead(status, { "Content-Type": type, "Cache-Control": "no-store" });
  res.end(body);
}

createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (url.pathname === "/api/leads" && req.method === "POST") {
      const body = JSON.parse(await readBody(req) || "{}");
      const lead = await saveLead(body);
      send(res, 200, JSON.stringify({ ok: true, lead }));
      return;
    }

    if (url.pathname === "/api/leads" && req.method === "GET") {
      const leads = await readJson(leadsFile, []);
      send(res, 200, JSON.stringify({ ok: true, leads }));
      return;
    }

    const requested = url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);
    const file = join(root, requested);
    if (!file.startsWith(root) || !existsSync(file)) {
      send(res, 404, "Not found", "text/plain; charset=utf-8");
      return;
    }
    send(res, 200, await readFile(file), mime[extname(file)] || "application/octet-stream");
  } catch (error) {
    send(res, 500, JSON.stringify({ ok: false, error: error.message }));
  }
}).listen(port, () => {
  console.log(`MingFlow promo app running at http://127.0.0.1:${port}`);
});
