// ============================================================================
// SECTION 1: CORE TYPES & ENUMS
// ============================================================================

import type { Sector } from './actor';

/**
 * Categories of agricultural and socio-economic indicators.
 */
export type IndicatorCategory =
  | 'compte_exploitation'  // Compte d'exploitation agricole
  | 'revenus'              // Revenus et revenus agricoles
  | 'pauvrete'             // Pauvreté et vulnérabilité
  | 'nutrition'            // Sécurité alimentaire et nutrition
  | 'sante'                // Santé animale et végétale
  | 'bien_etre'            // Bien-être social et conditions de vie
  | 'production'           // Volume de production
  | 'rendement'            // Rendements (kg/ha, L/animal, etc.)
  | 'prix'                 // Prix des produits agricoles
  | 'environnement'        // Indicateurs environnementaux
  | 'climat'               // Indicateurs climatiques
  | 'marché'               // Marchés et commercialisation
  | 'emploi'               // Emploi agricole
  | 'genre'                // Égalité des genres
  | 'innovation';         // Innovation et technologie

/**
 * Granularity of indicator data points.
 */
export type IndicatorPeriod =
  | 'daily'      // Journalier
  | 'weekly'     // Hebdomadaire
  | 'biweekly'   // Bimensuel
  | 'monthly'    // Mensuel
  | 'quarterly'  // Trimestriel
  | 'biannual'   // Semestriel
  | 'yearly'     // Annuel
  | 'seasonal'   // Saisonnier (par campagne agricole)
  | 'decadal';   // Par décade (10 jours)

/**
 * Trend direction for indicator values.
 */
export type IndicatorTrend = 'up' | 'down' | 'stable' | 'volatile';

/**
 * Severity level when a threshold is crossed.
 */
export type IndicatorThresholdType = 'critical' | 'alert' | 'warning' | 'optimal';

/**
 * Status of an indicator alert.
 */
export type IndicatorAlertStatus = 'active' | 'acknowledged' | 'resolved' | 'expired';

/**
 * Source type for indicator data.
 */
export type IndicatorSourceType =
  | 'manual'           // Saisie manuelle
  | 'sensor'           // Capteur IoT
  | 'satellite'        // Données satellitaires
  | 'survey'           // Enquête terrain
  | 'administrative'   // Données administratives
  | 'model'            // Modèle prédictif
  | 'api'              // API externe
  | 'partner';         // Partenaire / ONG

/**
 * Aggregation method for indicator values.
 */
export type AggregationMethod =
  | 'sum'
  | 'avg'
  | 'median'
  | 'min'
  | 'max'
  | 'count'
  | 'last'
  | 'first';

// ============================================================================
// SECTION 2: INDICATOR ENTITY
// ============================================================================

/**
 * A measurable agricultural or socio-economic indicator.
 */
export interface Indicator {
  /** Unique indicator ID */
  id: string;
  /** Human-readable name */
  name: string;
  /** URL-friendly slug */
  slug: string;
  /** Detailed description */
  description: string;
  /** Short description for lists */
  short_description?: string;
  /** Mathematical formula (LaTeX or plain text) */
  formula?: string;
  /** Unit of measurement (e.g. "kg/ha", "FCFA/kg", "%") */
  unit: string;
  /** Unit symbol (e.g. "kg/ha") */
  unit_symbol?: string;
  /** Indicator category */
  category: IndicatorCategory;
  /** Related agricultural sector */
  sector: Sector;
  /** Sub-sector or product (e.g. "maïs", "bovins") */
  sub_sector?: string;

  // ── Current value ──
  /** Most recent computed value */
  current_value?: number;
  /** Value as of date */
  current_value_date?: string;
  /** Data collection period */
  period?: IndicatorPeriod;
  /** Reference period (e.g. "2025-2026") */
  reference_period?: string;

  // ── Thresholds ──
  /** Critical threshold (red zone) */
  threshold_critical: number;
  /** Alert threshold (orange zone) */
  threshold_alert: number;
  /** Warning threshold (yellow zone) */
  threshold_warning?: number;
  /** Optimal threshold (green zone) */
  threshold_optimal: number;
  /** Whether higher values are better */
  higher_is_better: boolean;
  /** Threshold direction */
  threshold_direction: 'above' | 'below' | 'between';

