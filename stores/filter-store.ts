// ============================================================================
// FILTER STORE — Zustand avec persist, debounce, sync URL, et computed values
// ============================================================================

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { subscribeWithSelector } from 'zustand/middleware';
import { debounce } from '@/lib/utils';
import type { Sector } from '@/types/actor';
import { COUNTRIES, REGIONS } from '@/lib/utils';

// ── Types de périodes ──
export type FilterPeriod = '7d' | '30d' | '90d' | '1y';

// ── Interface des filtres ──
export interface GlobalFilters {
  sector?: Sector;
  country?: string;
  region?: string;
  period: FilterPeriod;
  search: string;
  isVerified?: boolean;
  isActive?: boolean;
  sortBy: 'name' | 'created_at' | 'updated_at' | 'relevance';
  sortOrder: 'asc' | 'desc';
}

// ── État complet du store ──
interface FilterState {
  // Données
  filters: GlobalFilters;
  
  // UI / Debounce
  searchInput: string; // Valeur brute de l'input (avant debounce)
  isSearching: boolean;
  
  // Computed (dérivés)
  hasActiveFilters: boolean;
  activeFiltersCount: number;
  
  // Actions
  setFilter: <K extends keyof GlobalFilters>(key: K, value: GlobalFilters[K]) => void;
  setSearchInput: (value: string) => void;
  applySearch: () => void;
  resetFilters: () => void;
  resetFilter: <K extends keyof GlobalFilters>(key: K) => void;
  resetCategory: (category: 'location' | 'time' | 'status' | 'sort') => void;
  toggleSortOrder: () => void;
  debouncedSearch: () => void;
}

// ── Valeurs par défaut ──
const DEFAULT_FILTERS: GlobalFilters = {
  period: '30d',
  search: '',
  sortBy: 'relevance',
  sortOrder: 'desc',
};

// ── Sélecteurs optimisés ──
export const selectFilters = (state: FilterState) => state.filters;
export const selectSearch = (state: FilterState) => state.filters.search;
export const selectPeriod = (state: FilterState) => state.filters.period;
export const selectSector = (state: FilterState) => state.filters.sector;
export const selectHasActiveFilters = (state: FilterState) => state.hasActiveFilters;
export const selectActiveFiltersCount = (state: FilterState) => state.activeFiltersCount;

// ============================================================================
// STORE
// ============================================================================

export const useFilterStore = create<FilterState>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // ── État initial ──
        filters: { ...DEFAULT_FILTERS },
        searchInput: '',
        isSearching: false,
        hasActiveFilters: false,
        activeFiltersCount: 0,

        // ── Actions ──
        setFilter: (key, value) => {
          set((state) => {
            const newFilters = { ...state.filters, [key]: value };
            
            // Validation: vérifier que le pays existe
            if (key === 'country' && value) {
              const countryCode = (value as string).toUpperCase();
              const exists = COUNTRIES.some(c => c.code === countryCode);
              if (!exists) {
                console.warn(`[FilterStore] Pays invalide: ${value}`);
                return state; // Ne pas appliquer
              }
            }

            // Validation: vérifier que la région existe
            if (key === 'region' && value) {
              const exists = REGIONS.includes(value as typeof REGIONS[number]);
              if (!exists) {
                console.warn(`[FilterStore] Région invalide: ${value}`);
                return state;
              }
            }

            // Recalcul des computed values
            const activeCount = countActiveFilters(newFilters);
            
            return {
              filters: newFilters,
              hasActiveFilters: activeCount > 0,
              activeFiltersCount: activeCount,
            };
          });
          
          // Sync URL (optionnel, côté client uniquement)
          if (typeof window !== 'undefined') {
            syncUrlWithFilters(get().filters);
          }
        },

        setSearchInput: (value) => {
          set({ searchInput: value, isSearching: value.length > 0 });
          // Debounce automatique
          get().debouncedSearch();
        },

        debouncedSearch: debounce(() => {
          const { searchInput } = get();
          get().setFilter('search', searchInput);
        }, 300),

        applySearch: () => {
          const { searchInput } = get();
          get().setFilter('search', searchInput);
        },

        resetFilters: () => set({
          filters: { ...DEFAULT_FILTERS },
          searchInput: '',
          hasActiveFilters: false,
          activeFiltersCount: 0,
        }),

        resetFilter: (key) => {
          const defaultValue = DEFAULT_FILTERS[key];
          get().setFilter(key, defaultValue);
        },

        resetCategory: (category) => {
          const updates: Partial<GlobalFilters> = {};
          
          switch (category) {
            case 'location':
              updates.country = undefined;
              updates.region = undefined;
              break;
            case 'time':
              updates.period = '30d';
              break;
            case 'status':
              updates.isVerified = undefined;
              updates.isActive = undefined;
              break;
            case 'sort':
              updates.sortBy = 'relevance';
              updates.sortOrder = 'desc';
              break;
          }
          
          set((state) => {
            const newFilters = { ...state.filters, ...updates };
            const activeCount = countActiveFilters(newFilters);
            return {
              filters: newFilters,
              hasActiveFilters: activeCount > 0,
              activeFiltersCount: activeCount,
            };
          });
        },

        toggleSortOrder: () => {
          const current = get().filters.sortOrder;
          get().setFilter('sortOrder', current === 'asc' ? 'desc' : 'asc');
        },
      }),
      {
        name: 'agriintel360-filters',
        storage: createJSONStorage(() => localStorage),
        
        // ── Sélection des champs à persister ──
        partialize: (state) => ({
          filters: state.filters,
        }),
        
        // ── Versioning ──
        version: 1,
        migrate: (persistedState: unknown, version: number) => {
          if (version === 0) {
            // Migration: ajouter les nouveaux champs si manquants
            const state = persistedState as { filters?: Partial<GlobalFilters> };
            return {
              filters: {
                ...DEFAULT_FILTERS,
                ...state.filters,
              },
            };
          }
          return persistedState;
        },
      }
    )
  )
);

