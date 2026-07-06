'use client';

import { useState, useMemo, useRef, useCallback, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, UserX, BadgeCheck, Star, RefreshCw, Download, FileText,
  Upload, Trash2, ImageIcon, AlertTriangle, Activity, ChevronDown,
} from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { ActorFiltersBar } from '@/components/actors/actor-filters';
import { ActorCard, type ActorRow } from '@/components/actors/actor-card';
import { ActorDetailView } from '@/components/actors/actor-detail-view';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from '@/hooks/use-actors';
import { apiClient } from '@/lib/api-client';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.25 },
};

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType; label: string; value: string; color: string;
}) {
  return (
    <Card className="border-border/40 shadow-sm">
      <CardContent className="p-4 flex items-center gap-3">
        <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', color)}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-lg font-bold font-mono">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function OverviewStats() {
  const { data, isLoading } = useQuery({
    queryKey: ['actors', 'overview'],
    queryFn: () => apiClient.get<Record<string, unknown>>('/actors/overview'),
  });

  if (isLoading) return <LoadingSkeleton variant="card" count={4} />;

  const d = data as Record<string, unknown> | undefined;
  const bySector = (d?.by_sector as Array<{ sector: string; count: number; color: string }>) ?? [];
  const byStatus = (d?.by_status as Array<{ status: string; count: number; color: string }>) ?? [];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={Users} label="Acteurs totaux" value={String(d?.total_actors ?? 60)} color="bg-gradient-to-br from-primary to-primary-700" />
        <StatCard icon={Activity} label="Actifs" value={String(d?.active_actors ?? 0)} color="bg-gradient-to-br from-green-500 to-green-600" />
        <StatCard icon={BadgeCheck} label="Vérifiés" value={String(d?.verified_actors ?? 0)} color="bg-gradient-to-br from-blue-500 to-blue-600" />
        <StatCard icon={Star} label="À la une" value={String(d?.featured_actors ?? 0)} color="bg-gradient-to-br from-amber-500 to-amber-600" />
      </div>

      {bySector.length > 0 && byStatus.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Par secteur</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                {bySector.map((s) => (
                  <div key={s.sector} className="flex items-center gap-2 text-sm">
                    <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                    <span className="flex-1 capitalize">{s.sector}</span>
                    <span className="font-mono font-medium">{s.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Par statut</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                {byStatus.map((s) => (
                  <div key={s.status} className="flex items-center gap-2 text-sm">
                    <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                    <span className="flex-1 capitalize">{s.status}</span>
                    <span className="font-mono font-medium">{s.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function ImageUploadSection() {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const qc = useQueryClient();

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image');
      return;
    }
    setPreview(URL.createObjectURL(f));
    const formData = new FormData();
    formData.append('file', f);
    apiClient.upload('/actors/upload-image', formData)
      .then(() => {
        toast.success('Image envoyée pour analyse');
        qc.invalidateQueries({ queryKey: ['actors'] });
      })
      .catch(() => {
        toast.error('Ce modèle ne supporte pas les images. Rendez-vous sur la page Indicateurs pour l\'analyse visuelle IA.', { duration: 8000 });
        setPreview(null);
      });
  }, [qc]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-pink-500" />
          Analyse visuelle
          <Badge variant="outline" className="text-[10px]">Bientôt</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div
          onClick={() => fileInputRef.current?.click()}
          className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/20 p-8 text-center transition-colors hover:border-primary/50 hover:bg-primary/5"
        >
          <Upload className="mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium">Cliquez pour uploader une photo ou document</p>
          <p className="mt-1 text-xs text-muted-foreground">Photos d&apos;acteurs, documents, cartes</p>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

        {preview && (
          <div className="relative rounded-lg overflow-hidden border border-border">
            <Image src={preview} alt="Aperçu" width={400} height={160} className="max-h-40 w-full object-contain bg-muted/20" unoptimized />
            <Button variant="ghost" size="icon-sm" className="absolute top-1 right-1 bg-background/80 backdrop-blur-sm" onClick={() => setPreview(null)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-800/30 dark:bg-amber-950/20 dark:text-amber-300">
          <p className="flex items-center gap-1.5 font-medium mb-1">
            <AlertTriangle className="h-3.5 w-3.5" />
            Information
          </p>
          <p>
            Le modèle d&apos;acteurs actuel ne supporte pas les images. Utilisez les données
            textuelles ci-dessus. Pour l&apos;analyse de documents, utilisez l&apos;assistant IA.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function ActorDetailPanel() {
  const searchParams = useSearchParams();
  const actorId = searchParams.get('id');
  const router = useRouter();
  const { data: rawActor, isLoading } = useActor(actorId || '');
  const actor = rawActor ? (rawActor as unknown as ActorRow) : undefined;

  if (!actorId) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) router.push('/actors'); }}
    >
      <div className="min-h-screen flex items-start justify-center py-8 px-4">
        <div
          className="w-full max-w-4xl bg-background rounded-xl shadow-2xl border border-border p-6 relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-muted transition-colors"
            onClick={() => router.push('/actors')}
            aria-label="Fermer"
          >
            ✕
          </button>
          {isLoading ? (
            <LoadingSkeleton variant="card" count={2} />
          ) : actor ? (
            <ActorDetailView actor={actor} />
          ) : (
            <EmptyState icon={UserX} title="Acteur introuvable" description="Cet acteur n'existe pas ou a été supprimé." />
          )}
        </div>
      </div>
    </div>
  );
}

export default function ActorsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [sector, setSector] = useState('all');
  const [role, setRole] = useState('all');
  const [country, setCountry] = useState('all');
  const [status, setStatus] = useState('all');

  const queryFilters = useMemo(() => ({
    search: search || undefined,
    sector: sector !== 'all' ? sector : undefined,
    role: role !== 'all' ? role : undefined,
    country: country !== 'all' ? country : undefined,
    status: status !== 'all' ? status : undefined,
    per_page: 100,
  }), [search, sector, role, country, status]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['actors', 'list', queryFilters],
    queryFn: () => {
      const params = new URLSearchParams();
      Object.entries(queryFilters).forEach(([k, v]) => {
        if (v !== undefined && v !== null) params.set(k, String(v));
      });
      return apiClient.get<{ data: ActorRow[]; total: number }>(`/actors/?${params.toString()}`);
    },
  });

  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  const actors = data?.data ?? [];

  const handleExportCSV = () => {
    setExportOpen(false);
    if (!actors.length) { toast.error('Aucune donnée à exporter'); return; }
    const headers = ['name', 'sector', 'role', 'country', 'region', 'status', 'email', 'phone'];
    const rows = actors.map((a: ActorRow) => [
      a.name, a.sector, a.role, a.country_name, a.region, a.status, a.email || '', a.phone || '',
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'acteurs.csv'; a.click();
    URL.revokeObjectURL(url);
    toast.success('Export CSV terminé');
  };

  const handleExportPDF = () => {
    setExportOpen(false);
    if (!actors.length) { toast.error('Aucune donnée à exporter'); return; }
    window.print();
  };

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) setExportOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleReset = () => {
    setSearch('');
    setSector('all');
    setRole('all');
    setCountry('all');
    setStatus('all');
  };

  const hasFilters = search || sector !== 'all' || role !== 'all' || country !== 'all' || status !== 'all';

  return (
    <PageWrapper
      title="Acteurs agricoles"
      description="Producteurs, transformateurs, coopératives et institutions du secteur agricole africain"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => { refetch(); qc.invalidateQueries({ queryKey: ['actors'] }); }}>
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Actualiser</span>
          </Button>
          <div className="relative" ref={exportRef}>
            <Button variant="outline" size="sm" onClick={() => setExportOpen(!exportOpen)}>
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Exporter</span>
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
            {exportOpen && (
              <div className="absolute right-0 mt-1 w-40 rounded-lg border bg-popover p-1 shadow-lg z-50">
                <button onClick={handleExportCSV} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors">
                  <Download className="h-4 w-4" /> CSV
                </button>
                <button onClick={handleExportPDF} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors">
                  <FileText className="h-4 w-4" /> PDF
                </button>
              </div>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        <OverviewStats />

        <Separator />

        <ActorFiltersBar
          search={search}
          onSearchChange={setSearch}
          sector={sector}
          onSectorChange={setSector}
          role={role}
          onRoleChange={setRole}
          country={country}
          onCountryChange={setCountry}
          status={status}
          onStatusChange={setStatus}
          onReset={handleReset}
        />

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div key="loading" {...fadeUp}>
              <LoadingSkeleton variant="card" count={8} />
            </motion.div>
          ) : isError ? (
            <motion.div key="error" {...fadeUp}>
              <ErrorState title="Erreur de chargement" message="Impossible de charger les acteurs" onRetry={() => refetch()} />
            </motion.div>
          ) : actors.length === 0 ? (
            <motion.div key="empty" {...fadeUp}>
              <EmptyState
                icon="👥"
                title="Aucun acteur trouvé"
                description={hasFilters ? 'Essayez de modifier les filtres' : 'Aucune donnée disponible'}
                action={hasFilters ? { label: 'Réinitialiser les filtres', onClick: handleReset } : undefined}
              />
            </motion.div>
          ) : (
            <motion.div key="grid" {...fadeUp}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">{actors.length}</span> acteur{actors.length > 1 ? 's' : ''}
                  {hasFilters && <span> (filtré{actors.length > 1 ? 's' : ''})</span>}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {actors.map((row, i) => (
                  <motion.div
                    key={row.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.02, 0.3) }}
                  >
                    <ActorCard row={row} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Separator />

        <ImageUploadSection />
      </div>
      <Suspense><ActorDetailPanel /></Suspense>
    </PageWrapper>
  );
}
