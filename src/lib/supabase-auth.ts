export type SupabaseAuthUser = {
  id?: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
  app_metadata?: Record<string, unknown>;
  created_at?: string;
};

export type SupabaseTokenResponse = {
  access_token?: string;
  expires_in?: number;
  user?: SupabaseAuthUser;
};

type SupabaseUsersResponse = {
  users?: SupabaseAuthUser[];
};

export function getSupabaseAuthConfig() {
  const url = (
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL
  )?.replace(/\/$/, "");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!url || !serviceKey) return null;
  return { url, serviceKey };
}

export function supabaseAuthHeaders(serviceKey: string, accessToken = serviceKey) {
  return {
    "Content-Type": "application/json",
    apikey: serviceKey,
    Authorization: `Bearer ${accessToken}`,
  };
}

export async function readText(response: Response) {
  return response.text().catch(() => "");
}

export function readBearer(request: Request) {
  const authorization = request.headers.get("Authorization") || "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match?.[1] || "";
}

export function userRole(user: SupabaseAuthUser) {
  const appRole = user.app_metadata?.role;
  const userMetadataRole = user.user_metadata?.role;
  return appRole === "Admin" || userMetadataRole === "Admin" ? "Admin" : "User";
}

export function userDisplayName(user: SupabaseAuthUser) {
  const metadata = user.user_metadata || {};
  const displayName = metadata.displayName || metadata.name;
  if (typeof displayName === "string" && displayName.trim()) return displayName.trim();
  return user.email?.split("@")[0] || "User";
}

export function toUserSession(data: SupabaseTokenResponse, fallback?: Partial<SupabaseAuthUser>) {
  const user = data.user || fallback || {};
  const metadata = user.user_metadata || {};
  return {
    id: user.id || fallback?.id,
    email: user.email || fallback?.email || "",
    name: userDisplayName(user as SupabaseAuthUser),
    role: "User" as const,
    accessToken: data.access_token,
    expiresAt: data.expires_in
      ? new Date(Date.now() + Number(data.expires_in) * 1000).toISOString()
      : undefined,
    mode: "supabase",
    profile: {
      firstName: typeof metadata.firstName === "string" ? metadata.firstName : "",
      lastName: typeof metadata.lastName === "string" ? metadata.lastName : "",
      displayName: typeof metadata.displayName === "string" ? metadata.displayName : "",
      birthDate: typeof metadata.birthDate === "string" ? metadata.birthDate : "",
      gender: typeof metadata.gender === "string" ? metadata.gender : "",
    },
  };
}

export async function findSupabaseAuthUser(url: string, serviceKey: string, email: string) {
  const response = await fetch(`${url}/auth/v1/admin/users?per_page=1000`, {
    headers: supabaseAuthHeaders(serviceKey),
  });
  if (!response.ok) return null;
  const data = (await response.json().catch(() => ({}))) as SupabaseUsersResponse;
  return data.users?.find((user) => user.email?.toLowerCase() === email.toLowerCase()) || null;
}

export async function signInSupabaseUser(
  url: string,
  serviceKey: string,
  email: string,
  password: string,
) {
  const response = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: supabaseAuthHeaders(serviceKey),
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const detail = await readText(response);
    throw new Error(`Supabase sign in failed ${response.status}: ${detail}`);
  }

  return (await response.json().catch(() => ({}))) as SupabaseTokenResponse;
}

export async function verifySupabaseUser(url: string, serviceKey: string, accessToken: string) {
  if (!accessToken) throw new Error("ไม่มี session ผู้ใช้งาน");

  const response = await fetch(`${url}/auth/v1/user`, {
    headers: supabaseAuthHeaders(serviceKey, accessToken),
  });
  if (!response.ok) throw new Error("session ผู้ใช้งานไม่ถูกต้องหรือหมดอายุ");

  const user = (await response.json().catch(() => ({}))) as SupabaseAuthUser;
  if (userRole(user) !== "User") throw new Error("บัญชีนี้ไม่ใช่ผู้ใช้งานทั่วไป");
  return user;
}

export async function verifySupabaseSession(url: string, serviceKey: string, accessToken: string) {
  if (!accessToken) throw new Error("ไม่มี session สำหรับตรวจสอบสิทธิ์");

  const response = await fetch(`${url}/auth/v1/user`, {
    headers: supabaseAuthHeaders(serviceKey, accessToken),
  });
  if (!response.ok) throw new Error("session ไม่ถูกต้องหรือหมดอายุ");

  return (await response.json().catch(() => ({}))) as SupabaseAuthUser;
}
