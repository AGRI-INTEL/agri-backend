// ============================================================================
// SECTION 1: CORE TYPES & ENUMS
// ============================================================================

/**
 * File category based on MIME type and extension.
 */
export type FileType =
  | 'image'        // Images (JPEG, PNG, WebP, GIF, AVIF, SVG)
  | 'video'        // Vidéos (MP4, WebM, MOV, AVI)
  | 'audio'        // Audio (MP3, WAV, OGG, FLAC, AAC)
  | 'document'     // Documents texte (PDF, DOCX, TXT, CSV)
  | 'spreadsheet'  // Tableurs (XLSX, CSV, ODS)
  | 'presentation' // Présentations (PPTX, ODP)
  | 'archive'      // Archives (ZIP, RAR, 7Z)
  | 'code'         // Code source (JS, TS, PY, HTML, CSS, JSON)
  | 'database'     // Bases de données (SQL, SQLite, JSON)
  | 'geodata'      // Données géographiques (GeoJSON, KML, SHP)
  | 'other';       // Types non reconnus

/**
 * Permission levels for file access.
 */
export type FilePermission =
  | 'view'     // Lecture seule
  | 'download' // Téléchargement autorisé
  | 'comment'  // Ajouter des commentaires
  | 'edit'     // Modifier le contenu
  | 'delete'   // Supprimer
  | 'share'    // Partager avec d'autres
  | 'admin';   // Gérer les permissions

/**
 * File processing / conversion status.
 */
export type FileProcessingStatus =
  | 'pending'     // En attente de traitement
  | 'uploading'   // Téléversement en cours
  | 'processing'  // Traitement (compression, conversion, OCR)
  | 'scanning'    // Analyse antivirus
  | 'done'        // Prêt à l'emploi
  | 'error'       // Échec du traitement
  | 'quarantine'; // Mis en quarantaine (fichier suspect)

/**
 * File lifecycle status.
 */
export type FileLifecycleStatus =
  | 'active'     // Actif et accessible
  | 'archived'   // Archivé (lecture seule)
  | 'trashed'    // Dans la corbeille
  | 'expired'    // Lien public expiré
  | 'locked';    // Verrouillé (modification interdite)

/**
 * Sort options for file listing.
 */
export type FileSortField =
  | 'name'
  | 'size'
  | 'created_at'
  | 'updated_at'
  | 'type'
  | 'uploader'
  | 'popularity';

// ============================================================================
// SECTION 2: FILE ENTITY
// ============================================================================

/**
 * A file stored in the system.
 */
export interface FileItem {
  /** Unique file ID */
  id: string;
  /** Original filename */
  name: string;
  /** URL-friendly slug */
  slug: string;
  /** File category */
  type: FileType;
  /** MIME type */
  mime_type: string;
  /** File size in bytes */
  size: number;
  /** Storage path / URL */
  url: string;
  /** CDN / direct download URL */
  download_url?: string;
  /** Thumbnail / preview URL */
  thumbnail?: string;
  /** Preview URL (for documents) */
  preview_url?: string;
  /** Parent folder ID */
  folder_id?: string;
  /** Folder path (derived, e.g. "projets/2026/") */
  folder_path?: string;
  /** Uploader user ID */
  uploaded_by: string;
  /** Uploader display name */
  uploader_name: string;
  /** Uploader avatar */
  uploader_avatar?: string;
  /** Creation timestamp (ISO 8601) */
  created_at: string;
  /** Last update timestamp */
  updated_at: string;
  /** Last access timestamp */
  last_accessed_at?: string;
  /** Access count */
  access_count?: number;
  /** Download count */
  download_count?: number;

  // ── Media-specific metadata ──
  /** Duration in seconds (audio/video) */
  duration?: number;
  /** Width in pixels (image/video) */
  width?: number;
  /** Height in pixels (image/video) */
  height?: number;
  /** Bitrate (audio/video) */
  bitrate?: number;
  /** Frame rate (video) */
  frame_rate?: number;
  /** Color space (image) */
  color_space?: string;
  /** EXIF data (image) */
  exif?: Record<string, unknown>;

