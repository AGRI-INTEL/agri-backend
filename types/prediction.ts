// ============================================================================
// SECTION 1: CORE TYPES & ENUMS
// ============================================================================

/**
 * Types of predictions supported by the platform.
 */
export type PredictionType =
  | 'yield'      // Prédiction de rendement agricole
  | 'price'      // Prédiction de prix de marché
  | 'weather'    // Prédiction météorologique
  | 'production' // Prédiction de volume de production
  | 'demand'     // Prédiction de demande / consommation
  | 'disease'    // Prédiction de risque de maladie
  | 'pest'       // Prédiction de risque de ravageurs
  | 'livestock'  // Prédiction de productivité animale
  | 'fishery'    // Prédiction de captures halieutiques
  | 'soil'       // Prédiction de qualité des sols
  | 'market';    // Prédiction de tendances de marché

/**
 * Horizon temporel de la prédiction.
 */
export type PredictionHorizon =
  | '7d'    // 7 jours
  | '14d'   // 14 jours
  | '30d'   // 30 jours
  | '90d'   // 3 mois
  | '6m'    // 6 mois
  | '1y'    // 1 an
  | '2y'    // 2 ans
  | '5y'    // 5 ans
  | 'season'; // Saison agricole en cours

/**
 * Statut d'une prédiction.
 */
export type PredictionStatus =
  | 'pending'     // En attente de traitement
  | 'processing'  // Calcul en cours
  | 'completed'   // Terminée avec succès
  | 'failed'      // Échec du calcul
  | 'cancelled'   // Annulée par l'utilisateur
  | 'stale';      // Données obsolètes (à recalculer)

/**
 * Méthode de modélisation utilisée.
 */
export type PredictionModel =
  | 'linear_regression'
  | 'random_forest'
  | 'xgboost'
  | 'lstm'
  | 'prophet'
  | 'arima'
  | 'sarima'
  | 'ensemble'
  | 'neural_network'
  | 'expert_system'
  | 'hybrid'; // Combinaison de plusieurs modèles

/**
 * Direction de la tendance prédite.
 */
export type PredictionTrend = 'up' | 'down' | 'stable' | 'volatile';

/**
 * Niveau de confiance de la prédiction.
 */
export type ConfidenceLevel = 'low' | 'medium' | 'high' | 'very_high';

/**
 * Saison agricole.
 */
export type CropSeason = 'dry' | 'wet' | 'both' | 'year_round';

// ============================================================================
// SECTION 2: PREDICTION INPUTS
// ============================================================================

/**
 * Input for yield prediction (rendement agricole).
 */
export interface YieldPredictionInput {
  /** Crop / culture (e.g. "Maïs", "Riz") */
  crop: string;
  /** Crop variety (optional) */
  variety?: string;
  /** Geographic region */
  region: string;
  /** Country code (ISO 3166-1 alpha-2) */
  country: string;
  /** Cultivated area in hectares */
  area_ha: number;
  /** Reference date (YYYY-MM-DD) */
  date: string;
  /** Season type */
  season?: CropSeason;
  /** Whether irrigation is used */
  irrigation?: boolean;
  /** Irrigation type */
  irrigation_type?: 'gravity' | 'sprinkler' | 'drip' | 'manual';
  /** Fertilizer usage (kg/ha) */
  fertilizer_kg_ha?: number;
  /** Seed type */
  seed_type?: 'improved' | 'local' | 'hybrid';
  /** Soil type */
  soil_type?: 'sandy' | 'clay' | 'loamy' | 'laterite' | 'alluvial';
  /** Previous crop (for rotation analysis) */
  previous_crop?: string;
  /** Climate zone */
  climate_zone?: 'sahel' | 'soudan' | 'guinea' | 'equatorial' | 'montane';
  /** GPS coordinates [lat, lng] */
  coordinates?: [number, number];
}

/**
 * Input for price prediction.
 */
export interface PricePredictionInput {
  /** Product name (e.g. "Maïs", "Riz", "Cacao") */
  product: string;
  /** Market name */
  market: string;
  /** Country code */
  country: string;
  /** Region (optional) */
  region?: string;
  /** Prediction horizon */
  period: PredictionHorizon;
  /** Currency code */
  currency?: 'XOF' | 'XAF' | 'NGN' | 'ZAR' | 'MAD' | 'EGP' | 'EUR' | 'USD';
  /** Market type */
  market_type?: 'wholesale' | 'retail' | 'export' | 'farm_gate';
  /** Quality grade */
  quality_grade?: string;
  /** Current price (if known) */
  current_price?: number;
  /** Season context */
  season?: CropSeason;
}

