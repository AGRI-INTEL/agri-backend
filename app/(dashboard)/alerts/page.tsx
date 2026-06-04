'use client';

import { useState, useEffect } from 'react';
import {
  Bell, CheckCheck, AlertTriangle, AlertCircle, Info,
  Clock, MapPin, RefreshCw, Filter, Zap, Shield,
  TrendingUp, Eye, CheckCircle,
} from 'lucide-react';
import { PageWrapper } from '@/components/layout/page-wrapper';
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
  info: { bg: 'bg-blue-50 dark:bg-blue-950/20', border: 'border-blue-200 dark:border-blue-800', text: 'text-blue-700 dark:text-blue-300', icon: Info, dot: 'bg-blue-500' },
  warning: { bg: 'bg-yellow-50 dark:bg-yellow-950/20', border: 'border-yellow-200 dark:border-yellow-800', text: 'text-yellow-700 dark:text-yellow-300', icon: AlertTriangle, dot: 'bg-yellow-500' },
  critical: { bg: 'bg-orange-50 dark:bg-orange-950/20', border: 'border-orange-200 dark:border-orange-800', text: 'text-orange-700 dark:text-orange-300', icon: AlertCircle, dot: 'bg-orange-500' },
  emergency: { bg: 'bg-red-50 dark:bg-red-950/20', border: 'border-red-200 dark:border-red-800', text: 'text-red-700 dark:text-red-300', icon: Zap, dot: 'bg-red-500 animate-pulse' },
};

export default function AlertsPage() {
  const [filters, setFilters] = useState<AlertFilters>({ limit: 50 });
  const [activeView, setActiveView] = useState<'all' | 'unread' | 'critical'>('all');
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const { data, isLoading, refetch, isFetching } = useAlerts(filters);
  const { data: statsData, isLoading: statsLoading } = useAlertStats();
  const markRead = useMarkAlertRead();
  const markAllRead = useMarkAllAlertsRead();
  const acknowledge = useAcknowledgeAlert();
  const resolve = useResolveAlert();

  // Track last update
  useEffect(() => {
    if (!isFetching) setLastUpdate(new Date());
  }, [isFetching]);

  const allAlerts = normalizeAlerts(data);

  // Apply view filter client-side
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

  return (
    <PageWrapper
      title="Centre d'alertes"
      description="Surveillance en temps réel des événements critiques"
      actions={
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className={cn('h-2 w-2 rounded-full', isFetching ? 'bg-yellow-500 animate-pulse' : 'bg-green-500')} />
            Mis à jour à {lastUpdate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={cn('h-4 w-4 mr-1', isFetching && 'animate-spin')} />
            Actualiser
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => markAllRead.mutate()}
            disabled={unreadCount === 0}
          >
            <CheckCheck className="h-4 w-4" />
            Tout marquer lu
          </Button>
        </div>
      }
    >
      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)
        ) : (
          <>
            <Card className="border-l-4 border-l-primary">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Total alertes</p>
                    <p className="text-3xl font-bold">{stats.total}</p>
                  </div>
                  <Bell className="h-8 w-8 text-primary opacity-60" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Non lues</p>
                    <p className="text-3xl font-bold text-blue-600">{stats.unread}</p>
                  </div>
                  <Eye className="h-8 w-8 text-blue-500 opacity-60" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Critiques</p>
                    <p className="text-3xl font-bold text-red-600">{stats.critical_count}</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-red-500 opacity-60" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Lues</p>
                    <p className="text-3xl font-bold text-green-600">{stats.total - stats.unread}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500 opacity-60" />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* ── Severity summary ── */}
      {Object.keys(stats.by_severity).length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
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

      {/* ── View tabs + Filters ── */}
      <div className="flex flex-col gap-3 mb-4">
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

      {/* Auto-refresh indicator */}
      <div className="mt-6 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
        <RefreshCw className="h-3 w-3" />
        Actualisation automatique toutes les 15 secondes
      </div>
    </PageWrapper>
  );
}
