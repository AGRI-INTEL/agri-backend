'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { FileItem, Folder } from '@/types/file';
import { toast } from 'sonner';

export function useFolders() {
  return useQuery({
    queryKey: ['folders'],
    queryFn: () => apiClient.get<Folder[]>('/files/folders'),
  });
}

export function useFiles(folderId?: string) {
  return useQuery({
    queryKey: ['files', folderId],
    queryFn: () => apiClient.get<FileItem[]>('/files', {
      params: { folder_id: folderId },
    }),
  });
}

export function useCreateFolder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; parent_id?: string }) =>
      apiClient.post<Folder>('/files/folders', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['folders'] });
      toast.success('Dossier créé');
    },
  });
}

export function useDeleteFile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/files/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['files'] });
      toast.success('Fichier supprimé');
    },
  });
}

export function useMoveFile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ fileId, folderId }: { fileId: string; folderId: string }) =>
      apiClient.patch(`/files/${fileId}/move`, { folder_id: folderId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['files'] }),
  });
}
