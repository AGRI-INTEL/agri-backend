import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow, format, parseISO, isValid } from 'date-fns';
import { fr, enUS, type Locale } from 'date-fns/locale';

// ============================================================================
// SECTION 1: TAILWIND / CLSX UTILITIES
// ============================================================================

/**
 * Combines clsx and tailwind-merge for clean className composition.
 * Handles conditional classes, arrays, objects and deduplicates Tailwind classes.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ============================================================================
// SECTION 2: DATE FORMATTING UTILITIES
// ============================================================================

export type SupportedLocale = 'fr' | 'en';

const LOCALE_MAP: Record<SupportedLocale, Locale> = {
  fr,
  en: enUS,
};

/**
 * Format a date string to relative time (e.g., "il y a 2 heures", "2 hours ago").
 * @param date - ISO date string
 * @param locale - 'fr' | 'en'
 * @returns Formatted relative date string
 */
export function formatRelativeDate(date: string, locale: SupportedLocale = 'fr'): string {
  const parsed = parseISO(date);
  if (!isValid(parsed)) return locale === 'fr' ? 'Date invalide' : 'Invalid date';
  return formatDistanceToNow(parsed, {
    addSuffix: true,
    locale: LOCALE_MAP[locale],
  });
}

/**
 * Format a date string with a custom pattern.
 * @param date - ISO date string
 * @param pattern - date-fns pattern (default: 'dd/MM/yyyy')
 * @param locale - 'fr' | 'en'
 * @returns Formatted date string
 */
export function formatDate(
  date: string,
  pattern: string = 'dd/MM/yyyy',
  locale: SupportedLocale = 'fr'
): string {
  const parsed = parseISO(date);
  if (!isValid(parsed)) return locale === 'fr' ? 'Date invalide' : 'Invalid date';
  return format(parsed, pattern, {
    locale: LOCALE_MAP[locale],
  });
}

/**
 * Format a date to a full localized string (e.g., "22 mai 2026").
 */
export function formatFullDate(date: string, locale: SupportedLocale = 'fr'): string {
  return formatDate(date, 'dd MMMM yyyy', locale);
}

/**
 * Format a date to a short localized string (e.g., "22/05/2026").
 */
export function formatShortDate(date: string, locale: SupportedLocale = 'fr'): string {
  return formatDate(date, locale === 'fr' ? 'dd/MM/yyyy' : 'MM/dd/yyyy', locale);
}

/**
 * Format a date to ISO format for API usage.
 */
export function toISODate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return d.toISOString();
}

// ============================================================================
// SECTION 3: NUMBER & CURRENCY FORMATTING
// ============================================================================

export type CurrencyCode =
  | 'XOF' | 'XAF' | 'NGN' | 'ZAR' | 'MAD' | 'EGP' | 'GHS' | 'KES' | 'EUR' | 'USD'
  | 'GNF' | 'GMD' | 'SLL' | 'LRD' | 'MRU' | 'CVE' | 'DZD' | 'TND' | 'LYD' | 'SDG' | 'SSP'
  | 'CDF' | 'STN' | 'AOA' | 'ETB' | 'ERN' | 'DJF' | 'SOS' | 'UGX' | 'TZS' | 'RWF' | 'BIF'
  | 'MWK' | 'MZN' | 'MGA' | 'MUR' | 'SCR' | 'KMF' | 'ZWL' | 'ZMW' | 'BWP' | 'NAD' | 'LSL' | 'SZL';

const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  XOF: 'CFA',
  XAF: 'FCFA',
  NGN: '₦',
  ZAR: 'R',
  MAD: 'DH',
  EGP: 'E£',
  GHS: 'GH₵',
  KES: 'KSh',
  EUR: '€',
  USD: '$',
  GNF: 'GNF',
  GMD: 'GMD',
  SLL: 'SLL',
  LRD: 'LRD',
  MRU: 'MRU',
  CVE: 'CVE',
  DZD: 'DZD',
  TND: 'TND',
  LYD: 'LYD',
  SDG: 'SDG',
  SSP: 'SSP',
  CDF: 'CDF',
  STN: 'STN',
  AOA: 'AOA',
  ETB: 'ETB',
  ERN: 'ERN',
  DJF: 'DJF',
  SOS: 'SOS',
  UGX: 'UGX',
  TZS: 'TZS',
  RWF: 'RWF',
  BIF: 'BIF',
  MWK: 'MWK',
  MZN: 'MZN',
  MGA: 'MGA',
  MUR: 'MUR',
  SCR: 'SCR',
  KMF: 'KMF',
  ZWL: 'ZWL',
  ZMW: 'ZMW',
  BWP: 'BWP',
  NAD: 'NAD',
  LSL: 'LSL',
  SZL: 'SZL',
};

/**
 * Format a number with locale-specific separators.
 */
