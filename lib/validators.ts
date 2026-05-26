import { z } from 'zod';

// ============================================================================
// SECTION 1: AUTHENTICATION SCHEMAS
// ============================================================================

// ─────────────────────────────────────────────────────────────────────────────
// Login
// ─────────────────────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  identifier: z.string().min(1, 'Identifiant requis'),
  password: z.string().min(1, 'Mot de passe requis').min(8, 'Mot de passe trop court (min 8 caractères)'),
  remember_me: z.boolean().optional().default(false),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Registration - Step 1: Identity
// ─────────────────────────────────────────────────────────────────────────────
export const registerStep1Schema = z.object({
  name: z.string()
    .min(2, 'Nom trop court (min 2 caractères)')
    .max(100, 'Nom trop long (max 100 caractères)')
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Nom invalide (caractères spéciaux non autorisés)'),
  email: z.string()
    .min(1, 'Email requis')
    .email('Email invalide')
    .toLowerCase(),
  phone: z.string()
    .min(8, 'Numéro trop court (min 8 chiffres)')
    .max(20, 'Numéro trop long (max 20 chiffres)')
    .regex(/^\+?[\d\s-]+$/, 'Format invalide (ex: +221 77 123 45 67)'),
  password: z.string()
    .min(8, 'Minimum 8 caractères')
    .max(128, 'Maximum 128 caractères')
    .regex(/[A-Z]/, 'Au moins une majuscule')
    .regex(/[a-z]/, 'Au moins une minuscule')
    .regex(/[0-9]/, 'Au moins un chiffre')
    .regex(/[^A-Za-z0-9]/, 'Au moins un caractère spécial'),
  password_confirm: z.string().min(1, 'Confirmation requise'),
}).refine((d) => d.password === d.password_confirm, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['password_confirm'],
});

// ─────────────────────────────────────────────────────────────────────────────
// Registration - Step 2: Organization
// ─────────────────────────────────────────────────────────────────────────────
export const registerStep2Schema = z.object({
  country: z.string()
    .min(2, 'Pays requis')
    .max(2, 'Code pays ISO à 2 caractères')
    .toUpperCase(),
  organisation: z.string()
    .min(2, "Nom d'organisation trop court")
    .max(200, "Nom d'organisation trop long")
    .optional()
    .or(z.literal('')),
  role: z.enum([
    'producteur',
    'eleveur',
    'pecheur',
    'forestier',
    'cooperative',
    'ong',
    'institution',
    'chercheur',
    'commercant',
    'autre',
  ], {
    errorMap: () => ({ message: 'Rôle invalide' }),
  }),
  sector: z.enum(['vegetal', 'animal', 'halieutique', 'forestier', 'minier', 'industriel'])
    .optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
// Registration - Step 3: Terms
// ─────────────────────────────────────────────────────────────────────────────
export const registerStep3Schema = z.object({
  accept_terms: z.boolean().refine((v) => v === true, {
    message: "Vous devez accepter les conditions générales d'utilisation",
  }),
  accept_privacy: z.boolean().refine((v) => v === true, {
    message: 'Vous devez accepter la politique de confidentialité',
  }),
  newsletter: z.boolean().optional().default(false),
});

// ─────────────────────────────────────────────────────────────────────────────
// Forgot Password
// ─────────────────────────────────────────────────────────────────────────────
export const forgotPasswordSchema = z.object({
  email: z.string()
    .min(1, 'Email requis')
    .email('Email invalide')
    .toLowerCase(),
});

// ─────────────────────────────────────────────────────────────────────────────
// Reset Password
// ─────────────────────────────────────────────────────────────────────────────
export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token requis'),
  password: z.string()
    .min(8, 'Minimum 8 caractères')
    .max(128, 'Maximum 128 caractères')
    .regex(/[A-Z]/, 'Au moins une majuscule')
    .regex(/[a-z]/, 'Au moins une minuscule')
    .regex(/[0-9]/, 'Au moins un chiffre')
    .regex(/[^A-Za-z0-9]/, 'Au moins un caractère spécial'),
  password_confirm: z.string().min(1, 'Confirmation requise'),
}).refine((d) => d.password === d.password_confirm, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['password_confirm'],
});

// ─────────────────────────────────────────────────────────────────────────────
// Change Password (for logged-in users)
// ─────────────────────────────────────────────────────────────────────────────
export const changePasswordSchema = z.object({
  current_password: z.string().min(1, 'Mot de passe actuel requis'),
  new_password: z.string()
    .min(8, 'Minimum 8 caractères')
    .max(128, 'Maximum 128 caractères')
    .regex(/[A-Z]/, 'Au moins une majuscule')
    .regex(/[a-z]/, 'Au moins une minuscule')
    .regex(/[0-9]/, 'Au moins un chiffre')
    .regex(/[^A-Za-z0-9]/, 'Au moins un caractère spécial'),
  new_password_confirm: z.string().min(1, 'Confirmation requise'),
}).refine((d) => d.new_password === d.new_password_confirm, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['new_password_confirm'],
}).refine((d) => d.current_password !== d.new_password, {
  message: "Le nouveau mot de passe doit être différent de l'ancien",
  path: ['new_password'],
});

