import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import type { Conversation, PrivateMessage } from '@/types/messaging';

export function useConversations(opts: { enabled?: boolean; refetchInterval?: number } = {}) {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: () => apiClient.get<Conversation[]>('/messaging/conversations'),
    enabled: opts.enabled !== false,
    refetchInterval: (query) => {
      if (query.state.error) return false;
      return opts.refetchInterval ?? 15000;
    },
  });
}

export function useConversation(conversationId: string | null, opts: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ['conversations', conversationId],
    queryFn: () => apiClient.get<Conversation>(`/messaging/conversations/${conversationId}`),
    enabled: !!conversationId && opts.enabled !== false,
  });
}

export function useMessages(conversationId: string | null, opts: { enabled?: boolean; refetchInterval?: number } = {}) {
  return useQuery({
    queryKey: ['conversations', conversationId, 'messages'],
    queryFn: () => apiClient.get<PrivateMessage[]>(`/messaging/conversations/${conversationId}/messages`),
    enabled: !!conversationId && opts.enabled !== false,
    refetchInterval: (query) => {
      if (query.state.error) return false;
      return opts.refetchInterval ?? 5000;
    },
  });
}

export function useCreateConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId }: { userId: string }) =>
      apiClient.post<Conversation>('/messaging/conversations', { user_id: userId }),
    onSuccess: (conv) => {
      qc.invalidateQueries({ queryKey: ['conversations'] });
      return conv;
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });
}

export function useSendPrivateMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, content, audioUrl, duration }: {
      conversationId: string;
      content?: string;
      audioUrl?: string;
      duration?: number;
    }) =>
      apiClient.post(`/messaging/conversations/${conversationId}/messages`, {
        content: content || '',
        audio_url: audioUrl || null,
        audio_duration: duration || null,
      }),
    onSuccess: (_, { conversationId }) => {
      qc.invalidateQueries({ queryKey: ['conversations', conversationId, 'messages'] });
      qc.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });
}

export function useEditPrivateMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, messageId, content }: {
      conversationId: string; messageId: string; content: string;
    }) =>
      apiClient.put(`/messaging/conversations/${conversationId}/messages/${messageId}`, { content }),
    onSuccess: (_, { conversationId }) => {
      qc.invalidateQueries({ queryKey: ['conversations', conversationId, 'messages'] });
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });
}

export function useDeletePrivateMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, messageId }: { conversationId: string; messageId: string }) =>
      apiClient.delete(`/messaging/conversations/${conversationId}/messages/${messageId}`),
    onSuccess: (_, { conversationId }) => {
      qc.invalidateQueries({ queryKey: ['conversations', conversationId, 'messages'] });
      toast.success('Message supprimé');
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });
}

export function useDeleteConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: string) =>
      apiClient.delete(`/messaging/conversations/${conversationId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['conversations'] });
      toast.success('Conversation supprimée');
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });
}

export function useMarkConversationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: string) =>
      apiClient.put(`/messaging/conversations/${conversationId}/read`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useUnreadMessageCount() {
  return useQuery({
    queryKey: ['conversations', 'unread-count'],
    queryFn: () => apiClient.get<{ unread_count: number }>('/messaging/conversations/unread/count'),
    refetchInterval: (query) => {
      if (query.state.error) return false;
      return 15000;
    },
  });
}

export function useOnlineStatus() {
  return useMutation({
    mutationKey: ['presence'],
    mutationFn: () => apiClient.post('/messaging/presence'),
  });
}

export function useUserOnline(userId: string | null) {
  return useQuery({
    queryKey: ['users', userId, 'online'],
    queryFn: () => apiClient.get<{ online: boolean; last_seen: string | null }>(`/messaging/users/${userId}/online`),
    enabled: !!userId,
    refetchInterval: 30000,
  });
}
