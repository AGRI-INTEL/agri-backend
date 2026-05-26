// ============================================================================
// MAP STORE — Zustand avec persist, viewport history, et intégration MapLibre
// ============================================================================

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { subscribeWithSelector } from 'zustand/middleware';
import type { Sector } from '@/types/actor';
import { MAP_STYLES, MAP_DEFAULT_ZOOM, MAP_MIN_ZOOM, MAP_MAX_ZOOM } from '@/lib/constants';
import { SECTOR_COLORS } from '@/lib/utils';
import {
  MAP_MARKER_COLORS,
  type MapMarkerType,
  type MapViewport,
  type MapBounds,
  getCountryViewport,
  getBoundsFromMarkers,
  DEFAULT_AFRICA_VIEWPORT,
  type MapMarker,
} from '@/lib/map-styles';

// ── Types étendus ──
export type MapStyleId = 'streets' | 'satellite' | 'terrain' | 'dark';

export interface MapLayerConfig {
  id: string;
  label: string;
  type: 'sector' | 'overlay' | 'data';
  sector?: Sector;
  markerType?: MapMarkerType;
  visible: boolean;
  color: string;
  icon?: string;
  zIndex: number;
  clusterEnabled: boolean;
  heatmapEnabled: boolean;
}

export interface MapViewportState extends MapViewport {
  bounds?: MapBounds;
}

// ── État complet ──
interface MapState {
  // Viewport
  viewport: MapViewportState;
  style: MapStyleId;
  
  // Layers
  layers: MapLayerConfig[];
  
  // Interaction
  selectedMarkerId: string | null;
  hoveredMarkerId: string | null;
  popupOpen: boolean;
  
  // History (pour navigation précédent/suivant)
  viewportHistory: MapViewportState[];
  historyIndex: number;
  
  // Computed
  visibleLayers: MapLayerConfig[];
  activeSectors: Sector[];
  
  // Actions viewport
  setCenter: (center: [number, number]) => void;
  setZoom: (zoom: number) => void;
  setViewport: (viewport: Partial<MapViewportState>) => void;
  fitBounds: (bounds: MapBounds, padding?: number) => void;
  fitCountry: (countryCode: string) => void;
  fitMarkers: (markers: MapMarker[]) => void;
  goToHistory: (index: number) => void;
  goBack: () => void;
  goForward: () => void;
  pushToHistory: () => void;
  
  // Actions style
  setStyle: (style: MapStyleId) => void;
  cycleStyle: () => void;
  
  // Actions layers
  toggleLayer: (layerId: string) => void;
  setLayerVisible: (layerId: string, visible: boolean) => void;
  showAllLayers: () => void;
  hideAllLayers: () => void;
  toggleSectorLayers: (sector: Sector) => void;
  
  // Actions interaction
  setSelectedMarker: (id: string | null) => void;
  setHoveredMarker: (id: string | null) => void;
  closePopup: () => void;
  
  // Reset
  resetViewport: () => void;
  resetLayers: () => void;
}