/**
 * Input for weather prediction.
 */
export interface WeatherPredictionInput {
  /** Latitude */
  latitude: number;
  /** Longitude */
  longitude: number;
  /** City name */
  city: string;
  /** Country code */
  country?: string;
  /** Region */
  region?: string;
  /** Prediction horizon */
  horizon: PredictionHorizon;
  /** Specific weather variables to predict */
  variables?: WeatherVariable[];
}

/**
 * Weather variables that can be predicted.
 */
export type WeatherVariable =
  | 'temperature'
  | 'precipitation'
  | 'humidity'
  | 'wind_speed'
  | 'solar_radiation'
  | 'evapotranspiration'
  | 'drought_index'
  | 'flood_risk'
  | 'heatwave_risk';

/**
 * Input for production prediction.
 */
export interface ProductionPredictionInput {
  /** Product / crop */
  product: string;
  /** Country */
  country: string;
  /** Region */
  region?: string;
  /** Prediction horizon */
  horizon: PredictionHorizon;
  /** Total cultivated area (ha) */
  total_area_ha?: number;
  /** Expected yield (kg/ha) */
  expected_yield_kg_ha?: number;
}

/**
 * Input for disease/pest risk prediction.
 */
export interface RiskPredictionInput {
  /** Target: crop or animal species */
  target: string;
  /** Risk type */
  risk_type: 'disease' | 'pest' | 'drought' | 'flood' | 'heat_stress';
  /** Country */
  country: string;
  /** Region */
  region: string;
  /** GPS coordinates */
  coordinates?: [number, number];
  /** Current weather conditions */
  current_conditions?: {
    temperature?: number;
    humidity?: number;
    rainfall_7d?: number;
  };
  /** Crop growth stage */
  growth_stage?: string;
  /** Previous occurrences */
  previous_occurrences?: number;
}

/**
 * Union type for all prediction inputs.
 */
export type PredictionInput =
  | YieldPredictionInput
  | PricePredictionInput
  | WeatherPredictionInput
  | ProductionPredictionInput
  | RiskPredictionInput;

// ============================================================================
// SECTION 3: PREDICTION RESULTS
// ============================================================================

/**
 * A factor influencing the prediction.
 */
export interface PredictionFactor {
  /** Factor name */
  name: string;
  /** Impact weight (-1 to 1) */
  impact: number;
  /** Direction of impact */
  direction: 'positive' | 'negative' | 'neutral';
  /** Human-readable description */
  description: string;
  /** Category */
  category?: 'climatic' | 'economic' | 'agronomic' | 'market' | 'policy' | 'social' | 'environmental';
  /** Confidence in this factor's influence */
  confidence?: number;
  /** Data source for this factor */
  source?: string;
}

/**
 * A historical data point.
 */
export interface HistoricalPoint {
  /** Date (ISO 8601) */
  date: string;
  /** Observed value */
  value: number;
  /** Unit */
  unit?: string;
  /** Whether the value is estimated */
  is_estimated?: boolean;
  /** Anomaly flag */
  is_anomaly?: boolean;
}

/**
 * A predicted future data point.
 */
export interface PredictionPoint {
  /** Date (ISO 8601) */
  date: string;
  /** Predicted value */
  value: number;
  /** Lower bound of confidence interval */
  lower_bound: number;
  /** Upper bound of confidence interval */
  upper_bound: number;
  /** Scenario: optimistic / baseline / pessimistic */
  scenario?: 'optimistic' | 'baseline' | 'pessimistic';
  /** Probability distribution (if available) */
  probability_distribution?: { value: number; probability: number }[];
}

/**
 * The result of a prediction request.
 */
