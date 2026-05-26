// ============================================================================
// SECTION 1: CORE API RESPONSE TYPES
// ============================================================================

/**
 * Standard API response wrapper.
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: 'success' | 'error' | 'partial';
  timestamp: string;
  request_id?: string;
  api_version?: string;
  pagination?: PaginationMeta;
  meta?: Record<string, unknown>;
}

/**
 * API response for batch operations.
 */
export interface BatchApiResponse<T> {
  data: T[];
  errors: BatchError[];
  status: 'success' | 'partial' | 'error';
  processed_count: number;
  failed_count: number;
  timestamp: string;
}

export interface BatchError {
  index: number;
  item: unknown;
  error: ApiError;
}

/**
 * API response for async operations (jobs).
 */
export interface AsyncApiResponse {
  job_id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress?: number; // 0-100
  result_url?: string;
  estimated_duration_seconds?: number;
  started_at?: string;
  completed_at?: string;
  message?: string;
}

// ============================================================================
// SECTION 2: PAGINATION
// ============================================================================

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
  next_offset?: number;
  prev_offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
  next_offset?: number;
  prev_offset?: number;
  facets?: Record<string, Record<string, number>>;
  summary?: Record<string, unknown>;
}

export interface CursorPaginatedResponse<T> {
  data: T[];
  next_cursor?: string;
  prev_cursor?: string;
  has_more: boolean;
  total?: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
  cursor?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// ============================================================================
// SECTION 3: ERROR HANDLING
// ============================================================================

export interface ApiError {
  message: string;
  code?: string;
  /** Alias FastAPI / Django REST (champ `detail`) */
  detail?: string | string[] | Record<string, unknown>;
  details?: Record<string, string[]>;
  status: number;
  request_id?: string;
  timestamp?: string;
  path?: string;
  help_url?: string;
  suggestion?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: unknown;
  constraint?: string;
}

export interface ApiErrorResponse {
  status: 'error';
  error: ApiError;
  timestamp: string;
  request_id: string;
}

// ============================================================================
// SECTION 4: KPI & STATISTICS
// ============================================================================

export type TrendDirection = 'up' | 'down' | 'stable';

export interface TrendIndicator {
  value: number;
  direction: TrendDirection;
  percentage?: number;
  period?: string; // e.g., "7d", "30d", "1y"
}

export interface KPIStats {
  // Producteurs
  producers_count: number;
  producers_trend: TrendIndicator;

  // Surface
  total_area_ha: number;
  area_trend: TrendIndicator;
  cultivated_area_ha: number;
  irrigated_area_ha: number;

  // Rendement
  avg_yield_kg_ha: number;
  yield_trend: TrendIndicator;
  total_production_tonnes: number;
  production_trend: TrendIndicator;

  // Économique
  total_revenue: number;
  revenue_currency: string;
  revenue_trend: TrendIndicator;
  avg_price_per_kg: number;
  price_trend: TrendIndicator;

  // Alertes
  active_alerts: number;
  alerts_severity: 'info' | 'warning' | 'critical' | 'emergency';
  alerts_trend: TrendIndicator;
  unread_alerts: number;

  // Engagement
  active_users: number;
  users_trend: TrendIndicator;
  new_users_this_month: number;
  total_interactions: number;

  // Environnement
  rainfall_mm?: number;
  rainfall_trend?: TrendIndicator;
  temperature_avg?: number;
  temperature_trend?: TrendIndicator;

  // Période
  period_start: string;
  period_end: string;
  compared_to_period: string;
}

export interface DashboardWidget {
  id: string;
  type: 'stat' | 'chart' | 'table' | 'list' | 'map' | 'alert' | 'progress';
  title: string;
  subtitle?: string;
  data: unknown;
  config?: Record<string, unknown>;
  refresh_interval_seconds?: number;
  last_updated: string;
}

export interface DashboardLayout {
  id: string;
  name: string;
  widgets: DashboardWidget[];
  layout: 'grid' | 'list' | 'custom';
  columns?: number;
  is_default: boolean;
  is_shared: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// SECTION 5: PRODUCTION & AGRICULTURAL DATA
// ============================================================================

export interface ProductionDataPoint {
  date: string; // ISO 8601
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  vegetal: number;
  animal: number;
  halieutique: number;
  forestier: number;
  minier?: number;
  industriel?: number;
  total: number;
  unit: string;
  forecast?: number;
  forecast_confidence?: number;
  anomaly?: boolean;
  anomaly_score?: number;
}

export interface ProductionSummary {
  period: string;
  total_production_tonnes: number;
  by_sector: Record<string, number>;
  by_country: Record<string, number>;
  by_crop: Record<string, number>;
  year_over_year_change: number;
  forecast_next_period: number;
}

export interface YieldData {
  crop: string;
  variety?: string;
  country: string;
  region?: string;
  year: number;
  season?: 'dry' | 'wet' | 'both';
  yield_kg_ha: number;
  area_ha: number;
  production_tonnes: number;
  irrigation_type?: string;
  fertilizer_usage_kg_ha?: number;
  pest_pressure?: 'low' | 'medium' | 'high';
  compared_to_national_avg?: number;
  compared_to_regional_avg?: number;
}

// ============================================================================
// SECTION 6: MARKET & PRICING
// ============================================================================

export type PriceTrend = 'up' | 'down' | 'stable' | 'volatile';

export interface MarketPrice {
  id: string;
  product: string;
  product_category?: string;
  price: number;
  unit: string;
  currency: string;
  market: string;
  market_type?: 'wholesale' | 'retail' | 'export' | 'farm_gate';
  country: string;
  region?: string;
  city?: string;
  coordinates?: [number, number];