// ── Configuration par défaut des layers ──
const DEFAULT_LAYERS: MapLayerConfig[] = [
  {
    id: 'vegetal',
    label: 'Producteurs',
    type: 'sector',
    sector: 'vegetal',
    markerType: 'vegetal',
    visible: true,
    color: SECTOR_COLORS.vegetal,
    icon: '🌱',
    zIndex: 1,
    clusterEnabled: true,
    heatmapEnabled: false,
  },
  {
    id: 'animal',
    label: 'Éleveurs',
    type: 'sector',
    sector: 'animal',
    markerType: 'animal',
    visible: true,
    color: SECTOR_COLORS.animal,
    icon: '🐄',
    zIndex: 1,
    clusterEnabled: true,
    heatmapEnabled: false,
  },
  {
    id: 'halieutique',
    label: 'Pêcheurs',
    type: 'sector',
    sector: 'halieutique',
    markerType: 'halieutique',
    visible: true,
    color: SECTOR_COLORS.halieutique,
    icon: '🎣',
    zIndex: 1,
    clusterEnabled: true,
    heatmapEnabled: false,
  },
  {
    id: 'forestier',
    label: 'Forestiers',
    type: 'sector',
    sector: 'forestier',
    markerType: 'forestier',
    visible: true,
    color: SECTOR_COLORS.forestier,
    icon: '🌲',
    zIndex: 1,
    clusterEnabled: true,
    heatmapEnabled: false,
  },
  {
    id: 'minier',
    label: 'Miniers',
    type: 'sector',
    sector: 'minier',
    markerType: 'minier',
    visible: false, // Caché par défaut
    color: SECTOR_COLORS.minier,
    icon: '⛏️',
    zIndex: 1,
    clusterEnabled: true,
    heatmapEnabled: false,
  },
  {
    id: 'industriel',
    label: 'Industriels',
    type: 'sector',
    sector: 'industriel',
    markerType: 'industriel',
    visible: false, // Caché par défaut
    color: SECTOR_COLORS.industriel,
    icon: '🏭',
    zIndex: 1,
    clusterEnabled: true,
    heatmapEnabled: false,
  },
  {
    id: 'weather',
    label: 'Stations météo',
    type: 'overlay',
    markerType: 'weather',
    visible: true,
    color: MAP_MARKER_COLORS.weather,
    icon: '🌤️',
    zIndex: 2,
    clusterEnabled: false,
    heatmapEnabled: false,
  },
  {
    id: 'market',
    label: 'Marchés',
    type: 'overlay',
    markerType: 'market',
    visible: true,
    color: MAP_MARKER_COLORS.market,
    icon: '🏪',
    zIndex: 2,
    clusterEnabled: true,
    heatmapEnabled: false,
  },
  {
    id: 'alerts',
    label: 'Alertes actives',
    type: 'overlay',
    markerType: 'alert',
    visible: true,
    color: MAP_MARKER_COLORS.alert,
    icon: '⚠️',
    zIndex: 10,
    clusterEnabled: false,
    heatmapEnabled: true,
  },
];

// ── Style URLs depuis constants.ts ──
const STYLE_URLS: Record<MapStyleId, string> = {
  streets: MAP_STYLES[0].url,
  satellite: MAP_STYLES[1].url,
  terrain: MAP_STYLES[2].url,
  dark: MAP_STYLES[3].url,
};

// ============================================================================
// STORE
// ============================================================================

