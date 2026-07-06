'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type {
  PredictionResult,
  PredictionSummary,
  YieldPredictionInput,
  PricePredictionInput,
  WeatherPredictionInput,
  ProductionPredictionInput,
} from '@/types/prediction';
import { toast } from 'sonner';

// ─── Shared error handler ────────────────────────────────────────────────────

function handleError(e: unknown) {
  const err = e as { message?: string; detail?: string | { message?: string } };
  const msg =
    err?.detail
      ? typeof err.detail === 'string'
        ? err.detail
        : err.detail?.message || 'Erreur inattendue'
      : err?.message || 'Erreur inattendue';

  // Check for image-not-supported error specifically
  if (msg.includes('ne supporte pas les images') || msg.includes('IMAGE_NOT_SUPPORTED')) {
    toast.error(
      'Ce modèle ne supporte pas les images. Utilisez l\'assistant IA pour l\'analyse d\'images.',
      { duration: 6000 }
    );
    return;
  }

  toast.error(msg, { duration: 4000 });
}

// ─── Yield ────────────────────────────────────────────────────────────────────

export function usePredictYield() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: YieldPredictionInput) =>
      apiClient.post<PredictionResult>('/predictions/yield', input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['predictions', 'history'] }),
    onError: handleError,
  });
}

// ─── Price ────────────────────────────────────────────────────────────────────

export function usePredictPrice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: PricePredictionInput) =>
      apiClient.post<PredictionResult>('/predictions/price', input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['predictions', 'history'] }),
    onError: handleError,
  });
}

// ─── Weather ──────────────────────────────────────────────────────────────────

export function usePredictWeather() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: WeatherPredictionInput) =>
      apiClient.post<PredictionResult>('/predictions/weather', input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['predictions', 'history'] }),
    onError: handleError,
  });
}

// ─── Production ───────────────────────────────────────────────────────────────

export function usePredictProduction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ProductionPredictionInput) =>
      apiClient.post<PredictionResult>('/predictions/production', input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['predictions', 'history'] }),
    onError: handleError,
  });
}

// ─── Disease ──────────────────────────────────────────────────────────────────

export function usePredictDisease() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      crop: string;
      region: string;
      country: string;
      temperature?: number;
      humidity?: number;
      rainfall_7d?: number;
    }) => apiClient.post<PredictionResult & { risk_level?: string; recommendations?: string[] }>(
      '/predictions/disease',
      input
    ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['predictions', 'history'] }),
    onError: handleError,
  });
}

// ─── Image Upload ─────────────────────────────────────────────────────────────

export function useUploadPredictionImage() {
  return useMutation({
    mutationFn: async ({
      file,
      crop,
      region,
    }: {
      file: File;
      crop: string;
      region: string;
    }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('crop', crop);
      formData.append('region', region);
      return apiClient.upload<{ status: string; message: string }>(
        '/predictions/upload-image',
        formData
      );
    },
    onError: handleError,
  });
}

// ─── Scenario Comparison ──────────────────────────────────────────────────────

export function useCompareScenarios() {
  return useMutation({
    mutationFn: (scenarios: YieldPredictionInput[]) =>
      apiClient.post<{ scenarios: Array<{ scenario: string; value: number; unit: string; confidence: number }> }>(
        '/predictions/scenario',
        scenarios
      ),
    onError: handleError,
  });
}

// ─── Batch ────────────────────────────────────────────────────────────────────

export function useBatchPredict() {
  return useMutation({
    mutationFn: (requests: YieldPredictionInput[]) =>
      apiClient.post<{
        job_id: string;
        total: number;
        completed: number;
        failed: number;
        results: Array<{ index: number; value: number; unit: string; confidence: number }>;
        errors: Array<{ index: number; message: string }>;
        status: string;
      }>('/predictions/batch', requests),
    onError: handleError,
  });
}

// ─── Export ───────────────────────────────────────────────────────────────────

export function useExportPredictions() {
  return useMutation({
    mutationFn: (ids: string[]) =>
      apiClient.post<{ format: string; data: string; count: number }>(
        '/predictions/export',
        // Le backend attend une liste JSON brute (ids: list[str]), pas un objet enveloppé
        ids
      ),
    onError: handleError,
  });
}

// ─── History ──────────────────────────────────────────────────────────────────

export function usePredictionHistory(typeFilter?: string) {
  return useQuery({
    queryKey: ['predictions', 'history', typeFilter],
    queryFn: () =>
      apiClient.get<{ history: PredictionSummary[]; count: number }>(
        `/predictions/history${typeFilter ? `?type_filter=${typeFilter}` : ''}`
      ),
  });
}
