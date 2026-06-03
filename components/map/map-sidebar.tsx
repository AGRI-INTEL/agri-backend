'use client';

import { Layers, Map as MapIcon, Filter, Droplet, AlertCircle, Users, TrendingUp, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface MapSidebarProps {
  activeTab: 'markers' | 'layers' | 'filters';
  onTabChange: (tab: 'markers' | 'layers' | 'filters') => void;
  selectedMarker: string | null;
  onMarkerSelect: (id: string | null) => void;
}

export function MapSidebar({ activeTab, onTabChange, selectedMarker, onMarkerSelect }: MapSidebarProps) {
  const tabs = [
    { id: 'layers' as const, label: 'Couches', icon: Layers },
    { id: 'filters' as const, label: 'Filtres', icon: Filter },
    { id: 'markers' as const, label: 'Marqueurs', icon: MapPin },
  ];

  const layers = [
    { id: 'weather', label: 'Météo', enabled: true, color: '#3B82F6' },
    { id: 'predictions', label: 'Prédictions', enabled: true, color: '#8B5CF6' },
    { id: 'alerts', label: 'Alertes', enabled: true, color: '#EF4444' },
    { id: 'actors', label: 'Acteurs', enabled: true, color: '#10B981' },
    { id: 'markets', label: 'Marchés', enabled: false, color: '#F59E0B' },
  ];

  const markers = [
    { id: '1', name: 'Ferme Daouda', type: 'actor', lat: '14.7167', lng: '-14.5833', members: 12 },
    { id: '2', name: 'Alerte Sécheresse', type: 'alert', lat: '14.6500', lng: '-14.4000', severity: 'high' },
    { id: '3', name: 'Marché de Kaolack', type: 'market', lat: '13.9706', lng: '-16.0067', products: 8 },
    { id: '4', name: 'Station Météo', type: 'weather', lat: '14.8000', lng: '-14.2000', temp: '32°C' },
  ];

  const filters = [
    { id: 'radius', label: 'Rayon (km)', type: 'range', value: 50, max: 200 },
    { id: 'minMembers', label: 'Min. membres', type: 'number', value: 0 },
    { id: 'severity', label: 'Alertes', type: 'select', value: 'all' },
  ];

  if (activeTab === 'layers') {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-sm">Couches de la carte</h2>
          <p className="text-xs text-muted-foreground mt-1">Affichage/masquage des couches</p>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-3">
            {layers.map((layer) => (
              <div key={layer.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <div 
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: layer.color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{layer.label}</p>
                </div>
                <Switch defaultChecked={layer.enabled} />
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-border space-y-2">
          <Button variant="outline" className="w-full text-xs" size="sm">
            Réinitialiser
          </Button>
        </div>
      </div>
    );
  }

  if (activeTab === 'filters') {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-sm">Filtres avancés</h2>
          <p className="text-xs text-muted-foreground mt-1">Affiner votre recherche</p>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            {/* Type Filter */}
            <div>
              <label className="text-xs font-medium block mb-2">Type de marqueur</label>
              {['Acteurs', 'Alertes', 'Marchés', 'Météo'].map((type) => (
                <div key={type} className="flex items-center gap-2 py-1.5">
                  <Checkbox id={`type-${type}`} defaultChecked />
                  <label htmlFor={`type-${type}`} className="text-xs cursor-pointer">{type}</label>
                </div>
              ))}
            </div>

            {/* Radius */}
            <div>
              <label className="text-xs font-medium block mb-2">Rayon: <span className="font-bold">50 km</span></label>
              <input 
                type="range" 
                min="0" 
                max="200" 
                defaultValue="50"
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Min Members */}
            <div>
              <label className="text-xs font-medium block mb-2">Minimum de membres</label>
              <Input type="number" placeholder="0" defaultValue="0" className="text-xs h-8" />
            </div>

            {/* Severity */}
            <div>
              <label className="text-xs font-medium block mb-2">Niveau d'alerte</label>
              <select className="w-full px-2 py-1.5 text-xs border border-input rounded-md bg-background">
                <option>Tous les niveaux</option>
                <option>Critique</option>
                <option>Élevé</option>
                <option>Moyen</option>
                <option>Faible</option>
              </select>
            </div>
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-border space-y-2">
          <Button className="w-full text-xs" size="sm">
            Appliquer
          </Button>
          <Button variant="outline" className="w-full text-xs" size="sm">
            Réinitialiser
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold text-sm">Marqueurs</h2>
        <p className="text-xs text-muted-foreground mt-1">{markers.length} marqueurs trouvés</p>
      </div>

      <div className="px-4 pt-4 pb-3">
        <input 
          type="text"
          placeholder="Rechercher un marqueur..."
          className="w-full px-3 py-2 text-xs border border-input rounded-md bg-background"
        />
      </div>

      <ScrollArea className="flex-1">
        <div className="px-4 space-y-2">
          {markers.map((marker) => (
            <button
              key={marker.id}
              onClick={() => onMarkerSelect(selectedMarker === marker.id ? null : marker.id)}
              className={cn(
                'w-full text-left p-3 rounded-lg border transition-all',
                selectedMarker === marker.id
                  ? 'bg-primary/10 border-primary'
                  : 'bg-muted/50 border-border hover:border-primary/50'
              )}
            >
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{marker.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {marker.lat}, {marker.lng}
                  </p>
                  {marker.type === 'actor' && (
                    <Badge variant="outline" className="text-xs mt-1.5">
                      <Users className="h-3 w-3 mr-1" />
                      {marker.members} membres
                    </Badge>
                  )}
                  {marker.type === 'alert' && (
                    <Badge variant="destructive" className="text-xs mt-1.5">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {marker.severity}
                    </Badge>
                  )}
                  {marker.type === 'market' && (
                    <Badge variant="outline" className="text-xs mt-1.5">
                      {marker.products} produits
                    </Badge>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border">
        <Button variant="outline" className="w-full text-xs" size="sm">
          Exporter les marqueurs
        </Button>
      </div>
    </div>
  );
}
