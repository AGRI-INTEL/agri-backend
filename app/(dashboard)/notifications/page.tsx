'use client';

import { Bell, CheckCheck } from 'lucide-react';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { useNotifications } from '@/hooks/use-notifications';
import { formatRelativeDate } from '@/lib/utils';
import type { Notification } from '@/types/api';
import Link from 'next/link';

export default function NotificationsPage() {
  const { notifications, isLoading, markAsRead, markAllAsRead } = useNotifications();

  return (
    <PageWrapper
      title="Notifications"
      description={`${notifications.length} notification(s)`}
      actions={
        <Button variant="outline" size="sm" className="gap-2" onClick={() => markAllAsRead()}>
          <CheckCheck className="h-4 w-4" />
          Tout lire
        </Button>
      }
    >
      {isLoading ? (
        <LoadingSkeleton variant="card" count={5} />
      ) : notifications.length === 0 ? (
        <EmptyState icon="🔔" title="Aucune notification" description="Vous êtes à jour !" />
      ) : (
        <div className="space-y-2">
          {notifications.map((n: Notification) => (
            <Card key={n.id} className={!n.is_read ? 'border-l-4 border-l-primary' : ''}>
              <CardContent className="p-4 flex gap-3">
                <Bell className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{n.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{formatRelativeDate(n.created_at)}</p>
                  {n.action_url && (
                    <Link href={n.action_url} className="text-xs text-primary hover:underline mt-1 inline-block">
                      Voir →
                    </Link>
                  )}
                </div>
                {!n.is_read && (
                  <Button variant="ghost" size="sm" onClick={() => markAsRead(n.id)}>Lu</Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageWrapper>
  );
}
