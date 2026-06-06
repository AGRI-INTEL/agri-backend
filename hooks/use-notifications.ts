'use client';

import { useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// Use native WebSocket to match backend plain WebSocket endpoint
import { apiClient } from '@/lib/api-client';
import { useUIStore } from '@/stores/ui-store';
import { useAuthStore } from '@/stores/auth-store';
import type { Notification } from '@/types/api';
import { toast } from 'sonner';

let socket: WebSocket | null = null;

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

  // Setup WebSocket (native) to backend `/ws/{user_id}`
  const currentUser = useAuthStore((s) => s.user);
  useEffect(() => {
    if (!isAuthenticated) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const apiPrefix = process.env.NEXT_PUBLIC_API_PREFIX || '/api/v1';
    // Allow overriding the WebSocket base URL separately (useful for dev tunnels)
    const wsBase = process.env.NEXT_PUBLIC_WS_URL || apiUrl;
    const proto = wsBase.startsWith('https') || wsBase.startsWith('wss') ? 'wss' : 'ws';
    const host = wsBase.replace(/^wss?:\/\//, '').replace(/\/$/, '');
    const userId = currentUser?.id ?? 'anonymous';
    try {
      // Backend websocket endpoint is mounted under the API prefix: /api/v1/ws/{user_id}
      socket = new WebSocket(`${proto}://${host}${apiPrefix}/ws/${userId}`);

      socket.onopen = () => {
        // Optionally subscribe to topics
        try { socket?.send(JSON.stringify({ type: 'subscribe', topics: ['notifications'] })); } catch (e) {}
      };

      socket.onmessage = (ev) => {
        try {
          const payload = JSON.parse(ev.data);
          if (payload?.type === 'notification' || payload?.type === 'alert') {
            const notification: Notification = payload.data;
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            setUnreadNotifications((notifications?.unread || 0) + 1);
            if (notification.type === 'alert') {
              toast.warning(notification.title, { description: notification.message });
            }
          }
        } catch (e) {
          // ignore non-json messages
        }
      };

      socket.onerror = (err) => {
        console.warn('[Notifications] WebSocket error', err);
      };
    } catch (err) {
      console.warn('[Notifications] WebSocket init failed', err);
      socket = null;
    }

    return () => {
      try { socket?.close(); } catch (e) {}
      socket = null;
    };
  }, [isAuthenticated, queryClient, notifications?.unread, setUnreadNotifications, currentUser]);

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
    try {
      socket?.send(JSON.stringify({ event, data }));
    } catch (e) {
      // ignore
    }
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
