'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  event_type: 'preparation_sol' | 'semis' | 'entretien' | 'recolte' | 'traitement';
  start_date: string;
  end_date: string;
  crop: string;
  country: string;
  region?: string;
  month: number;
  year: number;
}

export interface CalendarData {
  crop: string;
  country: string;
  year: number;
  events: CalendarEvent[];
  summary: {
    preparation_sol: number;
    semis: number;
    entretien: number;
    recolte: number;
    traitement: number;
  };
}

export function useCalendarData(crop: string, country: string, year: number) {
  return useQuery({
    queryKey: ['calendar', crop, country, year],
    queryFn: () =>
      apiClient.get<CalendarData>(`/calendar/${crop}/${country}/${year}`),
    enabled: !!crop && !!country && !!year,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCalendarMonthData(crop: string, country: string, year: number, month?: number) {
  return useQuery({
    queryKey: ['calendar', crop, country, year, month],
    queryFn: () =>
      apiClient.get<CalendarEvent[]>(`/calendar/${crop}/${country}/${year}`, {
        params: month ? { month } : undefined,
      }),
    enabled: !!crop && !!country && !!year,
    staleTime: 5 * 60 * 1000,
  });
}

export const EVENT_TYPE_LABELS: Record<string, string> = {
  preparation_sol: 'Préparation du sol',
  semis: 'Semis',
  entretien: 'Entretien',
  recolte: 'Récolte',
  traitement: 'Traitement',
};

export const EVENT_TYPE_COLORS: Record<string, string> = {
  preparation_sol: '#8B5CF6',
  semis: '#22C55E',
  entretien: '#3B82F6',
  recolte: '#F59E0B',
  traitement: '#EF4444',
};

export const EVENT_TYPE_BG: Record<string, string> = {
  preparation_sol: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  semis: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  entretien: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  recolte: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  traitement: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};
