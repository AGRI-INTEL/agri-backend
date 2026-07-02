'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';
import { toast } from 'sonner';

export function useWebSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const { user } = useAuthStore();
  const incrementUnread = useUIStore((s) => s.incrementUnread);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user?.id) return;

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

    const socket = io(baseUrl, {
      path: '/api/v1/ws',
      query: { user_id: user.id },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 3000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('subscribe', { user_id: user.id });
    });

    socket.on('disconnect', () => setConnected(false));

    socket.on('notification', (data) => {
      incrementUnread();
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast(data.title || 'Nouvelle notification', {
        description: data.message,
      });
    });

    socket.on('alert', (data) => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      toast.warning(`🔔 ${data.title || 'Alerte'}`, {
        description: data.message,
        duration: 6000,
      });
    });

    socket.on('message', () => {
      queryClient.invalidateQueries({ queryKey: ['messaging'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [user?.id, incrementUnread, queryClient]);

  return { connected, socket: socketRef.current };
}

export function useWebSocketAlerts() {
  const { connected, socket } = useWebSocket();
  const [alerts, setAlerts] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    if (!socket) return;
    const handler = (data: Record<string, unknown>) => {
      setAlerts((prev) => [data, ...prev].slice(0, 50));
    };
    socket.on('alert', handler);
    return () => { socket.off('alert', handler); };
  }, [socket]);

  return { connected, alerts };
}

export function useWebSocketMessages() {
  const { connected, socket } = useWebSocket();
  const [messages, setMessages] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    if (!socket) return;
    const handler = (data: Record<string, unknown>) => {
      setMessages((prev) => [data, ...prev].slice(0, 50));
    };
    socket.on('message', handler);
    return () => { socket.off('message', handler); };
  }, [socket]);

  return { connected, messages };
}

export function useWebSocketPresence() {
  const { connected, socket } = useWebSocket();
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    if (!socket) return;
    const handler = (userIds: string[]) => setOnlineUsers(userIds);
    socket.on('presence', handler);
    return () => { socket.off('presence', handler); };
  }, [socket]);

  return { connected, onlineUsers };
}
