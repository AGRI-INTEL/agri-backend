// ============================================================================
// UI STORE — Zustand avec thème résolu, i18n complète, et accessibilité
// ============================================================================

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { subscribeWithSelector } from 'zustand/middleware';
import type { LanguageCode } from '@/types/auth';
import { SUPPORTED_TIMEZONES, DEFAULT_TIMEZONE } from '@/lib/constants';

// ── Types complets ──
export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';
export type Direction = 'ltr' | 'rtl';

export type FontSize = 'sm' | 'base' | 'lg' | 'xl';
export type ReducedMotion = 'no-preference' | 'reduce';

export interface ModalState {
  id: string;
  open: boolean;
  props?: Record<string, unknown>;
}

export interface ToastState {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
}

// ── État complet ──
interface UIState {
  // Thème
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  fontSize: FontSize;
  reducedMotion: ReducedMotion;
  
  // Langue & i18n
  language: LanguageCode;
  direction: Direction;
  timezone: string;
  
  // Layout
  sidebarCollapsed: boolean;
  sidebarMobileOpen: boolean;
  rightPanelOpen: boolean;
  rightPanelContent?: string;
  
  // Notifications
  notificationsOpen: boolean;
  unreadNotifications: number;
  notificationSound: boolean;
  
  // Modales & overlays
  modals: ModalState[];
  toasts: ToastState[];
  scrollLocked: boolean;
  
  // Responsive
  isMobile: boolean;
  isTablet: boolean;
  isTouch: boolean;
  
  // Computed
  isDark: boolean;
  
  // ── Actions thème ──
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setFontSize: (size: FontSize) => void;
  setReducedMotion: (pref: ReducedMotion) => void;
  
  // ── Actions langue ──
  setLanguage: (language: LanguageCode) => void;
  setTimezone: (timezone: string) => void;
  
  // ── Actions layout ──
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setSidebarMobileOpen: (open: boolean) => void;
  toggleRightPanel: (content?: string) => void;
  
  // ── Actions notifications ──
  setNotificationsOpen: (open: boolean) => void;
  setUnreadNotifications: (count: number) => void;
  incrementUnread: () => void;
  decrementUnread: () => void;
  clearUnread: () => void;
  toggleNotificationSound: () => void;
  
  // ── Actions modales ──
  openModal: (id: string, props?: Record<string, unknown>) => void;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
  
  // ── Actions toasts ──
  addToast: (toast: Omit<ToastState, 'id'>) => void;
  removeToast: (id: string) => void;
  
  // ── Actions responsive ──
  setViewportSize: (width: number) => void;
  setTouchDevice: (isTouch: boolean) => void;
  
  // ── Actions scroll ──
  lockScroll: () => void;
  unlockScroll: () => void;
}

// ── Langues RTL ──
const RTL_LANGUAGES: LanguageCode[] = ['ar'];

