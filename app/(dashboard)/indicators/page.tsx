'use client';

import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, Activity, Globe, AlertTriangle, Upload, Trash2,
  RefreshCw, Download, ImageIcon, FileText, ChevronDown,
} from 'lucide-react';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { IndicatorFiltersBar } from '@/components/indicators/indicator-filters';
import { IndicatorCard, type IndicatorDataRow } from '@/components/indicators/indicator-card';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import Image from 'next/image';
import { cn } from '@/lib/utils';

// ─── Animation ───────────────────────────────────────────────────────────────

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.25 },
};

// ─── Stat Card ───────────────────────────────────────────────────────────────

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

// ─── Overview Stats ──────────────────────────────────────────────────────────

function OverviewStats() {
  const { data, isLoading } = useQuery({
    queryKey: ['indicators', 'overview'],
    queryFn: () => apiClient.get<Record<string, unknown>>('/indicators/overview'),
  });

  if (isLoading) return <LoadingSkeleton variant="card" count={4} />;

  const d = data as Record<string, unknown> | undefined;
  const bySector = (d?.by_sector as Array<{ sector: string; count: number; color: string }>) ?? [];
  const healthDist = (d?.health_distribution as Array<{ status: string; count: number; color: string }>) ?? [];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={BarChart3} label="Indicateurs" value={String(d?.total_indicators ?? 48)} color="bg-gradient-to-br from-primary to-primary-700" />
        <StatCard icon={Activity} label="Catégories" value={String(d?.categories ?? 15)} color="bg-gradient-to-br from-blue-500 to-blue-600" />
        <StatCard icon={Globe} label="Pays" value={String(d?.countries ?? 14)} color="bg-gradient-to-br from-green-500 to-green-600" />
        <StatCard icon={AlertTriangle} label="Alertes" value={String(d?.with_alerts ?? 7)} color="bg-gradient-to-br from-amber-500 to-amber-600" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* By sector */}
        {bySector.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Par secteur
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                {bySector.map((s) => (
                  <div key={s.sector} className="flex items-center gap-2 text-sm">
                    <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                    <span className="flex-1">{s.sector}</span>
                    <span className="font-mono font-medium">{s.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Health distribution */}
        {healthDist.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                État de santé
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                {healthDist.map((h) => (
                  <div key={h.status} className="flex items-center gap-2 text-sm">
                    <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: h.color }} />
                    <span className="flex-1">{h.status}</span>
                    <span className="font-mono font-medium">{h.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// ─── Image Upload ────────────────────────────────────────────────────────────

function ImageUploadSection() {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    apiClient.upload('/indicators/upload-image', formData)
      .then(() => toast.success('Image envoyée pour analyse'))
      .catch(() => {
        toast.error('Ce modèle ne supporte pas les images. Utilisez l\'assistant IA.', { duration: 6000 });
        setPreview(null);
      });
  }, []);

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
          <p className="text-sm font-medium">Cliquez pour uploader un graphique ou document</p>
          <p className="mt-1 text-xs text-muted-foreground">Graphiques, tableaux, captures d&apos;écran</p>
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
            Le modèle d&apos;indicateurs actuel ne supporte pas les images. Utilisez les données
            statistiques ci-dessus. Pour l&apos;analyse visuelle, utilisez l&apos;assistant IA.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function IndicatorsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [indicator, setIndicator] = useState('all');
  const [country, setCountry] = useState('all');
  const [sector, setSector] = useState('all');
  const [health, setHealth] = useState('all');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['indicators', 'list', indicator, country, sector, search],
    queryFn: () => {
      const params = new URLSearchParams();
      if (indicator !== 'all') params.set('category', indicator);
      if (country !== 'all') params.set('country', country);
      if (sector !== 'all') params.set('sector', sector);
      if (search) params.set('search', search);
      params.set('limit', '100');
      return apiClient.get<{ data: IndicatorDataRow[]; count: number }>(`/indicators/?${params.toString()}`);
    },
  });

  const filtered = useMemo(() => {
    const allIndicators = data?.data ?? [];
    let items = allIndicators;
    if (health !== 'all') {
      items = items.filter((r) => r.health_status === health);
    }
    return items;
  }, [data?.data, health]);

  const handleReset = () => {
    setSearch('');
    setIndicator('all');
    setCountry('all');
    setSector('all');
    setHealth('all');
  };

  const hasFilters = indicator !== 'all' || country !== 'all' || sector !== 'all' || health !== 'all' || !!search;

  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  const handleExportCSV = () => {
    setExportOpen(false);
    const items = filtered;
    if (!items.length) { toast.error('Aucune donnée à exporter'); return; }
    const headers = ['name', 'sector', 'category', 'country', 'value', 'unit', 'year', 'health_status', 'trend'];
    const rows = items.map((r: IndicatorDataRow) => [
      r.name, r.sector, r.category, r.country_name || r.country, r.value, r.unit, r.year, r.health_status, r.trend,
    ].map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'indicateurs.csv'; a.click();
    URL.revokeObjectURL(url);
    toast.success('Export CSV terminé');
  };

  const handleExportPDF = () => {
    setExportOpen(false);
    if (!filtered.length) { toast.error('Aucune donnée à exporter'); return; }
    window.print();
  };

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) setExportOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <PageWrapper
      title="Indicateurs agricoles"
      description="Rendements, prix, production, climat et données socio-économiques par pays et secteur"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => { refetch(); qc.invalidateQueries({ queryKey: ['indicators'] }); }}>
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
        {/* Overview */}
        <OverviewStats />

        <Separator />

        {/* Filters */}
        <IndicatorFiltersBar
          search={search}
          onSearchChange={setSearch}
          indicator={indicator}
          onIndicatorChange={setIndicator}
          country={country}
          onCountryChange={setCountry}
          sector={sector}
          onSectorChange={setSector}
          health={health}
          onHealthChange={setHealth}
          onReset={handleReset}
        />

        {/* Content */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div key="loading" {...fadeUp}>
              <LoadingSkeleton variant="card" count={8} />
            </motion.div>
          ) : isError ? (
            <motion.div key="error" {...fadeUp}>
              <ErrorState title="Erreur de chargement" message="Impossible de charger les indicateurs" onRetry={() => refetch()} />
            </motion.div>
          ) : filtered.length === 0 ? (
            <motion.div key="empty" {...fadeUp}>
              <EmptyState
                icon="📊"
                title="Aucun indicateur trouvé"
                description={hasFilters ? 'Essayez de modifier les filtres' : 'Aucune donnée disponible'}
                action={hasFilters ? { label: 'Réinitialiser les filtres', onClick: handleReset } : undefined}
              />
            </motion.div>
          ) : (
            <motion.div key="grid" {...fadeUp}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">{filtered.length}</span> indicateur{filtered.length > 1 ? 's' : ''}
                  {hasFilters && <span> (filtré{filtered.length > 1 ? 's' : ''})</span>}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map((row, i) => (
                  <motion.div
                    key={row.id || i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.02, 0.3) }}
                  >
                    <IndicatorCard row={row} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Separator />

        {/* Image upload */}
        <ImageUploadSection />
      </div>
    </PageWrapper>
  );
}
