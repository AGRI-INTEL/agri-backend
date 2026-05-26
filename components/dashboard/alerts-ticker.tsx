'use client';

import Link from 'next/link';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Bell, ArrowRight, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SeverityBadge } from '@/components/shared/severity-badge';
import { SectorBadge } from '@/components/shared/sector-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAlerts } from '@/hooks/use-alerts';
import { useMarkAlertRead } from '@/hooks/use-alerts';
import { cn } from '@/lib/utils';
import type { AlertSeverity } from '@/types/alert';

const severityBorderColors: Record<AlertSeverity, string> = {
  info: 'border-l-blue-500',
  warning: 'border-l-yellow-500',
  critical: 'border-l-orange-500',
  emergency: 'border-l-red-500',
};

export function AlertsTicker() {
  const { data, isLoading } = useAlerts({ is_read: false });
  const markRead = useMarkAlertRead();
  const alerts = data?.data?.slice(0, 5) || [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader><Skeleton className="h-5 w-40" /></CardHeader>
        <CardContent className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" />
          Dernières Alertes
          {data?.total ? (
            <span className="text-xs bg-destructive text-destructive-foreground rounded-full px-1.5 py-0.5">
              {data.total}
            </span>
          ) : null}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {alerts.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Aucune alerte active 🎉
          </p>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={cn(
                'border-l-4 pl-3 py-2 pr-2 rounded-r-lg bg-muted/30 flex items-start justify-between gap-2',
                severityBorderColors[alert.severity]
              )}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <SeverityBadge severity={alert.severity} />
                  {alert.sector && <SectorBadge sector={alert.sector} />}
                </div>
                <p className="text-sm font-medium text-foreground truncate">{alert.title}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(parseISO(alert.created_at), { addSuffix: true, locale: fr })}
                </p>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => markRead.mutate(alert.id)}
                  aria-label="Marquer comme lu"
                >
                  <Check className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="icon-sm" asChild>
                  <Link href={`/alerts/${alert.id}`} aria-label="Voir le détail">
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </div>
          ))
        )}

        <Button variant="ghost" size="sm" className="w-full text-xs mt-2" asChild>
          <Link href="/alerts">
            Voir toutes les alertes
            <ArrowRight className="h-3 w-3 ml-1" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
