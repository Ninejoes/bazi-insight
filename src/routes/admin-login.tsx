import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { seo } from "@/lib/seo";
import { useState } from "react";

export const Route = createFileRoute("/admin-login")({
  head: () =>
    seo({
      title: "เข้าสู่ระบบแอดมิน",
      description: "เข้าสู่ระบบสำหรับผู้ดูแล Likhitfa",
      path: "/admin-login",
      noindex: true,
    }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password"),
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.ok || !data.session) {
        setError(data.error || "ไม่สามารถเข้าสู่ระบบแอดมินได้");
        return;
      }

      window.localStorage.setItem("likhitfa-admin-session", JSON.stringify(data.session));
      window.localStorage.removeItem("likhitfa-admin-auth");
      void navigate({ to: "/admin" });
    } catch {
      setError("เชื่อมต่อระบบเข้าสู่ระบบไม่ได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setSubmitting(false);
    }
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
            <input
              type="email"
              name="email"
              className="input-styled"
              placeholder="admin@gmail.com"
              autoComplete="email"
              required
            />
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="block text-xs text-muted-foreground">รหัสผ่าน</label>
            </div>
            <input
              type="password"
              name="password"
              className="input-styled"
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>
          {error ? (
            <div className="rounded-xl border border-rose-400/25 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">
              {error}
            </div>
          ) : null}
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <input type="checkbox" className="h-4 w-4 accent-[oklch(0.82_0.13_82)]" />{" "}
            จดจำการเข้าสู่ระบบ
          </label>
          <button
            disabled={submitting}
            className="w-full rounded-xl bg-gradient-gold py-3 text-sm font-semibold text-primary-foreground shadow-gold transition hover:scale-[1.01] disabled:cursor-wait disabled:opacity-60"
          >
            {submitting ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบแอดมิน"}
          </button>
        </form>
      </main>
    </div>
  );
}
