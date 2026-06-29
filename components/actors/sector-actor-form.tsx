'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { Crosshair } from 'lucide-react';
import type { Map as MapLibreMap, Marker as MapLibreMarker } from 'maplibre-gl';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

import { useCreateActor, useUpdateActor } from '@/hooks/use-actors';

// ─── Public interface ────────────────────────────────────────────────────────

export interface SectorActorFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sector: string;
  color?: string;
  actorId?: string;
  initialData?: Record<string, unknown>;
}

// ─── Role options per sector ─────────────────────────────────────────────────

const ROLE_OPTIONS: Record<string, { value: string; label: string }[]> = {
  vegetal: [
    { value: 'producteur_individuel', label: 'Producteur individuel' },
    { value: 'exploitation_familiale', label: 'Exploitation familiale' },
    { value: 'cooperative_agricole', label: 'Coopérative agricole' },
    { value: 'transformateur_artisanal', label: 'Transformateur artisanal' },
    { value: 'collecteur', label: 'Collecteur' },
    { value: 'commercant', label: 'Commerçant' },
  ],
  animal: [
    { value: 'eleveur_bovins', label: 'Éleveur bovins' },
    { value: 'eleveur_ovins', label: 'Éleveur ovins' },
    { value: 'eleveur_caprins', label: 'Éleveur caprins' },
    { value: 'eleveur_volailles', label: 'Éleveur volailles' },
    { value: 'cooperative_eleveurs', label: 'Coopérative éleveurs' },
    { value: 'transformateur_laitier', label: 'Transformateur laitier' },
    { value: 'boucher', label: 'Boucher' },
    { value: 'technicien_veterinaire', label: 'Technicien vétérinaire' },
  ],
  halieutique: [
    { value: 'pecheur_artisanal', label: 'Pêcheur artisanal' },
    { value: 'pecheur_industriel', label: 'Pêcheur industriel' },
    { value: 'mareyeur', label: 'Mareyeur' },
    { value: 'transformateur_fumeur', label: 'Transformateur fumeur' },
    { value: 'transformateur_secheur', label: 'Transformateur sécheur' },
    { value: 'cooperative_aquacole', label: 'Coopérative aquacole' },
  ],
  forestier: [
    { value: 'exploitant_forestier', label: 'Exploitant forestier' },
    { value: 'collecteur_pfnl', label: 'Collecteur PFNL' },
    { value: 'charbonnier', label: 'Charbonnier' },
    { value: 'artisan_bois', label: 'Artisan bois' },
    { value: 'scieur', label: 'Scieur' },
    { value: 'cooperative_agroforesterie', label: 'Coopérative agroforesterie' },
  ],
};

// ─── Form value types ────────────────────────────────────────────────────────

interface CommonFields {
  first_name: string;
  last_name: string;
  role: string;
  country: string;
  region: string;
  city: string;
  phone: string;
  email: string;
  latitude: string;
  longitude: string;
  is_active: boolean;
}

interface VegetalFields {
  vegetal_superficie_ha: string;
  vegetal_cultures_principales: string;
  vegetal_acces_irrigation: boolean;
  vegetal_nombre_parcelles: string;
  vegetal_possede_tracteur: boolean;
}

interface AnimalFields {
  animal_nb_bovins: string;
  animal_nb_ovins: string;
  animal_nb_caprins: string;
  animal_nb_volailles: string;
  animal_nb_porcins: string;
  animal_type_elevage: string;
  animal_acces_veterinaire: boolean;
}

interface HalieutiqueFields {
  halieutique_nb_pirogues: string;
  halieutique_possede_moteur: boolean;
  halieutique_type_peche: string;
  halieutique_zone_principale: string;
}

interface ForestierFields {
  forestier_type_exploitation: string;
  forestier_produits_principaux: string;
  forestier_superficie_concession_ha: string;
  forestier_certifie_durable: boolean;
}

type FormValues = CommonFields & VegetalFields & AnimalFields & HalieutiqueFields & ForestierFields;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toOptionalNumber(val: string): number | undefined {
  const n = parseFloat(val);
  return isNaN(n) ? undefined : n;
}

