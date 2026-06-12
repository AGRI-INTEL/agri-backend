import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import Script from 'next/script';
import '@/styles/globals.css';
import { Providers } from './providers';
import { cn } from '@/lib/utils';

const inter = localFont({
  src: [
    { path: '../fonts/inter/Inter-400.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/inter/Inter-500.woff2', weight: '500', style: 'normal' },
    { path: '../fonts/inter/Inter-600.woff2', weight: '600', style: 'normal' },
    { path: '../fonts/inter/Inter-700.woff2', weight: '700', style: 'normal' },
    { path: '../fonts/inter/Inter-800.woff2', weight: '800', style: 'normal' },
    { path: '../fonts/inter/Inter-900.woff2', weight: '900', style: 'normal' },
  ],
  variable: '--font-inter',
  display: 'swap',
  preload: false,
});

const mono = localFont({
  src: [
    { path: '../fonts/jetbrains-mono/JetBrainsMono-400.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/jetbrains-mono/JetBrainsMono-700.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-jetbrains-mono',
  display: 'swap',
  preload: false,
});

export const metadata: Metadata = {
  title: {
    default: 'AgriIntel360 — Intelligence Agricole pour l\'Afrique',
    template: '%s | AgriIntel360',
  },
  description:
    'Plateforme intelligente de décision agricole pour l\'Afrique. Données en temps réel, prédictions IA, alertes et communauté pour les 4 sous-secteurs agricoles.',
  keywords: ['agriculture', 'Afrique', 'IA', 'données agricoles', 'prédictions', 'Sénégal', 'Togo', 'Ghana'],
  authors: [{ name: 'AgriIntel360' }],
  creator: 'AgriIntel360',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://agriintel360.lsgrouptogo.com',
    title: 'AgriIntel360 — Intelligence Agricole pour l\'Afrique',
    description: 'Plateforme intelligente de décision agricole pour l\'Afrique',
    siteName: 'AgriIntel360',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AgriIntel360',
    description: 'Intelligence agricole pour l\'Afrique',
  },
  manifest: '/manifest.json',
  metadataBase: new URL('https://agriintel360.lsgrouptogo.com'),
  icons: {
    icon: [{ url: '/favicon.ico', sizes: 'any' }],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
};

export const viewport: Viewport = {
  themeColor: '#16A34A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={cn(inter.variable, mono.variable)}
    >
      <body className="font-sans antialiased">
        {process.env.NODE_ENV === 'production' && (
          // Désactive React DevTools en production.
          // IMPORTANT : On utilise uniquement la mutation directe des propriétés
          // (pas Object.defineProperty) pour éviter l'erreur XRay Wrapper de Firefox
          // qui bloque les defineProperty cross-origin dans les extensions de navigateur.
          <Script id="disable-react-devtools-hook" strategy="beforeInteractive">
            {`(function(){
                try {
                  if (typeof window !== 'undefined' && window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
                    var hook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
                    hook.supportsFiber = false;
                    hook.inject = function(){};
                    hook.on = function(){};
                    hook.off = function(){};
                    hook.emit = function(){};
                    hook.getFiberRoots = function(){ return new Map(); };
                  }
                } catch(e) {}
              })();`}
          </Script>
        )}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