export const useMapStore = create<MapState>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // ── État initial ──
        viewport: {
          center: DEFAULT_AFRICA_VIEWPORT.center,
          zoom: MAP_DEFAULT_ZOOM,
          pitch: 0,
          bearing: 0,
        },
        style: 'streets',
        layers: DEFAULT_LAYERS,
        selectedMarkerId: null,
        hoveredMarkerId: null,
        popupOpen: false,
        viewportHistory: [],
        historyIndex: -1,

        // ── Computed (getters) ──
        get visibleLayers() {
          return get().layers.filter((l) => l.visible);
        },

        get activeSectors() {
          return get().layers
            .filter((l) => l.visible && l.type === 'sector' && l.sector)
            .map((l) => l.sector!);
        },

        // ── Viewport ──
        setCenter: (center) => {
          get().pushToHistory();
          set((s) => ({
            viewport: { ...s.viewport, center },
          }));
        },

        setZoom: (zoom) => {
          const clamped = Math.max(MAP_MIN_ZOOM, Math.min(MAP_MAX_ZOOM, zoom));
          get().pushToHistory();
          set((s) => ({
            viewport: { ...s.viewport, zoom: clamped },
          }));
        },

        setViewport: (viewport) => {
          get().pushToHistory();
          set((s) => ({
            viewport: { ...s.viewport, ...viewport },
          }));
        },

        fitBounds: (bounds, padding = 50) => {
          // Calcul simplifié du center/zoom depuis les bounds
          const sw = bounds.sw;
          const ne = bounds.ne;
          const centerLng = (sw[0] + ne[0]) / 2;
          const centerLat = (sw[1] + ne[1]) / 2;
          
          // Approximation du zoom (MapLibre le fera mieux)
          const latDiff = ne[1] - sw[1];
          const zoom = Math.floor(Math.log2(360 / latDiff)) + 1;
          
          get().pushToHistory();
          set({
            viewport: {
              center: [centerLng, centerLat],
              zoom: Math.max(MAP_MIN_ZOOM, Math.min(MAP_MAX_ZOOM, zoom)),
              pitch: 0,
              bearing: 0,
            },
          });
        },

        fitCountry: (countryCode) => {
          const countryViewport = getCountryViewport(countryCode);
          get().pushToHistory();
          set({
            viewport: {
              ...countryViewport,
              bounds: undefined,
            },
          });
        },

        fitMarkers: (markers) => {
          const bounds = getBoundsFromMarkers(markers);
          if (bounds) {
            get().fitBounds(bounds);
          }
        },

        // ── History ──
        pushToHistory: () => {
          const { viewport, historyIndex, viewportHistory } = get();
          // Tronquer l'historique si on est revenu en arrière
          const newHistory = viewportHistory.slice(0, historyIndex + 1);
          newHistory.push({ ...viewport });
          
          // Limiter à 50 entrées
          if (newHistory.length > 50) {
            newHistory.shift();
          }
          
          set({
            viewportHistory: newHistory,
            historyIndex: newHistory.length - 1,
          });
        },

        goToHistory: (index) => {
          const { viewportHistory } = get();
          if (index >= 0 && index < viewportHistory.length) {
            set({
              viewport: { ...viewportHistory[index] },
              historyIndex: index,
            });
          }
        },

        goBack: () => {
          const { historyIndex } = get();
          if (historyIndex > 0) {
            get().goToHistory(historyIndex - 1);
          }
        },

        goForward: () => {
          const { historyIndex, viewportHistory } = get();
          if (historyIndex < viewportHistory.length - 1) {
            get().goToHistory(historyIndex + 1);
          }
        },

        // ── Style ──
        setStyle: (style) => set({ style }),

        cycleStyle: () => {
          const styles: MapStyleId[] = ['streets', 'satellite', 'terrain', 'dark'];
          const current = get().style;
          const nextIndex = (styles.indexOf(current) + 1) % styles.length;
          set({ style: styles[nextIndex] });
        },

        // ── Layers ──
        toggleLayer: (layerId) =>
          set((s) => ({
            layers: s.layers.map((l) =>
              l.id === layerId ? { ...l, visible: !l.visible } : l
            ),
          })),

        setLayerVisible: (layerId, visible) =>
          set((s) => ({
            layers: s.layers.map((l) =>
              l.id === layerId ? { ...l, visible } : l
            ),
          })),

        showAllLayers: () =>
          set((s) => ({
            layers: s.layers.map((l) => ({ ...l, visible: true })),
          })),

        hideAllLayers: () =>
          set((s) => ({
            layers: s.layers.map((l) => ({ ...l, visible: false })),
          })),

        toggleSectorLayers: (sector) =>
          set((s) => {
            const sectorLayers = s.layers.filter((l) => l.sector === sector);
            const allVisible = sectorLayers.every((l) => l.visible);
            return {
              layers: s.layers.map((l) =>
                l.sector === sector ? { ...l, visible: !allVisible } : l
              ),
            };
          }),

        // ── Interaction ──
        setSelectedMarker: (id) =>
          set({
            selectedMarkerId: id,
            popupOpen: id !== null,
          }),

        setHoveredMarker: (id) => set({ hoveredMarkerId: id }),

        closePopup: () =>
          set({
            selectedMarkerId: null,
            popupOpen: false,
          }),

        // ── Reset ──
        resetViewport: () => {
          get().pushToHistory();
          set({
            viewport: {
              center: DEFAULT_AFRICA_VIEWPORT.center,
              zoom: MAP_DEFAULT_ZOOM,
              pitch: 0,
              bearing: 0,
            },
          });
        },

        resetLayers: () => set({ layers: DEFAULT_LAYERS }),
      }),
      {
        name: 'agriintel360-map',
        storage: createJSONStorage(() => localStorage),
        
        // ── Sélection des champs à persister ──
        partialize: (state) => ({
          viewport: {
            center: state.viewport.center,
            zoom: state.viewport.zoom,
            pitch: state.viewport.pitch,
            bearing: state.viewport.bearing,
          },
          style: state.style,
          layers: state.layers.map((l) => ({ id: l.id, visible: l.visible })),
        }),
        
        // ── Merge à la réhydratation ──
        merge: (persistedState, currentState) => {
          const persisted = persistedState as Partial<MapState>;
          
          // Restaurer les layers avec les configs complètes
          const restoredLayers = currentState.layers.map((layer) => {
            const persistedLayer = persisted.layers?.find((l) => l.id === layer.id);
            return persistedLayer
              ? { ...layer, visible: persistedLayer.visible }
              : layer;
          });
          
          return {
            ...currentState,
            viewport: persisted.viewport ?? currentState.viewport,
            style: persisted.style ?? currentState.style,
            layers: restoredLayers,
          };
        },
        
        version: 1,
      }
    )
  )
);

