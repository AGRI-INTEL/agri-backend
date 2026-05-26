import { SECTOR_COLORS, SECTOR_EMOJIS } from './utils';

// ============================================================================
// SECTION 1: TYPES & INTERFACES
// ============================================================================

export type MapMarkerType = 'vegetal' | 'animal' | 'halieutique' | 'forestier' | 'minier' | 'industriel' | 'weather' | 'market' | 'alert' | 'user' | 'default';

export type ClusterSize = 'small' | 'medium' | 'large' | 'xlarge';

export interface MapBounds {
  sw: [number, number]; // [lng, lat] South-West
  ne: [number, number]; // [lng, lat] North-East
}

export interface MapViewport {
  center: [number, number]; // [lng, lat]
  zoom: number;
  pitch?: number;
  bearing?: number;
}

export interface CountryCenter {
  code: string;
  name: string;
  center: [number, number]; // [lng, lat]
  zoom: number;
  bounds: MapBounds;
}

export interface MarkerStyle {
  color: string;
  emoji: string;
  size: number;
  pulse?: boolean;
  zIndex?: number;
}

export interface LayerConfig {
  id: string;
  type: 'circle' | 'symbol' | 'fill' | 'line' | 'heatmap';
  source?: string;
  paint?: Record<string, unknown>;
  layout?: Record<string, unknown>;
  filter?: unknown[];
  minzoom?: number;
  maxzoom?: number;
}

// ============================================================================
// SECTION 2: MARKER COLORS & STYLES
// ============================================================================

/**
 * Colors for different marker types on the map.
 */
export const MAP_MARKER_COLORS: Record<MapMarkerType, string> = {
  vegetal: SECTOR_COLORS.vegetal,
  animal: SECTOR_COLORS.animal,
  halieutique: SECTOR_COLORS.halieutique,
  forestier: SECTOR_COLORS.forestier,
  minier: SECTOR_COLORS.minier,
  industriel: SECTOR_COLORS.industriel,
  weather: '#06B6D4',
  market: '#8B5CF6',
  alert: '#DC2626',
  user: '#3B82F6',
  default: '#6B7280',
};

/**
 * Emojis for marker types.
 */
export const MAP_MARKER_EMOJIS: Record<MapMarkerType, string> = {
  vegetal: SECTOR_EMOJIS.vegetal,
  animal: SECTOR_EMOJIS.animal,
  halieutique: SECTOR_EMOJIS.halieutique,
  forestier: SECTOR_EMOJIS.forestier,
  minier: '⛏️',
  industriel: '🏭',
  weather: '🌤️',
  market: '🏪',
  alert: '⚠️',
  user: '👤',
  default: '📍',
};

/**
 * Complete marker style configuration.
 */
export const MAP_MARKER_STYLES: Record<MapMarkerType, MarkerStyle> = {
  vegetal: { color: MAP_MARKER_COLORS.vegetal, emoji: MAP_MARKER_EMOJIS.vegetal, size: 32, zIndex: 1 },
  animal: { color: MAP_MARKER_COLORS.animal, emoji: MAP_MARKER_EMOJIS.animal, size: 32, zIndex: 1 },
  halieutique: { color: MAP_MARKER_COLORS.halieutique, emoji: MAP_MARKER_EMOJIS.halieutique, size: 32, zIndex: 1 },
  forestier: { color: MAP_MARKER_COLORS.forestier, emoji: MAP_MARKER_EMOJIS.forestier, size: 32, zIndex: 1 },
  minier: { color: MAP_MARKER_COLORS.minier, emoji: MAP_MARKER_EMOJIS.minier, size: 32, zIndex: 1 },
  industriel: { color: MAP_MARKER_COLORS.industriel, emoji: MAP_MARKER_EMOJIS.industriel, size: 32, zIndex: 1 },
  weather: { color: MAP_MARKER_COLORS.weather, emoji: MAP_MARKER_EMOJIS.weather, size: 28, zIndex: 2 },
  market: { color: MAP_MARKER_COLORS.market, emoji: MAP_MARKER_EMOJIS.market, size: 28, zIndex: 2 },
  alert: { color: MAP_MARKER_COLORS.alert, emoji: MAP_MARKER_EMOJIS.alert, size: 36, pulse: true, zIndex: 10 },
  user: { color: MAP_MARKER_COLORS.user, emoji: MAP_MARKER_EMOJIS.user, size: 28, zIndex: 5 },
  default: { color: MAP_MARKER_COLORS.default, emoji: MAP_MARKER_EMOJIS.default, size: 28, zIndex: 0 },
};

