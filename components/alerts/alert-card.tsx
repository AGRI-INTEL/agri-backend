'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Bell, MapPin, Clock, Check, CheckCheck, X, ChevronDown,
  AlertTriangle, AlertCircle, Info, Zap, MoreHorizontal,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SeverityBadge } from '@/components/shared/severity-badge';
import { SectorBadge } from '@/components/shared/sector-badge';
import { getAlertAge, getAlertTypeLabel } from '@/types/alert';
import type { Alert } from '@/types/alert';
import { cn } from '@/lib/utils';

const SEVERITY_CONFIG = {
  info: { borderColor: 'border-l-blue-400', iconBg: 'bg-blue-100 dark:bg-blue-900/30', icon: Info, iconColor: 'text-blue-600 dark:text-blue-400' },
  warning: { borderColor: 'border-l-yellow-400', iconBg: 'bg-yellow-100 dark:bg-yellow-900/30', icon: AlertTriangle, iconColor: 'text-yellow-600 dark:text-yellow-400' },
  critical: { borderColor: 'border-l-red-500', iconBg: 'bg-red-100 dark:bg-red-900/30', icon: AlertCircle, iconColor: 'text-red-600 dark:text-red-400' },
  emergency: { borderColor: 'border-l-red-600', iconBg: 'bg-red-200 dark:bg-red-900/50', icon: Zap, iconColor: 'text-red-700 dark:text-red-300' },
};

interface AlertCardProps {
  alert: Alert;
  onMarkRead?: (id: string) => void;
  onAcknowledge?: (id: string) => void;
  onResolve?: (id: string) => void;
}

export function AlertCard({ alert, onMarkRead, onAcknowledge, onResolve }: AlertCardProps) {
  const [expanded, setExpanded] = useState(false);
  const cfg = SEVERITY_CONFIG[alert.severity as keyof typeof SEVERITY_CONFIG] || SEVERITY_CONFIG.info;
  const SevIcon = cfg.icon;

  return (
    <Card
      className={cn(
        'border-l-4 transition-all duration-200 hover:shadow-md',
        cfg.borderColor,
        !alert.is_read ? 'bg-card' : 'bg-muted/30 opacity-80'
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Severity Icon */}
          <div className={cn('h-10 w-10 rounded-full flex items-center justify-center shrink-0', cfg.iconBg)}>
            <SevIcon className={cn('h-5 w-5', cfg.iconColor)} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
              <SeverityBadge severity={alert.severity} />
              <span className="text-xs text-muted-foreground">{getAlertTypeLabel(alert.type)}</span>
              {alert.sector && <SectorBadge sector={alert.sector} />}
              {!alert.is_read && (
                <span className="inline-flex h-2 w-2 rounded-full bg-primary animate-pulse" />
              )}
            </div>

            {/* Title */}
            <Link
              href={`/alerts/${alert.id}`}
              className="font-semibold text-sm hover:text-primary transition-colors line-clamp-2 block"
            >
              {alert.title}
            </Link>

            {/* Description */}
            {alert.description && (
              <p className={cn('text-xs text-muted-foreground mt-1', !expanded && 'line-clamp-2')}>
                {alert.description}
              </p>
            )}
            {alert.description && alert.description.length > 120 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-xs text-primary hover:underline mt-0.5 flex items-center gap-0.5"
              >
                {expanded ? 'Voir moins' : 'Voir plus'}
                <ChevronDown className={cn('h-3 w-3 transition-transform', expanded && 'rotate-180')} />
              </button>
            )}

            {/* Meta */}
            <div className="flex items-center flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {getAlertAge(alert)}
              </span>
              {(alert.city || alert.country) && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {[alert.city, alert.country].filter(Boolean).join(', ')}
                </span>
              )}
              {alert.source && (
                <span className="text-muted-foreground/70">Source: {alert.source}</span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            {!alert.is_read && onMarkRead && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                onClick={() => onMarkRead(alert.id)}
                title="Marquer comme lu"
              >
                <Check className="h-4 w-4" />
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/alerts/${alert.id}`} className="flex items-center gap-2">
                    <Bell className="h-4 w-4" /> Voir le détail
                  </Link>
                </DropdownMenuItem>
                {!alert.is_read && onMarkRead && (
                  <DropdownMenuItem onClick={() => onMarkRead(alert.id)} className="flex items-center gap-2">
                    <Check className="h-4 w-4" /> Marquer comme lu
                  </DropdownMenuItem>
                )}
                {onAcknowledge && (
                  <DropdownMenuItem onClick={() => onAcknowledge(alert.id)} className="flex items-center gap-2">
                    <CheckCheck className="h-4 w-4" /> Acquitter
                  </DropdownMenuItem>
                )}
                {onResolve && (
                  <DropdownMenuItem onClick={() => onResolve(alert.id)} className="flex items-center gap-2 text-green-600">
                    <X className="h-4 w-4" /> Résoudre
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
