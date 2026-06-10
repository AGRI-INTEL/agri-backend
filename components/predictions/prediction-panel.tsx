'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, TrendingUp, CloudSun, Wheat, Factory, Bug,
  BarChart3, History, Download, Upload, FlaskConical,
  AlertTriangle, CheckCircle2, Info, ArrowUp, ArrowDown,
  Minus, Trash2, RefreshCw, ImageIcon,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { ErrorState } from '@/components/shared/error-state';
import { EmptyState } from '@/components/shared/empty-state';
import { toast } from 'sonner';
import {
  usePredictYield,
  usePredictPrice,
  usePredictWeather,
  usePredictProduction,
  usePredictDisease,
  useUploadPredictionImage,
  useExportPredictions,
  usePredictionHistory,
} from '@/hooks/use-predictions';
import { formatNumber, formatRelativeDate, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type {
  PredictionResult,
  PredictionSummary,
  YieldPredictionInput,
  PricePredictionInput,
  WeatherPredictionInput,
  ProductionPredictionInput,
} from '@/types/prediction';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Area, AreaChart, BarChart, Bar, Legend,
} from 'recharts';

// ─── Constants ───────────────────────────────────────────────────────────────

const CROPS = [
  { value: 'maïs', label: 'Maïs' }, { value: 'riz', label: 'Riz' },
  { value: 'mil', label: 'Mil' }, { value: 'sorgho', label: 'Sorgho' },
  { value: 'arachide', label: 'Arachide' }, { value: 'manioc', label: 'Manioc' },
  { value: 'igname', label: 'Igname' }, { value: 'coton', label: 'Coton' },
  { value: 'cacao', label: 'Cacao' }, { value: 'café', label: 'Café' },
];

const REGIONS = ['Dakar', 'Thiès', 'Saint-Louis', 'Kaolack', 'Ziguinchor', 'Kolda', 'Tambacounda', 'Diourbel', 'Louga', 'Fatick', 'Kédougou', 'Kaffrine', 'Sédhiou', 'Matam'];

const SOIL_TYPES = [
  { value: 'loamy', label: 'Limoneux' }, { value: 'sandy', label: 'Sableux' },
  { value: 'clay', label: 'Argileux' }, { value: 'laterite', label: 'Latéritique' },
  { value: 'alluvial', label: 'Alluvial' },
];

const HORIZONS = [
  { value: '7d', label: '7 jours' }, { value: '14d', label: '14 jours' },
  { value: '30d', label: '30 jours' }, { value: '90d', label: '3 mois' },
  { value: '1y', label: '1 an' },
];

const PRODUCTS = [
  { value: 'riz', label: 'Riz' }, { value: 'maïs', label: 'Maïs' },
  { value: 'mil', label: 'Mil' }, { value: 'sorgho', label: 'Sorgho' },
  { value: 'arachide', label: 'Arachide' }, { value: 'manioc', label: 'Manioc' },
  { value: 'igname', label: 'Igname' }, { value: 'coton', label: 'Coton' },
  { value: 'cacao', label: 'Cacao' }, { value: 'café', label: 'Café' },
];

// ─── Animations ──────────────────────────────────────────────────────────────

const fadeSlideUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.3 },
};

// ─── Chart config ────────────────────────────────────────────────────────────