  // Trend
  trend: PriceTrend;
  trend_percent: number;
  trend_period?: string;

  // History
  price_7d_avg?: number;
  price_30d_avg?: number;
  price_90d_avg?: number;
  price_1y_avg?: number;
  price_change_24h?: number;
  price_change_7d?: number;
  price_change_30d?: number;

  // Metadata
  quality_grade?: string;
  quantity_available?: number;
  source: string;
  source_type?: 'market' | 'cooperative' | 'government' | 'sensor' | 'user';
  updated_at: string;
  expires_at?: string;
}

export interface PriceHistory {
  product: string;
  market: string;
  country: string;
  unit: string;
  currency: string;
  data: PriceHistoryPoint[];
}

export interface PriceHistoryPoint {
  date: string;
  price: number;
  volume?: number;
  transactions?: number;
}

export interface PricePrediction {
  product: string;
  market: string;
  country: string;
  currency: string;
  unit: string;
  current_price: number;
  predictions: PricePredictionPoint[];
  confidence_interval?: [number, number];
  model_version?: string;
  features_used?: string[];
}

export interface PricePredictionPoint {
  date: string;
  predicted_price: number;
  confidence_lower?: number;
  confidence_upper?: number;
  scenario?: 'optimistic' | 'pessimistic' | 'baseline';
}

export interface MarketComparison {
  product: string;
  unit: string;
  currency: string;
  markets: MarketComparisonPoint[];
}

export interface MarketComparisonPoint {
  market: string;
  country: string;
  price: number;
  trend: PriceTrend;
  trend_percent: number;
  distance_km?: number;
  transport_cost?: number;
  arbitrage_opportunity?: boolean;
}

// ============================================================================
// SECTION 7: NOTIFICATIONS
// ============================================================================

export type NotificationType = 'alert' | 'community' | 'system' | 'mention' | 'reaction' | 'message' | 'follow' | 'invite' | 'reminder' | 'achievement';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  short_message?: string; // For push notifications
  link?: string;
  action_url?: string;
  action_label?: string;
  image_url?: string;
  icon?: string;
  color?: string;
  is_read: boolean;
  is_clicked: boolean;
  read_at?: string;
  clicked_at?: string;
  created_at: string;
  expires_at?: string;

  // Actor who triggered
  actor?: {
    id: string;
    name: string;
    avatar?: string;
    role?: string;
  };

  // Related content
  related_id?: string;
  related_type?: string;

  // Grouping
  group_id?: string;
  group_count?: number;

  // Delivery
  channels_delivered?: string[];
  delivery_status?: Record<string, 'pending' | 'sent' | 'delivered' | 'failed'>;
}

export interface NotificationPreferences {
  user_id: string;
  channels: {
    push: boolean;
    email: boolean;
    sms: boolean;
    in_app: boolean;
  };
  types: Record<NotificationType, {
    enabled: boolean;
    channels: string[];
    priority_min: NotificationPriority;
  }>;
  quiet_hours: {
    enabled: boolean;
    start: string; // HH:MM
    end: string;
  };
  digest: {
    enabled: boolean;
    frequency: 'hourly' | 'daily' | 'weekly';
    time: string;
  };
}

export interface NotificationSummary {
  total: number;
  unread: number;
  by_type: Record<NotificationType, number>;
  by_priority: Record<NotificationPriority, number>;
  latest: Notification[];
}

// ============================================================================
// SECTION 8: SEARCH & AUTOCOMPLETE
// ============================================================================

export interface SearchResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  query: string;
  filters_applied: Record<string, unknown>;
  suggestions: string[];
  did_you_mean?: string;
  facets?: Record<string, Record<string, number>>;
  search_time_ms: number;
}

