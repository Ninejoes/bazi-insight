import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/contact")({
  head: () => ({ meta: [{ title: "ปรับแต่งข้อมูลติดต่อ — Admin" }] }),
  component: AdminContact,
});

function AdminContact() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-foreground">ข้อมูลติดต่อและเกี่ยวกับเรา</h1>
        <p className="text-sm text-muted-foreground">
          ปรับเนื้อหาที่แสดงในหน้า /about และ /contact
        </p>
      </div>

      <section className="glass-strong rounded-3xl p-6">
        <h2 className="font-display text-xl text-foreground">หน้าเกี่ยวกับเรา</h2>
        <form className="mt-5 space-y-4" onSubmit={(e) => e.preventDefault()}>
          <Field label="หัวข้อหลัก">
            <input className="input-styled" defaultValue="ลิขิตฟ้า · ศาสตร์โบราณในมือคุณ" />
          </Field>
          <Field label="คำอธิบายสั้น">
            <textarea
              className="input-styled !h-24 py-3"
              defaultValue="Likhitfa เกิดจากความตั้งใจที่จะนำศาสตร์ดูดวงตะวันออก..."
            />
          </Field>
          <Field label="วิสัยทัศน์">
            <textarea
              className="input-styled !h-20 py-3"
              defaultValue="ทำให้ศาสตร์การดูดวงเป็นเครื่องมือที่ใช้ทบทวนตัวเองได้ทุกวัน"
            />
          </Field>
          <Field label="พันธกิจ">
            <textarea
              className="input-styled !h-20 py-3"
              defaultValue="ส่งมอบประสบการณ์ดูดวงที่งดงาม น่าเชื่อถือ และมีจริยธรรม"
            />
          </Field>
          <button className="rounded-xl bg-gradient-gold px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-gold">
            บันทึก
          </button>
        </form>
      </section>

      <section className="glass-strong rounded-3xl p-6">
        <h2 className="font-display text-xl text-foreground">ช่องทางติดต่อ</h2>
        <form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
          <Field label="อีเมล">
            <input className="input-styled" defaultValue="hello@likhitfa.com" />
          </Field>
          <Field label="โทรศัพท์">
            <input className="input-styled" defaultValue="02-123-4567" />
          </Field>
          <Field label="Line Official">
            <input className="input-styled" defaultValue="@likhitfa" />
          </Field>
          <Field label="Facebook">
            <input className="input-styled" defaultValue="facebook.com/likhitfa" />
          </Field>
          <div className="md:col-span-2">
            <Field label="ที่อยู่">
              <textarea
                className="input-styled !h-20 py-3"
                defaultValue="ชั้น 12 อาคารฟ้าลิขิต ถ.สุขุมวิท กรุงเทพฯ 10110"
              />
            </Field>
          </div>
          <div className="md:col-span-2">
            <button className="rounded-xl bg-gradient-gold px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-gold">
              บันทึก
            </button>
          </div>
        </form>
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
