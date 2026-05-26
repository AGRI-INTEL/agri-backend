'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type {
  PredictionResult,
  PredictionHistory,
  YieldPredictionInput,
  PricePredictionInput,
  WeatherPredictionInput,
} from '@/types/prediction';
import { toast } from 'sonner';

export function usePredictYield() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: YieldPredictionInput) =>
      apiClient.post<PredictionResult>('/predictions/yield', input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['predictions', 'history'] }),
    onError: (e: { message: string }) => toast.error(e.message),
  });
}

export function usePredictPrice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: PricePredictionInput) =>
      apiClient.post<PredictionResult>('/predictions/price', input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['predictions', 'history'] }),
    onError: (e: { message: string }) => toast.error(e.message),
  });
}

export function usePredictWeather() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: WeatherPredictionInput) =>
      apiClient.post<PredictionResult>('/predictions/weather', input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['predictions', 'history'] }),
    onError: (e: { message: string }) => toast.error(e.message),
  });
}

export function usePredictionHistory() {
  return useQuery({
    queryKey: ['predictions', 'history'],
    queryFn: () => apiClient.get<PredictionHistory[]>('/predictions/history'),
  });
}
