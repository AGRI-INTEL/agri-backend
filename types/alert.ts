// ============================================================================
// SECTION 1: CORE ALERT TYPES & ENUMS
// ============================================================================

import type { Sector } from './actor';

export type AlertType =
  | 'meteo'
  | 'prix'
  | 'rendement'
  | 'secheresse'
  | 'inondation'
  | 'ravageur'
  | 'maladie'
  | 'marche'
  | 'systeme'
  | 'securite'
  | 'incendie'
  | 'vent_fort'
  | 'grele'
  | 'gel'
  | 'erosion'
  | 'pollution'
  | 'conflit_foncier'
  | 'vol'
  | 'catastrophe_naturelle'
  | 'alerte_sanitaire'
  | 'quarantaine'
  | 'embargo'
  | 'subvention'
  | 'opportunite'
  | 'formation'
  | 'evenement';

export type AlertSeverity = 'info' | 'warning' | 'critical' | 'emergency';

export type AlertStatus = 'active' | 'resolved' | 'expired' | 'cancelled' | 'acknowledged';

export type AlertChannel = 'push' | 'email' | 'sms' | 'in_app' | 'webhook' | 'telegram' | 'whatsapp';

export type AlertDeliveryStatus = 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced';

// ============================================================================
// SECTION 2: ALERT CORE INTERFACE
// ============================================================================

export interface Alert {
  // Identification
  id: string;
  slug: string;
  code?: string;           // Internal reference code (e.g., "ALT-2026-001234")
  parent_id?: string;      // For grouped/threaded alerts
  thread_id?: string;      // Conversation thread

  // Content
  title: string;
  description: string;
  short_description?: string; // For notifications/push (max 140 chars)
  body?: string;             // Full HTML/markdown content
  summary?: string;          // AI-generated summary

  // Classification
  type: AlertType;
  severity: AlertSeverity;
  status: AlertStatus;
  priority?: number;         // 1-10, overrides severity for sorting

  // Targeting
  sector?: Sector;
  sectors?: Sector[];        // Multi-sector alerts
  country?: string;          // ISO 3166-1 alpha-2
  country_name?: string;
  region?: string;
  region_code?: string;
  city?: string;
  coordinates?: [number, number]; // [lng, lat]
  radius_km?: number;        // Affected area radius

  // Audience
  target_roles?: string[];   // Actor roles targeted
  target_actors?: string[];    // Specific actor IDs
  target_groups?: string[];  // User groups
  is_public: boolean;          // Visible to all or restricted
  requires_auth: boolean;

  // Source & Verification
  source: string;            // Source name/organization
  source_type: 'system' | 'ai' | 'manual' | 'sensor' | 'satellite' | 'weather_station' | 'government' | 'ngo' | 'user' | 'partner';
  source_url?: string;       // Link to source data
  source_id?: string;        // External reference ID
  verified_by?: string;      // User/system that verified
  verified_at?: string;
  confidence_score?: number; // 0-1, AI confidence
  reliability_score?: number; // 0-1, source reliability

  // Context & Data
  context?: string;          // Background information
  data_snapshot?: Record<string, unknown>; // Raw data at alert creation
  indicator_id?: string;     // Linked indicator/metric
  threshold_value?: number; // Trigger threshold
  current_value?: number;   // Current measured value
  trend?: 'up' | 'down' | 'stable';
  trend_percentage?: number;

  // Media & Attachments
  media?: AlertMedia[];
  attachments?: AlertAttachment[];
  thumbnail_url?: string;

  // Actions & Response
  recommended_actions?: AlertAction[];
  required_actions?: AlertAction[]; // Mandatory actions
  response_deadline?: string;
  escalation_path?: AlertEscalation[];

  // Related Content
  related_alerts?: string[];    // Alert IDs
  related_posts?: string[];     // Post IDs
  related_actors?: string[];      // Actor IDs
  related_predictions?: string[]; // Prediction IDs

  // Delivery & Tracking
  deliveries?: AlertDelivery[];
  read_by?: string[];         // User IDs who read
  acknowledged_by?: string[]; // User IDs who acknowledged
  responded_by?: string[];    // User IDs who responded

  // Metadata
  is_read: boolean;
  is_important: boolean;
  is_pinned: boolean;
  is_featured: boolean;
  is_template: boolean;       // Reusable alert template

  // Scheduling
  created_at: string;
  updated_at: string;
  published_at?: string;
  expires_at?: string;
  scheduled_at?: string;     // Future publication
  resolved_at?: string;
  resolved_by?: string;
  resolution_notes?: string;

  // Engagement
  view_count: number;
  click_count: number;
  share_count: number;
  reaction_count: number;
}

