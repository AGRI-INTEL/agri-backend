'use client';

import { useState } from 'react';
import {
  FileText, Download, Trash2, RefreshCw, Plus,
  FileSpreadsheet, File, AlertTriangle, Users, Store,
  CheckCircle2, Clock, XCircle, Loader2, BarChart3,
} from 'lucide-react';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { cn, formatDate, formatFileSize } from '@/lib/utils';
import {
  useReports, useGenerateReport, useDownloadReport, useDeleteReport,
  REPORT_TYPE_LABELS, FORMAT_LABELS, STATUS_LABELS,
  type Report, type ReportGenerateInput,
} from '@/hooks/use-reports';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_ICONS: Record<string, React.ElementType> = {
  completed: CheckCircle2,
  failed: XCircle,
  processing: Loader2,
  queued: Clock,
};

const STATUS_BADGE_VARIANTS: Record<string, string> = {
  completed: 'success',
  failed: 'danger',
  processing: 'warning',
  queued: 'outline',
};

const REPORT_TYPE_ICONS: Record<string, React.ElementType> = {
  production: BarChart3,
  market: Store,
  alert: AlertTriangle,
  community: Users,
};

// ─── Report Card ──────────────────────────────────────────────────────────────

function ReportCard({ report, onDownload, onDelete }: {
  report: Report;
  onDownload: (r: Report) => void;
  onDelete: (id: string) => void;
}) {
  const StatusIcon = STATUS_ICONS[report.status] || Clock;
  const TypeIcon = REPORT_TYPE_ICONS[report.type] || FileText;
  const isPending = report.status === 'queued' || report.status === 'processing';

  return (
    <div className="flex items-start gap-3 rounded-lg border border-border/40 bg-card p-4 transition-all hover:border-border">
      <div className={cn(
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
        report.type === 'production' ? 'bg-emerald-500/10 text-emerald-500' :
        report.type === 'market' ? 'bg-blue-500/10 text-blue-500' :
        report.type === 'alert' ? 'bg-red-500/10 text-red-500' :
        'bg-purple-500/10 text-purple-500',
      )}>
        <TypeIcon className="h-4.5 w-4.5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold truncate">{report.title}</span>
          <Badge variant={(STATUS_BADGE_VARIANTS[report.status] || 'outline') as never} className="text-[10px] h-5 gap-1">
            {isPending && report.status === 'processing' && <Loader2 className="h-2.5 w-2.5 animate-spin" />}
            <StatusIcon className="h-2.5 w-2.5" />
            {STATUS_LABELS[report.status]}
          </Badge>
          <Badge variant="outline" className="text-[10px] h-5 border-border/40">
            {FORMAT_LABELS[report.format] || report.format}
          </Badge>
        </div>
        <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
          <span>{REPORT_TYPE_LABELS[report.type]}</span>
          <span>Créé le {formatDate(report.created_at, 'dd/MM/yyyy')}</span>
          {report.file_size && <span>{formatFileSize(report.file_size)}</span>}
          {report.completed_at && (
            <span>Terminé le {formatDate(report.completed_at, 'dd/MM/yyyy HH:mm')}</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {report.status === 'completed' && report.file_url && (
          <Button variant="ghost" size="icon-sm" onClick={() => onDownload(report)}>
            <Download className="h-3.5 w-3.5" />
          </Button>
        )}
        {(report.status === 'completed' || report.status === 'failed') && (
          <Button variant="ghost" size="icon-sm" onClick={() => onDelete(report.id)}>
            <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Generate Report Form ─────────────────────────────────────────────────────

const REPORT_TYPES = [
  { value: 'production' as const, label: 'Rapport de Production', icon: BarChart3, desc: 'Production agricole, rendements et superficies' },
  { value: 'market' as const, label: 'Rapport de Marché', icon: Store, desc: 'Prix des marchés, tendances et comparaisons' },
  { value: 'alert' as const, label: "Rapport d'Alerte", icon: AlertTriangle, desc: 'Alertes et incidents sur la période' },
  { value: 'community' as const, label: 'Rapport Communauté', icon: Users, desc: 'Activité des groupes et publications' },
];

function GenerateReportForm({ onClose }: { onClose: () => void }) {
  const generateReport = useGenerateReport();
  const [type, setType] = useState<ReportGenerateInput['type']>('production');
  const [format, setFormat] = useState<ReportGenerateInput['format']>('pdf');
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date(); d.setMonth(d.getMonth() - 1);
    return d.toISOString().split('T')[0];
  });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split('T')[0]);

  const handleSubmit = () => {
    if (!dateFrom || !dateTo) {
      toast.error('Veuillez sélectionner une période');
      return;
    }
    generateReport.mutate(
      { type, format, date_from: dateFrom, date_to: dateTo },
      { onSuccess: () => onClose() },
    );
  };

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">Type de rapport</label>
        <div className="grid grid-cols-2 gap-2">
          {REPORT_TYPES.map((rt) => (
            <button
              key={rt.value}
              type="button"
              onClick={() => setType(rt.value)}
              className={cn(
                'flex flex-col items-center gap-1.5 rounded-lg border p-3 text-center transition-all',
                type === rt.value
                  ? 'border-primary/40 bg-primary/5 text-primary'
                  : 'border-border/40 text-muted-foreground hover:border-border',
              )}
            >
              <rt.icon className="h-5 w-5" />
              <span className="text-xs font-medium">{rt.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">Format</label>
        <Select value={format} onValueChange={(v: ReportGenerateInput['format']) => setFormat(v)}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pdf">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" /> PDF
              </div>
            </SelectItem>
            <SelectItem value="csv">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4" /> CSV
              </div>
            </SelectItem>
            <SelectItem value="excel">
              <div className="flex items-center gap-2">
                <File className="h-4 w-4" /> Excel
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Date début</label>
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Date fin</label>
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </div>
      </div>

      <Button
        className="w-full"
        onClick={handleSubmit}
        loading={generateReport.isPending}
      >
        <Plus className="h-4 w-4" />
        Générer le rapport
      </Button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const { data, isLoading, isError, refetch, isFetching } = useReports();
  const downloadReport = useDownloadReport();
  const deleteReport = useDeleteReport();
  const _qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const filteredReports = (Array.isArray(data) ? data : []).filter((r: Report) => {
    if (activeTab === 'all') return true;
    return r.type === activeTab;
  });

  const stats = (Array.isArray(data) ? data : []).reduce((acc, r: Report) => {
    acc.total++;
    if (r.status === 'completed') acc.completed++;
    if (r.status === 'failed') acc.failed++;
    if (r.status === 'processing') acc.processing++;
    return acc;
  }, { total: 0, completed: 0, failed: 0, processing: 0 });

  return (
    <PageWrapper
      title={
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 shadow-sm">
            <FileText className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold">Rapports & Export</span>
              {stats.total > 0 && (
                <Badge variant="secondary" className="text-[10px] font-mono h-5 px-1.5">{stats.total}</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Générer et télécharger des rapports personnalisés
            </p>
          </div>
        </div>
      }
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline text-xs">Actualiser</span>
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-8 gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                <span className="hidden sm:inline text-xs">Nouveau rapport</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Générer un rapport</DialogTitle>
                <DialogDescription>
                  Choisissez le type, le format et la période
                </DialogDescription>
              </DialogHeader>
              <GenerateReportForm onClose={() => setDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total', value: String(stats.total), icon: FileText, color: '#8B5CF6' },
            { label: 'Terminés', value: String(stats.completed), icon: CheckCircle2, color: '#22C55E' },
            { label: 'En cours', value: String(stats.processing), icon: Loader2, color: '#3B82F6' },
            { label: 'Échoués', value: String(stats.failed), icon: XCircle, color: '#EF4444' },
          ].map((s) => (
            <Card key={s.label} className="border-border/40">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: `${s.color}18` }}>
                  <s.icon className="h-4.5 w-4.5" style={{ color: s.color }} />
                </div>
                <div>
                  <p className="text-lg font-bold font-mono">{s.value}</p>
                  <p className="text-[11px] text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">Tous</TabsTrigger>
            {REPORT_TYPES.map((rt) => (
              <TabsTrigger key={rt.value} value={rt.value} className="gap-1.5">
                <rt.icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{rt.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Report list */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        ) : isError ? (
          <EmptyState
            icon="📄"
            title="Erreur de chargement"
            description="Impossible de charger les rapports."
            action={{ label: 'Réessayer', onClick: () => refetch() }}
          />
        ) : filteredReports.length === 0 ? (
          <EmptyState
            icon="📄"
            title="Aucun rapport"
            description={
              activeTab === 'all'
                ? 'Générez votre premier rapport pour commencer.'
                : `Aucun rapport de type "${REPORT_TYPE_LABELS[activeTab]}" trouvé.`
            }
            action={{ label: 'Générer un rapport', onClick: () => setDialogOpen(true) }}
          />
        ) : (
          <div className="space-y-2">
            {filteredReports.map((report: Report) => (
              <ReportCard
                key={report.id}
                report={report}
                onDownload={(r) => downloadReport.mutate(r)}
                onDelete={(id) => deleteReport.mutate(id)}
              />
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