export interface PredictionResult {
  /** Unique prediction ID */
  id: string;
  /** Prediction type */
  type: PredictionType;
  /** Input parameters used */
  input: PredictionInput;
  /** Main predicted value */
  value: number;
  /** Unit of the predicted value */
  unit: string;
  /** Prediction status */
  status: PredictionStatus;
  /** Overall confidence score (0-1) */
  confidence_score: number;
  /** Confidence level category */
  confidence_level?: ConfidenceLevel;
  /** Confidence interval [lower, upper] */
  confidence_interval: [number, number];
  /** Predicted trend direction */
  trend: PredictionTrend;
  /** Trend percentage change */
  trend_percent?: number;
  /** Key influencing factors */
  key_factors: PredictionFactor[];
  /** Historical observed data */
  historical_data: HistoricalPoint[];
  /** Predicted future data points */
  prediction_data: PredictionPoint[];
  /** Model used */
  model: PredictionModel;
  /** Model version */
  model_version: string;
  /** Model accuracy metrics (on validation set) */
  model_accuracy?: {
    mae?: number;
    rmse?: number;
    mape?: number;
    r2?: number;
    mse?: number;
  };
  /** Training data date range */
  training_period?: { from: string; to: string };
  /** Feature importance */
  feature_importance?: Record<string, number>;
  /** Creation timestamp */
  created_at: string;
  /** Computation duration (ms) */
  computation_time_ms?: number;
  /** Expiration date (predictions become stale) */
  expires_at?: string;
  /** Whether the prediction is still valid */
  is_stale?: boolean;
  /** User ID who requested */
  requested_by?: string;
  /** Related entity IDs (e.g. actor_id, parcel_id) */
  related_ids?: Record<string, string>;
}

/**
 * A lightweight prediction summary for lists.
 */
export interface PredictionSummary {
  id: string;
  type: PredictionType;
  label: string;
  value: number;
  unit: string;
  confidence_score: number;
  confidence_level: ConfidenceLevel;
  trend: PredictionTrend;
  trend_percent?: number;
  status: PredictionStatus;
  created_at: string;
  expires_at?: string;
  is_stale: boolean;
}

// ============================================================================
// SECTION 4: PREDICTION HISTORY & FEEDBACK
// ============================================================================

/**
 * A past prediction with actual outcome (for model evaluation).
 */
export interface PredictionHistory {
  /** History record ID */
  id: string;
  /** Original prediction type */
  type: PredictionType;
  /** Display label */
  label: string;
  /** Input summary */
  input_summary: string;
  /** Predicted value */
  predicted_value: number;
  /** Actual observed value (if available) */
  actual_value?: number;
  /** Unit */
  unit: string;
  /** Prediction error (actual - predicted) */
  error?: number;
  /** Absolute percentage error */
  ape?: number;
  /** Model accuracy for this prediction */
  accuracy?: number;
  /** Whether actual value is available */
  has_actual: boolean;
  /** Prediction date */
  created_at: string;
  /** Actual value observation date */
  actual_date?: string;
  /** Horizon that was predicted */
  horizon?: PredictionHorizon;
  /** Model used */
  model?: PredictionModel;
  /** Model version */
  model_version?: string;
  /** User feedback: was the prediction useful? */
  user_feedback?: 'accurate' | 'underestimated' | 'overestimated' | 'useless';
  /** User feedback text */
  user_feedback_text?: string;
}

/**
 * User feedback on a prediction.
 */
export interface PredictionFeedback {
  /** Prediction ID */
  prediction_id: string;
  /** User ID */
  user_id: string;
  /** Rating 1-5 */
  rating: number;
  /** Was the prediction accurate? */
  accuracy_rating?: 'very_accurate' | 'accurate' | 'somewhat_accurate' | 'inaccurate' | 'very_inaccurate';
  /** Was it useful for decision-making? */
  usefulness_rating?: 'very_useful' | 'useful' | 'somewhat_useful' | 'not_useful';
  /** Feedback text */
  comment?: string;
  /** Created at */
  created_at: string;
}

/**
 * Model performance metrics over time.
 */
export interface ModelPerformance {
  /** Model name */
  model: PredictionModel;
  /** Model version */
  version: string;
  /** Prediction type */
  type: PredictionType;
  /** Total predictions made */
  total_predictions: number;
  /** Predictions with actual values */
  evaluated_predictions: number;
  /** Mean Absolute Error */
  mae: number;
  /** Root Mean Square Error */
  rmse: number;
  /** Mean Absolute Percentage Error */
  mape: number;
  /** R-squared */
  r2: number;
  /** Accuracy by horizon */
  by_horizon: Record<PredictionHorizon, { mape: number; count: number }>;
  /** Accuracy by country */
  by_country: Record<string, { mape: number; count: number }>;
  /** Last evaluation date */
  evaluated_at: string;
}

