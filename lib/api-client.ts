import type { ApiError } from '@/types/api';

// ============================================================================
// SECTION 1: TYPES & INTERFACES
// ============================================================================

export interface ApiClientConfig {
  baseUrl: string;
  apiVersion?: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  credentials?: RequestCredentials;
}

export interface RequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
  timeout?: number;
  signal?: AbortSignal;
  retries?: number;
  cache?: RequestCache;
}

export interface UploadConfig extends RequestConfig {
  onProgress?: (progress: number) => void;
  onUploadStart?: () => void;
  onUploadComplete?: () => void;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  headers: Headers;
  ok: boolean;
}

export interface RetryConfig {
  maxRetries: number;
  delayMs: number;
  backoffMultiplier: number;
  retryableStatuses: number[];
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

export type RequestInterceptor = (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;
export type ResponseInterceptor<T> = (response: ApiResponse<T>) => ApiResponse<T> | Promise<ApiResponse<T>>;
export type ErrorInterceptor = (error: ApiError) => ApiError | Promise<ApiError>;

// ============================================================================
// SECTION 2: DEFAULT CONFIGURATION
// ============================================================================

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const DEFAULT_CONFIG: Required<ApiClientConfig> = {
  baseUrl: API_BASE,
  apiVersion: 'v1',
  timeout: 30000,
  retries: 3,
  retryDelay: 1000,
  credentials: 'include',
};

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  delayMs: 1000,
  backoffMultiplier: 2,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
};

// ============================================================================
// SECTION 3: ERROR HANDLING
// ============================================================================

/**
 * Create a standardized API error from any error source.
 */
class ApiException extends Error implements ApiError {
  code?: string;
  detail?: string | string[] | Record<string, unknown>;
  details?: Record<string, string[]>;
  status: number;
  request_id?: string;
  timestamp?: string;
  path?: string;
  help_url?: string;
  suggestion?: string;

  constructor(payload: Partial<ApiError> & { message?: string; status?: number }) {
    super(payload.message || 'Une erreur inattendue est survenue');
    this.name = 'ApiException';
    this.status = payload.status ?? 0;
    this.code = payload.code;
    this.detail = payload.detail;
    this.details = payload.details as Record<string, string[]> | undefined;
    this.request_id = payload.request_id;
    this.timestamp = payload.timestamp;
    this.path = payload.path;
    this.help_url = payload.help_url;
    this.suggestion = payload.suggestion;

    // Make important props enumerable so console.error prints them as an object
    Object.defineProperties(this, {
      status: { value: this.status, enumerable: true, writable: true },
      code: { value: this.code, enumerable: true, writable: true },
      detail: { value: this.detail, enumerable: true, writable: true },
      details: { value: this.details, enumerable: true, writable: true },
    });
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      code: this.code,
      detail: this.detail,
      details: this.details,
      request_id: this.request_id,
      path: this.path,
    };
  }
}

function createApiError(error: unknown, status?: number): ApiException {
  // If already an ApiException, return as-is
  if (error instanceof ApiException) return error;

  // If object-like and has useful fields, normalize
  if (error && typeof error === 'object') {
    const e = error as Record<string, unknown>;
    const message = (e.message as string) || (e.detail as string) || `Erreur ${status || e.status || 'inconnue'}`;
    const payload: Partial<ApiError> = {
      message,
      status: (e.status as number) ?? status ?? 0,
      code: (e.code as string) ?? undefined,
      detail: (e.detail as string | string[] | Record<string, unknown>) ?? undefined,
      details: (e.details as Record<string, string[]>) ?? undefined,
    };
    return new ApiException(payload);
  }

  if (error instanceof Error) {
    return new ApiException({ message: error.message, status: status ?? 0, code: 'NETWORK_ERROR' });
  }

  return new ApiException({ message: 'Une erreur inattendue est survenue', status: status ?? 0, code: 'UNKNOWN_ERROR' });
}

/**
 * Get user-friendly error message based on status code.
 */
export function getErrorMessage(error: ApiError): string {
  const messages: Record<number, string> = {
    400: 'Requête invalide. Vérifiez vos données.',
    401: 'Session expirée. Veuillez vous reconnecter.',
    403: 'Accès interdit. Permissions insuffisantes.',
    404: 'Ressource non trouvée.',
    408: "Délai d'attente dépassé. Veuillez réessayer.",
    409: 'Conflit détecté. La ressource existe déjà.',
    422: 'Données invalides. Veuillez corriger les erreurs.',
    429: 'Trop de requêtes. Veuillez patienter.',
    500: 'Erreur serveur. Veuillez réessayer plus tard.',
    502: 'Service temporairement indisponible.',
    503: 'Service en maintenance.',
    504: 'Délai de réponse du serveur dépassé.',
  };

  return error.message || messages[error.status || 0] || `Erreur ${error.status || 'inconnue'}`;
}

