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

  if (isLoading || !isAuthenticated) return null;

  return (
    <NotificationsProvider>
      <div
        className="min-h-screen"
        style={{
          background: '#0C1810',
          '--sidebar-width': sidebarCollapsed ? '64px' : '240px',
        } as React.CSSProperties}
      >
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
        >
          {children}
        </main>
      </div>
    </NotificationsProvider>
  );
}
