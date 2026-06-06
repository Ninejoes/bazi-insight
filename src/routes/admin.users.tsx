import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/admin/users")({
  head: () => ({ meta: [{ title: "จัดการผู้ใช้งาน — Admin" }] }),
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

const initialUsers: U[] = [
  {
    id: "admin",
    name: "Admin",
    email: "admin@gmail.com",
    role: "Admin",
    joined: "2026-06-06",
    status: "Active",
  },
];

const roleFilters = ["ทั้งหมด", "Admin", "User"] as const;
type RoleFilter = (typeof roleFilters)[number];

function AdminUsers() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("ทั้งหมด");

  const filtered = initialUsers.filter(
    (u) =>
      (roleFilter === "ทั้งหมด" || u.role === roleFilter) &&
      (u.name.includes(search) || u.email.includes(search)),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-foreground">จัดการผู้ใช้งาน</h1>
        <p className="text-sm text-muted-foreground">
          แสดงบัญชีจริงที่ใช้เข้าสู่ระบบหลังบ้านผ่าน Supabase Auth
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
          Supabase Auth
        </button>
      </section>

      <section className="glass-strong overflow-hidden rounded-3xl">
        <table className="w-full text-sm">
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
      </section>
    </div>
  );
}
