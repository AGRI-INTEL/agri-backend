'use client';

import { useState, useEffect } from 'react';
import {
  Bell, CheckCheck, AlertTriangle, AlertCircle, Info,
  RefreshCw, Zap,
  Eye, CheckCircle, ShieldAlert,
} from 'lucide-react';
import { motion } from '@/lib/motion';
import { AlertCard } from '@/components/alerts/alert-card';
import { AlertFiltersBar } from '@/components/alerts/alert-filters';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useAlerts, useMarkAlertRead, useMarkAllAlertsRead,
  useAlertStats, useAcknowledgeAlert, useResolveAlert,
} from '@/hooks/use-alerts';
import type { Alert, AlertFilters } from '@/types/alert';
import { cn } from '@/lib/utils';

function normalizeAlerts(raw: unknown): Alert[] {
  if (Array.isArray(raw)) return raw as Alert[];
  if (raw && typeof raw === 'object') {
    const r = raw as Record<string, unknown>;
    if (Array.isArray(r.data)) return r.data as Alert[];
    if (Array.isArray(r.items)) return r.items as Alert[];
    if (Array.isArray(r.results)) return r.results as Alert[];
  }
  return [];
}

const SEVERITY_COLORS = {
  info:      { bg: 'bg-blue-50 dark:bg-blue-950/20', border: 'border-blue-200 dark:border-blue-800', text: 'text-blue-700 dark:text-blue-300', icon: Info,          dot: 'bg-blue-500',              bar: 'bg-blue-500'     },
  warning:   { bg: 'bg-yellow-50 dark:bg-yellow-950/20', border: 'border-yellow-200 dark:border-yellow-800', text: 'text-yellow-700 dark:text-yellow-300', icon: AlertTriangle, dot: 'bg-yellow-500',            bar: 'bg-yellow-500'   },
  critical:  { bg: 'bg-orange-50 dark:bg-orange-950/20', border: 'border-orange-200 dark:border-orange-800', text: 'text-orange-700 dark:text-orange-300', icon: AlertCircle,   dot: 'bg-orange-500',            bar: 'bg-orange-500'   },
  emergency: { bg: 'bg-red-50 dark:bg-red-950/20', border: 'border-red-200 dark:border-red-800', text: 'text-red-700 dark:text-red-300', icon: Zap,           dot: 'bg-red-500 animate-pulse', bar: 'bg-red-500'      },
};

const STAT_CARDS = [
  { key: 'total',          label: 'Total alertes',  icon: Bell,          accent: 'border-t-primary',     iconBg: 'bg-primary/10',       iconColor: 'text-primary'     },
  { key: 'unread',         label: 'Non lues',        icon: Eye,           accent: 'border-t-blue-500',    iconBg: 'bg-blue-100 dark:bg-blue-900/30',  iconColor: 'text-blue-600'    },
  { key: 'critical_count', label: 'Critiques',       icon: AlertCircle,   accent: 'border-t-red-500',     iconBg: 'bg-red-100 dark:bg-red-900/30',    iconColor: 'text-red-600'     },
  { key: 'resolved',       label: 'Résolues',        icon: CheckCircle,   accent: 'border-t-green-500',   iconBg: 'bg-green-100 dark:bg-green-900/30', iconColor: 'text-green-600'  },
] as const;

