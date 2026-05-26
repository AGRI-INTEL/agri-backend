'use client';

import { FileText, Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface PdfViewerProps {
  url: string;
  name: string;
  open: boolean;
  onClose: () => void;
}

/** Visionneuse PDF légère (iframe) — react-pdf optionnel pour rendu avancé */
export function PdfViewer({ url, name, open, onClose }: PdfViewerProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col">
        <DialogHeader className="flex-row items-center justify-between">
          <DialogTitle className="flex items-center gap-2 truncate">
            <FileText className="h-5 w-5" />
            {name}
          </DialogTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href={url} download={name}><Download className="h-4 w-4" /></a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href={url} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /></a>
            </Button>
          </div>
        </DialogHeader>
        <iframe
          src={url}
          title={name}
          className="flex-1 w-full rounded-lg border border-border bg-muted"
        />
      </DialogContent>
    </Dialog>
  );
}
