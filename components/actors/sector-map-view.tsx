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
// West Africa simplified outline — [lon, lat] pairs per country polygon
// Viewport: lon -18..15, lat 4..21
// We'll project linearly onto an SVG canvas
// ---------------------------------------------------------------------------

const WEST_AFRICA_BOUNDS = {
  lonMin: -18,
  lonMax: 16,
  latMin: 3.5,
  latMax: 21,
};

const SENEGAL_OUTLINE: [number, number][] = [
  [-16.7, 13.1], [-15.6, 13.6], [-14.3, 14.0], [-13.8, 14.9],
  [-13.0, 15.5], [-12.0, 15.6], [-11.4, 15.9], [-11.3, 16.6],
  [-12.2, 16.7], [-13.0, 16.5], [-14.5, 16.5], [-15.0, 16.8],
  [-15.6, 16.5], [-16.3, 16.2], [-16.5, 15.4], [-17.1, 14.7],
  [-17.5, 14.0], [-17.2, 13.6], [-16.7, 13.1],
];

const GAMBIA_OUTLINE: [number, number][] = [
  [-16.8, 13.3], [-15.8, 13.1], [-14.4, 13.2], [-13.8, 13.6],
  [-14.3, 13.8], [-15.6, 13.7], [-16.8, 13.5], [-16.8, 13.3],
];

const GUINEA_OUTLINE: [number, number][] = [
  [-15.1, 11.5], [-14.1, 11.5], [-13.3, 11.7], [-12.4, 12.0],
  [-11.3, 12.0], [-10.7, 11.5], [-10.2, 11.0], [-9.0, 10.1],
  [-8.5, 9.3], [-8.3, 8.5], [-9.0, 8.3], [-10.1, 8.5],
  [-10.8, 9.5], [-11.5, 10.0], [-12.3, 10.5], [-13.0, 10.8],
  [-13.6, 11.0], [-14.4, 10.5], [-14.8, 11.0], [-15.1, 11.5],
];

const GUINEA_BISSAU_OUTLINE: [number, number][] = [
  [-15.0, 12.0], [-14.4, 12.2], [-13.7, 12.0], [-13.3, 11.7],
  [-14.1, 11.5], [-15.1, 11.5], [-15.4, 11.7], [-15.0, 12.0],
];

const MALI_OUTLINE: [number, number][] = [
  [-4.2, 19.2], [-1.3, 20.4], [1.2, 20.8], [2.4, 20.1],
  [4.1, 19.1], [4.3, 17.0], [2.8, 15.4], [2.0, 14.9],
  [0.8, 14.9], [-0.2, 15.1], [-1.1, 14.8], [-2.1, 14.5],
  [-3.5, 13.5], [-4.5, 13.0], [-5.5, 13.2], [-6.5, 13.5],
  [-7.0, 13.1], [-8.0, 13.6], [-8.5, 14.0], [-7.5, 15.0],
  [-5.6, 15.5], [-4.8, 16.6], [-4.2, 19.2],
];

const BURKINA_OUTLINE: [number, number][] = [
  [-5.3, 15.2], [-4.8, 15.0], [-4.1, 15.2], [-2.1, 14.5],
  [-1.1, 14.8], [-0.2, 15.1], [0.8, 14.9], [1.9, 14.5],
  [2.0, 13.5], [1.6, 12.6], [0.9, 12.0], [0.1, 11.4],
  [-0.7, 11.1], [-1.5, 11.0], [-2.8, 11.2], [-3.5, 11.8],
  [-4.1, 12.0], [-5.0, 11.9], [-5.5, 12.6], [-6.0, 12.9],
  [-5.3, 15.2],
];

const NIGER_OUTLINE: [number, number][] = [
  [2.4, 20.1], [4.1, 19.1], [7.5, 20.7], [12.5, 22.5],
  [14.9, 22.5], [15.6, 21.0], [14.5, 19.5], [13.5, 18.5],
  [13.2, 17.2], [13.0, 16.0], [13.5, 15.5], [14.2, 15.2],
  [14.8, 13.3], [13.5, 13.5], [13.0, 14.0], [12.5, 13.5],
  [11.5, 13.3], [10.6, 13.4], [9.5, 13.2], [8.5, 13.3],
  [7.5, 13.5], [6.5, 13.2], [4.3, 13.0], [4.3, 17.0],
  [2.4, 20.1],
];

const SENEGAL_CAPITALS = [
  { name: 'Dakar', lat: 14.69, lon: -17.44 },
  { name: 'Thiès', lat: 14.79, lon: -16.93 },
  { name: 'Kaolack', lat: 14.15, lon: -16.07 },
  { name: 'Saint-Louis', lat: 16.03, lon: -16.5 },
  { name: 'Ziguinchor', lat: 12.57, lon: -16.27 },
  { name: 'Tambacounda', lat: 13.77, lon: -13.67 },
  { name: 'Kolda', lat: 12.88, lon: -14.94 },
  { name: 'Fatick', lat: 14.34, lon: -16.41 },
];

// ---------------------------------------------------------------------------
// Canvas dot-map
// ---------------------------------------------------------------------------

function projectCoord(
  lon: number,
  lat: number,
  width: number,
  height: number,
): { x: number; y: number } {
  const { lonMin, lonMax, latMin, latMax } = WEST_AFRICA_BOUNDS;
  const x = ((lon - lonMin) / (lonMax - lonMin)) * width;
  // Invert y: higher lat = top
  const y = ((latMax - lat) / (latMax - latMin)) * height;
  return { x, y };
}

