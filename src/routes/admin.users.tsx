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
type UserStatus = "Active" | "Suspended";
type U = {
  id: string;
  name: string;
  email: string;
  role: Role;
  joined: string;
  status: UserStatus;
};

const roleFilters = ["ทั้งหมด", "Admin", "User"] as const;
type RoleFilter = (typeof roleFilters)[number];
const ADMIN_SESSION_KEY = "likhitfa-admin-session-v2";

function authHeaders(): Record<string, string> {
  try {
    const rawSession = window.localStorage.getItem(ADMIN_SESSION_KEY);
    const session = rawSession ? JSON.parse(rawSession) : null;
    return session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {};
  } catch {
    return {};
  }
}

function AdminUsers() {
  const [items, setItems] = useState<U[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("ทั้งหมด");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [editing, setEditing] = useState<U | null>(null);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const loadUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin-users", { headers: authHeaders() });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.ok) throw new Error(data.error || "โหลดผู้ใช้งานไม่สำเร็จ");
      setItems(data.users || []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "โหลดผู้ใช้งานไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  };

  const saveUser = async (user: U) => {
    setSavingId(user.id);
    setError("");
    try {
      const response = await fetch("/api/admin-users", {
        method: "PATCH",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.ok) throw new Error(data.error || "บันทึกผู้ใช้งานไม่สำเร็จ");
      await loadUsers();
      setEditing(null);
      notify("บันทึกผู้ใช้งานแล้ว");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "บันทึกผู้ใช้งานไม่สำเร็จ");
    } finally {
      setSavingId("");
    }
  };

  const deleteUser = async (user: U) => {
    if (user.email === "admin@gmail.com") {
      notify("ไม่สามารถลบบัญชีแอดมินหลักได้");
      return;
    }
    if (!window.confirm(`ลบผู้ใช้งาน ${user.email} ออกจากระบบจริงไหม?`)) return;
    setSavingId(user.id);
    setError("");
    try {
      const response = await fetch(
        `/api/admin-users?id=${encodeURIComponent(user.id)}&email=${encodeURIComponent(user.email)}`,
        { method: "DELETE", headers: authHeaders() },
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.ok) throw new Error(data.error || "ลบผู้ใช้งานไม่สำเร็จ");
      await loadUsers();
      notify("ลบผู้ใช้งานแล้ว");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "ลบผู้ใช้งานไม่สำเร็จ");
    } finally {
      setSavingId("");
    }
  };

  const filtered = items.filter(
    (u) =>
      (roleFilter === "ทั้งหมด" || u.role === roleFilter) &&
      (u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="space-y-6">
      {toast ? (
        <div className="fixed right-4 top-4 z-50 rounded-2xl border border-emerald-400/25 bg-emerald-400/15 px-4 py-3 text-sm text-emerald-100 shadow-elegant">
          {toast}
        </div>
      ) : null}

      <div>
        <h1 className="font-display text-3xl text-foreground">จัดการผู้ใช้งาน</h1>
        <p className="text-sm text-muted-foreground">
          อ่าน แก้ไข และลบผู้ใช้งานจริงจาก public.users และ Supabase Auth
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
          onClick={() => void loadUsers()}
          disabled={loading}
          className="rounded-xl border border-gold/20 px-5 py-2.5 text-sm font-semibold text-gold/90 disabled:cursor-wait disabled:opacity-50"
        >
          {loading ? "กำลังโหลด..." : "รีเฟรช"}
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
            กำลังโหลดผู้ใช้งานจาก Supabase...
          </div>
        ) : null}
        {!loading && !error && filtered.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            ไม่พบผู้ใช้งานในระบบ
          </div>
        ) : null}
        {!loading && filtered.length > 0 ? (
          <table className="w-full min-w-[760px] text-sm">
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
                        {(u.name || u.email).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-foreground">{u.name}</div>
                        <div className="text-xs text-muted-foreground">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gold">{u.role}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{u.joined}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] ${
                        u.status === "Active"
                          ? "bg-emerald-400/15 text-emerald-300"
                          : "bg-rose-400/15 text-rose-300"
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setEditing(u)}
                      disabled={!!savingId}
                      className="mr-2 rounded-md border border-gold/30 px-2 py-1 text-xs text-gold hover:bg-gold/10 disabled:opacity-50"
                    >
                      แก้ไข
                    </button>
                    <button
                      onClick={() => void deleteUser(u)}
                      disabled={!!savingId || u.email === "admin@gmail.com"}
                      className="rounded-md border border-rose-400/30 px-2 py-1 text-xs text-rose-300 hover:bg-rose-400/10 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {savingId === u.id ? "กำลังลบ..." : "ลบ"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </section>

      {editing ? (
        <UserEditor
          user={editing}
          saving={savingId === editing.id}
          onClose={() => setEditing(null)}
          onSave={saveUser}
        />
      ) : null}
    </div>
  );
}

function UserEditor({
  user,
  saving,
  onClose,
  onSave,
}: {
  user: U;
  saving: boolean;
  onClose: () => void;
  onSave: (user: U) => void | Promise<void>;
}) {
  const [name, setName] = useState(user.name);
  const [role, setRole] = useState<Role>(user.role);
  const [status, setStatus] = useState<UserStatus>(user.status);
  const isPrimaryAdmin = user.email === "admin@gmail.com";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur"
      onClick={onClose}
    >
      <form
        className="glass-strong w-full max-w-lg rounded-3xl p-6 shadow-elegant"
        onClick={(event) => event.stopPropagation()}
        onSubmit={(event) => {
          event.preventDefault();
          void onSave({ ...user, name: name.trim() || user.email, role, status });
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl text-foreground">แก้ไขผู้ใช้งาน</h2>
            <p className="mt-1 text-xs text-muted-foreground">{user.email}</p>
          </div>
          <button type="button" onClick={onClose} className="text-2xl text-muted-foreground">
            ×
          </button>
        </div>
        <div className="mt-5 space-y-3">
          <input
            className="input-styled"
            placeholder="ชื่อผู้ใช้"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <select
              className="input-styled"
              value={role}
              disabled={isPrimaryAdmin}
              onChange={(event) => setRole(event.target.value as Role)}
            >
              <option>Admin</option>
              <option>User</option>
            </select>
            <select
              className="input-styled"
              value={status}
              disabled={isPrimaryAdmin}
              onChange={(event) => setStatus(event.target.value as UserStatus)}
            >
              <option>Active</option>
              <option>Suspended</option>
            </select>
          </div>
          {isPrimaryAdmin ? (
            <div className="rounded-xl border border-gold/15 bg-gold/5 px-3 py-2 text-xs text-gold/80">
              บัญชีแอดมินหลักแก้ไขชื่อได้ แต่ไม่สามารถลดสิทธิ์หรือปิดบัญชีได้
            </div>
          ) : null}
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-xl border border-gold/20 px-5 py-2 text-sm">
            ยกเลิก
          </button>
          <button
            disabled={saving}
            className="rounded-xl bg-gradient-gold px-6 py-2 text-sm font-semibold text-primary-foreground shadow-gold disabled:cursor-wait disabled:opacity-60"
          >
            {saving ? "กำลังบันทึก..." : "บันทึก"}
          </button>
        </div>
      </form>
    </div>
  );
}
