'use client';

import { useState } from 'react';
import { Layers, Filter, MapPin, RefreshCw, Eye, EyeOff, RotateCcw } from 'lucide-react';
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

const MARKER_TYPE_COLORS: Record<string, string> = {
  actor: '#22c55e',
  alert: '#ef4444',
  weather: '#3b82f6',
  market: '#f59e0b',
  prediction: '#a855f7',
};

const MARKER_TYPE_LABELS: Record<string, string> = {
  actor: 'Acteur',
  alert: 'Alerte',
  weather: 'Météo',
  market: 'Marché',
  prediction: 'Prédiction',
};

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
    { id: 'layers' as const, label: 'Couches', icon: Layers, count: layers.filter((l) => l.visible).length },
    { id: 'filters' as const, label: 'Filtres', icon: Filter, count: null },
    { id: 'markers' as const, label: 'Sites', icon: MapPin, count: (markers || []).length },
  ];

  return (
    <div className="h-full flex flex-col w-72">
      {/* Sidebar header */}
      <div className="px-4 py-3 border-b border-border bg-muted/30 shrink-0">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Panneau de contrôle</p>
      </div>

      {/* Tab navigation */}
      <div className="flex border-b border-border shrink-0">
        {tabs.map(({ id, label, icon: Icon, count }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={cn(
              'flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-xs font-medium transition-colors relative',
              activeTab === id
                ? 'text-primary bg-primary/5 border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="leading-none">{label}</span>
            {count !== null && count > 0 && (
              <span className={cn(
                'absolute top-1.5 right-1 text-[10px] font-bold min-w-[16px] h-4 rounded-full flex items-center justify-center px-1',
                activeTab === id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              )}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── LAYERS TAB ── */}
      {activeTab === 'layers' && (
        <div className="flex-1 flex flex-col min-h-0">
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-2">
              {layers.map((layer) => (
                <div
                  key={layer.id}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-xl border transition-all duration-150',
                    layer.visible
                      ? 'bg-card border-border shadow-sm'
                      : 'bg-muted/20 border-transparent opacity-50'
                  )}
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0 ring-2 ring-offset-1 ring-offset-background"
                    style={{ backgroundColor: layer.color, outline: `2px solid ${layer.color}40` }}
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
                    className="scale-90"
                  />
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="p-3 border-t border-border shrink-0 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8 gap-1.5"
                onClick={showAllLayers}
              >
                <Eye className="h-3 w-3" /> Tout afficher
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8 gap-1.5"
                onClick={hideAllLayers}
              >
                <EyeOff className="h-3 w-3" /> Tout masquer
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs h-7 text-muted-foreground"
              onClick={resetLayers}
            >
              <RotateCcw className="h-3 w-3 mr-1.5" /> Réinitialiser
            </Button>
          </div>
        </div>
      )}

      {/* ── FILTERS TAB ── */}
      {activeTab === 'filters' && (
        <div className="flex-1 flex flex-col min-h-0">
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-5">
              {/* Type filter */}
              <div>
                <label className="text-xs font-semibold text-foreground block mb-2">Type de donnée</label>
                <div className="space-y-1">
                  {[
                    { value: 'all',     label: 'Tous les types',  icon: '📍', color: '#64748b' },
                    { value: 'actor',   label: 'Acteurs',         icon: '👥', color: '#22c55e' },
                    { value: 'alert',   label: 'Alertes',         icon: '⚠️', color: '#ef4444' },
                    { value: 'weather', label: 'Stations météo',  icon: '🌤️', color: '#3b82f6' },
                    { value: 'market',  label: 'Marchés',         icon: '🏪', color: '#f59e0b' },
                  ].map(({ value, label, icon, color }) => (
                    <button
                      key={value}
                      onClick={() => setTypeFilter(value)}
                      className={cn(
                        'w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150 border',
                        typeFilter === value
                          ? 'bg-primary/10 text-primary border-primary/20 shadow-sm'
                          : 'border-transparent hover:bg-muted text-muted-foreground'
                      )}
                    >
                      <span className="text-base leading-none">{icon}</span>
                      <span className="font-medium">{label}</span>
                      {typeFilter === value && (
                        <span
                          className="ml-auto h-2 w-2 rounded-full shrink-0"
                          style={{ backgroundColor: color }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Radius */}
              <div>
                <label className="text-xs font-semibold text-foreground block mb-3">
                  Rayon de recherche
                  <span className="ml-2 text-primary font-bold">{radiusKm} km</span>
                </label>
                <div className="px-1">
                  <input
                    type="range"
                    min="10"
                    max="500"
                    step="10"
                    value={radiusKm}
                    onChange={(e) => setRadiusKm(Number(e.target.value))}
                    className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>10 km</span>
                    <span>500 km</span>
                  </div>
                </div>
              </div>

              {/* Active layers summary */}
              <div>
                <label className="text-xs font-semibold text-foreground block mb-2">Couches actives</label>
                <div className="flex flex-wrap gap-1.5">
                  {layers.filter((l) => l.visible).map((l) => (
                    <Badge
                      key={l.id}
                      variant="outline"
                      className="text-xs cursor-pointer hover:opacity-70 transition-opacity"
                      style={{ borderColor: l.color, color: l.color }}
                      onClick={() => toggleLayer(l.id)}
                    >
                      {l.icon} {l.label}
                    </Badge>
                  ))}
                  {layers.filter((l) => l.visible).length === 0 && (
                    <p className="text-xs text-muted-foreground italic">Aucune couche active</p>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>
          <div className="p-3 border-t border-border shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => { setTypeFilter('all'); setRadiusKm(100); }}
            >
              <RotateCcw className="h-3 w-3 mr-1.5" /> Réinitialiser les filtres
            </Button>
          </div>
        </div>
      )}

      {/* ── MARKERS TAB ── */}
      {activeTab === 'markers' && (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="p-3 border-b border-border shrink-0">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground font-medium">
                <span className="text-foreground font-bold">{filteredMarkers.length}</span> marqueur{filteredMarkers.length !== 1 ? 's' : ''}
              </p>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:text-primary" onClick={() => refetch()}>
                <RefreshCw className="h-3 w-3" />
              </Button>
            </div>
            <input
              type="text"
              placeholder="Rechercher un site..."
              value={markerSearch}
              onChange={(e) => setMarkerSearch(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-input rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1.5">
              {markersLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-xl" />
                ))
              ) : filteredMarkers.length === 0 ? (
                <div className="text-center py-10">
                  <MapPin className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
                  <p className="text-xs text-muted-foreground">
                    {markerSearch ? 'Aucun résultat pour cette recherche' : 'Aucun marqueur disponible'}
                  </p>
                </div>
              ) : (
                filteredMarkers.map((marker) => (
                  <button
                    key={marker.id}
                    onClick={() => onMarkerSelect(selectedMarker === marker.id ? null : marker.id)}
                    className={cn(
                      'w-full text-left p-3 rounded-xl border transition-all duration-150',
                      selectedMarker === marker.id
                        ? 'bg-primary/10 border-primary/30 shadow-sm'
                        : 'bg-background border-border hover:border-primary/20 hover:bg-muted/50'
                    )}
                  >
                    <div className="flex items-start gap-2.5">
                      <div
                        className="h-7 w-7 rounded-full border-2 border-white shadow-sm shrink-0 mt-0.5 flex items-center justify-center"
                        style={{ backgroundColor: MARKER_TYPE_COLORS[marker.type] || marker.color }}
                      >
                        <MapPin className="h-3 w-3 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">{marker.label}</p>
                        {marker.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{marker.description}</p>
                        )}
                        <p className="text-[10px] text-muted-foreground/60 font-mono mt-0.5">
                          {marker.lat.toFixed(3)}, {marker.lng.toFixed(3)}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className="text-[10px] shrink-0 px-1.5 h-5"
                        style={{ color: MARKER_TYPE_COLORS[marker.type] || marker.color }}
                      >
                        {MARKER_TYPE_LABELS[marker.type] || marker.type}
                      </Badge>
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
