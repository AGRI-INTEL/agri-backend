'use client';

import { useState, useMemo } from 'react';
import {
  CalendarDays, ChevronLeft, ChevronRight, RefreshCw,
  Sprout, Droplets, Scissors, Wheat, FlaskConical,
} from 'lucide-react';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { useCalendarData, EVENT_TYPE_LABELS, EVENT_TYPE_COLORS, EVENT_TYPE_BG } from '@/hooks/use-calendar';
import { useCountries, useCrops } from '@/hooks/use-reference';
import { cn } from '@/lib/utils';

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

const EVENT_ICONS: Record<string, React.ElementType> = {
  preparation_sol: Droplets,
  semis: Sprout,
  entretien: Scissors,
  recolte: Wheat,
  traitement: FlaskConical,
};

const EVENT_TYPE_ORDER = ['preparation_sol', 'semis', 'entretien', 'traitement', 'recolte'] as const;

function EventBadge({ type, count }: { type: string; count: number }) {
  const Icon = EVENT_ICONS[type];
  return (
    <div className={cn('flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium', EVENT_TYPE_BG[type] || 'bg-gray-100 text-gray-700')}>
      {Icon && <Icon className="h-3 w-3" />}
      <span>{EVENT_TYPE_LABELS[type]}</span>
      {count > 1 && <span className="font-mono ml-0.5">×{count}</span>}
    </div>
  );
}

function CalendarSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <Card key={i} className="border-border/40">
            <CardHeader className="p-3 pb-0">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent className="p-3 space-y-2">
              <Skeleton className="h-5 w-full rounded-full" />
              <Skeleton className="h-5 w-3/4 rounded-full" />
              <Skeleton className="h-5 w-1/2 rounded-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function MonthCard({
  month,
  events,
  allEventTypes,
}: {
  month: number;
  events: { type: string; count: number }[];
  allEventTypes: Set<string>;
}) {
  const monthEvents = events.filter((e) => e.count > 0);
  const hasEvents = monthEvents.length > 0;

  return (
    <Card className={cn('border-border/40 transition-all', hasEvents ? 'hover:border-border' : 'opacity-50')}>
      <CardHeader className="p-3 pb-1">
        <CardTitle className="text-sm font-semibold">{MONTHS[month]}</CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-1 space-y-1.5 min-h-[80px]">
        {hasEvents ? (
          monthEvents
            .filter((e) => allEventTypes.has(e.type))
            .sort((a, b) => EVENT_TYPE_ORDER.indexOf(a.type as typeof EVENT_TYPE_ORDER[number]) - EVENT_TYPE_ORDER.indexOf(b.type as typeof EVENT_TYPE_ORDER[number]))
            .map((e) => <EventBadge key={e.type} type={e.type} count={e.count} />)
        ) : (
          <p className="text-[11px] text-muted-foreground italic">Aucune activité</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function CalendarPage() {
  const currentYear = new Date().getFullYear();
  const [selectedCrop, setSelectedCrop] = useState('maize');
  const [selectedCountry, setSelectedCountry] = useState('SN');
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const { data: countries } = useCountries();
  const { data: crops } = useCrops(selectedCountry);
  const { data, isLoading, isError, refetch, isFetching } = useCalendarData(
    selectedCrop, selectedCountry, selectedYear,
  );

  const summary = data?.summary;
  const eventsByMonth = useMemo(() => {
    if (!data?.events) return [];
    const byMonth = new Map<number, Map<string, number>>();
    data.events.forEach((event) => {
      if (!byMonth.has(event.month)) byMonth.set(event.month, new Map());
      const monthMap = byMonth.get(event.month)!;
      monthMap.set(event.event_type, (monthMap.get(event.event_type) || 0) + 1);
    });
    return Array.from(byMonth.entries()).map(([month, types]) => ({
      month,
      events: Array.from(types.entries()).map(([type, count]) => ({ type, count })),
    }));
  }, [data]);

  const allEventTypes = useMemo(() => {
    const types = new Set<string>();
    eventsByMonth.forEach((m) => m.events.forEach((e) => types.add(e.type)));
    return types;
  }, [eventsByMonth]);

  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  return (
    <PageWrapper
      title={
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-700 shadow-sm">
            <CalendarDays className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold">Calendrier Agricole</span>
              {data && (
                <Badge variant="secondary" className="text-[10px] font-mono h-5 px-1.5">
                  {data.events.length} activités
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Cycle cultural — {selectedCrop} • {selectedCountry}
            </p>
          </div>
        </div>
      }
      actions={
        <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline text-xs">Actualiser</span>
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium">Culture</span>
            <Select value={selectedCrop} onValueChange={setSelectedCrop}>
              <SelectTrigger className="w-[160px] h-9">
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                {(Array.isArray(crops) ? crops : []).map((crop) => (
                  <SelectItem key={crop.id} value={crop.name.toLowerCase()}>
                    {crop.name}
                  </SelectItem>
                ))}
                <SelectItem value="maize">Maïs</SelectItem>
                <SelectItem value="rice">Riz</SelectItem>
                <SelectItem value="millet">Millet</SelectItem>
                <SelectItem value="sorghum">Sorgho</SelectItem>
                <SelectItem value="cassava">Manioc</SelectItem>
                <SelectItem value="groundnut">Arachide</SelectItem>
                <SelectItem value="cotton">Coton</SelectItem>
                <SelectItem value="coffee">Café</SelectItem>
                <SelectItem value="cocoa">Cacao</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium">Pays</span>
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger className="w-[160px] h-9">
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                {(Array.isArray(countries) ? countries : []).map((c) => (
                  <SelectItem key={c.code || c.id} value={c.code || c.id}>
                    {c.name}
                  </SelectItem>
                ))}
                <SelectItem value="SN">Sénégal</SelectItem>
                <SelectItem value="CI">Côte d'Ivoire</SelectItem>
                <SelectItem value="NG">Nigeria</SelectItem>
                <SelectItem value="GH">Ghana</SelectItem>
                <SelectItem value="CM">Cameroun</SelectItem>
                <SelectItem value="ML">Mali</SelectItem>
                <SelectItem value="BF">Burkina Faso</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium">Année</span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => setSelectedYear((y) => y - 1)}
                disabled={selectedYear <= currentYear - 2}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number(v))}>
                <SelectTrigger className="w-[100px] h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => setSelectedYear((y) => y + 1)}
                disabled={selectedYear >= currentYear + 2}
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground mr-1">Légende :</span>
          {EVENT_TYPE_ORDER.map((type) => (
            <div key={type} className="flex items-center gap-1">
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: EVENT_TYPE_COLORS[type] }}
              />
              <span className="text-[11px] text-muted-foreground">{EVENT_TYPE_LABELS[type]}</span>
            </div>
          ))}
        </div>

        {/* Summary bar */}
        {summary && !isLoading && (
          <div className="flex flex-wrap gap-2">
            {EVENT_TYPE_ORDER.map((type) => {
              const count = summary[type as keyof typeof summary] ?? 0;
              if (count === 0) return null;
              return (
                <Badge
                  key={type}
                  variant="outline"
                  className="gap-1.5 text-xs py-1 px-3 border-border/40"
                >
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: EVENT_TYPE_COLORS[type] }} />
                  {EVENT_TYPE_LABELS[type]} : {count}
                </Badge>
              );
            })}
          </div>
        )}

        {/* Calendar grid */}
        {isLoading ? (
          <CalendarSkeleton />
        ) : isError ? (
          <EmptyState
            icon="📅"
            title="Erreur de chargement"
            description="Impossible de charger le calendrier agricole."
            action={{ label: 'Réessayer', onClick: () => refetch() }}
          />
        ) : !data || data.events.length === 0 ? (
          <EmptyState
            icon="🌱"
            title="Aucune activité"
            description="Aucune activité culturale trouvée pour cette culture, pays et année."
            action={{ label: 'Changer les filtres', onClick: () => { setSelectedCrop('maize'); setSelectedCountry('SN'); } }}
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {MONTHS.map((_, monthIdx) => {
              const monthData = eventsByMonth.find((e) => e.month === monthIdx + 1);
              return (
                <MonthCard
                  key={monthIdx}
                  month={monthIdx}
                  events={monthData?.events ?? []}
                  allEventTypes={allEventTypes}
                />
              );
            })}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
