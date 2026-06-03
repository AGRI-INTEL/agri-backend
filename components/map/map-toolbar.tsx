'use client';

import { Menu, X, Download, Share2, RotateCcw, Maximize2, ZoomIn, ZoomOut, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface MapToolbarProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export function MapToolbar({ sidebarOpen, onToggleSidebar }: MapToolbarProps) {
  return (
    <div className="h-16 border-b border-border bg-card px-4 flex items-center justify-between gap-4">
      {/* Left: Sidebar Toggle */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon-sm"
          onClick={onToggleSidebar}
          title={sidebarOpen ? 'Masquer le panneau' : 'Afficher le panneau'}
        >
          {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
        <h1 className="text-lg font-semibold">Carte Interactive</h1>
      </div>

      {/* Center: Search */}
      <div className="flex-1 max-w-md hidden md:block">
        <Input
          type="text"
          placeholder="Rechercher un lieu ou un marqueur..."
          className="text-sm h-9"
        />
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex gap-1 bg-muted rounded-lg p-1">
          <Button
            variant="ghost"
            size="icon-sm"
            title="Zoom in"
            className="h-8 w-8"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            title="Zoom out"
            className="h-8 w-8"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <div className="w-px bg-border mx-1" />
          <Button
            variant="ghost"
            size="icon-sm"
            title="Localisation"
            className="h-8 w-8"
          >
            <Navigation className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            title="Plein écran"
            className="h-8 w-8"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="hidden sm:flex gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            title="Réinitialiser la vue"
            className="h-9 w-9"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            title="Télécharger"
            className="h-9 w-9"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            title="Partager"
            className="h-9 w-9"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
