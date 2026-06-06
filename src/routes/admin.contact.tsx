import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/admin/contact")({
  head: () =>
    seo({
      title: "ปรับแต่งข้อมูลติดต่อ — Admin",
      description: "จัดการข้อมูลติดต่อและหน้าเกี่ยวกับเราในระบบหลังบ้าน",
      path: "/admin/contact",
      noindex: true,
    }),
  component: AdminContact,
});

function AdminContact() {
  const [notice, setNotice] = useState("");
  const [about, setAbout] = useState({
    title: "ลิขิตฟ้า · ศาสตร์โบราณในมือคุณ",
    description: "Likhitfa เกิดจากความตั้งใจที่จะนำศาสตร์ดูดวงตะวันออก...",
    vision: "ทำให้ศาสตร์การดูดวงเป็นเครื่องมือที่ใช้ทบทวนตัวเองได้ทุกวัน",
    mission: "ส่งมอบประสบการณ์ดูดวงที่งดงาม น่าเชื่อถือ และมีจริยธรรม",
  });
  const [contact, setContact] = useState({
    email: "hello@likhitfa.com",
    phone: "02-123-4567",
    line: "@likhitfa",
    facebook: "facebook.com/likhitfa",
    address: "ชั้น 12 อาคารฟ้าลิขิต ถ.สุขุมวิท กรุงเทพฯ 10110",
  });

  useEffect(() => {
    const savedAbout = window.localStorage.getItem("likhitfa-admin-about");
    const savedContact = window.localStorage.getItem("likhitfa-admin-contact");
    if (savedAbout) setAbout(JSON.parse(savedAbout));
    if (savedContact) setContact(JSON.parse(savedContact));
  }, []);

  const saveAbout = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const next = {
      title: String(form.get("title") || ""),
      description: String(form.get("description") || ""),
      vision: String(form.get("vision") || ""),
      mission: String(form.get("mission") || ""),
    };
    setAbout(next);
    window.localStorage.setItem("likhitfa-admin-about", JSON.stringify(next));
    setNotice("บันทึกหน้าเกี่ยวกับเราแล้ว");
  };

  const saveContact = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const next = {
      email: String(form.get("email") || ""),
      phone: String(form.get("phone") || ""),
      line: String(form.get("line") || ""),
      facebook: String(form.get("facebook") || ""),
      address: String(form.get("address") || ""),
    };
    setContact(next);
    window.localStorage.setItem("likhitfa-admin-contact", JSON.stringify(next));
    setNotice("บันทึกช่องทางติดต่อแล้ว");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-foreground">ข้อมูลติดต่อและเกี่ยวกับเรา</h1>
        <p className="text-sm text-muted-foreground">
          ปรับเนื้อหาที่แสดงในหน้า /about และ /contact
        </p>
      </div>

      {notice ? (
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
          {notice}
        </div>
      ) : null}

      <section className="glass-strong rounded-3xl p-6">
        <h2 className="font-display text-xl text-foreground">หน้าเกี่ยวกับเรา</h2>
        <form className="mt-5 space-y-4" onSubmit={saveAbout}>
          <Field label="หัวข้อหลัก">
            <input name="title" className="input-styled" defaultValue={about.title} />
          </Field>
          <Field label="คำอธิบายสั้น">
            <textarea
              name="description"
              className="input-styled !h-24 py-3"
              defaultValue={about.description}
            />
          </Field>
          <Field label="วิสัยทัศน์">
            <textarea
              name="vision"
              className="input-styled !h-20 py-3"
              defaultValue={about.vision}
            />
          </Field>
          <Field label="พันธกิจ">
            <textarea
              name="mission"
              className="input-styled !h-20 py-3"
              defaultValue={about.mission}
            />
          </Field>
          <button className="rounded-xl bg-gradient-gold px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-gold">
            บันทึก
          </button>
        </form>
      </section>

      <section className="glass-strong rounded-3xl p-6">
        <h2 className="font-display text-xl text-foreground">ช่องทางติดต่อ</h2>
        <form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={saveContact}>
          <Field label="อีเมล">
            <input name="email" className="input-styled" defaultValue={contact.email} />
          </Field>
          <Field label="โทรศัพท์">
            <input name="phone" className="input-styled" defaultValue={contact.phone} />
          </Field>
          <Field label="Line Official">
            <input name="line" className="input-styled" defaultValue={contact.line} />
          </Field>
          <Field label="Facebook">
            <input name="facebook" className="input-styled" defaultValue={contact.facebook} />
          </Field>
          <div className="md:col-span-2">
            <Field label="ที่อยู่">
              <textarea
                name="address"
                className="input-styled !h-20 py-3"
                defaultValue={contact.address}
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
