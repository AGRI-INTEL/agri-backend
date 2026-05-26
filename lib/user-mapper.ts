// ============================================================================
// USER MAPPER — Backend → Frontend avec validation, fallback, et permissions
// ============================================================================

import type { User, UserRole, Permission, AccountStatus, Gender, LanguageCode } from '@/types/auth';
import { getRolePermissions } from '@/types/auth';
import { COUNTRIES } from '@/lib/utils';
import { DEFAULT_TIMEZONE } from '@/lib/constants';

// ── Types pour le backend (à adapter selon votre API) ──
export interface BackendUserResponse {
  id?: string | number;
  username?: string;
  email?: string;
  is_verified?: boolean;
  phone_number?: string;
  phone_verified?: boolean;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  organization?: string;
  organisation_type?: string;
  job_title?: string;
  department?: string;
  role?: string;
  permissions?: string[];
  custom_permissions?: string[];
  country?: string;
  region?: string;
  city?: string;
  address?: string;
  timezone?: string;
  language?: string;
  gender?: string;
  birth_date?: string;
  birth_year?: number;
  bio?: string;
  short_bio?: string;
  status?: string | boolean;
  is_active?: boolean;
  is_verified_email?: boolean;
  is_verified_phone?: boolean;
  verification_level?: string;
  verification_documents?: string[];
  two_factor_enabled?: boolean;
  two_factor_method?: string;
  created_at?: string | number;
  updated_at?: string | number;
  last_login?: string | number;
  last_activity_at?: string | number;
  login_count?: number;
  failed_login_count?: number;
  locked_until?: string;
  reputation_score?: number;
  contribution_points?: number;
  badges?: Array<{
    id: string;
    name: string;
    description?: string;
    icon?: string;
    color?: string;
    earned_at?: string;
    category?: string;
  }>;
  following_count?: number;
  followers_count?: number;
  display_name?: string;
  siret?: string;
  tax_id?: string;
  referral_code?: string;
  referred_by?: string;
  subscription_plan?: string;
  subscription_status?: string;
  subscription_expires_at?: string;
  trial_ends_at?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  notes?: string;
  coordinates?: [number, number] | { lat: number; lng: number } | { latitude: number; longitude: number };
  cover_image?: string;
  website?: string;
  social?: Record<string, string>;
  [key: string]: unknown;
}

// ── Erreurs de mapping ──
export interface UserMappingError {
  field: string;
  expected: string;
  received: unknown;
  fallback: unknown;
}

export interface UserMappingResult {
  user: User;
  errors: UserMappingError[];
  warnings: string[];
}

// ============================================================================
// HELPERS DE VALIDATION
// ============================================================================

/**
 * Vérifie si une valeur est une string non vide
 */
function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Normalise une date (string ISO, timestamp, Date)
 */
function normalizeDate(value: unknown): string | undefined {
  if (!value) return undefined;
  
  // Déjà une date valide
  if (value instanceof Date) return value.toISOString();
  
  // Timestamp (nombre)
  if (typeof value === 'number') {
    const date = new Date(value);
    return isNaN(date.getTime()) ? undefined : date.toISOString();
  }
  
  // String ISO
  if (typeof value === 'string') {
    const date = new Date(value);
    return isNaN(date.getTime()) ? undefined : date.toISOString();
  }
  
  return undefined;
}

/**
 * Extrait le code pays ISO (2 caractères) avec validation
 */
function extractCountryCode(value: unknown): string {
  if (!isNonEmptyString(value)) return 'SN';
  
  const cleaned = value.trim().toUpperCase();
  
  // Déjà un code ISO (2 chars)
  if (cleaned.length === 2 && /^[A-Z]{2}$/.test(cleaned)) {
    const exists = COUNTRIES.some(c => c.code === cleaned);
    return exists ? cleaned : 'SN';
  }
  
  // Nom de pays → code ISO
  const found = COUNTRIES.find(c => 
    c.name.toLowerCase() === cleaned.toLowerCase()
  );
  if (found) return found.code;
  
  // Recherche partielle
  const partial = COUNTRIES.find(c =>
    c.name.toLowerCase().includes(cleaned.toLowerCase())
  );
  if (partial) return partial.code;
  
  return 'SN';
}

