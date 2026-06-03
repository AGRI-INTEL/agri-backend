'use client';

import { useState } from 'react';
import { InteractiveMap } from './interactive-map';
import { MapSidebar } from './map-sidebar';
import { MapToolbar } from './map-toolbar';
import { cn } from '@/lib/utils';

export function MapPageClient() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'markers' | 'layers' | 'filters'>('layers');
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);

  return (
    <div className="h-[calc(100vh-64px)] flex bg-background">
      {/* Sidebar */}
      <div className={cn(
        'border-r border-border bg-card transition-all duration-300',
        sidebarOpen ? 'w-80' : 'w-0 overflow-hidden'
      )}>
        {sidebarOpen && (
          <MapSidebar 
            activeTab={activeTab}
            onTabChange={setActiveTab}
            selectedMarker={selectedMarker}
            onMarkerSelect={setSelectedMarker}
          />
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <MapToolbar 
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Map */}
        <div className="flex-1 overflow-hidden">
          <InteractiveMap className="h-full w-full" />
        </div>
      </div>
    </div>
  );
}
