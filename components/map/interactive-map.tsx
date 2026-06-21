'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Layers, Target, Satellite, Map as MapIcon, AlertCircle, Users, TrendingUp, TreePine, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMapStore, selectStyleUrl, selectVisibleLayers, selectSelectedMarker } from '@/stores/map-store';
import { useMapMarkers, type MapMarker } from '@/hooks/use-geolocation';
import { MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type * as maplibregl from 'maplibre-gl';

const STATIC_WEATHER_STATIONS: MapMarker[] = [
  { id: 'weather-1', label: 'Station météo Dakar',  lng: -17.4441, lat: 14.6928, type: 'weather', color: '#3B82F6', description: '28°C · Ensoleillé' },
  { id: 'weather-2', label: 'Station météo Bamako', lng: -8.0029,  lat: 12.6392, type: 'weather', color: '#3B82F6', description: '31°C · Faible vent' },
  { id: 'weather-3', label: 'Station météo Accra',  lng: -0.1870,  lat: 5.6037,  type: 'weather', color: '#3B82F6', description: '29°C · Nuageux' },
  { id: 'weather-4', label: 'Station météo Abidjan',lng: -4.0305,  lat: 5.3600,  type: 'weather', color: '#3B82F6', description: '27°C · Partiellement nuageux' },
];

const STATIC_MARKET_MARKERS: MapMarker[] = [
  { id: 'market-1', label: 'Marché de Kaolack',   lng: -16.0726, lat: 14.1652, type: 'market', color: '#F59E0B', description: 'Marché hebdomadaire · Céréales' },
  { id: 'market-2', label: 'Marché de Bouaké',    lng: -5.0317,  lat: 7.6897,  type: 'market', color: '#F59E0B', description: 'Marché principal · Bétail & Vivriers' },
  { id: 'market-3', label: 'Marché de Kumasi',    lng: -1.6232,  lat: 6.6885,  type: 'market', color: '#F59E0B', description: 'Grand marché · Export cacao' },
];

const MARKER_TYPE_ICON: Record<string, string> = {
  actor: '👥', alert: '⚠️', weather: '🌤️', market: '🏪', prediction: '📈',
};

export function InteractiveMap({ className }: { className?: string }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<maplibregl.Map | null>(null);
  const markerRefs = useRef<maplibregl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showLayers, setShowLayers] = useState(false);

  const styleUrl   = useMapStore(selectStyleUrl);
  const mapStyle   = useMapStore((s) => s.style);
  const layers     = useMapStore(selectVisibleLayers);
  const selectedMarkerId = useMapStore(selectSelectedMarker);
  const setStyle   = useMapStore((s) => s.setStyle);
  const toggleLayer = useMapStore((s) => s.toggleLayer);
  const setSelectedMarker = useMapStore((s) => s.setSelectedMarker);

  const visibleLayerIds = useMemo(() => layers.map((l) => l.id), [layers]);
  const { data: apiMarkers } = useMapMarkers();

  const weatherMarkers = useMemo(
    () => (visibleLayerIds.includes('weather') ? STATIC_WEATHER_STATIONS : []),
    [visibleLayerIds]
  );
  const marketMarkers = useMemo(
    () => (visibleLayerIds.includes('markets') ? STATIC_MARKET_MARKERS : []),
    [visibleLayerIds]
  );

  const filteredMarkers = useMemo(() => {
    const activeTypes = new Set<string>();
    if (visibleLayerIds.includes('actors'))  activeTypes.add('actor');
    if (visibleLayerIds.includes('alerts'))  activeTypes.add('alert');
    if (visibleLayerIds.includes('weather')) activeTypes.add('weather');
    if (visibleLayerIds.includes('markets')) activeTypes.add('market');

    return [
      ...(apiMarkers ?? []),
      ...weatherMarkers,
      ...marketMarkers,
    ].filter((marker) => activeTypes.has(marker.type));
  }, [apiMarkers, weatherMarkers, marketMarkers, visibleLayerIds]);

  const clearMarkers = (markers: maplibregl.Marker[]) => {
    markers.forEach((m) => m?.remove?.());
    markers.length = 0;
  };

  const createMarkerElement = (marker: MapMarker, isSelected: boolean) => {
    const el = document.createElement('button');
    el.type = 'button';
    el.style.cssText = `
      width: ${isSelected ? '38px' : '32px'};
      height: ${isSelected ? '38px' : '32px'};
      background: ${marker.color};
      border-radius: 9999px;
      border: 3px solid ${isSelected ? '#fff' : 'rgba(255,255,255,0.8)'};
      box-shadow: 0 3px 12px ${marker.color}66, 0 1px 4px rgba(0,0,0,0.2);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: ${isSelected ? '16px' : '14px'};
      transition: all 0.2s ease;
      transform: ${isSelected ? 'scale(1.15)' : 'scale(1)'};
      z-index: ${isSelected ? 10 : 1};
    `;
    el.textContent = MARKER_TYPE_ICON[marker.type] || '📍';
    el.title = marker.label;
    el.setAttribute('aria-label', marker.label);
    el.onclick = () => {
      setSelectedMarker(selectedMarkerId === marker.id ? null : marker.id);
    };
    return el;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderMarkers = (map: any) => {
    clearMarkers(markerRefs.current);
    filteredMarkers.forEach((marker) => {
      const isSelected = marker.id === selectedMarkerId;
      const markerEl = createMarkerElement(marker, isSelected);

      const popup = new map.Popup({ offset: 20, className: 'map-popup' }).setHTML(
        `<div style="padding:12px 14px;font-family:Inter,system-ui,sans-serif;min-width:160px;max-width:240px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
            <span style="font-size:18px">${MARKER_TYPE_ICON[marker.type] || '📍'}</span>
            <strong style="font-size:13px;color:#0f172a;line-height:1.2">${marker.label}</strong>
          </div>
          ${marker.description ? `<p style="font-size:12px;color:#64748b;margin:0 0 6px">${marker.description}</p>` : ''}
          <div style="display:flex;align-items:center;gap:4px;margin-top:6px">
            <span style="background:${marker.color};color:#fff;font-size:10px;font-weight:600;padding:2px 8px;border-radius:9999px;text-transform:capitalize">${marker.type}</span>
          </div>
          <p style="font-size:10px;color:#94a3b8;margin:6px 0 0;font-family:monospace">${marker.lat.toFixed(4)}, ${marker.lng.toFixed(4)}</p>
        </div>`
      );

      const mapMarker = new map.Marker({ element: markerEl })
        .setLngLat([marker.lng, marker.lat])
        .setPopup(popup)
        .addTo(map);

      markerRefs.current.push(mapMarker);
    });
  };

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    import('maplibre-gl').then((mod) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ml: any = (mod as any).default ?? mod;
      const map = new ml.Map({
        container: mapRef.current as HTMLElement,
        style: styleUrl,
        center: MAP_DEFAULT_CENTER,
        zoom: MAP_DEFAULT_ZOOM,
        attributionControl: false,
      });

      map.addControl(new ml.NavigationControl(), 'top-right');
      map.addControl(
        new ml.GeolocateControl({ positionOptions: { enableHighAccuracy: true }, trackUserLocation: true }),
        'top-right'
      );
      map.addControl(new ml.ScaleControl({}), 'bottom-right');
      map.addControl(new ml.AttributionControl({ compact: true }), 'bottom-right');

      map.on('load', () => {
        setMapLoaded(true);
        renderMarkers(map);
      });

      mapInstanceRef.current = map;
    });

    return () => {
      if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [styleUrl]);

  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    if (map.getStyle && map.getStyle().sprite !== styleUrl) {
      map.setStyle(styleUrl);
      map.once('styledata', () => renderMarkers(map));
    } else {
      renderMarkers(map);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredMarkers, mapLoaded, styleUrl, selectedMarkerId]);

  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || !selectedMarkerId) return;
    const map = mapInstanceRef.current;
    const allMarkers = [...(apiMarkers ?? []), ...STATIC_WEATHER_STATIONS, ...STATIC_MARKET_MARKERS];
    const marker = allMarkers.find((m) => m.id === selectedMarkerId);
    if (marker) map.flyTo({ center: [marker.lng, marker.lat], zoom: 10, duration: 1000 });
  }, [selectedMarkerId, apiMarkers, mapLoaded]);

  const handleGeolocate = () => {
    if (!navigator.geolocation || !mapInstanceRef.current) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      mapInstanceRef.current!.flyTo({ center: [pos.coords.longitude, pos.coords.latitude], zoom: 12, duration: 1200 });
      setSelectedMarker(null);
    });
  };

  const ALL_LAYER_DEFS = [
    { id: 'weather',     label: '🌤️ Météo',       color: '#3b82f6' },
    { id: 'predictions', label: '📈 Prédictions',  color: '#a855f7' },
    { id: 'alerts',      label: '⚠️ Alertes',      color: '#ef4444' },
    { id: 'actors',      label: '👥 Acteurs',      color: '#22c55e' },
    { id: 'markets',     label: '🏪 Marchés',      color: '#f59e0b' },
  ];

  const LEGEND = [
    { color: '#22c55e', icon: Users,      label: 'Acteurs' },
    { color: '#ef4444', icon: AlertCircle, label: 'Alertes' },
    { color: '#3b82f6', icon: TreePine,   label: 'Météo' },
    { color: '#a855f7', icon: TrendingUp, label: 'Prédictions' },
    { color: '#f59e0b', icon: ShoppingBag, label: 'Marchés' },
  ];

  return (
    <div className={cn('relative overflow-hidden bg-background', className)}>
      <div ref={mapRef} className="w-full h-full" aria-label="Carte interactive agricole" />

      {/* ── Style switcher ── */}
      <div className="absolute bottom-16 right-4 flex flex-col gap-1 z-10">
        <div className="bg-card/95 backdrop-blur-sm border border-border rounded-xl shadow-lg overflow-hidden">
          {[
            { id: 'streets', icon: MapIcon, label: 'Rues' },
            { id: 'satellite', icon: Satellite, label: 'Satellite' },
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setStyle(id as 'streets' | 'satellite')}
              className={cn(
                'flex items-center gap-2 w-full px-3 py-2.5 text-xs font-medium transition-colors border-b last:border-0',
                mapStyle === id
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Layers toggle button ── */}
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={() => setShowLayers(!showLayers)}
          className={cn(
            'bg-card/95 backdrop-blur-sm border rounded-xl shadow-lg p-3 transition-all duration-150',
            showLayers
              ? 'border-primary text-primary bg-primary/10'
              : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted'
          )}
          title="Couches cartographiques"
        >
          <Layers className="h-5 w-5" />
        </button>

        {showLayers && (
          <div className="absolute top-14 left-0 bg-card/98 backdrop-blur-sm border border-border rounded-xl shadow-xl p-3 space-y-1.5 min-w-52 z-20">
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-border">
              <h3 className="text-xs font-bold text-foreground">Couches</h3>
              <button
                onClick={() => setShowLayers(false)}
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                ✕
              </button>
            </div>
            {ALL_LAYER_DEFS.map(({ id, label, color }) => (
              <label
                key={id}
                className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={visibleLayerIds.includes(id)}
                  onChange={() => toggleLayer(id)}
                  className="rounded w-3.5 h-3.5 cursor-pointer"
                  style={{ accentColor: color }}
                />
                <span className="text-xs font-medium text-foreground">{label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* ── Legend ── */}
      <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur-sm border border-border rounded-xl shadow-lg px-3 py-2.5 z-10">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1.5">Légende</p>
        <div className="space-y-1.5">
          {LEGEND.map(({ color, icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: color + '20', color }}>
                <Icon className="h-3 w-3" />
              </div>
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Position button ── */}
      <div className="absolute top-16 left-4 z-10">
        <Button
          variant="outline"
          size="sm"
          className="h-9 w-9 p-0 bg-card/95 backdrop-blur-sm shadow-lg border-border hover:border-primary"
          onClick={handleGeolocate}
          title="Ma position"
        >
          <Target className="h-4 w-4" />
        </Button>
      </div>

      {/* Map loading overlay */}
      {!mapLoaded && (
        <div className="absolute inset-0 bg-muted/80 backdrop-blur-sm flex items-center justify-center z-30">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <p className="text-sm font-medium text-foreground">Chargement de la carte...</p>
            <p className="text-xs text-muted-foreground">OpenStreetMap</p>
          </div>
        </div>
      )}

      <style>{`
        .map-popup .maplibregl-popup-content {
          padding: 0 !important;
          border-radius: 12px !important;
          box-shadow: 0 8px 24px rgba(0,0,0,0.18) !important;
          border: 1px solid hsl(var(--border)) !important;
          overflow: hidden;
        }
        .map-popup .maplibregl-popup-tip {
          border-top-color: white !important;
        }
        .maplibregl-ctrl-group {
          border-radius: 10px !important;
          overflow: hidden;
          border: 1px solid hsl(var(--border)) !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
        }
      `}</style>
    </div>
  );
}
