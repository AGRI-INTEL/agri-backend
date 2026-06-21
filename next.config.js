/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV === 'development';

// En mode export statique (production LWS), headers() et rewrites() ne fonctionnent pas.
// Les headers de sécurité sont gérés par Apache via .htaccess.
// Le proxy API est géré par Apache ProxyPass en production.
// En développement (next dev, sans output:export), on garde le proxy vers le backend local.

const nextConfig = {
  output: 'export',
  outputFileTracingRoot: __dirname,

  images: {
    unoptimized: true,
  },

  reactStrictMode: true,

  compress: true,
};

// En dev seulement : activer les rewrites pour proxyer l'API locale
// (next dev ignore output:'export' pour les rewrites)
if (isDev) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://127.0.0.1:8000';
  nextConfig.rewrites = async () => [
    {
      source: '/api/v1/:path*',
      destination: `${backendUrl}/api/v1/:path*`,
    },
  ];
}

module.exports = nextConfig;