// ============================================================================
// SECTION 3: ALERT MEDIA & ATTACHMENTS
// ============================================================================

export interface AlertMedia {
  id: string;
  type: 'image' | 'audio' | 'video' | 'chart' | 'map' | 'document' | 'infographic';
  url: string;
  thumbnail_url?: string;
  caption?: string;
  alt_text?: string;
  mime_type?: string;
  size_bytes?: number;
  width?: number;
  height?: number;
  duration_seconds?: number;
  created_at?: string;
}

export interface AlertAttachment {
  id: string;
  name: string;
  url: string;
  mime_type: string;
  size_bytes: number;
  description?: string;
}

// ============================================================================
// SECTION 4: ALERT ACTIONS & ESCALATION
// ============================================================================

export interface AlertAction {
  id: string;
  label: string;
  description?: string;
  type: 'link' | 'form' | 'api' | 'modal' | 'download' | 'share' | 'contact' | 'navigate';
  url?: string;
  api_endpoint?: string;
  api_method?: 'GET' | 'POST' | 'PUT' | 'PATCH';
  api_payload?: Record<string, unknown>;
  icon?: string;
  color?: string;
  requires_auth: boolean;
  completed?: boolean;
  completed_at?: string;
  completed_by?: string;
}

export interface AlertEscalation {
  level: number;
  delay_minutes: number;
  channels: AlertChannel[];
  recipients: string[]; // User IDs or roles
  message_template?: string;
  triggered: boolean;
  triggered_at?: string;
}

// ============================================================================
// SECTION 5: ALERT DELIVERY & NOTIFICATIONS
// ============================================================================

export interface AlertDelivery {
  id: string;
  alert_id: string;
  user_id: string;
  channel: AlertChannel;
  status: AlertDeliveryStatus;
  sent_at?: string;
  delivered_at?: string;
  failed_at?: string;
  error_message?: string;
  retry_count: number;
  opened_at?: string;
  clicked_at?: string;
}

export interface AlertNotification {
  id: string;
  user_id: string;
  alert_id: string;
  channel: AlertChannel;
  title: string;
  body: string;
  image_url?: string;
  action_url?: string;
  is_read: boolean;
  is_clicked: boolean;
  created_at: string;
  read_at?: string;
  clicked_at?: string;
}

export interface AlertSubscription {
  id: string;
  user_id: string;
  name: string; // Custom name for this subscription
  is_active: boolean;

  // Filters
  types?: AlertType[];
  severities?: AlertSeverity[];
  sectors?: Sector[];
  countries?: string[];
  regions?: string[];
  keywords?: string[];

  // Channels
  channels: AlertChannel[];
  channel_config?: Record<AlertChannel, {
    enabled: boolean;
    quiet_hours_start?: string; // HH:MM
    quiet_hours_end?: string;
    min_severity?: AlertSeverity;
  }>;

  // Frequency
  immediate: boolean;
  digest_enabled: boolean;
  digest_frequency?: 'hourly' | 'daily' | 'weekly';
  digest_day?: number; // 0-6 for weekly
  digest_time?: string; // HH:MM

  // Limits
  max_per_day?: number;
  max_per_hour?: number;

  created_at: string;
  updated_at: string;
}

// ============================================================================
// SECTION 6: ALERT FILTERS & SEARCH
// ============================================================================

export interface AlertFilters {
  // Search
  search?: string;
  q?: string;
  keywords?: string[];

  // Classification
  type?: AlertType;
  types?: AlertType[];
  severity?: AlertSeverity;
  severities?: AlertSeverity[];
  status?: AlertStatus;
  statuses?: AlertStatus[];
  sector?: Sector;
  sectors?: Sector[];

  // Location
  country?: string;
  countries?: string[];
  region?: string;
  regions?: string[];
  city?: string;
  near_coordinates?: [number, number];
  radius_km?: number;

  // Time
  period?: '1h' | '6h' | '12h' | '24h' | '7d' | '30d' | '90d' | '1y' | 'custom';
  date_from?: string;
  date_to?: string;
  scheduled_only?: boolean;
  expired?: boolean;

  // Source
  source?: string;
  source_type?: Alert['source_type'];
  verified_only?: boolean;
  min_confidence?: number;

  // Audience
  is_public?: boolean;
  requires_auth?: boolean;
  target_roles?: string[];

  // Status
  is_read?: boolean;
  is_important?: boolean;
  is_pinned?: boolean;
  is_featured?: boolean;

  // Engagement
  min_views?: number;
  has_media?: boolean;
  has_actions?: boolean;

