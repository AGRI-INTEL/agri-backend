const AUTH_TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const COOKIE_NAME = 'access_token';

function cookieMaxAge(seconds: number): string {
  return `; max-age=${seconds}; path=/; SameSite=Lax`;
}

export function persistAuthSession(accessToken: string, refreshToken?: string, expiresIn = 3600) {
  if (typeof window === 'undefined') return;

  // Avoid persisting tokens in localStorage to reduce XSS impact.
  localStorage.removeItem(AUTH_TOKEN_KEY);
  if (refreshToken) {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
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
  // Tokens are now stored in cookies only (server should set HttpOnly/Secure).
  // Keep this API for compatibility.
  if (typeof window === 'undefined') return null;
  return null;
}
