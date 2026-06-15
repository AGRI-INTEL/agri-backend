'use client';

import { useState } from 'react';
import { Layers, Filter, MapPin, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMapStore, selectLayers } from '@/stores/map-store';
import { useMapMarkers } from '@/hooks/use-geolocation';
import { cn } from '@/lib/utils';

interface MapSidebarProps {
  activeTab: 'markers' | 'layers' | 'filters';
  onTabChange: (tab: 'markers' | 'layers' | 'filters') => void;
  selectedMarker: string | null;
  onMarkerSelect: (id: string | null) => void;
}

export function MapSidebar({ activeTab, onTabChange, selectedMarker, onMarkerSelect }: MapSidebarProps) {
  const layers = useMapStore(selectLayers);
  const toggleLayer = useMapStore((s) => s.toggleLayer);
  const showAllLayers = useMapStore((s) => s.showAllLayers);
  const hideAllLayers = useMapStore((s) => s.hideAllLayers);
  const resetLayers = useMapStore((s) => s.resetLayers);

  const { data: markers, isLoading: markersLoading, refetch } = useMapMarkers();
  const [markerSearch, setMarkerSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [radiusKm, setRadiusKm] = useState(100);

  const filteredMarkers = (markers || []).filter((m) => {
    const matchSearch = !markerSearch || m.label.toLowerCase().includes(markerSearch.toLowerCase());
    const matchType = typeFilter === 'all' || m.type === typeFilter;
    return matchSearch && matchType;
  });

  const tabs = [
    { id: 'layers' as const, label: 'Couches', icon: Layers },
    { id: 'filters' as const, label: 'Filtres', icon: Filter },
    { id: 'markers' as const, label: 'Marqueurs', icon: MapPin },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Tab navigation */}
      <div className="flex border-b border-border">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors',
              activeTab === id
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* ── LAYERS TAB ── */}
      {activeTab === 'layers' && (
        <div className="flex-1 flex flex-col">
          <div className="p-3 border-b border-border">
            <p className="text-xs text-muted-foreground">Activez ou désactivez les couches</p>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-2">
              {layers.map((layer) => (
                <div
                  key={layer.id}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg transition-colors',
                    layer.visible ? 'bg-muted' : 'bg-muted/30 opacity-60'
                  )}
                >
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: layer.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {layer.icon} {layer.label}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">{layer.type}</p>
                  </div>
                  <Switch
                    checked={layer.visible}
                    onCheckedChange={() => toggleLayer(layer.id)}
                  />
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="p-3 border-t border-border space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="text-xs" onClick={showAllLayers}>
                Tout afficher
              </Button>
              <Button variant="outline" size="sm" className="text-xs" onClick={hideAllLayers}>
                Tout masquer
              </Button>
            </div>
            <Button variant="ghost" size="sm" className="w-full text-xs" onClick={resetLayers}>
              <RefreshCw className="h-3 w-3 mr-1" /> Réinitialiser
            </Button>
          </div>
        </div>
      )}

      {/* ── FILTERS TAB ── */}
      {activeTab === 'filters' && (
        <div className="flex-1 flex flex-col">
          <div className="p-3 border-b border-border">
            <p className="text-xs text-muted-foreground">Affiner les données affichées</p>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-4">
              {/* Type filter */}
              <div>
                <label className="text-xs font-semibold block mb-2">Type de donnée</label>
                <div className="space-y-1.5">
                  {[
                    { value: 'all', label: 'Tous', icon: '📍' },
                    { value: 'actor', label: 'Acteurs', icon: '👥' },
                    { value: 'alert', label: 'Alertes', icon: '⚠️' },
                    { value: 'weather', label: 'Météo', icon: '🌤️' },
                    { value: 'market', label: 'Marchés', icon: '🏪' },
                  ].map(({ value, label, icon }) => (
                    <button
                      key={value}
                      onClick={() => setTypeFilter(value)}
                      className={cn(
                        'w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
                        typeFilter === value
                          ? 'bg-primary/10 text-primary'
                          : 'hover:bg-muted text-muted-foreground'
                      )}
                    >
                      <span>{icon}</span>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Radius */}
              <div>
                <label className="text-xs font-semibold block mb-2">
                  Rayon de recherche: <span className="text-primary font-bold">{radiusKm} km</span>
                </label>
                <input
                  type="range"
                  min="10"
                  max="500"
                  step="10"
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>10 km</span>
                  <span>500 km</span>
                </div>
              </div>

              {/* Layer visibility summary */}
              <div>
                <label className="text-xs font-semibold block mb-2">Couches actives</label>
                <div className="flex flex-wrap gap-1">
                  {layers.filter((l) => l.visible).map((l) => (
                    <Badge
                      key={l.id}
                      variant="outline"
                      className="text-xs cursor-pointer hover:opacity-70"
                      style={{ borderColor: l.color, color: l.color }}
                      onClick={() => toggleLayer(l.id)}
                    >
                      {l.icon} {l.label}
                    </Badge>
                  ))}
                  {layers.filter((l) => l.visible).length === 0 && (
                    <p className="text-xs text-muted-foreground">Aucune couche active</p>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>
          <div className="p-3 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => { setTypeFilter('all'); setRadiusKm(100); }}
            >
              Réinitialiser les filtres
            </Button>
          </div>
        </div>
      )}

      {/* ── MARKERS TAB ── */}
      {activeTab === 'markers' && (
        <div className="flex-1 flex flex-col">
          <div className="p-3 border-b border-border">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground">
                {filteredMarkers.length} marqueur{filteredMarkers.length !== 1 ? 's' : ''}
              </p>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => refetch()}>
                <RefreshCw className="h-3 w-3" />
              </Button>
            </div>
            <input
              type="text"
              placeholder="Rechercher..."
              value={markerSearch}
              onChange={(e) => setMarkerSearch(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-input rounded-md bg-background"
            />
          </div>

          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {markersLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-lg" />
                ))
              ) : filteredMarkers.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8">
                  {markerSearch ? 'Aucun résultat' : 'Aucun marqueur disponible'}
                </p>
              ) : (
                filteredMarkers.map((marker) => (
                  <button
                    key={marker.id}
                    onClick={() => onMarkerSelect(selectedMarker === marker.id ? null : marker.id)}
                    className={cn(
                      'w-full text-left p-3 rounded-lg border transition-all',
                      selectedMarker === marker.id
                        ? 'bg-primary/10 border-primary shadow-sm'
                        : 'bg-muted/30 border-transparent hover:border-border hover:bg-muted'
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <div
                        className="h-3 w-3 rounded-full flex-shrink-0 mt-1"
                        style={{ backgroundColor: marker.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate">{marker.label}</p>
                        {marker.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{marker.description}</p>
                        )}
                        <p className="text-xs text-muted-foreground opacity-60">
                          {marker.lat.toFixed(4)}, {marker.lng.toFixed(4)}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs shrink-0">{marker.type}</Badge>
                    </div>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
