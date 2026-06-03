const AUTH_TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const COOKIE_NAME = 'access_token';

function cookieMaxAge(seconds: number): string {
  return `; max-age=${seconds}; path=/; SameSite=Lax`;
}

export function persistAuthSession(accessToken: string, refreshToken?: string, expiresIn = 3600) {
  if (typeof window === 'undefined') return;

  localStorage.setItem(AUTH_TOKEN_KEY, accessToken);
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(accessToken)}${cookieMaxAge(expiresIn)}`;
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
  } catch (e) {
    // ignore
  }

  try {
    if (navigator && 'serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((regs) => regs.forEach((r) => r.unregister()));
    }
  } catch (e) {
    // ignore
  }
}

export function getStoredAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}
