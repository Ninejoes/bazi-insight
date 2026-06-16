import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { adminAuthHeaders } from "@/lib/admin-auth";
import { friendlyErrorMessage } from "@/lib/friendly-error";
import { useEffect, useMemo, useState } from "react";

export const Route = createFileRoute("/admin/audit")({
  head: () =>
    seo({
      title: "Audit Log — Admin",
      description: "ตรวจสอบประวัติการเพิ่ม แก้ไข และลบข้อมูลหลังบ้าน",
      path: "/admin/audit",
      noindex: true,
    }),
  component: AdminAuditLog,
});

type AuditEvent = {
  id: string;
  actorEmail: string;
  actorRole: string;
  action: string;
  tableName: string;
  recordId: string;
  summary: string;
  ip: string;
  userAgent: string;
  createdAt: string;
};

const tableOptions = [
  { value: "all", label: "ทุกตาราง" },
  { value: "articles", label: "บทความ" },
  { value: "dreams", label: "ทำนายฝัน" },
  { value: "faqs", label: "FAQ" },
  { value: "site_content", label: "เนื้อหาเว็บ" },
];

const actionOptions = [
  { value: "all", label: "ทุก action" },
  { value: "update", label: "เพิ่ม/แก้ไข" },
  { value: "delete", label: "ลบ" },
];

