import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";

export const Route = createFileRoute("/admin-login")({
  head: () => ({
    meta: [
      { title: "เข้าสู่ระบบแอดมิน — Likhitfa" },
      { name: "description", content: "เข้าสู่ระบบสำหรับผู้ดูแล Likhitfa" },
    ],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    window.localStorage.setItem("likhitfa-admin-auth", "true");
    void navigate({ to: "/admin" });
  };

  return (
    <div className="min-h-screen">
      <SiteHeader showNav={false} />
      <main className="mx-auto max-w-md px-6 py-16">
        <div className="text-center">
          <div className="text-[11px] uppercase tracking-[0.3em] text-gold/70">ADMIN SIGN IN</div>
          <h1 className="mt-2 font-display text-4xl text-foreground">เข้าสู่ระบบแอดมิน</h1>
          <p className="mt-2 text-sm text-muted-foreground">สำหรับผู้ดูแลระบบหลังบ้าน Likhitfa</p>
        </div>
        <form
          onSubmit={submit}
          className="glass-strong mt-8 space-y-4 rounded-3xl p-7 shadow-elegant"
        >
          <div>
            <label className="mb-1.5 block text-xs text-muted-foreground">อีเมลแอดมิน</label>
            <input type="email" className="input-styled" placeholder="admin@likhitfa.com" />
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="block text-xs text-muted-foreground">รหัสผ่าน</label>
            </div>
            <input type="password" className="input-styled" placeholder="••••••••" />
          </div>
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <input type="checkbox" className="h-4 w-4 accent-[oklch(0.82_0.13_82)]" />{" "}
            จดจำการเข้าสู่ระบบ
          </label>
          <button className="w-full rounded-xl bg-gradient-gold py-3 text-sm font-semibold text-primary-foreground shadow-gold transition hover:scale-[1.01]">
            เข้าสู่ระบบแอดมิน
          </button>
        </form>
      </main>
    </div>
  );
}