/**
 * Valide et normalise un rôle utilisateur
 */
function normalizeRole(value: unknown): { role: UserRole; valid: boolean } {
  const raw = String(value).toLowerCase().trim();
  
  // Vérifier dans les rôles définis
  const validRoles: UserRole[] = [
    'super_admin', 'admin', 'moderator', 'analyst', 'data_scientist',
    'producteur', 'eleveur', 'pecheur', 'forestier', 'cooperative',
    'groupement', 'transformateur', 'commercant', 'exportateur',
    'fournisseur_intrants', 'veterinaire', 'agronome', 'technicien',
    'chercheur', 'ong', 'institution', 'financier', 'assureur',
    'transporteur', 'stockeur', 'semencier', 'irrigant', 'mecanisateur',
    'certifieur', 'auditeur', 'consultant', 'formateur', 'journaliste',
    'fonctionnaire', 'elu', 'viewer', 'autre'
  ];
  
  if (validRoles.includes(raw as UserRole)) {
    return { role: raw as UserRole, valid: true };
  }
  
  // Mapping de fallback pour les rôles backend alternatifs
  const roleMapping: Record<string, UserRole> = {
    'user': 'viewer',
    'member': 'viewer',
    'staff': 'admin',
    'operator': 'technicien',
    'farmer': 'producteur',
    'fisherman': 'pecheur',
    'breeder': 'eleveur',
    'forester': 'forestier',
    'supplier': 'fournisseur_intrants',
    'buyer': 'commercant',
    'seller': 'commercant',
    'researcher': 'chercheur',
    'ngo': 'ong',
    'government': 'institution',
    'bank': 'financier',
    'insurance': 'assureur',
    'trader': 'exportateur',
    'seed_company': 'semencier',
    'irrigation_company': 'irrigant',
    'mechanization': 'mecanisateur',
    'certification': 'certifieur',
    'audit': 'auditeur',
    'training': 'formateur',
    'press': 'journaliste',
    'civil_servant': 'fonctionnaire',
    'elected': 'elu',
  };
  
  const mapped = roleMapping[raw];
  if (mapped) return { role: mapped, valid: true };
  
  return { role: 'viewer', valid: false };
}

/**
 * Normalise le niveau de vérification
 */
function normalizeVerificationLevel(
  isVerified: boolean,
  isEmailVerified?: boolean,
  isPhoneVerified?: boolean,
  level?: string
): User['verification_level'] {
  if (!isVerified) return 'none';
  
  // Si le backend fournit déjà un niveau
  if (isNonEmptyString(level)) {
    const validLevels: User['verification_level'][] = ['none', 'email', 'phone', 'identity', 'full'];
    if (validLevels.includes(level as User['verification_level'])) {
      return level as User['verification_level'];
    }
  }
  
  // Déduction depuis les champs booléens
  if (isPhoneVerified) return 'phone';
  if (isEmailVerified) return 'email';
  
  return 'email'; // Fallback si is_verified = true
}

/**
 * Normalise le statut du compte
 */
function normalizeStatus(value: unknown, isActive?: boolean): AccountStatus {
  if (typeof isActive === 'boolean') {
    return isActive ? 'active' : 'inactive';
  }
  
  if (isNonEmptyString(value)) {
    const validStatuses: AccountStatus[] = ['active', 'inactive', 'pending', 'suspended', 'banned', 'deleted'];
    const normalized = value.toLowerCase() as AccountStatus;
    if (validStatuses.includes(normalized)) return normalized;
  }
  
  return 'pending';
}

/**
 * Normalise le genre
 */
