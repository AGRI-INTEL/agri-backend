'use client';

import { useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';
import { apiClient } from '@/lib/api-client';
import { useUIStore } from '@/stores/ui-store';
import { useAuthStore } from '@/stores/auth-store';
import type { Notification } from '@/types/api';
import { toast } from 'sonner';

let socket: Socket | null = null;

export function useNotifications() {
  const { isAuthenticated } = useAuthStore();
  const { setUnreadNotifications, decrementUnread } = useUIStore();
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => apiClient.get<{ data: Notification[]; unread: number }>('/notifications'),
    enabled: isAuthenticated,
    refetchInterval: 60_000,
  });

  // Setup WebSocket
  useEffect(() => {
    if (!isAuthenticated) return;

    socket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8000', {
      withCredentials: true,
      transports: ['websocket'],
    });

    socket.on('notification', (notification: Notification) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      setUnreadNotifications((notifications?.unread || 0) + 1);

      // Show toast for alerts
      if (notification.type === 'alert') {
        toast.warning(notification.title, { description: notification.message });
      }
    });

    return () => {
      socket?.disconnect();
      socket = null;
    };
  }, [isAuthenticated, queryClient, notifications?.unread, setUnreadNotifications]);

  // Update unread count
  useEffect(() => {
    if (notifications?.unread !== undefined) {
      setUnreadNotifications(notifications.unread);
    }
  }, [notifications?.unread, setUnreadNotifications]);

  const markAsRead = useMutation({
    mutationFn: (id: string) => apiClient.patch(`/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      decrementUnread();
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: () => apiClient.post('/notifications/read-all'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      setUnreadNotifications(0);
    },
  });

  const emitEvent = useCallback((event: string, data?: unknown) => {
    socket?.emit(event, data);
  }, []);

  return {
    notifications: notifications?.data || [],
    unreadCount: notifications?.unread || 0,
    isLoading,
    markAsRead: markAsRead.mutate,
    markAllAsRead: markAllAsRead.mutate,
    emitEvent,
  };
}
