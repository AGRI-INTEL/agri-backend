'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { ensureArray } from '@/lib/utils';

export interface MarketPrice {
  id: string;
  product: string;
  country: string;
  price: number;
  unit: string;
  currency: string;
  change_percent: number;
  timestamp: string;
  market: string;
  quality: string;
}

export function useMarketPrices(filters?: { country?: string; product?: string }) {
  return useQuery({
    queryKey: ['markets', 'prices', filters],
    queryFn: () =>
      apiClient.get<unknown>('/indicators', {
        params: {
          ...(filters?.country ? { country: filters.country } : {}),
          ...(filters?.product ? { product: filters.product } : {}),
          category: 'market_price',
          limit: 50,
        },
      }).then((r) => ensureArray<MarketPrice>(r, 'indicators')),
    refetchInterval: 60_000,
  });
}

export function useMarketByProduct(product: string) {
  return useQuery({
    queryKey: ['markets', 'product', product],
    queryFn: () =>
      apiClient.get<unknown>('/indicators', {
        params: { search: product, category: 'market_price', limit: 20 },
      }).then((r) => ensureArray<MarketPrice>(r, 'indicators')),
    enabled: !!product,
  });
}
