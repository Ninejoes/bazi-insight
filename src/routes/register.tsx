import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { seo } from "@/lib/seo";
import { useState } from "react";
import { storeUserSession, type UserSession } from "@/lib/user-session";

export const Route = createFileRoute("/register")({
  head: () =>
    seo({
      title: "สมัครสมาชิก",
      description:
        "สมัครสมาชิก Likhitfa เพื่อบันทึกประวัติการดูดวง ตั้งค่าโปรไฟล์ และใช้งานฟีเจอร์ส่วนตัว",
      path: "/register",
      noindex: true,
    }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const [agree, setAgree] = useState(false);
  const [pdpa, setPdpa] = useState(false);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen">
      <SiteHeader showNav={false} />
      <main className="mx-auto max-w-2xl px-6 py-12">
        <div className="text-center">
          <div className="text-[11px] uppercase tracking-[0.3em] text-gold/70">CREATE ACCOUNT</div>
          <h1 className="mt-2 font-display text-4xl text-foreground">สมัครสมาชิก</h1>
          <p className="mt-2 text-sm text-muted-foreground">เริ่มต้นบันทึกประวัติการดูดวงของคุณ</p>
        </div>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setNotice("");
            const form = new FormData(e.currentTarget);
            const password = String(form.get("password") || "");
            const confirmPassword = String(form.get("confirmPassword") || "");
            if (password !== confirmPassword) {
              setNotice("รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน");
              return;
            }
            setLoading(true);
            const response = await fetch("/api/user-register", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                firstName: form.get("firstName"),
                lastName: form.get("lastName"),
                displayName: form.get("displayName"),
                email: form.get("email"),
                birthDate: form.get("birthDate"),
                gender: form.get("gender"),
                password,
              }),
            });
            const data = (await response.json().catch(() => ({}))) as {
              ok?: boolean;
              error?: string;
              session?: UserSession;
            };
            setLoading(false);
            if (!response.ok || !data.ok || !data.session) {
              setNotice(data.error || "สมัครสมาชิกไม่สำเร็จ");
              return;
            }
            storeUserSession(data.session);
            void navigate({ to: "/profile" });
          }}
          className="glass-strong mt-8 space-y-5 rounded-3xl p-7 shadow-elegant"
        >
          {notice ? (
            <div className="rounded-2xl border border-rose-400/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
              {notice}
            </div>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="ชื่อ">
              <input name="firstName" className="input-styled" placeholder="ชื่อจริง" required />
            </Field>
            <Field label="นามสกุล">
              <input name="lastName" className="input-styled" placeholder="นามสกุล" />
            </Field>
          </div>
          <Field label="ชื่อแสดง (Display Name)">
            <input name="displayName" className="input-styled" placeholder="เช่น Moonlight" />
          </Field>
          <Field label="อีเมล">
            <input
              name="email"
              type="email"
              className="input-styled"
              placeholder="you@example.com"
              required
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="วันเกิด">
              <input name="birthDate" type="date" className="input-styled" />
            </Field>
            <Field label="เพศ">
              <select name="gender" className="input-styled">
                <option>หญิง</option>
                <option>ชาย</option>
                <option>ไม่ระบุ</option>
              </select>
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="รหัสผ่าน">
              <input
                name="password"
                type="password"
                className="input-styled"
                placeholder="อย่างน้อย 8 ตัวอักษร"
                minLength={8}
                required
              />
            </Field>
            <Field label="ยืนยันรหัสผ่าน">
              <input
                name="confirmPassword"
                type="password"
                className="input-styled"
                minLength={8}
                required
              />
            </Field>
          </div>

          <div className="rounded-2xl border border-gold/15 bg-background/40 p-4 text-xs leading-relaxed text-muted-foreground">
            <div className="mb-2 font-semibold text-gold">
              เงื่อนไขการใช้งานและความเป็นส่วนตัว (PDPA)
            </div>
            <p>
              เราเก็บข้อมูลของคุณเพื่อให้บริการดูดวงและบันทึกประวัติส่วนตัว
              ข้อมูลทั้งหมดถูกเข้ารหัสและไม่ถูกแชร์กับบุคคลที่สามโดยไม่ได้รับอนุญาต
              คุณสามารถลบข้อมูลส่วนตัวได้ทุกเมื่อจากหน้าโปรไฟล์ ตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล
              (PDPA)
            </p>
          </div>

          <div className="space-y-2 text-xs">
            <label className="flex gap-2 text-muted-foreground">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-[oklch(0.82_0.13_82)]"
              />
              ฉันยอมรับ{" "}
              <Link to="/help" className="text-gold underline">
                เงื่อนไขการใช้งาน
              </Link>
            </label>
            <label className="flex gap-2 text-muted-foreground">
              <input
                type="checkbox"
                checked={pdpa}
                onChange={(e) => setPdpa(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-[oklch(0.82_0.13_82)]"
              />
              ฉันยินยอมให้เก็บและใช้ข้อมูลส่วนบุคคลตามนโยบาย PDPA
            </label>
          </div>

          <button
            disabled={!agree || !pdpa || loading}
            className="w-full rounded-xl bg-gradient-gold py-3 text-sm font-semibold text-primary-foreground shadow-gold disabled:opacity-40 hover:scale-[1.01] transition"
          >
            {loading ? "กำลังสร้างบัญชี..." : "สร้างบัญชี"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          มีบัญชีแล้ว?{" "}
          <Link to="/login" className="text-gold hover:underline">
            เข้าสู่ระบบ
          </Link>
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}
