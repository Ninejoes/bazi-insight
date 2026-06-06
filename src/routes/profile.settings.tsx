import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { useState } from "react";

export const Route = createFileRoute("/profile/settings")({
  head: () =>
    seo({
      title: "ตั้งค่าโปรไฟล์",
      description: "ตั้งค่าโปรไฟล์ ความเป็นส่วนตัว และข้อมูลบัญชีผู้ใช้งาน Likhitfa",
      path: "/profile/settings",
      noindex: true,
    }),
  component: SettingsPage,
});

function SettingsPage() {
  const [confirm, setConfirm] = useState(false);

  return (
    <div className="space-y-6">
      <section className="glass-strong rounded-3xl p-6 shadow-elegant">
        <h2 className="font-display text-2xl text-foreground">ข้อมูลส่วนตัว</h2>
        <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
          <Field label="ชื่อ">
            <input className="input-styled" defaultValue="Admin" />
          </Field>
          <Field label="นามสกุล">
            <input className="input-styled" defaultValue="" />
          </Field>
          <Field label="อีเมล">
            <input className="input-styled" defaultValue="admin@gmail.com" />
          </Field>
          <Field label="เบอร์โทรศัพท์">
            <input className="input-styled" placeholder="08x-xxx-xxxx" />
          </Field>
          <Field label="วันเกิด">
            <input type="date" className="input-styled" defaultValue="1995-08-12" />
          </Field>
          <Field label="เวลาเกิด">
            <input type="time" className="input-styled" defaultValue="07:30" />
          </Field>
          <div className="md:col-span-2">
            <button className="rounded-xl bg-gradient-gold px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-gold">
              บันทึก
            </button>
          </div>
        </form>
      </section>

      <section className="glass-strong rounded-3xl p-6">
        <h2 className="font-display text-xl text-foreground">การแจ้งเตือน</h2>
        <div className="mt-4 space-y-3">
          {[
            { label: "ดวงรายวันทางอีเมล", on: true },
            { label: "บทความใหม่จากผู้เชี่ยวชาญ", on: true },
            { label: "ข่าวสารโปรโมชั่น", on: false },
          ].map((n) => (
            <label
              key={n.label}
              className="flex items-center justify-between rounded-xl border border-gold/10 bg-background/40 px-4 py-3 text-sm"
            >
              <span className="text-foreground">{n.label}</span>
              <input
                type="checkbox"
                defaultChecked={n.on}
                className="h-4 w-8 appearance-none rounded-full bg-card relative cursor-pointer checked:bg-gradient-gold"
              />
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-rose-400/30 bg-rose-400/5 p-6">
        <h2 className="font-display text-xl text-rose-200">โซนอันตราย · ลบข้อมูล</h2>
        <p className="mt-2 text-sm text-rose-100/80">
          การลบบัญชีจะลบข้อมูลส่วนตัว ประวัติการดูดวง และการตั้งค่าทั้งหมดของคุณอย่างถาวร
          ตามสิทธิ์ของผู้ใช้งานภายใต้ PDPA
        </p>

        {!confirm ? (
          <button
            onClick={() => setConfirm(true)}
            className="mt-4 rounded-xl border border-rose-400/50 px-5 py-2.5 text-sm text-rose-200 hover:bg-rose-400/10"
          >
            ลบข้อมูลและบัญชี
          </button>
        ) : (
          <div className="mt-4 space-y-3 rounded-2xl bg-background/40 p-4">
            <p className="text-sm text-rose-100">
              คุณแน่ใจหรือไม่? พิมพ์{" "}
              <span className="font-mono font-bold text-rose-200">DELETE</span> เพื่อยืนยัน
            </p>
            <input className="input-styled" placeholder="DELETE" />
            <div className="flex gap-2">
              <button className="rounded-xl bg-rose-500/80 px-5 py-2 text-sm font-semibold text-white">
                ยืนยันการลบ
              </button>
              <button
                onClick={() => setConfirm(false)}
                className="rounded-xl border border-gold/20 px-5 py-2 text-sm"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        )}
      </section>
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
