// ============================================================================
// SECTION 1: USER ROLE & PERMISSION TYPES
// ============================================================================

export type UserRole =
  | 'super_admin'
  | 'admin'
  | 'moderator'
  | 'analyst'
  | 'data_scientist'
  | 'producteur'
  | 'eleveur'
  | 'pecheur'
  | 'forestier'
  | 'cooperative'
  | 'groupement'
  | 'transformateur'
  | 'commercant'
  | 'exportateur'
  | 'fournisseur_intrants'
  | 'veterinaire'
  | 'agronome'
  | 'technicien'
  | 'chercheur'
  | 'ong'
  | 'institution'
  | 'financier'
  | 'assureur'
  | 'transporteur'
  | 'stockeur'
  | 'semencier'
  | 'irrigant'
  | 'mecanisateur'
  | 'certifieur'
  | 'auditeur'
  | 'consultant'
  | 'formateur'
  | 'journaliste'
  | 'fonctionnaire'
  | 'elu'
  | 'viewer'
  | 'autre';

export type Permission =
  | 'users:read'
  | 'users:write'
  | 'users:delete'
  | 'actors:read'
  | 'actors:write'
  | 'actors:delete'
  | 'actors:verify'
  | 'predictions:read'
  | 'predictions:write'
  | 'predictions:admin'
  | 'alerts:read'
  | 'alerts:write'
  | 'alerts:admin'
  | 'markets:read'
  | 'markets:write'
  | 'maps:read'
  | 'maps:write'
  | 'files:read'
  | 'files:write'
  | 'files:delete'
  | 'posts:read'
  | 'posts:write'
  | 'posts:moderate'
  | 'comments:read'
  | 'comments:write'
  | 'comments:moderate'
  | 'analytics:read'
  | 'analytics:admin'
  | 'settings:read'
  | 'settings:write'
  | 'billing:read'
  | 'billing:write'
  | 'api:read'
  | 'api:write'
  | 'api:admin';

export interface RolePermissions {
  role: UserRole;
  permissions: Permission[];
  description: string;
}

export const ROLE_PERMISSIONS: RolePermissions[] = [
  {
    role: 'super_admin',
    permissions: ['users:read', 'users:write', 'users:delete', 'actors:read', 'actors:write', 'actors:delete', 'actors:verify', 'predictions:read', 'predictions:write', 'predictions:admin', 'alerts:read', 'alerts:write', 'alerts:admin', 'markets:read', 'markets:write', 'maps:read', 'maps:write', 'files:read', 'files:write', 'files:delete', 'posts:read', 'posts:write', 'posts:moderate', 'comments:read', 'comments:write', 'comments:moderate', 'analytics:read', 'analytics:admin', 'settings:read', 'settings:write', 'billing:read', 'billing:write', 'api:read', 'api:write', 'api:admin'],
    description: 'Accès complet à toutes les fonctionnalités',
  },
  {
    role: 'admin',
    permissions: ['users:read', 'users:write', 'actors:read', 'actors:write', 'actors:verify', 'predictions:read', 'predictions:write', 'alerts:read', 'alerts:write', 'alerts:admin', 'markets:read', 'markets:write', 'maps:read', 'maps:write', 'files:read', 'files:write', 'files:delete', 'posts:read', 'posts:write', 'posts:moderate', 'comments:read', 'comments:write', 'comments:moderate', 'analytics:read', 'analytics:admin', 'settings:read', 'settings:write', 'api:read', 'api:write'],
    description: 'Gestion de la plateforme et modération',
  },
  {
    role: 'analyst',
    permissions: ['actors:read', 'predictions:read', 'predictions:write', 'alerts:read', 'markets:read', 'maps:read', 'files:read', 'posts:read', 'comments:read', 'analytics:read', 'api:read'],
    description: 'Analyse de données et prédictions',
  },
  {
    role: 'producteur',
    permissions: ['actors:read', 'actors:write', 'predictions:read', 'alerts:read', 'markets:read', 'maps:read', 'files:read', 'files:write', 'posts:read', 'posts:write', 'comments:read', 'comments:write', 'api:read'],
    description: 'Producteur agricole',
  },
  {
    role: 'viewer',
    permissions: ['actors:read', 'predictions:read', 'alerts:read', 'markets:read', 'maps:read', 'posts:read', 'comments:read'],
    description: 'Accès lecture seule',
  },
];

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Administrateur',
  admin: 'Administrateur',
  moderator: 'Modérateur',
  analyst: 'Analyste',
  data_scientist: 'Data Scientist',
  producteur: 'Producteur',
  eleveur: 'Éleveur',
  pecheur: 'Pêcheur',
  forestier: 'Forestier',
  cooperative: 'Coopérative',
  groupement: 'Groupement',
  transformateur: 'Transformateur',
  commercant: 'Commerçant',
  exportateur: 'Exportateur',
  fournisseur_intrants: "Fournisseur d'intrants",
  veterinaire: 'Vétérinaire',
  agronome: 'Agronome',
  technicien: 'Technicien',
  chercheur: 'Chercheur',
  ong: 'ONG',
  institution: 'Institution',
  financier: 'Financier',
  assureur: 'Assureur',
  transporteur: 'Transporteur',
  stockeur: 'Stockeur',
  semencier: 'Semencier',
  irrigant: 'Irrigant',
  mecanisateur: 'Mécanisateur',
  certifieur: 'Certifieur',
  auditeur: 'Auditeur',
  consultant: 'Consultant',
  formateur: 'Formateur',
  journaliste: 'Journaliste',
  fonctionnaire: 'Fonctionnaire',
  elu: 'Élu',
  viewer: 'Lecteur',
  autre: 'Autre',
};

