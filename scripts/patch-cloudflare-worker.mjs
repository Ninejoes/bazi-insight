import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";

const workerIndexPath = new URL("../dist/_worker.js/index.js", import.meta.url);

if (!existsSync(workerIndexPath)) {
  console.log("[patch-cloudflare-worker] dist/_worker.js/index.js not found, skipping.");
  process.exit(0);
}

let content = await readFile(workerIndexPath, "utf8");

// Target: cloudflarePages.fetch(cfReq, env, context)
const target = "async fetch(cfReq, env, context) {";
const injection = `async fetch(cfReq, env, context) {
    globalThis.__cf_env__ = env;
    if (env && typeof env === "object") {
      for (const [k, v] of Object.entries(env)) {
        if (typeof v === "string") process.env[k] = v;
      }
    }`;

if (content.includes(target) && !content.includes("globalThis.__cf_env__ = env;")) {
  content = content.replace(target, injection);
  await writeFile(workerIndexPath, content, "utf8");
  console.log("[patch-cloudflare-worker] Successfully patched dist/_worker.js/index.js to bind Cloudflare env to process.env!");
} else {
  console.log("[patch-cloudflare-worker] Already patched or target not found.");
}