// ── Résolution du thème système ──
function resolveTheme(theme: Theme): ResolvedTheme {
  if (theme !== 'system') return theme;
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// ── Direction depuis la langue ──
function getDirection(language: LanguageCode): Direction {
  return RTL_LANGUAGES.includes(language) ? 'rtl' : 'ltr';
}

// ============================================================================
// STORE
// ============================================================================

export const useUIStore = create<UIState>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // ── État initial ──
        theme: 'system',
        resolvedTheme: 'light',
        fontSize: 'base',
        reducedMotion: 'no-preference',
        
        language: 'fr',
        direction: 'ltr',
        timezone: DEFAULT_TIMEZONE,
        
        sidebarCollapsed: false,
        sidebarMobileOpen: false,
        rightPanelOpen: false,
        
        notificationsOpen: false,
        unreadNotifications: 0,
        notificationSound: true,
        
        modals: [],
        toasts: [],
        scrollLocked: false,
        
        isMobile: false,
        isTablet: false,
        isTouch: false,
        
        isDark: false,

        // ── Thème ──
        setTheme: (theme) => {
          const resolved = resolveTheme(theme);
          set({
            theme,
            resolvedTheme: resolved,
            isDark: resolved === 'dark',
          });
          // Appliquer au document
          if (typeof document !== 'undefined') {
            document.documentElement.classList.toggle('dark', resolved === 'dark');
            document.documentElement.setAttribute('data-theme', resolved);
          }
        },

        toggleTheme: () => {
          const { theme, resolvedTheme } = get();
          const next: Theme = theme === 'system' 
            ? (resolvedTheme === 'dark' ? 'light' : 'dark')
            : (resolvedTheme === 'dark' ? 'light' : 'dark');
          get().setTheme(next);
        },

        setFontSize: (fontSize) => {
          set({ fontSize });
          if (typeof document !== 'undefined') {
            document.documentElement.style.fontSize = {
              sm: '14px',
              base: '16px',
              lg: '18px',
              xl: '20px',
            }[fontSize];
          }
        },

        setReducedMotion: (reducedMotion) => {
          set({ reducedMotion });
          if (typeof document !== 'undefined') {
            document.documentElement.classList.toggle('reduce-motion', reducedMotion === 'reduce');
          }
        },

        // ── Langue ──
        setLanguage: (language) => {
          const direction = getDirection(language);
          set({ language, direction });
          if (typeof document !== 'undefined') {
            document.documentElement.lang = language;
            document.documentElement.dir = direction;
          }
        },

        setTimezone: (timezone) => set({ timezone }),

        // ── Layout ──
        toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
        
        setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
        
        setSidebarMobileOpen: (sidebarMobileOpen) => {
          set({ sidebarMobileOpen });
          if (sidebarMobileOpen) get().lockScroll();
          else if (get().modals.length === 0) get().unlockScroll();
        },

        toggleRightPanel: (content) => set((s) => ({
          rightPanelOpen: content ? !s.rightPanelOpen : false,
          rightPanelContent: content,
        })),

        // ── Notifications ──
        setNotificationsOpen: (notificationsOpen) => {
          set({ notificationsOpen });
          if (notificationsOpen) get().clearUnread();
        },

        setUnreadNotifications: (unreadNotifications) => set({ unreadNotifications }),

        incrementUnread: () => set((s) => ({ unreadNotifications: s.unreadNotifications + 1 })),

        decrementUnread: () => set((s) => ({
          unreadNotifications: Math.max(0, s.unreadNotifications - 1),
        })),

        clearUnread: () => set({ unreadNotifications: 0 }),

        toggleNotificationSound: () => set((s) => ({ notificationSound: !s.notificationSound })),

        // ── Modales ──
        openModal: (id, props) => {
          set((s) => ({
            modals: [...s.modals, { id, open: true, props }],
          }));
          get().lockScroll();
        },

        closeModal: (id) => {
          set((s) => {
            const filtered = s.modals.filter((m) => m.id !== id);
            const hasOpenModals = filtered.some((m) => m.open);
            if (!hasOpenModals && !s.sidebarMobileOpen) {
              get().unlockScroll();
            }
            return { modals: filtered };
          });
        },

        closeAllModals: () => {
          set({ modals: [] });
          if (!get().sidebarMobileOpen) get().unlockScroll();
        },

        // ── Toasts ──
        addToast: (toast) => {
          const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
          set((s) => ({
            toasts: [...s.toasts, { ...toast, id }],
          }));
          // Auto-remove
          setTimeout(() => {
            get().removeToast(id);
          }, toast.duration ?? 5000);
        },

        removeToast: (id) => set((s) => ({
          toasts: s.toasts.filter((t) => t.id !== id),
        })),

        // ── Responsive ──
        setViewportSize: (width) => {
          const isMobile = width < 768;
          const isTablet = width >= 768 && width < 1024;
          set({ isMobile, isTablet });
          
          // Auto-collapse sidebar sur mobile
          if (isMobile && !get().sidebarCollapsed) {
            set({ sidebarCollapsed: true });
          }
        },

        setTouchDevice: (isTouch) => set({ isTouch }),

        // ── Scroll ──
        lockScroll: () => {
          if (typeof document !== 'undefined') {
            document.body.style.overflow = 'hidden';
            document.body.style.paddingRight = 'var(--scrollbar-width, 0px)';
          }
          set({ scrollLocked: true });
        },

        unlockScroll: () => {
          if (typeof document !== 'undefined' && get().modals.length === 0 && !get().sidebarMobileOpen) {
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
          }
          set({ scrollLocked: false });
        },
      }),
      {
        name: 'agriintel360-ui',
        storage: createJSONStorage(() => localStorage),
        
        // ── Sélection des champs à persister ──
        partialize: (state) => ({
          theme: state.theme,
          language: state.language,
          sidebarCollapsed: state.sidebarCollapsed,
          fontSize: state.fontSize,
          reducedMotion: state.reducedMotion,
          timezone: state.timezone,
          notificationSound: state.notificationSound,
        }),
        
        // ── Post-rehydratation ──
        onRehydrateStorage: () => (state, error) => {
          if (error || !state) return;
          
          // Résoudre le thème système après rehydrate
          const resolved = resolveTheme(state.theme);
          state.resolvedTheme = resolved;
          state.isDark = resolved === 'dark';
          state.direction = getDirection(state.language);
          
          // Appliquer au DOM
          if (typeof document !== 'undefined') {
            document.documentElement.classList.toggle('dark', resolved === 'dark');
            document.documentElement.lang = state.language;
            document.documentElement.dir = state.direction;
          }
        },
        
        version: 1,
      }
    )
  )
);

// ============================================================================
// SÉLECTEURS OPTIMISÉS
// ============================================================================

