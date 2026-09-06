import { createFileRoute } from "@tanstack/react-router";
import { friendlyErrorMessage } from "@/lib/friendly-error";
import { json, requireAdmin } from "@/lib/supabase-rest";
import {
  generateLuckyNumberArticle,
  type ArticleSlot,
} from "@/lib/auto-article-generator";

function readBearer(request: Request) {
  const authorization = request.headers.get("Authorization") || "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match?.[1] || "";
}

async function verifyCronOrAdmin(request: Request): Promise<boolean> {
  const url = new URL(request.url);
  const keyParam = url.searchParams.get("key") || "";
  const bearer = readBearer(request);

  const cronSecret = process.env.CRON_SECRET || process.env.AUTO_ARTICLE_SECRET;
  if (cronSecret) {
    if (keyParam === cronSecret || bearer === cronSecret) {
      return true;
    }
  }

  try {
    await requireAdmin(request);
    return true;
  } catch {
    return false;
  }
}

export const Route = createFileRoute("/api/cron-auto-article")({
  server: {
    handlers: {
      OPTIONS: async () => json(null, { status: 204 }),
      GET: async ({ request }) => {
        try {
          const authorized = await verifyCronOrAdmin(request);
          if (!authorized) {
            return json(
              { ok: false, error: "Unauthorized: ต้องมี CRON_SECRET หรือ Session แอดมิน" },
              { status: 401 },
            );
          }

          const url = new URL(request.url);
          const slot = (url.searchParams.get("slot") || "auto") as ArticleSlot | "auto";
          const force = url.searchParams.get("force") === "true" || url.searchParams.get("force") === "1";
          const targetDate = url.searchParams.get("date") || undefined;

          const result = await generateLuckyNumberArticle({ slot, force, targetDate });
          return json({ ok: true, result });
        } catch (error) {
          return json(
            {
              ok: false,
              error: friendlyErrorMessage(error, "สร้างบทความอัตโนมัติไม่สำเร็จ"),
            },
            { status: 500 },
          );
        }
      },
      POST: async ({ request }) => {
        try {
          const authorized = await verifyCronOrAdmin(request);
          if (!authorized) {
            return json(
              { ok: false, error: "Unauthorized: ต้องมี CRON_SECRET หรือ Session แอดมิน" },
              { status: 401 },
            );
          }

          const url = new URL(request.url);
          const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
          const slot = (body.slot || url.searchParams.get("slot") || "auto") as ArticleSlot | "auto";
          const force =
            Boolean(body.force) ||
            url.searchParams.get("force") === "true" ||
            url.searchParams.get("force") === "1";
          const targetDate = (body.date || url.searchParams.get("date")) as string | undefined;

          const result = await generateLuckyNumberArticle({ slot, force, targetDate });
          return json({ ok: true, result });
        } catch (error) {
          return json(
            {
              ok: false,
              error: friendlyErrorMessage(error, "สร้างบทความอัตโนมัติไม่สำเร็จ"),
            },
            { status: 500 },
          );
        }
      },
    },
  },
});
