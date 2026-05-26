'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from '@/lib/motion';
import { X, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/stores/ui-store';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: '🏠 Dashboard' },
  { href: '/production', label: '🌱 Végétal' },
  { href: '/animal', label: '🐄 Animal' },
  { href: '/halieutique', label: '🎣 Halieutique' },
  { href: '/forestier', label: '🌲 Forestier' },
  { href: '/actors', label: '👥 Acteurs' },
  { href: '/indicators', label: '📊 Indicateurs' },
  { href: '/predictions', label: '🔮 Prédictions IA' },
  { href: '/weather', label: '🌤 Météo' },
  { href: '/alerts', label: '🔔 Alertes' },
  { href: '/map', label: '🗺 Carte' },
  { href: '/chatbot', label: '🤖 AgriBot' },
  { href: '/community', label: '👥 Communauté' },
  { href: '/files', label: '📁 Fichiers' },
  { href: '/settings/profile', label: '⚙️ Paramètres' },
];

export function MobileNav() {
  const pathname = usePathname();
  const { sidebarMobileOpen, setSidebarMobileOpen } = useUIStore();

  // Close on route change
  useEffect(() => {
    setSidebarMobileOpen(false);
  }, [pathname, setSidebarMobileOpen]);

  return (
    <AnimatePresence>
      {sidebarMobileOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarMobileOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-0 top-0 h-full w-72 z-50 bg-card border-r border-border flex flex-col lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Menu de navigation"
          >
            {/* Header */}
            <div className="h-header flex items-center justify-between px-4 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <Leaf className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-sm">AgriIntel360</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarMobileOpen(false)}
                aria-label="Fermer le menu"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center px-3 py-2.5 rounded-button text-sm font-medium transition-colors',
                    'hover:bg-primary/10 hover:text-primary',
                    pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground'
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
