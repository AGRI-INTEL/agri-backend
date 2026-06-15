'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, TrendingUp, CloudSun, Globe, Upload,
  Wheat, DollarSign, Thermometer, Droplets, AlertTriangle,
  RefreshCw, ImageIcon, Trash2,
  ArrowUp, ArrowDown,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { ErrorState } from '@/components/shared/error-state';
import { EmptyState } from '@/components/shared/empty-state';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { cn, formatNumber } from '@/lib/utils';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, LineChart, Line, AreaChart, Area, Legend,
} from 'recharts';

// ─── Animation variants ──────────────────────────────────────────────────────

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.3 },
};

// ─── Constants ───────────────────────────────────────────────────────────────

const CROPS = [
  'Maïs', 'Riz', 'Manioc', 'Mil', 'Sorgho', 'Arachide', 'Igname', 'Coton',
];

const COUNTRIES = [
  'Sénégal', 'Nigeria', 'Ghana', 'Côte d\'Ivoire', 'Mali', 'Burkina Faso',
  'Togo', 'Bénin', 'Niger', 'Guinée',
];

const PERIODS = [
  { value: '1M', label: '1 mois' },
  { value: '3M', label: '3 mois' },
  { value: '6M', label: '6 mois' },
  { value: '1Y', label: '1 an' },
];

const CHART_COLORS = [
  '#16A34A', '#D97706', '#0891B2', '#7C3AED',
  '#DC2626', '#EC4899', '#6366F1', '#14B8A6',
];

