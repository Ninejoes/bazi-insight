import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { seo } from "@/lib/seo";
import { useState } from "react";

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
  const [agree, setAgree] = useState(false);
  const [pdpa, setPdpa] = useState(false);

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
          onSubmit={(e) => e.preventDefault()}
          className="glass-strong mt-8 space-y-5 rounded-3xl p-7 shadow-elegant"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="ชื่อ">
              <input className="input-styled" placeholder="ชื่อจริง" />
            </Field>
            <Field label="นามสกุล">
              <input className="input-styled" placeholder="นามสกุล" />
            </Field>
          </div>
          <Field label="ชื่อแสดง (Display Name)">
            <input className="input-styled" placeholder="เช่น Moonlight" />
          </Field>
          <Field label="อีเมล">
            <input type="email" className="input-styled" placeholder="you@example.com" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="วันเกิด">
              <input type="date" className="input-styled" />
            </Field>
            <Field label="เพศ">
              <select className="input-styled">
                <option>หญิง</option>
                <option>ชาย</option>
                <option>ไม่ระบุ</option>
              </select>
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="รหัสผ่าน">
              <input type="password" className="input-styled" placeholder="อย่างน้อย 8 ตัวอักษร" />
            </Field>
            <Field label="ยืนยันรหัสผ่าน">
              <input type="password" className="input-styled" />
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
            disabled={!agree || !pdpa}
            className="w-full rounded-xl bg-gradient-gold py-3 text-sm font-semibold text-primary-foreground shadow-gold disabled:opacity-40 hover:scale-[1.01] transition"
          >
            สร้างบัญชี
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
