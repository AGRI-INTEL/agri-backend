'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { ensureArray } from '@/lib/utils';
import { toast } from 'sonner';

export interface Report {
  id: string;
  title: string;
  type: 'production' | 'market' | 'alert' | 'community';
  format: 'pdf' | 'csv' | 'excel';
  status: 'queued' | 'processing' | 'completed' | 'failed';
  file_url?: string;
  file_size?: number;
  date_from?: string;
  date_to?: string;
  created_at: string;
  completed_at?: string;
  error_message?: string;
}

export interface ReportGenerateInput {
  type: 'production' | 'market' | 'alert' | 'community';
  format: 'pdf' | 'csv' | 'excel';
  date_from: string;
  date_to: string;
  filters?: Record<string, string>;
}

export function useReports() {
  return useQuery({
    queryKey: ['reports'],
    queryFn: () => apiClient.get<unknown>('/reports').then((r) => ensureArray<Report>(r, 'reports')),
    refetchInterval: (query) => {
      const hasPending = (query.state.data ?? []).some(
        (r: Report) => r.status === 'queued' || r.status === 'processing'
      );
      return hasPending ? 10_000 : false;
    },
  });
}

export function useGenerateReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ReportGenerateInput) =>
      apiClient.post<Report>('/reports/generate', input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reports'] });
      toast.success('Génération du rapport démarrée');
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });
}

export function useDownloadReport() {
  return useMutation({
    mutationFn: async (report: Report) => {
      if (!report.file_url) throw new Error('Fichier non disponible');
      const response = await fetch(report.file_url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.title}.${report.format}`;
      a.click();
      URL.revokeObjectURL(url);
    },
    onSuccess: () => toast.success('Téléchargement terminé'),
    onError: (e: { message: string }) => toast.error(e.message),
  });
}

export function useDeleteReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/reports/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reports'] });
      toast.success('Rapport supprimé');
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });
}

export function useReport(id: string) {
  return useQuery({
    queryKey: ['reports', id],
    queryFn: () => apiClient.get<Report>(`/reports/${id}`),
    enabled: !!id,
  });
}

export const REPORT_TYPE_LABELS: Record<string, string> = {
  production: 'Rapport de Production',
  market: 'Rapport de Marché',
  alert: 'Rapport d\'Alertes',
  community: 'Rapport Communauté',
};

export const FORMAT_LABELS: Record<string, string> = {
  pdf: 'PDF',
  csv: 'CSV',
  excel: 'Excel',
};

export const STATUS_LABELS: Record<string, string> = {
  queued: 'En attente',
  processing: 'En cours',
  completed: 'Terminé',
  failed: 'Échoué',
};
