'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface MapMarker {
  id: string;
  label: string;
  lng: number;
  lat: number;
  type: 'actor' | 'alert' | 'weather' | 'market' | 'prediction';
  color: string;
  sector?: string;
  description?: string;
}

export function useMapMarkers() {
  return useQuery({
    queryKey: ['map', 'markers'],
    queryFn: async (): Promise<MapMarker[]> => {
      const markers: MapMarker[] = [];

      try {
        const actorsRes = await apiClient.get<{ data?: Array<{ id: string; name: string; latitude?: number; longitude?: number; sector?: string; city?: string }> }>('/actors/', {
          params: { per_page: 100 },
        });
        const actors = Array.isArray(actorsRes) ? actorsRes : actorsRes.data || [];
        const sectorColors: Record<string, string> = {
          vegetal: '#16A34A',
          animal: '#D97706',
          halieutique: '#0891B2',
          forestier: '#92400E',
          minier: '#6B7280',
          industriel: '#4F46E5',
        };
        for (const a of actors) {
          if (a.latitude != null && a.longitude != null) {
            markers.push({
              id: `actor-${a.id}`,
              label: a.name,
              lng: a.longitude,
              lat: a.latitude,
              type: 'actor',
              color: sectorColors[a.sector || 'vegetal'] || '#16A34A',
              sector: a.sector,
              description: a.city,
            });
          }
        }
      } catch {
        // fallback demo markers
        markers.push(
          { id: 'dakar', label: 'Dakar', lng: -17.4441, lat: 14.6928, type: 'actor', color: '#16A34A', sector: 'vegetal' },
          { id: 'lome', label: 'Lomé', lng: 1.2255, lat: 6.1375, type: 'actor', color: '#D97706', sector: 'animal' },
          { id: 'accra', label: 'Accra', lng: -0.187, lat: 5.56, type: 'actor', color: '#0891B2', sector: 'halieutique' },
        );
      }

      try {
        const alertsRes = await apiClient.get<unknown>('/alerts', {
          params: { limit: 50 },
        });
        const alerts = Array.isArray(alertsRes)
          ? alertsRes
          : (alertsRes as { data?: Array<{ id: string; title: string; coordinates?: [number, number]; city?: string }> })?.data || [];
        for (const al of alerts) {
          const coords = (al as { coordinates?: [number, number] }).coordinates;
          if (coords?.length === 2) {
            markers.push({
              id: `alert-${(al as { id: string }).id}`,
              label: (al as { title: string }).title,
              lng: coords[0],
              lat: coords[1],
              type: 'alert',
              color: '#DC2626',
              description: (al as { city?: string }).city,
            });
          }
        }
      } catch {
        // ignore
      }

      return markers;
    },
    staleTime: 5 * 60 * 1000,
  });
}