function normalizeGender(value: unknown): Gender | undefined {
  if (!isNonEmptyString(value)) return undefined;
  
  const normalized = value.toLowerCase();
  const validGenders: Gender[] = ['homme', 'femme', 'autre', 'prefere_pas_dire'];
  
  if (validGenders.includes(normalized as Gender)) return normalized as Gender;
  
  if (normalized === 'unknown') return undefined;

  // Mapping alternatif
  const genderMap: Record<string, Gender> = {
    'male': 'homme',
    'm': 'homme',
    'female': 'femme',
    'f': 'femme',
    'other': 'autre',
    'prefer_not_to_say': 'prefere_pas_dire',
  };
  
  return genderMap[normalized];
}

/**
 * Normalise la langue
 */
function normalizeLanguage(value: unknown): LanguageCode {
  if (!isNonEmptyString(value)) return 'fr';
  
  const normalized = value.toLowerCase().slice(0, 2);
  const validLanguages: LanguageCode[] = ['fr', 'en', 'wo', 'ha', 'ar', 'sw', 'pt', 'bm', 'dy', 'ff'];
  
  if (validLanguages.includes(normalized as LanguageCode)) {
    return normalized as LanguageCode;
  }
  
  // Mapping alternatif
  const langMap: Record<string, LanguageCode> = {
    'french': 'fr',
    'english': 'en',
    'wolof': 'wo',
    'hausa': 'ha',
    'arabic': 'ar',
    'swahili': 'sw',
    'portuguese': 'pt',
    'bambara': 'bm',
    'dyula': 'dy',
    'fulfulde': 'ff',
  };
  
  return langMap[normalized] || 'fr';
}

/**
 * Normalise les coordonnées
 */
function normalizeCoordinates(value: unknown): [number, number] | undefined {
  if (!value) return undefined;
  
  // Tuple [lng, lat]
  if (Array.isArray(value) && value.length === 2) {
    const [lng, lat] = value;
    if (typeof lng === 'number' && typeof lat === 'number') {
      if (lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90) {
        return [lng, lat];
      }
    }
  }
  
  // Objet {lat, lng} ou {latitude, longitude}
  if (typeof value === 'object' && value !== null) {
    const obj = value as Record<string, unknown>;
    const lng = (obj.lng ?? obj.longitude ?? obj.lon) as number;
    const lat = (obj.lat ?? obj.latitude) as number;
    if (typeof lng === 'number' && typeof lat === 'number') {
      if (lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90) {
        return [lng, lat];
      }
    }
  }
  
  return undefined;
}

/**
 * Mappe les badges du backend
 */
function mapBadges(rawBadges: unknown[]): User['badges'] {
  if (!Array.isArray(rawBadges)) return [];
  
  return rawBadges
    .filter((b): b is Record<string, unknown> => typeof b === 'object' && b !== null)
    .map((badge) => ({
      id: String(badge.id || `badge-${Math.random().toString(36).slice(2)}`),
      name: String(badge.name || 'Badge'),
      description: isNonEmptyString(badge.description) ? badge.description : '',
      icon: isNonEmptyString(badge.icon) ? badge.icon : '🏅',
      color: isNonEmptyString(badge.color) ? badge.color : '#6B7280',
      earned_at: normalizeDate(badge.earned_at) || new Date().toISOString(),
      category: (badge.category as User['badges'][number]['category']) || 'achievement',
    }))
    .filter(b => b.name && b.name !== 'Badge');
}

/**
 * Résout les permissions depuis le rôle + permissions custom
 */
function resolvePermissions(
  role: UserRole,
  backendPermissions?: string[],
  backendCustomPermissions?: string[]
): { permissions: Permission[]; customPermissions: Permission[] } {
  // Permissions de base selon le rôle
  const rolePerms = getRolePermissions(role);
  
  // Permissions additionnelles du backend
  const extraPerms = (backendPermissions || [])
    .filter((p): p is Permission => isNonEmptyString(p) && p.includes(':'));
  
  // Custom permissions
  const customPerms = (backendCustomPermissions || [])
    .filter((p): p is Permission => isNonEmptyString(p) && p.includes(':'));
  
  // Merge sans doublons
  const allPerms = [...new Set([...rolePerms, ...extraPerms])];
  
  return {
    permissions: allPerms,
    customPermissions: customPerms,
  };
}