// ============================================================================
// SECTION 3: CLUSTER CONFIGURATION
// ============================================================================

/**
 * Cluster color thresholds.
 */
export const MAP_CLUSTER_COLORS: Record<ClusterSize, string> = {
  small: '#22C55E',   // 2-9 markers
  medium: '#EAB308',  // 10-49 markers
  large: '#F97316',   // 50-99 markers
  xlarge: '#DC2626',  // 100+ markers
};

/**
 * Cluster size thresholds.
 */
export const CLUSTER_THRESHOLDS: Record<ClusterSize, number> = {
  small: 2,
  medium: 10,
  large: 50,
  xlarge: 100,
};

/**
 * MapLibre circle paint for clusters with dynamic sizing.
 */
export const CLUSTER_CIRCLE_PAINT: Record<string, unknown> = {
  'circle-color': [
    'step',
    ['get', 'point_count'],
    MAP_CLUSTER_COLORS.small,
    CLUSTER_THRESHOLDS.medium,
    MAP_CLUSTER_COLORS.medium,
    CLUSTER_THRESHOLDS.large,
    MAP_CLUSTER_COLORS.large,
    CLUSTER_THRESHOLDS.xlarge,
    MAP_CLUSTER_COLORS.xlarge,
  ],
  'circle-radius': [
    'step',
    ['get', 'point_count'],
    20,   // 2-9
    CLUSTER_THRESHOLDS.medium,
    28,   // 10-49
    CLUSTER_THRESHOLDS.large,
    36,   // 50-99
    CLUSTER_THRESHOLDS.xlarge,
    44,   // 100+
  ],
  'circle-opacity': 0.85,
  'circle-stroke-width': 2,
  'circle-stroke-color': '#ffffff',
  'circle-stroke-opacity': 0.5,
};

/**
 * Cluster count label layout.
 */
export const CLUSTER_COUNT_LAYOUT: Record<string, unknown> = {
  'text-field': '{point_count_abbreviated}',
  'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
  'text-size': 12,
  'text-allow-overlap': true,
};

/**
 * Cluster count text paint.
 */
export const CLUSTER_COUNT_PAINT: Record<string, unknown> = {
  'text-color': '#ffffff',
  'text-halo-color': 'rgba(0,0,0,0.3)',
  'text-halo-width': 1,
};

/**
 * Unclustered point paint.
 */
export const UNCLUSTERED_POINT_PAINT: Record<string, unknown> = {
  'circle-color': ['get', 'color'],
  'circle-radius': ['get', 'size'],
  'circle-stroke-width': 2,
  'circle-stroke-color': '#ffffff',
  'circle-opacity': 0.9,
};

// ============================================================================
// SECTION 4: ALERT & ANIMATION STYLES
// ============================================================================

/**
 * Pulse animation paint for alerts.
 */
export const PULSE_CIRCLE_PAINT: Record<string, unknown> = {
  'circle-radius': 20,
  'circle-color': '#DC2626',
  'circle-opacity': [
    'interpolate',
    ['linear'],
    ['get', 'pulse_phase'],
    0, 0.6,
    0.5, 0.2,
    1, 0.6,
  ],
  'circle-stroke-width': 2,
  'circle-stroke-color': '#DC2626',
  'circle-stroke-opacity': 0.8,
};

/**
 * Alert marker paint with glow effect.
 */
export const ALERT_MARKER_PAINT: Record<string, unknown> = {
  'circle-radius': 14,
  'circle-color': '#DC2626',
  'circle-opacity': 0.9,
  'circle-stroke-width': 3,
  'circle-stroke-color': '#FEE2E2',
  'circle-stroke-opacity': 1,
};

/**
 * Heatmap paint for density visualization.
 */