// ============================================================================
// SECTION 5: PREDICTION REQUESTS
// ============================================================================

/**
 * Request to create a prediction.
 */
export interface CreatePredictionRequest {
  /** Prediction type */
  type: PredictionType;
  /** Input parameters */
  input: PredictionInput;
  /** Desired model (optional, auto-selected if omitted) */
  model?: PredictionModel;
  /** Prediction horizon */
  horizon?: PredictionHorizon;
  /** Confidence level for intervals */
  confidence_level?: number;
  /** Whether to include historical data in response */
  include_history?: boolean;
  /** Whether to include factor analysis */
  include_factors?: boolean;
  /** Related entity ID */
  related_id?: string;
  /** Related entity type */
  related_type?: string;
}

/**
 * Request to batch create predictions.
 */
export interface BatchPredictionRequest {
  /** Predictions to compute */
  predictions: CreatePredictionRequest[];
  /** Whether to run in parallel */
  parallel?: boolean;
  /** Callback URL for async results */
  callback_url?: string;
}

/**
 * Request to compare multiple prediction scenarios.
 */
export interface CompareScenariosRequest {
  /** Prediction type */
  type: PredictionType;
  /** Base input */
  base_input: PredictionInput;
  /** Scenario variations */
  scenarios: {
    name: string;
    description?: string;
    input_overrides: Partial<PredictionInput>;
    color?: string;
  }[];
  /** Horizon */
  horizon: PredictionHorizon;
}

/**
 * Response for batch predictions.
 */
export interface BatchPredictionResponse {
  /** Job ID */
  job_id: string;
  /** Total predictions */
  total: number;
  /** Completed count */
  completed: number;
  /** Failed count */
  failed: number;
  /** Results (as they become available) */
  results: PredictionResult[];
  /** Errors */
  errors: { index: number; message: string }[];
  /** Status */
  status: 'queued' | 'processing' | 'completed' | 'failed';
  /** Started at */
  started_at?: string;
  /** Completed at */
  completed_at?: string;
}

// ============================================================================
// SECTION 6: SCENARIOS & SENSITIVITY
// ============================================================================

/**
 * A what-if scenario for prediction.
 */
export interface PredictionScenario {
  /** Scenario ID */
  id: string;
  /** Scenario name */
  name: string;
  /** Description */
  description?: string;
  /** Base prediction ID */
  base_prediction_id: string;
  /** Modified input parameters */
  input_modifications: Partial<PredictionInput>;
  /** Resulting prediction */
  result: PredictionResult;
  /** Difference from base prediction */
  delta?: {
    value_diff: number;
    percent_diff: number;
    confidence_diff: number;
  };
  /** Color for visualization */
  color?: string;
  /** Created at */
  created_at: string;
}

/**
 * Sensitivity analysis result.
 */
export interface SensitivityAnalysis {
  /** Base prediction ID */
  prediction_id: string;
  /** Variable being tested */
  variable: string;
  /** Range of values tested */
  range: { min: number; max: number; step: number };
  /** Results: value → prediction */
  results: { input_value: number; predicted_value: number; confidence_interval: [number, number] }[];
  /** Optimal value (if applicable) */
  optimal_value?: number;
  /** Sensitivity score (how much output changes per input change) */
  sensitivity_score: number;
}

// ============================================================================
// SECTION 7: DASHBOARD & WIDGETS
// ============================================================================

/**
 * A prediction widget for dashboards.
 */
export interface PredictionWidget {
  /** Widget ID */
  id: string;
  /** Widget title */
  title: string;
  /** Widget type */
  type: 'current_value' | 'sparkline' | 'chart' | 'gauge' | 'comparison' | 'factors' | 'map';
  /** Prediction ID(s) */
  prediction_ids: string[];
  /** Configuration */
  config: {
    /** Chart type */
    chart_type?: 'line' | 'bar' | 'area' | 'radar';
    /** Show confidence intervals */
    show_confidence?: boolean;
    /** Show historical data */
    show_history?: boolean;
    /** Time range */
    time_range?: PredictionHorizon;
    /** Color */
    color?: string;
  };
  /** Position */
  position?: { x: number; y: number; w: number; h: number };
  /** Refresh interval (seconds) */
  refresh_interval?: number;
}

