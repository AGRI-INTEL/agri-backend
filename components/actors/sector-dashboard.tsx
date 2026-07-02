'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import {
  Plus,
  Pencil,
  Trash2,
  LayoutGrid,
  LayoutList,
  Table,
  ChevronLeft,
  ChevronRight,
  Download,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { ActorCard, ActorRow } from '@/components/actors/actor-card';
import { ActorFiltersBar } from '@/components/actors/actor-filters';
import { SectorActorForm } from '@/components/actors/sector-actor-form';
import { SectorStatsGrid } from '@/components/actors/sector-stats-grid';
import { SectorCharts } from '@/components/actors/sector-charts';
import { SectorTasks } from '@/components/actors/sector-tasks';
import { SectorMapView } from '@/components/actors/sector-map-view';
import { useActors, useDeleteActor } from '@/hooks/use-actors';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { formatNumber, getSectorEmoji } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SectorDashboardProps {
  sector: 'vegetal' | 'animal' | 'halieutique' | 'forestier';
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  backgroundImage?: string;
}

type ViewMode = 'grid' | 'list' | 'table';

const PAGE_SIZE = 20;

// ---------------------------------------------------------------------------
// Status badge helper (inline — no extra import needed)
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    active:   { cls: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800/30',  label: 'Actif'        },
    inactive: { cls: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800/30 dark:text-gray-400 dark:border-gray-700/30',        label: 'Inactif'      },
    pending:  { cls: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/30',   label: 'En attente'   },
    verified: { cls: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800/30',        label: 'Vérifié'      },
  };
  const { cls, label } = map[status] ?? map.inactive;
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${cls}`}>
      {label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Actor row metric helper
// ---------------------------------------------------------------------------

function actorMetric(row: ActorRow): string | null {
  if (row.vegetal_data)    return `${formatNumber(row.vegetal_data.total_area_ha)} ha`;
  if (row.animal_data)     return `${formatNumber(row.animal_data.total_livestock)} têtes`;
  if (row.halieutique_data) return `${row.halieutique_data.pirogues_count} pirogues`;
  if (row.forestier_data)  return `${formatNumber(row.forestier_data.forest_area_ha)} ha`;
  return null;
}

// ---------------------------------------------------------------------------
// List-mode actor row
// ---------------------------------------------------------------------------

function ActorListRow({
  actor,
  onEdit,
  onDelete,
  color,
}: {
  actor: ActorRow;
  onEdit: (a: ActorRow) => void;
  onDelete: (a: ActorRow) => void;
  color: string;
}) {
  const metric = actorMetric(actor);
  const emoji  = getSectorEmoji(actor.sector as Parameters<typeof getSectorEmoji>[0]);

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/40 bg-card px-4 py-3 hover:border-border/80 hover:shadow-sm transition-all duration-150">
      {/* Avatar */}
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
        style={{ backgroundColor: color }}
      >
        {(actor.name || '?').split(' ').map((n) => n[0] || '').join('').toUpperCase().slice(0, 2) || '?'}
      </div>

      {/* Name + role */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{actor.name}</p>
        <p className="truncate text-[11px] text-muted-foreground capitalize">{actor.role?.replace(/_/g, ' ')}</p>
      </div>

      {/* Location */}
      <div className="hidden sm:block min-w-0 w-36">
        <p className="truncate text-xs text-muted-foreground">{actor.city}, {actor.country_name}</p>
      </div>

      {/* Metric */}
      {metric && (
        <div className="hidden md:block w-28 text-right">
          <span className="text-xs font-mono font-semibold">{metric}</span>
        </div>
      )}

      {/* Status */}
      <div className="hidden sm:block">
        <StatusBadge status={actor.status} />
      </div>

      {/* Sector emoji */}
      <span className="text-base" title={actor.sector}>{emoji}</span>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => onEdit(actor)}
          title="Modifier"
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => onDelete(actor)}
          title="Supprimer"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Table-mode actor table
// ---------------------------------------------------------------------------

function ActorTable({
  actors,
  onEdit,
  onDelete,
}: {
  actors: ActorRow[];
  onEdit: (a: ActorRow) => void;
  onDelete: (a: ActorRow) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border/40">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/60 bg-muted/40">
            <th className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider text-muted-foreground">Nom</th>
            <th className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider text-muted-foreground hidden sm:table-cell">Rôle</th>
            <th className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider text-muted-foreground hidden md:table-cell">Région</th>
            <th className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider text-muted-foreground hidden lg:table-cell">Téléphone</th>
            <th className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider text-muted-foreground">Statut</th>
            <th className="px-4 py-3 text-right font-semibold text-xs uppercase tracking-wider text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/30">
          {actors.map((actor) => (
            <tr key={actor.id} className="bg-card hover:bg-muted/30 transition-colors duration-100">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">
                    {(actor.name || '?').split(' ').map((n) => n[0] || '').join('').toUpperCase().slice(0, 2) || '?'}
                  </div>
                  <div>
                    <p className="font-medium">{actor.name}</p>
                    {actor.organisation && (
                      <p className="text-[11px] text-muted-foreground truncate max-w-40">{actor.organisation}</p>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 hidden sm:table-cell">
                <span className="capitalize text-xs text-muted-foreground">{actor.role?.replace(/_/g, ' ')}</span>
              </td>
              <td className="px-4 py-3 hidden md:table-cell">
                <span className="text-xs text-muted-foreground">{actor.city}, {actor.country_name}</span>
              </td>
              <td className="px-4 py-3 hidden lg:table-cell">
                <span className="font-mono text-xs">{actor.phone ?? '—'}</span>
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={actor.status} />
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onEdit(actor)}
                    title="Modifier"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => onDelete(actor)}
                    title="Supprimer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Card grid with edit/delete overlays
// ---------------------------------------------------------------------------

function ActorCardWithActions({
  actor,
  onEdit,
  onDelete,
}: {
  actor: ActorRow;
  onEdit: (a: ActorRow) => void;
  onDelete: (a: ActorRow) => void;
}) {
  return (
    <div className="relative group">
      <ActorCard row={actor} />
      {/* Action overlay on hover */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-10">
        <Button
          variant="secondary"
          size="icon"
          className="h-7 w-7 shadow-sm"
          onClick={() => onEdit(actor)}
          title="Modifier"
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="destructive"
          size="icon"
          className="h-7 w-7 shadow-sm"
          onClick={() => onDelete(actor)}
          title="Supprimer"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pagination controls
// ---------------------------------------------------------------------------

function PaginationBar({
  page,
  totalPages,
  total,
  perPage,
  onPrev,
  onNext,
}: {
  page: number;
  totalPages: number;
  total: number;
  perPage: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  const start = (page - 1) * perPage + 1;
  const end   = Math.min(page * perPage, total);

  if (total === 0) return null;

  return (
    <div className="flex items-center justify-between pt-4">
      <p className="text-xs text-muted-foreground">
        {start}–{end} sur {formatNumber(total)} acteurs
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrev}
          disabled={page <= 1}
          className="h-8 gap-1"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Précédent
        </Button>
        <span className="text-xs text-muted-foreground px-1">
          Page {page}/{totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={page >= totalPages}
          className="h-8 gap-1"
        >
          Suivant
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// View mode toggle
// ---------------------------------------------------------------------------

function ViewToggle({ mode, onChange }: { mode: ViewMode; onChange: (m: ViewMode) => void }) {
  const options: { value: ViewMode; icon: React.ElementType; label: string }[] = [
    { value: 'grid',  icon: LayoutGrid, label: 'Grille'  },
    { value: 'list',  icon: LayoutList, label: 'Liste'   },
    { value: 'table', icon: Table,      label: 'Tableau' },
  ];

  return (
    <div className="flex items-center rounded-lg border border-border/60 p-0.5 bg-muted/30">
      {options.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          title={label}
          className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors duration-150 ${
            mode === value
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Icon className="h-3.5 w-3.5" />
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function SectorDashboard({
  sector,
  title,
  description,
  icon: _SectorIcon,
  color,
  backgroundImage,
}: SectorDashboardProps) {
  // --- Form state ---
  const [formOpen,   setFormOpen]   = useState(false);
  const [editActor,  setEditActor]  = useState<ActorRow | null>(null);

  // --- Filter state ---
  const [search,  setSearch]  = useState('');
  const [role,    setRole]    = useState('all');
  const [country, setCountry] = useState('all');
  const [status,  setStatus]  = useState('all');
  const [page,    setPage]    = useState(1);

  // --- View mode ---
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // --- Data ---
  const filters = useMemo(
    () => ({ sector, search, role, country, status, page, per_page: PAGE_SIZE }),
    [sector, search, role, country, status, page],
  );

  const { data, isLoading, isError } = useActors(filters);
  const deleteActor = useDeleteActor();

  const actors: ActorRow[] = useMemo(
    () => (data?.data ?? []) as unknown as ActorRow[],
    [data],
  );
  const total      = data?.total      ?? 0;
  const totalPages = data?.total_pages ?? 1;

  // --- Handlers ---
  function handleOpenCreate() {
    setEditActor(null);
    setFormOpen(true);
  }

  function handleOpenEdit(actor: ActorRow) {
    setEditActor(actor);
    setFormOpen(true);
  }

  function handleDelete(actor: ActorRow) {
    const confirmed = window.confirm(
      `Supprimer "${actor.name}" ? Cette action est irréversible.`,
    );
    if (confirmed) {
      deleteActor.mutate(actor.id);
    }
  }

  function handleResetFilters() {
    setSearch('');
    setRole('all');
    setCountry('all');
    setStatus('all');
    setPage(1);
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleRoleChange(value: string) {
    setRole(value);
    setPage(1);
  }

  function handleCountryChange(value: string) {
    setCountry(value);
    setPage(1);
  }

  function handleStatusChange(value: string) {
    setStatus(value);
    setPage(1);
  }

  // --- Render helpers ---
  function renderActeursContent() {
    if (isLoading) {
      return (
        <LoadingSkeleton
          variant={viewMode === 'table' ? 'table' : 'card'}
          count={6}
          className={
            viewMode === 'grid'
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : undefined
          }
        />
      );
    }

    if (isError) {
      return (
        <EmptyState
          icon="⚠️"
          title="Erreur de chargement"
          description="Impossible de charger les acteurs. Veuillez réessayer."
          action={{ label: 'Réessayer', onClick: () => setPage(1) }}
        />
      );
    }

    if (actors.length === 0) {
      return (
        <EmptyState
          icon={getSectorEmoji(sector as Parameters<typeof getSectorEmoji>[0])}
          title="Aucun acteur trouvé"
          description={
            search || role !== 'all' || country !== 'all' || status !== 'all'
              ? 'Aucun acteur ne correspond à vos filtres. Essayez de les modifier.'
              : `Aucun acteur enregistré pour le secteur ${title}. Commencez par en ajouter un.`
          }
          action={
            search || role !== 'all' || country !== 'all' || status !== 'all'
              ? { label: 'Réinitialiser les filtres', onClick: handleResetFilters }
              : { label: 'Ajouter un acteur',        onClick: handleOpenCreate  }
          }
        />
      );
    }

    return (
      <>
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {actors.map((actor) => (
              <ActorCardWithActions
                key={actor.id}
                actor={actor}
                onEdit={handleOpenEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {viewMode === 'list' && (
          <div className="flex flex-col gap-2">
            {actors.map((actor) => (
              <ActorListRow
                key={actor.id}
                actor={actor}
                color={color}
                onEdit={handleOpenEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {viewMode === 'table' && (
          <ActorTable
            actors={actors}
            onEdit={handleOpenEdit}
            onDelete={handleDelete}
          />
        )}

        <PaginationBar
          page={page}
          totalPages={totalPages}
          total={total}
          perPage={PAGE_SIZE}
          onPrev={() => setPage((p) => Math.max(1, p - 1))}
          onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
        />
      </>
    );
  }

  // ---------------------------------------------------------------------------
  // JSX
  // ---------------------------------------------------------------------------

  const actionsEl = (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className="h-9 gap-1.5 hidden sm:flex"
        title="Exporter"
      >
        <Download className="h-3.5 w-3.5" />
        Exporter
      </Button>
      <Button
        size="sm"
        className="h-9 gap-1.5"
        onClick={handleOpenCreate}
        style={{ backgroundColor: color, borderColor: color }}
      >
        <Plus className="h-4 w-4" />
        Ajouter
      </Button>
    </div>
  );

  return (
    <>
      <PageWrapper
        title={backgroundImage ? undefined : title}
        description={backgroundImage ? undefined : description}
        actions={backgroundImage ? undefined : actionsEl}
      >
        {/* Hero banner when sector image is available */}
        {backgroundImage && (
          <div className="relative overflow-hidden rounded-xl mb-8" style={{ minHeight: '200px' }}>
            <div className="absolute inset-0 z-0">
              <Image
                src={backgroundImage}
                alt=""
                fill
                priority
                className="object-cover"
                style={{ opacity: 0.4, objectPosition: 'center 30%' }}
                sizes="100vw"
              />
            </div>
            <div
              className="absolute inset-0 z-[1] pointer-events-none bg-gradient-to-b from-background/90 via-transparent via-40% to-background/80"
              aria-hidden
            />
            <div className="relative z-[2] p-6 sm:p-8">
              <Breadcrumb className="mb-3 [&>*]:text-white/70 [&>*]:hover:text-white" />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white">{title}</h1>
                  <p className="text-sm text-white/80 mt-1 max-w-xl">{description}</p>
                </div>
                {actionsEl}
              </div>
            </div>
          </div>
        )}

        {/* Stats strip — always visible */}
        <div className="mb-6">
          <SectorStatsGrid sector={sector} actors={actors} color={color} backgroundImage={backgroundImage} />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="acteurs" className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <TabsList className="h-9">
              <TabsTrigger value="acteurs"      className="text-xs sm:text-sm">Acteurs</TabsTrigger>
              <TabsTrigger value="carte"        className="text-xs sm:text-sm">Carte</TabsTrigger>
              <TabsTrigger value="statistiques" className="text-xs sm:text-sm">Statistiques</TabsTrigger>
              <TabsTrigger value="taches"       className="text-xs sm:text-sm">Tâches</TabsTrigger>
            </TabsList>

            {/* Total badge — visible even outside tab content */}
            {total > 0 && (
              <Badge variant="secondary" className="text-xs font-mono">
                {formatNumber(total)} acteur{total > 1 ? 's' : ''}
              </Badge>
            )}
          </div>

          {/* ── ACTEURS TAB ─────────────────────────────────────────────── */}
          <TabsContent value="acteurs" className="space-y-4 mt-0">
            {/* Filters + view toggle row */}
            <div className="flex items-start gap-3 flex-wrap">
              <div className="flex-1 min-w-0">
                <ActorFiltersBar
                  search={search}
                  onSearchChange={handleSearchChange}
                  sector={sector}
                  onSectorChange={() => {}}
                  role={role}
                  onRoleChange={handleRoleChange}
                  country={country}
                  onCountryChange={handleCountryChange}
                  status={status}
                  onStatusChange={handleStatusChange}
                  onReset={handleResetFilters}
                />
              </div>
              <ViewToggle mode={viewMode} onChange={setViewMode} />
            </div>

            {/* Actor list / grid / table */}
            {renderActeursContent()}
          </TabsContent>

          {/* ── CARTE TAB ───────────────────────────────────────────────── */}
          <TabsContent value="carte" className="mt-0">
            <SectorMapView actors={actors} sector={sector} color={color} />
          </TabsContent>

          {/* ── STATISTIQUES TAB ────────────────────────────────────────── */}
          <TabsContent value="statistiques" className="mt-0">
            <SectorCharts sector={sector} actors={actors} color={color} />
          </TabsContent>

          {/* ── TÂCHES TAB ──────────────────────────────────────────────── */}
          <TabsContent value="taches" className="mt-0">
            <SectorTasks sector={sector} color={color} />
          </TabsContent>
        </Tabs>
      </PageWrapper>

      {/* Create / Edit form dialog */}
      <SectorActorForm
        open={formOpen}
        onOpenChange={setFormOpen}
        sector={sector}
        actorId={editActor?.id}
        initialData={editActor ? (editActor as unknown as Record<string, unknown>) : undefined}
      />
    </>
  );
}