  // ── Document-specific metadata ──
  /** Number of pages (PDF, DOCX, PPTX) */
  page_count?: number;
  /** Extracted text content (for search) */
  extracted_text?: string;
  /** OCR text (for scanned documents) */
  ocr_text?: string;
  /** Language detected */
  language?: string;

  // ── Versioning ──
  /** Version number */
  version?: number;
  /** Previous version ID */
  previous_version_id?: string;
  /** Whether this is the latest version */
  is_latest_version?: boolean;
  /** Version history */
  versions?: FileVersion[];

  // ── Permissions ──
  /** Current user's permissions on this file */
  permissions: FilePermission[];
  /** Whether the file is publicly accessible */
  is_public: boolean;
  /** Public sharing link */
  public_link?: string;
  /** Public link expiration (ISO 8601) */
  public_link_expires?: string;
  /** Password protection for public link */
  public_link_password?: string;
  /** Whether public link requires password */
  public_link_password_required?: boolean;

  // ── Status ──
  /** Processing status */
  processing_status: FileProcessingStatus;
  /** Lifecycle status */
  lifecycle_status: FileLifecycleStatus;
  /** Processing error message */
  processing_error?: string;
  /** Quarantine reason */
  quarantine_reason?: string;

  // ── Tags & metadata ──
  /** User-defined tags */
  tags?: string[];
  /** Custom metadata key-value pairs */
  metadata?: Record<string, string | number | boolean>;
  /** Related entity IDs (e.g. post_id, actor_id) */
  related_ids?: Record<string, string>;
  /** Description / caption */
  description?: string;
}

/**
 * A file version for versioning support.
 */
export interface FileVersion {
  /** Version ID */
  id: string;
  /** Version number */
  version: number;
  /** File size */
  size: number;
  /** Storage URL */
  url: string;
  /** Changelog / description */
  changelog?: string;
  /** Creator ID */
  created_by: string;
  /** Creator name */
  created_by_name: string;
  /** Creation timestamp */
  created_at: string;
}

// ============================================================================
// SECTION 3: FOLDER ENTITY
// ============================================================================

/**
 * A folder / directory in the file system.
 */
export interface Folder {
  /** Unique folder ID */
  id: string;
  /** Folder name */
  name: string;
  /** URL-friendly slug */
  slug: string;
  /** Parent folder ID (null = root) */
  parent_id?: string;
  /** Full path from root (e.g. "projets/2026/rapports") */
  path?: string;
  /** Depth level (0 = root) */
  depth?: number;
  /** Nested subfolders (populated on demand) */
  children?: Folder[];
  /** Number of direct files */
  files_count: number;
  /** Total files including subfolders (recursive) */
  total_files_count?: number;
  /** Total size in bytes (recursive) */
  total_size?: number;
  /** Creation timestamp */
  created_at: string;
  /** Creator user ID */
  created_by: string;
  /** Creator name */
  created_by_name?: string;
  /** Whether this is the default/root folder */
  is_default: boolean;
  /** Whether this is a system folder (non-deletable) */
  is_system?: boolean;
  /** Whether the folder is shared */
  is_shared?: boolean;
  /** Folder color (hex) for UI */
  color?: string;
  /** Icon identifier */
  icon?: string;
  /** Description */
  description?: string;
  /** User-defined tags */
  tags?: string[];
}

/**
 * Breadcrumb item for folder navigation.
 */
export interface FolderBreadcrumb {
  id: string;
  name: string;
  slug: string;
}

// ============================================================================
// SECTION 4: UPLOAD & PROGRESS
// ============================================================================

/**
 * Upload progress for a single file.
 */
export interface UploadProgress {
  /** Temporary upload ID */
  file_id: string;
  /** Original filename */
  filename: string;
  /** File size in bytes */
  size: number;
  /** Upload progress 0-100 */
  progress: number;
  /** Bytes uploaded */
  bytes_uploaded: number;
  /** Upload speed (bytes/sec) */
  speed?: number;
  /** Estimated time remaining (seconds) */
  eta?: number;
  /** Current status */
  status: FileProcessingStatus;
  /** Error message */
  error?: string;
  /** Result URL (when done) */
  url?: string;
  /** Result file ID (when done) */
  result_id?: string;
  /** Thumbnail URL (when available) */
  thumbnail_url?: string;
  /** Whether upload was cancelled */
  cancelled?: boolean;
  /** Cancel function */
  cancel?: () => void;
}

