import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { BrandMark } from "@/components/site-header";
import { useEffect, useState } from "react";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/admin")({
  head: () =>
    seo({
      title: "ระบบหลังบ้าน — Admin",
      description: "ระบบหลังบ้านสำหรับจัดการบทความ ผู้ใช้งาน ทำนายฝัน และเนื้อหาเว็บไซต์",
      path: "/admin",
      noindex: true,
    }),
  component: AdminLayout,
});

const nav = [
  { to: "/admin", label: "แดชบอร์ด", icon: "◈" },
  { to: "/admin/articles", label: "บทความ", icon: "✎" },
  { to: "/admin/dreams", label: "ทำนายฝัน", icon: "☾" },
  { to: "/admin/users", label: "ผู้ใช้งาน", icon: "♟" },
  { to: "/admin/contact", label: "ติดต่อ / เกี่ยวกับเรา", icon: "✉" },
  { to: "/admin/help", label: "ศูนย์ช่วยเหลือ", icon: "?" },
] as const;

const ADMIN_SESSION_KEY = "likhitfa-admin-session-v2";

type AdminSession = {
  accessToken?: string;
  email?: string;
  mode?: string;
  name?: string;
  role?: string;
  expiresAt?: string;
};

function readAdminSession() {
  const raw = window.localStorage.getItem(ADMIN_SESSION_KEY);
  if (!raw) return null;

  try {
    const session = JSON.parse(raw) as AdminSession;
    const isExpired = session.expiresAt
      ? new Date(session.expiresAt).getTime() <= Date.now()
      : false;
    if (isExpired || session.email !== "admin@gmail.com" || session.role !== "Admin") {
      window.localStorage.removeItem(ADMIN_SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    window.localStorage.removeItem(ADMIN_SESSION_KEY);
    return null;
  }
}

function clearAdminSession() {
  window.localStorage.removeItem(ADMIN_SESSION_KEY);
  window.localStorage.removeItem("likhitfa-admin-session");
  window.localStorage.removeItem("likhitfa-admin-auth");
}

function AdminLayout() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(false);
  const [session, setSession] = useState<AdminSession | null>(null);

  useEffect(() => {
    let mounted = true;

    async function verifyAdminSession() {
      const adminSession = readAdminSession();
      if (!adminSession) {
        clearAdminSession();
        void navigate({ to: "/admin-login" });
        return;
      }

      const response = await fetch("/api/admin-session", {
        headers: adminSession.accessToken
          ? {
              Authorization: `Bearer ${adminSession.accessToken}`,
            }
          : {},
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.ok) {
        clearAdminSession();
        void navigate({ to: "/admin-login" });
        return;
      }

      if (!mounted) return;
      setSession({ ...adminSession, ...data.session });
      setAuthorized(true);
    }

    setAuthorized(false);
    void verifyAdminSession();

    return () => {
      mounted = false;
    };
  }, [navigate, path]);

  const logout = () => {
    clearAdminSession();
    setAuthorized(false);
    setSession(null);
    void navigate({ to: "/admin-login" });
  };

  if (!authorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[oklch(0.12_0.018_260)] px-6 text-center">
        <div>
          <div className="font-display text-2xl text-foreground">กำลังตรวจสอบสิทธิ์</div>
          <p className="mt-2 text-sm text-muted-foreground">กรุณาเข้าสู่ระบบแอดมินก่อนใช้งาน</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[oklch(0.12_0.018_260)]">
      <div className="flex min-h-screen min-w-0">
        <aside className="hidden w-64 shrink-0 border-r border-gold/10 bg-[oklch(0.10_0.018_260)] p-5 md:flex md:flex-col">
          <Link to="/admin" className="flex items-center gap-3">
            <BrandMark size={36} />
            <div>
              <div className="text-[10px] tracking-[0.3em] text-gold/80">LIKHITFA</div>
              <div className="font-display text-base font-semibold text-foreground">
                Admin Console
              </div>
            </div>
          </Link>

          <nav className="mt-8 flex-1 space-y-1">
            {nav.map((n) => {
              const active = n.to === "/admin" ? path === "/admin" : path.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                    active
                      ? "bg-gradient-gold text-primary-foreground shadow-gold"
                      : "text-muted-foreground hover:bg-gold/10 hover:text-gold"
                  }`}
                >
                  <span className="w-5 text-center">{n.icon}</span>
                  {n.label}
                </Link>
              );
            })}
          </nav>

          <Link
            to="/"
            className="mt-6 rounded-xl border border-gold/20 px-3 py-2 text-center text-xs text-gold/80 hover:bg-gold/10"
          >
            ← กลับสู่หน้าเว็บ
          </Link>
          <button
            onClick={logout}
            className="mt-2 rounded-xl border border-rose-400/25 px-3 py-2 text-center text-xs text-rose-200 hover:bg-rose-400/10"
          >
            ออกจากระบบ
          </button>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="flex min-w-0 items-center justify-between gap-4 border-b border-gold/10 bg-[oklch(0.10_0.018_260)]/80 px-4 py-4 backdrop-blur sm:px-6">
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.25em] text-gold/70">ADMIN</div>
              <div className="truncate font-display text-lg text-foreground">ระบบหลังบ้าน</div>
            </div>
            <div className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-3">
              <div className="hidden text-right md:block">
                <div className="text-sm text-foreground">{session?.name || "Admin"}</div>
                <div className="text-[11px] text-muted-foreground">
                  {session?.email || "admin@gmail.com"}
                </div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-gold font-bold text-primary-foreground">
                A
              </div>
              <button
                onClick={logout}
                className="hidden rounded-xl border border-rose-400/25 px-3 py-2 text-xs text-rose-200 hover:bg-rose-400/10 sm:block"
              >
                ออกจากระบบ
              </button>
            </div>
          </header>

          <nav className="border-b border-gold/10 bg-[oklch(0.10_0.018_260)]/95 px-4 py-3 md:hidden">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {nav.map((n) => {
                const active = n.to === "/admin" ? path === "/admin" : path.startsWith(n.to);
                return (
                  <Link
                    key={n.to}
                    to={n.to}
                    className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm transition ${
                      active
                        ? "bg-gradient-gold text-primary-foreground shadow-gold"
                        : "border border-gold/20 text-muted-foreground"
                    }`}
                  >
                    <span>{n.icon}</span>
                    {n.label}
                  </Link>
                );
              })}
            </div>
            <Link
              to="/"
              className="mt-2 block rounded-xl border border-gold/20 px-3 py-2 text-center text-xs text-gold/80"
            >
              ← กลับสู่หน้าเว็บ
            </Link>
            <button
              onClick={logout}
              className="mt-2 w-full rounded-xl border border-rose-400/25 px-3 py-2 text-center text-xs text-rose-200"
            >
              ออกจากระบบ
            </button>
          </nav>

          <main className="min-w-0 overflow-x-hidden p-4 sm:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
