'use client';

import { useEffect, useRef, useState } from 'react';
import { Layers, Target, Satellite, Map as MapIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useMapStore } from '@/stores/map-store';
import { useMapMarkers } from '@/hooks/use-geolocation';
import { MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM, MAP_STYLE_STREETS, MAP_STYLE_SATELLITE } from '@/lib/constants';
import { cn } from '@/lib/utils';

export function InteractiveMap({ className }: { className?: string }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showLayers, setShowLayers] = useState(false);
  const { style, layers, setStyle, toggleLayer } = useMapStore();
  const { data: apiMarkers } = useMapMarkers();

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const mapStyle = style === 'satellite' ? MAP_STYLE_SATELLITE : MAP_STYLE_STREETS;

    import('maplibre-gl').then(({ default: maplibregl }) => {
      const map = new maplibregl.Map({
        container: mapRef.current!,
        style: mapStyle,
        center: MAP_DEFAULT_CENTER,
        zoom: MAP_DEFAULT_ZOOM,
        attributionControl: false,
      });

      map.addControl(new maplibregl.NavigationControl(), 'top-right');
      map.addControl(new maplibregl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
      }), 'top-right');
      map.addControl(new maplibregl.ScaleControl({}), 'bottom-left');
      map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

      map.on('load', () => setMapLoaded(true));

      mapInstanceRef.current = map;
    });

    return () => {
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as { remove: () => void }).remove();
        mapInstanceRef.current = null;
      }
    };
  }, [style]);

  // Marqueurs API (acteurs, alertes)
  useEffect(() => {
    const map = mapInstanceRef.current as {
      remove?: () => void;
      getContainer?: () => HTMLElement;
    } | null;
    if (!map || !mapLoaded || !apiMarkers?.length) return;

    import('maplibre-gl').then(({ default: maplibregl }) => {
      apiMarkers.forEach((m) => {
        const el = document.createElement('div');
        el.style.cssText = `
          width: 28px; height: 28px; border-radius: 50%;
          background: ${m.color}; border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.25); cursor: pointer;
        `;
        new maplibregl.Marker({ element: el })
          .setLngLat([m.lng, m.lat])
          .setPopup(
            new maplibregl.Popup({ offset: 16 }).setHTML(`
              <div style="padding:8px;font-family:Inter,sans-serif;max-width:180px">
                <strong style="font-size:12px">${m.label}</strong>
                ${m.description ? `<p style="font-size:11px;color:#64748B;margin:4px 0 0">${m.description}</p>` : ''}
              </div>
            `)
          )
          .addTo(map as unknown as maplibregl.Map);
      });
    });
  }, [mapLoaded, apiMarkers]);

  const handleGeolocate = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const map = mapInstanceRef.current as { flyTo: (opts: unknown) => void } | null;
      map?.flyTo({ center: [pos.coords.longitude, pos.coords.latitude], zoom: 12 });
    });
  };

  return (
    <div className={cn('relative rounded-card overflow-hidden', className)}>
      {/* Map container */}
      <div ref={mapRef} className="w-full h-full" aria-label="Carte interactive agricole" />

      {/* Controls overlay */}
      <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
        {/* Style toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setStyle(style === 'streets' ? 'satellite' : 'streets')}
          className="bg-card/90 backdrop-blur-sm gap-2 shadow-card"
          aria-label="Changer le style de carte"
        >
          {style === 'streets' ? <Satellite className="h-4 w-4" /> : <MapIcon className="h-4 w-4" />}
          {style === 'streets' ? 'Satellite' : 'Carte'}
        </Button>

        {/* Layers toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowLayers(!showLayers)}
          className="bg-card/90 backdrop-blur-sm gap-2 shadow-card"
          aria-label="Gérer les couches"
          aria-expanded={showLayers}
        >
          <Layers className="h-4 w-4" />
          Couches
        </Button>

        {/* Geolocation */}
        <Button
          variant="outline"
          size="icon"
          onClick={handleGeolocate}
          className="bg-card/90 backdrop-blur-sm shadow-card"
          aria-label="Ma position"
        >
          <Target className="h-4 w-4" />
        </Button>
      </div>

      {/* Layers panel */}
      {showLayers && (
        <div className="absolute top-3 left-36 bg-card/95 backdrop-blur-sm rounded-card border border-border p-3 shadow-modal z-10 min-w-48">
          <p className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wide">Couches</p>
          <div className="space-y-2">
            {layers.map((layer) => (
              <div key={layer.id} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: layer.color }} aria-hidden="true" />
                  <span className="text-sm">{layer.label}</span>
                </div>
                <Switch
                  checked={layer.visible}
                  onCheckedChange={() => toggleLayer(layer.id)}
                  aria-label={`${layer.visible ? 'Masquer' : 'Afficher'} ${layer.label}`}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading overlay */}
      {!mapLoaded && (
        <div className="absolute inset-0 bg-muted flex items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Chargement de la carte...</p>
          </div>
        </div>
      )}
    </div>
  );
}
