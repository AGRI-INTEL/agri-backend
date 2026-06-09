import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_ROUTES = [
  '/dashboard', '/production', '/animal', '/halieutique', '/forestier',
  '/actors', '/indicators', '/analytics', '/predictions', '/weather',
  '/alerts', '/map', '/chatbot', '/community', '/files', '/settings',
  '/admin', '/notifications', '/economics',
];

const AUTH_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password'];

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some((route) =>
    route === '/' ? pathname === '/' : pathname.startsWith(route)
  );
}

function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some((route) => pathname.startsWith(route));
}

function parseJwtPayload(token: string): { exp?: number } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = atob(base64);
    const json = decodeURIComponent(
      payload.split('').map((c) => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`).join('')
    );
    return JSON.parse(json) as { exp?: number };
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const payload = parseJwtPayload(token);
  return !payload || typeof payload.exp !== 'number' || payload.exp * 1000 <= Date.now();
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('access_token')?.value;
  const tokenIsValid = token ? !isTokenExpired(token) : false;
  const isAuthenticated = tokenIsValid;

  if (token && !tokenIsValid) {
    const response = NextResponse.next();
    response.cookies.set('access_token', '', { maxAge: 0, path: '/' });
    return response;
  }

  if (isAuthRoute(pathname) && isAuthenticated) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (isProtectedRoute(pathname) && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|apple-touch-icon.png|manifest.json|images|locales|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|woff2?|ttf|eot)$).*)',
  ],
};
