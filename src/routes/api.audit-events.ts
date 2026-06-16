import { createFileRoute } from "@tanstack/react-router";
import { friendlyErrorMessage } from "@/lib/friendly-error";
import { getSupabaseConfig, json, requireAdmin, supabaseRequest } from "@/lib/supabase-rest";

type AuditEventRow = {
  id?: string;
  actor_user_id?: string | null;
  actor_email?: string;
  actor_role?: string;
  action?: string;
  table_name?: string;
  record_id?: string;
  summary?: string;
  metadata?: Record<string, unknown>;
  ip?: string;
  user_agent?: string;
  created_at?: string;
};

function clampPage(value: string | null) {
  const page = Number.parseInt(value || "1", 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

function clampLimit(value: string | null) {
  const limit = Number.parseInt(value || "20", 10);
  if (!Number.isFinite(limit) || limit < 1) return 20;
  return Math.min(limit, 100);
}

function parseTotal(contentRange: string | null, fallback: number) {
  const total = contentRange?.match(/\/(\d+|\*)$/)?.[1];
  if (!total || total === "*") return fallback;
  return Number.parseInt(total, 10);
}

function normalizeAuditEvent(row: AuditEventRow) {
  return {
    id: row.id || "",
    actorUserId: row.actor_user_id || null,
    actorEmail: row.actor_email || "",
    actorRole: row.actor_role || "",
    action: row.action || "",
    tableName: row.table_name || "",
    recordId: row.record_id || "",
    summary: row.summary || "",
    metadata: row.metadata || {},
    ip: row.ip || "",
    userAgent: row.user_agent || "",
    createdAt: row.created_at || "",
  };
}

function isMissingAuditTableError(error: unknown) {
  const message = friendlyErrorMessage(error, "");
  return (
    message.includes("content_audit_events") &&
    (message.includes("Could not find the table") ||
      message.includes("schema cache") ||
      message.includes("PGRST205") ||
      message.includes("404"))
  );
}

function buildAuditQuery({
  action,
  tableName,
  q,
  page,
  limit,
}: {
  action: string;
  tableName: string;
  q: string;
  page: number;
  limit: number;
}) {
  const offset = (page - 1) * limit;
  const params = new URLSearchParams({
    select: "*",
    order: "created_at.desc",
    limit: String(limit),
    offset: String(offset),
  });

  if (tableName && tableName !== "all") params.set("table_name", `eq.${tableName}`);
  if (action && action !== "all") params.set("action", `eq.${action}`);
  if (q) {
    const pattern = `*${q.replace(/[,*()]/g, " ")}*`;
    params.set(
      "or",
      `(${[
        `actor_email.ilike.${pattern}`,
        `record_id.ilike.${pattern}`,
        `summary.ilike.${pattern}`,
        `ip.ilike.${pattern}`,
      ].join(",")})`,
    );
  }

  return `content_audit_events?${params.toString()}`;
}

async function listAuditEvents({ action = "", tableName = "", q = "", page = 1, limit = 20 } = {}) {
  if (!getSupabaseConfig()) {
    throw new Error("ยังไม่ได้ตั้งค่า SUPABASE_URL และ SUPABASE_SERVICE_ROLE_KEY บน server");
  }

  const response = await supabaseRequest(buildAuditQuery({ action, tableName, q, page, limit }), {
    headers: { Prefer: "count=exact" },
  });
  if (!response) {
    throw new Error("ยังไม่ได้ตั้งค่า SUPABASE_URL และ SUPABASE_SERVICE_ROLE_KEY บน server");
  }

  const rows = (await response.json().catch(() => [])) as AuditEventRow[];
  const total = parseTotal(response.headers.get("content-range"), rows.length);
  return {
    source: "supabase",
    events: rows.map(normalizeAuditEvent),
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

export const Route = createFileRoute("/api/audit-events")({
  server: {
    handlers: {
      OPTIONS: async () => json(null, { status: 204 }),
      GET: async ({ request }) => {
        try {
          await requireAdmin(request);
          const url = new URL(request.url);
          const action = (url.searchParams.get("action") || "").trim();
          const tableName = (url.searchParams.get("table") || "").trim();
          const q = (url.searchParams.get("q") || "").trim();
          const page = clampPage(url.searchParams.get("page"));
          const limit = clampLimit(url.searchParams.get("limit"));
          return json({
            ok: true,
            ...(await listAuditEvents({ action, tableName, q, page, limit })),
          });
        } catch (error) {
          if (isMissingAuditTableError(error)) {
            return json({
              ok: true,
              source: "supabase",
              setupRequired: true,
              events: [],
              page: 1,
              limit: 20,
              total: 0,
              totalPages: 1,
              message: "ยังไม่ได้สร้างตาราง content_audit_events ใน Supabase",
            });
          }
          const message = friendlyErrorMessage(error, "โหลด Audit Log ไม่สำเร็จ");
          return json(
            { ok: false, error: message },
            { status: message.includes("แอดมิน") || message.includes("session") ? 401 : 502 },
          );
        }
      },
    },
  },
});
