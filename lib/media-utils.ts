import imageCompression from 'browser-image-compression';

// ============================================================================
// SECTION 1: CONSTANTS & TYPES
// ============================================================================

export const MAX_IMAGE_DIMENSION = 4096;
export const MAX_VIDEO_DIMENSION = 3840;

export const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
  'image/svg+xml',
] as const;

export const ACCEPTED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime',
] as const;

export const ACCEPTED_AUDIO_TYPES = [
  'audio/mpeg',
  'audio/mp4',
  'audio/wav',
  'audio/ogg',
  'audio/webm',
  'audio/flac',
] as const;

export const ACCEPTED_DOCUMENT_TYPES = [
  'application/pdf',
  'text/plain',
  'text/csv',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
] as const;

export const BLOCKED_EXTENSIONS = [
  '.exe', '.dll', '.bat', '.cmd', '.sh', '.php', '.jsp', '.asp', '.aspx',
  '.jar', '.war', '.ear', '.py', '.rb', '.pl', '.cgi', '.com', '.scr',
  '.msi', '.vbs', '.js', '.wsf', '.hta', '.ps1', '.psm1', '.psd1',
  '.dmg', '.pkg', '.deb', '.rpm', '.app', '.ipa', '.apk',
] as const;

export type ImageType = (typeof ACCEPTED_IMAGE_TYPES)[number];
export type VideoType = (typeof ACCEPTED_VIDEO_TYPES)[number];
export type AudioType = (typeof ACCEPTED_AUDIO_TYPES)[number];
export type DocumentType = (typeof ACCEPTED_DOCUMENT_TYPES)[number];

export type FileCategory = 'image' | 'video' | 'audio' | 'document' | 'other';

export interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  quality?: number; // 0-1 for JPEG/WebP
  preserveExif?: boolean;
}

export interface FileValidationOptions {
  maxSizeBytes?: number;
  maxSizeMB?: number;
  acceptedTypes?: string[];
  acceptedCategories?: FileCategory[];
  blockExtensions?: boolean;
  maxWidth?: number;
  maxHeight?: number;
  minWidth?: number;
  minHeight?: number;
}

export interface FileValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  category?: FileCategory;
  dimensions?: { width: number; height: number };
  duration?: number;
  sizeMB?: number;
}

export interface ThumbnailOptions {
  time?: number; // seconds for video
  quality?: number; // 0-1
  maxWidth?: number;
  maxHeight?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

export interface WaveformOptions {
  samples?: number;
  channel?: number; // 0 = left, 1 = right, default = 0
}

export interface DrawWaveformOptions {
  color?: string;
  backgroundColor?: string;
  barWidth?: number;
  gap?: number;
  progress?: number; // 0-1
  progressColor?: string;
  barRadius?: number;
  mirror?: boolean; // mirror waveform vertically
}

// ============================================================================
// SECTION 2: IMAGE COMPRESSION
// ============================================================================

/**
 * Compress an image file before upload.
 * Returns original file if compression fails or file is not an image.
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const {
    maxSizeMB = 2,
    maxWidthOrHeight = MAX_IMAGE_DIMENSION,
    quality = 0.8,
    preserveExif = false,
  } = options;

  // Skip non-image files
  if (!isImageFile(file)) {
    return file;
  }

  // Skip SVG (already vector)
  if (file.type === 'image/svg+xml') {
    return file;
  }

  // Skip small files
  if (file.size <= maxSizeMB * 1024 * 1024) {
    const dimensions = await getImageDimensions(file);
    if (dimensions.width <= maxWidthOrHeight && dimensions.height <= maxWidthOrHeight) {
      return file;
    }
  }

  const compressionOptions = {
    maxSizeMB,
    maxWidthOrHeight,
    useWebWorker: true,
    fileType: file.type as 'image/jpeg' | 'image/png' | 'image/webp',
    preserveExif,
    initialQuality: quality,
  };

  try {
    const compressed = await imageCompression(file, compressionOptions);
    return new File([compressed], file.name, {
      type: file.type,
      lastModified: file.lastModified,
    });
  } catch (error) {
    console.warn('[compressImage] Compression failed, returning original:', error);
    return file;
  }
}

/**
 * Batch compress multiple images.
 */
export async function compressImages(
  files: File[],
  options: CompressionOptions = {}
): Promise<File[]> {
  return Promise.all(files.map((file) => compressImage(file, options)));
}

/**
 * Convert image to WebP format (better compression).
 */
export async function convertToWebP(
  file: File,
  quality = 0.85
): Promise<File> {
  if (!isImageFile(file)) throw new Error('Not an image file');

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('WebP conversion failed'));
            return;
          }
          const name = file.name.replace(/\.[^.]+$/, '.webp');
          resolve(new File([blob], name, { type: 'image/webp' }));
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Image load failed'));
    };

    img.src = url;
  });
}

