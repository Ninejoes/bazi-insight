import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "เข้าสู่ระบบ — Likhitfa" },
      { name: "description", content: "เข้าสู่ระบบ Likhitfa" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader showNav={false} />
      <main className="mx-auto max-w-md px-6 py-16">
        <div className="text-center">
          <div className="text-[11px] uppercase tracking-[0.3em] text-gold/70">SIGN IN</div>
          <h1 className="mt-2 font-display text-4xl text-foreground">เข้าสู่ระบบ</h1>
          <p className="mt-2 text-sm text-muted-foreground">ยินดีต้อนรับกลับสู่ลิขิตฟ้า</p>
        </div>
        <form
          onSubmit={(e) => e.preventDefault()}
          className="glass-strong mt-8 space-y-4 rounded-3xl p-7 shadow-elegant"
        >
          <div>
            <label className="mb-1.5 block text-xs text-muted-foreground">อีเมล</label>
            <input type="email" className="input-styled" placeholder="you@example.com" />
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="block text-xs text-muted-foreground">รหัสผ่าน</label>
              <Link to="/login" className="text-[11px] text-gold/80 hover:text-gold">
                ลืมรหัสผ่าน?
              </Link>
            </div>
            <input type="password" className="input-styled" placeholder="••••••••" />
          </div>
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <input type="checkbox" className="h-4 w-4 accent-[oklch(0.82_0.13_82)]" />{" "}
            จดจำการเข้าสู่ระบบ
          </label>
          <button className="w-full rounded-xl bg-gradient-gold py-3 text-sm font-semibold text-primary-foreground shadow-gold hover:scale-[1.01] transition">
            เข้าสู่ระบบ
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          ยังไม่มีบัญชี?{" "}
          <Link to="/register" className="text-gold hover:underline">
            สมัครสมาชิก
          </Link>
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
