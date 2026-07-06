const COOKIE_NAME = 'access_token';

export function persistAuthSession(accessToken: string, _refreshToken?: string, expiresIn = 3600) {
  if (typeof window === 'undefined') return;

  // Store only the access token for API client header usage
  // HttpOnly cookie is preferred (set by backend), but for static export
  // we keep a minimal session reference for the API client
  sessionStorage.setItem('session_token', accessToken);

  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(accessToken)}; max-age=${expiresIn}; path=/; SameSite=Lax; Secure`;
}

export function clearAuthSession() {
  if (typeof window === 'undefined') return;

  sessionStorage.removeItem('session_token');
  document.cookie = `${COOKIE_NAME}=; max-age=0; path=/`;

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
  if (typeof window === 'undefined') return null;

  const fromSession = sessionStorage.getItem('session_token');
  if (fromSession) return fromSession;

  const cookie = document.cookie
    .split('; ')
    .find((row) => row.startsWith('access_token='));
  return cookie ? decodeURIComponent(cookie.split('=')[1]) : null;
}
