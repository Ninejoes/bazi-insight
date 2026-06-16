export const ADMIN_SESSION_KEY = "likhitfa-admin-session-v2";

export function adminAuthHeaders(): Record<string, string> {
  try {
    const raw = window.localStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return {};
    const session = JSON.parse(raw) as { accessToken?: string };
    return session.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {};
  } catch {
    return {};
  }
}
