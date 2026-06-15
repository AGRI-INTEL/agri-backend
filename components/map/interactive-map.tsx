'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Layers, Target, Satellite, Map as MapIcon, AlertCircle, Users, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMapStore, selectStyleUrl, selectVisibleLayers, selectSelectedMarker } from '@/stores/map-store';
import { useMapMarkers, type MapMarker } from '@/hooks/use-geolocation';
import { MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type * as maplibregl from 'maplibre-gl';

const STATIC_WEATHER_STATIONS: MapMarker[] = [
  {
    id: 'weather-1',
    label: 'Station météo Dakar',
    lng: -17.4441,
    lat: 14.6928,
    type: 'weather',
    color: '#3B82F6',
    description: '28°C • Ensoleillé',
  },
  {
    id: 'weather-2',
    label: 'Station météo Bamako',
    lng: -8.0029,
    lat: 12.6392,
    type: 'weather',
    color: '#3B82F6',
    description: '31°C • Faible vent',
  },
  {
    id: 'weather-3',
    label: 'Station météo Accra',
    lng: -0.1870,
    lat: 5.6037,
    type: 'weather',
    color: '#3B82F6',
    description: '29°C • Nuageux',
  },
];

export function InteractiveMap({ className }: { className?: string }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<maplibregl.Map | null>(null);
  const markerRefs = useRef<maplibregl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showLayers, setShowLayers] = useState(false);

  const styleUrl = useMapStore(selectStyleUrl);
  const mapStyle = useMapStore((state) => state.style);
  const layers = useMapStore(selectVisibleLayers);
  const selectedMarkerId = useMapStore(selectSelectedMarker);
  const setStyle = useMapStore((state) => state.setStyle);
  const toggleLayer = useMapStore((state) => state.toggleLayer);
  const setSelectedMarker = useMapStore((state) => state.setSelectedMarker);
  const visibleLayerIds = useMemo(() => layers.map((l) => l.id), [layers]);
  const { data: apiMarkers } = useMapMarkers();
  const weatherMarkers = useMemo(
    () => (visibleLayerIds.includes('weather') ? STATIC_WEATHER_STATIONS : []),
    [visibleLayerIds]
  );

  const filteredMarkers = useMemo(() => {
    const activeTypes = new Set<string>();
    if (visibleLayerIds.includes('actors')) activeTypes.add('actor');
    if (visibleLayerIds.includes('alerts')) activeTypes.add('alert');
    if (visibleLayerIds.includes('weather')) activeTypes.add('weather');

    return [
      ...(apiMarkers ?? []),
      ...weatherMarkers,
    ].filter((marker) => activeTypes.has(marker.type));
  }, [apiMarkers, weatherMarkers, visibleLayerIds]);

  const clearMarkers = (markers: maplibregl.Marker[]) => {
    markers.forEach((marker) => marker?.remove?.());
    markers.length = 0;
  };

  const createMarkerElement = (marker: MapMarker) => {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'flex items-center justify-center rounded-full shadow-lg border-2 border-white';
    el.style.cssText = `
      width: 32px;
      height: 32px;
      background: ${marker.color};
      cursor: pointer;
      border-radius: 9999px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.18);
    `;
    el.title = marker.label;
    el.onclick = () => {
      setSelectedMarker(selectedMarkerId === marker.id ? null : marker.id);
    };
    return el;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderMarkers = (map: any) => {
    clearMarkers(markerRefs.current);

    filteredMarkers.forEach((marker) => {
      const markerEl = createMarkerElement(marker);

      const popup = new map.Popup({ offset: 16, className: 'map-popup' }).setHTML(
        `<div style="padding:12px;font-family:Inter,sans-serif;max-width:220px">
          <strong style="font-size:13px;display:block;margin-bottom:4px">${marker.label}</strong>
          ${marker.description ? `<p style="font-size:12px;color:#64748B;margin:0">${marker.description}</p>` : ''}
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
      const maplibregl: any = (mod as any).default ?? mod;
      const map = new maplibregl.Map({
        container: mapRef.current as HTMLElement,
        style: styleUrl,
        center: MAP_DEFAULT_CENTER,
        zoom: MAP_DEFAULT_ZOOM,
        attributionControl: false,
      });

      map.addControl(new maplibregl.NavigationControl(), 'top-right');
      map.addControl(
        new maplibregl.GeolocateControl({
          positionOptions: { enableHighAccuracy: true },
          trackUserLocation: true,
        }),
        'top-right'
      );
      map.addControl(new maplibregl.ScaleControl({}), 'bottom-left');
      map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

      map.on('load', () => {
        setMapLoaded(true);
        renderMarkers(map);
      });

      mapInstanceRef.current = map;
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
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
    if (!mapLoaded || !mapInstanceRef.current || !selectedMarkerId || !apiMarkers?.length) return;
    const map = mapInstanceRef.current;
    const marker = apiMarkers.find((item) => item.id === selectedMarkerId);
    if (marker) {
      map.flyTo({ center: [marker.lng, marker.lat], zoom: 10 });
    }
  }, [selectedMarkerId, apiMarkers, mapLoaded]);

  const handleGeolocate = () => {
    if (!navigator.geolocation || !mapInstanceRef.current) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      mapInstanceRef.current.flyTo({ center: [pos.coords.longitude, pos.coords.latitude], zoom: 12 });
      setSelectedMarker(null);
    });
  };

  return (
    <div className={cn('relative rounded-card overflow-hidden bg-background', className)}>
      <div ref={mapRef} className="w-full h-full" aria-label="Carte interactive agricole" />

      <div className="absolute bottom-20 right-4 flex flex-col gap-2 z-10">
        <div className="bg-card border border-border rounded-lg shadow-lg overflow-hidden">
          {[
            { id: 'streets', icon: MapIcon, label: 'Rues' },
            { id: 'satellite', icon: Satellite, label: 'Satellite' },
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setStyle(id as 'streets' | 'satellite')}
              className={cn(
                'p-3 transition-colors border-b last:border-0 hover:bg-muted',
                mapStyle === id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
              title={label}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>
      </div>

      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={() => setShowLayers(!showLayers)}
          className="bg-card border border-border rounded-lg shadow-lg p-3 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          title="Couches"
        >
          <Layers className="h-5 w-5" />
        </button>

        {showLayers && (
          <div className="absolute top-12 left-0 bg-card border border-border rounded-lg shadow-lg p-3 space-y-2 min-w-48 mt-2">
            <h3 className="text-xs font-semibold text-foreground mb-2">Couches</h3>
            {[
              { id: 'weather', label: '🌤️ Météo' },
              { id: 'predictions', label: '📈 Prédictions' },
              { id: 'alerts', label: '⚠️ Alertes' },
              { id: 'actors', label: '👥 Acteurs' },
              { id: 'markets', label: '🏪 Marchés' },
            ].map(({ id, label }) => (
              <label key={id} className="flex items-center gap-2 p-2 rounded-md hover:bg-muted cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={visibleLayerIds.includes(id)}
                  onChange={() => toggleLayer(id)}
                  className="rounded w-4 h-4"
                />
                <span className="text-muted-foreground">{label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="absolute bottom-4 left-4 bg-card border border-border rounded-lg shadow-lg p-3 max-w-xs z-10">
        <h3 className="text-xs font-semibold text-foreground mb-2">Légende</h3>
        <div className="space-y-1.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>Acteurs</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>Alertes</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span>Météo</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            <span>Prédictions</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span>Marchés</span>
          </div>
        </div>
      </div>

      <div className="absolute top-4 right-4 bg-card border border-border rounded-lg shadow-lg p-4 max-w-xs z-10 space-y-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-green-500" />
            <span className="text-xs font-medium">Acteurs</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span className="text-xs font-medium">Alertes</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-purple-500" />
            <span className="text-xs font-medium">Prédictions</span>
          </div>
        </div>
        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground">Cliquez sur un marqueur pour centrer la carte.</p>
          <Button variant="outline" size="sm" className="w-full mt-2" onClick={handleGeolocate}>
            <Target className="h-4 w-4 mr-2" /> Ma position
          </Button>
        </div>
      </div>

      <style>{`
        .map-popup .maplibregl-popup-content {
          padding: 0 !important;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
        }
        .map-popup .maplibregl-popup-tip {
          border-top-color: hsl(var(--card)) !important;
        }
      `}</style>
    </div>
  );
}