export const HEATMAP_PAINT: Record<string, unknown> = {
  'heatmap-weight': ['interpolate', ['linear'], ['get', 'density'], 0, 0, 10, 1],
  'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 15, 3],
  'heatmap-color': [
    'interpolate',
    ['linear'],
    ['heatmap-density'],
    0, 'rgba(0, 0, 255, 0)',
    0.2, 'rgba(0, 255, 255, 0.5)',
    0.4, 'rgba(0, 255, 0, 0.5)',
    0.6, 'rgba(255, 255, 0, 0.5)',
    0.8, 'rgba(255, 165, 0, 0.7)',
    1, 'rgba(255, 0, 0, 0.8)',
  ],
  'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 2, 15, 20],
  'heatmap-opacity': 0.7,
};

// ============================================================================
// SECTION 5: GEOGRAPHIC BOUNDS & VIEWPORTS
// ============================================================================

/**
 * Default map bounds for different regions.
 */
export const REGION_BOUNDS: Record<string, MapBounds> = {
  africa: {
    sw: [-20, -40],   // SW: Atlantic, South Africa
    ne: [55, 40],     // NE: Indian Ocean, Mediterranean
  },
  west_africa: {
    sw: [-20, 4],     // SW: Atlantic, Guinea
    ne: [15, 24],     // NE: Niger, Mali
  },
  north_africa: {
    sw: [-15, 15],    // SW: Atlantic, Mauritania
    ne: [35, 38],     // NE: Egypt, Mediterranean
  },
  central_africa: {
    sw: [8, -14],     // SW: Angola
    ne: [32, 24],     // NE: Chad, Central African Republic
  },
  east_africa: {
    sw: [28, -12],    // SW: Mozambique
    ne: [52, 18],     // NE: Somalia, Djibouti
  },
  southern_africa: {
    sw: [10, -36],    // SW: Atlantic, South Africa
    ne: [42, -15],    // NE: Mozambique, Madagascar
  },
};

/**
 * Default viewport for Africa.
 */
export const DEFAULT_AFRICA_VIEWPORT: MapViewport = {
  center: [15, 5],    // [lng, lat] - Center of Africa
  zoom: 3.5,
  pitch: 0,
  bearing: 0,
};

/**
 * Default viewport for West Africa.
 */
export const DEFAULT_WEST_AFRICA_VIEWPORT: MapViewport = {
  center: [-2, 12],   // [lng, lat]
  zoom: 5,
  pitch: 0,
  bearing: 0,
};

// ============================================================================
// SECTION 6: COUNTRY CENTERS (54 pays africains)
// ============================================================================

/**
 * Geographic centers for all 54 African countries.
 * Coordinates: [longitude, latitude]
 */
