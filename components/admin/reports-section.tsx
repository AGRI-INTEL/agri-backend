'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  BarChart3,
  Download,
  Calendar,
  Users,
  TrendingUp,
  MessageSquare,
  FolderOpen,
  AlertCircle,
} from 'lucide-react';

export function AdminReportsSection() {
  const reports = [
    {
      name: 'Rapport mensuel des utilisateurs',
      description: 'Analyse complète du comportement des utilisateurs ce mois',
      date: 'Généré aujourd\'hui',
      size: '2.4 MB',
      icon: Users,
    },
    {
      name: 'Rapport d\'activité',
      description: 'Journal des activités et événements du système',
      date: 'Mise à jour en temps réel',
      size: '5.1 MB',
      icon: BarChart3,
    },
    {
      name: 'Rapport de contenu',
      description: 'Statistiques sur les posts, commentaires et partages',
      date: 'Généré hier',
      size: '1.8 MB',
      icon: MessageSquare,
    },
    {
      name: 'Rapport de stockage',
      description: 'Utilisation de l\'espace disque et optimisation',
      date: 'Généré cette semaine',
      size: '856 KB',
      icon: FolderOpen,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Generate Report Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Rapports et Exports</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Générez et téléchargez des rapports détaillés sur la plateforme
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Générer un rapport
        </Button>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((report) => {
          const Icon = report.icon;
          return (
            <Card key={report.name}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{report.name}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">{report.description}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      <Calendar className="h-4 w-4 inline mr-2" />
                      {report.date}
                    </span>
                    <Badge variant="outline">{report.size}</Badge>
                  </div>
                  <Button variant="outline" className="w-full" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export function AdminQuickStats() {
  const stats = [
    {
      label: 'Nouveaux utilisateurs cette semaine',
      value: '47',
      trend: '+18%',
      icon: Users,
    },
    {
      label: 'Posts publiés',
      value: '1,234',
      trend: '+5%',
      icon: MessageSquare,
    },
    {
      label: 'Espace utilisé',
      value: '456 GB',
      trend: '+12%',
      icon: FolderOpen,
    },
    {
      label: 'Alertes non lues',
      value: '8',
      trend: 'Urgent',
      icon: AlertCircle,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const isUrgent = stat.trend === 'Urgent';

        return (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p
                    className={`text-xs mt-2 ${
                      isUrgent
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-green-600 dark:text-green-400'
                    }`}
                  >
                    {stat.trend}
                  </p>
                </div>
                <div className={`p-2 rounded-lg ${isUrgent ? 'bg-red-50 dark:bg-red-950/20' : 'bg-primary/10'}`}>
                  <Icon className={`h-5 w-5 ${isUrgent ? 'text-red-600' : 'text-primary'}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