  // Sorting
  sort_by?: 'created_at' | 'updated_at' | 'severity' | 'priority' | 'published_at' | 'expires_at' | 'relevance' | 'views';
  sort_order?: 'asc' | 'desc';

  // Pagination
  page?: number;
  limit?: number;
  offset?: number;
}

export interface AlertListResponse {
  data: Alert[];
  meta: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
  facets?: {
    types: Record<AlertType, number>;
    severities: Record<AlertSeverity, number>;
    statuses: Record<AlertStatus, number>;
    sectors: Record<Sector, number>;
    countries: Record<string, number>;
    sources: Record<string, number>;
  };
  summary?: {
    unread_count: number;
    critical_count: number;
    emergency_count: number;
    expired_count: number;
  };
}

export interface AlertAutocompleteItem {
  id: string;
  title: string;
  type: AlertType;
  severity: AlertSeverity;
  match_type: 'title' | 'description' | 'source' | 'location';
}

// ============================================================================
// SECTION 7: ALERT TEMPLATES & RULES
// ============================================================================

export interface AlertTemplate {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;

  // Template content
  title_template: string;    // Supports variables: {{variable}}
  description_template: string;
  short_description_template?: string;
  recommended_actions_template?: string[];

  // Trigger conditions
  conditions: AlertCondition[];
  condition_logic: 'and' | 'or';

  // Default values
  default_severity: AlertSeverity;
  default_type: AlertType;
  default_sectors?: Sector[];
  default_countries?: string[];

  // Auto-actions
  auto_publish: boolean;
  auto_notify: boolean;
  notification_channels?: AlertChannel[];

  created_by: string;
  created_at: string;
  updated_at: string;
  usage_count: number;
}

export interface AlertCondition {
  id: string;
  metric: string;           // e.g., "temperature", "rainfall", "price_maize"
  operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'ne' | 'between' | 'in' | 'contains';
  value: number | string | number[] | string[];
  unit?: string;
  duration_minutes?: number; // Sustained for X minutes
  aggregation?: 'avg' | 'min' | 'max' | 'sum' | 'count' | 'last';
}

export interface AlertRule {
  id: string;
  template_id: string;
  name: string;
  is_active: boolean;

  // Overrides
  severity_override?: AlertSeverity;
  type_override?: AlertType;
  sectors_override?: Sector[];
  countries_override?: string[];
  regions_override?: string[];

  // Schedule
  active_hours_start?: string; // HH:MM
  active_hours_end?: string;
  active_days?: number[];    // 0-6, Sunday=0

  // Throttling
  cooldown_minutes: number;  // Min time between alerts of this rule
  max_per_day: number;
  max_per_hour: number;

  last_triggered_at?: string;
  trigger_count_today: number;
  trigger_count_total: number;

  created_at: string;
  updated_at: string;
}

// ============================================================================
// SECTION 8: ALERT ANALYTICS & METRICS
// ============================================================================

export interface AlertAnalytics {
  period: '24h' | '7d' | '30d' | '90d' | '1y';
  total_alerts: number;
  by_type: Record<AlertType, number>;
  by_severity: Record<AlertSeverity, number>;
  by_status: Record<AlertStatus, number>;
  by_sector: Record<Sector, number>;
  by_country: Record<string, number>;
  by_source: Record<string, number>;

  // Engagement
  total_views: number;
  total_clicks: number;
  total_shares: number;
  avg_read_time_seconds?: number;
  click_through_rate: number;

  // Delivery
  total_notifications: number;
  delivery_rate: number;
  open_rate: number;
  click_rate: number;
  bounce_rate: number;

  // Performance
  avg_time_to_resolve?: number; // minutes
  resolution_rate: number;
  false_positive_rate?: number;
}

export interface AlertMetric {
  timestamp: string;
  alert_count: number;
  unread_count: number;
  critical_count: number;
  emergency_count: number;
  avg_response_time_minutes?: number;
}

// ============================================================================
// SECTION 9: ALERT FORM DATA
// ============================================================================

export interface AlertFormData {
  // Required
  title: string;
  description: string;
  type: AlertType;
  severity: AlertSeverity;

  // Optional
  short_description?: string;
  body?: string;
  sector?: Sector;
  sectors?: Sector[];
  country?: string;
  region?: string;
  city?: string;
  coordinates?: [number, number];
  radius_km?: number;

  // Targeting
  target_roles?: string[];
  target_actors?: string[];
  target_groups?: string[];
  is_public?: boolean;

  // Source
  source?: string;
  source_type?: Alert['source_type'];
  source_url?: string;
  context?: string;

  // Media
  media?: AlertMedia[];
  attachments?: AlertAttachment[];

