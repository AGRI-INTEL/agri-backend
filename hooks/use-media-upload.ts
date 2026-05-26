'use client';

import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';
import {
  compressImage,
  validateFile,
  detectFileCategory,
  generateVideoThumbnail,
} from '@/lib/media-utils';
import {
  MAX_IMAGE_SIZE,
  MAX_VIDEO_SIZE,
  MAX_AUDIO_SIZE,
  MAX_DOCUMENT_SIZE,
  ACCEPTED_IMAGE_TYPES,
  ACCEPTED_VIDEO_TYPES,
  ACCEPTED_AUDIO_TYPES,
  ACCEPTED_DOCUMENT_TYPES,
} from '@/lib/constants';
import type { UploadProgress } from '@/types/file';

interface UploadedFile {
  id: string;
  url: string;
  thumbnail?: string;
  filename: string;
  size: number;
  type: string;
  duration?: number;
}

interface UseMediaUploadOptions {
  endpoint?: string;
  maxFiles?: number;
  onSuccess?: (files: UploadedFile[]) => void;
  onError?: (error: string) => void;
}

export function useMediaUpload(options: UseMediaUploadOptions = {}) {
  const {
    endpoint = '/files/upload',
    maxFiles = 10,
    onSuccess,
    onError,
  } = options;

  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const updateProgress = useCallback((fileId: string, update: Partial<UploadProgress>) => {
    setUploads((prev) =>
      prev.map((u) => (u.file_id === fileId ? { ...u, ...update } : u))
    );
  }, []);

  const uploadFile = useCallback(
    async (file: File): Promise<UploadedFile | null> => {
      const category = detectFileCategory(file);
      const fileId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

      // Validate
      const maxSizeMap = {
        image: MAX_IMAGE_SIZE,
        video: MAX_VIDEO_SIZE,
        audio: MAX_AUDIO_SIZE,
        document: MAX_DOCUMENT_SIZE,
        other: MAX_DOCUMENT_SIZE,
      };

      const acceptedTypesMap = {
        image: ACCEPTED_IMAGE_TYPES,
        video: ACCEPTED_VIDEO_TYPES,
        audio: ACCEPTED_AUDIO_TYPES,
        document: ACCEPTED_DOCUMENT_TYPES,
        other: [],
      };

      const validation = await validateFile(file, {
        maxSizeBytes: maxSizeMap[category],
        acceptedTypes:
          acceptedTypesMap[category].length > 0
            ? [...acceptedTypesMap[category]]
            : undefined,
      });

      if (!validation.valid) {
        onError?.(validation.errors[0] || 'Fichier invalide');
        return null;
      }

      // Add to progress list
      setUploads((prev) => [
        ...prev,
        {
          file_id: fileId,
          filename: file.name,
          size: file.size,
          progress: 0,
          bytes_uploaded: 0,
          status: 'uploading',
        },
      ]);

      try {
        // Compress images
        let processedFile = file;
        if (category === 'image') {
          processedFile = await compressImage(file);
        }

        // Generate video thumbnail
        let thumbnail: string | undefined;
        if (category === 'video') {
          try {
            thumbnail = await generateVideoThumbnail(file);
          } catch {
            // ignore
          }
        }

        const formData = new FormData();
        formData.append('file', processedFile);
        formData.append('category', category);
        if (thumbnail) formData.append('thumbnail', thumbnail);

        const result = await apiClient.upload<UploadedFile>(endpoint, formData, {
          onProgress: (progress) =>
            updateProgress(fileId, {
              progress,
              bytes_uploaded: Math.round((progress / 100) * file.size),
            }),
        });

        updateProgress(fileId, { status: 'done', progress: 100, url: result.url });
        return result;
      } catch (err) {
        const error = err instanceof Error ? err.message : 'Erreur upload';
        updateProgress(fileId, { status: 'error', error });
        onError?.(error);
        return null;
      }
    },
    [endpoint, onError, updateProgress]
  );

  const uploadFiles = useCallback(
    async (files: File[]) => {
      if (files.length > maxFiles) {
        onError?.(`Maximum ${maxFiles} fichiers autorisés`);
        return;
      }

      setIsUploading(true);
      const results: UploadedFile[] = [];

      for (const file of files) {
        const result = await uploadFile(file);
        if (result) results.push(result);
      }

      setUploadedFiles((prev) => [...prev, ...results]);
      setIsUploading(false);

      if (results.length > 0) {
        onSuccess?.(results);
      }
    },
    [maxFiles, onError, onSuccess, uploadFile]
  );

  const removeUpload = useCallback((fileId: string) => {
    setUploads((prev) => prev.filter((u) => u.file_id !== fileId));
  }, []);

  const clearAll = useCallback(() => {
    setUploads([]);
    setUploadedFiles([]);
  }, []);

  return {
    uploads,
    uploadedFiles,
    isUploading,
    uploadFile,
    uploadFiles,
    removeUpload,
    clearAll,
  };
}
