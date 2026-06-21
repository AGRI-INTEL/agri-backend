'use client';

import { useState } from 'react';
import { Bell, Search, Menu, LogOut, User, Settings, ChevronDown } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';

const GROUND = '#0C1810';
const CARD = '#152219';
const TEXT = '#E8E0CC';
const MUTED = '#7D9486';
const GOLD = '#C4923A';
const SEPARATOR = 'rgba(196,146,58,0.12)';
const HOVER_BG = 'rgba(196,146,58,0.06)';

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const { user } = useAuthStore();
  const { setSidebarMobileOpen, unreadNotifications } = useUIStore();
  const { logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header
      className={`fixed top-0 right-0 z-20 h-header flex items-center justify-between px-4 gap-4 transition-all duration-200 lg:left-[var(--sidebar-width)] left-0 ${className || ''}`}
      style={{
        background: `${GROUND}E6`,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${SEPARATOR}`,
      }}
      role="banner"
    >
      {/* Mobile menu */}
      <button
        className="lg:hidden flex items-center justify-center h-9 w-9 rounded-xl transition-all duration-150"
        onClick={() => setSidebarMobileOpen(true)}
        aria-label="Ouvrir le menu"
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
        <Menu className="h-5 w-5" />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-md hidden sm:block">
        <button
          className="w-full flex items-center gap-2.5 h-9 px-3 rounded-xl text-sm transition-all duration-150"
          style={{
            background: CARD,
            border: '1px solid rgba(196,146,58,0.14)',
            color: MUTED,
          }}
          aria-label="Rechercher"
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(196,146,58,0.30)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(196,146,58,0.14)';
          }}
        >
          <Search className="h-4 w-4 shrink-0" />
          <span>Rechercher...</span>
          <kbd
            className="ml-auto text-[10px] px-1.5 py-0.5 rounded-md font-mono"
            style={{
              background: 'rgba(196,146,58,0.10)',
              color: GOLD,
              border: '1px solid rgba(196,146,58,0.20)',
            }}
          >
            ⌘K
          </kbd>
        </button>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Notifications */}
        <Link href="/notifications">
          <button
            className="relative flex items-center justify-center h-9 w-9 rounded-xl transition-all duration-150"
            style={{ color: MUTED }}
            aria-label={`${unreadNotifications} notifications non lues`}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = HOVER_BG;
              (e.currentTarget as HTMLElement).style.color = TEXT;
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'transparent';
              (e.currentTarget as HTMLElement).style.color = MUTED;
            }}
          >
            <Bell className="h-5 w-5" />
            {unreadNotifications > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] px-0.5 flex items-center justify-center rounded-full text-[10px] font-bold"
                style={{ background: GOLD, color: '#1A1000' }}
              >
                {unreadNotifications > 9 ? '9+' : unreadNotifications}
              </span>
            )}
          </button>
        </Link>

        {/* User menu */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 h-9 px-2.5 rounded-xl text-sm font-medium transition-all duration-150"
              style={{
                background: userMenuOpen ? CARD : 'transparent',
                border: userMenuOpen ? '1px solid rgba(196,146,58,0.22)' : '1px solid transparent',
                color: TEXT,
              }}
              onMouseEnter={e => {
                if (!userMenuOpen) {
                  (e.currentTarget as HTMLElement).style.background = HOVER_BG;
                }
              }}
              onMouseLeave={e => {
                if (!userMenuOpen) {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                }
              }}
            >
              <div
                className="h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{ background: GOLD, color: '#1A1000' }}
              >
                {(user.name || user.email || 'U')[0].toUpperCase()}
              </div>
              <span className="hidden md:block max-w-[100px] truncate text-[13px]" style={{ color: TEXT }}>
                {user.name || user.email?.split('@')[0]}
              </span>
              <ChevronDown className="hidden md:block h-3 w-3" style={{ color: MUTED }} />
            </button>

            {userMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setUserMenuOpen(false)}
                />
                <div
                  className="absolute right-0 top-full mt-1.5 w-52 rounded-xl shadow-xl z-50 py-1.5 overflow-hidden"
                  style={{
                    background: CARD,
                    border: '1px solid rgba(196,146,58,0.22)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(196,146,58,0.10)',
                  }}
                >
                  <div
                    className="px-3 py-2.5 mb-1"
                    style={{ borderBottom: '1px solid rgba(196,146,58,0.10)' }}
                  >
                    <p className="text-sm font-semibold" style={{ color: TEXT }}>{user.name}</p>
                    <p className="text-xs mt-0.5 truncate" style={{ color: MUTED }}>{user.email}</p>
                  </div>
                  <Link
                    href="/settings/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm transition-all duration-150"
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
                    <User className="h-4 w-4" />
                    Mon profil
                  </Link>
                  <Link
                    href="/settings/preferences"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm transition-all duration-150"
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
                    Paramètres
                  </Link>
                  <div
                    className="mx-3 my-1"
                    style={{ height: '1px', background: 'rgba(196,146,58,0.10)' }}
                  />
                  <button
                    onClick={() => { logout(); setUserMenuOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-all duration-150"
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
                    <LogOut className="h-4 w-4" />
                    Déconnexion
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