  // ── Trend ──
  /** Current trend direction */
  trend: IndicatorTrend;
  /** Trend percentage change */
  trend_percent?: number;
  /** Trend period (e.g. "30d", "1y") */
  trend_period?: string;
  /** Trend confidence 0-1 */
  trend_confidence?: number;

  // ── Geographic scope ──
  /** Applicable country codes (ISO 3166-1 alpha-2) */
  countries?: string[];
  /** Applicable regions */
  regions?: string[];
  /** Default country for display */
  default_country?: string;
  /** Default region for display */
  default_region?: string;

  // ── Source ──
  /** Data source name */
  source?: string;
  /** Source type */
  source_type?: IndicatorSourceType;
  /** Source URL or reference */
  source_url?: string;
  /** Data collection method */
  collection_method?: string;
  /** Update frequency */
  update_frequency?: IndicatorPeriod;
  /** Next expected update */
  next_update?: string;
  /** Data quality score 0-1 */
  data_quality?: number;

  // ── Metadata ──
  /** Creation timestamp */
  created_at: string;
  /** Last update timestamp */
  updated_at: string;
  /** Creator user ID */
  created_by?: string;
  /** Whether indicator is published */
  is_published: boolean;
  /** Whether indicator is featured on dashboard */
  is_featured?: boolean;
  /** Display order */
  display_order?: number;
  /** Tags */
  tags?: string[];
  /** Related SDG (Sustainable Development Goal) */
  sdg_goal?: number;
  /** Related SDG target */
  sdg_target?: string;
}

/**
 * Lightweight indicator summary for lists.
 */
export interface IndicatorSummary {
  id: string;
  name: string;
  slug: string;
  category: IndicatorCategory;
  sector: Sector;
  unit: string;
  current_value?: number;
  trend: IndicatorTrend;
  trend_percent?: number;
  threshold_status: IndicatorThresholdType;
  is_featured: boolean;
  updated_at: string;
}

// ============================================================================
// SECTION 3: INDICATOR VALUE & HISTORY
// ============================================================================

/**
 * A single data point for an indicator.
 */
export interface IndicatorValue {
  /** Value ID */
  id: string;
  /** Parent indicator ID */
  indicator_id: string;
  /** Indicator name (denormalized) */
  indicator_name?: string;
  /** Numeric value */
  value: number;
  /** Data period */
  period: IndicatorPeriod;
  /** Period label (e.g. "Jan 2026", "Campagne 2025") */
  period_label: string;
  /** Start date of the period (ISO 8601) */
  date_from: string;
  /** End date of the period (ISO 8601) */
  date_to: string;
  /** Geographic scope */
  country?: string;
  region?: string;
  city?: string;
  /** Data source for this point */
  source?: string;
  /** Source type */
  source_type?: IndicatorSourceType;
  /** Whether value is estimated / projected */
  is_estimated: boolean;
  /** Confidence interval [lower, upper] */
  confidence_interval?: [number, number];
  /** Sample size (for survey data) */
  sample_size?: number;
  /** Notes */
  notes?: string;
  /** Creation timestamp */
  created_at: string;
}

/**
 * Historical time series for an indicator.
 */
export interface IndicatorHistory {
  /** Indicator ID */
  indicator_id: string;
  /** Indicator name */
  indicator_name: string;
  /** Indicator unit */
  unit: string;
  /** Data points */
  data: IndicatorValue[];
  /** Aggregation method used */
  aggregation?: AggregationMethod;
  /** Total data points */
  total_points: number;
  /** Date range start */
  date_from: string;
  /** Date range end */
  date_to: string;
  /** Computed statistics */
  stats?: IndicatorStats;
}

/**
 * Computed statistics for an indicator series.
 */
