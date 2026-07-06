// NOTE: In static export mode (output: 'export'), Next.js middleware is IGNORED entirely.
// These guards only apply during `next dev` / `next start` (non-export modes).
// In production (static export + Apache/PHP), auth is handled client-side:
//   - Zustand auth-store.ts (persisted to localStorage)
//   - API client circuit breaker (lib/api-client.ts)
//   - Route guards in layout.tsx and page-level client components
//
// This file is kept for development convenience only.
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Skip all middleware when running static export (set in next.config.ts)
const IS_STATIC_EXPORT = process.env.NEXT_STATIC_EXPORT === 'true';

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

export function middleware(request: NextRequest) {
  // Short-circuit in static export: all auth happens client-side
  if (IS_STATIC_EXPORT) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  const token = request.cookies.get('access_token')?.value;
  const authToken = request.cookies.get('auth_token')?.value;
  const isAuthenticated = Boolean(token || authToken);

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
