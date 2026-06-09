/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV === 'development';
const isStandalone = process.env.STANDALONE === 'true';

function buildContentSecurityPolicy() {
  if (isDev) return null;
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self' data: https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    "media-src 'self' blob:",
    "connect-src 'self' https: wss:",
    "worker-src 'self' blob:",
    "frame-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ].join('; ');
}

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
];

const csp = buildContentSecurityPolicy();
if (csp) securityHeaders.push({ key: 'Content-Security-Policy', value: csp });

const nextConfig = {
  ...(isStandalone ? { output: 'standalone' } : {}),
  turbopack: {},
  trailingSlash: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.maptiler.com' },
      { protocol: 'https', hostname: '*.openstreetmap.org' },
      { protocol: 'https', hostname: '*.unsplash.com' },
      { protocol: 'https', hostname: '*.githubusercontent.com' },
      { protocol: 'https', hostname: 'api.agriintel360.com' },
    ],
    formats: ['image/avif', 'image/webp'],
    qualities: [75, 90],
  },
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }];
  },
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
