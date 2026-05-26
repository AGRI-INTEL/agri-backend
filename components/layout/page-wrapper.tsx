import { cn } from '@/lib/utils';
import { Breadcrumb } from './breadcrumb';

interface PageWrapperProps {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function PageWrapper({
  title,
  description,
  actions,
  children,
  className,
  noPadding,
}: PageWrapperProps) {
  return (
    <div className={cn('min-h-full', !noPadding && 'p-6', className)}>
      {/* Breadcrumb */}
      <Breadcrumb className="mb-4" />

      {/* Page header */}
      {(title || actions) && (
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            {title && (
              <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            )}
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </div>
      )}

      {children}
    </div>
  );
}