// ─── Stat Card ───────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, color, sub }: {
  icon: React.ElementType; label: string; value: string;
  color: string; sub?: string;
}) {
  return (
    <motion.div {...fadeUp}>
      <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', color)}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-bold font-mono leading-tight truncate">{value}</p>
              <p className="text-xs text-muted-foreground truncate">{label}</p>
              {sub && <p className="text-[10px] text-muted-foreground/60 truncate">{sub}</p>}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Overview Section ────────────────────────────────────────────────────────

function OverviewSection() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: () => apiClient.get<Record<string, unknown>>('/analytics/overview'),
  });

  if (isLoading) return <LoadingSkeleton variant="card" count={4} />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;

  const d = data as Record<string, unknown> | undefined;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={BarChart3} label="Indicateurs" value={String(d?.indicators ?? 36)} color="bg-gradient-to-br from-primary to-primary-700" sub="Taux de croissance" />
        <StatCard icon={TrendingUp} label="Croissance" value={String(d?.growth ?? '+12%')} color="bg-gradient-to-br from-green-500 to-green-600" />
        <StatCard icon={Globe} label="Pays couverts" value={String(d?.countries_covered ?? 14)} color="bg-gradient-to-br from-blue-500 to-blue-600" />
        <StatCard icon={AlertTriangle} label="Alertes (7j)" value={String(d?.alerts_7d ?? 7)} color="bg-gradient-to-br from-amber-500 to-amber-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly Production */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Production mensuelle
            </CardTitle>
          </CardHeader>
          <CardContent className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={(d?.monthly_production as Array<{ month: string; value: number }>) ?? []}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Production by crop */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Wheat className="h-4 w-4 text-amber-500" />
              Production par culture
            </CardTitle>
          </CardHeader>
          <CardContent className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={(d?.production_by_crop as Array<{ crop: string; tonnes: number }>) ?? []}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="crop" type="category" tick={{ fontSize: 10 }} width={70} />
                <Tooltip />
                <Bar dataKey="tonnes" fill="#D97706" radius={[0, 4, 4, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top crops pie */}
      {(d?.top_crops as Array<{ name: string; value: number }> ?? []).length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-500" />
              Répartition des cultures
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {((d?.top_crops as Array<{ name: string; value: number }>) ?? []).map((c, i) => (
                <div key={c.name} className="flex items-center gap-2 rounded-lg border border-border/40 p-2.5 text-sm">
                  <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                  <span className="font-medium">{c.name}</span>
                  <span className="ml-auto text-muted-foreground">{c.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Production Trends ───────────────────────────────────────────────────────

function ProductionTrendsSection() {
  const [crop, setCrop] = useState('Maïs');
  const [period, setPeriod] = useState('1Y');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['analytics', 'trends', 'production', crop, period],
    queryFn: () => apiClient.get<{ data: Array<{ date: string; value: number }>; unit: string }>(
      `/analytics/trends/production?crop=${encodeURIComponent(crop)}&period=${period}`
    ),
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground font-medium">Culture</label>
          <Select value={crop} onValueChange={setCrop}>
            <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              {CROPS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground font-medium">Période</label>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="h-8 w-28"><SelectValue /></SelectTrigger>
            <SelectContent>
              {PERIODS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="self-end">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            Évolution du rendement — {crop}
          </CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          {isLoading ? <LoadingSkeleton variant="chart" /> : isError ? <ErrorState onRetry={() => refetch()} /> : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.data ?? []}>
                <defs>
                  <linearGradient id="prodGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16A34A" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#16A34A" strokeWidth={2} fill="url(#prodGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Price Trends ────────────────────────────────────────────────────────────

function PriceTrendsSection() {
  const [crop, setCrop] = useState('Maïs');
  const [period, setPeriod] = useState('1Y');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['analytics', 'trends', 'prices', crop, period],
    queryFn: () => apiClient.get<{ data: Array<{ date: string; price: number }>; unit: string }>(
      `/analytics/trends/prices?crop=${encodeURIComponent(crop)}&period=${period}`
    ),
  });

  const chartData = data?.data?.map((d) => ({ date: d.date, value: d.price })) ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground font-medium">Produit</label>
          <Select value={crop} onValueChange={setCrop}>
            <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              {CROPS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground font-medium">Période</label>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="h-8 w-28"><SelectValue /></SelectTrigger>
            <SelectContent>
              {PERIODS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="self-end">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-amber-500" />
            Évolution des prix — {crop}
          </CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          {isLoading ? <LoadingSkeleton variant="chart" /> : isError ? <ErrorState onRetry={() => refetch()} /> : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#D97706" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Weather Section ─────────────────────────────────────────────────────────

function WeatherSection() {
  const [country, setCountry] = useState('Sénégal');
  const [period, setPeriod] = useState('1Y');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['analytics', 'trends', 'weather', country, period],
    queryFn: () => apiClient.get<{
      temperature: Array<{ date: string; temperature: number }>;
      precipitation: Array<{ date: string; precipitation: number }>;
      summary: { avg_temp: number; avg_precip: number; max_temp: number; min_temp: number };
    }>(`/analytics/trends/weather?country=${encodeURIComponent(country)}&period=${period}`),
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground font-medium">Pays</label>
          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger className="h-8 w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground font-medium">Période</label>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="h-8 w-28"><SelectValue /></SelectTrigger>
            <SelectContent>
              {PERIODS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="self-end">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {data?.summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard icon={Thermometer} label="Temp. moyenne" value={`${data.summary.avg_temp}°C`} color="bg-gradient-to-br from-orange-500 to-orange-600" />
          <StatCard icon={Droplets} label="Précip. moyenne" value={`${data.summary.avg_precip} mm`} color="bg-gradient-to-br from-blue-500 to-blue-600" />
          <StatCard icon={ArrowUp} label="Temp. max" value={`${data.summary.max_temp}°C`} color="bg-gradient-to-br from-red-500 to-red-600" />
          <StatCard icon={ArrowDown} label="Temp. min" value={`${data.summary.min_temp}°C`} color="bg-gradient-to-br from-cyan-500 to-cyan-600" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs flex items-center gap-2">
              <Thermometer className="h-3.5 w-3.5 text-orange-500" />
              Température
            </CardTitle>
          </CardHeader>
          <CardContent className="h-56">
            {isLoading ? <LoadingSkeleton variant="chart" /> : isError ? <ErrorState onRetry={() => refetch()} /> : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.temperature ?? []}>
                  <defs>
                    <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F97316" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="temperature" stroke="#F97316" strokeWidth={2} fill="url(#tempGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs flex items-center gap-2">
              <Droplets className="h-3.5 w-3.5 text-blue-500" />
              Précipitations
            </CardTitle>
          </CardHeader>
          <CardContent className="h-56">
            {isLoading ? <LoadingSkeleton variant="chart" /> : isError ? <ErrorState onRetry={() => refetch()} /> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.precipitation ?? []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="precipitation" fill="#0EA5E9" radius={[2, 2, 0, 0]} maxBarSize={20} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Country Comparison ──────────────────────────────────────────────────────

function CompareSection() {
  const [countries, setCountries] = useState('Sénégal,Nigeria,Ghana');
  const [crop, setCrop] = useState('Maïs');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['analytics', 'compare', countries, crop],
    queryFn: () => apiClient.get<{
      comparison: Record<string, Array<{ year: number; value: number }>>;
      unit: string;
    }>(
      `/analytics/compare?countries=${encodeURIComponent(countries)}&crop=${encodeURIComponent(crop)}&metric=production`
    ),
  });

  const selectedCountries = countries.split(',');
  const chartData: Array<{ year: string } & Record<string, number>> = [];
  if (data?.comparison) {
    const years = new Set<string>();
    Object.values(data.comparison).forEach((vals) =>
      vals.forEach((v) => years.add(String(v.year)))
    );
    Array.from(years).sort().forEach((year) => {
      const entry: Record<string, string | number> = { year };
      Object.entries(data.comparison).forEach(([country, vals]) => {
        const match = vals.find((v) => String(v.year) === year);
        if (match) entry[country] = match.value;
      });
      chartData.push(entry as { year: string } & Record<string, number>);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground font-medium">Pays (séparés par virgule)</label>
          <Select value={countries} onValueChange={(v) => {
            if (v === 'custom') {
              const val = prompt('Entrez les pays séparés par des virgules (ex: Sénégal,Mali)');
              if (val) setCountries(val);
            } else {
              setCountries(v);
            }
          }}>
            <SelectTrigger className="h-8 w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Sénégal,Nigeria,Ghana">Sénégal, Nigeria, Ghana</SelectItem>
              <SelectItem value="Mali,Burkina Faso,Niger">Mali, Burkina Faso, Niger</SelectItem>
              <SelectItem value="Côte d'Ivoire,Togo,Bénin">Côte d'Ivoire, Togo, Bénin</SelectItem>
              <SelectItem value="Sénégal,Mali,Burkina Faso,Côte d'Ivoire,Nigeria">Afrique de l'Ouest</SelectItem>
              <SelectItem value="custom">Personnalisé...</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground font-medium">Culture</label>
          <Select value={crop} onValueChange={setCrop}>
            <SelectTrigger className="h-8 w-28"><SelectValue /></SelectTrigger>
            <SelectContent>
              {CROPS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="self-end">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Globe className="h-4 w-4 text-blue-500" />
            Comparaison de production — {crop}
          </CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          {isLoading ? (
            <LoadingSkeleton variant="chart" />
          ) : isError ? (
            <ErrorState onRetry={() => refetch()} />
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" />
                <XAxis dataKey="year" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                {selectedCountries.map((c, i) => (
                  <Bar
                    key={c}
                    dataKey={c}
                    fill={CHART_COLORS[i % CHART_COLORS.length]}
                    radius={[3, 3, 0, 0]}
                    maxBarSize={24}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState icon="📊" title="Aucune donnée" description="Sélectionnez des pays pour comparer" />
          )}
        </CardContent>
      </Card>

      {/* Country stat cards */}
      {data?.comparison && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {Object.entries(data.comparison).map(([country, vals]) => {
            const latest = vals[vals.length - 1];
            return (
              <Card key={country} className="border-border/40">
                <CardContent className="p-3 text-center">
                  <p className="text-xs text-muted-foreground">{country}</p>
                  <p className="text-lg font-bold font-mono">{formatNumber(latest?.value ?? 0)}</p>
                  <p className="text-[10px] text-muted-foreground">{data.unit}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Image Upload ─────────────────────────────────────────────────────────────

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
    // Attempt upload - will show proper error since model doesn't support images
    const formData = new FormData();
    formData.append('file', f);
    formData.append('analysis_type', 'general');
    apiClient.upload('/analytics/upload-image', formData)
      .then(() => toast.success('Image envoyée pour analyse'))
      .catch((err: { detail?: string | { message?: string } }) => {
        const msg = typeof err?.detail === 'string' ? err.detail : (err?.detail as { message?: string })?.message || '';
        if (msg.includes('IMAGE_NOT_SUPPORTED') || msg.includes('ne supporte pas les images')) {
          toast.error('Ce modèle ne supporte pas les images. Utilisez l\'assistant IA pour l\'analyse visuelle.', { duration: 6000 });
        }
        setPreview(null);
      });
  }, []);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-pink-500" />
          Analyse visuelle par IA
          <Badge variant="outline" className="text-[10px]">Bientôt</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          onClick={() => fileInputRef.current?.click()}
          className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/20 p-8 text-center transition-colors hover:border-primary/50 hover:bg-primary/5"
        >
          <Upload className="mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium">Cliquez pour uploader une image</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Graphiques, cartes, documents agricoles
          </p>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

        {preview && (
          <div className="relative rounded-lg overflow-hidden border border-border">
            <Image src={preview} alt="Aperçu" width={400} height={192} className="max-h-48 w-full object-contain bg-muted/20" />
            <Button
              variant="ghost" size="icon-sm"
              className="absolute top-1 right-1 bg-background/80 backdrop-blur-sm"
              onClick={() => { setPreview(null); }}
            >
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
            Le modèle d&apos;analyse actuel ne supporte pas les images. Veuillez utiliser les données
            numériques disponibles ci-dessus. Pour l&apos;analyse d&apos;images, utilisez l&apos;assistant IA.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function AnalyticsOverview() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="gap-1.5">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Vue d&apos;ensemble</span>
          </TabsTrigger>
          <TabsTrigger value="production" className="gap-1.5">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Production</span>
          </TabsTrigger>
          <TabsTrigger value="prices" className="gap-1.5">
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Prix</span>
          </TabsTrigger>
          <TabsTrigger value="weather" className="gap-1.5">
            <CloudSun className="h-4 w-4" />
            <span className="hidden sm:inline">Météo</span>
          </TabsTrigger>
          <TabsTrigger value="compare" className="gap-1.5">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">Comparaison</span>
          </TabsTrigger>
        </TabsList>

        <div className="mt-4">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div key="overview" {...fadeUp}>
                <TabsContent value="overview"><OverviewSection /></TabsContent>
              </motion.div>
            )}
            {activeTab === 'production' && (
              <motion.div key="production" {...fadeUp}>
                <TabsContent value="production"><ProductionTrendsSection /></TabsContent>
              </motion.div>
            )}
            {activeTab === 'prices' && (
              <motion.div key="prices" {...fadeUp}>
                <TabsContent value="prices"><PriceTrendsSection /></TabsContent>
              </motion.div>
            )}
            {activeTab === 'weather' && (
              <motion.div key="weather" {...fadeUp}>
                <TabsContent value="weather"><WeatherSection /></TabsContent>
              </motion.div>
            )}
            {activeTab === 'compare' && (
              <motion.div key="compare" {...fadeUp}>
                <TabsContent value="compare"><CompareSection /></TabsContent>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Tabs>

      <Separator />

      <ImageUploadSection />
    </div>
  );
}