export interface IndicatorStats {
  /** Minimum value */
  min: number;
  /** Maximum value */
  max: number;
  /** Average */
  avg: number;
  /** Median */
  median: number;
  /** Standard deviation */
  std_dev?: number;
  /** Coefficient of variation */
  cv?: number;
  /** Year-over-year change */
  yoy_change?: number;
  /** Compound annual growth rate */
  cagr?: number;
  /** Number of data points */
  count: number;
}

// ============================================================================
// SECTION 4: THRESHOLDS & ALERTS
// ============================================================================

/**
 * A threshold configuration for an indicator.
 */
export interface IndicatorThreshold {
  /** Threshold ID */
  id: string;
  /** Indicator ID */
  indicator_id: string;
  /** Threshold type */
  type: IndicatorThresholdType;
  /** Threshold value */
  value: number;
  /** Whether the threshold is active */
  is_active: boolean;
  /** Custom message template */
  message_template?: string;
  /** Notification channels */
  notify_channels?: ('email' | 'sms' | 'push' | 'in_app')[];
  /** Target user roles */
  notify_roles?: string[];
  /** Target countries */
  notify_countries?: string[];
  /** Cooldown between alerts (hours) */
  cooldown_hours?: number;
  /** Created at */
  created_at: string;
}

/**
 * An alert triggered when an indicator crosses a threshold.
 */
export interface IndicatorAlert {
  /** Alert ID */
  id: string;
  /** Source indicator ID */
  indicator_id: string;
  /** Indicator name (denormalized) */
  indicator_name: string;
  /** Indicator category */
  indicator_category?: IndicatorCategory;
  /** Indicator sector */
  indicator_sector?: Sector;
  /** Trigger timestamp */
  triggered_at: string;
  /** Value that triggered the alert */
  value: number;
  /** Threshold type crossed */
  threshold_type: IndicatorThresholdType;
  /** Threshold value crossed */
  threshold_value: number;
  /** Alert message */
  message: string;
  /** Detailed description */
  description?: string;
  /** Recommended actions */
  recommended_actions?: string[];
  /** Alert status */
  status: IndicatorAlertStatus;
  /** Acknowledged by user ID */
  acknowledged_by?: string;
  /** Acknowledged at */
  acknowledged_at?: string;
  /** Resolved by user ID */
  resolved_by?: string;
  /** Resolved at */
  resolved_at?: string;
  /** Resolution notes */
  resolution_notes?: string;
  /** Geographic scope */
  country?: string;
  region?: string;
  /** Whether user has read this alert */
  is_read?: boolean;
  /** Creation timestamp */
  created_at: string;
}

/**
 * Alert summary for dashboards.
 */
export interface IndicatorAlertSummary {
  /** Total active alerts */
  total_active: number;
  /** Critical alerts count */
  critical_count: number;
  /** Alert-level count */
  alert_count: number;
  /** Warning count */
  warning_count: number;
  /** By category breakdown */
  by_category: Record<IndicatorCategory, number>;
  /** By sector breakdown */
  by_sector: Record<Sector, number>;
  /** Latest alerts */
  latest: IndicatorAlert[];
}

// ============================================================================
// SECTION 5: COMPARISON & BENCHMARKING
// ============================================================================

/**
 * Comparison between multiple indicators or regions.
 */
export interface IndicatorComparison {
  /** Comparison ID */
  id: string;
  /** Comparison title */
  title: string;
  /** Base indicator ID */
  base_indicator_id: string;
  /** Base indicator name */
  base_indicator_name: string;
  /** Comparison items */
  items: ComparisonItem[];
  /** Comparison period */
  period: string;
  /** Unit */
  unit: string;
  /** Creation timestamp */
  created_at: string;
}

/**
 * A single item in an indicator comparison.
 */
export interface ComparisonItem {
  /** Item label */
  label: string;
  /** Indicator ID (if different from base) */
  indicator_id?: string;
  /** Region / country code */
  region?: string;
  /** Country code */
  country?: string;
  /** Value */
  value: number;
  /** Trend */
  trend?: IndicatorTrend;
  /** Trend percentage */
  trend_percent?: number;
  /** Color (hex) for charts */
  color?: string;
}

/**
 * Benchmark against regional or national averages.
 */
