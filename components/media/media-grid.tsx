'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Play, FileText, Music } from 'lucide-react';
import { ImageViewer } from './image-viewer';
import { cn } from '@/lib/utils';
import type { PostMedia } from '@/types/community';

interface MediaGridProps {
  media: PostMedia[];
  className?: string;
}

export function MediaGrid({ media, className }: MediaGridProps) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  const images = media.filter((m) => m.type === 'image');
  const videos = media.filter((m) => m.type === 'video');
  const audios = media.filter((m) => m.type === 'audio');
  const docs = media.filter((m) => m.type === 'document');

  const openViewer = (index: number) => {
    setViewerIndex(index);
    setViewerOpen(true);
  };

  const gridClass = images.length === 1
    ? 'grid-cols-1'
    : images.length === 2
    ? 'grid-cols-2'
    : images.length === 3
    ? 'grid-cols-2'
    : 'grid-cols-2';

  return (
    <div className={cn('space-y-2', className)}>
      {/* Images */}
      {images.length > 0 && (
        <div className={cn('grid gap-1 rounded-card overflow-hidden', gridClass)}>
          {images.slice(0, 4).map((img, i) => {
            const isLast = i === 3 && images.length > 4;
            return (
              <button
                key={img.id}
                onClick={() => openViewer(i)}
                className={cn(
                  'relative overflow-hidden bg-muted aspect-square',
                  images.length === 3 && i === 0 && 'row-span-2',
                )}
                aria-label={`Voir l'image ${i + 1}`}
              >
                <Image
                  src={img.url}
                  alt={img.caption || `Image ${i + 1}`}
                  fill
                  unoptimized
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover hover:scale-105 transition-transform duration-300"
                />
                {isLast && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-white text-xl font-bold">+{images.length - 4}</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Videos */}
      {videos.map((vid) => (
        <div key={vid.id} className="relative rounded-card overflow-hidden bg-black aspect-video">
          {vid.thumbnail ? (
            <Image
              src={vid.thumbnail}
              alt="Aperçu vidéo"
              fill
              unoptimized
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-muted" />
          )}
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="h-14 w-14 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
              <Play className="h-7 w-7 text-white ml-1" />
            </div>
          </div>
          {vid.duration && (
            <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded font-data">
              {Math.floor(vid.duration / 60)}:{String(Math.floor(vid.duration % 60)).padStart(2, '0')}
            </span>
          )}
        </div>
      ))}

      {/* Audio */}
      {audios.map((aud) => (
        <div key={aud.id} className="flex items-center gap-3 bg-muted/50 rounded-xl p-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Music className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{aud.filename || 'Message vocal'}</p>
            {aud.duration && (
              <p className="text-xs text-muted-foreground font-data">
                {Math.floor(aud.duration / 60)}:{String(Math.floor(aud.duration % 60)).padStart(2, '0')}
              </p>
            )}
          </div>
        </div>
      ))}

      {/* Documents */}
      {docs.map((doc) => (
        <a
          key={doc.id}
          href={doc.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 bg-muted/50 rounded-xl p-3 hover:bg-muted transition-colors"
        >
          <div className="h-10 w-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
            <FileText className="h-5 w-5 text-red-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{doc.filename || 'Document'}</p>
            {doc.size && (
              <p className="text-xs text-muted-foreground">
                {(doc.size / 1024 / 1024).toFixed(1)} MB
              </p>
            )}
          </div>
        </a>
      ))}

      {/* Image viewer */}
      <ImageViewer
        images={images.map((img) => ({ src: img.url, alt: img.caption }))}
        initialIndex={viewerIndex}
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
      />
    </div>
  );
}