// ============================================================================
// MAPPER PRINCIPAL
// ============================================================================

/**
 * Map un utilisateur backend vers le format frontend.
 * Version simple (sans métadonnées de mapping).
 */
export function mapBackendUser(raw: Record<string, unknown>): User {
  const result = mapBackendUserDetailed(raw);
  return result.user;
}

/**
 * Map avec reporting d'erreurs et warnings.
 * Utile pour le debug et la validation de l'API.
 */
export function mapBackendUserDetailed(raw: Record<string, unknown>): UserMappingResult {
  const errors: UserMappingError[] = [];
  const warnings: string[] = [];
  const now = new Date().toISOString();
  
  // ── Rôle (avec validation) ──
  const roleResult = normalizeRole(raw.role);
  if (!roleResult.valid) {
    warnings.push(`Rôle inconnu "${raw.role}", fallback sur "viewer"`);
  }
  const role = roleResult.role;
  
  // ── Permissions ──
  const { permissions, customPermissions } = resolvePermissions(
    role,
    Array.isArray(raw.permissions) ? raw.permissions as string[] : undefined,
    Array.isArray(raw.custom_permissions) ? raw.custom_permissions as string[] : undefined
  );
  
  // ── Nom (avec fallback chainé) ──
  let name: string;
  if (isNonEmptyString(raw.full_name)) {
    name = raw.full_name;
  } else if (isNonEmptyString(raw.display_name)) {
    name = raw.display_name;
  } else if (isNonEmptyString(raw.username)) {
    name = raw.username;
  } else if (isNonEmptyString(raw.first_name) || isNonEmptyString(raw.last_name)) {
    name = `${raw.first_name || ''} ${raw.last_name || ''}`.trim();
  } else {
    name = 'Utilisateur';
    warnings.push('Aucun nom trouvé, fallback sur "Utilisateur"');
  }
  
  // ── Slug ──
  const slug = isNonEmptyString(raw.username) 
    ? raw.username 
    : isNonEmptyString(raw.id) 
      ? String(raw.id) 
      : `user-${Date.now()}`;
  
  // ── Pays ──
  const country = extractCountryCode(raw.country);
  if (raw.country && country !== String(raw.country).toUpperCase()) {
    warnings.push(`Pays "${raw.country}" normalisé vers "${country}"`);
  }
  
  // ── Statut ──
  const status = normalizeStatus(raw.status, raw.is_active as boolean | undefined);
  
  // ── Vérification ──
  const isVerified = Boolean(raw.is_verified);
  const verificationLevel = normalizeVerificationLevel(
    isVerified,
    raw.is_verified_email as boolean | undefined,
    raw.phone_verified as boolean | undefined,
    raw.verification_level as string | undefined
  );
  
  // ── Construction de l'utilisateur ──
  const user: User = {
    // Identification
    id: String(raw.id || `temp-${Date.now()}`),
    slug,
    email: isNonEmptyString(raw.email) ? raw.email : '',
    email_verified: Boolean(raw.is_verified_email ?? raw.is_verified),
    email_verified_at: normalizeDate(raw.email_verified_at),
    
    // Contact
    phone: isNonEmptyString(raw.phone_number) ? raw.phone_number : undefined,
    phone_verified: Boolean(raw.phone_verified),
    phone_verified_at: normalizeDate(raw.phone_verified_at),
    
    // Profil
    name,
    first_name: isNonEmptyString(raw.first_name) ? raw.first_name : undefined,
    last_name: isNonEmptyString(raw.last_name) ? raw.last_name : undefined,
    display_name: isNonEmptyString(raw.display_name) ? raw.display_name : undefined,
    bio: isNonEmptyString(raw.bio) ? raw.bio : undefined,
    short_bio: isNonEmptyString(raw.short_bio) ? raw.short_bio : undefined,
    avatar: isNonEmptyString(raw.avatar_url) ? raw.avatar_url : undefined,
    cover_image: isNonEmptyString(raw.cover_image) ? raw.cover_image : undefined,
    gender: normalizeGender(raw.gender),
    birth_date: normalizeDate(raw.birth_date),
    birth_year: typeof raw.birth_year === 'number' ? raw.birth_year : undefined,
    
    // Organisation
    organisation: isNonEmptyString(raw.organization) ? raw.organization : undefined,
    organisation_type: (raw.organisation_type as User['organisation_type']) || undefined,
    organisation_size: (raw.organisation_size as User['organisation_size']) || undefined,
    job_title: isNonEmptyString(raw.job_title) ? raw.job_title : undefined,
    department: isNonEmptyString(raw.department) ? raw.department : undefined,
    siret: isNonEmptyString(raw.siret) ? raw.siret : undefined,
    tax_id: isNonEmptyString(raw.tax_id) ? raw.tax_id : undefined,
    
    // Rôle & Permissions
    role,
    permissions,
    custom_permissions: customPermissions.length > 0 ? customPermissions : undefined,
    role_assigned_at: normalizeDate(raw.role_assigned_at),
    role_assigned_by: isNonEmptyString(raw.role_assigned_by) ? raw.role_assigned_by : undefined,
    
    // Localisation
    country,
    country_name: COUNTRIES.find(c => c.code === country)?.name,
    region: isNonEmptyString(raw.region) ? raw.region : undefined,
    region_code: isNonEmptyString(raw.region_code) ? raw.region_code : undefined,
    city: isNonEmptyString(raw.city) ? raw.city : undefined,
    address: isNonEmptyString(raw.address) ? raw.address : undefined,
    postal_code: isNonEmptyString(raw.postal_code) ? raw.postal_code : undefined,
    timezone: isNonEmptyString(raw.timezone) ? raw.timezone : DEFAULT_TIMEZONE,
    coordinates: normalizeCoordinates(raw.coordinates),
    
    // Préférences
    language: normalizeLanguage(raw.language),
    languages: [normalizeLanguage(raw.language)],
    date_format: isNonEmptyString(raw.date_format) ? raw.date_format : 'dd/MM/yyyy',
    currency: isNonEmptyString(raw.currency) ? raw.currency : undefined,
    theme: (raw.theme as User['theme']) || 'system',
    
    // Statut
    status,
    is_active: status === 'active',
    is_verified: isVerified,
    verification_level: verificationLevel,
    verification_documents: Array.isArray(raw.verification_documents) 
      ? raw.verification_documents.filter(isNonEmptyString) 
      : undefined,
    
    // Sécurité
    two_factor_enabled: Boolean(raw.two_factor_enabled),
    two_factor_method: (raw.two_factor_method as User['two_factor_method']) || undefined,
    two_factor_secret: undefined, // Jamais exposé au frontend
    password_changed_at: normalizeDate(raw.password_changed_at),
    password_expires_at: normalizeDate(raw.password_expires_at),
    last_password_change: normalizeDate(raw.last_password_change),
    security_questions: Array.isArray(raw.security_questions)
      ? raw.security_questions.map((q: unknown) => ({
          question: String((q as Record<string, unknown>)?.question || ''),
          answered: Boolean((q as Record<string, unknown>)?.answered),
        }))
      : undefined,
    
    // Activité
    created_at: normalizeDate(raw.created_at) || now,
    updated_at: normalizeDate(raw.updated_at) || now,
    last_login_at: normalizeDate(raw.last_login),
    last_activity_at: normalizeDate(raw.last_activity_at),
    last_ip: isNonEmptyString(raw.last_ip) ? raw.last_ip : undefined,
    last_user_agent: isNonEmptyString(raw.last_user_agent) ? raw.last_user_agent : undefined,
    login_count: typeof raw.login_count === 'number' ? raw.login_count : 0,
    failed_login_count: typeof raw.failed_login_count === 'number' ? raw.failed_login_count : 0,
    locked_until: normalizeDate(raw.locked_until),
    
    // Engagement
    reputation_score: typeof raw.reputation_score === 'number' ? raw.reputation_score : undefined,
    contribution_points: typeof raw.contribution_points === 'number' ? raw.contribution_points : undefined,
    badges: mapBadges(Array.isArray(raw.badges) ? raw.badges : []),
    following_count: typeof raw.following_count === 'number' ? raw.following_count : 0,
    followers_count: typeof raw.followers_count === 'number' ? raw.followers_count : 0,
    
    // Abonnement
    subscription_plan: isNonEmptyString(raw.subscription_plan) ? raw.subscription_plan : undefined,
    subscription_status: (raw.subscription_status as User['subscription_status']) || undefined,
    subscription_expires_at: normalizeDate(raw.subscription_expires_at),
    trial_ends_at: normalizeDate(raw.trial_ends_at),
    
    // Métadonnées
    referral_code: isNonEmptyString(raw.referral_code) ? raw.referral_code : undefined,
    referred_by: isNonEmptyString(raw.referred_by) ? raw.referred_by : undefined,
    utm_source: isNonEmptyString(raw.utm_source) ? raw.utm_source : undefined,
    utm_medium: isNonEmptyString(raw.utm_medium) ? raw.utm_medium : undefined,
    utm_campaign: isNonEmptyString(raw.utm_campaign) ? raw.utm_campaign : undefined,
    notes: isNonEmptyString(raw.notes) ? raw.notes : undefined,
    
    // Social (extension)
    facebook: isNonEmptyString((raw.social as Record<string, string>)?.facebook) 
      ? (raw.social as Record<string, string>).facebook 
      : undefined,
    twitter: isNonEmptyString((raw.social as Record<string, string>)?.twitter) 
      ? (raw.social as Record<string, string>).twitter 
      : undefined,
    linkedin: isNonEmptyString((raw.social as Record<string, string>)?.linkedin) 
      ? (raw.social as Record<string, string>).linkedin 
      : undefined,
    youtube: isNonEmptyString((raw.social as Record<string, string>)?.youtube) 
      ? (raw.social as Record<string, string>).youtube 
      : undefined,
    instagram: isNonEmptyString((raw.social as Record<string, string>)?.instagram) 
      ? (raw.social as Record<string, string>).instagram 
      : undefined,
  };
  
  return { user, errors, warnings };
}