// ============================================================================
// SECTION 2: PROFILE & USER SCHEMAS
// ============================================================================

// ─────────────────────────────────────────────────────────────────────────────
// Profile Update
// ─────────────────────────────────────────────────────────────────────────────
export const profileSchema = z.object({
  name: z.string()
    .min(2, 'Nom trop court (min 2 caractères)')
    .max(100, 'Nom trop long (max 100 caractères)')
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Nom invalide'),
  email: z.string()
    .min(1, 'Email requis')
    .email('Email invalide')
    .toLowerCase(),
  phone: z.string()
    .regex(/^\+?[\d\s-]{8,20}$/, 'Format invalide')
    .optional()
    .or(z.literal('')),
  bio: z.string()
    .max(500, 'Bio trop longue (max 500 caractères)')
    .optional()
    .or(z.literal('')),
  organisation: z.string()
    .max(200, 'Trop long')
    .optional()
    .or(z.literal('')),
  country: z.string()
    .length(2, 'Code pays ISO à 2 caractères')
    .toUpperCase(),
  language: z.enum(['fr', 'en', 'wo', 'ha', 'ar', 'sw', 'pt'], {
    errorMap: () => ({ message: 'Langue non supportée' }),
  }).default('fr'),
  timezone: z.string()
    .regex(/^[A-Za-z_]+\/[A-Za-z_]+$/, 'Format invalide (ex: Africa/Dakar)')
    .default('Africa/Dakar'),
  avatar_url: z.string().url('URL invalide').optional().or(z.literal('')),
  website: z.string().url('URL invalide').optional().or(z.literal('')),
});

// ─────────────────────────────────────────────────────────────────────────────
// User Preferences
// ─────────────────────────────────────────────────────────────────────────────
export const preferencesSchema = z.object({
  email_notifications: z.boolean().default(true),
  sms_notifications: z.boolean().default(false),
  push_notifications: z.boolean().default(true),
  marketing_emails: z.boolean().default(false),
  language: z.enum(['fr', 'en', 'wo', 'ha', 'ar', 'sw', 'pt']).default('fr'),
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  currency: z.enum(['XOF', 'XAF', 'NGN', 'ZAR', 'MAD', 'EGP', 'EUR', 'USD']).default('XOF'),
  date_format: z.enum(['dd/MM/yyyy', 'MM/dd/yyyy', 'yyyy-MM-dd']).default('dd/MM/yyyy'),
});

// ============================================================================
// SECTION 3: ACTOR / STAKEHOLDER SCHEMAS
// ============================================================================

export const actorSchema = z.object({
  name: z.string()
    .min(2, 'Nom requis (min 2 caractères)')
    .max(200, 'Nom trop long (max 200 caractères)')
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Nom invalide'),
  role: z.enum([
    'producteur',
    'transformateur',
    'exportateur',
    'cooperative',
    'ong',
    'institution',
    'acheteur',
    'fournisseur',
    'autre',
  ], {
    errorMap: () => ({ message: 'Rôle invalide' }),
  }),
  sector: z.enum(['vegetal', 'animal', 'halieutique', 'forestier', 'minier', 'industriel'], {
    errorMap: () => ({ message: 'Secteur invalide' }),
  }),
  country: z.string()
    .length(2, 'Code pays ISO à 2 caractères')
    .toUpperCase(),
  region: z.string()
    .min(1, 'Région requise')
    .max(100, 'Région trop longue'),
  city: z.string()
    .max(100, 'Ville trop longue')
    .optional()
    .or(z.literal('')),
  phone: z.string()
    .regex(/^\+?[\d\s-]{8,20}$/, 'Format invalide')
    .optional()
    .or(z.literal('')),
  email: z.string()
    .email('Email invalide')
    .optional()
    .or(z.literal('')),
  organisation: z.string()
    .max(200, 'Trop long')
    .optional()
    .or(z.literal('')),
  bio: z.string()
    .max(1000, 'Bio trop longue (max 1000 caractères)')
    .optional()
    .or(z.literal('')),
  tags: z.array(z.string().min(1).max(50)).max(10, 'Maximum 10 tags').optional().default([]),
  coordinates: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }).optional(),
  is_active: z.boolean().default(true),
});

// ============================================================================
// SECTION 4: POST / CONTENT SCHEMAS
// ============================================================================

