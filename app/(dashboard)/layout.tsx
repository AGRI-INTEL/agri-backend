'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { MobileNav } from '@/components/layout/mobile-nav';
import { NotificationsProvider } from '@/components/dashboard/notifications-provider';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/ui-store';
import { useAuthStore } from '@/stores/auth-store';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed } = useUIStore();
  const { isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const next = encodeURIComponent(pathname ?? '/dashboard');
      router.replace(`/login?next=${next}`);
    }
  }, [isAuthenticated, isLoading, router, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0C1810' }}>
        <div className="flex flex-col items-center gap-3" role="status" aria-live="polite">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <NotificationsProvider>
      <div
        className="min-h-screen"
        style={{
          background: '#0C1810',
          '--sidebar-width': sidebarCollapsed ? '64px' : '240px',
        } as React.CSSProperties}
      >
        {/* Skip-to-content for keyboard users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none"
        >
          Aller au contenu principal
        </a>

        {/* Sidebar — desktop */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Mobile nav drawer */}
        <MobileNav />

        {/* Header */}
        <Header />

        {/* Main content */}
        <main
          className={cn(
            'pt-header transition-all duration-200',
            'lg:pl-[var(--sidebar-width)]'
          )}
          id="main-content"
          tabIndex={-1}
        >
          {children}
        </main>
      </div>
    </NotificationsProvider>
  );
}
