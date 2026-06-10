'use client';

import { useState, useEffect, useRef } from 'react';
import { RefreshCw, Download, FileText, ChevronDown } from 'lucide-react';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { AnalyticsOverview } from '@/components/analytics/analytics-overview';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
import { useQueryClient } from '@tanstack/react-query';

export default function AnalyticsPage() {
  const qc = useQueryClient();
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  const handleExportCSV = () => {
    setExportOpen(false);
    apiClient.get<Record<string, unknown>>('/analytics/overview').then((data) => {
      const entries = Object.entries(data || {}).filter(([k]) => !k.startsWith('_'));
      const csv = 'key,value\n' + entries.map(([k, v]) => `"${k}","${String(v ?? '').replace(/"/g, '""')}"`).join('\n');
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'analytics.csv'; a.click();
      URL.revokeObjectURL(url);
      toast.success('Export CSV terminé');
    }).catch(() => toast.error('Erreur lors de l\'export'));
  };

  const handleExportPDF = () => {
    setExportOpen(false);
    window.print();
  };

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) setExportOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

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
          <div className="relative" ref={exportRef}>
            <Button variant="outline" size="sm" onClick={() => setExportOpen(!exportOpen)}>
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Exporter</span>
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
            {exportOpen && (
              <div className="absolute right-0 mt-1 w-40 rounded-lg border bg-popover p-1 shadow-lg z-50">
                <button onClick={handleExportCSV} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors">
                  <Download className="h-4 w-4" /> CSV
                </button>
                <button onClick={handleExportPDF} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors">
                  <FileText className="h-4 w-4" /> PDF
                </button>
              </div>
            )}
          </div>
        </div>
      }
    >
      <AnalyticsOverview />
    </PageWrapper>
  );
}
