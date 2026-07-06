'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from '@/lib/motion';
import {
  LayoutDashboard, Sprout, Beef, Fish, TreePine, Users,
  BarChart3, Brain, CloudSun, TrendingUp, Bell, Bot, MessageSquare,
  Map, FolderOpen, Settings, Shield, ChevronLeft, ChevronRight,
  LogOut,
} from 'lucide-react';
import { useUIStore } from '@/stores/ui-store';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuthStore } from '@/stores/auth-store';
import { useAuth } from '@/hooks/use-auth';
import { useUnreadMessageCount } from '@/hooks/use-messaging';

type NavItem = {
  href?: string;
  icon?: React.ElementType;
  label?: string;
  exact?: boolean;
  badgeKey?: string | null;
  type?: 'separator';
};

const navItems: NavItem[] = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { href: '/production', icon: Sprout, label: 'Végétal' },
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
  { href: '/alerts', icon: Bell, label: 'Alertes', badgeKey: 'alerts' },
  { href: '/map', icon: Map, label: 'Carte' },
  { type: 'separator' as const },
  { href: '/chatbot', icon: Bot, label: 'AgriBot IA' },
  { href: '/messages', icon: MessageSquare, label: 'Messages', badgeKey: 'messages' },
  { href: '/community', icon: Users, label: 'Communauté' },
  { href: '/files', icon: FolderOpen, label: 'Fichiers' },
];

const adminItems: NavItem[] = [
  { href: '/admin', icon: Shield, label: 'Administration' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar, unreadNotifications } = useUIStore();
  const { user } = useAuthStore();
  const { logout } = useAuth();
  const { data: msgUnreadData } = useUnreadMessageCount();
  const unreadMessages = msgUnreadData?.unread_count ?? 0;

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || (href !== '/' && pathname.startsWith(href));
  };

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        animate={{ width: sidebarCollapsed ? 64 : 240 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="fixed left-0 top-0 h-full z-30 flex flex-col overflow-hidden bg-background border-r border-border"
        aria-label="Navigation principale"
      >
        {/* Logo */}
        <div
          className="flex items-center px-3 shrink-0 h-16 border-b border-border"
        >
          <Link href="/" className="flex items-center gap-3 min-w-0 w-full">
            <div
              className="relative flex items-center justify-center shrink-0 rounded-xl overflow-hidden h-9 w-9 bg-secondary/10 border border-secondary/30 shadow-[0_0_20px_rgba(196,146,58,0.12)]"
            >
              <Image src="/logo.png" alt="" fill className="object-contain p-1.5" sizes="36px" />
            </div>
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="min-w-0 overflow-hidden"
                >
                  <span
                    className="text-[0.9375rem] font-black tracking-tight leading-none block whitespace-nowrap text-foreground"
                  >
                    AgriIntel<span className="text-secondary">360</span>
                  </span>
                  <span
                    className="text-[0.5625rem] font-bold uppercase tracking-[0.16em] mt-0.5 block whitespace-nowrap text-muted-foreground/70"
                  >
                    Intelligence Agricole
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>
        </div>

        {/* Nav */}
        <nav
          className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5"
          aria-label="Menu principal"
          style={{ scrollbarWidth: 'none' }}
        >
          {navItems.map((item, i) => {
            if (item.type === 'separator') {
              return (
                <div
                  key={i}
                  className="my-1.5 mx-1 border-t border-border"
                />
              );
            }

            const Icon = item.icon!;
            const active = isActive(item.href!, item.exact);
            const showBadge =
              (item.badgeKey === 'alerts' && unreadNotifications > 0) ||
              (item.badgeKey === 'messages' && unreadMessages > 0);
            const badgeCount = item.badgeKey === 'alerts' ? unreadNotifications : unreadMessages;

            const linkContent = (
              <Link
                href={item.href!}
                className={`flex items-center gap-3 px-2.5 py-2 rounded-xl text-sm font-medium transition-all duration-150 relative border-l-2 ${active ? 'text-secondary bg-secondary/10 border-l-secondary' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground border-l-transparent'}`}
                aria-current={active ? 'page' : undefined}
              >
                <div className="relative shrink-0">
                  <Icon className="h-4 w-4" />
                  {showBadge && (
                    <span
                      className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-destructive"
                    />
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
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 bg-destructive text-destructive-foreground"
                  >
                    {badgeCount > 99 ? '99+' : badgeCount}
                  </span>
                )}
              </Link>
            );

            if (sidebarCollapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent
                    side="right"
                    className="bg-card text-foreground border-border"
                  >
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return <div key={item.href}>{linkContent}</div>;
          })}

          {/* Admin */}
          {user?.role === 'admin' && (
            <>
              <div className="my-1.5 mx-1 border-t border-border" />
              {adminItems.map((item) => {
                const Icon = item.icon!;
                const active = isActive(item.href!);
                const linkContent = (
                  <Link
                    href={item.href!}
                    className={`flex items-center gap-3 px-2.5 py-2 rounded-xl text-sm font-medium transition-all duration-150 border-l-2 ${active ? 'bg-destructive/10 text-destructive border-l-destructive' : 'text-muted-foreground hover:bg-destructive/10 hover:text-destructive border-l-transparent'}`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </Link>
                );
                if (sidebarCollapsed) {
                  return (
                    <Tooltip key={item.href}>
                      <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                      <TooltipContent side="right" className="bg-card text-foreground border-border">
                        {item.label}
                      </TooltipContent>
                    </Tooltip>
                  );
                }
                return <div key={item.href}>{linkContent}</div>;
              })}
            </>
          )}
        </nav>

        {/* User section */}
        {user && (
          <div className="shrink-0 px-2 py-2 border-t border-border">
            {!sidebarCollapsed ? (
              <div>
                <div
                  className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl mb-1 bg-card"
                >
                  <div className={`h-7 w-7 rounded-full shrink-0 overflow-hidden flex items-center justify-center text-xs font-bold ${!user.avatar ? 'bg-secondary text-secondary-foreground' : ''}`}>
                    {user.avatar ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={user.avatar} alt="" className="h-full w-full object-cover" />
                    ) : (
                      (user.name || user.email || 'U')[0].toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold truncate text-foreground">
                      {user.name || user.email?.split('@')[0] || 'Utilisateur'}
                    </p>
                    <p className="text-[10px] truncate text-muted-foreground/70">
                      {user.email}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Link
                    href="/settings/profile"
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  >
                    <Settings className="h-3 w-3" />
                    Paramètres
                  </Link>
                  <button
                    onClick={() => logout()}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <LogOut className="h-3 w-3" />
                    Déco.
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href="/settings/profile"
                      className="flex items-center justify-center p-2 rounded-xl transition-all duration-150 w-full text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    >
                      <Settings className="h-4 w-4" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-card text-foreground border-border">
                    Paramètres
                  </TooltipContent>
                </Tooltip>
              </div>
            )}
          </div>
        )}

        {/* Collapse toggle */}
        <div className="p-2 shrink-0 border-t border-border">
          <button
            onClick={toggleSidebar}
            className="w-full flex items-center justify-center h-8 rounded-xl text-sm font-medium transition-all duration-150 text-muted-foreground hover:bg-muted/50 hover:text-secondary"
            aria-label={sidebarCollapsed ? 'Étendre la sidebar' : 'Réduire la sidebar'}
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
      </motion.aside>
    </TooltipProvider>
  );
}