/**
 * Check if error is retryable.
 */
function isRetryableError(error: ApiError, retryConfig: RetryConfig): boolean {
  if (!error.status) return true; // Network errors are retryable
  return retryConfig.retryableStatuses.includes(error.status);
}

/**
 * Delay helper for retry backoff.
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================================
// SECTION 4: API CLIENT CLASS
// ============================================================================

class ApiClient {
  private config: Required<ApiClientConfig>;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor<unknown>[] = [];
  private errorInterceptors: ErrorInterceptor[] = [];

  constructor(config?: Partial<ApiClientConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Interceptors
  // ───────────────────────────────────────────────────────────────────────────

  addRequestInterceptor(interceptor: RequestInterceptor): () => void {
    this.requestInterceptors.push(interceptor);
    return () => {
      const index = this.requestInterceptors.indexOf(interceptor);
      if (index > -1) this.requestInterceptors.splice(index, 1);
    };
  }

  addResponseInterceptor<T>(interceptor: ResponseInterceptor<T>): () => void {
    this.responseInterceptors.push(interceptor as ResponseInterceptor<unknown>);
    return () => {
      const index = this.responseInterceptors.indexOf(interceptor as ResponseInterceptor<unknown>);
      if (index > -1) this.responseInterceptors.splice(index, 1);
    };
  }

  addErrorInterceptor(interceptor: ErrorInterceptor): () => void {
    this.errorInterceptors.push(interceptor);
    return () => {
      const index = this.errorInterceptors.indexOf(interceptor);
      if (index > -1) this.errorInterceptors.splice(index, 1);
    };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Headers & Auth
  // ───────────────────────────────────────────────────────────────────────────

  private async getHeaders(customHeaders?: Record<string, string>): Promise<HeadersInit> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...customHeaders,
    };

    // CSRF token
    const csrfToken = this.getCsrfToken();
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }

    // Auth token from localStorage (fallback if cookie not available)
    const authToken = this.getAuthToken();
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    // Language preference
    const language = this.getLanguage();
    if (language) {
      headers['Accept-Language'] = language;
    }

    return headers;
  }

  private getCsrfToken(): string | null {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(/csrf_token=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }

  private getLanguage(): string | null {
    if (typeof navigator === 'undefined') return null;
    return navigator.language || 'fr-FR';
  }

  // ───────────────────────────────────────────────────────────────────────────
  // URL Building
  // ───────────────────────────────────────────────────────────────────────────

  private buildUrl(path: string, params?: Record<string, string | number | boolean | undefined | null>): string {
    const url = new URL(
      path.startsWith('http') ? path : `${this.config.baseUrl}/api/${this.config.apiVersion}${path}`
    );

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.set(key, String(value));
        }
      });
    }

    return url.toString();
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Core Request with Retry
  // ───────────────────────────────────────────────────────────────────────────

  private async executeRequest<T>(
    method: HttpMethod,
    path: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    let requestConfig = { ...config };

    // Apply request interceptors
    for (const interceptor of this.requestInterceptors) {
      requestConfig = await interceptor(requestConfig);
    }

    const url = this.buildUrl(path, requestConfig.params);
    const headers = await this.getHeaders(requestConfig.headers);
    const timeout = requestConfig.timeout || this.config.timeout;

    // AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    // Merge signals if provided
    if (requestConfig.signal) {
      requestConfig.signal.addEventListener('abort', () => controller.abort());
    }

    const retryConfig: RetryConfig = {
      ...DEFAULT_RETRY_CONFIG,
      maxRetries: requestConfig.retries ?? this.config.retries,
    };

    let lastError: ApiError | undefined;

    for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          method,
          headers,
          credentials: this.config.credentials,
          mode: 'cors',
          signal: controller.signal,
          body: method !== 'GET' && method !== 'HEAD' ? JSON.stringify(requestConfig.body || undefined) : undefined,
        });

        clearTimeout(timeoutId);

        const apiResponse: ApiResponse<T> = {
          data: undefined as T,
          status: response.status,
          headers: response.headers,
          ok: response.ok,
        };

        // Handle empty responses
        if (response.status === 204 || response.headers.get('content-length') === '0') {
          apiResponse.data = undefined as T;
          return apiResponse;
        }

        // Parse JSON
        if (response.ok) {
          const data = await response.json();
          apiResponse.data = data;

          // Apply response interceptors
          let interceptedResponse = apiResponse;
          for (const interceptor of this.responseInterceptors) {
            interceptedResponse = await interceptor(interceptedResponse) as ApiResponse<T>;
          }
          return interceptedResponse;
        }

        // Handle error response
        let errorData: Partial<ApiError> = {};
        try {
          errorData = await response.json();
        } catch {
          // JSON parse failed, use status text
        }

        const detailMessage =
          typeof errorData.detail === 'string'
            ? errorData.detail
            : Array.isArray(errorData.detail)
              ? errorData.detail.join(', ')
              : undefined;

        const error: ApiError = {
          message: errorData.message || detailMessage || `Erreur ${response.status}: ${response.statusText}`,
          code: errorData.code,
          details: errorData.details,
          status: response.status,
        };

        lastError = error;

        if (!isRetryableError(error, retryConfig) || attempt >= retryConfig.maxRetries) {
          break;
        }

        // Exponential backoff
        const backoffDelay = retryConfig.delayMs * Math.pow(retryConfig.backoffMultiplier, attempt);
        await delay(backoffDelay);

      } catch (fetchError) {
        clearTimeout(timeoutId);

        const error = createApiError(fetchError);
        lastError = error;

        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          error.code = 'TIMEOUT';
          error.message = "Délai d'attente dépassé";
          break;
        }

        if (!isRetryableError(error, retryConfig) || attempt >= retryConfig.maxRetries) {
          break;
        }

        const backoffDelay = retryConfig.delayMs * Math.pow(retryConfig.backoffMultiplier, attempt);
        await delay(backoffDelay);
      }
    }

    // Normalize last error into an ApiException before running interceptors
    let finalError = createApiError(lastError ?? { message: 'Erreur inconnue' }, (lastError as ApiError)?.status);
    for (const interceptor of this.errorInterceptors) {
      // Interceptors may return plain ApiError shapes; re-normalize after each.
      const intercepted = await interceptor(finalError as ApiError);
      finalError = createApiError(intercepted, intercepted.status);
    }

    throw finalError;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Response Handler
  // ───────────────────────────────────────────────────────────────────────────

  private async handleResponse<T>(response: ApiResponse<T>): Promise<T> {
    if (!response.ok) {
      throw createApiError(response.data, response.status);
    }
    return response.data;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // HTTP Methods
  // ───────────────────────────────────────────────────────────────────────────

  async get<T>(path: string, config?: RequestConfig): Promise<T> {
    const response = await this.executeRequest<T>('GET', path, config);
    return this.handleResponse(response);
  }

  async post<T>(path: string, body?: unknown, config?: RequestConfig): Promise<T> {
    const response = await this.executeRequest<T>('POST', path, { ...config, body: body as Record<string, unknown> });
    return this.handleResponse(response);
  }

  async put<T>(path: string, body?: unknown, config?: RequestConfig): Promise<T> {
    const response = await this.executeRequest<T>('PUT', path, { ...config, body: body as Record<string, unknown> });
    return this.handleResponse(response);
  }

  async patch<T>(path: string, body?: unknown, config?: RequestConfig): Promise<T> {
    const response = await this.executeRequest<T>('PATCH', path, { ...config, body: body as Record<string, unknown> });
    return this.handleResponse(response);
  }

  async delete<T>(path: string, config?: RequestConfig): Promise<T> {
    const response = await this.executeRequest<T>('DELETE', path, config);
    return this.handleResponse(response);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Upload with Progress
  // ───────────────────────────────────────────────────────────────────────────

  async upload<T>(path: string, formData: FormData, config?: UploadConfig): Promise<T> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const url = this.buildUrl(path);

      xhr.open('POST', url);
      xhr.withCredentials = true;

      // Headers (without Content-Type — browser sets it with boundary)
      const csrfToken = this.getCsrfToken();
      if (csrfToken) xhr.setRequestHeader('X-CSRF-Token', csrfToken);

      const authToken = this.getAuthToken();
      if (authToken) xhr.setRequestHeader('Authorization', `Bearer ${authToken}`);

      // Progress tracking
      if (config?.onProgress) {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            config.onProgress!(progress);
          }
        };
      }

      xhr.upload.onloadstart = () => config?.onUploadStart?.();
      xhr.upload.onloadend = () => config?.onUploadComplete?.();

      // Timeout
      const timeout = config?.timeout || this.config.timeout;
      xhr.timeout = timeout;

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            resolve(data);
          } catch {
            resolve(xhr.responseText as T);
          }
        } else {
          let error: ApiError;
          try {
            const data = JSON.parse(xhr.responseText);
            error = {
              message: data.detail || data.message || 'Upload échoué',
              code: data.code,
              status: xhr.status,
            };
          } catch {
            error = {
              message: `Upload échoué: ${xhr.statusText}`,
              status: xhr.status,
            };
          }
          reject(error);
        }
      };

      xhr.onerror = () => reject({ message: 'Erreur réseau', status: 0, code: 'NETWORK_ERROR' });
      xhr.ontimeout = () => reject({ message: "Délai d'attente dépassé", status: 0, code: 'TIMEOUT' });
      xhr.onabort = () => reject({ message: 'Upload annulé', status: 0, code: 'ABORTED' });

      xhr.send(formData);
    });
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Batch Requests
  // ───────────────────────────────────────────────────────────────────────────

  async batch<T>(requests: { method: HttpMethod; path: string; body?: unknown }[]): Promise<T[]> {
    return Promise.all(
      requests.map((req) => {
        switch (req.method) {
          case 'GET':
            return this.get<T>(req.path);
          case 'POST':
            return this.post<T>(req.path, req.body);
          case 'PUT':
            return this.put<T>(req.path, req.body);
          case 'PATCH':
            return this.patch<T>(req.path, req.body);
          case 'DELETE':
            return this.delete<T>(req.path);
          default:
            return this.get<T>(req.path);
        }
      })
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Cancelable Request Wrapper
  // ───────────────────────────────────────────────────────────────────────────

  createCancelableRequest<T>(method: HttpMethod, path: string, config?: RequestConfig) {
    const controller = new AbortController();

    const promise = this.executeRequest<T>(method, path, {
      ...config,
      signal: controller.signal,
    });

    return {
      promise: promise.then((res) => this.handleResponse(res)),
      cancel: () => controller.abort(),
    };
  }
}

// ============================================================================
// SECTION 5: EXPORTED INSTANCE & HELPERS
// ============================================================================

/**
 * Global API client instance.
 */