export const ROLE_COLORS: Record<UserRole, string> = {
  super_admin: '#DC2626',
  admin: '#F97316',
  moderator: '#EAB308',
  analyst: '#3B82F6',
  data_scientist: '#8B5CF6',
  producteur: '#16A34A',
  eleveur: '#D97706',
  pecheur: '#0891B2',
  forestier: '#92400E',
  cooperative: '#4F46E5',
  groupement: '#7C3AED',
  transformateur: '#EC4899',
  commercant: '#06B6D4',
  exportateur: '#14B8A6',
  fournisseur_intrants: '#6366F1',
  veterinaire: '#F43F5E',
  agronome: '#10B981',
  technicien: '#64748B',
  chercheur: '#A855F7',
  ong: '#F59E0B',
  institution: '#3B82F6',
  financier: '#84CC16',
  assureur: '#F97316',
  transporteur: '#6B7280',
  stockeur: '#8B5CF6',
  semencier: '#22C55E',
  irrigant: '#0EA5E9',
  mecanisateur: '#F59E0B',
  certifieur: '#10B981',
  auditeur: '#6366F1',
  consultant: '#8B5CF6',
  formateur: '#EC4899',
  journaliste: '#F43F5E',
  fonctionnaire: '#3B82F6',
  elu: '#DC2626',
  viewer: '#9CA3AF',
  autre: '#6B7280',
};

export const ROLE_ICONS: Record<UserRole, string> = {
  super_admin: '👑',
  admin: '🔧',
  moderator: '🛡️',
  analyst: '📊',
  data_scientist: '🤖',
  producteur: '🌾',
  eleveur: '🐄',
  pecheur: '🎣',
  forestier: '🌲',
  cooperative: '🤝',
  groupement: '👥',
  transformateur: '🏭',
  commercant: '🏪',
  exportateur: '🚢',
  fournisseur_intrants: '🧪',
  veterinaire: '💉',
  agronome: '🌱',
  technicien: '🔬',
  chercheur: '🔍',
  ong: '🌍',
  institution: '🏛️',
  financier: '💰',
  assureur: '🛡️',
  transporteur: '🚛',
  stockeur: '📦',
  semencier: '🌱',
  irrigant: '💧',
  mecanisateur: '⚙️',
  certifieur: '✅',
  auditeur: '📋',
  consultant: '💡',
  formateur: '🎓',
  journaliste: '📰',
  fonctionnaire: '📎',
  elu: '🗳️',
  viewer: '👁️',
  autre: '❓',
};

// ============================================================================
// SECTION 2: USER CORE INTERFACE
// ============================================================================