// ============================================================================
// SECTION 3: VIDEO THUMBNAIL GENERATION
// ============================================================================

/**
 * Generate a thumbnail from a video file at a specific time.
 */
export async function generateVideoThumbnail(
  file: File,
  options: ThumbnailOptions = {}
): Promise<string> {
  const {
    time = 1,
    quality = 0.7,
    maxWidth = 1280,
    maxHeight = 720,
    format = 'jpeg',
  } = options;

  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const url = URL.createObjectURL(file);
    video.src = url;
    video.currentTime = time;
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = 'anonymous';

    const cleanup = () => URL.revokeObjectURL(url);

    video.onloadeddata = () => {
      // Calculate scaled dimensions
      let { videoWidth: w, videoHeight: h } = video;
      const ratio = Math.min(maxWidth / w, maxHeight / h, 1);
      w = Math.round(w * ratio);
      h = Math.round(h * ratio);

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        cleanup();
        reject(new Error('Canvas context not available'));
        return;
      }

      // Fill black background for letterboxing
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(video, 0, 0, w, h);

      cleanup();
      resolve(canvas.toDataURL(`image/${format}`, quality));
    };

    video.onerror = () => {
      cleanup();
      reject(new Error('Failed to generate video thumbnail'));
    };

    // Timeout fallback
    setTimeout(() => {
      cleanup();
      reject(new Error('Thumbnail generation timeout'));
    }, 10000);
  });
}

/**
 * Generate multiple thumbnails from a video (storyboard style).
 */
export async function generateVideoThumbnails(
  file: File,
  count = 5
): Promise<string[]> {
  const duration = await getVideoDuration(file);
  const interval = duration / (count + 1);
  const promises: Promise<string>[] = [];

  for (let i = 1; i <= count; i++) {
    promises.push(
      generateVideoThumbnail(file, { time: interval * i, quality: 0.5, maxWidth: 320 })
    );
  }

  return Promise.all(promises);
}

// ============================================================================
// SECTION 4: AUDIO WAVEFORM GENERATION
// ============================================================================

/**
 * Generate waveform data from an audio file.
 * Returns normalized amplitude values (0-1).
 */
export async function generateWaveform(
  file: File,
  options: WaveformOptions = {}
): Promise<number[]> {
  const { samples = 100, channel = 0 } = options;

  const audioContext = getAudioContext();
  const arrayBuffer = await file.arrayBuffer();

  try {
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    const channelData = audioBuffer.getChannelData(
      Math.min(channel, audioBuffer.numberOfChannels - 1)
    );

    const blockSize = Math.max(1, Math.floor(channelData.length / samples));
    const waveform: number[] = [];

    for (let i = 0; i < samples; i++) {
      const start = i * blockSize;
      const end = Math.min(start + blockSize, channelData.length);
      let sum = 0;
      for (let j = start; j < end; j++) {
        sum += Math.abs(channelData[j]);
      }
      waveform.push(sum / (end - start));
    }

    // Normalize to 0-1 range
    const max = Math.max(...waveform, 0.001); // avoid div by zero
    return waveform.map((v) => Math.min(1, v / max));
  } catch (error) {
    console.error('[generateWaveform] Failed:', error);
    // Return flat waveform as fallback
    return new Array(samples).fill(0.1);
  }
}

/**
 * Get AudioContext with fallback for Safari.
 */
function getAudioContext(): AudioContext {
  const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) {
    throw new Error('Web Audio API not supported');
  }
  return new AudioContextClass();
}

