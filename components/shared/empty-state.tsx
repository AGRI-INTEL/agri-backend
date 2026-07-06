import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Inbox, type LucideIcon } from 'lucide-react';

export interface EmptyStateProps {
  icon?: LucideIcon | string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const iconElement = typeof Icon === 'string'
    ? <span className="text-2xl" aria-hidden="true">{Icon}</span>
    : <Icon className="h-7 w-7 text-muted-foreground" aria-hidden="true" />;

  return (
    <div
      className={cn('flex flex-col items-center justify-center py-16 text-center', className)}
      role="status"
    >
      <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mb-5">
        {iconElement}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1.5">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm mb-6">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick} size="sm">
          {action.label}
        </Button>
      )}
    </div>
  );
}