export const COUNTRY_CENTERS: Record<string, [number, number]> = {
  // Afrique de l'Ouest (16)
  SN: [-14.4524, 14.4974],   // Sénégal
  TG: [0.8248, 8.6195],      // Togo
  GH: [-1.0232, 7.9465],     // Ghana
  NG: [8.6753, 9.0820],      // Nigeria
  CI: [-5.5471, 7.5400],     // Côte d'Ivoire
  ML: [-3.9962, 17.5707],    // Mali
  BF: [-1.5616, 12.3641],    // Burkina Faso
  GN: [-11.3247, 10.9408],   // Guinée
  BJ: [2.3158, 9.3077],      // Bénin
  NE: [8.0817, 17.6078],     // Niger
  GM: [-15.3101, 13.4432],   // Gambie
  GW: [-15.1804, 11.8037],   // Guinée-Bissau
  SL: [-11.7799, 8.4606],    // Sierra Leone
  LR: [-9.4295, 6.4281],     // Libéria
  MR: [-10.9408, 20.3484],   // Mauritanie
  CV: [-23.6052, 15.1201],   // Cap-Vert

  // Afrique du Nord (7)
  MA: [-7.0926, 31.7917],    // Maroc
  DZ: [1.6596, 28.0339],     // Algérie
  TN: [9.5375, 33.8869],     // Tunisie
  LY: [17.2283, 26.3351],    // Libye
  EG: [30.8025, 26.8206],    // Égypte
  SD: [30.2176, 12.8628],    // Soudan
  SS: [31.3070, 6.8770],     // Soudan du Sud

  // Afrique centrale (9)
  CM: [12.3547, 7.3697],     // Cameroun
  TD: [18.7322, 15.4542],    // Tchad
  CF: [20.9394, 6.6111],     // République centrafricaine
  CG: [15.8277, -0.2280],    // Congo
  CD: [21.7587, -4.0383],    // Congo (RDC)
  GA: [11.6094, -0.8037],    // Gabon
  GQ: [10.2679, 1.6508],     // Guinée équatoriale
  ST: [6.6131, 0.1864],      // Sao Tomé-et-Principe
  AO: [17.8739, -11.2027],   // Angola

  // Afrique de l'Est (15)
  ET: [40.4897, 9.1450],     // Éthiopie
  ER: [39.7823, 15.1794],    // Érythrée
  DJ: [42.5903, 11.8251],    // Djibouti
  SO: [46.1996, 5.1521],     // Somalie
  KE: [37.9062, -0.0236],    // Kenya
  UG: [32.2903, 1.3733],     // Ouganda
  TZ: [34.8888, -6.3690],    // Tanzanie
  RW: [29.8739, -1.9403],    // Rwanda
  BI: [29.9189, -3.3731],    // Burundi
  MW: [34.3015, -13.2543],   // Malawi
  MZ: [35.5296, -18.6657],   // Mozambique
  MG: [46.8691, -18.7669],   // Madagascar
  MU: [57.5522, -20.3484],   // Maurice
  SC: [55.4920, -4.6796],    // Seychelles
  KM: [43.8722, -11.6455],   // Comores

  // Afrique australe (7)
  ZA: [22.9375, -30.5595],   // Afrique du Sud
  ZW: [29.1549, -19.0154],   // Zimbabwe
  ZM: [27.8493, -13.1339],   // Zambie
  BW: [24.6849, -22.3285],   // Botswana
  NA: [18.4904, -22.9576],   // Namibie
  LS: [28.2336, -29.61],     // Lesotho
  SZ: [31.4659, -26.5225],   // Eswatini
};

/**
 * Zoom levels recommended by country.
 */
export const COUNTRY_ZOOM_LEVELS: Record<string, number> = {
  SN: 7, TG: 8, GH: 7, NG: 6, CI: 7, ML: 6, BF: 7, GN: 7, BJ: 8, NE: 6,
  GM: 9, GW: 8, SL: 8, LR: 8, MR: 6, CV: 9,
  MA: 6, DZ: 5, TN: 7, LY: 5, EG: 6, SD: 5, SS: 6,
  CM: 6, TD: 5, CF: 6, CG: 7, CD: 5, GA: 7, GQ: 8, ST: 9, AO: 6,
  ET: 6, ER: 7, DJ: 8, SO: 6, KE: 6, UG: 7, TZ: 6, RW: 9, BI: 8,
  MW: 7, MZ: 6, MG: 6, MU: 10, SC: 10, KM: 10,
  ZA: 5, ZW: 6, ZM: 6, BW: 6, NA: 6, LS: 9, SZ: 9,
};

/**
 * Get full country center data with zoom.
 */
export function getCountryViewport(code: string): MapViewport {
  const upperCode = code.toUpperCase();
  const center = COUNTRY_CENTERS[upperCode];
  if (!center) {
    return DEFAULT_AFRICA_VIEWPORT;
  }
  return {
    center,
    zoom: COUNTRY_ZOOM_LEVELS[upperCode] || 6,
    pitch: 0,
    bearing: 0,
  };
}

/**
 * Get bounds that fit a country.
 */
export function getCountryBounds(code: string): MapBounds | undefined {
  const upperCode = code.toUpperCase();
  const center = COUNTRY_CENTERS[upperCode];
  if (!center) return undefined;

  // Approximate bounds based on country size (rough heuristic)
  const zoom = COUNTRY_ZOOM_LEVELS[upperCode] || 6;
  const span = 360 / Math.pow(2, zoom); // rough degree span

  return {
    sw: [center[0] - span, center[1] - span * 0.7],
    ne: [center[0] + span, center[1] + span * 0.7],
  };
}

// ============================================================================
// SECTION 7: MARKER SVG GENERATORS
// ============================================================================

/**
 * Create a standard marker SVG.
 */