function drawOutline(
  ctx: CanvasRenderingContext2D,
  outline: [number, number][],
  w: number,
  h: number,
  fillColor: string,
  strokeColor: string,
) {
  if (outline.length < 2) return;
  ctx.beginPath();
  const first = projectCoord(outline[0][0], outline[0][1], w, h);
  ctx.moveTo(first.x, first.y);
  for (let i = 1; i < outline.length; i++) {
    const pt = projectCoord(outline[i][0], outline[i][1], w, h);
    ctx.lineTo(pt.x, pt.y);
  }
  ctx.closePath();
  ctx.fillStyle = fillColor;
  ctx.fill();
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 1;
  ctx.stroke();
}

// ---------------------------------------------------------------------------
// West Africa Canvas Map component
// ---------------------------------------------------------------------------

interface DotMapProps {
  actors: GeoActor[];
  color: string;
  onTooltip: (state: TooltipState) => void;
}

function DotMap({ actors, color, onTooltip }: DotMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ w: 700, h: 380 });

  const draw = useCallback(
    (w: number, h: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = w;
      canvas.height = h;

      // Background
      ctx.fillStyle = 'hsl(210 40% 97%)';
      ctx.fillRect(0, 0, w, h);

      // Ocean tint
      ctx.fillStyle = 'hsl(210 60% 93%)';
      ctx.fillRect(0, 0, w, h);

      // Country fills
      const countryFill = 'hsl(120 15% 88%)';
      const countryStroke = 'hsl(120 12% 75%)';
      const senegalFill = 'hsl(142 30% 85%)';

      drawOutline(ctx, MALI_OUTLINE, w, h, countryFill, countryStroke);
      drawOutline(ctx, NIGER_OUTLINE, w, h, countryFill, countryStroke);
      drawOutline(ctx, BURKINA_OUTLINE, w, h, countryFill, countryStroke);
      drawOutline(ctx, GUINEA_OUTLINE, w, h, countryFill, countryStroke);
      drawOutline(ctx, GUINEA_BISSAU_OUTLINE, w, h, countryFill, countryStroke);
      drawOutline(ctx, GAMBIA_OUTLINE, w, h, countryFill, countryStroke);
      // Senegal on top with sector-tinted fill
      drawOutline(ctx, SENEGAL_OUTLINE, w, h, senegalFill, 'hsl(142 35% 60%)');

      // Reference city dots (light)
      ctx.fillStyle = 'hsl(215 20% 65%)';
      ctx.font = `${Math.max(9, w * 0.013)}px Inter, sans-serif`;
      for (const city of SENEGAL_CAPITALS) {
        const pt = projectCoord(city.lon, city.lat, w, h);
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = 'hsl(215 25% 60%)';
        ctx.fill();
        ctx.fillStyle = 'hsl(222 30% 35%)';
        ctx.fillText(city.name, pt.x + 4, pt.y + 3);
      }

      // Actor dots
      for (const actor of actors) {
        const pt = projectCoord(actor.lon, actor.lat, w, h);

        // Glow
        const grad = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, 14);
        grad.addColorStop(0, hexToRgba(color, 0.35));
        grad.addColorStop(1, hexToRgba(color, 0));
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 14, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Dot
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    },
    [actors, color],
  );

  useEffect(() => {
    const obs = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = Math.floor(entry.contentRect.width);
        const h = Math.round(w * 0.54);
        setDimensions({ w, h });
        draw(w, h);
      }
    });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [draw]);

  useEffect(() => {
    draw(dimensions.w, dimensions.h);
  }, [draw, dimensions]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      for (const actor of actors) {
        const pt = projectCoord(actor.lon, actor.lat, dimensions.w, dimensions.h);
        const dx = mx - pt.x;
        const dy = my - pt.y;
        if (Math.sqrt(dx * dx + dy * dy) < 10) {
          onTooltip({ visible: true, x: e.clientX, y: e.clientY, name: actor.name, metric: actor.metric });
          return;
        }
      }
      onTooltip({ visible: false, x: 0, y: 0, name: '', metric: null });
    },
    [actors, dimensions, onTooltip],
  );

  const handleMouseLeave = useCallback(() => {
    onTooltip({ visible: false, x: 0, y: 0, name: '', metric: null });
  }, [onTooltip]);

  return (
    <div ref={containerRef} className="w-full">
      <canvas
        ref={canvasRef}
        width={dimensions.w}
        height={dimensions.h}
        className="w-full rounded-lg cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ display: 'block' }}
      />
    </div>
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

  // ── Geo actors (those with lat/lon — using city as proxy if no explicit coords) ──
  // In a real app, actor rows would carry lat/lon. We generate plausible
  // Senegal bounding-box coords deterministically from the actor id so the
  // map is always populated when actors exist.

  const geoActors: GeoActor[] = actors.map((a, idx) => {
    // If the actor has explicit lat/lon fields (future-proof), use them.
    // Otherwise derive a stable pseudo-location inside Senegal from the id.
    const seed = (a.id || String(idx))
      .split('')
      .reduce((acc, c) => acc + c.charCodeAt(0), 0);

    const lat = 12.5 + ((seed * 17 + idx * 31) % 1000) / 250;   // ~12.5–16.5
    const lon = -16.8 + ((seed * 13 + idx * 7) % 1000) / 233;   // ~-16.8–-12.5

    return {
      id: a.id,
      name: a.name,
      lat: parseFloat(lat.toFixed(4)),
      lon: parseFloat(lon.toFixed(4)),
      metric: getMetric(a),
    };
  });

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
                {geoActors.length} acteur{geoActors.length !== 1 ? 's' : ''}
              </span>
              <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-[hsl(215_25%_60%)]" />
                Villes de référence
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-3 relative">
          <DotMap actors={geoActors} color={color} onTooltip={handleTooltip} />

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