/**
 * Batch upload state.
 */
export interface BatchUpload {
  /** Batch ID */
  id: string;
  /** Total files */
  total_files: number;
  /** Completed uploads */
  completed: number;
  /** Failed uploads */
  failed: number;
  /** In-progress uploads */
  in_progress: number;
  /** Individual file progresses */
  files: UploadProgress[];
  /** Overall progress 0-100 */
  overall_progress: number;
  /** Whether the batch is complete */
  is_complete: boolean;
  /** Start timestamp */
  started_at: string;
  /** Completion timestamp */
  completed_at?: string;
}

// ============================================================================
// SECTION 5: PERMISSIONS & SHARING
// ============================================================================

/**
 * A user with specific permissions on a file or folder.
 */
export interface FilePermissionUser {
  /** User ID */
  user_id: string;
  /** User email */
  email: string;
  /** Display name */
  name: string;
  /** Avatar URL */
  avatar?: string;
  /** Granted permission level */
  permission: FilePermission;
  /** Who granted this permission */
  granted_by?: string;
  /** Grant timestamp */
  granted_at?: string;
  /** Expiration date (optional) */
  expires_at?: string;
}

/**
 * Permission grant for a file or folder.
 */
export interface PermissionGrant {
  /** Target user ID */
  user_id: string;
  /** Permission level */
  permission: FilePermission;
  /** Whether to notify the user */
  notify?: boolean;
  /** Custom message */
  message?: string;
  /** Expiration date */
  expires_at?: string;
}

/**
 * Public sharing configuration.
 */
export interface PublicShareConfig {
  /** Whether sharing is enabled */
  enabled: boolean;
  /** Expiration date */
  expires_at?: string;
  /** Password protection */
  password?: string;
  /** Max downloads allowed (0 = unlimited) */
  max_downloads?: number;
  /** Whether to allow downloads */
  allow_download: boolean;
  /** Whether to allow preview */
  allow_preview: boolean;
}

/**
 * Access log entry for a file.
 */
export interface FileAccessLog {
  /** Log entry ID */
  id: string;
  /** File ID */
  file_id: string;
  /** User ID (null = anonymous/public) */
  user_id?: string;
  /** User name */
  user_name?: string;
  /** Action performed */
  action: 'view' | 'download' | 'preview' | 'share' | 'edit' | 'delete';
  /** IP address */
  ip_address?: string;
  /** User agent */
  user_agent?: string;
  /** Timestamp */
  created_at: string;
}

// ============================================================================
// SECTION 6: FILTERS & SEARCH
// ============================================================================

/**
 * Filters for file listing.
 */
export interface FileFilters {
  /** Search query (name, description, extracted text) */
  search?: string;
  /** Folder ID filter */
  folder_id?: string;
  /** File type filter */
  type?: FileType;
  /** Multiple type filter */
  types?: FileType[];
  /** MIME type filter */
  mime_type?: string;
  /** Uploader ID filter */
  uploaded_by?: string;
  /** Date range start */
  date_from?: string;
  /** Date range end */
  date_to?: string;
  /** Size range min (bytes) */
  size_min?: number;
  /** Size range max (bytes) */
  size_max?: number;
  /** Tag filter */
  tag?: string;
  /** Lifecycle status filter */
  status?: FileLifecycleStatus;
  /** Only public files */
  public_only?: boolean;
  /** Only files with specific permission */
  has_permission?: FilePermission;
  /** Sort field */
  sort_by?: FileSortField;
  /** Sort direction */
  sort_order?: 'asc' | 'desc';
  /** Pagination */
  page?: number;
  limit?: number;
}

/**
 * Filters for folder listing.
 */
export interface FolderFilters {
  /** Parent folder ID (null = root) */
  parent_id?: string | null;
  /** Search by name */
  search?: string;
  /** Include system folders */
  include_system?: boolean;
  /** Only shared folders */
  shared_only?: boolean;
  /** Sort field */
  sort_by?: 'name' | 'created_at' | 'files_count' | 'size';
  /** Sort direction */
  sort_order?: 'asc' | 'desc';
}

/**
 * Search result for files.
 */
