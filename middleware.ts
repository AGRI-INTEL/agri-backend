import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protected routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/production',
  '/animal',
  '/halieutique',
  '/forestier',
  '/actors',
  '/indicators',
  '/analytics',
  '/predictions',
  '/weather',
  '/alerts',
  '/map',
  '/chatbot',
  '/community',
  '/files',
  '/settings',
  '/admin',
  '/notifications',
  '/economics',
];

// Auth routes (redirect to dashboard if already logged in)
const AUTH_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password'];

// Public routes
const PUBLIC_ROUTES = ['/features', '/about', '/pricing', '/contact', '/blog', '/cgu', '/privacy'];

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

  // Check for auth token in cookies
  const token = request.cookies.get('access_token')?.value;
  const isAuthenticated = !!token;

  // Redirect authenticated users away from auth pages
  if (isAuthRoute(pathname) && isAuthenticated) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Redirect unauthenticated users to login
  if (isProtectedRoute(pathname) && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|apple-touch-icon.png|manifest.json|sw.js|images|locales|fond.jpg|fond-landscape.jpg|logo.png).*)',
  ],
};
