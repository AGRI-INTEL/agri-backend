'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Search,
  Navigation,
  Copy,
  Check,
  ChevronRight,
  Users,
  Layers,
  Crosshair,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import type { ActorRow } from '@/components/actors/actor-card';
import { formatNumber, getSectorEmoji, hexToRgba } from '@/lib/utils';
import type { Map as MapLibreMap, Marker as MapLibreMarker } from 'maplibre-gl';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SectorMapViewProps {
  actors: ActorRow[];
  sector: string;
  color: string;
}

interface RegionGroup {
  name: string;
  count: number;
  pct: number;
  actors: ActorRow[];
}

interface GeoActor {
  id: string;
  name: string;
  lat: number;
  lon: number;
  metric: string | null;
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  name: string;
  metric: string | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getMetric(row: ActorRow): string | null {
  if (row.vegetal_data)    return `${formatNumber(row.vegetal_data.total_area_ha)} ha`;
  if (row.animal_data)     return `${formatNumber(row.animal_data.total_livestock)} têtes`;
  if (row.halieutique_data) return `${row.halieutique_data.pirogues_count} pirogues`;
  if (row.forestier_data)  return `${formatNumber(row.forestier_data.forest_area_ha)} ha`;
  if (row.minier_data)     return `${row.minier_data.workers_count ?? 0} ouvriers`;
  if (row.industriel_data) return `${row.industriel_data.employee_count ?? 0} employés`;
  return null;
}

function getInitials(name: string): string {
  return (name || '?')
    .split(' ')
    .map((n) => n[0] || '')
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';
}

// ---------------------------------------------------------------------------
// MapLibre GL actor map
// ---------------------------------------------------------------------------

const DEFAULT_CENTER: [number, number] = [-14, 14];
const DEFAULT_ZOOM = 5;

function ActorMapLibreMap({ actors, color, onTooltip }: {
  actors: GeoActor[];
  color: string;
  onTooltip: (state: TooltipState) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const maplibreglRef = useRef<typeof import('maplibre-gl') | null>(null);
  const markersRef = useRef<MapLibreMarker[]>([]);
  const onTooltipRef = useRef(onTooltip);
  onTooltipRef.current = onTooltip;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let cancelled = false;
    import('maplibre-gl').then((maplibregl) => {
      if (cancelled || !containerRef.current) return;
      const map = new maplibregl.Map({
        container: containerRef.current,
        style: 'https://tiles.openfreemap.org/styles/liberty',
        center: DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
      });
      map.on('load', () => { if (!cancelled) map.resize(); });
      mapRef.current = map;
      maplibreglRef.current = maplibregl;
    });
    return () => { cancelled = true; markersRef.current.forEach((m) => m.remove());
      markersRef.current = []; mapRef.current?.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const maplibregl = maplibreglRef.current;
    if (!map || !maplibregl) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    for (const actor of actors) {
      const el = document.createElement('div');
      el.className = 'actor-marker';
      el.innerHTML = `<div style="width:14px;height:14px;background:${color};border:2px solid white;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,0.3);cursor:pointer;"></div>`;

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([actor.lon, actor.lat])
        .addTo(map);
      markersRef.current.push(marker);

      el.addEventListener('mouseenter', () => {
        onTooltipRef.current({ visible: true, x: 0, y: 0, name: actor.name, metric: actor.metric });
      });
      el.addEventListener('mouseleave', () => {
        onTooltipRef.current({ visible: false, x: 0, y: 0, name: '', metric: null });
      });
    }

    if (actors.length > 0) {
      const bounds = new maplibregl.LngLatBounds();
      actors.forEach((a) => bounds.extend([a.lon, a.lat]));
      map.fitBounds(bounds, { padding: 60, maxZoom: 10 });
    }
  }, [actors, color]);

  return (
    <div ref={containerRef} className="w-full h-[400px] rounded-lg" />
  );
}

// ---------------------------------------------------------------------------
// Region density bar
// ---------------------------------------------------------------------------

function DensityBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function SectorMapView({ actors, sector, color }: SectorMapViewProps) {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [geoCoords, setGeoCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoCopied, setGeoCopied] = useState(false);
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    name: '',
    metric: null,
  });

  const sectorEmoji = getSectorEmoji(sector as Parameters<typeof getSectorEmoji>[0]);

  // ── Region grouping ──────────────────────────────────────────────────────

  const regionMap = new Map<string, ActorRow[]>();
  for (const a of actors) {
    const key = (a.region || 'Non renseigné').trim();
    if (!regionMap.has(key)) regionMap.set(key, []);
    regionMap.get(key)!.push(a);
  }

  const regions: RegionGroup[] = Array.from(regionMap.entries())
    .map(([name, group]) => ({
      name,
      count: group.length,
      pct: actors.length > 0 ? Math.round((group.length / actors.length) * 100) : 0,
      actors: group,
    }))
    .sort((a, b) => b.count - a.count);

  // ── Actor list filtering ─────────────────────────────────────────────────

  const listActors = actors.filter((a) => {
    const regionMatch = !selectedRegion || (a.region || 'Non renseigné').trim() === selectedRegion;
    const searchMatch =
      !search ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      (a.region || '').toLowerCase().includes(search.toLowerCase()) ||
      (a.city || '').toLowerCase().includes(search.toLowerCase());
    return regionMatch && searchMatch;
  });

  // ── Geo actors (those with lat/lon from DB or synthetic fallback) ──

  const geoActors: GeoActor[] = actors
    .filter((a) => a.latitude != null && a.longitude != null
      && !isNaN(Number(a.latitude)) && !isNaN(Number(a.longitude)))
    .map((a) => ({
      id: a.id,
      name: a.name,
      lat: parseFloat(Number(a.latitude).toFixed(4)),
      lon: parseFloat(Number(a.longitude).toFixed(4)),
      metric: getMetric(a),
    }));

  // ── Geolocation ──────────────────────────────────────────────────────────

  function requestGeolocation() {
    if (!navigator.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setGeoLoading(false);
      },
      () => setGeoLoading(false),
      { timeout: 8000 },
    );
  }

  function copyCoords() {
    if (!geoCoords) return;
    navigator.clipboard.writeText(`${geoCoords.lat.toFixed(6)}, ${geoCoords.lon.toFixed(6)}`);
    setGeoCopied(true);
    setTimeout(() => setGeoCopied(false), 2000);
  }

  // ── Tooltip handler ──────────────────────────────────────────────────────

  const handleTooltip = useCallback((state: TooltipState) => {
    setTooltip(state);
  }, []);

  // ── Empty state ──────────────────────────────────────────────────────────

  if (actors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
        <span className="text-5xl">{sectorEmoji}</span>
        <p className="text-muted-foreground text-sm">
          Aucun acteur à afficher sur la carte pour ce secteur.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header strip ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white text-sm font-bold"
            style={{ backgroundColor: color }}
          >
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
              Répartition géographique
            </p>
            <p className="text-sm font-semibold leading-tight">
              {actors.length} acteurs · {regions.length} région{regions.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {selectedRegion && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1 text-xs"
            onClick={() => setSelectedRegion(null)}
          >
            Toutes les régions
          </Button>
        )}
      </div>

      {/* ── Two-column layout: region grid + actor list ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Left: Region density cards */}
        <div className="lg:col-span-2 space-y-2">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-1 flex items-center gap-1.5">
            <span
              className="inline-block h-1.5 w-4 rounded-full"
              style={{ backgroundColor: color }}
            />
            Densité par région
          </p>

          <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1">
            {regions.map((r) => {
              const isSelected = selectedRegion === r.name;
              return (
                <button
                  key={r.name}
                  onClick={() => setSelectedRegion(isSelected ? null : r.name)}
                  className={[
                    'w-full text-left rounded-lg border px-3 py-2.5 transition-all duration-200',
                    'hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    isSelected
                      ? 'bg-card shadow-sm border-border/80 ring-1'
                      : 'bg-card/60 border-border/40 hover:bg-card hover:border-border/70',
                  ].join(' ')}
                  style={isSelected ? { ['--tw-ring-color' as string]: color } : {}}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-sm font-medium leading-tight truncate flex-1">
                      {r.name}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className="text-xs font-bold font-mono"
                        style={{ color }}
                      >
                        {r.count}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        ({r.pct}%)
                      </span>
                    </div>
                  </div>

                  <DensityBar pct={r.pct} color={color} />

                  {/* First 3 actor names */}
                  <div className="mt-2 space-y-0.5">
                    {r.actors.slice(0, 3).map((a) => (
                      <p key={a.id} className="text-[11px] text-muted-foreground truncate">
                        · {a.name}
                        {r.actors.length > 3 && a === r.actors[2] ? (
                          <span className="text-muted-foreground/60">
                            {' '}+{r.actors.length - 3} autres
                          </span>
                        ) : null}
                      </p>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Actor list */}
        <div className="lg:col-span-3 flex flex-col gap-3">
          <Input
            leftIcon={<Search className="h-3.5 w-3.5" />}
            placeholder="Rechercher un acteur, une région, une commune…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-sm"
          />

          <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1">
            <span>
              {listActors.length} acteur{listActors.length !== 1 ? 's' : ''}
              {selectedRegion ? ` · ${selectedRegion}` : ''}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              Région · Commune
            </span>
          </div>

          <div className="space-y-1.5 max-h-[370px] overflow-y-auto pr-1">
            {listActors.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                Aucun résultat pour cette recherche.
              </div>
            ) : (
              listActors.map((a) => {
                const metric = getMetric(a);
                return (
                  <Link
                    key={a.id}
                    href={`/actors/${a.id}`}
                    className={[
                      'flex items-center gap-3 rounded-lg border border-border/40 bg-card/60',
                      'px-3 py-2 hover:bg-card hover:border-border/80 hover:shadow-sm',
                      'transition-all duration-150 group',
                    ].join(' ')}
                  >
                    {/* Avatar */}
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[11px] font-bold text-white"
                      style={{ backgroundColor: color }}
                    >
                      {getInitials(a.name)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate leading-tight">{a.name}</p>
                      <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                        <span>{a.region || '—'}</span>
                        {a.city ? (
                          <>
                            <span className="mx-1 opacity-40">·</span>
                            <span>{a.city}</span>
                          </>
                        ) : null}
                      </p>
                    </div>

                    {/* Metric badge */}
                    {metric && (
                      <Badge
                        variant="outline"
                        className="shrink-0 text-[10px] font-mono font-semibold px-1.5 py-0"
                        style={{ color, borderColor: hexToRgba(color, 0.4) }}
                      >
                        {metric}
                      </Badge>
                    )}

                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-muted-foreground shrink-0 transition-colors" />
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ── SVG dot-map section ───────────────────────────────────────────── */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-3 pt-4 px-4 border-b border-border/40">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <MapPin className="h-4 w-4" style={{ color }} />
              Localisation · Afrique de l&apos;Ouest
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: color }}
                />
                {geoActors.length} acteur{geoActors.length !== 1 ? 's' : ''} géolocalisé{geoActors.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-3 relative">
          {geoActors.length > 0 ? (
            <ActorMapLibreMap actors={geoActors} color={color} onTooltip={handleTooltip} />
          ) : (
            <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
              Aucun acteur avec coordonnées géographiques.
            </div>
          )}

          {/* Map tooltip */}
          {tooltip.visible && (
            <div
              className="pointer-events-none fixed z-50 rounded-lg border border-border bg-popover px-3 py-2 shadow-modal text-sm"
              style={{ left: tooltip.x + 14, top: tooltip.y - 10 }}
            >
              <p className="font-semibold leading-tight">{tooltip.name}</p>
              {tooltip.metric && (
                <p className="text-xs text-muted-foreground mt-0.5">{tooltip.metric}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Geolocation capture ───────────────────────────────────────────── */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Crosshair className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">Ajouter ma localisation</p>
                <p className="text-[11px] text-muted-foreground">
                  Utilisez votre position GPS pour enrichir la carte
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:ml-auto flex-wrap">
              {geoCoords ? (
                <>
                  <div className="flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2.5 py-1.5 font-mono text-xs">
                    <Navigation className="h-3 w-3 text-muted-foreground" />
                    {geoCoords.lat.toFixed(5)}, {geoCoords.lon.toFixed(5)}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs"
                    onClick={copyCoords}
                  >
                    {geoCopied ? (
                      <Check className="h-3.5 w-3.5 text-green-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    {geoCopied ? 'Copié !' : 'Copier'}
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs"
                  onClick={requestGeolocation}
                  loading={geoLoading}
                >
                  <Navigation className="h-3.5 w-3.5" />
                  Obtenir ma position
                </Button>
              )}
            </div>
          </div>

          {geoCoords && (
            <div className="mt-3 rounded-md bg-muted/40 border border-border/40 px-3 py-2 text-[11px] text-muted-foreground flex items-center gap-2">
              <Users className="h-3.5 w-3.5 shrink-0" />
              Copiez ces coordonnées et transmettez-les à votre administrateur pour apparaître sur la carte du secteur.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
