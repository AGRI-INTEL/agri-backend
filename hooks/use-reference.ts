'use client';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { ensureArray } from '@/lib/utils';

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
    queryFn: () => apiClient.get<unknown>('/reference/countries').then((r) => ensureArray<Country>(r, 'countries')),
    staleTime: 24 * 60 * 60 * 1000,
  });
}

export function useCrops(countryId?: string) {
  return useQuery({
    queryKey: ['reference', 'crops', countryId],
    queryFn: () =>
      apiClient.get<unknown>('/reference/crops', {
        params: countryId ? { country_id: countryId } : undefined,
      }).then((r) => ensureArray<Crop>(r, 'crops')),
    staleTime: 24 * 60 * 60 * 1000,
  });
}