// ============================================================================
// UTILITAIRES INTERNES
// ============================================================================

/**
 * Compte le nombre de filtres actifs (différents des valeurs par défaut)
 */
function countActiveFilters(filters: GlobalFilters): number {
  let count = 0;
  
  if (filters.sector) count++;
  if (filters.country) count++;
  if (filters.region) count++;
  if (filters.period !== '30d') count++;
  if (filters.search) count++;
  if (filters.isVerified !== undefined) count++;
  if (filters.isActive !== undefined) count++;
  if (filters.sortBy !== 'relevance') count++;
  if (filters.sortOrder !== 'desc') count++;
  
  return count;
}

/**
 * Synchronise les filtres avec l'URL (pour partage de liens)
 */
function syncUrlWithFilters(filters: GlobalFilters): void {
  const url = new URL(window.location.href);
  const params = url.searchParams;
  
  // Nettoyer les anciens filtres
  params.delete('sector');
  params.delete('country');
  params.delete('region');
  params.delete('period');
  params.delete('search');
  params.delete('sort');
  
  // Ajouter les nouveaux
  if (filters.sector) params.set('sector', filters.sector);
  if (filters.country) params.set('country', filters.country);
  if (filters.region) params.set('region', filters.region);
  if (filters.period !== '30d') params.set('period', filters.period);
  if (filters.search) params.set('search', filters.search);
  if (filters.sortBy !== 'relevance') {
    params.set('sort', `${filters.sortBy}-${filters.sortOrder}`);
  }
  
  window.history.replaceState({}, '', url.toString());
}

/**
 * Parse les filtres depuis l'URL (à appeler au montage de l'app)
 */
export function parseFiltersFromUrl(): Partial<GlobalFilters> {
  if (typeof window === 'undefined') return {};
  
  const params = new URLSearchParams(window.location.search);
  const filters: Partial<GlobalFilters> = {};
  
  const sector = params.get('sector') as Sector | null;
  if (sector) filters.sector = sector;
  
  const country = params.get('country');
  if (country) filters.country = country;
  
  const region = params.get('region');
  if (region) filters.region = region;
  
  const period = params.get('period') as FilterPeriod | null;
  if (period && ['7d', '30d', '90d', '1y'].includes(period)) {
    filters.period = period;
  }
  
  const search = params.get('search');
  if (search) filters.search = search;
  
  const sort = params.get('sort');
  if (sort) {
    const [sortBy, sortOrder] = sort.split('-');
    if (sortBy && ['name', 'created_at', 'updated_at', 'relevance'].includes(sortBy)) {
      filters.sortBy = sortBy as GlobalFilters['sortBy'];
    }
    if (sortOrder && ['asc', 'desc'].includes(sortOrder)) {
      filters.sortOrder = sortOrder as GlobalFilters['sortOrder'];
    }
  }
  
  return filters;
}

// ============================================================================
// HOOKS DERIVÉS
// ============================================================================

/**
 * Hook optimisé: ne re-render que si les filtres changent
 */
export function useFilters(): GlobalFilters {
  return useFilterStore(selectFilters);
}

/**
 * Hook optimisé: ne re-render que si la recherche change
 */
export function useSearchFilter(): string {
  return useFilterStore(selectSearch);
}

/**
 * Hook pour savoir si un filtre spécifique est actif
 */
export function useIsFilterActive<K extends keyof GlobalFilters>(key: K): boolean {
  return useFilterStore((state) => {
    const value = state.filters[key];
    const defaultValue = DEFAULT_FILTERS[key];
    return value !== defaultValue && value !== undefined;
  });
}

/**
 * Hook pour les filtres de localisation (pays + région)
 */
export function useLocationFilters(): { country?: string; region?: string } {
  return useFilterStore((state) => ({
    country: state.filters.country,
    region: state.filters.region,
  }));
}

// ============================================================================
// SUBSCRIPTIONS (pour effets de bord globaux)
// ============================================================================

// Exemple: Log des changements de filtres en dev
if (process.env.NODE_ENV === 'development') {
  useFilterStore.subscribe(
    (state) => state.filters,
    (filters) => {
      console.log('[FilterStore] Filters changed:', filters);
    }
  );
}