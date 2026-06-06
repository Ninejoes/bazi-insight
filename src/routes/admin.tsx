import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { BrandMark } from "@/components/site-header";

export const Route = createFileRoute("/admin")({
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

function AdminLayout() {
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen bg-[oklch(0.12_0.018_260)]">
      <div className="flex min-h-screen">
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
        </aside>

        <div className="flex-1">
          <header className="flex items-center justify-between border-b border-gold/10 bg-[oklch(0.10_0.018_260)]/80 px-6 py-4 backdrop-blur">
            <div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-gold/70">ADMIN</div>
              <div className="font-display text-lg text-foreground">ระบบหลังบ้าน</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden text-right md:block">
                <div className="text-sm text-foreground">Admin User</div>
                <div className="text-[11px] text-muted-foreground">admin@likhitfa.com</div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-gold font-bold text-primary-foreground">
                A
              </div>
            </div>
          </header>

          <main className="p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