export const apiClient = new ApiClient();

/**
 * Create a new API client with custom config.
 */
export function createApiClient(config?: Partial<ApiClientConfig>): ApiClient {
  return new ApiClient(config);
}

/**
 * Convenience exports for direct usage.
 */
export const api = {
  get: <T>(path: string, config?: RequestConfig) => apiClient.get<T>(path, config),
  post: <T>(path: string, body?: unknown, config?: RequestConfig) => apiClient.post<T>(path, body, config),
  put: <T>(path: string, body?: unknown, config?: RequestConfig) => apiClient.put<T>(path, body, config),
  patch: <T>(path: string, body?: unknown, config?: RequestConfig) => apiClient.patch<T>(path, body, config),
  delete: <T>(path: string, config?: RequestConfig) => apiClient.delete<T>(path, config),
  upload: <T>(path: string, formData: FormData, config?: UploadConfig) => apiClient.upload<T>(path, formData, config),
  batch: <T>(requests: { method: HttpMethod; path: string; body?: unknown }[]) => apiClient.batch<T>(requests),
};

// ============================================================================
// SECTION 6: PRE-CONFIGURED API CLIENTS
// ============================================================================

/**
 * Public API client (no auth required).
 */
export const publicApi = createApiClient({
  credentials: 'same-origin',
});

