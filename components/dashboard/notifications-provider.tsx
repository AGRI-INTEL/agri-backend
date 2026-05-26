'use client';

import { useNotifications } from '@/hooks/use-notifications';

/** Monte le hook notifications (WebSocket + compteur sidebar) dans le layout dashboard */
export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  useNotifications();
  return <>{children}</>;
}