export type Gender = 'homme' | 'femme' | 'autre' | 'prefere_pas_dire';

export type AccountStatus = 'active' | 'inactive' | 'pending' | 'suspended' | 'banned' | 'deleted';

export type LanguageCode = 'fr' | 'en' | 'wo' | 'ha' | 'ar' | 'sw' | 'pt' | 'bm' | 'dy' | 'ff';

export type EducationLevel = 'none' | 'primary' | 'secondary' | 'tertiary' | 'postgraduate';

export interface User {
  // Identification
  id: string;
  slug: string;
  email: string;
  email_verified: boolean;
  email_verified_at?: string;
  phone?: string;
  phone_verified: boolean;
  phone_verified_at?: string;

  // Profile
  name: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  bio?: string;
  short_bio?: string;
  avatar?: string;
  cover_image?: string;
  gender?: Gender;
  birth_date?: string;
  birth_year?: number;

  // Organization
  organisation?: string;
  organisation_type?: 'cooperative' | 'groupement' | 'entreprise' | 'ong' | 'institution' | 'individuel';
  organisation_size?: 'micro' | 'small' | 'medium' | 'large';
  job_title?: string;
  department?: string;
  siret?: string;
  tax_id?: string;

  // Role & Permissions
  role: UserRole;
  permissions: Permission[];
  custom_permissions?: Permission[];
  role_assigned_at?: string;
  role_assigned_by?: string;

  // Location
  country: string;          // ISO 3166-1 alpha-2
  country_name?: string;
  region?: string;
  region_code?: string;
  city?: string;
  address?: string;
  postal_code?: string;
  timezone: string;
  coordinates?: [number, number]; // [lng, lat]

  // Preferences
  language: LanguageCode;
  languages: LanguageCode[];
  date_format?: string;
  currency?: string;
  theme?: 'light' | 'dark' | 'system';

  // Status
  status: AccountStatus;
  is_active: boolean;
  is_verified: boolean;
  verification_level: 'none' | 'email' | 'phone' | 'identity' | 'full';
  verification_documents?: string[];

  // Security
  two_factor_enabled: boolean;
  two_factor_method?: 'app' | 'sms' | 'email';
  two_factor_secret?: string;
  password_changed_at?: string;
  password_expires_at?: string;
  last_password_change?: string;
  security_questions?: { question: string; answered: boolean }[];

  // Activity
  created_at: string;
  updated_at: string;
  last_login_at?: string;
  last_activity_at?: string;
  last_ip?: string;
  last_user_agent?: string;
  login_count: number;
  failed_login_count: number;
  locked_until?: string;

  // Engagement
  reputation_score?: number;
  contribution_points?: number;
  badges: UserBadge[];
  following_count: number;
  followers_count: number;

  // Subscription
  subscription_plan?: string;
  subscription_status?: 'active' | 'trialing' | 'past_due' | 'cancelled' | 'paused';
  subscription_expires_at?: string;
  trial_ends_at?: string;

  // Metadata
  referral_code?: string;
  referred_by?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  notes?: string;

  // Réseaux sociaux (optionnel)
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
  instagram?: string;
}

export interface UserBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  earned_at: string;
  category: 'achievement' | 'contribution' | 'expertise' | 'community' | 'special';
}

export interface UserProfile {
  user: User;
  stats: UserStats;
  activities: UserActivity[];
  preferences: UserPreferences;
}

export interface UserStats {
  posts_count: number;
  comments_count: number;
  likes_received: number;
  predictions_made: number;
  alerts_triggered: number;
  actors_followed: number;
  markets_watched: number;
  files_uploaded: number;
  storage_used_bytes: number;
}