// ============================================================================
// SECTION 5: MEDIA DURATION & DIMENSIONS
// ============================================================================

/**
 * Get audio duration in seconds.
 */
export async function getAudioDuration(file: File): Promise<number> {
  return getMediaDuration(file, 'audio');
}

/**
 * Get video duration in seconds.
 */
export async function getVideoDuration(file: File): Promise<number> {
  return getMediaDuration(file, 'video');
}

/**
 * Generic media duration getter.
 */
function getMediaDuration(file: File, type: 'audio' | 'video'): Promise<number> {
  return new Promise((resolve) => {
    const media = document.createElement(type);
    const url = URL.createObjectURL(file);
    media.src = url;
    media.preload = 'metadata';

    const cleanup = () => URL.revokeObjectURL(url);

    media.onloadedmetadata = () => {
      cleanup();
      resolve(Number.isFinite(media.duration) ? media.duration : 0);
    };

    media.onerror = () => {
      cleanup();
      resolve(0);
    };

    // Force load
    media.load();

    // Timeout fallback (5s)
    setTimeout(() => {
      cleanup();
      resolve(0);
    }, 5000);
  });
}

/**
 * Get image dimensions (width x height).
 */
export async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  if (!isImageFile(file)) {
    return { width: 0, height: 0 };
  }

  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ width: 0, height: 0 });
    };

    // Timeout fallback (5s)
    setTimeout(() => {
      URL.revokeObjectURL(url);
      resolve({ width: 0, height: 0 });
    }, 5000);

    img.src = url;
  });
}

/**
 * Get video dimensions.
 */
export async function getVideoDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    const url = URL.createObjectURL(file);
    video.src = url;
    video.preload = 'metadata';

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve({ width: video.videoWidth, height: video.videoHeight });
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ width: 0, height: 0 });
    };

    setTimeout(() => {
      URL.revokeObjectURL(url);
      resolve({ width: 0, height: 0 });
    }, 5000);

    video.load();
  });
}

// ============================================================================
// SECTION 6: FILE VALIDATION
// ============================================================================

/**
 * Comprehensive file validation with detailed results.
 */
export async function validateFile(
  file: File,
  options: FileValidationOptions = {}
): Promise<FileValidationResult> {
  const {
    maxSizeBytes,
    maxSizeMB,
    acceptedTypes,
    acceptedCategories,
    blockExtensions = true,
    maxWidth,
    maxHeight,
    minWidth,
    minHeight,
  } = options;

  const errors: string[] = [];
  const warnings: string[] = [];
  const result: FileValidationResult = { valid: true, errors, warnings };

  // Detect category
  const category = detectFileCategory(file);
  result.category = category;
  result.sizeMB = Math.round((file.size / 1024 / 1024) * 100) / 100;

  // Check blocked extensions
  if (blockExtensions) {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (BLOCKED_EXTENSIONS.includes(ext as typeof BLOCKED_EXTENSIONS[number])) {
      errors.push(`Type de fichier non autorisé pour des raisons de sécurité: ${ext}`);
    }
  }

  // Check MIME type
  if (acceptedTypes && !acceptedTypes.includes(file.type)) {
    errors.push(`Type de fichier non supporté: ${file.type}`);
  }

  // Check category filter
  if (acceptedCategories && !acceptedCategories.includes(category)) {
    errors.push(`Catégorie non acceptée: ${category}`);
  }

  // Check size
  const sizeLimit = maxSizeBytes || (maxSizeMB ? maxSizeMB * 1024 * 1024 : undefined);
  if (sizeLimit && file.size > sizeLimit) {
    const limitMB = Math.round(sizeLimit / 1024 / 1024);
    errors.push(`Fichier trop volumineux: ${result.sizeMB}MB (max ${limitMB}MB)`);
  }

  // Check image dimensions
  if (category === 'image' && (maxWidth || maxHeight || minWidth || minHeight)) {
    const dims = await getImageDimensions(file);
    result.dimensions = dims;

    if (maxWidth && dims.width > maxWidth) {
      errors.push(`Largeur trop grande: ${dims.width}px (max ${maxWidth}px)`);
    }
    if (maxHeight && dims.height > maxHeight) {
      errors.push(`Hauteur trop grande: ${dims.height}px (max ${maxHeight}px)`);
    }
    if (minWidth && dims.width < minWidth) {
      errors.push(`Largeur trop petite: ${dims.width}px (min ${minWidth}px)`);
    }
    if (minHeight && dims.height < minHeight) {
      errors.push(`Hauteur trop petite: ${dims.height}px (min ${minHeight}px)`);
    }
  }

  // Check video dimensions
  if (category === 'video' && (maxWidth || maxHeight)) {
    const dims = await getVideoDimensions(file);
    result.dimensions = dims;

    if (maxWidth && dims.width > maxWidth) {
      errors.push(`Résolution vidéo trop élevée: ${dims.width}px (max ${maxWidth}px)`);
    }
    if (maxHeight && dims.height > maxHeight) {
      errors.push(`Résolution vidéo trop élevée: ${dims.height}px (max ${maxHeight}px)`);
    }
  }

  // Check duration for audio/video
  if (category === 'audio') {
    result.duration = await getAudioDuration(file);
  } else if (category === 'video') {
    result.duration = await getVideoDuration(file);
  }

  result.valid = errors.length === 0;
  return result;
}

