'use client';

import { useState } from 'react';
import {
  TrendingUp, TrendingDown, RefreshCw,
  AlertTriangle, CheckCircle2, DollarSign, Store, BarChart3,
} from 'lucide-react';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { cn, formatNumber, formatCurrency } from '@/lib/utils';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ComparePoint {
  date: string;
  [marketKey: string]: string | number;
}

interface CompareData {
  product: string;
  unit: string;
  currency: string;
  markets: string[];
  data: ComparePoint[];
  summary: {
    market: string;
    avg_price: number;
    min_price: number;
    max_price: number;
    trend: number;
  }[];
  spread: {
    max_gap: number;
    pct_gap: number;
    threshold_exceeded: boolean;
    threshold: number;
  };
  recommendation?: {
    best_market: string;
    premium: number;
    reason: string;
  };
}

const MARKETS = [
  { value: 'dakar', label: 'Dakar (Sénégal)' },
  { value: 'abidjan', label: 'Abidjan (Côte d\'Ivoire)' },
  { value: 'lagos', label: 'Lagos (Nigeria)' },
  { value: 'accra', label: 'Accra (Ghana)' },
  { value: 'douala', label: 'Douala (Cameroun)' },
  { value: 'bamako', label: 'Bamako (Mali)' },
  { value: 'ouagadougou', label: 'Ouagadougou (Burkina Faso)' },
  { value: 'lome', label: 'Lomé (Togo)' },
  { value: 'cotonou', label: 'Cotonou (Bénin)' },
  { value: 'nairobi', label: 'Nairobi (Kenya)' },
];

const MARKET_COLORS = [
  '#22C55E', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16',
];

// ─── Components ───────────────────────────────────────────────────────────────

function SummaryCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType; label: string; value: string; color: string;
}) {
  return (
    <Card className="border-border/40">
      <CardContent className="p-4 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: `${color}18` }}>
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-bold font-mono truncate">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function SpreadAlert({ spread }: { spread: CompareData['spread'] }) {
  return (
    <Card className={cn(
      'border-2 transition-all',
      spread.threshold_exceeded
        ? 'border-red-500/50 bg-red-500/5'
        : 'border-green-500/30 bg-green-500/5',
    )}>
      <CardContent className="p-4 flex items-start gap-3">
        {spread.threshold_exceeded ? (
          <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
        ) : (
          <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
        )}
        <div>
          <p className="text-sm font-semibold">
            {spread.threshold_exceeded
              ? 'Écart de prix important détecté'
              : 'Écart de prix dans la norme'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Écart maximum : {formatNumber(spread.max_gap)} ({spread.pct_gap.toFixed(1)}%) —
            Seuil : {spread.threshold}%
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function RecommendationBox({ recommendation, currency }: {
  recommendation: CompareData['recommendation']; currency: string;
}) {
  if (!recommendation) return null;
  return (
    <Card className="border-emerald-500/40 bg-emerald-500/5 border-2">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20">
            <Store className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              Meilleur marché pour vendre
            </p>
            <p className="text-lg font-bold mt-1">{recommendation.best_market}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Prime estimée : <span className="font-semibold text-emerald-500">{formatCurrency(recommendation.premium, currency as never)}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{recommendation.reason}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: {
  active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-card p-3 shadow-lg text-xs">
      <p className="font-semibold mb-2">{label}</p>
      <div className="space-y-1">
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-mono font-semibold">{formatNumber(entry.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MarketsComparePage() {
  const [product, setProduct] = useState('maize');
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>(['dakar', 'abidjan']);

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['markets', 'compare', product, selectedMarkets],
    queryFn: () =>
      apiClient.get<CompareData>('/market-prices/compare', {
        params: {
          product,
          markets: selectedMarkets.join(','),
          period: '90d',
        },
      }),
    enabled: selectedMarkets.length >= 2,
  });

  const toggleMarket = (market: string) => {
    setSelectedMarkets((prev) =>
      prev.includes(market)
        ? prev.filter((m) => m !== market)
        : prev.length < 6 ? [...prev, market] : prev,
    );
  };

  return (
    <PageWrapper
      title={
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-sm">
            <BarChart3 className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold">Comparateur de Marchés</span>
              {data && (
                <Badge variant="secondary" className="text-[10px] font-mono h-5 px-1.5">
                  {data.markets.length} marchés
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Comparez les prix entre différents marchés agricoles
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
            <span className="text-xs text-muted-foreground font-medium">Produit</span>
            <Select value={product} onValueChange={setProduct}>
              <SelectTrigger className="w-[160px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="maize">Maïs</SelectItem>
                <SelectItem value="rice">Riz</SelectItem>
                <SelectItem value="millet">Millet</SelectItem>
                <SelectItem value="sorghum">Sorgho</SelectItem>
                <SelectItem value="cassava">Manioc</SelectItem>
                <SelectItem value="groundnut">Arachide</SelectItem>
                <SelectItem value="tomato">Tomate</SelectItem>
                <SelectItem value="onion">Oignon</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-muted-foreground font-medium mr-1">Marchés :</span>
              {MARKETS.map((m) => {
                const isSelected = selectedMarkets.includes(m.value);
                const colorIdx = selectedMarkets.indexOf(m.value);
                return (
                  <button
                    key={m.value}
                    onClick={() => toggleMarket(m.value)}
                    className={cn(
                      'text-[11px] px-2 py-1 rounded-full border transition-all',
                      isSelected
                        ? 'border-primary/40 bg-primary/10 text-primary font-medium'
                        : 'border-border/40 text-muted-foreground hover:border-border',
                    )}
                    style={isSelected ? { borderColor: MARKET_COLORS[colorIdx % MARKET_COLORS.length] } : undefined}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          </div>
        ) : isError ? (
          <EmptyState
            icon="📊"
            title="Erreur de chargement"
            description="Impossible de charger les données de comparaison."
            action={{ label: 'Réessayer', onClick: () => refetch() }}
          />
        ) : !data ? (
          <EmptyState
            icon="📊"
            title="Sélectionnez des marchés"
            description="Choisissez au moins deux marchés pour comparer les prix."
          />
        ) : (
          <>
            {/* Recommendation */}
            {data.recommendation && (
              <RecommendationBox recommendation={data.recommendation} currency={data.currency} />
            )}

            {/* Spread Alert */}
            <SpreadAlert spread={data.spread} />

            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {data.summary.map((s, i) => (
                <SummaryCard
                  key={s.market}
                  icon={DollarSign}
                  label={s.market}
                  value={`${formatNumber(s.avg_price)} ${data.unit}`}
                  color={MARKET_COLORS[i % MARKET_COLORS.length]}
                />
              ))}
            </div>

            {/* Chart */}
            <Card className="border-border/40">
              <CardHeader>
                <CardTitle className="text-sm">Évolution des prix — 90 jours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72 sm:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => {
                          const d = new Date(v);
                          return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
                        }}
                      />
                      <YAxis
                        tick={{ fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => formatNumber(v)}
                      />
                      <Tooltip content={<ChartTooltip />} />
                      <Legend
                        wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                      />
                      {data.markets.map((market, i) => (
                        <Line
                          key={market}
                          type="monotone"
                          dataKey={market}
                          stroke={MARKET_COLORS[i % MARKET_COLORS.length]}
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 4 }}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Market comparison table */}
            <Card className="border-border/40">
              <CardHeader>
                <CardTitle className="text-sm">Récapitulatif des marchés</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/20">
                        <th className="text-left px-4 py-3 font-medium text-[11px] text-muted-foreground uppercase tracking-widest">Marché</th>
                        <th className="text-right px-4 py-3 font-medium text-[11px] text-muted-foreground uppercase tracking-widest">Prix moyen</th>
                        <th className="text-right px-4 py-3 font-medium text-[11px] text-muted-foreground uppercase tracking-widest hidden sm:table-cell">Min</th>
                        <th className="text-right px-4 py-3 font-medium text-[11px] text-muted-foreground uppercase tracking-widest hidden sm:table-cell">Max</th>
                        <th className="text-right px-4 py-3 font-medium text-[11px] text-muted-foreground uppercase tracking-widest">Tendance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {data.summary.map((s, i) => (
                        <tr key={s.market} className="hover:bg-muted/10 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: MARKET_COLORS[i % MARKET_COLORS.length] }} />
                              <span className="font-medium">{s.market}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-semibold">{formatNumber(s.avg_price)}</td>
                          <td className="px-4 py-3 text-right font-mono text-muted-foreground hidden sm:table-cell">{formatNumber(s.min_price)}</td>
                          <td className="px-4 py-3 text-right font-mono text-muted-foreground hidden sm:table-cell">{formatNumber(s.max_price)}</td>
                          <td className="px-4 py-3 text-right">
                            <Badge variant={s.trend > 0 ? 'danger' : s.trend < 0 ? 'success' : 'outline'} className="text-[10px] font-mono gap-1">
                              {s.trend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                              {s.trend > 0 ? '+' : ''}{s.trend.toFixed(1)}%
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </PageWrapper>
  );
}
