'use client';
import { useState, useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface SearchResult {
  id: string;
  type: 'alert' | 'actor' | 'market' | 'group' | 'user' | 'file';
  label: string;
  description?: string;
  href: string;
  icon?: string;
}

export function useSearch() {
  const [query, setQuery] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['search', query],
    queryFn: () =>
      apiClient.get<SearchResult[]>('/search', {
        params: { q: query, limit: 10 },
      }),
    enabled: query.length >= 2,
  });

  const search = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setQuery(q), 300);
  }, []);

  const results = Array.isArray(data) ? data : [];

  return { query: query, search, results, isLoading: isLoading && query.length >= 2 };
}