export const postSchema = z.object({
  content: z.string()
    .min(1, 'Contenu requis')
    .max(5000, 'Contenu trop long (max 5000 caractères)'),
  group_id: z.string().min(1, 'Groupe requis'),
  media_urls: z.array(z.string().url()).max(5, 'Maximum 5 médias').optional().default([]),
  tags: z.array(z.string().min(1).max(30)).max(10).optional().default([]),
  is_public: z.boolean().default(true),
});

export const commentSchema = z.object({
  post_id: z.string().min(1, 'Post requis'),
  content: z.string()
    .min(1, 'Commentaire requis')
    .max(1000, 'Trop long (max 1000 caractères)'),
  parent_id: z.string().optional(),
});

export const reactionSchema = z.object({
  post_id: z.string().min(1, 'Post requis'),
  type: z.enum(['like', 'love', 'insightful', 'sad', 'angry'], {
    errorMap: () => ({ message: 'Réaction invalide' }),
  }),
});

// ============================================================================
// SECTION 5: PREDICTION SCHEMAS
// ============================================================================

// ─────────────────────────────────────────────────────────────────────────────
// Yield Prediction
// ─────────────────────────────────────────────────────────────────────────────
export const yieldPredictionSchema = z.object({
  crop: z.string()
    .min(1, 'Culture requise')
    .max(100, 'Nom de culture trop long'),
  region: z.string()
    .min(1, 'Région requise')
    .max(100, 'Nom de région trop long'),
  area_ha: z.number()
    .min(0.1, 'Superficie minimale: 0.1 hectare')
    .max(100000, 'Superficie maximale: 100 000 hectares'),
  date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format invalide (YYYY-MM-DD)'),
  country: z.string()
    .length(2, 'Code pays ISO à 2 caractères')
    .toUpperCase(),
  variety: z.string().max(100).optional().or(z.literal('')),
  irrigation: z.boolean().optional().default(false),
  fertilizer_kg: z.number().min(0).optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
// Price Prediction
// ─────────────────────────────────────────────────────────────────────────────
export const pricePredictionSchema = z.object({
  product: z.string()
    .min(1, 'Produit requis')
    .max(100, 'Nom de produit trop long'),
  market: z.string()
    .min(1, 'Marché requis')
    .max(100, 'Nom de marché trop long'),
  period: z.enum(['7d', '30d', '90d', '1y', '5y'], {
    errorMap: () => ({ message: 'Période invalide' }),
  }),
  country: z.string()
    .length(2, 'Code pays ISO à 2 caractères')
    .toUpperCase(),
  currency: z.enum(['XOF', 'XAF', 'NGN', 'ZAR', 'MAD', 'EGP']).default('XOF'),
});

// ─────────────────────────────────────────────────────────────────────────────
// Weather Prediction
// ─────────────────────────────────────────────────────────────────────────────
export const weatherPredictionSchema = z.object({
  location: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),
  days: z.number().min(1).max(14).default(7),
  country: z.string().length(2).toUpperCase(),
});

// ============================================================================
// SECTION 6: FILE UPLOAD SCHEMAS
// ============================================================================

const safeFileSchema = typeof window !== 'undefined' ? z.instanceof(window.File) : z.any();

export const fileUploadSchema = z.object({
  files: z.array(safeFileSchema)
    .min(1, 'Au moins un fichier requis')
    .max(10, 'Maximum 10 fichiers'),
  folder: z.string().max(200).optional().default('uploads'),
  is_public: z.boolean().default(false),
  tags: z.array(z.string()).max(10).optional().default([]),
});

export const singleFileSchema = z.object({
  file: safeFileSchema,
  max_size_mb: z.number().min(0.1).max(50).default(10),
  accepted_types: z.array(z.string()).optional().default([
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
    'text/csv',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ]),
});

// ============================================================================
// SECTION 7: NOTIFICATION SCHEMAS
// ============================================================================

export const notificationSchema = z.object({
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(1000),
  type: z.enum(['info', 'warning', 'critical', 'emergency', 'success'], {
    errorMap: () => ({ message: 'Type invalide' }),
  }),
  link: z.string().url().optional().or(z.literal('')),
  is_read: z.boolean().default(false),
});

// ============================================================================
// SECTION 8: SEARCH & FILTER SCHEMAS
// ============================================================================

export const searchSchema = z.object({
  query: z.string().min(1, 'Requête requise').max(200, 'Requête trop longue'),
  filters: z.object({
    country: z.string().length(2).optional(),
    sector: z.enum(['vegetal', 'animal', 'halieutique', 'forestier', 'minier', 'industriel']).optional(),
    date_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    date_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  }).optional(),
  sort_by: z.enum(['relevance', 'date', 'name']).default('relevance'),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

export const filterSchema = z.object({
  countries: z.array(z.string().length(2)).max(10).optional(),
  sectors: z.array(z.enum(['vegetal', 'animal', 'halieutique', 'forestier', 'minier', 'industriel'])).max(6).optional(),
  regions: z.array(z.string().max(100)).max(20).optional(),
  date_range: z.object({
    from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  }).optional(),
  status: z.enum(['active', 'inactive', 'pending', 'archived']).optional(),
});

// ============================================================================
// SECTION 9: VALIDATION HELPERS
// ============================================================================

/**
 * Validate file type against accepted MIME types.
 */
export function validateFileType(file: File, acceptedTypes: string[]): boolean {
  if (!file || !file.type) return false;
  return acceptedTypes.includes(file.type);
}

/**
 * Validate file size against max size (in bytes).
 */
export function validateFileSize(file: File, maxSizeBytes: number): boolean {
  if (!file || typeof file.size !== 'number') return false;
  return file.size <= maxSizeBytes;
}

/**
 * Validate file extension against blocked extensions.
 */
export function validateFileExtension(file: File, blockedExtensions: string[]): boolean {
  if (!file || !file.name) return false;
  const ext = '.' + file.name.split('.').pop()?.toLowerCase();
  return !blockedExtensions.includes(ext);
}

/**
 * Comprehensive file validation.
 */
export function validateFile(
  file: File,
  options: {
    maxSizeBytes?: number;
    acceptedTypes?: string[];
    blockedExtensions?: string[];
  }
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (options.maxSizeBytes && !validateFileSize(file, options.maxSizeBytes)) {
    errors.push(`Fichier trop volumineux (max ${(options.maxSizeBytes / 1024 / 1024).toFixed(1)} MB)`);
  }

  if (options.acceptedTypes && !validateFileType(file, options.acceptedTypes)) {
    errors.push(`Type de fichier non accepté (${file.type})`);
  }

  if (options.blockedExtensions && !validateFileExtension(file, options.blockedExtensions)) {
    errors.push('Extension de fichier bloquée');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Calculate password strength score (0-5).
 */
export function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
  percentage: number;
} {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { label: 'Très faible', color: '#DC2626' },
    { label: 'Faible', color: '#F97316' },
    { label: 'Moyen', color: '#EAB308' },
    { label: 'Fort', color: '#22C55E' },
    { label: 'Très fort', color: '#16A34A' },
    { label: 'Excellent', color: '#15803D' },
  ];

  const clampedScore = Math.min(score, 5);
  return {
    score: clampedScore,
    ...levels[clampedScore],
    percentage: (clampedScore / 5) * 100,
  };
}

/**
 * Validate an African country code.
 */
export function isValidAfricanCountry(code: string): boolean {
  const africanCodes = [
    'SN', 'TG', 'GH', 'NG', 'CI', 'ML', 'BF', 'GN', 'BJ', 'NE', 'GM', 'GW', 'SL', 'LR', 'MR', 'CV',
    'MA', 'DZ', 'TN', 'LY', 'EG', 'SD', 'SS',
    'CM', 'TD', 'CF', 'CG', 'CD', 'GA', 'GQ', 'ST', 'AO',
    'ET', 'ER', 'DJ', 'SO', 'KE', 'UG', 'TZ', 'RW', 'BI', 'MW', 'MZ', 'MG', 'MU', 'SC', 'KM',
    'ZA', 'ZW', 'ZM', 'BW', 'NA', 'LS', 'SZ',
  ];
  return africanCodes.includes(code.toUpperCase());
}

/**
 * Sanitize a search query (remove special chars, limit length).
 */
export function sanitizeSearchQuery(query: string): string {
  return query
    .replace(/[<>'"&]/g, '')
    .slice(0, 200)
    .trim();
}

// ============================================================================
// SECTION 10: TYPE EXPORTS
// ============================================================================

export type RegisterStep1Data = z.infer<typeof registerStep1Schema>;
export type RegisterStep2Data = z.infer<typeof registerStep2Schema>;
export type RegisterStep3Data = z.infer<typeof registerStep3Schema>;
export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordData = z.infer<typeof changePasswordSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type PreferencesFormData = z.infer<typeof preferencesSchema>;
export type ActorFormData = z.infer<typeof actorSchema>;
export type PostFormData = z.infer<typeof postSchema>;
export type CommentFormData = z.infer<typeof commentSchema>;
export type ReactionFormData = z.infer<typeof reactionSchema>;
export type YieldPredictionData = z.infer<typeof yieldPredictionSchema>;
export type PricePredictionData = z.infer<typeof pricePredictionSchema>;
export type WeatherPredictionData = z.infer<typeof weatherPredictionSchema>;
export type FileUploadData = z.infer<typeof fileUploadSchema>;
export type SingleFileData = z.infer<typeof singleFileSchema>;
export type NotificationFormData = z.infer<typeof notificationSchema>;
export type SearchFormData = z.infer<typeof searchSchema>;
export type FilterFormData = z.infer<typeof filterSchema>;
