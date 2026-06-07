export const USER_SESSION_KEY = "likhitfa-user-session-v1";

export type UserSession = {
  id?: string;
  email: string;
  name: string;
  role: "User";
  accessToken?: string;
  expiresAt?: string;
  mode?: string;
  profile?: {
    firstName?: string;
    lastName?: string;
    displayName?: string;
    birthDate?: string;
    gender?: string;
  };
};

export function readStoredUserSession() {
  const raw = window.localStorage.getItem(USER_SESSION_KEY);
  if (!raw) return null;

  try {
    const session = JSON.parse(raw) as UserSession;
    const expired = session.expiresAt ? new Date(session.expiresAt).getTime() <= Date.now() : false;
    if (expired || session.role !== "User" || !session.email) {
      window.localStorage.removeItem(USER_SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    window.localStorage.removeItem(USER_SESSION_KEY);
    return null;
  }
}

export function storeUserSession(session: UserSession) {
  window.localStorage.setItem(USER_SESSION_KEY, JSON.stringify(session));
}

export function clearUserSession() {
  window.localStorage.removeItem(USER_SESSION_KEY);
}
