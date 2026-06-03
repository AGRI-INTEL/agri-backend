'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from '@/lib/motion';
import {
  LayoutDashboard, Sprout, Beef, Fish, TreePine, Users,
  BarChart3, Brain, CloudSun, TrendingUp, Bell, MessageSquare,
  Map, FolderOpen, Settings, Shield, ChevronLeft, ChevronRight,
  Leaf,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/ui-store';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/auth-store';

type NavItem = {
  href?: string;
  icon?: any;
  label?: string;
  exact?: boolean;
  badgeKey?: string | null;
  badge?: string | null;
  type?: 'separator';
};

const navItems: NavItem[] = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { href: '/production', icon: Sprout, label: 'Végétal', badge: null },
  { href: '/animal', icon: Beef, label: 'Animal' },
  { href: '/halieutique', icon: Fish, label: 'Halieutique' },
  { href: '/forestier', icon: TreePine, label: 'Forestier' },
  { type: 'separator' as const },
  { href: '/actors', icon: Users, label: 'Acteurs' },
  { href: '/indicators', icon: BarChart3, label: 'Indicateurs' },
  { href: '/analytics', icon: TrendingUp, label: 'Analytics' },
  { href: '/predictions', icon: Brain, label: 'Prédictions IA' },
  { type: 'separator' as const },
  { href: '/weather', icon: CloudSun, label: 'Météo' },
  { href: '/alerts', icon: Bell, label: 'Alertes', badgeKey: 'alerts' as const },
  { href: '/map', icon: Map, label: 'Carte' },
  { type: 'separator' as const },
  { href: '/chatbot', icon: MessageSquare, label: 'AgriBot IA' },
  { href: '/community', icon: Users, label: 'Communauté' },
  { href: '/files', icon: FolderOpen, label: 'Fichiers' },
  { type: 'separator' as const },
  { href: '/settings/profile', icon: Settings, label: 'Paramètres' },
];

const adminItems: NavItem[] = [
  { href: '/admin', icon: Shield, label: 'Administration' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar, unreadNotifications } = useUIStore();
  const { user } = useAuthStore();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        animate={{ width: sidebarCollapsed ? 64 : 240 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="fixed left-0 top-0 h-full z-30 bg-card border-r border-border flex flex-col overflow-hidden"
        aria-label="Navigation principale"
      >
        {/* Logo */}
        <div className="h-header flex items-center px-4 border-b border-border shrink-0">
          <Link href="/" className="flex items-center gap-2 min-w-0">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="font-bold text-sm text-foreground whitespace-nowrap overflow-hidden"
                >
                  AgriIntel360
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5" aria-label="Menu principal">
          {navItems.map((item, i) => {
            if (item.type === 'separator') {
              return <div key={i} className="my-2 h-px bg-border mx-2" />;
            }

            const Icon = item.icon!;
            const active = isActive(item.href!, item.exact);
            const showBadge = item.badgeKey === 'alerts' && unreadNotifications > 0;

            const linkContent = (
              <Link
                href={item.href!}
                className={cn(
                  'flex items-center gap-3 px-2 py-2 rounded-button text-sm font-medium transition-all duration-150',
                  'hover:bg-primary/10 hover:text-primary',
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground',
                  sidebarCollapsed && 'justify-center px-2'
                )}
                aria-current={active ? 'page' : undefined}
              >
                <div className="relative shrink-0">
                  <Icon className="h-4 w-4" />
                  {showBadge && (
                    <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-destructive" />
                  )}
                </div>
                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex-1 whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {!sidebarCollapsed && showBadge && (
                  <Badge variant="destructive" className="text-xs px-1.5 py-0 h-5">
                    {unreadNotifications > 99 ? '99+' : unreadNotifications}
                  </Badge>
                )}
              </Link>
            );

            if (sidebarCollapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              );
            }

            return <div key={item.href}>{linkContent}</div>;
          })}

          {/* Admin */}
          {user?.role === 'admin' && (
            <>
              <div className="my-2 h-px bg-border mx-2" />
              {adminItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                const linkContent = (
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-2 py-2 rounded-button text-sm font-medium transition-all duration-150',
                      'hover:bg-destructive/10 hover:text-destructive',
                      active ? 'bg-destructive/10 text-destructive' : 'text-muted-foreground',
                      sidebarCollapsed && 'justify-center px-2'
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </Link>
                );
                if (sidebarCollapsed) {
                  return (
                    <Tooltip key={item.href}>
                      <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                      <TooltipContent side="right">{item.label}</TooltipContent>
                    </Tooltip>
                  );
                }
                return <div key={item.href}>{linkContent}</div>;
              })}
            </>
          )}
        </nav>

        {/* Collapse toggle */}
        <div className="p-2 border-t border-border">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="w-full"
            aria-label={sidebarCollapsed ? 'Étendre la sidebar' : 'Réduire la sidebar'}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </motion.aside>
    </TooltipProvider>
  );
}
