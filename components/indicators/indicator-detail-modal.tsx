'use client';

import { useState } from 'react';
import {
  TrendingUp, TrendingDown, Minus, X, Calendar, MapPin,
  BarChart3, AlertTriangle, CheckCircle2, Info, Download, Trash2,
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn, formatNumber } from '@/lib/utils';
import { useDeleteIndicator } from '@/hooks/use-indicators';
import { toast } from 'sonner';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import type { IndicatorDataRow } from './indicator-card';

const CATEGORY_LABELS: Record<string, string> = {
  comptes_exploitation: 'Compte exploitation', revenus: 'Revenus',
  pauvrete: 'Pauvreté', nutrition: 'Nutrition', sante: 'Santé',
  bien_etre: 'Bien-être', rendement: 'Rendement', prix: 'Prix',
  production: 'Production', marche: 'Marché', emploi: 'Emploi',
  climat: 'Climat', environnement: 'Environnement',
};

const SECTOR_LABELS: Record<string, string> = {
  vegetal: 'Végétal', animal: 'Animal', halieutique: 'Halieutique', forestier: 'Forestier',
};

const HEALTH_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  optimal: { label: 'Optimal', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950/20', icon: CheckCircle2 },
  alert: { label: 'Surveillance', color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-950/20', icon: Info },
  critical: { label: 'Critique', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950/20', icon: AlertTriangle },
};

function TrendIcon({ trend, percent }: { trend: string; percent?: number }) {
  const Icon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const color = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-muted-foreground';
  return (
    <span className={cn('inline-flex items-center gap-1 text-sm font-medium', color)}>
      <Icon className="h-4 w-4" />
      {trend === 'up' ? 'Hausse' : trend === 'down' ? 'Baisse' : 'Stable'}
      {percent != null && ` (${percent > 0 ? '+' : ''}${percent}%)`}
    </span>
  );
}

export function IndicatorDetailModal({
  indicator, open, onOpenChange,
}: {
  indicator: IndicatorDataRow | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const deleteMutation = useDeleteIndicator();
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');
  const [isDeleting, setIsDeleting] = useState(false);

  if (!indicator) return null;

  const healthConfig = HEALTH_CONFIG[indicator.health_status || ''] || HEALTH_CONFIG.alert;
  const HealthIcon = healthConfig.icon;

  const handleDelete = async () => {
    if (!confirm('Supprimer cet indicateur ?')) return;
    setIsDeleting(true);
    try {
      await deleteMutation.mutateAsync(indicator.id);
      toast.success('Indicateur supprimé');
      onOpenChange(false);
    } catch {
      toast.error('Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
    }
  };

  const historyData = indicator.history?.map((h) => ({
    date: h.date.slice(0, 7),
    value: h.value,
  })) ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs">
                  {CATEGORY_LABELS[indicator.category] || indicator.category}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {SECTOR_LABELS[indicator.sector] || indicator.sector}
                </Badge>
                <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold', healthConfig.bg, healthConfig.color)}>
                  <HealthIcon className="h-3 w-3" />
                  {healthConfig.label}
                </span>
              </div>
              <DialogTitle className="text-xl">{indicator.name}</DialogTitle>
              {indicator.description && (
                <p className="text-sm text-muted-foreground">{indicator.description}</p>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={handleDelete} disabled={isDeleting}>
                <Trash2 className="h-4 w-4" />
              </Button>
              <DialogClose asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </DialogClose>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Key metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border bg-card p-3">
              <p className="text-xs text-muted-foreground mb-1">Valeur actuelle</p>
              <p className="text-2xl font-bold font-mono">{formatNumber(indicator.value)}</p>
              <p className="text-xs text-muted-foreground">{indicator.unit}</p>
            </div>
            <div className="rounded-xl border bg-card p-3">
              <p className="text-xs text-muted-foreground mb-1">Tendance</p>
              <TrendIcon trend={indicator.trend} percent={indicator.trend_percent} />
            </div>
            <div className="rounded-xl border bg-card p-3">
              <p className="text-xs text-muted-foreground mb-1">Pays</p>
              <p className="text-sm font-medium flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                {indicator.country || 'N/A'}
              </p>
            </div>
            <div className="rounded-xl border bg-card p-3">
              <p className="text-xs text-muted-foreground mb-1">Année</p>
              <p className="text-sm font-medium flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                {indicator.year || 'N/A'}
              </p>
            </div>
          </div>

          {/* History chart */}
          {historyData.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold flex items-center gap-1.5">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Évolution historique
                </h3>
                <div className="flex items-center gap-1">
                  <Button
                    variant={chartType === 'area' ? 'default' : 'outline'}
                    size="sm"
                    className="h-7 text-xs px-2"
                    onClick={() => setChartType('area')}
                  >
                    Aire
                  </Button>
                  <Button
                    variant={chartType === 'bar' ? 'default' : 'outline'}
                    size="sm"
                    className="h-7 text-xs px-2"
                    onClick={() => setChartType('bar')}
                  >
                    Barres
                  </Button>
                </div>
              </div>
              <div className="h-64 rounded-xl border bg-card/50 p-3">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === 'area' ? (
                    <AreaChart data={historyData}>
                      <defs>
                        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          background: 'hsl(var(--popover))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                      />
                      <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#chartGrad)" />
                    </AreaChart>
                  ) : (
                    <BarChart data={historyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          background: 'hsl(var(--popover))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                      />
                      <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Details */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground mb-1">Source</p>
              <p className="font-medium">{indicator.source || 'Non spécifiée'}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground mb-1">Dernière mise à jour</p>
              <p className="font-medium">
                {indicator.last_updated
                  ? new Date(indicator.last_updated).toLocaleDateString('fr-FR')
                  : 'N/A'}
              </p>
            </div>
          </div>

          {/* Export */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Download className="h-4 w-4" />
              Exporter CSV
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
