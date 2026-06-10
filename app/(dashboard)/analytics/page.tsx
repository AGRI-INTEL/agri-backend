'use client';

import { RefreshCw, Download } from 'lucide-react';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { AnalyticsOverview } from '@/components/analytics/analytics-overview';
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';

export default function AnalyticsPage() {
  const qc = useQueryClient();

  return (
    <PageWrapper
      title="Analytics"
      description="Analyses et tendances de votre écosystème agricole — production, prix, météo et comparaisons régionales"
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => qc.invalidateQueries({ queryKey: ['analytics'] })}
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Actualiser</span>
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Exporter</span>
          </Button>
        </div>
      }
    >
      <AnalyticsOverview />
    </PageWrapper>
  );
}