/**
 * Quick file validation (synchronous, no dimension checks).
 */
export function validateFileQuick(
  file: File,
  options: {
    maxSizeBytes?: number;
    acceptedTypes?: string[];
    blockExtensions?: boolean;
  } = {}
): { valid: boolean; error?: string } {
  const { maxSizeBytes, acceptedTypes, blockExtensions = true } = options;

  if (blockExtensions) {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (BLOCKED_EXTENSIONS.includes(ext as typeof BLOCKED_EXTENSIONS[number])) {
      return { valid: false, error: `Type de fichier non autorisé: ${ext}` };
    }
  }

  if (acceptedTypes && !acceptedTypes.includes(file.type)) {
    return { valid: false, error: `Type non supporté: ${file.type}` };
  }

  if (maxSizeBytes && file.size > maxSizeBytes) {
    const maxMB = Math.round(maxSizeBytes / 1024 / 1024);
    return { valid: false, error: `Fichier trop volumineux (max ${maxMB}MB)` };
  }

  return { valid: true };
}

// ============================================================================
// SECTION 7: FILE CATEGORY DETECTION
// ============================================================================

/**
 * Detect file category from MIME type.
 */
export function detectFileCategory(file: File): FileCategory {
  if (!file?.type) return 'other';
  if (isImageFile(file)) return 'image';
  if (isVideoFile(file)) return 'video';
  if (isAudioFile(file)) return 'audio';
  if (isDocumentFile(file)) return 'document';
  return 'other';
}

/**
 * Check if file is an image.
 */
export function isImageFile(file: File): boolean {
  return ACCEPTED_IMAGE_TYPES.includes(file.type as ImageType);
}

/**
 * Check if file is a video.
 */
export function isVideoFile(file: File): boolean {
  return ACCEPTED_VIDEO_TYPES.includes(file.type as VideoType);
}

/**
 * Check if file is an audio.
 */
export function isAudioFile(file: File): boolean {
  return ACCEPTED_AUDIO_TYPES.includes(file.type as AudioType);
}

/**
 * Check if file is a document.
 */
export function isDocumentFile(file: File): boolean {
  return ACCEPTED_DOCUMENT_TYPES.includes(file.type as DocumentType);
}

/**
 * Get file extension.
 */
export function getFileExtension(file: File): string {
  return file.name.split('.').pop()?.toLowerCase() || '';
}

/**
 * Get file name without extension.
 */
export function getFileNameWithoutExtension(file: File): string {
  const ext = getFileExtension(file);
  return ext ? file.name.slice(0, -(ext.length + 1)) : file.name;
}

// ============================================================================
// SECTION 8: OBJECT URL MANAGEMENT
// ============================================================================

/**
 * Create an object URL with automatic cleanup helper.
 */
export function createObjectURL(file: File): { url: string; revoke: () => void } {
  const url = URL.createObjectURL(file);
  return {
    url,
    revoke: () => {
      URL.revokeObjectURL(url);
    },
  };
}

