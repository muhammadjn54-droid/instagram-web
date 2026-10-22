export const TOKEN_KEY = 'instagram_token';
export const USER_KEY = 'instagram_user';

export function saveAuth(token: string, user?: any) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
    document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=604800; SameSite=Lax`;
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  }
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getSavedUser(): any | null {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export function clearAuth() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    document.cookie = `${TOKEN_KEY}=; path=/; max-age=0`;
  }
}