export interface IndicatorBenchmark {
  /** Indicator ID */
  indicator_id: string;
  /** Current value */
  current_value: number;
  /** National average */
  national_avg?: number;
  /** Regional average */
  regional_avg?: number;
  /** Continental average (Africa) */
  continental_avg?: number;
  /** Best performer value */
  best_performer_value?: number;
  /** Best performer country */
  best_performer_country?: string;
  /** Percentile rank 0-100 */
  percentile_rank?: number;
  /** Gap to national average */
  gap_to_national?: number;
  /** Gap to best performer */
  gap_to_best?: number;
  /** Period */
  period: string;
}

// ============================================================================
// SECTION 6: DASHBOARD & WIDGETS
// ============================================================================

/**
 * A dashboard widget displaying an indicator.
 */
export interface IndicatorWidget {
  /** Widget ID */
  id: string;
  /** Widget title */
  title: string;
  /** Widget type */
  type: 'value' | 'sparkline' | 'gauge' | 'chart' | 'comparison' | 'map' | 'table' | 'alert';
  /** Indicator ID(s) */
  indicator_ids: string[];
  /** Widget configuration */
  config: {
    /** Chart type (if applicable) */
    chart_type?: 'line' | 'bar' | 'area' | 'pie' | 'radar';
    /** Time range */
    time_range?: '7d' | '30d' | '90d' | '1y' | '5y' | 'all';
    /** Geographic filter */
    country?: string;
    region?: string;
    /** Show target / threshold lines */
    show_thresholds?: boolean;
    /** Show trend line */
    show_trend?: boolean;
    /** Color scheme */
    colors?: string[];
  };
  /** Widget position */
  position?: { x: number; y: number; w: number; h: number };
  /** Refresh interval (seconds) */
  refresh_interval?: number;
  /** Last updated */
  last_updated?: string;
}

/**
 * A user-customized dashboard.
 */
export interface IndicatorDashboard {
  /** Dashboard ID */
  id: string;
  /** Dashboard name */
  name: string;
  /** Dashboard description */
  description?: string;
  /** Widgets */
  widgets: IndicatorWidget[];
  /** Layout configuration */
  layout?: 'grid' | 'list' | 'custom';
  /** Whether default dashboard */
  is_default: boolean;
  /** Whether shared */
  is_shared?: boolean;
  /** Owner user ID */
  owner_id: string;
  /** Target sector filter */
  sector_filter?: Sector;
  /** Target country filter */
  country_filter?: string;
  /** Creation timestamp */
  created_at: string;
  /** Last update */
  updated_at: string;
}

// ============================================================================
// SECTION 7: REPORTS & EXPORTS
// ============================================================================

/**
 * An indicator report configuration.
 */
export interface IndicatorReport {
  /** Report ID */
  id: string;
  /** Report title */
  title: string;
  /** Report description */
  description?: string;
  /** Included indicator IDs */
  indicator_ids: string[];
  /** Time range */
  time_range: { from: string; to: string };
  /** Geographic scope */
  countries?: string[];
  regions?: string[];
  /** Grouping */
  group_by?: 'country' | 'region' | 'sector' | 'category';
  /** Output format */
  format: 'pdf' | 'excel' | 'csv' | 'json';
  /** Whether to include charts */
  include_charts: boolean;
  /** Whether to include raw data */
  include_raw_data: boolean;
  /** Report status */
  status: 'draft' | 'generating' | 'ready' | 'error';
  /** Generated file URL */
  file_url?: string;
  /** Generated at */
  generated_at?: string;
  /** Created by */
  created_by: string;
  /** Created at */
  created_at: string;
}

/**
 * Export job for indicator data.
 */
export interface IndicatorExportJob {
  /** Job ID */
  id: string;
  /** Export status */
  status: 'queued' | 'processing' | 'completed' | 'failed';
  /** Indicator IDs */
  indicator_ids: string[];
  /** Date range */
  date_from: string;
  date_to: string;
  /** Format */
  format: 'csv' | 'excel' | 'json' | 'geojson';
  /** Output file URL */
  file_url?: string;
  /** File size */
  file_size?: number;
  /** Row count */
  row_count?: number;
  /** Error message */
  error?: string;
  /** Started at */
  started_at?: string;
  /** Completed at */
  completed_at?: string;
}

