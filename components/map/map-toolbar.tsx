'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Menu, X, Share2, RotateCcw, Maximize2, ZoomIn, ZoomOut,
  Navigation, ChevronLeft, ChevronRight, Search, Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMapStore } from '@/stores/map-store';
import { useMapMarkers } from '@/hooks/use-geolocation';
import { toast } from 'sonner';

interface MapToolbarProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export function MapToolbar({ sidebarOpen, onToggleSidebar }: MapToolbarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ id: string; label: string; lat: number; lng: number; type: string }>>([]);
  const [showResults, setShowResults] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const mapStore = useMapStore();
  const { data: markers } = useMapMarkers();

  const canGoBack = useMapStore((s) => s.historyIndex > 0);
  const canGoForward = useMapStore((s) => s.historyIndex < s.viewportHistory.length - 1);

  // Search in markers
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const results = (markers || [])
      .filter((m) => m.label.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 6);
    setSearchResults(results);
    setShowResults(results.length > 0);
  }, [searchQuery, markers]);

  // Close results on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelectMarker = (marker: { id: string; label: string; lat: number; lng: number }) => {
    mapStore.setCenter([marker.lng, marker.lat]);
    mapStore.setZoom(10);
    mapStore.setSelectedMarker(marker.id);
    setSearchQuery('');
    setShowResults(false);
  };

  const handleResetView = () => {
    mapStore.resetViewport();
    toast.success('Vue réinitialisée');
  };

  const handleShareMap = async () => {
    const { viewport } = mapStore;
    const url = `${window.location.origin}/map?lat=${viewport.center[1].toFixed(4)}&lng=${viewport.center[0].toFixed(4)}&zoom=${viewport.zoom}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Lien copié dans le presse-papier');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Impossible de copier le lien');
    }
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      toast.error('Géolocalisation non disponible');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        mapStore.setCenter([pos.coords.longitude, pos.coords.latitude]);
        mapStore.setZoom(12);
        toast.success('Position localisée');
      },
      () => toast.error('Impossible de vous localiser')
    );
  };

  return (
    <div className="h-14 border-b border-border bg-card px-3 flex items-center justify-between gap-3 z-20">
      {/* Left: Toggle + Title */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={onToggleSidebar}
          title={sidebarOpen ? 'Masquer le panneau' : 'Afficher le panneau'}
        >
          {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>

        {/* History nav */}
        <div className="hidden sm:flex gap-0.5">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => mapStore.goBack()}
            disabled={!canGoBack}
            title="Vue précédente"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => mapStore.goForward()}
            disabled={!canGoForward}
            title="Vue suivante"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Center: Search */}
      <div className="flex-1 max-w-md hidden md:block relative" ref={searchRef}>
        <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Rechercher un lieu, marqueur, région..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => searchResults.length > 0 && setShowResults(true)}
          className="text-sm h-8 pl-8"
        />
        {showResults && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50">
            {searchResults.map((result) => (
              <button
                key={result.id}
                onClick={() => handleSelectMarker(result)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors flex items-center gap-2"
              >
                <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                <span className="flex-1 truncate">{result.label}</span>
                <span className="text-xs text-muted-foreground capitalize">{result.type}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-1">
        {/* Zoom controls */}
        <div className="hidden sm:flex gap-0.5 bg-muted rounded-md p-0.5">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => mapStore.setZoom(mapStore.viewport.zoom + 1)}
            title="Zoom avant"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => mapStore.setZoom(mapStore.viewport.zoom - 1)}
            title="Zoom arrière"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hidden sm:flex"
          onClick={handleGeolocate}
          title="Ma position"
        >
          <Navigation className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hidden sm:flex"
          onClick={handleResetView}
          title="Réinitialiser la vue"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={handleShareMap}
          title="Partager"
        >
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Share2 className="h-4 w-4" />}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hidden sm:flex"
          onClick={handleFullscreen}
          title={isFullscreen ? 'Quitter le plein écran' : 'Plein écran'}
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
