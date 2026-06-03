'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  Download,
  Eye,
  Zap,
  Database,
  Wifi,
} from 'lucide-react';

export function AdminSystemAlerts() {
  const alerts = [
    {
      id: 1,
      title: 'Utilisation disque élevée',
      description: 'Utilisation du disque à 85%. Considérez une augmentation de capacité.',
      severity: 'warning',
      time: 'Il y a 2h',
      icon: AlertTriangle,
    },
    {
      id: 2,
      title: 'Pic de trafic détecté',
      description: '5000+ requêtes/min détectées. Système en bon état.',
      severity: 'info',
      time: 'Il y a 30 min',
      icon: TrendingUp,
    },
    {
      id: 3,
      title: 'Sauvegarde complétée',
      description: 'Sauvegarde automatique réussie. 2.4 GB sauvegardés.',
      severity: 'success',
      time: 'Il y a 1h',
      icon: CheckCircle,
    },
    {
      id: 4,
      title: 'Latence API augmentée',
      description: 'Temps de réponse moyen: 250ms (normal: 100ms).',
      severity: 'warning',
      time: 'Il y a 15 min',
      icon: Clock,
    },
  ];

  const severityConfig: Record<string, { bg: string; border: string; text: string; icon: string }> = {
    success: {
      bg: 'bg-green-50 dark:bg-green-950/20',
      border: 'border-green-200 dark:border-green-800',
      text: 'text-green-900 dark:text-green-100',
      icon: '✓',
    },
    warning: {
      bg: 'bg-yellow-50 dark:bg-yellow-950/20',
      border: 'border-yellow-200 dark:border-yellow-800',
      text: 'text-yellow-900 dark:text-yellow-100',
      icon: '!',
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-950/20',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-900 dark:text-blue-100',
      icon: 'i',
    },
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Alertes système</h3>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Exporter rapport
        </Button>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => {
          const config = severityConfig[alert.severity];
          const Icon = alert.icon;

          return (
            <div
              key={alert.id}
              className={`p-4 rounded-lg border ${config.bg} ${config.border}`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg ${config.bg}`}>
                  <Icon className={`h-5 w-5 ${config.text}`} />
                </div>
                <div className="flex-1">
                  <h4 className={`font-semibold ${config.text}`}>{alert.title}</h4>
                  <p className={`text-sm ${config.text} opacity-90 mt-1`}>{alert.description}</p>
                  <p className="text-xs text-muted-foreground mt-2">{alert.time}</p>
                </div>
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function AdminSystemMetrics() {
  const metrics = [
    {
      label: 'CPU Usage',
      value: '45%',
      status: 'normal',
      icon: Zap,
    },
    {
      label: 'Memory Usage',
      value: '62%',
      status: 'normal',
      icon: Database,
    },
    {
      label: 'Network I/O',
      value: '320 Mbps',
      status: 'normal',
      icon: Wifi,
    },
    {
      label: 'Response Time',
      value: '125ms',
      status: 'normal',
      icon: Clock,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <Card key={metric.label}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">{metric.label}</p>
                  <p className="text-2xl font-bold">{metric.value}</p>
                </div>
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
              </div>
              <Badge variant="outline" className="mt-4 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
                Normal
              </Badge>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
