import { QueryClient, QueryCache, MutationCache, DefaultOptions } from '@tanstack/react-query';
import { toast } from 'sonner';

// ============================================================================
// SECTION 1: ERROR HANDLING UTILITIES
// ============================================================================

/**
 * Type guard for API errors with status codes.
 */
interface ApiError {
  status?: number;
  message?: string;
  code?: string;
}

function isApiError(error: unknown): error is ApiError {
  return typeof error === 'object' && error !== null && 'status' in error;
}

/**
 * Extract user-friendly error message from API error.
 */
export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    switch (error.status) {
      case 400:
        return error.message || 'Requête invalide. Vérifiez vos données.';
      case 401:
        return 'Session expirée. Veuillez vous reconnecter.';
      case 403:
        return "Accès interdit. Vous n'avez pas les permissions nécessaires.";
      case 404:
        return 'Ressource non trouvée.';
      case 409:
        return 'Conflit détecté. La ressource existe déjà.';
      case 422:
        return 'Données invalides. Veuillez corriger les erreurs.';
      case 429:
        return 'Trop de requêtes. Veuillez patienter.';
      case 500:
        return 'Erreur serveur. Veuillez réessayer plus tard.';
      case 503:
        return 'Service temporairement indisponible.';
      default:
        return error.message || `Erreur ${error.status || 'inconnue'}`;
    }
  }
  if (error instanceof Error) return error.message;
  return 'Une erreur inattendue est survenue.';
}

/**
 * Determine if an error is retryable based on HTTP status.
 */
export function isRetryableError(error: unknown): boolean {
  if (!isApiError(error)) return true;
  const nonRetryableStatuses = [400, 401, 403, 404, 409, 422];
  return !nonRetryableStatuses.includes(error.status ?? 0);
}

/**
 * Calculate retry delay with exponential backoff.
 */
export function getRetryDelay(failureCount: number): number {
  return Math.min(1000 * Math.pow(2, failureCount - 1), 30000); // Max 30s
}

// ============================================================================
// SECTION 2: QUERY CONFIGURATION
// ============================================================================

/**
 * Default query options for data fetching.
 */
export const defaultQueryOptions: DefaultOptions['queries'] = {
  // Cache behavior
  staleTime: 5 * 60 * 1000,        // 5 minutes — data considered fresh
  gcTime: 10 * 60 * 1000,          // 10 minutes — garbage collection time

  // Retry logic with smart backoff
  retry: (failureCount, error) => {
    if (!isRetryableError(error)) return false;
    return failureCount < 3; // Max 3 retries for retryable errors
  },
  retryDelay: (retryCount) => getRetryDelay(retryCount),

  // Refetch behavior
  refetchOnWindowFocus: false,     // Don't refetch on tab focus (mobile-friendly)
  refetchOnReconnect: true,        // Refetch when network reconnects
  refetchOnMount: 'always',        // Refetch when component mounts if stale

  // Network behavior
  networkMode: 'online',           // Only run when online
  throwOnError: false,             // Don't throw — handle in UI

  // Pagination defaults
  placeholderData: (previousData: unknown) => previousData, // Keep old data while loading
};

/**
 * Default mutation options for data mutations.
 */
export const defaultMutationOptions: DefaultOptions['mutations'] = {
  retry: false,                    // Never retry mutations (idempotency issues)
  networkMode: 'online',
  throwOnError: false,
};

// ============================================================================
// SECTION 3: QUERY CLIENT FACTORY
// ============================================================================

/**
 * Create a configured QueryClient instance.
 * Supports optional callbacks for global error/success handling.
 */
export function createQueryClient(options?: {
  onError?: (error: unknown, query: { queryKey: unknown[] }) => void;
  onMutationError?: (error: unknown, variables: unknown, context: unknown) => void;
  onMutationSuccess?: (data: unknown, variables: unknown, context: unknown) => void;
}): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: defaultQueryOptions,
      mutations: defaultMutationOptions,
    },
    queryCache: new QueryCache({
      onError: (error, query) => {
        // Log query errors
        console.error(`[Query Error] ${query.queryKey.join('/')}:`, error);

        // Call optional callback
        options?.onError?.(error, { queryKey: query.queryKey as unknown[] });

        // Show toast for non-background refetches
        if (!query.state.data) {
          toast.error(getErrorMessage(error));
        }
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, variables, context, mutation) => {
        console.error(`[Mutation Error] ${mutation.options.mutationKey?.join('/') || 'unknown'}:`, error);
        options?.onMutationError?.(error, variables, context);
        toast.error(getErrorMessage(error));
      },
      onSuccess: (data, variables, context) => {
        options?.onMutationSuccess?.(data, variables, context);
      },
    }),
  });
}

// ============================================================================
// SECTION 4: PRE-CONFIGURED QUERY CLIENT INSTANCE
// ============================================================================

/**
 * Global QueryClient instance for the application.
 * Uses toast notifications for user feedback.
 */
export const queryClient = createQueryClient();

// ============================================================================
// SECTION 5: QUERY KEY FACTORIES
// ============================================================================

/**
 * Centralized query key management for cache invalidation.
 * Follows hierarchical structure: [entity, id, filter, ...params]
 */