// ============================================================================
// SECTION 8: PREDICTION & FORECAST
// ============================================================================

/**
 * A forecast / prediction for an indicator.
 */
export interface IndicatorForecast {
  /** Forecast ID */
  id: string;
  /** Source indicator ID */
  indicator_id: string;
  /** Indicator name */
  indicator_name: string;
  /** Forecast method */
  method: 'arima' | 'prophet' | 'lstm' | 'linear' | 'ensemble' | 'expert';
  /** Forecast horizon */
  horizon: IndicatorPeriod;
  /** Number of periods ahead */
  horizon_count: number;
  /** Predicted values */
  predictions: ForecastPoint[];
  /** Confidence level */
  confidence_level: number;
  /** Model accuracy metrics */
  accuracy?: {
    mae?: number;
    rmse?: number;
    mape?: number;
    r2?: number;
  };
  /** Model version */
  model_version?: string;
  /** Training date */
  trained_at?: string;
  /** Created at */
  created_at: string;
}

/**
 * A single forecast data point.
 */
export interface ForecastPoint {
  /** Period label */
  period: string;
  /** Predicted value */
  predicted_value: number;
  /** Lower bound of confidence interval */
  lower_bound?: number;
  /** Upper bound of confidence interval */
  upper_bound?: number;
  /** Scenario: optimistic / baseline / pessimistic */
  scenario?: 'optimistic' | 'baseline' | 'pessimistic';
}

// ============================================================================
// SECTION 9: FILTERS & REQUESTS
// ============================================================================

/**
 * Filters for indicator listing.
 */
export interface IndicatorFilters {
  /** Search query */
  search?: string;
  /** Category filter */
  category?: IndicatorCategory;
  /** Categories filter */
  categories?: IndicatorCategory[];
  /** Sector filter */
  sector?: Sector;
  /** Sectors filter */
  sectors?: Sector[];
  /** Sub-sector filter */
  sub_sector?: string;
  /** Country filter */
  country?: string;
  /** Region filter */
  region?: string;
  /** Period filter */
  period?: IndicatorPeriod;
  /** Trend filter */
  trend?: IndicatorTrend;
  /** Threshold status filter */
  threshold_status?: IndicatorThresholdType;
  /** Source type filter */
  source_type?: IndicatorSourceType;
  /** Only featured indicators */
  featured_only?: boolean;
  /** Only published indicators */
  published_only?: boolean;
  /** Tag filter */
  tag?: string;
  /** SDG goal filter */
  sdg_goal?: number;
  /** Sort field */
  sort_by?: 'name' | 'category' | 'sector' | 'updated_at' | 'current_value' | 'trend';
  /** Sort direction */
  sort_order?: 'asc' | 'desc';
  /** Pagination */
  page?: number;
  limit?: number;
}

/**
 * Request to create an indicator.
 */
export interface CreateIndicatorRequest {
  name: string;
  description: string;
  short_description?: string;
  formula?: string;
  unit: string;
  unit_symbol?: string;
  category: IndicatorCategory;
  sector: Sector;
  sub_sector?: string;
  threshold_critical: number;
  threshold_alert: number;
  threshold_warning?: number;
  threshold_optimal: number;
  higher_is_better: boolean;
  threshold_direction: 'above' | 'below' | 'between';
  countries?: string[];
  regions?: string[];
  source?: string;
  source_type?: IndicatorSourceType;
  source_url?: string;
  update_frequency?: IndicatorPeriod;
  tags?: string[];
  sdg_goal?: number;
  sdg_target?: string;
}

/**
 * Request to add indicator values.
 */
export interface AddIndicatorValuesRequest {
  indicator_id: string;
  values: Omit<IndicatorValue, 'id' | 'indicator_id' | 'indicator_name' | 'created_at'>[];
}

/**
 * Request to create a forecast.
 */
