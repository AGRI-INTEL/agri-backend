'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from '@/lib/motion';
import { X, ZoomIn, ZoomOut, Download, ChevronLeft, ChevronRight, RotateCw } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ImageViewerProps {
  images: { src: string; alt?: string; caption?: string }[];
  initialIndex?: number;
  open: boolean;
  onClose: () => void;
}

export function ImageViewer({ images, initialIndex = 0, open, onClose }: ImageViewerProps) {
  const [index, setIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const current = images[index];

  const reset = useCallback(() => { setZoom(1); setRotation(0); setPan({ x: 0, y: 0 }); }, []);

  useEffect(() => { setIndex(initialIndex); reset(); }, [initialIndex, reset]);

  const prev = () => { setIndex((i) => (i - 1 + images.length) % images.length); reset(); };
  const next = () => { setIndex((i) => (i + 1) % images.length); reset(); };

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((z) => Math.max(0.5, Math.min(5, z - e.deltaY * 0.001)));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    setDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = current.src;
    a.download = current.alt || 'image';
    a.click();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/95 flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-label="Visionneuse d'image"
        >
          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 py-3 bg-black/50">
            <span className="text-white/70 text-sm">
              {index + 1} / {images.length}
            </span>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => setZoom((z) => Math.min(5, z + 0.5))} className="text-white hover:bg-white/10" aria-label="Zoom avant">
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setZoom((z) => Math.max(0.5, z - 0.5))} className="text-white hover:bg-white/10" aria-label="Zoom arrière">
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setRotation((r) => r + 90)} className="text-white hover:bg-white/10" aria-label="Rotation">
                <RotateCw className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleDownload} className="text-white hover:bg-white/10" aria-label="Télécharger">
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/10" aria-label="Fermer">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Image */}
          <div
            className={cn('flex-1 flex items-center justify-center overflow-hidden', zoom > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-default')}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={() => setDragging(false)}
            onMouseLeave={() => setDragging(false)}
          >
            <motion.img
              key={current.src}
              src={current.src}
              alt={current.alt || ''}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                maxWidth: '90vw',
                maxHeight: '80vh',
                objectFit: 'contain',
                userSelect: 'none',
                transition: dragging ? 'none' : 'transform 0.2s ease',
              }}
              draggable={false}
            />
          </div>

          {/* Caption */}
          {current.caption && (
            <div className="text-center text-white/70 text-sm py-2 px-4">{current.caption}</div>
          )}

          {/* Navigation */}
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={prev}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10 h-12 w-12"
                aria-label="Image précédente"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={next}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10 h-12 w-12"
                aria-label="Image suivante"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex justify-center gap-2 py-3 px-4 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => { setIndex(i); reset(); }}
                  className={cn('h-12 w-12 rounded overflow-hidden shrink-0 border-2 transition-all relative', i === index ? 'border-primary' : 'border-transparent opacity-50 hover:opacity-80')}
                  aria-label={`Image ${i + 1}`}
                  aria-current={i === index}
                >
                  <Image
                    src={img.src}
                    alt=""
                    fill
                    unoptimized
                    sizes="48px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
