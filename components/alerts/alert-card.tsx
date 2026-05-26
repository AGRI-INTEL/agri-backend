'use client';

import Link from 'next/link';
import { Bell, MapPin, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { SeverityBadge } from '@/components/shared/severity-badge';
import { SectorBadge } from '@/components/shared/sector-badge';
import { getAlertAge, getAlertTypeLabel } from '@/types/alert';
import type { Alert } from '@/types/alert';
import { cn } from '@/lib/utils';

interface AlertCardProps {
  alert: Alert;
  onMarkRead?: (id: string) => void;
}

export function AlertCard({ alert, onMarkRead }: AlertCardProps) {
  return (
    <Card className={cn('card-hover', !alert.is_read && 'border-l-4 border-l-primary')}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
            <Bell className="h-5 w-5 text-destructive" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <SeverityBadge severity={alert.severity} />
              <span className="text-xs text-muted-foreground">{getAlertTypeLabel(alert.type)}</span>
              {alert.sector && <SectorBadge sector={alert.sector} />}
            </div>
            <Link href={`/alerts/${alert.id}`} className="font-semibold text-sm hover:text-primary line-clamp-2">
              {alert.title}
            </Link>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{alert.description}</p>
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{getAlertAge(alert)}</span>
              {(alert.city || alert.country) && (
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{alert.city || alert.country}</span>
              )}
            </div>
          </div>
          {!alert.is_read && onMarkRead && (
            <button
              type="button"
              onClick={() => onMarkRead(alert.id)}
              className="text-xs text-primary hover:underline shrink-0"
            >
              Marquer lu
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