export const selectTheme = (state: UIState) => state.theme;
export const selectResolvedTheme = (state: UIState) => state.resolvedTheme;
export const selectIsDark = (state: UIState) => state.isDark;
export const selectLanguage = (state: UIState) => state.language;
export const selectDirection = (state: UIState) => state.direction;
export const selectSidebarCollapsed = (state: UIState) => state.sidebarCollapsed;
export const selectSidebarMobileOpen = (state: UIState) => state.sidebarMobileOpen;
export const selectNotificationsOpen = (state: UIState) => state.notificationsOpen;
export const selectUnreadCount = (state: UIState) => state.unreadNotifications;
export const selectModals = (state: UIState) => state.modals;
export const selectIsMobile = (state: UIState) => state.isMobile;
export const selectIsTablet = (state: UIState) => state.isTablet;
export const selectFontSize = (state: UIState) => state.fontSize;
export const selectReducedMotion = (state: UIState) => state.reducedMotion;

// ============================================================================
// HOOKS DERIVÉS
// ============================================================================

/**
 * Hook optimisé: thème résolu (light/dark)
 */
export function useTheme(): ResolvedTheme {
  return useUIStore(selectResolvedTheme);
}

/**
 * Hook: vérifier si dark mode actif
 */
export function useIsDark(): boolean {
  return useUIStore(selectIsDark);
}

/**
 * Hook optimisé: langue avec direction
 */
export function useLanguage(): { language: LanguageCode; direction: Direction; isRTL: boolean } {
  const language = useUIStore(selectLanguage);
  const direction = useUIStore(selectDirection);
  return { language, direction, isRTL: direction === 'rtl' };
}

/**
 * Hook: état du sidebar (desktop + mobile)
 */
export function useSidebarState(): {
  collapsed: boolean;
  mobileOpen: boolean;
  toggle: () => void;
  setMobileOpen: (open: boolean) => void;
} {
  const collapsed = useUIStore(selectSidebarCollapsed);
  const mobileOpen = useUIStore(selectSidebarMobileOpen);
  const store = useUIStore();
  
  return {
    collapsed,
    mobileOpen,
    toggle: store.toggleSidebar,
    setMobileOpen: store.setSidebarMobileOpen,
  };
}

/**
 * Hook: notifications avec actions
 */
export function useNotifications(): {
  open: boolean;
  unread: number;
  setOpen: (open: boolean) => void;
  increment: () => void;
  clear: () => void;
} {
  const open = useUIStore(selectNotificationsOpen);
  const unread = useUIStore(selectUnreadCount);
  const store = useUIStore();
  
  return {
    open,
    unread,
    setOpen: store.setNotificationsOpen,
    increment: store.incrementUnread,
    clear: store.clearUnread,
  };
}

/**
 * Hook: modales actives
 */
export function useActiveModals(): string[] {
  return useUIStore((state) => state.modals.map((m) => m.id));
}

/**
 * Hook: responsive breakpoints
 */
export function useBreakpoint(): {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouch: boolean;
} {
  const isMobile = useUIStore(selectIsMobile);
  const isTablet = useUIStore(selectIsTablet);
  const isTouch = useUIStore((state) => state.isTouch);
  
  return {
    isMobile,
    isTablet,
    isDesktop: !isMobile && !isTablet,
    isTouch,
  };
}

/**
 * Hook: accessibilité
 */
export function useAccessibility(): {
  fontSize: FontSize;
  reducedMotion: ReducedMotion;
  setFontSize: (size: FontSize) => void;
  setReducedMotion: (pref: ReducedMotion) => void;
} {
  const fontSize = useUIStore(selectFontSize);
  const reducedMotion = useUIStore(selectReducedMotion);
  const store = useUIStore();
  
  return {
    fontSize,
    reducedMotion,
    setFontSize: store.setFontSize,
    setReducedMotion: store.setReducedMotion,
  };
}

// ============================================================================
// UTILITAIRES GLOBALS
// ============================================================================

/**
 * Initialiser le responsive (à appeler au mount de l'app)
 */
export function initResponsive(): () => void {
  const handleResize = () => {
    useUIStore.getState().setViewportSize(window.innerWidth);
  };
  
  const handleTouch = () => {
    useUIStore.getState().setTouchDevice(
      'ontouchstart' in window || navigator.maxTouchPoints > 0
    );
  };
  
  // Initial
  handleResize();
  handleTouch();
  
  // Listeners
  window.addEventListener('resize', handleResize);
  window.addEventListener('orientationchange', handleResize);
  
  // Media query pour reduced-motion
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const handleMotion = (e: MediaQueryListEvent | MediaQueryList) => {
    useUIStore.getState().setReducedMotion(
      e.matches ? 'reduce' : 'no-preference'
    );
  };
  handleMotion(motionQuery);
  motionQuery.addEventListener('change', handleMotion);
  
  // Media query pour dark mode (si theme = system)
  const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handleDark = () => {
    const { theme } = useUIStore.getState();
    if (theme === 'system') {
      useUIStore.getState().setTheme('system');
    }
  };
  darkQuery.addEventListener('change', handleDark);
  
  // Cleanup
  return () => {
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('orientationchange', handleResize);
    motionQuery.removeEventListener('change', handleMotion);
    darkQuery.removeEventListener('change', handleDark);
  };
}

/**
 * Récupérer la timezone actuelle (hors React)
 */
export function getCurrentTimezone(): string {
  return useUIStore.getState().timezone;
}