export function formatNumber(value: number, locale: string = 'fr-FR'): string {
  if (isNaN(value)) return '—';
  return new Intl.NumberFormat(locale).format(value);
}

/**
 * Format a number as currency with African currency support.
 * @param value - numeric value
 * @param currency - currency code (default: XOF - Franc CFA Ouest)
 * @param locale - locale string (default: fr-FR)
 * @returns Formatted currency string
 */
export function formatCurrency(
  value: number,
  currency: CurrencyCode = 'XOF',
  locale: string = 'fr-FR'
): string {
  if (isNaN(value)) return '—';

  // Use native Intl for standard currencies
  if (['EUR', 'USD', 'ZAR', 'EGP'].includes(currency)) {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  }

  // Custom formatting for African currencies without native Intl support
  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

  return `${formatted} ${symbol}`;
}

/**
 * Format a number as a percentage.
 */
export function formatPercent(value: number, decimals: number = 1, locale: string = 'fr-FR'): string {
  if (isNaN(value)) return '—%';
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
}

/**
 * Format a large number with compact notation (e.g., "1,2 M", "1.2M").
 */
export function formatCompactNumber(value: number, locale: string = 'fr-FR'): string {
  if (isNaN(value)) return '—';
  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(value);
}

// ============================================================================
// SECTION 4: FILE SIZE & DURATION FORMATTING
// ============================================================================

/**
 * Format bytes to human-readable file size.
 * Supports up to TB.
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (bytes < 0) return '—';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Format seconds to MM:SS or HH:MM:SS duration.
 */