export interface CreateForecastRequest {
  indicator_id: string;
  method: IndicatorForecast['method'];
  horizon: IndicatorPeriod;
  horizon_count: number;
  confidence_level?: number;
}

// ============================================================================
// SECTION 10: CONSTANTS & LABELS
// ============================================================================

/** Labels for indicator categories */
export const INDICATOR_CATEGORY_LABELS: Record<IndicatorCategory, string> = {
  compte_exploitation: 'Compte d\'exploitation',
  revenus: 'Revenus',
  pauvrete: 'Pauvreté',
  nutrition: 'Nutrition',
  sante: 'Santé',
  bien_etre: 'Bien-être',
  production: 'Production',
  rendement: 'Rendement',
  prix: 'Prix',
  environnement: 'Environnement',
  climat: 'Climat',
  marché: 'Marché',
  emploi: 'Emploi',
  genre: 'Genre',
  innovation: 'Innovation',
};

/** Icons for indicator categories */
export const INDICATOR_CATEGORY_ICONS: Record<IndicatorCategory, string> = {
  compte_exploitation: '📊',
  revenus: '💰',
  pauvrete: '⚠️',
  nutrition: '🍲',
  sante: '🏥',
  bien_etre: '😊',
  production: '🌾',
  rendement: '📈',
  prix: '💵',
  environnement: '🌿',
  climat: '🌤️',
  marché: '🏪',
  emploi: '👷',
  genre: '⚖️',
  innovation: '💡',
};

/** Labels for indicator periods */
export const INDICATOR_PERIOD_LABELS: Record<IndicatorPeriod, string> = {
  daily: 'Journalier',
  weekly: 'Hebdomadaire',
  biweekly: 'Bimensuel',
  monthly: 'Mensuel',
  quarterly: 'Trimestriel',
  biannual: 'Semestriel',
  yearly: 'Annuel',
  seasonal: 'Saisonnier',
  decadal: 'Décadaire',
};

/** Labels for trend directions */
export const TREND_LABELS: Record<IndicatorTrend, string> = {
  up: 'En hausse',
  down: 'En baisse',
  stable: 'Stable',
  volatile: 'Volatile',
};

/** Colors for trend directions */
export const TREND_COLORS: Record<IndicatorTrend, string> = {
  up: '#22C55E',
  down: '#DC2626',
  stable: '#6B7280',
  volatile: '#EAB308',
};

/** Labels for threshold types */
export const THRESHOLD_TYPE_LABELS: Record<IndicatorThresholdType, string> = {
  critical: 'Critique',
  alert: 'Alerte',
  warning: 'Attention',
  optimal: 'Optimal',
};

/** Colors for threshold types (Tailwind classes) */
export const THRESHOLD_TYPE_COLORS: Record<IndicatorThresholdType, string> = {
  critical: 'bg-red-50 text-red-700 border-red-200',
  alert: 'bg-orange-50 text-orange-700 border-orange-200',
  warning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  optimal: 'bg-green-50 text-green-700 border-green-200',
};

/** Labels for alert statuses */
export const ALERT_STATUS_LABELS: Record<IndicatorAlertStatus, string> = {
  active: 'Active',
  acknowledged: 'Accusée',
  resolved: 'Résolue',
  expired: 'Expirée',
};

/** Labels for source types */
export const SOURCE_TYPE_LABELS: Record<IndicatorSourceType, string> = {
  manual: 'Saisie manuelle',
  sensor: 'Capteur IoT',
  satellite: 'Satellite',
  survey: 'Enquête terrain',
  administrative: 'Données administratives',
  model: 'Modèle prédictif',
  api: 'API externe',
  partner: 'Partenaire',
};

// ============================================================================
// SECTION 11: UTILITY FUNCTIONS
// ============================================================================

/**
 * Get indicator category label.
 */
export function getIndicatorCategoryLabel(category: IndicatorCategory): string {
  return INDICATOR_CATEGORY_LABELS[category] ?? category;
}

/**
 * Get indicator category icon.
 */
export function getIndicatorCategoryIcon(category: IndicatorCategory): string {
  return INDICATOR_CATEGORY_ICONS[category] ?? '📊';
}