function toOptionalInt(val: string): number | undefined {
  const n = parseInt(val, 10);
  return isNaN(n) ? undefined : n;
}

function commaSplitToArray(val: string | null | undefined): string[] {
  return (val || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function buildPayload(values: FormValues, sector: string): Record<string, unknown> {
  const common: Record<string, unknown> = {
    name: `${(values.first_name || '').trim()} ${(values.last_name || '').trim()}`.trim(),
    first_name: (values.first_name || '').trim(),
    last_name: (values.last_name || '').trim(),
    role: values.role,
    sector,
    country: values.country || 'SN',
    region: values.region,
    city: values.city,
    phone: values.phone || undefined,
    email: values.email || undefined,
    is_active: values.is_active,
    latitude: toOptionalNumber(values.latitude),
    longitude: toOptionalNumber(values.longitude),
  };

  if (sector === 'vegetal') {
    common.vegetal_data = {
      total_area_ha: toOptionalNumber(values.vegetal_superficie_ha),
      main_crops: commaSplitToArray(values.vegetal_cultures_principales || ''),
      irrigation_access: values.vegetal_acces_irrigation,
      plots_count: toOptionalInt(values.vegetal_nombre_parcelles),
      has_tractor: values.vegetal_possede_tracteur,
    };
  }

  if (sector === 'animal') {
    common.animal_data = {
      bovins_count: toOptionalInt(values.animal_nb_bovins),
      ovins_count: toOptionalInt(values.animal_nb_ovins),
      caprins_count: toOptionalInt(values.animal_nb_caprins),
      volailles_count: toOptionalInt(values.animal_nb_volailles),
      porcins_count: toOptionalInt(values.animal_nb_porcins),
      breeding_type: values.animal_type_elevage || undefined,
      veterinary_access: values.animal_acces_veterinaire,
      total_livestock:
        (toOptionalInt(values.animal_nb_bovins) ?? 0) +
        (toOptionalInt(values.animal_nb_ovins) ?? 0) +
        (toOptionalInt(values.animal_nb_caprins) ?? 0) +
        (toOptionalInt(values.animal_nb_volailles) ?? 0) +
        (toOptionalInt(values.animal_nb_porcins) ?? 0),
    };
  }

  if (sector === 'halieutique') {
    common.halieutique_data = {
      pirogues_count: toOptionalInt(values.halieutique_nb_pirogues),
      motor: values.halieutique_possede_moteur,
      fishing_type: values.halieutique_type_peche || undefined,
      main_fishing_zone: values.halieutique_zone_principale || undefined,
    };
  }

  if (sector === 'forestier') {
    common.forestier_data = {
      exploitation_type: values.forestier_type_exploitation || undefined,
      main_products: commaSplitToArray(values.forestier_produits_principaux || ''),
      concession_area_ha: toOptionalNumber(values.forestier_superficie_concession_ha),
      sustainable_certified: values.forestier_certifie_durable,
    };
  }

  return common;
}

function initialDataToFormValues(
  data: Record<string, unknown>,
  _sector: string
): Partial<FormValues> {
  const nameParts = ((data.name as string | undefined) || '').split(' ');
  const first_name = ((data.first_name as string | undefined) || nameParts[0] || '').trim();
  const last_name = ((data.last_name as string | undefined) || nameParts.slice(1).join(' ') || '').trim();

  const vegetal = (data.vegetal_data as Record<string, unknown>) ?? {};
  const animal = (data.animal_data as Record<string, unknown>) ?? {};
  const halieutique = (data.halieutique_data as Record<string, unknown>) ?? {};
  const forestier = (data.forestier_data as Record<string, unknown>) ?? {};

  return {
    first_name,
    last_name,
    role: (data.role as string) || '',
    country: (data.country as string) || 'Sénégal',
    region: (data.region as string) || '',
    city: (data.city as string) || '',
    phone: (data.phone as string) || '',
    email: (data.email as string) || '',
    latitude: data.latitude != null ? String(data.latitude) : '',
    longitude: data.longitude != null ? String(data.longitude) : '',
    is_active: data.is_active !== false,

    vegetal_superficie_ha:
      vegetal.total_area_ha != null ? String(vegetal.total_area_ha) : '',
    vegetal_cultures_principales: Array.isArray(vegetal.main_crops)
      ? (vegetal.main_crops as string[]).join(', ')
      : '',
    vegetal_acces_irrigation: Boolean(vegetal.irrigation_access),
    vegetal_nombre_parcelles:
      vegetal.plots_count != null ? String(vegetal.plots_count) : '',
    vegetal_possede_tracteur: Boolean(vegetal.has_tractor),

    animal_nb_bovins: animal.bovins_count != null ? String(animal.bovins_count) : '',
    animal_nb_ovins: animal.ovins_count != null ? String(animal.ovins_count) : '',
    animal_nb_caprins: animal.caprins_count != null ? String(animal.caprins_count) : '',
    animal_nb_volailles: animal.volailles_count != null ? String(animal.volailles_count) : '',
    animal_nb_porcins: animal.porcins_count != null ? String(animal.porcins_count) : '',
    animal_type_elevage: (animal.breeding_type as string) || '',
    animal_acces_veterinaire: Boolean(animal.veterinary_access),

    halieutique_nb_pirogues:
      halieutique.pirogues_count != null ? String(halieutique.pirogues_count) : '',
    halieutique_possede_moteur: Boolean(halieutique.motor),
    halieutique_type_peche: (halieutique.fishing_type as string) || '',
    halieutique_zone_principale: (halieutique.main_fishing_zone as string) || '',

    forestier_type_exploitation: (forestier.exploitation_type as string) || '',
    forestier_produits_principaux: Array.isArray(forestier.main_products)
      ? (forestier.main_products as string[]).join(', ')
      : '',
    forestier_superficie_concession_ha:
      forestier.concession_area_ha != null ? String(forestier.concession_area_ha) : '',
    forestier_certifie_durable: Boolean(forestier.sustainable_certified),
  };
}

// ─── Small layout helpers ────────────────────────────────────────────────────

function FieldRow({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3">{children}</div>;
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </label>
      {children}
    </div>
  );
}

function SwitchField({
  label,
  checked,
  onChange,
  description,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  description?: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 px-3 py-2.5">
      <div className="space-y-0.5">
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

// ─── Sector label helper ─────────────────────────────────────────────────────

const SECTOR_LABELS: Record<string, string> = {
  vegetal: 'Végétal',
  animal: 'Animal',
  halieutique: 'Halieutique',
  forestier: 'Forestier',
};

// ─── Location picker map ─────────────────────────────────────────────────────

async function reverseGeocode(lat: number, lon: number): Promise<{ city: string; region: string }> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=fr`,
      { headers: { 'User-Agent': 'AgriIntel360/1.0' } },
    );
    if (!res.ok) return { city: '', region: '' };
    const data = await res.json();
    const addr = data.address || {};
    return {
      city: addr.city || addr.town || addr.village || addr.municipality || '',
      region: addr.state || addr.region || '',
    };
  } catch {
    return { city: '', region: '' };
  }
}

interface LocationPickerMapProps {
  lat: number | null;
  lon: number | null;
  onPick: (lat: number, lon: number) => void;
  onLocationResolved?: (city: string, region: string) => void;
  color?: string;
}

function LocationPickerMap({ lat, lon, onPick, onLocationResolved, color = '#16A34A' }: LocationPickerMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<MapLibreMap | null>(null);
  const markerRef = useRef<MapLibreMarker | null>(null);
  const onPickRef = useRef(onPick);
  const onLocationResolvedRef = useRef(onLocationResolved);
  const initialCenterRef = useRef<[number, number]>([lon ?? -14, lat ?? 14]);
  const [geoLoading, setGeoLoading] = useState(false);

  onPickRef.current = onPick;
  onLocationResolvedRef.current = onLocationResolved;

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;
    let cancelled = false;
    import('maplibre-gl').then((maplibregl) => {
      if (cancelled || !mapContainerRef.current) return;
      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: 'https://tiles.openfreemap.org/styles/liberty',
        center: initialCenterRef.current,
        zoom: 5,
      });
      map.on('load', () => { if (!cancelled) map.resize(); });
      map.on('click', (e: { lngLat: { lat: number; lng: number } }) => {
        const { lat: clat, lng: clon } = e.lngLat;
        const newLat = parseFloat(clat.toFixed(6));
        const newLon = parseFloat(clon.toFixed(6));
        onPickRef.current(newLat, newLon);
        if (onLocationResolvedRef.current) {
          reverseGeocode(newLat, newLon).then(({ city, region }) => {
            if (city || region) onLocationResolvedRef.current!(city, region);
          });
        }
      });
      map.getContainer().style.cursor = 'crosshair';
      mapInstanceRef.current = map;
    });
    return () => { cancelled = true; mapInstanceRef.current?.remove(); mapInstanceRef.current = null; };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (lat != null && lon != null && !isNaN(lat) && !isNaN(lon)) {
      mapInstanceRef.current.flyTo({ center: [lon, lat], zoom: 7 });
      import('maplibre-gl').then((maplibregl) => {
        if (markerRef.current) markerRef.current.remove();
        const el = document.createElement('div');
        el.innerHTML = `<div style="width:24px;height:24px;background:${color};border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`;
        markerRef.current = new maplibregl.Marker({ element: el })
          .setLngLat([lon, lat])
          .addTo(mapInstanceRef.current!);
      });
    } else {
      if (markerRef.current) { markerRef.current.remove(); markerRef.current = null; }
    }
  }, [lat, lon, color]);

  useEffect(() => {
    return () => { markerRef.current?.remove(); };
  }, []);

  function useGeoLocation() {
    if (!navigator.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newLat = parseFloat(pos.coords.latitude.toFixed(6));
        const newLon = parseFloat(pos.coords.longitude.toFixed(6));
        onPick(newLat, newLon);
        if (onLocationResolved) {
          reverseGeocode(newLat, newLon).then(({ city, region }) => {
            if (city || region) onLocationResolved(city, region);
          });
        }
        setGeoLoading(false);
      },
      () => setGeoLoading(false),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  return (
    <div className="space-y-2">
      <div ref={mapContainerRef} className="w-full h-[300px] rounded-lg border border-border/50" />
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-1.5 text-xs"
        onClick={useGeoLocation}
        disabled={geoLoading}
      >
        <Crosshair className="h-3.5 w-3.5" />
        {geoLoading ? 'Localisation…' : 'Récupérer ma position GPS'}
      </Button>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export function SectorActorForm({
  open,
  onOpenChange,
  sector,
  color = '#16A34A',
  actorId,
  initialData,
}: SectorActorFormProps) {
  const isEditMode = Boolean(actorId);
  const createActor = useCreateActor();
  const updateActor = useUpdateActor();
  const qc = useQueryClient();

  const isPending = createActor.isPending || updateActor.isPending;
  const roleOptions = ROLE_OPTIONS[sector] ?? ROLE_OPTIONS.vegetal;
  const sectorLabel = SECTOR_LABELS[sector] ?? sector;

  const defaultFormValues: FormValues = {
    first_name: '',
    last_name: '',
    role: roleOptions[0]?.value ?? '',
    country: 'Sénégal',
    region: '',
    city: '',
    phone: '',
    email: '',
    latitude: '',
    longitude: '',
    is_active: true,
    vegetal_superficie_ha: '',
    vegetal_cultures_principales: '',
    vegetal_acces_irrigation: false,
    vegetal_nombre_parcelles: '',
    vegetal_possede_tracteur: false,
    animal_nb_bovins: '',
    animal_nb_ovins: '',
    animal_nb_caprins: '',
    animal_nb_volailles: '',
    animal_nb_porcins: '',
    animal_type_elevage: '',
    animal_acces_veterinaire: false,
    halieutique_nb_pirogues: '',
    halieutique_possede_moteur: false,
    halieutique_type_peche: '',
    halieutique_zone_principale: '',
    forestier_type_exploitation: '',
    forestier_produits_principaux: '',
    forestier_superficie_concession_ha: '',
    forestier_certifie_durable: false,
  };

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: defaultFormValues,
  });

  const latVal = watch('latitude');
  const lonVal = watch('longitude');

  useEffect(() => {
    if (open) {
      if (isEditMode && initialData) {
        const mapped = initialDataToFormValues(initialData, sector);
        reset({ ...defaultFormValues, ...mapped });
      } else {
        reset({ ...defaultFormValues, role: roleOptions[0]?.value ?? '' });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isEditMode, initialData, sector]);

  const onSubmit = (values: FormValues) => {
    const payload = buildPayload(values, sector);

    if (isEditMode && actorId) {
      updateActor.mutate(
        { id: actorId, data: payload },
        {
          onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['actors'] });
            onOpenChange(false);
          },
        }
      );
    } else {
      createActor.mutate(payload, {
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: ['actors'] });
          onOpenChange(false);
        },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <DialogTitle className="text-lg font-semibold">
              {isEditMode ? 'Modifier un acteur' : 'Ajouter un acteur'}
            </DialogTitle>
            <Badge variant="secondary" className="text-xs capitalize">
              {sectorLabel}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {isEditMode
              ? 'Modifiez les informations de cet acteur du secteur ' + sectorLabel.toLowerCase() + '.'
              : 'Renseignez les informations du nouvel acteur dans le secteur ' + sectorLabel.toLowerCase() + '.'}
          </p>
        </DialogHeader>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          <form id="sector-actor-form" onSubmit={handleSubmit(onSubmit)}>
            <Tabs defaultValue="general" className="w-full">
              {/* Tab navigation */}
              <div className="sticky top-0 z-10 bg-background border-b border-border/50 px-6 py-3">
                <TabsList className="w-full">
                  <TabsTrigger value="general" className="flex-1">
                    Informations générales
                  </TabsTrigger>
                  <TabsTrigger value="sector" className="flex-1">
                    Données sectorielles
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* ── TAB 1: General ─────────────────────────────────────── */}
              <TabsContent value="general" className="px-6 py-5 space-y-4 mt-0">
                {/* Identity */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Identité
                  </p>
                  <FieldRow>
                    <FieldGroup label="Prénom *">
                      <Input
                        placeholder="Prénom"
                        {...register('first_name', { required: 'Le prénom est requis' })}
                        className={errors.first_name ? 'border-destructive' : ''}
                      />
                      {errors.first_name && (
                        <p className="text-xs text-destructive">{errors.first_name.message}</p>
                      )}
                    </FieldGroup>
                    <FieldGroup label="Nom *">
                      <Input
                        placeholder="Nom de famille"
                        {...register('last_name', { required: 'Le nom est requis' })}
                        className={errors.last_name ? 'border-destructive' : ''}
                      />
                      {errors.last_name && (
                        <p className="text-xs text-destructive">{errors.last_name.message}</p>
                      )}
                    </FieldGroup>
                  </FieldRow>
                </div>

                {/* Role */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Rôle
                  </p>
                  <FieldGroup label="Rôle *">
                    <Controller
                      control={control}
                      name="role"
                      rules={{ required: 'Le rôle est requis' }}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className={errors.role ? 'border-destructive' : ''}>
                            <SelectValue placeholder="Sélectionnez un rôle" />
                          </SelectTrigger>
                          <SelectContent>
                            {roleOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.role && (
                      <p className="text-xs text-destructive">{errors.role.message}</p>
                    )}
                  </FieldGroup>
                </div>

                {/* Location */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Localisation
                  </p>
                  <div className="space-y-3">
                    <FieldRow>
                      <FieldGroup label="Pays">
                        <Input
                          placeholder="Sénégal"
                          {...register('country')}
                        />
                      </FieldGroup>
                      <FieldGroup label="Région">
                        <Input
                          placeholder="Ex: Thiès"
                          {...register('region')}
                        />
                      </FieldGroup>
                    </FieldRow>
                    <FieldGroup label="Commune / Ville">
                      <Input
                        placeholder="Ex: Mbour"
                        {...register('city')}
                      />
                    </FieldGroup>

                    {/* Interactive location picker map — remplace les champs Latitude/Longitude */}
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">
                        Cliquez sur la carte pour définir la position géographique de l&apos;acteur.
                      </p>
                      <LocationPickerMap
                        lat={latVal ? parseFloat(latVal) : null}
                        lon={lonVal ? parseFloat(lonVal) : null}
                        onPick={(newLat, newLon) => {
                          setValue('latitude', String(newLat));
                          setValue('longitude', String(newLon));
                        }}
                        onLocationResolved={(city, region) => {
                          if (city) setValue('city', city);
                          if (region) setValue('region', region);
                        }}
                        color={color}
                      />
                      {latVal && lonVal && (
                        <p className="text-xs text-muted-foreground mt-1.5">
                          Position sélectionnée : {latVal}, {lonVal}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contact */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Contact
                  </p>
                  <div className="space-y-3">
                    <FieldRow>
                      <FieldGroup label="Téléphone">
                        <Input
                          type="tel"
                          placeholder="+221 77 000 00 00"
                          {...register('phone')}
                        />
                      </FieldGroup>
                      <FieldGroup label="Email">
                        <Input
                          type="email"
                          placeholder="acteur@example.com"
                          {...register('email', {
                            pattern: {
                              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                              message: 'Adresse email invalide',
                            },
                          })}
                          className={errors.email ? 'border-destructive' : ''}
                        />
                        {errors.email && (
                          <p className="text-xs text-destructive">{errors.email.message}</p>
                        )}
                      </FieldGroup>
                    </FieldRow>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Statut
                  </p>
                  <Controller
                    control={control}
                    name="is_active"
                    render={({ field }) => (
                      <SwitchField
                        label="Acteur actif"
                        description="L'acteur est visible et apparaît dans les résultats de recherche."
                        checked={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </div>
              </TabsContent>

              {/* ── TAB 2: Sector data ──────────────────────────────────── */}
              <TabsContent value="sector" className="px-6 py-5 space-y-4 mt-0">
                {/* ── VEGETAL ── */}
                {sector === 'vegetal' && (
                  <div className="space-y-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Données végétales
                    </p>

                    <FieldRow>
                      <FieldGroup label="Superficie totale (ha)">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="Ex: 5.5"
                          {...register('vegetal_superficie_ha')}
                        />
                      </FieldGroup>
                      <FieldGroup label="Nombre de parcelles">
                        <Input
                          type="number"
                          min="0"
                          placeholder="Ex: 3"
                          {...register('vegetal_nombre_parcelles')}
                        />
                      </FieldGroup>
                    </FieldRow>

                    <FieldGroup label="Cultures principales (séparées par des virgules)">
                      <Input
                        placeholder="Ex: mil, arachide, maïs"
                        {...register('vegetal_cultures_principales')}
                      />
                      <p className="text-xs text-muted-foreground">
                        Entrez les cultures séparées par des virgules.
                      </p>
                    </FieldGroup>

                    <div className="space-y-2">
                      <Controller
                        control={control}
                        name="vegetal_acces_irrigation"
                        render={({ field }) => (
                          <SwitchField
                            label="Accès à l'irrigation"
                            description="L'acteur dispose d'un système d'irrigation."
                            checked={field.value}
                            onChange={field.onChange}
                          />
                        )}
                      />
                      <Controller
                        control={control}
                        name="vegetal_possede_tracteur"
                        render={({ field }) => (
                          <SwitchField
                            label="Possède un tracteur"
                            description="L'acteur dispose d'un tracteur ou d'équipement motorisé."
                            checked={field.value}
                            onChange={field.onChange}
                          />
                        )}
                      />
                    </div>
                  </div>
                )}

                {/* ── ANIMAL ── */}
                {sector === 'animal' && (
                  <div className="space-y-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Données d'élevage
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                      <FieldGroup label="Nombre de bovins">
                        <Input
                          type="number"
                          min="0"
                          placeholder="0"
                          {...register('animal_nb_bovins')}
                        />
                      </FieldGroup>
                      <FieldGroup label="Nombre d'ovins">
                        <Input
                          type="number"
                          min="0"
                          placeholder="0"
                          {...register('animal_nb_ovins')}
                        />
                      </FieldGroup>
                      <FieldGroup label="Nombre de caprins">
                        <Input
                          type="number"
                          min="0"
                          placeholder="0"
                          {...register('animal_nb_caprins')}
                        />
                      </FieldGroup>
                      <FieldGroup label="Nombre de volailles">
                        <Input
                          type="number"
                          min="0"
                          placeholder="0"
                          {...register('animal_nb_volailles')}
                        />
                      </FieldGroup>
                      <FieldGroup label="Nombre de porcins">
                        <Input
                          type="number"
                          min="0"
                          placeholder="0"
                          {...register('animal_nb_porcins')}
                        />
                      </FieldGroup>
                    </div>

                    <FieldGroup label="Type d'élevage">
                      <Controller
                        control={control}
                        name="animal_type_elevage"
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez un type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="extensif">Extensif</SelectItem>
                              <SelectItem value="intensif">Intensif</SelectItem>
                              <SelectItem value="semi-intensif">Semi-intensif</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </FieldGroup>

                    <Controller
                      control={control}
                      name="animal_acces_veterinaire"
                      render={({ field }) => (
                        <SwitchField
                          label="Accès vétérinaire"
                          description="L'acteur bénéficie d'un suivi vétérinaire régulier."
                          checked={field.value}
                          onChange={field.onChange}
                        />
                      )}
                    />
                  </div>
                )}

                {/* ── HALIEUTIQUE ── */}
                {sector === 'halieutique' && (
                  <div className="space-y-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Données halieutiques
                    </p>

                    <FieldRow>
                      <FieldGroup label="Nombre de pirogues">
                        <Input
                          type="number"
                          min="0"
                          placeholder="Ex: 2"
                          {...register('halieutique_nb_pirogues')}
                        />
                      </FieldGroup>
                      <FieldGroup label="Zone de pêche principale">
                        <Input
                          placeholder="Ex: Dakar-Sud"
                          {...register('halieutique_zone_principale')}
                        />
                      </FieldGroup>
                    </FieldRow>

                    <FieldGroup label="Type de pêche">
                      <Controller
                        control={control}
                        name="halieutique_type_peche"
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez un type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="artisanale">Artisanale</SelectItem>
                              <SelectItem value="industrielle">Industrielle</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </FieldGroup>

                    <Controller
                      control={control}
                      name="halieutique_possede_moteur"
                      render={({ field }) => (
                        <SwitchField
                          label="Possède un moteur"
                          description="La pirogue est équipée d'un moteur hors-bord."
                          checked={field.value}
                          onChange={field.onChange}
                        />
                      )}
                    />
                  </div>
                )}

                {/* ── FORESTIER ── */}
                {sector === 'forestier' && (
                  <div className="space-y-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Données forestières
                    </p>

                    <FieldRow>
                      <FieldGroup label="Type d'exploitation">
                        <Controller
                          control={control}
                          name="forestier_type_exploitation"
                          render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionnez un type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="PFNL">PFNL</SelectItem>
                                <SelectItem value="bois">Bois</SelectItem>
                                <SelectItem value="mixte">Mixte</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </FieldGroup>
                      <FieldGroup label="Superficie concession (ha)">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="Ex: 10"
                          {...register('forestier_superficie_concession_ha')}
                        />
                      </FieldGroup>
                    </FieldRow>

                    <FieldGroup label="Produits principaux (séparés par des virgules)">
                      <Input
                        placeholder="Ex: karité, néré, gomme arabique"
                        {...register('forestier_produits_principaux')}
                      />
                      <p className="text-xs text-muted-foreground">
                        Entrez les produits séparés par des virgules.
                      </p>
                    </FieldGroup>

                    <Controller
                      control={control}
                      name="forestier_certifie_durable"
                      render={({ field }) => (
                        <SwitchField
                          label="Certifié durable"
                          description="L'acteur bénéficie d'une certification de gestion durable."
                          checked={field.value}
                          onChange={field.onChange}
                        />
                      )}
                    />
                  </div>
                )}

                {!['vegetal', 'animal', 'halieutique', 'forestier'].includes(sector) && (
                  <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
                    Aucune donnée sectorielle disponible pour ce secteur.
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </form>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t border-border/50 bg-muted/20">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            form="sector-actor-form"
            loading={isPending}
            disabled={isPending}
          >
            {isEditMode ? 'Enregistrer les modifications' : 'Créer l\'acteur'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