/**
 * Authenticated API client (with auth headers).
 */
export const authApi = createApiClient({
  credentials: 'include',
});

/**
 * Upload API client (extended timeout).
 */
export const uploadApi = createApiClient({
  timeout: 120000, // 2 minutes
  retries: 1,
});

// ============================================================================
// SECTION 7: EXAMPLE INTERCEPTORS
// ============================================================================

/**
 * Request interceptor that adds auth token from localStorage.
 */
export const authRequestInterceptor: RequestInterceptor = (config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
};

/**
 * Response interceptor that handles 401 by redirecting to login.
 */
export const authResponseInterceptor: ResponseInterceptor<unknown> = (response) => {
  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      window.location.href = '/login?expired=true';
    }
  }
  return response;
};

/**
 * Error interceptor that logs errors.
 */
export const loggingErrorInterceptor: ErrorInterceptor = (error) => {
  try {
    // If the error exposes a toJSON method, prefer it.
    if (
      typeof error === 'object' &&
      error !== null &&
      'toJSON' in error &&
      typeof (error as { toJSON?: unknown }).toJSON === 'function'
    ) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      console.error('[API Error]', (error as { toJSON: () => unknown }).toJSON());
      return error;
    }

    if (typeof error === 'object' && error !== null) {
      const e = error as unknown as Record<string, unknown>;
      const payload = {
        status: typeof e.status === 'number' ? (e.status as number) : undefined,
        code: typeof e.code === 'string' ? (e.code as string) : undefined,
        message: typeof e.message === 'string' ? (e.message as string) : undefined,
        details: e.details,
      };
      console.error('[API Error]', payload);
      return error;
    }

    console.error('[API Error]', String(error));
  } catch {
    console.error('[API Error] (failed to serialize)', error);
  }

  return error;
};

// Register default interceptors
apiClient.addRequestInterceptor(authRequestInterceptor);
apiClient.addResponseInterceptor(authResponseInterceptor);
apiClient.addErrorInterceptor(loggingErrorInterceptor);
