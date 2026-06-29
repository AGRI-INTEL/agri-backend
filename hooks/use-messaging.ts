import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import type { Conversation, PrivateMessage, SearchUserResult, PollData } from '@/types/messaging';

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
    mutationFn: (params: {
      conversationId: string;
      content?: string;
      messageType?: string;
      audioUrl?: string;
      duration?: number;
      fileUrl?: string;
      fileName?: string;
      fileType?: string;
      pollData?: PollData;
    }) =>
      apiClient.post(`/messaging/conversations/${params.conversationId}/messages`, {
        content: params.content || '',
        message_type: params.messageType || 'text',
        audio_url: params.audioUrl || null,
        audio_duration: params.duration || null,
        file_url: params.fileUrl || null,
        file_name: params.fileName || null,
        file_type: params.fileType || null,
        poll_data: params.pollData || null,
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

export function useSearchUsers() {
  return useQuery({
    queryKey: ['messaging', 'users', 'search'],
    queryFn: () => apiClient.get<SearchUserResult[]>('/messaging/users/search'),
    enabled: false,
  });
}

export function useUploadFile() {
  return useMutation({
    mutationFn: (file: File) => {
      const form = new FormData();
      form.append('file', file);
      return apiClient.upload<{ url: string; name: string; type: string }>('/messaging/upload', form);
    },
  });
}

export function useVotePoll() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ messageId, optionIndex, conversationId }: {
      messageId: string; optionIndex: number; conversationId: string;
    }) =>
      apiClient.post<PollData>(`/messaging/polls/${messageId}/vote`, { option_index: optionIndex }),
    onSuccess: (_, { conversationId }) => {
      qc.invalidateQueries({ queryKey: ['conversations', conversationId, 'messages'] });
    },
  });
}