export default function AlertsPage() {
  const [filters, setFilters] = useState<AlertFilters>({ limit: 50 });
  const [activeView, setActiveView] = useState<'all' | 'unread' | 'critical'>('all');
  const [mounted, setMounted] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    setMounted(true);
    setLastUpdate(new Date());
  }, []);

  const { data, isLoading, refetch, isFetching } = useAlerts(filters);
  const { data: statsData, isLoading: statsLoading } = useAlertStats();
  const markRead = useMarkAlertRead();
  const markAllRead = useMarkAllAlertsRead();
  const acknowledge = useAcknowledgeAlert();
  const resolve = useResolveAlert();

  useEffect(() => {
    if (!isFetching) setLastUpdate(new Date());
  }, [isFetching]);

  const allAlerts = normalizeAlerts(data);

  const alerts = allAlerts.filter((a) => {
    if (activeView === 'unread') return !a.is_read;
    if (activeView === 'critical') return a.severity === 'critical' || a.severity === 'emergency';
    return true;
  });

  const unreadCount = allAlerts.filter((a) => !a.is_read).length;
  const criticalCount = allAlerts.filter((a) => a.severity === 'critical' || a.severity === 'emergency').length;

  const stats = statsData || {
    total: allAlerts.length,
    unread: unreadCount,
    critical_count: criticalCount,
    by_severity: {},
    by_type: {},
  };

  const hasEmergency = allAlerts.some((a) => a.severity === 'emergency');
  const hasCritical = allAlerts.some((a) => a.severity === 'critical');
  const heroGradient = hasEmergency
    ? 'from-red-600 via-rose-600 to-orange-600'
    : hasCritical
    ? 'from-orange-500 via-amber-500 to-yellow-500'
    : criticalCount > 0
    ? 'from-amber-500 via-yellow-500 to-amber-400'
    : 'from-green-600 via-emerald-600 to-teal-600';

  const heroStatusLabel = hasEmergency
    ? 'Urgence active — Intervention requise'
    : hasCritical
    ? 'Alertes critiques détectées'
    : criticalCount > 0
    ? 'Alertes en cours de traitement'
    : 'Système opérationnel — Aucune urgence';

  const heroStatusEmoji = hasEmergency ? '🚨' : hasCritical ? '⚠️' : criticalCount > 0 ? '🔔' : '✅';

  return (
    <div className="min-h-full">
      {/* ── Hero Banner ────────────────────────────────────────────────────── */}
      <div className={cn('relative overflow-hidden bg-gradient-to-br', heroGradient)}>
        <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-56 h-56 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <svg className="absolute inset-0 w-full h-full opacity-[0.06] pointer-events-none" preserveAspectRatio="none">
          <defs>
            <pattern id="agrid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#agrid)" />
        </svg>

        <div className="relative z-10 px-6 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <div className="flex items-center gap-2 text-white/70 text-sm mb-1">
                <ShieldAlert className="h-4 w-4" />
                <span>Centre de surveillance en temps réel</span>
                <span className={cn('h-2 w-2 rounded-full', isFetching ? 'bg-yellow-300 animate-pulse' : 'bg-green-300 animate-pulse')} />
                <span className="text-white/50">
                  {mounted && lastUpdate ? lastUpdate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '...'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
                {heroStatusEmoji} {heroStatusLabel}
              </h1>
              <p className="text-white/70 text-sm mt-1">
                {stats.total} alerte{stats.total !== 1 ? 's' : ''} au total — {stats.unread} non lue{stats.unread !== 1 ? 's' : ''}
              </p>
            </motion.div>

            <motion.div
              className="flex items-center gap-2 shrink-0"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Button
                variant="ghost"
                size="sm"
                className="text-white border border-white/20 hover:bg-white/10 hover:text-white"
                onClick={() => refetch()}
                disabled={isFetching}
              >
                <RefreshCw className={cn('h-3.5 w-3.5 mr-1.5', isFetching && 'animate-spin')} />
                Actualiser
              </Button>
              <Button
                size="sm"
                className="bg-white text-gray-800 hover:bg-gray-100 font-semibold shadow-lg"
                onClick={() => markAllRead.mutate()}
                disabled={unreadCount === 0}
              >
                <CheckCheck className="h-3.5 w-3.5 mr-1.5" />
                Tout marquer lu
              </Button>
            </motion.div>
          </div>

          {/* Severity bar */}
          {allAlerts.length > 0 && (
            <motion.div
              className="mt-6"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
            >
              <p className="text-white/60 text-xs mb-2">Répartition des sévérités</p>
              <div className="flex gap-0.5 h-2.5 rounded-full overflow-hidden bg-white/10 w-full max-w-md">
                {(['emergency', 'critical', 'warning', 'info'] as const).map((sev) => {
                  const count = allAlerts.filter((a) => a.severity === sev).length;
                  const pct = allAlerts.length > 0 ? (count / allAlerts.length) * 100 : 0;
                  if (pct === 0) return null;
                  return (
                    <div
                      key={sev}
                      className={cn('h-full transition-all', SEVERITY_COLORS[sev]?.bar)}
                      style={{ width: `${pct}%` }}
                      title={`${sev}: ${count}`}
                    />
                  );
                })}
              </div>
              <div className="flex gap-4 mt-2 flex-wrap">
                {(['emergency', 'critical', 'warning', 'info'] as const).map((sev) => {
                  const count = allAlerts.filter((a) => a.severity === sev).length;
                  if (count === 0) return null;
                  return (
                    <div key={sev} className="flex items-center gap-1.5 text-white/70 text-xs">
                      <span className={cn('h-2 w-2 rounded-full', SEVERITY_COLORS[sev]?.dot)} />
                      {sev.charAt(0).toUpperCase() + sev.slice(1)}: <span className="text-white font-bold">{count}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <div className="p-6 space-y-5">
        {/* ── Stats Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statsLoading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
          ) : (
            STAT_CARDS.map((sc, i) => {
              const Icon = sc.icon;
              const value = sc.key === 'resolved'
                ? Math.max(0, stats.total - stats.unread)
                : (stats as Record<string, unknown>)[sc.key] as number ?? 0;
              return (
                <motion.div
                  key={sc.key}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.3 }}
                >
                  <Card className={cn('border-t-2 hover:shadow-md transition-all duration-200', sc.accent)}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">{sc.label}</p>
                        <div className={cn('h-9 w-9 rounded-xl flex items-center justify-center', sc.iconBg)}>
                          <Icon className={cn('h-4.5 w-4.5', sc.iconColor)} />
                        </div>
                      </div>
                      <p className="text-3xl font-extrabold font-data">{value}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          )}
        </div>

        {/* ── Severity summary pills ── */}
        {Object.keys(stats.by_severity).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.by_severity).map(([sev, count]) => {
              const cfg = SEVERITY_COLORS[sev as keyof typeof SEVERITY_COLORS] || SEVERITY_COLORS.info;
              const Icon = cfg.icon;
              return (
                <div key={sev} className={cn('flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium', cfg.bg, cfg.border, cfg.text)}>
                  <span className={cn('h-2 w-2 rounded-full', cfg.dot)} />
                  <Icon className="h-3.5 w-3.5" />
                  {sev.charAt(0).toUpperCase() + sev.slice(1)}: {count as number}
                </div>
              );
            })}
          </div>
        )}

        {/* ── View tabs ── */}
        <div className="flex flex-col gap-3">
          <div className="flex gap-1 border-b border-border">
            {[
              { id: 'all', label: 'Toutes', count: allAlerts.length },
              { id: 'unread', label: 'Non lues', count: unreadCount },
              { id: 'critical', label: 'Critiques', count: criticalCount },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id as typeof activeView)}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2.5 border-b-2 text-sm font-medium transition-colors',
                  activeView === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                {tab.label}
                {tab.count > 0 && (
                  <Badge
                    variant={tab.id === 'critical' ? 'destructive' : 'secondary'}
                    className="text-xs h-5 min-w-5 px-1"
                  >
                    {tab.count}
                  </Badge>
                )}
              </button>
            ))}
          </div>
          <AlertFiltersBar filters={filters} onChange={(f) => setFilters(f)} />
        </div>

        {/* ── Alerts List ── */}
        <div className="space-y-2">
          {isLoading ? (
            <LoadingSkeleton variant="card" count={5} />
          ) : alerts.length === 0 ? (
            <EmptyState
              icon="🔔"
              title={activeView === 'unread' ? 'Aucune alerte non lue' : activeView === 'critical' ? 'Aucune alerte critique' : 'Aucune alerte'}
              description="Vous serez notifié ici dès qu'un événement important survient."
            />
          ) : (
            alerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onMarkRead={(id) => markRead.mutate(id)}
                onAcknowledge={(id) => acknowledge.mutate({ id })}
                onResolve={(id) => resolve.mutate({ id })}
              />
            ))
          )}
        </div>

        <div className="text-center text-xs text-muted-foreground flex items-center justify-center gap-2 pt-2">
          <RefreshCw className="h-3 w-3" />
          Actualisation automatique toutes les 15 secondes
        </div>
      </div>
    </div>
  );
}