export function formatDuration(seconds: number): string {
  if (seconds < 0 || isNaN(seconds)) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Format seconds to a readable text (e.g., "2h 30min").
 */
export function formatDurationText(seconds: number, locale: SupportedLocale = 'fr'): string {
  if (seconds < 0 || isNaN(seconds)) return locale === 'fr' ? '0 min' : '0 min';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);

  if (locale === 'fr') {
    if (h > 0 && m > 0) return `${h}h ${m}min`;
    if (h > 0) return `${h}h`;
    return `${m} min`;
  }

  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

// ============================================================================
// SECTION 5: TREND / VARIATION HELPERS
// ============================================================================

export type TrendDirection = 'up' | 'down' | 'neutral';

/**
 * Get Tailwind color class based on trend value.
 */
export function getTrendColor(trend: number): string {
  if (trend > 0) return 'text-green-600 dark:text-green-400';
  if (trend < 0) return 'text-red-600 dark:text-red-400';
  return 'text-muted-foreground';
}

/**
 * Get trend icon/arrow character.
 */
export function getTrendIcon(trend: number): string {
  if (trend > 0) return '↑';
  if (trend < 0) return '↓';
  return '→';
}

/**
 * Get trend direction as typed enum.
 */
export function getTrendDirection(trend: number): TrendDirection {
  if (trend > 0) return 'up';
  if (trend < 0) return 'down';
  return 'neutral';
}

/**
 * Get trend label in French or English.
 */
export function getTrendLabel(trend: number, locale: SupportedLocale = 'fr'): string {
  if (trend > 0) return locale === 'fr' ? 'En hausse' : 'Increasing';
  if (trend < 0) return locale === 'fr' ? 'En baisse' : 'Decreasing';
  return locale === 'fr' ? 'Stable' : 'Stable';
}

/**
 * Format a trend value with sign and percentage.
 */
export function formatTrend(trend: number, locale: SupportedLocale = 'fr'): string {
  const sign = trend > 0 ? '+' : '';
  const formatted = new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(trend);
  return `${sign}${formatted}%`;
}

// ============================================================================
// SECTION 6: SECTOR / CATEGORY HELPERS
// ============================================================================

export type SectorKey = 'vegetal' | 'animal' | 'halieutique' | 'forestier' | 'minier' | 'industriel';

export const SECTOR_COLORS: Record<SectorKey, string> = {
  vegetal: '#16A34A',
  animal: '#D97706',
  halieutique: '#0891B2',
  forestier: '#92400E',
  minier: '#6B7280',
  industriel: '#4F46E5',
};

export const SECTOR_LABELS: Record<SectorKey, string> = {
  vegetal: '🌱 Végétal',
  animal: '🐄 Animal',
  halieutique: '🎣 Halieutique',
  forestier: '🌲 Forestier',
  minier: '⛏️ Minier',
  industriel: '🏭 Industriel',
};

export const SECTOR_EMOJIS: Record<SectorKey, string> = {
  vegetal: '🌱',
  animal: '🐄',
  halieutique: '🎣',
  forestier: '🌲',
  minier: '⛏️',
  industriel: '🏭',
};

/**
 * Get sector color by key.
 */
export function getSectorColor(sector: SectorKey): string {
  return SECTOR_COLORS[sector] || '#6B7280';
}

/**
 * Get sector label by key.
 */
export function getSectorLabel(sector: SectorKey): string {
  return SECTOR_LABELS[sector] || sector;
}

/**
 * Get sector emoji by key.
 */
export function getSectorEmoji(sector: SectorKey): string {
  return SECTOR_EMOJIS[sector] || '❓';
}

// ============================================================================
// SECTION 7: SEVERITY / ALERT LEVEL HELPERS
// ============================================================================

export type SeverityLevel = 'info' | 'warning' | 'critical' | 'emergency';

export const SEVERITY_COLORS: Record<SeverityLevel, string> = {
  info: '#3B82F6',
  warning: '#EAB308',
  critical: '#F97316',
  emergency: '#DC2626',
};

export const SEVERITY_BG_COLORS: Record<SeverityLevel, string> = {
  info: 'bg-blue-50 text-blue-700 border-blue-200',
  warning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  critical: 'bg-orange-50 text-orange-700 border-orange-200',
  emergency: 'bg-red-50 text-red-700 border-red-200',
};

export const SEVERITY_LABELS: Record<SeverityLevel, string> = {
  info: 'Info',
  warning: 'Attention',
  critical: 'Critique',
  emergency: 'Urgence',
};

export const SEVERITY_ICONS: Record<SeverityLevel, string> = {
  info: 'ℹ️',
  warning: '⚠️',
  critical: '🚨',
  emergency: '🔥',
};

/**
 * Get severity color hex.
 */
export function getSeverityColor(level: SeverityLevel): string {
  return SEVERITY_COLORS[level] || '#6B7280';
}

/**
 * Get severity Tailwind badge classes.
 */
export function getSeverityBadgeClass(level: SeverityLevel): string {
  return SEVERITY_BG_COLORS[level] || 'bg-gray-50 text-gray-700 border-gray-200';
}

/**
 * Get severity label.
 */
export function getSeverityLabel(level: SeverityLevel): string {
  return SEVERITY_LABELS[level] || level;
}

/**
 * Get severity icon.
 */
export function getSeverityIcon(level: SeverityLevel): string {
  return SEVERITY_ICONS[level] || '❓';
}

// ============================================================================
// SECTION 8: FILE TYPE HELPERS
// ============================================================================

export type FileCategory = 'image' | 'video' | 'audio' | 'pdf' | 'spreadsheet' | 'document' | 'archive' | 'code' | 'other';

/**
 * Get emoji icon for a MIME type.
 */
export function getFileIcon(mimeType: string): string {
  if (!mimeType) return '📎';
  if (mimeType.startsWith('image/')) return '🖼️';
  if (mimeType.startsWith('video/')) return '🎥';
  if (mimeType.startsWith('audio/')) return '🎵';
  if (mimeType === 'application/pdf') return '📄';
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || mimeType.includes('csv')) return '📊';
  if (mimeType.includes('word') || mimeType.includes('document') || mimeType.includes('text/')) return '📝';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📽️';
  if (mimeType.includes('zip') || mimeType.includes('archive') || mimeType.includes('compressed')) return '🗜️';
  if (mimeType.includes('json') || mimeType.includes('javascript') || mimeType.includes('xml') || mimeType.includes('html')) return '💻';
  return '📎';
}

/**
 * Get Tailwind color class for a MIME type.
 */
export function getFileTypeColor(mimeType: string): string {
  if (!mimeType) return 'text-muted-foreground';
  if (mimeType === 'application/pdf') return 'text-red-500';
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || mimeType.includes('csv')) return 'text-green-600';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'text-blue-600';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'text-orange-500';
  if (mimeType.startsWith('image/')) return 'text-purple-500';
  if (mimeType.startsWith('video/')) return 'text-pink-500';
  return 'text-muted-foreground';
}

/**
 * Get file category from MIME type.
 */
export function getFileCategory(mimeType: string): FileCategory {
  if (!mimeType) return 'other';
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || mimeType.includes('csv')) return 'spreadsheet';
  if (mimeType.includes('word') || mimeType.includes('document') || mimeType.includes('text/')) return 'document';
  if (mimeType.includes('zip') || mimeType.includes('archive') || mimeType.includes('compressed')) return 'archive';
  if (mimeType.includes('json') || mimeType.includes('javascript') || mimeType.includes('xml') || mimeType.includes('html')) return 'code';
  return 'other';
}

/**
 * Get file extension from filename.
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
}

/**
 * Check if file is an image.
 */
export function isImageFile(mimeType: string): boolean {
  return mimeType?.startsWith('image/') ?? false;
}

/**
 * Check if file is a document.
 */
export function isDocumentFile(mimeType: string): boolean {
  if (!mimeType) return false;
  return (
    mimeType === 'application/pdf' ||
    mimeType.includes('word') ||
    mimeType.includes('document') ||
    mimeType.includes('text/')
  );
}

