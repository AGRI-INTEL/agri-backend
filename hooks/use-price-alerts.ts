'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

// ── Types ──────────────────────────────────────────────────────────────────

export interface PriceAlert {
  id: string;
  user_id: string;
  crop: string;
  market: string;
  condition: 'above' | 'below';
  threshold: number;
  currency: string;
  is_active: boolean;
  last_triggered_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PriceAlertCreate {
  crop: string;
  market: string;
  condition: 'above' | 'below';
  threshold: number;
  currency?: string;
}

export interface PriceAlertUpdate {
  crop?: string;
  market?: string;
  condition?: 'above' | 'below';
  threshold?: number;
  currency?: string;
  is_active?: boolean;
}

export interface PriceAlertCheckResult {
  alert_id: string;
  crop: string;
  market: string;
  condition: string;
  threshold: number;
  current_price: number | null;
  triggered: boolean;
  message: string;
}

// ── Query keys ─────────────────────────────────────────────────────────────

const PRICE_ALERTS_KEY = ['price-alerts'] as const;

// ── Queries ────────────────────────────────────────────────────────────────

export function usePriceAlerts(status?: string) {
  return useQuery({
    queryKey: [...PRICE_ALERTS_KEY, 'list', status],
    queryFn: () => {
      const params: Record<string, string | number | boolean | undefined | null> = {};
      if (status) params.status = status;
      return apiClient.get<PriceAlert[]>('/price-alerts', { params });
    },
    staleTime: 10_000,
  });
}

export function usePriceAlert(id: string) {
  return useQuery({
    queryKey: [...PRICE_ALERTS_KEY, id],
    queryFn: () => apiClient.get<PriceAlert>(`/price-alerts/${id}`),
    enabled: !!id,
  });
}

// ── Mutations ──────────────────────────────────────────────────────────────

export function useCreatePriceAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: PriceAlertCreate) =>
      apiClient.post<PriceAlert>('/price-alerts', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PRICE_ALERTS_KEY });
      toast.success('Alerte de prix créée');
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });
}

export function useUpdatePriceAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PriceAlertUpdate }) =>
      apiClient.put<PriceAlert>(`/price-alerts/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PRICE_ALERTS_KEY });
      toast.success('Alerte de prix mise à jour');
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });
}

export function useDeletePriceAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/price-alerts/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PRICE_ALERTS_KEY });
      toast.success('Alerte de prix supprimée');
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });
}

export function useCheckPriceAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.post<PriceAlertCheckResult>(`/price-alerts/${id}/check`),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: PRICE_ALERTS_KEY });
      if (data.triggered) {
        toast.warning(data.message);
      } else {
        toast.info(data.message);
      }
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });
}

// ── Helpers ────────────────────────────────────────────────────────────────

export const CONDITION_LABELS: Record<string, string> = {
  above: 'Supérieur à',
  below: 'Inférieur à',
};

export const CROP_OPTIONS = [
  { value: 'maïs', label: 'Maïs' },
  { value: 'cacao', label: 'Cacao' },
  { value: 'coton', label: 'Coton' },
  { value: 'arachide', label: 'Arachide' },
  { value: 'manioc', label: 'Manioc' },
  { value: 'sorgho', label: 'Sorgho' },
  { value: 'mil', label: 'Mil' },
  { value: 'riz', label: 'Riz' },
  { value: 'café', label: 'Café' },
  { value: 'huile de palme', label: 'Huile de Palme' },
  { value: 'banane', label: 'Banane' },
  { value: 'anacarde', label: 'Anacarde' },
];
