const AUTH_TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const COOKIE_NAME = 'access_token';

function cookieMaxAge(seconds: number): string {
  return `; max-age=${seconds}; path=/; SameSite=Lax`;
}

export function persistAuthSession(accessToken: string, refreshToken?: string, expiresIn = 3600) {
  if (typeof window === 'undefined') return;

  // Store tokens in localStorage for API client access
  localStorage.setItem(AUTH_TOKEN_KEY, accessToken);
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  // Note: HttpOnly cannot be set from client-side JS; the server must set it.
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(accessToken)}${cookieMaxAge(expiresIn)}; Secure; SameSite=Lax`;
}

export function clearAuthSession() {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  document.cookie = `${COOKIE_NAME}=; max-age=0; path=/`;
  // Clear caches (service worker) and unregister service workers to free cached assets
  try {
    if ('caches' in window) {
      caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))));
    }
  } catch {
    // ignore
  }

  try {
    if (navigator && 'serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((regs) => regs.forEach((r) => r.unregister()));
    }
  } catch {
    // ignore
  }
}

export function getStoredAccessToken(): string | null {
  // Tokens are stored in localStorage (for API client access) and cookie (server-side)
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}