export interface UserActivity {
  id: string;
  type: 'login' | 'logout' | 'post' | 'comment' | 'prediction' | 'alert' | 'file_upload' | 'profile_update' | 'password_change' | 'api_call';
  description: string;
  metadata?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface UserPreferences {
  notifications: NotificationPreferences;
  privacy: PrivacyPreferences;
  display: DisplayPreferences;
}

export interface NotificationPreferences {
  email: {
    marketing: boolean;
    updates: boolean;
    alerts: boolean;
    digest: boolean;
    digest_frequency: 'daily' | 'weekly';
  };
  push: {
    enabled: boolean;
    alerts: boolean;
    messages: boolean;
    mentions: boolean;
  };
  sms: {
    enabled: boolean;
    alerts: boolean;
    verification: boolean;
  };
}

export interface PrivacyPreferences {
  profile_visible: 'public' | 'registered' | 'private';
  email_visible: boolean;
  phone_visible: boolean;
  location_visible: boolean;
  activity_visible: boolean;
  allow_messages: 'all' | 'followers' | 'none';
}

export interface DisplayPreferences {
  theme: 'light' | 'dark' | 'system';
  language: LanguageCode;
  date_format: string;
  timezone: string;
  compact_mode: boolean;
  animations_enabled: boolean;
}

// ============================================================================
// SECTION 3: AUTHENTICATION
// ============================================================================

export interface LoginCredentials {
  // `identifier` can be either email or username; keep `email` for backward compatibility
  identifier?: string;
  email?: string;
  password: string;
  remember_me?: boolean;
  device_name?: string;
  device_type?: 'web' | 'mobile' | 'tablet' | 'desktop';
  captcha_token?: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
  session: SessionInfo;
  requires_2fa?: boolean;
  temp_token?: string;
}

export interface RegisterData {
  // Step 1: Identity
  name: string;
  email: string;
  phone?: string;
  password: string;
  password_confirm: string;

  // Step 2: Profile
  country: string;
  region?: string;
  city?: string;
  organisation?: string;
  organisation_type?: User['organisation_type'];
  role: UserRole;

  // Step 3: Preferences
  language?: LanguageCode;
  timezone?: string;
  accept_terms: boolean;
  accept_privacy: boolean;
  newsletter?: boolean;