export interface FileSearchResult {
  /** Matching files */
  files: FileItem[];
  /** Matching folders */
  folders: Folder[];
  /** Total file results */
  total_files: number;
  /** Total folder results */
  total_folders: number;
  /** Search query */
  query: string;
  /** Whether results were truncated */
  has_more: boolean;
  /** Search time in ms */
  search_time_ms: number;
}

// ============================================================================
// SECTION 7: REQUESTS
// ============================================================================

/**
 * Request to upload a file.
 */
export interface UploadFileRequest {
  /** Target folder ID */
  folder_id?: string;
  /** File to upload */
  file: File;
  /** Custom filename (optional) */
  name?: string;
  /** Description */
  description?: string;
  /** Tags */
  tags?: string[];
  /** Whether to make public */
  is_public?: boolean;
  /** Whether to extract text (OCR) */
  extract_text?: boolean;
  /** Whether to generate thumbnail */
  generate_thumbnail?: boolean;
  /** Compression quality 0-1 (images) */
  compression_quality?: number;
}

/**
 * Request to create a folder.
 */
export interface CreateFolderRequest {
  /** Folder name */
  name: string;
  /** Parent folder ID (omit for root) */
  parent_id?: string;
  /** Description */
  description?: string;
  /** Color (hex) */
  color?: string;
  /** Icon */
  icon?: string;
}

/**
 * Request to rename a file or folder.
 */
export interface RenameRequest {
  /** Item ID */
  id: string;
  /** New name */
  name: string;
}

/**
 * Request to move items.
 */
export interface MoveRequest {
  /** Item IDs to move */
  item_ids: string[];
  /** Target folder ID */
  target_folder_id: string;
}

/**
 * Request to copy items.
 */
export interface CopyRequest {
  /** Item IDs to copy */
  item_ids: string[];
  /** Target folder ID */
  target_folder_id: string;
}

/**
 * Request to share a file or folder.
 */
export interface ShareRequest {
  /** Item ID */
  item_id: string;
  /** Whether it's a folder */
  is_folder: boolean;
  /** Users to share with */
  users?: PermissionGrant[];
  /** Public sharing config */
  public_share?: PublicShareConfig;
}

/**
 * Request to update file metadata.
 */
export interface UpdateFileMetadataRequest {
  /** File ID */
  id: string;
  /** New name */
  name?: string;
  /** New description */
  description?: string;
  /** New tags */
  tags?: string[];
  /** New metadata */
  metadata?: Record<string, string | number | boolean>;
}

// ============================================================================
// SECTION 8: STORAGE QUOTA & STATS
// ============================================================================

/**
 * User storage quota information.
 */
export interface StorageQuota {
  /** Total allowed bytes */
  total_bytes: number;
  /** Used bytes */
  used_bytes: number;
  /** Available bytes */
  available_bytes: number;
  /** Usage percentage 0-100 */
  usage_percent: number;
  /** Total file count */
  file_count: number;
  /** Breakdown by file type */
  by_type: Record<FileType, { bytes: number; count: number }>;
  /** Plan name */
  plan_name: string;
  /** Whether near limit */
  is_near_limit: boolean;
}

/**
 * File statistics for a user or organization.
 */
export interface FileStats {
  /** Total files */
  total_files: number;
  /** Total folders */
  total_folders: number;
  /** Total size in bytes */
  total_size: number;
  /** Breakdown by type */
  by_type: Record<FileType, { count: number; size: number }>;
  /** Recent uploads (last 30 days) */
  recent_uploads: number;
  /** Most accessed files */
  most_accessed: { file_id: string; name: string; access_count: number }[];
  /** Storage trend (last 6 months) */
  storage_trend: { month: string; size: number }[];
}

// ============================================================================
// SECTION 9: CONSTANTS & LABELS
// ============================================================================

/** Labels for file types */
export const FILE_TYPE_LABELS: Record<FileType, string> = {
  image: 'Image',
  video: 'Vidéo',
  audio: 'Audio',
  document: 'Document',
  spreadsheet: 'Tableur',
  presentation: 'Présentation',
  archive: 'Archive',
  code: 'Code source',
  database: 'Base de données',
  geodata: 'Données géographiques',
  other: 'Autre',
};