function formatDate(value: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function actionLabel(action: string) {
  if (action === "delete") return "ลบ";
  if (action === "create") return "เพิ่ม";
  return "แก้ไข";
}

function AdminAuditLog() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [q, setQ] = useState("");
  const [query, setQuery] = useState("");
  const [tableName, setTableName] = useState("all");
  const [action, setAction] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [notice, setNotice] = useState("");
  const [setupRequired, setSetupRequired] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setPage(1);
      setQuery(q.trim());
    }, 350);
    return () => window.clearTimeout(timeout);
  }, [q]);

  useEffect(() => {
    let mounted = true;

    async function loadEvents() {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: String(pageSize),
      });
      if (query) params.set("q", query);
      if (tableName !== "all") params.set("table", tableName);
      if (action !== "all") params.set("action", action);

      try {
        const response = await fetch(`/api/audit-events?${params.toString()}`, {
          headers: adminAuthHeaders(),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.ok) {
          throw new Error(friendlyErrorMessage(data.error, "โหลด Audit Log ไม่สำเร็จ"));
        }
        if (!mounted) return;
        setEvents((data.events || []) as AuditEvent[]);
        setTotal(Number(data.total || 0));
        setTotalPages(Number(data.totalPages || 1));
        setSetupRequired(Boolean(data.setupRequired));
        setNotice(data.setupRequired ? data.message || "ยังไม่ได้สร้างตาราง Audit Log" : "");
      } catch (error) {
        if (!mounted) return;
        setEvents([]);
        setTotal(0);
        setTotalPages(1);
        setSetupRequired(false);
        setNotice(friendlyErrorMessage(error, "โหลด Audit Log ไม่สำเร็จ"));
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void loadEvents();

    return () => {
      mounted = false;
    };
  }, [action, page, pageSize, query, tableName]);

  const currentStart = total ? (page - 1) * pageSize + 1 : 0;
  const currentEnd = Math.min(page * pageSize, total);
  const pageNumbers = useMemo(() => {
    const pages = new Set([1, totalPages, page - 1, page, page + 1]);
    return Array.from(pages)
      .filter((item) => item >= 1 && item <= totalPages)
      .sort((a, b) => a - b);
  }, [page, totalPages]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-foreground">Audit Log</h1>
        <p className="text-sm text-muted-foreground">
          ตรวจสอบประวัติการเพิ่ม แก้ไข และลบข้อมูลหลังบ้าน
        </p>
      </div>

      {setupRequired ? (
        <div className="rounded-2xl border border-gold/20 bg-gold/10 px-4 py-4 text-sm text-gold">
          <div className="font-semibold">ต้องสร้างตาราง Audit Log ใน Supabase ก่อน</div>
          <div className="mt-1 text-gold/80">
            เปิด Supabase SQL Editor แล้วรันไฟล์{" "}
            <span className="font-mono">supabase/audit-events.sql</span> จากนั้นหน้านี้จะเริ่มแสดง
            log ใหม่ หลังมีการเพิ่ม แก้ไข หรือลบข้อมูล
          </div>
        </div>
      ) : notice ? (
        <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
          {notice}
        </div>
      ) : null}

      <section className="grid gap-3 rounded-2xl border border-gold/10 bg-card/40 p-4 md:grid-cols-[1fr_180px_180px_140px]">
        <input
          className="input-styled"
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder="ค้นหา email, record id, IP หรือคำอธิบาย"
        />
        <select
          className="input-styled"
          value={tableName}
          onChange={(event) => {
            setTableName(event.target.value);
            setPage(1);
          }}
        >
          {tableOptions.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        <select
          className="input-styled"
          value={action}
          onChange={(event) => {
            setAction(event.target.value);
            setPage(1);
          }}
        >
          {actionOptions.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        <select
          className="input-styled"
          value={pageSize}
          onChange={(event) => {
            setPageSize(Number(event.target.value));
            setPage(1);
          }}
        >
          {[10, 20, 50].map((size) => (
            <option key={size} value={size}>
              {size} รายการ
            </option>
          ))}
        </select>
      </section>

      <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gold/10 bg-card/40 px-4 py-3 text-xs text-muted-foreground">
        <div>
          แสดง {currentStart.toLocaleString()}-{currentEnd.toLocaleString()} จาก{" "}
          {total.toLocaleString()} รายการ
        </div>
        <div className="text-gold">{loading ? "กำลังโหลด..." : "ข้อมูลจาก Supabase"}</div>
      </section>

      <section className="glass-strong max-w-full overflow-x-auto rounded-3xl">
        <table className="w-full min-w-[980px] text-sm">
          <thead className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr className="border-b border-gold/10">
              <th className="px-4 py-3">เวลา</th>
              <th className="px-4 py-3">ผู้ใช้</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">ตาราง</th>
              <th className="px-4 py-3">Record</th>
              <th className="px-4 py-3">รายละเอียด</th>
              <th className="px-4 py-3">IP</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id} className="border-b border-gold/5 hover:bg-gold/5">
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {formatDate(event.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <div className="text-foreground">{event.actorEmail || "-"}</div>
                  <div className="text-[11px] text-muted-foreground">{event.actorRole}</div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full border px-2 py-1 text-xs ${
                      event.action === "delete"
                        ? "border-rose-400/30 text-rose-200"
                        : "border-gold/30 text-gold"
                    }`}
                  >
                    {actionLabel(event.action)}
                  </span>
                </td>
                <td className="px-4 py-3 text-gold">{event.tableName}</td>
                <td className="px-4 py-3 font-mono text-xs text-foreground">{event.recordId}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{event.summary || "-"}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{event.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && events.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            ยังไม่มี Audit Log ตามเงื่อนไขนี้
          </div>
        ) : null}
      </section>

      {totalPages > 1 ? (
        <section className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <button
            className="rounded-xl border border-gold/20 px-4 py-2 text-muted-foreground disabled:cursor-not-allowed disabled:opacity-40 hover:text-gold"
            disabled={page <= 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
          >
            ก่อนหน้า
          </button>
          <div className="flex flex-wrap justify-center gap-1">
            {pageNumbers.map((item) => (
              <button
                key={item}
                className={`min-w-9 rounded-lg border px-3 py-2 text-xs ${
                  item === page
                    ? "border-gold bg-gold/15 text-gold"
                    : "border-gold/20 text-muted-foreground hover:text-gold"
                }`}
                onClick={() => setPage(item)}
              >
                {item.toLocaleString()}
              </button>
            ))}
          </div>
          <button
            className="rounded-xl border border-gold/20 px-4 py-2 text-muted-foreground disabled:cursor-not-allowed disabled:opacity-40 hover:text-gold"
            disabled={page >= totalPages}
            onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
          >
            ถัดไป
          </button>
        </section>
      ) : null}
    </div>
  );
}