/**
 * Get period label.
 */
export function getPeriodLabel(period: IndicatorPeriod): string {
  return INDICATOR_PERIOD_LABELS[period] ?? period;
}

/**
 * Get trend label.
 */
export function getTrendLabel(trend: IndicatorTrend): string {
  return TREND_LABELS[trend] ?? trend;
}

/**
 * Get trend color (hex).
 */
export function getTrendColor(trend: IndicatorTrend): string {
  return TREND_COLORS[trend] ?? '#6B7280';
}

/**
 * Get threshold type label.
 */
export function getThresholdTypeLabel(type: IndicatorThresholdType): string {
  return THRESHOLD_TYPE_LABELS[type] ?? type;
}

/**
 * Get threshold type color classes.
 */
export function getThresholdTypeColor(type: IndicatorThresholdType): string {
  return THRESHOLD_TYPE_COLORS[type] ?? 'bg-gray-50 text-gray-700 border-gray-200';
}

/**
 * Get alert status label.
 */
export function getAlertStatusLabel(status: IndicatorAlertStatus): string {
  return ALERT_STATUS_LABELS[status] ?? status;
}

/**
 * Get source type label.
 */
export function getSourceTypeLabel(source: IndicatorSourceType): string {
  return SOURCE_TYPE_LABELS[source] ?? source;
}

/**
 * Determine threshold status from value and thresholds.
 */
export function getThresholdStatus(
  value: number,
  indicator: Pick<Indicator, 'threshold_critical' | 'threshold_alert' | 'threshold_warning' | 'threshold_optimal' | 'higher_is_better' | 'threshold_direction'>
): IndicatorThresholdType {
  const { threshold_critical, threshold_alert, threshold_optimal, higher_is_better, threshold_direction } = indicator;

  if (threshold_direction === 'between') {
    // For "between" thresholds, optimal is the range
    const isOptimal = value >= Math.min(threshold_optimal, threshold_alert) &&
                      value <= Math.max(threshold_optimal, threshold_alert);
    if (isOptimal) return 'optimal';
    const isCritical = value <= Math.min(threshold_critical, threshold_alert) ||
                       value >= Math.max(threshold_critical, threshold_alert);
    if (isCritical) return 'critical';
    return 'alert';
  }

  if (higher_is_better) {
    if (value >= threshold_optimal) return 'optimal';
    if (value >= threshold_alert) return 'warning';
    if (value >= threshold_critical) return 'alert';
    return 'critical';
  } else {
    if (value <= threshold_optimal) return 'optimal';
    if (value <= threshold_alert) return 'warning';
    if (value <= threshold_critical) return 'alert';
    return 'critical';
  }
}

/**
 * Format indicator value with unit.
 */
export function formatIndicatorValue(value: number, unit: string): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—';

  // Format large numbers
  if (Math.abs(value) >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(2)} Mds ${unit}`;
  }
  if (Math.abs(value) >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)} M ${unit}`;
  }
  if (Math.abs(value) >= 1_000) {
    return `${(value / 1_000).toFixed(2)} k ${unit}`;
  }

  // Format percentages
  if (unit === '%') {
    return `${value.toFixed(1)}%`;
  }

  // Format currency (FCFA)
  if (unit.includes('FCFA') || unit.includes('CFA')) {
    return `${new Intl.NumberFormat('fr-FR').format(Math.round(value))} ${unit}`;
  }

  // Default format
  return `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(value)} ${unit}`;
}

/**
 * Calculate trend from two values.
 */
export function calculateTrend(current: number, previous: number): { trend: IndicatorTrend; percent: number } {
  if (previous === 0) return { trend: 'stable', percent: 0 };
  const percent = ((current - previous) / Math.abs(previous)) * 100;

  if (Math.abs(percent) < 1) return { trend: 'stable', percent: 0 };
  if (Math.abs(percent) > 20) return { trend: 'volatile', percent };
  return { trend: percent > 0 ? 'up' : 'down', percent };
}

/**
 * Check if an indicator value is estimated.
 */
export function isEstimatedValue(value: IndicatorValue): boolean {
  return value.is_estimated;
}