/**
 * A saved prediction configuration (template).
 */
export interface PredictionTemplate {
  /** Template ID */
  id: string;
  /** Template name */
  name: string;
  /** Description */
  description?: string;
  /** Prediction type */
  type: PredictionType;
  /** Default input values */
  default_input: Partial<PredictionInput>;
  /** Default horizon */
  default_horizon: PredictionHorizon;
  /** Default model */
  default_model?: PredictionModel;
  /** Whether available to all users */
  is_public: boolean;
  /** Creator ID */
  created_by: string;
  /** Creation timestamp */
  created_at: string;
  /** Usage count */
  usage_count: number;
}

// ============================================================================
// SECTION 8: CONSTANTS & LABELS
// ============================================================================

/** Labels for prediction types */
export const PREDICTION_TYPE_LABELS: Record<PredictionType, string> = {
  yield: 'Rendement',
  price: 'Prix',
  weather: 'Météo',
  production: 'Production',
  demand: 'Demande',
  disease: 'Risque maladie',
  pest: 'Risque ravageur',
  livestock: 'Productivité animale',
  fishery: 'Captures halieutiques',
  soil: 'Qualité des sols',
  market: 'Tendances de marché',
};

/** Icons for prediction types */
export const PREDICTION_TYPE_ICONS: Record<PredictionType, string> = {
  yield: '🌾',
  price: '💰',
  weather: '🌤️',
  production: '📦',
  demand: '📊',
  disease: '🦠',
  pest: '🐛',
  livestock: '🐄',
  fishery: '🎣',
  soil: '🪴',
  market: '🏪',
};

/** Colors for prediction types */
export const PREDICTION_TYPE_COLORS: Record<PredictionType, string> = {
  yield: '#16A34A',
  price: '#D97706',
  weather: '#0891B2',
  production: '#4F46E5',
  demand: '#7C3AED',
  disease: '#DC2626',
  pest: '#F97316',
  livestock: '#92400E',
  fishery: '#0EA5E9',
  soil: '#92400E',
  market: '#EC4899',
};

/** Labels for prediction horizons */
export const HORIZON_LABELS: Record<PredictionHorizon, string> = {
  '7d': '7 jours',
  '14d': '14 jours',
  '30d': '30 jours',
  '90d': '3 mois',
  '6m': '6 mois',
  '1y': '1 an',
  '2y': '2 ans',
  '5y': '5 ans',
  season: 'Saison',
};

/** Labels for prediction status */
export const PREDICTION_STATUS_LABELS: Record<PredictionStatus, string> = {
  pending: 'En attente',
  processing: 'Calcul en cours...',
  completed: 'Terminé',
  failed: 'Échec',
  cancelled: 'Annulé',
  stale: 'Obsolète',
};

/** Labels for prediction models */
export const MODEL_LABELS: Record<PredictionModel, string> = {
  linear_regression: 'Régression linéaire',
  random_forest: 'Random Forest',
  xgboost: 'XGBoost',
  lstm: 'LSTM (Deep Learning)',
  prophet: 'Prophet',
  arima: 'ARIMA',
  sarima: 'SARIMA',
  ensemble: 'Ensemble',
  neural_network: 'Réseau de neurones',
  expert_system: 'Système expert',
  hybrid: 'Hybride',
};

/** Labels for trend directions */
export const TREND_LABELS: Record<PredictionTrend, string> = {
  up: 'En hausse',
  down: 'En baisse',
  stable: 'Stable',
  volatile: 'Volatile',
};

/** Colors for trend directions */
export const TREND_COLORS: Record<PredictionTrend, string> = {
  up: '#22C55E',
  down: '#DC2626',
  stable: '#6B7280',
  volatile: '#EAB308',
};

/** Labels for confidence levels */
export const CONFIDENCE_LABELS: Record<ConfidenceLevel, string> = {
  low: 'Faible',
  medium: 'Moyenne',
  high: 'Élevée',
  very_high: 'Très élevée',
};

/** Colors for confidence levels */
export const CONFIDENCE_COLORS: Record<ConfidenceLevel, string> = {
  low: '#DC2626',
  medium: '#EAB308',
  high: '#22C55E',
  very_high: '#15803D',
};

