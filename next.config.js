/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV === 'development';
const isStandalone = process.env.STANDALONE === 'true';

// NOTE: La CSP est intentionnellement permissive pour garantir le chargement
// des chunks _next/static/ sur l'hébergement LWS (shared hosting, Passenger).
// Une CSP trop stricte bloque les scripts Next.js en production.
function buildContentSecurityPolicy() {
  if (isDev) return null;
  return [
    // Autoriser tous les scripts du même domaine + inline (requis par Next.js)
    "default-src 'self'",
    // 'strict-dynamic' + nonce serait idéal mais non compatible avec static export
    // On garde 'unsafe-inline' + 'unsafe-eval' car Next.js en a besoin sur shared hosting
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://agriintel360.lsgrouptogo.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    "media-src 'self' blob:",
    "connect-src 'self' https: wss: https://agriintel360.lsgrouptogo.com",
    "worker-src 'self' blob:",
    "frame-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://agriintel360.lsgrouptogo.com",
    "upgrade-insecure-requests",
  ].join('; ');
}

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // SAMEORIGIN est préférable à DENY — permet d'afficher dans des iframes du même domaine
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
];

const csp = buildContentSecurityPolicy();
if (csp) securityHeaders.push({ key: 'Content-Security-Policy', value: csp });

const nextConfig = {
  outputFileTracingRoot: __dirname,
  ...(isStandalone ? { output: 'standalone' } : {}),

  images: {
    unoptimized: true,
  },

  reactStrictMode: true,

  // Laisser Next.js gérer la compression — LWS Passenger ne fait pas de gzip
  compress: true,

  // Assure que les assets _next/static sont servis depuis la racine du domaine
  // Ne pas définir assetPrefix sauf si les assets sont sur un CDN séparé
  // assetPrefix: '',

  async headers() {
    return [
      {
        // Appliquer les headers de sécurité sur toutes les routes
        source: '/(.*)',
        headers: securityHeaders,
      },
      {
        // Cache agressif pour les assets statiques Next.js (immutables)
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        // Backend FastAPI via Passenger sur LWS (socket ou port local)
        destination: 'http://127.0.0.1:8000/api/v1/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
