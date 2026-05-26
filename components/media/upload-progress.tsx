import { X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { UploadProgress as UploadProgressType } from '@/types/file';

interface UploadProgressProps {
  uploads: UploadProgressType[];
  onRemove?: (id: string) => void;
  className?: string;
}

export function UploadProgressList({ uploads, onRemove, className }: UploadProgressProps) {
  if (!uploads.length) return null;

  return (
    <ul className={cn('space-y-2', className)} aria-label="Progression des uploads">
      {uploads.map((u) => (
        <li key={u.file_id} className="flex items-center gap-3 p-2 rounded-lg border border-border bg-card text-sm">
          <div className="shrink-0">
            {u.status === 'uploading' && <Loader2 className="h-4 w-4 text-primary animate-spin" />}
            {u.status === 'done' && <CheckCircle className="h-4 w-4 text-primary" />}
            {u.status === 'error' && <AlertCircle className="h-4 w-4 text-destructive" />}
            {u.status === 'pending' && <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{u.filename}</p>
            {u.status === 'uploading' && (
              <Progress value={u.progress} className="h-1 mt-1" />
            )}
            {u.status === 'error' && (
              <p className="text-xs text-destructive mt-0.5">{u.error}</p>
            )}
          </div>
          {onRemove && (
            <Button variant="ghost" size="icon-sm" onClick={() => onRemove(u.file_id)} aria-label="Supprimer">
              <X className="h-3 w-3" />
            </Button>
          )}
        </li>
      ))}
    </ul>
  );
}