  // Actions
  recommended_actions?: AlertAction[];
  required_actions?: AlertAction[];
  response_deadline?: string;

  // Scheduling
  scheduled_at?: string;
  expires_at?: string;
  is_pinned?: boolean;
  is_important?: boolean;
}

// ============================================================================
// SECTION 10: ALERT DASHBOARD & UI TYPES
// ============================================================================

export interface AlertDashboardWidget {
  id: string;
  type: 'counter' | 'chart' | 'list' | 'map' | 'timeline' | 'heatmap';
  title: string;
  filters?: AlertFilters;
  config?: Record<string, unknown>;
  refresh_interval_seconds?: number;
}

export interface AlertTimelineEvent {
  id: string;
  alert_id: string;
  event_type: 'created' | 'published' | 'updated' | 'read' | 'acknowledged' | 'responded' | 'escalated' | 'resolved' | 'expired' | 'cancelled';
  user_id?: string;
  user_name?: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

export interface AlertHeatmapPoint {
  coordinates: [number, number];
  intensity: number; // 0-1
  alert_count: number;
  severity_weight: number;
}

// ============================================================================
// SECTION 11: CONSTANTS & LABELS
// ============================================================================

export const ALERT_TYPE_LABELS: Record<AlertType, string> = {
  meteo: 'Météo',
  prix: 'Prix',
  rendement: 'Rendement',
  secheresse: 'Sécheresse',
  inondation: 'Inondation',
  ravageur: 'Ravageur',
  maladie: 'Maladie',
  marche: 'Marché',
  systeme: 'Système',
  securite: 'Sécurité',
  incendie: 'Incendie',
  vent_fort: 'Vent fort',
  grele: 'Grêle',
  gel: 'Gel',
  erosion: 'Érosion',
  pollution: 'Pollution',
  conflit_foncier: 'Conflit foncier',
  vol: 'Vol',
  catastrophe_naturelle: 'Catastrophe naturelle',
  alerte_sanitaire: 'Alerte sanitaire',
  quarantaine: 'Quarantaine',
  embargo: 'Embargo',
  subvention: 'Subvention',
  opportunite: 'Opportunité',
  formation: 'Formation',
  evenement: 'Événement',
};

export const ALERT_SEVERITY_LABELS: Record<AlertSeverity, string> = {
  info: 'Info',
  warning: 'Attention',
  critical: 'Critique',
  emergency: 'Urgence',
};

export const ALERT_SEVERITY_COLORS: Record<AlertSeverity, string> = {
  info: '#3B82F6',
  warning: '#EAB308',
  critical: '#F97316',
  emergency: '#DC2626',
};

export const ALERT_SEVERITY_BG_COLORS: Record<AlertSeverity, string> = {
  info: 'bg-blue-50 text-blue-700 border-blue-200',
  warning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  critical: 'bg-orange-50 text-orange-700 border-orange-200',
  emergency: 'bg-red-50 text-red-700 border-red-200',
};

export const ALERT_STATUS_LABELS: Record<AlertStatus, string> = {
  active: 'Active',
  resolved: 'Résolue',
  expired: 'Expirée',
  cancelled: 'Annulée',
  acknowledged: 'Accusée',
};

export const ALERT_STATUS_COLORS: Record<AlertStatus, string> = {
  active: '#22C55E',
  resolved: '#6B7280',
  expired: '#9CA3AF',
  cancelled: '#DC2626',
  acknowledged: '#3B82F6',
};

export const ALERT_CHANNEL_LABELS: Record<AlertChannel, string> = {
  push: 'Notification push',
  email: 'Email',
  sms: 'SMS',
  in_app: 'In-app',
  webhook: 'Webhook',
  telegram: 'Telegram',
  whatsapp: 'WhatsApp',
};

export const ALERT_DELIVERY_STATUS_LABELS: Record<AlertDeliveryStatus, string> = {
  pending: 'En attente',
  sent: 'Envoyé',
  delivered: 'Livré',
  failed: 'Échoué',
  bounced: 'Rebondi',
};

export const ALERT_SOURCE_TYPE_LABELS: Record<Alert['source_type'], string> = {
  system: 'Système',
  ai: 'Intelligence artificielle',
  manual: 'Manuel',
  sensor: 'Capteur',
  satellite: 'Satellite',
  weather_station: 'Station météo',
  government: 'Gouvernement',
  ngo: 'ONG',
  user: 'Utilisateur',
  partner: 'Partenaire',
};

// ============================================================================
// SECTION 12: UTILITY FUNCTIONS
// ============================================================================

/**
 * Get alert type label.
 */
export function getAlertTypeLabel(type: AlertType): string {
  return ALERT_TYPE_LABELS[type] || type;
}

/**
 * Get alert severity label.
 */
export function getAlertSeverityLabel(severity: AlertSeverity): string {
  return ALERT_SEVERITY_LABELS[severity] || severity;
}

/**
 * Get alert severity color.
 */
export function getAlertSeverityColor(severity: AlertSeverity): string {
  return ALERT_SEVERITY_COLORS[severity] || '#6B7280';
}

/**
 * Get alert severity Tailwind classes.
 */
export function getAlertSeverityBadgeClass(severity: AlertSeverity): string {
  return ALERT_SEVERITY_BG_COLORS[severity] || 'bg-gray-50 text-gray-700 border-gray-200';
}

/**
 * Get alert status label.
 */
export function getAlertStatusLabel(status: AlertStatus): string {
  return ALERT_STATUS_LABELS[status] || status;
}

/**
 * Get alert status color.
 */
export function getAlertStatusColor(status: AlertStatus): string {
  return ALERT_STATUS_COLORS[status] || '#6B7280';
}

/**
 * Check if alert is expired.
 */
export function isAlertExpired(alert: Alert): boolean {
  if (!alert.expires_at) return false;
  return new Date(alert.expires_at) < new Date();
}

/**
 * Check if alert requires immediate action.
 */
export function isAlertUrgent(alert: Alert): boolean {
  return alert.severity === 'critical' || alert.severity === 'emergency';
}

/**
 * Get alert age in human-readable format.
 */
export function getAlertAge(alert: Alert): string {
  const created = new Date(alert.created_at);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays < 7) return `Il y a ${diffDays}j`;
  return created.toLocaleDateString('fr-FR');
}

