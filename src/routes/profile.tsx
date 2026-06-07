import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { seo } from "@/lib/seo";
import { useEffect, useState } from "react";
import {
  clearUserSession,
  readStoredUserSession,
  storeUserSession,
  type UserSession,
} from "@/lib/user-session";

export const Route = createFileRoute("/profile")({
  head: () =>
    seo({
      title: "โปรไฟล์",
      description: "หน้าโปรไฟล์ส่วนตัว ประวัติการดูดวง และการตั้งค่าบัญชี Likhitfa",
      path: "/profile",
      noindex: true,
    }),
  component: ProfileLayout,
});

const tabs = [
  { to: "/profile", label: "ภาพรวม", icon: "◈" },
  { to: "/profile/history", label: "ประวัติการดูดวง", icon: "☷" },
  { to: "/profile/settings", label: "ตั้งค่าและความเป็นส่วนตัว", icon: "⚙" },
] as const;

function ProfileLayout() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [session, setSession] = useState<UserSession | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function verifyUser() {
      const stored = readStoredUserSession();
      if (!stored) {
        void navigate({ to: "/login" });
        return;
      }

      if (stored.accessToken) {
        const response = await fetch("/api/user-session", {
          headers: { Authorization: `Bearer ${stored.accessToken}` },
        });
        const data = (await response.json().catch(() => ({}))) as {
          ok?: boolean;
          session?: Partial<UserSession>;
        };
        if (!response.ok || !data.ok) {
          clearUserSession();
          void navigate({ to: "/login" });
          return;
        }
        const nextSession = { ...stored, ...data.session, accessToken: stored.accessToken };
        storeUserSession(nextSession as UserSession);
        if (mounted) setSession(nextSession as UserSession);
      } else if (mounted) {
        setSession(stored);
      }

      if (mounted) setChecking(false);
    }

    void verifyUser();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  const logout = () => {
    clearUserSession();
    setSession(null);
    void navigate({ to: "/login" });
  };

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 text-center">
        <div>
          <div className="font-display text-2xl text-foreground">กำลังตรวจสอบบัญชี</div>
          <p className="mt-2 text-sm text-muted-foreground">กรุณาเข้าสู่ระบบก่อนดูโปรไฟล์</p>
        </div>
      </div>
    );
  }

  const initials = (session?.name || session?.email || "U").slice(0, 1).toUpperCase();

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 pt-10 pb-12">
        <header className="glass-strong rounded-3xl p-6 shadow-elegant md:p-8">
          <div className="flex flex-col items-start gap-5 md:flex-row md:items-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-gold text-3xl font-bold text-primary-foreground shadow-gold">
              {initials}
            </div>
            <div className="flex-1">
              <div className="text-[11px] uppercase tracking-[0.25em] text-gold/70">MEMBER</div>
              <h1 className="font-display text-3xl text-foreground">{session?.name || "User"}</h1>
              <p className="text-sm text-muted-foreground">{session?.email} · ผู้ใช้งานทั่วไป</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                to="/profile/settings"
                className="rounded-xl border border-gold/30 px-4 py-2 text-sm text-gold hover:bg-gold/10"
              >
                แก้ไขโปรไฟล์
              </Link>
              <button
                onClick={logout}
                className="rounded-xl border border-rose-400/30 px-4 py-2 text-sm text-rose-200 hover:bg-rose-400/10"
              >
                ออกจากระบบ
              </button>
            </div>
          </div>
        </header>

        <nav className="mt-6 flex flex-wrap gap-2">
          {tabs.map((t) => {
            const active = path === t.to;
            return (
              <Link
                key={t.to}
                to={t.to}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm transition ${
                  active
                    ? "bg-gradient-gold text-primary-foreground shadow-gold"
                    : "border border-gold/20 text-muted-foreground hover:text-gold"
                }`}
              >
                <span>{t.icon}</span>
                {t.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-6">
          <Outlet />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
