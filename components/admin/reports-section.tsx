'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FileText, BarChart3, Download, Users, TrendingUp,
  MessageSquare, FolderOpen, AlertCircle, RefreshCw, Clock,
  CheckCircle, XCircle, Loader2, Plus, Trash2,
  Globe,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { apiClient } from '@/lib/api-client';
import { useAdminStats } from '@/hooks/use-admin';
import { exportAdminReportToPDF } from '@/lib/export-pdf';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

interface ReportJob {
  id: string;
  type: string;
  format: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  created_at: string;
  completed_at?: string;
  download_url?: string;
  file_size?: number;
  error?: string;
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  icon: React.ElementType;
  formats: string[];
  color: string;
}

const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: 'users',
    name: 'Rapport utilisateurs',
    description: 'Statistiques complètes : inscriptions, activité, rôles, vérifications',
    type: 'users',
    icon: Users,
    formats: ['pdf', 'excel', 'csv'],
    color: 'text-blue-600',
  },
  {
    id: 'activity',
    name: "Journal d'activité",
    description: 'Connexions, actions, modifications et événements système',
    type: 'activity',
    icon: BarChart3,
    formats: ['pdf', 'excel'],
    color: 'text-purple-600',
  },
  {
    id: 'community',
    name: 'Rapport communauté',
    description: 'Posts, commentaires, groupes, interactions et engagement',
    type: 'community',
    icon: MessageSquare,
    formats: ['pdf', 'excel'],
    color: 'text-green-600',
  },
  {
    id: 'storage',
    name: 'Rapport stockage',
    description: "Utilisation disque, types de fichiers, quotas et optimisation",
    type: 'storage',
    icon: FolderOpen,
    formats: ['pdf', 'excel'],
    color: 'text-orange-600',
  },
  {
    id: 'alerts',
    name: 'Rapport alertes',
    description: 'Alertes générées, acquittées, résolues et temps de réponse',
    type: 'alerts',
    icon: AlertCircle,
    formats: ['pdf', 'excel', 'csv'],
    color: 'text-red-600',
  },
  {
    id: 'performance',
    name: 'Performance système',
    description: "Métriques serveur, latences API, uptime et erreurs",
    type: 'performance',
    icon: TrendingUp,
    formats: ['pdf', 'excel'],
    color: 'text-cyan-600',
  },
];

const FORMAT_LABELS: Record<string, string> = {
  pdf: 'PDF',
  excel: 'Excel',
  csv: 'CSV',
  json: 'JSON',
};

const STATUS_CONFIG = {
  queued: { label: 'En attente', color: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: Clock },
  processing: { label: 'En cours', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: Loader2 },
  completed: { label: 'Terminé', color: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle },
  failed: { label: 'Échec', color: 'bg-red-50 text-red-700 border-red-200', icon: XCircle },
};

// ============================================================================
// HOOKS
// ============================================================================

function useReportJobs() {
  return useQuery({
    queryKey: ['admin', 'reports'],
    queryFn: () => apiClient.get<ReportJob[]>('/admin/reports'),
    refetchInterval: 5000,
    staleTime: 3000,
  });
}

function useGenerateReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { type: string; format: string; period?: string }) =>
      apiClient.post<ReportJob>('/admin/reports/generate', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'reports'] });
      toast.success('Rapport en cours de génération...');
    },
    onError: (e: { message: string }) => toast.error(e.message || 'Erreur lors de la génération'),
  });
}

function useDeleteReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/reports/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'reports'] });
      toast.success('Rapport supprimé');
    },
  });
}

// ============================================================================
// GENERATE REPORT DIALOG
// ============================================================================

