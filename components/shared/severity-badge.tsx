import { Badge } from '@/components/ui/badge';
import { SEVERITY_LABELS } from '@/lib/utils';
import type { AlertSeverity } from '@/types/alert';

const severityVariantMap: Record<AlertSeverity, 'info' | 'warning' | 'danger' | 'danger'> = {
  info: 'info',
  warning: 'warning',
  critical: 'danger',
  emergency: 'danger',
};

interface SeverityBadgeProps {
  severity: AlertSeverity;
  className?: string;
}

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  return (
    <Badge variant={severityVariantMap[severity]} className={className}>
      {SEVERITY_LABELS[severity]}
    </Badge>
  );
}