  // Metadata
  referral_code?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

export interface RegisterResponse {
  user: User;
  tokens: AuthTokens;
  verification_required: boolean;
  message: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: 'bearer';
  expires_in: number;
  expires_at?: string;
  scope?: string;
}

export interface TokenRefreshResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  expires_at: string;
}

export interface Session {
  user: User;
  tokens: AuthTokens;
  session_id: string;
  device_info: DeviceInfo;
  created_at: string;
  expires_at: string;
}

export interface SessionInfo {
  id: string;
  device_name: string;
  device_type: string;
  browser: string;
  os: string;
  ip_address: string;
  location: string;
  created_at: string;
  expires_at: string;
  is_current: boolean;
}

export interface DeviceInfo {
  name: string;
  type: 'web' | 'mobile' | 'tablet' | 'desktop';
  browser: string;
  browser_version: string;
  os: string;
  os_version: string;
  screen_resolution?: string;
}

// ============================================================================
// SECTION 4: TWO-FACTOR AUTHENTICATION
// ============================================================================

export interface TwoFactorSetup {
  enabled: boolean;
  method?: 'app' | 'sms' | 'email';
  qr_code?: string;
  secret?: string;
  backup_codes: string[];
  backup_codes_generated_at?: string;
  verified: boolean;
}

export interface TwoFactorVerifyRequest {
  temp_token: string;
  code: string;
  method: 'app' | 'sms' | 'email';
  trust_device?: boolean;
}

export interface TwoFactorEnableRequest {
  method: 'app' | 'sms' | 'email';
  code: string;
  password: string;
}

export interface TwoFactorDisableRequest {
  password: string;
  code?: string;
}

export interface BackupCode {
  code: string;
  used: boolean;
  used_at?: string;
}

// ============================================================================
// SECTION 5: PASSWORD & SECURITY
// ============================================================================

export interface ForgotPasswordRequest {
  email: string;
  captcha_token?: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  password_confirm: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  new_password_confirm: string;
  logout_other_sessions?: boolean;
}

export interface PasswordPolicy {
  min_length: number;
  max_length: number;
  require_uppercase: boolean;
  require_lowercase: boolean;
  require_numbers: boolean;
  require_special: boolean;
  special_chars: string;
  max_age_days?: number;
  history_count?: number;
}

export interface PasswordStrength {
  score: number; // 0-5
  label: string;
  color: string;
  percentage: number;
  feedback: string[];
}

// ============================================================================
// SECTION 6: API KEYS
// ============================================================================

export interface ApiKey {
  id: string;
  name: string;
  description?: string;
  key_prefix: string;
  scopes: string[];
  permissions: Permission[];
  created_at: string;
  created_by: string;
  last_used?: string;
  last_ip?: string;
  expires_at?: string;
  usage_count: number;
  rate_limit?: number;
  is_active: boolean;
}

export interface ApiKeyCreateRequest {
  name: string;
  description?: string;
  scopes?: string[];
  permissions?: Permission[];
  expires_in_days?: number;
  rate_limit?: number;
}

export interface ApiKeyCreateResponse {
  api_key: ApiKey;
  full_key: string; // Only shown once
}

// ============================================================================
// SECTION 7: ACTIVE SESSIONS
// ============================================================================

export interface ActiveSession {
  id: string;
  device_name: string;
  device_type: 'web' | 'mobile' | 'tablet' | 'desktop';
  browser: string;
  browser_version: string;
  os: string;
  os_version: string;
  ip: string;
  location: string;
  coordinates?: [number, number];
  created_at: string;
  last_active: string;
  expires_at: string;
  is_current: boolean;
  is_trusted: boolean;
}

export interface SessionManagement {
  sessions: ActiveSession[];
  total_count: number;
  current_session_id: string;
}

export interface RevokeSessionRequest {
  session_id: string;
  revoke_all_others?: boolean;
}

// ============================================================================
// SECTION 8: USER FILTERS & SEARCH
// ============================================================================

export interface UserFilters {
  search?: string;
  role?: UserRole;
  roles?: UserRole[];
  country?: string;
  countries?: string[];
  region?: string;
  status?: AccountStatus;
  is_verified?: boolean;
  is_active?: boolean;
  has_2fa?: boolean;
  subscription_plan?: string;
  subscription_status?: User['subscription_status'];
  created_after?: string;
  created_before?: string;
  last_login_after?: string;
  last_login_before?: string;
  sort_by?: 'name' | 'email' | 'role' | 'created_at' | 'last_login' | 'activity';
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface UserListResponse {
  data: User[];
  meta: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
  facets?: {
    roles: Record<UserRole, number>;
    countries: Record<string, number>;
    statuses: Record<AccountStatus, number>;
    verification_levels: Record<string, number>;
  };
}

// ============================================================================
// SECTION 9: USER FORM DATA
// ============================================================================

export interface UserFormData {
  // Profile
  name?: string;
  first_name?: string;
  last_name?: string;
  bio?: string;
  avatar?: File | string;
  cover_image?: File | string;
  gender?: Gender;
  birth_date?: string;

  // Contact
  email?: string;
  phone?: string;
  website?: string;

  // Organization
  organisation?: string;
  organisation_type?: User['organisation_type'];
  job_title?: string;
  department?: string;

  // Location
  country?: string;
  region?: string;
  city?: string;
  address?: string;
  timezone?: string;

  // Preferences
  language?: LanguageCode;
  theme?: 'light' | 'dark' | 'system';
  date_format?: string;
  currency?: string;