export const queryKeys = {
  // Auth
  auth: {
    all: ['auth'] as const,
    session: () => [...queryKeys.auth.all, 'session'] as const,
    user: (id: string) => [...queryKeys.auth.all, 'user', id] as const,
    profile: () => [...queryKeys.auth.all, 'profile'] as const,
  },

  // Actors
  actors: {
    all: ['actors'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.actors.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.actors.all, 'detail', id] as const,
    byCountry: (country: string) => [...queryKeys.actors.all, 'country', country] as const,
    bySector: (sector: string) => [...queryKeys.actors.all, 'sector', sector] as const,
  },

  // Posts
  posts: {
    all: ['posts'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.posts.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.posts.all, 'detail', id] as const,
    comments: (postId: string) => [...queryKeys.posts.all, 'comments', postId] as const,
    reactions: (postId: string) => [...queryKeys.posts.all, 'reactions', postId] as const,
  },

  // Predictions
  predictions: {
    all: ['predictions'] as const,
    yield: (params: Record<string, unknown>) => [...queryKeys.predictions.all, 'yield', params] as const,
    price: (params: Record<string, unknown>) => [...queryKeys.predictions.all, 'price', params] as const,
    weather: (params: Record<string, unknown>) => [...queryKeys.predictions.all, 'weather', params] as const,
  },

  // Notifications
  notifications: {
    all: ['notifications'] as const,
    list: (unreadOnly?: boolean) => [...queryKeys.notifications.all, 'list', unreadOnly] as const,
    count: () => [...queryKeys.notifications.all, 'count'] as const,
  },

  // Files
  files: {
    all: ['files'] as const,
    list: (folder?: string) => [...queryKeys.files.all, 'list', folder] as const,
    detail: (id: string) => [...queryKeys.files.all, 'detail', id] as const,
  },

  // Countries
  countries: {
    all: ['countries'] as const,
    list: () => [...queryKeys.countries.all, 'list'] as const,
    detail: (code: string) => [...queryKeys.countries.all, 'detail', code] as const,
  },
} as const;

// ============================================================================
// SECTION 6: CACHE INVALIDATION HELPERS
// ============================================================================

/**
 * Invalidate all queries matching a key pattern.
 */
export async function invalidateQueries(pattern: string | string[]): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: Array.isArray(pattern) ? pattern : [pattern] });
}

/**
 * Invalidate and refetch specific queries.
 */
export async function invalidateAndRefetch(queryKey: unknown[]): Promise<void> {
  await queryClient.invalidateQueries({ queryKey, exact: true });
  await queryClient.refetchQueries({ queryKey, exact: true });
}

/**
 * Remove all queries from cache (e.g., on logout).
 */
export function clearAllQueries(): void {
  queryClient.clear();
}

/**
 * Cancel all ongoing queries.
 */
export function cancelAllQueries(): Promise<void> {
  return queryClient.cancelQueries();
}

/**
 * Prefetch a query for instant navigation.
 */
export async function prefetchQuery<T>(
  queryKey: unknown[],
  queryFn: () => Promise<T>,
  options?: { staleTime?: number }
): Promise<void> {
  await queryClient.prefetchQuery({
    queryKey,
    queryFn,
    staleTime: options?.staleTime ?? 5 * 60 * 1000,
  });
}

/**
 * Set query data manually (optimistic updates).
 */
export function setQueryData<T>(queryKey: unknown[], data: T): void {
  queryClient.setQueryData(queryKey, data);
}

/**
 * Get query data without fetching.
 */
export function getQueryData<T>(queryKey: unknown[]): T | undefined {
  return queryClient.getQueryData<T>(queryKey);
}

// ============================================================================
// SECTION 7: OPTIMISTIC UPDATE HELPERS
// ============================================================================

/**
 * Perform optimistic update with automatic rollback on error.
 */
export async function optimisticUpdate<T>({
  queryKey,
  newData,
  mutationFn,
  onError,
}: {
  queryKey: unknown[];
  newData: T;
  mutationFn: () => Promise<T>;
  onError?: (error: unknown) => void;
}): Promise<T> {
  // Cancel outgoing refetches
  await queryClient.cancelQueries({ queryKey });

  // Snapshot previous value
  const previousData = queryClient.getQueryData<T>(queryKey);

  // Optimistically update
  queryClient.setQueryData<T>(queryKey, newData);

  try {
    // Perform mutation
    const result = await mutationFn();
    return result;
  } catch (error) {
    // Rollback on error
    queryClient.setQueryData<T>(queryKey, previousData);
    onError?.(error);
    throw error;
  }
}

// ============================================================================
// SECTION 8: DEVTOOLS & DEBUGGING
// ============================================================================

/**
 * Log all active queries (for debugging).
 */
export function logActiveQueries(): void {
  const queries = queryClient.getQueryCache().getAll();
  console.table(
    queries.map((q) => ({
      key: q.queryKey.join('/'),
      state: q.state.status,
      dataUpdatedAt: new Date(q.state.dataUpdatedAt).toLocaleString('fr-FR'),
      isStale: q.isStale(),
    }))
  );
}

/**
 * Get query statistics.
 */
export function getQueryStats(): {
  total: number;
  fetching: number;
  stale: number;
  inactive: number;
} {
  const queries = queryClient.getQueryCache().getAll();
  return {
    total: queries.length,
    fetching: queries.filter((q) => q.state.status === 'pending').length,
    stale: queries.filter((q) => q.isStale()).length,
    inactive: queries.filter((q) => q.getObserversCount() === 0).length,
  };
}
