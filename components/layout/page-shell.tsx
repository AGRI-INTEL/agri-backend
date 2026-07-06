import { cn } from '@/lib/utils';
import { Breadcrumb } from './breadcrumb';
import { LoadingScreen } from '@/components/shared/loading-screen';
import { ErrorState } from '@/components/shared/error-state';
import { EmptyState, type EmptyStateProps } from '@/components/shared/empty-state';
interface PageShellProps {
  title?: React.ReactNode;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;

  /** Loading state */
  loading?: boolean;
  loadingMessage?: string;

  /** Error state */
  error?: string | null;
  onRetry?: () => void;

  /** Empty state */
  empty?: {
    icon?: EmptyStateProps['icon'];
    title: string;
    description?: string;
    action?: EmptyStateProps['action'];
  } | null;
}

export function PageShell({
  title,
  description,
  actions,
  children,
  className,
  noPadding,
  loading,
  loadingMessage,
  error,
  onRetry,
  empty,
}: PageShellProps) {
  return (
    <div className={cn('min-h-full', !noPadding && 'p-6', className)}>
      <Breadcrumb className="mb-4" />

      {(title || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
          <div className="min-w-0">
            {title && (
              <h1 className="text-2xl font-bold text-foreground truncate">{title}</h1>
            )}
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </div>
      )}

      {loading ? (
        <LoadingScreen message={loadingMessage} />
      ) : error ? (
        <ErrorState message={error} onRetry={onRetry} />
      ) : empty ? (
        <EmptyState
          icon={empty.icon}
          title={empty.title}
          description={empty.description}
          action={empty.action}
        />
      ) : (
        children
      )}
    </div>
  );
}