  // Privacy
  profile_visible?: PrivacyPreferences['profile_visible'];
  email_visible?: boolean;
  phone_visible?: boolean;
  allow_messages?: PrivacyPreferences['allow_messages'];
}

export interface UserAdminFormData extends UserFormData {
  role?: UserRole;
  permissions?: Permission[];
  status?: AccountStatus;
  is_verified?: boolean;
  verification_level?: User['verification_level'];
  subscription_plan?: string;
  subscription_status?: User['subscription_status'];
  notes?: string;
}

// ============================================================================
// SECTION 10: VERIFICATION & KYC
// ============================================================================

export interface VerificationRequest {
  level: 'email' | 'phone' | 'identity' | 'full';
  documents?: VerificationDocument[];
  selfie?: File;
  address_proof?: File;
}

export interface VerificationDocument {
  type: 'id_card' | 'passport' | 'driving_license' | 'business_registration' | 'tax_certificate' | 'utility_bill' | 'bank_statement';
  file: File | string;
  number?: string;
  issued_by?: string;
  issued_at?: string;
  expires_at?: string;
}

export interface VerificationStatus {
  level: User['verification_level'];
  pending_level?: User['verification_level'];
  documents: {
    type: string;
    status: 'pending' | 'approved' | 'rejected';
    reviewed_at?: string;
    reviewed_by?: string;
    rejection_reason?: string;
  }[];
  submitted_at?: string;
  completed_at?: string;
}

// ============================================================================
// SECTION 11: UTILITY FUNCTIONS
// ============================================================================

/**
 * Get role label.
 */
export function getRoleLabel(role: UserRole): string {
  return ROLE_LABELS[role] || role;
}

/**
 * Get role color.
 */
export function getRoleColor(role: UserRole): string {
  return ROLE_COLORS[role] || '#6B7280';
}

/**
 * Get role icon.
 */
export function getRoleIcon(role: UserRole): string {
  return ROLE_ICONS[role] || '👤';
}

/**
 * Check if user has permission.
 */
export function hasPermission(user: User, permission: Permission): boolean {
  return user.permissions.includes(permission) || user.custom_permissions?.includes(permission) || false;
}

/**
 * Check if user has any of the permissions.
 */
export function hasAnyPermission(user: User, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(user, p));
}

/**
 * Check if user has all permissions.
 */
export function hasAllPermissions(user: User, permissions: Permission[]): boolean {
  return permissions.every((p) => hasPermission(user, p));
}

/**
 * Get permissions for a role.
 */
export function getRolePermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS.find((r) => r.role === role)?.permissions || [];
}

/**
 * Check if user is admin.
 */
export function isAdmin(user: User): boolean {
  return ['super_admin', 'admin'].includes(user.role);
}

/**
 * Check if user is moderator.
 */
export function isModerator(user: User): boolean {
  return ['super_admin', 'admin', 'moderator'].includes(user.role);
}

/**
 * Check if user account is active.
 */
export function isUserActive(user: User): boolean {
  return user.is_active && user.status === 'active';
}

/**
 * Get user display name.
 */
export function getUserDisplayName(user: User): string {
  return user.display_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.name;
}

/**
 * Get user initials.
 */
export function getUserInitials(user: User): string {
  const name = getUserDisplayName(user);
  return name
    .split(/\s+/)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Format user location.
 */
export function getUserLocation(user: User): string {
  const parts = [user.city, user.region, user.country_name || user.country].filter(Boolean);
  return parts.join(', ');
}

/**
 * Check if 2FA is required.
 */
export function is2FARequired(user: User): boolean {
  return ['super_admin', 'admin', 'moderator'].includes(user.role) || user.two_factor_enabled;
}

/**
 * Check if user subscription is active.
 */
export function hasActiveSubscription(user: User): boolean {
  return user.subscription_status === 'active' || user.subscription_status === 'trialing';
}

/**
 * Check if user is in trial.
 */
export function isInTrial(user: User): boolean {
  return user.subscription_status === 'trialing' && !!user.trial_ends_at && new Date(user.trial_ends_at) > new Date();
}

/**
 * Get remaining trial days.
 */
export function getTrialDaysRemaining(user: User): number {
  if (!user.trial_ends_at) return 0;
  const diff = new Date(user.trial_ends_at).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

/**
 * Format account status.
 */
export function getAccountStatusLabel(status: AccountStatus): string {
  const labels: Record<AccountStatus, string> = {
    active: 'Actif',
    inactive: 'Inactif',
    pending: 'En attente',
    suspended: 'Suspendu',
    banned: 'Banni',
    deleted: 'Supprimé',
  };
  return labels[status] || status;
}

/**
 * Get account status color.
 */
export function getAccountStatusColor(status: AccountStatus): string {
  const colors: Record<AccountStatus, string> = {
    active: '#22C55E',
    inactive: '#6B7280',
    pending: '#EAB308',
    suspended: '#F97316',
    banned: '#DC2626',
    deleted: '#9CA3AF',
  };
  return colors[status] || '#6B7280';
}
