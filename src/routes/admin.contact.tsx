import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { useEffect, useState } from "react";
import { siteContentSeed, type SiteContent } from "@/lib/admin-content";
import { friendlyErrorMessage } from "@/lib/friendly-error";
import { adminAuthHeaders } from "@/lib/admin-auth";

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
  const [content, setContent] = useState<SiteContent>(siteContentSeed);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadContent() {
      const response = await fetch("/api/site-content");
      const data = await response.json().catch(() => ({}));
      if (!mounted) return;
      if (!response.ok || !data.ok) {
        setNotice(friendlyErrorMessage(data.error, "โหลดข้อมูลเว็บไซต์ไม่สำเร็จ"));
        setLoading(false);
        return;
      }

      if (mounted && data.ok) {
        setContent(data.content || siteContentSeed);
        setNotice(
          data.error
            ? friendlyErrorMessage(data.error, "เชื่อมต่อข้อมูลเว็บไซต์ไม่ได้")
            : data.source === "supabase"
              ? "เชื่อมต่อข้อมูลเว็บไซต์จาก Supabase แล้ว"
              : "",
        );
      }
      if (mounted) setLoading(false);
    }

    void loadContent();

    return () => {
      mounted = false;
    };
  }, []);

  const saveContent = async (next: SiteContent, message: string) => {
    const response = await fetch("/api/site-content", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...adminAuthHeaders() },
      body: JSON.stringify(next),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.ok) {
      setNotice(friendlyErrorMessage(data.error, "บันทึกข้อมูลเว็บไซต์ไม่สำเร็จ"));
      return;
    }
    setContent(data.content || next);
    setNotice(message);
  };

  const saveAbout = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    void saveContent(
      {
        ...content,
        about: {
          title: String(form.get("title") || ""),
          description: String(form.get("description") || ""),
          story: String(form.get("story") || "")
            .split(/\n\s*\n/)
            .map((part) => part.trim())
            .filter(Boolean),
          vision: String(form.get("vision") || ""),
          mission: String(form.get("mission") || ""),
        },
      },
      "บันทึกหน้าเกี่ยวกับเราแล้ว และซิงก์ไปหน้า public แล้ว",
    );
  };

  const saveContact = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    void saveContent(
      {
        ...content,
        contact: {
          email: String(form.get("email") || ""),
          phone: String(form.get("phone") || ""),
          line: String(form.get("line") || ""),
          facebook: String(form.get("facebook") || ""),
          address: String(form.get("address") || ""),
          hoursWeekday: String(form.get("hoursWeekday") || ""),
          hoursSaturday: String(form.get("hoursSaturday") || ""),
        },
      },
      "บันทึกช่องทางติดต่อแล้ว และซิงก์ไปหน้า public แล้ว",
    );
  };

  const { about, contact } = content;

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

      {loading ? (
        <div className="rounded-2xl border border-gold/10 bg-gold/5 px-4 py-3 text-sm text-muted-foreground">
          กำลังโหลดข้อมูลเว็บไซต์จากระบบกลาง...
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
          <Field label="เรื่องราวของเรา (เว้นบรรทัดว่างเพื่อแยกย่อหน้า)">
            <textarea
              name="story"
              className="input-styled !h-32 py-3"
              defaultValue={about.story.join("\n\n")}
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
          <Field label="เวลาทำการวันธรรมดา">
            <input
              name="hoursWeekday"
              className="input-styled"
              defaultValue={contact.hoursWeekday}
            />
          </Field>
          <Field label="เวลาทำการวันเสาร์">
            <input
              name="hoursSaturday"
              className="input-styled"
              defaultValue={contact.hoursSaturday}
            />
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
