'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from '@/lib/motion';
import {
  LayoutDashboard, Sprout, Beef, Fish, TreePine, Users,
  BarChart3, Brain, CloudSun, TrendingUp, Bell, MessageSquare,
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
  { href: '/chatbot', icon: MessageSquare, label: 'AgriBot IA' },
  { href: '/messages', icon: MessageSquare, label: 'Messages', badgeKey: 'messages' },
  { href: '/community', icon: Users, label: 'Communauté' },
  { href: '/files', icon: FolderOpen, label: 'Fichiers' },
];

const adminItems: NavItem[] = [
  { href: '/admin', icon: Shield, label: 'Administration' },
];

const GROUND = '#0C1810';
const CARD = '#152219';
const TEXT = '#E8E0CC';
const MUTED = '#7D9486';
const GOLD = '#C4923A';
const DIM = '#4A6050';
const SEPARATOR = 'rgba(196,146,58,0.12)';
const ACTIVE_BG = 'rgba(196,146,58,0.10)';
const HOVER_BG = 'rgba(196,146,58,0.06)';

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
        className="fixed left-0 top-0 h-full z-30 flex flex-col overflow-hidden"
        style={{
          background: GROUND,
          borderRight: `1px solid ${SEPARATOR}`,
        }}
        aria-label="Navigation principale"
      >
        {/* Logo */}
        <div
          className="flex items-center px-3 shrink-0"
          style={{ height: '64px', borderBottom: `1px solid ${SEPARATOR}` }}
        >
          <Link href="/" className="flex items-center gap-3 min-w-0 w-full">
            <div
              className="relative flex items-center justify-center shrink-0 rounded-xl overflow-hidden"
              style={{
                height: '36px',
                width: '36px',
                background: 'rgba(196,146,58,0.12)',
                border: '1px solid rgba(196,146,58,0.28)',
                boxShadow: '0 0 20px rgba(196,146,58,0.12)',
              }}
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
                    className="text-[0.9375rem] font-black tracking-tight leading-none block whitespace-nowrap"
                    style={{ color: TEXT }}
                  >
                    AgriIntel<span style={{ color: GOLD }}>360</span>
                  </span>
                  <span
                    className="text-[0.5625rem] font-bold uppercase tracking-[0.16em] mt-0.5 block whitespace-nowrap"
                    style={{ color: DIM }}
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
                  className="my-1.5 mx-1"
                  style={{ height: '1px', background: SEPARATOR }}
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
                className="flex items-center gap-3 px-2.5 py-2 rounded-xl text-sm font-medium transition-all duration-150 relative"
                style={{
                  background: active ? ACTIVE_BG : 'transparent',
                  color: active ? GOLD : MUTED,
                  borderLeft: active ? `2px solid ${GOLD}` : '2px solid transparent',
                }}
                aria-current={active ? 'page' : undefined}
                onMouseEnter={e => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.background = HOVER_BG;
                    (e.currentTarget as HTMLElement).style.color = TEXT;
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                    (e.currentTarget as HTMLElement).style.color = MUTED;
                  }
                }}
              >
                <div className="relative shrink-0">
                  <Icon className="h-4 w-4" />
                  {showBadge && (
                    <span
                      className="absolute -top-1 -right-1 h-2 w-2 rounded-full"
                      style={{ background: '#ef4444' }}
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
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
                    style={{ background: '#ef4444', color: 'white' }}
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
                    style={{ background: CARD, color: TEXT, border: `1px solid ${SEPARATOR}` }}
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
              <div className="my-1.5 mx-1" style={{ height: '1px', background: SEPARATOR }} />
              {adminItems.map((item) => {
                const Icon = item.icon!;
                const active = isActive(item.href!);
                const linkContent = (
                  <Link
                    href={item.href!}
                    className="flex items-center gap-3 px-2.5 py-2 rounded-xl text-sm font-medium transition-all duration-150"
                    style={{
                      background: active ? 'rgba(248,113,113,0.10)' : 'transparent',
                      color: active ? '#f87171' : MUTED,
                      borderLeft: active ? '2px solid #f87171' : '2px solid transparent',
                    }}
                    onMouseEnter={e => {
                      if (!active) {
                        (e.currentTarget as HTMLElement).style.background = 'rgba(248,113,113,0.06)';
                        (e.currentTarget as HTMLElement).style.color = '#f87171';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!active) {
                        (e.currentTarget as HTMLElement).style.background = 'transparent';
                        (e.currentTarget as HTMLElement).style.color = MUTED;
                      }
                    }}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </Link>
                );
                if (sidebarCollapsed) {
                  return (
                    <Tooltip key={item.href}>
                      <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                      <TooltipContent side="right" style={{ background: CARD, color: TEXT, border: `1px solid ${SEPARATOR}` }}>
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
          <div className="shrink-0 px-2 py-2" style={{ borderTop: `1px solid ${SEPARATOR}` }}>
            {!sidebarCollapsed ? (
              <div>
                <div
                  className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl mb-1"
                  style={{ background: CARD }}
                >
                  <div
                    className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ background: GOLD, color: '#1A1000' }}
                  >
                    {(user.name || user.email || 'U')[0].toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold truncate" style={{ color: TEXT }}>
                      {user.name || user.email?.split('@')[0] || 'Utilisateur'}
                    </p>
                    <p className="text-[10px] truncate" style={{ color: DIM }}>
                      {user.email}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Link
                    href="/settings/profile"
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150"
                    style={{ color: MUTED }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.background = HOVER_BG;
                      (e.currentTarget as HTMLElement).style.color = TEXT;
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                      (e.currentTarget as HTMLElement).style.color = MUTED;
                    }}
                  >
                    <Settings className="h-3 w-3" />
                    Paramètres
                  </Link>
                  <button
                    onClick={() => logout()}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150"
                    style={{ color: MUTED }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.background = 'rgba(248,113,113,0.06)';
                      (e.currentTarget as HTMLElement).style.color = '#f87171';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                      (e.currentTarget as HTMLElement).style.color = MUTED;
                    }}
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
                      className="flex items-center justify-center p-2 rounded-xl transition-all duration-150 w-full"
                      style={{ color: MUTED }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.background = HOVER_BG;
                        (e.currentTarget as HTMLElement).style.color = TEXT;
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.background = 'transparent';
                        (e.currentTarget as HTMLElement).style.color = MUTED;
                      }}
                    >
                      <Settings className="h-4 w-4" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" style={{ background: CARD, color: TEXT, border: `1px solid ${SEPARATOR}` }}>
                    Paramètres
                  </TooltipContent>
                </Tooltip>
              </div>
            )}
          </div>
        )}

        {/* Collapse toggle */}
        <div className="p-2 shrink-0" style={{ borderTop: `1px solid ${SEPARATOR}` }}>
          <button
            onClick={toggleSidebar}
            className="w-full flex items-center justify-center h-8 rounded-xl text-sm font-medium transition-all duration-150"
            style={{ color: MUTED }}
            aria-label={sidebarCollapsed ? 'Étendre la sidebar' : 'Réduire la sidebar'}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = HOVER_BG;
              (e.currentTarget as HTMLElement).style.color = GOLD;
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'transparent';
              (e.currentTarget as HTMLElement).style.color = MUTED;
            }}
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
      </motion.aside>
    </TooltipProvider>
  );
}
