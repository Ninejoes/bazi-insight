import { useEffect, useState } from "react";
import { Sparkles, Compass } from "lucide-react";

interface AuspiciousHourInfo {
  branchName: string;
  branchCn: string;
  timeRange: string;
  omenType: "ธงชัย" | "อธิบดี" | "มหัทธโน" | "ราชา" | "ลาภะ";
  omenMeaning: string;
  wealthDirection: string;
  element: string;
}

const HOURS_DATA: Record<number, AuspiciousHourInfo> = {
  23: { branchName: "ยามชวด (หนู)", branchCn: "子时", timeRange: "23:00 - 00:59 น.", omenType: "มหัทธโน", omenMeaning: "ยามสะสมทรัพย์ ก่อร่างสร้างตัว ปัญญาเฉียบแหลม", wealthDirection: "ทิศเหนือ", element: "ธาตุน้ำ" },
  0: { branchName: "ยามชวด (หนู)", branchCn: "子时", timeRange: "23:00 - 00:59 น.", omenType: "มหัทธโน", omenMeaning: "ยามสะสมทรัพย์ ก่อร่างสร้างตัว ปัญญาเฉียบแหลม", wealthDirection: "ทิศเหนือ", element: "ธาตุน้ำ" },
  1: { branchName: "ยามฉลู (วัว)", branchCn: "丑时", timeRange: "01:00 - 02:59 น.", omenType: "อธิบดี", omenMeaning: "ยามมั่นคง หนักแน่น เหมาะแก่การวางรากฐาน", wealthDirection: "ทิศตะวันออกเฉียงเหนือ", element: "ธาตุดิน" },
  2: { branchName: "ยามฉลู (วัว)", branchCn: "丑时", timeRange: "01:00 - 02:59 น.", omenType: "อธิบดี", omenMeaning: "ยามมั่นคง หนักแน่น เหมาะแก่การวางรากฐาน", wealthDirection: "ทิศตะวันออกเฉียงเหนือ", element: "ธาตุดิน" },
  3: { branchName: "ยามขาล (เสือ)", branchCn: "寅时", timeRange: "03:00 - 04:59 น.", omenType: "ราชา", omenMeaning: "ยามรุ่งอรุณ บารมีแผ่กว้าง อำนาจเด็ดขาด", wealthDirection: "ทิศตะวันออก", element: "ธาตุไม้" },
  4: { branchName: "ยามขาล (เสือ)", branchCn: "寅时", timeRange: "03:00 - 04:59 น.", omenType: "ราชา", omenMeaning: "ยามรุ่งอรุณ บารมีแผ่กว้าง อำนาจเด็ดขาด", wealthDirection: "ทิศตะวันออก", element: "ธาตุไม้" },
  5: { branchName: "ยามเถาะ (กระต่าย)", branchCn: "卯时", timeRange: "05:00 - 06:59 น.", omenType: "ธงชัย", omenMeaning: "ยามอรุณรุ่ง เปิดรับทรัพย์และโชคลาภการค้า", wealthDirection: "ทิศตะวันออก", element: "ธาตุไม้" },
  6: { branchName: "ยามเถาะ (กระต่าย)", branchCn: "卯时", timeRange: "05:00 - 06:59 น.", omenType: "ธงชัย", omenMeaning: "ยามอรุณรุ่ง เปิดรับทรัพย์และโชคลาภการค้า", wealthDirection: "ทิศตะวันออก", element: "ธาตุไม้" },
  7: { branchName: "ยามมะโรง (มังกร)", branchCn: "辰时", timeRange: "07:00 - 08:59 น.", omenType: "ธงชัย", omenMeaning: "ยามมังกรเหิน ฤกษ์มงคลสูงสุด เริ่มต้นสิ่งใดก็สำเร็จ", wealthDirection: "ทิศตะวันออกเฉียงใต้", element: "ธาตุดิน" },
  8: { branchName: "ยามมะโรง (มังกร)", branchCn: "辰时", timeRange: "07:00 - 08:59 น.", omenType: "ธงชัย", omenMeaning: "ยามมังกรเหิน ฤกษ์มงคลสูงสุด เริ่มต้นสิ่งใดก็สำเร็จ", wealthDirection: "ทิศตะวันออกเฉียงใต้", element: "ธาตุดิน" },
  9: { branchName: "ยามมะเส็ง (งูเล็ก)", branchCn: "巳时", timeRange: "09:00 - 10:59 น.", omenType: "ลาภะ", omenMeaning: "ยามสายรับทรัพย์ เหมาะแก่การเจรจาค้าขายและลงนาม", wealthDirection: "ทิศใต้", element: "ธาตุไฟ" },
  10: { branchName: "ยามมะเส็ง (งูเล็ก)", branchCn: "巳时", timeRange: "09:00 - 10:59 น.", omenType: "ลาภะ", omenMeaning: "ยามสายรับทรัพย์ เหมาะแก่การเจรจาค้าขายและลงนาม", wealthDirection: "ทิศใต้", element: "ธาตุไฟ" },
  11: { branchName: "ยามมะเมีย (ม้า)", branchCn: "午时", timeRange: "11:00 - 12:59 น.", omenType: "ราชา", omenMeaning: "ยามสุริยันเจิดจ้า พลังหยางสูงสุด ชัยชนะและเกียรติยศ", wealthDirection: "ทิศใต้", element: "ธาตุไฟ" },
  12: { branchName: "ยามมะเมีย (ม้า)", branchCn: "午时", timeRange: "11:00 - 12:59 น.", omenType: "ราชา", omenMeaning: "ยามสุริยันเจิดจ้า พลังหยางสูงสุด ชัยชนะและเกียรติยศ", wealthDirection: "ทิศใต้", element: "ธาตุไฟ" },
  13: { branchName: "ยามมะแม (แพะ)", branchCn: "未时", timeRange: "13:00 - 14:59 น.", omenType: "มหัทธโน", omenMeaning: "ยามเย็นใจ เมตตามหานิยม ความร่วมมือราบรื่น", wealthDirection: "ทิศตะวันตกเฉียงใต้", element: "ธาตุดิน" },
  14: { branchName: "ยามมะแม (แพะ)", branchCn: "未时", timeRange: "13:00 - 14:59 น.", omenType: "มหัทธโน", omenMeaning: "ยามเย็นใจ เมตตามหานิยม ความร่วมมือราบรื่น", wealthDirection: "ทิศตะวันตกเฉียงใต้", element: "ธาตุดิน" },
  15: { branchName: "ยามวอก (ลิง)", branchCn: "申时", timeRange: "15:00 - 16:59 น.", omenType: "ลาภะ", omenMeaning: "ยามคล่องตัว พลิกแพลงแก้ไขอุปสรรค เจรจาสำเร็จ", wealthDirection: "ทิศตะวันตก", element: "ธาตุทอง" },
  16: { branchName: "ยามวอก (ลิง)", branchCn: "申时", timeRange: "15:00 - 16:59 น.", omenType: "ลาภะ", omenMeaning: "ยามคล่องตัว พลิกแพลงแก้ไขอุปสรรค เจรจาสำเร็จ", wealthDirection: "ทิศตะวันตก", element: "ธาตุทอง" },
  17: { branchName: "ยามระกา (ไก่)", branchCn: "酉时", timeRange: "17:00 - 18:59 น.", omenType: "อธิบดี", omenMeaning: "ยามสนธยา สรุปผลกำไร รับทรัพย์กลับเรือน", wealthDirection: "ทิศตะวันตก", element: "ธาตุทอง" },
  18: { branchName: "ยามระกา (ไก่)", branchCn: "酉时", timeRange: "17:00 - 18:59 น.", omenType: "อธิบดี", omenMeaning: "ยามสนธยา สรุปผลกำไร รับทรัพย์กลับเรือน", wealthDirection: "ทิศตะวันตก", element: "ธาตุทอง" },
  19: { branchName: "ยามจอ (หมา)", branchCn: "戌时", timeRange: "19:00 - 20:59 น.", omenType: "มหัทธโน", omenMeaning: "ยามราตรีสวัสดิ์ คุ้มครองเคหสถาน ครอบครัวอบอุ่น", wealthDirection: "ทิศตะวันตกเฉียงเหนือ", element: "ธาตุดิน" },
  20: { branchName: "ยามจอ (หมา)", branchCn: "戌时", timeRange: "19:00 - 20:59 น.", omenType: "มหัทธโน", omenMeaning: "ยามราตรีสวัสดิ์ คุ้มครองเคหสถาน ครอบครัวอบอุ่น", wealthDirection: "ทิศตะวันตกเฉียงเหนือ", element: "ธาตุดิน" },
  21: { branchName: "ยามกุน (หมู)", branchCn: "亥时", timeRange: "21:00 - 22:59 น.", omenType: "ลาภะ", omenMeaning: "ยามสงบสุข อุดมสมบูรณ์ จิตผ่องแผ้วพร้อมรับวันใหม่", wealthDirection: "ทิศตะวันตกเฉียงเหนือ", element: "ธาตุน้ำ" },
  22: { branchName: "ยามกุน (หมู)", branchCn: "亥时", timeRange: "21:00 - 22:59 น.", omenType: "ลาภะ", omenMeaning: "ยามสงบสุข อุดมสมบูรณ์ จิตผ่องแผ้วพร้อมรับวันใหม่", wealthDirection: "ทิศตะวันตกเฉียงเหนือ", element: "ธาตุน้ำ" },
};

