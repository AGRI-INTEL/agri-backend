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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Security note:
  // We intentionally avoid decoding/parsing JWT payloads in middleware.
  // Without server-side signature verification, treating a client-controlled cookie
  // as an authenticated session is unsafe.
  const token = request.cookies.get('access_token')?.value;
  const authToken = request.cookies.get('auth_token')?.value;
  const isAuthenticated = Boolean((token || authToken) && (token?.trim().length ?? 0) > 0 || (authToken?.trim().length ?? 0) > 0);

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