/**
 * Format alert for notification (truncated).
 */
export function formatAlertNotification(alert: Alert): { title: string; body: string } {
  const title = alert.short_description || alert.title;
  const body = alert.description.length > 140
    ? alert.description.slice(0, 137) + '...'
    : alert.description;
  return { title, body };
}

/**
 * Get default action for alert type.
 */
export function getDefaultAlertAction(type: AlertType): AlertAction {
  const actions: Record<AlertType, Partial<AlertAction>> = {
    meteo: { label: 'Voir la météo', type: 'navigate', url: '/weather' },
    prix: { label: 'Voir les prix', type: 'navigate', url: '/markets' },
    rendement: { label: 'Voir les rendements', type: 'navigate', url: '/predictions' },
    secheresse: { label: 'Conseils sécheresse', type: 'link', url: '/guides/secheresse' },
    inondation: { label: 'Alertes inondation', type: 'link', url: '/guides/inondation' },
    ravageur: { label: 'Traitements', type: 'link', url: '/guides/ravageurs' },
    maladie: { label: 'Protocoles sanitaires', type: 'link', url: '/guides/maladies' },
    marche: { label: 'Voir le marché', type: 'navigate', url: '/markets' },
    systeme: { label: 'Status système', type: 'navigate', url: '/status' },
    securite: { label: 'Signaler', type: 'modal', url: '/report' },
    incendie: { label: 'Urgence', type: 'contact', url: 'tel:18' },
    vent_fort: { label: 'Précautions', type: 'link', url: '/guides/vent' },
    grele: { label: 'Assurance', type: 'link', url: '/insurance' },
    gel: { label: 'Protection cultures', type: 'link', url: '/guides/gel' },
    erosion: { label: 'Techniques conservation', type: 'link', url: '/guides/erosion' },
    pollution: { label: 'Signaler', type: 'modal', url: '/report' },
    conflit_foncier: { label: 'Médiation', type: 'modal', url: '/mediation' },
    vol: { label: 'Signaler', type: 'modal', url: '/report' },
    catastrophe_naturelle: { label: "Aide d'urgence", type: 'link', url: '/emergency' },
    alerte_sanitaire: { label: 'Protocoles', type: 'link', url: '/health' },
    quarantaine: { label: 'Restrictions', type: 'link', url: '/quarantine' },
    embargo: { label: 'Alternatives marchés', type: 'link', url: '/markets' },
    subvention: { label: 'Postuler', type: 'link', url: '/subsidies' },
    opportunite: { label: 'En savoir plus', type: 'link', url: '/opportunities' },
    formation: { label: "S'inscrire", type: 'link', url: '/training' },
    evenement: { label: 'Détails', type: 'link', url: '/events' },
  };

  return {
    id: `default-${type}`,
    label: 'Action',
    type: 'link',
    requires_auth: false,
    ...actions[type],
  } as AlertAction;
}