/**
 * Create multiple object URLs with batch cleanup.
 */
export function createObjectURLs(files: File[]): {
  urls: string[];
  revokeAll: () => void;
} {
  const entries = files.map((file) => createObjectURL(file));
  return {
    urls: entries.map((e) => e.url),
    revokeAll: () => entries.forEach((e) => e.revoke()),
  };
}

/**
 * Auto-revoke object URL after a delay (useful for temporary previews).
 */
export function createTemporaryObjectURL(
  file: File,
  ttlMs = 60000
): { url: string; cancel: () => void } {
  const { url, revoke } = createObjectURL(file);
  const timer = setTimeout(revoke, ttlMs);
  return {
    url,
    cancel: () => {
      clearTimeout(timer);
      revoke();
    },
  };
}

// ============================================================================
// SECTION 9: WAVEFORM CANVAS DRAWING
// ============================================================================

/**
 * Draw a waveform visualization on a canvas.
 */
export function drawWaveform(
  canvas: HTMLCanvasElement,
  waveform: number[],
  options: DrawWaveformOptions = {}
): void {
  const {
    color = '#16A34A',
    backgroundColor = 'transparent',
    barWidth = 3,
    gap = 2,
    progress = 0,
    progressColor = '#22C55E',
    barRadius = 2,
    mirror = false,
  } = options;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const { width, height } = canvas;
  ctx.clearRect(0, 0, width, height);

  if (backgroundColor !== 'transparent') {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);
  }

  const totalBars = Math.max(1, Math.floor(width / (barWidth + gap)));
  const step = Math.max(1, Math.floor(waveform.length / totalBars));
  const progressX = width * Math.max(0, Math.min(1, progress));
  const centerY = height / 2;

  for (let i = 0; i < totalBars; i++) {
    const x = i * (barWidth + gap);
    const sampleIndex = Math.min(i * step, waveform.length - 1);
    const amplitude = waveform[sampleIndex] || 0;

    // Scale amplitude with minimum visible height
    const barHeight = Math.max(2, amplitude * height * 0.8);

    const isProgress = x < progressX;
    ctx.fillStyle = isProgress ? progressColor : color;

    if (mirror) {
      // Draw mirrored bars (top and bottom from center)
      const halfHeight = barHeight / 2;
      drawRoundedRect(ctx, x, centerY - halfHeight, barWidth, halfHeight, barRadius);
      drawRoundedRect(ctx, x, centerY, barWidth, halfHeight, barRadius);
    } else {
      // Draw bars from bottom
      const y = (height - barHeight) / 2;
      drawRoundedRect(ctx, x, y, barWidth, barHeight, barRadius);
    }
  }
}

/**
 * Draw a rounded rectangle on canvas.
 */
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
  ctx.fill();
}

/**
 * Animate waveform drawing with progress.
 */
export function animateWaveform(
  canvas: HTMLCanvasElement,
  waveform: number[],
  durationMs: number,
  options: DrawWaveformOptions = {}
): { stop: () => void } {
  let startTime: number | null = null;
  let animationId: number;

  const animate = (timestamp: number) => {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const progress = Math.min(1, elapsed / durationMs);

    drawWaveform(canvas, waveform, { ...options, progress });

    if (progress < 1) {
      animationId = requestAnimationFrame(animate);
    }
  };

  animationId = requestAnimationFrame(animate);

  return {
    stop: () => {
      cancelAnimationFrame(animationId);
    },
  };
}

// ============================================================================
// SECTION 10: UTILITY EXPORTS
// ============================================================================

/**
 * Format file size to human readable string.
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
 * Check if browser supports WebP.
 */
export function supportsWebP(): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = 'data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA';
  });
}

/**
 * Check if browser supports AVIF.
 */
export function supportsAVIF(): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=';
  });
}

/**
 * Get optimal image format for browser.
 */
export async function getOptimalImageFormat(): Promise<'webp' | 'avif' | 'jpeg'> {
  if (await supportsAVIF()) return 'avif';
  if (await supportsWebP()) return 'webp';
  return 'jpeg';
}
