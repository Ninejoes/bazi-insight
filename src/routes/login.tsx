import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { seo } from "@/lib/seo";
import { useState } from "react";
import { storeUserSession, type UserSession } from "@/lib/user-session";
import { friendlyErrorMessage } from "@/lib/friendly-error";

export const Route = createFileRoute("/login")({
  head: () =>
    seo({
      title: "เข้าสู่ระบบ",
      description: "เข้าสู่ระบบ Likhitfa เพื่อบันทึกประวัติการดูดวงและจัดการข้อมูลส่วนตัว",
      path: "/login",
      noindex: true,
    }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

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
          onSubmit={async (e) => {
            e.preventDefault();
            setNotice("");
            setLoading(true);
            const form = new FormData(e.currentTarget);
            const response = await fetch("/api/user-login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: form.get("email"),
                password: form.get("password"),
              }),
            });
            const data = (await response.json().catch(() => ({}))) as {
              ok?: boolean;
              error?: string;
              session?: UserSession;
            };
            setLoading(false);
            if (!response.ok || !data.ok || !data.session) {
              setNotice(friendlyErrorMessage(data.error, "เข้าสู่ระบบไม่สำเร็จ"));
              return;
            }
            storeUserSession(data.session);
            void navigate({ to: "/profile" });
          }}
          className="glass-strong mt-8 space-y-4 rounded-3xl p-7 shadow-elegant"
        >
          {notice ? (
            <div className="rounded-2xl border border-rose-400/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
              {notice}
            </div>
          ) : null}
          <div>
            <label className="mb-1.5 block text-xs text-muted-foreground">อีเมล</label>
            <input
              name="email"
              type="email"
              className="input-styled"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="block text-xs text-muted-foreground">รหัสผ่าน</label>
              <Link to="/login" className="text-[11px] text-gold/80 hover:text-gold">
                ลืมรหัสผ่าน?
              </Link>
            </div>
            <input
              name="password"
              type="password"
              className="input-styled"
              placeholder="••••••••"
              required
            />
          </div>
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <input type="checkbox" className="h-4 w-4 accent-[oklch(0.82_0.13_82)]" />{" "}
            จดจำการเข้าสู่ระบบ
          </label>
          <button
            disabled={loading}
            className="w-full rounded-xl bg-gradient-gold py-3 text-sm font-semibold text-primary-foreground shadow-gold hover:scale-[1.01] transition disabled:opacity-50"
          >
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
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