export interface AutocompleteItem {
  id: string;
  type: string;
  label: string;
  subtitle?: string;
  icon?: string;
  url?: string;
  metadata?: Record<string, unknown>;
  match_score: number;
}

export interface SearchFilters {
  q: string;
  type?: string;
  sector?: string;
  country?: string;
  region?: string;
  date_from?: string;
  date_to?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// ============================================================================
// SECTION 9: GEOLOCATION
// ============================================================================

export interface GeoPoint {
  type: 'Point';
  coordinates: [number, number]; // [lng, lat]
}

export interface GeoPolygon {
  type: 'Polygon';
  coordinates: [number, number][][];
}

export interface GeoFeature {
  type: 'Feature';
  geometry: GeoPoint | GeoPolygon;
  properties: Record<string, unknown>;
}

export interface GeoFeatureCollection {
  type: 'FeatureCollection';
  features: GeoFeature[];
}

export interface GeocodingResult {
  address: string;
  country: string;
  country_code: string;
  region: string;
  city: string;
  postal_code?: string;
  coordinates: [number, number];
  bounding_box?: [[number, number], [number, number]];
  confidence: number;
}

// ============================================================================
// SECTION 10: WEATHER & CLIMATE
// ============================================================================

export interface WeatherData {
  location: {
    coordinates: [number, number];
    city?: string;
    country: string;
  };
  current: {
    temperature: number;
    feels_like: number;
    humidity: number;
    pressure: number;
    wind_speed: number;
    wind_direction: number;
    precipitation: number;
    visibility: number;
    uv_index: number;
    condition: string;
    icon: string;
    updated_at: string;
  };
  forecast: WeatherForecastDay[];
  alerts?: WeatherAlert[];
}

export interface WeatherForecastDay {
  date: string;
  temperature_min: number;
  temperature_max: number;
  humidity: number;
  precipitation_probability: number;
  precipitation_mm: number;
  wind_speed: number;
  condition: string;
  icon: string;
  sunrise: string;
  sunset: string;
  hourly?: WeatherForecastHour[];
}

export interface WeatherForecastHour {
  time: string;
  temperature: number;
  precipitation_probability: number;
  precipitation_mm: number;
  wind_speed: number;
  condition: string;
  icon: string;
}

export interface WeatherAlert {
  id: string;
  type: 'storm' | 'flood' | 'heatwave' | 'coldwave' | 'wind' | 'dust' | 'fog';
  severity: 'minor' | 'moderate' | 'severe' | 'extreme';
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  areas: string[];
  instructions?: string;
}

export interface ClimateData {
  location: {
    coordinates: [number, number];
    country: string;
    region?: string;
  };
  period: string;
  temperature_avg: number;
  temperature_min: number;
  temperature_max: number;
  rainfall_mm: number;
  rainfall_days: number;
  humidity_avg: number;
  sunshine_hours: number;
  wind_speed_avg: number;
  historical_comparison?: {
    temperature_anomaly: number;
    rainfall_anomaly: number;
    drought_index?: number;
  };
}

// ============================================================================
// SECTION 11: ACTIVITY & AUDIT
// ============================================================================

export interface ActivityLog {
  id: string;
  user_id: string;
  user_name?: string;
  user_email?: string;
  action: string;
  entity_type: string;
  entity_id: string;
  entity_name?: string;
  changes?: Record<string, { old: unknown; new: unknown }>;
  metadata?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  session_id?: string;
  timestamp: string;
}

export interface AuditTrail {
  id: string;
  entity_type: string;
  entity_id: string;
  entries: ActivityLog[];
  first_seen: string;
  last_modified: string;
  modification_count: number;
}

// ============================================================================
// SECTION 12: SYSTEM & HEALTH
// ============================================================================

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime_seconds: number;
  services: ServiceHealth[];
  checks: HealthCheck[];
}

export interface ServiceHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency_ms: number;
  last_check: string;
  message?: string;
}

export interface HealthCheck {
  name: string;
  status: 'pass' | 'warn' | 'fail';
  response_time_ms: number;
  message?: string;
}

export interface ApiVersion {
  version: string;
  release_date: string;
  changelog_url: string;
  deprecated?: boolean;
  sunset_date?: string;
  supported_until?: string;
}

// ============================================================================
// SECTION 13: EXPORT & IMPORT
// ============================================================================

export interface ExportJob {
  id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  format: 'csv' | 'excel' | 'pdf' | 'json' | 'geojson';
  entity_type: string;
  filters?: Record<string, unknown>;
  file_url?: string;
  file_size?: number;
  row_count?: number;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
}