// ============================================================================
// SECTION 9: TEXT UTILITIES
// ============================================================================

/**
 * Truncate text with ellipsis.
 */
export function truncate(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text || '';
  return text.slice(0, maxLength) + '...';
}

/**
 * Truncate text from the middle (useful for long IDs/hashes).
 */
export function truncateMiddle(text: string, maxLength: number, ellipsis: string = '...'): string {
  if (!text || text.length <= maxLength) return text || '';
  const sideLength = Math.floor((maxLength - ellipsis.length) / 2);
  return text.slice(0, sideLength) + ellipsis + text.slice(-sideLength);
}

/**
 * Capitalize first letter of a string.
 */
export function capitalize(text: string): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Convert string to slug (URL-friendly).
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * Generate initials from a name (max 2 characters).
 */
export function getInitials(name: string): string {
  if (!name) return '?';
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Generate initials with fallback for empty names.
 */
export function getInitialsSafe(name: string | null | undefined, fallback: string = '?'): string {
  if (!name || !name.trim()) return fallback;
  return getInitials(name);
}

/**
 * Mask a string (e.g., phone number, email).
 */
export function maskString(text: string, visibleStart: number = 2, visibleEnd: number = 2, maskChar: string = '•'): string {
  if (!text || text.length <= visibleStart + visibleEnd) return text;
  const start = text.slice(0, visibleStart);
  const end = text.slice(-visibleEnd);
  const middle = maskChar.repeat(text.length - visibleStart - visibleEnd);
  return `${start}${middle}${end}`;
}

// ============================================================================
// SECTION 10: DEBOUNCE / THROTTLE
// ============================================================================

/**
 * Debounce function execution.
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttle function execution.
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// ============================================================================
// SECTION 11: VALIDATION HELPERS
// ============================================================================

/**
 * Validate an email address.
 */
export function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Validate a phone number (basic international format).
 */
export function isValidPhone(phone: string): boolean {
  const regex = /^\+?[\d\s-]{8,15}$/;
  return regex.test(phone.replace(/\s/g, ''));
}

/**
 * Validate an ISO date string.
 */
export function isValidISODate(date: string): boolean {
  const parsed = parseISO(date);
  return isValid(parsed);
}

/**
 * Check if a value is a valid number.
 */
export function isValidNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

/**
 * Safe parse JSON with fallback.
 */
export function safeJSONParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

// ============================================================================
// SECTION 12: PHONE NUMBER FORMATTING
// ============================================================================

/**
 * Format a phone number with country code.
 * Example: formatPhone('+221771234567', 'SN') → '+221 77 123 45 67'
 */
export function formatPhone(phone: string, countryCode?: string): string {
  if (!phone) return '';

  // Remove all non-digit except leading +
  const cleaned = phone.replace(/(?!^\+)\D/g, '');

  // Format based on country
  if (countryCode) {
    const code = countryCode.toUpperCase();
    const dialCode = COUNTRIES.find(c => c.code === code)?.dialCode;

    if (dialCode && cleaned.startsWith(dialCode.replace('+', ''))) {
      const num = cleaned.slice(dialCode.length - 1); // Remove dial code
      if (code === 'SN' && num.length === 9) {
        return `${dialCode} ${num.slice(0, 2)} ${num.slice(2, 5)} ${num.slice(5, 7)} ${num.slice(7, 9)}`;
      }
      if (code === 'CI' && num.length === 10) {
        return `${dialCode} ${num.slice(0, 2)} ${num.slice(2, 5)} ${num.slice(5, 8)} ${num.slice(8, 10)}`;
      }
      if (code === 'NG' && num.length === 10) {
        return `${dialCode} ${num.slice(0, 3)} ${num.slice(3, 6)} ${num.slice(6, 10)}`;
      }
    }
  }

  // Generic formatting
  if (cleaned.startsWith('+')) {
    const digits = cleaned.slice(1);
    if (digits.length <= 10) {
      return `+${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
    }
    return `+${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
  }

  return cleaned;
}

// ============================================================================
// SECTION 13: AFRICAN COUNTRIES - TYPES & DATA
// ============================================================================

export type AfricanRegion =
  | "Afrique de l'Ouest"
  | 'Afrique du Nord'
  | 'Afrique centrale'
  | "Afrique de l'Est"
  | 'Afrique australe';

export interface Country {
  code: string;           // Code ISO 3166-1 alpha-2
  name: string;           // Nom en français
  flag: string;           // Drapeau emoji
  dialCode: string;       // Indicatif téléphonique ITU
  region: AfricanRegion;  // Région géographique
  currency?: CurrencyCode; // Devise principale
}

// ─────────────────────────────────────────────────────────────────────────────
// COUNTRY_FLAGS: Record rapide d'accès par code ISO
// ─────────────────────────────────────────────────────────────────────────────

export const COUNTRY_FLAGS: Record<string, string> = {
  // ═══════════════════════════════════════════════════════════════════════
  // AFRIQUE DE L'OUEST (16 pays)
  // ═══════════════════════════════════════════════════════════════════════
  SN: '🇸🇳',   // Sénégal
  TG: '🇹🇬',   // Togo
  GH: '🇬🇭',   // Ghana
  NG: '🇳🇬',   // Nigeria
  CI: '🇨🇮',   // Côte d'Ivoire
  ML: '🇲🇱',   // Mali
  BF: '🇧🇫',   // Burkina Faso
  GN: '🇬🇳',   // Guinée
  BJ: '🇧🇯',   // Bénin
  NE: '🇳🇪',   // Niger
  GM: '🇬🇲',   // Gambie
  GW: '🇬🇼',   // Guinée-Bissau
  SL: '🇸🇱',   // Sierra Leone
  LR: '🇱🇷',   // Libéria
  MR: '🇲🇷',   // Mauritanie
  CV: '🇨🇻',   // Cap-Vert

  // ═══════════════════════════════════════════════════════════════════════
  // AFRIQUE DU NORD (7 pays)
  // ═══════════════════════════════════════════════════════════════════════
  MA: '🇲🇦',   // Maroc
  DZ: '🇩🇿',   // Algérie
  TN: '🇹🇳',   // Tunisie
  LY: '🇱🇾',   // Libye
  EG: '🇪🇬',   // Égypte
  SD: '🇸🇩',   // Soudan
  SS: '🇸🇸',   // Soudan du Sud

  // ═══════════════════════════════════════════════════════════════════════
  // AFRIQUE CENTRALE (9 pays)
  // ═══════════════════════════════════════════════════════════════════════
  CM: '🇨🇲',   // Cameroun
  TD: '🇹🇩',   // Tchad
  CF: '🇨🇫',   // République centrafricaine
  CG: '🇨🇬',   // Congo
  CD: '🇨🇩',   // Congo (RDC)
  GA: '🇬🇦',   // Gabon
  GQ: '🇬🇶',   // Guinée équatoriale
  ST: '🇸🇹',   // Sao Tomé-et-Principe
  AO: '🇦🇴',   // Angola

  // ═══════════════════════════════════════════════════════════════════════
  // AFRIQUE DE L'EST (15 pays)
  // ═══════════════════════════════════════════════════════════════════════
  ET: '🇪🇹',   // Éthiopie
  ER: '🇪🇷',   // Érythrée
  DJ: '🇩🇯',   // Djibouti
  SO: '🇸🇴',   // Somalie
  KE: '🇰🇪',   // Kenya
  UG: '🇺🇬',   // Ouganda
  TZ: '🇹🇿',   // Tanzanie
  RW: '🇷🇼',   // Rwanda
  BI: '🇧🇮',   // Burundi
  MW: '🇲🇼',   // Malawi
  MZ: '🇲🇿',   // Mozambique
  MG: '🇲🇬',   // Madagascar
  MU: '🇲🇺',   // Maurice
  SC: '🇸🇨',   // Seychelles
  KM: '🇰🇲',   // Comores

  // ═══════════════════════════════════════════════════════════════════════
  // AFRIQUE AUSTRALE (7 pays)
  // ═══════════════════════════════════════════════════════════════════════
  ZA: '🇿🇦',   // Afrique du Sud
  ZW: '🇿🇼',   // Zimbabwe
  ZM: '🇿🇲',   // Zambie
  BW: '🇧🇼',   // Botswana
  NA: '🇳🇦',   // Namibie
  LS: '🇱🇸',   // Lesotho
  SZ: '🇸🇿',   // Eswatini
};

// ─────────────────────────────────────────────────────────────────────────────
// COUNTRIES: Liste complète des 54 pays africains
// ─────────────────────────────────────────────────────────────────────────────

export const COUNTRIES: Country[] = [
  // ═══════════════════════════════════════════════════════════════════════
  // AFRIQUE DE L'OUEST (16 pays)
  // ═══════════════════════════════════════════════════════════════════════
  { code: 'SN', name: 'Sénégal', flag: '🇸🇳', dialCode: '+221', region: "Afrique de l'Ouest", currency: 'XOF' },
  { code: 'TG', name: 'Togo', flag: '🇹🇬', dialCode: '+228', region: "Afrique de l'Ouest", currency: 'XOF' },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭', dialCode: '+233', region: "Afrique de l'Ouest", currency: 'GHS' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬', dialCode: '+234', region: "Afrique de l'Ouest", currency: 'NGN' },
  { code: 'CI', name: "Côte d'Ivoire", flag: '🇨🇮', dialCode: '+225', region: "Afrique de l'Ouest", currency: 'XOF' },
  { code: 'ML', name: 'Mali', flag: '🇲🇱', dialCode: '+223', region: "Afrique de l'Ouest", currency: 'XOF' },
  { code: 'BF', name: 'Burkina Faso', flag: '🇧🇫', dialCode: '+226', region: "Afrique de l'Ouest", currency: 'XOF' },
  { code: 'GN', name: 'Guinée', flag: '🇬🇳', dialCode: '+224', region: "Afrique de l'Ouest", currency: 'GNF' },
  { code: 'BJ', name: 'Bénin', flag: '🇧🇯', dialCode: '+229', region: "Afrique de l'Ouest", currency: 'XOF' },
  { code: 'NE', name: 'Niger', flag: '🇳🇪', dialCode: '+227', region: "Afrique de l'Ouest", currency: 'XOF' },
  { code: 'GM', name: 'Gambie', flag: '🇬🇲', dialCode: '+220', region: "Afrique de l'Ouest", currency: 'GMD' },
  { code: 'GW', name: 'Guinée-Bissau', flag: '🇬🇼', dialCode: '+245', region: "Afrique de l'Ouest", currency: 'XOF' },
  { code: 'SL', name: 'Sierra Leone', flag: '🇸🇱', dialCode: '+232', region: "Afrique de l'Ouest", currency: 'SLL' },
  { code: 'LR', name: 'Libéria', flag: '🇱🇷', dialCode: '+231', region: "Afrique de l'Ouest", currency: 'LRD' },
  { code: 'MR', name: 'Mauritanie', flag: '🇲🇷', dialCode: '+222', region: "Afrique de l'Ouest", currency: 'MRU' },
  { code: 'CV', name: 'Cap-Vert', flag: '🇨🇻', dialCode: '+238', region: "Afrique de l'Ouest", currency: 'CVE' },

  // ═══════════════════════════════════════════════════════════════════════
  // AFRIQUE DU NORD (7 pays)
  // ═══════════════════════════════════════════════════════════════════════
  { code: 'MA', name: 'Maroc', flag: '🇲🇦', dialCode: '+212', region: 'Afrique du Nord', currency: 'MAD' },
  { code: 'DZ', name: 'Algérie', flag: '🇩🇿', dialCode: '+213', region: 'Afrique du Nord', currency: 'DZD' },
  { code: 'TN', name: 'Tunisie', flag: '🇹🇳', dialCode: '+216', region: 'Afrique du Nord', currency: 'TND' },
  { code: 'LY', name: 'Libye', flag: '🇱🇾', dialCode: '+218', region: 'Afrique du Nord', currency: 'LYD' },
  { code: 'EG', name: 'Égypte', flag: '🇪🇬', dialCode: '+20', region: 'Afrique du Nord', currency: 'EGP' },
  { code: 'SD', name: 'Soudan', flag: '🇸🇩', dialCode: '+249', region: 'Afrique du Nord', currency: 'SDG' },
  { code: 'SS', name: 'Soudan du Sud', flag: '🇸🇸', dialCode: '+211', region: 'Afrique du Nord', currency: 'SSP' },

  // ═══════════════════════════════════════════════════════════════════════
  // AFRIQUE CENTRALE (9 pays)
  // ═══════════════════════════════════════════════════════════════════════
  { code: 'CM', name: 'Cameroun', flag: '🇨🇲', dialCode: '+237', region: 'Afrique centrale', currency: 'XAF' },
  { code: 'TD', name: 'Tchad', flag: '🇹🇩', dialCode: '+235', region: 'Afrique centrale', currency: 'XAF' },
  { code: 'CF', name: 'République centrafricaine', flag: '🇨🇫', dialCode: '+236', region: 'Afrique centrale', currency: 'XAF' },
  { code: 'CG', name: 'Congo', flag: '🇨🇬', dialCode: '+242', region: 'Afrique centrale', currency: 'XAF' },
  { code: 'CD', name: 'Congo (RDC)', flag: '🇨🇩', dialCode: '+243', region: 'Afrique centrale', currency: 'CDF' },
  { code: 'GA', name: 'Gabon', flag: '🇬🇦', dialCode: '+241', region: 'Afrique centrale', currency: 'XAF' },
  { code: 'GQ', name: 'Guinée équatoriale', flag: '🇬🇶', dialCode: '+240', region: 'Afrique centrale', currency: 'XAF' },
  { code: 'ST', name: 'Sao Tomé-et-Principe', flag: '🇸🇹', dialCode: '+239', region: 'Afrique centrale', currency: 'STN' },
  { code: 'AO', name: 'Angola', flag: '🇦🇴', dialCode: '+244', region: 'Afrique centrale', currency: 'AOA' },

  // ═══════════════════════════════════════════════════════════════════════
  // AFRIQUE DE L'EST (15 pays)
  // ═══════════════════════════════════════════════════════════════════════
  { code: 'ET', name: 'Éthiopie', flag: '🇪🇹', dialCode: '+251', region: "Afrique de l'Est", currency: 'ETB' },
  { code: 'ER', name: 'Érythrée', flag: '🇪🇷', dialCode: '+291', region: "Afrique de l'Est", currency: 'ERN' },
  { code: 'DJ', name: 'Djibouti', flag: '🇩🇯', dialCode: '+253', region: "Afrique de l'Est", currency: 'DJF' },
  { code: 'SO', name: 'Somalie', flag: '🇸🇴', dialCode: '+252', region: "Afrique de l'Est", currency: 'SOS' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪', dialCode: '+254', region: "Afrique de l'Est", currency: 'KES' },
  { code: 'UG', name: 'Ouganda', flag: '🇺🇬', dialCode: '+256', region: "Afrique de l'Est", currency: 'UGX' },
  { code: 'TZ', name: 'Tanzanie', flag: '🇹🇿', dialCode: '+255', region: "Afrique de l'Est", currency: 'TZS' },
  { code: 'RW', name: 'Rwanda', flag: '🇷🇼', dialCode: '+250', region: "Afrique de l'Est", currency: 'RWF' },
  { code: 'BI', name: 'Burundi', flag: '🇧🇮', dialCode: '+257', region: "Afrique de l'Est", currency: 'BIF' },
  { code: 'MW', name: 'Malawi', flag: '🇲🇼', dialCode: '+265', region: "Afrique de l'Est", currency: 'MWK' },
  { code: 'MZ', name: 'Mozambique', flag: '🇲🇿', dialCode: '+258', region: "Afrique de l'Est", currency: 'MZN' },
  { code: 'MG', name: 'Madagascar', flag: '🇲🇬', dialCode: '+261', region: "Afrique de l'Est", currency: 'MGA' },
  { code: 'MU', name: 'Maurice', flag: '🇲🇺', dialCode: '+230', region: "Afrique de l'Est", currency: 'MUR' },
  { code: 'SC', name: 'Seychelles', flag: '🇸🇨', dialCode: '+248', region: "Afrique de l'Est", currency: 'SCR' },
  { code: 'KM', name: 'Comores', flag: '🇰🇲', dialCode: '+269', region: "Afrique de l'Est", currency: 'KMF' },

  // ═══════════════════════════════════════════════════════════════════════
  // AFRIQUE AUSTRALE (7 pays)
  // ═══════════════════════════════════════════════════════════════════════
  { code: 'ZA', name: 'Afrique du Sud', flag: '🇿🇦', dialCode: '+27', region: 'Afrique australe', currency: 'ZAR' },
  { code: 'ZW', name: 'Zimbabwe', flag: '🇿🇼', dialCode: '+263', region: 'Afrique australe', currency: 'ZWL' },
  { code: 'ZM', name: 'Zambie', flag: '🇿🇲', dialCode: '+260', region: 'Afrique australe', currency: 'ZMW' },
  { code: 'BW', name: 'Botswana', flag: '🇧🇼', dialCode: '+267', region: 'Afrique australe', currency: 'BWP' },
  { code: 'NA', name: 'Namibie', flag: '🇳🇦', dialCode: '+264', region: 'Afrique australe', currency: 'NAD' },
  { code: 'LS', name: 'Lesotho', flag: '🇱🇸', dialCode: '+266', region: 'Afrique australe', currency: 'LSL' },
  { code: 'SZ', name: 'Eswatini', flag: '🇸🇿', dialCode: '+268', region: 'Afrique australe', currency: 'SZL' },
];

// ============================================================================
// SECTION 14: COUNTRY HELPERS / UTILITAIRES PAYS
// ============================================================================

/** Récupère un pays par son code ISO */
export function getCountryByCode(code: string): Country | undefined {
  return COUNTRIES.find((c) => c.code === code.toUpperCase());
}

/** Récupère le drapeau d'un pays par son code ISO */
export function getFlagByCode(code: string): string {
  return COUNTRY_FLAGS[code.toUpperCase()] || '🏳️';
}

/** Récupère le nom d'un pays par son code ISO */
export function getCountryNameByCode(code: string): string {
  return getCountryByCode(code)?.name || code.toUpperCase();
}

/** Récupère l'indicatif téléphonique par code ISO */
export function getDialCodeByCountry(code: string): string | undefined {
  return getCountryByCode(code)?.dialCode;
}

/** Récupère la devise par code ISO */
export function getCurrencyByCountry(code: string): CurrencyCode | undefined {
  return getCountryByCode(code)?.currency;
}

/** Filtre les pays par région */
export function getCountriesByRegion(region: AfricanRegion): Country[] {
  return COUNTRIES.filter((c) => c.region === region);
}

/** Recherche un pays par nom ou code (insensible à la casse) */
export function searchCountry(query: string): Country[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      c.dialCode.includes(q)
  );
}

/** Recherche un pays par indicatif téléphonique */
export function getCountryByDialCode(dialCode: string): Country | undefined {
  const cleaned = dialCode.startsWith('+') ? dialCode : `+${dialCode}`;
  return COUNTRIES.find((c) => c.dialCode === cleaned);
}

/** Liste des régions disponibles */
export const REGIONS: AfricanRegion[] = [
  "Afrique de l'Ouest",
  'Afrique du Nord',
  'Afrique centrale',
  "Afrique de l'Est",
  'Afrique australe',
];

/** Nombre total de pays */
export const TOTAL_COUNTRIES = COUNTRIES.length; // 54 pays

/** Nombre de pays par région */
export const COUNTRIES_BY_REGION_COUNT: Record<AfricanRegion, number> = {
  "Afrique de l'Ouest": 16,
  'Afrique du Nord': 7,
  'Afrique centrale': 9,
  "Afrique de l'Est": 15,
  'Afrique australe': 7,
};

/** Vérifie si un code ISO est un pays africain valide */
export function isAfricanCountry(code: string): boolean {
  return COUNTRY_FLAGS[code.toUpperCase()] !== undefined;
}

/** Retourne les pays triés par nom */
export function getCountriesSorted(): Country[] {
  return [...COUNTRIES].sort((a, b) => a.name.localeCompare(b.name, 'fr'));
}

/** Retourne les pays d'une région triés par nom */
export function getCountriesByRegionSorted(region: AfricanRegion): Country[] {
  return getCountriesByRegion(region).sort((a, b) => a.name.localeCompare(b.name, 'fr'));
}

// ============================================================================
// SECTION 15: ARRAY / OBJECT UTILITIES
// ============================================================================

/**
 * Group an array of objects by a key.
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    result[groupKey] = result[groupKey] || [];
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

/**
 * Remove duplicates from an array.
 */
export function unique<T>(array: T[]): T[] {
  return [...new Set(array)];
}

/**
 * Remove duplicates by a key function.
 */
export function uniqueBy<T>(array: T[], keyFn: (item: T) => string | number): T[] {
  const seen = new Set<string | number>();
  return array.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Chunk an array into smaller arrays.
 */
export function chunk<T>(array: T[], size: number): T[][] {
  if (size <= 0) return [array];
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

/**
 * Shuffle an array (Fisher-Yates).
 */
export function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ============================================================================
// SECTION 16: COLOR UTILITIES
// ============================================================================

/**
 * Convert hex to RGB.
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

/**
 * Convert hex to RGBA string.
 */
export function hexToRgba(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

/**
 * Lighten or darken a hex color.
 */
export function adjustColor(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const clamp = (val: number) => Math.min(255, Math.max(0, val));
  const r = clamp(rgb.r + amount);
  const g = clamp(rgb.g + amount);
  const b = clamp(rgb.b + amount);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// ============================================================================
// SECTION 17: EXPORT GROUPING (pour imports propres)
// ============================================================================

/**
 * Ré-exporte tout pour un import unique:
 * import * as Utils from '@/lib/utils';
 */
export const Utils = {
  cn,
  formatRelativeDate,
  formatDate,
  formatFullDate,
  formatShortDate,
  toISODate,
  formatNumber,
  formatCurrency,
  formatPercent,
  formatCompactNumber,
  formatFileSize,
  formatDuration,
  formatDurationText,
  formatPhone,
  getTrendColor,
  getTrendIcon,
  getTrendDirection,
  getTrendLabel,
  formatTrend,
  getSectorColor,
  getSectorLabel,
  getSectorEmoji,
  getSeverityColor,
  getSeverityBadgeClass,
  getSeverityLabel,
  getSeverityIcon,
  getFileIcon,
  getFileTypeColor,
  getFileCategory,
  getFileExtension,
  isImageFile,
  isDocumentFile,
  truncate,
  truncateMiddle,
  capitalize,
  slugify,
  getInitials,
  getInitialsSafe,
  maskString,
  debounce,
  throttle,
  isValidEmail,
  isValidPhone,
  isValidISODate,
  isValidNumber,
  safeJSONParse,
  getCountryByCode,
  getFlagByCode,
  getCountryNameByCode,
  getDialCodeByCountry,
  getCurrencyByCountry,
  getCountriesByRegion,
  searchCountry,
  getCountryByDialCode,
  isAfricanCountry,
  getCountriesSorted,
  getCountriesByRegionSorted,
  groupBy,
  unique,
  uniqueBy,
  chunk,
  shuffle,
  hexToRgb,
  hexToRgba,
  adjustColor,
} as const;