/**
 * Check if an alert is active.
 */
export function isAlertActive(alert: IndicatorAlert): boolean {
  return alert.status === 'active';
}

/**
 * Check if an alert requires attention.
 */
export function isAlertUrgent(alert: IndicatorAlert): boolean {
  return alert.status === 'active' && (alert.threshold_type === 'critical' || alert.threshold_type === 'alert');
}

/**
 * Get alert age in human-readable format.
 */
export function getAlertAge(alert: IndicatorAlert): string {
  const triggered = new Date(alert.triggered_at);
  const now = new Date();
  const diffMs = now.getTime() - triggered.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'À l\'instant';
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays < 7) return `Il y a ${diffDays}j`;
  return triggered.toLocaleDateString('fr-FR');
}

/**
 * Create an empty indicator.
 */
export function createEmptyIndicator(): Indicator {
  const now = new Date().toISOString();
  return {
    id: '',
    name: '',
    slug: '',
    description: '',
    unit: '',
    category: 'production',
    sector: 'vegetal',
    threshold_critical: 0,
    threshold_alert: 0,
    threshold_optimal: 0,
    higher_is_better: true,
    threshold_direction: 'above',
    trend: 'stable',
    created_at: now,
    updated_at: now,
    is_published: false,
  };
}

/**
 * Create an empty indicator value.
 */
export function createEmptyIndicatorValue(indicatorId: string): IndicatorValue {
  return {
    id: '',
    indicator_id: indicatorId,
    value: 0,
    period: 'monthly',
    period_label: '',
    date_from: new Date().toISOString(),
    date_to: new Date().toISOString(),
    is_estimated: false,
    created_at: new Date().toISOString(),
  };
}

/**
 * Create an empty indicator alert.
 */
export function createEmptyIndicatorAlert(): IndicatorAlert {
  const now = new Date().toISOString();
  return {
    id: '',
    indicator_id: '',
    indicator_name: '',
    triggered_at: now,
    value: 0,
    threshold_type: 'alert',
    threshold_value: 0,
    message: '',
    status: 'active',
    created_at: now,
  };
}

/**
 * Build a sparkline data array from history.
 */
export function buildSparklineData(history: IndicatorHistory, points: number = 20): number[] {
  const data = history.data.slice(-points);
  return data.map((d) => d.value);
}

/**
 * Get the latest value from history.
 */
export function getLatestValue(history: IndicatorHistory): IndicatorValue | undefined {
  if (history.data.length === 0) return undefined;
  return [...history.data].sort((a, b) =>
    new Date(b.date_to).getTime() - new Date(a.date_to).getTime()
  )[0];
}

/**
 * Get the value at a specific date.
 */
export function getValueAtDate(history: IndicatorHistory, date: string): IndicatorValue | undefined {
  return history.data.find((d) => d.date_from <= date && d.date_to >= date);
}

// ============================================================================
// SECTION 12: EXPORT GROUPING
// ============================================================================

export const IndicatorTypes = {
  INDICATOR_CATEGORY_LABELS,
  INDICATOR_CATEGORY_ICONS,
  INDICATOR_PERIOD_LABELS,
  TREND_LABELS,
  TREND_COLORS,
  THRESHOLD_TYPE_LABELS,
  THRESHOLD_TYPE_COLORS,
  ALERT_STATUS_LABELS,
  SOURCE_TYPE_LABELS,
  getIndicatorCategoryLabel,
  getIndicatorCategoryIcon,
  getPeriodLabel,
  getTrendLabel,
  getTrendColor,
  getThresholdTypeLabel,
  getThresholdTypeColor,
  getAlertStatusLabel,
  getSourceTypeLabel,
  getThresholdStatus,
  formatIndicatorValue,
  calculateTrend,
  isEstimatedValue,
  isAlertActive,
  isAlertUrgent,
  getAlertAge,
  createEmptyIndicator,
  createEmptyIndicatorValue,
  createEmptyIndicatorAlert,
  buildSparklineData,
  getLatestValue,
  getValueAtDate,
} as const;
