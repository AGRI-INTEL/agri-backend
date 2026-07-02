'use client';

import { useState, useEffect } from 'react';
import { Bell, Search, Menu, LogOut, User, Settings, ChevronDown, Languages, Sun, Moon } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';
import { useAuth } from '@/hooks/use-auth';
import { useCommandPalette } from '@/hooks/use-command-palette';
import Link from 'next/link';

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const { user } = useAuthStore();
  const { setSidebarMobileOpen, unreadNotifications } = useUIStore();
  const { logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { open: openCommandPalette } = useCommandPalette();

  return (
    <header
      className={`fixed top-0 right-0 z-20 h-header flex items-center justify-between px-4 gap-4 transition-all duration-200 lg:left-[var(--sidebar-width)] left-0 bg-background/90 backdrop-blur-lg border-b border-border ${className || ''}`}
      role="banner"
    >
      {/* Mobile menu */}
      <button
        className="lg:hidden flex items-center justify-center h-9 w-9 rounded-xl transition-all duration-150 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
        onClick={() => setSidebarMobileOpen(true)}
        aria-label="Ouvrir le menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Search — ouvre la CommandPalette */}
      <div className="flex-1 max-w-md hidden sm:block">
        <button
          onClick={openCommandPalette}
          className="w-full flex items-center gap-2.5 h-9 px-3 rounded-xl text-sm transition-all duration-150 bg-card border border-border/20 hover:border-border/40 text-muted-foreground"
          aria-label="Rechercher"
        >
          <Search className="h-4 w-4 shrink-0" />
          <span>Rechercher...</span>
          <kbd
            className="ml-auto text-[10px] px-1.5 py-0.5 rounded-md font-mono bg-secondary/10 text-secondary border border-secondary/20"
          >
            ⌘K
          </kbd>
        </button>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Language Switcher */}
        <LanguageSwitcherInHeader />

        {/* Theme Toggle */}
        <ThemeToggleButton />

        {/* Notifications */}
        <Link href="/notifications">
          <button
            className="relative flex items-center justify-center h-9 w-9 rounded-xl transition-all duration-150 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            aria-label={`${unreadNotifications} notifications non lues`}
          >
            <Bell className="h-5 w-5" />
            {unreadNotifications > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] px-0.5 flex items-center justify-center rounded-full text-[10px] font-bold bg-secondary text-secondary-foreground"
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
              className={`flex items-center gap-2 h-9 px-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-foreground border ${userMenuOpen ? 'bg-card border-border/20' : 'border-transparent hover:bg-muted/50'}`}
            >
              <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden ${!user.avatar ? 'bg-secondary text-secondary-foreground' : ''}`}>
                {user.avatar ? (
                  <img src={user.avatar} alt="" className="h-full w-full object-cover" />
                ) : (
                  (user.name || user.email || 'U')[0].toUpperCase()
                )}
              </div>
              <span className="hidden md:block max-w-[100px] truncate text-[13px] text-foreground">
                {user.name || user.email?.split('@')[0]}
              </span>
              <ChevronDown className="hidden md:block h-3 w-3 text-muted-foreground" />
            </button>

            {userMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setUserMenuOpen(false)}
                />
                <div
                  className="absolute right-0 top-full mt-1.5 w-52 rounded-xl shadow-xl z-50 py-1.5 overflow-hidden bg-card border border-border/20 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
                >
                  <div
                    className="px-3 py-2.5 mb-1 border-b border-border/10"
                  >
                    <p className="text-sm font-semibold text-foreground">{user.name}</p>
                    <p className="text-xs mt-0.5 truncate text-muted-foreground">{user.email}</p>
                  </div>
                  <Link
                    href="/settings/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm transition-all duration-150 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  >
                    <User className="h-4 w-4" />
                    Mon profil
                  </Link>
                  <Link
                    href="/settings/preferences"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm transition-all duration-150 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  >
                    <Settings className="h-4 w-4" />
                    Paramètres
                  </Link>
                  <div className="mx-3 my-1 border-t border-border/10" />
                  <button
                    onClick={() => { logout(); setUserMenuOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-all duration-150 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
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

function LanguageSwitcherInHeader() {
  const [current, setCurrent] = useState<'fr' | 'en'>('fr');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('agriintel-locale');
      if (stored === 'en' || stored === 'fr') setCurrent(stored);
    }
    setMounted(true);
  }, []);

  const toggle = () => {
    const next = current === 'fr' ? 'en' : 'fr';
    setCurrent(next);
    localStorage.setItem('agriintel-locale', next);
    document.documentElement.lang = next;
    document.cookie = `AGRI_LANG=${next}; path=/; max-age=${365 * 86400}; SameSite=Lax`;
    window.dispatchEvent(new CustomEvent('locale-changed', { detail: next }));
  };

  if (!mounted) return null;

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1 h-9 px-2 rounded-xl text-xs font-bold uppercase transition-all duration-150 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
      aria-label="Changer de langue"
    >
      <Languages className="h-3.5 w-3.5" />
      <span>{current === 'fr' ? 'EN' : 'FR'}</span>
    </button>
  );
}

function ThemeToggleButton() {
  const { theme, toggleTheme } = useUIStore();
  const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center justify-center h-9 w-9 rounded-xl transition-all duration-150 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
      aria-label={isDark ? 'Activer le mode clair' : 'Activer le mode sombre'}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
