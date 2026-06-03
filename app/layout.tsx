import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import Script from 'next/script';
import '@/styles/globals.css';
import { Providers } from './providers';
import { cn } from '@/lib/utils';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: false,
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
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
    url: 'https://agriintel360.com',
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
  metadataBase: new URL('https://agriintel360.com'),
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
          <Script id="disable-react-devtools-hook" strategy="beforeInteractive">
            {`(function(){
                if (typeof window === 'undefined') return;
                try {
                  const hook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
                  if (hook && typeof hook === 'object') {
                    hook.inject = function() {};
                    hook.on = function() {};
                    hook.off = function() {};
                    hook.emit = function() {};
                    hook.getFiberRoots = function() { return new Map(); };
                    hook.getFiberRoots = function() { return new Map(); };
                    hook.supportsFiber = false;
                  } else {
                    Object.defineProperty(window, '__REACT_DEVTOOLS_GLOBAL_HOOK__', {
                      value: {
                        supportsFiber: false,
                        inject() {},
                        on() {},
                        off() {},
                        emit() {},
                        getFiberRoots() { return new Map(); },
                      },
                      configurable: true,
                    });
                  }
                } catch (error) {
                  console.warn('Unable to disable React DevTools hook.', error);
                }
              })();`}
          </Script>
        )}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