export function createMarkerSVG(color: string, size = 32): string {
  const half = size / 2;
  const r1 = half * 0.75; // outer ring
  const r2 = half * 0.375; // inner dot
  const stroke = half * 0.125;

  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="1" flood-opacity="0.3"/>
        </filter>
      </defs>
      <circle cx="${half}" cy="${half}" r="${r1}" fill="${color}" fill-opacity="0.15" stroke="${color}" stroke-width="${stroke}" filter="url(#shadow)"/>
      <circle cx="${half}" cy="${half}" r="${r2}" fill="${color}"/>
    </svg>
  `;
}

/**
 * Create a pulse/alert marker SVG with animation.
 */
export function createPulseMarkerSVG(color: string, size = 40): string {
  const half = size / 2;
  const r1 = half * 0.9;
  const r2 = half * 0.4;
  const r3 = half * 0.2;

  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <circle cx="${half}" cy="${half}" r="${r1}" fill="${color}" fill-opacity="0.15" filter="url(#glow)">
        <animate attributeName="r" values="${half * 0.5};${r1};${half * 0.5}" dur="2s" repeatCount="indefinite"/>
        <animate attributeName="fill-opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite"/>
      </circle>
      <circle cx="${half}" cy="${half}" r="${r2}" fill="${color}" fill-opacity="0.4"/>
      <circle cx="${half}" cy="${half}" r="${r3}" fill="${color}"/>
    </svg>
  `;
}

/**
 * Create an emoji marker SVG.
 */
export function createEmojiMarkerSVG(emoji: string, size = 36): string {
  const fontSize = size * 0.6;
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="${fontSize}">${emoji}</text>
    </svg>
  `;
}

/**
 * Create a sector marker SVG with emoji and color ring.
 */
export function createSectorMarkerSVG(type: MapMarkerType, size = 36): string {
  const style = MAP_MARKER_STYLES[type] || MAP_MARKER_STYLES.default;
  const half = size / 2;
  const fontSize = size * 0.55;
  const r = half * 0.85;

  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-opacity="0.25"/>
        </filter>
      </defs>
      <circle cx="${half}" cy="${half}" r="${r}" fill="${style.color}" fill-opacity="0.12" stroke="${style.color}" stroke-width="2" filter="url(#shadow)"/>
      <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="${fontSize}">${style.emoji}</text>
    </svg>
  `;
}

/**
 * Create a numbered cluster SVG.
 */