export function AuspiciousHourTicker() {
  const [hourInfo, setHourInfo] = useState<AuspiciousHourInfo | null>(null);
  const [timeStr, setTimeStr] = useState("");
  const [dateStr, setDateStr] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const currentHour = now.getHours();
      setHourInfo(HOURS_DATA[currentHour] || HOURS_DATA[12]);
      setTimeStr(now.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }));
      setDateStr(now.toLocaleDateString("th-TH", { weekday: "long", day: "numeric", month: "long", year: "numeric" }));
    };

    update();
    const timer = setInterval(update, 30000);
    return () => clearInterval(timer);
  }, []);

  if (!hourInfo) return null;

  return (
    <div className="relative mx-auto mb-8 inline-flex max-w-full flex-wrap items-center justify-center gap-2.5 rounded-full border border-gold/40 bg-gradient-to-r from-[#171b26]/90 via-[#0d1017]/90 to-[#171b26]/90 px-4 py-2 text-xs shadow-[0_0_25px_rgba(212,175,55,0.2)] backdrop-blur-md">
      {/* Live Blinking Green Dot */}
      <div className="flex items-center gap-1.5 text-emerald-400">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wider">สด</span>
      </div>

      <span className="h-3 w-px bg-gold/30 hidden sm:inline" />

      {/* Date & Current Time */}
      <span className="text-slate-300 font-medium">
        {dateStr}
      </span>

      <span className="h-3 w-px bg-gold/30" />

      {/* Auspicious Hour Badge */}
      <div className="inline-flex items-center gap-1.5 text-gold font-semibold">
        <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
        <span>ฤกษ์ปัจจุบัน:</span>
        <span className="rounded-md bg-gold/15 px-1.5 py-0.5 text-amber-200 border border-gold/30 text-[11px]">
          {hourInfo.branchName} ({hourInfo.branchCn})
        </span>
        <span className="text-emerald-300">[{hourInfo.omenType}]</span>
      </div>

      <span className="h-3 w-px bg-gold/30 hidden md:inline" />

      {/* Wealth Direction */}
      <div className="hidden md:inline-flex items-center gap-1 text-slate-300 text-[11px]">
        <Compass className="h-3 w-3 text-gold" />
        <span>ทิศรับทรัพย์: <strong className="text-amber-200">{hourInfo.wealthDirection}</strong></span>
      </div>
    </div>
  );
}
