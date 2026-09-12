import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { useEffect, useState } from "react";
import {
  readStoredUserSession,
  storeUserSession,
  clearUserSession,
  type UserSession,
} from "@/lib/user-session";
import { clearAllMemberActivity } from "@/lib/member-history";
import { CheckCircle2, AlertTriangle, ShieldCheck, Save, Trash2, Bell } from "lucide-react";

export const Route = createFileRoute("/profile/settings")({
  head: () =>
    seo({
      title: "ตั้งค่าโปรไฟล์และความเป็นส่วนตัว — Likhitfa",
      description: "ตั้งค่าโปรไฟล์ ความเป็นส่วนตัว และข้อมูลบัญชีผู้ใช้งาน Likhitfa",
      path: "/profile/settings",
      noindex: true,
    }),
  component: SettingsPage,
});

export function SettingsPage() {
  const navigate = useNavigate();
  const [session, setSession] = useState<UserSession | null>(null);

  // Profile Form States
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("1996-08-18");
  const [birthTime, setBirthTime] = useState("09:30");
  const [gender, setGender] = useState("female");

  // Notifications State
  const [notifications, setNotifications] = useState({
    dailyEmail: true,
    newArticles: true,
    promotions: false,
  });

  // UI Feedback States
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    const s = readStoredUserSession();
    if (s) {
      setSession(s);
      setEmail(s.email || "");
      if (s.profile) {
        setFirstName(s.profile.firstName || s.name || "");
        setLastName(s.profile.lastName || "");
        if (s.profile.birthDate) setBirthDate(s.profile.birthDate);
        if (s.profile.gender) setGender(s.profile.gender);
      } else {
        setFirstName(s.name || "");
      }
    }

    try {
      const storedNotifs = localStorage.getItem("likhitfa_notification_prefs");
      if (storedNotifs) setNotifications(JSON.parse(storedNotifs));
      const storedPhone = localStorage.getItem("likhitfa_user_phone");
      if (storedPhone) setPhone(storedPhone);
      const storedTime = localStorage.getItem("likhitfa_user_birth_time");
      if (storedTime) setBirthTime(storedTime);
    } catch {}
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg("");

    const updatedSession: UserSession = {
      ...(session || { role: "User" as const, email, name: firstName }),
      email,
      name: `${firstName} ${lastName}`.trim() || firstName || "ผู้ใช้งาน",
      profile: {
        firstName,
        lastName,
        displayName: `${firstName} ${lastName}`.trim() || firstName,
        birthDate,
        gender,
      },
    };

    storeUserSession(updatedSession);
    setSession(updatedSession);

    try {
      if (phone) localStorage.setItem("likhitfa_user_phone", phone);
      if (birthTime) localStorage.setItem("likhitfa_user_birth_time", birthTime);
    } catch {}

    // Async sync if user has token
    if (session?.accessToken) {
      fetch("/api/user-session", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({
          name: updatedSession.name,
          profile: updatedSession.profile,
        }),
      }).catch(() => {});
    }

    setTimeout(() => {
      setSaving(false);
      setSuccessMsg("บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว");
      setTimeout(() => setSuccessMsg(""), 4000);
    }, 400);
  };

  const handleToggleNotification = (key: keyof typeof notifications) => {
    const next = { ...notifications, [key]: !notifications[key] };
    setNotifications(next);
    try {
      localStorage.setItem("likhitfa_notification_prefs", JSON.stringify(next));
    } catch {}
  };

  const handleDeleteAccount = () => {
    if (deleteInput.trim().toUpperCase() !== "DELETE") {
      setDeleteError("กรุณาพิมพ์คำว่า DELETE ให้ถูกต้องเพื่อยืนยัน");
      return;
    }

    // Perform complete purge
    clearAllMemberActivity();
    clearUserSession();
    try {
      localStorage.removeItem("likhitfa_notification_prefs");
      localStorage.removeItem("likhitfa_user_phone");
      localStorage.removeItem("likhitfa_user_birth_time");
    } catch {}

    window.alert("ลบบัญชี ข้อมูลส่วนตัว และประวัติการใช้งานทั้งหมดเรียบร้อยแล้ว");
    void navigate({ to: "/" });
  };

  return (
    <div className="space-y-8">
      {/* Success Notification Banner */}
      {successMsg && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-400/40 bg-emerald-500/10 p-4 text-sm text-emerald-200">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Profile Info Section */}
      <section className="glass-strong rounded-3xl p-6 md:p-8 shadow-elegant border border-gold/20 space-y-6">
        <div className="border-b border-gold/15 pb-4">
          <h2 className="font-display text-xl text-foreground font-bold flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-gold" />
            <span>ข้อมูลส่วนตัวของสมาชิก</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            ข้อมูลนี้จะถูกใช้เป็นค่าเริ่มต้นในการคำนวณดวงชะตาปาจื้อ กราฟชีวิต และบัตรชะตาชีวิตดิจิทัล
          </p>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gold/90">ชื่อจริง / ชื่อเรียก</label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="input-styled"
                placeholder="เช่น กานต์ หรือ จิรายุ"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gold/90">นามสกุล</label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="input-styled"
                placeholder="นามสกุล"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gold/90">อีเมล</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-styled"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gold/90">เบอร์โทรศัพท์ (ถ้ามี)</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-styled"
                placeholder="08x-xxx-xxxx"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gold/90">วันเดือนปีเกิด (ค.ศ.)</label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="input-styled"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gold/90">เวลาเกิด (สำหรับการผูกดวงจีน 4 เสา)</label>
              <input
                type="time"
                value={birthTime}
                onChange={(e) => setBirthTime(e.target.value)}
                className="input-styled"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gold/90">เพศ</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="input-styled"
              >
                <option value="female">หญิง</option>
                <option value="male">ชาย</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-gold px-7 py-3 text-sm font-semibold text-primary-foreground shadow-gold hover:scale-[1.02] transition cursor-pointer disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? "กำลังบันทึกข้อมูล..." : "บันทึกการเปลี่ยนแปลง"}</span>
            </button>
          </div>
        </form>
      </section>

      {/* Notification Preferences */}
      <section className="glass-strong rounded-3xl p-6 md:p-8 shadow-elegant border border-gold/20 space-y-4">
        <div className="border-b border-gold/15 pb-4">
          <h2 className="font-display text-xl text-foreground font-bold flex items-center gap-2">
            <Bell className="h-5 w-5 text-gold" />
            <span>การแจ้งเตือนและการติดต่อ</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            เลือกรับข้อมูลข่าวสารและดวงชะตาประจำวัน
          </p>
        </div>

        <div className="space-y-3">
          {[
            { key: "dailyEmail" as const, title: "ดวงรายวันและสีเสื้อมงคลยามเช้า", desc: "รับสรุปพลังงานประจำวันและทิศโชคลาภเวลา 06:00 น." },
            { key: "newArticles" as const, title: "บทความใหม่และเคล็ดลับสายมู", desc: "การแจ้งเตือนเมื่อมีบทความฮวงจุ้ยและโหราศาสตร์ใหม่" },
            { key: "promotions" as const, title: "สิทธิพิเศษและกิจกรรมมงคลพิเศษ", desc: "ข่าวสารวอลเปเปอร์ใหม่ และพิกัดงานไหว้พระประจำเทศกาล" },
          ].map((item) => {
            const active = notifications[item.key];
            return (
              <div
                key={item.key}
                onClick={() => handleToggleNotification(item.key)}
                className="flex items-center justify-between rounded-2xl border border-gold/15 bg-card/40 p-4 cursor-pointer hover:border-gold/30 hover:bg-gold/5 transition"
              >
                <div>
                  <div className="text-sm font-semibold text-foreground">{item.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{item.desc}</div>
                </div>

                <div
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${
                    active ? "bg-gradient-gold" : "bg-zinc-800"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      active ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Danger Zone: PDPA Account Purge */}
      <section className="rounded-3xl border border-rose-500/30 bg-rose-500/5 p-6 md:p-8 space-y-4">
        <div className="border-b border-rose-500/20 pb-3">
          <h2 className="font-display text-xl text-rose-300 font-bold flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-rose-400" />
            <span>โซนอันตราย · ลบข้อมูลและบัญชีผู้ใช้</span>
          </h2>
          <p className="text-xs text-rose-200/80 mt-1">
            การลบบัญชีจะล้างข้อมูลส่วนตัว ประวัติการดูดวง ประวัติการอ่านบทความ และรายการที่บันทึกไว้ทั้งหมดของคุณอย่างถาวร ตามมาตรฐาน พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA)
          </p>
        </div>

        {!confirmDelete ? (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="rounded-xl border border-rose-400/50 bg-rose-500/10 px-5 py-2.5 text-xs font-semibold text-rose-200 hover:bg-rose-500/20 transition cursor-pointer"
          >
            ขอลบข้อมูลและบัญชีของฉัน
          </button>
        ) : (
          <div className="space-y-4 rounded-2xl bg-background/60 p-5 border border-rose-500/30">
            <p className="text-xs text-rose-100">
              การกระทำนี้ไม่สามารถเรียกคืนได้ กรุณาพิมพ์คำว่า{" "}
              <span className="font-mono font-bold text-rose-300">DELETE</span> เพื่อยืนยัน:
            </p>

            <input
              value={deleteInput}
              onChange={(e) => {
                setDeleteInput(e.target.value);
                setDeleteError("");
              }}
              placeholder="พิมพ์ DELETE ที่นี่"
              className="input-styled !border-rose-500/40 text-rose-200 font-mono"
            />

            {deleteError && (
              <p className="text-xs text-rose-400 font-medium">{deleteError}</p>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="rounded-xl bg-rose-500 px-5 py-2.5 text-xs font-semibold text-white hover:bg-rose-600 transition cursor-pointer"
              >
                ยืนยันการลบถาวร
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmDelete(false);
                  setDeleteInput("");
                  setDeleteError("");
                }}
                className="rounded-xl border border-gold/20 px-5 py-2.5 text-xs text-muted-foreground hover:text-foreground transition cursor-pointer"
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
