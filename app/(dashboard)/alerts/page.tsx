'use client';

import { useState } from 'react';
import { CheckCheck } from 'lucide-react';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { AlertCard } from '@/components/alerts/alert-card';
import { AlertFiltersBar } from '@/components/alerts/alert-filters';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { useAlerts, useMarkAlertRead, useMarkAllAlertsRead } from '@/hooks/use-alerts';
import type { Alert, AlertFilters } from '@/types/alert';

function normalizeAlerts(raw: unknown): Alert[] {
  if (Array.isArray(raw)) return raw as Alert[];
  if (raw && typeof raw === 'object' && 'data' in raw) {
    return (raw as { data: Alert[] }).data;
  }
  return [];
}

export default function AlertsPage() {
  const [filters, setFilters] = useState<AlertFilters>({ limit: 50 });
  const { data, isLoading } = useAlerts(filters);
  const markRead = useMarkAlertRead();
  const markAllRead = useMarkAllAlertsRead();

  const alerts = normalizeAlerts(data);

  return (
    <PageWrapper
      title="Alertes"
      description={`${alerts.length} alerte(s)`}
      actions={
        <Button variant="outline" size="sm" className="gap-2" onClick={() => markAllRead.mutate()}>
          <CheckCheck className="h-4 w-4" />
          Tout marquer lu
        </Button>
      }
    >
      <AlertFiltersBar filters={filters} onChange={setFilters} />

      <div className="mt-6 space-y-3">
        {isLoading ? (
          <LoadingSkeleton variant="card" count={5} />
        ) : alerts.length === 0 ? (
          <EmptyState icon="🔔" title="Aucune alerte" description="Vous serez notifié des événements importants ici." />
        ) : (
          alerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onMarkRead={(id) => markRead.mutate(id)}
            />
          ))
        )}
      </div>
    </PageWrapper>
  );
}