export interface ImportJob {
  id: string;
  status: 'queued' | 'validating' | 'processing' | 'completed' | 'failed';
  format: 'csv' | 'excel' | 'json';
  entity_type: string;
  file_name: string;
  file_size: number;
  row_count: number;
  processed_count: number;
  created_count: number;
  updated_count: number;
  failed_count: number;
  errors: ImportError[];
  warnings: ImportWarning[];
  started_at?: string;
  completed_at?: string;
}

export interface ImportError {
  row: number;
  field?: string;
  value?: unknown;
  message: string;
  code: string;
}

export interface ImportWarning {
  row: number;
  field?: string;
  value?: unknown;
  message: string;
  suggestion?: string;
}

// ============================================================================
// SECTION 14: CONSTANTS & HELPERS
// ============================================================================

export const HTTP_STATUS_LABELS: Record<number, string> = {
  200: 'OK',
  201: 'Créé',
  204: 'Pas de contenu',
  400: 'Requête invalide',
  401: 'Non authentifié',
  403: 'Accès interdit',
  404: 'Non trouvé',
  409: 'Conflit',
  422: 'Entité non traitable',
  429: 'Trop de requêtes',
  500: 'Erreur serveur',
  502: 'Passerelle invalide',
  503: 'Service indisponible',
  504: 'Délai dépassé',
};

export const TREND_ICONS: Record<TrendDirection, string> = {
  up: '↑',
  down: '↓',
  stable: '→',
};

export const TREND_COLORS: Record<TrendDirection, string> = {
  up: '#22C55E',
  down: '#DC2626',
  stable: '#6B7280',
};

export const PRICE_TREND_COLORS: Record<PriceTrend, string> = {
  up: '#DC2626',    // Red = bad for buyers
  down: '#22C55E',  // Green = good for buyers
  stable: '#6B7280',
  volatile: '#EAB308',
};

// ============================================================================
// SECTION 15: UTILITY FUNCTIONS
// ============================================================================

/**
 * Get HTTP status label.
 */
export function getHttpStatusLabel(status: number): string {
  return HTTP_STATUS_LABELS[status] || `Statut ${status}`;
}

/**
 * Get trend icon.
 */
export function getTrendIcon(direction: TrendDirection): string {
  return TREND_ICONS[direction] || '→';
}

/**
 * Get trend color.
 */
export function getTrendColor(direction: TrendDirection): string {
  return TREND_COLORS[direction] || '#6B7280';
}

/**
 * Format trend for display.
 */
export function formatTrend(trend: TrendIndicator): string {
  const icon = getTrendIcon(trend.direction);
  const percent = trend.percentage !== undefined
    ? ` (${trend.percentage > 0 ? '+' : ''}${trend.percentage.toFixed(1)}%)`
    : '';
  return `${icon}${percent}`;
}

/**
 * Check if paginated response has next page.
 */
export function hasNextPage(meta: PaginationMeta): boolean {
  return meta.has_next;
}

/**
 * Check if paginated response has previous page.
 */
export function hasPrevPage(meta: PaginationMeta): boolean {
  return meta.has_prev;
}

/**
 * Get total pages from pagination meta.
 */
export function getTotalPages(meta: PaginationMeta): number {
  return meta.total_pages;
}

/**
 * Create empty paginated response.
 */
export function emptyPaginatedResponse<T>(): PaginatedResponse<T> {
  const meta: PaginationMeta = {
    page: 1,
    limit: 25,
    total: 0,
    total_pages: 0,
    has_next: false,
    has_prev: false,
  };
  return {
    data: [],
    meta,
    page: meta.page,
    limit: meta.limit,
    total: meta.total,
    total_pages: meta.total_pages,
    has_next: meta.has_next,
    has_prev: meta.has_prev,
  };
}

/**
 * Create success API response.
 */
export function createApiResponse<T>(data: T, message?: string): ApiResponse<T> {
  return {
    data,
    message,
    status: 'success',
    timestamp: new Date().toISOString(),
    api_version: 'v1',
  };
}

/**
 * Create error API response.
 */
export function createApiErrorResponse(error: ApiError): ApiErrorResponse {
  return {
    status: 'error',
    error,
    timestamp: new Date().toISOString(),
    request_id: crypto.randomUUID?.() || `req-${Date.now()}`,
  };
}

/**
 * Format notification for display.
 */
export function formatNotification(notification: Notification): {
  title: string;
  body: string;
  time: string;
} {
  return {
    title: notification.title,
    body: notification.short_message || notification.message,
    time: new Date(notification.created_at).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
}

/**
 * Group notifications by date.
 */
export function groupNotificationsByDate(notifications: Notification[]): Record<string, Notification[]> {
  return notifications.reduce((groups, notification) => {
    const date = new Date(notification.created_at).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
    groups[date] = groups[date] || [];
    groups[date].push(notification);
    return groups;
  }, {} as Record<string, Notification[]>);
}
