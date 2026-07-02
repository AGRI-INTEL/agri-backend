'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

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
      apiClient.get<MarketPrice[]>('/indicators', {
        params: {
          ...(filters?.country ? { country: filters.country } : {}),
          ...(filters?.product ? { product: filters.product } : {}),
          category: 'market_price',
          limit: 50,
        },
      }),
    refetchInterval: 60_000,
  });
}

export function useMarketByProduct(product: string) {
  return useQuery({
    queryKey: ['markets', 'product', product],
    queryFn: () =>
      apiClient.get<MarketPrice[]>('/indicators', {
        params: { search: product, category: 'market_price', limit: 20 },
      }),
    enabled: !!product,
  });
}