// ============================================================================
// UTILITAIRES
// ============================================================================

/**
 * Map un tableau d'utilisateurs backend
 */
export function mapBackendUsers(rawUsers: unknown[]): User[] {
  if (!Array.isArray(rawUsers)) return [];
  
  return rawUsers
    .filter((u): u is Record<string, unknown> => typeof u === 'object' && u !== null)
    .map(mapBackendUser);
}

/**
 * Map avec reporting (pour debug API)
 */
export function mapBackendUsersDetailed(rawUsers: unknown[]): {
  users: User[];
  totalErrors: number;
  totalWarnings: number;
  allWarnings: string[];
} {
  if (!Array.isArray(rawUsers)) {
    return { users: [], totalErrors: 0, totalWarnings: 0, allWarnings: [] };
  }
  
  const results = rawUsers
    .filter((u): u is Record<string, unknown> => typeof u === 'object' && u !== null)
    .map(mapBackendUserDetailed);
  
  const users = results.map(r => r.user);
  const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);
  const allWarnings = results.flatMap(r => r.warnings);
  const totalWarnings = allWarnings.length;
  
  return { users, totalErrors, totalWarnings, allWarnings };
}

/**
 * Vérifie rapidement si un objet ressemble à un User backend
 */
export function isBackendUserLike(obj: unknown): obj is Record<string, unknown> {
  if (typeof obj !== 'object' || obj === null) return false;
  const raw = obj as Record<string, unknown>;
  return 'id' in raw && ('email' in raw || 'username' in raw);
}