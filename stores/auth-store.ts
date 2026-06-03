// ============================================================================
// AUTH STORE — Zustand avec persist, hydration, et sélecteurs optimisés
// ============================================================================

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { clearAuthSession, getStoredAccessToken } from '@/lib/auth-session';
import type { Permission, User } from '@/types/auth';

// ── État de l'hydratation (évite le flash au rechargement) ──
type HydrationState = 'pending' | 'hydrating' | 'complete' | 'error';

// ── Interface complète ──
interface AuthState {
  // Données
  user: User | null;
  isAuthenticated: boolean;
  
  // UI / Loading
  isLoading: boolean;
  hydrationState: HydrationState;
  
  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  updateUser: (partial: Partial<User>) => void;
  logout: () => Promise<void>;
  rehydrate: () => Promise<void>;
}

// ── Sélecteurs typés (évite les re-renders) ──
export const selectUser = (state: AuthState) => state.user;
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;
export const selectIsLoading = (state: AuthState) => state.isLoading;
export const selectIsHydrated = (state: AuthState) => state.hydrationState === 'complete';
export const selectUserRole = (state: AuthState) => state.user?.role;
export const selectUserPermissions = (state: AuthState) => state.user?.permissions ?? [];

// ── Store ──
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => {
      // Chargement initial à partir du localStorage
      const token = getStoredAccessToken();

      return {
        // état initial
        user: null,
        isAuthenticated: !!token,
        isLoading: !!token,
        hydrationState: 'pending',

        // actions
        setUser: (user) =>
          set({
            user,
            isAuthenticated: !!user,
            isLoading: false,
            hydrationState: 'complete',
          }),

        setLoading: (isLoading) => set({ isLoading }),

        updateUser: (partial) => {
          const current = get().user;
          if (!current) return;
          set({ user: { ...current, ...partial }, isAuthenticated: true });
        },

        logout: async () => {
          set({ isLoading: true });
          try {
            clearAuthSession();
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              hydrationState: 'complete',
            });
          } catch (error) {
            console.error('[AuthStore] Logout error:', error);
            clearAuthSession();
            set({ user: null, isAuthenticated: false, isLoading: false });
            throw error;
          }
        },

        rehydrate: async () => {
          set({ hydrationState: 'hydrating', isLoading: true });
          try {
            const token = getStoredAccessToken();
            if (!token) {
              set({ hydrationState: 'complete', isLoading: false });
              return;
            }
            set({ hydrationState: 'complete', isLoading: false });
          } catch (error) {
            console.error('[AuthStore] Rehydration error:', error);
            clearAuthSession();
            set({
              user: null,
              isAuthenticated: false,
              hydrationState: 'error',
              isLoading: false,
            });
          }
        },
      };
    },
    {
      name: 'agriintel360-auth',
      storage: createJSONStorage(() => localStorage),
      
      // ── Sélection des champs à persister ──
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),

      // ── Hook exécuté au rehydrate ──
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('[AuthStore] Persist rehydrate failed:', error);
          return;
        }
        // Marquer comme hydraté pour éviter le flash
        if (state) {
          state.hydrationState = 'complete';
          state.isLoading = false;
        }
      },

      // ── Versioning pour invalider le cache ──
      version: 1,
      migrate: (persistedState: unknown, version: number) => {
        if (version === 0) {
          // Migration v0 → v1: nettoyer ancien format
          return { user: null, isAuthenticated: false };
        }
        return persistedState as AuthState;
      },
    }
  )
);

// ============================================================================
// HOOKS DERIVÉS (pour usage dans les composants)
// ============================================================================

/**
 * Hook optimisé: ne re-render que si l'état d'authentification change
 */
export function useIsAuthenticated(): boolean {
  return useAuthStore(selectIsAuthenticated);
}

/**
 * Hook optimisé: ne re-render que si l'utilisateur change
 */
export function useCurrentUser(): User | null {
  return useAuthStore(selectUser);
}

/**
 * Hook optimisé: vérifier une permission spécifique
 */
export function useHasPermission(permission: Permission): boolean {
  return useAuthStore(
    (state) => state.user?.permissions?.includes(permission) ?? false
  );
}

/**
 * Hook pour attendre l'hydratation (SSR-safe)
 */
export function useAuthHydrated(): boolean {
  return useAuthStore(selectIsHydrated);
}

// ============================================================================
// UTILITAIRES GLOBALS
// ============================================================================

/**
 * Vérifier si l'utilisateur a un rôle admin (hors React)
 */
export function isAdmin(): boolean {
  const user = useAuthStore.getState().user;
  return user?.role === 'super_admin' || user?.role === 'admin';
}

/**
 * Récupérer le token pour les appels API (hors React)
 */
export function getAuthToken(): string | null {
  return getStoredAccessToken();
}