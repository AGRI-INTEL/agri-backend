'use client';

import { useQuery } from '@tanstack/react-query';
import { BarChart3, TrendingUp, Users, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { apiClient } from '@/lib/api-client';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

export function AnalyticsOverview() {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: () => apiClient.get<Record<string, unknown>>('/analytics/overview'),
    retry: false,
  });

  const chartData = [
    { name: 'Jan', production: 120 },
    { name: 'Fév', production: 145 },
    { name: 'Mar', production: 132 },
    { name: 'Avr', production: 168 },
    { name: 'Mai', production: 190 },
    { name: 'Jun', production: 175 },
  ];

  if (isLoading) {
    return <Skeleton className="h-64 w-full rounded-card" />;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: BarChart3, label: 'Indicateurs', value: String((data as { indicators?: number })?.indicators ?? '24') },
          { icon: TrendingUp, label: 'Croissance', value: '+12%' },
          { icon: Users, label: 'Acteurs actifs', value: String((data as { actors?: number })?.actors ?? '—') },
          { icon: AlertTriangle, label: 'Alertes 7j', value: String((data as { alerts?: number })?.alerts ?? '—') },
        ].map(({ icon: Icon, label, value }) => (
          <Card key={label}>
            <CardContent className="p-4 flex items-center gap-3">
              <Icon className="h-8 w-8 text-primary" />
              <div>
                <p className="text-xl font-bold font-data">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Production mensuelle (tonnes)</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="production" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