/** Icons for file types (emoji) */
export const FILE_TYPE_ICONS: Record<FileType, string> = {
  image: '🖼️',
  video: '🎬',
  audio: '🎵',
  document: '📄',
  spreadsheet: '📊',
  presentation: '📽️',
  archive: '📦',
  code: '💻',
  database: '🗄️',
  geodata: '🗺️',
  other: '📎',
};

/** Color classes for file types (Tailwind) */
export const FILE_TYPE_COLORS: Record<FileType, string> = {
  image: 'text-purple-500 bg-purple-50',
  video: 'text-pink-500 bg-pink-50',
  audio: 'text-amber-500 bg-amber-50',
  document: 'text-blue-500 bg-blue-50',
  spreadsheet: 'text-green-500 bg-green-50',
  presentation: 'text-orange-500 bg-orange-50',
  archive: 'text-gray-500 bg-gray-50',
  code: 'text-cyan-500 bg-cyan-50',
  database: 'text-indigo-500 bg-indigo-50',
  geodata: 'text-emerald-500 bg-emerald-50',
  other: 'text-gray-400 bg-gray-50',
};

/** Labels for file permissions */
export const FILE_PERMISSION_LABELS: Record<FilePermission, string> = {
  view: 'Lecture',
  download: 'Téléchargement',
  comment: 'Commentaire',
  edit: 'Modification',
  delete: 'Suppression',
  share: 'Partage',
  admin: 'Administration',
};

/** Labels for processing status */
export const PROCESSING_STATUS_LABELS: Record<FileProcessingStatus, string> = {
  pending: 'En attente',
  uploading: 'Téléversement...',
  processing: 'Traitement...',
  scanning: 'Analyse antivirus...',
  done: 'Terminé',
  error: 'Erreur',
  quarantine: 'Quarantaine',
};

/** Labels for lifecycle status */
export const LIFECYCLE_STATUS_LABELS: Record<FileLifecycleStatus, string> = {
  active: 'Actif',
  archived: 'Archivé',
  trashed: 'Corbeille',
  expired: 'Expiré',
  locked: 'Verrouillé',
};

// ============================================================================
// SECTION 10: UTILITY FUNCTIONS
// ============================================================================

/**
 * Get file type from MIME type.
 */
export function getFileTypeFromMime(mimeType: string): FileType {
  if (!mimeType) return 'other';
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || mimeType.includes('csv')) return 'spreadsheet';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'presentation';
  if (mimeType === 'application/pdf' || mimeType.includes('word') || mimeType.includes('document') || mimeType === 'text/plain') return 'document';
  if (mimeType.includes('zip') || mimeType.includes('archive') || mimeType.includes('compressed') || mimeType.includes('rar') || mimeType.includes('7z')) return 'archive';
  if (mimeType.includes('json') || mimeType.includes('javascript') || mimeType.includes('typescript') || mimeType.includes('html') || mimeType.includes('css') || mimeType.includes('python') || mimeType.includes('sql')) return 'code';
  if (mimeType.includes('geojson') || mimeType.includes('kml') || mimeType.includes('shapefile')) return 'geodata';
  if (mimeType.includes('sqlite') || mimeType.includes('database')) return 'database';
  return 'other';
}

/**
 * Get file type label.
 */
export function getFileTypeLabel(type: FileType): string {
  return FILE_TYPE_LABELS[type] ?? type;
}

/**
 * Get file type icon.
 */
export function getFileTypeIcon(type: FileType): string {
  return FILE_TYPE_ICONS[type] ?? '📎';
}

/**
 * Get file type color classes.
 */
export function getFileTypeColor(type: FileType): string {
  return FILE_TYPE_COLORS[type] ?? 'text-gray-400 bg-gray-50';
}

/**
 * Get permission label.
 */
export function getPermissionLabel(permission: FilePermission): string {
  return FILE_PERMISSION_LABELS[permission] ?? permission;
}

/**
 * Format file size to human-readable string.
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (bytes < 0) return '—';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Format duration (seconds) to MM:SS or HH:MM:SS.
 */
export function formatDuration(seconds: number): string {
  if (seconds < 0 || !Number.isFinite(seconds)) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Get file extension from filename.
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
}

/**
 * Get filename without extension.
 */
