import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/admin/users")({
  head: () =>
    seo({
      title: "จัดการผู้ใช้งาน — Admin",
      description: "จัดการผู้ใช้งานจริงจาก Supabase Auth ที่ซิงก์เข้า public.users",
      path: "/admin/users",
      noindex: true,
    }),
  component: AdminUsers,
});

type Role = "Admin" | "User";
type U = {
  id: string;
  name: string;
  email: string;
  role: Role;
  joined: string;
  status: "Active" | "Suspended";
};

const roleFilters = ["ทั้งหมด", "Admin", "User"] as const;
type RoleFilter = (typeof roleFilters)[number];
const ADMIN_SESSION_KEY = "likhitfa-admin-session-v2";

function AdminUsers() {
  const [items, setItems] = useState<U[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("ทั้งหมด");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadUsers() {
      setLoading(true);
      setError("");

      try {
        const rawSession = window.localStorage.getItem(ADMIN_SESSION_KEY);
        const session = rawSession ? JSON.parse(rawSession) : null;
        const response = await fetch("/api/admin-users", {
          headers: session?.accessToken
            ? {
                Authorization: `Bearer ${session.accessToken}`,
              }
            : {},
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok || !data.ok) {
          throw new Error(data.error || "โหลดผู้ใช้งานไม่สำเร็จ");
        }

        if (mounted) setItems(data.users || []);
      } catch (loadError) {
        if (mounted) {
          setError(loadError instanceof Error ? loadError.message : "โหลดผู้ใช้งานไม่สำเร็จ");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void loadUsers();

    return () => {
      mounted = false;
    };
  }, []);

  const filtered = items.filter(
    (u) =>
      (roleFilter === "ทั้งหมด" || u.role === roleFilter) &&
      (u.name.includes(search) || u.email.includes(search)),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-foreground">จัดการผู้ใช้งาน</h1>
        <p className="text-sm text-muted-foreground">
          อ่านบัญชีจริงจากตาราง public.users ที่ซิงก์กับ Supabase Auth และไม่แสดงข้อมูล demo
        </p>
      </div>

      <section className="grid gap-3 md:grid-cols-4">
        <input
          className="input-styled md:col-span-2"
          placeholder="ค้นหาชื่อหรืออีเมล"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="input-styled"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
        >
          {roleFilters.map((role) => (
            <option key={role}>{role}</option>
          ))}
        </select>
        <button
          disabled
          className="rounded-xl border border-gold/20 px-5 py-2.5 text-sm font-semibold text-gold/70"
        >
          public.users
        </button>
      </section>

      <section className="glass-strong overflow-x-auto rounded-3xl">
        {error ? (
          <div className="border-b border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        ) : null}
        {loading ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            กำลังโหลดผู้ใช้งานจาก public.users...
          </div>
        ) : null}
        {!loading && !error && filtered.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            ไม่พบผู้ใช้งานในระบบ
          </div>
        ) : null}
        {!loading && !error && filtered.length > 0 ? (
          <table className="w-full min-w-[720px] text-sm">
            <thead className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr className="border-b border-gold/10">
                <th className="px-4 py-3">ผู้ใช้</th>
                <th className="px-4 py-3">บทบาท</th>
                <th className="px-4 py-3">วันที่สมัคร</th>
                <th className="px-4 py-3">สถานะ</th>
                <th className="px-4 py-3 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-gold/5 hover:bg-gold/5">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-gold text-sm font-bold text-primary-foreground">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-foreground">{u.name}</div>
                        <div className="text-xs text-muted-foreground">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      disabled
                      className={`rounded-full border bg-transparent px-2 py-1 text-xs ${u.role === "Admin" ? "border-gold text-gold" : "border-gold/20 text-muted-foreground"}`}
                    >
                      <option>Admin</option>
                      <option>User</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{u.joined}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] ${u.status === "Active" ? "bg-emerald-400/15 text-emerald-300" : "bg-rose-400/15 text-rose-300"}`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="mr-2 rounded-md border border-gold/30 px-2 py-1 text-xs text-gold hover:bg-gold/10">
                      แก้ไข
                    </button>
                    <button
                      disabled
                      className="rounded-md border border-rose-400/20 px-2 py-1 text-xs text-rose-300/50"
                    >
                      ลบ
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </section>
    </div>
  );
}