/** Labels for crop seasons */
export const SEASON_LABELS: Record<CropSeason, string> = {
  dry: 'Saison sèche',
  wet: 'Saison des pluies',
  both: 'Deux saisons',
  year_round: 'Toute l\'année',
};

// ============================================================================
// SECTION 9: UTILITY FUNCTIONS
// ============================================================================

/**
 * Get prediction type label.
 */
export function getPredictionTypeLabel(type: PredictionType): string {
  return PREDICTION_TYPE_LABELS[type] ?? type;
}

/**
 * Get prediction type icon.
 */
export function getPredictionTypeIcon(type: PredictionType): string {
  return PREDICTION_TYPE_ICONS[type] ?? '🔮';
}

/**
 * Get prediction type color.
 */
export function getPredictionTypeColor(type: PredictionType): string {
  return PREDICTION_TYPE_COLORS[type] ?? '#6B7280';
}

/**
 * Get horizon label.
 */
export function getHorizonLabel(horizon: PredictionHorizon): string {
  return HORIZON_LABELS[horizon] ?? horizon;
}

/**
 * Get prediction status label.
 */
export function getPredictionStatusLabel(status: PredictionStatus): string {
  return PREDICTION_STATUS_LABELS[status] ?? status;
}

/**
 * Get model label.
 */
export function getModelLabel(model: PredictionModel): string {
  return MODEL_LABELS[model] ?? model;
}

/**
 * Get trend label.
 */
export function getTrendLabel(trend: PredictionTrend): string {
  return TREND_LABELS[trend] ?? trend;
}

/**
 * Get trend color.
 */
export function getTrendColor(trend: PredictionTrend): string {
  return TREND_COLORS[trend] ?? '#6B7280';
}

/**
 * Get confidence level label.
 */
export function getConfidenceLabel(level: ConfidenceLevel): string {
  return CONFIDENCE_LABELS[level] ?? level;
}

/**
 * Get confidence level color.
 */
export function getConfidenceColor(level: ConfidenceLevel): string {
  return CONFIDENCE_COLORS[level] ?? '#6B7280';
}

/**
 * Get season label.
 */
export function getSeasonLabel(season: CropSeason): string {
  return SEASON_LABELS[season] ?? season;
}

/**
 * Determine confidence level from score.
 */
export function getConfidenceLevelFromScore(score: number): ConfidenceLevel {
  if (score >= 0.9) return 'very_high';
  if (score >= 0.75) return 'high';
  if (score >= 0.5) return 'medium';
  return 'low';
}

/**
 * Check if a prediction is still valid (not stale).
 */
export function isPredictionValid(prediction: PredictionResult): boolean {
  if (prediction.status !== 'completed') return false;
  if (prediction.expires_at) {
    return new Date(prediction.expires_at) > new Date();
  }
  return true;
}

/**
 * Check if prediction has high confidence.
 */
export function isHighConfidence(prediction: PredictionResult): boolean {
  return prediction.confidence_score >= 0.75;
}

/**
 * Calculate prediction accuracy (MAPE).
 */
export function calculateMAPE(predicted: number, actual: number): number {
  if (actual === 0) return 0;
  return Math.abs((actual - predicted) / actual) * 100;
}

/**
 * Format prediction value with unit.
 */
export function formatPredictionValue(value: number, unit: string): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return '—';
  }

  // Large numbers
  if (Math.abs(value) >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(2)} Mds ${unit}`;
  }
  if (Math.abs(value) >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)} M ${unit}`;
  }
  if (Math.abs(value) >= 1_000) {
    return `${(value / 1_000).toFixed(2)} k ${unit}`;
  }

  // Percentages
  if (unit === '%') {
    return `${value.toFixed(1)}%`;
  }

  // Currency
  if (unit.includes('FCFA') || unit.includes('CFA')) {
    return `${new Intl.NumberFormat('fr-FR').format(Math.round(value))} ${unit}`;
  }

  // Default
  return `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(value)} ${unit}`;
}

/**
 * Format confidence score as percentage.
 */
export function formatConfidence(score: number): string {
  return `${Math.round(score * 100)}%`;
}

/**
 * Format confidence interval.
 */
export function formatConfidenceInterval(interval: [number, number], unit: string): string {
  return `[${formatPredictionValue(interval[0], unit)} — ${formatPredictionValue(interval[1], unit)}]`;
}