export function getFileNameWithoutExtension(filename: string): string {
  const ext = getFileExtension(filename);
  return ext ? filename.slice(0, -(ext.length + 1)) : filename;
}

/**
 * Check if a file is an image.
 */
export function isImageFile(mimeType: string): boolean {
  return mimeType?.startsWith('image/') ?? false;
}

/**
 * Check if a file is a video.
 */
export function isVideoFile(mimeType: string): boolean {
  return mimeType?.startsWith('video/') ?? false;
}

/**
 * Check if a file is an audio.
 */
export function isAudioFile(mimeType: string): boolean {
  return mimeType?.startsWith('audio/') ?? false;
}

/**
 * Check if a file is a document.
 */
export function isDocumentFile(mimeType: string): boolean {
  if (!mimeType) return false;
  return (
    mimeType === 'application/pdf' ||
    mimeType.includes('word') ||
    mimeType.includes('document') ||
    mimeType === 'text/plain' ||
    mimeType === 'text/csv'
  );
}

/**
 * Check if file has a thumbnail.
 */
export function hasThumbnail(file: FileItem): boolean {
  return !!file.thumbnail && ['image', 'video', 'document'].includes(file.type);
}

/**
 * Check if file is publicly accessible.
 */
export function isPubliclyAccessible(file: FileItem): boolean {
  if (!file.is_public) return false;
  if (file.public_link_expires) {
    return new Date(file.public_link_expires) > new Date();
  }
  return true;
}

/**
 * Check if user has specific permission on a file.
 */
export function hasFilePermission(
  file: FileItem,
  permission: FilePermission
): boolean {
  return file.permissions.includes(permission);
}

/**
 * Check if file is in trash.
 */
export function isTrashed(file: FileItem): boolean {
  return file.lifecycle_status === 'trashed';
}

/**
 * Check if file is locked.
 */
export function isLocked(file: FileItem): boolean {
  return file.lifecycle_status === 'locked';
}

/**
 * Create an empty file item.
 */
export function createEmptyFileItem(): FileItem {
  const now = new Date().toISOString();
  return {
    id: '',
    name: '',
    slug: '',
    type: 'other',
    mime_type: 'application/octet-stream',
    size: 0,
    url: '',
    uploaded_by: '',
    uploader_name: '',
    created_at: now,
    updated_at: now,
    permissions: [],
    is_public: false,
    processing_status: 'pending',
    lifecycle_status: 'active',
  };
}

/**
 * Create an empty folder.
 */
export function createEmptyFolder(): Folder {
  const now = new Date().toISOString();
  return {
    id: '',
    name: '',
    slug: '',
    files_count: 0,
    created_at: now,
    created_by: '',
    is_default: false,
  };
}

/**
 * Build folder path string from breadcrumbs.
 */
export function buildFolderPath(breadcrumbs: FolderBreadcrumb[]): string {
  return breadcrumbs.map((b) => b.name).join(' / ');
}

/**
 * Calculate storage usage percentage.
 */
export function calculateStoragePercent(used: number, total: number): number {
  if (total === 0) return 0;
  return Math.min(100, Math.round((used / total) * 100));
}

/**
 * Check if storage is near limit (> 90%).
 */
export function isStorageNearLimit(used: number, total: number): boolean {
  return calculateStoragePercent(used, total) > 90;
}

// ============================================================================
// SECTION 11: EXPORT GROUPING
// ============================================================================

export const FileTypes = {
  FILE_TYPE_LABELS,
  FILE_TYPE_ICONS,
  FILE_TYPE_COLORS,
  FILE_PERMISSION_LABELS,
  PROCESSING_STATUS_LABELS,
  LIFECYCLE_STATUS_LABELS,
  getFileTypeFromMime,
  getFileTypeLabel,
  getFileTypeIcon,
  getFileTypeColor,
  getPermissionLabel,
  formatFileSize,
  formatDuration,
  getFileExtension,
  getFileNameWithoutExtension,
  isImageFile,
  isVideoFile,
  isAudioFile,
  isDocumentFile,
  hasThumbnail,
  isPubliclyAccessible,
  hasFilePermission,
  isTrashed,
  isLocked,
  createEmptyFileItem,
  createEmptyFolder,
  buildFolderPath,
  calculateStoragePercent,
  isStorageNearLimit,
} as const;
