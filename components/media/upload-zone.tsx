'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileText, Image, Film, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { formatFileSize, cn } from '@/lib/utils';
import type { UploadProgress } from '@/types/file';

interface UploadZoneProps {
  onFiles: (files: File[]) => void;
  uploads?: UploadProgress[];
  onRemove?: (fileId: string) => void;
  accept?: Record<string, string[]>;
  maxFiles?: number;
  maxSize?: number;
  className?: string;
  label?: string;
}

const typeIcons: Record<string, React.ElementType> = {
  image: Image,
  video: Film,
  audio: Music,
  document: FileText,
};

export function UploadZone({
  onFiles, uploads = [], onRemove, accept, maxFiles = 10,
  maxSize, className, label = 'Glissez-déposez vos fichiers ici',
}: UploadZoneProps) {
  const onDrop = useCallback((accepted: File[]) => {
    onFiles(accepted);
  }, [onFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles,
    maxSize,
    multiple: maxFiles > 1,
  });

  return (
    <div className={cn('space-y-3', className)}>
      <div
        {...getRootProps()}
        className={cn('upload-zone', isDragActive && 'upload-zone-active')}
        role="button"
        tabIndex={0}
        aria-label={label}
      >
        <input {...getInputProps()} />
        <Upload className={cn('h-8 w-8 mx-auto mb-3', isDragActive ? 'text-primary' : 'text-muted-foreground')} aria-hidden="true" />
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground mt-1">
          ou <span className="text-primary">parcourir</span>
          {maxSize && ` — max ${formatFileSize(maxSize)}`}
        </p>
      </div>

      {uploads.length > 0 && (
        <ul className="space-y-2" aria-label="Fichiers en cours d'upload">
          {uploads.map((upload) => {
            const Icon = typeIcons.document;
            return (
              <li key={upload.file_id} className="flex items-center gap-3 p-2 rounded-lg border border-border bg-card">
                <Icon className="h-5 w-5 text-muted-foreground shrink-0" aria-hidden="true" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{upload.filename}</p>
                  {upload.status === 'uploading' && (
                    <Progress value={upload.progress} className="h-1 mt-1" />
                  )}
                  {upload.status === 'error' && (
                    <p className="text-xs text-destructive">{upload.error}</p>
                  )}
                  {upload.status === 'done' && (
                    <p className="text-xs text-primary">✓ Envoyé</p>
                  )}
                </div>
                {onRemove && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onRemove(upload.file_id)}
                    aria-label={`Supprimer ${upload.filename}`}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