// ============================================================================
// SÉLECTEURS OPTIMISÉS
// ============================================================================

export const selectViewport = (state: MapState) => state.viewport;
export const selectStyle = (state: MapState) => state.style;
export const selectStyleUrl = (state: MapState) => STYLE_URLS[state.style];
export const selectLayers = (state: MapState) => state.layers;
export const selectVisibleLayers = (state: MapState) => state.visibleLayers;
export const selectSelectedMarker = (state: MapState) => state.selectedMarkerId;
export const selectPopupOpen = (state: MapState) => state.popupOpen;
export const selectCanGoBack = (state: MapState) => state.historyIndex > 0;
export const selectCanGoForward = (state: MapState) =>
  state.historyIndex < state.viewportHistory.length - 1;

// ============================================================================
// HOOKS DERIVÉS
// ============================================================================

/**
 * Hook optimisé: viewport uniquement
 */
export function useMapViewport(): MapViewportState {
  return useMapStore(selectViewport);
}

/**
 * Hook optimisé: style actuel
 */
export function useMapStyle(): { id: MapStyleId; url: string } {
  const style = useMapStore(selectStyle);
  return { id: style, url: STYLE_URLS[style] };
}

/**
 * Hook: layers visibles avec leurs configs complètes
 */
export function useVisibleLayers(): MapLayerConfig[] {
  return useMapStore(selectVisibleLayers);
}

/**
 * Hook: vérifier si un layer est visible
 */
export function useLayerVisible(layerId: string): boolean {
  return useMapStore((state) => {
    const layer = state.layers.find((l) => l.id === layerId);
    return layer?.visible ?? false;
  });
}

/**
 * Hook: secteurs actifs pour les filtres
 */
export function useActiveSectors(): Sector[] {
  return useMapStore((state) => state.activeSectors);
}

/**
 * Hook: navigation history disponible
 */
export function useMapNavigation(): {
  canGoBack: boolean;
  canGoForward: boolean;
  goBack: () => void;
  goForward: () => void;
} {
  const canGoBack = useMapStore(selectCanGoBack);
  const canGoForward = useMapStore(selectCanGoForward);
  const store = useMapStore();
  
  return {
    canGoBack,
    canGoForward,
    goBack: store.goBack,
    goForward: store.goForward,
  };
}

// ============================================================================
// UTILITAIRES
// ============================================================================

/**
 * Récupère l'URL du style MapLibre
 */
export function getMapStyleUrl(styleId: MapStyleId): string {
  return STYLE_URLS[styleId];
}

/**
 * Liste des styles disponibles
 */
export function getAvailableStyles(): Array<{ id: MapStyleId; label: string; icon: string }> {
  return MAP_STYLES.map((s) => ({
    id: s.id as MapStyleId,
    label: s.name,
    icon: s.icon,
  }));
}