export function createClusterSVG(count: number, color: string, size = 44): string {
  const half = size / 2;
  const r = half * 0.85;
  const fontSize = size * 0.4;

  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${half}" cy="${half}" r="${r}" fill="${color}" fill-opacity="0.9" stroke="#ffffff" stroke-width="2"/>
      <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-size="${fontSize}" font-weight="bold" font-family="Arial, sans-serif">${count}</text>
    </svg>
  `;
}

// ============================================================================
// SECTION 8: LAYER CONFIGURATIONS
// ============================================================================

/**
 * Standard layer configurations for MapLibre.
 */
export const MAP_LAYERS: Record<string, LayerConfig> = {
  clusters: {
    id: 'clusters',
    type: 'circle',
    source: 'markers',
    paint: CLUSTER_CIRCLE_PAINT,
    filter: ['has', 'point_count'],
  },
  clusterCount: {
    id: 'cluster-count',
    type: 'symbol',
    source: 'markers',
    layout: CLUSTER_COUNT_LAYOUT,
    paint: CLUSTER_COUNT_PAINT,
    filter: ['has', 'point_count'],
  },
  unclusteredPoint: {
    id: 'unclustered-point',
    type: 'circle',
    source: 'markers',
    paint: UNCLUSTERED_POINT_PAINT,
    filter: ['!', ['has', 'point_count']],
  },
  heatmap: {
    id: 'heatmap',
    type: 'heatmap',
    source: 'markers',
    paint: HEATMAP_PAINT,
    maxzoom: 15,
  },
  alertPulse: {
    id: 'alert-pulse',
    type: 'circle',
    source: 'alerts',
    paint: PULSE_CIRCLE_PAINT,
    filter: ['==', ['get', 'type'], 'alert'],
  },
};

// ============================================================================
// SECTION 9: HELPER FUNCTIONS
// ============================================================================

/**
 * Get cluster size category from point count.
 */
export function getClusterSize(count: number): ClusterSize {
  if (count >= CLUSTER_THRESHOLDS.xlarge) return 'xlarge';
  if (count >= CLUSTER_THRESHOLDS.large) return 'large';
  if (count >= CLUSTER_THRESHOLDS.medium) return 'medium';
  return 'small';
}

/**
 * Get cluster color from point count.
 */
export function getClusterColor(count: number): string {
  return MAP_CLUSTER_COLORS[getClusterSize(count)];
}

/**
 * Get marker style by type.
 */
export function getMarkerStyle(type: MapMarkerType): MarkerStyle {
  return MAP_MARKER_STYLES[type] || MAP_MARKER_STYLES.default;
}

/**
 * Get marker color by type.
 */
export function getMarkerColor(type: MapMarkerType): string {
  return MAP_MARKER_COLORS[type] || MAP_MARKER_COLORS.default;
}

/**
 * Get marker emoji by type.
 */
export function getMarkerEmoji(type: MapMarkerType): string {
  return MAP_MARKER_EMOJIS[type] || MAP_MARKER_EMOJIS.default;
}

/**
 * Create a GeoJSON FeatureCollection from markers.
 */
export interface MapMarker {
  id: string;
  type: MapMarkerType;
  coordinates: [number, number]; // [lng, lat]
  title?: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export function createMarkerGeoJSON(markers: MapMarker[]): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: markers.map((m) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: m.coordinates,
      },
      properties: {
        id: m.id,
        type: m.type,
        title: m.title || '',
        description: m.description || '',
        color: getMarkerColor(m.type),
        size: getMarkerStyle(m.type).size / 2,
        emoji: getMarkerEmoji(m.type),
        ...m.metadata,
      },
    })),
  };
}

/**
 * Fit bounds to contain all markers.
 */
export function getBoundsFromMarkers(markers: MapMarker[]): MapBounds | undefined {
  if (markers.length === 0) return undefined;

  const lons = markers.map((m) => m.coordinates[0]);
  const lats = markers.map((m) => m.coordinates[1]);

  return {
    sw: [Math.min(...lons), Math.min(...lats)],
    ne: [Math.max(...lons), Math.max(...lats)],
  };
}

/**
 * Calculate distance between two coordinates (Haversine formula).
 * Returns distance in kilometers.
 */
export function getDistanceKm(
  coord1: [number, number],
  coord2: [number, number]
): number {
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Check if coordinates are within Africa bounds.
 */
export function isInAfrica(coordinates: [number, number]): boolean {
  const [lng, lat] = coordinates;
  const { sw, ne } = REGION_BOUNDS.africa;
  return lng >= sw[0] && lng <= ne[0] && lat >= sw[1] && lat <= ne[1];
}

/**
 * Format coordinates for display.
 */
export function formatCoordinates(coordinates: [number, number]): string {
  const [lng, lat] = coordinates;
  const lngDir = lng >= 0 ? 'E' : 'W';
  const latDir = lat >= 0 ? 'N' : 'S';
  return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lng).toFixed(4)}° ${lngDir}`;
}

// ============================================================================
// SECTION 10: EXPORT GROUPING
// ============================================================================

export const MapConfig = {
  MARKER_COLORS: MAP_MARKER_COLORS,
  MARKER_EMOJIS: MAP_MARKER_EMOJIS,
  MARKER_STYLES: MAP_MARKER_STYLES,
  CLUSTER_COLORS: MAP_CLUSTER_COLORS,
  CLUSTER_THRESHOLDS,
  REGION_BOUNDS,
  COUNTRY_CENTERS,
  COUNTRY_ZOOM_LEVELS,
  DEFAULT_AFRICA_VIEWPORT,
  DEFAULT_WEST_AFRICA_VIEWPORT,
  LAYERS: MAP_LAYERS,
  getCountryViewport,
  getCountryBounds,
  getClusterSize,
  getClusterColor,
  getMarkerStyle,
  getMarkerColor,
  getMarkerEmoji,
  createMarkerGeoJSON,
  getBoundsFromMarkers,
  getDistanceKm,
  isInAfrica,
  formatCoordinates,
} as const;