/**
 * Build a prediction label from input.
 */
export function buildPredictionLabel(type: PredictionType, input: PredictionInput): string {
  switch (type) {
    case 'yield': {
      const yi = input as YieldPredictionInput;
      return `${yi.crop} — ${yi.region} (${yi.area_ha} ha)`;
    }
    case 'price': {
      const pi = input as PricePredictionInput;
      return `${pi.product} — ${pi.market} (${getHorizonLabel(pi.period)})`;
    }
    case 'weather': {
      const wi = input as WeatherPredictionInput;
      return `${wi.city} — ${getHorizonLabel(wi.horizon)}`;
    }
    case 'production': {
      const pri = input as ProductionPredictionInput;
      return `${pri.product} — ${getHorizonLabel(pri.horizon)}`;
    }
    default:
      return getPredictionTypeLabel(type);
  }
}

/**
 * Create an empty prediction result.
 */
export function createEmptyPredictionResult(): PredictionResult {
  const now = new Date().toISOString();
  return {
    id: '',
    type: 'yield',
    input: {} as PredictionInput,
    value: 0,
    unit: '',
    status: 'pending',
    confidence_score: 0,
    confidence_interval: [0, 0],
    trend: 'stable',
    key_factors: [],
    historical_data: [],
    prediction_data: [],
    model: 'ensemble',
    model_version: '',
    created_at: now,
  };
}

/**
 * Create an empty prediction input for a given type.
 */
export function createEmptyInput(type: PredictionType): PredictionInput {
  const now = new Date().toISOString().split('T')[0];
  switch (type) {
    case 'yield':
      return {
        crop: '',
        region: '',
        country: '',
        area_ha: 0,
        date: now,
      } as YieldPredictionInput;
    case 'price':
      return {
        product: '',
        market: '',
        country: '',
        period: '30d',
      } as PricePredictionInput;
    case 'weather':
      return {
        latitude: 0,
        longitude: 0,
        city: '',
        horizon: '7d',
      } as WeatherPredictionInput;
    case 'production':
      return {
        product: '',
        country: '',
        horizon: '1y',
      } as ProductionPredictionInput;
    default:
      return {} as PredictionInput;
  }
}

/**
 * Get the latest prediction point.
 */
export function getLatestPredictionPoint(result: PredictionResult): PredictionPoint | undefined {
  if (result.prediction_data.length === 0) return undefined;
  return result.prediction_data[result.prediction_data.length - 1];
}

/**
 * Get the peak predicted value.
 */
export function getPeakPrediction(result: PredictionResult): { value: number; date: string } | undefined {
  if (result.prediction_data.length === 0) return undefined;
  const peak = result.prediction_data.reduce((max, p) => p.value > max.value ? p : max);
  return { value: peak.value, date: peak.date };
}

/**
 * Check if prediction is within confidence interval.
 */
export function isWithinConfidenceInterval(value: number, interval: [number, number]): boolean {
  return value >= interval[0] && value <= interval[1];
}

// ============================================================================
// SECTION 10: EXPORT GROUPING
// ============================================================================

export const PredictionTypes = {
  PREDICTION_TYPE_LABELS,
  PREDICTION_TYPE_ICONS,
  PREDICTION_TYPE_COLORS,
  HORIZON_LABELS,
  PREDICTION_STATUS_LABELS,
  MODEL_LABELS,
  TREND_LABELS,
  TREND_COLORS,
  CONFIDENCE_LABELS,
  CONFIDENCE_COLORS,
  SEASON_LABELS,
  getPredictionTypeLabel,
  getPredictionTypeIcon,
  getPredictionTypeColor,
  getHorizonLabel,
  getPredictionStatusLabel,
  getModelLabel,
  getTrendLabel,
  getTrendColor,
  getConfidenceLabel,
  getConfidenceColor,
  getSeasonLabel,
  getConfidenceLevelFromScore,
  isPredictionValid,
  isHighConfidence,
  calculateMAPE,
  formatPredictionValue,
  formatConfidence,
  formatConfidenceInterval,
  buildPredictionLabel,
  createEmptyPredictionResult,
  createEmptyInput,
  getLatestPredictionPoint,
  getPeakPrediction,
  isWithinConfidenceInterval,
} as const;
