'use client';

import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, Activity, Globe, AlertTriangle, Upload, Trash2,
  RefreshCw, Download, ImageIcon, FileText, ChevronDown, Loader2,
  LayoutGrid, Table2, Database, ExternalLink,
  Bell, BellOff, TrendingUp, TrendingDown,
  Sparkles, LayoutDashboard, LineChart, PieChart as PieChartIcon,
  ArrowUpRight, Layers,
} from 'lucide-react';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { IndicatorFiltersBar } from '@/components/indicators/indicator-filters';
import { IndicatorCard, IndicatorCardSkeleton, type IndicatorDataRow } from '@/components/indicators/indicator-card';
import { IndicatorDetailModal } from '@/components/indicators/indicator-detail-modal';
import { IndicatorCreateForm } from '@/components/indicators/indicator-create-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 },
};

// ─── Stat Card (enhanced) ─────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, color, trend, chart }: {
  icon: React.ElementType; label: string; value: string; color: string;
  trend?: { dir: 'up' | 'down'; val: string };
  chart?: { data: Array<{ v: number }>; color: string };
}) {
  return (
    <motion.div whileHover={{ y: -3, scale: 1.01 }} transition={{ duration: 0.2 }}>
      <Card className="relative overflow-hidden border-border/40 shadow-sm backdrop-blur-sm bg-card/95 group">
        <div className={cn('absolute inset-0 opacity-[0.03]', color.replace('from-', 'bg-').split(' ')[0])} />
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-sm ring-1 ring-white/10', color)}>
              <Icon className="h-4.5 w-4.5 text-white" />
            </div>
            <div className="flex items-center gap-2">
              {trend && (
                <span className={cn('flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-full', trend.dir === 'up' ? 'text-green-600 bg-green-50 dark:bg-green-950/20' : 'text-red-600 bg-red-50 dark:bg-red-950/20')}>
                  {trend.dir === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {trend.val}
                </span>
              )}
            </div>
          </div>
          <p className="text-2xl font-bold font-mono tracking-tight">{value}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          {chart && chart.data.length > 1 && (
            <div className="mt-2 h-8 -mx-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chart.data}>
                  <defs>
                    <linearGradient id={`chart-${label}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={chart.color} stopOpacity={0.2} />
                      <stop offset="100%" stopColor={chart.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="v" stroke={chart.color} strokeWidth={1.5} fill={`url(#chart-${label})`} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Overview Stats ──────────────────────────────────────────────────────────

function OverviewStats({ onFetchExternal, isFetching }: {
  onFetchExternal: () => void;
  isFetching: boolean;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ['indicators', 'overview'],
    queryFn: () => apiClient.get<Record<string, unknown>>('/indicators/overview'),
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-border/40">
            <CardContent className="p-4 space-y-3">
              <div className="h-9 w-9 rounded-xl bg-muted animate-pulse" />
              <div className="h-7 w-20 bg-muted rounded animate-pulse" />
              <div className="h-3 w-28 bg-muted rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const d = data as Record<string, unknown> | undefined;
  const bySector = (d?.by_sector as Array<{ sector: string; count: number; color: string }>) ?? [];
  const healthDist = (d?.health_distribution as Array<{ status: string; count: number; color: string }>) ?? [];

  const total = Number(d?.total_indicators ?? 0);
  const optimal = healthDist.find(h => h.status === 'Optimal')?.count ?? 0;
  const healthPct = total ? Math.round((optimal / total) * 100) : 0;

  const chartData = Array.from({ length: 8 }, (_, i) => ({ v: Math.round(40 + Math.sin(i * 0.8) * 20 + Math.random() * 15) }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          icon={BarChart3} label="Indicateurs" value={String(total)}
          color="bg-gradient-to-br from-emerald-500 to-emerald-700"
          trend={{ dir: 'up', val: String(d?.recent_updates ?? 0) }}
          chart={{ data: chartData, color: '#10b981' }}
        />
        <StatCard
          icon={Layers} label="Catégories" value={String(d?.categories ?? 0)}
          color="bg-gradient-to-br from-blue-500 to-blue-700"
          chart={{ data: chartData.map(v => ({ v: v * 0.3 })), color: '#3b82f6' }}
        />
        <StatCard
          icon={Globe} label="Pays" value={String(d?.countries ?? 0)}
          color="bg-gradient-to-br from-violet-500 to-violet-700"
          chart={{ data: chartData.map(v => ({ v: v * 0.5 })), color: '#8b5cf6' }}
        />
        <StatCard
          icon={AlertTriangle} label="Alertes" value={String(d?.with_alerts ?? 0)}
          color="bg-gradient-to-br from-amber-500 to-amber-700"
          trend={{ dir: healthPct > 60 ? 'down' : 'up', val: `${healthPct}%` }}
          chart={{ data: chartData.map(v => ({ v: v * 0.7 })), color: '#f59e0b' }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* By sector with mini pie */}
        {bySector.length > 0 && (
          <Card className="border-border/40 backdrop-blur-sm bg-card/95 group">
            <CardHeader className="pb-2">
              <CardTitle className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                <PieChartIcon className="h-3.5 w-3.5" />
                Répartition par secteur
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={bySector} dataKey="count" cx="50%" cy="50%" innerRadius={20} outerRadius={35} strokeWidth={0}>
                        {bySector.map((s) => <Cell key={s.sector} fill={s.color} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-1.5">
                  {bySector.map((s) => (
                    <div key={s.sector} className="flex items-center gap-2 text-xs group/item">
                      <div className="h-2 w-2 rounded-full shrink-0 transition-all group-hover/item:scale-125" style={{ backgroundColor: s.color }} />
                      <span className="flex-1 text-muted-foreground">{s.sector}</span>
                      <span className="font-semibold font-mono text-xs">{s.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Health distribution with bar chart */}
        {healthDist.length > 0 && (
          <Card className="border-border/40 backdrop-blur-sm bg-card/95 group">
            <CardHeader className="pb-2">
              <CardTitle className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5" />
                État de santé
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {healthDist.map((h) => {
                  const pct = total ? Math.round((h.count / total) * 100) : 0;
                  return (
                    <div key={h.status} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5">
                          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: h.color }} />
                          {h.status}
                        </span>
                        <span className="font-mono font-semibold">{h.count} ({pct}%)</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full transition-all"
                          style={{ backgroundColor: h.color, width: `${pct}%` }}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, delay: 0.2 }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sync status */}
        <Card className="border-border/40 backdrop-blur-sm bg-card/95 group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
          <CardHeader className="pb-2 relative">
            <CardTitle className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
              <Database className="h-3.5 w-3.5" />
              Sources de données
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 relative">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5">
                  <ExternalLink className="h-3 w-3 text-blue-500" />
                  World Bank API
                </span>
                <Badge variant="outline" className="text-[9px] h-4 px-1.5 bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-300">
                  ✓ Actif
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5">
                  <Database className="h-3 w-3 text-emerald-500" />
                  Base de données
                </span>
                <Badge variant="outline" className="text-[9px] h-4 px-1.5 bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-300">
                  ✓ {d?.total_indicators ?? 0} enregistrements
                </Badge>
              </div>
            </div>
            <Separator className="opacity-30" />
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-1.5 text-xs h-8 group/btn"
              onClick={onFetchExternal}
              disabled={isFetching}
            >
              {isFetching ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5 text-amber-500 group-hover/btn:rotate-12 transition-transform" />
              )}
              {isFetching ? 'Synchronisation...' : 'Synchroniser données en ligne'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Data Table ──────────────────────────────────────────────────────────────

function IndicatorDataTable({ items, onRowClick }: {
  items: IndicatorDataRow[];
  onRowClick: (item: IndicatorDataRow) => void;
}) {
  return (
    <div className="rounded-xl border border-border/40 bg-card overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/20">
              <th className="text-left px-4 py-3.5 font-medium text-[11px] text-muted-foreground uppercase tracking-widest">Indicateur</th>
              <th className="text-left px-4 py-3.5 font-medium text-[11px] text-muted-foreground uppercase tracking-widest">Secteur</th>
              <th className="text-left px-4 py-3.5 font-medium text-[11px] text-muted-foreground uppercase tracking-widest">Catégorie</th>
              <th className="text-right px-4 py-3.5 font-medium text-[11px] text-muted-foreground uppercase tracking-widest">Valeur</th>
              <th className="text-center px-4 py-3.5 font-medium text-[11px] text-muted-foreground uppercase tracking-widest">Tendance</th>
              <th className="text-center px-4 py-3.5 font-medium text-[11px] text-muted-foreground uppercase tracking-widest">Santé</th>
              <th className="text-left px-4 py-3.5 font-medium text-[11px] text-muted-foreground uppercase tracking-widest">Pays</th>
              <th className="text-right px-4 py-3.5 font-medium text-[11px] text-muted-foreground uppercase tracking-widest">Année</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row, i) => (
              <motion.tr
                key={row.id}
                className="border-b last:border-0 hover:bg-muted/10 transition-colors cursor-pointer group"
                onClick={() => onRowClick(row)}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i * 0.015, 0.3) }}
              >
                <td className="px-4 py-3.5 font-medium text-sm">{row.name}</td>
                <td className="px-4 py-3.5">
                  <span className="text-xs capitalize text-muted-foreground bg-muted/30 px-2 py-0.5 rounded-md">{row.sector}</span>
                </td>
                <td className="px-4 py-3.5 text-xs text-muted-foreground">{row.category}</td>
                <td className="px-4 py-3.5 text-right font-mono text-sm font-semibold">{row.value} <span className="text-[10px] text-muted-foreground font-normal">{row.unit}</span></td>
                <td className="px-4 py-3.5 text-center">
                  <span className={cn(
                    'inline-flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded-full',
                    row.trend === 'up' ? 'text-green-600 bg-green-50 dark:bg-green-950/20' :
                    row.trend === 'down' ? 'text-red-600 bg-red-50 dark:bg-red-950/20' :
                    'text-muted-foreground bg-muted/30',
                  )}>
                    {row.trend === 'up' ? <TrendingUp className="h-3 w-3" /> : row.trend === 'down' ? <TrendingDown className="h-3 w-3" /> : null}
                    {row.trend_percent != null ? `${row.trend_percent > 0 ? '+' : ''}${row.trend_percent}%` : '-'}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-center">
                  <HealthBadge status={row.health_status} />
                </td>
                <td className="px-4 py-3.5 text-xs text-muted-foreground">{row.country || '-'}</td>
                <td className="px-4 py-3.5 text-right text-xs font-mono text-muted-foreground">{row.year || '-'}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function HealthBadge({ status }: { status?: string }) {
  if (!status) return <span className="text-xs text-muted-foreground">-</span>;
  const config: Record<string, { label: string; color: string; bg: string }> = {
    optimal: { label: 'Optimal', color: 'text-green-700 dark:text-green-300', bg: 'bg-green-100 dark:bg-green-900/30' },
    alert: { label: 'Surveillance', color: 'text-yellow-700 dark:text-yellow-300', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
    critical: { label: 'Critique', color: 'text-red-700 dark:text-red-300', bg: 'bg-red-100 dark:bg-red-900/30' },
  };
  const c = config[status] || config.alert;
  return <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold', c.bg, c.color)}>{c.label}</span>;
}

// ─── Image Upload ────────────────────────────────────────────────────────────

function ImageUploadSection() {
  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image');
      return;
    }
    setPreview(URL.createObjectURL(f));
    setAnalysis(null);
    setIsAnalyzing(true);
    const formData = new FormData();
    formData.append('file', f);
    apiClient.upload('/indicators/upload-image', formData)
      .then((res: unknown) => {
        const r = res as { analysis?: string; status?: string };
        setAnalysis(r.analysis ?? 'Analyse reçue.');
        toast.success('Analyse IA terminée');
      })
      .catch(() => {
        toast.error("Erreur lors de l'analyse visuelle");
        setPreview(null);
      })
      .finally(() => setIsAnalyzing(false));
  }, []);

  return (
    <Card className="border-border/40 backdrop-blur-sm bg-card/95">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500 to-purple-500">
            <ImageIcon className="h-3.5 w-3.5 text-white" />
          </div>
          Analyse visuelle par IA
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div
          onClick={() => !isAnalyzing && fileInputRef.current?.click()}
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/10 p-8 text-center transition-all',
            isAnalyzing ? 'cursor-not-allowed opacity-60' : 'hover:border-primary/40 hover:bg-primary/3 hover:shadow-sm',
          )}
        >
          {isAnalyzing ? (
            <>
              <div className="mb-3 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="h-5 w-5 text-primary animate-spin" />
              </div>
              <p className="text-sm font-medium">Analyse en cours…</p>
              <p className="mt-1 text-xs text-muted-foreground">L&apos;IA examine l&apos;image</p>
            </>
          ) : (
            <>
              <div className="mb-3 h-10 w-10 rounded-full bg-muted/50 flex items-center justify-center">
                <Upload className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">Cliquez pour analyser une image</p>
              <p className="mt-1 text-xs text-muted-foreground">Graphiques, cultures, maladies, captures d&apos;écran</p>
            </>
          )}
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

        {preview && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="relative rounded-xl overflow-hidden border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Aperçu" className="max-h-44 w-full object-contain bg-muted/10" />
            <Button variant="ghost" size="icon" className="absolute top-2 right-2 bg-background/70 backdrop-blur-sm hover:bg-background/90 h-7 w-7 rounded-full" onClick={() => { setPreview(null); setAnalysis(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </motion.div>
        )}

        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-green-200 dark:border-green-800/30 bg-gradient-to-br from-green-50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/10 p-4"
          >
            <p className="text-xs font-semibold text-green-800 dark:text-green-300 mb-2 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-green-600" />
              Résultat IA
            </p>
            <p className="text-xs text-green-900 dark:text-green-200 whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
              {analysis}
            </p>
          </motion.div>
        )}
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
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedIndicator, setSelectedIndicator] = useState<IndicatorDataRow | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['indicators', 'list', indicator, country, sector, search],
    queryFn: () => {
      const params = new URLSearchParams();
      if (indicator !== 'all') params.set('category', indicator);
      if (country !== 'all') params.set('country', country);
      if (sector !== 'all') params.set('sector', sector);
      if (search) params.set('search', search);
      params.set('limit', '200');
      return apiClient.get<{ data: IndicatorDataRow[]; count: number }>(`/indicators/?${params.toString()}`);
    },
    refetchInterval: autoRefresh ? 15000 : false,
  });

  const filtered = useMemo(() => {
    const items = data?.data ?? [];
    if (health === 'all') return items;
    return items.filter((r) => r.health_status === health);
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
  const [isFetchingExternal, setIsFetchingExternal] = useState(false);

  const handleFetchExternal = async () => {
    setIsFetchingExternal(true);
    try {
      const res = await apiClient.get<{ success: boolean; count: number; saved: number; errors: string[] }>('/indicators/external-fetch');
      if (res.success) {
        toast.success(`${res.count} indicateurs récupérés, ${res.saved} sauvegardés depuis World Bank`);
        qc.invalidateQueries({ queryKey: ['indicators'] });
      } else {
        toast.error('Échec de la récupération externe');
      }
    } catch {
      toast.error('Impossible de contacter les sources externes');
    } finally {
      setIsFetchingExternal(false);
    }
  };

  const handleExportCSV = () => {
    setExportOpen(false);
    const items = filtered;
    if (!items.length) { toast.error('Aucune donnée à exporter'); return; }
    const headers = ['name', 'sector', 'category', 'country', 'value', 'unit', 'year', 'health_status', 'trend'];
    const rows = items.map((r: IndicatorDataRow) => [
      r.name, r.sector, r.category, r.country, r.value, r.unit, r.year, r.health_status, r.trend,
    ].map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','));
    const csv = '\uFEFF' + headers.join(',') + '\n' + rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'indicateurs.csv'; a.click();
    URL.revokeObjectURL(a.href);
    toast.success('Export CSV terminé');
  };

  const handleExportJSON = () => {
    setExportOpen(false);
    if (!filtered.length) { toast.error('Aucune donnée à exporter'); return; }
    const blob = new Blob([JSON.stringify(filtered, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'indicateurs.json'; a.click();
    URL.revokeObjectURL(a.href);
    toast.success('Export JSON terminé');
  };

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) setExportOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleCardClick = (row: IndicatorDataRow) => {
    setSelectedIndicator(row);
    setDetailOpen(true);
  };

  return (
    <PageWrapper
      title={
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-sm">
            <LayoutDashboard className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold">Indicateurs agricoles</span>
              {data?.data && (
                <Badge variant="secondary" className="text-[10px] font-mono h-5 px-1.5">{data.data.length}</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Rendements, prix, production, données socio-économiques</p>
          </div>
        </div>
      }
      actions={
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="flex items-center border rounded-lg overflow-hidden bg-background/50 mr-1">
            <button
              onClick={() => setViewMode('grid')}
              className={cn('p-2 transition-all', viewMode === 'grid' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50')}
              title="Vue grille"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={cn('p-2 transition-all', viewMode === 'table' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50')}
              title="Vue tableau"
            >
              <Table2 className="h-3.5 w-3.5" />
            </button>
          </div>

          <Button
            variant={autoRefresh ? 'default' : 'outline'}
            size="sm"
            className="h-8 w-8 p-0 rounded-lg"
            onClick={() => setAutoRefresh(!autoRefresh)}
            title={autoRefresh ? 'Arrêter le rafraîchissement auto' : 'Activer le rafraîchissement auto'}
          >
            {autoRefresh ? <Bell className="h-3.5 w-3.5" /> : <BellOff className="h-3.5 w-3.5" />}
          </Button>

          <Button variant="outline" size="sm" className="h-8 rounded-lg gap-1.5" onClick={() => { refetch(); qc.invalidateQueries({ queryKey: ['indicators'] }); }}>
            <RefreshCw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline text-xs">Actualiser</span>
          </Button>

          <Button variant="outline" size="sm" className="h-8 rounded-lg gap-1.5" onClick={handleFetchExternal} disabled={isFetchingExternal}>
            {isFetchingExternal ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ExternalLink className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline text-xs">En ligne</span>
          </Button>

          <IndicatorCreateForm />

          <div className="relative" ref={exportRef}>
            <Button variant="outline" size="sm" className="h-8 rounded-lg gap-1.5" onClick={() => setExportOpen(!exportOpen)}>
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline text-xs">Export</span>
              <ChevronDown className="h-3 w-3" />
            </Button>
            {exportOpen && (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="absolute right-0 mt-1.5 w-44 rounded-xl border bg-popover p-1.5 shadow-xl z-50 backdrop-blur-sm"
              >
                <button onClick={handleExportCSV} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm hover:bg-accent transition-colors">
                  <FileText className="h-4 w-4 text-emerald-600" /> CSV
                </button>
                <button onClick={handleExportJSON} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm hover:bg-accent transition-colors">
                  <Download className="h-4 w-4 text-blue-600" /> JSON
                </button>
              </motion.div>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        <OverviewStats onFetchExternal={handleFetchExternal} isFetching={isFetchingExternal} />
        <Separator />
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

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div key="loading" {...fadeUp}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => <IndicatorCardSkeleton key={i} />)}
              </div>
            </motion.div>
          ) : isError ? (
            <motion.div key="error" {...fadeUp}>
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="h-16 w-16 rounded-2xl bg-red-50 dark:bg-red-950/20 flex items-center justify-center mb-4 ring-1 ring-red-200 dark:ring-red-800/30">
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold mb-1">Erreur de chargement</h3>
                <p className="text-sm text-muted-foreground mb-4">Impossible de charger les indicateurs</p>
                <Button onClick={() => refetch()} variant="outline" className="gap-2">
                  <RefreshCw className="h-4 w-4" /> Réessayer
                </Button>
              </div>
            </motion.div>
          ) : filtered.length === 0 ? (
            <motion.div key="empty" {...fadeUp}>
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4 ring-1 ring-border">
                  <BarChart3 className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-1">Aucun indicateur trouvé</h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                  {hasFilters
                    ? 'Aucun indicateur ne correspond aux filtres sélectionnés. Essayez d\'élargir votre recherche.'
                    : 'La base de données ne contient pas encore d\'indicateurs. Générez des données de test ou synchronisez depuis les sources en ligne.'}
                </p>
                <div className="flex items-center gap-2">
                  {hasFilters ? (
                    <Button variant="outline" onClick={handleReset} className="gap-2">
                      <RefreshCw className="h-4 w-4" /> Réinitialiser les filtres
                    </Button>
                  ) : (
                    <>
                      <Button onClick={async () => {
                        try {
                          await apiClient.post('/indicators/seed');
                          toast.success('Données de démonstration créées');
                          refetch();
                          qc.invalidateQueries({ queryKey: ['indicators'] });
                        } catch { toast.error('Erreur lors de la génération'); }
                      }} className="gap-2">
                        <Sparkles className="h-4 w-4" /> Générer données test
                      </Button>
                      <Button variant="outline" onClick={handleFetchExternal} disabled={isFetchingExternal} className="gap-2">
                        <ExternalLink className="h-4 w-4" /> Synchroniser en ligne
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div key={viewMode} {...fadeUp}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <span className="font-semibold text-foreground">{filtered.length}</span>
                  indicateur{filtered.length > 1 ? 's' : ''}
                  {hasFilters && <span className="text-muted-foreground/60">filtré{filtered.length > 1 ? 's' : ''}</span>}
                  {autoRefresh && (
                    <span className="inline-flex items-center gap-1.5 text-primary text-xs bg-primary/5 px-2 py-0.5 rounded-full">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                      Temps réel
                    </span>
                  )}
                </p>
              </div>

              {viewMode === 'table' ? (
                <IndicatorDataTable items={filtered} onRowClick={handleCardClick} />
              ) : (
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                  variants={{ animate: { transition: { staggerChildren: 0.03 } } }}
                  initial="initial"
                  animate="animate"
                >
                  {filtered.map((row, i) => (
                    <motion.div
                      key={row.id || i}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(i * 0.025, 0.4) }}
                    >
                      <IndicatorCard row={row} onClick={() => handleCardClick(row)} />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <Separator />
        <ImageUploadSection />
      </div>

      <IndicatorDetailModal
        indicator={selectedIndicator}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </PageWrapper>
  );
}
