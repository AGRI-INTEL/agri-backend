'use client';

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { ensureArray } from '@/lib/utils';
import type { FileItem, Folder } from '@/types/file';
import { toast } from 'sonner';

// ============================================================================
// QUERIES
// ============================================================================

export function useFolders() {
  return useQuery({
    queryKey: ['folders'],
    queryFn: () => apiClient.get<unknown>('/files/folders').then((r) => ensureArray<Folder>(r, 'folders')),
    staleTime: 60_000,
  });
}

export function useFiles(folderId?: string, search?: string) {
  return useQuery({
    queryKey: ['files', folderId, search],
    queryFn: () =>
      apiClient.get<unknown>('/files', {
        params: {
          folder_id: folderId || undefined,
          search: search || undefined,
        },
      }).then((r) => ensureArray<FileItem>(r, 'files')),
    staleTime: 30_000,
  });
}

export function useFileStats() {
  return useQuery({
    queryKey: ['files', 'stats'],
    queryFn: () =>
      apiClient.get<{
        total_files: number;
        total_size: number;
        by_type: Record<string, number>;
        storage_used: number;
        storage_limit: number;
      }>('/files/stats'),
    staleTime: 60_000,
  });
}

export function useRecentFiles(limit = 10) {
  return useQuery({
    queryKey: ['files', 'recent', limit],
    queryFn: () =>
      apiClient.get<unknown>('/files/recent', { params: { limit } }).then((r) => ensureArray<FileItem>(r, 'files')),
    staleTime: 30_000,
  });
}

// ============================================================================
// MUTATIONS
// ============================================================================

export function useCreateFolder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; parent_id?: string }) =>
      apiClient.post<Folder>('/files/folders', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['folders'] });
      toast.success('Dossier créé');
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });
}

export function useDeleteFile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/files/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['files'] });
      qc.invalidateQueries({ queryKey: ['files', 'stats'] });
      toast.success('Fichier supprimé');
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });
}

export function useDeleteFolder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/files/folders/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['folders'] });
      qc.invalidateQueries({ queryKey: ['files'] });
      toast.success('Dossier supprimé');
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });
}

export function useMoveFile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ fileId, folderId }: { fileId: string; folderId: string | null }) =>
      apiClient.patch(`/files/${fileId}/move`, { folder_id: folderId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['files'] });
      toast.success('Fichier déplacé');
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });
}

export function useRenameFile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ fileId, name }: { fileId: string; name: string }) =>
      apiClient.patch(`/files/${fileId}/rename`, { name }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['files'] });
      toast.success('Fichier renommé');
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });
}

export function useShareFile() {
  return useMutation({
    mutationFn: ({
      fileId,
      expiresInHours = 24,
    }: {
      fileId: string;
      expiresInHours?: number;
    }) =>
      apiClient.post<{ share_url: string; expires_at: string }>(
        `/files/${fileId}/share`,
        { expires_in_hours: expiresInHours }
      ),
    onSuccess: (data) => {
      if (data?.share_url) {
        navigator.clipboard.writeText(data.share_url).then(() => {
          toast.success('Lien de partage copié dans le presse-papier');
        });
      }
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });
}

export function useBulkDeleteFiles() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) =>
      apiClient.post('/files/bulk-delete', { ids }),
    onSuccess: (_, ids) => {
      qc.invalidateQueries({ queryKey: ['files'] });
      qc.invalidateQueries({ queryKey: ['files', 'stats'] });
      toast.success(`${ids.length} fichier(s) supprimé(s)`);
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });
}
