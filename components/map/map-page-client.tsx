'use client';

import { useState, useEffect } from 'react';
import { InteractiveMap } from './interactive-map';
import { MapSidebar } from './map-sidebar';
import { MapToolbar } from './map-toolbar';
import { useMapStore, selectLayers } from '@/stores/map-store';
import { useMapMarkers } from '@/hooks/use-geolocation';
import { Map, Layers, MapPin, Activity, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { motion } from '@/lib/motion';

export function MapPageClient() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'markers' | 'layers' | 'filters'>('layers');
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number; zoom: number } | null>(null);

  const layers = useMapStore(selectLayers);
  const { data: markers } = useMapMarkers();

  const activeLayers = layers.filter((l) => l.visible).length;
  const markerCount = (markers || []).length;

  // Listen for viewport changes from map store
  const viewport = useMapStore((s) => s.viewport);
  useEffect(() => {
    setCoords({ lat: viewport.center[1], lng: viewport.center[0], zoom: viewport.zoom });
  }, [viewport]);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-background">
      {/* ── Page Header ──────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-teal-600 via-emerald-600 to-green-700 dark:from-teal-900 dark:via-emerald-900 dark:to-green-900 shrink-0">
        <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-6 -left-6 w-48 h-48 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        <svg className="absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none" preserveAspectRatio="none">
          <defs>
            <pattern id="mgrid" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M 24 0 L 0 0 0 24" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#mgrid)" />
        </svg>

        <div className="relative z-10 px-4 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <motion.div
            className="flex items-center gap-3 flex-1"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <div className="h-10 w-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0">
              <Map className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">Carte Interactive</h1>
              <p className="text-white/60 text-xs">Visualisation géospatiale agricole — Afrique de l'Ouest</p>
            </div>
          </motion.div>

          {/* Quick stats */}
          <motion.div
            className="flex items-center gap-2 flex-wrap"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
          >
            <div className="flex items-center gap-1.5 bg-white/10 border border-white/15 rounded-lg px-3 py-1.5">
              <Layers className="h-3.5 w-3.5 text-white/70" />
              <span className="text-white text-xs font-semibold">{activeLayers}</span>
              <span className="text-white/50 text-xs">couches</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 border border-white/15 rounded-lg px-3 py-1.5">
              <MapPin className="h-3.5 w-3.5 text-white/70" />
              <span className="text-white text-xs font-semibold">{markerCount}</span>
              <span className="text-white/50 text-xs">marqueurs</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 border border-white/15 rounded-lg px-3 py-1.5">
              <Activity className="h-3.5 w-3.5 text-green-300" />
              <span className="text-green-300 text-xs font-semibold">En direct</span>
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex items-center gap-1.5 bg-white/10 border border-white/20 hover:bg-white/20 rounded-lg px-3 py-1.5 transition-colors"
              title={sidebarOpen ? 'Masquer panneau' : 'Afficher panneau'}
            >
              {sidebarOpen
                ? <PanelLeftClose className="h-3.5 w-3.5 text-white" />
                : <PanelLeftOpen className="h-3.5 w-3.5 text-white" />}
              <span className="text-white text-xs hidden sm:inline">Panneau</span>
            </button>
          </motion.div>
        </div>
      </div>

      {/* ── Map area ──────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <motion.div
          initial={false}
          animate={{ width: sidebarOpen ? 288 : 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="border-r border-border bg-card overflow-hidden shrink-0"
        >
          {sidebarOpen && (
            <MapSidebar
              activeTab={activeTab}
              onTabChange={setActiveTab}
              selectedMarker={selectedMarker}
              onMarkerSelect={setSelectedMarker}
            />
          )}
        </motion.div>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <MapToolbar
            sidebarOpen={sidebarOpen}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          />
          <div className="flex-1 overflow-hidden relative">
            <InteractiveMap className="h-full w-full" />
          </div>

          {/* Status bar */}
          {coords && (
            <div className="shrink-0 h-7 bg-card/90 border-t border-border px-3 flex items-center gap-4 text-xs text-muted-foreground font-mono backdrop-blur-sm">
              <span>Lat: {coords.lat.toFixed(5)}</span>
              <span>Lng: {coords.lng.toFixed(5)}</span>
              <span>Zoom: {coords.zoom.toFixed(1)}</span>
              <span className="ml-auto opacity-50">© OpenStreetMap contributors</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
