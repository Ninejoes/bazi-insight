const configMessage = "ระบบยังไม่พร้อมใช้งาน กรุณาติดต่อผู้ดูแลระบบ";
const networkMessage = "เชื่อมต่อระบบไม่ได้ กรุณาลองใหม่อีกครั้ง";
const authMessage = "อีเมลหรือรหัสผ่านไม่ถูกต้อง";

function extractMessage(value: unknown) {
  if (value instanceof Error) return value.message;
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const message = record.message || record.msg || record.error_description || record.error;
    if (typeof message === "string") return message;
  }
  return "";
}

function extractJsonMessage(message: string) {
  const jsonStart = message.indexOf("{");
  if (jsonStart < 0) return "";

  try {
    const parsed = JSON.parse(message.slice(jsonStart)) as Record<string, unknown>;
    return extractMessage(parsed);
  } catch {
    return "";
  }
}

export function friendlyErrorMessage(value: unknown, fallback = "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง") {
  const raw = extractMessage(value).trim();
  const nested = extractJsonMessage(raw);
  const text = (nested || raw).trim();
  const lower = text.toLowerCase();

  if (!text) return fallback;
  if (lower.includes("invalid login credentials") || lower.includes("invalid_credentials")) {
    return authMessage;
  }
  if (lower.includes("email not confirmed")) {
    return "กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ";
  }
  if (lower.includes("user already registered") || lower.includes("already been registered")) {
    return "อีเมลนี้ถูกใช้งานแล้ว กรุณาเข้าสู่ระบบหรือใช้อีเมลอื่น";
  }
  if (lower.includes("password") && lower.includes("weak")) {
    return "รหัสผ่านยังไม่ปลอดภัยพอ กรุณาตั้งรหัสผ่านใหม่";
  }
  if (lower.includes("jwt") || lower.includes("session") || lower.includes("token")) {
    return "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่";
  }
  if (lower.includes("supabase_url") || lower.includes("service_role_key")) {
    return configMessage;
  }
  if (lower.includes("fetch failed") || lower.includes("network") || lower.includes("failed to fetch")) {
    return networkMessage;
  }
  if (lower.includes("supabase") || raw.includes("{") || raw.includes("}")) {
    return fallback;
  }

  return text.length > 160 ? fallback : text;
}
