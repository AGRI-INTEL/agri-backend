'use client';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface Country {
  id: string;
  name: string;
  code: string;
  region?: string;
}

export interface Crop {
  id: string;
  name: string;
  category?: string;
  season?: string;
}

export function useCountries() {
  return useQuery({
    queryKey: ['reference', 'countries'],
    queryFn: () => apiClient.get<Country[]>('/reference/countries'),
    staleTime: 24 * 60 * 60 * 1000,
  });
}

export function useCrops(countryId?: string) {
  return useQuery({
    queryKey: ['reference', 'crops', countryId],
    queryFn: () =>
      apiClient.get<Crop[]>('/reference/crops', {
        params: countryId ? { country_id: countryId } : undefined,
      }),
    staleTime: 24 * 60 * 60 * 1000,
  });
}