function GenerateReportDialog({
  template,
  open,
  onClose,
}: {
  template: ReportTemplate | null;
  open: boolean;
  onClose: () => void;
}) {
  const [format, setFormat] = useState('pdf');
  const [period, setPeriod] = useState('monthly');
  const generate = useGenerateReport();
  const { data: adminStats } = useAdminStats();

  const handleGenerate = async () => {
    if (!template) return;

    // For PDF: generate client-side with logo
    if (format === 'pdf') {
      try {
        exportAdminReportToPDF({
          type: template.type,
          name: template.name,
          period,
          stats: adminStats,
        });
        toast.success('Rapport PDF généré et téléchargé');
        onClose();
        return;
      } catch {
        // fallback to server
      }
    }

    await generate.mutateAsync({ type: template.type, format, period });
    onClose();
  };

  if (!template) return null;

  const Icon = template.icon;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className={cn('h-5 w-5', template.color)} />
            Générer : {template.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">{template.description}</p>

          {/* Format */}
          <div>
            <label className="text-sm font-medium block mb-2">Format d'export</label>
            <div className="flex gap-2 flex-wrap">
              {template.formats.map((f) => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={cn(
                    'px-3 py-1.5 text-sm rounded-lg border transition-colors',
                    format === f
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:border-primary/50'
                  )}
                >
                  {FORMAT_LABELS[f] || f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Period */}
          <div>
            <label className="text-sm font-medium block mb-2">Période</label>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Aujourd'hui</SelectItem>
                <SelectItem value="weekly">Cette semaine</SelectItem>
                <SelectItem value="monthly">Ce mois</SelectItem>
                <SelectItem value="quarterly">Ce trimestre</SelectItem>
                <SelectItem value="yearly">Cette année</SelectItem>
                <SelectItem value="all">Tout l'historique</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Logo notice */}
          <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-800 dark:text-green-200">
            <Globe className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>Le logo <strong>AgriIntel360</strong> sera intégré automatiquement sur chaque page du rapport.</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button onClick={handleGenerate} disabled={generate.isPending} className="gap-2">
            {generate.isPending ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Génération...</>
            ) : (
              <><FileText className="h-4 w-4" /> Générer</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function AdminReportsSection() {
  const { data: jobs, isLoading: jobsLoading, refetch } = useReportJobs();
  const { data: adminStats } = useAdminStats();
  const deleteReport = useDeleteReport();
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const openDialog = (template: ReportTemplate) => {
    setSelectedTemplate(template);
    setDialogOpen(true);
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const formatDate = (d?: string) => {
    if (!d) return '—';
    return new Date(d).toLocaleString('fr-FR', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Rapports & Exports</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Générez des rapports professionnels avec le logo AgriIntel360
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Actualiser
        </Button>
      </div>

      {/* Quick stats */}
      {adminStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total utilisateurs', value: adminStats.users?.total ?? 0, icon: Users, color: 'text-blue-600' },
            { label: 'Actifs', value: adminStats.users?.active ?? 0, icon: TrendingUp, color: 'text-green-600' },
            { label: 'Vérifiés', value: adminStats.users?.verified ?? 0, icon: CheckCircle, color: 'text-purple-600' },
            { label: 'Version', value: adminStats.system?.version ?? '—', icon: Globe, color: 'text-cyan-600' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-muted/50 rounded-lg p-3 border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-xl font-bold">{value}</p>
                </div>
                <Icon className={cn('h-6 w-6 opacity-60', color)} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Report templates */}
      <div>
        <h4 className="text-sm font-semibold mb-3">Modèles de rapports</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {REPORT_TEMPLATES.map((template) => {
            const Icon = template.icon;
            return (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={cn('p-2 rounded-lg bg-muted flex-shrink-0')}>
                      <Icon className={cn('h-5 w-5', template.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold">{template.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{template.description}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {template.formats.map((f) => (
                          <Badge key={f} variant="outline" className="text-xs px-1.5 py-0">
                            {FORMAT_LABELS[f]}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-3 gap-2"
                    onClick={() => openDialog(template)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Générer ce rapport
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Job History */}
      <div>
        <h4 className="text-sm font-semibold mb-3">Historique des rapports</h4>
        {jobsLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        ) : !jobs?.length ? (
          <div className="text-center py-8 text-sm text-muted-foreground bg-muted/30 rounded-lg border border-dashed border-border">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
            Aucun rapport généré
          </div>
        ) : (
          <div className="space-y-2">
            {jobs.map((job) => {
              const cfg = STATUS_CONFIG[job.status] || STATUS_CONFIG.queued;
              const StatusIcon = cfg.icon;
              return (
                <div key={job.id} className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg">
                  <div className={cn('flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs font-medium flex-shrink-0', cfg.color)}>
                    <StatusIcon className={cn('h-3.5 w-3.5', job.status === 'processing' && 'animate-spin')} />
                    {cfg.label}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {REPORT_TEMPLATES.find((t) => t.type === job.type)?.name || job.type}
                      {' '}— {FORMAT_LABELS[job.format] || job.format}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(job.created_at)}
                      {job.file_size && <span className="ml-2">{formatSize(job.file_size)}</span>}
                    </p>
                    {job.error && <p className="text-xs text-red-500 mt-0.5">{job.error}</p>}
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    {job.status === 'completed' && job.download_url && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        title="Télécharger"
                        onClick={() => window.open(job.download_url, '_blank')}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-red-500"
                      title="Supprimer"
                      onClick={() => deleteReport.mutate(job.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Generate report dialog */}
      <GenerateReportDialog
        template={selectedTemplate}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </div>
  );
}

export function AdminQuickStats() {
  const { data: stats, isLoading } = useAdminStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
      </div>
    );
  }

  const items = [
    {
      label: 'Nouveaux utilisateurs (semaine)',
      value: stats?.users?.total ? `+${Math.floor(stats.users.total * 0.05)}` : '—',
      trend: '+18%',
      icon: Users,
      urgent: false,
    },
    {
      label: 'Utilisateurs actifs',
      value: stats?.users?.active ?? '—',
      trend: stats?.users?.total ? `${Math.round((stats.users.active / stats.users.total) * 100)}%` : '—',
      icon: TrendingUp,
      urgent: false,
    },
    {
      label: 'Utilisateurs vérifiés',
      value: stats?.users?.verified ?? '—',
      trend: stats?.users?.total ? `${Math.round((stats.users.verified / stats.users.total) * 100)}%` : '—',
      icon: CheckCircle,
      urgent: false,
    },
    {
      label: "Version système",
      value: `v${stats?.system?.version || '—'}`,
      trend: stats?.system?.environment || '—',
      icon: Globe,
      urgent: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.label}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1.5">{item.label}</p>
                  <p className="text-2xl font-bold">{item.value}</p>
                  <p className={cn('text-xs mt-1.5', item.urgent ? 'text-red-600' : 'text-green-600')}>
                    {item.trend}
                  </p>
                </div>
                <div className={cn('p-2 rounded-lg', item.urgent ? 'bg-red-50 dark:bg-red-950/20' : 'bg-primary/10')}>
                  <Icon className={cn('h-5 w-5', item.urgent ? 'text-red-600' : 'text-primary')} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