const chartColors = {
  primary: 'hsl(var(--primary))',
  primaryLight: 'hsl(var(--primary) / 0.15)',
  up: '#22C55E',
  down: '#DC2626',
  neutral: '#6B7280',
  confidence: '#EAB308',
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string; icon: React.ElementType; color: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-card/50 p-3 backdrop-blur-sm">
      <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', color)}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}

function TrendBadge({ trend, value }: { trend: string; value?: number }) {
  const config: Record<string, { icon: React.ElementType; label: string; color: string }> = {
    up: { icon: ArrowUp, label: 'Hausse', color: 'text-green-600 bg-green-50 border-green-200' },
    down: { icon: ArrowDown, label: 'Baisse', color: 'text-red-600 bg-red-50 border-red-200' },
    stable: { icon: Minus, label: 'Stable', color: 'text-gray-600 bg-gray-50 border-gray-200' },
    volatile: { icon: AlertTriangle, label: 'Volatile', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
  };
  const c = config[trend] || config.stable;
  const Icon = c.icon;
  return (
    <Badge variant="outline" className={cn('gap-1 text-xs font-medium', c.color)}>
      <Icon className="h-3 w-3" />
      {c.label}{value != null ? ` (${value > 0 ? '+' : ''}${value}%)` : ''}
    </Badge>
  );
}

function ConfidenceBar({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const color = pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Confiance</span>
        <span className="font-semibold">{pct}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div className={cn('h-full rounded-full transition-all duration-500', color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function FactorList({ factors }: { factors?: Array<{ name: string; impact: number; direction: string; description: string; category?: string }> }) {
  if (!factors?.length) return null;
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Facteurs clés</p>
      <div className="space-y-1.5">
        {factors.map((f, i) => (
          <div key={i} className="flex items-center gap-2 rounded-lg bg-secondary/30 px-3 py-2 text-sm">
            <div className={cn(
              'h-2 w-2 shrink-0 rounded-full',
              f.direction === 'positive' ? 'bg-green-500' : f.direction === 'negative' ? 'bg-red-500' : 'bg-gray-400'
            )} />
            <span className="font-medium">{f.name}</span>
            <span className="text-muted-foreground">— {f.description}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PredictionChart({ result }: { result: PredictionResult }) {
  const hist = (result.historical_data || []).map((p) => ({ date: p.date, value: p.value, type: 'Historique' }));
  const pred = (result.prediction_data || []).map((p) => ({
    date: p.date,
    value: p.value,
    type: 'Prédiction',
    lower: p.lower_bound,
    upper: p.upper_bound,
  }));
  const data = [...hist, ...pred];

  if (!data.length) return null;

  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="histGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={chartColors.primary} stopOpacity={0.3} />
              <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={chartColors.up} stopOpacity={0.2} />
              <stop offset="95%" stopColor={chartColors.up} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" />
          <XAxis dataKey="date" tick={{ fontSize: 10 }} className="text-muted-foreground" />
          <YAxis tick={{ fontSize: 10 }} className="text-muted-foreground" />
          <Tooltip
            contentStyle={{
              background: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: '12px',
            }}
          />
          {pred.length > 0 && pred[0].lower != null && (
            <Area type="monotone" dataKey="upper" stroke="none" fill={chartColors.up} fillOpacity={0.08} />
          )}
          {pred.length > 0 && pred[0].lower != null && (
            <Area type="monotone" dataKey="lower" stroke="none" fill="white" fillOpacity={0.01} />
          )}
          <Area type="monotone" dataKey="value" stroke={chartColors.primary} strokeWidth={2} fill="url(#histGrad)" dot={false} />
          <Area
            type="monotone"
            dataKey="value"
            stroke={chartColors.up}
            strokeWidth={2}
            fill="url(#predGrad)"
            dot={false}
            data={data.filter((d) => d.type === 'Prédiction')}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between border-b border-border/30 py-1.5 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function ResultCard({ result, onClear }: { result: PredictionResult; onClear?: () => void }) {
  const value = result.value ?? 0;
  const unit = result.unit ?? '';
  const confidence = result.confidence_score ?? 0;
  const trend = result.trend ?? 'stable';
  const trendPct = result.trend_percent;

  return (
    <motion.div {...fadeSlideUp}>
      <Card className="border-primary/20 shadow-sm">
        <CardHeader className="pb-3 flex flex-row items-start justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              Résultat de la prédiction
            </CardTitle>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-bold text-primary font-mono">
                {typeof value === 'number' ? formatNumber(value) : value}
              </span>
              <span className="text-sm text-muted-foreground">{unit}</span>
            </div>
          </div>
          {onClear && (
            <Button variant="ghost" size="icon-sm" onClick={onClear}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <TrendBadge trend={trend} value={trendPct} />
            <Badge variant="secondary" className="text-xs">
              Modèle: {result.model ?? 'ensemble'}
            </Badge>
            {result.computation_time_ms && (
              <Badge variant="outline" className="text-xs">
                {result.computation_time_ms}ms
              </Badge>
            )}
          </div>

          <ConfidenceBar score={confidence} />

          {(result.historical_data?.length || result.prediction_data?.length) && (
            <div className="rounded-lg border border-border/50 bg-card/30 p-3">
              <PredictionChart result={result} />
            </div>
          )}

          <FactorList factors={result.key_factors} />

          {(result.model_accuracy || result.model_version) && (
            <>
              <Separator />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {result.model_accuracy?.mape != null && (
                  <div className="rounded-lg bg-secondary/30 p-2 text-center">
                    <p className="text-muted-foreground">MAPE</p>
                    <p className="font-semibold">{result.model_accuracy.mape}%</p>
                  </div>
                )}
                {result.model_accuracy?.r2 != null && (
                  <div className="rounded-lg bg-secondary/30 p-2 text-center">
                    <p className="text-muted-foreground">R²</p>
                    <p className="font-semibold">{result.model_accuracy.r2}</p>
                  </div>
                )}
                <div className="rounded-lg bg-secondary/30 p-2 text-center">
                  <p className="text-muted-foreground">Version</p>
                  <p className="font-semibold">{result.model_version ?? '—'}</p>
                </div>
                <div className="rounded-lg bg-secondary/30 p-2 text-center">
                  <p className="text-muted-foreground">Intervalle</p>
                  <p className="font-semibold">
                    [{result.confidence_interval?.[0]?.toFixed(1) ?? '—'}, {result.confidence_interval?.[1]?.toFixed(1) ?? '—'}]
                  </p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function DiseaseResultCard({
  result,
  onClear,
}: {
  result: PredictionResult & { risk_level?: string; recommendations?: string[] };
  onClear?: () => void;
}) {
  const risk = result.risk_level ?? 'low';
  const riskColor = risk === 'high' ? 'text-red-600' : risk === 'medium' ? 'text-yellow-600' : 'text-green-600';
  const riskBg = risk === 'high' ? 'bg-red-50 border-red-200' : risk === 'medium' ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200';
  const riskIcon = risk === 'high' ? AlertTriangle : risk === 'medium' ? Info : CheckCircle2;

  return (
    <motion.div {...fadeSlideUp}>
      <Card className="border-primary/20 shadow-sm">
        <CardHeader className="pb-3 flex flex-row items-start justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              Analyse de risque
            </CardTitle>
            <div className={cn('mt-2 inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-semibold', riskBg, riskColor)}>
              {risk === 'high' ? <AlertTriangle className="h-4 w-4" /> : risk === 'medium' ? <Info className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
              Risque {risk === 'high' ? 'élevé' : risk === 'medium' ? 'modéré' : 'faible'} — {result.value?.toFixed(0) ?? '?'}%
            </div>
          </div>
          {onClear && (
            <Button variant="ghost" size="icon-sm" onClick={onClear}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <ConfidenceBar score={result.confidence_score ?? 0} />

          {result.prediction_data?.length ? (
            <div className="rounded-lg border border-border/50 bg-card/30 p-3">
              <p className="text-xs font-medium text-muted-foreground mb-2">Évolution du risque</p>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={result.prediction_data}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#DC2626" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : null}

          {result.recommendations?.length ? (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Recommandations</p>
              <div className="space-y-1.5">
                {result.recommendations.map((r, i) => (
                  <div key={i} className="flex items-start gap-2 rounded-lg bg-blue-50/50 px-3 py-2 text-sm dark:bg-blue-950/20">
                    <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-500" />
                    <span>{r}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <FactorList factors={result.key_factors} />
        </CardContent>
      </Card>
    </motion.div>
  );
}

function WeatherForecastCard({ forecast }: { forecast?: Array<{ date: string; temperature_min: number; temperature_max: number; precipitation_mm: number; humidity_percent: number; condition: string; confidence: number }> }) {
  if (!forecast?.length) return null;
  return (
    <Card className="mt-4 border-blue-200/50 dark:border-blue-800/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <CloudSun className="h-4 w-4 text-blue-500" />
          Prévisions sur {forecast.length} jours
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="flex gap-3 min-w-max pb-1">
            {forecast.map((d, i) => (
              <div key={i} className="flex w-28 flex-col items-center gap-1.5 rounded-xl border border-border/50 bg-card/30 p-3 text-center">
                <span className="text-xs font-medium text-muted-foreground">
                  {formatDate(d.date, 'EEE dd/MM')}
                </span>
                <span className="text-lg font-bold">
                  {Math.round((d.temperature_min + d.temperature_max) / 2)}°
                </span>
                <span className="text-[10px] text-muted-foreground leading-tight">{d.condition}</span>
                <div className="flex w-full justify-between text-[10px] text-muted-foreground">
                  <span>↓{d.temperature_min}°</span>
                  <span>↑{d.temperature_max}°</span>
                </div>
                <div className="w-full bg-blue-100 dark:bg-blue-900/30 rounded-full h-1.5">
                  <div
                    className="h-full rounded-full bg-blue-500"
                    style={{ width: `${Math.min(100, d.precipitation_mm * 5)}%` }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground">{d.precipitation_mm}mm</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Yield Tab ───────────────────────────────────────────────────────────────

function YieldTab() {
  const [crop, setCrop] = useState('maïs');
  const [region, setRegion] = useState('Dakar');
  const [areaHa, setAreaHa] = useState(10);
  const [irrigation, setIrrigation] = useState(false);
  const [soilType, setSoilType] = useState('loamy');
  const [result, setResult] = useState<PredictionResult | null>(null);

  const predict = usePredictYield();

  const handleSubmit = () => {
    predict.mutate(
      {
        crop,
        region,
        area_ha: areaHa,
        date: new Date().toISOString().slice(0, 10),
        country: 'SN' as const,
        irrigation,
        soil_type: soilType as YieldPredictionInput['soil_type'],
      },
      { onSuccess: setResult }
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Wheat className="h-5 w-5 text-green-500" />
            Paramètres de la culture
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Culture</label>
              <Select value={crop} onValueChange={setCrop}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CROPS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Région</label>
              <Select value={region} onValueChange={setRegion}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {REGIONS.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Type de sol</label>
              <Select value={soilType} onValueChange={setSoilType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SOIL_TYPES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Surface (hectares)</label>
              <div className="flex items-center gap-3">
                <Slider
                  value={[areaHa]}
                  onValueChange={([v]) => setAreaHa(v)}
                  min={1}
                  max={500}
                  step={1}
                  className="flex-1"
                />
                <span className="w-14 text-right text-sm font-mono font-medium">{areaHa}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={irrigation} onCheckedChange={setIrrigation} id="irrigation" />
            <label htmlFor="irrigation" className="text-sm cursor-pointer">Irrigation</label>
          </div>
          <Button
            loading={predict.isPending}
            onClick={handleSubmit}
            className="w-full gap-2"
            size="lg"
          >
            <Brain className="h-5 w-5" />
            Lancer la prédiction de rendement
          </Button>
        </CardContent>
      </Card>
      <AnimatePresence>
        {result && <ResultCard result={result} onClear={() => setResult(null)} />}
      </AnimatePresence>
    </div>
  );
}

// ─── Price Tab ───────────────────────────────────────────────────────────────

function PriceTab() {
  const [product, setProduct] = useState('riz');
  const [market, setMarket] = useState('Dakar');
  const [period, setPeriod] = useState('30d');
  const [result, setResult] = useState<PredictionResult | null>(null);

  const predict = usePredictPrice();

  const handleSubmit = () => {
    predict.mutate(
      { product, market, period: period as PricePredictionInput['period'], country: 'SN' as const },
      { onSuccess: setResult }
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-amber-500" />
            Paramètres du marché
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Produit</label>
              <Select value={product} onValueChange={setProduct}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PRODUCTS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Marché</label>
              <Select value={market} onValueChange={setMarket}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {REGIONS.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Horizon</label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {HORIZONS.map((h) => (
                    <SelectItem key={h.value} value={h.value}>{h.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            loading={predict.isPending}
            onClick={handleSubmit}
            className="w-full gap-2"
            size="lg"
          >
            <Brain className="h-5 w-5" />
            Prédire le prix
          </Button>
        </CardContent>
      </Card>
      <AnimatePresence>
        {result && <ResultCard result={result} onClear={() => setResult(null)} />}
      </AnimatePresence>
    </div>
  );
}

// ─── Weather Tab ─────────────────────────────────────────────────────────────

function WeatherTab() {
  const [city, setCity] = useState('Dakar');
  const [horizon, setHorizon] = useState('7d');
  const [result, setResult] = useState<(PredictionResult & { forecast?: unknown[] }) | null>(null);

  const predict = usePredictWeather();

  const handleSubmit = () => {
    predict.mutate(
      { city, horizon: horizon as WeatherPredictionInput['horizon'], country: 'SN' as const, latitude: 14.69, longitude: -17.44 },
      { onSuccess: setResult }
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CloudSun className="h-5 w-5 text-blue-500" />
            Paramètres météo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Ville</label>
              <Input
                placeholder="Dakar"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Horizon</label>
              <Select value={horizon} onValueChange={setHorizon}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {HORIZONS.map((h) => (
                    <SelectItem key={h.value} value={h.value}>{h.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            loading={predict.isPending}
            onClick={handleSubmit}
            className="w-full gap-2"
            size="lg"
          >
            <CloudSun className="h-5 w-5" />
            Analyser la météo
          </Button>
        </CardContent>
      </Card>
      <AnimatePresence>
        {result && (
          <motion.div {...fadeSlideUp}>
            <ResultCard result={result} onClear={() => setResult(null)} />
            <WeatherForecastCard forecast={result.forecast as any} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Production Tab ──────────────────────────────────────────────────────────

function ProductionTab() {
  const [product, setProduct] = useState('maïs');
  const [region, setRegion] = useState('Dakar');
  const [areaHa, setAreaHa] = useState(100);
  const [horizon, setHorizon] = useState('1y');
  const [result, setResult] = useState<PredictionResult | null>(null);

  const predict = usePredictProduction();

  const handleSubmit = () => {
    predict.mutate(
      { product, region, country: 'SN' as const, horizon: horizon as ProductionPredictionInput['horizon'], total_area_ha: areaHa },
      { onSuccess: setResult }
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Factory className="h-5 w-5 text-purple-500" />
            Paramètres de production
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Produit</label>
              <Select value={product} onValueChange={setProduct}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CROPS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Région</label>
              <Select value={region} onValueChange={setRegion}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {REGIONS.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Horizon</label>
              <Select value={horizon} onValueChange={setHorizon}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {HORIZONS.map((h) => (
                    <SelectItem key={h.value} value={h.value}>{h.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Surface totale ({areaHa} ha)
              </label>
              <Slider
                value={[areaHa]}
                onValueChange={([v]) => setAreaHa(v)}
                min={1}
                max={10000}
                step={10}
              />
            </div>
          </div>
          <Button
            loading={predict.isPending}
            onClick={handleSubmit}
            className="w-full gap-2"
            size="lg"
          >
            <BarChart3 className="h-5 w-5" />
            Prédire la production
          </Button>
        </CardContent>
      </Card>
      <AnimatePresence>
        {result && <ResultCard result={result} onClear={() => setResult(null)} />}
      </AnimatePresence>
    </div>
  );
}

// ─── Disease Tab ─────────────────────────────────────────────────────────────

function DiseaseTab() {
  const [crop, setCrop] = useState('maïs');
  const [region, setRegion] = useState('Dakar');
  const [temperature, setTemperature] = useState(28);
  const [humidity, setHumidity] = useState(75);
  const [rainfall, setRainfall] = useState(50);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [result, setResult] = useState<(PredictionResult & { risk_level?: string; recommendations?: string[] }) | null>(null);

  const predict = usePredictDisease();
  const uploadImage = useUploadPredictionImage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setShowImagePreview(true);

    // Try the image upload - will show proper error since model doesn't support images
    uploadImage.mutate(
      { file, crop, region },
      {
        onSuccess: (data) => {
          toast.success(data.message || 'Image envoyée pour analyse');
        },
        onError: () => {
          // Error is handled by the hook's handleError which shows the cannot-read-image message
          setImageFile(null);
          setImagePreview(null);
          setShowImagePreview(false);
        },
      }
    );
  }, [crop, region, uploadImage]);

  const handleTextPredict = () => {
    predict.mutate(
      { crop, region, country: 'SN', temperature, humidity, rainfall_7d: rainfall },
      {
        onSuccess: (data) => setResult(data),
      }
    );
  };

  return (
    <div className="space-y-4">
      {/* Image Upload */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-pink-500" />
            Analyse par image
            <Badge variant="outline" className="text-[10px] text-muted-foreground ml-1">
              Bientôt disponible
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/20 p-8 text-center transition-colors hover:border-primary/50 hover:bg-primary/5"
            >
              <Upload className="mb-3 h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium">Cliquez pour uploader une image</p>
              <p className="mt-1 text-xs text-muted-foreground">
                PNG, JPG ou WEBP (analyse visuelle des maladies)
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />

            {imagePreview && showImagePreview && (
              <div className="relative rounded-lg overflow-hidden border border-border">
                <img src={imagePreview} alt="Preview" className="max-h-48 w-full object-contain" />
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="absolute top-1 right-1 bg-background/80 backdrop-blur-sm"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                    setShowImagePreview(false);
                  }}
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
                Le modèle de prédiction actuel ne supporte pas l&apos;analyse d&apos;images. 
                Veuillez utiliser les paramètres climatiques ci-dessous pour l&apos;évaluation des risques.
                Pour l&apos;analyse visuelle, utilisez l&apos;assistant IA.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Numerical Parameters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-red-500" />
            Paramètres climatiques
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Culture</label>
              <Select value={crop} onValueChange={setCrop}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CROPS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Région</label>
              <Select value={region} onValueChange={setRegion}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {REGIONS.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Température ({temperature}°C)
              </label>
              <Slider
                value={[temperature]}
                onValueChange={([v]) => setTemperature(v)}
                min={15}
                max={45}
                step={0.5}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Humidité ({humidity}%)
              </label>
              <Slider
                value={[humidity]}
                onValueChange={([v]) => setHumidity(v)}
                min={20}
                max={100}
                step={1}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-xs font-medium text-muted-foreground">
                Précipitations 7 jours ({rainfall} mm)
              </label>
              <Slider
                value={[rainfall]}
                onValueChange={([v]) => setRainfall(v)}
                min={0}
                max={300}
                step={5}
              />
            </div>
          </div>
          <Button
            loading={predict.isPending}
            onClick={handleTextPredict}
            className="w-full gap-2"
            size="lg"
            variant="destructive"
          >
            <Bug className="h-5 w-5" />
            Analyser le risque
          </Button>
        </CardContent>
      </Card>

      <AnimatePresence>
        {result && (
          <DiseaseResultCard result={result} onClear={() => setResult(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── History Panel ───────────────────────────────────────────────────────────

interface BackendHistoryItem {
  id: string; type: string; label: string; input_summary: string;
  predicted_value: number; unit: string; confidence: number;
  has_actual?: boolean; actual_value?: number; user_feedback?: string;
  created_at: string;
}

function HistoryPanel() {
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);
  const { data, isLoading, isError, refetch } = usePredictionHistory(typeFilter);
  const exportMutation = useExportPredictions();

  const raw = data as unknown as { history?: BackendHistoryItem[]; count?: number } | undefined;
  const history: BackendHistoryItem[] = raw?.history ?? [];

  const handleExport = () => {
    const ids = history.map((h: BackendHistoryItem) => h.id);
    if (!ids.length) {
      toast.error('Aucune prédiction à exporter');
      return;
    }
    exportMutation.mutate(ids, {
      onSuccess: (res: { data?: string; format?: string }) => {
        if (res.data) {
          const blob = new Blob([res.data], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `predictions_export.${res.format || 'csv'}`;
          a.click();
          URL.revokeObjectURL(url);
          toast.success('Export terminé');
        }
      },
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
          <History className="h-5 w-5" />
          Historique des prédictions
          {data && (
            <span className="text-xs font-normal text-muted-foreground">
              ({(data as { count?: number }).count ?? history.length})
            </span>
          )}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Select value={typeFilter || 'all'} onValueChange={(v) => setTypeFilter(v === 'all' ? undefined : v)}>
            <SelectTrigger className="h-8 w-32 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              <SelectItem value="yield">Rendement</SelectItem>
              <SelectItem value="price">Prix</SelectItem>
              <SelectItem value="weather">Météo</SelectItem>
              <SelectItem value="production">Production</SelectItem>
              <SelectItem value="disease">Maladie</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} loading={exportMutation.isPending}>
            <Download className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingSkeleton variant="list" count={5} />
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : !history.length ? (
          <EmptyState
            icon="📊"
            title="Aucune prédiction"
            description="Lancez votre première prédiction pour voir l'historique apparaître ici"
          />
        ) : (
          <div className="space-y-1">
            {history.map((h: BackendHistoryItem, i: number) => {
              const typeColors: Record<string, string> = {
                yield: 'text-green-500 bg-green-50 dark:bg-green-950/20',
                price: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20',
                weather: 'text-blue-500 bg-blue-50 dark:bg-blue-950/20',
                production: 'text-purple-500 bg-purple-50 dark:bg-purple-950/20',
                disease: 'text-red-500 bg-red-50 dark:bg-red-950/20',
              };
              const typeLabels: Record<string, string> = {
                yield: 'Rendement', price: 'Prix', weather: 'Météo',
                production: 'Production', disease: 'Maladie',
              };
              return (
                <div
                  key={h.id}
                  className="flex items-center gap-3 rounded-lg border border-border/30 p-3 transition-all duration-300 hover:bg-muted/30"
                  style={{ opacity: 0, animation: `fadeIn 0.3s ease ${i * 0.03}s forwards` }}
                >
                  <div className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold',
                    typeColors[h.type] || 'bg-gray-100 text-gray-500'
                  )}>
                    {h.type === 'yield' ? 'R' : h.type === 'price' ? 'P' : h.type === 'weather' ? 'M' : h.type === 'production' ? 'P' : 'D'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{h.input_summary || h.label}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{typeLabels[h.type] || h.type}</span>
                      <span>•</span>
                      <span>{h.predicted_value} {h.unit}</span>
                      {h.confidence != null && (
                        <>
                          <span>•</span>
                          <span>{Math.round((h.confidence ?? 0) * 100)}% confiance</span>
                        </>
                      )}
                      {h.user_feedback && (
                        <>
                          <span>•</span>
                          <span className={cn(
                            h.user_feedback === 'accurate' ? 'text-green-600' : 'text-amber-600'
                          )}>
                            {h.user_feedback === 'accurate' ? '✓ Exact' : h.user_feedback === 'underestimated' ? '↓ Sous-estimé' : '↑ Sur-estimé'}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatRelativeDate(h.created_at)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Stats Overview ──────────────────────────────────────────────────────────

function StatsOverview() {
  const { data } = usePredictionHistory();
  const raw = data as unknown as { history?: BackendHistoryItem[] } | undefined;
  const history: BackendHistoryItem[] = raw?.history ?? [];

  const total = history.length;
  const avgConfidence = history.length
    ? history.reduce((s: number, h: BackendHistoryItem) => s + (h.confidence ?? 0), 0) / history.length
    : 0;
  const accurate = history.filter((h: BackendHistoryItem) => h.user_feedback === 'accurate').length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <StatCard
        label="Prédictions"
        value={String(total)}
        icon={Brain}
        color="bg-gradient-to-br from-primary to-primary-700"
      />
      <StatCard
        label="Confiance moy."
        value={total ? `${Math.round(avgConfidence * 100)}%` : '—'}
        icon={BarChart3}
        color="bg-gradient-to-br from-blue-500 to-blue-600"
      />
      <StatCard
        label="Précises"
        value={total ? `${Math.round((accurate / total) * 100)}%` : '—'}
        icon={CheckCircle2}
        color="bg-gradient-to-br from-green-500 to-green-600"
      />
      <StatCard
        label="Types"
        value={`${new Set(history.map((h: BackendHistoryItem) => h.type)).size}/5`}
        icon={BarChart3}
        color="bg-gradient-to-br from-purple-500 to-purple-600"
      />
    </div>
  );
}

// ─── Main Panel ──────────────────────────────────────────────────────────────

export function PredictionPanel() {
  const [activeTab, setActiveTab] = useState('yield');

  return (
    <div className="space-y-6">
      {/* Stats overview */}
      <StatsOverview />

      {/* Main content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="yield" className="gap-1.5">
            <Wheat className="h-4 w-4" />
            <span className="hidden sm:inline">Rendement</span>
          </TabsTrigger>
          <TabsTrigger value="price" className="gap-1.5">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Prix</span>
          </TabsTrigger>
          <TabsTrigger value="weather" className="gap-1.5">
            <CloudSun className="h-4 w-4" />
            <span className="hidden sm:inline">Météo</span>
          </TabsTrigger>
          <TabsTrigger value="production" className="gap-1.5">
            <Factory className="h-4 w-4" />
            <span className="hidden sm:inline">Production</span>
          </TabsTrigger>
          <TabsTrigger value="disease" className="gap-1.5">
            <Bug className="h-4 w-4" />
            <span className="hidden sm:inline">Maladies</span>
          </TabsTrigger>
        </TabsList>

        <div className="mt-4">
          <AnimatePresence mode="wait">
            {activeTab === 'yield' && (
              <motion.div key="yield" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                <TabsContent value="yield"><YieldTab /></TabsContent>
              </motion.div>
            )}
            {activeTab === 'price' && (
              <motion.div key="price" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                <TabsContent value="price"><PriceTab /></TabsContent>
              </motion.div>
            )}
            {activeTab === 'weather' && (
              <motion.div key="weather" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                <TabsContent value="weather"><WeatherTab /></TabsContent>
              </motion.div>
            )}
            {activeTab === 'production' && (
              <motion.div key="production" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                <TabsContent value="production"><ProductionTab /></TabsContent>
              </motion.div>
            )}
            {activeTab === 'disease' && (
              <motion.div key="disease" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                <TabsContent value="disease"><DiseaseTab /></TabsContent>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Tabs>

      {/* History */}
      <HistoryPanel />
    </div>
  );
}
